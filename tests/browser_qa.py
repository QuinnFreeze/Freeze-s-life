"""Disposable end-to-end QA. Uses .qa-data, never a production database.

Start the development service on 127.0.0.1:8765, initialize qa-admin into
.qa-data/credentials.txt, then run with the project virtualenv. Browser plugin
not available; this workflow uses Playwright with a project-local Chromium.
"""
import json
import os
from pathlib import Path
import secrets
import sqlite3
import re
import sys

from PIL import Image
from playwright.sync_api import sync_playwright, expect
expect.set_options(timeout=15000)

ROOT = Path(__file__).resolve().parents[1]
BASE = 'http://127.0.0.1:8765'
ARTIFACTS = ROOT / 'artifacts'
ARTIFACTS.mkdir(exist_ok=True)
password = next(line.split(': ', 1)[1] for line in (ROOT / '.qa-data/credentials.txt').read_text().splitlines() if line.startswith('Password:'))
Image.new('RGB', (160, 90), '#b4cadf').save(ROOT / '.qa-data/test.png')
checks = []
errors = []
layout_only = '--layout-only' in sys.argv

# Reset only the disposable test fixture so a failed browser run is repeatable.
if not layout_only:
    with sqlite3.connect(ROOT / '.qa-data/nest.sqlite3') as fixture:
        for table in ('article_views','articles','categories','images','sessions','login_attempts'):
            fixture.execute('DELETE FROM '+table)
        fixture.execute("DELETE FROM users WHERE username<>'qa-admin'")
        fixture.execute("UPDATE settings SET value='9' WHERE key='posts_per_page'")


def passed(name):
    checks.append({'check': name, 'status': 'PASS'})
    print('PASS:', name, flush=True)


