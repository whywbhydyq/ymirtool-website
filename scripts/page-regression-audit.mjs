import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const toolManifest = JSON.parse(fs.readFileSync(path.join(root, 'static/script/ymir-vue-tool-manifest.json'), 'utf8'));
const staticRegistry = JSON.parse(fs.readFileSync(path.join(root, 'static/script/ymir-static-pages-registry.json'), 'utf8'));
const version = toolManifest.version;
const origin = toolManifest.site?.origin || 'https://ymirtool.com';

const riskPatterns = [
  'eval' + '(atob',
  'runs in your ' + 'browser',
  'Local browser ' + 'processing',
  'Browser local ' + 'processing',
  'Local ' + 'processing',
  'does not require server ' + 'upload',
  'no server ' + 'upload',
  'without ' + 'uploading',
  'No data is ' + 'uploaded',
  'Runs ' + 'locally',
  'browser' + '-side',
  'Vue 3 ' + 'UI',
  'Vue 3 + Element ' + 'Plus',
  '本地' + '优先',
  '浏览器中' + '处理'
];

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function htmlAttr(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch]));
}

function extract(regex, text) {
  const match = text.match(regex);
  return match ? match[1] : '';
}

function getJsonLd(html) {
  const match = html.match(/<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/i);
  if (!match) return null;
  try { return JSON.parse(match[1]); } catch { return { parseError: true }; }
}

function canonicalForTool(tool) {
  return tool.shell?.canonical || `${origin}${tool.href || `/${tool.slug}/`}`;
}

function toolTitle(tool) {
  return tool.shell?.title || `${tool.titleEn || tool.titleZh || tool.slug} | Ymir Tool`;
}

function toolDescription(tool) {
  return tool.shell?.description || tool.descriptionEn || tool.descriptionZh || '';
}

function collectHtmlFiles(dir = root) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.next') continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectHtmlFiles(abs));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(path.relative(root, abs).replace(/\\/g, '/'));
  }
  return files;
}

function localAssetMissing() {
  const missing = [];
  for (const rel of collectHtmlFiles()) {
    const html = read(rel);
    const attrPattern = /(?:href|src)=["']([^"']+)["']/gi;
    let match;
    while ((match = attrPattern.exec(html))) {
      const url = match[1];
      if (!url.startsWith('/')) continue;
      if (url.startsWith('/_vercel/')) continue;
      if (url.startsWith('//')) continue;
      const clean = url.split('?')[0].split('#')[0];
      const fsPath = clean.endsWith('/') ? `${clean.slice(1)}index.html` : clean.slice(1);
      if (!exists(fsPath)) missing.push({ page: rel, url });
    }
  }
  return missing;
}

const results = {
  version,
  checkedAt: new Date().toISOString(),
  counts: {
    tools: toolManifest.tools.length,
    appByTool: Object.keys(toolManifest.appByTool || {}).length,
    featured: (toolManifest.featured || []).length,
    categories: (toolManifest.categories || []).length,
    staticPages: (staticRegistry.pages || []).length,
    htmlFiles: collectHtmlFiles().length
  },
  homepage: {},
  loader: {},
  toolPages: { checked: 0, mismatches: [] },
  staticPages: { checked: 0, mismatches: [] },
  sitemaps: {},
  assets: {},
  risks: {},
  samples: {},
  pass: false
};

