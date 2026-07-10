# Third-Party Notices

This repository includes third-party software. Copyright and license notices in the original files remain authoritative.

| Component | Version | License / notice | Primary path |
|---|---:|---|---|
| Vue | 3.5.35 | MIT | `static/vendor/vue/vue.global.prod.js` |
| Element Plus | 2.14.1 | MIT | `static/vendor/element-plus/` |
| CryptoJS | 3.0.2 | See source header and upstream license link | `static/script/pcjs/aes.js`, `static/script/pcjs/rabbit.js`, `static/script/pcjs/tripledes.js` |
| JsBarcode | 3.9.0 | MIT | `static/script/pcjs/barcode.js` |
| Compatibility data and algorithms | mixed retained notices | `static/script/pcjs/htpasswd/`, `static/script/pcjs/jianfan.js`, `static/script/pcjs/pinyin.js` |

The generated `ymir-tool-runtime-v62.js` bundle contains Vue, Element Plus, and the shared Ymir runtime in source order. Original source files required to rebuild the bundle are retained. Unreferenced migration assets are excluded from the deployable project.
