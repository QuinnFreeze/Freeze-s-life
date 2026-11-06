"""Isolated sync regression tests; only temporary local repositories are used."""
import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

SCRIPT = Path(__file__).resolve().parents[1] / 'tools' / 'sync-production.py'
SPEC = importlib.util.spec_from_file_location('production_sync', SCRIPT)
sync = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(sync)


def command(*args, cwd=None):
    return subprocess.run(args, cwd=cwd, check=True, capture_output=True, text=True).stdout.strip()


class SyncTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.remote = self.root / 'origin.git'
        self.repo = self.root / 'checkout'
        self.source = self.root / 'release'
        command('git', 'init', '--bare', '--initial-branch=main', str(self.remote))
        command('git', 'clone', str(self.remote), str(self.repo))
        command('git', 'config', 'user.name', 'Sync Test', cwd=self.repo)
        command('git', 'config', 'user.email', 'sync-test@example.invalid', cwd=self.repo)
        self.write(self.repo / 'README.md', 'Dedicated repository\n')
        command('git', 'add', 'README.md', cwd=self.repo)
        command('git', 'commit', '-m', 'Initial repository', cwd=self.repo)
        command('git', 'push', 'origin', 'main', cwd=self.repo)
        for name in sync.FILES | {'README.md', 'public/index.html', 'public/app.js',
                                  'public/styles.css', 'deploy/compose.yaml',
                                  'tests/test_example.py', '.vendor/dependency.whl'}:
            self.write(self.source / name, f'Fixture for {name}\n')

    @staticmethod
    def write(path, contents):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(contents)

    def run_sync(self, **options):
        return sync.synchronize(self.repo, self.source, remote=str(self.remote), **options)

    def head(self, repo=None):
        return command('git', 'rev-parse', 'HEAD', cwd=repo or self.repo)

    def remote_head(self):
        return command('git', '--git-dir', str(self.remote), 'rev-parse', 'main')

    def test_unchanged_snapshot_does_not_commit_and_root_readme_is_preserved(self):
        self.run_sync()
        before = self.head()
        self.run_sync()
        self.assertEqual(before, self.head())
        self.assertEqual(self.head(), self.remote_head())
        self.assertEqual((self.repo / 'README.md').read_text(), 'Dedicated repository\n')
        self.assertEqual((self.repo / 'docs/production.md').read_bytes(),
                         (self.source / 'README.md').read_bytes())

    def test_manifest_only_deletes_previously_mirrored_files(self):
        self.write(self.source / 'public/retired.js', 'retired\n')
        self.run_sync()
        self.write(self.repo / 'deploy/github-sync.service', 'preserved service\n')
        self.write(self.repo / 'tests/test_production_sync.py', 'preserved test\n')
        (self.source / 'public/retired.js').unlink()
        self.run_sync()
        self.assertFalse((self.repo / 'public/retired.js').exists())
        self.assertTrue((self.repo / 'deploy/github-sync.service').is_file())
        self.assertTrue((self.repo / 'tests/test_production_sync.py').is_file())

    def test_private_paths_and_secret_contents_are_rejected_before_writes(self):
        before = self.head()
        for name in ('public/.env', 'public/data/private.txt', 'deploy/backup.tar.gz',
                     'public/uploads/private.txt', 'public/deployment.json'):
            with self.subTest(name=name):
                path = self.source / name
                self.write(path, 'private fixture\n')
                with self.assertRaises(sync.SyncError):
                    self.run_sync()
                path.unlink()
                # Remove only newly-created empty fixture directories.
                if path.parent.name in {'data', 'uploads'}:
                    path.parent.rmdir()
                self.assertEqual(before, self.head())
                self.assertFalse((self.repo / 'server.py').exists())
        self.write(self.source / 'public/leak.js', 'gh' + 'p_' + 'A' * 36)
        with self.assertRaisesRegex(sync.SyncError, 'contents withheld'):
            self.run_sync()
        self.assertEqual(before, self.head())

    def test_sqlite_content_is_rejected_despite_innocent_extension(self):
        (self.source / 'public/innocent.png').write_bytes(b'SQLite format 3\x00' + b'fixture')
        with self.assertRaisesRegex(sync.SyncError, 'SQLite database'):
            self.run_sync()
        self.assertFalse((self.repo / 'server.py').exists())

    def test_unsupported_test_and_deploy_types_fail_closed_and_artifacts_are_skipped(self):
        for name in ('tests/storage-state.json', 'deploy/debug.log'):
            path = self.source / name
            self.write(path, 'unreviewed runtime state\n')
            with self.assertRaisesRegex(sync.SyncError, 'Unsupported'):
                self.run_sync()
            path.unlink()
        self.write(self.source / 'tests/artifacts/storage-state.json', 'runtime state\n')
        self.run_sync()
        self.assertFalse((self.repo / 'tests/artifacts').exists())

    def test_optional_dockerignore_is_mirrored_without_deleting_existing_default(self):
        self.write(self.repo / '.dockerignore', 'default build exclusions\n')
        self.run_sync()
        self.assertEqual((self.repo / '.dockerignore').read_text(), 'default build exclusions\n')
        self.write(self.source / '.dockerignore', 'release build exclusions\n')
        self.run_sync()
        self.assertEqual((self.repo / '.dockerignore').read_text(), 'release build exclusions\n')
        self.write(self.source / '.dockerignore', 'updated exclusions\n')
        self.run_sync()
        self.assertEqual((self.repo / '.dockerignore').read_text(), 'updated exclusions\n')
        (self.source / '.dockerignore').unlink()
        self.run_sync()
        self.assertFalse((self.repo / '.dockerignore').exists())

    def test_symlinks_and_incomplete_release_fail_safe(self):
        (self.source / 'public/alias.js').symlink_to(self.source / 'public/app.js')
        with self.assertRaises(sync.SyncError):
            self.run_sync()
        (self.source / 'public/alias.js').unlink()
        (self.source / 'server.py').unlink()
        with self.assertRaisesRegex(sync.SyncError, 'Incomplete release'):
            self.run_sync()
        self.assertFalse((self.repo / sync.MANIFEST).exists())

    def test_manifest_cannot_delete_preserved_or_unmanaged_paths(self):
        for name in ('README.md', '../outside', 'deploy/github-sync.service',
                     'tests/test_production_sync.py', 'public/.env'):
            with self.subTest(name=name):
                self.write(self.repo / sync.MANIFEST,
                           json.dumps({'version': 1, 'files': [name]}))
                with self.assertRaises(sync.SyncError):
                    self.run_sync()
                (self.repo / sync.MANIFEST).unlink()

    def test_dry_run_has_no_checkout_or_git_ref_writes(self):
        before_files = {str(p.relative_to(self.repo)): p.read_bytes()
                        for p in self.repo.rglob('*') if p.is_file()}
        result = self.run_sync(dry_run=True)
        after_files = {str(p.relative_to(self.repo)): p.read_bytes()
                       for p in self.repo.rglob('*') if p.is_file()}
        self.assertTrue(result['changed'])
        self.assertEqual(before_files, after_files)

    def test_failed_push_is_retried_without_creating_another_commit(self):
        execute = sync.execute

        def fail_push(arguments, **options):
            if arguments[0] == 'git' and 'push' in arguments:
                raise sync.SyncError('Simulated network failure')
            return execute(arguments, **options)

        with patch.object(sync, 'execute', side_effect=fail_push):
            with self.assertRaisesRegex(sync.SyncError, 'Simulated'):
                self.run_sync()
        committed = self.head()
        self.assertNotEqual(committed, self.remote_head())
        self.run_sync()
        self.assertEqual(committed, self.head())
        self.assertEqual(committed, self.remote_head())

    def test_no_push_commits_locally_until_followup_sync(self):
        self.run_sync(no_push=True)
        local = self.head()
        self.assertNotEqual(local, self.remote_head())
        self.run_sync()
        self.assertEqual(local, self.remote_head())

    def test_remote_fast_forward_and_divergence_policy(self):
        self.run_sync()
        other = self.root / 'other'
        command('git', 'clone', str(self.remote), str(other))
        command('git', 'config', 'user.name', 'Other Test', cwd=other)
        command('git', 'config', 'user.email', 'other@example.invalid', cwd=other)
        self.write(other / 'README.md', 'Remote documentation change\n')
        command('git', 'add', 'README.md', cwd=other)
        command('git', 'commit', '-m', 'Remote change', cwd=other)
        command('git', 'push', 'origin', 'main', cwd=other)
        expected = self.head(other)
        self.run_sync()
        self.assertEqual(expected, self.head())
        self.write(self.source / 'public/app.js', 'Local application change\n')
        self.run_sync(no_push=True)
        self.write(other / 'README.md', 'Second remote documentation change\n')
        command('git', 'add', 'README.md', cwd=other)
        command('git', 'commit', '-m', 'Conflicting history', cwd=other)
        command('git', 'push', 'origin', 'main', cwd=other)
        local, remote = self.head(), self.remote_head()
        with self.assertRaisesRegex(sync.SyncError, 'diverged'):
            self.run_sync()
        self.assertEqual(local, self.head())
        self.assertEqual(remote, self.remote_head())

    def test_unknown_dirty_path_is_never_committed(self):
        self.write(self.repo / 'private-notes.txt', 'unrelated\n')
        with self.assertRaisesRegex(sync.SyncError, 'Unmanaged'):
            self.run_sync()
        self.assertFalse((self.repo / 'server.py').exists())


if __name__ == '__main__':
    unittest.main()
