(function () {
  'use strict';

  var RECENT_KEY = 'ymir.recentTools.v1';
  var FAV_KEY = 'ymir.favoriteTools.v1';
  var activeIndex = 0;
  var lastResults = [];
  var favoritesExpanded = false;
  var panelOpen = false;
  var manifestPromise = null;
  var CORE_TOOL_IDS = {
    json: true,
    base64: true,
    urlencode: true,
    formatjs: true,
    unixtime: true,
    textdiff: true,
    txtcount: true,
    regex: true
  };

  function manifest() { return window.YmirToolsManifest || null; }
  function ensureHomeManifest() {
    if (manifest()) return Promise.resolve(manifest());
    if (manifestPromise) return manifestPromise;

    manifestPromise = new Promise(function (resolve) {
      var script = document.querySelector('script[data-ymir-home-manifest]');
      var shouldAppend = false;
      if (!script) {
        script = document.createElement('script');
        script.src = '/static/script/ymir-tools-manifest.js?v=20260710-v63';
        script.async = true;
        script.setAttribute('data-ymir-home-manifest', '');
        shouldAppend = true;
      }
      script.addEventListener('load', function () {
        refreshAfterManifest();
        resolve(manifest());
      }, { once: true });
      script.addEventListener('error', function () {
        if (script.parentNode) script.parentNode.removeChild(script);
        manifestPromise = null;
        resolve(null);
      }, { once: true });
      if (shouldAppend) document.head.appendChild(script);
    });
    return manifestPromise;
  }
  function slugFromHref(href) {
    var match = String(href || '').match(/^\/([^/?#]+)\/?/);
    return match ? match[1] : String(href || '').replace(/^\/+|\/+$/g, '');
  }
  function manifestTool(t) {
    return {
      id: t.id || t.slug,
      href: t.href || ('/' + t.slug + '/'),
      titleZh: t.titleZh || t.titleEn || t.slug,
      titleEn: t.titleEn || t.titleZh || t.slug,
      descZh: t.descriptionZh || t.descriptionEn || '',
      descEn: t.descriptionEn || t.descriptionZh || '',
      accent: t.accent || 'blue',
      icon: t.icon || '›',
      keywords: t.keywords || '',
      category: t.category || ''
    };
  }
  function isCoreTool(t) {
    return !!(t && CORE_TOOL_IDS[t.id || t.slug]);
  }
  function manifestTools() {
    var m = manifest();
    if (!m || !Array.isArray(m.tools)) return null;
    return m.tools.map(manifestTool);
  }
  function coreTools() {
    var tools = manifestTools();
    if (tools) return tools.filter(isCoreTool);
    var seen = {};
    return allToolElements().map(toolData).filter(isCoreTool).filter(function (t) {
      if (seen[t.href]) return false;
      seen[t.href] = true;
      return true;
    });
  }

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
    var href = el.getAttribute('data-tool-href') || el.getAttribute('href') || '#';
    var slug = slugFromHref(href);
    var id = el.getAttribute('data-tool-id') || slug || href;
    if (id.indexOf('dir-') === 0 || id === 'url') id = slug || id;
    return {
      id: id,
      href: href,
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
  function featuredTools() {
    var m = manifest();
    var tools = coreTools();
    if (m && tools && Array.isArray(m.featured)) {
      var byId = {};
      tools.forEach(function (t) { byId[t.id] = t; });
      return m.featured.map(function (id) { return byId[id]; }).filter(Boolean);
    }
    return Array.prototype.slice.call(document.querySelectorAll('[data-home-tool]')).map(toolData);
  }
  function allTools() {
    var tools = manifestTools();
    if (tools) return tools;
    return coreTools();
  }
  function toolById(tools) {
    var byId = {};
    (tools || allTools()).forEach(function (t) { byId[t.id] = t; });
    return byId;
  }
  function featuredToolList() {
    var m = manifest();
    var byId = toolById(coreTools());
    if (m && Array.isArray(m.featured)) {
      return m.featured.map(function (id) { return byId[id]; }).filter(Boolean);
    }
    return featuredTools();
  }
  function homeToolCard(t, index) {
    var zh = t.titleZh || t.titleEn || t.id;
    var en = t.titleEn || t.titleZh || t.id;
    var descZh = t.descZh || t.descriptionZh || t.descEn || t.descriptionEn || t.href;
    var descEn = t.descEn || t.descriptionEn || t.descZh || t.descriptionZh || t.href;
    return '<article class="ymir-feature-card" data-home-tool="" role="link" tabindex="0"' +
      ' data-accent="' + escapeHtml(t.accent || 'blue') + '"' +
      ' data-icon="' + escapeHtml(t.icon || '{}') + '"' +
      ' data-title-zh="' + escapeHtml(zh) + '"' +
      ' data-title-en="' + escapeHtml(en) + '"' +
      ' data-desc-zh="' + escapeHtml(descZh) + '"' +
      ' data-desc-en="' + escapeHtml(descEn) + '"' +
      ' data-tool-href="' + escapeHtml(t.href) + '"' +
      ' data-tool-id="' + escapeHtml(t.id) + '">' +
      '<span aria-hidden="true" class="ymir-feature-icon">' + escapeHtml(t.icon || '{}') + '</span>' +
      '<span class="ymir-feature-body"><strong><span data-card-title="">' + escapeHtml(lang() === 'zh' ? zh : en) + '</span></strong>' +
      '<span data-card-desc="">' + escapeHtml(lang() === 'zh' ? descZh : descEn) + '</span></span>' +
      '<button aria-label="' + escapeHtml((lang() === 'zh' ? '收藏 ' : 'Favorite ') + (lang() === 'zh' ? zh : en)) + '" class="ymir-tool-star" data-star-tool="' + escapeHtml(t.id) + '" type="button">☆</button>' +
      '<span class="ymir-feature-open" data-i18n-en="Open tool" data-i18n-zh="打开工具">' + (lang() === 'zh' ? '打开工具' : 'Open tool') + '</span>' +
      '</article>';
  }
  function directoryTabButton(cat, index) {
    var active = index === 0 ? ' is-active' : '';
    return '<button class="ymir-directory-tab' + active + '" data-directory-tab="' + escapeHtml(cat.id) + '" data-label-en="' + escapeHtml(cat.labelEn || cat.id) + '" data-label-zh="' + escapeHtml(cat.labelZh || cat.labelEn || cat.id) + '" type="button">' + escapeHtml(lang() === 'zh' ? (cat.labelZh || cat.labelEn || cat.id) : (cat.labelEn || cat.labelZh || cat.id)) + '</button>';
  }
  function directoryLink(t, idx) {
    var zh = t.titleZh || t.titleEn || t.id;
    var en = t.titleEn || t.titleZh || t.id;
    var extra = idx >= 8 ? ' is-extra' : '';
    return '<a class="ymir-directory-link' + extra + '" data-directory-tool=""' +
      ' data-title-en="' + escapeHtml(en) + '"' +
      ' data-title-zh="' + escapeHtml(zh) + '"' +
      ' data-tool-href="' + escapeHtml(t.href) + '"' +
      ' data-tool-id="' + escapeHtml(t.id) + '"' +
      ' href="' + escapeHtml(t.href) + '">' +
      '<span aria-hidden="true" class="ymir-directory-icon">' + escapeHtml(t.icon || '›') + '</span>' +
      '<span data-directory-title="">' + escapeHtml(lang() === 'zh' ? zh : en) + '</span>' +
      '<span aria-hidden="true" class="ymir-directory-arrow">›</span></a>';
  }
  function directoryPanel(cat, index, byId) {
    var tools = (cat.tools || []).map(function (id) { return byId[id]; }).filter(Boolean);
    var active = index === 0 ? ' is-active' : '';
    var links = tools.map(directoryLink).join('');
    var showMore = tools.length > 8 ? '<button class="ymir-show-more" data-label-less-en="Show less" data-label-less-zh="收起" data-label-more-en="Show more" data-label-more-zh="显示更多" data-show-more="' + escapeHtml(cat.id) + '" type="button">' + (lang() === 'zh' ? '显示更多' : 'Show more') + '</button>' : '';
    return '<div class="ymir-directory-list' + active + '" data-directory-panel="' + escapeHtml(cat.id) + '">' + links + showMore + '</div>';
  }
  function renderFeaturedFromManifest() {
    var grid = document.querySelector('.ymir-feature-grid');
    var m = manifest();
    if (!grid || !m || !Array.isArray(m.featured)) return false;
    var list = featuredToolList().slice(0, 12);
    if (!list.length) return false;
    grid.innerHTML = list.map(homeToolCard).join('');
    grid.setAttribute('data-render-source', 'manifest');
    return true;
  }
  function renderDirectoryFromManifest() {
    var tabs = document.querySelector('.ymir-directory-tabs');
    var panel = document.getElementById('toolDirectory');
    var m = manifest();
    if (!tabs || !panel || !m || !Array.isArray(m.categories)) return false;
    var byId = toolById(coreTools());
    var categories = m.categories.filter(function (cat) { return Array.isArray(cat.tools) && cat.tools.some(function (id) { return byId[id]; }); });
    if (!categories.length) return false;
    tabs.innerHTML = categories.map(directoryTabButton).join('');
    Array.prototype.slice.call(panel.querySelectorAll('[data-directory-panel]')).forEach(function (oldPanel) { oldPanel.parentNode.removeChild(oldPanel); });
    tabs.insertAdjacentHTML('afterend', categories.map(function (cat, index) { return directoryPanel(cat, index, byId); }).join(''));
    panel.setAttribute('data-render-source', 'manifest');
    return true;
  }
  function hydrateHomeFromManifest() {
    renderFeaturedFromManifest();
    renderDirectoryFromManifest();
  }
  function refreshAfterManifest() {
    hydrateHomeFromManifest();
    var input = document.getElementById('toolSearch');
    renderCommand(input ? input.value : '');
    if (!panelOpen) setPanelOpen(false);
    syncStars();
    renderSide();
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
  function safeClosest(target, selector) {
    return target && target.closest ? target.closest(selector) : null;
  }
  function activeQuickTab() {
    var active = document.querySelector('[data-quick-tab].is-active');
    return active ? active.getAttribute('data-quick-tab') : 'recent';
  }
  function setPanelOpen(open) {
    var p = panel();
    panelOpen = !!open;
    if (p) p.hidden = !panelOpen;
    var input = document.getElementById('toolSearch');
    if (input) input.setAttribute('aria-expanded', panelOpen ? 'true' : 'false');
  }
  function renderIcon(t) {
    return '<span class="ymir-command-result-icon" data-accent="' + escapeHtml(t.accent) + '">' + escapeHtml(t.icon || '{}') + '</span>';
  }
  function resultLink(t, idx) {
    return '<a class="ymir-command-result' + (idx === activeIndex ? ' is-active' : '') + '" role="option" aria-selected="' + (idx === activeIndex ? 'true' : 'false') + '" data-result-index="' + idx + '" href="' + escapeHtml(t.href) + '">' + renderIcon(t) + '<span><strong>' + escapeHtml(titleOf(t)) + '</strong><span>' + escapeHtml(descOf(t) || t.href) + '</span></span></a>';
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
      p.innerHTML = '<div class="ymir-mini-empty">' + (lang() === 'zh' ? '没有找到匹配工具。尝试 JSON、Base64、URL、正则、时间戳或文本对比。' : 'No matching tools. Try JSON, Base64, URL, regex, timestamp, or text diff.') + '</div>';
      lastResults = [];
      return;
    }

    var best = q ? scored.slice(0, 3) : featured.slice(0, 2);
    var hotSource = q ? scored : featured;
    var hot = hotSource.filter(function (t) {
      return !best.some(function (b) { return b.href === t.href; });
    }).slice(0, 3);
    var more = scored.filter(function (t) {
      return !best.some(function (b) { return b.href === t.href; }) && !hot.some(function (h) { return h.href === t.href; });
    }).slice(0, 2);
    lastResults = best.concat(hot).concat(more).slice(0, 7);
    if (activeIndex >= lastResults.length) activeIndex = 0;

    var bestHtml = best.map(function (t, i) { return resultLink(t, i); }).join('');
    var hotHtml = hot.map(function (t, i) { return resultLink(t, best.length + i); }).join('');
    var moreHtml = more.map(function (t, i) { return resultLink(t, best.length + hot.length + i); }).join('');
    p.innerHTML = '<div class="ymir-command-grid">' +
      '<div class="ymir-command-group"><h3>' + (lang() === 'zh' ? '最佳匹配' : 'Best match') + '</h3>' + bestHtml + '</div>' +
      '<div class="ymir-command-group"><h3>' + (lang() === 'zh' ? '热门工具' : 'Featured tools') + '</h3>' + hotHtml + '</div>' +
      '<div class="ymir-command-group"><h3>' + (lang() === 'zh' ? '全部工具' : 'All tools') + '</h3>' + moreHtml + '</div>' +
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
        recentBox.innerHTML = recent.map(function (stored) {
          var current = toolsById[stored.id] || stored;
          return row(Object.assign({}, current, { time: stored.time }), relativeTime(stored.time));
        }).join('');
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
  function updateQuickActionLabels(activeTab) {
    activeTab = activeTab || activeQuickTab();
    var clear = document.querySelector('[data-clear-recent]');
    var manage = document.querySelector('[data-toggle-favorites]');
    if (clear) {
      var clearLabel = activeTab === 'favorites' ? (lang() === 'zh' ? '清空收藏' : 'Clear favorites') : (lang() === 'zh' ? '清空最近' : 'Clear recent');
      clear.textContent = clearLabel;
      clear.setAttribute('aria-label', activeTab === 'favorites' ? (lang() === 'zh' ? '清空收藏工具' : 'Clear favorite tools') : (lang() === 'zh' ? '清空最近使用' : 'Clear recently used tools'));
    }
    if (manage) {
      var label = favoritesExpanded ? (lang() === 'zh' ? '收起收藏' : 'Collapse favorites') : (lang() === 'zh' ? '管理收藏' : 'Manage favorites');
      manage.textContent = label;
      manage.setAttribute('aria-label', label);
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
    var clean = String(str || '').replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
    var pad = clean.length % 4;
    if (pad) clean += new Array(5 - pad).join('=');
    var binary = atob(clean);
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
      if (jsonOut) jsonOut.value = '';
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
    hydrateHomeFromManifest();
    var input = document.getElementById('toolSearch');
    if (input) {
      input.setAttribute('role', 'combobox');
      input.setAttribute('aria-controls', 'ymirCommandPanel');
      input.setAttribute('aria-autocomplete', 'list');
      input.setAttribute('aria-expanded', 'false');
      renderCommand('');
      setPanelOpen(false);
      input.addEventListener('pointerdown', function () { ensureHomeManifest(); }, { once: true, passive: true });
      input.addEventListener('focus', function () {
        ensureHomeManifest().then(function () {
          if (document.activeElement === input) renderCommand(input.value);
        });
        openCommand(input);
      });
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

      var quickTab = safeClosest(e.target, '[data-quick-tab]');
      if (quickTab) {
        var qid = quickTab.getAttribute('data-quick-tab');
        document.querySelectorAll('[data-quick-tab]').forEach(function (b) { b.classList.toggle('is-active', b === quickTab); });
        document.querySelectorAll('[data-quick-panel]').forEach(function (p) {
          var on = p.getAttribute('data-quick-panel') === qid;
          p.hidden = !on;
          p.classList.toggle('is-active', on);
        });
        updateQuickActionLabels(qid);
        return;
      }
      var patternTab = safeClosest(e.target, '[data-pattern-tab]');
      if (patternTab) {
        var pid2 = patternTab.getAttribute('data-pattern-tab');
        document.querySelectorAll('[data-pattern-tab]').forEach(function (b) { b.classList.toggle('is-active', b === patternTab); });
        document.querySelectorAll('[data-pattern-panel]').forEach(function (p) {
          var on2 = p.getAttribute('data-pattern-panel') === pid2;
          p.hidden = !on2;
        });
        return;
      }
      var patternBtn = safeClosest(e.target, '[data-pattern-action]');
      if (patternBtn) { e.preventDefault(); runPatternAction(patternBtn.getAttribute('data-pattern-action')); return; }
      var tryBtn = safeClosest(e.target, '[data-try-query]');
      if (tryBtn && input) { input.value = tryBtn.getAttribute('data-try-query'); input.focus(); openCommand(input); return; }
      var result = safeClosest(e.target, '.ymir-command-result');
      if (result) { var t = lastResults[Number(result.getAttribute('data-result-index'))]; if (t) rememberTool(t); return; }
      if (safeClosest(e.target, '.ymir-command-footer a')) { closeCommand(); return; }
      var star = safeClosest(e.target, '[data-star-tool]');
      if (star) { e.preventDefault(); e.stopPropagation(); toggleFavorite(star.getAttribute('data-star-tool')); return; }
      var card = safeClosest(e.target, '[data-home-tool]');
      if (card) {
        var ct = toolData(card);
        rememberTool(ct);
        if (!safeClosest(e.target, 'a')) window.location.href = ct.href;
        return;
      }
      var dir = safeClosest(e.target, '[data-directory-tool]');
      if (dir) { rememberTool(toolData(dir)); return; }
      var mini = safeClosest(e.target, '[data-mini-tool]');
      if (mini) { var t2 = allTools().filter(function (t) { return t.id === mini.getAttribute('data-mini-tool'); })[0]; if (t2) rememberTool(t2); return; }
      var tab = safeClosest(e.target, '[data-directory-tab]');
      if (tab) {
        var id = tab.getAttribute('data-directory-tab');
        document.querySelectorAll('[data-directory-tab]').forEach(function (b) { b.classList.toggle('is-active', b === tab); });
        document.querySelectorAll('[data-directory-panel]').forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-directory-panel') === id); });
        return;
      }
      var more = safeClosest(e.target, '[data-show-more]');
      if (more) {
        var pid = more.getAttribute('data-show-more');
        var panelEl = document.querySelector('[data-directory-panel="' + pid + '"]');
        if (panelEl) panelEl.classList.toggle('is-expanded');
        updateCardText();
        return;
      }
      if (safeClosest(e.target, '[data-clear-recent]')) { if (activeQuickTab() === 'favorites') { setFavoriteIds([]); favoritesExpanded = false; syncStars(); } else { writeStore(RECENT_KEY, []); } renderSide(); updateQuickActionLabels(); return; }
      if (safeClosest(e.target, '[data-toggle-favorites]')) {
        favoritesExpanded = !favoritesExpanded;
        var favTab = document.querySelector('[data-quick-tab="favorites"]');
        if (favTab) favTab.click();
        renderSide();
        updateQuickActionLabels('favorites');
        return;
      }
      if (panelOpen && !safeClosest(e.target, '.ymir-command-area')) closeCommand();
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
    updateQuickActionLabels();
    initPatternTools();
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(function () { ensureHomeManifest(); }, { timeout: 2500 });
    } else {
      window.setTimeout(function () { ensureHomeManifest(); }, 2500);
    }
  }
  document.addEventListener('DOMContentLoaded', attach);
})();
