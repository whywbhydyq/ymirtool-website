# YmirTool legacy security migration report

## Scope

This pass continued the legacy security migration for old utility pages where user-controlled input could reach `.html()`, `innerHTML`, `document.write`, same-origin preview windows, or old formatter/highlighter libraries. The work focused on JSON tools, HTML/JS and Markdown conversion tools, RunJS/preview paths, Morse, URL decode, subnet, password, regex/code generation, text diff, and remaining CDN/highlight/prettify/Markdown/YAML dependencies.

## Completed changes

### User-input output hardening

- Replaced global `hightout(...)` output with inert `textContent` rendering. Generated code such as `document.write(...)` is now displayed as text, not interpreted as HTML.
- Reworked JSON/YAML parser messages to avoid `.html()` for user-visible parser output.
- Reworked JSON-to-Java and JSON-to-C#/Go related generated-code output so generated code is rendered as text.
- Reworked Pinyin, random number, Morse, UTF-8, regex-code, JSON-to-CSV, CSV/table, HTML/JS, HTML-filter, CSS/HTML/VBS formatter output paths to use text nodes, `.text()`, textarea values, or sandboxed preview.
- Reworked password output so generated passwords are appended as text nodes separated by `<br>` elements, rather than string-built HTML.
- Reworked text-diff output insertion to append the generated diff view node instead of passing it through `.html(...)`.
- Reworked text effect preview so preview nodes are created with DOM APIs while generated HTML remains inert text in the code output.
- Reworked XPath image preview to create image elements through DOM APIs instead of concatenating HTML strings.

### Preview and generated HTML isolation

- Replaced RunJS same-origin `window.open + document.write` preview with a sandboxed iframe.
- Replaced the legacy `tools-lib.js` preview/save path with sandboxed iframe preview and Blob download.
- Reworked HTML table preview to render generated markup inside a sandboxed iframe.
- Reworked subnet result table insertion to use controlled fragment insertion and direct event binding, removing the previous inline `<script>` injection string.
- Reworked JSON viewer result insertion to use controlled fragments after escaping parser values, instead of writing result strings directly through jQuery `.html(...)` or `innerHTML` on the result container.

### Legacy dependency cleanup

- Replaced third-party Bootstrap CSS CDN references with local `static/style/bootstrap-compat.css`.
- Removed `cdn.staticfile.org` font/preload/preconnect paths and converted `font-fix.css` to a local shim.
- Replaced the old Markdown parser bundle with a small local Markdown-to-HTML implementation that does not use `eval`, `new Function`, or raw HTML passthrough.
- Replaced the old Prettify bundle with a no-op compatibility shim because generated-code outputs now render as inert text.
- Removed the `new Function("return this")()` global fallback from the local YAML bundle.
- Replaced the old `htmlescape.js` bundled library with a minimal escape/unescape utility; the remaining detached `textarea.innerHTML` path is used only for entity decoding and is not inserted into the live document.

### CSP and external sources

- `Content-Security-Policy-Report-Only` remains in place while inline handlers are still present.
- `'unsafe-eval'` remains absent.
- Active `cdn.staticfile.org`, cdnjs, jsDelivr, unpkg, BootstrapCDN, Google Fonts, and gstatic font references were not found in the final HTML/CSS/JS scan.
- AdSense and Vercel Insights remain external by design.

## Verification performed

No `npm run build` was run. No lint, typecheck, browser test, or test suite was run.

Performed only static checks:

- `node --check` on modified JavaScript and MJS files.
- Focused grep scans for `.html(`, `innerHTML =`, `insertAdjacentHTML`, `document.write(`, `document.writeln(`, `eval(`, `new Function`.
- Focused grep scans for active third-party CDN/font references.
- ZIP integrity check after packaging.

## Final focused scan status

Remaining focused-scan hits are not live user-input execution paths:

- `static/script/pcjs/html2js.js` contains generated `document.writeln(...)` text for the HTML-to-JS converter.
- `static/script/tools-lib.js` contains generated `document.write(...)` / `document.writeln(...)` text for conversion tools.
- `static/script/pcjs/htmlescape.js` contains detached `textarea.innerHTML` only for entity decoding.

These should stay inert. Do not route their output into same-origin previews or raw HTML containers.

## Remaining known risks

- Many legacy HTML pages still contain inline event handlers and `href="javascript:;"`; CSP cannot be switched from Report-Only to strict enforcement until these are migrated.
- Several older pages still depend on broad legacy script files. They are reduced but not fully modernized.
- `formatvbs/index.html` still includes `document.write(...)` only as sample textarea content.
- Browser-level regression specs were added in the previous pass but were not run here.
- GBK/UTF-8 mixed files still exist. They should be converted one tool at a time to avoid accidental mojibake regressions.

## Maintenance rules

1. User input must enter the DOM through `textContent`, `.text()`, form values, explicit DOM node creation, or sandboxed iframe `srcdoc`.
2. Do not reintroduce same-origin `window.open + document.write` previews.
3. Code-generation tools may output `document.write(...)` as text only.
4. Do not pass pasted HTML, Markdown, CSV, YAML, JSON parser errors, URL-decoded text, or generated code through raw `.html()`.
5. Keep CSP in Report-Only until inline handlers and `javascript:` links are removed.
6. Do not add new third-party CDN assets unless they are essential and explicitly represented in CSP.
7. Convert encoding-mixed legacy files incrementally and check each page after conversion.

