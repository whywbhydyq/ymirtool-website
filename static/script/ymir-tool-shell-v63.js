(function () {
  'use strict';

  var VERSION = '20260810-v68';
  var MANIFEST_SRC = '/static/script/ymir-tools-manifest.js';
  var FAVORITES_KEY = 'ymir-tool-favorites-v1';
  var RECENTS_KEY = 'ymir-tool-recents-v1';
  var MAX_RESULTS = 12;
  var manifestPromise = null;

  function qs(selector, root) { return (root || document).querySelector(selector); }
  function qsa(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
  function isZh() {
    var shellLanguage = document.documentElement.getAttribute('data-shell-language');
    return /^zh/i.test(shellLanguage || document.documentElement.lang || navigator.language || '');
  }
  function text(zh, en) { return isZh() ? zh : en; }
  function safeParse(value, fallback) {
    try { var parsed = JSON.parse(value); return parsed == null ? fallback : parsed; } catch (error) { return fallback; }
  }
  function storageGet(key, fallback) {
    try { return safeParse(localStorage.getItem(key), fallback); } catch (error) { return fallback; }
  }
  function storageSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) {}
  }
  function svg(name) {
    var paths = {
      logo: '<path d="M5 6.5 12 3l7 3.5v7L12 17l-7-3.5v-7Z"/><path d="m8.5 8 3.5 2 3.5-2M12 10v4"/>',
      search: '<circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 4 4"/>',
      grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
      book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16Z"/>',
      moon: '<path d="M20 15.2A8 8 0 0 1 8.8 4 8.5 8.5 0 1 0 20 15.2Z"/>',
      menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
      close: '<path d="m6 6 12 12M18 6 6 18"/>',
      star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
      link: '<path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1"/>',
      arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
      chevron: '<path d="m9 18 6-6-6-6"/>',
      up: '<path d="m6 14 6-6 6 6"/>',
      check: '<path d="m5 12 4 4L19 6"/>',
      command: '<path d="M9 6v12M15 6v12M6 9h12M6 15h12"/>'
    };
    return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (paths[name] || paths.chevron) + '</svg>';
  }

  function ensureManifest() {
    if (window.YmirToolsManifest) return Promise.resolve(window.YmirToolsManifest);
    if (manifestPromise) return manifestPromise;
    manifestPromise = new Promise(function (resolve, reject) {
      var existing = qs('script[src^="' + MANIFEST_SRC + '"]');
      function done() {
        if (window.YmirToolsManifest) resolve(window.YmirToolsManifest);
        else reject(new Error('Tool directory failed to load.'));
      }
      if (existing) {
        existing.addEventListener('load', done, { once: true });
        setTimeout(function () { if (window.YmirToolsManifest) resolve(window.YmirToolsManifest); }, 100);
        return;
      }
      var script = document.createElement('script');
      script.src = MANIFEST_SRC + '?v=' + encodeURIComponent(VERSION);
            script.onload = done;
      script.onerror = function () { reject(new Error('Tool directory failed to load.')); };
      document.head.appendChild(script);
    });
    return manifestPromise;
  }

  function currentSlug() {
    var main = qs('[data-ymir-tool]');
    if (main && main.getAttribute('data-ymir-tool')) return main.getAttribute('data-ymir-tool');
    var root = qs('.ymir-vue-tool-root[data-tool]');
    return root ? root.getAttribute('data-tool') : '';
  }

  function toolBySlug(manifest, slug) {
    if (!manifest || !Array.isArray(manifest.tools)) return null;
    return manifest.tools.find(function (item) { return item && item.slug === slug; }) || null;
  }

  function addSkipLink() {
    if (qs('.ymir-skip-link')) return;
    var link = document.createElement('a');
    link.className = 'ymir-skip-link';
    link.href = '#ymir-tool-workspace';
    link.textContent = text('跳到工具工作区', 'Skip to tool workspace');
    document.body.insertBefore(link, document.body.firstChild);
  }

  function createIconButton(className, label, iconName) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
    button.innerHTML = svg(iconName);
    return button;
  }

  function buildTopbar() {
    var topbar = qs('.ymir-topbar');
    if (!topbar) return;
    topbar.setAttribute('data-ymir-shell', VERSION);
    var inner = qs('.ymir-topbar-inner', topbar);
    if (!inner) {
      inner = document.createElement('div');
      inner.className = 'ymir-topbar-inner';
      topbar.appendChild(inner);
    }
    inner.innerHTML = '';

    var brand = document.createElement('a');
    brand.className = 'ymir-brand';
    brand.href = '/';
    brand.innerHTML = '<span class="ymir-brand-mark">' + svg('logo') + '</span><span class="ymir-brand-copy"><strong>Ymir Tool</strong><small>' + text('开发者工具箱', 'Developer toolbox') + '</small></span>';

    var nav = document.createElement('nav');
    nav.className = 'ymir-nav';
    nav.setAttribute('aria-label', text('主导航', 'Primary navigation'));
    nav.innerHTML = [
      '<a href="/tools.html" data-nav="tools">' + svg('grid') + '<span>' + text('全部工具', 'All tools') + '</span></a>',
      '<a href="/guides.html" data-nav="guides">' + svg('book') + '<span>' + text('使用指南', 'Guides') + '</span></a>',
      '<a href="/about.html" data-nav="about"><span>' + text('关于', 'About') + '</span></a>'
    ].join('');

    var actions = document.createElement('div');
    actions.className = 'ymir-topbar-actions';
    var searchButton = document.createElement('button');
    searchButton.type = 'button';
    searchButton.className = 'ymir-global-search-trigger';
    searchButton.setAttribute('data-ymir-search-trigger', '');
    searchButton.setAttribute('aria-haspopup', 'dialog');
    searchButton.innerHTML = svg('search') + '<span>' + text('搜索工具', 'Search tools') + '</span><kbd>⌘ K</kbd>';

    var themeButton = createIconButton('ymir-theme-toggle', text('切换主题', 'Toggle color theme'), 'moon');
    themeButton.setAttribute('data-ymir-theme-toggle', '');
    themeButton.addEventListener('click', function () {
      if (window.YmirTheme && typeof window.YmirTheme.toggle === 'function') window.YmirTheme.toggle();
      else {
        var html = document.documentElement;
        html.setAttribute('data-theme', html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
      }
    });

    var menuButton = createIconButton('ymir-mobile-menu-trigger', text('打开菜单', 'Open menu'), 'menu');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-controls', 'ymir-mobile-menu');

    actions.appendChild(searchButton);
    actions.appendChild(themeButton);
    actions.appendChild(menuButton);
    inner.appendChild(brand);
    inner.appendChild(nav);
    inner.appendChild(actions);

    var mobile = document.createElement('div');
    mobile.className = 'ymir-mobile-menu';
    mobile.id = 'ymir-mobile-menu';
    mobile.hidden = true;
    mobile.innerHTML = '<div class="ymir-mobile-menu__inner"><a href="/tools.html">' + svg('grid') + '<span>' + text('全部工具', 'All tools') + '</span></a><a href="/guides.html">' + svg('book') + '<span>' + text('使用指南', 'Guides') + '</span></a><a href="/about.html"><span>' + text('关于 Ymir Tool', 'About Ymir Tool') + '</span></a><a href="/methodology.html"><span>' + text('测试方法', 'Methodology') + '</span></a><a href="/sources.html"><span>' + text('来源', 'Sources') + '</span></a></div>';
    topbar.appendChild(mobile);

    menuButton.addEventListener('click', function () {
      var open = mobile.hidden;
      mobile.hidden = !open;
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuButton.innerHTML = svg(open ? 'close' : 'menu');
      document.documentElement.classList.toggle('ymir-menu-open', open);
    });

    if (window.YmirTheme && typeof window.YmirTheme.apply === 'function') {
      window.YmirTheme.apply(window.YmirTheme.getPreference ? window.YmirTheme.getPreference() : 'system', false);
    }
  }

  function buildSearchDialog() {
    if (qs('#ymir-tool-search-dialog')) return;
    var dialog = document.createElement('div');
    dialog.className = 'ymir-search-dialog';
    dialog.id = 'ymir-tool-search-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'ymir-search-title');
    dialog.hidden = true;
    dialog.innerHTML = '<div class="ymir-search-backdrop" data-ymir-search-close></div>' +
      '<section class="ymir-search-panel">' +
      '<header><div><p>' + text('工具导航', 'Tool navigator') + '</p><h2 id="ymir-search-title">' + text('快速打开一个工具', 'Open a tool quickly') + '</h2></div><button type="button" class="ymir-search-close" data-ymir-search-close aria-label="' + text('关闭', 'Close') + '">' + svg('close') + '</button></header>' +
      '<label class="ymir-search-input-wrap">' + svg('search') + '<span class="sr-only">' + text('搜索工具', 'Search tools') + '</span><input type="search" autocomplete="off" spellcheck="false" placeholder="' + text('搜索 JSON、Base64、正则表达式…', 'Search JSON, Base64, regex…') + '" data-ymir-search-input><kbd>ESC</kbd></label>' +
      '<div class="ymir-search-summary" data-ymir-search-summary></div>' +
      '<div class="ymir-search-results" data-ymir-search-results role="listbox"></div>' +
      '<footer><span>' + text('↑↓ 选择', '↑↓ Select') + '</span><span>↵ ' + text('打开', 'Open') + '</span><span>Esc ' + text('关闭', 'Close') + '</span></footer>' +
      '</section>';
    document.body.appendChild(dialog);

    var input = qs('[data-ymir-search-input]', dialog);
    var results = qs('[data-ymir-search-results]', dialog);
    var summary = qs('[data-ymir-search-summary]', dialog);
    var tools = [];
    var activeIndex = 0;
    var lastFocus = null;

    function normalize(value) { return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim(); }
    function score(item, query) {
      if (!query) return item.featured ? 1000 - (item.featuredRank || 99) : 200 - (item.directoryRank || 99);
      var haystack = normalize([item.slug, item.titleEn, item.titleZh, item.descriptionEn, item.descriptionZh, item.keywords, item.categoryLabelEn, item.categoryLabelZh].join(' '));
      var terms = query.split(' ').filter(Boolean);
      var total = 0;
      terms.forEach(function (term) {
        if (normalize(item.slug) === term) total += 120;
        if (normalize(item.titleEn).indexOf(term) === 0 || normalize(item.titleZh).indexOf(term) === 0) total += 70;
        if (haystack.indexOf(term) !== -1) total += 20;
      });
      return terms.every(function (term) { return haystack.indexOf(term) !== -1; }) ? total : -1;
    }
    function render() {
      var query = normalize(input.value);
      var matched = tools.map(function (item) { return { item: item, score: score(item, query) }; })
        .filter(function (entry) { return entry.score >= 0; })
        .sort(function (a, b) { return b.score - a.score || String(a.item.titleEn || '').localeCompare(String(b.item.titleEn || '')); })
        .slice(0, MAX_RESULTS)
        .map(function (entry) { return entry.item; });
      activeIndex = Math.min(activeIndex, Math.max(matched.length - 1, 0));
      summary.textContent = query ? text('找到 ', 'Showing ') + matched.length + text(' 个匹配工具', ' matching tools') : text('常用与推荐工具', 'Popular and recommended tools');
      if (!matched.length) {
        results.innerHTML = '<div class="ymir-search-empty"><strong>' + text('没有匹配结果', 'No matching tool') + '</strong><span>' + text('尝试工具名称、分类或功能关键词。', 'Try a tool name, category, or task keyword.') + '</span></div>';
        return;
      }
      results.innerHTML = matched.map(function (item, index) {
        var title = isZh() ? (item.titleZh || item.titleEn) : (item.titleEn || item.titleZh);
        var desc = isZh() ? (item.descriptionZh || item.descriptionEn) : (item.descriptionEn || item.descriptionZh);
        var category = isZh() ? (item.categoryLabelZh || item.category) : (item.categoryLabelEn || item.category);
        return '<a href="' + item.href + '" role="option" class="ymir-search-result' + (index === activeIndex ? ' is-active' : '') + '" data-result-index="' + index + '">' +
          '<span class="ymir-search-result__icon" data-accent="' + (item.accent || 'blue') + '">' + (item.icon || '›') + '</span>' +
          '<span class="ymir-search-result__copy"><strong>' + escapeHtml(title) + '</strong><small>' + escapeHtml(desc) + '</small></span>' +
          '<span class="ymir-search-result__category">' + escapeHtml(category) + '</span>' + svg('arrow') + '</a>';
      }).join('');
      qsa('.ymir-search-result', results).forEach(function (node) {
        node.addEventListener('mousemove', function () { activeIndex = Number(node.getAttribute('data-result-index') || 0); updateActive(); });
      });
    }
    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (char) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]; });
    }
    function updateActive() {
      qsa('.ymir-search-result', results).forEach(function (node, index) { node.classList.toggle('is-active', index === activeIndex); });
    }
    function open() {
      lastFocus = document.activeElement;
      dialog.hidden = false;
      document.documentElement.classList.add('ymir-dialog-open');
      input.value = '';
      activeIndex = 0;
      ensureManifest().then(function (manifest) { tools = manifest.tools || []; render(); input.focus(); }).catch(function () {
        summary.textContent = text('工具目录暂时无法加载。', 'The tool directory could not be loaded.');
        input.focus();
      });
    }
    function close() {
      dialog.hidden = true;
      document.documentElement.classList.remove('ymir-dialog-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    qsa('[data-ymir-search-trigger]').forEach(function (button) { button.addEventListener('click', open); });
    qsa('[data-ymir-search-close]', dialog).forEach(function (node) { node.addEventListener('click', close); });
    input.addEventListener('input', function () { activeIndex = 0; render(); });
    input.addEventListener('keydown', function (event) {
      var items = qsa('.ymir-search-result', results);
      if (event.key === 'ArrowDown') { event.preventDefault(); activeIndex = Math.min(activeIndex + 1, items.length - 1); updateActive(); }
      if (event.key === 'ArrowUp') { event.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0); updateActive(); }
      if (event.key === 'Enter' && items[activeIndex]) { event.preventDefault(); items[activeIndex].click(); }
    });
    document.addEventListener('keydown', function (event) {
      var target = event.target;
      var typing = target && (/INPUT|TEXTAREA|SELECT/.test(target.tagName) || target.isContentEditable);
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); open(); }
      else if (!typing && event.key === '/') { event.preventDefault(); open(); }
      else if (event.key === 'Escape' && !dialog.hidden) close();
    });
  }

  function enhanceLead(manifest, item) {
    var main = qs('[data-ymir-tool]');
    var lead = qs('.ymir-static-tool-lead', main || document);
    var workspace = qs('.ymir-vue-tool-root', main || document);
    if (!main || !lead || !workspace) return;
    main.classList.add('ymir-tool-page-v63');
    main.classList.remove('ymir-tool-page-v51');
    main.setAttribute('data-ui-version', '63');
    if (item && item.category) {
      main.setAttribute('data-tool-category', item.category);
      document.body.setAttribute('data-tool-category', item.category);
    }
    workspace.id = 'ymir-tool-workspace';
    workspace.setAttribute('tabindex', '-1');

    var breadcrumb = qs('.ymir-breadcrumb', lead);
    if (breadcrumb) {
      var raw = breadcrumb.textContent.split('/').map(function (part) { return part.trim(); }).filter(Boolean);
      breadcrumb.innerHTML = raw.map(function (part, index) {
        var current = index === raw.length - 1;
        return '<span' + (current ? ' aria-current="page"' : '') + '>' + part + '</span>' + (current ? '' : svg('chevron'));
      }).join('');
    }

    var heading = qs('h1', lead);
    var intro = heading ? heading.nextElementSibling : null;
    var list = qs(':scope > ul', lead);
    var category = item ? (isZh() ? (item.categoryLabelZh || item.category) : (item.categoryLabelEn || item.category)) : text('在线工具', 'Online tool');

    if (!qs('.ymir-lead-kicker', lead)) {
      var kicker = document.createElement('div');
      kicker.className = 'ymir-lead-kicker';
      kicker.innerHTML = '<span class="ymir-category-pill">' + escapeText(category) + '</span><span>' + svg('check') + text('无需注册', 'No sign-up') + '</span><span>' + svg('check') + text('浏览器工作区', 'Browser workspace') + '</span>';
      if (heading) lead.insertBefore(kicker, heading);
    }

    if (!qs('.ymir-lead-layout', lead) && heading) {
      var layout = document.createElement('div');
      layout.className = 'ymir-lead-layout';
      var copy = document.createElement('div');
      copy.className = 'ymir-lead-copy';
      lead.insertBefore(layout, heading);
      layout.appendChild(copy);
      copy.appendChild(heading);
      if (intro && intro.tagName === 'P') copy.appendChild(intro);
      if (list) copy.appendChild(list);

      var aside = document.createElement('aside');
      aside.className = 'ymir-lead-aside';
      aside.setAttribute('aria-label', text('工具快捷操作', 'Tool quick actions'));
      aside.innerHTML = '<p>' + text('快捷操作', 'Quick actions') + '</p><div class="ymir-lead-actions"></div><small>' + text('按 Ctrl/⌘ + K 可在全部工具中搜索', 'Press Ctrl/⌘ + K to search all tools') + '</small>';
      layout.appendChild(aside);
    }

    var actions = qs('.ymir-lead-actions', lead);
    if (actions && !actions.children.length) {
      var favorite = document.createElement('button');
      favorite.type = 'button';
      favorite.className = 'ymir-lead-action';
      favorite.setAttribute('data-ymir-favorite', currentSlug());
      favorite.innerHTML = svg('star') + '<span>' + text('收藏', 'Favorite') + '</span>';
      var share = document.createElement('button');
      share.type = 'button';
      share.className = 'ymir-lead-action';
      share.innerHTML = svg('link') + '<span>' + text('复制链接', 'Copy link') + '</span>';
      var all = document.createElement('a');
      all.className = 'ymir-lead-action is-primary';
      all.href = '/tools.html';
      all.innerHTML = svg('grid') + '<span>' + text('全部工具', 'All tools') + '</span>';
      actions.appendChild(favorite);
      actions.appendChild(share);
      actions.appendChild(all);
      setupFavorite(favorite, currentSlug());
      share.addEventListener('click', function () {
        var value = location.href;
        var promise = navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(value) : Promise.reject();
        promise.then(function () { temporaryLabel(share, text('已复制', 'Copied')); }).catch(function () {
          var input = document.createElement('input'); input.value = value; document.body.appendChild(input); input.select();
          try { document.execCommand('copy'); temporaryLabel(share, text('已复制', 'Copied')); } catch (error) {}
          input.remove();
        });
      });
    }
  }

  function escapeText(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]; });
  }
  function temporaryLabel(button, label) {
    var span = qs('span', button);
    if (!span) return;
    var before = span.textContent;
    span.textContent = label;
    button.classList.add('is-success');
    setTimeout(function () { span.textContent = before; button.classList.remove('is-success'); }, 1600);
  }
  function setupFavorite(button, slug) {
    function update() {
      var favorites = storageGet(FAVORITES_KEY, []);
      var active = favorites.indexOf(slug) !== -1;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
      var label = qs('span', button);
      if (label) label.textContent = active ? text('已收藏', 'Saved') : text('收藏', 'Favorite');
    }
    button.addEventListener('click', function () {
      var favorites = storageGet(FAVORITES_KEY, []);
      var index = favorites.indexOf(slug);
      if (index === -1) favorites.unshift(slug); else favorites.splice(index, 1);
      storageSet(FAVORITES_KEY, favorites.slice(0, 40));
      update();
    });
    update();
  }
  function rememberRecent(slug) {
    if (!slug) return;
    var recents = storageGet(RECENTS_KEY, []).filter(function (value) { return value !== slug; });
    recents.unshift(slug);
    storageSet(RECENTS_KEY, recents.slice(0, 12));
  }

  function enhanceContent() {
    var main = qs('[data-ymir-tool]');
    if (!main) return;
    var sections = qsa(':scope > section', main).filter(function (section) {
      return !section.classList.contains('ymir-static-tool-lead') && !section.classList.contains('ymir-vue-tool-root') && !section.classList.contains('ymir-static-tool-fallback');
    });
    sections.forEach(function (section, index) {
      section.classList.add('ymir-content-card');
      section.style.setProperty('--ymir-card-index', String(index));
      var heading = qs('h2', section);
      if (heading && !qs('.ymir-section-label', section)) {
        var label = document.createElement('span');
        label.className = 'ymir-section-label';
        label.textContent = String(index + 1).padStart(2, '0');
        heading.insertBefore(label, heading.firstChild);
      }
    });
    var fallback = qs('.ymir-static-tool-fallback', main);
    if (fallback) fallback.classList.add('ymir-content-card', 'is-fallback');
  }

  function buildScrollTop() {
    if (qs('.ymir-scroll-top')) return;
    var button = createIconButton('ymir-scroll-top', text('返回顶部', 'Back to top'), 'up');
    document.body.appendChild(button);
    function update() { button.classList.toggle('is-visible', window.scrollY > 640); }
    button.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function markReady() {
    document.documentElement.setAttribute('data-ymir-ui', VERSION);
    document.body.classList.add('ymir-shell-ready');
  }

  function init() {
    addSkipLink();
    buildTopbar();
    buildSearchDialog();
    buildScrollTop();
    rememberRecent(currentSlug());
    ensureManifest().then(function (manifest) {
      enhanceLead(manifest, toolBySlug(manifest, currentSlug()));
      enhanceContent();
      markReady();
    }).catch(function () {
      enhanceLead(null, null);
      enhanceContent();
      markReady();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();

  window.YmirToolShell = { version: VERSION, openSearch: function () { var trigger = qs('[data-ymir-search-trigger]'); if (trigger) trigger.click(); } };
})();
