# Ymir Tool Security Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the highest-risk client-side execution and injection issues found in the Ymir Tool static site audit.

**Architecture:** Keep the static-site architecture intact. Patch shared legacy scripts so broad behavior improves without rewriting every generated HTML file, and add report-only response policy headers to observe CSP impact before enforcement.

**Tech Stack:** Static HTML, vanilla JavaScript, jQuery legacy pages, Vercel `vercel.json`, Netlify `netlify.toml`, Node syntax checks.

---

### Task 1: Isolate RunJS Preview

**Files:**
- Modify: `static/script/tool.js`
- Validate: `runjs/index.html`

- [ ] **Step 1: Add a DOM-ready override for `window.webdebug`**

Append a helper in `static/script/tool.js` that detects the RunJS page by the `#content` textarea and the old `webdebug` function, then replaces it after DOMContentLoaded.

- [ ] **Step 2: Render preview inside a sandbox iframe**

Use an iframe with `sandbox="allow-scripts"` and `srcdoc` so pasted scripts run in an opaque origin and cannot reach `ymirtool.com` storage or opener.

- [ ] **Step 3: Verify syntax**

Run: `node --check static/script/tool.js`
Expected: exit 0.

### Task 2: Remove Legacy JSON `eval`

**Files:**
- Modify: `static/script/json/cjson.js`
- Validate: `jsonudview/index.html`

- [ ] **Step 1: Replace `eval("[" + json + "]")`**

Use `JSON.parse(json)` with the existing empty-input behavior preserved as `""`.

- [ ] **Step 2: Escape rendered property names and string values**

Introduce a local HTML escape helper and apply it to property names, string literals, and parser error messages before writing `innerHTML`.

- [ ] **Step 3: Verify syntax**

Run: `node --check static/script/json/cjson.js`
Expected: exit 0.

### Task 3: Remove Weak Random Fallbacks

**Files:**
- Modify: `static/script/ymir-tools.js`
- Validate: `guid/index.html`, `password/index.html`

- [ ] **Step 1: Require Web Crypto for GUID fallback**

Keep `crypto.randomUUID()` when available, otherwise build a UUID from `crypto.getRandomValues`.

- [ ] **Step 2: Refuse password generation without Web Crypto**

If `crypto.getRandomValues` is unavailable, show an error instead of using `Math.random()`.

- [ ] **Step 3: Verify syntax**

Run: `node --check static/script/ymir-tools.js`
Expected: exit 0.

### Task 4: Add Report-Only CSP

**Files:**
- Modify: `vercel.json`
- Modify: `netlify.toml`

- [ ] **Step 1: Add `Content-Security-Policy-Report-Only`**

Use a permissive-but-useful policy matching current assets: allow self, HTTPS scripts/styles/images/fonts, `data:` images, `blob:` for tool downloads/previews, and keep inline script/style temporarily because legacy pages still depend on them.

- [ ] **Step 2: Verify JSON syntax**

Run: `node -e "JSON.parse(require('fs').readFileSync('vercel.json','utf8'))"`
Expected: exit 0.

### Task 5: Regression Checks

**Files:**
- Validate: changed JavaScript and sitemap files

- [ ] **Step 1: Run syntax checks**

Run:
`node --check static/script/tool.js`
`node --check static/script/json/cjson.js`
`node --check static/script/ymir-tools.js`
`node --check scripts/skip-old-vercel-builds.mjs`

- [ ] **Step 2: Re-check sitemap internal targets**

Use the same XML target existence checks from the audit to confirm no routing files were damaged.

- [ ] **Step 3: Review changed files**

Run: `git diff -- ymirtool-website` if the folder becomes part of a Git worktree; otherwise use targeted `Select-String` checks for the changed patterns.
