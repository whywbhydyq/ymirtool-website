(function () {
  'use strict';
  var VERSION = '20260531-v55';
  if (window.YmirVueAppFactory && window.YmirVueAppFactory.version === VERSION) return;
  var Core = window.YmirVueCore;
  var Render = window.YmirVueRenderHelpers;
  var Actions = window.YmirVueActions;
  if (!Core || !Render || !Actions) return;
  var normalizeLang = Core.normalizeLang, getLang = Core.getLang, setLang = Core.setLang;
  var renderShell = Render.renderShell, components = Render.components;
  var setToolStatus = Actions.setToolStatus, createTextToolMethods = Actions.createTextToolMethods, resolveToolMessage = Actions.resolveToolMessage;
  function localizeConfigValue(value, lang, fallback) {
    lang = normalizeLang(lang || getLang());
    if (Array.isArray(value)) return value[lang === 'zh' ? 1 : 0] != null ? value[lang === 'zh' ? 1 : 0] : (value[0] != null ? value[0] : fallback);
    if (value && typeof value === 'object' && !Array.isArray(value)) return value[lang] != null ? value[lang] : (value.en != null ? value.en : (value.zh != null ? value.zh : fallback));
    return value != null ? value : fallback;
  }
  function resolveActiveToolConfig(schema, slug) {
    schema = schema || {};
    var tools = schema.tools || {};
    var fallbackSlug = schema.defaultSlug || Object.keys(tools)[0] || '';
    slug = slug || fallbackSlug;
    return { slug: slug, config: tools[slug] || tools[fallbackSlug] || {}, fallbackSlug: fallbackSlug };
  }
  function createConfiguredToolState(schema, root) {
    schema = schema || {};
    root = root || schema.root;
    var attr = schema.rootAttribute || 'data-tool';
    var slug = schema.slug || (root && root.getAttribute ? root.getAttribute(attr) : '') || schema.defaultSlug || '';
    var resolved = resolveActiveToolConfig(schema, slug);
    var state = { slug: resolved.slug, tool: resolved.slug };
    state[schema.configKey || 'cfg'] = resolved.config;
    if (schema.includeLang !== false) state.lang = normalizeLang(typeof schema.initialLang === 'function' ? schema.initialLang() : (schema.initialLang || getLang()));
    if (schema.status !== false) {
      state[schema.statusTypeKey || 'statusType'] = (schema.status && schema.status.type) || 'info';
      state[schema.statusTitleKey || schema.statusTextKey || 'statusText'] = resolveToolMessage(schema.status && (schema.status.message || schema.status.title), state, 'Ready.');
    }
    if (schema.textState !== false) {
      state.input = resolved.config.sample || '';
      state.second = resolved.config.secondarySample || '';
      state.output = '';
    }
    if (schema.labels) state.labels = schema.labels;
    var legacyState = null;
    if (typeof schema.data === 'function') legacyState = schema.data();
    else if (schema.data && typeof schema.data === 'object') legacyState = schema.data;
    if (legacyState && typeof legacyState === 'object') Object.assign(state, legacyState);
    if (typeof schema.initialState === 'function') Object.assign(state, schema.initialState(resolved.config, resolved.slug, schema) || {});
    else if (schema.initialState && typeof schema.initialState === 'object') Object.assign(state, schema.initialState);
    return state;
  }
  function createConfiguredComputed(schema) {
    schema = schema || {};
    var configKey = schema.configKey || 'cfg';
    var computed = {
      activeConfig: function () { return this[configKey] || {}; },
      activeLabels: function () { return localizeConfigValue(schema.localizedLabels || schema.messages || {}, this.lang, {}) || {}; },
      localizedTitle: function () { return localizeConfigValue((this[configKey] || {}).title, this.lang, (this[configKey] || {}).title || 'Tool'); },
      localizedSubtitle: function () { return localizeConfigValue((this[configKey] || {}).subtitle || (this[configKey] || {}).desc, this.lang, (this[configKey] || {}).desc || ''); },
      localizedCategory: function () { return localizeConfigValue((this[configKey] || {}).category, this.lang, (this[configKey] || {}).category || 'Tool'); }
    };
    if (schema.computed) Object.assign(computed, schema.computed);
    return computed;
  }
  function createConfiguredMethods(schema) {
    schema = schema || {};
    var methods = {
      noop: function () {},
      setLang: function (lang) { this.lang = setLang(lang); },
      setStatus: function (type, message) { setToolStatus(this, type, message, schema.status || { titleKey: schema.statusTitleKey || schema.statusTextKey || 'statusText' }); }
    };
    if (schema.textMethods) Object.assign(methods, createTextToolMethods(schema.textMethods));
    if (schema.methods) Object.assign(methods, schema.methods);
    return methods;
  }
  function createConfiguredToolApp(schema) {
    schema = schema || {};
    var VueRef = schema.Vue || window.Vue;
    var El = schema.ElementPlus || window.ElementPlus;
    if (!VueRef || !El) return { render: function () { return null; } };
    var hRef = VueRef.h;
    var appOptions = {
      name: schema.name || 'YmirConfiguredToolApp',
      data: function () { return createConfiguredToolState(schema, schema.root); },
      computed: createConfiguredComputed(schema),
      watch: schema.watch || {},
      mounted: function () {
        if (schema.setDocumentLang !== false && this.lang) setLang(this.lang);
        if (typeof schema.mounted === 'function') schema.mounted.call(this, hRef, El, schema);
      },
      beforeUnmount: schema.beforeUnmount,
      unmounted: schema.unmounted,
      methods: createConfiguredMethods(schema)
    };
    if (schema.template) {
      appOptions.template = schema.template;
    } else {
      appOptions.render = function () {
        if (typeof schema.render === 'function') return schema.render.call(this, hRef, El, schema);
        var body = typeof schema.renderBody === 'function' ? schema.renderBody.call(this, hRef, El, schema) : null;
        var actions = typeof schema.renderActions === 'function' ? schema.renderActions.call(this, hRef, El, schema) : null;
        var shellOptions = typeof schema.shell === 'function' ? schema.shell.call(this, hRef, El, schema) : (schema.shell || {});
        var cfg = this[schema.configKey || 'cfg'] || {};
        shellOptions = Object.assign({
          appClass: schema.appClass || '',
          icon: cfg.icon,
          eyebrow: schema.eyebrow || shellOptions.eyebrow || '',
          category: this.localizedCategory,
          title: this.localizedTitle,
          subtitle: this.localizedSubtitle,
          tags: cfg.tags || schema.tags || [],
          lang: this.lang,
          onLangChange: this.setLang,
          statusType: this[schema.statusTypeKey || 'statusType'],
          statusTitle: this[schema.statusTitleKey || schema.statusTextKey || 'statusText']
        }, shellOptions || {});
        return renderShell(hRef, El, shellOptions, [body, actions]);
      };
    }
    return appOptions;
  }
  function mountConfiguredToolApp(schema) {
    schema = schema || {};
    var root = schema.root;
    if (!Core.ensureRuntime(root)) return null;
    var app = (schema.Vue || window.Vue).createApp(createConfiguredToolApp(schema));
    Object.keys(components).forEach(function (name) { app.component(name, components[name]); });
    app.config.globalProperties.$ymir = window.YmirVueShared;
    app.use(schema.ElementPlus || window.ElementPlus);
    return app.mount(root);
  }


  function mount(root, options) {
    if (!Core.ensureRuntime(root)) return null;
    var app = window.Vue.createApp(options);
    Object.keys(Render.components || {}).forEach(function (name) { app.component(name, Render.components[name]); });
    app.config.globalProperties.$ymir = window.YmirVueShared || {};
    app.use(window.ElementPlus);
    return app.mount(root);
  }

  window.YmirVueAppFactory = {
    version: VERSION,
    localizeConfigValue: localizeConfigValue, resolveActiveToolConfig: resolveActiveToolConfig, createConfiguredToolState: createConfiguredToolState,
    createConfiguredComputed: createConfiguredComputed, createConfiguredMethods: createConfiguredMethods, createConfiguredToolApp: createConfiguredToolApp,
    mountConfiguredToolApp: mountConfiguredToolApp, mount: mount
  };
})();
