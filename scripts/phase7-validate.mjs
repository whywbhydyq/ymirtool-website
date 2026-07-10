import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const full = path.join(dir, entry.name);
  if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.seo-cache') return [];
  return entry.isDirectory() ? walk(full) : [full];
});
const count = (text, needle) => text.split(needle).length - 1;

const manifest = JSON.parse(read('static/script/ymir-vue-tool-manifest.json'));
assert(manifest.toolCount === 150, 'Manifest must preserve 150 tools');
assert(Object.keys(manifest.appByTool || {}).length === 150, 'appByTool must map 150 tools');

const htmlFiles = walk(root).filter(file => file.endsWith('.html'));
assert(htmlFiles.length === 217, `Expected 217 HTML files, found ${htmlFiles.length}`);
let toolPages = 0;
let toolFirstPages = 0;
for (const file of htmlFiles) {
  const rel = path.relative(root, file).replaceAll('\\', '/');
  const html = fs.readFileSync(file, 'utf8');
  const slugMatch = html.match(/data-ymir-tool=["']([^"']+)["']/);
  const isTool = Boolean(slugMatch && html.includes('ymir-vue-tool-root'));
  if (!isTool) continue;
  toolPages++;
  const slug = slugMatch[1];
  const app = manifest.appByTool[slug];
  assert(app, `${rel}: missing app mapping for ${slug}`);
  assert(html.includes('data-tool-first="true"'), `${rel}: tool-first marker missing`);
  assert(count(html, '/static/style/ymir-tool-bundle-v64.css') === 1, `${rel}: v64 CSS must appear once`);
  assert(!html.includes('/static/style/ymir-tool-bundle-v63.css'), `${rel}: stale v63 CSS remains`);

  const mainStart = html.search(/<main\b[^>]*data-ymir-tool=/i);
  const mainEnd = html.indexOf('</main>', mainStart);
  assert(mainStart >= 0 && mainEnd > mainStart, `${rel}: tool main element missing`);
  const mainHtml = html.slice(mainStart, mainEnd);
  const firstSection = mainHtml.match(/<section\b[^>]*class="([^"]*)"[^>]*>/i);
  assert(firstSection && firstSection[1].split(/\s+/).includes('ymir-vue-tool-root'), `${rel}: first content panel is not the tool workbench`);
  const rootIndex = mainHtml.indexOf('ymir-vue-tool-root');
  const leadIndex = mainHtml.indexOf('ymir-static-tool-lead');
  assert(rootIndex >= 0 && leadIndex > rootIndex, `${rel}: descriptive panel still precedes the tool`);
  const noscriptIndex = mainHtml.indexOf('<noscript');
  if (noscriptIndex >= 0) assert(leadIndex > noscriptIndex, `${rel}: descriptive panel should follow the no-JS notice`);
  const fallbackIndex = mainHtml.indexOf('ymir-static-tool-fallback');
  if (fallbackIndex >= 0) assert(leadIndex > fallbackIndex, `${rel}: descriptive panel should follow the static fallback`);
  toolFirstPages++;
}
assert(toolPages === 150, `Expected 150 tool pages, found ${toolPages}`);
assert(toolFirstPages === 150, `Expected 150 tool-first pages, found ${toolFirstPages}`);

const css = read('static/style/ymir-tool-bundle-v64.css');
assert(css.length > 250000, 'v64 CSS bundle appears incomplete');
assert(css.includes('Ymir Tool v64 tool-first page layout'), 'v64 tool-first CSS marker missing');
assert(css.includes('main[data-ymir-tool][data-tool-first="true"] > .ymir-vue-tool-root'), 'Tool workbench first-panel rule missing');
assert((css.match(/\{/g) || []).length === (css.match(/\}/g) || []).length, 'v64 CSS braces are unbalanced');
assert(!fs.existsSync(path.join(root, 'static/style/ymir-tool-bundle-v63.css')), 'Obsolete v63 CSS bundle still exists');

const requiredJs = [
  'static/script/ymir-tools-manifest.js',
  'static/script/ymir-tool-runtime-v63.js',
  'static/script/ymir-tool-core-runtime-v63.js',
  'static/script/ymir-tool-shell-v63.js',
  'static/script/ymir-tool-watchdog-v63.js',
];
for (const rel of requiredJs) {
  assert(fs.existsSync(path.join(root, rel)), `Missing runtime asset: ${rel}`);
  execFileSync(process.execPath, ['--check', path.join(root, rel)], { stdio: 'pipe' });
}
for (const app of new Set(Object.values(manifest.appByTool))) {
  const rel = app.replace(/^\//, '');
  assert(fs.existsSync(path.join(root, rel)), `Missing app asset: ${rel}`);
  execFileSync(process.execPath, ['--check', path.join(root, rel)], { stdio: 'pipe' });
}

console.log(`Phase 7 validation passed: ${htmlFiles.length} HTML files, ${toolPages} tool pages, and every tool workbench is the first content panel.`);
