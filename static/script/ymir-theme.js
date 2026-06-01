(function () {
  'use strict';
  var STORAGE_KEY = 'ymir-theme';
  var VERSION = '20260531-v58';
  var preference = 'system';
  var mql = null;
  var THEME_COLORS = { light: '#f6f8fb', dark: '#070b12' };

  function safeStorageGet() {
    try { return window.localStorage && localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function safeStorageSet(value) {
    try {
      if (!window.localStorage) return;
      if (!value || value === 'system') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {}
  }
  function prefersDark() {
    try {
      mql = mql || window.matchMedia('(prefers-color-scheme: dark)');
      return !!mql.matches;
    } catch (e) { return false; }
  }
  function normalize(value) {
    return value === 'dark' || value === 'light' ? value : 'system';
  }
  function resolvedTheme(value) {
    value = normalize(value);
    return value === 'system' ? (prefersDark() ? 'dark' : 'light') : value;
  }
  function isZh(lang) {
    return /^zh/i.test(lang || document.documentElement.lang || '');
  }
  function iconFor(theme) {
    return theme === 'dark' ? '☀' : '☾';
  }
  function ariaFor(theme, lang) {
    if (theme === 'dark') return isZh(lang) ? '切换到浅色主题' : 'Switch to light theme';
    return isZh(lang) ? '切换到深色主题' : 'Switch to dark theme';
  }
  function ensureThemeColorMeta() {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      if (document.head) document.head.appendChild(meta);
    }
    return meta;
  }
  function updateThemeColor(theme) {
    try {
      var meta = ensureThemeColorMeta();
      if (meta) meta.setAttribute('content', THEME_COLORS[theme] || THEME_COLORS.light);
    } catch (e) {}
  }
  function updateColorScheme(theme) {
    try { document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light'; } catch (e) {}
  }
  function apply(value, persist) {
    preference = normalize(value);
    var theme = resolvedTheme(preference);
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-theme-preference', preference);
    document.documentElement.setAttribute('data-theme-ready', 'true');
    updateColorScheme(theme);
    updateThemeColor(theme);
    if (persist) safeStorageSet(preference);
    updateToggle();
    try { window.dispatchEvent(new CustomEvent('ymir-theme-applied', { detail: { theme: theme, preference: preference } })); } catch (e) {}
    return theme;
  }
  function toggle() {
    var current = document.documentElement.getAttribute('data-theme') || resolvedTheme(preference);
    apply(current === 'dark' ? 'light' : 'dark', true);
  }
  function updateToggle() {
    var theme = document.documentElement.getAttribute('data-theme') || resolvedTheme(preference);
    var lang = document.documentElement.lang;
    document.querySelectorAll('[data-ymir-theme-toggle]').forEach(function (btn) {
      btn.textContent = iconFor(theme);
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      btn.setAttribute('aria-label', ariaFor(theme, lang));
      btn.setAttribute('title', ariaFor(theme, lang));
      btn.setAttribute('data-theme-state', theme);
    });
  }
  function makeButton() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ymir-theme-toggle';
    btn.setAttribute('data-ymir-theme-toggle', '');
    btn.addEventListener('click', toggle);
    return btn;
  }
  function injectToggle() {
    var inner = document.querySelector('.ymir-topbar-inner');
    var target = document.querySelector('.ymir-topbar-actions') || inner;
    if (!target || target.querySelector('[data-ymir-theme-toggle]')) { updateToggle(); return; }
    var btn = makeButton();
    target.appendChild(btn);
    updateToggle();
  }

  preference = normalize(safeStorageGet());
  apply(preference, false);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectToggle);
  } else {
    injectToggle();
  }
  window.addEventListener('ymir-language-applied', function () { injectToggle(); updateToggle(); });
  try {
    var mq = mql || window.matchMedia('(prefers-color-scheme: dark)');
    var onChange = function () { if (preference === 'system') apply('system', false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  } catch (e) {}

  window.YmirTheme = {
    version: VERSION,
    apply: apply,
    toggle: toggle,
    setPreference: function (value) { return apply(value, true); },
    getPreference: function () { return preference; },
    getTheme: function () { return document.documentElement.getAttribute('data-theme') || resolvedTheme(preference); }
  };
})();