## Inline handler / javascript href migration pass

This pass migrated active HTML inline event handler attributes and `href="javascript:..."` links across the legacy static pages.

### Completed changes in this pass

- Added `static/script/csp-compat-events.js`, a compatibility bridge that delegates legacy click/change/key/focus/submit/paste handlers from external JavaScript instead of inline HTML attributes.
- Converted active `onclick`, `onchange`, `onkeyup`, `onkeydown`, `onkeypress`, `onmouseover`, `onmouseout`, `onsubmit`, `onfocus`, `onblur`, `oninput`, `onload`, `onresize`, and `onafterpaste` attributes in HTML pages to `data-csp-*` attributes.
- Converted active `href="javascript:"`, `href="javascript:;"`, and `href="javascript:void(0)"` links to `href="#" data-jsvoid="true"`.
- Preserved legacy behavior through a no-eval dispatcher for the common old patterns: direct global function calls, `this.form` calls, numeric field sanitization, focus/select helpers, jQuery value clearing, `Public.TableSearch(...)`, and a limited computed jQuery value case used by the htpasswd tool.
- Inserted the compatibility bridge into HTML pages so migrated controls keep working without requiring inline event execution.

### Verification for this pass

No `npm run build` was run. No lint, typecheck, browser test, or test suite was run.

Performed only static checks:

- `node --check static/script/csp-compat-events.js`.
- Active HTML tag scan for inline event attributes: `0` remaining.
- Active HTML tag scan for `href="javascript:..."`: `0` remaining.
- One remaining raw `href="javascript:..."` string exists only as visible regex-reference text in `regexsucha/index.html`, not as an active anchor tag.

### Remaining known risks after this pass

- The site still contains inline `<script>` blocks and legacy external scripts that assign handlers through DOM properties such as `.onclick = ...`. Those are not HTML inline event attributes, but they still need modernization before CSP can be made strict without `'unsafe-inline'`.
- The `data-csp-*` bridge is a transitional compatibility layer. It removes browser-executed inline handlers without using `eval`, but the long-term target should be page-specific external listeners instead of storing legacy handler snippets in HTML data attributes.
- Browser-level regression tests for JSON tools, RunJS, URL decoding, Morse, and subnet calculation still need to be run outside this no-test pass.

## Executable inline script / DOM property handler migration pass

This pass continued from the inline-handler migration ZIP and focused on the remaining CSP blockers that were not HTML event attributes.

### Completed changes in this pass

- Externalized 66 active executable inline JavaScript blocks from legacy HTML pages into `static/script/page-inline/*.js`.
- Preserved script execution order by replacing each executable inline block with a normal external `<script src="/static/script/page-inline/...js">` tag at the same location in the HTML.
- Left inline `application/ld+json` schema blocks unchanged because they are structured data, not executable page logic.
- Left empty inline script tags unchanged; they contain no executable code and can be removed in a later cleanup-only pass.
- Restored `formatvbs/index.html` after detecting that the page contains a literal `<script type="text/vbscript">` sample inside a `<textarea>`. That sample is page content, not executable page JavaScript, and must not be externalized.
- Migrated first-party DOM property handler assignments in these files to `addEventListener`-style bindings:
  - `static/script/tools-lib.js`
  - `static/script/json/jsonjs.js`
  - `static/script/pcjs/shizhong.js`
  - `static/script/pcjs/txtcount.js`
  - `static/script/page-inline/img2base64-index-01-70903273.js`
- Added small `legacyBindEvent` / `legacyBindEvents` helpers inside `tools-lib.js` so old tool modules can migrate incrementally without changing their public API.

### Verification for this pass

No `npm run build` was run. No lint, typecheck, browser test, or test suite was run.

Performed only static checks:

- `node --check` on all newly externalized `static/script/page-inline/*.js` files.
- `node --check` on modified first-party scripts: `tools-lib.js`, `jsonjs.js`, `shizhong.js`, `txtcount.js`.
- HTML script scan after this pass:
  - executable inline JavaScript blocks: `0`
  - inline `application/ld+json` blocks: `151`
  - empty inline script blocks: `138`
- Active raw HTML inline event handler scan: `0`.
- Active raw `href="javascript:..."` scan: `0` active links. One literal `href="javascript:..."` string remains as regex-reference text in `regexsucha/index.html`.
- First-party DOM property assignment scan, excluding vendored/minified libraries: no active `.onclick =`, `.onfocus =`, `.onchange =`, `.onload =`, `.onkeyup =`, `.onkeydown =`, `.onkeypress =`, `.onmouseover =`, `.onmouseout =`, or `.onsubmit =` assignments found.

### Remaining known risks after this pass

- `data-csp-*` attributes still remain as a transitional compatibility layer. They no longer rely on browser-executed inline event handlers, but they still store legacy handler snippets in HTML and should be replaced gradually with page-specific external listeners.
- Vendored/minified libraries such as CodeMirror, KindEditor, layer, oCanvas, jQuery, and clipboard still contain their own legacy event internals. Those should be audited separately before tightening CSP further, especially if any are no longer needed by active tools.
- Inline JSON-LD remains inline. If the final enforced CSP policy reports on JSON-LD blocks, either add hashes/nonces or move structured data to external JSON files/templates.
- Empty inline script tags remain. They are not executable but should be removed in a cleanup pass before final CSP enforcement to reduce scanner noise.
- Browser-level regression specs still have not been run in this pass.

