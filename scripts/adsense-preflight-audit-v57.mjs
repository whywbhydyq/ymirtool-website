import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ADSENSE_META = '<meta name="google-adsense-account" content="ca-pub-1653188471819736">';
const ADSENSE_SCRIPT_URL = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1653188471819736';
const ADS_TXT = 'google.com, pub-1653188471819736, DIRECT, f08c47fec0942fa0';
const reportPath = path.join(root, 'V57_ADSENSE_SEO_PREFLIGHT_AUDIT_REPORT.json');

const policy = JSON.parse(fs.readFileSync(path.join(root, 'static/script/ymir-adsense-page-policy.json'), 'utf8'));
const staticRegistry = JSON.parse(fs.readFileSync(path.join(root, 'static/script/ymir-static-pages-registry.json'), 'utf8'));
const approvedToolSlugs = new Set(policy.approvedToolSlugs || []);
const adEligibleStaticPageIds = new Set(policy.adEligibleStaticPageIds || []);
const neverAdPagePaths = new Set(policy.neverAdPagePaths || []);

function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }

function collectHtml(dir = root) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.next') continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectHtml(abs));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(path.relative(root, abs).replace(/\\/g, '/'));
  }
  return files;
}

function expectedAdScript(rel) {
  if (neverAdPagePaths.has(rel)) return false;
  const toolMatch = rel.match(/^([^/]+)\/index\.html$/);
  if (toolMatch) return approvedToolSlugs.has(toolMatch[1]);
  if (rel === 'index.html') return true;
  const page = (staticRegistry.pages || []).find((item) => item.path === rel);
  return !!page && adEligibleStaticPageIds.has(page.id) && !neverAdPagePaths.has(page.path);
}

const htmlFiles = collectHtml();
const issues = [];
const stats = {
  htmlFiles: htmlFiles.length,
  adsenseMetaOk: 0,
  adsenseScriptPolicyOk: 0,
  viewportOk: 0,
  canonicalOfficial: 0,
  nonApprovedToolsNoindex: 0
};

for (const rel of htmlFiles) {
  const html = read(rel);
  const metaCount = (html.match(/<meta\b(?=[^>]*\bname=["']google-adsense-account["'])(?=[^>]*ca-pub-1653188471819736)[^>]*>/gi) || []).length;
  const scriptCount = (html.match(/<script\b(?=[^>]*pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=ca-pub-1653188471819736)[^>]*><\/script>/gi) || []).length;
  const shouldHaveScript = expectedAdScript(rel);
  const badViewport = /user-scalable\s*=\s*no|maximum-scale\s*=\s*1(?:\.0)?/i.test(html);
  const canonical = (html.match(/<link\b(?=[^>]*rel=["']canonical["'])(?=[^>]*href=["']([^"']+)["'])[^>]*>/i) || [])[1] || '';
  const toolMatch = rel.match(/^([^/]+)\/index\.html$/);

  if (metaCount === 1) stats.adsenseMetaOk += 1;
  else issues.push({ page: rel, issue: 'adsense-meta-count', count: metaCount });

  if (shouldHaveScript && scriptCount === 1) stats.adsenseScriptPolicyOk += 1;
  else if (!shouldHaveScript && scriptCount === 0) stats.adsenseScriptPolicyOk += 1;
  else issues.push({ page: rel, issue: 'adsense-script-policy-mismatch', expected: shouldHaveScript, count: scriptCount });

  if (!badViewport) stats.viewportOk += 1;
  else issues.push({ page: rel, issue: 'viewport-disables-zoom' });

  if (canonical.startsWith('https://ymirtool.com')) stats.canonicalOfficial += 1;
  else issues.push({ page: rel, issue: 'canonical-not-official', canonical });

  if (toolMatch && !approvedToolSlugs.has(toolMatch[1])) {
    if (/<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*noindex,\s*follow)[^>]*>/i.test(html)) {
      stats.nonApprovedToolsNoindex += 1;
    } else {
      issues.push({ page: rel, issue: 'thin-tool-missing-noindex' });
    }
  }

  for (const term of ['MD5 ' + '加密', 'Base64 ' + '加密', 'SHA ' + '加密', 'Safe use ' + 'note', '安全使用' + '提示', 'ymir-' + 'privacy' + '-note']) {
    if (html.includes(term)) issues.push({ page: rel, issue: 'forbidden-term', term });
  }
}

const textFiles = [];
function collectText(dir = root) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.next') continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) collectText(abs);
    else if (entry.isFile() && /\.(html|json|txt|xml)$/i.test(entry.name) && !/^V\d+_/.test(entry.name)) {
      textFiles.push(path.relative(root, abs).replace(/\\/g, '/'));
    }
  }
}
collectText();

for (const rel of textFiles) {
  const text = read(rel);
  if (/vercel\.app|localhost|127\.0\.0\.1/i.test(text)) issues.push({ page: rel, issue: 'test-or-old-domain-reference' });
  if (/<meta\b(?=[^>]*\bname=["']keywords["'])/i.test(text)) issues.push({ page: rel, issue: 'meta-keywords' });
}

const sitemap = exists('sitemap.xml') ? read('sitemap.xml') : '';
for (const rel of htmlFiles) {
  const toolMatch = rel.match(/^([^/]+)\/index\.html$/);
  if (toolMatch && !approvedToolSlugs.has(toolMatch[1]) && sitemap.includes(`https://ymirtool.com/${toolMatch[1]}/`)) {
    issues.push({ page: 'sitemap.xml', issue: 'non-approved-tool-in-sitemap', tool: toolMatch[1] });
  }
}

const adsTxtOk = exists('ads.txt') && read('ads.txt').trim() === ADS_TXT;
const robotsOk = exists('robots.txt') && /Allow:\s*\//i.test(read('robots.txt')) && /Sitemap:\s*https:\/\/ymirtool\.com\/sitemap\.xml/i.test(read('robots.txt'));
const sitemapOk = exists('sitemap.xml') && !/vercel\.app|localhost|127\.0\.0\.1/i.test(sitemap);
const policyPages = ['about.html', 'privacy.html', 'terms.html', 'disclaimer.html', 'contact.html'];
const missingPolicyPages = policyPages.filter((rel) => !exists(rel));
if (!adsTxtOk) issues.push({ page: 'ads.txt', issue: 'ads-txt-missing-or-mismatch' });
if (!robotsOk) issues.push({ page: 'robots.txt', issue: 'robots-not-ok' });
if (!sitemapOk) issues.push({ page: 'sitemap.xml', issue: 'sitemap-not-ok' });
for (const rel of missingPolicyPages) issues.push({ page: rel, issue: 'missing-policy-page' });

const report = {
  version: policy.version,
  checkedAt: new Date().toISOString(),
  adsenseMeta: ADSENSE_META,
  adsenseScriptUrl: ADSENSE_SCRIPT_URL,
  approvedToolSlugs: Array.from(approvedToolSlugs),
  stats,
  adsTxtOk,
  robotsOk,
  sitemapOk,
  policyPages,
  missingPolicyPages,
  pass: issues.length === 0,
  issues
};

fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exitCode = report.pass ? 0 : 1;
