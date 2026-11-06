#!/usr/bin/env python3
"""Mirror the running Freeze Nest release into its dedicated GitHub checkout."""
from __future__ import annotations

import argparse
from contextlib import contextmanager
import fcntl
import json
import os
from pathlib import Path, PurePosixPath
import re
import stat
import subprocess
import sys

REPOSITORY = Path('/opt/freeze-nest/source-repository')
PRODUCTION = Path('/opt/freeze-nest')
REMOTE = 'https://github.com/QuinnFreeze/Freeze-s-life.git'
MANIFEST = '.production-sync-manifest.json'
FILES = {'server.py', 'Dockerfile', 'requirements.txt', 'requirements-dev.txt'}
OPTIONAL_FILES = {'.dockerignore'}
DIRECTORIES = {'public', 'deploy', 'tests'}
DEPLOY_SUFFIXES = {'.py', '.yaml', '.yml', '.service', '.timer', '.md'}
PUBLIC_SUFFIXES = {'.html', '.css', '.js', '.mjs', '.json', '.svg', '.png', '.jpg',
                   '.jpeg', '.webp', '.gif', '.avif', '.ico', '.woff', '.woff2',
                   '.ttf', '.otf', '.txt', '.xml', '.webmanifest', '.map'}
PRESERVED = {
    'tools/sync-production.py', 'tests/test_production_sync.py',
    'deploy/github-sync.service', 'deploy/github-sync.timer',
}
EXTRA = PRESERVED | {
    'README.md', '.gitignore', '.dockerignore', 'AGENTS.md',
    'docs/production.md', 'docs/github-sync.md',
    '.github/workflows/pages.yml', MANIFEST,
}
CACHES = {'.git', '.venv', 'venv', '__pycache__', '.pytest_cache', '.mypy_cache',
          '.ruff_cache', '.cache', 'node_modules', '.qa-data', '.qa-audit', '.browsers',
          'artifacts', 'screenshots', 'playwright-report', 'test-results', 'htmlcov'}
PRIVATE_DIRS = {'data', 'uploads', 'secrets', 'secret', 'backups', 'backup', 'credentials',
                'archives', 'archive', '.aws', '.ssh', '.codex', '.agents'}
PRIVATE_SUFFIXES = {'.env', '.db', '.sqlite', '.sqlite3', '.pem', '.key', '.p12',
                    '.pfx', '.zip', '.tar', '.gz', '.tgz', '.bz2', '.xz', '.7z', '.rar'}
SECRET_PATTERNS = (
    re.compile(rb'-----BEGIN (?:[A-Z0-9 ]+ )?PRIVATE KEY-----'),
    re.compile(rb'\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})\b'),
    re.compile(rb'\b(?:AKIA|ASIA)[0-9A-Z]{16}\b'),
    re.compile(rb'\bxox[baprs]-[A-Za-z0-9-]{16,}\b'),
    re.compile(rb'\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{24,}\b'),
)
MAX_BYTES = 50 * 1024 * 1024


class SyncError(RuntimeError):
    pass


def execute(arguments, *, cwd=None, timeout=60, check=True):
    """Capture command output; errors deliberately omit potentially secret output."""
    env = os.environ.copy()
    env['GIT_TERMINAL_PROMPT'] = '0'
    env['GIT_OPTIONAL_LOCKS'] = '0'
    try:
        result = subprocess.run(arguments, cwd=cwd, env=env, capture_output=True,
                                timeout=timeout, check=False)
    except (OSError, subprocess.TimeoutExpired) as error:
        raise SyncError(f'{arguments[0]} command could not finish ({type(error).__name__})') from None
    if check and result.returncode:
        operation = arguments[1] if len(arguments) > 1 else 'command'
        raise SyncError(f'{arguments[0]} {operation} failed (exit {result.returncode}); no force push attempted')
    return result


def git(repo, *arguments, check=True):
    return execute(['git', *arguments], cwd=repo, timeout=90, check=check)


def output(result):
    return result.stdout.decode('utf-8', errors='strict').strip()


