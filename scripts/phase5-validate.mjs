import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const errors = [];
const VERSION = '20260710-v62';
const ADSENSE = 'pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
const manifestPath = path.join(root, 'static/script/ymir-vue-tool-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const tools = Array.isArray(manifest.tools) ? manifest.tools : [];

function walk(dir, suffix) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.seo-cache') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, suffix));
    else if (!suffix || entry.name.endsWith(suffix)) out.push(full);
  }
  return out;
}
function assert(ok, message) { if (!ok) errors.push(message); }
function count(text, needle) { return text.split(needle).length - 1; }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function meta(html, name) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const n = tag.match(/\bname=["']([^"']+)["']/i)?.[1] || '';
    if (n.toLowerCase() !== name.toLowerCase()) continue;
    return tag.match(/\bcontent=["']([^"']*)["']/i)?.[1] || '';
  }
  return '';
}
function balanced(text, open, close) {
  return (text.match(open) || []).length === (text.match(close) || []).length;
}

const htmlFiles = walk(root, '.html');
assert(htmlFiles.length === 217, `Expected 217 HTML files, found ${htmlFiles.length}`);
assert(tools.length === 150, `Expected 150 manifest tools, found ${tools.length}`);
assert(manifest.version === VERSION, `Manifest version must be ${VERSION}`);
assert(manifest.site?.version === VERSION, `Manifest site version must be ${VERSION}`);
assert(manifest.policy?.generator === 'v62 audited catalog and tool runtime', 'Manifest policy generator is stale');
assert(!('reviewSurface' in (manifest.policy || {})), 'Manifest still exposes internal review-surface terminology');
assert(Array.isArray(manifest.catalog?.toolUrls) && manifest.catalog.toolUrls.length === 150, 'Catalog must expose all 150 preserved tool URLs');
assert(Array.isArray(manifest.sitemap?.indexableToolUrls) && manifest.sitemap.indexableToolUrls.length === 8, 'Sitemap metadata must expose only 8 indexable tool URLs');
assert(!('toolUrls' in (manifest.sitemap || {})), 'Sitemap metadata still labels all preserved tools as indexable sitemap URLs');

const coreSlugs = new Set(['json', 'base64', 'urlencode', 'formatjs', 'regex', 'textdiff', 'txtcount', 'unixtime']);
let toolCount = 0;
let noindexTools = 0;
let indexableTools = 0;
let toolNotes = 0;
let insightsPages = 0;
let adsRuntimePages = 0;
let indexablePages = 0;
let noindexPages = 0;

