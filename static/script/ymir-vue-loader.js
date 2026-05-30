(function () {
  'use strict';
  var VERSION = '20260530-v34';
  var APP_BY_TOOL = {
  "aesencrypt": "/static/script/ymir-vue-crypto-code-tools-app.js",
  "alldns": "/static/script/ymir-vue-dns-tools-app.js",
  "allencrypt": "/static/script/ymir-vue-crypto-code-tools-app.js",
  "androidkeycode": "/static/script/ymir-vue-reference-tools-app.js",
  "androidmanifest": "/static/script/ymir-vue-reference-tools-app.js",
  "areacode": "/static/script/ymir-vue-text-reference-tools-app.js",
  "ascii": "/static/script/ymir-vue-legacy-tools-app.js",
  "asciicode": "/static/script/ymir-vue-legacy-tools-app.js",
  "autoformat": "/static/script/ymir-vue-utility-tools-app.js",
  "barcode": "/static/script/ymir-vue-media-tools-app.js",
  "base64": "/static/script/ymir-vue-tools-app.js",
  "bootstrapicon": "/static/script/ymir-vue-text-reference-tools-app.js",
  "browserinfo": "/static/script/ymir-vue-utility-tools-app.js",
  "calcangle": "/static/script/ymir-vue-converter-tools-app.js",
  "calcarea": "/static/script/ymir-vue-converter-tools-app.js",
  "calcdata": "/static/script/ymir-vue-converter-tools-app.js",
  "calcforce": "/static/script/ymir-vue-converter-tools-app.js",
  "calcheat": "/static/script/ymir-vue-converter-tools-app.js",
  "calclength": "/static/script/ymir-vue-converter-tools-app.js",
  "calcpower": "/static/script/ymir-vue-converter-tools-app.js",
  "calcpressure": "/static/script/ymir-vue-converter-tools-app.js",
  "calcspeed": "/static/script/ymir-vue-converter-tools-app.js",
  "calctemperature": "/static/script/ymir-vue-converter-tools-app.js",
  "calcthickness": "/static/script/ymir-vue-converter-tools-app.js",
  "calctime": "/static/script/ymir-vue-converter-tools-app.js",
  "calculator": "/static/script/ymir-vue-tools-app.js",
  "calcvolume": "/static/script/ymir-vue-converter-tools-app.js",
  "camelcase": "/static/script/ymir-vue-legacy-tools-app.js",
  "capital": "/static/script/ymir-vue-legacy-tools-app.js",
  "chaodai": "/static/script/ymir-vue-text-reference-tools-app.js",
  "confundirjs": "/static/script/ymir-vue-crypto-code-tools-app.js",
  "contenttype": "/static/script/ymir-vue-reference-tools-app.js",
  "createmeta": "/static/script/ymir-vue-utility-tools-app.js",
  "currency": "/static/script/ymir-vue-text-reference-tools-app.js",
  "deencrypt": "/static/script/ymir-vue-crypto-code-tools-app.js",
  "desencrypt": "/static/script/ymir-vue-crypto-code-tools-app.js",
  "dns": "/static/script/ymir-vue-dns-tools-app.js",
  "dnsdx": "/static/script/ymir-vue-dns-tools-app.js",
  "dnsedu": "/static/script/ymir-vue-dns-tools-app.js",
  "dnslt": "/static/script/ymir-vue-dns-tools-app.js",
  "dnstt": "/static/script/ymir-vue-dns-tools-app.js",
  "dnsusa": "/static/script/ymir-vue-dns-tools-app.js",
  "dnsyd": "/static/script/ymir-vue-dns-tools-app.js",
  "editor": "/static/script/ymir-vue-runtime-tools-app.js",
  "endecodejs": "/static/script/ymir-vue-crypto-code-tools-app.js",
  "enlower": "/static/script/ymir-vue-legacy-tools-app.js",
  "escape": "/static/script/ymir-vue-legacy-tools-app.js",
  "excel2json": "/static/script/ymir-vue-data-code-tools-app.js",
  "formatc": "/static/script/ymir-vue-formatter-tools-app.js",
  "formatcpp": "/static/script/ymir-vue-formatter-tools-app.js",
  "formatcs": "/static/script/ymir-vue-formatter-tools-app.js",
  "formatcsql": "/static/script/ymir-vue-formatter-tools-app.js",
  "formatcss": "/static/script/ymir-vue-utility-tools-app.js",
  "formatfilter": "/static/script/ymir-vue-utility-tools-app.js",
  "formathtml": "/static/script/ymir-vue-utility-tools-app.js",
  "formatjava": "/static/script/ymir-vue-formatter-tools-app.js",
  "formatjs": "/static/script/ymir-vue-tools-app.js",
  "formatperl": "/static/script/ymir-vue-formatter-tools-app.js",
  "formatphp": "/static/script/ymir-vue-formatter-tools-app.js",
  "formatpy": "/static/script/ymir-vue-formatter-tools-app.js",
  "formatruby": "/static/script/ymir-vue-formatter-tools-app.js",
  "formatsql": "/static/script/ymir-vue-utility-tools-app.js",
  "formatvbs": "/static/script/ymir-vue-formatter-tools-app.js",
  "formatxml": "/static/script/ymir-vue-utility-tools-app.js",
  "guid": "/static/script/ymir-vue-tools-app.js",
  "hexconvert": "/static/script/ymir-vue-legacy-tools-app.js",
  "hexrgb": "/static/script/ymir-vue-legacy-tools-app.js",
  "htaccess2nginx": "/static/script/ymir-vue-utility-tools-app.js",
  "html2all": "/static/script/ymir-vue-data-code-tools-app.js",
  "html2cj": "/static/script/ymir-vue-data-code-tools-app.js",
  "html2js": "/static/script/ymir-vue-data-code-tools-app.js",
  "html2php": "/static/script/ymir-vue-data-code-tools-app.js",
  "html2ubb": "/static/script/ymir-vue-data-code-tools-app.js",
  "htmlescape": "/static/script/ymir-vue-legacy-tools-app.js",
  "htmlescapechar": "/static/script/ymir-vue-legacy-tools-app.js",
  "htmlfromcsv": "/static/script/ymir-vue-data-code-tools-app.js",
  "htmlmarkdown": "/static/script/ymir-vue-data-code-tools-app.js",
  "htmloutjs": "/static/script/ymir-vue-data-code-tools-app.js",
  "htmltable": "/static/script/ymir-vue-data-code-tools-app.js",
  "htpasswd": "/static/script/ymir-vue-crypto-code-tools-app.js",
  "httpheader": "/static/script/ymir-vue-reference-tools-app.js",
  "huoxingwen": "/static/script/ymir-vue-text-reference-tools-app.js",
  "img2base64": "/static/script/ymir-vue-media-tools-app.js",
  "ip2long": "/static/script/ymir-vue-utility-tools-app.js",
  "jianfan": "/static/script/ymir-vue-text-reference-tools-app.js",
  "jieri": "/static/script/ymir-vue-text-reference-tools-app.js",
  "json": "/static/script/ymir-vue-tools-app.js",
  "json2cs": "/static/script/ymir-vue-data-code-tools-app.js",
  "json2excel": "/static/script/ymir-vue-data-code-tools-app.js",
  "json2get": "/static/script/ymir-vue-data-code-tools-app.js",
  "json2go": "/static/script/ymir-vue-data-code-tools-app.js",
  "json2java": "/static/script/ymir-vue-data-code-tools-app.js",
  "json2xml": "/static/script/ymir-vue-data-code-tools-app.js",
  "json2yaml": "/static/script/ymir-vue-data-code-tools-app.js",
  "jsonlrview": "/static/script/ymir-vue-data-code-tools-app.js",
  "jsonudview": "/static/script/ymir-vue-data-code-tools-app.js",
  "jsonzip": "/static/script/ymir-vue-data-code-tools-app.js",
  "keyboardcode": "/static/script/ymir-vue-utility-tools-app.js",
  "keyboardtest": "/static/script/ymir-vue-utility-tools-app.js",
  "linuxcmd": "/static/script/ymir-vue-reference-tools-app.js",
  "md5": "/static/script/ymir-vue-tools-app.js",
  "morse": "/static/script/ymir-vue-legacy-tools-app.js",
  "navtiveunicode": "/static/script/ymir-vue-legacy-tools-app.js",
  "nianlvli": "/static/script/ymir-vue-text-reference-tools-app.js",
  "pagecode": "/static/script/ymir-vue-reference-tools-app.js",
  "password": "/static/script/ymir-vue-tools-app.js",
  "pinyin": "/static/script/ymir-vue-text-reference-tools-app.js",
  "ports": "/static/script/ymir-vue-reference-tools-app.js",
  "px2rem": "/static/script/ymir-vue-legacy-tools-app.js",
  "quanbaojiao": "/static/script/ymir-vue-legacy-tools-app.js",
  "quchong": "/static/script/ymir-vue-legacy-tools-app.js",
  "rabbitencrypt": "/static/script/ymir-vue-crypto-code-tools-app.js",
  "random": "/static/script/ymir-vue-legacy-tools-app.js",
  "rc4encrypt": "/static/script/ymir-vue-crypto-code-tools-app.js",
  "refresh": "/static/script/ymir-vue-utility-tools-app.js",
  "regex": "/static/script/ymir-vue-tools-app.js",
  "regexcode": "/static/script/ymir-vue-utility-tools-app.js",
  "regexdso": "/static/script/ymir-vue-utility-tools-app.js",
  "regexsucha": "/static/script/ymir-vue-utility-tools-app.js",
  "requestmethod": "/static/script/ymir-vue-reference-tools-app.js",
  "rmbdaxie": "/static/script/ymir-vue-utility-tools-app.js",
  "runjs": "/static/script/ymir-vue-runtime-tools-app.js",
  "shaencrypt": "/static/script/ymir-vue-legacy-tools-app.js",
  "shaoshuminzu": "/static/script/ymir-vue-text-reference-tools-app.js",
  "shizhong": "/static/script/ymir-vue-text-reference-tools-app.js",
  "shortcut": "/static/script/ymir-vue-utility-tools-app.js",
  "shupai": "/static/script/ymir-vue-legacy-tools-app.js",
  "sql2java": "/static/script/ymir-vue-data-code-tools-app.js",
  "subnetmask": "/static/script/ymir-vue-text-reference-tools-app.js",
  "tesufuhao": "/static/script/ymir-vue-text-reference-tools-app.js",
  "textdiff": "/static/script/ymir-vue-tools-app.js",
  "textflip": "/static/script/ymir-vue-legacy-tools-app.js",
  "tiaoseban": "/static/script/ymir-vue-text-reference-tools-app.js",
  "tripledes": "/static/script/ymir-vue-crypto-code-tools-app.js",
  "tuya": "/static/script/ymir-vue-media-tools-app.js",
  "txtcount": "/static/script/ymir-vue-tools-app.js",
  "txtreplace": "/static/script/ymir-vue-legacy-tools-app.js",
  "unicode": "/static/script/ymir-vue-legacy-tools-app.js",
  "unixtime": "/static/script/ymir-vue-tools-app.js",
  "urlcode": "/static/script/ymir-vue-legacy-tools-app.js",
  "urlencode": "/static/script/ymir-vue-tools-app.js",
  "urlthunder": "/static/script/ymir-vue-utility-tools-app.js",
  "useragent": "/static/script/ymir-vue-reference-tools-app.js",
  "utf8": "/static/script/ymir-vue-utility-tools-app.js",
  "uuid": "/static/script/ymir-vue-legacy-tools-app.js",
  "websocket": "/static/script/ymir-vue-runtime-tools-app.js",
  "wenzitexiao": "/static/script/ymir-vue-text-reference-tools-app.js",
  "worldtime": "/static/script/ymir-vue-text-reference-tools-app.js",
  "xpath": "/static/script/ymir-vue-utility-tools-app.js",
  "zipstringtext": "/static/script/ymir-vue-text-reference-tools-app.js"
};

  function findRoot() {
    return document.querySelector('.ymir-vue-tool-root[data-tool]') || document.getElementById('ymir-vue-tool-app');
  }

  function currentVersion() {
    var script = document.currentScript || document.querySelector('script[src*="ymir-vue-loader.js"]');
    if (!script) return VERSION;
    var match = String(script.src || '').match(/[?&]v=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : VERSION;
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (document.querySelector('script[src^="' + src + '"]')) { resolve(); return; }
      var s = document.createElement('script');
      s.src = src + (src.indexOf('?') === -1 ? '?v=' : '&v=') + encodeURIComponent(currentVersion());
      s.async = false;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('Failed to load ' + src)); };
      document.body.appendChild(s);
    });
  }

  function fail(root, message) {
    if (!root) return;
    root.innerHTML = '<div class="ymir-vue-noscript">' + message + '</div>';
  }

  function boot() {
    var root = findRoot();
    if (!root) return;
    var tool = root.getAttribute('data-tool') || (document.querySelector('[data-ymir-tool]') || {}).dataset.ymirTool;
    var app = APP_BY_TOOL[tool];
    if (!app) { fail(root, 'Vue tool mapping is missing for: ' + tool); return; }
    if (!window.Vue || !window.ElementPlus) { fail(root, 'Vue or Element Plus assets failed to load.'); return; }
    loadScript('/static/script/ymir-vue-shared.js')
      .then(function () { return loadScript(app); })
      .catch(function (error) { fail(root, error && error.message ? error.message : 'Vue tool failed to load.'); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  window.YmirVueToolLoader = { version: VERSION, appByTool: APP_BY_TOOL };
})();
