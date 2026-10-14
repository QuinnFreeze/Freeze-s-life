import { cp, mkdir, readFile, stat } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'dist');
const html = await readFile(resolve(source, 'index.html'), 'utf8');
const app = await readFile(resolve(source, 'app.js'), 'utf8');
new Script(app, { filename: 'app.js' });

// Validate the deployable source without introducing a bundler or runtime dependency.
const assets = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)]
  .map((match) => match[1])
  .filter((url) => !/^[a-z][a-z\d+.-]*:/i.test(url));
for (const asset of new Set(assets)) {
  const path = resolve(source, asset);
  if (!path.startsWith(source + sep) || !(await stat(path)).isFile()) {
    throw new Error(`Invalid local asset: ${asset}`);
  }
}
const output = resolve(root, '.build');
await mkdir(output, { recursive: true });
await cp(source, output, { recursive: true });
console.log(`Static build ready in .build/ (${new Set(assets).size} local assets verified; no dependencies).`);
