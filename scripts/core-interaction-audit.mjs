import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const dashboard = read('static/script/ymir-home-dashboard.js');
const toolsApp = read('static/script/ymir-vue-tools-app.js');
const engines = read('static/script/ymir-vue-core-tool-engines.js');
const loader = read('static/script/ymir-vue-loader.js');
const manifest = JSON.parse(read('static/script/ymir-vue-tool-manifest.json'));

const checks = [
  ['home.safeClosestDelegation', dashboard.includes('function safeClosest') && !dashboard.includes("var quickTab = e.target.closest")],
  ['home.searchAriaExpanded', dashboard.includes("input.setAttribute('aria-expanded'") && dashboard.includes('aria-selected=')],
  ['home.clearFavoritesWhenFavoritesTabActive', dashboard.includes("activeQuickTab() === 'favorites'") && dashboard.includes('setFavoriteIds([])')],
  ['home.recentRowsHydrateFromManifest', dashboard.includes('var current = toolsById[stored.id] || stored')],
  ['home.urlSafeBase64PreviewDecode', dashboard.includes("replace(/-/g, '+').replace(/_/g, '/')")],
  ['core.clearDoesNotRerunStartup', (() => { const m = toolsApp.match(/clearAll:\s*function\s*\(\)\s*\{([\s\S]*?)\n    \},\n    loadSample:/); return !!m && m[1].includes('Cleared.') && !m[1].includes('cfg.startup'); })()],
  ['core.sampleButtonGatedByRealSample', toolsApp.includes('utilityActions = []') && toolsApp.includes('this.cfg.sample || this.cfg.secondarySample || this.cfg.patternSample || this.cfg.calcSample')],
  ['core.regexRequiresPattern', toolsApp.includes('Enter a regular expression first')],
  ['engine.urlSafeBase64Decode', engines.includes("replace(/-/g, '+').replace(/_/g, '/')") && engines.includes('if (pad) clean +=')],
  ['engine.postfixPercentSupport', engines.includes('function parseFactor()') && engines.includes('value = value / 100')],
  ['loader.usesRuntimeManifest', loader.includes('window.YmirToolsManifest') && !loader.includes('APP_BY_TOOL =')],
  ['manifest.coreToolsPresent', ['json','base64','md5','urlencode','formatjs','unixtime','textdiff','regex','calculator','password','guid','txtcount'].every((id) => manifest.tools.some((t) => (t.id || t.slug) === id))]
];

const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);
const report = {
  version: manifest.version,
  checkedAt: new Date().toISOString(),
  checks: Object.fromEntries(checks),
  failed,
  pass: failed.length === 0
};
console.log(JSON.stringify(report, null, 2));
if (failed.length) process.exit(1);