def safe_relative(name):
    path = PurePosixPath(name)
    if not name or path.is_absolute() or str(path) != name or '..' in path.parts:
        raise SyncError('Invalid relative path in source or manifest')
    if any(ord(character) < 32 or ord(character) == 127 for character in name):
        raise SyncError('Control characters in source path')
    return path


def check_private_path(name):
    path = safe_relative(name)
    lower_parts = {part.lower() for part in path.parts}
    filename = path.name.lower()
    if lower_parts & PRIVATE_DIRS or filename.startswith(('.env', 'credentials', 'initial-admin')):
        raise SyncError(f'Private runtime path rejected: {name}')
    if filename in {'privacy-key', 'id_rsa', 'id_ed25519', 'deployment.json', 'release.env'} or any(
            suffix.lower() in PRIVATE_SUFFIXES for suffix in path.suffixes):
        raise SyncError(f'Private or archive file rejected: {name}')
    if re.search(r'\.(?:db|sqlite3?)(?:-wal|-shm|-journal)$', filename):
        raise SyncError(f'Database sidecar rejected: {name}')


def managed(name):
    path = safe_relative(name)
    if name in PRESERVED:
        return False
    if name in FILES | OPTIONAL_FILES or name == 'docs/production.md':
        return True
    if len(path.parts) > 1 and path.parts[0] in DIRECTORIES:
        check_private_path(name)
        if set(path.parts) & CACHES:
            return False
        if path.parts[0] == 'tests':
            return path.suffix == '.py'
        if path.parts[0] == 'deploy':
            return path.suffix in DEPLOY_SUFFIXES or path.name == 'Caddyfile'
        return path.suffix.lower() in PUBLIC_SUFFIXES or path.name == '.nojekyll'
    return len(path.parts) == 2 and path.parts[0] == '.vendor' and path.suffix == '.whl'


def allowed(name):
    check_private_path(name)
    return name in EXTRA or managed(name)


def reject_symlinks(path):
    for component in (path, *path.parents):
        if component.is_symlink():
            raise SyncError('Symlink in source or repository path')


def read_regular(path):
    reject_symlinks(path)
    info = path.lstat()
    if not stat.S_ISREG(info.st_mode) or info.st_size > MAX_BYTES:
        raise SyncError('Source must contain regular files smaller than 50 MiB')
    descriptor = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    with os.fdopen(descriptor, 'rb') as stream:
        return stream.read(MAX_BYTES + 1)


def scan(data, name):
    if len(data) > MAX_BYTES:
        raise SyncError(f'File exceeds size limit: {name}')
    if data.startswith(b'SQLite format 3\x00'):
        raise SyncError(f'SQLite database content rejected in {name}; contents withheld')
    if any(pattern.search(data) for pattern in SECRET_PATTERNS):
        raise SyncError(f'Possible credential detected in {name}; contents withheld')


def collect_source(source):
    source = Path(source)
    reject_symlinks(source)
    required = FILES | {'README.md', 'public/index.html', 'public/app.js',
                        'public/styles.css', 'deploy/compose.yaml'}
    for name in sorted(required):
        try:
            if not read_regular(source / name):
                raise SyncError(f'Empty required release file: {name}')
        except FileNotFoundError:
            raise SyncError(f'Incomplete release: missing {name}') from None
    result = {}

    def add(path, name):
        check_private_path(name)
        if not managed(name):
            raise SyncError(f'Unsupported source file type: {name}')
        data = read_regular(path)
        scan(data, name)
        result[name] = data

    for name in sorted(FILES):
        add(source / name, name)
    for name in sorted(OPTIONAL_FILES):
        if (source / name).exists() or (source / name).is_symlink():
            add(source / name, name)
    add(source / 'README.md', 'docs/production.md')
    for directory in sorted(DIRECTORIES | {'.vendor'}):
        base = source / directory
        if not base.is_dir() or base.is_symlink():
            raise SyncError(f'Incomplete release or symlink directory: {directory}')
        count = 0
        for current, directories, filenames in os.walk(base, followlinks=False):
            for item in [*directories, *filenames]:
                candidate = Path(current) / item
                if candidate.is_symlink():
                    raise SyncError('Symlink in release tree')
            directories[:] = [item for item in directories if item not in CACHES]
            for item in directories:
                check_private_path(str((Path(current) / item).relative_to(source)))
            for filename in filenames:
                path = Path(current) / filename
                name = path.relative_to(source).as_posix()
                if set(PurePosixPath(name).parts) & CACHES or name in PRESERVED:
                    continue
                if directory == '.vendor' and not (path.parent == base and path.suffix == '.whl'):
                    raise SyncError('Only top-level wheel files are permitted in .vendor')
                add(path, name)
                count += 1
        if not count:
            raise SyncError(f'Incomplete release: empty {directory}')
    return result


