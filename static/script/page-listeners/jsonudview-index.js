/* Page-level CSP-safe direct listeners for jsonudview/index.html. Do not restore inline handlers. */
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
    bind(".js-csp-jsonudview-index-001", "mouseover", function (evt, el) { if (el && typeof el.focus === 'function') el.focus(); });
    bind(".js-csp-jsonudview-index-002", "change", function (evt, el) { callGlobal("TabSizeChanged", []); });
    bind(".js-csp-jsonudview-index-003", "click", function (evt, el) { callGlobal("QuoteKeysClicked", []); });
    bind(".js-csp-jsonudview-index-004", "click", function (evt, el) { callGlobal("Process", []); });
    bind(".js-csp-jsonudview-index-005", "click", function (evt, el) { callGlobal("SelectAllClicked", []); });
    bind(".js-csp-jsonudview-index-006", "click", function (evt, el) { callGlobal("Empty", []); });
    bind(".js-csp-jsonudview-index-007", "click", function (evt, el) { callGlobal("CollapsibleViewClicked", []); });
    bind(".js-csp-jsonudview-index-008", "click", function (evt, el) { callGlobal("ExpandAllClicked", []); });
    bind(".js-csp-jsonudview-index-009", "click", function (evt, el) { callGlobal("CollapseAllClicked", []); });
    bind(".js-csp-jsonudview-index-010", "click", function (evt, el) { callGlobal("CollapseLevel", [3]); });
    bind(".js-csp-jsonudview-index-011", "click", function (evt, el) { callGlobal("CollapseLevel", [4]); });
    bind(".js-csp-jsonudview-index-012", "click", function (evt, el) { callGlobal("CollapseLevel", [5]); });
    bind(".js-csp-jsonudview-index-013", "click", function (evt, el) { callGlobal("CollapseLevel", [6]); });
    bind(".js-csp-jsonudview-index-014", "click", function (evt, el) { callGlobal("CollapseLevel", [7]); });
    bind(".js-csp-jsonudview-index-015", "click", function (evt, el) { callGlobal("CollapseLevel", [8]); });
    bind(".js-csp-jsonudview-index-016", "click", function (evt, el) { callGlobal("CollapseLevel", [9]); });
  });
}());
