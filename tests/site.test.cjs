const test = require('node:test');
const assert = require('node:assert/strict');
const { existsSync, readFileSync, statSync } = require('node:fs');
const { join, resolve, sep } = require('node:path');

const dist = resolve(__dirname, '../dist');
const origin = 'https://xiaoqiuyi.me';
const files = ['index.html', 'about.html', 'projects.html', 'interests.html', 'contact.html', 'codex-theme.html', 'freeze-nest.html'];
const pages = new Map(files.map((file) => [file, readFileSync(join(dist, file), 'utf8')]));
const navFiles = files.slice(0, 5);
const allowedRepositories = ['https://github.com/QuinnFreeze/codex-theme', 'https://github.com/QuinnFreeze/Freeze-s-life'];
const attributes = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map((match) => [match[1], match[2]]));
const links = (html) => [...html.matchAll(/<a\b[^>]*>/g)].map((match) => attributes(match[0]));
const ids = (html) => [...html.matchAll(/\sid\s*=\s*["']([^"']+)["']/g)].map((match) => match[1]);
const mainContent = (html) => html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] || '';

test('all seven pages provide distinct metadata, a single heading and readable content', () => {
  const canonicals = [];
  const titles = [];
  for (const [file, html] of pages) {
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${file}: expected one H1`);
    assert.equal(new Set(ids(html)).size, ids(html).length, `${file}: duplicate HTML IDs`);
    assert.match(html, /<html\b[^>]*lang="zh-CN"/, `${file}: Chinese no-script default`);
    const canonical = [...html.matchAll(/<link\b[^>]*>/g)].map((match) => attributes(match[0])).find((attrs) => attrs.rel === 'canonical')?.href;
    assert.equal(canonical, `${origin}/${file === 'index.html' ? '' : file}`, `${file}: incorrect canonical`);
    canonicals.push(canonical);
    const title = html.match(/<title\b[^>]*>([^<]+)<\/title>/)?.[1];
    assert.ok(title?.trim(), `${file}: missing title`);
    titles.push(title);
    const description = [...html.matchAll(/<meta\b[^>]*>/g)].map((match) => attributes(match[0])).find((attrs) => attrs.name === 'description')?.content;
    assert.ok(description?.trim(), `${file}: missing description`);
    const main = mainContent(html);
    assert.match(main, /<p\b[^>]*>[\s\S]*?\S[\s\S]*?<\/p>/, `${file}: page has no paragraph`);
    assert.ok(main.replace(/<[^>]*>/g, '').trim().length >= 40, `${file}: page content is empty`);
    assert.ok(html.includes('assets/paper-background.jpeg'), `${file}: original background is missing`);
  }
  assert.equal(new Set(canonicals).size, files.length, 'canonical URLs must be unique');
  assert.equal(new Set(titles).size, files.length, 'page titles must be distinct');
});

test('five-page navigation is reachable and identifies exactly one current section', () => {
  for (const [file, html] of pages) {
    const navigation = links(html).filter((attrs) => attrs['data-page-link']);
    assert.equal(navigation.length, 5, `${file}: expected five navigation links`);
    assert.deepEqual(navigation.map((attrs) => attrs.href), navFiles, `${file}: incorrect navigation destinations`);
    const current = navigation.filter((attrs) => attrs['aria-current']);
    assert.equal(current.length, 1, `${file}: expected one current section`);
    const isDetail = ['codex-theme.html', 'freeze-nest.html'].includes(file);
    assert.equal(current[0].href, isDetail ? 'projects.html' : file);
    assert.equal(current[0]['aria-current'], isDetail ? 'true' : 'page');
  }
});

test('all local resources, deep links and original home anchors resolve', () => {
  for (const [file, html] of pages) {
    for (const [, value] of html.matchAll(/\s(?:src|href)\s*=\s*["']([^"']+)["']/g)) {
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value)) continue;
      const url = new URL(value, `${origin}/${file}`);
      const local = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
      const path = resolve(dist, local);
      assert.ok(path.startsWith(dist + sep) && existsSync(path) && statSync(path).isFile(), `${file}: missing local target ${value}`);
      if (url.hash && local.endsWith('.html')) {
        const target = pages.get(local) || readFileSync(path, 'utf8');
        assert.ok(ids(target).includes(decodeURIComponent(url.hash.slice(1))), `${file}: broken fragment ${value}`);
      }
    }
  }
  for (const id of ['profile', 'projects', 'interests', 'contact']) {
    assert.ok(ids(pages.get('index.html')).includes(id), `Original home anchor #${id} is missing`);
  }
});

