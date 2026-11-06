#!/usr/bin/env python3
"""Online SQLite + referenced media backup, serialized against content writes."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import sqlite3
import tarfile
import tempfile


def backup(root):
    root = Path(root)
    destination = root / 'backups'
    destination.mkdir(parents=True, exist_ok=True, mode=0o700)
    stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
    final = destination / f'nest-{stamp}.tar.gz'
    staging = final.with_suffix('.partial')
    database = root / 'data/nest.sqlite3'
    with tempfile.TemporaryDirectory(dir=destination) as temp:
        snapshot = Path(temp) / 'nest.sqlite3'
        with sqlite3.connect(database, timeout=60) as guard:
            guard.execute('BEGIN IMMEDIATE')
            with sqlite3.connect(database, timeout=60) as source, sqlite3.connect(snapshot) as target:
                source.backup(target)
                assert target.execute('PRAGMA integrity_check').fetchone()[0] == 'ok'
            files = [row[0] for row in guard.execute('SELECT stored_name FROM images')]
            media = Path(temp) / 'uploads'
            media.mkdir()
            # Immutable uploads remain available through these links even if
            # deleted later. Release the write lock before compression.
            for filename in files:
                os.link(root / 'data/uploads' / filename, media / filename)
        with tarfile.open(staging, 'w:gz') as archive:
            archive.add(snapshot, arcname='data/nest.sqlite3')
            archive.add(root / 'data/privacy-key', arcname='data/privacy-key')
            for filename in files:
                archive.add(media / filename, arcname='data/uploads/' + filename)
            for filename in ('compose.yaml', 'release.env', 'deployment.json'):
                if (root / filename).is_file():
                    archive.add(root / filename, arcname=filename)
        os.chmod(staging, 0o600)
        staging.replace(final)
    with final.open('rb') as stream:
        checksum = hashlib.file_digest(stream, 'sha256').hexdigest()
    final.with_suffix(final.suffix + '.sha256').write_text(checksum + '  ' + final.name + '\n')
    status = {'file': str(final), 'sha256': checksum, 'images': len(files), 'integrity_check': 'ok', 'created_at': stamp}
    (destination / 'latest.json').write_text(json.dumps(status, indent=2))
    print(json.dumps(status))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', default='/opt/freeze-nest')
    backup(parser.parse_args().root)

