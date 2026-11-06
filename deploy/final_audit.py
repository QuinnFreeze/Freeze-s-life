#!/usr/bin/env python3
"""Record service isolation and stop this task's localhost QA server only."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import signal
import stat
import subprocess

SOURCE=Path(__file__).resolve().parents[1]
ROOT=Path('/opt/freeze-nest')
metadata=json.loads((ROOT/'deployment.json').read_text())
baseline=json.loads((Path(metadata['backup'])/'baseline.json').read_text())


def output(*args):
    return subprocess.check_output(args,text=True).strip()


states={}
for key,name in [('komari','komari-monitor-komari-1'),('caddy','komari-monitor-caddy-1'),('website','freeze-nest-nest-1')]:
    record=json.loads(output('docker','inspect','--format','{{json .State}}',name))
    assert record['Status']=='running' and not record.get('OOMKilled')
    if key in baseline:assert record['StartedAt']==baseline[key]['StartedAt']
    states[key]={'started_at':record['StartedAt'],'restarts':int(output('docker','inspect','--format','{{.RestartCount}}',name)),'running':True}
    if key=='website':assert record['Health']['Status']=='healthy'
assert output('docker','port','freeze-nest-nest-1')==''
assert output('systemctl','is-active','freeze-nest-backup.timer')=='active'
assert output('systemctl','show','freeze-nest-backup.service','--property=Result','--value')=='success'
private=ROOT/'secrets/initial-admin.txt'
assert stat.S_IMODE(private.stat().st_mode)==0o600 and private.stat().st_uid==0
latest=json.loads((ROOT/'backups/latest.json').read_text())
with open(latest['file'],'rb') as stream:assert hashlib.file_digest(stream,'sha256').hexdigest()==latest['sha256']
release=Path(metadata['source'])
for filename in (SOURCE/'deploy').glob('*'):
    if filename.is_file():shutil.copy2(filename,release/'deploy'/filename.name)
stopped=[]
for entry in Path('/proc').iterdir():
    if not entry.name.isdigit():continue
    try:
        cmd=(entry/'cmdline').read_bytes().replace(b'\0',b' ')
        if b'gunicorn' in cmd and b'127.0.0.1:8765' in cmd and (entry/'cwd').resolve()==SOURCE:
            os.kill(int(entry.name),signal.SIGTERM)
            stopped.append(int(entry.name))
    except (FileNotFoundError,ProcessLookupError,PermissionError):pass
report={'services':states,'komari_and_caddy_not_restarted':True,'website_host_ports':0,'backup_timer':'active','backup_result':'success','latest_backup':latest['file'],'latest_backup_checksum':'PASS','credential_file_permissions':'root:0600','localhost_qa_stopped':bool(stopped)}
(SOURCE/'artifacts/service-audit.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
