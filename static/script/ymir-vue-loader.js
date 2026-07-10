(function () {
  'use strict';

  var VERSION = '20260710-v62';
  var MANIFEST_SCRIPT = '/static/script/ymir-tools-manifest.js';
  var RUNTIME_SCRIPT = '/static/script/ymir-tool-runtime-v62.js';
  var CORE_RUNTIME_SCRIPT = '/static/script/ymir-tool-core-runtime-v62.js';

  function findRoot() {
    return document.querySelector('.ymir-vue-tool-root[data-tool]') || document.getElementById('ymir-vue-tool-app');
  }

  function currentVersion() {
    var script = document.currentScript || document.querySelector('script[src*="ymir-vue-loader.js"]');
    if (!script) return VERSION;
    var match = String(script.src || '').match(/[?&]v=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : VERSION;
  }

  function scriptExists(src) {
    return !!document.querySelector('script[src^="' + src + '"]');
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (scriptExists(src)) { resolve(); return; }
      var s = document.createElement('script');
      s.src = src + (src.indexOf('?') === -1 ? '?v=' : '&v=') + encodeURIComponent(currentVersion());
      s.async = false;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('Failed to load ' + src)); };
      document.body.appendChild(s);
    });
  }

  function fail(root, message) {
    if (!root) return;
    root.innerHTML = '<div class="ymir-vue-noscript" role="alert">' + String(message || 'Tool failed to load.').replace(/[&<>"']/g, function (ch) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch];
    }) + '</div>';
  }

  function manifest() { return window.YmirToolsManifest || null; }

  function manifestTool(slug) {
    var m = manifest();
    if (!m || !Array.isArray(m.tools)) return null;
    for (var i = 0; i < m.tools.length; i += 1) if (m.tools[i] && m.tools[i].slug === slug) return m.tools[i];
    return null;
  }

  function boot() {
    var root = findRoot();
    if (!root) return;
    var page = document.querySelector('[data-ymir-tool]');
    var tool = root.getAttribute('data-tool') || (page && page.getAttribute('data-ymir-tool')) || '';

    Promise.all([loadScript(MANIFEST_SCRIPT), loadScript(RUNTIME_SCRIPT)])
      .then(function () {
        var m = manifest();
        var app = m && m.appByTool && m.appByTool[tool];
        if (!app) throw new Error('Tool mapping is missing for: ' + tool);
        if (!window.Vue || !window.ElementPlus || !window.YmirVueAppFactory) throw new Error('The shared tool runtime did not initialize.');
        root.setAttribute('data-tool-app', app);
        var item = manifestTool(tool);
        if (item && item.category) root.setAttribute('data-tool-category', item.category);
        var coreApp = m.runtime && m.runtime.coreApp;
        var coreReady = app === coreApp ? loadScript(CORE_RUNTIME_SCRIPT) : Promise.resolve();
        return coreReady.then(function () { return loadScript(app); });
      })
      .catch(function (error) { fail(root, error && error.message ? error.message : 'Tool failed to load.'); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  window.YmirVueToolLoader = {
    version: VERSION,
    manifestScript: MANIFEST_SCRIPT,
    runtimeScript: RUNTIME_SCRIPT,
    getManifest: manifest,
    getAppByTool: function () { return (manifest() && manifest().appByTool) || {}; }
  };
})();
