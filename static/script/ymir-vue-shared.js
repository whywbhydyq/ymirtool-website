(function () {
  'use strict';
  var VERSION = '20260531-v49';
  if (window.YmirVueShared && window.YmirVueShared.version === VERSION) return;
  var Core = window.YmirVueCore || {};
  var Render = window.YmirVueRenderHelpers || {};
  var Actions = window.YmirVueActions || {};
  var Factory = window.YmirVueAppFactory || {};
  window.YmirVueShared = Object.assign({ version: VERSION }, Core, Render, Actions, Factory);
})();
