# Vue Structure Optimization Plan

## Current state after v31

All 150 tool pages have Vue 3 + Element Plus workbenches, while the site remains a static deployment. The major remaining technical debt is not page coverage; it is structure: multiple batch app files own their own data, state, and in some early batches their own utility helpers.

## v32 decision

Do not introduce Vite or a root `package.json` yet. The safer structural step is a static Vue loader layer:

1. Keep every existing batch app script intact.
2. Add one shared loader entrypoint: `/static/script/ymir-vue-loader.js`.
3. Add a manifest: `/static/script/ymir-vue-tool-manifest.json`.
4. Make every Vue page load the same entrypoint after Vue and Element Plus.
5. Let the loader select the correct batch app from `data-tool`.

This reduces page-level duplication without changing the tool algorithms.

## Target structure

```text
static/vendor/vue/vue.global.prod.js
static/vendor/element-plus/index.full.min.js
static/vendor/element-plus/index.css
static/style/ymir-vue-element.css
static/script/ymir-vue-loader.js
static/script/ymir-vue-shared.js
static/script/ymir-vue-tool-manifest.json
static/script/ymir-vue-*-tools-app.js
```

## Next structural pass

The next safe pass should refactor the oldest app scripts to use `YmirVueShared` instead of local copies of copy, language, byte-count and panel rendering helpers. Suggested order:

1. `ymir-vue-tools-app.js`
2. `ymir-vue-legacy-tools-app.js`
3. `ymir-vue-converter-tools-app.js`
4. `ymir-vue-reference-tools-app.js`
5. `ymir-vue-dns-tools-app.js`
6. `ymir-vue-utility-tools-app.js`
7. `ymir-vue-data-code-tools-app.js`

Do not merge all tools into one giant script. Keep batch-level lazy loading so each page loads only the relevant app.


## v33 shared runtime refactor

Completed first structure consolidation pass:

1. `ymir-vue-shared.js` is now the common runtime for language state, copy fallback, status notifications, byte/line metrics, row serialization, and shared Element Plus mounting helpers.
2. `ymir-vue-tools-app.js` now delegates language state, text metrics, and clipboard behavior to the shared runtime.
3. `ymir-vue-legacy-tools-app.js` now delegates language state, text metrics, and clipboard behavior to the shared runtime while keeping transformation algorithms local.
4. Converter, reference, DNS, utility, and data-code batches now use shared copy/language/text helpers where safe. Domain-specific conversion algorithms remain in batch files.
5. Vite migration is still deferred. Current deployment remains a static site with self-hosted Vue and Element Plus assets.
