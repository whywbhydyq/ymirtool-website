import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const toolManifestPath = path.join(root, 'static/script/ymir-vue-tool-manifest.json');
const staticRegistryPath = path.join(root, 'static/script/ymir-static-pages-registry.json');
const toolsManifestJsPath = path.join(root, 'static/script/ymir-tools-manifest.js');
const staticRegistryJsPath = path.join(root, 'static/script/ymir-static-pages-registry.js');
const sitemapPath = path.join(root, 'sitemap.xml');
const sitemapGuidesPath = path.join(root, 'sitemap-guides.xml');
const sitemapPolicyPath = path.join(root, 'sitemap-policy.xml');
const indexPath = path.join(root, 'index.html');

const toolManifest = JSON.parse(fs.readFileSync(toolManifestPath, 'utf8'));
const staticRegistry = JSON.parse(fs.readFileSync(staticRegistryPath, 'utf8'));
const origin = toolManifest.site?.origin || staticRegistry.site?.origin || 'https://ymirtool.com';
const version = toolManifest.version || staticRegistry.version || '20260531-v55';
const lastmod = toolManifest.site?.lastmod || staticRegistry.site?.lastmod || '2026-05-31';

function xmlEscape(value) {
  return String(value).replace(/[<>&"']/g, (ch) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[ch]));
}

function htmlEscape(value) {
  return String(value ?? '').replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]));
}