## Page-specific listener migration / cleanup pass

This pass continued from the executable-inline-script ZIP and focused on the remaining transitional CSP blockers.

### Completed changes in this pass

- Removed 138 empty inline `<script></script>` blocks from legacy HTML pages. These blocks were non-executable, but they created scanner noise and made the final CSP review harder.
- Migrated all remaining `data-csp-*` compatibility attributes into page-specific external listener files under `static/script/page-listeners/*.js`.
- Generated 106 page listener files and moved 624 legacy event snippets out of HTML attributes.
- Updated `static/script/csp-compat-events.js` to expose a limited `window.YmirCspCompat.runCode(...)` dispatcher so page-specific listeners can call the existing no-eval compatibility layer without storing handler snippets in HTML.
- Extended the dispatcher to resolve both `$()` and `jQuery()` value arguments used by legacy HTML/JS conversion pages.
- Kept `data-jsvoid="true"` only as a passive marker for old `href="#"` controls that should not jump the page. It no longer carries executable handler code.
- Reworked `static/script/huaban/ga.js` so drawing export no longer uses `window.open + document.write(...)`; it now creates the preview image with DOM APIs in the opened window.

### Structured data decision

Inline `application/ld+json` blocks were intentionally left in place. Moving JSON-LD to a plain external `src` script is not a safe final fix because structured-data extraction is most reliable when the JSON-LD is present in the page. The safer final options are:

1. keep JSON-LD inline and allow it with CSP hashes/nonces; or
2. generate per-page CSP headers/hashes if the deployment platform can support them without an oversized global header; or
3. remove/centralize schema only after confirming there is no SEO loss.

This pass did not sacrifice structured data for a cleaner static scan.

### Vendored / minified library audit notes

Focused static audit found these remaining library risk classes:

- `static/kindeditor/kindeditor-all-min.js`: contains `eval`, `new Function`, `Function(...)`, `innerHTML`, and jQuery-style `.html(...)` internals. It is loaded by `editor/index.html` and should be isolated or replaced before strict CSP enforcement.
- `static/script/codemirror/*`: core CodeMirror is broadly needed by code formatters, but the old unpacker helpers include `eval(...)` / generated-code patterns. Keep them isolated to formatter pages and do not expose them to user-controlled preview execution.
- `static/script/huaban/zepto.min.js`: contains old AJAX/script parsing internals and raw HTML helpers. It is limited to `tuya/index.html`.
- `static/script/jquery-1.7.1.min.js`: only found on `formatfilter/index.html` and should be removed in a later compatibility pass if the page works with the already-loaded local `jquery-1.11.3.min.js`.
- `static/script/layer/layer.js`: contains old `document.write` / HTML insertion internals, but no active HTML page reference was found in this pass.
- `static/script/jquery-1.11.3.min.js`: still contains normal jQuery DOM HTML internals. This is not automatically a vulnerability, but old pages must avoid feeding user input into `.html(...)`.

### Verification for this pass

No `npm run build` was run. No lint, typecheck, browser test, or test suite was run.

Performed only static checks:

- `node --check static/script/csp-compat-events.js`.
- `node --check` on all generated `static/script/page-listeners/*.js` files.
- `node --check static/script/huaban/ga.js`.
- Active HTML inline event handler scan: `0`.
- Active `href="javascript:..."` scan: `0`.
- `data-csp-*` attribute scan: `0`.
- Empty inline `<script>` scan: `0`.
- Inline JSON-LD scan: `151` retained intentionally.
- ZIP integrity check should be run after packaging.

### Remaining known risks after this pass

- `static/script/csp-compat-events.js` still contains a compatibility dispatcher. It no longer reads handler snippets from HTML attributes, but generated page listeners still call it. Long term, high-value pages should replace dispatcher calls with direct, explicit handler functions.
- `data-jsvoid="true"` passive markers remain on old controls. They do not contain code, but can be removed once each page listener prevents default directly or buttons replace old anchors.
- Vendored libraries remain the main strict-CSP risk. `editor/index.html`, formatter pages using old CodeMirror unpackers, and `tuya/index.html` should be isolated or rewritten before switching CSP from Report-Only to enforced.
- Inline JSON-LD still needs a final CSP strategy. Do not move it blindly to external `src` JSON-LD without validating structured-data visibility.
- Browser-level regression specs still have not been run in this no-test pass.

## Function and interaction integrity audit pass

This pass reviewed the page-specific listener migration for behavior regressions introduced by removing inline handlers and `data-csp-*` attributes.

### Issues found and fixed

- `useragent/index.html` still had 34 active `onmouseover="javascript:this.select();"` attributes. They were missed by earlier text scans because the legacy markup omits whitespace between attributes. These handlers were migrated to `static/script/page-listeners/useragent-index.js` using explicit `mouseover` listeners.
- `static/script/csp-compat-events.js` did not correctly resolve nested safe wrapper arguments such as `hightout(escape(jQuery('#content').val()))` and `hightout(unescape(jQuery('#content').val()))`. This would have broken the Escape/Unescape tool by passing the literal expression text instead of the textarea value. The dispatcher now resolves `escape(...)`, `unescape(...)`, `encodeURIComponent(...)`, and `decodeURIComponent(...)` wrapper arguments without using `eval`.
- `formatvbs/index.html` contained a sample `<script>` string inside a textarea in a form that confused HTML parsers and CSP scanners. It is now entity-encoded as textarea content, preserving the visible sample while preventing it from being parsed as an executable script block.

