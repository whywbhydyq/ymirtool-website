# AdSense Low Value Content Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the AdSense "low value content" rejection risk by reducing thin indexed inventory, removing ad serving from low/no-content pages, and enriching the approved tool pages with durable static publisher content.

**Architecture:** Treat `scripts/sync-tools-manifest-derived-files.mjs` as the source of generated HTML behavior. Add a policy layer that decides which pages are indexable, which pages may load AdSense, and which pages receive static content modules. Regenerate HTML, sitemap, and audit reports from the same source so manual fixes are not overwritten.

**Tech Stack:** Static HTML site, Node.js `.mjs` generation scripts, Vue runtime-mounted tools, XML sitemaps, Google AdSense/Publisher/Search policy constraints.

---

## Research Basis

Official sources checked on 2026-06-01:

- Google AdSense says approval needs unique, relevant content, clear navigation, and a useful user experience: https://support.google.com/adsense/answer/7299563
- AdSense eligibility says the site must have high-quality, original content that attracts an audience: https://support.google.com/adsense/answer/9724
- AdSense rejection guidance lists insufficient content, under-construction pages, auto-generated pages, pages with little original content, and navigation issues as approval blockers: https://support.google.com/adsense/answer/81904
- Google Publisher Policies prohibit Google-served ads on screens without publisher content, with low-value content, under construction, or used only for navigation/behavioral purposes: https://support.google.com/publisherpolicies/answer/10502938
- Google Search spam policies flag scaled content abuse and doorway-like pages where many similar pages provide little value: https://developers.google.com/search/docs/essentials/spam-policies

Local evidence:

- `182` HTML pages, `150` Vue-mounted tool pages.
- `122` pages have fewer than `120` visible words; median visible word count is about `93`.
- Many pages contain generic copy such as `How to use this tool`, `Paste input, load the sample if needed...`, and footer `Runs quickly.`
- `404.html` currently loads the AdSense script.
- `sitemap.xml` currently includes most thin tool pages with `priority` around `0.8` and the same `lastmod`.

## File Structure

- Modify: `scripts/sync-tools-manifest-derived-files.mjs`
  - Own all generated-page policy decisions: AdSense script eligibility, temporary `noindex`, sitemap inclusion, static content insertion.
- Modify: `scripts/adsense-preflight-audit-v57.mjs`
  - Replace the old "every HTML page must have AdSense script" check with a policy-aware audit.
- Create: `scripts/content-quality-audit.mjs`
  - Count visible text, detect generic template strings, detect AdSense on no-content pages, and produce a machine-readable report.
- Create: `static/script/ymir-adsense-page-policy.json`
  - Small source-of-truth policy file listing launch-ready tool slugs and pages excluded from AdSense/indexing.
- Create: `static/script/ymir-tool-content-modules.json`
  - Static content modules for the approved launch set.
- Modify generated HTML after running sync:
  - `index.html`
  - `404.html`
  - core tool pages: `json/index.html`, `base64/index.html`, `md5/index.html`, `formatjs/index.html`, `textdiff/index.html`, `txtcount/index.html`, `regex/index.html`, `calculator/index.html`, `unixtime/index.html`, `urlencode/index.html`
  - non-approved tool pages receive `noindex, follow` and no AdSense script.
- Modify generated XML:
  - `sitemap.xml`
  - `sitemap-guides.xml`
  - `sitemap-policy.xml`
- Create generated reports:
  - `ADSENSE_CONTENT_QUALITY_AUDIT_REPORT.json`
  - `ADSENSE_REMEDIATION_REPORT.json`

## Policy Decisions

Use this launch set for the first resubmission:

```js
const APPROVED_TOOL_SLUGS = [
  'json',
  'base64',
  'md5',
  'formatjs',
  'textdiff',
  'txtcount',
  'regex',
  'calculator',
  'unixtime',
  'urlencode'
];
```

Page rules:

- Keep `<meta name="google-adsense-account"...>` on every page for ownership verification.
- Load the AdSense script only on `/`, `/guides.html`, guide articles, and approved enriched tool pages.
- Never load the AdSense script on `404.html`, policy pages, or non-approved thin tool pages.
- Include only home, policy pages, guide pages, and approved enriched tools in `sitemap.xml`.
- Add `<meta name="robots" content="noindex, follow">` to non-approved tool pages until each page has unique static content.
- Keep non-approved pages reachable from the homepage directory for users, but do not submit them as indexable monetized inventory.

