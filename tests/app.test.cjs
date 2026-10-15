'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const script = fs.readFileSync(path.join(__dirname, '../dist/app.js'), 'utf8');

function element({ id, dataset = {}, textContent = '', hidden = false, attributes = {} } = {}) {
  return {
    id,
    dataset,
    textContent,
    hidden,
    disabled: false,
    attributes,
    listeners: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    getAttribute(name) { return this.attributes[name] ?? null; },
    addEventListener(name, callback) { this.listeners[name] = callback; },
    click() { return this.listeners.click(); },
  };
}

function loadPage({ now = '2026-10-15T00:00:00Z', url = 'https://xiaoqiuyi.me/', saved, storageFails = false, extraElements = [] } = {}) {
  const toggle = element({ id: 'language-toggle', hidden: true });
  const age = element({ dataset: { age: '' } });
  const birthday = element({ dataset: { birthday: '' } });
  const title = element({ dataset: { i18n: 'aboutTitle' } });
  const meta = element({ dataset: { i18nContent: 'metaDescription' } });
  const navigation = element({ dataset: { i18nAria: 'navigation' } });
  const elements = [toggle, age, birthday, title, meta, navigation, ...extraElements];
  const document = {
    documentElement: { lang: 'zh-CN' },
    hidden: false,
    listeners: {},
    getElementById: (id) => elements.find((item) => item.id === id),
    querySelectorAll(selector) {
      const datasets = {
        '[data-i18n]': 'i18n',
        '[data-i18n-aria]': 'i18nAria',
        '[data-i18n-content]': 'i18nContent',
        '[data-birthday]': 'birthday',
        'a[data-page-link]': 'pageLink',
      };
      if (selector === '[data-age], [data-i18n="ageValue"]') return [age];
      return elements.filter((item) => Object.hasOwn(item.dataset, datasets[selector]));
    },
    addEventListener(name, callback) { this.listeners[name] = callback; },
  };
  const location = { href: url };
  const writes = [];
  const localStorage = {
    getItem() { if (storageFails) throw new Error('Storage blocked'); return saved; },
    setItem(key, value) { if (storageFails) throw new Error('Storage blocked'); writes.push([key, value]); },
  };
  const DateAtTestTime = class extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
  };

  vm.runInNewContext(script, {
    document,
    location,
    history: { replaceState(_state, _title, nextUrl) { location.href = nextUrl.toString(); } },
    localStorage,
    navigator: {},
    URL,
    Intl,
    Date: DateAtTestTime,
  });

  return { document, toggle, age, birthday, title, meta, navigation, location, writes };
}

test('age changes on the birthday in Shanghai, including the UTC date boundary', () => {
  assert.equal(loadPage({ now: '2026-01-20T15:59:59Z' }).age.textContent, '16 岁');
  assert.equal(loadPage({ now: '2026-01-20T16:00:00Z' }).age.textContent, '17 岁');
  assert.equal(loadPage({ now: '2026-01-21T16:00:00Z' }).age.textContent, '17 岁');
  assert.equal(loadPage({ now: '2027-01-20T16:00:00Z', saved: 'en' }).age.textContent, '18 years old');
});

test('a valid shared language overrides storage and switching retains other query values and the hash', () => {
  const page = loadPage({ url: 'https://xiaoqiuyi.me/?ref=friend&lang=en#contact', saved: 'zh' });
  assert.equal(page.document.documentElement.lang, 'en');
  assert.equal(page.title.textContent, 'About me');
  assert.equal(page.birthday.textContent, 'January 21, 2009');
  assert.equal(page.navigation.attributes['aria-label'], 'Page navigation');
  assert.match(page.meta.attributes.content, /personal homepage/);
  assert.equal(page.toggle.textContent, '中文');
  assert.equal(page.toggle.hidden, false);

  page.toggle.click();
  assert.equal(page.document.documentElement.lang, 'zh-CN');
  assert.equal(page.title.textContent, '关于我');
  assert.equal(page.toggle.attributes['aria-label'], '切换到英文');
  assert.equal(page.location.href, 'https://xiaoqiuyi.me/?ref=friend&lang=zh#contact');
  assert.deepEqual(page.writes, [['homepage-language', 'zh']]);
});

