(function () {
  'use strict';

  var root = document.getElementById('ymir-vue-tool-app');
  if (!root) return;

  if (!window.Vue || !window.ElementPlus) {
    root.innerHTML = '<div class="ymir-vue-noscript">Vue or Element Plus assets failed to load. This tool cannot start.</div>';
    return;
  }

  var Vue = window.Vue;
  var h = Vue.h;
  var createApp = Vue.createApp;
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

  function utf8Base64Encode(str) {
    var bytes = new TextEncoder().encode(String(str || ''));
    var bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  function utf8Base64Decode(str) {
    var clean = String(str || '').replace(/\s+/g, '');
    var bin = atob(clean);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function ymirMd5(input) {
    function rhex(n) { var s = '', j = 0, hex = '0123456789abcdef'; for (; j < 4; j++) s += hex.charAt((n >> (j * 8 + 4)) & 15) + hex.charAt((n >> (j * 8)) & 15); return s; }
    function add(x, y) { return (x + y) & 4294967295; }
    function cmn(q, a, b, x, s, t) { a = add(add(a, q), add(x, t)); return add((a << s) | (a >>> (32 - s)), b); }
    function ff(a, b, c, d, x, s, t) { return cmn((b & c) | ((~b) & d), a, b, x, s, t); }
    function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & (~d)), a, b, x, s, t); }
    function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
    function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | (~d)), a, b, x, s, t); }
    function cycle(x, k) {
      var a = x[0], b = x[1], c = x[2], d = x[3];
      a = ff(a, b, c, d, k[0], 7, -680876936); d = ff(d, a, b, c, k[1], 12, -389564586); c = ff(c, d, a, b, k[2], 17, 606105819); b = ff(b, c, d, a, k[3], 22, -1044525330);
      a = ff(a, b, c, d, k[4], 7, -176418897); d = ff(d, a, b, c, k[5], 12, 1200080426); c = ff(c, d, a, b, k[6], 17, -1473231341); b = ff(b, c, d, a, k[7], 22, -45705983);
      a = ff(a, b, c, d, k[8], 7, 1770035416); d = ff(d, a, b, c, k[9], 12, -1958414417); c = ff(c, d, a, b, k[10], 17, -42063); b = ff(b, c, d, a, k[11], 22, -1990404162);
      a = ff(a, b, c, d, k[12], 7, 1804603682); d = ff(d, a, b, c, k[13], 12, -40341101); c = ff(c, d, a, b, k[14], 17, -1502002290); b = ff(b, c, d, a, k[15], 22, 1236535329);
      a = gg(a, b, c, d, k[1], 5, -165796510); d = gg(d, a, b, c, k[6], 9, -1069501632); c = gg(c, d, a, b, k[11], 14, 643717713); b = gg(b, c, d, a, k[0], 20, -373897302);
      a = gg(a, b, c, d, k[5], 5, -701558691); d = gg(d, a, b, c, k[10], 9, 38016083); c = gg(c, d, a, b, k[15], 14, -660478335); b = gg(b, c, d, a, k[4], 20, -405537848);
      a = gg(a, b, c, d, k[9], 5, 568446438); d = gg(d, a, b, c, k[14], 9, -1019803690); c = gg(c, d, a, b, k[3], 14, -187363961); b = gg(b, c, d, a, k[8], 20, 1163531501);
      a = gg(a, b, c, d, k[13], 5, -1444681467); d = gg(d, a, b, c, k[2], 9, -51403784); c = gg(c, d, a, b, k[7], 14, 1735328473); b = gg(b, c, d, a, k[12], 20, -1926607734);
      a = hh(a, b, c, d, k[5], 4, -378558); d = hh(d, a, b, c, k[8], 11, -2022574463); c = hh(c, d, a, b, k[11], 16, 1839030562); b = hh(b, c, d, a, k[14], 23, -35309556);
      a = hh(a, b, c, d, k[1], 4, -1530992060); d = hh(d, a, b, c, k[4], 11, 1272893353); c = hh(c, d, a, b, k[7], 16, -155497632); b = hh(b, c, d, a, k[10], 23, -1094730640);
      a = hh(a, b, c, d, k[13], 4, 681279174); d = hh(d, a, b, c, k[0], 11, -358537222); c = hh(c, d, a, b, k[3], 16, -722521979); b = hh(b, c, d, a, k[6], 23, 76029189);
      a = hh(a, b, c, d, k[9], 4, -640364487); d = hh(d, a, b, c, k[12], 11, -421815835); c = hh(c, d, a, b, k[15], 16, 530742520); b = hh(b, c, d, a, k[2], 23, -995338651);
      a = ii(a, b, c, d, k[0], 6, -198630844); d = ii(d, a, b, c, k[7], 10, 1126891415); c = ii(c, d, a, b, k[14], 15, -1416354905); b = ii(b, c, d, a, k[5], 21, -57434055);
      a = ii(a, b, c, d, k[12], 6, 1700485571); d = ii(d, a, b, c, k[3], 10, -1894986606); c = ii(c, d, a, b, k[10], 15, -1051523); b = ii(b, c, d, a, k[1], 21, -2054922799);
      a = ii(a, b, c, d, k[8], 6, 1873313359); d = ii(d, a, b, c, k[15], 10, -30611744); c = ii(c, d, a, b, k[6], 15, -1560198380); b = ii(b, c, d, a, k[13], 21, 1309151649);
      a = ii(a, b, c, d, k[4], 6, -145523070); d = ii(d, a, b, c, k[11], 10, -1120210379); c = ii(c, d, a, b, k[2], 15, 718787259); b = ii(b, c, d, a, k[9], 21, -343485551);
      x[0] = add(a, x[0]); x[1] = add(b, x[1]); x[2] = add(c, x[2]); x[3] = add(d, x[3]);
    }
    function md51(s) {
      var n = s.length, state = [1732584193, -271733879, -1732584194, 271733878], i;
      for (i = 64; i <= s.length; i += 64) { var k = []; for (var j = i - 64; j < i; j++) k[j >> 2 & 15] |= s.charCodeAt(j) << ((j % 4) << 3); cycle(state, k); }
      var tail = new Array(16).fill(0);
      for (i -= 64; i < s.length; i++) tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
      tail[i >> 2] |= 128 << ((i % 4) << 3);
      if (i > 55) { cycle(state, tail); tail = new Array(16).fill(0); }
      tail[14] = n * 8; cycle(state, tail); return state;
    }
    input = unescape(encodeURIComponent(String(input || '')));
    var x = md51(input);
    return rhex(x[0]) + rhex(x[1]) + rhex(x[2]) + rhex(x[3]);
  }

  function evaluateBasicExpression(expression) {
    var source = String(expression || '');
    if (!/^[0-9+\-*/().%\s]+$/.test(source)) throw new Error('Only numbers, parentheses, and basic operators are supported.');
    var index = 0;
    function skipWhitespace() { while (/\s/.test(source.charAt(index))) index++; }
    function parseNumber() {
      skipWhitespace();
      var start = index;
      var sawDigit = false;
      while (/[0-9]/.test(source.charAt(index))) { index++; sawDigit = true; }
      if (source.charAt(index) === '.') { index++; while (/[0-9]/.test(source.charAt(index))) { index++; sawDigit = true; } }
      if (!sawDigit) throw new Error('Expected a number at position ' + (index + 1) + '.');
      return Number(source.slice(start, index));
    }
    function parsePrimary() {
      skipWhitespace();
      var ch = source.charAt(index);
      if (ch === '+') { index++; return parsePrimary(); }
      if (ch === '-') { index++; return -parsePrimary(); }
      if (ch === '(') { index++; var value = parseExpression(); skipWhitespace(); if (source.charAt(index) !== ')') throw new Error('Expected closing parenthesis at position ' + (index + 1) + '.'); index++; return value; }
      return parseNumber();
    }
    function parseTerm() {
      var value = parsePrimary();
      while (true) { skipWhitespace(); var op = source.charAt(index); if (op !== '*' && op !== '/' && op !== '%') break; index++; var right = parsePrimary(); if (op === '*') value *= right; else if (op === '/') value /= right; else value %= right; }
      return value;
    }
    function parseExpression() {
      var value = parseTerm();
      while (true) { skipWhitespace(); var op = source.charAt(index); if (op !== '+' && op !== '-') break; index++; var right = parseTerm(); value = op === '+' ? value + right : value - right; }
      return value;
    }
    var result = parseExpression(); skipWhitespace();
    if (index !== source.length) throw new Error('Unexpected input at position ' + (index + 1) + '.');
    return result;
  }

  function secureUuid() {
    var cryptoObj = window.crypto || window.msCrypto;
    if (cryptoObj && typeof cryptoObj.randomUUID === 'function') return cryptoObj.randomUUID();
    if (!cryptoObj || !cryptoObj.getRandomValues) throw new Error('Secure random generation is not available in this browser.');
    var bytes = new Uint8Array(16);
    cryptoObj.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    var hex = [];
    for (var i = 0; i < bytes.length; i++) hex.push((bytes[i] + 256).toString(16).slice(1));
    return hex[0] + hex[1] + hex[2] + hex[3] + '-' + hex[4] + hex[5] + '-' + hex[6] + hex[7] + '-' + hex[8] + hex[9] + '-' + hex[10] + hex[11] + hex[12] + hex[13] + hex[14] + hex[15];
  }

  function basicJsFormat(source) {
    var text = String(source || '');
    var out = '';
    var indent = 0;
    var inString = false;
    var quote = '';
    var escape = false;
    function nl(extra) {
      out = out.replace(/[ \t]+$/g, '');
      out += '\n' + new Array(Math.max(0, indent + (extra || 0)) + 1).join('  ');
    }
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      if (inString) {
        out += ch;
        if (escape) escape = false;
        else if (ch === '\\') escape = true;
        else if (ch === quote) inString = false;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { inString = true; quote = ch; out += ch; continue; }
      if (ch === '{' || ch === '[') { out += ch; indent++; nl(); continue; }
      if (ch === '}' || ch === ']') { indent--; nl(); out += ch; continue; }
      if (ch === ';') { out += ch; nl(); continue; }
      if (ch === ',') { out += ch + ' '; continue; }
      if (/\s/.test(ch)) { if (!/\s$/.test(out)) out += ' '; continue; }
      out += ch;
    }
    return out.replace(/\n\s*\n/g, '\n').trim();
  }

  function basicJsMinify(source) {
    return String(source || '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|\n)\s*\/\/.*(?=\n|$)/g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}();,:=+\-*\/%<>])\s*/g, '$1')
      .trim();
  }

  var toolText = {
    json: { icon: '{}', category: 'Developer Tool', zhCategory: '开发工具', title: 'JSON Formatter & Validator', zhTitle: 'JSON 格式化与校验', subtitle: 'Format, minify, validate, and copy JSON output.', zhSubtitle: '格式化、压缩、校验并复制 JSON 结果。', tags: ['Format', 'Validate', 'Copy'], zhTags: ['格式化', '校验', '复制'], mode: 'text' },
    base64: { icon: '64', category: 'Encoding Tool', zhCategory: '编码工具', title: 'Base64 Encode & Decode', zhTitle: 'Base64 编码与解码', subtitle: 'Encode UTF-8 text to Base64 or decode Base64 back to text.', zhSubtitle: '将 UTF-8 文本编码为 Base64，或解码 Base64 文本。', tags: ['Encode', 'Decode', 'UTF-8'], zhTags: ['编码', '解码', 'UTF-8'], mode: 'text' },
    formatjs: { icon: 'JS', category: 'Code Tool', zhCategory: '代码工具', title: 'JavaScript Formatter', zhTitle: 'JavaScript 格式化', subtitle: 'Format or lightly minify JavaScript snippets in the browser.', zhSubtitle: '在浏览器中格式化或轻量压缩 JavaScript 片段。', tags: ['Format', 'Minify', 'Copy'], zhTags: ['格式化', '压缩', '复制'], mode: 'text' },
    urlencode: { icon: '%', category: 'Encoding Tool', zhCategory: '编码工具', title: 'URL Encoder & Decoder', zhTitle: 'URL 编码与解码', subtitle: 'Encode URL components or decode percent-encoded strings.', zhSubtitle: '编码 URL 组件或解码百分号编码字符串。', tags: ['Encode', 'Decode', 'Query'], zhTags: ['编码', '解码', '查询串'], mode: 'text' },
    textdiff: { icon: 'Δ', category: 'Text Tool', zhCategory: '文本工具', title: 'Text Diff Checker', zhTitle: '文本差异比较', subtitle: 'Compare two text blocks and review line-level differences.', zhSubtitle: '比较两段文本并查看行级差异。', tags: ['Compare', 'Lines', 'Copy'], zhTags: ['比较', '行差异', '复制'], mode: 'diff' },
    regex: { icon: '.*', category: 'Developer Tool', zhCategory: '开发工具', title: 'Regex Tester', zhTitle: '正则表达式测试', subtitle: 'Test regular expressions with global, case-insensitive, and multiline flags.', zhSubtitle: '使用全局、忽略大小写和多行标记测试正则表达式。', tags: ['Match', 'Flags', 'Debug'], zhTags: ['匹配', '标记', '调试'], mode: 'regex' },
    txtcount: { icon: 'Aa', category: 'Text Tool', zhCategory: '文本工具', title: 'Text Counter', zhTitle: '文本统计', subtitle: 'Count characters, words, lines, paragraphs, and bytes.', zhSubtitle: '统计字符、单词、行数、段落和字节数。', tags: ['Characters', 'Words', 'Bytes'], zhTags: ['字符', '单词', '字节'], mode: 'metrics' },
    md5: { icon: '#', category: 'Hash Tool', zhCategory: '哈希工具', title: 'MD5 Hash Generator', zhTitle: 'MD5 哈希生成器', subtitle: 'Generate 32-character and 16-character MD5 hash variants.', zhSubtitle: '生成 32 位和 16 位 MD5 哈希变体。', tags: ['32-bit', '16-bit', 'Copy'], zhTags: ['32 位', '16 位', '复制'], mode: 'generator' },
    guid: { icon: 'ID', category: 'Generator Tool', zhCategory: '生成器', title: 'GUID / UUID Generator', zhTitle: 'GUID / UUID 生成器', subtitle: 'Generate one or more random UUID v4 identifiers.', zhSubtitle: '生成一个或多个随机 UUID v4 标识符。', tags: ['UUID v4', 'Secure random', 'Copy'], zhTags: ['UUID v4', '安全随机', '复制'], mode: 'generator' },
    password: { icon: '🔒', category: 'Generator Tool', zhCategory: '生成器', title: 'Password Generator', zhTitle: '密码生成器', subtitle: 'Generate random passwords with length and character-set controls.', zhSubtitle: '按长度和字符集选项生成随机密码。', tags: ['Length', 'Character sets', 'Copy'], zhTags: ['长度', '字符集', '复制'], mode: 'generator' },
    calculator: { icon: '=', category: 'Calculator Tool', zhCategory: '计算工具', title: 'Online Calculator', zhTitle: '在线计算器', subtitle: 'Run quick calculations with numbers, parentheses, percentages, and operators.', zhSubtitle: '用数字、括号、百分号和基本运算符快速计算。', tags: ['Calculate', 'Copy', 'Local'], zhTags: ['计算', '复制', '本地'], mode: 'calculator' },
    unixtime: { icon: 'T', category: 'Time Tool', zhCategory: '时间工具', title: 'Unix Timestamp Converter', zhTitle: 'Unix 时间戳转换器', subtitle: 'Convert Unix timestamps to dates and dates back to seconds or milliseconds.', zhSubtitle: '在 Unix 时间戳和可读日期之间转换。', tags: ['Seconds', 'Milliseconds', 'ISO'], zhTags: ['秒', '毫秒', 'ISO'], mode: 'time' }
  };

  var samples = {
    json: '{\n  "name": "Ymir Tool",\n  "features": ["format", "validate", "copy"],\n  "local": true\n}',
    base64: 'Ymir Tool 支持 UTF-8 文本 Base64 编码。',
    formatjs: 'function hello(name){if(name){console.log("Hello, "+name)}else{console.log("Hello, Ymir Tool")}}',
    urlencode: 'https://ymirtool.com/search?q=中文 test&source=工具箱',
    txtcount: 'Ymir Tool helps you count words, lines, characters, and paragraphs.\n\n这是一段中文示例文本，用于检查字符统计。',
    regexPattern: '^[\\w.-]+@[\\w.-]+\\.[A-Za-z]{2,}$',
    regexText: 'hello@example.com\nnot an email\nteam@ymirtool.com',
    textA: 'Project scope:\n- Landing page design\n- 2 revision rounds\n- Delivery by Friday',
    textB: 'Project scope:\n- Landing page design\n- 3 revision rounds\n- Delivery by Monday\n- Final handoff files'
  };

  var commonText = {
    en: {
      eyebrow: 'Vue 3 + Element Plus workbench', input: 'Input', output: 'Output', result: 'Result', chars: 'chars', lines: 'lines', ready: 'Ready.', copy: 'Copy result', clear: 'Clear', sample: 'Load sample', local: 'Runs locally in your browser', noUpload: 'No file upload', copyReady: 'Copy-ready output', copied: 'Copied result to clipboard.', copyFailed: 'Copy failed.', nothing: 'Generate a result before copying.', empty: 'Enter input before running the tool.', statusReady: 'Ready.', format: 'Format', minify: 'Minify', validate: 'Validate', encode: 'Encode', decode: 'Decode', compare: 'Compare', test: 'Test Regex', count: 'Count text', generate: 'Generate', calculate: 'Calculate', now: 'Current time', toDate: 'Timestamp to date', toTimestamp: 'Date to timestamp', expression: 'Expression', timestamp: 'Timestamp', dateInput: 'Date input', original: 'Original text', changed: 'Changed text', pattern: 'Pattern', flags: 'Flags', text: 'Test text', passwordOptions: 'Password options', length: 'Length', uppercase: 'Uppercase', lowercase: 'Lowercase', numbers: 'Numbers', symbols: 'Symbols', countLabel: 'Count', current: 'Current timestamp' },
    zh: {
      eyebrow: 'Vue 3 + Element Plus 工作台', input: '输入', output: '输出', result: '结果', chars: '字符', lines: '行', ready: '就绪。', copy: '复制结果', clear: '清空', sample: '载入示例', local: '在浏览器本地运行', noUpload: '不上传文件', copyReady: '结果可复制', copied: '结果已复制到剪贴板。', copyFailed: '复制失败。', nothing: '请先生成结果再复制。', empty: '请先输入内容。', statusReady: '就绪。', format: '格式化', minify: '压缩', validate: '校验', encode: '编码', decode: '解码', compare: '比较', test: '测试正则', count: '统计文本', generate: '生成', calculate: '计算', now: '当前时间', toDate: '时间戳转日期', toTimestamp: '日期转时间戳', expression: '表达式', timestamp: '时间戳', dateInput: '日期输入', original: '原文本', changed: '新文本', pattern: '表达式', flags: '标记', text: '测试文本', passwordOptions: '密码选项', length: '长度', uppercase: '大写字母', lowercase: '小写字母', numbers: '数字', symbols: '符号', countLabel: '数量', current: '当前时间戳' }
  };

  var App = {
    name: 'YmirVueToolsApp',
    data: function () {
      var tool = root.getAttribute('data-tool') || (document.querySelector('[data-ymir-tool]') || {}).getAttribute && document.querySelector('[data-ymir-tool]').getAttribute('data-ymir-tool') || 'json';
      return {
        tool: tool,
        lang: initialLang(),
        input: '',
        input2: '',
        output: '',
        pattern: '',
        regexText: '',
        flags: { g: true, i: false, m: true },
        guidCount: 3,
        passwordLength: 16,
        passwordSets: { upper: true, lower: true, numbers: true, symbols: true },
        calcInput: '',
        timestampInput: '',
        dateInput: '',
        currentSeconds: '',
        currentMilliseconds: '',
        timestampOutput: '',
        dateOutput: '',
        metrics: [],
        resultCards: [],
        statusType: 'info',
        statusMessage: ''
      };
    },
    computed: {
      labels: function () { return commonText[this.lang] || commonText.en; },
      cfg: function () { return toolText[this.tool] || toolText.json; },
      title: function () { return this.lang === 'zh' ? this.cfg.zhTitle : this.cfg.title; },
      subtitle: function () { return this.lang === 'zh' ? this.cfg.zhSubtitle : this.cfg.subtitle; },
      category: function () { return this.lang === 'zh' ? this.cfg.zhCategory : this.cfg.category; },
      tags: function () { return this.lang === 'zh' ? this.cfg.zhTags : this.cfg.tags; },
      inputStats: function () { return statText(this.input, this.labels.chars, this.labels.lines); },
      input2Stats: function () { return statText(this.input2, this.labels.chars, this.labels.lines); },
      outputStats: function () { return statText(this.output, this.labels.chars, this.labels.lines); },
      statusTitle: function () { return this.statusMessage || this.labels.statusReady; }
    },
    mounted: function () {
      var self = this;
      window.addEventListener('ymir-language-applied', function (event) { if (event && event.detail && event.detail.lang) self.lang = normalizeLang(event.detail.lang); });
      if (this.tool === 'txtcount') this.countText();
      if (this.tool === 'guid') this.generateGuid();
      if (this.tool === 'password') this.generatePassword();
      if (this.tool === 'unixtime') this.loadCurrentTime();
    },
    methods: {
      setLang: function (lang) {
        this.lang = normalizeLang(lang);
        if (Shared.setLang) Shared.setLang(this.lang);
        else { try { localStorage.setItem('ymir_lang', this.lang); } catch (e) {} document.documentElement.lang = this.lang === 'zh' ? 'zh-CN' : 'en'; }
      },
      setStatus: function (type, message) { this.statusType = type; this.statusMessage = message; },
      notify: function (type, message) {
        this.setStatus(type, message);
        if (!ElMessage) return;
        if (type === 'success' && ElMessage.success) ElMessage.success(message);
        else if (type === 'error' && ElMessage.error) ElMessage.error(message);
        else if (type === 'warning' && ElMessage.warning) ElMessage.warning(message);
      },
      copyText: function (text, label) {
        var self = this;
        if (!text) { this.setStatus('warning', this.labels.nothing); return; }
        if (Shared.copyText) { Shared.copyText(text, { copied: label || this.labels.copied, empty: this.labels.nothing, failed: this.labels.copyFailed }).then(function (ok) { if (ok) self.setStatus('success', label || self.labels.copied); else self.setStatus('error', self.labels.copyFailed); }); return; }
        this.setStatus('error', this.labels.copyFailed);
      },
      copyOutput: function () { this.copyText(this.output || this.timestampOutput || this.dateOutput || (this.resultCards[0] && this.resultCards[0].value)); },
      clearAll: function () {
        this.input = ''; this.input2 = ''; this.output = ''; this.pattern = ''; this.regexText = ''; this.calcInput = ''; this.timestampInput = ''; this.dateInput = ''; this.timestampOutput = ''; this.dateOutput = ''; this.metrics = []; this.resultCards = []; this.setStatus('info', '');
        if (this.tool === 'txtcount') this.countText();
        if (this.tool === 'unixtime') this.loadCurrentTime();
      },
      loadSample: function () {
        if (this.tool === 'textdiff') { this.input = samples.textA; this.input2 = samples.textB; this.compareText(); return; }
        if (this.tool === 'regex') { this.pattern = samples.regexPattern; this.regexText = samples.regexText; this.testRegex(); return; }
        if (this.tool === 'calculator') { this.calcInput = '(128 + 256) / 3'; this.calculate(); return; }
        if (this.tool === 'unixtime') { this.loadCurrentTime(); this.timestampInput = this.currentSeconds; this.timestampToDate(); return; }
        if (this.tool === 'md5') { this.input = 'hello world'; this.generateMd5(); return; }
        if (this.tool === 'guid') { this.generateGuid(); return; }
        if (this.tool === 'password') { this.generatePassword(); return; }
        this.input = samples[this.tool] || samples.json;
        this.setStatus('info', this.labels.sample + '.');
        if (this.tool === 'txtcount') this.countText();
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
        if (!cryptoObj || !cryptoObj.getRandomValues) { this.setStatus('error', 'Secure random generation is not available in this browser.'); return; }
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
      renderPanel: function (title, meta, value, placeholder, readonly, onUpdate, extraClass, rows) {
        var self = this;
        return h(ElCard, { class: 'ymir-vue-panel ' + (extraClass || ''), shadow: 'never' }, {
          header: function () { return h('div', { class: 'ymir-vue-panel__top' }, [h('span', { class: 'ymir-vue-panel__title' }, [h('span', { class: 'ymir-vue-panel__dot' }), title]), h('span', { class: 'ymir-vue-panel__meta' }, meta || '')]); },
          default: function () { return h(ElInput, { modelValue: value, 'onUpdate:modelValue': onUpdate, type: 'textarea', readonly: !!readonly, resize: 'vertical', placeholder: placeholder || '', autosize: { minRows: rows || 12, maxRows: 24 } }); }
        });
      },
      renderField: function (label, value, onUpdate, placeholder) {
        return h('label', { class: 'ymir-vue-field' }, [h('span', null, label), h(ElInput, { modelValue: value, 'onUpdate:modelValue': onUpdate, placeholder: placeholder || '' })]);
      },
      renderOptionRow: function () {
        var self = this;
        if (this.tool === 'guid') return h('div', { class: 'ymir-vue-options' }, [this.renderField(this.labels.countLabel, String(this.guidCount), function (v) { self.guidCount = v; }, '1-100')]);
        if (this.tool === 'password') {
          var items = [
            ['upper', this.labels.uppercase], ['lower', this.labels.lowercase], ['numbers', this.labels.numbers], ['symbols', this.labels.symbols]
          ];
          return h('div', { class: 'ymir-vue-options' }, [
            this.renderField(this.labels.length, String(this.passwordLength), function (v) { self.passwordLength = v; }, '8-128'),
            h('div', { class: 'ymir-vue-checks' }, items.map(function (item) { return h('label', null, [h('input', { type: 'checkbox', checked: self.passwordSets[item[0]], onChange: function (event) { self.passwordSets[item[0]] = event.target.checked; } }), h('span', null, item[1])]); }))
          ]);
        }
        return null;
      },
      renderCards: function () {
        var self = this;
        if (!this.resultCards.length) return h('div', { class: 'ymir-vue-empty-result' }, this.lang === 'zh' ? '运行工具后这里显示结果。' : 'Run the tool to see results here.');
        return h('div', { class: 'ymir-vue-result-grid' }, this.resultCards.map(function (card) { return h('div', { class: 'ymir-vue-result-card' }, [h('div', { class: 'ymir-vue-result-card__label' }, card.label), h('code', null, card.value), h(ElButton, { size: 'small', onClick: function () { self.copyText(card.value); } }, function () { return self.labels.copy; })]); }));
      },
      renderMetricCards: function () {
        return h('div', { class: 'ymir-vue-metrics' }, this.metrics.map(function (item) { return h('div', { class: 'ymir-vue-metric' }, [h('strong', null, String(item.value)), h('span', null, item.label)]); }));
      },
      renderActions: function () {
        var self = this;
        var buttons = [];
        function btn(label, type, fn, plain) { buttons.push(h(ElButton, { type: type || '', plain: !!plain, onClick: fn }, function () { return label; })); }
        if (this.tool === 'json') { btn(this.labels.format + ' JSON', 'primary', this.formatJson); btn(this.labels.minify, '', this.minifyJson); btn(this.labels.validate, '', this.validateJson); }
        else if (this.tool === 'base64') { btn(this.labels.encode, 'primary', this.encodeBase64); btn(this.labels.decode, '', this.decodeBase64); }
        else if (this.tool === 'formatjs') { btn(this.labels.format + ' JavaScript', 'primary', this.formatJs); btn(this.labels.minify, '', this.minifyJs); }
        else if (this.tool === 'urlencode') { btn(this.labels.encode, 'primary', this.encodeUrl); btn(this.labels.decode, '', this.decodeUrl); }
        else if (this.tool === 'textdiff') { btn(this.labels.compare, 'primary', this.compareText); }
        else if (this.tool === 'regex') { btn(this.labels.test, 'primary', this.testRegex); }
        else if (this.tool === 'txtcount') { btn(this.labels.count, 'primary', this.countText); }
        else if (this.tool === 'md5') { btn(this.labels.generate, 'primary', this.generateMd5); }
        else if (this.tool === 'guid') { btn(this.labels.generate, 'primary', this.generateGuid); }
        else if (this.tool === 'password') { btn(this.labels.generate, 'primary', this.generatePassword); }
        else if (this.tool === 'calculator') { btn(this.labels.calculate, 'primary', this.calculate); }
        else if (this.tool === 'unixtime') { btn(this.labels.now, 'primary', this.loadCurrentTime); btn(this.labels.toDate, '', this.timestampToDate); btn(this.labels.toTimestamp, '', this.dateToTimestamp); }
        btn(this.labels.sample, '', this.loadSample, true);
        btn(this.labels.copy, '', this.copyOutput, true);
        btn(this.labels.clear, 'danger', this.clearAll, true);
        return h('div', { class: 'ymir-vue-actions' }, buttons);
      },
      renderBody: function () {
        var self = this;
        if (this.cfg.mode === 'diff') {
          return h('div', { class: 'ymir-vue-body ymir-vue-body--diff' }, [
            this.renderPanel(this.labels.original, this.inputStats, this.input, this.labels.original, false, function (v) { self.input = v; }, '', 10),
            this.renderPanel(this.labels.changed, this.input2Stats, this.input2, this.labels.changed, false, function (v) { self.input2 = v; }, '', 10),
            this.renderPanel(this.labels.output, this.outputStats, this.output, this.labels.output, true, function () {}, 'ymir-vue-output ymir-vue-span-2', 10)
          ]);
        }
        if (this.cfg.mode === 'regex') {
          return h('div', { class: 'ymir-vue-body ymir-vue-body--regex' }, [
            h(ElCard, { class: 'ymir-vue-panel', shadow: 'never' }, { header: function () { return h('div', { class: 'ymir-vue-panel__top' }, [h('span', { class: 'ymir-vue-panel__title' }, [h('span', { class: 'ymir-vue-panel__dot' }), self.labels.pattern]), h('span', { class: 'ymir-vue-panel__meta' }, self.labels.flags)]); }, default: function () { return h('div', null, [h(ElInput, { modelValue: self.pattern, 'onUpdate:modelValue': function (v) { self.pattern = v; }, placeholder: '^[\\w.-]+@[\\w.-]+\\.[A-Za-z]{2,}$' }), h('div', { class: 'ymir-vue-checks' }, ['g', 'i', 'm'].map(function (flag) { return h('label', null, [h('input', { type: 'checkbox', checked: self.flags[flag], onChange: function (event) { self.flags[flag] = event.target.checked; } }), h('span', null, flag)]); }))]); } }),
            this.renderPanel(this.labels.text, statText(this.regexText, this.labels.chars, this.labels.lines), this.regexText, this.labels.text, false, function (v) { self.regexText = v; }, '', 10),
            this.renderPanel(this.labels.output, this.outputStats, this.output, this.labels.output, true, function () {}, 'ymir-vue-output ymir-vue-span-2', 8)
          ]);
        }
        if (this.cfg.mode === 'metrics') {
          return h('div', { class: 'ymir-vue-body ymir-vue-body--metrics' }, [
            this.renderPanel(this.labels.input, this.inputStats, this.input, this.labels.input, false, function (v) { self.input = v; self.countText(); }, '', 13),
            h(ElCard, { class: 'ymir-vue-panel', shadow: 'never' }, { header: function () { return h('div', { class: 'ymir-vue-panel__top' }, [h('span', { class: 'ymir-vue-panel__title' }, [h('span', { class: 'ymir-vue-panel__dot' }), self.labels.result])]); }, default: function () { return self.renderMetricCards(); } })
          ]);
        }
        if (this.cfg.mode === 'generator') {
          return h('div', { class: 'ymir-vue-body ymir-vue-body--generator' }, [
            h(ElCard, { class: 'ymir-vue-panel', shadow: 'never' }, { header: function () { return h('div', { class: 'ymir-vue-panel__top' }, [h('span', { class: 'ymir-vue-panel__title' }, [h('span', { class: 'ymir-vue-panel__dot' }), self.tool === 'password' ? self.labels.passwordOptions : self.labels.input])]); }, default: function () { return h('div', null, [self.tool === 'md5' ? h(ElInput, { modelValue: self.input, 'onUpdate:modelValue': function (v) { self.input = v; }, type: 'textarea', autosize: { minRows: 7, maxRows: 14 }, placeholder: self.labels.input }) : null, self.renderOptionRow()]); } }),
            h(ElCard, { class: 'ymir-vue-panel ymir-vue-output', shadow: 'never' }, { header: function () { return h('div', { class: 'ymir-vue-panel__top' }, [h('span', { class: 'ymir-vue-panel__title' }, [h('span', { class: 'ymir-vue-panel__dot' }), self.labels.result])]); }, default: function () { return self.renderCards(); } })
          ]);
        }
        if (this.cfg.mode === 'calculator') {
          return h('div', { class: 'ymir-vue-body' }, [
            h(ElCard, { class: 'ymir-vue-panel', shadow: 'never' }, { header: function () { return h('div', { class: 'ymir-vue-panel__top' }, [h('span', { class: 'ymir-vue-panel__title' }, [h('span', { class: 'ymir-vue-panel__dot' }), self.labels.expression])]); }, default: function () { return h(ElInput, { modelValue: self.calcInput, 'onUpdate:modelValue': function (v) { self.calcInput = v; }, placeholder: '(128 + 256) / 3' }); } }),
            h(ElCard, { class: 'ymir-vue-panel ymir-vue-output', shadow: 'never' }, { header: function () { return h('div', { class: 'ymir-vue-panel__top' }, [h('span', { class: 'ymir-vue-panel__title' }, [h('span', { class: 'ymir-vue-panel__dot' }), self.labels.result])]); }, default: function () { return self.renderCards(); } })
          ]);
        }
        if (this.cfg.mode === 'time') {
          return h('div', { class: 'ymir-vue-body ymir-vue-body--time' }, [
            h(ElCard, { class: 'ymir-vue-panel', shadow: 'never' }, { header: function () { return h('div', { class: 'ymir-vue-panel__top' }, [h('span', { class: 'ymir-vue-panel__title' }, [h('span', { class: 'ymir-vue-panel__dot' }), self.labels.current])]); }, default: function () { return self.renderCards(); } }),
            h(ElCard, { class: 'ymir-vue-panel', shadow: 'never' }, { header: function () { return h('div', { class: 'ymir-vue-panel__top' }, [h('span', { class: 'ymir-vue-panel__title' }, [h('span', { class: 'ymir-vue-panel__dot' }), self.labels.timestamp])]); }, default: function () { return h('div', null, [h(ElInput, { modelValue: self.timestampInput, 'onUpdate:modelValue': function (v) { self.timestampInput = v; }, placeholder: '1716638400' }), h(ElInput, { modelValue: self.dateOutput, type: 'textarea', readonly: true, autosize: { minRows: 5, maxRows: 8 }, placeholder: self.labels.output, class: 'ymir-vue-inline-output' })]); } }),
            h(ElCard, { class: 'ymir-vue-panel ymir-vue-span-2', shadow: 'never' }, { header: function () { return h('div', { class: 'ymir-vue-panel__top' }, [h('span', { class: 'ymir-vue-panel__title' }, [h('span', { class: 'ymir-vue-panel__dot' }), self.labels.dateInput])]); }, default: function () { return h('div', null, [h(ElInput, { modelValue: self.dateInput, 'onUpdate:modelValue': function (v) { self.dateInput = v; }, placeholder: '2026-05-25 12:00:00' }), h(ElInput, { modelValue: self.timestampOutput, type: 'textarea', readonly: true, autosize: { minRows: 4, maxRows: 6 }, placeholder: self.labels.output, class: 'ymir-vue-inline-output' })]); } })
          ]);
        }
        return h('div', { class: 'ymir-vue-body' }, [
          this.renderPanel(this.labels.input, this.inputStats, this.input, this.labels.input, false, function (v) { self.input = v; }, '', 12),
          this.renderPanel(this.labels.output, this.outputStats, this.output, this.labels.output, true, function () {}, 'ymir-vue-output', 12)
        ]);
      }
    },
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
  };

  createApp(App).mount(root);
})();