def load_manifest(repo):
    path = repo / MANIFEST
    if not path.exists() and not path.is_symlink():
        return set()
    try:
        document = json.loads(read_regular(path))
        names = document['files']
        if document['version'] != 1 or not isinstance(names, list) or len(names) != len(set(names)):
            raise ValueError()
        for name in names:
            if not isinstance(name, str) or not managed(name):
                raise ValueError()
            check_private_path(name)
        return set(names)
    except (ValueError, KeyError, TypeError):
        raise SyncError('Invalid production sync manifest') from None


def changed_paths(repo):
    paths = set()
    for arguments in (('diff', '--name-only', '-z'),
                      ('diff', '--cached', '--name-only', '-z'),
                      ('ls-files', '--others', '--exclude-standard', '-z')):
        paths.update(p.decode('utf-8') for p in git(repo, *arguments).stdout.split(b'\0') if p)
    return paths


def check_worktree(repo):
    paths = changed_paths(repo)
    for name in paths:
        if not allowed(name):
            raise SyncError(f'Unmanaged working-tree change requires review: {name}')
        path = repo / name
        reject_symlinks(path)
        if path.exists():
            scan(read_regular(path), name)
    return paths


def verify_repository(repo, remote):
    reject_symlinks(repo)
    if output(git(repo, 'rev-parse', '--show-toplevel')) != str(repo.resolve()):
        raise SyncError('Repository path does not identify its own checkout')
    if output(git(repo, 'symbolic-ref', '--short', 'HEAD')) != 'main':
        raise SyncError('Dedicated checkout must remain on main')
    if output(git(repo, 'remote', 'get-url', 'origin')) != remote or output(
            git(repo, 'remote', 'get-url', '--push', 'origin')) != remote:
        raise SyncError('Origin fetch/push URL does not match the approved repository')
    if any((repo / '.git' / name).exists() for name in ('MERGE_HEAD', 'rebase-merge', 'rebase-apply', 'CHERRY_PICK_HEAD')):
        raise SyncError('Finish the in-progress Git operation before syncing')


