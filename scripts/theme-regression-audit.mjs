import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const version = '20260531-v55';
const cssFile = 'ymir-developer-aesthetics-v55.css';
const htmlFiles = [];

function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (item.name === '.git' || item.name === 'node_modules' || item.name === '.next') continue;
    const p = path.join(dir, item.name);
    if (item.isDirectory()) walk(p);
    else if (item.isFile() && item.name.endsWith('.html')) htmlFiles.push(p);
  }
}
walk(root);

function rel(p) { return path.relative(root, p).replace(/\\/g, '/'); }

const themeScript = fs.readFileSync(path.join(root, 'static/script/ymir-theme.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'static/style', cssFile), 'utf8');
const sync = fs.readFileSync(path.join(root, 'scripts/sync-tools-manifest-derived-files.mjs'), 'utf8');

const pages = htmlFiles.map((p) => {
  const html = fs.readFileSync(p, 'utf8');
  const themeIndex = html.indexOf('/static/script/ymir-theme.js?v=' + version);
  const cssIndex = html.indexOf('/static/style/' + cssFile + '?v=' + version);
  const firstCssIndex = html.search(/<link\b(?=[^>]*rel=["']stylesheet["'])/i);
  return {
    file: rel(p),
    hasThemeScript: themeIndex !== -1,
    hasCss: cssIndex !== -1,
    themeBeforeFirstStylesheet: themeIndex !== -1 && firstCssIndex !== -1 && themeIndex < firstCssIndex,
    hasOldAestheticCss: /ymir-developer-aesthetics-v5[0-4]\.css/.test(html),
    hasOldVersion: /20260531-v5[0-4]/.test(html)
  };
});

const failures = [];
for (const page of pages) {
  if (!page.hasThemeScript) failures.push({ type: 'missing-theme-script', file: page.file });
  if (!page.hasCss) failures.push({ type: 'missing-v55-css', file: page.file });
  if (!page.themeBeforeFirstStylesheet) failures.push({ type: 'theme-script-after-css', file: page.file });
  if (page.hasOldAestheticCss) failures.push({ type: 'old-aesthetic-css', file: page.file });
  if (page.hasOldVersion) failures.push({ type: 'old-version', file: page.file });
}

const scriptChecks = {
  versionConstant: themeScript.includes("VERSION = '" + version + "'") || themeScript.includes('VERSION = "' + version + '"'),
  dataThemeReady: /data-theme-ready/.test(themeScript),
  metaThemeColor: /theme-color/.test(themeScript),
  colorSchemeSync: /style\.colorScheme/.test(themeScript),
  multipleToggles: /querySelectorAll\('\[data-ymir-theme-toggle\]'\)/.test(themeScript),
  localizedAria: /ariaFor\(/.test(themeScript),
  setPreferenceApi: /setPreference/.test(themeScript),
  noDocumentWrite: !/document\.write/.test(themeScript)
};
for (const [key, ok] of Object.entries(scriptChecks)) if (!ok) failures.push({ type: 'theme-script-check', check: key });

const cssChecks = {
  hasLightColorScheme: /html\[data-theme="light"\]\s*\{\s*color-scheme:\s*light/.test(css),
  hasDarkColorScheme: /html\[data-theme="dark"\]\s*\{\s*color-scheme:\s*dark/.test(css),
  hasDarkPoppers: /\.el-select__popper/.test(css) && /\.el-dropdown__popper/.test(css),
  hasDarkTables: /\.el-table/.test(css),
  hasDarkFormControls: /\.el-checkbox__inner/.test(css) && /\.el-radio__inner/.test(css),
  hasReducedMotion: /prefers-reduced-motion/.test(css),
  noOldCssComment: !/v54 Developer-Aesthetics/.test(css)
};
for (const [key, ok] of Object.entries(cssChecks)) if (!ok) failures.push({ type: 'theme-css-check', check: key });

const syncChecks = {
  syncUsesV55Css: sync.includes('ymir-developer-aesthetics-v55.css'),
  syncUsesThemeScript: /ymir-theme\.js/.test(sync),
  syncVersionFromManifest: /const version = toolManifest\.version/.test(sync)
};
for (const [key, ok] of Object.entries(syncChecks)) if (!ok) failures.push({ type: 'sync-check', check: key });

const report = {
  version,
  checkedAt: new Date().toISOString(),
  html: { count: pages.length, themeScript: pages.filter((p) => p.hasThemeScript).length, css: pages.filter((p) => p.hasCss).length, themeBeforeCss: pages.filter((p) => p.themeBeforeFirstStylesheet).length },
  scriptChecks,
  cssChecks,
  syncChecks,
  failures,
  pass: failures.length === 0
};
fs.writeFileSync(path.join(root, 'V55_THEME_REGRESSION_AUDIT_REPORT.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
if (!report.pass) process.exit(1);
