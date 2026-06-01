# Sprint 1 source notes

Date: 2026-06-01

These notes record the source categories used while upgrading the 10 core tool pages.

## Google / AdSense / Search policy sources

- Google AdSense Help: What to do when your site is not ready to show ads
- Google AdSense Help: Google Publisher Policies
- Google AdSense Program policies
- Google Search Central: Creating helpful, reliable, people-first content
- Google Search Central: Search Essentials
- Google Search Central: Link best practices

Applied editorial implications:

- Keep the review surface small and useful instead of reopening thin long-tail pages.
- Make every ad-enabled page contain publisher-owned explanatory content, examples, and task guidance.
- Make internal links crawlable and descriptive.
- Avoid pages that exist only as navigation, empty utility states, or repeated boilerplate.

## Technical reference sources

- MDN JSON.parse()
- MDN JSON.stringify()
- RFC 4648 Base-N Encodings
- MDN Window.btoa()
- WHATWG URL Standard
- MDN encodeURIComponent()
- MDN URLSearchParams
- RFC 1321 MD5 Message-Digest Algorithm
- RFC 6151 MD5 security considerations
- MDN JavaScript regular expressions
- MDN regular expression syntax cheat sheet
- MDN Date.prototype.getTime()
- MDN Date reference
- Prettier Options
- MDN Intl.NumberFormat

Applied editorial implications:

- Explain strict JSON separately from JavaScript object literals.
- Explain Base64 as encoding, not encryption.
- Explain URL component encoding and double-encoding risk.
- Explain MD5 checksum use separately from password or signature use.
- Explain JavaScript regex scope and runtime differences.
- Explain timestamp seconds versus milliseconds and UTC/local review.
- Explain JavaScript formatting as readability, not linting/building.
- Explain text counting as destination-specific rather than one universal metric.
- Explain quick calculator results as preliminary, with domain-specific verification for final decisions.

## Non-official review and benchmarking sources

- AdSenseAudit low-value/site-not-ready remediation articles
- Geniee AdSense low-value content remediation article
- Medium simple-tool AdSense-ready case study
- Search/SEO industry articles discussing helpful content, crawlability, and E-E-A-T framing
- Community discussions around AdSense low-value content rejection

Applied editorial implications:

- Tool pages need substantial explanatory content around the interface.
- Real examples and error tables are better than generic "fast/free/easy" claims.
- Privacy boundaries and user task context help utility pages look maintained and trustworthy.
