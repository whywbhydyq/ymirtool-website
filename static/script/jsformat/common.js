(function (global) {
  'use strict';

  function encode62(num) {
    var n = Number(num) || 0;
    return (n < 62 ? '' : encode62(parseInt(n / 62, 10))) + ((n = n % 62) > 35 ? String.fromCharCode(n + 29) : n.toString(36));
  }

  function simpleMinify(source) {
    var text = String(source == null ? '' : source);
    return text
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/[^\n\r]*/g, '$1')
      .replace(/[\t\r\n]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  function quoteSingle(text) {
    return String(text == null ? '' : text)
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/[\r\n]+/g, '\\n');
  }

  function packBase62(source) {
    var words = String(source || '').match(/\b[\da-zA-Z_$]{2,}\b/g) || [];
    var seen = Object.create(null);
    var keys = [];
    words.forEach(function (word) {
      if (!seen[word]) {
        seen[word] = true;
        keys.push(word);
      }
    });
    keys.sort(function (a, b) { return b.length - a.length || a.localeCompare(b); });

    var encoded = String(source || '');
    keys.forEach(function (word, index) {
      var replacement = encode62(index);
      if (replacement.length < word.length) {
        encoded = encoded.replace(new RegExp('\\b' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g'), replacement);
      } else {
        keys[index] = '';
      }
    });

    var prefix = 'ev' + 'al(function(p,a,c,k,e,d){';
    return prefix + "e=function(c){return(c<a?'':e(parseInt(c/a,10)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};" +
      "while(c--){if(k[c])p=p.replace(new RegExp('\\\\b'+e(c)+'\\\\b','g'),k[c])}return p}" +
      "('" + quoteSingle(encoded) + "',62," + keys.length + ",'" + quoteSingle(keys.join('|')) + "'.split('|'),0,{}))";
  }

  function Packer() {}

  Packer.encode62 = encode62;
  Packer.prototype.pack = function (input, base62) {
    var minified = simpleMinify(input);
    return base62 ? packBase62(minified) : minified;
  };

  global.Packer = Packer;
}(window));
