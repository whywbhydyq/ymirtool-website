(function () {
  'use strict';
  var root = document.getElementById('ymir-vue-textref-app');
  if (!root) return;
  if (!window.YmirVueShared) {
    root.innerHTML = '<div class="ymir-vue-noscript">Shared tool UI failed to load. This tool cannot start.</div>';
    return;
  }
  var Shared = window.YmirVueShared;
  var ElementPlus = window.ElementPlus;
  var TOOLS = {"jianfan": {"kind": "text", "mode": "jianfan", "icon": "简繁", "title": "Simplified and Traditional Chinese Converter", "category": "Chinese Text Tool", "desc": "Convert text between Simplified Chinese, Traditional Chinese, and stylized variant text quickly.", "tags": ["Chinese", "Text", "Local"], "sample": "在线工具可以帮助开发者整理中文文本。"}, "huoxingwen": {"kind": "text", "mode": "huoxingwen", "icon": "火星", "title": "Mars Text Converter", "category": "Chinese Text Tool", "desc": "Convert Chinese text to stylized Mars text and convert it back to readable text where mappings exist.", "tags": ["Mars text", "Chinese", "Fun"], "sample": "火星文转换示例"}, "pinyin": {"kind": "text", "mode": "pinyin", "icon": "PY", "title": "Chinese Pinyin Converter", "category": "Chinese Text Tool", "desc": "Convert Chinese characters to pinyin output using the local legacy pinyin dictionary.", "tags": ["Pinyin", "Chinese", "Dictionary"], "sample": "你好，世界。"}, "wenzitexiao": {"kind": "text", "mode": "wenzitexiao", "icon": "TXT", "title": "Text Effects Generator", "category": "Text Tool", "desc": "Generate simple text effects such as spaced text, vertical text, wrapped symbols, and decorative blocks.", "tags": ["Text", "Effect", "Copy"], "sample": "Ymir Tool 文字特效"}, "zipstringtext": {"kind": "text", "mode": "zipstringtext", "icon": "ZIP", "title": "Text Whitespace Compressor", "category": "Text Tool", "desc": "Remove duplicate whitespace, convert text to one line, or remove all whitespace characters.", "tags": ["Whitespace", "Compress", "Text"], "sample": "Line 1\n\n    Line 2\t  Line 3"}, "areacode": {"kind": "table", "icon": "☎", "title": "Country Calling Code Lookup", "category": "Reference Table", "desc": "Search common country calling codes, time offsets, and internet country code hints.", "tags": ["Phone code", "Country", "Lookup"]}, "currency": {"kind": "table", "icon": "FX", "title": "Currency Code Reference", "category": "Reference Table", "desc": "Search common ISO currency codes, symbols, and currency names. This is not a live exchange-rate tool.", "tags": ["Currency", "ISO", "Reference"]}, "jieri": {"kind": "table", "icon": "CAL", "title": "Festival and Holiday Reference", "category": "Reference Table", "desc": "Search common solar, lunar, and international festival names for quick calendar reference.", "tags": ["Holiday", "Calendar", "Lookup"]}, "shaoshuminzu": {"kind": "table", "icon": "民族", "title": "China Ethnic Groups Reference", "category": "Reference Table", "desc": "Search a compact reference table of ethnic group names and common regional notes.", "tags": ["Reference", "China", "Lookup"]}, "chaodai": {"kind": "table", "icon": "史", "title": "Chinese Dynasties Timeline", "category": "Reference Table", "desc": "Search Chinese dynasties, approximate date ranges, capitals, and short notes.", "tags": ["History", "Timeline", "Search"]}, "bootstrapicon": {"kind": "table", "icon": "GLY", "title": "Bootstrap Glyphicons Reference", "category": "Reference Table", "desc": "Search legacy Bootstrap 3 glyphicon class names and common usage hints.", "tags": ["Bootstrap", "Icon", "CSS"]}, "tesufuhao": {"kind": "symbols", "icon": "★", "title": "Special Symbols Reference", "category": "Symbol Tool", "desc": "Search and copy common special symbols, arrows, math symbols, currency marks, and emoticons.", "tags": ["Symbols", "Copy", "Reference"]}, "nianlvli": {"kind": "interest", "icon": "APR", "title": "Annual Interest Calculator", "category": "Calculator", "desc": "Estimate simple interest, compound interest, monthly rate, and daily rate from principal, annual rate, and term.", "tags": ["Interest", "Calculator", "Local"]}, "shizhong": {"kind": "clock", "clockMode": "local", "icon": "CLK", "title": "Online Clock", "category": "Time Tool", "desc": "Show the current local time with date, UTC offset, and seconds.", "tags": ["Clock", "Local time", "Browser"]}, "worldtime": {"kind": "clock", "clockMode": "world", "icon": "UTC", "title": "World Time Clock", "category": "Time Tool", "desc": "Show current times for common world time zones using your browser Intl API.", "tags": ["World time", "Timezone", "Clock"]}, "subnetmask": {"kind": "subnet", "icon": "CIDR", "title": "Subnet Mask Calculator", "category": "Network Calculator", "desc": "Calculate IPv4 subnet mask, wildcard mask, network address, broadcast address, and host range from CIDR.", "tags": ["IPv4", "CIDR", "Subnet"]}, "tiaoseban": {"kind": "palette", "icon": "RGB", "title": "Color Palette Tool", "category": "Color Tool", "desc": "Pick a color, inspect HEX/RGB/HSL values, and generate tint and shade palettes.", "tags": ["Color", "Palette", "HEX"]}};
  var TABLES = {"areacode": {"columns": [{"prop": "country", "label": "Country / Region"}, {"prop": "phone", "label": "Calling code"}, {"prop": "tld", "label": "ccTLD"}, {"prop": "offset", "label": "UTC"}, {"prop": "note", "label": "Note"}], "rows": [{"country": "United States / Canada", "phone": "+1", "tld": ".us / .ca", "offset": "UTC-10 to UTC-4", "note": "North American Numbering Plan"}, {"country": "United Kingdom", "phone": "+44", "tld": ".uk", "offset": "UTC+0 / +1", "note": "Includes many dependent-territory exceptions"}, {"country": "China", "phone": "+86", "tld": ".cn", "offset": "UTC+8", "note": "Mainland China"}, {"country": "Hong Kong", "phone": "+852", "tld": ".hk", "offset": "UTC+8", "note": "Hong Kong SAR"}, {"country": "Taiwan", "phone": "+886", "tld": ".tw", "offset": "UTC+8", "note": "Taiwan"}, {"country": "Japan", "phone": "+81", "tld": ".jp", "offset": "UTC+9", "note": "Japan Standard Time"}, {"country": "South Korea", "phone": "+82", "tld": ".kr", "offset": "UTC+9", "note": "Korea Standard Time"}, {"country": "Singapore", "phone": "+65", "tld": ".sg", "offset": "UTC+8", "note": "Singapore"}, {"country": "Australia", "phone": "+61", "tld": ".au", "offset": "UTC+8 to UTC+11", "note": "Multiple time zones"}, {"country": "Germany", "phone": "+49", "tld": ".de", "offset": "UTC+1 / +2", "note": "Central European Time"}, {"country": "France", "phone": "+33", "tld": ".fr", "offset": "UTC+1 / +2", "note": "Metropolitan France"}, {"country": "India", "phone": "+91", "tld": ".in", "offset": "UTC+5:30", "note": "India Standard Time"}, {"country": "Brazil", "phone": "+55", "tld": ".br", "offset": "UTC-5 to UTC-2", "note": "Multiple time zones"}, {"country": "Mexico", "phone": "+52", "tld": ".mx", "offset": "UTC-8 to UTC-5", "note": "Multiple time zones"}, {"country": "Russia", "phone": "+7", "tld": ".ru", "offset": "UTC+2 to UTC+12", "note": "Multiple time zones"}]}, "currency": {"columns": [{"prop": "code", "label": "Code"}, {"prop": "symbol", "label": "Symbol"}, {"prop": "name", "label": "Currency"}, {"prop": "minor", "label": "Minor units"}, {"prop": "note", "label": "Note"}], "rows": [{"code": "USD", "symbol": "$", "name": "US Dollar", "minor": "2", "note": "United States dollar"}, {"code": "EUR", "symbol": "€", "name": "Euro", "minor": "2", "note": "Eurozone"}, {"code": "CNY", "symbol": "¥", "name": "Chinese Yuan Renminbi", "minor": "2", "note": "Mainland China"}, {"code": "JPY", "symbol": "¥", "name": "Japanese Yen", "minor": "0", "note": "No minor unit in standard cash display"}, {"code": "GBP", "symbol": "£", "name": "Pound Sterling", "minor": "2", "note": "United Kingdom"}, {"code": "HKD", "symbol": "HK$", "name": "Hong Kong Dollar", "minor": "2", "note": "Hong Kong"}, {"code": "TWD", "symbol": "NT$", "name": "New Taiwan Dollar", "minor": "2", "note": "Taiwan"}, {"code": "CAD", "symbol": "C$", "name": "Canadian Dollar", "minor": "2", "note": "Canada"}, {"code": "AUD", "symbol": "A$", "name": "Australian Dollar", "minor": "2", "note": "Australia"}, {"code": "SGD", "symbol": "S$", "name": "Singapore Dollar", "minor": "2", "note": "Singapore"}, {"code": "KRW", "symbol": "₩", "name": "South Korean Won", "minor": "0", "note": "South Korea"}, {"code": "INR", "symbol": "₹", "name": "Indian Rupee", "minor": "2", "note": "India"}]}, "jieri": {"columns": [{"prop": "name", "label": "Festival"}, {"prop": "date", "label": "Date"}, {"prop": "calendar", "label": "Calendar"}, {"prop": "region", "label": "Region"}, {"prop": "note", "label": "Note"}], "rows": [{"name": "New Year's Day", "date": "Jan 1", "calendar": "Solar", "region": "International", "note": "Gregorian year start"}, {"name": "Chinese New Year / Spring Festival", "date": "Lunar Jan 1", "calendar": "Lunar", "region": "China / East Asia", "note": "Date changes each year"}, {"name": "Lantern Festival", "date": "Lunar Jan 15", "calendar": "Lunar", "region": "China", "note": "Yuanxiao Festival"}, {"name": "Qingming Festival", "date": "Around Apr 4-6", "calendar": "Solar term", "region": "China", "note": "Tomb-sweeping day"}, {"name": "Dragon Boat Festival", "date": "Lunar May 5", "calendar": "Lunar", "region": "China", "note": "Duanwu Festival"}, {"name": "Mid-Autumn Festival", "date": "Lunar Aug 15", "calendar": "Lunar", "region": "China / East Asia", "note": "Moon festival"}, {"name": "National Day of China", "date": "Oct 1", "calendar": "Solar", "region": "China", "note": "Public holiday period may vary"}, {"name": "Christmas Day", "date": "Dec 25", "calendar": "Solar", "region": "International", "note": "Christian holiday and public holiday in many countries"}, {"name": "International Workers' Day", "date": "May 1", "calendar": "Solar", "region": "International", "note": "Labor day in many countries"}, {"name": "Halloween", "date": "Oct 31", "calendar": "Solar", "region": "International", "note": "Cultural festival"}]}, "shaoshuminzu": {"columns": [{"prop": "name", "label": "Name"}, {"prop": "pinyin", "label": "Pinyin"}, {"prop": "commonRegion", "label": "Common regions"}, {"prop": "note", "label": "Note"}], "rows": [{"name": "壮族", "pinyin": "Zhuang", "commonRegion": "Guangxi, Yunnan, Guangdong", "note": "One of the largest minority groups in China"}, {"name": "回族", "pinyin": "Hui", "commonRegion": "Ningxia, Gansu, Qinghai, Xinjiang", "note": "Widely distributed"}, {"name": "满族", "pinyin": "Manchu", "commonRegion": "Liaoning, Hebei, Heilongjiang", "note": "Northeast China historical roots"}, {"name": "维吾尔族", "pinyin": "Uyghur", "commonRegion": "Xinjiang", "note": "Turkic language group"}, {"name": "苗族", "pinyin": "Miao", "commonRegion": "Guizhou, Hunan, Yunnan", "note": "Southwest China"}, {"name": "彝族", "pinyin": "Yi", "commonRegion": "Yunnan, Sichuan, Guizhou", "note": "Southwest China"}, {"name": "土家族", "pinyin": "Tujia", "commonRegion": "Hunan, Hubei, Chongqing", "note": "Wuling mountain area"}, {"name": "藏族", "pinyin": "Tibetan", "commonRegion": "Tibet, Qinghai, Sichuan, Gansu", "note": "Tibetan plateau"}, {"name": "蒙古族", "pinyin": "Mongol", "commonRegion": "Inner Mongolia, Xinjiang, Qinghai", "note": "Northern China"}, {"name": "侗族", "pinyin": "Dong", "commonRegion": "Guizhou, Hunan, Guangxi", "note": "Known for drum towers and polyphonic singing"}, {"name": "瑶族", "pinyin": "Yao", "commonRegion": "Guangxi, Hunan, Yunnan, Guangdong", "note": "South China"}, {"name": "朝鲜族", "pinyin": "Korean", "commonRegion": "Jilin, Heilongjiang, Liaoning", "note": "Northeast China"}]}, "chaodai": {"columns": [{"prop": "dynasty", "label": "Dynasty / Period"}, {"prop": "years", "label": "Years"}, {"prop": "capital", "label": "Capital"}, {"prop": "note", "label": "Note"}], "rows": [{"dynasty": "Xia", "years": "c. 2070–1600 BCE", "capital": "Various", "note": "Traditional first dynasty; dates approximate"}, {"dynasty": "Shang", "years": "c. 1600–1046 BCE", "capital": "Yin and others", "note": "Oracle bone inscriptions"}, {"dynasty": "Zhou", "years": "1046–256 BCE", "capital": "Haojing / Luoyang", "note": "Western and Eastern Zhou"}, {"dynasty": "Qin", "years": "221–206 BCE", "capital": "Xianyang", "note": "First unified imperial dynasty"}, {"dynasty": "Han", "years": "202 BCE–220 CE", "capital": "Chang'an / Luoyang", "note": "Western and Eastern Han"}, {"dynasty": "Sui", "years": "581–618", "capital": "Daxing / Luoyang", "note": "Reunification before Tang"}, {"dynasty": "Tang", "years": "618–907", "capital": "Chang'an", "note": "Major cosmopolitan empire"}, {"dynasty": "Song", "years": "960–1279", "capital": "Kaifeng / Lin'an", "note": "Northern and Southern Song"}, {"dynasty": "Yuan", "years": "1271–1368", "capital": "Dadu", "note": "Mongol-led dynasty"}, {"dynasty": "Ming", "years": "1368–1644", "capital": "Nanjing / Beijing", "note": "Han-led restoration"}, {"dynasty": "Qing", "years": "1644–1912", "capital": "Beijing", "note": "Last imperial dynasty"}]}, "bootstrapicon": {"columns": [{"prop": "className", "label": "Class"}, {"prop": "name", "label": "Name"}, {"prop": "category", "label": "Category"}, {"prop": "usage", "label": "Usage"}], "rows": [{"className": "glyphicon-search", "name": "Search", "category": "Action", "usage": "Search buttons and filters"}, {"className": "glyphicon-user", "name": "User", "category": "People", "usage": "Account or profile"}, {"className": "glyphicon-ok", "name": "OK", "category": "Status", "usage": "Success state"}, {"className": "glyphicon-remove", "name": "Remove", "category": "Status", "usage": "Close or delete"}, {"className": "glyphicon-plus", "name": "Plus", "category": "Action", "usage": "Add item"}, {"className": "glyphicon-minus", "name": "Minus", "category": "Action", "usage": "Remove item"}, {"className": "glyphicon-pencil", "name": "Pencil", "category": "Edit", "usage": "Edit action"}, {"className": "glyphicon-trash", "name": "Trash", "category": "Action", "usage": "Delete action"}, {"className": "glyphicon-download", "name": "Download", "category": "File", "usage": "Download file"}, {"className": "glyphicon-upload", "name": "Upload", "category": "File", "usage": "Upload file"}, {"className": "glyphicon-calendar", "name": "Calendar", "category": "Date", "usage": "Date picker"}, {"className": "glyphicon-time", "name": "Time", "category": "Date", "usage": "Clock or time"}, {"className": "glyphicon-link", "name": "Link", "category": "Web", "usage": "URL or external link"}, {"className": "glyphicon-warning-sign", "name": "Warning", "category": "Status", "usage": "Warnings"}]}};
  var SYMBOL_GROUPS = [{"group": "Stars and shapes", "symbols": "★ ☆ ✦ ✧ ✩ ✪ ✫ ✬ ✭ ✮ ✯ ✰ ◆ ◇ ● ○ ◎ ◉ ■ □ ▣ ▤ ▥"}, {"group": "Arrows", "symbols": "← ↑ → ↓ ↔ ↕ ↖ ↗ ↘ ↙ ⇐ ⇒ ⇑ ⇓ ⇔ ➜ ➤ ➜ ➔ ➜"}, {"group": "Math", "symbols": "± × ÷ ≈ ≠ ≤ ≥ ∞ √ ∑ ∏ ∫ ∆ ∇ ∂ ∈ ∉ ∩ ∪ ⊂ ⊃"}, {"group": "Currency", "symbols": "$ € £ ¥ ₩ ₹ ₽ ₺ ₫ ₴ ₦ ₱ ₪ ฿ ₡ ¢"}, {"group": "Punctuation", "symbols": "「 」 『 』 《 》 〈 〉 · • ‧ … — – § ¶ ※ №"}, {"group": "Faces", "symbols": "☻ ☺ ♡ ♥ ❤ ❥ ❦ ☹ ☃ ☂ ☀ ☁ ☕ ☎ ☑ ☒"}];

  function countLines(text) { return String(text || '').split(/\r?\n/).length; }
  function normalizeText(text) { return String(text == null ? '' : text); }
  function copy(text) { Shared.copyText(text, ElementPlus); }
  function safeLower(v) { return String(v == null ? '' : v).toLowerCase(); }
  function includesRow(row, q) { var hay = Object.keys(row).map(function (k) { return row[k]; }).join(' ').toLowerCase(); return hay.indexOf(q) !== -1; }
  function toPlainRows(rows, columns) { return rows.map(function (r) { return columns.map(function (c) { return r[c.prop]; }).join('\t'); }).join('\n'); }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function number(n, digits) { return Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: digits == null ? 2 : digits }); }
  function parseHex(hex) {
    hex = String(hex || '').trim().replace(/^#/, '');
    if (/^[0-9a-f]{3}$/i.test(hex)) hex = hex.split('').map(function (ch) { return ch + ch; }).join('');
    if (!/^[0-9a-f]{6}$/i.test(hex)) return null;
    return { r: parseInt(hex.slice(0,2),16), g: parseInt(hex.slice(2,4),16), b: parseInt(hex.slice(4,6),16), hex: '#' + hex.toUpperCase() };
  }
  function rgbToHsl(r,g,b) {
    r/=255; g/=255; b/=255;
    var max=Math.max(r,g,b), min=Math.min(r,g,b), h=0, s=0, l=(max+min)/2;
    if (max!==min) {
      var d=max-min; s=l>0.5?d/(2-max-min):d/(max+min);
      switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break;}
      h/=6;
    }
    return { h: Math.round(h*360), s: Math.round(s*100), l: Math.round(l*100) };
  }
  function mix(c, target, amount) {
    var r = Math.round(c.r + (target.r - c.r) * amount);
    var g = Math.round(c.g + (target.g - c.g) * amount);
    var b = Math.round(c.b + (target.b - c.b) * amount);
    return '#' + [r,g,b].map(function (x) { return x.toString(16).padStart(2,'0'); }).join('').toUpperCase();
  }
  function pinyinOf(text, initials) {
    text = normalizeText(text);
    var dic = window.pydic || '';
    var out = [];
    for (var i=0; i<text.length; i++) {
      var ch = text.charAt(i);
      if (dic && ch.charCodeAt(0) > 200) {
        var idx = dic.indexOf(ch);
        if (idx >= 0) {
          var j = idx + 1, py = '';
          while (j < dic.length && dic.charAt(j) !== ',') { py += dic.charAt(j); j++; }
          out.push(initials ? (py.charAt(0) || ch) : py);
        } else out.push(ch);
      } else if (/\s/.test(ch)) out.push(initials ? '' : ' ');
      else out.push(initials ? ch : ch);
    }
    return initials ? out.join('').replace(/\s+/g,'') : out.join(' ').replace(/\s+/g,' ').trim();
  }
  function textEffect(mode, text) {
    text = normalizeText(text);
    if (mode === 'spaced') return text.split('').join(' ');
    if (mode === 'vertical') return text.split('').join('\n');
    if (mode === 'bracket') return text.split('').map(function (ch) { return ch.trim() ? '【' + ch + '】' : ch; }).join('');
    if (mode === 'banner') return '✦ '.repeat(2) + text + ' ' + '✦ '.repeat(2);
    return text;
  }
  function textCompress(mode, text) {
    text = normalizeText(text);
    if (mode === 'trimLines') return text.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean).join('\n');
    if (mode === 'oneLine') return text.replace(/\s+/g, ' ').trim();
    if (mode === 'removeAll') return text.replace(/\s+/g, '');
    return text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  }
  function ipToNum(ip) {
    var parts = String(ip || '').trim().split('.').map(Number);
    if (parts.length !== 4 || parts.some(function (p) { return !Number.isInteger(p) || p < 0 || p > 255; })) return null;
    return (((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3]) >>> 0;
  }
  function numToIp(n) { return [(n>>>24)&255, (n>>>16)&255, (n>>>8)&255, n&255].join('.'); }
  function subnetCalc(ip, cidr) {
    var n = ipToNum(ip), c = Number(cidr);
    if (n == null || !Number.isInteger(c) || c < 0 || c > 32) throw new Error('Enter a valid IPv4 address and CIDR prefix from 0 to 32.');
    var mask = c === 0 ? 0 : (0xffffffff << (32-c)) >>> 0;
    var wildcard = (~mask) >>> 0;
    var network = (n & mask) >>> 0;
    var broadcast = (network | wildcard) >>> 0;
    var usable = c >= 31 ? 0 : Math.max(0, Math.pow(2, 32-c) - 2);
    return [
      { label:'Subnet mask', value:numToIp(mask) },
      { label:'Wildcard mask', value:numToIp(wildcard) },
      { label:'Network address', value:numToIp(network) },
      { label:'Broadcast address', value:numToIp(broadcast) },
      { label:'First usable', value:c >= 31 ? 'N/A' : numToIp(network + 1) },
      { label:'Last usable', value:c >= 31 ? 'N/A' : numToIp(broadcast - 1) },
      { label:'Total addresses', value:String(Math.pow(2, 32-c)) },
      { label:'Usable hosts', value:String(usable) }
    ];
  }

  var zones = [
    { city:'UTC', zone:'UTC' }, { city:'New York', zone:'America/New_York' }, { city:'Los Angeles', zone:'America/Los_Angeles' },
    { city:'London', zone:'Europe/London' }, { city:'Paris', zone:'Europe/Paris' }, { city:'Dubai', zone:'Asia/Dubai' },
    { city:'New Delhi', zone:'Asia/Kolkata' }, { city:'Singapore', zone:'Asia/Singapore' }, { city:'Shanghai', zone:'Asia/Shanghai' },
    { city:'Tokyo', zone:'Asia/Tokyo' }, { city:'Sydney', zone:'Australia/Sydney' }
  ];

  var toolKey = root.getAttribute('data-tool') || 'jianfan';
  var initialTool = TOOLS[toolKey] || TOOLS.jianfan;

  Shared.mountConfiguredToolApp({
    root: root,
    name: 'YmirVueTextReferenceToolsApp',
    data: function () {
      return {
        toolKey: toolKey,
        c: initialTool,
        lang: Shared.getLang(),
        statusType: 'info',
        statusTitle: 'Ready. Enter input or choose an action.',
        input: initialTool.sample || '',
        output: '',
        query: '',
        symbolGroup: 'All',
        now: new Date(),
        principal: 10000,
        annualRate: 5,
        years: 1,
        compoundFrequency: 12,
        ip: '192.168.1.10',
        cidr: 24,
        subnetRows: [],
        hex: '#2563EB'
      };
    },
    computed: {
      inputMeta: function () { return Shared.bytes(this.input) + ' bytes · ' + countLines(this.input) + ' lines'; },
      outputMeta: function () { return Shared.bytes(this.output) + ' bytes · ' + countLines(this.output) + ' lines'; },
      actionItems: function () {
        var m = this.c.mode;
        if (this.c.kind === 'text') {
          if (m === 'jianfan') return [{key:'toTraditional', label:'To Traditional', type:'primary'}, {key:'toSimplified', label:'To Simplified'}, {key:'toVariant', label:'Stylized variant'}, {key:'sample', label:'Load sample'}, {key:'copy', label:'Copy'}, {key:'clear', label:'Clear'}];
          if (m === 'huoxingwen') return [{key:'toMars', label:'To Mars text', type:'primary'}, {key:'fromMars', label:'Back to simplified'}, {key:'sample', label:'Load sample'}, {key:'copy', label:'Copy'}, {key:'clear', label:'Clear'}];
          if (m === 'pinyin') return [{key:'toPinyin', label:'To pinyin', type:'primary'}, {key:'toInitials', label:'Initials'}, {key:'sample', label:'Load sample'}, {key:'copy', label:'Copy'}, {key:'clear', label:'Clear'}];
          if (m === 'wenzitexiao') return [{key:'spaced', label:'Spaced', type:'primary'}, {key:'vertical', label:'Vertical'}, {key:'bracket', label:'Bracketed'}, {key:'banner', label:'Banner'}, {key:'sample', label:'Load sample'}, {key:'copy', label:'Copy'}, {key:'clear', label:'Clear'}];
          return [{key:'trimLines', label:'Trim lines', type:'primary'}, {key:'oneLine', label:'One line'}, {key:'removeAll', label:'Remove all whitespace'}, {key:'normalizeSpaces', label:'Normalize'}, {key:'sample', label:'Load sample'}, {key:'copy', label:'Copy'}, {key:'clear', label:'Clear'}];
        }
        if (this.c.kind === 'table' || this.c.kind === 'symbols') return [{key:'copyFiltered', label:'Copy filtered rows', type:'primary'}, {key:'resetSearch', label:'Reset search'}];
        if (this.c.kind === 'interest') return [{key:'copyInterest', label:'Copy result', type:'primary'}];
        if (this.c.kind === 'subnet') return [{key:'calcSubnet', label:'Calculate subnet', type:'primary'}, {key:'copySubnet', label:'Copy result'}];
        if (this.c.kind === 'palette') return [{key:'copyColor', label:'Copy HEX', type:'primary'}, {key:'copyPalette', label:'Copy palette'}, {key:'randomColor', label:'Random color'}];
        return [];
      },
      tableConfig: function () { return TABLES[this.toolKey] || { columns: [], rows: [] }; },
      filteredRows: function () {
        var q = safeLower(this.query).trim();
        var rows = this.tableConfig.rows || [];
        return q ? rows.filter(function (r) { return includesRow(r, q); }) : rows;
      },
      symbolGroups: function () { return ['All'].concat(SYMBOL_GROUPS.map(function (g) { return g.group; })); },
      filteredSymbols: function () {
        var q = safeLower(this.query).trim();
        var groups = this.symbolGroup === 'All' ? SYMBOL_GROUPS : SYMBOL_GROUPS.filter(function (g) { return g.group === this.symbolGroup; }, this);
        var items = [];
        groups.forEach(function (g) {
          g.symbols.split(/\s+/).filter(Boolean).forEach(function (sym) { items.push({ symbol: sym, group: g.group }); });
        });
        return q ? items.filter(function (x) { return x.symbol.indexOf(q) !== -1 || safeLower(x.group).indexOf(q) !== -1; }) : items;
      },
      localClockRows: function () {
        var d = this.now;
        var offset = -d.getTimezoneOffset();
        var sign = offset >= 0 ? '+' : '-';
        var hh = pad2(Math.floor(Math.abs(offset)/60));
        var mm = pad2(Math.abs(offset)%60);
        return [{ city:'Local time', zone:Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local', time:d.toLocaleTimeString(), date:d.toLocaleDateString(), offset:'UTC' + sign + hh + ':' + mm }];
      },
      worldClockRows: function () {
        var d = this.now;
        return zones.map(function (z) {
          var time = new Intl.DateTimeFormat(undefined, { timeZone:z.zone, hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false }).format(d);
          var date = new Intl.DateTimeFormat(undefined, { timeZone:z.zone, year:'numeric', month:'short', day:'2-digit', weekday:'short' }).format(d);
          return { city:z.city, zone:z.zone, time:time, date:date, offset:'' };
        });
      },
      interestRows: function () {
        var p = Number(this.principal) || 0, r = (Number(this.annualRate) || 0) / 100, y = Number(this.years) || 0, f = Math.max(1, Number(this.compoundFrequency) || 1);
        var simpleInterest = p * r * y;
        var compound = p * Math.pow(1 + r / f, f * y);
        return [
          { label:'Simple interest', value:number(simpleInterest, 2) },
          { label:'Simple total', value:number(p + simpleInterest, 2) },
          { label:'Compound total', value:number(compound, 2) },
          { label:'Compound interest', value:number(compound - p, 2) },
          { label:'Monthly rate', value:number((r / 12) * 100, 4) + '%' },
          { label:'Daily rate', value:number((r / 365) * 100, 5) + '%' }
        ];
      },
      colorInfo: function () {
        var c = parseHex(this.hex) || parseHex('#2563EB');
        var hsl = rgbToHsl(c.r, c.g, c.b);
        return { hex:c.hex, rgb:'rgb(' + c.r + ', ' + c.g + ', ' + c.b + ')', hsl:'hsl(' + hsl.h + ' ' + hsl.s + '% ' + hsl.l + '%)', obj:c };
      },
      palette: function () {
        var c = this.colorInfo.obj;
        var white = {r:255,g:255,b:255}, black = {r:0,g:0,b:0};
        return [mix(c, white, .8), mix(c, white, .6), mix(c, white, .35), this.colorInfo.hex, mix(c, black, .2), mix(c, black, .38), mix(c, black, .55)];
      }
    },
    mounted: function () {
      var self = this;
      setInterval(function () { self.now = new Date(); }, 1000);
      if (this.c.kind === 'subnet') this.calcSubnet();
      if (this.c.kind === 'text') this.run(this.actionItems[0].key);
    },
    methods: {
      setLang: function (v) { this.lang = Shared.setLang(v); this.statusTitle = this.lang === 'zh' ? '已切换语言。' : 'Language switched.'; },
      setStatus: function (type, title) { this.statusType = type; this.statusTitle = title; },
      run: function (key) {
        try {
          if (key === 'copy') return copy(this.output);
          if (key === 'clear') { this.input = ''; this.output = ''; return this.setStatus('info','Cleared.'); }
          if (key === 'sample') { this.input = this.c.sample || ''; return this.run(this.actionItems[0].key); }
          if (key === 'toTraditional') this.output = window.traditionalized ? window.traditionalized(this.input) : this.input;
          else if (key === 'toSimplified') this.output = window.simplized ? window.simplized(this.input) : this.input;
          else if (key === 'toVariant' || key === 'toMars') this.output = window.qqlized ? window.qqlized(this.input) : textEffect('bracket', this.input);
          else if (key === 'fromMars') this.output = window.simplized ? window.simplized(this.input) : this.input;
          else if (key === 'toPinyin') this.output = pinyinOf(this.input, false);
          else if (key === 'toInitials') this.output = pinyinOf(this.input, true).toUpperCase();
          else if (['spaced','vertical','bracket','banner'].indexOf(key) >= 0) this.output = textEffect(key, this.input);
          else if (['trimLines','oneLine','removeAll','normalizeSpaces'].indexOf(key) >= 0) this.output = textCompress(key, this.input);
          else if (key === 'copyFiltered') return this.copyFiltered();
          else if (key === 'resetSearch') { this.query=''; this.symbolGroup='All'; return this.setStatus('info','Search reset.'); }
          else if (key === 'copyInterest') return copy(this.interestRows.map(function (x) { return x.label + ': ' + x.value; }).join('\n'));
          else if (key === 'calcSubnet') return this.calcSubnet();
          else if (key === 'copySubnet') return copy(this.subnetRows.map(function (x) { return x.label + ': ' + x.value; }).join('\n'));
          else if (key === 'copyColor') return copy(this.colorInfo.hex);
          else if (key === 'copyPalette') return copy(this.palette.join('\n'));
          else if (key === 'randomColor') { this.hex = '#' + Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0').toUpperCase(); return; }
          this.setStatus('success', 'Output updated.');
        } catch (e) { this.setStatus('error', e && e.message ? e.message : 'Operation failed.'); }
      },
      copyFiltered: function () {
        if (this.c.kind === 'symbols') return copy(this.filteredSymbols.map(function (x) { return x.symbol; }).join(' '));
        copy(toPlainRows(this.filteredRows, this.tableConfig.columns));
      },
      copySymbol: function (sym) { copy(sym); this.setStatus('success', 'Copied symbol: ' + sym); },
      calcSubnet: function () { this.subnetRows = subnetCalc(this.ip, this.cidr); this.setStatus('success', 'Subnet result updated.'); },
      copyPaletteColor: function (hex) { copy(hex); this.hex = hex; }
    },
    shell: function () {
      return { icon: this.c.icon, category: this.c.category, title: this.c.title, subtitle: this.c.desc, tags: this.c.tags, appClass: 'ymir-vue-app--textref', footerTags: [{ label: 'Shared tool shell' }, { label: 'Tool runtime' }, { label: 'Copy-ready output' }] };
    },
    renderBody: function (h, El) {
      var ElInput = Shared.getEl(El, 'ElInput');
      var ElTag = Shared.getEl(El, 'ElTag');
      var ElSelect = Shared.getEl(El, 'ElSelect');
      var ElOption = Shared.getEl(El, 'ElOption');
      var ElTable = Shared.getEl(El, 'ElTable');
      var ElTableColumn = Shared.getEl(El, 'ElTableColumn');
      var ElCard = Shared.getEl(El, 'ElCard');
      var ElForm = Shared.getEl(El, 'ElForm');
      var ElFormItem = Shared.getEl(El, 'ElFormItem');
      var ElInputNumber = Shared.getEl(El, 'ElInputNumber');
      var self = this;
      function resultLines(rows) {
        return h('div', { class: 'ymir-vue-result-stack' }, rows.map(function (row) { return h('div', { class: 'ymir-vue-result-line', key: row.label }, [h('span', null, row.label), h('b', null, row.value)]); }));
      }
      if (this.c.kind === 'text') {
        return Shared.renderInputOutputPanels(h, El, {
          gridClass: 'ymir-vue-textref-grid',
          inputTitle: 'Input', inputMeta: this.inputMeta, inputValue: this.input, inputRows: 15, onInput: function (v) { self.input = v; },
          outputTitle: 'Output', outputMeta: this.outputMeta, outputValue: this.output, outputRows: 15
        });
      }
      if (this.c.kind === 'table') {
        return h('div', { class: 'ymir-vue-reference-layout' }, [
          h('div', { class: 'ymir-vue-reference-controls' }, [
            h(ElInput, { modelValue: this.query, clearable: true, placeholder: 'Search this table', style: { maxWidth: '420px' }, 'onUpdate:modelValue': function (v) { self.query = v; } }),
            h(ElTag, null, function () { return self.filteredRows.length + ' rows'; })
          ]),
          h('div', { class: 'ymir-vue-reference-table' }, [h(ElTable, { data: this.filteredRows, height: 520, stripe: true }, function () {
            return self.tableConfig.columns.map(function (col) {
              return h(ElTableColumn, { key: col.prop, prop: col.prop, label: col.label, showOverflowTooltip: true });
            });
          })])
        ]);
      }
      if (this.c.kind === 'symbols') {
        return h('div', { class: 'ymir-vue-reference-layout' }, [
          h('div', { class: 'ymir-vue-reference-controls' }, [
            h(ElInput, { modelValue: this.query, clearable: true, placeholder: 'Search symbols or category', style: { maxWidth: '360px' }, 'onUpdate:modelValue': function (v) { self.query = v; } }),
            h(ElSelect, { modelValue: this.symbolGroup, style: { maxWidth: '240px' }, 'onUpdate:modelValue': function (v) { self.symbolGroup = v; } }, function () { return self.symbolGroups.map(function (g) { return h(ElOption, { key: g, label: g, value: g }); }); }),
            h(ElTag, null, function () { return self.filteredSymbols.length + ' symbols'; })
          ]),
          h('div', { class: 'ymir-vue-symbol-grid' }, this.filteredSymbols.map(function (s) { return h('button', { key: s.group + s.symbol, class: 'ymir-vue-symbol-btn', title: s.group, onClick: function () { self.copySymbol(s.symbol); } }, s.symbol); }))
        ]);
      }
      if (this.c.kind === 'clock') {
        var rows = this.c.clockMode === 'world' ? this.worldClockRows : this.localClockRows;
        return h('div', { class: 'ymir-vue-clock-grid' }, rows.map(function (row) { return h('div', { key: row.zone, class: 'ymir-vue-clock-card' }, [h('strong', null, row.city), h('span', null, row.zone), h('div', { class: 'ymir-vue-clock-time' }, row.time), h('p', null, row.date + ' ' + row.offset)]); }));
      }
      if (this.c.kind === 'interest') {
        return h('div', { class: 'ymir-vue-calculator-grid' }, [
          h(ElCard, { shadow: 'never' }, function () { return h(ElForm, { labelPosition: 'top' }, function () { return [
            h(ElFormItem, { label: 'Principal' }, function () { return h(ElInputNumber, { modelValue: self.principal, min: 0, step: 100, style: { width: '100%' }, 'onUpdate:modelValue': function (v) { self.principal = v; } }); }),
            h(ElFormItem, { label: 'Annual rate (%)' }, function () { return h(ElInputNumber, { modelValue: self.annualRate, min: 0, step: 0.1, style: { width: '100%' }, 'onUpdate:modelValue': function (v) { self.annualRate = v; } }); }),
            h(ElFormItem, { label: 'Years' }, function () { return h(ElInputNumber, { modelValue: self.years, min: 0, step: 0.25, style: { width: '100%' }, 'onUpdate:modelValue': function (v) { self.years = v; } }); }),
            h(ElFormItem, { label: 'Compound frequency per year' }, function () { return h(ElInputNumber, { modelValue: self.compoundFrequency, min: 1, max: 365, style: { width: '100%' }, 'onUpdate:modelValue': function (v) { self.compoundFrequency = v; } }); })
          ]; }); }),
          h(ElCard, { shadow: 'never' }, function () { return resultLines(self.interestRows); })
        ]);
      }
      if (this.c.kind === 'subnet') {
        return h('div', { class: 'ymir-vue-calculator-grid' }, [
          h(ElCard, { shadow: 'never' }, function () { return h(ElForm, { labelPosition: 'top' }, function () { return [
            h(ElFormItem, { label: 'IPv4 address' }, function () { return h(ElInput, { modelValue: self.ip, 'onUpdate:modelValue': function (v) { self.ip = v; } }); }),
            h(ElFormItem, { label: 'CIDR prefix' }, function () { return h(ElInputNumber, { modelValue: self.cidr, min: 0, max: 32, style: { width: '100%' }, 'onUpdate:modelValue': function (v) { self.cidr = v; } }); })
          ]; }); }),
          h(ElCard, { shadow: 'never' }, function () { return resultLines(self.subnetRows); })
        ]);
      }
      if (this.c.kind === 'palette') {
        return h('div', { class: 'ymir-vue-calculator-grid' }, [
          h(ElCard, { shadow: 'never' }, function () { return [
            h(ElForm, { labelPosition: 'top' }, function () { return h(ElFormItem, { label: 'HEX color' }, function () { return h(ElInput, { modelValue: self.hex, 'onUpdate:modelValue': function (v) { self.hex = v; } }); }); }),
            h('div', { class: 'ymir-vue-color-preview', style: { background: self.colorInfo.hex } })
          ]; }),
          h(ElCard, { shadow: 'never' }, function () { return [
            resultLines([{ label: 'HEX', value: self.colorInfo.hex }, { label: 'RGB', value: self.colorInfo.rgb }, { label: 'HSL', value: self.colorInfo.hsl }]),
            h('div', { class: 'ymir-vue-palette-grid' }, self.palette.map(function (c) { return h('button', { class: 'ymir-vue-palette-chip', key: c, onClick: function () { self.copyPaletteColor(c); } }, [h('div', { class: 'ymir-vue-palette-swatch', style: { background: c } }), h('div', { class: 'ymir-vue-palette-label' }, c)]); }))
          ]; })
        ]);
      }
      return null;
    },
    renderActions: function (h, El) {
      return Shared.renderActionButtons(h, El, this, this.actionItems, { onRun: function (key) { this.run(key); } });
    }
  });
})();
