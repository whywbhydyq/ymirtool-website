(function () {
  'use strict';
  var VERSION = '20260531-v51';
  if (window.YmirVueCore && window.YmirVueCore.version === VERSION) return;
  function toText(value) { return String(value == null ? '' : value); }
  function normalizeLang(value) {
    value = toText(value).toLowerCase();
    return value.indexOf('zh') === 0 || value.indexOf('cn') === 0 ? 'zh' : 'en';
  }
  function getLang() {
    try {
      if (window.YmirI18n && typeof window.YmirI18n.getLanguage === 'function') return normalizeLang(window.YmirI18n.getLanguage());
      return normalizeLang(localStorage.getItem('ymir_lang') || document.documentElement.lang || navigator.language || 'en');
    } catch (e) { return 'en'; }
  }
  function setLang(lang) {
    lang = normalizeLang(lang);
    try {
      localStorage.setItem('ymir_lang', lang);
      document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
      if (window.YmirI18n && typeof window.YmirI18n.setLanguage === 'function') window.YmirI18n.setLanguage(lang);
    } catch (e) {}
    return lang;
  }
  function bytes(text) {
    try { return new TextEncoder().encode(toText(text)).length; }
    catch (e) { return unescape(encodeURIComponent(toText(text))).length; }
  }
  function lineCount(text) {
    text = toText(text);
    return text ? text.split(/\r\n|\r|\n/).length : 0;
  }
  function statText(text, labelChars, labelLines) {
    return toText(text).length + ' ' + (labelChars || 'chars') + ' · ' + lineCount(text) + ' ' + (labelLines || 'lines');
  }
  function normalizeSearch(value) { return toText(value).toLowerCase().trim(); }
  function rowText(row) { return Array.isArray(row) ? row.join('\t') : (row && row.values ? row.values.join('\t') : toText(row)); }
  function escapeHtml(value) {
    return toText(value).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; });
  }
  function getMessageApi(source) {
    if (source && source.ElMessage) return source.ElMessage;
    if (source && (source.success || source.error || source.warning)) return source;
    return window.ElementPlus && window.ElementPlus.ElMessage;
  }
  function messageText(options, key, fallback) {
    if (!options) return fallback;
    if (typeof options === 'string') return key === 'copied' ? options : fallback;
    if (typeof options[key] === 'string') return options[key];
    if (key === 'failed' && typeof options.fail === 'string') return options.fail;
    if (key === 'copied' && typeof options.ok === 'string') return options.ok;
    return fallback;
  }
  function notify(type, message, source) {
    var api = getMessageApi(source);
    if (!api) return;
    var fn = api[type] || (type === 'failed' ? api.error : null) || api.info;
    if (typeof fn === 'function') fn(message);
  }
  function copyText(text, options, fallbackFailure) {
    text = toText(text);
    var api = getMessageApi(options);
    var empty = messageText(options, 'empty', 'Nothing to copy.');
    var copied = messageText(options, 'copied', 'Copied.');
    var failed = fallbackFailure || messageText(options, 'failed', 'Copy failed.');
    if (!text) { notify('warning', empty, api); return Promise.resolve(false); }
    function ok() { notify('success', copied, api); return true; }
    function fail() { notify('error', failed, api); return false; }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', 'readonly');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      var result = false;
      try { result = document.execCommand('copy'); } catch (e) { result = false; }
      document.body.removeChild(ta);
      return result ? ok() : fail();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(ok).catch(fallback);
    }
    return Promise.resolve(fallback());
  }
  function setRootError(root, message) {
    if (root) root.innerHTML = '<div class="ymir-vue-noscript">' + escapeHtml(message || 'Tool failed to load.') + '</div>';
  }
  function ensureRuntime(root) {
    if (!window.Vue || !window.ElementPlus) {
      setRootError(root, 'Tool assets failed to load. This tool cannot start.');
      return false;
    }
    return true;
  }


  function getEl(El, key) {
    return (El && El[key]) || (window.ElementPlus && window.ElementPlus[key]);
  }

  window.YmirVueCore = {
    version: VERSION,
    toText: toText, normalizeLang: normalizeLang, getLang: getLang, setLang: setLang, setGlobalLang: setLang,
    bytes: bytes, lineCount: lineCount, statText: statText, normalizeSearch: normalizeSearch, rowText: rowText, escapeHtml: escapeHtml,
    notify: notify, copyText: copyText, setRootError: setRootError, ensureRuntime: ensureRuntime, getEl: getEl
  };
})();
