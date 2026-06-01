# Browser regression checklist

This project intentionally keeps browser checks separate from build/test/lint commands. Do not run this checklist automatically during code migration unless explicitly allowed.

## Priority pages

1. `/editor/`
   - Textarea is enhanced by KindEditor.
   - Basic bold/italic/list/table actions still change editor content.
   - Image, flash, media upload/file-manager surfaces are not available.

2. `/formatfilter/`
   - Page loads only `jquery-1.11.3.min.js`; it must not load `jquery-1.7.1.min.js`.
   - HTML/JS/CSS checkboxes update state.
   - Quick filter writes plain text to `#result`.
   - Clear resets input/result.

3. `/formatjava/`, `/formatcs/`, `/formatperl/`, `/formatpy/`, `/formatruby/`
   - CodeMirror editor appears.
   - Format button calls `beautify()`.
   - Clear button empties both textarea and CodeMirror state.
   - Page does not load `sanitytest.js` or old unpacker helpers.

4. `/tuya/`
   - Canvas appears.
   - Color and brush size controls work.
   - Mouse/touch drawing works.
   - Ctrl+Z removes last drawn object.
   - Ctrl+S opens a PNG preview window.
   - Page must not load `zepto.min.js`.

5. `/hexrgb/`
   - HEX to RGB and RGB to HEX conversion still work.
   - Color table swatches display through `/static/style/page-hexrgb.css`, not inline `style` attributes.

## CSP console checks

Under Report-Only CSP, watch for violations containing:

- `unsafe-inline` script
- `unsafe-eval`
- `javascript:` URLs
- missing page listener files
- blocked local CSS such as `/static/style/page-hexrgb.css`


## Inline style migration visual checks

After the inline style migration, manually verify these pages before enforcing CSP:

- `useragent/`: User-Agent input rows keep full-width layout and label widths.
- `regexsucha/`: regex syntax table keeps italic placeholder text readable.
- `keyboardtest/`: virtual keyboard key widths and row spacing remain intact.
- `browserinfo/`: detected browser info values keep green highlight styling.
- `tuya/`: drawing toolbar position, color swatches, brush sizes, and canvas border remain intact.
- `calcvolume/`: calculator table alignment remains centered/right-aligned as before.
- `bootstrapicon/`: icon grid keeps four-column layout on desktop and responsive layout on mobile.
- `404.html`: error page keeps centered layout and home button styling.
- `htmltable/`: generated preview still appears in the sandboxed iframe after the page initializes.

## CSP report-only observation checklist

Use this after starting the local CSP observation server or after deploying a preview branch with `/api/csp-report` enabled.

Priority pages:

- `/` — homepage, AdSense, Vercel Insights, JSON-LD
- `/calculator/` — expression parser and page-local controls
- `/json/`, `/jsonlrview/`, `/jsonudview/` — JSON rendering and fold toggles
- `/runjs/` — sandbox iframe preview
- `/htmltable/` — sandbox iframe table preview
- `/editor/` — KindEditor isolated page
- `/formatjava/`, `/formatfilter/` — CodeMirror / formatter helpers
- `/tuya/` — oCanvas legacy drawing page
- `/barcode/` — generated image/canvas path
- `/worldtime/` — timer path

For each page, record:

- Console errors
- `securitypolicyviolation` events
- `/api/csp-report` payloads
- Whether AdSense loads or emits only third-party report-only noise
- Whether Vercel Insights connects only to `vitals.vercel-insights.com`
- Whether JSON-LD remains silent under `script-src` without `'unsafe-inline'`
- Whether sandbox iframe tools still render previews