---

### Task 1: Add Page Policy Data

**Files:**
- Create: `static/script/ymir-adsense-page-policy.json`

- [ ] **Step 1: Create the policy JSON**

```json
{
  "version": "20260601-adsense-remediation",
  "approvedToolSlugs": [
    "json",
    "base64",
    "md5",
    "formatjs",
    "textdiff",
    "txtcount",
    "regex",
    "calculator",
    "unixtime",
    "urlencode"
  ],
  "adEligibleStaticPageIds": [
    "home",
    "guides",
    "online_toolbox_guide",
    "priority_tools_guide",
    "json_formatter_examples",
    "json_format_guide",
    "base64_encoding_guide",
    "url_encoding_guide",
    "javascript_formatter_guide",
    "text_diff_guide",
    "regex_tester_guide",
    "unix_time_guide",
    "calculator_guide"
  ],
  "neverAdPagePaths": [
    "404.html",
    "about.html",
    "privacy.html",
    "terms.html",
    "disclaimer.html",
    "contact.html"
  ],
  "temporaryNoindexToolReason": "Tool page needs unique static publisher content before AdSense review."
}
```

- [ ] **Step 2: Verify JSON parses**

Run:

```powershell
node -e "JSON.parse(require('fs').readFileSync('static/script/ymir-adsense-page-policy.json','utf8')); console.log('ok')"
```

Expected: `ok`

- [ ] **Step 3: Commit**

```powershell
git add static/script/ymir-adsense-page-policy.json
git commit -m "chore: add adsense page policy"
```

---

### Task 2: Add Static Content Modules For Launch Tools

**Files:**
- Create: `static/script/ymir-tool-content-modules.json`

- [ ] **Step 1: Create content module schema and first modules**

Use this schema for every approved tool:

```json
{
  "json": {
    "language": "en",
    "summary": "The JSON Formatter helps developers inspect API responses, logs, configuration snippets, and pasted JSON samples without changing the source data.",
    "sections": [
      {
        "heading": "When this tool is useful",
        "paragraphs": [
          "Use it when an API response is hard to read, when a configuration file needs consistent indentation, or when a JSON sample must be checked before it is shared in documentation.",
          "The formatter keeps valid values intact. It changes whitespace for readability or removes whitespace for compact output."
        ]
      },
      {
        "heading": "Input and output example",
        "paragraphs": [
          "Input: {\"status\":\"ok\",\"items\":[{\"id\":1,\"name\":\"sample\"}]}",
          "Formatted output uses nested indentation so object keys, arrays, and values can be reviewed line by line."
        ]
      },
      {
        "heading": "Common validation errors",
        "paragraphs": [
          "Strict JSON does not allow trailing commas, comments, single-quoted strings, or unquoted object keys.",
          "If pasted API output fails validation, confirm that the response is not an HTML error page, JSONP wrapper, or log prefix."
        ]
      },
      {
        "heading": "Privacy boundary",
        "paragraphs": [
          "Do not paste passwords, production tokens, private keys, customer records, or confidential payloads into browser tools unless your own security process allows it."
        ]
      }
    ],
    "faqs": [
      {
        "question": "Does formatting change the JSON values?",
        "answer": "No. Formatting changes whitespace only after the input has parsed as valid JSON."
      },
      {
        "question": "Why does valid JavaScript object syntax fail?",
        "answer": "JSON is stricter than JavaScript object literals. Keys and string values need double quotes, and comments are not valid JSON."
      }
    ]
  },
  "base64": {
    "language": "en",
    "summary": "The Base64 Encoder and Decoder converts text to Base64 and decodes Base64 back to readable UTF-8 text for transport and documentation checks.",
    "sections": [
      {
        "heading": "When this tool is useful",
        "paragraphs": [
          "Use it for small text payloads, examples in API documentation, test fixtures, and configuration values that need Base64 representation.",
          "Base64 is an encoding format. It is not encryption and should not be used as access control."
        ]
      },
      {
        "heading": "Input and output example",
        "paragraphs": [
          "Input text: Ymir Tool",
          "Base64 output: WW1pciBUb29s"
        ]
      },
      {
        "heading": "Common decode errors",
        "paragraphs": [
          "Decode can fail when the string has invalid characters, missing padding, URL-safe substitutions, or binary bytes that are not valid UTF-8 text."
        ]
      },
      {
        "heading": "Privacy boundary",
        "paragraphs": [
          "Do not treat Base64 as secret storage. Anyone who receives the encoded string can decode it."
        ]
      }
    ],
    "faqs": [
      {
        "question": "Is Base64 secure?",
        "answer": "No. Base64 is reversible encoding, not encryption."
      },
      {
        "question": "Can it handle Chinese characters?",
        "answer": "Yes. The tool should encode and decode UTF-8 text, including Chinese characters and emoji."
      }
    ]
  }
}
```