const index = read('index.html');
const featuredIds = [...index.matchAll(/data-home-tool[^>]*data-tool-id=["']([^"']+)["']/g)].map((m) => m[1]);
const directoryIds = [...index.matchAll(/data-directory-tool[^>]*data-tool-id=["']([^"']+)["']/g)].map((m) => m[1]);
results.homepage = {
  hasSearch: /id=["']toolSearch["']/.test(index),
  hasCommandPanel: /id=["']ymirCommandPanel["']/.test(index),
  hasManifestScript: /ymir-tools-manifest\.js\?v=20260531-v55/.test(index),
  hasDashboardScript: /ymir-home-dashboard\.js\?v=20260531-v55/.test(index),
  featuredCount: featuredIds.length,
  directoryCount: directoryIds.length,
  featuredMatchesManifest: JSON.stringify(featuredIds) === JSON.stringify(toolManifest.featured || []),
  directoryIdsUnique: new Set(directoryIds).size === directoryIds.length,
  directoryCoversManifest: toolManifest.tools.every((tool) => directoryIds.includes(tool.id || tool.slug))
};

const loader = read('static/script/ymir-vue-loader.js');
results.loader = {
  versionConstant: /VERSION\s*=\s*["']20260531-v55["']/.test(loader),
  loadsRuntimeManifest: /ymir-tools-manifest\.js/.test(loader),
  noHardcodedAppByTool: !/APP_BY_TOOL\s*=/.test(loader),
  exposesApi: /window\.YmirVueToolLoader/.test(loader)
};

for (const tool of toolManifest.tools) {
  const id = tool.id || tool.slug;
  const rel = `${tool.slug}/index.html`;
  if (!exists(rel)) {
    results.toolPages.mismatches.push({ id, issue: 'missing-page', rel });
    continue;
  }
  results.toolPages.checked += 1;
  const html = read(rel);
  const title = extract(/<title>([\s\S]*?)<\/title>/i, html);
  const description = extract(/<meta\b(?=[^>]*name=["']description["'])(?=[^>]*content=["']([^"']*)["'])[^>]*>/i, html);
  const canonical = extract(/<link\b(?=[^>]*rel=["']canonical["'])(?=[^>]*href=["']([^"']*)["'])[^>]*>/i, html);
  const mainTool = extract(/<main\b(?=[^>]*data-ymir-tool=["']([^"']+)["'])[^>]*>/i, html);
  const rootTool = extract(/<section\b(?=[^>]*class=["'][^"']*ymir-vue-tool-root[^"']*["'])(?=[^>]*data-tool=["']([^"']+)["'])[^>]*>/i, html);
  const jsonLd = getJsonLd(html);
  const expectedTitle = htmlAttr(toolTitle(tool));
  const expectedDescription = toolDescription(tool);
  const expectedCanonical = canonicalForTool(tool);
  const checks = [
    ['title', title === expectedTitle, { got: title, expected: expectedTitle }],
    ['description', description === expectedDescription, { got: description, expected: expectedDescription }],
    ['canonical', canonical === expectedCanonical, { got: canonical, expected: expectedCanonical }],
    ['main-data-tool', mainTool === id, { got: mainTool, expected: id }],
    ['root-data-tool', rootTool === id, { got: rootTool, expected: id }],
    ['loader-version', html.includes('ymir-vue-loader.js?v=20260531-v55'), {}],
    ['jsonld-url', jsonLd && jsonLd.url === expectedCanonical, { got: jsonLd && jsonLd.url, expected: expectedCanonical }],
    ['jsonld-description', jsonLd && jsonLd.description === expectedDescription, { got: jsonLd && jsonLd.description, expected: expectedDescription }]
  ];
  for (const [issue, ok, detail] of checks) {
    if (!ok) results.toolPages.mismatches.push({ id, issue, ...detail });
  }
}

for (const page of staticRegistry.pages || []) {
  const rel = page.path;
  if (!exists(rel)) {
    results.staticPages.mismatches.push({ id: page.id, issue: 'missing-page', rel });
    continue;
  }
  results.staticPages.checked += 1;
  const html = read(rel);
  const title = extract(/<title>([\s\S]*?)<\/title>/i, html);
  const description = extract(/<meta\b(?=[^>]*name=["']description["'])(?=[^>]*content=["']([^"']*)["'])[^>]*>/i, html);
  const canonical = extract(/<link\b(?=[^>]*rel=["']canonical["'])(?=[^>]*href=["']([^"']*)["'])[^>]*>/i, html);
  const jsonLd = getJsonLd(html);
  const expectedTitle = htmlAttr(page.title);
  const checks = [
    ['title', title === expectedTitle, { got: title, expected: expectedTitle }],
    ['description', description === page.description, { got: description, expected: page.description }],
    ['canonical', canonical === page.url, { got: canonical, expected: page.url }],
    ['version', html.includes('20260531-v55') || rel === '404.html', {}],
    ['jsonld-url', jsonLd && jsonLd.url === page.url, { got: jsonLd && jsonLd.url, expected: page.url }],
    ['jsonld-description', jsonLd && jsonLd.description === page.description, { got: jsonLd && jsonLd.description, expected: page.description }]
  ];
  for (const [issue, ok, detail] of checks) {
    if (!ok) results.staticPages.mismatches.push({ id: page.id, rel, issue, ...detail });
  }
}

function sitemapUrls(rel) {
  if (!exists(rel)) return [];
  return [...read(rel).matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
}
const mainUrls = sitemapUrls('sitemap.xml');
const guideUrls = sitemapUrls('sitemap-guides.xml');
const policyUrls = sitemapUrls('sitemap-policy.xml');
const toolUrls = toolManifest.tools.map((tool) => canonicalForTool(tool));
const mainRegistryUrls = (staticRegistry.pages || []).filter((p) => (p.sitemaps || []).includes('main')).map((p) => p.url);
const guideRegistryUrls = (staticRegistry.pages || []).filter((p) => (p.sitemaps || []).includes('guides')).map((p) => p.url);
const policyRegistryUrls = (staticRegistry.pages || []).filter((p) => (p.sitemaps || []).includes('policy')).map((p) => p.url);
results.sitemaps = {
  mainCount: mainUrls.length,
  guideCount: guideUrls.length,
  policyCount: policyUrls.length,
  mainCoversTools: toolUrls.every((url) => mainUrls.includes(url)),
  mainCoversRegistry: mainRegistryUrls.every((url) => mainUrls.includes(url)),
  guidesMatchRegistry: JSON.stringify(guideUrls.sort()) === JSON.stringify(guideRegistryUrls.sort()),
  policyMatchRegistry: JSON.stringify(policyUrls.sort()) === JSON.stringify(policyRegistryUrls.sort())
};

const missingAssets = localAssetMissing();
results.assets = { missing: missingAssets.length, sample: missingAssets.slice(0, 20) };

const allTextFiles = [];
function collectTextFiles(dir = root) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.next') continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) collectTextFiles(abs);
    else if (entry.isFile() && /\.(html|js|mjs|json|txt|md|css|xml)$/i.test(entry.name) && !/^V\d+_/.test(entry.name)) {
      allTextFiles.push(path.relative(root, abs).replace(/\\/g, '/'));
    }
  }
}
collectTextFiles();
for (const pattern of riskPatterns) {
  const matches = [];
  for (const rel of allTextFiles) {
    const text = read(rel);
    if (text.includes(pattern)) matches.push(rel);
  }
  results.risks[pattern] = { count: matches.length, files: matches.slice(0, 20) };
}

results.samples = {
  homepage: ['/', '/json/', '/base64/', '/textdiff/', '/guides.html', '/privacy.html', '/404.html'],
  coreTools: ['json', 'base64', 'md5', 'urlencode', 'formatjs', 'unixtime', 'textdiff', 'regex', 'calculator', 'password'],
  staticPages: ['guides', 'base64-guide', 'privacy', 'contact', '404']
};

const homepagePass = Object.values(results.homepage).every(Boolean);
const loaderPass = Object.values(results.loader).every(Boolean);
const sitemapPass = Object.values(results.sitemaps).every(Boolean);
const riskPass = Object.values(results.risks).every((item) => item.count === 0);
results.pass = homepagePass && loaderPass && sitemapPass && results.toolPages.mismatches.length === 0 && results.staticPages.mismatches.length === 0 && results.assets.missing === 0 && riskPass;

console.log(JSON.stringify(results, null, 2));
