/* Page-level CSP-safe direct listeners for autoformat/index.html. Do not restore inline handlers. */
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
    bind(".js-csp-autoformat-index-001", "mouseover", function (evt, el) { if (el && typeof el.focus === 'function') el.focus(); });
    bind(".js-csp-autoformat-index-002", "click", function (evt, el) { callGlobal("formatjs", []); });
    bind(".js-csp-autoformat-index-003", "click", function (evt, el) { callGlobal("format3", []); });
    bind(".js-csp-autoformat-index-004", "click", function (evt, el) { callGlobal("format4", []); });
    bind(".js-csp-autoformat-index-005", "click", function (evt, el) { callGlobal("format", []); });
    bind(".js-csp-autoformat-index-006", "click", function (evt, el) { callGlobal("j2f", []); });
    bind(".js-csp-autoformat-index-007", "click", function (evt, el) { callGlobal("CheckWords", []); });
    bind(".js-csp-autoformat-index-008", "click", function (evt, el) { callGlobal("chklen", []); });
    bind(".js-csp-autoformat-index-009", "click", function (evt, el) { var jq = getJQuery(); if (jq) jq("#srcText").val("").focus(); });
  });
}());