Then add modules for the remaining approved tools with the same shape:

- `md5`: explain checksums, integrity comparison, not password storage.
- `formatjs`: explain beautify/minify, syntax caveats, not executing pasted code.
- `textdiff`: explain comparing drafts/config/logs, added/removed/changed lines.
- `txtcount`: explain metadata limits, translation checks, byte/word/paragraph counts.
- `regex`: explain testing patterns, flags, escaping, catastrophic backtracking caution.
- `calculator`: explain expression checks, unit assumptions, floating point limits.
- `unixtime`: explain seconds vs milliseconds, timezone conversion, ISO date checks.
- `urlencode`: explain percent encoding, query parameters, reserved characters.

- [ ] **Step 2: Verify every approved slug has content**

Run:

```powershell
node -e "$p=JSON.parse(require('fs').readFileSync('static/script/ymir-adsense-page-policy.json','utf8'));$m=JSON.parse(require('fs').readFileSync('static/script/ymir-tool-content-modules.json','utf8'));$missing=p.approvedToolSlugs.filter(s=>!m[s]); if(missing.length) throw new Error('missing '+missing.join(',')); console.log('ok')"
```

Expected: `ok`

- [ ] **Step 3: Commit**

```powershell
git add static/script/ymir-tool-content-modules.json
git commit -m "content: add static modules for adsense launch tools"
```

---

### Task 3: Make The Generator Policy-Aware

**Files:**
- Modify: `scripts/sync-tools-manifest-derived-files.mjs`

- [ ] **Step 1: Load policy and content data**

Add near the existing path constants:

```js
const adsensePolicyPath = path.join(root, 'static/script/ymir-adsense-page-policy.json');
const toolContentModulesPath = path.join(root, 'static/script/ymir-tool-content-modules.json');
const adsensePolicy = JSON.parse(fs.readFileSync(adsensePolicyPath, 'utf8'));
const toolContentModules = JSON.parse(fs.readFileSync(toolContentModulesPath, 'utf8'));
const approvedToolSlugs = new Set(adsensePolicy.approvedToolSlugs || []);
const adEligibleStaticPageIds = new Set(adsensePolicy.adEligibleStaticPageIds || []);
const neverAdPagePaths = new Set(adsensePolicy.neverAdPagePaths || []);
```

- [ ] **Step 2: Replace unconditional AdSense script insertion**

Replace `ensureAdSenseAndViewport(html)` with:

```js
function removeAdSenseScript(html) {
  return html.replace(ADSENSE_SCRIPT_RE, '\n');
}

function ensureAdSenseAndViewport(html, options = {}) {
  html = cleanViewport(html);
  html = ensureAdSenseMeta(html);
  html = options.loadAdSenseScript ? ensureAdSenseScript(html) : removeAdSenseScript(html);
  return html;
}
```

- [ ] **Step 3: Add robots helpers**

Add after `replaceMeta`:

```js
function setRobots(html, content) {
  return replaceMeta(html, 'robots', content);
}

function toolIsApproved(tool) {
  return approvedToolSlugs.has(tool.slug || tool.id);
}

function staticPageCanLoadAds(page) {
  return adEligibleStaticPageIds.has(page.id) && !neverAdPagePaths.has(page.path);
}
```

- [ ] **Step 4: Add static content renderer**

Add before `syncToolPage`:

