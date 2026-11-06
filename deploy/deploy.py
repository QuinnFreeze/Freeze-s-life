#!/usr/bin/env python3
"""Deploy only Freeze's Nest; reuse Caddy gracefully and preserve Komari.

Run after building/testing `freeze-nest:<release>`. All production paths are
explicit. A failed promotion restores the previous Caddyfile automatically.
"""
import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import time
import urllib.request

SOURCE = Path(__file__).resolve().parents[1]
ROOT = Path('/opt/freeze-nest')
CADDY = Path('/opt/komari-monitor/conf/Caddyfile')
CADDY_CONTAINER = 'komari-monitor-caddy-1'
KOMARI_CONTAINER = 'komari-monitor-komari-1'


def run(*args, capture=False):
    return subprocess.run(args, check=True, text=True, stdout=subprocess.PIPE if capture else None).stdout


def container_state(name):
    return json.loads(run('docker','inspect','--format','{{json .State}}',name,capture=True))


def web_status(url):
    with urllib.request.urlopen(url,timeout=15) as response:
        assert response.status==200, url
        return response.status


def main(release):
    if not re.fullmatch(r'[a-zA-Z0-9_.-]{1,80}',release):
        raise ValueError('Invalid release')
    original=CADDY.read_text()
    original_site='xiaoqiuyi.me {\n    root * /etc/caddy/sites/xiaoqiuyi.me/current\n    encode zstd gzip\n    file_server\n}'
    new_site='xiaoqiuyi.me {\n    encode zstd gzip\n    reverse_proxy freeze-nest:8000\n}'
    if original.count(original_site)!=1:
        raise RuntimeError('Unexpected Caddy configuration; inspect before promotion')
    proposed=original.replace(original_site,new_site)
    komari_before=container_state(KOMARI_CONTAINER)
    caddy_before=container_state(CADDY_CONTAINER)
    web_status('https://check.xiaoqiuyi.me')
    stamp=datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    ROOT.mkdir(exist_ok=True,mode=0o700)
    for sub in ('backups','releases','secrets','data'):
        (ROOT/sub).mkdir(exist_ok=True,mode=0o700)
    os.chown(ROOT/'data',10001,10001)
    saved=ROOT/'backups'/('pre-deploy-'+stamp)
    saved.mkdir(mode=0o700)
    (saved/'Caddyfile').write_text(original)
    shutil.copy2('/opt/komari-monitor/compose.yaml',saved/'komari-compose.yaml')
    baseline={'komari':komari_before,'caddy':caddy_before}
    (saved/'baseline.json').write_text(json.dumps(baseline,indent=2))
    original_backups=SOURCE/'backups/20261030T022741Z'
    if original_backups.is_dir():
        shutil.copytree(original_backups,saved/'original-site')
    destination=ROOT/'releases'/release
    destination.mkdir(exist_ok=False,mode=0o700)
    for name in ('server.py','requirements.txt','Dockerfile','README.md'):
        if (SOURCE/name).exists():shutil.copy2(SOURCE/name,destination/name)
    shutil.copytree(SOURCE/'public',destination/'public')
    shutil.copytree(SOURCE/'deploy',destination/'deploy')
    shutil.copy2(SOURCE/'deploy/compose.yaml',ROOT/'compose.yaml')
    shutil.copy2(SOURCE/'deploy/backup.py',ROOT/'backup.py')
    (ROOT/'release.env').write_text('NEST_RELEASE='+release+'\n')
    compose=['docker','compose','--env-file',str(ROOT/'release.env'),'-f',str(ROOT/'compose.yaml')]
    run(*compose,'config','--quiet')
    run(*compose,'up','-d','--no-build')
    container=run(*compose,'ps','-q','nest',capture=True).strip()
    for _ in range(45):
        state=container_state(container)
        if state.get('Health',{}).get('Status')=='healthy':break
        if state['Status'] not in ('running','created'):raise RuntimeError('Website container failed')
        time.sleep(1)
    else:raise RuntimeError('Website health check timed out')
    if not (ROOT/'secrets/initial-admin.txt').exists():
        run('docker','exec',container,'python','server.py','init-admin','--data-dir','/data','--username','admin','--output','/data/initial-admin.txt')
        shutil.move(ROOT/'data/initial-admin.txt',ROOT/'secrets/initial-admin.txt')
        os.chown(ROOT/'secrets/initial-admin.txt',0,0)
        os.chmod(ROOT/'secrets/initial-admin.txt',0o600)
    candidate=CADDY.with_name('Caddyfile.nest-candidate')
    candidate.write_text(proposed)
    run('docker','exec',CADDY_CONTAINER,'caddy','validate','--config','/etc/caddy/Caddyfile.nest-candidate','--adapter','caddyfile')
    promoted=False
    try:
        candidate.replace(CADDY)
        promoted=True
        run('docker','exec',CADDY_CONTAINER,'caddy','reload','--config','/etc/caddy/Caddyfile','--adapter','caddyfile')
        for route in ('/healthz','/','/articles','/admin','/about.html','/projects.html','/interests.html','/contact.html','/codex-theme.html','/freeze-nest.html'):
            web_status('https://xiaoqiuyi.me'+route)
        web_status('https://check.xiaoqiuyi.me')
        komari_after=container_state(KOMARI_CONTAINER)
        caddy_after=container_state(CADDY_CONTAINER)
        assert komari_after['StartedAt']==komari_before['StartedAt']
        assert caddy_after['StartedAt']==caddy_before['StartedAt']
        assert not komari_after.get('OOMKilled')
    except Exception:
        if promoted:
            rollback=CADDY.with_name('Caddyfile.nest-rollback')
            rollback.write_text(original)
            rollback.replace(CADDY)
            run('docker','exec',CADDY_CONTAINER,'caddy','reload','--config','/etc/caddy/Caddyfile','--adapter','caddyfile')
        raise
    metadata={'release':release,'deployed_at':stamp,'source':str(destination),'image':'freeze-nest:'+release,'backup':str(saved),'komari_unchanged':True,'caddy_restarted':False,'urls':['https://xiaoqiuyi.me/articles','https://xiaoqiuyi.me/admin']}
    (ROOT/'deployment.json').write_text(json.dumps(metadata,indent=2))
    for name in ('freeze-nest-backup.service','freeze-nest-backup.timer'):
        shutil.copy2(SOURCE/'deploy'/name,Path('/etc/systemd/system')/name)
    run('systemctl','daemon-reload')
    run('systemctl','enable','--now','freeze-nest-backup.timer')
    run('systemctl','start','freeze-nest-backup.service')
    print(json.dumps(metadata,indent=2))


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--release',required=True)
    main(parser.parse_args().release)
