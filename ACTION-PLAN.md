# ymirtool.com SEO Action Plan

Generated: 2026-06-06

## Critical

No critical indexing or crawlability failures were found.

## High

1. Fix live sitemap duplication.
   - Remove `about.html`, `privacy.html`, and `contact.html` from either `sitemap.xml` or `sitemap-policy.xml`.
   - Keep each canonical URL in exactly one sitemap.
   - Re-submit the sitemap set in Google Search Console after deployment.

2. Decide AI crawler policy.
   - If GEO / AI answer visibility matters, review Cloudflare Managed Content settings.
   - Consider allowing AI input/retrieval crawlers while keeping `ai-train=no` if the goal is citation without model training.
   - Keep `llms.txt` because it is already useful and readable.

3. Define an indexation promotion pipeline.
   - Current local state: 49 indexable pages, 163 noindex pages.
   - Keep low-value or thin utility pages noindex.
   - Promote only pages with unique examples, troubleshooting copy, FAQ, related links, and clear search intent.

## Medium

4. Run Lighthouse/PageSpeed again from an environment without API rate limiting.
   - Capture mobile LCP, INP, CLS, TBT, and transfer size for `/`, `/json/`, `/base64/`, and `/guides.html`.
   - Optimize only from measured bottlenecks.

5. Clarify language targeting.
   - Homepage currently has Chinese title/H1 and English meta description.
   - Choose one primary language per URL or create language-specific variants with canonical/hreflang discipline.

6. Move CSP from Report-Only to enforced after reports are clean.
   - Keep the report-only phase until AdSense and Vercel Insights violations are understood.
   - Enforce only after confirming no required script/style/connect source is blocked.

## Low

7. Add or maintain category landing pages.
   - Recommended clusters: JSON, Base64/encoding, hashing, regex, text tools, time tools, developer references.
   - Each cluster page should link to core tools and deeper guide pages.

8. Consider a sitemap index.
   - Not required at 51 unique live URLs, but useful if the site later promotes many more pages.

## Verification Checklist

- `https://ymirtool.com/robots.txt` returns 200 and lists intended sitemaps.
- All sitemap URLs are unique across sitemap files.
- No `noindex` URL is present in sitemap files.
- All indexable pages have title, description, canonical, and parseable JSON-LD.
- Key pages return 200: `/`, `/json/`, `/base64/`, `/guides.html`, `/ads.txt`.
- PageSpeed mobile data is captured when API rate limiting clears.
