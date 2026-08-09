# YmirTool First-Usable Core Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the YmirTool homepage and eight maintained tool pages render a real, locally functional workbench in initial HTML without the historical Vue, Element Plus, manifest, or aggregate CSS payload.

**Architecture:** A dependency-free ES module exposes pure tool engines and progressively enhances server-delivered workbench markup. A deterministic Python generator owns the nine HTML integrations, while a Node validator enforces structure, resource budgets, SEO preservation, and the unchanged legacy-tool boundary.

**Tech Stack:** Static HTML/CSS, browser ES modules, Node.js built-in test runner, Python 3 with BeautifulSoup, existing npm SEO/audit scripts.

## Global Constraints

- Fast scope is exactly `/`, `/json/`, `/base64/`, `/urlencode/`, `/formatjs/`, `/regex/`, `/textdiff/`, `/txtcount/`, and `/unixtime/`.
- The remaining 142 tool pages keep their current Vue/Element Plus compatibility runtime.
- Fast pages must not reference `ymir-tool-runtime-v63.js`, `ymir-tool-core-runtime-v63.js`, `ymir-vue-tools-app.js`, `ymir-tools-manifest.js`, or `ymir-tool-bundle-v65.css` as initial resources.
- Fast-page first-party JavaScript and critical CSS must each remain below 100,000 raw bytes.
- Invalid input must clear stale output before exposing an error.
- Existing canonical URLs, JSON-LD, help content, related links, mobile behavior, and browser-local processing must remain.
- Do not change advertising, pricing, analytics semantics, or any of the 142 legacy tool implementations.

---

### Task 1: Lock the pure-engine contract with failing tests

**Files:**
- Create: `tests/ymir-fast-core.test.mjs`
- Create: `static/script/ymir-fast-core-v66.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces named exports `formatJson`, `minifyJson`, `validateJson`, `encodeBase64`, `decodeBase64`, `encodeUrl`, `decodeUrl`, `formatJavaScript`, `minifyJavaScript`, `testRegex`, `compareText`, `countText`, `timestampToDate`, and `dateToTimestamp`.
- Each operation returns `{ ok: true, value, meta? }` or `{ ok: false, value: '', error }` so the controller cannot retain stale output.

- [ ] **Step 1: Add a focused failing engine test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatJson, minifyJson, validateJson, encodeBase64, decodeBase64,
  encodeUrl, decodeUrl, testRegex, compareText, countText,
  timestampToDate, dateToTimestamp,
} from '../static/script/ymir-fast-core-v66.mjs';

test('invalid JSON clears the value instead of retaining an old result', () => {
  const result = formatJson('{bad');
  assert.equal(result.ok, false);
  assert.equal(result.value, '');
  assert.match(result.error, /^Invalid JSON:/);
});

test('core transformations preserve UTF-8 and expose deterministic results', () => {
  assert.equal(formatJson('{"name":"Ymir"}').value, '{\n  "name": "Ymir"\n}');
  assert.equal(minifyJson('{ "name": "Ymir" }').value, '{"name":"Ymir"}');
  assert.equal(validateJson('{"ok":true}').ok, true);
  assert.equal(decodeBase64(encodeBase64('中文 Ymir').value).value, '中文 Ymir');
  assert.equal(decodeUrl(encodeUrl('中文 test&x=1').value).value, '中文 test&x=1');
});

test('regex, diff, counts, and timestamps return reviewable metadata', () => {
  assert.equal(testRegex('y(\\w+)', 'gi', 'Ymir ytool').meta.matches.length, 2);
  assert.equal(compareText('a\nb', 'a\nc').meta.changed, 1);
  assert.deepEqual(countText('hello 世界\nnext').meta, {
    characters: 13, charactersNoSpaces: 12, words: 3, lines: 2,
  });
  assert.match(timestampToDate('0').value, /^1970-01-01T00:00:00\.000Z/);
  assert.equal(dateToTimestamp('1970-01-01T00:00:01Z').meta.seconds, 1);
});
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `node --test tests/ymir-fast-core.test.mjs`  
Expected: FAIL because `static/script/ymir-fast-core-v66.mjs` does not exist or lacks the named exports.

- [ ] **Step 3: Implement the minimal pure engines**

```js
const success = (value, meta) => ({ ok: true, value: String(value ?? ''), ...(meta ? { meta } : {}) });
const failure = (error) => ({ ok: false, value: '', error: String(error) });