function attrEscape(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function jsonLdEscape(value) {
  return String(value ?? '').replace(/<\//g, '<\\/');
}

function urlEntry(loc, changefreq, priority, entryLastmod = lastmod) {
  return `  <url><loc>${xmlEscape(loc)}</loc><lastmod>${xmlEscape(entryLastmod || lastmod)}</lastmod><changefreq>${xmlEscape(changefreq)}</changefreq><priority>${xmlEscape(priority)}</priority></url>`;
}

function writeXmlSitemap(filePath, entries) {
  const sitemap = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    .concat(entries.map((item) => urlEntry(item.loc, item.changefreq, item.priority, item.lastmod)))
    .concat('</urlset>', '')
    .join('\n');
  fs.writeFileSync(filePath, sitemap, 'utf8');
}

function toolById() {
  const map = new Map();
  for (const tool of toolManifest.tools || []) map.set(tool.id || tool.slug, tool);
  return map;
}

function titleFor(tool) {
  return tool.shell?.title || `${tool.titleEn || tool.titleZh || tool.slug} | Ymir Tool`;
}

function descriptionFor(tool) {
  return tool.shell?.description || tool.descriptionEn || tool.descriptionZh || '';
}

function canonicalForTool(tool) {
  return `${origin}${tool.href || `/${tool.slug}/`}`;
}

function schemaNameFor(tool) {
  return tool.shell?.schemaName || titleFor(tool).replace(/\s+[|\-]\s+Ymir Tool\s*$/i, '');
}

function replaceOrInsertHead(html, pattern, replacement, beforePattern = /<\/head>/i) {
  if (pattern.test(html)) return html.replace(pattern, replacement);
  return html.replace(beforePattern, `${replacement}\n</head>`);
}

function replaceMeta(html, name, content) {
  const escaped = attrEscape(content);
  const byName = new RegExp(`<meta\\b(?=[^>]*\\bname=["']${name}["'])[^>]*>`, 'i');
  return replaceOrInsertHead(html, byName, `<meta name="${name}" content="${escaped}"/>`);
}

function replaceMetaProperty(html, property, content) {
  const escaped = attrEscape(content);
  const byProp = new RegExp(`<meta\\b(?=[^>]*\\bproperty=["']${property}["'])[^>]*>`, 'i');
  return replaceOrInsertHead(html, byProp, `<meta property="${property}" content="${escaped}"/>`);
}

function replaceLinkCanonical(html, href) {
  const escaped = attrEscape(href);
  return replaceOrInsertHead(html, /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i, `<link rel="canonical" href="${escaped}"/>`);
}

function syncAssetVersion(html) {
  return html.replace(/\?v=20260531-v\d+/g, `?v=${version}`);
}

function ensureThemeScript(html) {
  const src = `/static/script/ymir-theme.js?v=${version}`;
  const tag = `<script src="${src}"></script>`;
  html = html.replace(/\s*<script\b(?=[^>]*ymir-theme\.js)[^>]*><\/script>\s*/i, '\n');
  if (/<link\b(?=[^>]*rel=["']stylesheet["'])/i.test(html)) {
    return html.replace(/<link\b(?=[^>]*rel=["']stylesheet["'])[^>]*>/i, (match) => `${tag}\n${match}`);
  }
  return html.replace(/<\/head>/i, `${tag}\n</head>`);
}


function ensureToolPageV51Styles(html) {
  const href = `/static/style/ymir-tool-page-v51.css?v=${version}`;
  const aestheticHref = `/static/style/ymir-developer-aesthetics-v55.css?v=${version}`;
  if (html.includes('ymir-tool-page-v51.css')) {
    html = html.replace(/<link\b(?=[^>]*ymir-tool-page-v51\.css)[^>]*>/i, `<link href="${href}" rel="stylesheet"/>`);
  } else {
    const vueCss = new RegExp(`<link\b(?=[^>]*ymir-vue-element\.css)[^>]*>`, 'i');
    if (vueCss.test(html)) html = html.replace(vueCss, (match) => `${match}<link href="${href}" rel="stylesheet"/>`);
    else html = html.replace(/<\/head>/i, `<link href="${href}" rel="stylesheet"/>\n</head>`);
  }
  if (/ymir-developer-aesthetics-v5\d+\.css/.test(html)) {
    return html.replace(/<link\b(?=[^>]*ymir-developer-aesthetics-v5\d+\.css)[^>]*>/i, `<link href="${aestheticHref}" rel="stylesheet"/>`);
  }
  return html.replace(/<link\b(?=[^>]*ymir-tool-page-v51\.css)[^>]*>/i, (match) => `${match}<link href="${aestheticHref}" rel="stylesheet"/>`);
}

function stripToolHero(html) {
  return html.replace(/\s*<section\b[^>]*class=["'][^"']*\bymir-hero\b[^"']*["'][^>]*>[\s\S]*?<\/section>\s*/i, '\n');
}

function ensureToolPageClass(html) {
  return html.replace(/<main\b([^>]*)>/i, (full, attrs) => {
    if (!/\bdata-ymir-tool\s*=/.test(attrs)) return full;
    if (/\bclass\s*=/.test(attrs)) {
      return full.replace(/class\s*=\s*(["'])(.*?)\1/i, (m, q, cls) => {
        const classes = Array.from(new Set(String(cls).split(/\s+/).filter(Boolean).concat(['ymir-tool-page-v51']))).join(' ');
        return `class=${q}${classes}${q}`;
      });
    }
    return `<main class="ymir-page ymir-tool-page-v51"${attrs}>`;
  });
}

function syncToolJsonLd(html, tool, canonical, description) {
  const scriptPattern = /<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/i;
  const match = html.match(scriptPattern);
  const base = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: schemaNameFor(tool),
    url: canonical,
    description,
    applicationCategory: tool.category === 'calculate' ? 'UtilityApplication' : 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    datePublished: '2026-01-01',
    dateModified: lastmod
  };
  if (match) {
    try {
      const parsed = JSON.parse(match[1]);
      const next = { ...parsed, name: schemaNameFor(tool), url: canonical, description, dateModified: lastmod };
      const body = jsonLdEscape(JSON.stringify(next));
      return html.replace(scriptPattern, `<script type="application/ld+json">${body}</script>`);
    } catch {
      const body = jsonLdEscape(JSON.stringify(base));
      return html.replace(scriptPattern, `<script type="application/ld+json">${body}</script>`);
    }
  }
  const body = jsonLdEscape(JSON.stringify(base));
  return html.replace(/<\/head>/i, `<script type="application/ld+json">${body}</script>\n</head>`);
}

function syncStaticJsonLd(html, page) {
  const scriptPattern = /<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/i;
  const schemaType = page.schemaType || (page.group === 'guides' ? 'Article' : 'WebPage');
  const base = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: page.title,
    headline: schemaType === 'Article' ? page.title.replace(/\s+[|\-]\s+Ymir Tool\s*$/i, '') : undefined,
    url: page.url,
    description: page.description,
    dateModified: page.lastmod || lastmod,
    publisher: { '@type': 'Organization', name: 'Ymir Tool', url: origin }
  };
  Object.keys(base).forEach((key) => base[key] === undefined && delete base[key]);
  if (matchExists(html, scriptPattern)) {
    try {
      const parsed = JSON.parse(html.match(scriptPattern)[1]);
      const next = { ...parsed, '@type': schemaType, name: page.title, url: page.url, description: page.description, dateModified: page.lastmod || lastmod };
      if (schemaType === 'Article') next.headline = page.title.replace(/\s+[|\-]\s+Ymir Tool\s*$/i, '');
      const body = jsonLdEscape(JSON.stringify(next));
      return html.replace(scriptPattern, `<script type="application/ld+json">${body}</script>`);
    } catch {
      const body = jsonLdEscape(JSON.stringify(base));
      return html.replace(scriptPattern, `<script type="application/ld+json">${body}</script>`);
    }
  }
  const body = jsonLdEscape(JSON.stringify(base));
  return html.replace(/<\/head>/i, `<script type="application/ld+json">${body}</script>\n</head>`);
}

function matchExists(text, pattern) {
  return pattern.test(text);
}

function ensureMainTool(html, toolId) {
  return html.replace(/<main\b([^>]*)>/i, (full, attrs) => {
    if (/\bdata-ymir-tool\s*=/.test(attrs)) {
      return full.replace(/data-ymir-tool\s*=\s*(["']).*?\1/i, `data-ymir-tool="${attrEscape(toolId)}"`);
    }
    return `<main${attrs} data-ymir-tool="${attrEscape(toolId)}">`;
  });
}

function ensureRootTool(html, toolId) {
  const sectionPattern = /<section\b([^>]*(?:ymir-vue-tool-root|ymir-vue-[a-z0-9-]+-app)[^>]*)>/i;
  return html.replace(sectionPattern, (full, attrs) => {
    if (/\bdata-tool\s*=/.test(attrs)) {
      return full.replace(/data-tool\s*=\s*(["']).*?\1/i, `data-tool="${attrEscape(toolId)}"`);
    }
    return `<section${attrs} data-tool="${attrEscape(toolId)}">`;
  });
}

function syncToolPage(tool) {
  const id = tool.id || tool.slug;
  const relativePath = path.join(tool.slug, 'index.html');
  const pagePath = path.join(root, relativePath);
  if (!fs.existsSync(pagePath)) return { id, updated: false, error: 'missing page' };
  let html = fs.readFileSync(pagePath, 'utf8');
  const title = titleFor(tool);
  const description = descriptionFor(tool);
  const canonical = canonicalForTool(tool);

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${htmlEscape(title)}</title>`);
  html = replaceMeta(html, 'description', description);
  html = replaceLinkCanonical(html, canonical);
  html = replaceMetaProperty(html, 'og:title', title);
  html = replaceMetaProperty(html, 'og:description', description);
  html = replaceMetaProperty(html, 'og:url', canonical);
  html = replaceMeta(html, 'twitter:title', title);
  html = replaceMeta(html, 'twitter:description', description);
  html = syncToolJsonLd(html, tool, canonical, description);
  html = ensureMainTool(html, id);
  html = ensureRootTool(html, id);
  html = ensureToolPageClass(html);
  html = stripToolHero(html);
  html = syncAssetVersion(html);
  html = ensureThemeScript(html);
  html = ensureToolPageV51Styles(html);
  fs.writeFileSync(pagePath, html, 'utf8');
  return { id, updated: true };
}

function syncToolPages() {
  const results = (toolManifest.tools || []).map(syncToolPage);
  return {
    updated: results.filter((item) => item.updated).length,
    missing: results.filter((item) => item.error === 'missing page').map((item) => item.id)
  };
}

function syncStaticPage(page) {
  const pagePath = path.join(root, page.path);
  if (!fs.existsSync(pagePath)) return { id: page.id, updated: false, error: 'missing page' };
  let html = fs.readFileSync(pagePath, 'utf8');
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${htmlEscape(page.title)}</title>`);
  html = replaceMeta(html, 'description', page.description);
  html = replaceLinkCanonical(html, page.url);
  html = replaceMetaProperty(html, 'og:title', page.title);
  html = replaceMetaProperty(html, 'og:description', page.description);
  html = replaceMetaProperty(html, 'og:url', page.url);
  html = replaceMeta(html, 'twitter:title', page.title);
  html = replaceMeta(html, 'twitter:description', page.description);
  html = syncStaticJsonLd(html, page);
  html = syncAssetVersion(html);
  html = ensureThemeScript(html);
  fs.writeFileSync(pagePath, html, 'utf8');
  return { id: page.id, updated: true };
}

function syncStaticPages() {
  const results = (staticRegistry.pages || []).map(syncStaticPage);
  return {
    updated: results.filter((item) => item.updated).length,
    missing: results.filter((item) => item.error === 'missing page').map((item) => item.id)
  };
}

function renderFeaturedCard(tool, index) {
  const id = tool.id || tool.slug;
  const titleZh = tool.titleZh || tool.titleEn || id;
  const titleEn = tool.titleEn || tool.titleZh || id;
  const descZh = tool.descriptionZh || tool.descriptionEn || '';
  const descEn = tool.descriptionEn || tool.descriptionZh || '';
  const keywords = tool.keywords || [titleZh, titleEn, id].join(' ');
  const icon = tool.icon || '›';
  const accent = tool.accent || 'blue';
  const href = tool.href || `/${id}/`;
  return `<article class="ymir-feature-card" data-accent="${attrEscape(accent)}" data-desc-en="${attrEscape(descEn)}" data-desc-zh="${attrEscape(descZh)}" data-home-tool="" data-icon="${attrEscape(icon)}" data-title-en="${attrEscape(titleEn)}" data-title-zh="${attrEscape(titleZh)}" data-tool-href="${attrEscape(href)}" data-tool-id="${attrEscape(id)}" data-tool-keywords="${attrEscape(keywords)}" role="link" tabindex="0">
<span aria-hidden="true" class="ymir-feature-icon">${htmlEscape(icon)}</span>
<span class="ymir-feature-body"><strong><span class="ymir-feature-number">${index + 1}.</span> <span data-card-title="">${htmlEscape(titleZh)}</span></strong><span data-card-desc="">${htmlEscape(descZh)}</span></span>
<button aria-label="收藏 ${attrEscape(titleZh)}" class="ymir-tool-star" data-star-tool="${attrEscape(id)}" type="button">☆</button>
<a aria-hidden="true" class="ymir-tool-open" data-i18n-en="Open" data-i18n-zh="打开" href="${attrEscape(href)}" tabindex="-1">打开</a>
</article>`;
}

function renderDirectoryTab(category, index) {
  const active = index === 0 ? ' is-active' : '';
  const labelZh = category.labelZh || category.labelEn || category.id;
  const labelEn = category.labelEn || category.labelZh || category.id;
  return `<button class="ymir-directory-tab${active}" data-directory-tab="${attrEscape(category.id)}" data-label-en="${attrEscape(labelEn)}" data-label-zh="${attrEscape(labelZh)}" type="button">${htmlEscape(labelZh)}</button>`;
}

function renderDirectoryLink(tool, index) {
  const id = tool.id || tool.slug;
  const titleZh = tool.titleZh || tool.titleEn || id;
  const titleEn = tool.titleEn || tool.titleZh || id;
  const href = tool.href || `/${id}/`;
  const keywords = tool.keywords || [titleZh, titleEn, id].join(' ');
  const extra = index >= 8 ? ' is-extra' : '';
  return `<a class="ymir-directory-link${extra}" data-directory-tool="" data-title-en="${attrEscape(titleEn)}" data-title-zh="${attrEscape(titleZh)}" data-tool-href="${attrEscape(href)}" data-tool-id="${attrEscape(id)}" data-tool-keywords="${attrEscape(keywords)}" href="${attrEscape(href)}"><span aria-hidden="true" class="ymir-directory-icon">${htmlEscape(tool.icon || '›')}</span><span data-directory-title="">${htmlEscape(titleZh)}</span><span aria-hidden="true" class="ymir-directory-arrow">›</span></a>`;
}

function renderDirectoryPanel(category, index, byId) {
  const active = index === 0 ? ' is-active' : '';
  const tools = (category.tools || []).map((id) => byId.get(id)).filter(Boolean);
  const links = tools.map(renderDirectoryLink).join('');
  const showMore = tools.length > 8
    ? `<button class="ymir-show-more" data-label-less-en="Show less" data-label-less-zh="收起" data-label-more-en="Show more" data-label-more-zh="显示更多" data-show-more="${attrEscape(category.id)}" type="button">显示更多</button>`
    : '';
  return `<div class="ymir-directory-list${active}" data-directory-panel="${attrEscape(category.id)}">${links}${showMore}</div>`;
}

function syncIndexFallback() {
  if (!fs.existsSync(indexPath)) return { updated: false, reason: 'index.html not found' };
  const byId = toolById();
  const featuredTools = (toolManifest.featured || []).map((id) => byId.get(id)).filter(Boolean).slice(0, 12);
  const categories = (toolManifest.categories || []).filter((category) => Array.isArray(category.tools) && category.tools.some((id) => byId.has(id)));
  let index = fs.readFileSync(indexPath, 'utf8');

  const featuredHtml = featuredTools.map(renderFeaturedCard).join('');
  const featureRegex = /(<div class="ymir-feature-grid">)[\s\S]*?(<\/div>\s*<\/section>\s*<section[^>]*class="ymir-container ymir-home-lower")/;
  if (!featureRegex.test(index)) throw new Error('Unable to locate homepage featured fallback block');
  index = index.replace(featureRegex, `$1\n${featuredHtml}\n$2`);

  const directoryHtml = `<div class="ymir-directory-tabs" role="tablist">${categories.map(renderDirectoryTab).join('')}</div>\n${categories.map((category, i) => renderDirectoryPanel(category, i, byId)).join('\n')}`;
  const directoryRegex = /(<div class="ymir-directory-panel" id="toolDirectory">[\s\S]*?<h2[^>]*>[\s\S]*?<\/h2>\s*)[\s\S]*?(\s*<\/div>\s*<div class="ymir-pattern-panel">)/;
  if (!directoryRegex.test(index)) throw new Error('Unable to locate homepage directory fallback block');
  index = index.replace(directoryRegex, `$1${directoryHtml}$2`);
  index = syncAssetVersion(index);
  index = ensureThemeScript(index);

  fs.writeFileSync(indexPath, index, 'utf8');
  return { updated: true, featured: featuredTools.length, categories: categories.length };
}

function staticEntriesFor(sitemapName) {
  return (staticRegistry.pages || [])
    .filter((page) => Array.isArray(page.sitemaps) && page.sitemaps.includes(sitemapName))
    .map((page) => ({
      loc: page.url,
      changefreq: page.changefreq || 'monthly',
      priority: page.priority || '0.5',
      lastmod: page.lastmod || lastmod
    }));
}

const toolPageResult = syncToolPages();
const staticPageResult = syncStaticPages();
const indexResult = syncIndexFallback();

const toolUrls = (toolManifest.tools || []).map((tool) => ({
  loc: canonicalForTool(tool),
  changefreq: 'weekly',
  priority: tool.featured ? '0.85' : '0.8',
  lastmod: tool.shell?.lastmod || lastmod
}));

writeXmlSitemap(sitemapPath, staticEntriesFor('main').concat(toolUrls));
writeXmlSitemap(sitemapGuidesPath, staticEntriesFor('guides'));
writeXmlSitemap(sitemapPolicyPath, staticEntriesFor('policy'));

const toolsJs = `(function () {\n  'use strict';\n  window.YmirToolsManifest = ${JSON.stringify(toolManifest, null, 2)};\n})();\n`;
const staticJs = `(function () {\n  'use strict';\n  window.YmirStaticPagesRegistry = ${JSON.stringify(staticRegistry, null, 2)};\n})();\n`;
fs.writeFileSync(toolsManifestJsPath, toolsJs, 'utf8');
fs.writeFileSync(staticRegistryJsPath, staticJs, 'utf8');

console.log(JSON.stringify({
  version,
  tools: toolManifest.tools?.length || 0,
  staticPages: staticRegistry.pages?.length || 0,
  sitemapUrls: staticEntriesFor('main').length + toolUrls.length,
  guideSitemapUrls: staticEntriesFor('guides').length,
  policySitemapUrls: staticEntriesFor('policy').length,
  toolPages: toolPageResult,
  staticPagesSynced: staticPageResult,
  indexFallback: indexResult
}));