```js
function renderContentModule(tool) {
  const slug = tool.slug || tool.id;
  const module = toolContentModules[slug];
  if (!module) return '';
  const sections = (module.sections || []).map((section) => {
    const paragraphs = (section.paragraphs || []).map((text) => `<p>${htmlEscape(text)}</p>`).join('');
    return `<section class="ymir-container ymir-help ymir-card"><h2>${htmlEscape(section.heading)}</h2>${paragraphs}</section>`;
  }).join('\n');
  const faqs = (module.faqs || []).map((item) => `<h3>${htmlEscape(item.question)}</h3><p>${htmlEscape(item.answer)}</p>`).join('');
  const faqBlock = faqs ? `<section class="ymir-container ymir-faq ymir-card"><h2>FAQ</h2>${faqs}</section>` : '';
  return [
    `<section class="ymir-container ymir-help ymir-card"><h2>About this tool</h2><p>${htmlEscape(module.summary)}</p></section>`,
    sections,
    faqBlock
  ].filter(Boolean).join('\n');
}

function replaceToolSupportContent(html, tool) {
  const content = renderContentModule(tool);
  if (!content) return html;
  html = html.replace(/\s*<section\b(?=[^>]*\bymir-help\b)[\s\S]*?<\/section>\s*/ig, '\n');
  html = html.replace(/\s*<section\b(?=[^>]*\bymir-faq\b)[\s\S]*?<\/section>\s*/ig, '\n');
  html = html.replace(/(<section\b(?=[^>]*\bymir-related\b)[\s\S]*?<\/section>)/i, `${content}\n$1`);
  return html;
}
```

- [ ] **Step 5: Apply policy in `syncToolPage`**

Inside `syncToolPage(tool)`, before writing the file:

```js
const approved = toolIsApproved(tool);
html = approved ? replaceToolSupportContent(html, tool) : html;
html = setRobots(html, approved ? 'index, follow' : 'noindex, follow');
html = ensureAdSenseAndViewport(html, { loadAdSenseScript: approved });
```

Remove the old unconditional call:

```js
html = ensureAdSenseAndViewport(html);
```

- [ ] **Step 6: Apply policy in static page sync**

Where static pages are processed, replace the unconditional call with:

```js
html = ensureAdSenseAndViewport(html, { loadAdSenseScript: staticPageCanLoadAds(page) });
```

For `404.html`, add a direct safety pass:

```js
if (page.path === '404.html') {
  html = setRobots(html, 'noindex, follow');
  html = ensureAdSenseAndViewport(html, { loadAdSenseScript: false });
}
```

- [ ] **Step 7: Filter sitemap tool URLs**

Replace:

```js
const toolUrls = (toolManifest.tools || []).map((tool) => ({
```

with:

```js
const toolUrls = (toolManifest.tools || [])
  .filter((tool) => toolIsApproved(tool))
  .map((tool) => ({
```

- [ ] **Step 8: Run generator**

Run:

```powershell
node scripts/sync-tools-manifest-derived-files.mjs
```

Expected:

- `sitemap.xml` contains only the approved tool URLs plus main static pages.
- `404.html` has AdSense meta but no `pagead2.googlesyndication.com` script.
- non-approved tool pages have `noindex, follow`.
- approved tools have enriched content sections before related links.

- [ ] **Step 9: Commit**

```powershell
git add scripts/sync-tools-manifest-derived-files.mjs static/script/ymir-tools-manifest.js static/script/ymir-static-pages-registry.js sitemap.xml sitemap-guides.xml sitemap-policy.xml index.html 404.html json base64 md5 formatjs textdiff txtcount regex calculator unixtime urlencode
git commit -m "fix: gate adsense and enrich launch tool pages"
```

---

### Task 4: Replace The Old AdSense Audit

**Files:**
- Modify: `scripts/adsense-preflight-audit-v57.mjs`

- [ ] **Step 1: Load policy**

Add:

```js
const policy = JSON.parse(fs.readFileSync(path.join(root, 'static/script/ymir-adsense-page-policy.json'), 'utf8'));
const approvedToolSlugs = new Set(policy.approvedToolSlugs || []);
const adEligibleStaticPageIds = new Set(policy.adEligibleStaticPageIds || []);
const neverAdPagePaths = new Set(policy.neverAdPagePaths || []);
```

- [ ] **Step 2: Replace "every page has script" expectation**

Use this decision helper:

