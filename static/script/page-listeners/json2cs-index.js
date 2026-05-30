/* Page-level CSP-safe direct listeners for json2cs/index.html. Do not restore inline handlers. */
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
    bind(".js-csp-json2cs-index-001", "mouseover", function (evt, el) { if (el && typeof el.focus === 'function') el.focus(); });
    bind(".js-csp-json2cs-index-002", "click", function (evt, el) { callGlobal("startConvert", []); });
    bind(".js-csp-json2cs-index-003", "click", function (evt, el) { callGlobal("Empty", []); });
  });
}());
