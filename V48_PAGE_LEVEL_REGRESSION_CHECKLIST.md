# V48 page-level regression checklist

Scope: static page-level regression after the manifest, sitemap, homepage, tool shell, and static page registry migrations. This checklist is intentionally separate from build/test/lint commands.

## Do not run

- `npm install`
- `npm run build`
- automated test suites
- lint/typecheck commands

## Static audit command

Use this repository-local static audit only:

```bash
node scripts/page-regression-audit.mjs
```

It checks homepage fallback, tool shell metadata, static page metadata, sitemap coverage, loader manifest wiring, local asset references, and risky public wording regressions.

## Browser sampling targets

When a preview deployment is available, manually open these pages:

1. `/`
   - Search opens the command panel.
   - Featured tools render from the manifest.
   - Directory tabs show manifest categories.
   - Recent and favorite tools update after clicking a tool or star.

2. `/json/`
   - Vue tool workbench loads.
   - Format, minify, validate, copy, and sample actions respond.
   - Metadata shell still has canonical `/json/`.

3. `/base64/`
   - Encode/decode actions work.
   - Result copy feedback appears.
   - Related/help sections remain below the workbench.

4. `/textdiff/`
   - Two-panel input remains readable on desktop and mobile.
   - Diff output appears after running.

5. `/regex/`
   - Pattern/test text inputs remain usable.
   - Match results update after action.

6. `/calculator/`
   - Expression input and result card render.
   - Invalid expressions show a readable warning.

7. `/guides.html`
   - Guide links point to real guide pages.
   - Title, canonical, and description match the static registry.

8. `/base64-encoding-guide.html`
   - Article layout remains readable.
   - CTA links to `/base64/`.
   - JSON-LD parses as Article.

9. `/privacy.html`, `/contact.html`, `/404.html`
   - Policy/support pages keep canonical metadata.
   - 404 page keeps centered layout and home link.

## Acceptance gate

- `scripts/page-regression-audit.mjs` reports `"pass": true`.
- No missing local assets except explicitly external URLs.
- 150 tool pages match the tool manifest.
- 32 static pages match the static page registry.
- `sitemap.xml`, `sitemap-guides.xml`, and `sitemap-policy.xml` match their source registries.
- No public copy regresses to old local/browser/no-upload positioning.