```js
function expectedAdScript(rel) {
  if (neverAdPagePaths.has(rel)) return false;
  const toolMatch = rel.match(/^([^/]+)\/index\.html$/);
  if (toolMatch) return approvedToolSlugs.has(toolMatch[1]);
  if (rel === 'index.html') return true;
  const staticRegistry = JSON.parse(fs.readFileSync(path.join(root, 'static/script/ymir-static-pages-registry.json'), 'utf8'));
  const page = (staticRegistry.pages || []).find((item) => item.path === rel);
  return !!page && adEligibleStaticPageIds.has(page.id);
}
```

Then change script validation to:

```js
const shouldHaveScript = expectedAdScript(rel);
if (shouldHaveScript && scriptCount === 1) stats.adsenseScriptOk += 1;
else if (!shouldHaveScript && scriptCount === 0) stats.adsenseScriptOk += 1;
else issues.push({ page: rel, issue: 'adsense-script-policy-mismatch', expected: shouldHaveScript, count: scriptCount });
```

- [ ] **Step 3: Add noindex validation for non-approved tools**

Inside the HTML loop:

```js
const toolMatch = rel.match(/^([^/]+)\/index\.html$/);
if (toolMatch && !approvedToolSlugs.has(toolMatch[1])) {
  if (!/<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*noindex,\s*follow)[^>]*>/i.test(html)) {
    issues.push({ page: rel, issue: 'thin-tool-missing-noindex' });
  }
}
```

- [ ] **Step 4: Run audit**

Run:

```powershell
node scripts/adsense-preflight-audit-v57.mjs
```

Expected: JSON output with `"pass": true`.

- [ ] **Step 5: Commit**

```powershell
git add scripts/adsense-preflight-audit-v57.mjs
git commit -m "test: make adsense audit policy aware"
```

---

### Task 5: Add Content Quality Audit

**Files:**
- Create: `scripts/content-quality-audit.mjs`

- [ ] **Step 1: Add audit script**

```js
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const policy = JSON.parse(fs.readFileSync(path.join(root, 'static/script/ymir-adsense-page-policy.json'), 'utf8'));
const approvedToolSlugs = new Set(policy.approvedToolSlugs || []);
const reportPath = path.join(root, 'ADSENSE_CONTENT_QUALITY_AUDIT_REPORT.json');

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

function visibleText(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordCount(text) {
  return (text.match(/[A-Za-z0-9_]+|[\u4e00-\u9fff]/g) || []).length;
}

const issues = [];
const pages = [];

for (const rel of collectHtml()) {
  const html = fs.readFileSync(path.join(root, rel), 'utf8');
  const text = visibleText(html);
  const words = wordCount(text);
  const toolMatch = rel.match(/^([^/]+)\/index\.html$/);
  const isApprovedTool = !!toolMatch && approvedToolSlugs.has(toolMatch[1]);
  const hasAdScript = /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/.test(html);
  const hasNoindex = /<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*noindex,\s*follow)[^>]*>/i.test(html);
  const genericCopy = [
    'Paste input, load the sample if needed, choose an action, review the output, and copy the result.',
    'Runs quickly.'
  ].filter((needle) => html.includes(needle));

  pages.push({ page: rel, words, isApprovedTool, hasAdScript, hasNoindex, genericCopy });

  if (rel === '404.html' && hasAdScript) issues.push({ page: rel, issue: '404-loads-adsense-script' });
  if (isApprovedTool && words < 260) issues.push({ page: rel, issue: 'approved-tool-too-thin', words });
  if (isApprovedTool && genericCopy.length) issues.push({ page: rel, issue: 'approved-tool-generic-copy', genericCopy });
  if (toolMatch && !isApprovedTool && !hasNoindex) issues.push({ page: rel, issue: 'non-approved-tool-indexable' });
  if (toolMatch && !isApprovedTool && hasAdScript) issues.push({ page: rel, issue: 'non-approved-tool-loads-adsense-script' });
}

const approved = pages.filter((page) => page.isApprovedTool);
const report = {
  checkedAt: new Date().toISOString(),
  approvedToolCount: approved.length,
  approvedToolMinWords: approved.length ? Math.min(...approved.map((page) => page.words)) : 0,
  htmlFiles: pages.length,
  issues,
  pass: issues.length === 0
};

fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exitCode = report.pass ? 0 : 1;
```

- [ ] **Step 2: Run audit**

```powershell
node scripts/content-quality-audit.mjs
```

Expected: `"pass": true`, `approvedToolMinWords` at least `260`.

- [ ] **Step 3: Commit**

