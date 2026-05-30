(function () {
  'use strict';
  var root = document.getElementById('ymir-vue-legacy-app');
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
  var lang0 = Shared.getLang || function () { try { return String(localStorage.getItem('ymir_lang') || navigator.language || 'en').indexOf('zh') === 0 ? 'zh' : 'en'; } catch (e) { return 'en'; } };
  function lines(text) { return String(text || '').split(/\r\n|\r|\n/); }
  var lineCount = Shared.lineCount || function (text) { return text ? lines(text).length : 0; };
  var bytes = Shared.bytes || function (text) { try { return new TextEncoder().encode(String(text || '')).length; } catch(e) { return unescape(encodeURIComponent(String(text || ''))).length; } };
  function copyText(text, ok, fail) { return (Shared.copyText || function(){ ElMessage.error(fail || 'Copy failed.'); })(text, { empty: ok.empty, copied: ok.copied, failed: fail || ok.failed || 'Copy failed.' }); }
  function htmlEscape(s) { return String(s || '').replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function htmlUnescape(s) { var ta = document.createElement('textarea'); ta.innerHTML = String(s || ''); return ta.value; }
  function unicodeEncode(s) { return Array.prototype.map.call(String(s || ''), function (ch) { var cp = ch.charCodeAt(0); return cp < 128 ? ch : '\\u' + ('0000' + cp.toString(16)).slice(-4); }).join(''); }
  function unicodeDecode(s) { return String(s || '').replace(/\\u([0-9a-fA-F]{4})/g, function(_, h) { return String.fromCharCode(parseInt(h, 16)); }); }
  function asciiEncode(s) { return Array.prototype.map.call(String(s || ''), function (ch) { return ch.charCodeAt(0); }).join(' '); }
  function asciiDecode(s) { return String(s || '').trim().split(/[\s,;]+/).filter(Boolean).map(function (token) { var n = /^0x/i.test(token) ? parseInt(token, 16) : parseInt(token, 10); return isFinite(n) ? String.fromCharCode(n) : ''; }).join(''); }
  function toCamel(s) { return String(s || '').trim().toLowerCase().replace(/[-_\s]+([a-z0-9])/g, function(_, c){ return c.toUpperCase(); }); }
  function toPascal(s) { var c = toCamel(s); return c ? c.charAt(0).toUpperCase() + c.slice(1) : ''; }
  function toSnake(s) { return String(s || '').trim().replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/[-\s]+/g, '_').toLowerCase(); }
  function toTitle(s) { return String(s || '').toLowerCase().replace(/(^|\s|[-_])([a-z])/g, function(_, sep, c){ return (sep === '_' ? ' ' : sep) + c.toUpperCase(); }); }
  function uniqueLines(s) { var seen = Object.create(null), out = []; lines(String(s || '')).forEach(function (line) { var key = line.trim(); if (!key) return; if (!seen[key]) { seen[key]=1; out.push(line); } }); return out.join('\n'); }
  function reverseText(s) { return Array.prototype.slice.call(String(s || '')).reverse().join(''); }
  function verticalText(s) { return Array.prototype.join.call(String(s || ''), '\n'); }
  function toFullWidth(s) { return String(s || '').replace(/[!-~]/g, function(ch){ return String.fromCharCode(ch.charCodeAt(0)+0xFEE0); }).replace(/ /g, '　'); }
  function toHalfWidth(s) { return String(s || '').replace(/[！-～]/g, function(ch){ return String.fromCharCode(ch.charCodeAt(0)-0xFEE0); }).replace(/　/g, ' '); }
  function randomString(len) { var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'; len = Math.max(4, Math.min(128, parseInt(len || '24', 10))); var a = new Uint32Array(len), out = ''; crypto.getRandomValues(a); for (var i=0;i<len;i++) out += chars[a[i] % chars.length]; return out; }
  function rgbToHex(s) { var m = String(s || '').match(/(\d{1,3})[^0-9]+(\d{1,3})[^0-9]+(\d{1,3})/); if (!m) throw new Error('Enter RGB such as 37, 99, 235.'); return '#' + [m[1],m[2],m[3]].map(function(v){ v=Math.max(0,Math.min(255,parseInt(v,10))); return ('0'+v.toString(16)).slice(-2); }).join(''); }
  function hexToRgb(s) { var value = String(s || '').trim().replace(/^#/, ''); if (value.length === 3) value = value.replace(/./g, '$&$&'); if (!/^[0-9a-fA-F]{6}$/.test(value)) throw new Error('Enter HEX such as #2563eb.'); var n=parseInt(value,16); return 'rgb(' + ((n>>16)&255) + ', ' + ((n>>8)&255) + ', ' + (n&255) + ')'; }
  function parseNumber(s) { s = String(s || '').trim(); if (/^0x/i.test(s)) return parseInt(s,16); if (/^[01]+b$/i.test(s)) return parseInt(s.slice(0,-1),2); if (/^[01]+$/.test(s) && s.length > 3) return parseInt(s,2); return Number(s); }
  function morseMap() { return {a:'.-',b:'-...',c:'-.-.',d:'-..',e:'.',f:'..-.',g:'--.',h:'....',i:'..',j:'.---',k:'-.-',l:'.-..',m:'--',n:'-.',o:'---',p:'.--.',q:'--.-',r:'.-.',s:'...',t:'-',u:'..-',v:'...-',w:'.--',x:'-..-',y:'-.--',z:'--..',0:'-----',1:'.----',2:'..---',3:'...--',4:'....-',5:'.....',6:'-....',7:'--...',8:'---..',9:'----.'}; }
  function morseEncode(s) { var map=morseMap(); return String(s || '').toLowerCase().split('').map(function(ch){ if (ch===' ') return '/'; return map[ch] || ch; }).join(' '); }
  function morseDecode(s) { var map=morseMap(), rev={}; Object.keys(map).forEach(function(k){ rev[map[k]]=k; }); return String(s || '').trim().split(/\s+/).map(function(tok){ return tok==='/' ? ' ' : (rev[tok] || tok); }).join(''); }
  function pxToRem(s) { var n = parseFloat(String(s || '').replace(/px/i,'')); if (!isFinite(n)) throw new Error('Enter a pixel value.'); return (n / 16).toFixed(4).replace(/0+$/,'').replace(/\.$/,'') + 'rem'; }
  function remToPx(s) { var n = parseFloat(String(s || '').replace(/rem/i,'')); if (!isFinite(n)) throw new Error('Enter a rem value.'); return (n * 16).toFixed(2).replace(/0+$/,'').replace(/\.$/,'') + 'px'; }
  function digestHex(algo, text) {
    if (!crypto || !crypto.subtle) return Promise.reject(new Error('Web Crypto is not available in this browser.'));
    return crypto.subtle.digest(algo, new TextEncoder().encode(String(text || ''))).then(function(buf){ return Array.prototype.map.call(new Uint8Array(buf), function(x){ return ('00'+x.toString(16)).slice(-2); }).join(''); });
  }

  var cfg = {
    uuid: { icon:'ID', title:'UUID Generator', zhTitle:'UUID 在线生成器', category:'Generator Tool', zhCategory:'生成器', subtitle:'Generate secure UUID v4 identifiers locally in your browser.', zhSubtitle:'在浏览器本地生成安全随机 UUID v4。', sample:'', actions:['uuid'], tags:['UUID v4','Local','Copy'] },
    urlcode: { icon:'%', title:'URL Encoder & Decoder', zhTitle:'URL 编码与解码', category:'Encoding Tool', zhCategory:'编码工具', subtitle:'Encode or decode percent-encoded URL text.', zhSubtitle:'编码或解码百分号 URL 文本。', sample:'https://ymirtool.com/search?q=中文 test&source=tools', actions:['urlEncode','urlDecode'], tags:['Encode','Decode','Query'] },
    unicode: { icon:'U+', title:'Unicode Escape Converter', zhTitle:'Unicode 转换器', category:'Encoding Tool', zhCategory:'编码工具', subtitle:'Convert text to Unicode escape sequences and decode them back.', zhSubtitle:'文本与 Unicode 转义序列互转。', sample:'Ymir Tool 中文', actions:['unicodeEncode','unicodeDecode'], tags:['Unicode','Escape','Decode'] },
    navtiveunicode: { icon:'U+', title:'Native Unicode Converter', zhTitle:'Native Unicode 转换器', category:'Encoding Tool', zhCategory:'编码工具', subtitle:'Convert native text to Unicode escapes and decode escapes back to text.', zhSubtitle:'本地文本与 Unicode 转义互转。', sample:'Hello 世界', actions:['unicodeEncode','unicodeDecode'], tags:['Unicode','Local','Copy'] },
    ascii: { icon:'A', title:'ASCII Code Converter', zhTitle:'ASCII 编码转换', category:'Encoding Tool', zhCategory:'编码工具', subtitle:'Convert text to ASCII character codes and decode code lists.', zhSubtitle:'文本与 ASCII 编码列表互转。', sample:'ABC 123', actions:['asciiEncode','asciiDecode'], tags:['ASCII','Codes','Decode'] },
    asciicode: { icon:'A', title:'ASCII Code Converter', zhTitle:'ASCII 编码转换', category:'Encoding Tool', zhCategory:'编码工具', subtitle:'Convert text to ASCII character codes and decode code lists.', zhSubtitle:'文本与 ASCII 编码列表互转。', sample:'Ymir', actions:['asciiEncode','asciiDecode'], tags:['ASCII','Codes','Table'] },
    htmlescape: { icon:'&lt;', title:'HTML Escape & Unescape', zhTitle:'HTML 转义与反转义', category:'HTML Tool', zhCategory:'HTML 工具', subtitle:'Escape HTML-sensitive characters or decode HTML entities.', zhSubtitle:'转义 HTML 敏感字符或解码 HTML 实体。', sample:'<div class="note">Tom & Jerry</div>', actions:['htmlEscape','htmlUnescape'], tags:['HTML','Escape','Entities'] },
    htmlescapechar: { icon:'&', title:'HTML Entity Converter', zhTitle:'HTML 实体转换', category:'HTML Tool', zhCategory:'HTML 工具', subtitle:'Encode and decode common HTML entities.', zhSubtitle:'编码和解码常见 HTML 实体。', sample:'5 > 3 & 2 < 4', actions:['htmlEscape','htmlUnescape'], tags:['Entities','Escape','Decode'] },
    escape: { icon:'%', title:'JavaScript Escape Converter', zhTitle:'Escape 加密/解密', category:'Encoding Tool', zhCategory:'编码工具', subtitle:'Encode text with JavaScript escape and decode it back.', zhSubtitle:'使用 JavaScript escape 编码并解码。', sample:'Ymir Tool 中文', actions:['escapeEncode','escapeDecode'], tags:['Escape','Decode','Legacy'] },
    camelcase: { icon:'Aa', title:'Camel Case Converter', zhTitle:'驼峰命名转换', category:'Text Tool', zhCategory:'文本工具', subtitle:'Convert words to camelCase, PascalCase, or snake_case.', zhSubtitle:'把文本转换为 camelCase、PascalCase 或 snake_case。', sample:'ymir tool converter example', actions:['camel','pascal','snake'], tags:['camelCase','PascalCase','snake_case'] },
    capital: { icon:'Aa', title:'Capitalization Converter', zhTitle:'英文大小写转换', category:'Text Tool', zhCategory:'文本工具', subtitle:'Convert text to title case, uppercase, or lowercase.', zhSubtitle:'把英文转换为标题格式、大写或小写。', sample:'ymir tool text converter', actions:['titleCase','upper','lower'], tags:['Title Case','Uppercase','Lowercase'] },
    enlower: { icon:'Aa', title:'Uppercase / Lowercase Converter', zhTitle:'大小写转换', category:'Text Tool', zhCategory:'文本工具', subtitle:'Switch text between uppercase and lowercase.', zhSubtitle:'文本大写和小写互转。', sample:'Ymir Tool TEXT Converter', actions:['upper','lower','titleCase'], tags:['Uppercase','Lowercase','Title Case'] },
    quchong: { icon:'≠', title:'Duplicate Line Remover', zhTitle:'文本去重工具', category:'Text Tool', zhCategory:'文本工具', subtitle:'Remove duplicate non-empty lines while preserving first occurrence order.', zhSubtitle:'删除重复非空行，并保留首次出现顺序。', sample:'apple\norange\napple\nbanana\norange', actions:['dedupe'], tags:['Lines','Dedupe','Copy'] },
    txtreplace: { icon:'↔', title:'Text Replace Tool', zhTitle:'文本替换工具', category:'Text Tool', zhCategory:'文本工具', subtitle:'Replace plain text occurrences and copy the result.', zhSubtitle:'替换文本中的指定内容并复制结果。', sample:'Hello Ymir Tool. Ymir Tool runs locally.', actions:['replace'], tags:['Find','Replace','Copy'], special:'replace' },
    shaencrypt: { icon:'#', title:'SHA Hash Generator', zhTitle:'SHA 哈希生成器', category:'Hash Tool', zhCategory:'哈希工具', subtitle:'Generate SHA-1, SHA-256, or SHA-512 hashes using Web Crypto.', zhSubtitle:'使用 Web Crypto 生成 SHA-1、SHA-256 或 SHA-512 哈希。', sample:'Ymir Tool', actions:['sha1','sha256','sha512'], tags:['SHA-1','SHA-256','SHA-512'] },
    random: { icon:'R', title:'Random Generator', zhTitle:'随机生成器', category:'Generator Tool', zhCategory:'生成器', subtitle:'Generate random numbers or copy-safe random strings locally.', zhSubtitle:'本地生成随机数字或随机字符串。', sample:'24', actions:['randomString','randomNumber'], tags:['Random','Local','Copy'] },
    px2rem: { icon:'px', title:'PX / REM Converter', zhTitle:'PX 与 REM 转换', category:'CSS Tool', zhCategory:'CSS 工具', subtitle:'Convert CSS pixel values to rem or rem values back to px with base 16.', zhSubtitle:'按 16 基准在 px 与 rem 之间转换。', sample:'16px', actions:['pxToRem','remToPx'], tags:['CSS','PX','REM'] },
    hexconvert: { icon:'0x', title:'Number Base Converter', zhTitle:'进制转换工具', category:'Developer Tool', zhCategory:'开发工具', subtitle:'Convert numbers between decimal, hexadecimal, and binary.', zhSubtitle:'在十进制、十六进制和二进制之间转换数字。', sample:'255', actions:['toHex','toDecimal','toBinary'], tags:['Decimal','Hex','Binary'] },
    hexrgb: { icon:'#', title:'HEX / RGB Color Converter', zhTitle:'HEX 与 RGB 颜色转换', category:'Color Tool', zhCategory:'颜色工具', subtitle:'Convert HEX colors to RGB and RGB colors to HEX.', zhSubtitle:'HEX 颜色与 RGB 颜色互转。', sample:'#2563eb', actions:['hexToRgb','rgbToHex'], tags:['HEX','RGB','CSS'] },
    textflip: { icon:'↩', title:'Text Reverse Tool', zhTitle:'文本反转工具', category:'Text Tool', zhCategory:'文本工具', subtitle:'Reverse text characters for quick checks and transformations.', zhSubtitle:'反转文本字符用于快速处理和检查。', sample:'Ymir Tool', actions:['reverse'], tags:['Reverse','Text','Copy'] },
    shupai: { icon:'縦', title:'Vertical Text Layout', zhTitle:'文字竖排工具', category:'Text Tool', zhCategory:'文本工具', subtitle:'Convert normal text into one-character-per-line vertical layout.', zhSubtitle:'把普通文本转换为逐字换行的竖排格式。', sample:'Ymir Tool', actions:['vertical'], tags:['Vertical','Layout','Text'] },
    quanbaojiao: { icon:'Ａ', title:'Full-width / Half-width Converter', zhTitle:'全角半角转换', category:'Text Tool', zhCategory:'文本工具', subtitle:'Convert ASCII characters between full-width and half-width forms.', zhSubtitle:'在全角和半角 ASCII 字符之间转换。', sample:'Ymir Tool 123 ABC', actions:['toFull','toHalf'], tags:['Full-width','Half-width','Text'] },
    morse: { icon:'--', title:'Morse Code Converter', zhTitle:'摩尔斯电码转换', category:'Encoding Tool', zhCategory:'编码工具', subtitle:'Encode text to Morse code or decode Morse code back to text.', zhSubtitle:'文本与摩尔斯电码互转。', sample:'SOS YMIR TOOL', actions:['morseEncode','morseDecode'], tags:['Morse','Encode','Decode'] }
  };
  var actionText = {
    urlEncode:['Encode URL','URL 编码'], urlDecode:['Decode URL','URL 解码'], unicodeEncode:['Encode Unicode','转为 Unicode'], unicodeDecode:['Decode Unicode','解码 Unicode'], asciiEncode:['Text to codes','文本转编码'], asciiDecode:['Codes to text','编码转文本'], htmlEscape:['Escape HTML','HTML 转义'], htmlUnescape:['Unescape HTML','HTML 反转义'], escapeEncode:['Escape','Escape 编码'], escapeDecode:['Unescape','Unescape 解码'], camel:['camelCase','camelCase'], pascal:['PascalCase','PascalCase'], snake:['snake_case','snake_case'], titleCase:['Title Case','标题格式'], upper:['Uppercase','转大写'], lower:['Lowercase','转小写'], dedupe:['Remove duplicates','删除重复行'], replace:['Replace text','替换文本'], sha1:['SHA-1','SHA-1'], sha256:['SHA-256','SHA-256'], sha512:['SHA-512','SHA-512'], randomString:['Random string','随机字符串'], randomNumber:['Random number','随机数字'], pxToRem:['PX to REM','PX 转 REM'], remToPx:['REM to PX','REM 转 PX'], toHex:['To HEX','转十六进制'], toDecimal:['To decimal','转十进制'], toBinary:['To binary','转二进制'], hexToRgb:['HEX to RGB','HEX 转 RGB'], rgbToHex:['RGB to HEX','RGB 转 HEX'], reverse:['Reverse','反转文本'], vertical:['Vertical layout','转换竖排'], toFull:['To full-width','转全角'], toHalf:['To half-width','转半角'], morseEncode:['Text to Morse','文本转摩斯'], morseDecode:['Morse to text','摩斯转文本'], uuid:['Generate UUID','生成 UUID']
  };
  var common = {
    en: { eyebrow:'Vue 3 + Element Plus workbench', input:'Input', output:'Output', copied:'Copied result to clipboard.', copyFailed:'Copy failed.', empty:'Nothing to copy.', clear:'Clear', sample:'Load sample', copy:'Copy result', local:'Runs locally in your browser', noUpload:'No upload', ready:'Ready.', find:'Find', replacement:'Replace with', statusOk:'Result updated.' },
    zh: { eyebrow:'Vue 3 + Element Plus 工作台', input:'输入', output:'输出', copied:'结果已复制到剪贴板。', copyFailed:'复制失败。', empty:'没有可复制的结果。', clear:'清空', sample:'载入示例', copy:'复制结果', local:'浏览器本地运行', noUpload:'不上传文件', ready:'就绪。', find:'查找内容', replacement:'替换为', statusOk:'结果已更新。' }
  };
  var App = {
    name:'YmirVueLegacyToolsApp',
    data:function(){ var tool=root.getAttribute('data-tool') || 'unicode'; var c=cfg[tool] || cfg.unicode; return { tool:tool, c:c, lang:lang0(), input:c.sample || '', output:'', find:'Ymir Tool', replacement:'YmirTool', statusType:'info', statusTitle:(lang0()==='zh'?'就绪。':'Ready.') }; },
    computed:{ labels:function(){ return common[this.lang] || common.en; }, title:function(){ return this.lang==='zh' ? this.c.zhTitle : this.c.title; }, subtitle:function(){ return this.lang==='zh' ? this.c.zhSubtitle : this.c.subtitle; }, category:function(){ return this.lang==='zh' ? this.c.zhCategory : this.c.category; }, metaInput:function(){ return String(this.input||'').length + ' chars · ' + lineCount(this.input) + ' lines · ' + bytes(this.input) + ' bytes'; }, metaOutput:function(){ return String(this.output||'').length + ' chars · ' + lineCount(this.output) + ' lines · ' + bytes(this.output) + ' bytes'; } },
    methods:{
      setStatus:function(type,msg){ this.statusType=type||'info'; this.statusTitle=msg || this.labels.statusOk; },
      setLang:function(v){ this.lang=v; if (Shared.setLang) Shared.setLang(v); else { try { localStorage.setItem('ymir_lang', v); document.documentElement.lang = v === 'zh' ? 'zh-CN' : 'en'; } catch(e){} } },
      loadSample:function(){ this.input=this.c.sample || ''; this.output=''; this.setStatus('info', this.lang==='zh'?'示例已载入。':'Sample loaded.'); },
      clearAll:function(){ this.input=''; this.output=''; this.setStatus('info', this.labels.ready); },
      copyOutput:function(){ copyText(this.output, this.labels, this.labels.copyFailed); },
      run:function(action){ var self=this; try {
        if (action==='uuid') { var cryptoObj=crypto||window.msCrypto; var uuid=(cryptoObj && cryptoObj.randomUUID) ? cryptoObj.randomUUID() : ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,function(c){ return (c ^ cryptoObj.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16); }); this.output=uuid; }
        else if (action==='urlEncode') this.output=encodeURIComponent(this.input);
        else if (action==='urlDecode') this.output=decodeURIComponent(this.input.replace(/\+/g, '%20'));
        else if (action==='unicodeEncode') this.output=unicodeEncode(this.input);
        else if (action==='unicodeDecode') this.output=unicodeDecode(this.input);
        else if (action==='asciiEncode') this.output=asciiEncode(this.input);
        else if (action==='asciiDecode') this.output=asciiDecode(this.input);
        else if (action==='htmlEscape') this.output=htmlEscape(this.input);
        else if (action==='htmlUnescape') this.output=htmlUnescape(this.input);
        else if (action==='escapeEncode') this.output=window.escape ? window.escape(this.input) : encodeURIComponent(this.input);
        else if (action==='escapeDecode') this.output=window.unescape ? window.unescape(this.input) : decodeURIComponent(this.input);
        else if (action==='camel') this.output=toCamel(this.input);
        else if (action==='pascal') this.output=toPascal(this.input);
        else if (action==='snake') this.output=toSnake(this.input);
        else if (action==='titleCase') this.output=toTitle(this.input);
        else if (action==='upper') this.output=String(this.input||'').toUpperCase();
        else if (action==='lower') this.output=String(this.input||'').toLowerCase();
        else if (action==='dedupe') this.output=uniqueLines(this.input);
        else if (action==='replace') this.output=String(this.input||'').split(this.find).join(this.replacement);
        else if (action==='sha1' || action==='sha256' || action==='sha512') { var algo={sha1:'SHA-1',sha256:'SHA-256',sha512:'SHA-512'}[action]; digestHex(algo, this.input).then(function(hex){ self.output=hex; self.setStatus('success', algo + (self.lang==='zh'?' 已生成。':' generated.')); }).catch(function(e){ self.setStatus('error', e.message); }); return; }
        else if (action==='randomString') this.output=randomString(this.input || 24);
        else if (action==='randomNumber') { var a=new Uint32Array(1); crypto.getRandomValues(a); this.output=String(a[0]); }
        else if (action==='pxToRem') this.output=pxToRem(this.input);
        else if (action==='remToPx') this.output=remToPx(this.input);
        else if (action==='toHex') { var n=parseNumber(this.input); if (!isFinite(n)) throw new Error('Enter a number.'); this.output='0x' + Math.trunc(n).toString(16).toUpperCase(); }
        else if (action==='toDecimal') { var nd=parseNumber(this.input); if (!isFinite(nd)) throw new Error('Enter a number.'); this.output=String(Math.trunc(nd)); }
        else if (action==='toBinary') { var nb=parseNumber(this.input); if (!isFinite(nb)) throw new Error('Enter a number.'); this.output=Math.trunc(nb).toString(2); }
        else if (action==='hexToRgb') this.output=hexToRgb(this.input);
        else if (action==='rgbToHex') this.output=rgbToHex(this.input);
        else if (action==='reverse') this.output=reverseText(this.input);
        else if (action==='vertical') this.output=verticalText(this.input);
        else if (action==='toFull') this.output=toFullWidth(this.input);
        else if (action==='toHalf') this.output=toHalfWidth(this.input);
        else if (action==='morseEncode') this.output=morseEncode(this.input);
        else if (action==='morseDecode') this.output=morseDecode(this.input);
        this.setStatus('success', this.labels.statusOk);
      } catch(e) { this.setStatus('error', e.message); } },
      buttonLabel:function(action){ var item=actionText[action] || [action,action]; return this.lang==='zh' ? item[1] : item[0]; },
      renderPanel:function(title, meta, val, readonly, update){ return h(ElCard,{class:'ymir-vue-panel',shadow:'never'},{header:function(){return h('div',{class:'ymir-vue-panel__top'},[h('span',{class:'ymir-vue-panel__title'},[h('span',{class:'ymir-vue-panel__dot'}),title]),h('span',{class:'ymir-vue-panel__meta'},meta||'')]);},default:function(){return h(ElInput,{modelValue:val,'onUpdate:modelValue':update,type:'textarea',readonly:!!readonly,resize:'vertical',autosize:{minRows:11,maxRows:22}});}});},
      renderSpecial:function(){ var self=this; if (this.c.special!=='replace') return null; return h(ElCard,{class:'ymir-vue-panel',shadow:'never'},{header:function(){return h('div',{class:'ymir-vue-panel__top'},[h('span',{class:'ymir-vue-panel__title'},[h('span',{class:'ymir-vue-panel__dot'}),self.lang==='zh'?'替换参数':'Replace options'])]);},default:function(){return h('div',{class:'ymir-vue-options'},[h('label',{class:'ymir-vue-field'},[h('span',null,self.labels.find),h(ElInput,{modelValue:self.find,'onUpdate:modelValue':function(v){self.find=v;}})]),h('label',{class:'ymir-vue-field'},[h('span',null,self.labels.replacement),h(ElInput,{modelValue:self.replacement,'onUpdate:modelValue':function(v){self.replacement=v;}})])]);}});}
    },
    render:function(){
      var self=this;
      var body=h('div',{class:'ymir-vue-body'},[
        this.renderPanel(this.labels.input,this.metaInput,this.input,false,function(v){self.input=v;}),
        this.c.special==='replace' ? this.renderSpecial() : this.renderPanel(this.labels.output,this.metaOutput,this.output,true,function(){}),
        this.c.special==='replace' ? this.renderPanel(this.labels.output,this.metaOutput,this.output,true,function(){}) : null
      ]);
      var actions=h('div',{class:'ymir-vue-actions'},(this.c.actions||[]).map(function(a,idx){return h(ElButton,{type:idx===0?'primary':'',onClick:function(){self.run(a);}},function(){return self.buttonLabel(a);});}).concat([
        h(ElButton,{plain:true,onClick:this.loadSample},function(){return self.labels.sample;}),
        h(ElButton,{plain:true,onClick:this.copyOutput},function(){return self.labels.copy;}),
        h(ElButton,{type:'danger',plain:true,onClick:this.clearAll},function(){return self.labels.clear;})
      ]));
      return (Shared.renderShell || function(){return h('div',{},'Shared renderer missing');})(h, ElementPlus, {
        appClass:'ymir-vue-app--legacy ymir-vue-app--'+this.tool,
        icon:this.c.icon,
        eyebrow:this.labels.eyebrow,
        category:this.category,
        title:this.title,
        subtitle:this.subtitle,
        tags:this.c.tags||[],
        lang:this.lang,
        onLangChange:function(v){self.setLang(v);},
        statusType:this.statusType,
        statusTitle:this.statusTitle,
        footerTags:[{label:this.labels.local,type:'primary'},{label:this.labels.noUpload,type:'info'}]
      }, [body, actions]);
    }
  };
  createApp(App).mount(root);
})();