### Interaction completeness checks performed

No `npm run build` was run. No lint, typecheck, browser test, or test suite was run.

Performed only static and syntax checks:

- `node --check static/script/csp-compat-events.js`.
- `node --check` on all `static/script/page-listeners/*.js` files, including the new `useragent-index.js`.
- Verified every referenced `static/script/page-listeners/*.js` file exists.
- Verified every generated listener class in spec-based listener files appears exactly once in its corresponding HTML page.
- Verified `static/script/csp-compat-events.js` is loaded before generated spec-based page listeners.
- Parsed HTML with a DOM parser and confirmed:
  - active inline event handler attributes: `0`
  - active `href="javascript:..."` anchors: `0`
  - `data-csp-*` executable bridge attributes: `0`
  - executable inline JavaScript blocks: `0`
  - empty inline script blocks: `0`
  - inline JSON-LD blocks retained intentionally: `151`
- Confirmed page listener script references are complete: 107 listener files referenced by HTML and 107 listener files present on disk.

### Remaining limitations

- This pass verifies wiring, syntax, and CSP-blocking markup. It does not prove every legacy tool calculation is correct at runtime because browser-level regression tests were intentionally not run.
- Dynamic script loading through `setJS(...)` remains part of several legacy pages. The listener files preserve the old behavior, but future hardening should gradually replace dynamic loaders with static script tags on high-value tools.
- Vendored libraries remain the main strict-CSP risk and should be handled in separate, tool-specific passes.

## Interaction hardening continuation pass

This pass continued after the static interaction integrity audit. The focus was to remove remaining execution blockers that would break a stricter CSP or weaken user-input handling, without running the build or test suite.

### Completed changes in this pass

- Replaced the packed `static/script/keyboard.js` script with readable keydown handling using `addEventListener`. The keyboard test still exposes `keyboard_reset()` for the existing listener wiring.
- Replaced the packed annual-interest inline script in `static/script/page-inline/nianlvli-index-01-d4e71d60.js` with readable jQuery click handlers. The two calculator buttons keep the original formulas.
- Removed the last active-looking `href="javascript:..."` scanner hit in `regexsucha/index.html` by entity-encoding the regex example text. It was not an active anchor, but it created a false positive.
- Replaced remaining first-party `.html('')` / `.html(result)` sinks in page-inline reset scripts, RMB uppercase output, formatter reset logic, and CodeMirror test output with text or DOM-safe clearing.
- Reworked `static/script/pcjs/websocket.js` so WebSocket events use `addEventListener`, and server/user messages are appended as text nodes instead of interpolated HTML.
- Replaced the old `static/script/jsformat/common.js` base2/Packer dependency with a small CSP-safe `Packer` compatibility shim. It preserves the existing `new Packer().pack(input, base62)` call shape used by legacy formatter pages, but no longer performs dynamic code execution at load time.
- Reworked `static/script/jsformat/jsendecode.js` so decode uses a dedicated safe unpacker for common packed-code output instead of executing user-provided code.
- Replaced the old CodeMirror p.a.c.k.e.r and myobfuscate unpackers with safe text parsers. They no longer execute user-provided packed scripts to obtain output.
- Patched old vendored JSON parsing paths in `jquery-1.7.1.min.js` and `kindeditor-all-min.js` to prefer native `JSON.parse` instead of dynamic code execution.
- Replaced KindEditor’s dynamic template constructor with a restricted interpolation-only compatibility helper. This avoids dynamic code execution, but the editor page should still be considered legacy and should be browser-regressed before it is treated as high-confidence.
- Removed the remaining active `document.write("")` path from `static/script/layer/layer.js` iframe cleanup.
- Removed external `http://...` CSS image dependencies from `static/style/subnetmask.css`.
- Tightened the Report-Only CSP in both `vercel.json` and `netlify.toml` by removing `'unsafe-inline'` from `script-src`. `style-src 'unsafe-inline'` remains because the legacy HTML still contains many inline `style` attributes.

### Verification for this pass

No `npm run build` was run. No lint, typecheck, browser test, or test suite was run.

Performed only static and syntax checks:

- `node --check` on the modified scripts from this pass:
  - `static/script/keyboard.js`
  - `static/script/page-inline/nianlvli-index-01-d4e71d60.js`
  - `static/script/page-inline/jsonlrview-index-01-f019652d.js`
  - `static/script/page-inline/jsonudview-index-01-bc114206.js`
  - `static/script/page-inline/rmbdaxie-index-01-677b25a6.js`
  - `static/script/jsformat/common.js`
  - `static/script/jsformat/jsendecode.js`
  - `static/script/jquery-1.7.1.min.js`
  - `static/kindeditor/kindeditor-all-min.js`
  - `static/script/pcjs/websocket.js`
  - `static/script/csp-compat-events.js`
  - `static/script/jsformat/formatjs.js`
  - `static/script/codemirror/allformat_html.js`
  - `static/script/codemirror/p_a_c_k_e_r_unpacker.js`
  - `static/script/codemirror/myobfuscate_unpacker.js`
  - `static/script/layer/layer.js`
