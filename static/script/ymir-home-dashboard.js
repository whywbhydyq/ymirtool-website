(function () {
  'use strict';

  var RECENT_KEY = 'ymir.recentTools.v1';
  var FAV_KEY = 'ymir.favoriteTools.v1';
  var activeIndex = 0;
  var lastResults = [];
  var favoritesExpanded = false;
  var panelOpen = false;

  function lang() {
    return (window.YmirI18n && window.YmirI18n.getLanguage && window.YmirI18n.getLanguage()) || document.documentElement.getAttribute('data-ui-lang') || 'zh';
  }
  function readStore(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { return []; }
  }
  function writeStore(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  }
  function toolData(el) {
    return {
      id: el.getAttribute('data-tool-id') || el.getAttribute('href') || '',
      href: el.getAttribute('data-tool-href') || el.getAttribute('href') || '#',
      titleZh: el.getAttribute('data-title-zh') || el.textContent.trim(),
      titleEn: el.getAttribute('data-title-en') || el.getAttribute('data-title-zh') || el.textContent.trim(),
      descZh: el.getAttribute('data-desc-zh') || '',
      descEn: el.getAttribute('data-desc-en') || el.getAttribute('data-desc-zh') || '',
      accent: el.getAttribute('data-accent') || 'blue',
      icon: el.getAttribute('data-icon') || '{}',
      keywords: el.getAttribute('data-tool-keywords') || ''
    };
  }
  function titleOf(t) { return lang() === 'zh' ? (t.titleZh || t.titleEn) : (t.titleEn || t.titleZh); }
  function descOf(t) { return lang() === 'zh' ? (t.descZh || t.descEn) : (t.descEn || t.descZh); }
  function allToolElements() { return Array.prototype.slice.call(document.querySelectorAll('[data-home-tool],[data-directory-tool]')); }
  function featuredTools() { return Array.prototype.slice.call(document.querySelectorAll('[data-home-tool]')).map(toolData); }
  function allTools() {
    var seen = {};
    return allToolElements().map(toolData).filter(function (t) {
      if (seen[t.href]) return false;
      seen[t.href] = true;
      return true;
    });
  }
  function norm(s) { return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim(); }
  function scoreTool(t, query) {
    var q = norm(query);
    if (!q) return 1;
    var title = norm(t.titleZh + ' ' + t.titleEn);
    var keys = norm(t.keywords + ' ' + t.href + ' ' + t.descZh + ' ' + t.descEn);
    if (title === q) return 100;
    if (title.indexOf(q) === 0) return 80;
    if (title.indexOf(q) > -1) return 60;
    if (keys.indexOf(q) > -1) return 35;
    return 0;
  }
  function panel() { return document.getElementById('ymirCommandPanel'); }
  function setPanelOpen(open) {
    var p = panel();
    panelOpen = !!open;
    if (p) p.hidden = !panelOpen;
  }
  function renderIcon(t) {
    return '<span class="ymir-command-result-icon" data-accent="' + escapeHtml(t.accent) + '">' + escapeHtml(t.icon || '{}') + '</span>';
  }
  function resultLink(t, idx) {
    return '<a class="ymir-command-result' + (idx === activeIndex ? ' is-active' : '') + '" role="option" data-result-index="' + idx + '" href="' + escapeHtml(t.href) + '">' + renderIcon(t) + '<span><strong>' + escapeHtml(titleOf(t)) + '</strong><span>' + escapeHtml(descOf(t) || t.href) + '</span></span></a>';
  }
  function renderCommand(query) {
    var p = panel();
    if (!p) return;
    var q = norm(query);
    var featured = featuredTools();
    var scored = allTools().map(function (t) {
      t._score = scoreTool(t, query);
      return t;
    }).filter(function (t) {
      return t._score > 0;
    }).sort(function (a, b) {
      return b._score - a._score;
    });

    if (!scored.length) {
      p.innerHTML = '<div class="ymir-mini-empty">' + (lang() === 'zh' ? '没有找到匹配工具。尝试 JSON、Base64、MD5、URL、时间戳、文本对比。' : 'No matching tools. Try JSON, Base64, MD5, URL, timestamp, or text diff.') + '</div>';
      lastResults = [];
      return;
    }

    var best = q ? scored.slice(0, 3) : featured.slice(0, 2);
    var hotSource = q ? scored : featured;
    var hot = hotSource.filter(function (t) {
      return !best.some(function (b) { return b.href === t.href; });
    }).slice(0, 4);
    lastResults = best.concat(hot).slice(0, 7);
    if (activeIndex >= lastResults.length) activeIndex = 0;

    var bestHtml = best.map(function (t, i) { return resultLink(t, i); }).join('');
    var hotHtml = hot.map(function (t, i) { return resultLink(t, best.length + i); }).join('');
    p.innerHTML = '<div class="ymir-command-grid">' +
      '<div class="ymir-command-group"><h3>' + (lang() === 'zh' ? '最佳匹配' : 'Best match') + '</h3>' + bestHtml + '</div>' +
      '<div class="ymir-command-group"><h3>' + (lang() === 'zh' ? '热门工具' : 'Featured tools') + '</h3>' + hotHtml + '</div>' +
      '</div><div class="ymir-command-footer"><a href="#toolDirectory">' + (lang() === 'zh' ? '查看所有搜索结果' : 'View all search results') + ' →</a></div>';
  }
  function rememberTool(t) {
    var list = readStore(RECENT_KEY).filter(function (x) { return x.id !== t.id; });
    list.unshift({ id: t.id, href: t.href, titleZh: t.titleZh, titleEn: t.titleEn, accent: t.accent, icon: t.icon, time: Date.now() });
    writeStore(RECENT_KEY, list.slice(0, 10));
  }
  function getFavoriteIds() { return readStore(FAV_KEY); }
  function setFavoriteIds(ids) { writeStore(FAV_KEY, ids); }
  function toggleFavorite(id) {
    var ids = getFavoriteIds();
    ids = ids.indexOf(id) > -1 ? ids.filter(function (x) { return x !== id; }) : ids.concat(id);
    setFavoriteIds(ids);
    renderSide();
    syncStars();
  }
  function syncStars() {
    var ids = getFavoriteIds();
    document.querySelectorAll('[data-star-tool]').forEach(function (btn) {
      var active = ids.indexOf(btn.getAttribute('data-star-tool')) > -1;
      btn.classList.toggle('is-active', active);
      btn.textContent = active ? '★' : '☆';
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }
  function row(t, suffix) {
    return '<a class="ymir-mini-tool-row" href="' + escapeHtml(t.href) + '" data-mini-tool="' + escapeHtml(t.id) + '"><span class="ymir-mini-icon">' + escapeHtml(t.icon || '{}') + '</span><span>' + escapeHtml(titleOf(t)) + '</span><small>' + escapeHtml(suffix || '') + '</small></a>';
  }
  function relativeTime(ts) {
    if (!ts) return '';
    var diff = Math.max(0, Date.now() - ts);
    var min = Math.round(diff / 60000);
    if (lang() === 'zh') {
      if (min < 1) return '刚刚';
      if (min < 60) return min + ' 分钟前';
      var h = Math.round(min / 60);
      if (h < 24) return h + ' 小时前';
      return '昨天';
    }
    if (min < 1) return 'now';
    if (min < 60) return min + 'm ago';
    var hr = Math.round(min / 60);
    if (hr < 24) return hr + 'h ago';
    return 'yesterday';
  }
  function renderSide() {
    var recentBox = document.getElementById('ymirRecentTools');
    var favBox = document.getElementById('ymirFavoriteTools');
    var toolsById = {};
    allTools().forEach(function (t) { toolsById[t.id] = t; });
    if (recentBox) {
      var recent = readStore(RECENT_KEY).slice(0, 4);
      if (recent.length) {
        recentBox.innerHTML = recent.map(function (t) { return row(t, relativeTime(t.time)); }).join('');
      } else {
        recentBox.innerHTML = featuredTools().slice(0, 4).map(function (t) { return row(t, lang() === 'zh' ? '建议' : 'start'); }).join('');
      }
    }
    if (favBox) {
      var ids = getFavoriteIds();
      var limit = favoritesExpanded ? ids.length : 4;
      var favs = ids.map(function (id) { return toolsById[id]; }).filter(Boolean).slice(0, limit);
      favBox.innerHTML = favs.length ? favs.map(function (t) { return row(t, '★'); }).join('') : '<p class="ymir-mini-empty">' + (lang() === 'zh' ? '点击工具卡片上的星标进行收藏。' : 'Click a star on a tool card to save it.') + '</p>';
    }
  }
  function updateCardText() {
    document.querySelectorAll('[data-home-tool]').forEach(function (card) {
      var t = toolData(card);
      var title = card.querySelector('[data-card-title]');
      var desc = card.querySelector('[data-card-desc]');
      if (title) title.textContent = titleOf(t);
      if (desc) desc.textContent = descOf(t);
      var star = card.querySelector('[data-star-tool]');
      if (star) star.setAttribute('aria-label', (lang() === 'zh' ? '收藏 ' : 'Favorite ') + titleOf(t));
    });
    document.querySelectorAll('[data-directory-tool]').forEach(function (link) {
      var t = toolData(link);
      var label = link.querySelector('[data-directory-title]') || Array.prototype.slice.call(link.querySelectorAll('span')).filter(function (span) { return !span.getAttribute('aria-hidden'); })[0];
      if (label) label.textContent = titleOf(t);
    });
    document.querySelectorAll('[data-directory-tab]').forEach(function (btn) {
      btn.textContent = lang() === 'zh' ? btn.getAttribute('data-label-zh') : btn.getAttribute('data-label-en');
    });
    document.querySelectorAll('[data-show-more]').forEach(function (btn) {
      var panelEl = document.querySelector('[data-directory-panel="' + btn.getAttribute('data-show-more') + '"]');
      var expanded = panelEl && panelEl.classList.contains('is-expanded');
      btn.textContent = expanded ? (lang() === 'zh' ? btn.getAttribute('data-label-less-zh') : btn.getAttribute('data-label-less-en')) : (lang() === 'zh' ? btn.getAttribute('data-label-more-zh') : btn.getAttribute('data-label-more-en'));
    });
  }
  function openCommand(input) {
    activeIndex = 0;
    setPanelOpen(true);
    renderCommand(input ? input.value : '');
  }
  function closeCommand() {
    setPanelOpen(false);
  }
  function patternText(zh, en) {
    return lang() === 'zh' ? zh : en;
  }
  function patternInput(name) {
    return document.querySelector('[data-pattern-input="' + name + '"]');
  }
  function patternOutput(name) {
    return document.querySelector('[data-pattern-output="' + name + '"]');
  }
  function patternStatus(name, message) {
    var el = document.querySelector('[data-pattern-status="' + name + '"]');
    if (el) el.textContent = message || '';
  }
  function copyText(text, name) {
    if (!text) { patternStatus(name, patternText('没有可复制的内容。', 'Nothing to copy.')); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        patternStatus(name, patternText('已复制结果。', 'Copied result.'));
      }, function () {
        patternStatus(name, patternText('复制失败，请手动选择复制。', 'Copy failed. Select and copy manually.'));
      });
    } else {
      patternStatus(name, patternText('浏览器不支持自动复制，请手动选择复制。', 'Clipboard is unavailable. Select and copy manually.'));
    }
  }
  function encodeUtf8(str) {
    var bytes = new TextEncoder().encode(str);
    var binary = '';
    bytes.forEach(function (b) { binary += String.fromCharCode(b); });
    return btoa(binary);
  }
  function decodeUtf8(str) {
    var binary = atob(str.replace(/\s+/g, ''));
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }
  function runPatternAction(action) {
    if (action.indexOf('json-') === 0) {
      var jsonIn = patternInput('json');
      var jsonOut = patternOutput('json');
      var raw = jsonIn ? jsonIn.value : '';
      if (action === 'json-copy') { copyText(jsonOut && jsonOut.value, 'json'); return; }
      try {
        var parsed = JSON.parse(raw);
        if (action === 'json-minify') jsonOut.value = JSON.stringify(parsed);
        else jsonOut.value = JSON.stringify(parsed, null, 2);
        patternStatus('json', action === 'json-validate' ? patternText('JSON 有效。', 'Valid JSON.') : patternText('结果已更新。', 'Result updated.'));
      } catch (err) {
        patternStatus('json', patternText('JSON 无效：', 'Invalid JSON: ') + err.message);
      }
      return;
    }
    if (action.indexOf('base64-') === 0) {
      var bIn = patternInput('base64');
      var bOut = patternOutput('base64');
      var value = bIn ? bIn.value : '';
      if (action === 'base64-clear') {
        if (bIn) bIn.value = '';
        if (bOut) bOut.value = '';
        patternStatus('base64', patternText('已清空。', 'Cleared.'));
        return;
      }
      if (action === 'base64-copy') { copyText(bOut && bOut.value, 'base64'); return; }
      try {
        bOut.value = action === 'base64-decode' ? decodeUtf8(value) : encodeUtf8(value);
        patternStatus('base64', action === 'base64-decode' ? patternText('已解码。', 'Decoded.') : patternText('已编码。', 'Encoded.'));
      } catch (err2) {
        patternStatus('base64', patternText('Base64 输入无效。', 'Invalid Base64 input.'));
      }
      return;
    }
    if (action.indexOf('diff-') === 0) {
      var a = patternInput('diff-a');
      var b = patternInput('diff-b');
      var out = patternOutput('textdiff');
      if (action === 'diff-clear') {
        if (a) a.value = '';
        if (b) b.value = '';
        if (out) out.value = '';
        patternStatus('textdiff', patternText('已清空。', 'Cleared.'));
        return;
      }
      if (action === 'diff-copy') { copyText(out && out.value, 'textdiff'); return; }
      var left = (a && a.value ? a.value : '').split(/\r?\n/);
      var right = (b && b.value ? b.value : '').split(/\r?\n/);
      var max = Math.max(left.length, right.length);
      var lines = [];
      var added = 0, removed = 0, changed = 0;
      for (var i = 0; i < max; i++) {
        var l = left[i];
        var r = right[i];
        if (l === r) { if (l !== undefined && l !== '') lines.push('  ' + l); continue; }
        if (l === undefined) { lines.push('+ ' + r); added++; continue; }
        if (r === undefined) { lines.push('- ' + l); removed++; continue; }
        lines.push('~ ' + l + ' → ' + r); changed++;
      }
      if (out) out.value = lines.join('\n') || patternText('没有差异。', 'No differences.');
      patternStatus('textdiff', patternText('新增 ', 'Added ') + added + patternText('，删除 ', ', removed ') + removed + patternText('，修改 ', ', changed ') + changed + '。');
      return;
    }
  }
  function initPatternTools() {
    runPatternAction('json-format');
    runPatternAction('base64-encode');
    runPatternAction('diff-compare');
  }

  function attach() {
    var input = document.getElementById('toolSearch');
    if (input) {
      renderCommand('');
      setPanelOpen(true);
      input.addEventListener('focus', function () { openCommand(input); });
      input.addEventListener('input', function () { activeIndex = 0; setPanelOpen(true); renderCommand(input.value); });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { e.preventDefault(); closeCommand(); input.blur(); return; }
        if (!panelOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) openCommand(input);
        if (!lastResults.length) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex = (activeIndex + 1) % lastResults.length; renderCommand(input.value); }
        if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex = (activeIndex - 1 + lastResults.length) % lastResults.length; renderCommand(input.value); }
        if (e.key === 'Enter') {
          e.preventDefault();
          var t = lastResults[activeIndex];
          if (t) { rememberTool(t); window.location.href = t.href; }
        }
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement && !/input|textarea|select/i.test(document.activeElement.tagName)) {
        e.preventDefault();
        var el = document.getElementById('toolSearch');
        if (el) el.focus();
      }
      var activeCard = document.activeElement && document.activeElement.closest && document.activeElement.closest('[data-home-tool]');
      if (activeCard && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        var t = toolData(activeCard);
        rememberTool(t);
        window.location.href = t.href;
      }
    });
    document.addEventListener('click', function (e) {
      var patternBtn = e.target.closest('[data-pattern-action]');
      if (patternBtn) { e.preventDefault(); runPatternAction(patternBtn.getAttribute('data-pattern-action')); return; }
      var tryBtn = e.target.closest('[data-try-query]');
      if (tryBtn && input) { input.value = tryBtn.getAttribute('data-try-query'); input.focus(); openCommand(input); return; }
      var result = e.target.closest('.ymir-command-result');
      if (result) { var t = lastResults[Number(result.getAttribute('data-result-index'))]; if (t) rememberTool(t); return; }
      if (e.target.closest('.ymir-command-footer a')) { closeCommand(); return; }
      var star = e.target.closest('[data-star-tool]');
      if (star) { e.preventDefault(); e.stopPropagation(); toggleFavorite(star.getAttribute('data-star-tool')); return; }
      var card = e.target.closest('[data-home-tool]');
      if (card) {
        var ct = toolData(card);
        rememberTool(ct);
        if (!e.target.closest('a')) window.location.href = ct.href;
        return;
      }
      var dir = e.target.closest('[data-directory-tool]');
      if (dir) { rememberTool(toolData(dir)); return; }
      var mini = e.target.closest('[data-mini-tool]');
      if (mini) { var t2 = allTools().filter(function (t) { return t.id === mini.getAttribute('data-mini-tool'); })[0]; if (t2) rememberTool(t2); return; }
      var tab = e.target.closest('[data-directory-tab]');
      if (tab) {
        var id = tab.getAttribute('data-directory-tab');
        document.querySelectorAll('[data-directory-tab]').forEach(function (b) { b.classList.toggle('is-active', b === tab); });
        document.querySelectorAll('[data-directory-panel]').forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-directory-panel') === id); });
        return;
      }
      var more = e.target.closest('[data-show-more]');
      if (more) {
        var pid = more.getAttribute('data-show-more');
        var panelEl = document.querySelector('[data-directory-panel="' + pid + '"]');
        if (panelEl) panelEl.classList.toggle('is-expanded');
        updateCardText();
        return;
      }
      if (e.target.closest('[data-clear-recent]')) { writeStore(RECENT_KEY, []); renderSide(); return; }
      if (e.target.closest('[data-toggle-favorites]')) { favoritesExpanded = !favoritesExpanded; renderSide(); return; }
      if (panelOpen && !e.target.closest('.ymir-command-area')) closeCommand();
    });
    window.addEventListener('ymir-language-applied', function () {
      updateCardText();
      renderCommand(input ? input.value : '');
      if (!panelOpen) closeCommand();
      renderSide();
    });
    updateCardText();
    syncStars();
    renderSide();
    initPatternTools();
  }
  document.addEventListener('DOMContentLoaded', attach);
})();
