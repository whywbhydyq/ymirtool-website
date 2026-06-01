# CSP Rollout Plan

This site is still in `Content-Security-Policy-Report-Only`. Do not switch to enforced CSP until the report endpoint and browser observation runs have been reviewed on production-like pages.

## Current report-only target policy

- `script-src 'self' https://pagead2.googlesyndication.com https://cdn.vercel-insights.com`
- `style-src 'self'`
- `img-src 'self' https://pagead2.googlesyndication.com data: blob:`
- `connect-src 'self' https://vitals.vercel-insights.com https://pagead2.googlesyndication.com ws: wss:`
- `frame-src 'self' data: blob:`
- `worker-src 'self' blob:`
- `report-uri /api/csp-report`
- `report-to ymir-csp-report`

The policy intentionally remains narrow. AdSense may emit report-only violations for additional runtime domains. Those domains should be reviewed from real reports instead of being pre-allowed broadly.

## Report collection

### Production / preview deployments

- Vercel endpoint: `/api/csp-report`
- Netlify fallback function: `/.netlify/functions/csp-report`
- Netlify route shim: `/api/csp-report` -> `/.netlify/functions/csp-report`

The endpoint returns `204` for valid and invalid report payloads. It logs a sanitized summary to platform logs and does not persist user data.

### Local observation

Run a local static server with the same report-only policy:

```bash
node scripts/csp-observe-server.mjs . 4173
```

Then run browser observation from another terminal if Playwright is available:

```bash
YMIR_CSP_OBSERVE_BASE_URL=http://127.0.0.1:4173 node scripts/csp-browser-observe.mjs
```

The server writes POSTed browser reports to `csp-report-local.ndjson`. The browser observer writes event-level results to `csp-browser-violations.json`.

## Specific areas to review before enforcement

1. **AdSense**
   - Expect possible report-only noise from Google ad runtime domains.
   - Review `blocked-uri`, `effective-directive`, and `document-uri` before widening CSP.
   - Do not add broad `*.google.com` or `*.doubleclick.net` without concrete violation evidence.

2. **Vercel Insights**
   - Confirm that `https://cdn.vercel-insights.com/v1/script.js` loads.
   - Confirm that `https://vitals.vercel-insights.com` is the only required analytics connect endpoint.

3. **Sandbox iframe tools**
   - Check `runjs/` and `htmltable/`.
   - The parent page should use sandboxed iframe previews.
   - Runtime `srcdoc`, `blob:`, or `data:` behavior should be reviewed from browser reports before enforcement.

4. **JSON-LD**
   - Inline `application/ld+json` is intentionally retained for SEO.
   - Browsers normally should not report it as executable script.
   - If reports appear, prefer hash/nonce or route-specific policy over externalizing JSON-LD immediately.

5. **Legacy libraries**
   - Confirm `editor/`, `formatjava/`, and `tuya/` under report-only CSP.
   - Old libraries should stay page-local and should not force broad global CSP exceptions.

## Enforcement gate

Only switch from `Content-Security-Policy-Report-Only` to `Content-Security-Policy` after:

- 7 days of production or preview report collection, or a complete local browser sweep.
- No first-party `script-src`, `style-src`, `frame-src`, or `worker-src` violations on core pages.
- AdSense/Vercel violations are classified and policy-adjusted narrowly.
- JSON-LD produces no browser CSP reports, or a documented hash/nonce plan is ready.
- Sandbox iframe tools are checked in Chromium and at least one WebKit/Firefox run when practical.
