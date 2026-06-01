/* Page-level CSP-safe direct listeners for urlthunder/index.html. Do not restore inline handlers. */
(function () {
  'use strict';
  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }
  function getJQuery() { return window.jQuery || window.$ || null; }
  function getGlobal(path) {
    return String(path).split('.').reduce(function (ctx, key) { return ctx && ctx[key]; }, window);
  }
  function callGlobal(path, args) {
    var fn = getGlobal(path);
    if (typeof fn === 'function') return fn.apply(window, args || []);
    return undefined;
  }
  function bind(selector, eventName, handler) {
    var el = document.querySelector(selector);
    if (!el) return;
    el.addEventListener(eventName, function (evt) {
      if (eventName === 'click' && el.tagName === 'A' && el.getAttribute('href') === '#') evt.preventDefault();
      handler(evt, el);
    });
  }
  onReady(function () {
    bind(".js-csp-urlthunder-index-001", "click", function (evt, el) { callGlobal("Encryption", []); });
    bind(".js-csp-urlthunder-index-002", "click", function (evt, el) { callGlobal("Decryption", []); });
    bind(".js-csp-urlthunder-index-003", "click", function (evt, el) { callGlobal("empty", []); });
    bind(".js-csp-urlthunder-index-004", "click", function (evt, el) { callGlobal("copyTxtToClipboard", ["#kuai", "#copyallcode2"]); });
    bind(".js-csp-urlthunder-index-005", "click", function (evt, el) { callGlobal("copyTxtToClipboard", ["#xuan", "#copyallcode3"]); });
  });
}());