export function formatJson(input) {
  try { return success(JSON.stringify(JSON.parse(input), null, 2)); }
  catch (error) { return failure(`Invalid JSON: ${String(error.message).replace(/^JSON\.parse:\s*/i, '')}`); }
}

export function minifyJson(input) {
  try { return success(JSON.stringify(JSON.parse(input))); }
  catch (error) { return failure(`Invalid JSON: ${String(error.message).replace(/^JSON\.parse:\s*/i, '')}`); }
}
```

Complete the remaining named exports using `TextEncoder`/`TextDecoder`, `btoa`/`atob` browser fallbacks, `encodeURIComponent`/`decodeURIComponent`, `RegExp`, line comparison, Unicode-safe counting, and `Date`. No exported function may throw for user input.

- [ ] **Step 4: Run the engine test and confirm GREEN**

Run: `node --test tests/ymir-fast-core.test.mjs`  
Expected: all engine tests PASS with zero warnings.

- [ ] **Step 5: Add the test command and commit**

Add to `package.json`:

```json
"test:fast": "node --test tests/ymir-fast-core.test.mjs"
```

Run: `npm run test:fast`  
Expected: PASS.

```bash
git add package.json tests/ymir-fast-core.test.mjs static/script/ymir-fast-core-v66.mjs
git commit -m "feat: add lightweight core tool engines"
```

### Task 2: Add a DOM controller that makes static workbenches functional

**Files:**
- Modify: `tests/ymir-fast-core.test.mjs`
- Modify: `static/script/ymir-fast-core-v66.mjs`

**Interfaces:**
- Produces `initFastWorkbench(root: HTMLElement): void` and `initFastWorkbenches(scope?: ParentNode): void`.
- Consumes markup rooted at `[data-fast-tool]`, actions at `[data-fast-action]`, inputs at `[data-fast-input]`, outputs at `[data-fast-output]`, status at `[data-fast-status]`, and metrics at `[data-fast-metric]`.

- [ ] **Step 1: Add failing source-level controller tests**

```js
import fs from 'node:fs';
const source = fs.readFileSync(new URL('../static/script/ymir-fast-core-v66.mjs', import.meta.url), 'utf8');

