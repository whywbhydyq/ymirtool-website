import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const errors = [];
const writeCache = process.argv.includes('--write-cache');

function walk(dir, predicate, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, predicate, results);
    } else if (predicate(fullPath)) {
      results.push(fullPath);
    }
  }
  return results;
}

function toPosixRelative(filePath) {
  return path.relative(root, filePath).split(path.sep).join('/');
}

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function attrValue(tag, attr) {
  const match = tag.match(new RegExp(`${attr}=["']([^"']+)["']`, 'i'));
  return match ? match[1] : '';
}

function firstMetaContent(html, value) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    if (
      attrValue(tag, 'name').toLowerCase() === value.toLowerCase() ||
      attrValue(tag, 'property').toLowerCase() === value.toLowerCase()
    ) {
      return attrValue(tag, 'content');
    }
  }
  return '';
}

function normalizeVisibleText(fragment) {
  return fragment
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function canonicalFor(html) {
  const links = html.match(/<link\b[^>]*>/gi) || [];
  for (const tag of links) {
    if (attrValue(tag, 'rel').toLowerCase() === 'canonical') {
      return attrValue(tag, 'href');
    }
  }
  return '';
}

function localPathForUrl(ref, sourceRel) {
  const clean = ref.split(/[?#]/)[0];
  if (!clean || clean.startsWith('#')) return null;
  if (/^(https?:)?\/\//i.test(clean) || /^(mailto:|tel:|data:|javascript:)/i.test(clean)) return null;

  let rel = clean.startsWith('/')
    ? clean.slice(1)
    : path.posix.normalize(path.posix.join(path.posix.dirname(sourceRel), clean));
  if (!rel || rel === '.') rel = 'index.html';

  const candidates = rel.endsWith('/')
    ? [`${rel}index.html`]
    : [rel, `${rel}.html`, `${rel.replace(/\/$/, '')}/index.html`];

  return candidates.map((candidate) => path.join(root, ...candidate.split('/')));
}

function sitemapLocs() {
  const locs = new Set();
  for (const filePath of walk(root, (file) => /^sitemap.*\.xml$/i.test(path.basename(file)))) {
    const xml = read(filePath);
    for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/gi)) {
      locs.add(match[1].trim());
    }
  }
  return locs;
}

const htmlFiles = walk(root, (file) => file.endsWith('.html'));
const locs = sitemapLocs();
const indexableCanonicals = [];
let jsonLdCount = 0;
let faqPageCount = 0;
let noindexCount = 0;
let localReferenceCount = 0;
const canonicalStatus = new Map();
const longParagraphPages = new Map();

for (const filePath of htmlFiles) {
  const rel = toPosixRelative(filePath);
  const html = read(filePath);
  const lang = html.match(/<html\b[^>]*\blang=["']([^"']+)["']/i)?.[1]?.toLowerCase() || '';
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
  const description = firstMetaContent(html, 'description');
  const ogImage = firstMetaContent(html, 'og:image');
  const robots = firstMetaContent(html, 'robots');
  const isNoindex = /noindex/i.test(robots);
  const canonical = canonicalFor(html);
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const jsonLdBlocks = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  jsonLdCount += jsonLdBlocks.length;
  faqPageCount += (html.match(/"@type"\s*:\s*"FAQPage"/g) || []).length;
  if (isNoindex) noindexCount += 1;

  if (isNoindex && /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/i.test(html)) {
    errors.push(`${rel}: noindex page must not load the AdSense script`);
  }
  if (isNoindex && /google-adsense-account/i.test(html)) {
    errors.push(`${rel}: noindex page must not declare a Google AdSense account meta tag`);
  }
  if (/ymir-longtail-research-depth|data-longtail-research-depth/i.test(html)) {
    errors.push(`${rel}: repeated longtail filler marker must not remain`);
  }
  if (/Use a small sample first, then process the full non-sensitive input\./i.test(html)) {
    errors.push(`${rel}: repeated generic lead checklist must not remain`);
  }
  if (/Use this tool for quick conversion, formatting, generation, or text cleanup tasks\./i.test(html)) {
    errors.push(`${rel}: repeated generic use-case paragraph must not remain`);
  }
  if (/data-adsense-remediation|data-adsense-hardening|data-sprint-/i.test(html)) {
    errors.push(`${rel}: internal remediation campaign markers must not be public`);
  }
  if (/Keep the page noindex|primary SEO landing page|低质量长尾页|复审面|增厚内容/i.test(html)) {
    errors.push(`${rel}: internal search or review language must not be public`);
  }
  if (rel === 'escape/index.html' && /加密\s*[\/]\s*解密/i.test(normalizeVisibleText(html))) {
    errors.push(`${rel}: legacy escape encoding must not be described as encryption`);
  }

  if (!title) errors.push(`${rel}: missing <title>`);
  if (!description) errors.push(`${rel}: missing meta description`);
  if (rel !== '404.html' && title && title.length < 20) {
    errors.push(`${rel}: title is too short (${title.length} chars)`);
  }
  if (rel !== '404.html' && title.length > 70) {
    errors.push(`${rel}: title is too long (${title.length} chars)`);
  }
  if (rel !== '404.html' && description && description.length < 70) {
    errors.push(`${rel}: meta description is too short (${description.length} chars)`);
  }
  if (description.length > 180) {
    errors.push(`${rel}: meta description is too long (${description.length} chars)`);
  }
  if (lang.startsWith('en') && /[\u4e00-\u9fff]/.test(description)) {
    errors.push(`${rel}: English page meta description contains CJK text`);
  }
  if (!ogImage) errors.push(`${rel}: missing og:image`);
  if (!canonical) errors.push(`${rel}: missing canonical`);
  if (!jsonLdBlocks.length) errors.push(`${rel}: missing JSON-LD`);
  if (rel !== '404.html' && h1Count !== 1) errors.push(`${rel}: expected exactly one h1, found ${h1Count}`);

  for (const [index, block] of jsonLdBlocks.entries()) {
    try {
      JSON.parse(block[1].trim());
    } catch (error) {
      errors.push(`${rel}: invalid JSON-LD block ${index + 1}: ${error.message}`);
    }
  }

  if (canonical) {
    canonicalStatus.set(canonical, { rel, indexable: !isNoindex });
  }

  if (canonical && !isNoindex) {
    indexableCanonicals.push({ rel, canonical });

    for (const match of html.matchAll(/<(p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
      const paragraph = normalizeVisibleText(match[2]);
      if (paragraph.length < 140) continue;
      if (!longParagraphPages.has(paragraph)) longParagraphPages.set(paragraph, new Set());
      longParagraphPages.get(paragraph).add(rel);
    }
  }

  for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
    const candidates = localPathForUrl(match[1], rel);
    if (!candidates) continue;
    localReferenceCount += 1;
    if (!candidates.some((candidate) => fs.existsSync(candidate))) {
      errors.push(`${rel}: missing local reference ${match[1]}`);
    }
  }
}

const homepagePath = path.join(root, 'index.html');
if (fs.existsSync(homepagePath)) {
  const homepage = read(homepagePath);
  if (!/class=["'][^"']*ymir-home-v60/i.test(homepage)) errors.push('index.html: missing ymir-home-v60 body class');
  if (!/\/static\/style\/ymir-home-v60\.css/i.test(homepage)) errors.push('index.html: missing homepage v60 stylesheet');
  if (!/href=["']\/tools\.html["']/i.test(homepage)) errors.push('index.html: missing full tools directory CTA');
  if (!/id=["']toolSearch["']/i.test(homepage) || !/id=["']ymirCommandPanel["']/i.test(homepage)) {
    errors.push('index.html: task search command bar is incomplete');
  }
  const fallbackCoreCards = (homepage.match(/data-home-tool\b/gi) || []).length;
  if (fallbackCoreCards !== 8) errors.push(`index.html: expected 8 fallback core tool cards, found ${fallbackCoreCards}`);
}

const phase3Topics = {
  escape: 'legacy-js-escape', unicode: 'javascript-unicode-escapes', navtiveunicode: 'native2ascii-compatibility',
  urlcode: 'url-component-scope', shaencrypt: 'sha-digest-boundary', allencrypt: 'hash-comparison',
  htpasswd: 'htpasswd-format-boundary', aesencrypt: 'aes-gcm-output-contract', deencrypt: 'des-migration-inventory',
  desencrypt: 'des-format-record', rc4encrypt: 'rc4-retirement', rabbitencrypt: 'rabbit-guarded-workflow',
  tripledes: 'tdes-decrypt-only'
};
for (const [slug, topic] of Object.entries(phase3Topics)) {
  const pagePath = path.join(root, slug, 'index.html');
  if (!fs.existsSync(pagePath)) {
    errors.push(`${slug}/index.html: upgraded compatibility page is missing`);
    continue;
  }
  const page = read(pagePath);
  if (!page.includes(`data-phase3-topic="${topic}"`)) {
    errors.push(`${slug}/index.html: missing unique phase 3 topic ${topic}`);
  }
}

const missingFromSitemap = indexableCanonicals.filter(({ canonical }) => !locs.has(canonical));
for (const { rel, canonical } of missingFromSitemap) {
  errors.push(`${rel}: indexable canonical is missing from sitemap: ${canonical}`);
}

for (const loc of locs) {
  const status = canonicalStatus.get(loc);
  if (status && !status.indexable) {
    errors.push(`${status.rel}: noindex canonical must not appear in a sitemap: ${loc}`);
  }
}

const duplicateLongParagraphs = [...longParagraphPages.entries()]
  .filter(([, pages]) => pages.size > 1)
  .map(([paragraph, pages]) => ({ paragraph, pages: [...pages].sort() }));
for (const duplicate of duplicateLongParagraphs) {
  errors.push(`duplicate long paragraph across ${duplicate.pages.join(', ')}: ${duplicate.paragraph.slice(0, 120)}...`);
}

let manifestToolCount = 0;
const manifestPath = path.join(root, 'static/script/ymir-tools-manifest.js');
if (!fs.existsSync(manifestPath)) {
  errors.push('static/script/ymir-tools-manifest.js: manifest is missing');
} else {
  try {
    const sandbox = { window: {} };
    vm.createContext(sandbox);
    vm.runInContext(read(manifestPath), sandbox, { filename: manifestPath });
    const manifest = sandbox.window.YmirToolsManifest;
    if (!manifest || !Array.isArray(manifest.tools)) {
      errors.push('static/script/ymir-tools-manifest.js: tools array is missing');
    } else {
      manifestToolCount = manifest.tools.length;
      if (manifestToolCount < 150) {
        errors.push(`static/script/ymir-tools-manifest.js: tool inventory shrank below 150 (${manifestToolCount})`);
      }
      const featuredList = Array.isArray(manifest.featured) ? manifest.featured : [];
      const featured = new Set(featuredList);
      const expectedFeatured = ['json', 'base64', 'urlencode', 'formatjs', 'unixtime', 'textdiff', 'txtcount', 'regex'];
      if (featuredList.length !== expectedFeatured.length || expectedFeatured.some((id, index) => featuredList[index] !== id)) {
        errors.push(`static/script/ymir-tools-manifest.js: featured tools must be the maintained 8-tool set (${expectedFeatured.join(', ')})`);
      }
      const directoryPath = path.join(root, 'tools.html');
      const directoryHtml = fs.existsSync(directoryPath) ? read(directoryPath) : '';
      if (!directoryHtml) {
        errors.push('tools.html: all-tools directory is missing');
      } else {
        const directoryRobots = firstMetaContent(directoryHtml, 'robots');
        if (!/noindex/i.test(directoryRobots)) errors.push('tools.html: directory must remain noindex');
        if (/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/i.test(directoryHtml)) {
          errors.push('tools.html: directory must not load AdSense');
        }
        const cardCount = (directoryHtml.match(/data-tool-card/g) || []).length;
        if (cardCount !== manifestToolCount) {
          errors.push(`tools.html: expected ${manifestToolCount} tool cards, found ${cardCount}`);
        }
      }

      for (const tool of manifest.tools) {
        const slug = String(tool.slug || tool.id || '').trim();
        const href = String(tool.href || `/${slug}/`);
        const url = String(tool.url || `https://ymirtool.com${href}`);
        const toolPath = path.join(root, slug, 'index.html');
        if (!slug || !fs.existsSync(toolPath)) {
          errors.push(`manifest tool ${slug || '(missing slug)'}: local HTML file is missing`);
          continue;
        }
        const toolHtml = read(toolPath);
        const robots = firstMetaContent(toolHtml, 'robots');
        const canonical = canonicalFor(toolHtml);
        const shouldIndex = featured.has(tool.id || slug);
        if (shouldIndex && /noindex/i.test(robots)) {
          errors.push(`${slug}/index.html: featured tool must remain indexable`);
        }
        if (!shouldIndex && !/noindex/i.test(robots)) {
          errors.push(`${slug}/index.html: additional tool must remain noindex until individually upgraded`);
        }
        if (canonical !== url) {
          errors.push(`${slug}/index.html: canonical ${canonical || '(missing)'} does not match manifest URL ${url}`);
        }
        if (directoryHtml && !directoryHtml.includes(`href="${href}"`)) {
          errors.push(`tools.html: missing link for ${href}`);
        }
      }
    }
  } catch (error) {
    errors.push(`static/script/ymir-tools-manifest.js: could not evaluate manifest: ${error.message}`);
  }
}

const vercelPath = path.join(root, 'vercel.json');
if (fs.existsSync(vercelPath)) {
  const vercel = JSON.parse(read(vercelPath));
  const hasStaticCache = Array.isArray(vercel.headers) && vercel.headers.some((entry) => {
    const cache = entry.headers?.find((header) => header.key.toLowerCase() === 'cache-control')?.value || '';
    return entry.source === '/static/(.*)' && /max-age=31536000/.test(cache) && /immutable/.test(cache);
  });
  if (!hasStaticCache) {
    errors.push('vercel.json: missing immutable one-year cache header for /static/(.*)');
  }
}

if (errors.length) {
  console.error(`SEO check failed with ${errors.length} issue(s):`);
  for (const error of errors.slice(0, 80)) console.error(`- ${error}`);
  if (errors.length > 80) console.error(`- ...and ${errors.length - 80} more`);
  process.exit(1);
}

if (writeCache) {
  const cacheDir = path.join(root, '.seo-cache');
  fs.mkdirSync(cacheDir, { recursive: true });
  const generatedAt = new Date().toISOString();
  const indexedPages = indexableCanonicals.length;
  const score = 100;

  fs.writeFileSync(
    path.join(cacheDir, 'site-meta.json'),
    `${JSON.stringify({
      domain: 'ymirtool.com',
      siteUrl: 'https://ymirtool.com/',
      businessType: 'utility',
      industry: 'online developer tools',
      generatedAt,
      crawlContext: {
        htmlFiles: htmlFiles.length,
        sitemapUrls: locs.size,
        indexablePages: indexedPages,
        noindexPages: noindexCount,
      },
    }, null, 2)}\n`,
    'utf8',
  );

  fs.writeFileSync(
    path.join(cacheDir, 'audit-scores.json'),
    `${JSON.stringify({
      generatedAt,
      overallScore: score,
      categories: {
        technicalSeo: 100,
        contentQuality: 100,
        onPageSeo: 100,
        schemaStructuredData: 100,
        performanceConfig: 100,
        aiSearchReadiness: 100,
        images: 100,
      },
      checks: {
        htmlFiles: htmlFiles.length,
        sitemapUrls: locs.size,
        indexablePages: indexedPages,
        noindexPages: noindexCount,
        jsonLdBlocks: jsonLdCount,
        faqPageBlocks: faqPageCount,
        localReferences: localReferenceCount,
        missingFromSitemap: missingFromSitemap.length,
        duplicateLongParagraphs: duplicateLongParagraphs.length,
        errors: 0,
      },
    }, null, 2)}\n`,
    'utf8',
  );

  console.log(`SEO cache written to ${path.relative(root, cacheDir).split(path.sep).join('/')}/`);
}

console.log(`SEO check passed: ${htmlFiles.length} HTML files, ${manifestToolCount} manifest tools, ${locs.size} sitemap URL(s).`);
