(function () {
  'use strict';
  var root = document.getElementById('ymir-vue-legacy-app');
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
  var lang0 = Shared.getLang || function () { try { return String(localStorage.getItem('ymir_lang') || navigator.language || 'en').indexOf('zh') === 0 ? 'zh' : 'en'; } catch (e) { return 'en'; } };
  function lines(text) { return String(text || '').split(/\r\n|\r|\n/); }
  var lineCount = Shared.lineCount || function (text) { return text ? lines(text).length : 0; };
  var bytes = Shared.bytes || function (text) { try { return new TextEncoder().encode(String(text || '')).length; } catch(e) { return unescape(encodeURIComponent(String(text || ''))).length; } };
  function copyText(text, ok, fail) { return (Shared.copyText || function(){ ElMessage.error(fail || 'Copy failed.'); })(text, { empty: ok.empty, copied: ok.copied, failed: fail || ok.failed || 'Copy failed.' }); }
  function htmlEscape(s) { return String(s || '').replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function htmlUnescape(s) { var ta = document.createElement('textarea'); ta.innerHTML = String(s || ''); return ta.value; }
  function unicodeEncode(s) { return Array.from(String(s || '')).map(function (ch) { var cp = ch.codePointAt(0); if (cp < 128) return ch; return cp <= 0xFFFF ? '\\u' + ('0000' + cp.toString(16)).slice(-4) : '\\u{' + cp.toString(16) + '}'; }).join(''); }
  function nativeUnicodeEncode(s) { return String(s || '').split('').map(function (ch) { var cp = ch.charCodeAt(0); return cp < 128 ? ch : '\\u' + ('0000' + cp.toString(16)).slice(-4); }).join(''); }
  function unicodeDecode(s) { return String(s || '').replace(/\\u\{([0-9a-fA-F]{1,6})\}/g, function(_, h) { var cp = parseInt(h, 16); return cp <= 0x10FFFF ? String.fromCodePoint(cp) : _; }).replace(/\\u([0-9a-fA-F]{4})/g, function(_, h) { return String.fromCharCode(parseInt(h, 16)); }).replace(/\\x([0-9a-fA-F]{2})/g, function(_, h) { return String.fromCharCode(parseInt(h, 16)); }); }
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
    if (!crypto || !crypto.subtle) return Promise.reject(new Error('Web Crypto is not available.'));
    return crypto.subtle.digest(algo, new TextEncoder().encode(String(text || ''))).then(function(buf){ return Array.prototype.map.call(new Uint8Array(buf), function(x){ return ('00'+x.toString(16)).slice(-2); }).join(''); });
  }

  var cfg = {
    uuid: { icon:'ID', title:'UUID Generator', zhTitle:'UUID 在线生成器', category:'Generator Tool', zhCategory:'生成器', subtitle:'Generate secure UUID v4 identifiers quickly.', zhSubtitle:'快速生成随机 UUID v4。', sample:'', actions:['uuid'], tags:['UUID v4','Copy-ready','Copy'] },
    urlcode: { icon:'%', title:'URL Encoder & Decoder', zhTitle:'URL 编码与解码', category:'Encoding Tool', zhCategory:'编码工具', subtitle:'Encode or decode percent-encoded URL text.', zhSubtitle:'编码或解码百分号 URL 文本。', sample:'https://ymirtool.com/search?q=中文 test&source=tools', actions:['urlEncode','urlDecode'], tags:['Encode','Decode','Query'] },
    unicode: { icon:'U+', title:'JavaScript Unicode Escape Converter', zhTitle:'JavaScript Unicode 转义转换器', category:'Encoding Tool', zhCategory:'编码工具', subtitle:'Convert JavaScript string escapes, including \\uXXXX, \\u{...}, and \\xNN forms.', zhSubtitle:'在文本与 JavaScript Unicode 转义之间转换，支持 \\uXXXX、\\u{...} 和 \\xNN。', sample:'Ymir Tool 中文 😀', actions:['unicodeEncode','unicodeDecode'], tags:['JavaScript','Unicode','Code point'] },
    navtiveunicode: { icon:'U+', title:'Native2ASCII-style Unicode Converter', zhTitle:'Native2ASCII 风格 Unicode 转换器', category:'Encoding Tool', zhCategory:'编码工具', subtitle:'Create UTF-16 \\uXXXX escapes compatible with Java properties and older native2ascii workflows.', zhSubtitle:'生成适合 Java properties 与旧 native2ascii 流程的 UTF-16 \\uXXXX 转义。', sample:'Hello 世界 😀', actions:['nativeUnicodeEncode','unicodeDecode'], tags:['Java properties','UTF-16','Compatibility'] },
    ascii: { icon:'A', title:'ASCII Code Converter', zhTitle:'ASCII 编码转换', category:'Encoding Tool', zhCategory:'编码工具', subtitle:'Convert text to ASCII character codes and decode code lists.', zhSubtitle:'文本与 ASCII 编码列表互转。', sample:'ABC 123', actions:['asciiEncode','asciiDecode'], tags:['ASCII','Codes','Decode'] },
    asciicode: { icon:'A', title:'ASCII Code Converter', zhTitle:'ASCII 编码转换', category:'Encoding Tool', zhCategory:'编码工具', subtitle:'Convert text to ASCII character codes and decode code lists.', zhSubtitle:'文本与 ASCII 编码列表互转。', sample:'Ymir', actions:['asciiEncode','asciiDecode'], tags:['ASCII','Codes','Table'] },
    htmlescape: { icon:'&lt;', title:'HTML Escape & Unescape', zhTitle:'HTML 转义与反转义', category:'HTML Tool', zhCategory:'HTML 工具', subtitle:'Escape HTML-sensitive characters or decode HTML entities.', zhSubtitle:'转义 HTML 敏感字符或解码 HTML 实体。', sample:'<div class="note">Tom & Jerry</div>', actions:['htmlEscape','htmlUnescape'], tags:['HTML','Escape','Entities'] },
    htmlescapechar: { icon:'&', title:'HTML Entity Converter', zhTitle:'HTML 实体转换', category:'HTML Tool', zhCategory:'HTML 工具', subtitle:'Encode and decode common HTML entities.', zhSubtitle:'编码和解码常见 HTML 实体。', sample:'5 > 3 & 2 < 4', actions:['htmlEscape','htmlUnescape'], tags:['Entities','Escape','Decode'] },
    escape: { icon:'%', title:'Legacy JavaScript Escape Converter', zhTitle:'JavaScript escape 编码 / 解码', category:'Encoding Tool', zhCategory:'编码工具', subtitle:'Inspect the legacy browser escape/unescape representation for compatibility only.', zhSubtitle:'仅为旧浏览器兼容性检查 JavaScript escape/unescape 表示；它不是加密。', sample:'Ymir Tool 中文', actions:['escapeEncode','escapeDecode'], tags:['Legacy API','Encoding','Compatibility'] },
    camelcase: { icon:'Aa', title:'Camel Case Converter', zhTitle:'驼峰命名转换', category:'Text Tool', zhCategory:'文本工具', subtitle:'Convert words to camelCase, PascalCase, or snake_case.', zhSubtitle:'把文本转换为 camelCase、PascalCase 或 snake_case。', sample:'ymir tool converter example', actions:['camel','pascal','snake'], tags:['camelCase','PascalCase','snake_case'] },
    capital: { icon:'Aa', title:'Capitalization Converter', zhTitle:'英文大小写转换', category:'Text Tool', zhCategory:'文本工具', subtitle:'Convert text to title case, uppercase, or lowercase.', zhSubtitle:'把英文转换为标题格式、大写或小写。', sample:'ymir tool text converter', actions:['titleCase','upper','lower'], tags:['Title Case','Uppercase','Lowercase'] },
    enlower: { icon:'Aa', title:'Uppercase / Lowercase Converter', zhTitle:'大小写转换', category:'Text Tool', zhCategory:'文本工具', subtitle:'Switch text between uppercase and lowercase.', zhSubtitle:'文本大写和小写互转。', sample:'Ymir Tool TEXT Converter', actions:['upper','lower','titleCase'], tags:['Uppercase','Lowercase','Title Case'] },
    quchong: { icon:'≠', title:'Duplicate Line Remover', zhTitle:'文本去重工具', category:'Text Tool', zhCategory:'文本工具', subtitle:'Remove duplicate non-empty lines while preserving first occurrence order.', zhSubtitle:'删除重复非空行，并保留首次出现顺序。', sample:'apple\norange\napple\nbanana\norange', actions:['dedupe'], tags:['Lines','Dedupe','Copy'] },
    txtreplace: { icon:'↔', title:'Text Replace Tool', zhTitle:'文本替换工具', category:'Text Tool', zhCategory:'文本工具', subtitle:'Replace plain text occurrences and copy the result.', zhSubtitle:'替换文本中的指定内容并复制结果。', sample:'Hello Ymir Tool. Ymir Tool is ready.', actions:['replace'], tags:['Find','Replace','Copy'], special:'replace' },
    shaencrypt: { icon:'#', title:'SHA Hash Generator', zhTitle:'SHA 哈希生成器', category:'Hash Tool', zhCategory:'哈希工具', subtitle:'Generate SHA-1, SHA-256, or SHA-512 hashes using Web Crypto.', zhSubtitle:'使用 Web Crypto 生成 SHA-1、SHA-256 或 SHA-512 哈希。', sample:'Ymir Tool', actions:['sha1','sha256','sha512'], tags:['SHA-1','SHA-256','SHA-512'] },
    random: { icon:'R', title:'Random Generator', zhTitle:'随机生成器', category:'Generator Tool', zhCategory:'生成器', subtitle:'Generate random numbers or copy-safe random strings quickly.', zhSubtitle:'本地生成随机数字或随机字符串。', sample:'24', actions:['randomString','randomNumber'], tags:['Random','Copy-ready','Copy'] },
    px2rem: { icon:'px', title:'PX / REM Converter', zhTitle:'PX 与 REM 转换', category:'CSS Tool', zhCategory:'CSS 工具', subtitle:'Convert CSS pixel values to rem or rem values back to px with base 16.', zhSubtitle:'按 16 基准在 px 与 rem 之间转换。', sample:'16px', actions:['pxToRem','remToPx'], tags:['CSS','PX','REM'] },
    hexconvert: { icon:'0x', title:'Number Base Converter', zhTitle:'进制转换工具', category:'Developer Tool', zhCategory:'开发工具', subtitle:'Convert numbers between decimal, hexadecimal, and binary.', zhSubtitle:'在十进制、十六进制和二进制之间转换数字。', sample:'255', actions:['toHex','toDecimal','toBinary'], tags:['Decimal','Hex','Binary'] },
    hexrgb: { icon:'#', title:'HEX / RGB Color Converter', zhTitle:'HEX 与 RGB 颜色转换', category:'Color Tool', zhCategory:'颜色工具', subtitle:'Convert HEX colors to RGB and RGB colors to HEX.', zhSubtitle:'HEX 颜色与 RGB 颜色互转。', sample:'#2563eb', actions:['hexToRgb','rgbToHex'], tags:['HEX','RGB','CSS'] },
    textflip: { icon:'↩', title:'Text Reverse Tool', zhTitle:'文本反转工具', category:'Text Tool', zhCategory:'文本工具', subtitle:'Reverse text characters for quick checks and transformations.', zhSubtitle:'反转文本字符用于快速处理和检查。', sample:'Ymir Tool', actions:['reverse'], tags:['Reverse','Text','Copy'] },
    shupai: { icon:'縦', title:'Vertical Text Layout', zhTitle:'文字竖排工具', category:'Text Tool', zhCategory:'文本工具', subtitle:'Convert normal text into one-character-per-line vertical layout.', zhSubtitle:'把普通文本转换为逐字换行的竖排格式。', sample:'Ymir Tool', actions:['vertical'], tags:['Vertical','Layout','Text'] },
    quanbaojiao: { icon:'Ａ', title:'Full-width / Half-width Converter', zhTitle:'全角半角转换', category:'Text Tool', zhCategory:'文本工具', subtitle:'Convert ASCII characters between full-width and half-width forms.', zhSubtitle:'在全角和半角 ASCII 字符之间转换。', sample:'Ymir Tool 123 ABC', actions:['toFull','toHalf'], tags:['Full-width','Half-width','Text'] },
    morse: { icon:'--', title:'Morse Code Converter', zhTitle:'摩尔斯电码转换', category:'Encoding Tool', zhCategory:'编码工具', subtitle:'Encode text to Morse code or decode Morse code back to text.', zhSubtitle:'文本与摩尔斯电码互转。', sample:'SOS YMIR TOOL', actions:['morseEncode','morseDecode'], tags:['Morse','Encode','Decode'] }
  };
  var actionText = {
    urlEncode:['Encode URL','URL 编码'], urlDecode:['Decode URL','URL 解码'], unicodeEncode:['Encode JS escapes','转为 JS 转义'], nativeUnicodeEncode:['Encode \\uXXXX','转为 \\uXXXX'], unicodeDecode:['Decode escapes','解码转义'], asciiEncode:['Text to codes','文本转编码'], asciiDecode:['Codes to text','编码转文本'], htmlEscape:['Escape HTML','HTML 转义'], htmlUnescape:['Unescape HTML','HTML 反转义'], escapeEncode:['Escape','Escape 编码'], escapeDecode:['Unescape','Unescape 解码'], camel:['camelCase','camelCase'], pascal:['PascalCase','PascalCase'], snake:['snake_case','snake_case'], titleCase:['Title Case','标题格式'], upper:['Uppercase','转大写'], lower:['Lowercase','转小写'], dedupe:['Remove duplicates','删除重复行'], replace:['Replace text','替换文本'], sha1:['SHA-1','SHA-1'], sha256:['SHA-256','SHA-256'], sha512:['SHA-512','SHA-512'], randomString:['Random string','随机字符串'], randomNumber:['Random number','随机数字'], pxToRem:['PX to REM','PX 转 REM'], remToPx:['REM to PX','REM 转 PX'], toHex:['To HEX','转十六进制'], toDecimal:['To decimal','转十进制'], toBinary:['To binary','转二进制'], hexToRgb:['HEX to RGB','HEX 转 RGB'], rgbToHex:['RGB to HEX','RGB 转 HEX'], reverse:['Reverse','反转文本'], vertical:['Vertical layout','转换竖排'], toFull:['To full-width','转全角'], toHalf:['To half-width','转半角'], morseEncode:['Text to Morse','文本转摩斯'], morseDecode:['Morse to text','摩斯转文本'], uuid:['Generate UUID','生成 UUID']
  };
  var common = {
    en: { eyebrow:'Tool workbench', input:'Input', output:'Output', copied:'Copied result to clipboard.', copyFailed:'Copy failed.', empty:'Nothing to copy.', clear:'Clear', sample:'Load sample', copy:'Copy result', local:'Ready to use', noUpload:'Copy-ready', ready:'Ready.', find:'Find', replacement:'Replace with', statusOk:'Result updated.' },
    zh: { eyebrow:'工具工作台', input:'输入', output:'输出', copied:'结果已复制到剪贴板。', copyFailed:'复制失败。', empty:'没有可复制的结果。', clear:'清空', sample:'载入示例', copy:'复制结果', local:'打开即用', noUpload:'结果可复制', ready:'就绪。', find:'查找内容', replacement:'替换为', statusOk:'结果已更新。' }
  };
  var ACTIONS = {
    uuid:function(){ var cryptoObj=window.crypto||window.msCrypto; return (cryptoObj && cryptoObj.randomUUID) ? cryptoObj.randomUUID() : ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,function(c){ return (c ^ cryptoObj.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16); }); },
    urlEncode:function(input){ return encodeURIComponent(input); },
    urlDecode:function(input){ return decodeURIComponent(String(input||'').replace(/\+/g, '%20')); },
    unicodeEncode:function(input){ return unicodeEncode(input); },
    nativeUnicodeEncode:function(input){ return nativeUnicodeEncode(input); },
    unicodeDecode:function(input){ return unicodeDecode(input); },
    asciiEncode:function(input){ return asciiEncode(input); },
    asciiDecode:function(input){ return asciiDecode(input); },
    htmlEscape:function(input){ return htmlEscape(input); },
    htmlUnescape:function(input){ return htmlUnescape(input); },
    escapeEncode:function(input){ return window.escape ? window.escape(input) : encodeURIComponent(input); },
    escapeDecode:function(input){ return window.unescape ? window.unescape(input) : decodeURIComponent(input); },
    camel:function(input){ return toCamel(input); }, pascal:function(input){ return toPascal(input); }, snake:function(input){ return toSnake(input); }, titleCase:function(input){ return toTitle(input); },
    upper:function(input){ return String(input||'').toUpperCase(); }, lower:function(input){ return String(input||'').toLowerCase(); }, dedupe:function(input){ return uniqueLines(input); },
    replace:function(input, second, vm){ return String(input||'').split(vm.find).join(vm.replacement); },
    sha1:function(input){ return digestHex('SHA-1', input); }, sha256:function(input){ return digestHex('SHA-256', input); }, sha512:function(input){ return digestHex('SHA-512', input); },
    randomString:function(input){ return randomString(input || 24); }, randomNumber:function(){ var a=new Uint32Array(1); crypto.getRandomValues(a); return String(a[0]); },
    pxToRem:function(input){ return pxToRem(input); }, remToPx:function(input){ return remToPx(input); },
    toHex:function(input){ var n=parseNumber(input); if(!isFinite(n)) throw new Error('Enter a number.'); return '0x' + Math.trunc(n).toString(16).toUpperCase(); },
    toDecimal:function(input){ var n=parseNumber(input); if(!isFinite(n)) throw new Error('Enter a number.'); return String(Math.trunc(n)); },
    toBinary:function(input){ var n=parseNumber(input); if(!isFinite(n)) throw new Error('Enter a number.'); return Math.trunc(n).toString(2); },
    hexToRgb:function(input){ return hexToRgb(input); }, rgbToHex:function(input){ return rgbToHex(input); }, reverse:function(input){ return reverseText(input); }, vertical:function(input){ return verticalText(input); },
    toFull:function(input){ return toFullWidth(input); }, toHalf:function(input){ return toHalfWidth(input); }, morseEncode:function(input){ return morseEncode(input); }, morseDecode:function(input){ return morseDecode(input); }
  };
  Shared.mountConfiguredToolApp({
    name:'YmirVueLegacyConfiguredApp',
    root:root,
    Vue:Vue,
    ElementPlus:ElementPlus,
    defaultSlug:'unicode',
    rootAttribute:'data-tool',
    tools:cfg,
    configKey:'c',
    statusTitleKey:'statusTitle',
    status:{ type:'info', message:function(vm){ return vm.lang==='zh'?'就绪。':'Ready.'; } },
    initialLang:lang0,
    initialState:function(c){ return { tool:root.getAttribute('data-tool') || 'unicode', input:c.sample || '', output:'', find:'Ymir Tool', replacement:'YmirTool' }; },
    computed:{
      labels:function(){ return common[this.lang] || common.en; },
      title:function(){ return this.lang==='zh' ? this.c.zhTitle : this.c.title; },
      subtitle:function(){ return this.lang==='zh' ? this.c.zhSubtitle : this.c.subtitle; },
      category:function(){ return this.lang==='zh' ? this.c.zhCategory : this.c.category; },
      metaInput:function(){ return String(this.input||'').length + ' chars · ' + lineCount(this.input) + ' lines · ' + bytes(this.input) + ' bytes'; },
      metaOutput:function(){ return String(this.output||'').length + ' chars · ' + lineCount(this.output) + ' lines · ' + bytes(this.output) + ' bytes'; }
    },
    textMethods:{
      handlers:ACTIONS,
      titleKey:'statusTitle',
      successMessage:function(vm){ return vm.labels.statusOk; },
      sample:{ fields:{ input:'sample' }, clearOutput:true, titleKey:'statusTitle', message:function(vm){ return vm.lang==='zh'?'示例已载入。':'Sample loaded.'; } },
      clearFields:['input','output'],
      clear:{ titleKey:'statusTitle', message:function(vm){ return vm.labels.ready; } },
      copy:{ copied:function(vm){ return vm.labels.copied; }, empty:function(vm){ return vm.labels.empty; }, failed:function(vm){ return vm.labels.copyFailed; } }
    },
    methods:{
      buttonLabel:function(action){ var item=actionText[action] || [action,action]; return this.lang==='zh' ? item[1] : item[0]; }
    },
    renderBody:function(h, ElementPlus){
      var self=this;
      if (this.c.special==='replace') {
        return h('div',{class:'ymir-vue-body'},[
          Shared.renderEditorCard(h,ElementPlus,{title:this.labels.input,meta:this.metaInput,value:this.input,onInput:function(v){self.input=v;},rows:14}),
          Shared.renderOptionPanel(h,ElementPlus,{title:this.lang==='zh'?'替换参数':'Replace options',default:function(){return h('div',{class:'ymir-vue-options'},[
            h('label',{class:'ymir-vue-field'},[h('span',null,self.labels.find),h(ElInput,{modelValue:self.find,'onUpdate:modelValue':function(v){self.find=v;}})]),
            h('label',{class:'ymir-vue-field'},[h('span',null,self.labels.replacement),h(ElInput,{modelValue:self.replacement,'onUpdate:modelValue':function(v){self.replacement=v;}})])
          ]);}}),
          Shared.renderEditorCard(h,ElementPlus,{title:this.labels.output,meta:this.metaOutput,value:this.output,readonly:true,output:true,rows:14})
        ]);
      }
      return Shared.renderInputOutputPanels(h, ElementPlus, {
        gridClass:'ymir-vue-body', inputTitle:this.labels.input, inputMeta:this.metaInput, inputValue:this.input, onInput:function(v){self.input=v;},
        outputTitle:this.labels.output, outputMeta:this.metaOutput, outputValue:this.output, outputReadonly:true, rows:14
      });
    },
    renderActions:function(h, ElementPlus){
      var self=this;
      return Shared.renderActionButtons(h, ElementPlus, this, (this.c.actions||[]).map(function(a){return {key:a,label:self.buttonLabel(a)};}).concat([
        {label:this.labels.sample, plain:true, onClick:this.loadSample},
        {label:this.labels.copy, plain:true, onClick:this.copyOutput},
        {label:this.labels.clear, type:'danger', plain:true, onClick:this.clearAll}
      ]), { className:'ymir-vue-actions', primaryFirst:true, onRun:function(a){self.run(a);} });
    },
    shell:function(){
      return {
        appClass:'ymir-vue-app--legacy ymir-vue-app--'+this.tool,
        icon:this.c.icon,
        eyebrow:this.labels.eyebrow,
        category:this.category,
        title:this.title,
        subtitle:this.subtitle,
        tags:this.c.tags||[],
        lang:this.lang,
        onLangChange:this.setLang,
        statusType:this.statusType,
        statusTitle:this.statusTitle,
        footerTags:[{label:this.category,type:'primary'},{label:this.labels.noUpload,type:'info'}]
      };
    }
  });
})();
