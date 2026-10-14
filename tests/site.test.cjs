const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const html = readFileSync(join(__dirname, '../dist/index.html'), 'utf8');

test('existing contacts and fragment links remain usable', () => {
  for (const href of [
    'https://github.com/QuinnFreeze',
    'mailto:xiaoqiuyi0@gmail.com',
    'https://x.com/xiaoqiuyi0',
  ]) {
    assert.ok(html.includes(`href="${href}"`), `Missing existing contact: ${href}`);
  }
  assert.ok(html.includes('id="whatsapp-handle">@xiaoqiuyi</span>'));
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'HTML IDs must be unique');
  for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) {
    assert.ok(ids.includes(target), `Broken fragment: #${target}`);
  }
});

test('project links use only the reviewed public repositories', () => {
  const projects = html.split('id="projects"')[1].split('</section>')[0];
  const links = [...projects.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(links, [
    'https://github.com/QuinnFreeze/codex-theme',
    'https://github.com/QuinnFreeze/Freeze-s-life',
  ]);
  for (const [, attrs] of html.matchAll(/<a\s+([^>]*target="_blank"[^>]*)>/g)) {
    assert.match(attrs, /rel="noopener noreferrer"/);
  }
});

test('page retains the name, motto, background and birthday without requiring JavaScript', () => {
  assert.ok(html.includes('李秋易'));
  assert.ok(html.includes('Quinn Freeze'));
  assert.ok(html.includes('问史哪得信如许<br>唯有实录奠根基'));
  assert.ok(html.includes('assets/paper-background.jpeg'));
  assert.ok(html.includes('datetime="2009-01-21"'));
  assert.ok(html.includes('<noscript>'));
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /rel="canonical" href="https:\/\/xiaoqiuyi.me\/"/);
});
