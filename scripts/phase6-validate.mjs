import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERSION = '20260710-v63';
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const full = path.join(dir, entry.name);
  if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.seo-cache') return [];
  return entry.isDirectory() ? walk(full) : [full];
});
const count = (text, needle) => text.split(needle).length - 1;

const manifest = JSON.parse(read('static/script/ymir-vue-tool-manifest.json'));
assert(manifest.version === VERSION, `Manifest version must be ${VERSION}`);
assert(manifest.toolCount === 150, 'Manifest must preserve 150 tools');
assert(Object.keys(manifest.appByTool || {}).length === 150, 'appByTool must map 150 tools');
assert(manifest.runtime?.vendor?.[0] === '/static/script/ymir-tool-runtime-v63.js', 'Manifest runtime path is stale');
assert(manifest.runtime?.coreToolScripts?.[0] === '/static/script/ymir-tool-core-runtime-v63.js', 'Manifest core runtime path is stale');

const htmlFiles = walk(root).filter(file => file.endsWith('.html'));
assert(htmlFiles.length === 217, `Expected 217 HTML files, found ${htmlFiles.length}`);
let toolPages = 0;
let corePages = 0;
for (const file of htmlFiles) {
  const rel = path.relative(root, file).replaceAll('\\', '/');
  const html = fs.readFileSync(file, 'utf8');
  assert(!html.includes('ymir-tool-bundle-v62.css'), `${rel}: stale v62 CSS reference`);
  assert(!html.includes('ymir-tool-shell-v62.js'), `${rel}: stale v62 shell reference`);
  assert(!html.includes('ymir-vue-loader.js'), `${rel}: legacy dynamic loader remains`);
  const slugMatch = html.match(/data-ymir-tool=["']([^"']+)["']/);
  const isTool = Boolean(slugMatch && html.includes('ymir-vue-tool-root'));
  if (!isTool) continue;
  toolPages++;
  const slug = slugMatch[1];
  const app = manifest.appByTool[slug];
  assert(app, `${rel}: missing manifest app mapping for ${slug}`);
  assert(count(html, '/static/style/ymir-tool-bundle-v63.css') === 1, `${rel}: v63 CSS must appear once`);
  assert(count(html, '/static/script/ymir-tools-manifest.js') === 1, `${rel}: manifest script must appear once`);
  assert(count(html, '/static/script/ymir-tool-runtime-v63.js') === 1, `${rel}: shared runtime must appear once`);
  assert(count(html, app) === 1, `${rel}: app script ${app} must appear once`);
  assert(count(html, '/static/script/ymir-tool-shell-v63.js') === 1, `${rel}: shell must appear once`);
  assert(count(html, '/static/script/ymir-tool-watchdog-v63.js') === 1, `${rel}: watchdog must appear once`);
  assert(html.includes(`?v=${VERSION}`), `${rel}: v63 cache key missing`);
  const order = [
    html.indexOf('/static/script/ymir-tools-manifest.js'),
    html.indexOf('/static/script/ymir-tool-runtime-v63.js'),
  ];
  if (app === manifest.runtime.coreApp) {
    corePages++;
    assert(count(html, '/static/script/ymir-tool-core-runtime-v63.js') === 1, `${rel}: core runtime must appear once`);
    order.push(html.indexOf('/static/script/ymir-tool-core-runtime-v63.js'));
  } else {
    assert(count(html, '/static/script/ymir-tool-core-runtime-v63.js') === 0, `${rel}: non-core page loads core runtime`);
  }
  order.push(html.indexOf(app), html.indexOf('/static/script/ymir-tool-shell-v63.js'), html.indexOf('/static/script/ymir-tool-watchdog-v63.js'));
  assert(order.every(index => index >= 0), `${rel}: a required script is missing`);
  assert(order.every((value, index) => index === 0 || value > order[index - 1]), `${rel}: scripts are not in deterministic order`);
}
assert(toolPages === 150, `Expected 150 tool pages, found ${toolPages}`);
assert(corePages === 12, `Expected 12 core-app pages, found ${corePages}`);

const requiredAssets = [
  'static/style/ymir-tool-bundle-v63.css',
  'static/script/ymir-tools-manifest.js',
  'static/script/ymir-tool-runtime-v63.js',
  'static/script/ymir-tool-core-runtime-v63.js',
  'static/script/ymir-tool-shell-v63.js',
  'static/script/ymir-tool-watchdog-v63.js',
];
for (const rel of requiredAssets) assert(fs.existsSync(path.join(root, rel)), `Missing v63 asset: ${rel}`);
for (const rel of ['static/style/ymir-tool-bundle-v62.css', 'static/script/ymir-tool-runtime-v62.js', 'static/script/ymir-tool-core-runtime-v62.js', 'static/script/ymir-tool-shell-v62.js', 'static/script/ymir-vue-loader.js']) {
  assert(!fs.existsSync(path.join(root, rel)), `Obsolete asset still present: ${rel}`);
}

const css = read('static/style/ymir-tool-bundle-v63.css');
assert(css.length > 250000, 'v63 CSS bundle appears incomplete');
assert(css.includes('Ymir Tool v63 layout and runtime recovery hotfix'), 'v63 layout hotfix marker missing');
assert(css.includes('grid-template-columns: repeat(3, minmax(0, 1fr))'), 'Regular feature grid rule missing');
assert((css.match(/\{/g) || []).length === (css.match(/\}/g) || []).length, 'v63 CSS braces are unbalanced');

const watchdog = read('static/script/ymir-tool-watchdog-v63.js');
assert(watchdog.includes("var VERSION = '20260710-v63'"), 'Watchdog version is stale');
assert(watchdog.includes('MAX_WAIT_MS = 8000'), 'Watchdog timeout missing');
assert(watchdog.includes('ymir-tool-failed'), 'Watchdog fallback state missing');

const jsToCheck = requiredAssets.filter(rel => rel.endsWith('.js'));
for (const app of new Set(Object.values(manifest.appByTool))) jsToCheck.push(app.replace(/^\//, ''));
for (const rel of [...new Set(jsToCheck)]) {
  execFileSync(process.execPath, ['--check', path.join(root, rel)], { stdio: 'pipe' });
}

const vercel = read('vercel.json');
const netlify = read('netlify.toml');
for (const [name, text] of [['vercel.json', vercel], ['netlify.toml', netlify]]) {
  assert(text.includes('s-maxage=300, stale-while-revalidate=60'), `${name}: HTML cache policy was not shortened`);
  assert(text.includes('max-age=31536000, immutable'), `${name}: static immutable cache policy missing`);
}

console.log(`Phase 6 validation passed: ${htmlFiles.length} HTML files, ${toolPages} tool pages, deterministic v63 loading, watchdog fallback, and regularized tool-page layout.`);
