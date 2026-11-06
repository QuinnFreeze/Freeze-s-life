#!/usr/bin/env python3
"""Build and test the production image without host ports or persistent data."""
from pathlib import Path
import json
import subprocess
import time

IMAGE='freeze-nest:20261030-articles-v1'
NAME='freeze-nest-image-qa'
source=Path(__file__).resolve().parents[1]


def run(*args, capture=False, check=True):
    return subprocess.run(args,check=check,text=True,stdout=subprocess.PIPE if capture else None).stdout


run('docker','build','-t',IMAGE,str(source))
run('docker','run','--detach','--rm','--name',NAME,'--network','none','--read-only',
    '--tmpfs','/tmp:size=32m,mode=1777','--tmpfs','/data:size=32m,uid=10001,gid=10001,mode=0700',
    '--memory','256m','--cpus','0.50','--pids-limit','64','--cap-drop','ALL','--security-opt','no-new-privileges:true',IMAGE)
try:
    for attempt in range(25):
        health=subprocess.run(['docker','exec',NAME,'python','-c',"import urllib.request; assert urllib.request.urlopen('http://127.0.0.1:8000/healthz',timeout=3).status==200"],capture_output=True)
        if health.returncode==0:break
        time.sleep(1)
    else:
        run('docker','logs',NAME)
        raise RuntimeError('Image failed readiness')
    script="""
import urllib.request,os,json
assert os.getuid()==10001
for route in ('/','/articles','/admin','/api/articles','/cms.css','/articles.js','/admin.js','/about.html','/projects.html','/interests.html','/contact.html','/codex-theme.html','/freeze-nest.html'):
    with urllib.request.urlopen('http://127.0.0.1:8000'+route,timeout=5) as r:
        assert r.status==200,route
with urllib.request.urlopen('http://127.0.0.1:8000/api/auth/me',timeout=5) as r:
    cookie=r.headers['Set-Cookie']
    assert all(flag in cookie for flag in ('Secure','HttpOnly','SameSite=Strict','__Host-nest_session'))
    assert json.load(r)['user'] is None
print('Production image: routes, non-root user, persistent-path writes and secure cookies PASS')
"""
    run('docker','exec',NAME,'python','-c',script)
    config=json.loads(run('docker','inspect','--format','{{json .HostConfig}}',NAME,capture=True))
    assert config['ReadonlyRootfs'] and config['Memory']==256*1024*1024
    assert config['NetworkMode']=='none'
    print('Production image isolation PASS')
finally:
    run('docker','stop',NAME,check=False)
