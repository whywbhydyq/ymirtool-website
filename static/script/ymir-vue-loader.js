(function () {
  'use strict';

  var VERSION = '20260531-v58';
  var MANIFEST_SCRIPT = '/static/script/ymir-tools-manifest.js';

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
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('Failed to load ' + src)); };
      document.body.appendChild(s);
    });
  }

  function fail(root, message) {
    if (!root) return;
    root.innerHTML = '<div class="ymir-vue-noscript">' + message + '</div>';
  }

  function manifest() {
    return window.YmirToolsManifest || null;
  }

  function manifestTool(slug) {
    var m = manifest();
    if (!m || !Array.isArray(m.tools)) return null;
    for (var i = 0; i < m.tools.length; i += 1) {
      if (m.tools[i] && m.tools[i].slug === slug) return m.tools[i];
    }
    return null;
  }

  function loadSharedRuntime(m) {
    var scripts = (m.runtime && m.runtime.sharedScripts) || [
      '/static/script/ymir-vue-core.js',
      '/static/script/ymir-vue-render-helpers.js',
      '/static/script/ymir-vue-actions.js',
      '/static/script/ymir-vue-app-factory.js',
      '/static/script/ymir-vue-shared.js'
    ];
    return scripts.reduce(function (chain, src) {
      return chain.then(function () { return loadScript(src); });
    }, Promise.resolve());
  }

  function loadCoreToolRuntime(m, app) {
    var runtime = m.runtime || {};
    if (app !== runtime.coreApp) return Promise.resolve();
    var scripts = runtime.coreToolScripts || [
      '/static/script/ymir-vue-core-tool-engines.js',
      '/static/script/ymir-vue-core-tools-schema.js'
    ];
    return scripts.reduce(function (chain, src) {
      return chain.then(function () { return loadScript(src); });
    }, Promise.resolve());
  }

  function boot() {
    var root = findRoot();
    if (!root) return;
    var tool = root.getAttribute('data-tool') || (document.querySelector('[data-ymir-tool]') || {}).dataset.ymirTool;
    if (!window.Vue || !window.ElementPlus) { fail(root, 'Tool assets failed to load.'); return; }

    loadScript(MANIFEST_SCRIPT)
      .then(function () {
        var m = manifest();
        var app = m && m.appByTool && m.appByTool[tool];
        if (!app) { throw new Error('Tool mapping is missing for: ' + tool); }
        root.setAttribute('data-tool-app', app);
        var item = manifestTool(tool);
        if (item && item.category) root.setAttribute('data-tool-category', item.category);
        return loadSharedRuntime(m)
          .then(function () { return loadCoreToolRuntime(m, app); })
          .then(function () { return loadScript(app); });
      })
      .catch(function (error) { fail(root, error && error.message ? error.message : 'Tool failed to load.'); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  window.YmirVueToolLoader = {
    version: VERSION,
    manifestScript: MANIFEST_SCRIPT,
    getManifest: manifest,
    getAppByTool: function () { return (manifest() && manifest().appByTool) || {}; }
  };
})();
