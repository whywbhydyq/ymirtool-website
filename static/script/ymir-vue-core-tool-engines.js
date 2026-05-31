(function () {
  'use strict';
  var VERSION = '20260531-v49';
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
