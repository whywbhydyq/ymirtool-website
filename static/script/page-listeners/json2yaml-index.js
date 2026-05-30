/* Page-level CSP-safe direct listeners for json2yaml/index.html. Do not restore inline handlers. */
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
    bind(".js-csp-json2yaml-index-001", "click", function (evt, el) { callGlobal("yamlFormat", ["content"]); });
    bind(".js-csp-json2yaml-index-002", "click", function (evt, el) { callGlobal("json2yaml", ["content", "result"]); });
    bind(".js-csp-json2yaml-index-003", "click", function (evt, el) { callGlobal("ClearAll", []); });
  });
}());