- HTML scan results after this pass:
  - active inline event handler attributes: `0`
  - active `href="javascript:..."` anchors: `0`
  - `data-csp-*` executable bridge attributes: `0`
  - executable inline JavaScript blocks: `0`
  - empty inline script blocks: `0`
  - inline JSON-LD blocks retained intentionally: `151`
- Listener reference check:
  - HTML references to `static/script/page-listeners/*.js`: `107`
  - missing referenced listener files: `0`
  - unreferenced listener files: `0`
- Static scan now finds no first-party executable `eval(...)` calls. Remaining scan noise is mostly vendored library internals and generated-code text such as HTML-to-JS tools intentionally producing `document.write(...)` text for the user.

### Remaining limitations

- Browser-level regression has still not been run. The largest areas needing real browser checks are `editor/index.html`, JS formatter/packer pages, WebSocket tester, keyboard tester, JSON visualizer pages, and subnet calculator.
- `kindeditor-all-min.js` still contains substantial legacy HTML manipulation internals. This pass removed the most direct dynamic-code constructors, but the editor should eventually be replaced or isolated.
- `jquery-1.11.3.min.js`, `jquery-1.7.1.min.js`, `layer.js`, `zepto.min.js`, `oCanvas`, and CodeMirror still contain legacy DOM internals. Those are not automatically exploitable, but user input must not be fed into raw HTML sinks.
- Strict enforced CSP is still not recommended until a browser-level pass confirms key tool functionality under the stricter Report-Only policy.

## P0 CSP hardening execution pass

- Replaced the calculator page expression evaluator in `static/script/ymir-tools.js` with a small recursive-descent parser for numbers, parentheses, unary `+/-`, `+`, `-`, `*`, `/`, and `%`. The calculator no longer uses `Function(...)` or any eval-like runtime compiler.
- Replaced string timers with function references:
  - `static/script/pcjs/reload.js`: `setInterval(refresh, ...)`
  - `static/script/page-inline/worldtime-index-01-cf41bb61.js`: `setTimeout(GetTime, 1000)`
- Reworked `static/script/tool.js` `setJS(...)` into a serial loader with optional callback support. This reduces dependency races on legacy pages that dynamically load CodeMirror, formatter, JSON, encryption, and converter scripts.
- Updated page-inline dynamic-loader callers that had code immediately after `setJS(...)` so dependency-dependent initialization now runs in the loader callback. This covers CodeMirror formatter pages, JSON-to-Go initialization, JSON view `Empty()` globals, and RMB conversion.

Validation performed in this pass:

- `node --check` on modified scripts and all page-inline scripts.
- Focused static scan for `Function(...)`, `new Function`, `eval(`, `setInterval("...")`, and `setTimeout("...")` in first-party scripts.

Not performed:

- No `npm run build`.
- No test/lint/typecheck command.
- No browser-level regression run.

Remaining notes:

- Some vendored/minified libraries still contain textual or framework-internal `Function` references and should remain on the long-term isolation/replacement list.
- CSP report collection was not added because this static project currently has no report ingestion endpoint. Adding `report-uri` without a real endpoint would create noisy failed POST requests rather than actionable telemetry.

Additional interaction integrity fix in this pass:

- Replaced generated JSON viewer collapse controls in `static/script/json/jsonjs.js` from inline `onclick="hide(this)"` markup to delegated `data-json-toggle` click handling. This matters because the markup is generated at runtime and would still fail under a strict script CSP even though source HTML inline handlers were already removed.

## P1 listener direct-migration pass

This pass continues after the P0 CSP hardening work and focuses on removing the transitional `YmirCspCompat.runCode(...)` dependency from high-value tool pages.

Migrated from generated string-dispatch listeners to page-level direct listeners:

- JSON tools:
  - `json2yaml`, `json2java`, `json2xml`, `json2go`, `json2cs`, `json2get`, `jsonzip`, `jsonlrview`, `jsonudview`, `json2excel`
- Formatter tools:
  - `autoformat`, `formathtml`, `formatcss`, `formatjava`, `formatxml`, `formatfilter`, `formatsql`, `formatc`, `formatcpp`, `formatcs`, `formatcsql`, `formatperl`, `formatphp`, `formatpy`, `formatruby`, `formatvbs`, `htaccess2nginx`
- Network/text utilities:
  - `subnetmask`, `morse`, `urlcode`, `urlthunder`, `endecodejs`, `escape`

Implementation notes:

- The migrated listener files no longer store old handler snippets and no longer call `YmirCspCompat.runCode(...)`.
- Simple global actions now call fixed global functions directly through a small helper.
- `this.form` actions now pass the current element's form explicitly.
- jQuery formatter calls such as `$('#content').format({ method: 'xml' })` are now direct page-level handler bodies.
- Escape/unescape actions on `escape/index.html` now read the textarea value and call `hightout(...)` directly without legacy snippet dispatch.
- `static/script/csp-compat-events.js` was simplified: the dead `data-csp-*` delegated bridge was removed because all `data-csp-*` HTML attributes have already been migrated. It still exposes `YmirCspCompat.runCode(...)` for the remaining lower-priority legacy listener files and keeps a tiny global `data-jsvoid` preventDefault guard.

