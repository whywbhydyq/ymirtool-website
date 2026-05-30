(function () {
  'use strict';

  var radix = 62;

  function encodeNumber(num) {
    return (num < radix ? '' : encodeNumber(parseInt(num / radix, 10))) + ((num = num % radix) > 35 ? String.fromCharCode(num + 29) : num.toString(36));
  }

  function quoteSingle(text) {
    return String(text == null ? '' : text)
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/[\r\n]+/g, '\\n');
  }

  function splitArgs(text) {
    var args = [];
    var buf = '';
    var quote = '';
    var escaped = false;
    var depth = 0;
    for (var i = 0; i < text.length; i += 1) {
      var ch = text.charAt(i);
      if (escaped) {
        buf += ch;
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        buf += ch;
        escaped = true;
        continue;
      }
      if (quote) {
        buf += ch;
        if (ch === quote) quote = '';
        continue;
      }
      if (ch === '"' || ch === "'") {
        quote = ch;
        buf += ch;
        continue;
      }
      if (ch === '(' || ch === '[' || ch === '{') depth += 1;
      if (ch === ')' || ch === ']' || ch === '}') depth -= 1;
      if (ch === ',' && depth === 0) {
        args.push(buf.trim());
        buf = '';
        continue;
      }
      buf += ch;
    }
    if (buf.trim()) args.push(buf.trim());
    return args;
  }

  function unquote(text) {
    var raw = String(text || '').trim();
    if ((raw.charAt(0) === '"' && raw.charAt(raw.length - 1) === '"') ||
        (raw.charAt(0) === "'" && raw.charAt(raw.length - 1) === "'")) {
      return raw.slice(1, -1)
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\(['"\\])/g, '$1');
    }
    return raw;
  }

  function unpackKeywordArg(arg) {
    var match = String(arg || '').match(/^(['"])([\s\S]*)\1\.split\(\s*['"]\|['"]\s*\)$/);
    return match ? unquote(match[1] + match[2] + match[1]).split('|') : [];
  }

  function findInvocationArgs(code) {
    var marker = "'.split('|')";
    var markerIndex = code.indexOf(marker);
    if (markerIndex < 0) return null;
    var close = code.indexOf(')', markerIndex + marker.length);
    var depth = 0;
    for (; close < code.length; close += 1) {
      var ch = code.charAt(close);
      if (ch === '(') depth += 1;
      if (ch === ')') {
        if (depth === 0) break;
        depth -= 1;
      }
    }
    var open = code.lastIndexOf('(', markerIndex);
    if (open < 0) return null;
    return code.slice(open + 1, close);
  }

  function safeUnpack(code) {
    var argsText = findInvocationArgs(code);
    if (!argsText) return null;
    var args = splitArgs(argsText);
    if (args.length < 4) return null;
    var packed = unquote(args[0]);
    var base = parseInt(args[1], 10) || 62;
    var count = parseInt(args[2], 10) || 0;
    var keywords = unpackKeywordArg(args[3]);

    function encodeBase(num) {
      return (num < base ? '' : encodeBase(parseInt(num / base, 10))) + ((num = num % base) > 35 ? String.fromCharCode(num + 29) : num.toString(36));
    }

    while (count--) {
      if (keywords[count]) {
        packed = packed.replace(new RegExp('\\b' + encodeBase(count) + '\\b', 'g'), keywords[count]);
      }
    }
    return packed;
  }

  function encode() {
    var code = $('#content').val();
    code = code.replace(/[\r\n]+/g, '').replace(/'/g, "\\'");
    var tmp = code.match(/\b(\w+)\b/g) || [];
    tmp.sort();
    var dict = [];
    var last = '';
    for (var i = 0; i < tmp.length; i += 1) {
      if (tmp[i] !== last) dict.push(last = tmp[i]);
    }
    for (i = 0; i < dict.length; i += 1) {
      var token = encodeNumber(i);
      code = code.replace(new RegExp('\\b' + dict[i] + '\\b', 'g'), token);
      if (token === dict[i]) dict[i] = '';
    }
    var prefix = 'ev' + 'al(function(p,a,c,k,e,d){';
    var result = prefix + "e=function(c){return(c<a?'':e(parseInt(c/a,10)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};" +
      "while(c--){if(k[c])p=p.replace(new RegExp('\\\\b'+e(c)+'\\\\b','g'),k[c])}return p}" +
      "('" + quoteSingle(code) + "'," + radix + ',' + dict.length + ",'" + quoteSingle(dict.join('|')) + "'.split('|'),0,{}))";
    hightout(result);
  }

  function decode() {
    var code = $('#content').val();
    var unpacked = safeUnpack(code);
    if (unpacked != null) {
      hightout(js_beautify(unpacked, 4, ' '));
    } else {
      pcjson_com_msg($('#content'), '找不到符合条件的加密内容，无法解密');
    }
  }

  $('#BtnAddEval').click(function () {
    if ($('#content').val() !== '') encode();
    else pcjson_com_msg($('#content'), '请输入加密内容');
  });

  $('#BtnClearEval').click(function () {
    if ($('#content').val() !== '') decode();
    else pcjson_com_msg($('#content'), '请输入解密内容');
  });

  $('#BtnClear').click(function () {
    $('#content').val('');
    var result = document.getElementById('result');
    if (result) result.textContent = '';
  });
}());
