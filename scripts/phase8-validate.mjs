import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const count = (text, needle) => text.split(needle).length - 1;
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const fullPath = path.join(directory, entry.name);
  if (['.git', '.worktrees', 'node_modules', '.seo-cache', '.venv'].includes(entry.name)) return [];
  return entry.isDirectory() ? walk(fullPath) : [fullPath];
});

const FAST_SLUGS = new Set([
  'json', 'base64', 'urlencode', 'formatjs', 'regex', 'textdiff', 'txtcount', 'unixtime',
]);
const FAST_CSS = '/static/style/ymir-fast-core-v66.css';
const FAST_SCRIPT = '/static/script/ymir-fast-core-v66.mjs';
const FORBIDDEN_ON_FAST = [
  '/static/style/ymir-tool-bundle-v65.css',
  '/static/script/ymir-tools-manifest.js',
  '/static/script/ymir-tool-runtime-v63.js',
  '/static/script/ymir-tool-core-runtime-v63.js',
  '/static/script/ymir-vue-tools-app.js',
  '/static/script/ymir-tool-shell-v63.js',
  '/static/script/ymir-tool-watchdog-v63.js',
];

const manifest = JSON.parse(read('static/script/ymir-vue-tool-manifest.json'));
assert(manifest.toolCount === 150, 'Manifest must preserve 150 tools');
assert(Object.keys(manifest.appByTool || {}).length === 150, 'appByTool must map all 150 tools');

const htmlFiles = walk(root).filter((file) => file.endsWith('.html'));
assert(htmlFiles.length === 217, `Expected 217 HTML files, found ${htmlFiles.length}`);

let toolPages = 0;
let fastPages = 0;
let legacyPages = 0;
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const match = html.match(/data-ymir-tool=["']([^"']+)["']/);
  if (!match) continue;
  toolPages += 1;
  const slug = match[1];
  const relativePath = path.relative(root, file).replaceAll('\\', '/');
  assert(html.includes(`https://ymirtool.com/${slug}/`), `${relativePath}: canonical page URL missing`);

  const mainStart = html.search(/<main\b[^>]*data-ymir-tool=/i);
  const mainEnd = html.indexOf('</main>', mainStart);
  assert(mainStart >= 0 && mainEnd > mainStart, `${relativePath}: tool main element missing`);
  const mainHtml = html.slice(mainStart, mainEnd);
  const firstSection = mainHtml.match(/<section\b[^>]*class="([^"]*)"[^>]*>/i);
  assert(firstSection, `${relativePath}: first section missing`);

  if (FAST_SLUGS.has(slug)) {
    fastPages += 1;
    assert(firstSection[1].split(/\s+/).includes('ymir-fast-workbench'), `${relativePath}: real fast workbench is not first`);
    assert(html.includes(`data-fast-tool="${slug}"`), `${relativePath}: fast tool marker missing`);
    assert(html.includes('data-fast-input'), `${relativePath}: real input control missing`);
    assert(html.includes('data-fast-output') || html.includes('data-fast-metric'), `${relativePath}: real output control missing`);
    assert(count(html, FAST_CSS) === 1, `${relativePath}: fast CSS must appear exactly once`);
    assert(count(html, FAST_SCRIPT) === 1, `${relativePath}: fast module must appear exactly once`);
    assert(html.includes('ymir-fast-workbench:start') && html.includes('ymir-fast-workbench:end'), `${relativePath}: generated boundaries missing`);
    assert(!html.includes('id="ymir-vue-tool-app"'), `${relativePath}: empty Vue mount root remains`);
    for (const forbidden of FORBIDDEN_ON_FAST) {
      assert(!html.includes(forbidden), `${relativePath}: forbidden initial resource remains: ${forbidden}`);
    }
  } else {
    legacyPages += 1;
    const app = manifest.appByTool[slug];
    assert(app, `${relativePath}: legacy app mapping missing for ${slug}`);
    assert(firstSection[1].split(/\s+/).includes('ymir-vue-tool-root'), `${relativePath}: legacy workbench is no longer first`);
    assert(count(html, '/static/style/ymir-tool-bundle-v65.css') === 1, `${relativePath}: legacy CSS must appear once`);
    assert(html.includes('/static/script/ymir-tool-runtime-v63.js'), `${relativePath}: legacy runtime missing`);
    assert(html.includes(app), `${relativePath}: mapped legacy app missing`);
    assert(!html.includes(FAST_SCRIPT), `${relativePath}: fast module leaked into legacy page`);
  }

  assert(html.includes('ymir-static-tool-lead'), `${relativePath}: retained tool lead missing`);
}

assert(toolPages === 150, `Expected 150 tool pages, found ${toolPages}`);
assert(fastPages === 8, `Expected 8 fast pages, found ${fastPages}`);
assert(legacyPages === 142, `Expected 142 legacy pages, found ${legacyPages}`);

const homepage = read('index.html');
const homeWorkbenchIndex = homepage.indexOf('data-fast-home="true"');
const homeHeroIndex = homepage.indexOf('class="ymir-home-hero');
assert(homeWorkbenchIndex > -1, 'Homepage fast workbench is missing');
assert(homeHeroIndex > homeWorkbenchIndex, 'Homepage fast workbench must render before the hero');
assert(homepage.includes('data-fast-action="formatJson"'), 'Homepage format action is missing');
assert(count(homepage, FAST_CSS) === 1, 'Homepage fast CSS must appear exactly once');
assert(count(homepage, FAST_SCRIPT) === 1, 'Homepage fast module must appear exactly once');
assert(!/<script[^>]+src="\/static\/script\/ymir-tools-manifest\.js/i.test(homepage), 'Homepage must not statically load the full manifest');
for (const slug of ['base64', 'urlencode', 'formatjs', 'regex', 'textdiff', 'txtcount', 'unixtime']) {
  assert(homepage.includes(`href="/${slug}/"`), `Homepage fast workbench link missing: ${slug}`);
}

for (const relativePath of [FAST_CSS, FAST_SCRIPT].map((item) => item.slice(1))) {
  const fullPath = path.join(root, relativePath);
  assert(fs.existsSync(fullPath), `Missing fast asset: ${relativePath}`);
  assert(fs.statSync(fullPath).size < 100_000, `${relativePath}: 100 KB raw budget exceeded`);
}

const fastCss = read(FAST_CSS.slice(1));
assert(!fastCss.includes('@import'), 'Fast CSS must not import blocking stylesheets');
assert(!fastCss.includes('.el-'), 'Fast CSS must not include Element Plus selectors');
assert((fastCss.match(/{/g) || []).length === (fastCss.match(/}/g) || []).length, 'Fast CSS braces are unbalanced');
execFileSync(process.execPath, ['--check', path.join(root, FAST_SCRIPT.slice(1))], { stdio: 'pipe' });

console.log(`Phase 8 validation passed: homepage plus ${fastPages} fast pages, ${legacyPages} unchanged legacy pages, and both fast assets are below 100 KB.`);
