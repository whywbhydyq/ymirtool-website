/* CSP-safe page listeners for useragent/index.html. */
(function () {
  'use strict';
  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }
  onReady(function () {
    Array.prototype.forEach.call(document.querySelectorAll('.js-useragent-select-on-hover'), function (el) {
      el.addEventListener('mouseover', function () {
        if (typeof el.select === 'function') el.select();
      });
    });
  });
}());