test('invalid language falls back to a valid saved preference, otherwise Chinese', () => {
  assert.equal(loadPage({ url: 'https://xiaoqiuyi.me/?lang=de', saved: 'en' }).document.documentElement.lang, 'en');
  assert.equal(loadPage({ saved: 'de' }).document.documentElement.lang, 'zh-CN');
});

test('blocked localStorage does not prevent initial rendering, switching, or shareable URLs', () => {
  const page = loadPage({ storageFails: true });
  assert.equal(page.document.documentElement.lang, 'zh-CN');
  assert.doesNotThrow(() => page.toggle.click());
  assert.equal(page.document.documentElement.lang, 'en');
  assert.equal(new URL(page.location.href).searchParams.get('lang'), 'en');
  assert.equal(loadPage({ storageFails: true, url: 'https://xiaoqiuyi.me/?lang=en' }).title.textContent, 'About me');
});

test('language and age rendering work without clipboard APIs', () => {
  const page = loadPage({ saved: 'en' });
  assert.equal(page.title.textContent, 'About me');
  assert.equal(page.age.textContent, '17 years old');
});

test('marked page links retain the language across real pages when storage is blocked', () => {
  const about = element({ dataset: { pageLink: '' }, attributes: { href: 'about.html' } });
  const projects = element({ dataset: { pageLink: '' }, attributes: { href: 'projects.html?source=home#codex-theme' } });
  const page = loadPage({
    url: 'https://xiaoqiuyi.me/Freeze-s-life/index.html?lang=en',
    storageFails: true,
    extraElements: [about, projects],
  });

  assert.equal(about.getAttribute('href'), '/Freeze-s-life/about.html?lang=en');
  assert.equal(projects.getAttribute('href'), '/Freeze-s-life/projects.html?source=home&lang=en#codex-theme');
  assert.equal(about.listeners.click, undefined);
  const nextPage = loadPage({ url: new URL(about.getAttribute('href'), page.location.href).href, storageFails: true });
  assert.equal(nextPage.document.documentElement.lang, 'en');

  page.toggle.click();
  assert.equal(about.getAttribute('href'), '/Freeze-s-life/about.html?lang=zh');
  assert.equal(projects.getAttribute('href'), '/Freeze-s-life/projects.html?source=home&lang=zh#codex-theme');
});

test('relative subpaths and hashes survive while external and unmarked links remain unchanged', () => {
  const internal = element({ dataset: { pageLink: '' }, attributes: { href: '../projects.html?from=about&lang=zh#source' } });
  const external = element({ attributes: { href: 'https://github.com/QuinnFreeze' } });
  const markedExternal = element({ dataset: { pageLink: '' }, attributes: { href: 'https://github.com/QuinnFreeze/Freeze-s-life?tab=readme' } });
  const email = element({ dataset: { pageLink: '' }, attributes: { href: 'mailto:xiaoqiuyi0@gmail.com' } });
  loadPage({
    url: 'https://xiaoqiuyi.me/site/nested/about.html?lang=en',
    extraElements: [internal, external, markedExternal, email],
  });

  assert.equal(internal.getAttribute('href'), '/site/projects.html?from=about&lang=en#source');
  assert.equal(external.getAttribute('href'), 'https://github.com/QuinnFreeze');
  assert.equal(markedExternal.getAttribute('href'), 'https://github.com/QuinnFreeze/Freeze-s-life?tab=readme');
  assert.equal(email.getAttribute('href'), 'mailto:xiaoqiuyi0@gmail.com');
});

test('page-specific title and metadata keys stay distinct when the language changes', () => {
  const pageTitle = element({ dataset: { i18n: 'aboutPageTitle' } });
  const pageMeta = element({ dataset: { i18nContent: 'aboutMetaDescription' } });
  const page = loadPage({ saved: 'en', extraElements: [pageTitle, pageMeta] });

  assert.equal(pageTitle.textContent, 'About me · Freeze’s Nest');
  assert.match(pageMeta.getAttribute('content'), /^About 李秋易/);
  assert.notEqual(pageMeta.getAttribute('content'), page.meta.getAttribute('content'));
  page.toggle.click();
  assert.equal(pageTitle.textContent, '关于我 · Freeze’s Nest');
  assert.match(pageMeta.getAttribute('content'), /^关于李秋易/);
});