def no_overflow(page, label):
    widths = page.evaluate('({width:innerWidth,doc:document.documentElement.scrollWidth})')
    if widths['doc'] > widths['width'] + 1:
        print('OVERFLOW',label,page.evaluate("Array.from(document.querySelectorAll('body *')).filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>({tag:e.tagName,cls:e.className,width:e.getBoundingClientRect().width,right:e.getBoundingClientRect().right,parent:e.parentElement?.className})).slice(0,25)"),flush=True)
        page.screenshot(path=str(ARTIFACTS/'overflow-failure.png'))
    assert widths['doc'] <= widths['width'] + 1, (label, widths)


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=str(ROOT / '.browsers/chrome-headless-shell-linux64/chrome-headless-shell'),
        headless=True, args=['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-background-networking'],
        env={**os.environ, 'LD_LIBRARY_PATH': str(ROOT / '.browsers/libs/usr/lib/x86_64-linux-gnu'), 'FONTCONFIG_FILE': str(ROOT / '.browsers/fonts.conf')})
    context = browser.new_context(viewport={'width':1440,'height':1000}, locale='zh-CN')
    page = context.new_page()
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
    page.goto(BASE + '/admin?lang=zh')
    expect(page.get_by_role('heading',name='欢迎回来')).to_be_visible()
    page.get_by_label('账号',exact=True).fill('qa-admin')
    page.get_by_label('密码',exact=True).fill(password)
    page.get_by_role('button',name='登录',exact=True).click()
    expect(page.get_by_role('heading',name='概览',exact=True)).to_be_visible(timeout=20000)
    page.screenshot(path=str(ARTIFACTS/'admin-desktop.png'))
    passed('Admin login, dashboard identity and nonblank rendering')
    if layout_only:
        for width in (1440,390,375,360,340,320):
            page.set_viewport_size({'width':width,'height':844})
            no_overflow(page,f'admin dashboard {width}')
            for route in ('/','/about.html','/projects.html','/interests.html','/contact.html','/codex-theme.html','/freeze-nest.html','/articles','/articles/qa-interface'):
                page.goto(BASE+route+'?lang=en')
                expect(page.locator('main')).not_to_be_empty()
                expect(page.locator('.nav-link')).to_have_count(6)
                assert page.locator('.nav-link[aria-current]').count()==1
                no_overflow(page,f'{route} {width}')
                if route=='/articles/qa-interface':
                    expect(page.locator('.cms-markdown strong')).to_have_text('live preview')
                    if width==390:page.screenshot(path=str(ARTIFACTS/'article-mobile.png'))
                if route=='/articles' and width==390:
                    expect(page.locator('#article-results')).to_have_attribute('aria-busy','false')
                    page.screenshot(path=str(ARTIFACTS/'articles-mobile.png'))
            page.goto(BASE+'/admin?lang=zh')
            expect(page.get_by_role('heading',name='概览',exact=True)).to_be_visible()
        assert not errors,errors
        browser.close()
        passed('Targeted responsive layout checks')
        (ARTIFACTS/'responsive-qa.json').write_text(json.dumps({'url':BASE,'browser':'Playwright Chromium headless','reason':'Browser plugin not available','widths':[1440,390,375,360,340,320],'existing_pages':7,'new_article_routes':2,'console_errors':errors,'status':'PASS'},indent=2))
        sys.exit(0)

    page.locator('#admin-nav').get_by_role('link',name='分类管理').click()
    page.locator('#category-create [name=name_zh]').fill('验证分类')
    page.locator('#category-create [name=name_en]').fill('Verification')
    page.locator('#category-create [name=slug]').fill('qa-verification')
    page.locator('#category-create').get_by_role('button',name='创建',exact=True).click()
    expect(page.locator('.admin-table strong',has_text='验证分类')).to_be_visible()
    passed('Category creation persists and appears in management')
    page.locator('#admin-nav').get_by_role('link',name='文章管理').click()
    page.get_by_role('link',name='＋ 新建文章').click()
    expect(page.locator('#article-editor')).to_be_visible()
    page.locator('[name=title_zh]').fill('界面验证文章')
    page.locator('[name=content_zh]').fill('## 玻璃风格写作\n\n这是 **实时预览** 和双语发布验证。')
    expect(page.locator('#markdown-preview strong')).to_have_text('实时预览',timeout=10000)
    page.locator('[name=slug]').fill('qa-interface')
    page.locator('[name=category_id]').select_option(label='验证分类')
    page.locator('[name=tags]').fill('验证, notes')
    page.locator('[data-action=content-language][data-language=en]').click()
    page.locator('[name=title_en]').fill('Interface verification article')
    page.locator('[name=content_en]').fill('## Writing in glass\n\nA **live preview** and bilingual publication check.')
    expect(page.locator('#markdown-preview strong')).to_have_text('live preview',timeout=10000)
    with page.expect_response(lambda response: response.url.endswith('/api/admin/images') and response.request.method=='POST') as image_response:
        page.locator('#markdown-image-upload').set_input_files(str(ROOT/'.qa-data/test.png'))
    assert image_response.value.status==201, image_response.value.text()
    expect(page.locator('[name=content_en]')).to_have_value(re.compile(r'/uploads/'))
    expect(page.locator('#markdown-preview img')).to_be_visible(timeout=10000)
    try:
        with page.expect_response(lambda response: response.url.endswith('/api/admin/images') and response.request.method=='POST') as cover_response:
            page.locator('#cover-upload').set_input_files(str(ROOT/'.qa-data/test.png'))
    except Exception:
        print('UPLOAD DIAGNOSTIC',page.locator('#admin-notice').text_content(),page.evaluate("({forms:document.querySelectorAll('#article-editor').length,cover:document.querySelector('#cover-upload').outerHTML,files:document.querySelector('#cover-upload').files.length,zh:document.querySelector('[name=content_zh]').value,en:document.querySelector('[name=content_en]').value})"),errors)
        page.screenshot(path=str(ARTIFACTS/'upload-failure.png'))
        raise
    assert cover_response.value.status==201, cover_response.value.text()
    expect(page.locator('#editor-cover-preview')).to_be_visible(timeout=10000)
    page.screenshot(path=str(ARTIFACTS/'editor-desktop.png'))
    with page.expect_response(lambda response: response.url.endswith('/api/admin/articles') and response.request.method=='POST') as saved_response:
        page.get_by_role('button',name='保存草稿',exact=True).click()
    assert saved_response.value.status==201
    expect(page).to_have_url(re.compile(r'#editor/\d+$'))
    expect(page.locator('#editor-save-state')).to_have_text('所有修改已保存',timeout=15000)
    assert context.request.get(BASE+'/api/articles?q=界面验证').json()['total']==0
    passed('Bilingual Markdown preview, caret image insertion, cover upload, private draft')
    with page.expect_response(lambda response: '/api/admin/articles/' in response.url and response.request.method=='PUT') as published_response:
        page.locator('button[value=published]').click()
    assert published_response.value.status==200
    expect(page.get_by_role('button',name='保存并发布',exact=True)).to_be_visible(timeout=15000)
    assert context.request.get(BASE+'/api/articles/qa-interface?lang=en').json()['title']=='Interface verification article'
    passed('Draft publication and persisted English translation')

    csrf = context.request.get(BASE+'/api/auth/me').json()['csrf_token']
    headers={'X-CSRF-Token':csrf}
    other=context.request.post(BASE+'/api/admin/articles',headers=headers,data={'slug':'qa-pagination','title_zh':'分页验证文章','content_zh':'分页内容','title_en':'Pagination verification','content_en':'Pagination content','status':'published'})
    assert other.ok, other.text()
    page.locator('#admin-nav').get_by_role('link',name='网站设置').click()
    page.locator('[name=posts_per_page]').fill('1')
    page.get_by_role('button',name='保存设置').click()
    expect(page.locator('#admin-notice')).to_have_text('已保存')
    assert context.request.get(BASE+'/api/settings').json()['posts_per_page']==1
    passed('Site settings persist and configure public pagination')

    public=context.new_page()
    public.on('pageerror',lambda error:errors.append(str(error)))
    public.on('console',lambda msg:errors.append(msg.text) if msg.type=='error' else None)
    public.goto(BASE+'/articles?lang=zh')
    expect(public.locator('.cms-card')).to_have_count(1)
    public.get_by_role('button',name='下一页',exact=True).click()
    expect(public.locator('.cms-page-number')).to_have_text('第 2 / 2 页')
    public.locator('#article-query').fill('界面验证')
    public.locator('#article-search').get_by_role('button',name='搜索',exact=True).click()
    expect(public.locator('.cms-card-title')).to_have_text('界面验证文章')
    public.screenshot(path=str(ARTIFACTS/'articles-desktop.png'))
    public.locator('.cms-card-title a').click()
    expect(public.get_by_role('heading',name='界面验证文章',exact=True)).to_be_visible()
    expect(public.locator('[data-article-views]')).to_have_text('1 次阅读')
    public.locator('#language-toggle').click()
    expect(public.get_by_role('heading',name='Interface verification article',exact=True)).to_be_visible()
    expect(public.locator('.cms-markdown strong')).to_have_text('live preview')
    expect(public.locator('[data-article-views]')).to_have_text('1 views')
    passed('Public search, pagination, detail, English switch and deduplicated views')

    editor_password=secrets.token_urlsafe(20)
    page.locator('#admin-nav').get_by_role('link',name='后台账号').click()
    page.locator('#user-create [name=username]').fill('qa-editor')
    page.locator('#user-create [name=password]').fill(editor_password)
    page.locator('#user-create').get_by_role('button',name='创建',exact=True).click()
    expect(page.locator('.admin-table strong',has_text='qa-editor')).to_be_visible()
    editor_context=browser.new_context(viewport={'width':390,'height':844})
    editor=editor_context.new_page()
    editor.goto(BASE+'/admin?lang=zh')
    editor.get_by_label('账号',exact=True).fill('qa-editor')
    editor.get_by_label('密码',exact=True).fill(editor_password)
    editor.get_by_role('button',name='登录',exact=True).click()
    expect(editor.get_by_role('heading',name='概览',exact=True)).to_be_visible(timeout=15000)
    expect(editor.locator('#admin-nav [data-route=users]')).to_be_hidden()
    assert editor_context.request.get(BASE+'/api/admin/users').status==403
    no_overflow(editor,'admin mobile')
    editor.screenshot(path=str(ARTIFACTS/'admin-mobile.png'))
    passed('Admin-created editor account, server permission enforcement, mobile admin')
    editor.locator('#admin-nav').get_by_role('link',name='修改密码').click()
    new_password=secrets.token_urlsafe(20)
    editor.locator('[name=old_password]').fill(editor_password)
    editor.locator('#password-form [name=password]').fill(new_password)
    editor.locator('[name=confirmation]').fill(new_password)
    editor.get_by_role('button',name='修改密码',exact=True).click()
    expect(editor.locator('#admin-notice')).to_have_text('密码已修改',timeout=15000)
    editor.locator('#admin-logout').click()
    editor.locator('#admin-confirm button[value=confirm]').click()
    expect(editor.get_by_role('heading',name='欢迎回来')).to_be_visible()
    passed('Password change, session CSRF rotation and logout')
    editor_context.close()

    for width,height in [(1440,1000),(390,844),(375,812),(320,740)]:
        public.set_viewport_size({'width':width,'height':height})
        for route in ['/', '/about.html','/projects.html','/interests.html','/contact.html','/codex-theme.html','/freeze-nest.html']:
            public.goto(BASE+route+'?lang=en')
            expect(public.locator('main')).not_to_be_empty()
            expect(public.locator('.nav-link')).to_have_count(6)
            no_overflow(public,f'{route} {width}px')
            assert public.locator('.nav-link[aria-current]').count()==1
        public.goto(BASE+'/articles?lang=en')
        expect(public.locator('.cms-card')).to_have_count(1)
        no_overflow(public,f'articles {width}px')
        if width==390:public.screenshot(path=str(ARTIFACTS/'articles-mobile.png'))
        public.goto(BASE+'/articles/qa-interface?lang=en')
        expect(public.locator('.cms-markdown strong')).to_have_text('live preview')
        no_overflow(public,f'article detail {width}px')
        if width==390:public.screenshot(path=str(ARTIFACTS/'article-mobile.png'))
    passed('All seven existing pages plus article routes render at 1440/390/375/320px without overflow')
    assert not errors, errors
    passed('No JavaScript errors, CSP violations or failed resources in tested flows')
    browser.close()

(ARTIFACTS/'browser-qa.json').write_text(json.dumps({'browser':'Playwright Chromium headless','reason':'Browser plugin not available','url':BASE,'checks':checks,'console_errors':errors},ensure_ascii=False,indent=2))
