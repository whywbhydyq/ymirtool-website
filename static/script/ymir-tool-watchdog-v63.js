(function () {
  'use strict';
  var VERSION = '20260710-v63';
  var MAX_WAIT_MS = 8000;

  function root() {
    return document.querySelector('.ymir-vue-tool-root[data-tool]') || document.getElementById('ymir-vue-tool-app');
  }
  function isMounted(node) {
    if (!node) return false;
    if (node.hasAttribute('data-v-app')) return true;
    return !!node.querySelector('.ymir-vue-workbench, .ymir-vue-app, [data-v-app]');
  }
  function isExplicitFailure(node) {
    return !!(node && node.querySelector('.ymir-vue-noscript'));
  }
  function language() {
    return String(document.documentElement.lang || '').toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en';
  }
  function diagnostics() {
    var missing = [];
    if (!window.YmirToolsManifest) missing.push('manifest');
    if (!window.Vue) missing.push('Vue');
    if (!window.ElementPlus) missing.push('ElementPlus');
    if (!window.YmirVueAppFactory) missing.push('app factory');
    return missing;
  }
  function showFailure(node) {
    if (!node || isMounted(node) || node.getAttribute('data-runtime-state') === 'failed') return;
    var zh = language() === 'zh';
    var missing = diagnostics();
    node.setAttribute('data-runtime-state', 'failed');
    node.setAttribute('data-runtime-version', VERSION);
    node.setAttribute('data-runtime-missing', missing.join(','));
    node.innerHTML = '<div class="ymir-runtime-error" role="alert">' +
      '<strong>' + (zh ? '工具组件未能正常启动' : 'The tool could not start') + '</strong>' +
      '<p>' + (zh ? '页面已停止无限加载。请重新加载一次；如果浏览器仍使用旧缓存，可进行强制刷新。下方静态示例仍可用于确认输入输出格式。' : 'The endless loader has been stopped. Reload once; if the browser still uses an older cached asset, perform a hard refresh. The static example below remains available.') + '</p>' +
      '<div class="ymir-runtime-error__actions"><button type="button" data-ymir-runtime-retry>' + (zh ? '重新加载' : 'Reload') + '</button>' +
      '<a href="#ymir-static-fallback">' + (zh ? '查看静态示例' : 'View static example') + '</a></div></div>';
    document.body.classList.add('ymir-tool-failed');
    var fallback = document.querySelector('.ymir-static-tool-fallback');
    if (fallback) fallback.id = 'ymir-static-fallback';
    var retry = node.querySelector('[data-ymir-runtime-retry]');
    if (retry) retry.addEventListener('click', function () { window.location.reload(); });
    if (window.console && console.error) console.error('Ymir Tool runtime failed to mount.', { version: VERSION, missing: missing });
  }
  function markReady(node) {
    if (!node) return;
    node.setAttribute('data-runtime-state', 'ready');
    node.setAttribute('data-runtime-version', VERSION);
    document.body.classList.add('ymir-tool-ready');
    document.body.classList.remove('ymir-tool-failed');
  }
  function start() {
    var node = root();
    if (!node) return;
    if (isMounted(node)) { markReady(node); return; }
    if (isExplicitFailure(node)) { showFailure(node); return; }
    var started = Date.now();
    var observer = new MutationObserver(function () {
      if (isMounted(node)) { observer.disconnect(); markReady(node); }
      else if (isExplicitFailure(node)) { observer.disconnect(); showFailure(node); }
    });
    observer.observe(node, { childList: true, subtree: true, attributes: true });
    var timer = window.setInterval(function () {
      if (isMounted(node)) {
        window.clearInterval(timer);
        observer.disconnect();
        markReady(node);
      } else if (isExplicitFailure(node) || Date.now() - started >= MAX_WAIT_MS) {
        window.clearInterval(timer);
        observer.disconnect();
        showFailure(node);
      }
    }, 250);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
  window.YmirToolWatchdog = { version: VERSION, start: start };
})();