Validation performed in this pass:

- No `npm run build`.
- No test/lint/typecheck command.
- `node --check` on all JS/MJS files: `339 / 339` passed.
- Static scan after this pass:
  - active inline event handler attributes: `0`
  - active `href="javascript:..."` anchors: `0`
  - `data-csp-*` executable bridge attributes: `0`
  - executable inline JavaScript blocks: `0`
  - empty inline script blocks: `0`
  - inline JSON-LD blocks retained intentionally: `151`
  - missing `static/script/page-listeners/*.js` references: `0`
  - page listener files still depending on `YmirCspCompat.runCode(...)`: `73`
  - migrated priority listener files still depending on `YmirCspCompat.runCode(...)`: `0`

Remaining notes:

- 73 lower-priority legacy listener files still use the restricted `YmirCspCompat.runCode(...)` dispatcher. These are mostly calculator/conversion pages, encryption pages, and miscellaneous old utilities.
- `csp-compat-events.js` is still loaded broadly for compatibility. It can only be removed after the remaining 73 listener files are migrated or after those pages are confirmed no longer need it.
- Browser-level regression has still not been run.

## 2026-05-30 - P1 full direct listener migration

This pass continues after the first P1 migration and removes the remaining lower-priority listener dependency on `YmirCspCompat.runCode(...)`.

### Changes

- Migrated the remaining 73 generated page listener files from the restricted compatibility dispatcher to page-local direct action handlers.
- Covered calculator/conversion pages, encryption/hash pages, HTML/code conversion pages, table search pages, text tools, drawing/editor utility entry points, WebSocket, RunJS, and miscellaneous legacy tools.
- Simplified `static/script/csp-compat-events.js` to a tiny `data-jsvoid="true"` placeholder-link guard only. It no longer exposes or contains a run-code dispatcher.
- Updated `scripts/security-regression.mjs` so every file in `static/script/page-listeners/` is expected to be a direct listener with no `YmirCspCompat.runCode` dependency.

### Static verification

- JS syntax check: 336 / 336 files passed via `node --check`.
- Page listener files: 107.
- HTML listener references: 107.
- Missing listener files: 0.
- Page listener files still using the old dispatcher: 0.
- `static/script` occurrences of `YmirCspCompat.runCode`: 0.
- Active inline event handlers: 0.
- Active `href="javascript:..."`: 0.
- `data-csp-*`: 0.
- Executable inline JavaScript blocks: 0.
- Empty inline script blocks: 0.
- Static `eval(...)`: 0.
- Static `new Function(...)`: 0.
- String timer calls: 0.
- Inline JSON-LD: 151, intentionally retained for structured data stability.

### Remaining notes

- `csp-compat-events.js` is still loaded by all HTML pages only to prevent default navigation on 224 remaining `data-jsvoid="true"` placeholder anchors. The next cleanup target is to convert those anchors to buttons or page-local preventDefault handlers and then remove this global guard from pages that do not need it.
- This pass is still static verification only. Browser-level regression should be run separately for the high-value legacy tools before switching CSP from Report-Only to enforcement.

## 2026-05-30 - CSP compatibility guard scope reduction

After all page listeners were migrated to direct handlers, `csp-compat-events.js` was no longer needed for event dispatch. This follow-up removed its script tag from pages that do not contain `data-jsvoid="true"` placeholder anchors.

### Changes

- Removed `csp-compat-events.js` from 70 HTML pages that no longer need it.
- Kept `csp-compat-events.js` on the 112 pages that still contain `data-jsvoid="true"`, where it only prevents `href="#"` placeholder navigation.

### Static verification

- HTML files with `data-jsvoid="true"` but no guard: 0.
- HTML files with the guard but no `data-jsvoid="true"`: 0.
- Remaining `csp-compat-events.js` references: 112.
- Remaining `data-jsvoid="true"` anchors: 224.

### Remaining note

The next cleanup target is to convert the 224 placeholder anchors to semantic buttons or page-local handlers. After that, `csp-compat-events.js` can be removed entirely.


## 2026-05-30 pass 10: remove data-jsvoid placeholder bridge

After all page listeners were migrated to direct handlers, the remaining global placeholder-link guard was removed. This pass moved the remaining behavior into page-local listeners and removed the passive HTML marker.

Changes:

- Removed `data-jsvoid="true"` from 224 old placeholder anchors.
- Removed `/static/script/csp-compat-events.js` from the 112 HTML pages that still referenced it.
- Deleted `static/script/csp-compat-events.js`.
- Updated page listener wrappers so click handlers for local `href="#"` controls prevent default navigation directly.
- Kept Bootstrap dropdown anchors as plain `href="#"`; Bootstrap's dropdown plugin owns the dropdown behavior.

Validation summary:

- `data-jsvoid="true"`: 0.
- `csp-compat-events.js` references in HTML: 0.
- `static/script/csp-compat-events.js`: removed.
- Page listener references: still complete.
- No inline event handlers, executable inline scripts, `data-csp-*`, active `href="javascript:..."`, `eval(`, `new Function(...)`, or string timers were reintroduced.

Remaining note:

