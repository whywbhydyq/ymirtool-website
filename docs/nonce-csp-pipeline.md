# Nonce-based CSP pipeline

This site uses a per-request nonce pipeline for executable `<script>` tags.

## Source HTML contract

Executable script tags carry a static placeholder:

```html
<script src="/static/script/ymir-theme.js" nonce="__CSP_NONCE__"></script>
```

`application/ld+json` structured data scripts are intentionally not marked because they are not executable JavaScript.

## Runtime contract

- Vercel HTML routes are rewritten to `api/csp-html.js`.
- Netlify HTML responses are transformed by `netlify/edge-functions/csp-nonce.ts`.
- Each HTML response receives a fresh nonce.
- Only the trusted placeholder is replaced; the runtime does not blindly add nonces to every script tag.
- HTML responses use `Cache-Control: no-store` so a nonce-bearing response is not reused as a cached document.

## CSP shape

The active `script-src` uses:

```text
'nonce-{nonce}' 'strict-dynamic' 'unsafe-inline' 'unsafe-eval' https: http:
```

The `unsafe-inline` and `unsafe-eval` tokens are present for AdSense strict-CSP compatibility and older-browser fallback behavior. Modern CSP3 browsers ignore host allowlists and `unsafe-inline` when `strict-dynamic` and a valid nonce are present.

## Maintenance rule

When adding a new executable script tag to HTML source, include `nonce="__CSP_NONCE__"`. Do not add the placeholder to user-generated HTML or dynamically injected untrusted content.