for (const file of htmlFiles) {
  const rel = path.relative(root, file).split(path.sep).join('/');
  const html = fs.readFileSync(file, 'utf8');
  const robots = meta(html, 'robots');
  const noindex = /noindex/i.test(robots);
  if (noindex) noindexPages += 1; else indexablePages += 1;

  assert(!html.includes('__CSP_NONCE__'), `${rel}: nonce placeholder remains`);
  assert(/<html\b[^>]*\blang=["'][^"']+["']/i.test(html), `${rel}: missing lang`);
  assert(/<meta\b[^>]*name=["']viewport["']/i.test(html), `${rel}: missing viewport`);
  assert(/<meta\b[^>]*name=["']color-scheme["'][^>]*content=["']light dark["']/i.test(html) || /<meta\b[^>]*content=["']light dark["'][^>]*name=["']color-scheme["']/i.test(html), `${rel}: missing color-scheme meta`);
  assert(/<meta\b[^>]*name=["']format-detection["']/i.test(html), `${rel}: missing format-detection meta`);
  assert(count(html, '/static/script/ymir-tool-shell-v62.js') === 1, `${rel}: v62 shell must appear exactly once`);
  for (const trust of ['/methodology.html', '/sources.html', '/licenses.html', '/changelog.html']) {
    assert(html.includes(`href="${trust}"`) || html.includes(`href='${trust}'`), `${rel}: footer/trust link missing ${trust}`);
  }

  if (html.includes('cdn.vercel-insights.com/v1/script.js')) insightsPages += 1;
  if (html.includes(ADSENSE)) adsRuntimePages += 1;
  if (noindex) {
    assert(!html.includes('google-adsense-account'), `${rel}: noindex page declares AdSense account`);
    assert(!html.includes(ADSENSE), `${rel}: noindex page loads AdSense runtime`);
    assert(!html.includes('cdn.vercel-insights.com/v1/script.js'), `${rel}: noindex page loads analytics`);
  } else {
    assert(html.includes('google-adsense-account'), `${rel}: indexable page missing ownership metadata`);
  }

  const toolMatch = html.match(/data-ymir-tool=["']([^"']+)["']/i);
  if (toolMatch) {
    toolCount += 1;
    const slug = toolMatch[1];
    const isCore = coreSlugs.has(slug);
    if (noindex) noindexTools += 1; else indexableTools += 1;
    assert(count(html, '/static/style/ymir-tool-bundle-v62.css') === 1, `${rel}: tool bundle CSS must appear once`);
    assert(count(html, '/static/script/ymir-vue-loader.js') === 1, `${rel}: tool loader must appear once`);
    assert(html.includes('ymir-tool-page-v62'), `${rel}: missing v62 tool class`);
    assert(!html.includes('/static/vendor/element-plus/index.css'), `${rel}: old Element Plus CSS request remains`);
    assert(!html.includes('/static/style/ymir-tool-system-v61.css'), `${rel}: old tool CSS request remains`);
    assert(!html.includes('/static/script/ymir-ui.js'), `${rel}: standalone UI request remains`);
    assert(!html.includes('/static/script/ymir-i18n.js'), `${rel}: standalone i18n request remains`);
    const notes = /data-tool-documentation=["'][^"']+["']/.test(html);
    if (notes) toolNotes += 1;
    if (isCore) {
      assert(!noindex, `${rel}: core tool must be indexable`);
      assert(!notes, `${rel}: core tool should keep its hand-written content rather than generated notes`);
    } else {
      assert(noindex, `${rel}: additional tool must remain noindex`);
      assert(notes, `${rel}: additional tool missing usage boundary notes`);
    }
  }
}

assert(toolCount === 150, `Expected 150 tool pages, found ${toolCount}`);
assert(indexableTools === 8, `Expected 8 indexable tools, found ${indexableTools}`);
assert(noindexTools === 142, `Expected 142 noindex tools, found ${noindexTools}`);
assert(toolNotes === 142, `Expected notes on 142 additional tools, found ${toolNotes}`);
assert(indexablePages === 27, `Expected 27 indexable pages, found ${indexablePages}`);
assert(noindexPages === 190, `Expected 190 noindex pages, found ${noindexPages}`);
assert(adsRuntimePages === 1, `AdSense runtime must load only on homepage; found ${adsRuntimePages} pages`);
assert(read('index.html').includes(ADSENSE), 'Homepage is missing the AdSense ownership/runtime script');
assert(insightsPages === 27, `Analytics should load only on 27 indexable pages; found ${insightsPages}`);

for (const rel of ['sources.html', 'licenses.html', 'methodology.html', 'changelog.html', 'THIRD-PARTY-NOTICES.md']) {
  assert(fs.existsSync(path.join(root, rel)), `Missing transparency artifact: ${rel}`);
}

for (const rel of [
  'static/style/ymir-tool-bundle-v62.css',
  'static/script/ymir-tool-runtime-v62.js',
  'static/script/ymir-tool-core-runtime-v62.js',
  'static/script/ymir-tool-shell-v62.js',
  'static/script/ymir-vue-loader.js'
]) {
  assert(fs.existsSync(path.join(root, rel)), `Missing v62 asset: ${rel}`);
}

const css = read('static/style/ymir-tool-bundle-v62.css');
assert(css.length > 250000, 'v62 CSS bundle appears incomplete');
assert(balanced(css, /\{/g, /\}/g), 'v62 CSS bundle braces are unbalanced');
for (const token of ['prefers-reduced-motion', 'forced-colors', 'ymir-search-dialog', 'ymir-tool-notes__grid', '@media']) {
  assert(css.includes(token), `v62 CSS bundle missing ${token}`);
}

const runtime = read('static/script/ymir-tool-runtime-v62.js');
for (const token of ['vue v3.5.35', 'Element Plus v2.14.1', 'YmirVueAppFactory', 'YmirVueRenderHelpers', 'YmirI18n']) {
  assert(runtime.includes(token), `v62 runtime bundle missing ${token}`);
}
const loader = read('static/script/ymir-vue-loader.js');
assert(loader.includes(`var VERSION = '${VERSION}'`), 'Loader version is not v62');
assert(loader.includes('Promise.all([loadScript(MANIFEST_SCRIPT), loadScript(RUNTIME_SCRIPT)])'), 'Loader does not parallelize manifest/runtime loading');
const shell = read('static/script/ymir-tool-shell-v62.js');
assert(shell.includes(`var VERSION = '${VERSION}'`), 'Shell version is not v62');
assert(shell.includes('aria-modal'), 'Search dialog semantics missing');
assert(shell.includes('ymir-tool-favorites-v1'), 'Favorite storage missing');

const vercel = JSON.parse(read('vercel.json'));
assert(!('rewrites' in vercel), 'vercel.json must not route all HTML through a nonce function');
assert(!JSON.stringify(vercel).includes('/api/csp-html'), 'vercel.json still references csp-html');
assert(!JSON.stringify(vercel).includes('no-store'), 'vercel.json still disables HTML caching');
assert(JSON.stringify(vercel).includes('Content-Security-Policy'), 'vercel.json missing static CSP');
const vercelText = JSON.stringify(vercel);
assert(!/script-src[^;]*unsafe-inline/.test(vercelText), 'Executable inline scripts remain allowed by CSP');
assert(/style-src-attr[^;]*unsafe-inline/.test(vercelText), 'Dynamic component style attributes are not explicitly scoped in CSP');
assert(JSON.stringify(vercel).includes('stale-while-revalidate=86400'), 'vercel.json missing CDN HTML cache policy');
assert(!fs.existsSync(path.join(root, 'api/csp-html.js')), 'Obsolete api/csp-html.js still exists');
assert(!fs.existsSync(path.join(root, 'netlify/edge-functions/csp-nonce.ts')), 'Obsolete Netlify nonce edge function still exists');
assert(!fs.existsSync(path.join(root, 'static/script/jquery-1.11.3.min.js')), 'Misnamed duplicate jQuery file still exists');
assert(!fs.existsSync(path.join(root, 'static/style/ymir-tool-page-v51.css')), 'Unreferenced v51 tool CSS still exists');

const genericPhrases = [
  '本专题强调的是可复核的操作方法，而不是承诺在线页面能替代专业系统',
  '这类指南面向开发者、站长、运营、学生和办公用户',
  'Use a small sample first, then process the full non-sensitive input.',
  'Use this tool for quick conversion, formatting, generation, or text cleanup tasks.',
  '并说明输入输出边界、常见错误和结果复核方法',
  'Review inputs, outputs, limitations, and common mistakes before reusing the result'
];
const allHtml = htmlFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
for (const phrase of genericPhrases) assert(!allHtml.includes(phrase), `Repeated filler phrase remains: ${phrase}`);

for (const file of walk(path.join(root, 'static/script'), '.js')) {
  try { execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' }); }
  catch { errors.push(`${path.relative(root, file)}: JavaScript syntax check failed`); }
}
for (const file of walk(path.join(root, 'api'), '.js')) {
  try { execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' }); }
  catch { errors.push(`${path.relative(root, file)}: JavaScript syntax check failed`); }
}

if (errors.length) {
  console.error(`Phase 5 validation failed with ${errors.length} issue(s):`);
  for (const error of errors.slice(0, 100)) console.error(`- ${error}`);
  if (errors.length > 100) console.error(`- ...and ${errors.length - 100} more`);
  process.exit(1);
}

console.log(`Phase 5 validation passed: ${htmlFiles.length} HTML files, ${toolCount} tools, ${toolNotes} upgraded additional tools, static CSP/cache, bundled runtime, and homepage-only AdSense runtime.`);
