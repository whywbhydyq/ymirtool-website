# Tool workbench Migration Playbook

## Current decision

Do not rewrite all 151 pages at once. Keep the current static site live and use `vue-pilot/` as a migration sandbox.

## Why this is isolated

The existing site is a static HTML site with many legacy Bootstrap pages. A direct root-level Vue/Vite migration would change deployment behavior and may affect SEO, canonical URLs, old scripts, and Vercel build behavior. The pilot is isolated so the current production files remain safe.

## Pilot scope

The first pilot covers three representative tools:

- JSON Formatter: text input/output tool.
- Base64 Encoder / Decoder: dual-action conversion tool.
- MD5 Hash Generator: generator with result cards.

These three cover the component patterns needed for the next nine modern tools.

## Target architecture

```text
vue-pilot/
  src/
    components/tool/
      ToolShell.vue
      EditorPanel.vue
      ActionToolbar.vue
      ResultCard.vue
      StatusBar.vue
    tools/
      json/
      base64/
      md5/
    i18n/
      messages.ts
    styles/
      ymir-element-theme.css
```

## Production migration sequence

1. Keep current `/json/` static page as fallback.
2. Build the Vue pilot in CI or Vercel.
3. Add a built bundle only to `/json/` after visual approval.
4. Preserve static TDK, H1, canonical, and FAQ in HTML.
5. Mount Vue only in the tool workbench area.
6. Then migrate `/base64/` and `/md5/`.
7. Migrate the remaining modern tools by component type.
8. Keep legacy Bootstrap pages on CSS bridge until each category is ready.

## Do not do yet

- Do not replace all static pages with an SPA.
- Do not use hash routes such as `/app#/json`.
- Do not remove canonical HTML content from existing pages.
- Do not migrate 138 legacy pages before the 12 modern pages are stable.
