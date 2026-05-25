(function () {
  function byId(id) { return document.getElementById(id); }
  function setValue(id, value) { var el = byId(id); if (el) el.value = value == null ? '' : String(value); }
  function getValue(id) { var el = byId(id); return el ? el.value : ''; }
  function clearValue(id) { setValue(id, ''); }
  function setStatus(targetId, type, message) {
    var el = byId(targetId);
    if (!el) return;
    el.className = 'ymir-status is-visible ymir-status-' + (type || 'info');
    el.textContent = message || '';
  }
  function clearStatus(targetId) {
    var el = byId(targetId);
    if (!el) return;
    el.className = 'ymir-status';
    el.textContent = '';
  }
  function fallbackCopy(text) {
    var t = document.createElement('textarea');
    t.value = text;
    t.setAttribute('readonly', 'readonly');
    t.style.position = 'fixed';
    t.style.left = '-9999px';
    document.body.appendChild(t);
    t.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(t);
    return ok ? Promise.resolve() : Promise.reject(new Error('Copy failed'));
  }
  function copyText(text) {
    text = text == null ? '' : String(text);
    if (!text) return Promise.reject(new Error('Nothing to copy'));
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () { return fallbackCopy(text); });
    }
    return fallbackCopy(text);
  }
  function loadExample(textareaId, value) { setValue(textareaId, value); }
  function downloadText(filename, content) {
    var blob = new Blob([content == null ? '' : String(content)], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename || 'ymir-tool.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>'"]/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[ch];
    });
  }
  window.YmirUI = { byId: byId, copyText: copyText, setStatus: setStatus, clearStatus: clearStatus, loadExample: loadExample, clearValue: clearValue, setValue: setValue, getValue: getValue, downloadText: downloadText, escapeHtml: escapeHtml };
})();
