(function () {
  'use strict';

  var root = document.getElementById('ymir-vue-tool-app');
  if (!root) return;

  if (!window.Vue || !window.ElementPlus) {
    root.innerHTML = '<div class="ymir-vue-noscript">Tool assets failed to load. This tool cannot start.</div>';
    return;
  }

  var Vue = window.Vue;
  var h = Vue.h;
  var ElementPlus = window.ElementPlus;
  var ElButton = ElementPlus.ElButton;
  var ElCard = ElementPlus.ElCard;
  var ElInput = ElementPlus.ElInput;
  var ElAlert = ElementPlus.ElAlert;
  var ElTag = ElementPlus.ElTag;
  var ElRadioGroup = ElementPlus.ElRadioGroup;
  var ElRadioButton = ElementPlus.ElRadioButton;
  var ElMessage = ElementPlus.ElMessage;
  var Shared = window.YmirVueShared || {};
  var normalizeLang = Shared.normalizeLang || function (value) { value = String(value || '').toLowerCase(); return value.indexOf('zh') === 0 || value.indexOf('cn') === 0 ? 'zh' : 'en'; };
  var initialLang = Shared.getLang || function () { try { return normalizeLang(localStorage.getItem('ymir_lang') || navigator.language || 'en'); } catch (e) { return 'en'; } };
  var byteLength = Shared.bytes || function (text) { if (window.TextEncoder) return new TextEncoder().encode(String(text || '')).length; return unescape(encodeURIComponent(String(text || ''))).length; };
  var countLines = Shared.lineCount || function (text) { text = String(text || ''); return text ? text.split(/\r\n|\r|\n/).length : 0; };
  var statText = Shared.statText || function (text, labelChars, labelLines) { return String(text || '').length + ' ' + labelChars + ' · ' + countLines(text) + ' ' + labelLines; };

  var Engines = window.YmirCoreToolEngines || {};
  var utf8Base64Encode = Engines.utf8Base64Encode;
  var utf8Base64Decode = Engines.utf8Base64Decode;
  var ymirMd5 = Engines.ymirMd5;
  var evaluateBasicExpression = Engines.evaluateBasicExpression;
  var secureUuid = Engines.secureUuid;
  var basicJsFormat = Engines.basicJsFormat;
  var basicJsMinify = Engines.basicJsMinify;

  var CoreTools = window.YmirCoreToolsSchema || { tools: {}, labels: {}, defaultSlug: 'json' };
  var Render = window.YmirVueRenderHelpers || {};
  var Actions = window.YmirVueActions || {};
  var renderInputOutputPanels = Render.renderInputOutputPanels;
  var renderEditorCard = Render.renderEditorCard;
  var renderOptionPanel = Render.renderOptionPanel;
  var renderActionButtons = Actions.renderActionButtons;

  function t(vm, key) { return (vm.labels && vm.labels[key]) || key; }
  function localize(value, lang, fallback) {
    if (Shared.localizeConfigValue) return Shared.localizeConfigValue(value, lang, fallback);
    if (value && typeof value === 'object' && !Array.isArray(value)) return value[lang] || value.en || value.zh || fallback;
    return value != null ? value : fallback;
  }
  function stat(vm, value) { return statText(value, t(vm, 'chars'), t(vm, 'lines')); }
  function runToolAction(vm, key) {
    if (typeof vm[key] === 'function') vm[key]();
    else vm.setStatus('error', vm.lang === 'zh' ? '未知操作。' : 'Unknown action.');
  }
  function renderField(vm, label, value, onUpdate, placeholder) {
    return h('label', { class: 'ymir-vue-field' }, [h('span', null, label), h(ElInput, { modelValue: value, 'onUpdate:modelValue': onUpdate, placeholder: placeholder || '' })]);
  }
  function renderResultNodes(vm) {
    if (!vm.resultCards.length) return h('div', { class: 'ymir-vue-empty-result' }, vm.lang === 'zh' ? '运行工具后这里显示结果。' : 'Run the tool to see results here.');
    return h('div', { class: 'ymir-vue-result-grid' }, vm.resultCards.map(function (card) {
      return h('div', { class: 'ymir-vue-result-card' }, [
        h('div', { class: 'ymir-vue-result-card__label' }, card.label),
        h('code', null, card.value),
        h(ElButton, { size: 'small', onClick: function () { vm.copyText(card.value); } }, function () { return t(vm, 'copy'); })
      ]);
    }));
  }
  function renderMetricNodes(vm) {
    return h('div', { class: 'ymir-vue-metrics' }, vm.metrics.map(function (item) {
      return h('div', { class: 'ymir-vue-metric' }, [h('strong', null, String(item.value)), h('span', null, item.label)]);
    }));
  }
  function renderGeneratorOptions(vm) {
    if (vm.cfg.generator === 'guid') return h('div', { class: 'ymir-vue-options' }, [renderField(vm, t(vm, 'countLabel'), String(vm.guidCount), function (v) { vm.guidCount = v; }, '1-100')]);
    if (vm.cfg.generator === 'password') {
      var items = [['upper', t(vm, 'uppercase')], ['lower', t(vm, 'lowercase')], ['numbers', t(vm, 'numbers')], ['symbols', t(vm, 'symbols')]];
      return h('div', { class: 'ymir-vue-options' }, [
        renderField(vm, t(vm, 'length'), String(vm.passwordLength), function (v) { vm.passwordLength = v; }, '8-128'),
        h('div', { class: 'ymir-vue-checks' }, items.map(function (item) {
          return h('label', null, [h('input', { type: 'checkbox', checked: vm.passwordSets[item[0]], onChange: function (event) { vm.passwordSets[item[0]] = event.target.checked; } }), h('span', null, item[1])]);
        }))
      ]);
    }
    return null;
  }

  var BODY_RENDERERS = {
    text: function (vm) {
      return renderInputOutputPanels(h, ElementPlus, {
        gridClass: 'ymir-vue-body', inputTitle: t(vm, 'input'), inputMeta: stat(vm, vm.input), inputValue: vm.input,
        onInput: function (v) { vm.input = v; }, inputRows: 12, inputPlaceholder: t(vm, 'input'),
        outputTitle: t(vm, 'output'), outputMeta: stat(vm, vm.output), outputValue: vm.output,
        outputRows: 12, outputPlaceholder: t(vm, 'output'), outputReadonly: true, outputClassName: 'ymir-vue-output'
      });
    },
    diff: function (vm) {
      return h('div', { class: 'ymir-vue-body ymir-vue-body--diff' }, [
        renderEditorCard(h, ElementPlus, { title: t(vm, 'original'), meta: stat(vm, vm.input), value: vm.input, onInput: function (v) { vm.input = v; }, rows: 10, placeholder: t(vm, 'original') }),
        renderEditorCard(h, ElementPlus, { title: t(vm, 'changed'), meta: stat(vm, vm.input2), value: vm.input2, onInput: function (v) { vm.input2 = v; }, rows: 10, placeholder: t(vm, 'changed') }),
        renderEditorCard(h, ElementPlus, { title: t(vm, 'output'), meta: stat(vm, vm.output), value: vm.output, readonly: true, output: true, className: 'ymir-vue-span-2', rows: 10, placeholder: t(vm, 'output') })
      ]);
    },
    regex: function (vm) {
      return h('div', { class: 'ymir-vue-body ymir-vue-body--regex' }, [
        renderOptionPanel(h, ElementPlus, { title: t(vm, 'pattern'), meta: t(vm, 'flags'), children: [
          h(ElInput, { modelValue: vm.pattern, 'onUpdate:modelValue': function (v) { vm.pattern = v; }, placeholder: '^[\\w.-]+@[\\w.-]+\\.[A-Za-z]{2,}$' }),
          h('div', { class: 'ymir-vue-checks' }, ['g', 'i', 'm'].map(function (flag) { return h('label', null, [h('input', { type: 'checkbox', checked: vm.flags[flag], onChange: function (event) { vm.flags[flag] = event.target.checked; } }), h('span', null, flag)]); }))
        ] }),
        renderEditorCard(h, ElementPlus, { title: t(vm, 'text'), meta: stat(vm, vm.regexText), value: vm.regexText, onInput: function (v) { vm.regexText = v; }, rows: 10, placeholder: t(vm, 'text') }),
        renderEditorCard(h, ElementPlus, { title: t(vm, 'output'), meta: stat(vm, vm.output), value: vm.output, readonly: true, output: true, className: 'ymir-vue-span-2', rows: 8, placeholder: t(vm, 'output') })
      ]);
    },
    metrics: function (vm) {
      return h('div', { class: 'ymir-vue-body ymir-vue-body--metrics' }, [
        renderEditorCard(h, ElementPlus, { title: t(vm, 'input'), meta: stat(vm, vm.input), value: vm.input, onInput: function (v) { vm.input = v; vm.countText(); }, rows: 13, placeholder: t(vm, 'input') }),
        renderOptionPanel(h, ElementPlus, { title: t(vm, 'result'), children: renderMetricNodes(vm) })
      ]);
    },
    generator: function (vm) {
      return h('div', { class: 'ymir-vue-body ymir-vue-body--generator' }, [
        renderOptionPanel(h, ElementPlus, { title: vm.cfg.generator === 'password' ? t(vm, 'passwordOptions') : t(vm, 'input'), children: [
          vm.cfg.generator === 'md5' ? h(ElInput, { modelValue: vm.input, 'onUpdate:modelValue': function (v) { vm.input = v; }, type: 'textarea', autosize: { minRows: 7, maxRows: 14 }, placeholder: t(vm, 'input') }) : null,
          renderGeneratorOptions(vm)
        ] }),
        renderOptionPanel(h, ElementPlus, { title: t(vm, 'result'), className: 'ymir-vue-output', children: renderResultNodes(vm) })
      ]);
    },
    calculator: function (vm) {
      return h('div', { class: 'ymir-vue-body' }, [
        renderOptionPanel(h, ElementPlus, { title: t(vm, 'expression'), children: h(ElInput, { modelValue: vm.calcInput, 'onUpdate:modelValue': function (v) { vm.calcInput = v; }, placeholder: '(128 + 256) / 3' }) }),
        renderOptionPanel(h, ElementPlus, { title: t(vm, 'result'), className: 'ymir-vue-output', children: renderResultNodes(vm) })
      ]);
    },
    time: function (vm) {
      return h('div', { class: 'ymir-vue-body ymir-vue-body--time' }, [
        renderOptionPanel(h, ElementPlus, { title: t(vm, 'current'), children: renderResultNodes(vm) }),
        renderOptionPanel(h, ElementPlus, { title: t(vm, 'timestamp'), children: [
          h(ElInput, { modelValue: vm.timestampInput, 'onUpdate:modelValue': function (v) { vm.timestampInput = v; }, placeholder: '1716638400' }),
          h(ElInput, { modelValue: vm.dateOutput, type: 'textarea', readonly: true, autosize: { minRows: 5, maxRows: 8 }, placeholder: t(vm, 'output'), class: 'ymir-vue-inline-output' })
        ] }),
        renderOptionPanel(h, ElementPlus, { title: t(vm, 'dateInput'), className: 'ymir-vue-span-2', children: [
          h(ElInput, { modelValue: vm.dateInput, 'onUpdate:modelValue': function (v) { vm.dateInput = v; }, placeholder: '2026-05-25 12:00:00' }),
          h(ElInput, { modelValue: vm.timestampOutput, type: 'textarea', readonly: true, autosize: { minRows: 4, maxRows: 6 }, placeholder: t(vm, 'output'), class: 'ymir-vue-inline-output' })
        ] })
      ]);
    }
  };

  var METHODS = {
    setLang: function (lang) {
      this.lang = normalizeLang(lang);
      if (Shared.setLang) Shared.setLang(this.lang);
      else { try { localStorage.setItem('ymir_lang', this.lang); } catch (e) {} document.documentElement.lang = this.lang === 'zh' ? 'zh-CN' : 'en'; }
    },
    setStatus: function (type, message) { this.statusType = type; this.statusMessage = message; },
    copyText: function (text, label) {
      var self = this;
      if (!text) { this.setStatus('warning', this.labels.nothing); return; }
      if (Shared.copyText) { Shared.copyText(text, { copied: label || this.labels.copied, empty: this.labels.nothing, failed: this.labels.copyFailed }).then(function (ok) { if (ok) self.setStatus('success', label || self.labels.copied); else self.setStatus('error', self.labels.copyFailed); }); return; }
      this.setStatus('error', this.labels.copyFailed);
    },
    copyOutput: function () { this.copyText(this.output || this.timestampOutput || this.dateOutput || (this.resultCards[0] && this.resultCards[0].value)); },
    clearAll: function () {
      this.input = ''; this.input2 = ''; this.output = ''; this.pattern = ''; this.regexText = ''; this.calcInput = ''; this.timestampInput = ''; this.dateInput = ''; this.timestampOutput = ''; this.dateOutput = ''; this.currentSeconds = ''; this.currentMilliseconds = ''; this.metrics = []; this.resultCards = [];
      this.setStatus('info', this.lang === 'zh' ? '已清空。' : 'Cleared.');
    },
    loadSample: function () {
      if (this.cfg.mode === 'diff') { this.input = this.cfg.sample || ''; this.input2 = this.cfg.secondarySample || ''; this.compareText(); return; }
      if (this.cfg.mode === 'regex') { this.pattern = this.cfg.patternSample || ''; this.regexText = this.cfg.sample || ''; this.testRegex(); return; }
      if (this.cfg.mode === 'calculator') { this.calcInput = this.cfg.calcSample || '(128 + 256) / 3'; this.calculate(); return; }
      if (this.cfg.mode === 'time') { this.loadCurrentTime(); this.timestampInput = this.currentSeconds; this.timestampToDate(); return; }
      if (this.cfg.generator === 'guid') { this.generateGuid(); return; }
      if (this.cfg.generator === 'password') { this.generatePassword(); return; }
      this.input = this.cfg.sample || '';
      this.output = '';
      this.resultCards = [];
      this.setStatus('info', this.labels.sample + '.');
      if (this.cfg.startup && typeof this[this.cfg.startup] === 'function') this[this.cfg.startup]();
    },
    formatJson: function () {
      if (!this.input.trim()) { this.setStatus('warning', this.labels.empty); return; }
      try { this.output = JSON.stringify(JSON.parse(this.input), null, 2); this.setStatus('success', this.lang === 'zh' ? 'JSON 有效，已格式化。' : 'Valid JSON. Formatted with 2-space indentation.'); }
      catch (e) { this.setStatus('error', (this.lang === 'zh' ? 'JSON 无效：' : 'Invalid JSON: ') + e.message); }
    },
    minifyJson: function () {
      if (!this.input.trim()) { this.setStatus('warning', this.labels.empty); return; }
      try { this.output = JSON.stringify(JSON.parse(this.input)); this.setStatus('success', this.lang === 'zh' ? 'JSON 有效，已压缩。' : 'Valid JSON. Minified output is ready.'); }
      catch (e) { this.setStatus('error', (this.lang === 'zh' ? 'JSON 无效：' : 'Invalid JSON: ') + e.message); }
    },
    validateJson: function () {
      if (!this.input.trim()) { this.setStatus('warning', this.labels.empty); return; }
      try { JSON.parse(this.input); this.output = JSON.stringify(JSON.parse(this.input), null, 2); this.setStatus('success', this.lang === 'zh' ? 'JSON 有效，未发现语法错误。' : 'Valid JSON. No syntax errors found.'); }
      catch (e) { this.setStatus('error', (this.lang === 'zh' ? 'JSON 无效：' : 'Invalid JSON: ') + e.message); }
    },
    encodeBase64: function () { if (!this.input) { this.setStatus('warning', this.labels.empty); return; } this.output = utf8Base64Encode(this.input); this.setStatus('success', this.lang === 'zh' ? '已编码为 Base64。' : 'Encoded as Base64.'); },
    decodeBase64: function () { if (!this.input) { this.setStatus('warning', this.labels.empty); return; } try { this.output = utf8Base64Decode(this.input); this.setStatus('success', this.lang === 'zh' ? 'Base64 已解码。' : 'Decoded Base64 text.'); } catch (e) { this.setStatus('error', this.lang === 'zh' ? 'Base64 无效或包含不支持的二进制数据。' : 'Invalid Base64 input or unsupported binary data.'); } },
    formatJs: function () { this.output = window.js_beautify ? window.js_beautify(this.input, { indent_size: 2 }) : basicJsFormat(this.input); this.setStatus('success', this.lang === 'zh' ? 'JavaScript 已格式化。' : 'JavaScript formatted for readability.'); },
    minifyJs: function () { this.output = basicJsMinify(this.input); this.setStatus('success', this.lang === 'zh' ? '轻量压缩结果已生成。' : 'Basic minified output is ready.'); },
    encodeUrl: function () { this.output = encodeURIComponent(this.input || ''); this.setStatus('success', this.lang === 'zh' ? '已编码 URL 组件。' : 'URL component encoded.'); },
    decodeUrl: function () { try { this.output = decodeURIComponent(String(this.input || '').replace(/\+/g, '%20')); this.setStatus('success', this.lang === 'zh' ? 'URL 已解码。' : 'URL decoded.'); } catch (e) { this.setStatus('error', (this.lang === 'zh' ? 'URL 解码错误：' : 'URL decode error: ') + e.message); } },
    compareText: function () {
      if (!this.input && !this.input2) { this.setStatus('warning', this.labels.empty); return; }
      var a = String(this.input || '').split(/\r?\n/), b = String(this.input2 || '').split(/\r?\n/), max = Math.max(a.length, b.length), out = [], added = 0, removed = 0, changed = 0;
      for (var i = 0; i < max; i++) {
        if (a[i] === b[i]) continue;
        if (a[i] === undefined) { added++; out.push('+ ' + b[i]); }
        else if (b[i] === undefined) { removed++; out.push('- ' + a[i]); }
        else { changed++; out.push('- ' + a[i]); out.push('+ ' + b[i]); }
      }
      this.output = out.join('\n') || (this.lang === 'zh' ? '未发现行级差异。' : 'No line-level differences found.');
      this.setStatus(out.length ? 'success' : 'info', (this.lang === 'zh' ? '新增行：' : 'Added lines: ') + added + ' · ' + (this.lang === 'zh' ? '删除行：' : 'Removed lines: ') + removed + ' · ' + (this.lang === 'zh' ? '变更行对：' : 'Changed line pairs: ') + changed);
    },
    testRegex: function () {
      if (!String(this.pattern || '').trim()) { this.setStatus('warning', this.lang === 'zh' ? '请先输入正则表达式。' : 'Enter a regular expression first.'); return; }
      try {
        var flagText = ['g', 'i', 'm'].filter(function (f) { return this.flags[f]; }, this).join('');
        var re = new RegExp(this.pattern, flagText);
        var source = String(this.regexText || '');
        var result = [], match;
        if (flagText.indexOf('g') > -1) {
          while ((match = re.exec(source)) !== null) { result.push('Match ' + (result.length + 1) + ' at ' + match.index + ': ' + match[0]); if (match.index === re.lastIndex) re.lastIndex++; }
        } else { match = re.exec(source); if (match) result.push('Match at ' + match.index + ': ' + match[0]); }
        this.output = result.join('\n') || (this.lang === 'zh' ? '没有匹配。' : 'No matches found.');
        this.setStatus(result.length ? 'success' : 'info', (this.lang === 'zh' ? '匹配数量：' : 'Matches found: ') + result.length);
      } catch (e) { this.setStatus('error', (this.lang === 'zh' ? '正则错误：' : 'Regex error: ') + e.message); }
    },
    countText: function () {
      var s = String(this.input || '');
      var words = (s.trim().match(/[A-Za-z0-9_'-]+|[\u4e00-\u9fff]/g) || []).length;
      this.metrics = [
        { label: this.lang === 'zh' ? '字符' : 'Characters', value: s.length },
        { label: this.lang === 'zh' ? '不含空格' : 'No spaces', value: s.replace(/\s/g, '').length },
        { label: this.lang === 'zh' ? '单词/汉字' : 'Words/CJK chars', value: words },
        { label: this.lang === 'zh' ? '行数' : 'Lines', value: countLines(s) },
        { label: this.lang === 'zh' ? '段落' : 'Paragraphs', value: s.trim() ? s.trim().split(/\n\s*\n/).length : 0 },
        { label: this.lang === 'zh' ? '字节' : 'Bytes', value: byteLength(s) }
      ];
      this.output = this.metrics.map(function (item) { return item.label + ': ' + item.value; }).join('\n');
      this.setStatus('info', this.lang === 'zh' ? '文本统计已更新。' : 'Text statistics updated.');
    },
    generateMd5: function () {
      if (!this.input) { this.setStatus('warning', this.lang === 'zh' ? '请先输入文本。' : 'Enter text before generating an MD5 hash.'); return; }
      var r = ymirMd5(this.input), r16 = r.substring(8, 24);
      this.resultCards = [
        { label: '32 lowercase', value: r.toLowerCase() },
        { label: '32 uppercase', value: r.toUpperCase() },
        { label: '16 lowercase', value: r16.toLowerCase() },
        { label: '16 uppercase', value: r16.toUpperCase() }
      ];
      this.output = this.resultCards.map(function (card) { return card.label + ': ' + card.value; }).join('\n');
      this.setStatus('success', this.lang === 'zh' ? 'MD5 哈希已生成。MD5 不是加密。' : 'MD5 hashes generated. MD5 is not encryption.');
    },
    generateGuid: function () {
      try {
        var n = Math.max(1, Math.min(100, parseInt(this.guidCount || '1', 10)));
        var values = [];
        for (var i = 0; i < n; i++) values.push(secureUuid());
        this.output = values.join('\n');
        this.resultCards = values.slice(0, 12).map(function (value, idx) { return { label: 'UUID ' + (idx + 1), value: value }; });
        this.setStatus('success', (this.lang === 'zh' ? '已生成 ' : 'Generated ') + n + (this.lang === 'zh' ? ' 个 UUID。' : ' UUID value' + (n > 1 ? 's.' : '.')));
      } catch (e) { this.setStatus('error', e.message); }
    },
    generatePassword: function () {
      var cryptoObj = window.crypto || window.msCrypto;
      if (!cryptoObj || !cryptoObj.getRandomValues) { this.setStatus('error', 'Secure random generation is not available in this environment.'); return; }
      var len = Math.max(8, Math.min(128, parseInt(this.passwordLength || '16', 10)));
      var sets = [];
      if (this.passwordSets.upper) sets.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      if (this.passwordSets.lower) sets.push('abcdefghijklmnopqrstuvwxyz');
      if (this.passwordSets.numbers) sets.push('0123456789');
      if (this.passwordSets.symbols) sets.push('!@#$%^&*()-_=+[]{};:,.?/');
      if (!sets.length) { this.setStatus('error', this.lang === 'zh' ? '至少选择一种字符集。' : 'Select at least one character set.'); return; }
      var chars = sets.join(''), arr = new Uint32Array(len), out = '';
      cryptoObj.getRandomValues(arr);
      for (var i = 0; i < len; i++) out += chars[arr[i] % chars.length];
      this.output = out;
      this.resultCards = [{ label: this.lang === 'zh' ? '随机密码' : 'Random password', value: out }];
      this.setStatus('success', this.lang === 'zh' ? '密码已生成。' : 'Password generated.');
    },
    calculate: function () {
      if (!this.calcInput.trim()) { this.setStatus('warning', this.labels.empty); return; }
      try {
        var value = evaluateBasicExpression(this.calcInput);
        this.output = String(value);
        this.resultCards = [{ label: this.lang === 'zh' ? '计算结果' : 'Calculation result', value: String(value) }];
        this.setStatus(isFinite(value) ? 'success' : 'warning', isFinite(value) ? (this.lang === 'zh' ? '计算完成。' : 'Calculation complete.') : (this.lang === 'zh' ? '结果不是有限数。' : 'Result is not finite.'));
      } catch (e) { this.setStatus('error', (this.lang === 'zh' ? '计算错误：' : 'Calculation error: ') + e.message); }
    },
    loadCurrentTime: function () {
      var d = new Date();
      this.currentSeconds = String(Math.floor(d.getTime() / 1000));
      this.currentMilliseconds = String(d.getTime());
      this.output = 'Seconds: ' + this.currentSeconds + '\nMilliseconds: ' + this.currentMilliseconds + '\nISO: ' + d.toISOString();
      this.resultCards = [
        { label: 'Seconds', value: this.currentSeconds },
        { label: 'Milliseconds', value: this.currentMilliseconds },
        { label: 'ISO', value: d.toISOString() }
      ];
      this.setStatus('info', this.lang === 'zh' ? '当前时间已载入。' : 'Current time loaded.');
    },
    timestampToDate: function () {
      var raw = String(this.timestampInput || '').trim();
      if (!raw) { this.setStatus('warning', this.labels.empty); return; }
      var num = Number(raw);
      if (!isFinite(num)) { this.setStatus('error', this.lang === 'zh' ? '时间戳必须是数字。' : 'Timestamp must be numeric.'); return; }
      var ms = Math.abs(num) < 100000000000 ? num * 1000 : num;
      var d = new Date(ms);
      if (isNaN(d.getTime())) { this.setStatus('error', this.lang === 'zh' ? '时间戳无效。' : 'Invalid timestamp.'); return; }
      this.dateOutput = 'Local: ' + d.toString() + '\nISO: ' + d.toISOString() + '\nUTC: ' + d.toUTCString();
      this.output = this.dateOutput;
      this.setStatus('success', this.lang === 'zh' ? '时间戳已转换为日期。' : 'Timestamp converted to date.');
    },
    dateToTimestamp: function () {
      var raw = String(this.dateInput || '').trim();
      if (!raw) { this.setStatus('warning', this.labels.empty); return; }
      var d = new Date(raw);
      if (isNaN(d.getTime())) { this.setStatus('error', this.lang === 'zh' ? '日期时间无效。' : 'Invalid date/time value.'); return; }
      this.timestampOutput = 'Seconds: ' + Math.floor(d.getTime() / 1000) + '\nMilliseconds: ' + d.getTime();
      this.output = this.timestampOutput;
      this.setStatus('success', this.lang === 'zh' ? '日期已转换为时间戳。' : 'Date converted to Unix timestamp.');
    },
    renderBody: function () {
      var renderer = BODY_RENDERERS[this.cfg.mode] || BODY_RENDERERS.text;
      return renderer(this);
    },
    renderActions: function () {
      var vm = this;
      var utilityActions = [];
      if (this.cfg.sample || this.cfg.secondarySample || this.cfg.patternSample || this.cfg.calcSample) utilityActions.push({ key: 'loadSample', label: 'sample', plain: true });
      utilityActions.push({ key: 'copyOutput', label: 'copy', plain: true });
      utilityActions.push({ key: 'clearAll', label: 'clear', type: 'danger', plain: true });
      var actions = (this.cfg.actions || []).concat(utilityActions);
      return renderActionButtons(h, ElementPlus, this, actions, {
        className: 'ymir-vue-actions',
        labelFor: function (key, item) {
          if (key === 'formatJson') return t(vm, 'format');
          if (key === 'formatJs') return t(vm, 'format');
          if (key === 'minifyJson' || key === 'minifyJs') return t(vm, 'minify');
          if (key === 'validateJson') return t(vm, 'validate');
          if (key === 'encodeBase64' || key === 'encodeUrl') return t(vm, 'encode');
          if (key === 'decodeBase64' || key === 'decodeUrl') return t(vm, 'decode');
          if (key === 'loadSample') return t(vm, 'sample');
          if (key === 'copyOutput') return t(vm, 'copy');
          if (key === 'clearAll') return t(vm, 'clear');
          return t(vm, item.label || key);
        },
        onRun: function (key) { runToolAction(vm, key); }
      });
    }
  };

  if (!Shared.mountConfiguredToolApp || !CoreTools.tools || !Object.keys(CoreTools.tools).length || !utf8Base64Encode || !ymirMd5 || !evaluateBasicExpression) {
    root.innerHTML = '<div class="ymir-vue-noscript">Shared Vue tool schema failed to load.</div>';
    return;
  }
  Shared.mountConfiguredToolApp({
    name: 'YmirVueToolsConfiguredApp',
    root: root,
    Vue: Vue,
    ElementPlus: ElementPlus,
    tools: CoreTools.tools,
    defaultSlug: CoreTools.defaultSlug || 'json',
    includeLang: true,
    textState: false,
    status: false,
    initialState: function () {
      return {
        input: '', input2: '', output: '', pattern: '', regexText: '', flags: { g: true, i: false, m: true },
        guidCount: 3, passwordLength: 16, passwordSets: { upper: true, lower: true, numbers: true, symbols: true },
        calcInput: '', timestampInput: '', dateInput: '', currentSeconds: '', currentMilliseconds: '', timestampOutput: '', dateOutput: '',
        metrics: [], resultCards: [], statusType: 'info', statusMessage: ''
      };
    },
    computed: {
      labels: function () { return (CoreTools.labels && (CoreTools.labels[this.lang] || CoreTools.labels.en)) || {}; },
      title: function () { return localize(this.cfg.title, this.lang, 'Tool'); },
      subtitle: function () { return localize(this.cfg.subtitle, this.lang, ''); },
      category: function () { return localize(this.cfg.category, this.lang, 'Tool'); },
      tags: function () { return localize(this.cfg.tags, this.lang, []); },
      inputStats: function () { return stat(this, this.input); },
      input2Stats: function () { return stat(this, this.input2); },
      outputStats: function () { return stat(this, this.output); },
      statusTitle: function () { return this.statusMessage || this.labels.statusReady; }
    },
    mounted: function () {
      var self = this;
      window.addEventListener('ymir-language-applied', function (event) { if (event && event.detail && event.detail.lang) self.lang = normalizeLang(event.detail.lang); });
      if (this.cfg.startup && typeof this[this.cfg.startup] === 'function') this[this.cfg.startup]();
    },
    methods: METHODS,
    render: function () {
      var self = this;
      var shell = Shared.renderShell;
      if (!shell) return h('div', { class: 'ymir-vue-noscript' }, 'Shared Vue renderer failed to load.');
      return shell(h, ElementPlus, {
        appClass: 'ymir-vue-app--' + this.tool,
        icon: this.cfg.icon,
        eyebrow: this.labels.eyebrow,
        category: this.category,
        title: this.title,
        subtitle: this.subtitle,
        tags: this.tags,
        lang: this.lang,
        onLangChange: function (value) { self.setLang(value); },
        statusType: this.statusType,
        statusTitle: this.statusTitle,
        footerTags: [
          { label: this.labels.local, type: 'primary' },
          { label: this.labels.noUpload, type: 'info' },
          { label: this.labels.copyReady, type: 'success' }
        ]
      }, [this.renderBody(), this.renderActions()]);
    }
  });
})();
