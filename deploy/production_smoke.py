#!/usr/bin/env python3
"""Check live HTTPS, private admin flow and Komari after promotion.

Creates one temporary private draft and removes it in a finally block.
Never prints credentials, cookies or CSRF values.
"""
import http.cookiejar
import json
import os
from pathlib import Path
import secrets
import shutil
import sqlite3
import subprocess
import tarfile
import tempfile
import hashlib
import urllib.error
import urllib.request

from playwright.sync_api import sync_playwright, expect

SOURCE=Path(__file__).resolve().parents[1]
ROOT=Path('/opt/freeze-nest')
BASE='https://xiaoqiuyi.me'
ARTIFACTS=SOURCE/'artifacts'
ARTIFACTS.mkdir(exist_ok=True)
credentials={line.split(': ',1)[0]:line.split(': ',1)[1] for line in (ROOT/'secrets/initial-admin.txt').read_text().splitlines() if ': ' in line}
opener=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))

# A single writable parent mount lets online snapshots hard-link immutable
# media. Two separate systemd bind mounts can reject links with EXDEV.
shutil.copy2(SOURCE/'deploy/freeze-nest-backup.service','/etc/systemd/system/freeze-nest-backup.service')
release_source=Path(json.loads((ROOT/'deployment.json').read_text())['source'])
shutil.copy2(SOURCE/'deploy/freeze-nest-backup.service',release_source/'deploy/freeze-nest-backup.service')
subprocess.run(['systemctl','daemon-reload'],check=True)


def request(path,method='GET',body=None,csrf=None,expected=200):
    headers={'Origin':BASE}
    if csrf:headers['X-CSRF-Token']=csrf
    if body is not None:
        headers['Content-Type']='application/json'
        body=json.dumps(body).encode()
    req=urllib.request.Request(BASE+path,body,headers,method=method)
    try:response=opener.open(req,timeout=20)
    except urllib.error.HTTPError as error:response=error
    with response:
        assert response.status==expected,(path,response.status)
        raw=response.read()
        return json.loads(raw) if 'application/json' in response.headers.get('Content-Type','') else raw.decode()


request('/healthz')
for route in ('/','/articles','/admin','/about.html','/projects.html','/interests.html','/contact.html','/codex-theme.html','/freeze-nest.html'):
    assert '<html' in request(route)
request('/api/admin/articles',expected=401)
for route in ('/.env','/server.py','/data/nest.sqlite3'):
    request(route,expected=404)
csrf=request('/api/auth/me')['csrf_token']
auth=request('/api/auth/login','POST',{'username':credentials['Username'],'password':credentials['Password']},csrf)
assert auth['user']['role']=='admin'
csrf=auth['csrf_token']
before=request('/api/admin/stats')
request('/api/admin/articles','POST',{},expected=403)
slug='deployment-smoke-'+secrets.token_hex(6)
draft=None
image=None
try:
    boundary='NestSmoke'+secrets.token_hex(12)
    pixels=(SOURCE/'.qa-data/test.png').read_bytes()
    multipart=(f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="deployment-check.png"\r\nContent-Type: image/png\r\n\r\n'.encode()+pixels+f'\r\n--{boundary}--\r\n'.encode())
    upload=urllib.request.Request(BASE+'/api/admin/images',multipart,{'Origin':BASE,'X-CSRF-Token':csrf,'Content-Type':'multipart/form-data; boundary='+boundary},method='POST')
    with opener.open(upload,timeout=20) as response:
        assert response.status==201
        image=json.load(response)
    draft=request('/api/admin/articles','POST',{'slug':slug,'title_zh':'部署验证草稿','content_zh':f'这是一条将被自动清理的私密验证记录。\n\n![验证图片]({image["url"]})','status':'draft'},csrf,201)
    assert request('/api/articles?q='+slug)['total']==0
    request('/api/articles/'+slug,expected=404)
    assert request('/api/admin/articles/'+str(draft['id']))['slug']==slug
    subprocess.run(['systemctl','start','freeze-nest-backup.service'],check=True)
    backup=json.loads((ROOT/'backups/latest.json').read_text())
    with open(backup['file'],'rb') as stream:
        assert hashlib.file_digest(stream,'sha256').hexdigest()==backup['sha256']
    with tempfile.TemporaryDirectory() as temp:
        with tarfile.open(backup['file']) as archive:archive.extractall(temp,filter='data')
        database=sqlite3.connect(Path(temp)/'data/nest.sqlite3')
        assert database.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
        assert database.execute('SELECT slug FROM articles WHERE id=?',(draft['id'],)).fetchone()[0]==slug
        assert (Path(temp)/'data'/image['url'].lstrip('/')).is_file()
        database.close()
finally:
    if draft:request('/api/admin/articles/'+str(draft['id']),'DELETE',csrf=csrf)
    if image:request('/api/admin/images/'+str(image['id']),'DELETE',csrf=csrf)
assert request('/api/admin/stats')==before
subprocess.run(['systemctl','start','freeze-nest-backup.service'],check=True)
request('/api/auth/logout','POST',{},csrf)
request('/api/admin/stats',expected=401)
with urllib.request.urlopen('https://check.xiaoqiuyi.me',timeout=20) as response:assert response.status==200

errors=[]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=str(SOURCE/'.browsers/chrome-headless-shell-linux64/chrome-headless-shell'),
        headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'],
        env={**os.environ,'LD_LIBRARY_PATH':str(SOURCE/'.browsers/libs/usr/lib/x86_64-linux-gnu'),'FONTCONFIG_FILE':str(SOURCE/'.browsers/fonts.conf')})
    context=browser.new_context(viewport={'width':1440,'height':1000})
    page=context.new_page()
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.on('console',lambda msg:errors.append(msg.text) if msg.type=='error' else None)
    page.goto(BASE+'/admin?lang=zh')
    expect(page.get_by_role('heading',name='欢迎回来')).to_be_visible()
    page.get_by_label('账号',exact=True).fill(credentials['Username'])
    page.get_by_label('密码',exact=True).fill(credentials['Password'])
    page.get_by_role('button',name='登录',exact=True).click()
    expect(page.get_by_role('heading',name='概览',exact=True)).to_be_visible(timeout=20000)
    page.screenshot(path=str(ARTIFACTS/'production-admin-desktop.png'))
    page.locator('#admin-logout').click()
    page.locator('#admin-confirm button[value=confirm]').click()
    expect(page.get_by_role('heading',name='欢迎回来')).to_be_visible()
    page.set_viewport_size({'width':390,'height':844})
    page.goto(BASE+'/articles?lang=zh')
    expect(page.locator('#article-results')).to_have_attribute('aria-busy','false')
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    page.screenshot(path=str(ARTIFACTS/'production-articles-mobile.png'))
    page.goto(BASE+'/?lang=zh')
    expect(page.locator('.nav-link')).to_have_count(6)
    page.locator('#language-toggle').click()
    expect(page.locator('html')).to_have_attribute('lang','en')
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    assert not errors,errors
    browser.close()
report={'url':BASE,'https_routes':'PASS','private_admin_login_and_logout':'PASS','csrf_and_private_paths':'PASS','draft_persistence_and_isolation':'PASS','image_upload_and_backup_restore':'PASS','temporary_draft_and_image_removed':True,'komari_http':200,'production_browser':'PASS','console_errors':errors}
(ARTIFACTS/'production-qa.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
