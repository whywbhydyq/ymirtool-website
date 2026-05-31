(function () {
  'use strict';
  var VERSION = '20260531-v51';
  if (window.YmirVueRenderHelpers && window.YmirVueRenderHelpers.version === VERSION) return;
  var Core = window.YmirVueCore;
  if (!Core) return;
  var getEl = Core.getEl, getLang = Core.getLang, setLang = Core.setLang, normalizeLang = Core.normalizeLang;
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
    var headerNodes = [
      h('div', { class: 'ymir-vue-title-block' }, [
        h('div', { class: 'ymir-vue-tool-icon', 'aria-hidden': 'true' }, options.icon || 'T'),
        h('div', { class: 'ymir-vue-title-copy' }, [
          h('p', { class: 'ymir-vue-workbench__eyebrow' }, eyebrow),
          h('h2', null, options.title || ''),
          h('p', null, options.subtitle || options.desc || ''),
          renderTagRow(h, El, options.tags || [], options.tagType || 'primary')
        ])
      ])
    ];
    if (options.showLanguageToggle === true) {
      headerNodes.push(renderLanguageToggle(h, El, options.lang || getLang(), onLangChange));
    }
    return h('header', { class: 'ymir-vue-workbench__header' }, headerNodes);
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

  function renderToolbar(h, options) {
    options = options || {};
    var nodes = [];
    if (Array.isArray(options.controls)) nodes = nodes.concat(options.controls.filter(Boolean));
    if (Array.isArray(options.actions) && options.actions.length) {
      nodes.push(h('div', { class: options.actionClass || 'ymir-vue-toolbar-actions' }, options.actions.filter(Boolean)));
    }
    return h('div', { class: ('ymir-vue-toolbar ' + (options.className || '')).trim() }, nodes);
  }
  function renderInputOutputPanels(h, El, options) {
    options = options || {};
    return h('div', { class: options.gridClass || 'ymir-vue-grid' }, [
      renderEditorCard(h, El, {
        title: options.inputTitle || 'Input',
        meta: options.inputMeta || '',
        value: options.inputValue || '',
        onInput: options.onInput || function () {},
        rows: options.inputRows || options.rows || 14,
        placeholder: options.inputPlaceholder || '',
        footer: options.inputFooter || null,
        className: options.inputClassName || ''
      }),
      renderEditorCard(h, El, {
        title: options.outputTitle || 'Output',
        meta: options.outputMeta || '',
        value: options.outputValue || '',
        onInput: options.onOutputInput || function () {},
        rows: options.outputRows || options.rows || 14,
        placeholder: options.outputPlaceholder || '',
        readonly: options.outputReadonly !== false,
        output: true,
        footer: options.outputFooter || null,
        className: options.outputClassName || ''
      })
    ]);
  }
  function defaultColumnWidth(index) {
    if (index === 0) return 150;
    if (index === 2 || index === 3) return 300;
    return 180;
  }
  function renderReferenceMobileCards(h, El, options) {
    options = options || {};
    var ElButton = getEl(El, 'ElButton');
    var ElEmpty = getEl(El, 'ElEmpty');
    var rows = options.rows || [];
    var columns = options.columns || [];
    if (!rows.length) return ElEmpty ? h(ElEmpty, { description: options.emptyText || 'No rows' }) : h('p', { class: 'ymir-vue-empty' }, options.emptyText || 'No rows');
    return h('div', { class: 'ymir-vue-ref-cards' }, rows.map(function (row, idx) {
      var values = row.values || row;
      return h('article', { class: 'ymir-vue-ref-card', key: 'card-' + (row.id || idx) }, [
        h('div', { class: 'ymir-vue-ref-card__head' }, [
          h('strong', null, values[0] || ''),
          ElButton ? h(ElButton, { size: 'small', plain: true, onClick: function () { if (options.onCopy) options.onCopy(row); } }, function () { return options.copyLabel || 'Copy'; }) : null
        ]),
        h('dl', null, values.slice(1).map(function (value, i) {
          return [h('dt', null, columns[i + 1] || ''), h('dd', null, value || '')];
        }))
      ]);
    }));
  }
  function renderReferenceTable(h, El, options) {
    options = options || {};
    var ElCard = getEl(El, 'ElCard');
    var ElTable = getEl(El, 'ElTable');
    var ElTableColumn = getEl(El, 'ElTableColumn');
    var ElButton = getEl(El, 'ElButton');
    var rows = options.rows || [];
    var columns = options.columns || [];
    var codeColumn = typeof options.codeColumn === 'function' ? options.codeColumn : function (col, index) { return index === 0; };
    return h(ElCard, { class: ('ymir-vue-panel ymir-vue-ref-table-panel ' + (options.className || '')).trim(), shadow: 'never' }, {
      header: function () { return renderPanelHeader(h, options.title || 'Reference table', options.meta || ''); },
      default: function () {
        return [
          h('div', { class: 'ymir-vue-ref-table-wrap' }, [
            h(ElTable, { data: rows, border: options.border !== false, stripe: options.stripe !== false, emptyText: options.emptyText || 'No rows', class: options.tableClass || 'ymir-vue-ref-table' }, function () {
              return columns.map(function (col, i) {
                var minWidth = typeof options.columnWidth === 'function' ? options.columnWidth(col, i) : defaultColumnWidth(i);
                return h(ElTableColumn, { label: col, minWidth: minWidth }, {
                  default: function (scope) {
                    var values = scope.row.values || scope.row;
                    var val = values[i] || '';
                    return codeColumn(col, i) ? h('code', { class: 'ymir-vue-ref-primary' }, val) : h('span', null, val);
                  }
                });
              }).concat([h(ElTableColumn, { label: options.copyLabel || 'Copy', width: 92, fixed: 'right' }, {
                default: function (scope) {
                  return h(ElButton, { size: 'small', plain: true, onClick: function () { if (options.onCopy) options.onCopy(scope.row); } }, function () { return options.copyLabel || 'Copy'; });
                }
              })]);
            })
          ]),
          renderReferenceMobileCards(h, El, options)
        ];
      }
    });
  }

  function renderOptionPanel(h, El, options) {
    options = options || {};
    var ElCard = getEl(El, 'ElCard');
    return h(ElCard, { class: ('ymir-vue-panel ' + (options.className || '')).trim(), shadow: options.shadow || 'never' }, {
      header: function () { return renderPanelHeader(h, options.title || 'Options', options.meta || ''); },
      default: function () {
        if (typeof options.default === 'function') return options.default();
        if (Array.isArray(options.children)) return options.children;
        return options.children || null;
      }
    });
  }
  function renderResultCards(h, El, options) {
    options = options || {};
    var ElCard = getEl(El, 'ElCard');
    var items = Array.isArray(options.items) ? options.items.filter(Boolean) : [];
    return h(ElCard, { class: ('ymir-vue-panel ymir-vue-result-card-panel ' + (options.className || '')).trim(), shadow: options.shadow || 'never' }, {
      header: function () { return renderPanelHeader(h, options.title || 'Results', options.meta || ''); },
      default: function () {
        return h('div', { class: options.gridClass || 'ymir-vue-result-grid' }, items.length ? items : [h('p', { class: 'ymir-vue-empty-result' }, options.emptyText || 'No result yet.')]);
      }
    });
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
  function pushNode(nodes, node) {
    if (Array.isArray(node)) node.forEach(function (child) { pushNode(nodes, child); });
    else if (node) nodes.push(node);
  }
  function flattenNodes(children) {
    var nodes = [];
    pushNode(nodes, children);
    return nodes;
  }
  function renderShell(h, El, options, children) {
    options = options || {};
    var nodes = flattenNodes(children);
    if (options.statusTitle || options.statusType || options.statusDescription) {
      nodes.push(renderStatus(h, El, { type: options.statusType, title: options.statusTitle, description: options.statusDescription }));
    }
    if (options.footerTags && options.footerTags.length) nodes.push(renderFooterTags(h, El, options.footerTags));
    return h('div', { class: ('ymir-vue-app ymir-tool-shell-v51 ' + (options.appClass || '')).trim() }, [
      h('section', { class: ('ymir-vue-workbench ' + (options.workbenchClass || '')).trim(), 'aria-label': options.title ? options.title + ' workbench' : 'Tool workbench' }, [renderToolHeader(h, El, options)].concat(nodes))
    ]);
  }

  var components = {
    YmirToolFrame: {
      props: ['tool', 'lang', 'statusType', 'statusTitle'],
      emits: ['update-lang'],
      render: function () {
        var h = (window.Vue && window.Vue.h) || function () {};
        var ElCard = getEl(window.ElementPlus, 'ElCard');
        var ElRadioGroup = getEl(window.ElementPlus, 'ElRadioGroup');
        var ElRadioButton = getEl(window.ElementPlus, 'ElRadioButton');
        var ElAlert = getEl(window.ElementPlus, 'ElAlert');
        var ElTag = getEl(window.ElementPlus, 'ElTag');
        var tool = this.tool || {};
        var slots = this.$slots || {};
        var self = this;
        return h('div', { class: 'ymir-vue-app' }, [
          h(ElCard, { class: 'ymir-vue-workbench', shadow: 'never' }, {
            default: function () { return [
              h('div', { class: 'ymir-vue-workbench__header' }, [
                h('div', { class: 'ymir-vue-title-block' }, [
                  h('div', { class: 'ymir-vue-tool-icon' }, tool.icon || 'T'),
                  h('div', null, [
                    h('p', { class: 'ymir-vue-workbench__eyebrow' }, tool.category || ''),
                    h('h2', null, tool.title || ''),
                    h('p', null, tool.desc || tool.subtitle || ''),
                    h('div', { class: 'ymir-vue-tag-row' }, (tool.tags || []).map(function (tag) {
                      return h(ElTag, { effect: 'plain' }, function () { return typeof tag === 'string' ? tag : tag.label; });
                    }))
                  ])
                ]),
                h(ElRadioGroup, { class: 'ymir-vue-lang', modelValue: self.lang, size: 'small', 'onUpdate:modelValue': function (value) { self.$emit('update-lang', value); }, onChange: function (value) { self.$emit('update-lang', value); } }, function () { return [
                  h(ElRadioButton, { label: 'en' }, function () { return 'EN'; }),
                  h(ElRadioButton, { label: 'zh' }, function () { return '中文'; })
                ]; })
              ]),
              slots.body ? slots.body() : null,
              h('div', { class: 'ymir-vue-actions' }, slots.actions ? slots.actions() : []),
              h('div', { class: 'ymir-vue-status' }, [h(ElAlert, { title: self.statusTitle || 'Ready.', type: self.statusType || 'info', closable: false, showIcon: true })]),
              h('div', { class: 'ymir-vue-footer-meta' }, slots.footer ? slots.footer() : [])
            ]; }
          })
        ]);
      }
    },
    YmirEditorPanel: {
      props: { title: String, meta: String, modelValue: String, readonly: Boolean, rows: { type: Number, default: 16 } },
      emits: ['update:modelValue'],
      render: function () {
        var h = (window.Vue && window.Vue.h) || function () {};
        var ElCard = getEl(window.ElementPlus, 'ElCard');
        var ElInput = getEl(window.ElementPlus, 'ElInput');
        var self = this;
        return h(ElCard, { class: 'ymir-vue-panel' + (self.readonly ? ' ymir-vue-output' : ''), shadow: 'never' }, {
          header: function () { return renderPanelHeader(h, self.title, self.meta); },
          default: function () { return h(ElInput, {
            type: 'textarea', modelValue: self.modelValue || '', rows: self.rows || 16, resize: 'vertical', spellcheck: 'false', readonly: !!self.readonly,
            'onUpdate:modelValue': function (value) { self.$emit('update:modelValue', value); },
            onInput: function (value) { self.$emit('update:modelValue', value); }
          }); }
        });
      }
    },
    YmirActionButtons: {
      props: ['actions'],
      emits: ['run'],
      render: function () {
        var h = (window.Vue && window.Vue.h) || function () {};
        var ElButton = getEl(window.ElementPlus, 'ElButton');
        var self = this;
        return h('span', { class: 'ymir-vue-action-button-list' }, (self.actions || []).map(function (item) {
          return h(ElButton, { type: item.type || 'default', onClick: function () { self.$emit('run', item.key); } }, function () { return item.label; });
        }));
      }
    },
    YmirMetricTags: {
      props: ['input', 'output'],
      render: function () {
        var h = (window.Vue && window.Vue.h) || function () {};
        var ElTag = getEl(window.ElementPlus, 'ElTag');
        var input = this.input || '';
        var output = this.output || '';
        return h('div', { class: 'ymir-vue-footer-meta' }, [
          h(ElTag, null, function () { return 'Input ' + input.length + ' chars'; }),
          h(ElTag, null, function () { return 'Output ' + output.length + ' chars'; })
        ]);
      }
    }
  };

  window.YmirVueRenderHelpers = {
    version: VERSION,
    renderLanguageToggle: renderLanguageToggle, renderTagRow: renderTagRow, renderToolHeader: renderToolHeader, renderPanelHeader: renderPanelHeader,
    renderEditorCard: renderEditorCard, renderActionBar: renderActionBar, renderToolbar: renderToolbar, renderInputOutputPanels: renderInputOutputPanels,
    renderReferenceMobileCards: renderReferenceMobileCards, renderReferenceTable: renderReferenceTable, renderOptionPanel: renderOptionPanel, renderResultCards: renderResultCards,
    renderStatus: renderStatus, renderFooterTags: renderFooterTags, flattenNodes: flattenNodes, renderShell: renderShell, components: components
  };
})();
