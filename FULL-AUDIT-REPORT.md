# ymirtool.com SEO Full Audit Report

Analyzed at: 2026-06-06 12:52 +08:00
Target: https://ymirtool.com/
Local project: D:\桌面\统一管理\ymirtool\ymirtool-website

## Executive Summary

SEO Health Score: 82 / 100

Detected site type: static developer utility directory / online tools site.

The site has a strong static SEO foundation: every local HTML page has a title, description, canonical URL, and parseable JSON-LD; key live pages return 200; security headers are present; robots.txt exposes sitemap locations; `llms.txt` exists and is readable. The strongest risk is not basic crawlability, but strategic indexation and AI-search visibility: 163 of 212 HTML pages are intentionally `noindex`, live sitemaps currently contain duplicate policy URLs, and Cloudflare managed robots rules block major AI crawlers including GPTBot, ClaudeBot, Google-Extended, and Applebot-Extended.

PageSpeed Insights API returned HTTP 429 during this audit, so no Lighthouse performance score is claimed here.

## Evidence Collected

- Live homepage opened successfully and returned 200.
- Live sampled URLs returned 200: `/json/`, `/base64/`, `/guides.html`, `/aesencrypt/`, `/sitemap-policy.xml`, `/ads.txt`.
- Live `robots.txt` includes Cloudflare Managed Content Signals plus the project's sitemap directives.
- Live `llms.txt` is readable and lists the site's positioning, important pages, and core workflow guides.
- Local static audit counted 212 HTML pages: 49 `index, follow`, 163 `noindex, follow`, 44 AdSense pages.
- Local UTF-8 check found 0 missing titles, 0 missing descriptions, 0 missing canonicals, 0 invalid JSON-LD blocks.
- Existing local `sprint4-final-static-audit.json` reports 0 broken internal links, 0 canonical issues, 0 sitemap noindex URLs, and 0 indexable URLs missing from sitemap.

## Technical SEO

Score: 18 / 22

Strengths:

- HTTPS live site returns 200.
- Canonicals are present across local HTML.
- `robots.txt` exists and references all three sitemap files.
- Security headers are strong: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, COOP, and reporting endpoints.
- The site uses static HTML, which is favorable for crawlability.

Issues:

- Live `sitemap.xml` duplicates policy/trust URLs already present in `sitemap-policy.xml`: `about.html`, `privacy.html`, and `contact.html`.
- Live sitemap set has 54 URL entries but only 51 unique URLs.
- Cloudflare injects managed robots sections before the project's own rules. This is valid, but it means live robots behavior is partly configured outside the repository.
- CSP has been upgraded to an enforced nonce-based pipeline in the follow-up security pass; this historical audit item is superseded.

## Content Quality

Score: 19 / 23

Strengths:

- Core tool pages include explanatory copy, examples, caveats, privacy boundaries, FAQ sections, and related tools.
- Guide pages are focused on concrete developer workflows: JSON errors, Base64 padding, URL encoding, regex review, timestamps, copy-paste safety, and release text diff.
- Existing static audit reports no indexable pages below the 800 effective-content threshold.
- Trust and policy pages exist: About, Privacy, Terms, Disclaimer, Contact.

Issues:

- Most long-tail tool pages are intentionally `noindex`, so the site is currently optimized for quality gating rather than broad long-tail acquisition.
- Some noindex tool pages already have usable content and WebApplication schema. If these pages are not meant to rank, that is fine; if organic growth is the goal, they need a promotion pipeline from noindex to indexable clusters.
- The homepage is bilingual in places, while many tool pages are English. This is not fatal, but the site needs a clearer language strategy for search intent.

## On-Page SEO

Score: 18 / 20

Strengths:

- Local check found 0 missing titles and 0 missing meta descriptions.
- H1/H2 structure is present on sampled pages.
- Canonical URLs are present.
- Open Graph and Twitter metadata exist on sampled pages.

Issues:

- Homepage title and visible H1 are Chinese, while meta description is English. This may split intent signals.
- The homepage links to many tools, but the indexable set is limited; crawler equity is spread over many noindex pages.
- Policy pages have low sitemap priority, which is acceptable, but duplicating them in multiple sitemaps is unnecessary noise.

## Schema & Structured Data

Score: 9 / 10

Strengths:

- Local JSON-LD parsing found 0 invalid blocks.
- Homepage has WebSite and Organization schema.
- Core tool pages use WebApplication schema.
- BreadcrumbList is present on many indexable inner pages.
- FAQPage appears only where visible FAQ content exists, which is the right direction.

Issue:

- Commercial FAQPage schema is unlikely to produce Google FAQ rich results for most pages, but it can still help page structure and AI citation. Treat it as supporting markup, not a ranking lever.

## Performance

Score: 7 / 10

Observed:

- Static HTML and local vendor assets are favorable.
- Live response has `x-vercel-cache: HIT`, but Cloudflare reports `cf-cache-status: DYNAMIC`.
- Global `Cache-Control` is `public, max-age=0, must-revalidate`, including HTML. This is safe but conservative.

Limitations:

- Google PageSpeed Insights API returned 429, so LCP, INP, CLS, and Lighthouse scores were not available.

Risks:

- Tool pages load several CSS and JS assets, Element Plus, Vue, Vercel Insights, and AdSense on monetized pages. This can affect LCP/INP on mobile.
- CSP is Report-Only, so third-party script regressions are monitored but not blocked.

## Images

Score: 5 / 5

Local HTML contained no `<img>` tags in the static scan. The OG image is an SVG at `/static/images/og.svg`. No missing image alt text issues were detected in static HTML.

## AI Search Readiness / GEO

Score: 6 / 10

Strengths:

- `llms.txt` is present, readable, and useful.
- Pages have structured data and concise tool descriptions.
- Safety/privacy boundaries are explicit, which helps trust and citation quality.

Issues:

- Live `robots.txt` blocks GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot, Bytespider, and others through Cloudflare Managed Content.
- The managed content signal allows `search=yes` and denies `ai-train=no`, but does not explicitly allow `ai-input=yes`.
- If the goal is ChatGPT/Perplexity/AI Overview visibility, the current robot policy is conservative and may reduce AI crawler access.

## Priority Findings

Critical:

- None found. No index-blocking sitewide failure, broken sitemap fetch, missing titles, invalid JSON-LD, or live 5xx issue was observed.

High:

- Decide the AI crawler policy. Current Cloudflare rules block major AI crawlers despite the site having `llms.txt`.
- Fix live sitemap duplication and align live sitemap output with the local intended state.
- Establish a promotion workflow for valuable noindex tools if organic long-tail growth is desired.

Medium:

- Align homepage language targeting: either make the homepage consistently Chinese, consistently English, or add explicit hreflang/language variants.
- Run PageSpeed/Lighthouse from a non-rate-limited environment and optimize mobile LCP/INP based on real results.
- Consider enforcing CSP after report-only violations are clean.

Low:

- Add a sitemap index if sitemap sets continue to grow.
- Add richer category landing pages for tool clusters such as JSON, encoding, hashing, text, regex, and time tools.

## Sources

- https://ymirtool.com/
- https://ymirtool.com/robots.txt
- https://ymirtool.com/sitemap.xml
- https://ymirtool.com/sitemap-guides.xml
- https://ymirtool.com/sitemap-policy.xml
- https://ymirtool.com/llms.txt
- Local files: `robots.txt`, `sitemap.xml`, `sitemap-guides.xml`, `sitemap-policy.xml`, `llms.txt`, `vercel.json`, `netlify.toml`, `sprint4-final-static-audit.json`
