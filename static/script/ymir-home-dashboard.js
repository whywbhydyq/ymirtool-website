
(function () {
  'use strict';
  var RECENT_KEY = 'ymir.recentTools.v1';
  var FAV_KEY = 'ymir.favoriteTools.v1';
  var activeIndex = 0;
  var lastResults = [];
  var favoritesExpanded = false;

  function lang() { return (window.YmirI18n && window.YmirI18n.getLanguage && window.YmirI18n.getLanguage()) || document.documentElement.getAttribute('data-ui-lang') || 'zh'; }
  function label(el, kind) { var l = lang() === 'zh' ? 'zh' : 'en'; return el.getAttribute('data-' + kind + '-' + l) || el.getAttribute('data-' + kind + '-en') || el.textContent.trim(); }
  function readStore(key) { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { return []; } }
  function writeStore(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {} }
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
    return allToolElements().map(toolData).filter(function (t) { if (seen[t.href]) return false; seen[t.href] = true; return true; });
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
  function renderIcon(t) { return '<span class="ymir-command-result-icon" data-accent="' + escapeHtml(t.accent) + '">' + escapeHtml(t.icon || '{}') + '</span>'; }
  function escapeHtml(str) { return String(str || '').replace(/[&<>"']/g, function (m) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]; }); }
  function resultLink(t, idx) {
    return '<a class="ymir-command-result' + (idx === activeIndex ? ' is-active' : '') + '" role="option" data-result-index="' + idx + '" href="' + escapeHtml(t.href) + '">' + renderIcon(t) + '<span><strong>' + escapeHtml(titleOf(t)) + '</strong><span>' + escapeHtml(descOf(t) || t.href) + '</span></span></a>';
  }
  function renderCommand(query) {
    var panel = document.getElementById('ymirCommandPanel');
    if (!panel) return;
    var all = allTools();
    var featured = featuredTools();
    var scored = all.map(function (t) { t._score = scoreTool(t, query); return t; }).filter(function (t) { return t._score > 0; }).sort(function (a, b) { return b._score - a._score; });
    if (!scored.length) {
      panel.innerHTML = '<div class="ymir-mini-empty">' + (lang() === 'zh' ? '没有找到匹配工具。尝试 JSON、Base64、MD5、URL、时间戳、文本对比。' : 'No matching tools. Try JSON, Base64, MD5, URL, timestamp, or text diff.') + '</div>';
      lastResults = [];
      return;
    }
    var best = scored.slice(0, 1);
    var feat = scored.filter(function (t) { return featured.some(function (f) { return f.href === t.href; }); }).filter(function (t) { return !best.some(function (b) { return b.href === t.href; }); }).slice(0, 3);
    var rest = scored.filter(function (t) { return !best.concat(feat).some(function (b) { return b.href === t.href; }); }).slice(0, 3);
    lastResults = best.concat(feat).concat(rest).slice(0, 7);
    if (activeIndex >= lastResults.length) activeIndex = 0;
    var bestHtml = best.map(function (t, i) { return resultLink(t, i); }).join('');
    var featHtml = feat.map(function (t, i) { return resultLink(t, best.length + i); }).join('');
    var restHtml = rest.map(function (t, i) { return resultLink(t, best.length + feat.length + i); }).join('');
    var html = '<div class="ymir-command-grid">' +
      '<div class="ymir-command-group"><h3>' + (lang() === 'zh' ? '最佳匹配' : 'Best match') + '</h3>' + bestHtml + '</div>' +
      '<div class="ymir-command-group"><h3>' + (lang() === 'zh' ? '热门工具' : 'Featured tools') + '</h3>' + featHtml + '</div>' +
      '<div class="ymir-command-group"><h3>' + (lang() === 'zh' ? '全部工具' : 'All tools') + '</h3>' + restHtml + '</div>' +
      '</div><div class="ymir-command-footer"><a href="#toolDirectory">' + (lang() === 'zh' ? '查看所有搜索结果' : 'View all search results') + ' →</a></div>';
    panel.innerHTML = html;
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
      var h = Math.round(min / 60); if (h < 24) return h + ' 小时前';
      return '昨天';
    }
    if (min < 1) return 'now';
    if (min < 60) return min + 'm ago';
    var hr = Math.round(min / 60); if (hr < 24) return hr + 'h ago';
    return 'yesterday';
  }
  function renderSide() {
    var recentBox = document.getElementById('ymirRecentTools');
    var favBox = document.getElementById('ymirFavoriteTools');
    var toolsById = {};
    allTools().forEach(function (t) { toolsById[t.id] = t; });
    if (recentBox) {
      var recent = readStore(RECENT_KEY).slice(0, 4);
      recentBox.innerHTML = recent.length ? recent.map(function (t) { return row(t, relativeTime(t.time)); }).join('') : '<p class="ymir-mini-empty">' + (lang() === 'zh' ? '打开工具后会显示在这里。' : 'Tools you open will appear here.') + '</p>';
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
    document.querySelectorAll('[data-directory-tab]').forEach(function (btn) {
      btn.textContent = lang() === 'zh' ? btn.getAttribute('data-label-zh') : btn.getAttribute('data-label-en');
    });
    document.querySelectorAll('[data-show-more]').forEach(function (btn) {
      var panel = document.querySelector('[data-directory-panel="' + btn.getAttribute('data-show-more') + '"]');
      var expanded = panel && panel.classList.contains('is-expanded');
      btn.textContent = expanded ? (lang() === 'zh' ? btn.getAttribute('data-label-less-zh') : btn.getAttribute('data-label-less-en')) : (lang() === 'zh' ? btn.getAttribute('data-label-more-zh') : btn.getAttribute('data-label-more-en'));
    });
  }
  function attach() {
    var input = document.getElementById('toolSearch');
    if (input) {
      renderCommand('');
      input.addEventListener('focus', function () { renderCommand(input.value); });
      input.addEventListener('input', function () { activeIndex = 0; renderCommand(input.value); });
      input.addEventListener('keydown', function (e) {
        if (!lastResults.length) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex = (activeIndex + 1) % lastResults.length; renderCommand(input.value); }
        if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex = (activeIndex - 1 + lastResults.length) % lastResults.length; renderCommand(input.value); }
        if (e.key === 'Enter') { e.preventDefault(); var t = lastResults[activeIndex]; if (t) { rememberTool(t); window.location.href = t.href; } }
        if (e.key === 'Escape') { input.blur(); }
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); var el = document.getElementById('toolSearch'); if (el) el.focus(); }
      var activeCard = document.activeElement && document.activeElement.closest && document.activeElement.closest('[data-home-tool]');
      if (activeCard && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); var t = toolData(activeCard); rememberTool(t); window.location.href = t.href; }
    });
    document.addEventListener('click', function (e) {
      var tryBtn = e.target.closest('[data-try-query]');
      if (tryBtn && input) { input.value = tryBtn.getAttribute('data-try-query'); input.focus(); renderCommand(input.value); return; }
      var result = e.target.closest('.ymir-command-result');
      if (result) { var t = lastResults[Number(result.getAttribute('data-result-index'))]; if (t) rememberTool(t); return; }
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
        var panel = document.querySelector('[data-directory-panel="' + pid + '"]');
        if (panel) panel.classList.toggle('is-expanded');
        updateCardText();
        return;
      }
      if (e.target.closest('[data-clear-recent]')) { writeStore(RECENT_KEY, []); renderSide(); return; }
      if (e.target.closest('[data-toggle-favorites]')) { favoritesExpanded = !favoritesExpanded; renderSide(); return; }
    });
    window.addEventListener('ymir-language-applied', function () { updateCardText(); renderCommand(input ? input.value : ''); renderSide(); });
    updateCardText();
    syncStars();
    renderSide();
  }
  document.addEventListener('DOMContentLoaded', attach);
})();