test('contact page retains original contact destinations and account-copy fallback', () => {
  const html = pages.get('contact.html');
  const destinations = links(html).map((attrs) => attrs.href);
  for (const href of ['https://github.com/QuinnFreeze', 'mailto:xiaoqiuyi0@gmail.com', 'https://x.com/xiaoqiuyi0']) {
    assert.ok(destinations.includes(href), `Missing existing contact: ${href}`);
  }
  assert.match(html, /id="whatsapp-handle"[^>]*>@xiaoqiuyi<\/span>/);
  assert.ok(ids(html).includes('copy-whatsapp'), 'WhatsApp copy control is missing');
  const status = [...html.matchAll(/<[^>]+\bid="contact-status"[^>]*>/g)].map((match) => attributes(match[0]))[0];
  assert.equal(status?.role, 'status', 'Contact feedback should be announced accessibly');
  assert.ok(!destinations.some((href) => /(?:wa\.me|api\.whatsapp\.com)/i.test(href)), 'Do not invent a WhatsApp chat destination');
});

test('about page retains confirmed identity and birthday with an honest no-script age fallback', () => {
  const html = pages.get('about.html');
  assert.ok(html.includes('李秋易'));
  assert.ok(html.includes('Quinn Freeze'));
  assert.match(html, /<time\b[^>]*datetime="2009-01-21"[^>]*>[^<]+<\/time>/);
  assert.match(html, /<span\b[^>]*data-age[^>]*>—<\/span>/);
  assert.match(html, /<noscript>[\s\S]*?JavaScript[\s\S]*?<\/noscript>/);
  assert.match(pages.get('index.html'), /问史哪得信如许\s*<br\s*\/?>\s*唯有实录奠根基/);
});

test('projects link only to reviewed public repositories and genuine detail pages', () => {
  const html = mainContent(pages.get('projects.html'));
  const destinations = links(html).map((attrs) => attrs.href);
  for (const file of ['codex-theme.html', 'freeze-nest.html']) {
    assert.ok(destinations.includes(file), `Missing project detail: ${file}`);
  }
  for (const [file, repository] of [['codex-theme.html', allowedRepositories[0]], ['freeze-nest.html', allowedRepositories[1]]]) {
    const detailLinks = links(mainContent(pages.get(file))).map((attrs) => attrs.href);
    assert.ok(detailLinks.includes('projects.html'), `${file}: missing return to project directory`);
    assert.ok(detailLinks.includes(repository), `${file}: missing real GitHub repository`);
  }
  const projectLinks = ['projects.html', 'codex-theme.html', 'freeze-nest.html']
    .flatMap((file) => links(mainContent(pages.get(file))).map((attrs) => attrs.href))
    .filter((href) => href.startsWith('https://github.com/'));
  assert.ok(projectLinks.length >= 2, 'Reviewed repository links are missing');
  for (const href of projectLinks) {
    assert.ok(allowedRepositories.some((repository) => href === repository || href.startsWith(repository + '/') || href.startsWith(repository + '#')), `Unreviewed project link: ${href}`);
  }
});

test('external new-tab links are protected on every page', () => {
  for (const [file, html] of pages) {
    for (const attrs of links(html).filter((attrs) => attrs.target === '_blank')) {
      const rel = new Set((attrs.rel || '').split(/\s+/));
      assert.ok(rel.has('noopener') && rel.has('noreferrer'), `${file}: unsafe new-tab link ${attrs.href}`);
    }
  }
});

test('sitemap indexes exactly the seven real public pages', () => {
  const sitemap = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.deepEqual(locations.sort(), files.map((file) => `${origin}/${file === 'index.html' ? '' : file}`).sort());
  assert.match(readFileSync(join(dist, 'robots.txt'), 'utf8'), /Sitemap: https:\/\/xiaoqiuyi.me\/sitemap.xml/);
});
