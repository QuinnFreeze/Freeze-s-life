import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'site');
const deploy = resolve(root, 'dist');
const origin = 'https://xiaoqiuyi.me';
const navigationItems = [
  { page: 'home', file: 'index.html', key: 'navHome', label: '首页' },
  { page: 'about', file: 'about.html', key: 'navAbout', label: '关于' },
  { page: 'projects', file: 'projects.html', key: 'navProjects', label: '项目' },
  { page: 'interests', file: 'interests.html', key: 'navInterests', label: '兴趣' },
  { page: 'contact', file: 'contact.html', key: 'navContact', label: '联系' },
];
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));
const canonicalURL = (file) => `${origin}/${file === 'index.html' ? '' : file}`;

const pages = JSON.parse(await readFile(resolve(source, 'pages.json'), 'utf8'));
const layout = await readFile(resolve(source, 'layout.html'), 'utf8');
if (!Array.isArray(pages) || pages.length === 0) throw new Error('site/pages.json must contain pages.');
const filenames = new Set();
const pageNames = new Set();
const requiredKeys = ['file', 'page', 'nav', 'titleKey', 'title', 'descriptionKey', 'description'];
for (const page of pages) {
  for (const key of requiredKeys) {
    if (typeof page?.[key] !== 'string' || !page[key].trim()) throw new Error(`Missing page metadata: ${key}`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.html$/.test(page.file) || basename(page.file) !== page.file) {
    throw new Error(`Invalid page filename: ${page.file}`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page.page) ||
      !/^[a-zA-Z][a-zA-Z0-9]*$/.test(page.titleKey) ||
      !/^[a-zA-Z][a-zA-Z0-9]*$/.test(page.descriptionKey) ||
      !navigationItems.some((item) => item.page === page.nav)) {
    throw new Error(`Invalid page metadata: ${page.file}`);
  }
  if (filenames.has(page.file) || pageNames.has(page.page)) throw new Error(`Duplicate page: ${page.file}`);
  filenames.add(page.file);
  pageNames.add(page.page);
}
for (const item of navigationItems) {
  if (!filenames.has(item.file)) throw new Error(`Missing navigation page: ${item.file}`);
}

// Keep templates at build time; the published pages require no template runtime.
const generated = new Map();
for (const page of pages) {
  const content = await readFile(resolve(source, 'pages', page.file), 'utf8');
  const navigation = navigationItems.map((item) => {
    const current = page.nav === item.page
      ? ` aria-current="${page.file === item.file ? 'page' : 'true'}"`
      : '';
    return `<a class="nav-link" href="${item.file}" data-page-link="${item.page}" data-i18n="${item.key}"${current}>${item.label}</a>`;
  }).join('\n        ');
  const values = {
    page: escapeHTML(page.page), title: escapeHTML(page.title), titleKey: escapeHTML(page.titleKey),
    description: escapeHTML(page.description), descriptionKey: escapeHTML(page.descriptionKey),
    canonical: canonicalURL(page.file), navigation, content,
  };
  for (const key of Object.keys(values)) {
    if (!layout.includes(`{{${key}}}`)) throw new Error(`Layout is missing {{${key}}}.`);
  }
  const html = layout.replace(/\{\{([a-zA-Z]+)\}\}/g, (_, key) => {
    if (!(key in values)) throw new Error(`Unknown layout placeholder: ${key}`);
    return values[key];
  });
  if (!content.trim()) throw new Error(`Empty page content: ${page.file}`);
  generated.set(page.file, html);
}

const app = await readFile(resolve(deploy, 'app.js'), 'utf8');
new Script(app, { filename: 'app.js' });

// Validate all pages, including cross-page fragments and shared local resources.
const verifiedAssets = new Set();
for (const [file, html] of generated) {
  for (const [, value] of html.matchAll(/\s(?:src|href)\s*=\s*["']([^"']+)["']/g)) {
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value)) continue;
    const url = new URL(value, `${origin}/${file}`);
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
    const path = resolve(deploy, relative);
    if (!path.startsWith(deploy + sep)) throw new Error(`Invalid local link in ${file}: ${value}`);
    const localFile = generated.has(relative) || (await stat(path).catch(() => null))?.isFile();
    if (!localFile) {
      throw new Error(`Invalid local link in ${file}: ${value}`);
    }
    if (url.hash && relative.endsWith('.html')) {
      const target = generated.get(relative) ?? await readFile(path, 'utf8');
      const id = decodeURIComponent(url.hash.slice(1));
      const ids = [...target.matchAll(/\sid\s*=\s*["']([^"']+)["']/g)].map((match) => match[1]);
      if (!ids.includes(id)) throw new Error(`Broken fragment in ${file}: ${value}`);
    }
    verifiedAssets.add(relative);
  }
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((page) => `  <url><loc>${canonicalURL(page.file)}</loc></url>`).join('\n')}\n</urlset>\n`;
await mkdir(deploy, { recursive: true });
for (const [file, html] of generated) await writeFile(resolve(deploy, file), html);
await writeFile(resolve(deploy, 'sitemap.xml'), sitemap);
await writeFile(resolve(deploy, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);

const output = resolve(root, '.build');
await rm(output, { recursive: true, force: true });
await cp(deploy, output, { recursive: true });
console.log(`Static build ready: ${pages.length} pages generated in dist/ and copied to .build/ (${verifiedAssets.size} local targets verified; no runtime dependencies).`);
