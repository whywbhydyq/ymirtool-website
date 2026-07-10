/*! Ymir Tool v62 core-tool runtime bundle. */

/* ===== static/script/ymir-vue-core-tool-engines.js ===== */
(function () {
  'use strict';
  var VERSION = '20260607-page-multi-v1';
  if (window.YmirCoreToolEngines && window.YmirCoreToolEngines.version === VERSION) return;

  function utf8Base64Encode(str) {
    var bytes = new TextEncoder().encode(String(str || ''));
    var bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  function utf8Base64Decode(str) {
    var clean = String(str || '').replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
    var pad = clean.length % 4;
    if (pad) clean += new Array(5 - pad).join('=');
    var bin = atob(clean);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
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
    function parseFactor() {
      var value = parsePrimary();
      while (true) {
        skipWhitespace();
        if (source.charAt(index) !== '%') break;
        var next = source.slice(index + 1).replace(/^\s+/, '').charAt(0);
        if (/[0-9.(+-]/.test(next)) break;
        index++;
        value = value / 100;
      }
      return value;
    }
    function parseTerm() {
      var value = parseFactor();
      while (true) { skipWhitespace(); var op = source.charAt(index); if (op !== '*' && op !== '/' && op !== '%') break; index++; var right = parseFactor(); if (op === '*') value *= right; else if (op === '/') value /= right; else value %= right; }
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
    if (!cryptoObj || !cryptoObj.getRandomValues) throw new Error('Secure random generation is not available in this environment.');
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


  window.YmirCoreToolEngines = {
    version: VERSION,
    utf8Base64Encode: utf8Base64Encode,
    utf8Base64Decode: utf8Base64Decode,
    ymirMd5: ymirMd5,
    evaluateBasicExpression: evaluateBasicExpression,
    secureUuid: secureUuid,
    basicJsFormat: basicJsFormat,
    basicJsMinify: basicJsMinify
  };
})();


/* ===== static/script/ymir-vue-core-tools-schema.js ===== */
(function () {
  'use strict';
  var VERSION = '20260531-v58';
  if (window.YmirCoreToolsSchema && window.YmirCoreToolsSchema.version === VERSION) return;

  var labels = {
    en: {
      eyebrow: 'Tool workbench', input: 'Input', output: 'Output', result: 'Result', chars: 'chars', lines: 'lines', ready: 'Ready.', copy: 'Copy result', clear: 'Clear', sample: 'Load sample', local: 'Ready to use', noUpload: 'Clear result flow', copyReady: 'Copy-ready output', copied: 'Copied result to clipboard.', copyFailed: 'Copy failed.', nothing: 'Generate a result before copying.', empty: 'Enter input before running the tool.', statusReady: 'Ready.', format: 'Format', minify: 'Minify', validate: 'Validate', encode: 'Encode', decode: 'Decode', compare: 'Compare', test: 'Test Regex', count: 'Count text', generate: 'Generate', calculate: 'Calculate', now: 'Current time', toDate: 'Timestamp to date', toTimestamp: 'Date to timestamp', expression: 'Expression', timestamp: 'Timestamp', dateInput: 'Date input', original: 'Original text', changed: 'Changed text', pattern: 'Pattern', flags: 'Flags', text: 'Test text', passwordOptions: 'Password options', length: 'Length', uppercase: 'Uppercase', lowercase: 'Lowercase', numbers: 'Numbers', symbols: 'Symbols', countLabel: 'Count', current: 'Current timestamp'
    },
    zh: {
      eyebrow: '工具工作台', input: '输入', output: '输出', result: '结果', chars: '字符', lines: '行', ready: '就绪。', copy: '复制结果', clear: '清空', sample: '载入示例', local: '打开即用', noUpload: '流程清晰', copyReady: '结果可复制', copied: '结果已复制到剪贴板。', copyFailed: '复制失败。', nothing: '请先生成结果再复制。', empty: '请先输入内容。', statusReady: '就绪。', format: '格式化', minify: '压缩', validate: '校验', encode: '编码', decode: '解码', compare: '比较', test: '测试正则', count: '统计文本', generate: '生成', calculate: '计算', now: '当前时间', toDate: '时间戳转日期', toTimestamp: '日期转时间戳', expression: '表达式', timestamp: '时间戳', dateInput: '日期输入', original: '原文本', changed: '新文本', pattern: '表达式', flags: '标记', text: '测试文本', passwordOptions: '密码选项', length: '长度', uppercase: '大写字母', lowercase: '小写字母', numbers: '数字', symbols: '符号', countLabel: '数量', current: '当前时间戳'
    }
  };

  var tools = {
    json: { icon: '{}', category: { en: 'Developer Tool', zh: '开发工具' }, title: { en: 'JSON Formatter & Validator', zh: 'JSON 格式化与校验' }, subtitle: { en: 'Format, minify, validate, and copy JSON output.', zh: '格式化、压缩、校验并复制 JSON 结果。' }, tags: { en: ['Format', 'Validate', 'Copy'], zh: ['格式化', '校验', '复制'] }, mode: 'text', sample: '{\n  "name": "Ymir Tool",\n  "features": ["format", "validate", "copy"],\n  "ready": true\n}', actions: [{ key: 'formatJson', label: 'format', type: 'primary' }, { key: 'minifyJson', label: 'minify' }, { key: 'validateJson', label: 'validate' }] },
    base64: { icon: '64', category: { en: 'Encoding Tool', zh: '编码工具' }, title: { en: 'Base64 Encode & Decode', zh: 'Base64 编码与解码' }, subtitle: { en: 'Encode UTF-8 text to Base64 or decode Base64 back to text.', zh: '将 UTF-8 文本编码为 Base64，或解码 Base64 文本。' }, tags: { en: ['Encode', 'Decode', 'UTF-8'], zh: ['编码', '解码', 'UTF-8'] }, mode: 'text', sample: 'Ymir Tool 支持 UTF-8 文本 Base64 编码。', actions: [{ key: 'encodeBase64', label: 'encode', type: 'primary' }, { key: 'decodeBase64', label: 'decode' }] },
    formatjs: { icon: 'JS', category: { en: 'Code Tool', zh: '代码工具' }, title: { en: 'JavaScript Formatter', zh: 'JavaScript 格式化' }, subtitle: { en: 'Format or lightly minify JavaScript snippets quickly.', zh: '快速格式化或轻量压缩 JavaScript 片段。' }, tags: { en: ['Format', 'Minify', 'Copy'], zh: ['格式化', '压缩', '复制'] }, mode: 'text', sample: 'function hello(name){if(name){console.log("Hello, "+name)}else{console.log("Hello, Ymir Tool")}}', actions: [{ key: 'formatJs', label: 'format', type: 'primary' }, { key: 'minifyJs', label: 'minify' }] },
    urlencode: { icon: '%', category: { en: 'Encoding Tool', zh: '编码工具' }, title: { en: 'URL Encoder & Decoder', zh: 'URL 编码与解码' }, subtitle: { en: 'Encode URL components or decode percent-encoded strings.', zh: '编码 URL 组件或解码百分号编码字符串。' }, tags: { en: ['Encode', 'Decode', 'Query'], zh: ['编码', '解码', '查询串'] }, mode: 'text', sample: 'https://ymirtool.com/search?q=中文 test&source=工具箱', actions: [{ key: 'encodeUrl', label: 'encode', type: 'primary' }, { key: 'decodeUrl', label: 'decode' }] },
    textdiff: { icon: 'Δ', category: { en: 'Text Tool', zh: '文本工具' }, title: { en: 'Text Diff Checker', zh: '文本差异比较' }, subtitle: { en: 'Compare two text blocks and review line-level differences.', zh: '比较两段文本并查看行级差异。' }, tags: { en: ['Compare', 'Lines', 'Copy'], zh: ['比较', '行差异', '复制'] }, mode: 'diff', sample: 'Project scope:\n- Landing page design\n- 2 revision rounds\n- Delivery by Friday', secondarySample: 'Project scope:\n- Landing page design\n- 3 revision rounds\n- Delivery by Monday\n- Final handoff files', actions: [{ key: 'compareText', label: 'compare', type: 'primary' }] },
    regex: { icon: '.*', category: { en: 'Developer Tool', zh: '开发工具' }, title: { en: 'Regex Tester', zh: '正则表达式测试' }, subtitle: { en: 'Test regular expressions with global, case-insensitive, and multiline flags.', zh: '使用全局、忽略大小写和多行标记测试正则表达式。' }, tags: { en: ['Match', 'Flags', 'Debug'], zh: ['匹配', '标记', '调试'] }, mode: 'regex', patternSample: '^[\\w.-]+@[\\w.-]+\\.[A-Za-z]{2,}$', sample: 'hello@example.com\nnot an email\nteam@ymirtool.com', actions: [{ key: 'testRegex', label: 'test', type: 'primary' }] },
    txtcount: { icon: 'Aa', category: { en: 'Text Tool', zh: '文本工具' }, title: { en: 'Text Counter', zh: '文本统计' }, subtitle: { en: 'Count characters, words, lines, paragraphs, and bytes.', zh: '统计字符、单词、行数、段落和字节数。' }, tags: { en: ['Characters', 'Words', 'Bytes'], zh: ['字符', '单词', '字节'] }, mode: 'metrics', sample: 'Ymir Tool helps you count words, lines, characters, and paragraphs.\n\n这是一段中文示例文本，用于检查字符统计。', actions: [{ key: 'countText', label: 'count', type: 'primary' }], startup: 'countText' },
    md5: { icon: '#', category: { en: 'Hash Tool', zh: '哈希工具' }, title: { en: 'MD5 Hash Generator', zh: 'MD5 哈希生成器' }, subtitle: { en: 'Generate 32-character and 16-character MD5 hash variants.', zh: '生成 32 位和 16 位 MD5 哈希变体。' }, tags: { en: ['32-bit', '16-bit', 'Copy'], zh: ['32 位', '16 位', '复制'] }, mode: 'generator', generator: 'md5', sample: 'hello world', actions: [{ key: 'generateMd5', label: 'generate', type: 'primary' }] },
    guid: { icon: 'ID', category: { en: 'Generator Tool', zh: '生成器' }, title: { en: 'GUID / UUID Generator', zh: 'GUID / UUID 生成器' }, subtitle: { en: 'Generate one or more random UUID v4 identifiers.', zh: '生成一个或多个随机 UUID v4 标识符。' }, tags: { en: ['UUID v4', 'Secure random', 'Copy'], zh: ['UUID v4', '安全随机', '复制'] }, mode: 'generator', generator: 'guid', actions: [{ key: 'generateGuid', label: 'generate', type: 'primary' }], startup: 'generateGuid' },
    password: { icon: '🔒', category: { en: 'Generator Tool', zh: '生成器' }, title: { en: 'Password Generator', zh: '密码生成器' }, subtitle: { en: 'Generate random passwords with length and character-set controls.', zh: '按长度和字符集选项生成随机密码。' }, tags: { en: ['Length', 'Character sets', 'Copy'], zh: ['长度', '字符集', '复制'] }, mode: 'generator', generator: 'password', actions: [{ key: 'generatePassword', label: 'generate', type: 'primary' }], startup: 'generatePassword' },
    calculator: { icon: '=', category: { en: 'Calculator Tool', zh: '计算工具' }, title: { en: 'Online Calculator', zh: '在线计算器' }, subtitle: { en: 'Run quick calculations with numbers, parentheses, percentages, and operators.', zh: '用数字、括号、百分号和基本运算符快速计算。' }, tags: { en: ['Calculate', 'Copy', 'Copy-ready'], zh: ['计算', '复制', '结果可复制'] }, mode: 'calculator', calcSample: '(128 + 256) / 3', actions: [{ key: 'calculate', label: 'calculate', type: 'primary' }] },
    unixtime: { icon: 'T', category: { en: 'Time Tool', zh: '时间工具' }, title: { en: 'Unix Timestamp Converter', zh: 'Unix 时间戳转换器' }, subtitle: { en: 'Convert Unix timestamps to dates and dates back to seconds or milliseconds.', zh: '在 Unix 时间戳和可读日期之间转换。' }, tags: { en: ['Seconds', 'Milliseconds', 'ISO'], zh: ['秒', '毫秒', 'ISO'] }, mode: 'time', actions: [{ key: 'loadCurrentTime', label: 'now', type: 'primary' }, { key: 'timestampToDate', label: 'toDate' }, { key: 'dateToTimestamp', label: 'toTimestamp' }], startup: 'loadCurrentTime' }
  };

  window.YmirCoreToolsSchema = { version: VERSION, labels: labels, tools: tools, defaultSlug: 'json' };
})();