test('browser controller has stable accessible selectors and clears output before failure', () => {
  assert.match(source, /export function initFastWorkbench/);
  assert.match(source, /\[data-fast-action\]/);
  assert.match(source, /output\.value = ''/);
  assert.match(source, /aria-live/);
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `node --test --test-name-pattern="browser controller" tests/ymir-fast-core.test.mjs`  
Expected: FAIL because the controller exports and selectors are absent.

- [ ] **Step 3: Implement action dispatch and feedback**

The controller must:

```js
const ACTIONS = {
  formatJson: ({ input }) => formatJson(input),
  minifyJson: ({ input }) => minifyJson(input),
  validateJson: ({ input }) => validateJson(input),
  encodeBase64: ({ input }) => encodeBase64(input),
  decodeBase64: ({ input }) => decodeBase64(input),
  encodeUrl: ({ input }) => encodeUrl(input),
  decodeUrl: ({ input }) => decodeUrl(input),
  formatJavaScript: ({ input }) => formatJavaScript(input),
  minifyJavaScript: ({ input }) => minifyJavaScript(input),
  testRegex: ({ pattern, flags, text }) => testRegex(pattern, flags, text),
  compareText: ({ original, changed }) => compareText(original, changed),
  countText: ({ input }) => countText(input),
  timestampToDate: ({ timestamp }) => timestampToDate(timestamp),
  dateToTimestamp: ({ date }) => dateToTimestamp(date),
};
```

Before every action, set all `[data-fast-output]` values/text to `''`. On success, render value and metrics; on failure, keep outputs empty and render the error in `[data-fast-status][aria-live="polite"]`. Implement `sample`, `clear`, and `copy` without third-party code. Auto-run `initFastWorkbenches(document)` after `DOMContentLoaded` or immediately when the module executes after parsing.

- [ ] **Step 4: Run all fast-engine tests**

Run: `npm run test:fast`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/ymir-fast-core.test.mjs static/script/ymir-fast-core-v66.mjs
git commit -m "feat: progressively enhance fast workbenches"
```

### Task 3: Define the fast visual system under the CSS budget

**Files:**
- Create: `static/style/ymir-fast-core-v66.css`
- Modify: `tests/ymir-fast-core.test.mjs`

**Interfaces:**
- Styles only `ymir-fast-*`, shared `ymir-topbar`, `ymir-footer`, `ymir-page`, and retained content-card selectors required by the nine fast pages.
- Must not copy Element Plus CSS or import another stylesheet.

- [ ] **Step 1: Add a failing CSS budget test**

```js
test('fast CSS is standalone and below the 100 KB budget', () => {
  const cssPath = new URL('../static/style/ymir-fast-core-v66.css', import.meta.url);
  const css = fs.readFileSync(cssPath, 'utf8');
  assert.ok(Buffer.byteLength(css) < 100_000);
  assert.doesNotMatch(css, /@import|\.el-/);
  assert.match(css, /\.ymir-fast-workbench/);
  assert.match(css, /@media \(max-width:/);
  assert.equal((css.match(/{/g) || []).length, (css.match(/}/g) || []).length);
});
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --test --test-name-pattern="fast CSS" tests/ymir-fast-core.test.mjs`  
Expected: FAIL because the CSS file is missing.

- [ ] **Step 3: Implement the standalone CSS**

Create tokens and components for body, topbar, page width, workbench header, two-column editor grid, textareas/inputs, buttons, status, result metrics, retained help cards, footer, focus-visible states, dark theme, and breakpoints at 900 px and 640 px. Reserve editor height to keep CLS near zero. Avoid animations on the critical tool shell.

- [ ] **Step 4: Run and confirm GREEN**

Run: `npm run test:fast`  
Expected: PASS and CSS raw size below 100,000 bytes.

- [ ] **Step 5: Commit**

```bash
git add tests/ymir-fast-core.test.mjs static/style/ymir-fast-core-v66.css
git commit -m "feat: add compact core workbench styles"
```

### Task 4: Generate real initial workbenches for the eight core pages

**Files:**
- Create: `scripts/phase8-fast-core-layout.py`
- Create: `scripts/phase8-validate.mjs`
- Modify: `json/index.html`
- Modify: `base64/index.html`
- Modify: `urlencode/index.html`
- Modify: `formatjs/index.html`
- Modify: `regex/index.html`
- Modify: `textdiff/index.html`
- Modify: `txtcount/index.html`
- Modify: `unixtime/index.html`
- Modify: `package.json`

**Interfaces:**
- Generator owns exactly the section from `<!-- ymir-fast-workbench:start -->` through `<!-- ymir-fast-workbench:end -->` and versioned fast resource tags.
- Validator treats the eight slugs as fast pages and the other 142 as legacy pages.

- [ ] **Step 1: Write the failing phase-8 validator**

For every fast slug, assert:

```js
assert(html.includes('data-fast-tool="' + slug + '"'), `${slug}: real fast workbench missing`);
assert(html.includes('data-fast-input'), `${slug}: input controls missing`);
assert(html.includes('data-fast-output') || html.includes('data-fast-metric'), `${slug}: output controls missing`);
assert(html.includes('/static/style/ymir-fast-core-v66.css'), `${slug}: fast CSS missing`);
assert(html.includes('/static/script/ymir-fast-core-v66.mjs'), `${slug}: fast module missing`);
for (const heavy of HEAVY_FAST_FORBIDDEN) assert(!html.includes(heavy), `${slug}: heavy resource remains: ${heavy}`);
```

For the remaining 142 tool pages, retain the existing checks for `ymir-tool-bundle-v65.css`, manifest/app mapping, and workbench-first layout. Assert the fast script and CSS file sizes are below budget and syntax-check the module.

- [ ] **Step 2: Run and confirm RED**

Run: `node scripts/phase8-validate.mjs`  
Expected: FAIL on the first core page because it still contains an empty Vue root and heavy resources.

- [ ] **Step 3: Implement the deterministic generator**

Use BeautifulSoup with a `TOOL_CONFIGS` mapping. Generate semantic markup for four shapes:

- `text`: JSON, Base64, URL, JavaScript input/output.
- `regex`: pattern, flags, test text, match output.
- `diff`: original, changed, line-difference output.
- `metrics/time`: count cards or paired timestamp/date controls.

Replace the empty Vue root, no-script block, and static fallback with the real workbench followed by a concise `<noscript>` notice. Replace the heavy stylesheet and five runtime/app scripts with one fast stylesheet and one module script. Preserve all content from `.ymir-static-tool-lead` onward, canonical tags, JSON-LD, footer, and theme script.

- [ ] **Step 4: Run the generator twice and prove idempotence**

Run:

```powershell
python scripts/phase8-fast-core-layout.py
git diff --exit-code -- . ':!json/index.html' ':!base64/index.html' ':!urlencode/index.html' ':!formatjs/index.html' ':!regex/index.html' ':!textdiff/index.html' ':!txtcount/index.html' ':!unixtime/index.html' ':!package.json' ':!scripts/phase8-*' ':!tests' ':!static/script/ymir-fast-core-v66.mjs' ':!static/style/ymir-fast-core-v66.css'
$before = git diff --no-ext-diff
python scripts/phase8-fast-core-layout.py
$after = git diff --no-ext-diff
if ($before -ne $after) { throw 'Generator is not idempotent' }
```

Expected: no files outside the declared scope change, and the second generator run produces identical diff text.

- [ ] **Step 5: Switch validation command and confirm GREEN**

Update `package.json`:

```json
"remediate": "python3 scripts/phase8-fast-core-layout.py",
"validate": "node scripts/phase8-validate.mjs"
```

Run: `npm run test:fast && npm run validate`  
Expected: PASS for eight fast pages and 142 unchanged legacy pages.

- [ ] **Step 6: Commit**

```bash
git add package.json scripts/phase8-fast-core-layout.py scripts/phase8-validate.mjs json/index.html base64/index.html urlencode/index.html formatjs/index.html regex/index.html textdiff/index.html txtcount/index.html unixtime/index.html
git commit -m "feat: render core tool workbenches in initial HTML"
```

### Task 5: Put a real JSON workbench first on the homepage

**Files:**
- Modify: `scripts/phase8-fast-core-layout.py`
- Modify: `scripts/phase8-validate.mjs`
- Modify: `index.html`
- Modify: `static/script/ymir-home-dashboard.js`
- Modify: `tests/ymir-fast-core.test.mjs`

**Interfaces:**
- Homepage workbench uses `data-fast-tool="json"` and the same module controller.
- Full manifest loading moves behind `ensureHomeManifest()` invoked by search focus, directory interaction, or idle callback.

- [ ] **Step 1: Add failing homepage-order and resource tests**

```js
const home = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
test('homepage exposes a functional JSON workbench before marketing copy', () => {
  const workbench = home.indexOf('data-fast-tool="json"');
  const hero = home.indexOf('class="ymir-home-hero');
  assert.ok(workbench > 0 && hero > workbench);
  assert.match(home, /data-fast-action="formatJson"/);
  assert.doesNotMatch(home, /<script[^>]+ymir-tools-manifest\.js/);
});
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --test --test-name-pattern="homepage exposes" tests/ymir-fast-core.test.mjs`  
Expected: FAIL because the homepage has no fast workbench and still preloads the manifest.

- [ ] **Step 3: Extend the generator and dashboard lazy loading**

Insert a compact JSON workbench immediately after the topbar and before `.ymir-home-hero`. Add direct links to the other seven maintained tools. Add fast CSS and module tags once.

Remove the static manifest `<script>` tag. In `ymir-home-dashboard.js`, implement:

```js
function ensureHomeManifest() {
  if (window.YmirToolsManifest) return Promise.resolve(window.YmirToolsManifest);
  if (manifestPromise) return manifestPromise;
  manifestPromise = new Promise(function (resolve, reject) {
    var script = document.createElement('script');
    script.src = '/static/script/ymir-tools-manifest.js?v=20260809-v66';
    script.onload = function () { resolve(window.YmirToolsManifest); };
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return manifestPromise;
}
```

Call it on command-search `focus`/`pointerdown` and via `requestIdleCallback(..., { timeout: 2500 })` with a `setTimeout` fallback. Static core cards remain usable before the promise resolves.

- [ ] **Step 4: Run generator and tests**

Run: `python scripts/phase8-fast-core-layout.py && npm run test:fast && npm run validate`  
Expected: PASS; homepage workbench precedes hero and no blocking manifest tag remains.

- [ ] **Step 5: Commit**

```bash
git add index.html static/script/ymir-home-dashboard.js scripts/phase8-fast-core-layout.py scripts/phase8-validate.mjs tests/ymir-fast-core.test.mjs
git commit -m "feat: make the homepage tool immediately usable"
```

### Task 6: Verify functionality, budgets, SEO, and regressions

**Files:**
- Modify only if verification reveals a defect in the files owned by Tasks 1-5.
- Create: `.gstack/benchmark-reports/2026-08-09-fast-core-local.json` only if the benchmark tooling writes a report already ignored by Git.

**Interfaces:**
- No new production interface; this task proves the feature against the specification.

- [ ] **Step 1: Run the full repository suite**

Run: `npm run seo:check && npm run test:fast && npm run validate && npm run audit`  
Expected: every command exits 0; audit preserves 217 HTML files and 150 tools.

- [ ] **Step 2: Run HTTP smoke against a local static server**

Run one local server and then: `npm run smoke`  
Expected: homepage, eight fast pages, representative legacy pages, fast CSS, and fast module return 200.

- [ ] **Step 3: Browser-test the nine fast surfaces**

Verify desktop and mobile widths for `/`, the eight core routes, and at least two legacy routes. For every fast route, load a sample, execute the primary action, confirm the result, submit invalid input, confirm the old output disappears, copy, and clear. Confirm console has no errors and no request for forbidden heavy resources occurs on fast pages.

- [ ] **Step 4: Record deterministic resource evidence**

Run:

```powershell
$js=(Get-Item static\script\ymir-fast-core-v66.mjs).Length
$css=(Get-Item static\style\ymir-fast-core-v66.css).Length
if($js -ge 100000 -or $css -ge 100000){ throw "Budget exceeded: JS=$js CSS=$css" }
```

Expected: both values below 100,000.

- [ ] **Step 5: Compare browser performance under the same profile**

Capture FCP, LCP, DOM Interactive, full load, request count, and first-party transfer for homepage and `/json/`. Compare with the pre-change baseline or, when unavailable, record current absolute metrics plus removed raw resource totals. Confirm CLS remains near zero.

- [ ] **Step 6: Review final diff and commit verification fixes**

Run: `git diff --check && git status --short && git log -6 --oneline`  
Expected: no whitespace errors and no unrelated files.

If verification required changes:

```bash
git add <only-verified-fix-files>
git commit -m "fix: close fast workbench verification gaps"
```