```powershell
git add scripts/content-quality-audit.mjs ADSENSE_CONTENT_QUALITY_AUDIT_REPORT.json
git commit -m "test: add adsense content quality audit"
```

---

### Task 6: Verify Sitemap And Robots Behavior

**Files:**
- Modify generated: `sitemap.xml`
- Read-only verify: `robots.txt`

- [ ] **Step 1: Count sitemap tool URLs**

Run:

```powershell
Select-String -Path sitemap.xml -Pattern '<loc>https://ymirtool.com/.+/.+</loc>' | Measure-Object
```

Expected: count equals `10` for the approved tool set unless static guide URLs also match the pattern. If the command overcounts, inspect:

```powershell
Select-String -Path sitemap.xml -Pattern '<loc>' | Select-Object -First 80
```

- [ ] **Step 2: Verify removed thin page from sitemap**

Run:

```powershell
Select-String -Path sitemap.xml -Pattern 'rmbdaxie|ip2long|shortcut|browserinfo'
```

Expected: no matches.

- [ ] **Step 3: Verify approved pages remain**

Run:

```powershell
Select-String -Path sitemap.xml -Pattern 'json|base64|md5|formatjs|textdiff|txtcount|regex|calculator|unixtime|urlencode'
```

Expected: matches for all approved slugs.

- [ ] **Step 4: Commit**

```powershell
git add sitemap.xml robots.txt
git commit -m "fix: submit only adsense-ready pages in sitemap"
```

---

### Task 7: Final Regression And Resubmission Checklist

**Files:**
- Create: `ADSENSE_REMEDIATION_REPORT.json`

- [ ] **Step 1: Run all available audits**

```powershell
node scripts/adsense-preflight-audit-v57.mjs
node scripts/content-quality-audit.mjs
node scripts/page-regression-audit.mjs
```

Expected:

- AdSense preflight passes.
- Content quality audit passes.
- Page regression does not report broken core pages.

- [ ] **Step 2: Write final remediation report**

Create `ADSENSE_REMEDIATION_REPORT.json`:

```json
{
  "version": "20260601-adsense-remediation",
  "fixed": [
    "Removed AdSense script from 404, policy pages, and non-approved thin tool pages.",
    "Added noindex, follow to non-approved tool pages until they receive unique static content.",
    "Limited sitemap tool inventory to launch-ready enriched tool pages.",
    "Added durable static publisher content modules for approved tool pages.",
    "Updated preflight audits to check content quality and policy-aware ad script placement."
  ],
  "approvedToolSlugs": [
    "json",
    "base64",
    "md5",
    "formatjs",
    "textdiff",
    "txtcount",
    "regex",
    "calculator",
    "unixtime",
    "urlencode"
  ],
  "manualStepsBeforeAdSenseReview": [
    "Deploy the generated site.",
    "Open https://ymirtool.com/404.html and confirm no ad request is made.",
    "Open several non-approved tool pages and confirm robots noindex is present.",
    "Open approved tool pages and confirm static sections are visible without user input.",
    "Submit review only after the deployed sitemap matches the remediated sitemap."
  ]
}
```

- [ ] **Step 3: Commit**

```powershell
git add ADSENSE_REMEDIATION_REPORT.json ADSENSE_CONTENT_QUALITY_AUDIT_REPORT.json V57_ADSENSE_SEO_PREFLIGHT_AUDIT_REPORT.json
git commit -m "docs: record adsense remediation status"
```

---

## Self-Review

Spec coverage:

- Thin content: covered by Task 2, Task 3, Task 5.
- JS-only tool shell: covered by Task 2 and Task 3 inserting static publisher content.
- Sitemap overexposure: covered by Task 3 and Task 6.
- AdSense on 404/policy/thin pages: covered by Task 1, Task 3, Task 4, Task 5.
- Repeatability: covered by modifying the generator rather than one-off HTML edits.
- Verification: covered by Task 4, Task 5, Task 6, Task 7.

Residual risk:

- AdSense review is not deterministic. This plan materially reduces known policy risks, but approval can still depend on traffic quality, account history, unsupported-language mix, or reviewer judgment.
- The first resubmission should use a small high-quality indexable inventory. After approval, add more tools in batches only after each page has unique static content and passes the content audit.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-01-adsense-low-value-content-remediation.md`. Two execution options:

1. **Subagent-Driven (recommended)** - dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