Some pages still use plain `href="#"` for Bootstrap dropdown toggles and legacy in-page controls. This is acceptable when the behavior is handled by Bootstrap or by a page-local listener. The remaining CSP work is now focused on browser-level regression, old library isolation, and inline style migration.

## 2026-05-30 pass 11: old library isolation and first inline-style migration

This pass starts the old vendored-library isolation phase and the first targeted inline-style cleanup. It does not replace every legacy library; it removes avoidable legacy dependencies from hot pages and limits high-risk editor/helper surfaces.

### Old library isolation changes

- `formatfilter/index.html`
  - Removed the duplicate `/static/script/jquery-1.7.1.min.js` load.
  - Deleted `static/script/jquery-1.7.1.min.js` after confirming no active HTML page references it.
  - Updated `static/script/pcjs/htmlfilter.js` to use jQuery 1.11.3-compatible `.prop('checked')` state handling and `change` events.
  - Custom filter mode now escapes literal search text before creating `RegExp`, avoiding accidental regex injection from user-provided replacement text.

- `tuya/index.html`
  - Removed `/static/script/huaban/zepto.min.js`.
  - Deleted `static/script/huaban/zepto.min.js` after the page no longer references it.
  - Rewrote `static/script/huaban/ga.js` controls with vanilla DOM event listeners while keeping the oCanvas drawing engine and hotkey behavior.
  - The drawing page remains isolated to `tuya/index.html`; oCanvas is still a legacy vendored dependency but is no longer paired with Zepto.

- CodeMirror formatter pages
  - Updated `formatcs`, `formatjava`, `formatperl`, `formatpy`, and `formatruby` page-inline loaders.
  - Removed default loading of unused `sanitytest.js` and old optional unpacker helpers from those formatter pages.
  - Kept CodeMirror and beautifier assets needed for visible formatting behavior.
  - Hardened `static/script/codemirror/allformat_html.js` so optional unpackers are only used when their globals are present.

- `editor/index.html` / KindEditor
  - Kept KindEditor page-local to the editor page.
  - Tightened the KindEditor configuration: `filterMode`, `wellFormatMode`, no upload/file-manager, no remote image insertion, and no toolbar exposure for flash/media/image insertion.
  - This does not modernize KindEditor; it reduces reachable high-risk editor features while preserving the basic rich-text editor.

### Browser regression assets

- Expanded `tests/browser-regression.spec.mjs` with focused checks for:
  - `editor/`
  - `formatfilter/`
  - `formatjava/`
  - `tuya/`
  - `hexrgb/`
- Added `BROWSER_REGRESSION_CHECKLIST.md` with manual/Playwright validation points for the old-library pages.
- These assets were not executed in this pass.

### Inline style cleanup started

- Added `/static/style/page-hexrgb.css`.
- Migrated the large HEX/RGB color table in `hexrgb/index.html` away from inline `style="background-color: rgb(...)"` swatches and into generated CSS classes.
- Moved the page title, conversion label, output input background, and option block styles into the page stylesheet.
- `hexrgb/index.html` inline style attributes dropped from about 477 to 16. The remaining ones are mostly shared nav-highlight and old minor utility styles, not the color table swatches.

### Static verification

- No `npm run build`.
- No test/lint/typecheck command.
- `node --check` was run against JS/MJS files.
- Active HTML references to `jquery-1.7.1.min.js`: 0.
- Active HTML references to `zepto.min.js`: 0.
- `static/script/jquery-1.7.1.min.js`: removed.
- `static/script/huaban/zepto.min.js`: removed.
- Active inline event handlers: still 0.
- Active `href="javascript:..."`: still 0.
- `data-csp-*`: still 0.
- `data-jsvoid`: still 0.
- Executable inline JavaScript blocks: still 0.
- Empty inline scripts: still 0.
- Inline JSON-LD: still intentionally retained.

### Remaining notes

- KindEditor, CodeMirror core, oCanvas, old jQuery 1.11.3, and Bootstrap JS remain legacy dependencies. They are now more tightly scoped, but browser-level regression is still required before CSP enforcement.
- Inline style cleanup has only started. The next targets should be `useragent/index.html`, `regexsucha/index.html`, `keyboardtest/index.html`, `browserinfo/index.html`, and `tuya/index.html`.

## 2026-05-30 pass 12: full inline style migration

This pass continues after the old-library isolation work and moves the inline-style cleanup from targeted pages to the whole static site.

### Inline style changes

- Added `/static/style/inline-style-migration.css` for legacy inline declarations that were repeated across old static pages.
- Migrated all remaining live `style="..."` HTML attributes into generated CSS classes.
- Moved the remaining inline `<style>` blocks into external stylesheets:
  - `404.html` -> `/static/style/page-404.css`
  - `bootstrapicon/index.html` -> `/static/style/page-bootstrapicon.css`
  - `tuya/index.html` -> `/static/style/page-tuya.css`
- Removed the default live inline `<style>` block from `htmltable/index.html`; the table preview is still generated by `static/script/pcjs/htmltable.js` inside a sandboxed iframe at runtime.
- Kept generated HTML table code as user-facing output text/iframe preview behavior rather than treating the generated code string as parent-page CSS.

### Scope

- The migration includes the previously prioritized pages:
  - `useragent/index.html`
  - `regexsucha/index.html`
  - `keyboardtest/index.html`
  - `browserinfo/index.html`
  - `tuya/index.html`
  - `calcvolume/index.html`
