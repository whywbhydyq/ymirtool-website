(function () {
  'use strict';
  if (window.YmirVueShared && window.YmirVueShared.version === '20260530-v34') return;

  var VERSION = '20260530-v34';

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
    if (root) root.innerHTML = '<div class="ymir-vue-noscript">' + escapeHtml(message || 'Vue tool failed to load.') + '</div>';
  }
  function ensureRuntime(root) {
    if (!window.Vue || !window.ElementPlus) {
      setRootError(root, 'Vue or Element Plus assets failed to load. This tool cannot start.');
      return false;
    }
    return true;
  }


  function getEl(El, key) {
    return (El && El[key]) || (window.ElementPlus && window.ElementPlus[key]);
  }
  function renderLanguageToggle(h, El, lang, onChange) {
    var ElRadioGroup = getEl(El, 'ElRadioGroup');
    var ElRadioButton = getEl(El, 'ElRadioButton');
    return h('div', { class: 'ymir-vue-lang' }, [
      h(ElRadioGroup, { modelValue: lang, size: 'small', 'onUpdate:modelValue': onChange }, function () {
        return [
          h(ElRadioButton, { label: 'zh' }, function () { return '中文'; }),
          h(ElRadioButton, { label: 'en' }, function () { return 'EN'; })
        ];
      })
    ]);
  }
  function normalizeTag(tag) {
    return typeof tag === 'string' ? { label: tag } : (tag || { label: '' });
  }
  function renderTagRow(h, El, tags, fallbackType) {
    var ElTag = getEl(El, 'ElTag');
    tags = Array.isArray(tags) ? tags : [];
    return h('div', { class: 'ymir-vue-tag-row' }, tags.map(function (raw) {
      var tag = normalizeTag(raw);
      return h(ElTag, { type: tag.type || fallbackType || 'primary', effect: tag.effect || 'light' }, function () { return tag.label; });
    }));
  }
  function renderToolHeader(h, El, options) {
    options = options || {};
    var onLangChange = typeof options.onLangChange === 'function' ? options.onLangChange : function () {};
    var eyebrow = [options.eyebrow, options.category].filter(Boolean).join(options.eyebrow && options.category ? ' · ' : '');
    return h('header', { class: 'ymir-vue-workbench__header' }, [
      h('div', { class: 'ymir-vue-title-block' }, [
        h('div', { class: 'ymir-vue-tool-icon', 'aria-hidden': 'true' }, options.icon || 'T'),
        h('div', null, [
          h('p', { class: 'ymir-vue-workbench__eyebrow' }, eyebrow),
          h('h2', null, options.title || ''),
          h('p', null, options.subtitle || options.desc || ''),
          renderTagRow(h, El, options.tags || [], options.tagType || 'primary')
        ])
      ]),
      renderLanguageToggle(h, El, options.lang || getLang(), onLangChange)
    ]);
  }
  function renderPanelHeader(h, title, meta) {
    return h('div', { class: 'ymir-vue-panel__top' }, [
      h('span', { class: 'ymir-vue-panel__title' }, [h('span', { class: 'ymir-vue-panel__dot' }), title || 'Panel']),
      meta ? h('span', { class: 'ymir-vue-panel__meta' }, meta) : null
    ]);
  }
  function renderEditorCard(h, El, options) {
    options = options || {};
    var ElCard = getEl(El, 'ElCard');
    var ElInput = getEl(El, 'ElInput');
    return h(ElCard, { class: 'ymir-vue-panel' + (options.output ? ' ymir-vue-output' : '') + (options.className ? ' ' + options.className : ''), shadow: 'never' }, {
      header: function () { return renderPanelHeader(h, options.title, options.meta); },
      default: function () {
        var input = h(ElInput, {
          modelValue: options.value || '',
          'onUpdate:modelValue': options.onInput || function () {},
          type: 'textarea',
          rows: options.rows || 14,
          resize: 'vertical',
          readonly: !!options.readonly,
          spellcheck: 'false',
          placeholder: options.placeholder || ''
        });
        return options.footer ? [input, options.footer] : input;
      }
    });
  }
  function renderActionBar(h, El, actions) {
    return h('div', { class: 'ymir-vue-actions' }, Array.isArray(actions) ? actions : []);
  }
  function renderStatus(h, El, options) {
    options = options || {};
    var ElAlert = getEl(El, 'ElAlert');
    if (!ElAlert) return null;
    return h('div', { class: 'ymir-vue-status' }, [h(ElAlert, { type: options.type || 'info', title: options.title || 'Ready.', description: options.description || '', showIcon: true, closable: false })]);
  }
  function renderFooterTags(h, El, tags) {
    var ElTag = getEl(El, 'ElTag');
    tags = Array.isArray(tags) ? tags : [];
    return h('div', { class: 'ymir-vue-footer-meta' }, tags.map(function (raw) {
      var tag = normalizeTag(raw);
      return h(ElTag, { type: tag.type || 'info', effect: tag.effect || 'light' }, function () { return tag.label; });
    }));
  }
  function renderShell(h, El, options, children) {
    options = options || {};
    var nodes = Array.isArray(children) ? children.filter(Boolean) : [children].filter(Boolean);
    if (options.statusTitle || options.statusType || options.statusDescription) {
      nodes.push(renderStatus(h, El, { type: options.statusType, title: options.statusTitle, description: options.statusDescription }));
    }
    if (options.footerTags && options.footerTags.length) nodes.push(renderFooterTags(h, El, options.footerTags));
    return h('div', { class: ('ymir-vue-app ' + (options.appClass || '')).trim() }, [
      h('section', { class: ('ymir-vue-workbench ' + (options.workbenchClass || '')).trim() }, [renderToolHeader(h, El, options)].concat(nodes))
    ]);
  }

  var components = {
    YmirToolFrame: {
      props: ['tool', 'lang', 'statusType', 'statusTitle'],
      emits: ['update-lang'],
      template: '<div class="ymir-vue-app">\
        <el-card class="ymir-vue-workbench" shadow="never">\
          <div class="ymir-vue-workbench__header">\
            <div class="ymir-vue-title-block">\
              <div class="ymir-vue-tool-icon">{{ tool.icon }}</div>\
              <div>\
                <p class="ymir-vue-workbench__eyebrow">{{ tool.category }}</p>\
                <h2>{{ tool.title }}</h2>\
                <p>{{ tool.desc }}</p>\
                <div class="ymir-vue-tag-row"><el-tag v-for="tag in tool.tags" :key="tag" effect="plain">{{ tag }}</el-tag></div>\
              </div>\
            </div>\
            <el-radio-group class="ymir-vue-lang" :model-value="lang" size="small" @change="$emit(\'update-lang\', $event)">\
              <el-radio-button label="en">EN</el-radio-button><el-radio-button label="zh">中文</el-radio-button>\
            </el-radio-group>\
          </div>\
          <slot name="body"></slot>\
          <div class="ymir-vue-actions"><slot name="actions"></slot></div>\
          <div class="ymir-vue-status"><el-alert :title="statusTitle" :type="statusType" :closable="false" show-icon /></div>\
          <div class="ymir-vue-footer-meta"><slot name="footer"></slot></div>\
        </el-card>\
      </div>'
    },
    YmirEditorPanel: {
      props: { title: String, meta: String, modelValue: String, readonly: Boolean, rows: { type: Number, default: 16 } },
      emits: ['update:modelValue'],
      template: '<el-card class="ymir-vue-panel" :class="{\'ymir-vue-output\': readonly}" shadow="never">\
        <template #header><div class="ymir-vue-panel__top"><span class="ymir-vue-panel__title"><span class="ymir-vue-panel__dot"></span>{{ title }}</span><span class="ymir-vue-panel__meta">{{ meta }}</span></div></template>\
        <el-input type="textarea" :model-value="modelValue" @input="$emit(\'update:modelValue\', $event)" :readonly="readonly" :rows="rows" resize="vertical" spellcheck="false" />\
      </el-card>'
    },
    YmirActionButtons: {
      props: ['actions'],
      emits: ['run'],
      template: '<template v-for="item in actions" :key="item.key">\
        <el-button :type="item.type || \'default\'" @click="$emit(\'run\', item.key)">{{ item.label }}</el-button>\
      </template>'
    },
    YmirMetricTags: {
      props: ['input', 'output'],
      template: '<div class="ymir-vue-footer-meta"><el-tag>Input {{ (input || \'\').length }} chars</el-tag><el-tag>Output {{ (output || \'\').length }} chars</el-tag></div>'
    }
  };

  function mount(root, options) {
    if (!ensureRuntime(root)) return null;
    var app = window.Vue.createApp(options);
    Object.keys(components).forEach(function (name) { app.component(name, components[name]); });
    app.config.globalProperties.$ymir = window.YmirVueShared;
    app.use(window.ElementPlus);
    return app.mount(root);
  }

  window.YmirVueShared = {
    version: VERSION,
    toText: toText,
    normalizeLang: normalizeLang,
    getLang: getLang,
    setLang: setLang,
    setGlobalLang: setLang,
    bytes: bytes,
    lineCount: lineCount,
    statText: statText,
    normalizeSearch: normalizeSearch,
    rowText: rowText,
    escapeHtml: escapeHtml,
    notify: notify,
    copyText: copyText,
    setRootError: setRootError,
    ensureRuntime: ensureRuntime,
    getEl: getEl,
    renderLanguageToggle: renderLanguageToggle,
    renderTagRow: renderTagRow,
    renderToolHeader: renderToolHeader,
    renderPanelHeader: renderPanelHeader,
    renderEditorCard: renderEditorCard,
    renderActionBar: renderActionBar,
    renderStatus: renderStatus,
    renderFooterTags: renderFooterTags,
    renderShell: renderShell,
    components: components,
    mount: mount
  };
})();
