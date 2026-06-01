/* Page-level CSP-safe direct listeners for subnetmask/index.html. Do not restore inline handlers. */
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
    bind(".js-csp-subnetmask-index-001", "click", function (evt, el) { callGlobal("calNBFL", [el && el.form]); });
    bind(".js-csp-subnetmask-index-002", "click", function (evt, el) { callGlobal("resetform4", [el && el.form]); });
    bind(".js-csp-subnetmask-index-003", "click", function (evt, el) { callGlobal("calcNWmaskForm2", [el && el.form]); });
    bind(".js-csp-subnetmask-index-004", "click", function (evt, el) { callGlobal("resetform2", [el && el.form]); });
    bind(".js-csp-subnetmask-index-005", "click", function (evt, el) { callGlobal("compute", [el && el.form]); });
    bind(".js-csp-subnetmask-index-006", "click", function (evt, el) { callGlobal("nnclear", [el && el.form]); });
    bind(".js-csp-subnetmask-index-007", "click", function (evt, el) { callGlobal("computeINV1", [el && el.form]); });
    bind(".js-csp-subnetmask-index-008", "click", function (evt, el) { callGlobal("sjzclear", [el && el.form]); });
    bind(".js-csp-subnetmask-index-009", "click", function (evt, el) { callGlobal("computeSNMA", [el && el.form]); });
    bind(".js-csp-subnetmask-index-010", "click", function (evt, el) { callGlobal("dgsclear", [el && el.form]); });
    bind(".js-csp-subnetmask-index-011", "click", function (evt, el) { callGlobal("computeSNMB", [el && el.form]); });
    bind(".js-csp-subnetmask-index-012", "click", function (evt, el) { callGlobal("ymwclear", [el && el.form]); });
    bind(".js-csp-subnetmask-index-013", "click", function (evt, el) { callGlobal("calcIpInvert", [el && el.form]); });
    bind(".js-csp-subnetmask-index-014", "click", function (evt, el) { callGlobal("resetform8", [el && el.form]); });
    bind(".js-csp-subnetmask-index-015", "click", function (evt, el) { callGlobal("compute2", [el && el.form]); });
    bind(".js-csp-subnetmask-index-016", "click", function (evt, el) { callGlobal("wlclear", [el && el.form]); });
    bind(".js-csp-subnetmask-index-017", "click", function (evt, el) { callGlobal("listsubnets", [el && el.form]); });
    bind(".js-csp-subnetmask-index-018", "click", function (evt, el) { callGlobal("calcNeeded", [el && el.form]); });
    bind(".js-csp-subnetmask-index-019", "click", function (evt, el) { callGlobal("resetform6", [el && el.form]); });
    bind(".js-csp-subnetmask-index-020", "click", function (evt, el) { callGlobal("compute3", [el && el.form]); });
    bind(".js-csp-subnetmask-index-021", "click", function (evt, el) { callGlobal("compute4", [el && el.form]); });
    bind(".js-csp-subnetmask-index-022", "click", function (evt, el) { callGlobal("compute5", [el && el.form]); });
    bind(".js-csp-subnetmask-index-023", "click", function (evt, el) { callGlobal("compute6", [el && el.form]); });
    bind(".js-csp-subnetmask-index-024", "click", function (evt, el) { callGlobal("calcAmount", [el && el.form]); });
    bind(".js-csp-subnetmask-index-025", "click", function (evt, el) { callGlobal("resetform7", [el && el.form]); });
  });
}());