- It then expands to the rest of the static HTML pages.

### Static verification

- No `npm run build`.
- No test/lint/typecheck command.
- `node --check` was run against JS/MJS files.
- HTML inline `style` attributes: 0.
- HTML inline `<style>` blocks: 0.
- Active inline event handlers: still 0.
- Active `href="javascript:..."`: still 0.
- `data-csp-*`: still 0.
- `data-jsvoid`: still 0.
- Executable inline JavaScript blocks: still 0.
- Empty inline scripts: still 0.
- Inline JSON-LD: still intentionally retained.

### Remaining notes

- This removes the main parent-page blocker for eventually dropping `style-src 'unsafe-inline'`, but runtime browser regression is still required before enforcing the final CSP.
- Some tools intentionally generate HTML/CSS strings for users, especially the HTML table generator. Those generated strings are treated as user output and sandboxed preview content, not parent-page inline style.
- Legacy CSS has been externalized, not redesigned. Visual regression should be checked on high-layout-risk pages before deployment.

## 2026-05-30 pass 13: CSP report-only strategy closure

This pass does not switch the site to enforced CSP. It closes the report-only observation loop so production or local browser runs can surface real violations before enforcement.

### Header strategy changes

- `vercel.json` remains on `Content-Security-Policy-Report-Only`.
- `netlify.toml` remains on `Content-Security-Policy-Report-Only`.
- Added CSP reporting directives:
  - `report-uri /api/csp-report`
  - `report-to ymir-csp-report`
- Added reporting headers:
  - `Reporting-Endpoints: ymir-csp-report="/api/csp-report"`
  - `Report-To: {"group":"ymir-csp-report", ...}`
- Report-only `style-src` was tightened from `style-src 'self' 'unsafe-inline'` to `style-src 'self'` so runtime inline-style regressions can be observed without blocking users.

### Report endpoints

- Added `api/csp-report.js` for Vercel deployments.
- Added `netlify/functions/csp-report.js` as a Netlify fallback.
- Added a Netlify redirect from `/api/csp-report` to `/.netlify/functions/csp-report`.
- Both endpoints:
  - accept POST only;
  - return 204 even for malformed payloads;
  - cap body size;
  - sanitize logged fields;
  - log compact summaries instead of full raw user payloads.

### Local/browser observation assets

- Added `scripts/csp-policy.mjs` as the shared report-only policy definition for local observation.
- Added `scripts/csp-observe-server.mjs`:
  - serves the static site locally;
  - applies the same report-only CSP;
  - accepts `/api/csp-report` POSTs;
  - writes `csp-report-local.ndjson`.
- Added `scripts/csp-browser-observe.mjs`:
  - uses Playwright when available;
  - listens for `securitypolicyviolation` events;
  - writes `csp-browser-violations.json`.
- Added `tests/csp-observation.spec.mjs` for a future Playwright run.
- Added `CSP_ROLLOUT_PLAN.md` with the enforcement gate and observation procedure.
- Expanded `BROWSER_REGRESSION_CHECKLIST.md` with CSP-specific checks.

### Specific observation targets

- **AdSense**: expected to be the most likely third-party report source. Keep current allowlist narrow until real `blocked-uri` reports show which domains are actually needed.
- **Vercel Insights**: verify `cdn.vercel-insights.com` script and `vitals.vercel-insights.com` connect only.
- **Sandbox iframe tools**: verify `runjs/` and `htmltable/` under report-only CSP, especially `frame-src`, `blob:`, `data:`, and `srcdoc` behavior.
- **JSON-LD**: inline `application/ld+json` is intentionally retained. If any browser reports it under `script-src`, prefer hash/nonce or route-level policy over externalizing JSON-LD prematurely.
- **Legacy libraries**: verify `editor/`, formatter pages, and `tuya/` in browser before enforcement.

### Static verification

- No `npm run build`.
- No test/lint/typecheck command.
- `node --check` was run against JS/MJS files only.
- Enforced `Content-Security-Policy`: not present.
- `Content-Security-Policy-Report-Only`: present.
- `report-uri /api/csp-report`: present.
- `report-to ymir-csp-report`: present.
- `style-src 'self' 'unsafe-inline'`: removed from report-only CSP.
- Active inline event handlers: still 0.
- Active `href="javascript:..."`: still 0.
- `data-csp-*`: still 0.
- `data-jsvoid`: still 0.
- Executable inline JavaScript blocks: still 0.
- Inline style attributes/blocks: still 0.
- Inline JSON-LD: still intentionally retained.

### Remaining gate before enforced CSP

Do not switch to `Content-Security-Policy` until either production report logs or local browser observation confirms:

1. no first-party `script-src` or `style-src` violations on core pages;
2. AdSense/Vercel runtime domains are classified and allowlisted only where necessary;
3. sandbox iframe tools still work;
4. JSON-LD does not trigger browser CSP reports, or a documented hash/nonce approach is ready;
5. legacy editor/formatter/drawing pages pass browser-level smoke checks.


## 2026-05-30 UI baseline merge

Merged the current colorful homepage UI into the CSP/security-hardened baseline. Kept local Bootstrap compatibility CSS, CSP Report-Only headers, CSP report endpoint, externalized homepage search script, and no third-party staticfile CDN on the homepage.
