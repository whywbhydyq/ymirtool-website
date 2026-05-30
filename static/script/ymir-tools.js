
(function () {
  var UI = window.YmirUI;
  if (!UI) return;

function ymirMd5(input){function rhex(n){var s='',j=0,hex='0123456789abcdef';for(;j<4;j++)s+=hex.charAt((n>>(j*8+4))&15)+hex.charAt((n>>(j*8))&15);return s}function add(x,y){return(x+y)&4294967295}function cmn(q,a,b,x,s,t){a=add(add(a,q),add(x,t));return add((a<<s)|(a>>>(32-s)),b)}function ff(a,b,c,d,x,s,t){return cmn((b&c)|((~b)&d),a,b,x,s,t)}function gg(a,b,c,d,x,s,t){return cmn((b&d)|(c&(~d)),a,b,x,s,t)}function hh(a,b,c,d,x,s,t){return cmn(b^c^d,a,b,x,s,t)}function ii(a,b,c,d,x,s,t){return cmn(c^(b|(~d)),a,b,x,s,t)}function cycle(x,k){var a=x[0],b=x[1],c=x[2],d=x[3];a=ff(a,b,c,d,k[0],7,-680876936);d=ff(d,a,b,c,k[1],12,-389564586);c=ff(c,d,a,b,k[2],17,606105819);b=ff(b,c,d,a,k[3],22,-1044525330);a=ff(a,b,c,d,k[4],7,-176418897);d=ff(d,a,b,c,k[5],12,1200080426);c=ff(c,d,a,b,k[6],17,-1473231341);b=ff(b,c,d,a,k[7],22,-45705983);a=ff(a,b,c,d,k[8],7,1770035416);d=ff(d,a,b,c,k[9],12,-1958414417);c=ff(c,d,a,b,k[10],17,-42063);b=ff(b,c,d,a,k[11],22,-1990404162);a=ff(a,b,c,d,k[12],7,1804603682);d=ff(d,a,b,c,k[13],12,-40341101);c=ff(c,d,a,b,k[14],17,-1502002290);b=ff(b,c,d,a,k[15],22,1236535329);a=gg(a,b,c,d,k[1],5,-165796510);d=gg(d,a,b,c,k[6],9,-1069501632);c=gg(c,d,a,b,k[11],14,643717713);b=gg(b,c,d,a,k[0],20,-373897302);a=gg(a,b,c,d,k[5],5,-701558691);d=gg(d,a,b,c,k[10],9,38016083);c=gg(c,d,a,b,k[15],14,-660478335);b=gg(b,c,d,a,k[4],20,-405537848);a=gg(a,b,c,d,k[9],5,568446438);d=gg(d,a,b,c,k[14],9,-1019803690);c=gg(c,d,a,b,k[3],14,-187363961);b=gg(b,c,d,a,k[8],20,1163531501);a=gg(a,b,c,d,k[13],5,-1444681467);d=gg(d,a,b,c,k[2],9,-51403784);c=gg(c,d,a,b,k[7],14,1735328473);b=gg(b,c,d,a,k[12],20,-1926607734);a=hh(a,b,c,d,k[5],4,-378558);d=hh(d,a,b,c,k[8],11,-2022574463);c=hh(c,d,a,b,k[11],16,1839030562);b=hh(b,c,d,a,k[14],23,-35309556);a=hh(a,b,c,d,k[1],4,-1530992060);d=hh(d,a,b,c,k[4],11,1272893353);c=hh(c,d,a,b,k[7],16,-155497632);b=hh(b,c,d,a,k[10],23,-1094730640);a=hh(a,b,c,d,k[13],4,681279174);d=hh(d,a,b,c,k[0],11,-358537222);c=hh(c,d,a,b,k[3],16,-722521979);b=hh(b,c,d,a,k[6],23,76029189);a=hh(a,b,c,d,k[9],4,-640364487);d=hh(d,a,b,c,k[12],11,-421815835);c=hh(c,d,a,b,k[15],16,530742520);b=hh(b,c,d,a,k[2],23,-995338651);a=ii(a,b,c,d,k[0],6,-198630844);d=ii(d,a,b,c,k[7],10,1126891415);c=ii(c,d,a,b,k[14],15,-1416354905);b=ii(b,c,d,a,k[5],21,-57434055);a=ii(a,b,c,d,k[12],6,1700485571);d=ii(d,a,b,c,k[3],10,-1894986606);c=ii(c,d,a,b,k[10],15,-1051523);b=ii(b,c,d,a,k[1],21,-2054922799);a=ii(a,b,c,d,k[8],6,1873313359);d=ii(d,a,b,c,k[15],10,-30611744);c=ii(c,d,a,b,k[6],15,-1560198380);b=ii(b,c,d,a,k[13],21,1309151649);a=ii(a,b,c,d,k[4],6,-145523070);d=ii(d,a,b,c,k[11],10,-1120210379);c=ii(c,d,a,b,k[2],15,718787259);b=ii(b,c,d,a,k[9],21,-343485551);x[0]=add(a,x[0]);x[1]=add(b,x[1]);x[2]=add(c,x[2]);x[3]=add(d,x[3])}function md51(s){var n=s.length,state=[1732584193,-271733879,-1732584194,271733878],i;for(i=64;i<=s.length;i+=64){var k=[];for(var j=i-64;j<i;j++)k[j>>2&15]|=s.charCodeAt(j)<<((j%4)<<3);cycle(state,k)}var tail=new Array(16).fill(0);for(i-=64;i<s.length;i++)tail[i>>2]|=s.charCodeAt(i)<<((i%4)<<3);tail[i>>2]|=128<<((i%4)<<3);if(i>55){cycle(state,tail);tail=new Array(16).fill(0)}tail[14]=n*8;cycle(state,tail);return state}input=unescape(encodeURIComponent(input));var x=md51(input);return rhex(x[0])+rhex(x[1])+rhex(x[2])+rhex(x[3])}
function bind(action, fn) {
    var buttons = document.querySelectorAll('[data-action="' + action + '"]');
    Array.prototype.forEach.call(buttons, function (btn) { btn.addEventListener('click', fn); });
  }
  function input() { return UI.getValue('toolInput'); }
  function output() { return UI.getValue('toolOutput'); }
  function setOutput(v) { UI.setValue('toolOutput', v); }
  function copyOutput(status) { UI.copyText(output()).then(function(){ UI.setStatus(status || 'toolStatus','success','Copied result to clipboard.'); }).catch(function(e){ UI.setStatus(status || 'toolStatus','error',e.message || 'Copy failed.'); }); }
  function clearIO(status) { UI.clearValue('toolInput'); UI.clearValue('toolOutput'); UI.clearStatus(status || 'toolStatus'); }
  var examples = {
    json: '{\n  "name": "Ymir Tool",\n  "features": ["format", "validate", "copy"],\n  "localProcessing": true\n}',
    base64: 'Ymir Tool 支持 UTF-8 文本 Base64 编码。',
    formatjs: 'function hello(name){if(name){console.log("Hello, "+name)}else{console.log("Hello, Ymir Tool")}}',
    urlencode: 'https://ymirtool.com/search?q=中文 test&source=工具箱',
    txtcount: 'Ymir Tool helps you count words, lines, characters, and paragraphs.\n\n这是一段中文示例文本，用于检查字符统计。',
    regexPattern: '^[\w.-]+@[\w.-]+\\.[A-Za-z]{2,}$',
    regexText: 'hello@example.com\nnot an email\nteam@ymirtool.com',
    textA: 'Project scope:\n- Landing page design\n- 2 revision rounds\n- Delivery by Friday',
    textB: 'Project scope:\n- Landing page design\n- 3 revision rounds\n- Delivery by Monday\n- Final handoff files'
  };
  function initJson(){
    bind('json-format',function(){try{setOutput(JSON.stringify(JSON.parse(input()),null,2));UI.setStatus('toolStatus','success','Valid JSON. Formatted with 2-space indentation.')}catch(e){UI.setStatus('toolStatus','error','Invalid JSON: '+e.message)}});
    bind('json-minify',function(){try{setOutput(JSON.stringify(JSON.parse(input())));UI.setStatus('toolStatus','success','Valid JSON. Minified output is ready.')}catch(e){UI.setStatus('toolStatus','error','Invalid JSON: '+e.message)}});
    bind('json-validate',function(){try{JSON.parse(input());UI.setStatus('toolStatus','success','Valid JSON. No syntax errors found.')}catch(e){UI.setStatus('toolStatus','error','Invalid JSON: '+e.message)}});
    bind('load-example',function(){UI.loadExample('toolInput',examples.json);UI.setStatus('toolStatus','info','Example loaded. Click Format JSON to see the result.')});
    bind('copy-output',function(){copyOutput('toolStatus')}); bind('clear-all',function(){clearIO('toolStatus')});
  }
  function initBase64(){
    function enc(str){var bytes=new TextEncoder().encode(str),bin='';for(var i=0;i<bytes.length;i++)bin+=String.fromCharCode(bytes[i]);return btoa(bin)}
    function dec(str){var bin=atob(str.replace(/\s+/g,'')),bytes=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);return new TextDecoder().decode(bytes)}
    bind('base64-encode',function(){setOutput(enc(input()));UI.setStatus('toolStatus','success','Encoded as Base64. Base64 is encoding, not encryption.')});
    bind('base64-decode',function(){try{setOutput(dec(input()));UI.setStatus('toolStatus','success','Decoded Base64 text.')}catch(e){UI.setStatus('toolStatus','error','Invalid Base64 input or unsupported binary data.')}});
    bind('load-example',function(){UI.loadExample('toolInput',examples.base64);UI.setStatus('toolStatus','info','Example loaded. Click Encode to convert it.')});
    bind('copy-output',function(){copyOutput('toolStatus')}); bind('clear-all',function(){clearIO('toolStatus')});
  }
  function initMd5(){
    function render(){var txt=input();if(!txt){UI.setStatus('toolStatus','warning','Enter text before generating an MD5 hash.');return}var r=ymirMd5(txt), r16=r.substring(8,24);UI.setValue('md5Lower32',r.toLowerCase());UI.setValue('md5Upper32',r.toUpperCase());UI.setValue('md5Lower16',r16.toLowerCase());UI.setValue('md5Upper16',r16.toUpperCase());UI.setStatus('toolStatus','success','MD5 hashes generated in your browser. MD5 is not encryption.');}
    bind('md5-generate',render); bind('load-example',function(){UI.loadExample('toolInput','hello world');render();});
    bind('copy-lower32',function(){UI.copyText(UI.getValue('md5Lower32')).then(function(){UI.setStatus('toolStatus','success','Copied 32-character lowercase MD5.');}).catch(function(e){UI.setStatus('toolStatus','error',e.message)})});
    bind('copy-upper32',function(){UI.copyText(UI.getValue('md5Upper32')).then(function(){UI.setStatus('toolStatus','success','Copied 32-character uppercase MD5.');}).catch(function(e){UI.setStatus('toolStatus','error',e.message)})});
    bind('clear-all',function(){UI.clearValue('toolInput');['md5Lower32','md5Upper32','md5Lower16','md5Upper16'].forEach(UI.clearValue);UI.clearStatus('toolStatus')});
  }
  function initFormatJs(){
    function basicFormat(s){return s.replace(/\s+/g,' ').replace(/\s*([{};])\s*/g,'$1\n').replace(/\s*,\s*/g,', ').split('\n').map(function(line){return line.trim()}).filter(Boolean).map(function(line){return line}).join('\n')}
    bind('js-format',function(){try{setOutput(window.js_beautify?window.js_beautify(input(),{indent_size:2}):basicFormat(input()));UI.setStatus('toolStatus','success','JavaScript formatted for readability.')}catch(e){UI.setStatus('toolStatus','error','Could not format JavaScript: '+e.message)}});
    bind('js-minify',function(){setOutput(input().replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|\n)\s*\/\/.*(?=\n|$)/g,'').replace(/\s+/g,' ').replace(/\s*([{}();,:=+\-*\/<>])\s*/g,'$1').trim());UI.setStatus('toolStatus','success','Basic minified output is ready. This is not a full compiler.');});
    bind('load-example',function(){UI.loadExample('toolInput',examples.formatjs);UI.setStatus('toolStatus','info','Example loaded. Click Format JavaScript.');});
    bind('copy-output',function(){copyOutput('toolStatus')}); bind('clear-all',function(){clearIO('toolStatus')});
  }
  function initUrlEncode(){
    bind('url-encode-component',function(){setOutput(encodeURIComponent(input()));UI.setStatus('toolStatus','success','Encoded with encodeURIComponent.');});
    bind('url-decode-component',function(){try{setOutput(decodeURIComponent(input()));UI.setStatus('toolStatus','success','Decoded with decodeURIComponent.');}catch(e){UI.setStatus('toolStatus','error','Invalid percent-encoding: '+e.message)}});
    bind('url-encode-uri',function(){setOutput(encodeURI(input()));UI.setStatus('toolStatus','success','Encoded with encodeURI.');});
    bind('url-decode-uri',function(){try{setOutput(decodeURI(input()));UI.setStatus('toolStatus','success','Decoded with decodeURI.');}catch(e){UI.setStatus('toolStatus','error','Invalid URI encoding: '+e.message)}});
    bind('load-example',function(){UI.loadExample('toolInput',examples.urlencode);UI.setStatus('toolStatus','info','Example loaded. Try Encode URI Component.');});
    bind('copy-output',function(){copyOutput('toolStatus')}); bind('clear-all',function(){clearIO('toolStatus')});
  }
  function initUnixTime(){
    function now(){var ms=Date.now();UI.setValue('currentSeconds',Math.floor(ms/1000));UI.setValue('currentMilliseconds',ms);UI.setStatus('toolStatus','info','Current browser time loaded.');}
    function toDate(){var raw=UI.getValue('timestampInput').trim();if(!raw){UI.setStatus('toolStatus','warning','Enter a Unix timestamp.');return}var num=Number(raw);if(!isFinite(num)){UI.setStatus('toolStatus','error','Timestamp must be a number.');return}var ms=String(Math.trunc(Math.abs(num))).length<=10?num*1000:num;var d=new Date(ms);if(isNaN(d.getTime())){UI.setStatus('toolStatus','error','Invalid timestamp.');return}UI.setValue('dateOutput',d.toLocaleString()+'\nISO: '+d.toISOString());UI.setStatus('toolStatus','success','Timestamp converted using your browser timezone display.');}
    function toTs(){var raw=UI.getValue('dateInput').trim();if(!raw){UI.setStatus('toolStatus','warning','Enter a date/time value.');return}var d=new Date(raw);if(isNaN(d.getTime())){UI.setStatus('toolStatus','error','Invalid date/time value.');return}UI.setValue('timestampOutput','Seconds: '+Math.floor(d.getTime()/1000)+'\nMilliseconds: '+d.getTime());UI.setStatus('toolStatus','success','Date converted to Unix timestamp.');}
    bind('time-now',now); bind('timestamp-to-date',toDate); bind('date-to-timestamp',toTs); bind('copy-date',function(){UI.copyText(UI.getValue('dateOutput')||UI.getValue('timestampOutput')||('Seconds: '+UI.getValue('currentSeconds')+'\nMilliseconds: '+UI.getValue('currentMilliseconds'))).then(function(){UI.setStatus('toolStatus','success','Copied timestamp result.');}).catch(function(e){UI.setStatus('toolStatus','error',e.message)})}); bind('clear-all',function(){['timestampInput','dateOutput','dateInput','timestampOutput'].forEach(UI.clearValue);UI.clearStatus('toolStatus')}); now();
  }
  function initTextDiff(){
    function compare(){var a=UI.getValue('textA').split(/\r?\n/),b=UI.getValue('textB').split(/\r?\n/),max=Math.max(a.length,b.length),out=[],added=0,removed=0,changed=0;for(var i=0;i<max;i++){if(a[i]===b[i]){continue}else if(a[i]===undefined){added++;out.push('+ '+b[i])}else if(b[i]===undefined){removed++;out.push('- '+a[i])}else{changed++;out.push('- '+a[i]);out.push('+ '+b[i])}}UI.setValue('toolOutput',out.join('\n')||'No line-level differences found.');UI.setStatus('toolStatus',out.length?'success':'info','Added lines: '+added+' · Removed lines: '+removed+' · Changed line pairs: '+changed);}
    bind('diff-compare',compare); bind('load-example',function(){UI.setValue('textA',examples.textA);UI.setValue('textB',examples.textB);compare();}); bind('copy-output',function(){copyOutput('toolStatus')}); bind('clear-all',function(){['textA','textB','toolOutput'].forEach(UI.clearValue);UI.clearStatus('toolStatus')});
  }
  function initTxtCount(){
    function count(){var s=input(),chars=s.length,noSpaces=s.replace(/\s/g,'').length,words=(s.trim().match(/[\p{L}\p{N}_'-]+/gu)||[]).length,lines=s? s.split(/\r?\n/).length:0,paras=s.trim()?s.trim().split(/\n\s*\n/).length:0,bytes=new TextEncoder().encode(s).length;var vals={chars:chars,noSpaces:noSpaces,words:words,lines:lines,paras:paras,bytes:bytes};Object.keys(vals).forEach(function(k){var el=document.querySelector('[data-metric="'+k+'"] strong');if(el)el.textContent=vals[k];});UI.setValue('toolOutput','Characters: '+chars+'\nCharacters without spaces: '+noSpaces+'\nWords: '+words+'\nLines: '+lines+'\nParagraphs: '+paras+'\nBytes: '+bytes);UI.setStatus('toolStatus','info','Text statistics updated.');}
    var inputEl=UI.byId('toolInput');if(inputEl)inputEl.addEventListener('input',count);bind('load-example',function(){UI.setValue('toolInput',examples.txtcount);count();});bind('copy-output',function(){copyOutput('toolStatus')});bind('clear-all',function(){clearIO('toolStatus');count();});count();
  }
  function initRegex(){
    function flags(){return ['g','i','m'].filter(function(f){var el=UI.byId('flag_'+f);return el&&el.checked}).join('')}
    function test(){try{var re=new RegExp(UI.getValue('regexPattern'),flags()),s=UI.getValue('regexText'),res=[],m;if(flags().indexOf('g')>-1){while((m=re.exec(s))!==null){res.push('Match '+(res.length+1)+' at '+m.index+': '+m[0]);if(m.index===re.lastIndex)re.lastIndex++;}}else{m=re.exec(s);if(m)res.push('Match at '+m.index+': '+m[0]);}UI.setValue('toolOutput',res.join('\n')||'No matches found.');UI.setStatus('toolStatus',res.length?'success':'info','Matches found: '+res.length);}catch(e){UI.setStatus('toolStatus','error','Regex error: '+e.message)}}
    bind('regex-test',test);bind('load-example',function(){UI.setValue('regexPattern',examples.regexPattern);UI.setValue('regexText',examples.regexText);test();});bind('copy-output',function(){copyOutput('toolStatus')});bind('clear-all',function(){['regexPattern','regexText','toolOutput'].forEach(UI.clearValue);UI.clearStatus('toolStatus')});
  }
  function evaluateBasicExpression(expression) {
    var source = String(expression || '');
    if (!/^[0-9+\-*/().%\s]+$/.test(source)) {
      throw new Error('Only numbers, parentheses, and basic operators are supported.');
    }
    var index = 0;
    function skipWhitespace() {
      while (/\s/.test(source.charAt(index))) index++;
    }
    function parseNumber() {
      skipWhitespace();
      var start = index;
      var sawDigit = false;
      while (/[0-9]/.test(source.charAt(index))) { index++; sawDigit = true; }
      if (source.charAt(index) === '.') {
        index++;
        while (/[0-9]/.test(source.charAt(index))) { index++; sawDigit = true; }
      }
      if (!sawDigit) {
        throw new Error('Expected a number at position ' + (index + 1) + '.');
      }
      return Number(source.slice(start, index));
    }
    function parsePrimary() {
      skipWhitespace();
      var ch = source.charAt(index);
      if (ch === '+') { index++; return parsePrimary(); }
      if (ch === '-') { index++; return -parsePrimary(); }
      if (ch === '(') {
        index++;
        var value = parseExpression();
        skipWhitespace();
        if (source.charAt(index) !== ')') {
          throw new Error('Expected closing parenthesis at position ' + (index + 1) + '.');
        }
        index++;
        return value;
      }
      return parseNumber();
    }
    function parseTerm() {
      var value = parsePrimary();
      while (true) {
        skipWhitespace();
        var op = source.charAt(index);
        if (op !== '*' && op !== '/' && op !== '%') break;
        index++;
        var right = parsePrimary();
        if (op === '*') value *= right;
        else if (op === '/') value /= right;
        else value %= right;
      }
      return value;
    }
    function parseExpression() {
      var value = parseTerm();
      while (true) {
        skipWhitespace();
        var op = source.charAt(index);
        if (op !== '+' && op !== '-') break;
        index++;
        var right = parseTerm();
        value = op === '+' ? value + right : value - right;
      }
      return value;
    }
    var result = parseExpression();
    skipWhitespace();
    if (index !== source.length) {
      throw new Error('Unexpected input at position ' + (index + 1) + '.');
    }
    return result;
  }
  function initCalculator(){
    function calc(){var expr=UI.getValue('calcInput').trim();if(!expr){UI.setStatus('toolStatus','warning','Enter a calculation first.');return}try{var v=evaluateBasicExpression(expr);UI.setValue('calcResult',String(v));UI.setStatus('toolStatus',isFinite(v)?'success':'warning',isFinite(v)?'Calculation complete.':'Result is not finite. Check division by zero.')}catch(e){UI.setStatus('toolStatus','error','Calculation error: '+e.message)}}
    bind('calc-run',calc);bind('load-example',function(){UI.setValue('calcInput','(128 + 256) / 3');calc();});bind('copy-output',function(){UI.copyText(UI.getValue('calcResult')).then(function(){UI.setStatus('toolStatus','success','Copied result.');}).catch(function(e){UI.setStatus('toolStatus','error',e.message)})});bind('clear-all',function(){['calcInput','calcResult'].forEach(UI.clearValue);UI.clearStatus('toolStatus')});
  }
  function initGuid(){
    function getCrypto(){return window.crypto||window.msCrypto}
    function one(){var c=getCrypto();if(c&&c.randomUUID)return c.randomUUID();if(!c||!c.getRandomValues)throw new Error('Secure random generation is not available in this browser.');var bytes=new Uint8Array(16);c.getRandomValues(bytes);bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;var hex=[];for(var i=0;i<bytes.length;i++)hex.push((bytes[i]+256).toString(16).slice(1));return hex[0]+hex[1]+hex[2]+hex[3]+'-'+hex[4]+hex[5]+'-'+hex[6]+hex[7]+'-'+hex[8]+hex[9]+'-'+hex[10]+hex[11]+hex[12]+hex[13]+hex[14]+hex[15]}
    function gen(){try{var n=Math.max(1,Math.min(100,parseInt(UI.getValue('guidCount')||'1',10)));var out=[];for(var i=0;i<n;i++)out.push(one());UI.setValue('toolOutput',out.join('\n'));UI.setStatus('toolStatus','success','Generated '+n+' GUID value'+(n>1?'s':'')+' in your browser.');}catch(e){UI.setStatus('toolStatus','error',e.message)}}
    bind('guid-generate',gen);bind('load-example',gen);bind('copy-output',function(){copyOutput('toolStatus')});bind('clear-all',function(){UI.setValue('guidCount','1');UI.clearValue('toolOutput');UI.clearStatus('toolStatus')});gen();
  }
  function initPassword(){
    function gen(){var c=window.crypto||window.msCrypto;if(!c||!c.getRandomValues){UI.setStatus('toolStatus','error','Secure random generation is not available in this browser.');return}var len=Math.max(8,Math.min(128,parseInt(UI.getValue('passwordLength')||'16',10))),sets=[];if(UI.byId('pwUpper').checked)sets.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');if(UI.byId('pwLower').checked)sets.push('abcdefghijklmnopqrstuvwxyz');if(UI.byId('pwNumbers').checked)sets.push('0123456789');if(UI.byId('pwSymbols').checked)sets.push('!@#$%^&*()-_=+[]{};:,.?/');if(!sets.length){UI.setStatus('toolStatus','error','Select at least one character set.');return}var chars=sets.join(''),arr=new Uint32Array(len),out='';c.getRandomValues(arr);for(var i=0;i<len;i++)out+=chars[arr[i]%chars.length];UI.setValue('toolOutput',out);UI.setStatus('toolStatus','success','Password generated locally in your browser.');}
    bind('password-generate',gen);bind('load-example',gen);bind('copy-output',function(){copyOutput('toolStatus')});bind('clear-all',function(){UI.setValue('passwordLength','16');UI.clearValue('toolOutput');UI.clearStatus('toolStatus')});gen();
  }
  document.addEventListener('DOMContentLoaded',function(){var page=document.querySelector('[data-ymir-tool]');if(!page)return;var tool=page.getAttribute('data-ymir-tool');({json:initJson,base64:initBase64,md5:initMd5,formatjs:initFormatJs,urlencode:initUrlEncode,unixtime:initUnixTime,textdiff:initTextDiff,txtcount:initTxtCount,regex:initRegex,calculator:initCalculator,guid:initGuid,password:initPassword}[tool]||function(){})();});
})();