def synchronize(repo, source, *, remote=REMOTE, dry_run=False, no_push=False):
    """Only tests pass alternate repo/source/remote arguments; CLI uses fixed paths."""
    repo = Path(repo)
    verify_repository(repo, remote)
    initial_changes = check_worktree(repo)
    files = collect_source(source)  # Validate the whole snapshot before mutating Git.
    if dry_run:
        response = output(git(repo, 'ls-remote', '--exit-code', 'origin', 'refs/heads/main'))
        if not re.fullmatch(r'[0-9a-f]{40,64}\s+refs/heads/main', response):
            raise SyncError('Could not identify remote main safely')
        remote_tip = response.split()[0]
        if git(repo, 'cat-file', '-e', remote_tip + '^{commit}', check=False).returncode:
            raise SyncError('Remote main has unseen commits; normal sync must fetch before this dry run')
    else:
        git(repo, 'fetch', '--no-tags', 'origin', 'main')
        remote_tip = 'refs/remotes/origin/main'
    ahead, behind = map(int, output(git(repo, 'rev-list', '--left-right', '--count', 'HEAD...' + remote_tip)).split())
    if ahead and behind:
        raise SyncError('Local and remote main diverged; manual review required, no force push')
    if behind:
        if dry_run:
            raise SyncError('Remote main is ahead; normal sync must fast-forward before this dry run')
        if initial_changes:
            raise SyncError('Remote main is ahead and checkout has local changes; manual review required')
        git(repo, 'merge', '--ff-only', remote_tip)
        check_worktree(repo)
    previous = load_manifest(repo)
    removed = sorted(previous - files.keys())
    changed = []
    for name, data in files.items():
        target = repo / name
        reject_symlinks(target)
        if not target.exists() or read_regular(target) != data:
            changed.append(name)
    for name in removed:
        reject_symlinks(repo / name)
        if (repo / name).exists() and not (repo / name).is_file():
            raise SyncError('Manifest deletion target must be a regular file')
    manifest = (json.dumps({'version': 1, 'files': sorted(files)}, indent=2) + '\n').encode()
    plan = {'source': str(source), 'changed': sorted(changed), 'removed': removed,
            'pending_local_commits': ahead, 'dry_run': dry_run}
    if dry_run:
        return plan
    for name in changed:
        target = repo / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(files[name])
        target.chmod(0o644)
    for name in removed:
        (repo / name).unlink(missing_ok=True)
    if not (repo / MANIFEST).exists() or read_regular(repo / MANIFEST) != manifest:
        (repo / MANIFEST).write_bytes(manifest)
    pending = check_worktree(repo)
    for name in sorted(pending):
        git(repo, 'add', '-A', '--', name)
    staged = git(repo, 'diff', '--cached', '--quiet', check=False).returncode
    if staged not in (0, 1):
        raise SyncError('Could not determine staged changes safely')
    if staged == 1:
        git(repo, '-c', 'core.hooksPath=/dev/null', 'commit', '-m',
            'Sync running website production source')
    # A previous run may have committed successfully but failed to push.
    revision_range = remote_tip + '..HEAD'
    if output(git(repo, 'rev-list', '--min-parents=2', revision_range)):
        raise SyncError('Pending merge commits require manual review before uploading')
    unpushed = output(git(repo, 'rev-list', revision_range)).splitlines()
    for commit in unpushed:
        names = [item.decode('utf-8') for item in git(
            repo, 'diff-tree', '--root', '--no-commit-id', '--name-only', '-r', '-z', commit
        ).stdout.split(b'\0') if item]
        for name in names:
            if not allowed(name):
                raise SyncError(f'Unreviewed path in pending local commit: {name}')
            blob = git(repo, 'show', commit + ':' + name, check=False)
            if not blob.returncode:
                scan(blob.stdout, name)
    if unpushed and not no_push:
        git(repo, '-c', 'core.hooksPath=/dev/null', 'push', 'origin', 'HEAD:refs/heads/main')
    plan.update(committed=bool(pending), pushed=bool(unpushed) and not no_push,
                unpushed_commits=len(unpushed) if no_push else 0)
    return plan


def running_source():
    image = output(execute(['docker', 'inspect', '--format', '{{.Config.Image}}',
                            'freeze-nest-nest-1'], timeout=20))
    match = re.fullmatch(r'freeze-nest:([A-Za-z0-9][A-Za-z0-9_.-]{0,79})', image)
    if not match:
        raise SyncError('Running container does not identify a valid Freeze Nest release')
    source = PRODUCTION / 'releases' / match[1]
    reject_symlinks(source)
    return source


@contextmanager
def exclusive_lock(path):
    with open(path, 'a', encoding='utf-8') as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise SyncError('Another production sync is already running') from None
        yield


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dry-run', action='store_true', help='Inspect plan without changing files, commits, or refs')
    parser.add_argument('--no-push', action='store_true', help='Mirror and commit locally, without uploading')
    arguments = parser.parse_args()
    try:
        with exclusive_lock('/run/lock/freeze-nest-github-sync.lock'):
            plan = synchronize(REPOSITORY, running_source(), dry_run=arguments.dry_run,
                               no_push=arguments.no_push)
        print(json.dumps(plan, ensure_ascii=False))
        return 0
    except (SyncError, OSError, UnicodeError) as error:
        print(f'Production sync stopped: {error}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
