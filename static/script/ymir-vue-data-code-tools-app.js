(function () {
  'use strict';
  var root = document.getElementById('ymir-vue-data-code-app');
  if (!root) return;
  if (!window.Vue || !window.ElementPlus) {
    root.innerHTML = '<div class="ymir-vue-noscript">Vue or Element Plus assets failed to load. This tool cannot start.</div>';
    return;
  }
  var Vue = window.Vue;
  var ElementPlus = window.ElementPlus;
  var ElMessage = ElementPlus.ElMessage;
  var Shared = window.YmirVueShared || {};
  var bytes = Shared.bytes || function (text) { try { return new TextEncoder().encode(String(text || '')).length; } catch(e) { return unescape(encodeURIComponent(String(text || ''))).length; } };
  function copyText(text) { return (Shared.copyText || function(){ ElMessage.error('Copy failed.'); })(text, { copied:'Copied.', empty:'Nothing to copy.', failed:'Copy failed.' }); }
  function parseJson(text) { return JSON.parse(String(text || '').trim()); }
  function stringifyJson(value, compact) { return JSON.stringify(value, null, compact ? 0 : 2); }
  function escHtml(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function escAttr(s) { return String(s == null ? '' : s).replace(/[\\"\r\n]/g, function(c){ return {'\\':'\\\\','"':'\\"','\r':'\\r','\n':'\\n'}[c]; }); }
  function slugToName(key) { return String(key || 'value').replace(/[^A-Za-z0-9_]+/g, '_').replace(/^([0-9])/, '_$1'); }
  function upperName(key) { var s = slugToName(key); return s.charAt(0).toUpperCase() + s.slice(1); }
  function inferType(v, lang) {
    if (Array.isArray(v)) return lang === 'go' ? '[]' + inferType(v[0], lang) : (lang === 'cs' ? 'List<' + inferType(v[0], lang) + '>' : inferType(v[0], lang) + '[]');
    if (v === null) return lang === 'go' ? 'interface{}' : (lang === 'cs' ? 'object' : 'Object');
    if (typeof v === 'number') return Number.isInteger(v) ? (lang === 'go' ? 'int' : 'int') : (lang === 'go' ? 'float64' : (lang === 'cs' ? 'double' : 'double'));
    if (typeof v === 'boolean') return lang === 'go' ? 'bool' : 'boolean';
    if (typeof v === 'object') return lang === 'go' ? 'struct{}' : 'Object';
    return lang === 'go' ? 'string' : 'String';
  }
  function sampleObject(value) { if (Array.isArray(value)) return value[0] || {}; return value && typeof value === 'object' ? value : { value: value }; }
  function jsonToCs(input) {
    var obj = sampleObject(parseJson(input));
    var lines = ['public class Root', '{'];
    Object.keys(obj).forEach(function(k){ lines.push('    public ' + inferType(obj[k], 'cs') + ' ' + upperName(k) + ' { get; set; }'); });
    lines.push('}'); return lines.join('\n');
  }
  function jsonToJava(input) {
    var obj = sampleObject(parseJson(input));
    var lines = ['public class Root {'];
    Object.keys(obj).forEach(function(k){ lines.push('    private ' + inferType(obj[k], 'java') + ' ' + slugToName(k) + ';'); });
    lines.push('}'); return lines.join('\n');
  }
  function jsonToGo(input) {
    var obj = sampleObject(parseJson(input));
    var lines = ['type Root struct {'];
    Object.keys(obj).forEach(function(k){ lines.push('    ' + upperName(k) + ' ' + inferType(obj[k], 'go') + ' `json:"' + k + '"`'); });
    lines.push('}'); return lines.join('\n');
  }
  function sqlTypeToJava(t) {
    t = String(t || '').toLowerCase();
    if (/bigint/.test(t)) return 'Long';
    if (/int|tinyint|smallint/.test(t)) return 'Integer';
    if (/decimal|numeric|double|float/.test(t)) return 'BigDecimal';
    if (/date|time/.test(t)) return 'LocalDateTime';
    if (/bool|bit/.test(t)) return 'Boolean';
    return 'String';
  }
  function sqlToJava(input) {
    var lines = String(input || '').split(/\r?\n/), fields = [];
    lines.forEach(function(line){
      var cleaned = line.replace(/[`",]/g,' ').trim();
      var m = cleaned.match(/^([A-Za-z_][\w]*)\s+([A-Za-z]+(?:\([^)]*\))?)/);
      if (m && !/^(create|primary|key|unique|index|constraint)$/i.test(m[1])) fields.push([m[1], m[2]]);
    });
    if (!fields.length) throw new Error('Paste CREATE TABLE columns or lines such as user_name varchar(64).');
    var out = ['public class Root {'];
    fields.forEach(function(f){ out.push('    private ' + sqlTypeToJava(f[1]) + ' ' + slugToName(f[0]) + ';'); });
    out.push('}'); return out.join('\n');
  }
  function jsonToQuery(input) {
    var obj = parseJson(input), params = new URLSearchParams();
    Object.keys(obj).forEach(function(k){ var v=obj[k]; if (Array.isArray(v)) v.forEach(function(x){ params.append(k, x); }); else params.set(k, v == null ? '' : String(v)); });
    return params.toString();
  }
  function queryToJson(input) {
    var text = String(input || '').replace(/^\?/, '');
    var params = new URLSearchParams(text), obj = {};
    params.forEach(function(v,k){ if (Object.prototype.hasOwnProperty.call(obj,k)) { if (!Array.isArray(obj[k])) obj[k] = [obj[k]]; obj[k].push(v); } else obj[k] = v; });
    return stringifyJson(obj, false);
  }
  function objToYaml(value, indent) {
    indent = indent || 0; var pad = Array(indent + 1).join('  ');
    if (Array.isArray(value)) return value.map(function(v){ return pad + '- ' + (typeof v === 'object' && v !== null ? '\n' + objToYaml(v, indent + 1) : String(v)); }).join('\n');
    if (value && typeof value === 'object') return Object.keys(value).map(function(k){ var v=value[k]; return pad + k + ':' + (typeof v === 'object' && v !== null ? '\n' + objToYaml(v, indent + 1) : ' ' + String(v)); }).join('\n');
    return pad + String(value);
  }
  function jsonToYaml(input) { return objToYaml(parseJson(input), 0); }
  function objToXml(name, value) {
    name = slugToName(name || 'root');
    if (Array.isArray(value)) return value.map(function(v){ return objToXml(name, v); }).join('');
    if (value && typeof value === 'object') return '<' + name + '>' + Object.keys(value).map(function(k){ return objToXml(k, value[k]); }).join('') + '</' + name + '>';
    return '<' + name + '>' + escHtml(value) + '</' + name + '>';
  }
  function jsonToXml(input) { return '<?xml version="1.0" encoding="UTF-8"?>\n' + objToXml('root', parseJson(input)); }
  function xmlNodeToObject(node) {
    var children = Array.prototype.filter.call(node.childNodes || [], function(n){ return n.nodeType === 1; });
    if (!children.length) return node.textContent;
    var obj = {};
    children.forEach(function(ch){ var val = xmlNodeToObject(ch); if (obj[ch.nodeName] !== undefined) { if (!Array.isArray(obj[ch.nodeName])) obj[ch.nodeName]=[obj[ch.nodeName]]; obj[ch.nodeName].push(val); } else obj[ch.nodeName] = val; });
    return obj;
  }
  function xmlToJson(input) {
    var doc = new DOMParser().parseFromString(String(input || ''), 'application/xml');
    if (doc.querySelector('parsererror')) throw new Error('Invalid XML.');
    var rootEl = doc.documentElement, obj = {}; obj[rootEl.nodeName] = xmlNodeToObject(rootEl);
    return stringifyJson(obj, false);
  }
  function parseCsv(text) {
    var rows = [], row = [], value = '', q = false, s = String(text || '');
    for (var i=0;i<s.length;i++) { var c=s[i], n=s[i+1];
      if (q && c === '"' && n === '"') { value += '"'; i++; }
      else if (c === '"') q = !q;
      else if (!q && c === ',') { row.push(value); value=''; }
      else if (!q && (c === '\n' || c === '\r')) { if (c==='\r' && n==='\n') i++; row.push(value); if (row.length>1 || row[0]) rows.push(row); row=[]; value=''; }
      else value += c;
    }
    row.push(value); if (row.length>1 || row[0]) rows.push(row); return rows;
  }
  function csvEscape(v) { v = String(v == null ? '' : v); return /[",\r\n]/.test(v) ? '"' + v.replace(/"/g,'""') + '"' : v; }
  function csvToJson(input) {
    var rows = parseCsv(input); if (!rows.length) return '[]';
    var head = rows.shift().map(function(h,i){ return h || ('column_' + (i+1)); });
    return stringifyJson(rows.map(function(r){ var o={}; head.forEach(function(h,i){ o[h]=r[i] || ''; }); return o; }), false);
  }
  function jsonToCsv(input) {
    var data = parseJson(input); if (!Array.isArray(data)) data = [data];
    var keys = []; data.forEach(function(o){ Object.keys(o || {}).forEach(function(k){ if (keys.indexOf(k) < 0) keys.push(k); }); });
    return [keys.join(',')].concat(data.map(function(o){ return keys.map(function(k){ return csvEscape(o ? o[k] : ''); }).join(','); })).join('\n');
  }
  function csvToHtmlTable(input) {
    var rows = parseCsv(input); if (!rows.length) throw new Error('Paste CSV rows first.');
    var html = ['<table>'];
    rows.forEach(function(r,idx){ html.push('  <tr>' + r.map(function(c){ return '<' + (idx===0?'th':'td') + '>' + escHtml(c) + '</' + (idx===0?'th':'td') + '>'; }).join('') + '</tr>'); });
    html.push('</table>'); return html.join('\n');
  }
  function jsonMinify(input) { return stringifyJson(parseJson(input), true); }
  function jsonFormat(input) { return stringifyJson(parseJson(input), false); }
  function jsonEscape(input) { return JSON.stringify(String(input || '')); }
  function jsonUnescape(input) { return JSON.parse(String(input || '').trim()); }
  function lineStatements(input, prefix, suffix) {
    return String(input || '').split(/\r?\n/).map(function(line){ return prefix + escAttr(line) + suffix; }).join('\n');
  }
  function htmlToJs(input) { return lineStatements(input, 'document.writeln("', '");'); }
  function jsToHtml(input) { return String(input || '').replace(/document\.writeln\("([\s\S]*?)"\);?/g, function(_, s){ return s.replace(/\\"/g,'"').replace(/\\n/g,'\n').replace(/\\\\/g,'\\'); }); }
  function htmlToPhp(input) { return lineStatements(input, 'echo "', '\\n";'); }
  function htmlToCj(input) { return lineStatements(input, 'sb.AppendLine("', '");'); }
  function htmlToAll(input) { return ['// ASP / VBScript', lineStatements(input, 'Response.Write "', '"'), '', '// Perl', lineStatements(input, 'print "', '\\n";')].join('\n'); }
  function htmlToUbb(input) { return String(input || '').replace(/<\s*strong\s*>/gi,'[b]').replace(/<\s*\/\s*strong\s*>/gi,'[/b]').replace(/<\s*em\s*>/gi,'[i]').replace(/<\s*\/\s*em\s*>/gi,'[/i]').replace(/<\s*a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\s*\/\s*a\s*>/gi,'[url=$1]$2[/url]').replace(/<br\s*\/?>/gi,'\n').replace(/<[^>]+>/g,''); }
  function mdToHtml(input) { return String(input || '').split(/\r?\n/).map(function(line){ if (/^#\s+/.test(line)) return '<h1>' + escHtml(line.replace(/^#\s+/,'')) + '</h1>'; if (/^##\s+/.test(line)) return '<h2>' + escHtml(line.replace(/^##\s+/,'')) + '</h2>'; if (/^-\s+/.test(line)) return '<li>' + escHtml(line.replace(/^-\s+/,'')) + '</li>'; return line ? '<p>' + escHtml(line) + '</p>' : ''; }).join('\n'); }
  function htmlToMd(input) { return String(input || '').replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi,'# $1\n').replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi,'## $1\n').replace(/<li[^>]*>([\s\S]*?)<\/li>/gi,'- $1\n').replace(/<br\s*\/?>/gi,'\n').replace(/<[^>]+>/g,'').replace(/\n{3,}/g,'\n\n').trim(); }

  var TOOLS = {
    json2xml:{title:'JSON ⇄ XML Converter', category:'Data Converter', icon:'XML', desc:'Convert JSON objects to XML and parse simple XML back to JSON locally.', sample:'{"user":{"id":1,"name":"Ymir"},"active":true}', actions:['jsonToXml','xmlToJson']},
    json2yaml:{title:'JSON to YAML Converter', category:'Data Converter', icon:'YAML', desc:'Convert JSON arrays or objects to readable YAML-style text.', sample:'{"name":"Ymir","tools":["json","base64"],"active":true}', actions:['jsonToYaml','jsonFormat']},
    json2get:{title:'JSON ⇄ GET Query Converter', category:'Data Converter', icon:'GET', desc:'Convert flat JSON objects to URL query strings and parse query strings back to JSON.', sample:'{"q":"ymir tool","page":1,"lang":"en"}', actions:['jsonToQuery','queryToJson']},
    jsonzip:{title:'JSON Minify / Escape Tool', category:'JSON Tool', icon:'ZIP', desc:'Minify JSON, pretty-print JSON, and escape or unescape JSON string values.', sample:'{\n  "name": "Ymir",\n  "enabled": true\n}', actions:['jsonMinify','jsonFormat','jsonEscape','jsonUnescape']},
    jsonlrview:{title:'JSON Left / Right Viewer', category:'JSON Tool', icon:'JSON', desc:'Format and inspect JSON in a copy-ready Vue workbench.', sample:'{"items":[{"id":1,"name":"Alpha"},{"id":2,"name":"Beta"}]}', actions:['jsonFormat','jsonMinify']},
    jsonudview:{title:'JSON Up / Down Viewer', category:'JSON Tool', icon:'JSON', desc:'Pretty-print or minify JSON for quick inspection and debugging.', sample:'{"status":"ok","count":2,"items":[1,2]}', actions:['jsonFormat','jsonMinify']},
    json2cs:{title:'JSON to C# Class Generator', category:'Code Generator', icon:'C#', desc:'Generate a simple C# class skeleton from a JSON object or array sample.', sample:'{"id":1,"name":"Ymir","active":true,"score":9.8}', actions:['jsonToCs']},
    json2java:{title:'JSON to Java Class Generator', category:'Code Generator', icon:'JAVA', desc:'Generate a simple Java field model from a JSON object or array sample.', sample:'{"id":1,"name":"Ymir","active":true,"score":9.8}', actions:['jsonToJava']},
    json2go:{title:'JSON to Go Struct Generator', category:'Code Generator', icon:'GO', desc:'Generate a simple Go struct from a JSON object or array sample.', sample:'{"id":1,"name":"Ymir","active":true,"score":9.8}', actions:['jsonToGo']},
    sql2java:{title:'SQL to Java Entity Field Generator', category:'Code Generator', icon:'SQL', desc:'Parse simple CREATE TABLE columns and generate Java entity fields.', sample:'CREATE TABLE users (\n  id bigint,\n  user_name varchar(64),\n  active tinyint,\n  created_at datetime\n);', actions:['sqlToJava']},
    excel2json:{title:'CSV / Excel Text to JSON', category:'Data Converter', icon:'CSV', desc:'Paste CSV text copied from Excel and convert it into a JSON array.', sample:'id,name,active\n1,Ymir,true\n2,Tool,false', actions:['csvToJson']},
    json2excel:{title:'JSON to CSV / Excel Text', category:'Data Converter', icon:'CSV', desc:'Convert JSON arrays or objects to CSV text that can be opened in Excel.', sample:'[{"id":1,"name":"Ymir"},{"id":2,"name":"Tool"}]', actions:['jsonToCsv']},
    html2js:{title:'HTML to JavaScript String', category:'HTML Converter', icon:'JS', desc:'Convert HTML lines into document.writeln JavaScript statements.', sample:'<section>\n  <h1>Hello</h1>\n</section>', actions:['htmlToJs','jsToHtml']},
    htmloutjs:{title:'HTML / JS Output Converter', category:'HTML Converter', icon:'JS', desc:'Convert HTML to JavaScript output statements or recover simple document.writeln snippets.', sample:'<div class="card">Ymir Tool</div>', actions:['htmlToJs','jsToHtml']},
    html2php:{title:'HTML to PHP Echo Converter', category:'HTML Converter', icon:'PHP', desc:'Convert HTML lines into PHP echo statements.', sample:'<p>Hello Ymir Tool</p>', actions:['htmlToPhp']},
    html2cj:{title:'HTML to C# / JSP String Converter', category:'HTML Converter', icon:'C#', desc:'Convert HTML lines into append-line style code snippets.', sample:'<ul>\n  <li>Alpha</li>\n</ul>', actions:['htmlToCj']},
    html2all:{title:'HTML to ASP / Perl Converter', category:'HTML Converter', icon:'ASP', desc:'Convert HTML lines into ASP Response.Write and Perl print snippets.', sample:'<h1>Ymir Tool</h1>\n<p>Free browser tools.</p>', actions:['htmlToAll']},
    html2ubb:{title:'HTML to UBB Converter', category:'HTML Converter', icon:'UBB', desc:'Convert common HTML tags to lightweight UBB-style forum markup.', sample:'<strong>Hello</strong> <em>Ymir</em> <a href="https://ymirtool.com/">Tool</a>', actions:['htmlToUbb']},
    htmlfromcsv:{title:'CSV to HTML Table', category:'HTML Converter', icon:'TABLE', desc:'Convert CSV copied from spreadsheets into an HTML table.', sample:'Name,Type,Status\nJSON,Tool,Ready\nBase64,Tool,Ready', actions:['csvToHtmlTable']},
    htmltable:{title:'HTML Table Generator', category:'HTML Converter', icon:'TABLE', desc:'Generate an HTML table from CSV-like rows.', sample:'Name,Value\nWidth,120\nHeight,80', actions:['csvToHtmlTable']},
    htmlmarkdown:{title:'HTML ⇄ Markdown Converter', category:'HTML Converter', icon:'MD', desc:'Convert simple Markdown to HTML or strip basic HTML into Markdown-like text.', sample:'# Ymir Tool\n\n- JSON\n- Base64', actions:['mdToHtml','htmlToMd']}
  };
  var ACTIONS = {jsonToXml:jsonToXml, xmlToJson:xmlToJson, jsonToYaml:jsonToYaml, jsonFormat:jsonFormat, jsonToQuery:jsonToQuery, queryToJson:queryToJson, jsonMinify:jsonMinify, jsonEscape:jsonEscape, jsonUnescape:jsonUnescape, jsonToCs:jsonToCs, jsonToJava:jsonToJava, jsonToGo:jsonToGo, sqlToJava:sqlToJava, csvToJson:csvToJson, jsonToCsv:jsonToCsv, htmlToJs:htmlToJs, jsToHtml:jsToHtml, htmlToPhp:htmlToPhp, htmlToCj:htmlToCj, htmlToAll:htmlToAll, htmlToUbb:htmlToUbb, csvToHtmlTable:csvToHtmlTable, mdToHtml:mdToHtml, htmlToMd:htmlToMd};
  var LABELS = {jsonToXml:'JSON → XML', xmlToJson:'XML → JSON', jsonToYaml:'JSON → YAML', jsonFormat:'Format JSON', jsonToQuery:'JSON → Query', queryToJson:'Query → JSON', jsonMinify:'Minify JSON', jsonEscape:'Escape string', jsonUnescape:'Unescape string', jsonToCs:'Generate C#', jsonToJava:'Generate Java', jsonToGo:'Generate Go', sqlToJava:'Generate Java', csvToJson:'CSV → JSON', jsonToCsv:'JSON → CSV', htmlToJs:'HTML → JS', jsToHtml:'JS → HTML', htmlToPhp:'HTML → PHP', htmlToCj:'HTML → C# / JSP', htmlToAll:'HTML → ASP / Perl', htmlToUbb:'HTML → UBB', csvToHtmlTable:'CSV → HTML table', mdToHtml:'Markdown → HTML', htmlToMd:'HTML → Markdown'};

  var App = {
    data: function () {
      var slug = root.getAttribute('data-tool') || 'json2xml';
      var cfg = TOOLS[slug] || TOOLS.json2xml;
      return { slug: slug, cfg: cfg, input: cfg.sample || '', output: '', statusType: 'info', statusText: 'Ready. Paste input or load the sample, then run an action.', labels: LABELS };
    },
    computed: {
      inputMeta: function () { return bytes(this.input) + ' bytes'; },
      outputMeta: function () { return bytes(this.output) + ' bytes'; },
      frameTool: function () { return { icon: this.cfg.icon, category: this.cfg.category, title: this.cfg.title, desc: this.cfg.desc, tags: ['Local browser processing', 'Vue 3', 'Copy-ready'] }; }
    },
    methods: {
      noop: function () {},
      loadSample: function () { this.input = this.cfg.sample || ''; this.output = ''; this.statusType = 'info'; this.statusText = 'Sample loaded.'; },
      clearAll: function () { this.input = ''; this.output = ''; this.statusType = 'info'; this.statusText = 'Cleared.'; },
      copyOutput: function () { copyText(this.output); },
      copyInput: function () { copyText(this.input); },
      run: function (action) {
        try {
          this.output = String(ACTIONS[action](this.input));
          this.statusType = 'success'; this.statusText = 'Output updated.';
        } catch (e) {
          this.statusType = 'error'; this.statusText = e && e.message ? e.message : 'Action failed.';
        }
      }
    },
    template: '<ymir-tool-frame class="ymir-vue-app--data-code" :tool="frameTool" lang="en" :status-type="statusType" :status-title="statusText" @update-lang="noop"><template #body><div class="ymir-vue-body"><el-card class="ymir-vue-panel"><template #header><div class="ymir-vue-panel__top"><span class="ymir-vue-panel__title"><i class="ymir-vue-panel__dot"></i>Input</span><span class="ymir-vue-panel__meta">{{inputMeta}}</span></div></template><el-input v-model="input" type="textarea" :rows="16" resize="vertical" spellcheck="false"/><div class="ymir-vue-toolbar"><el-button @click="loadSample">Load sample</el-button><el-button @click="copyInput">Copy input</el-button><el-button @click="clearAll">Clear</el-button></div></el-card><el-card class="ymir-vue-panel ymir-vue-output"><template #header><div class="ymir-vue-panel__top"><span class="ymir-vue-panel__title"><i class="ymir-vue-panel__dot"></i>Output</span><span class="ymir-vue-panel__meta">{{outputMeta}}</span></div></template><el-input v-model="output" type="textarea" :rows="16" resize="vertical" readonly spellcheck="false"/><div class="ymir-vue-toolbar"><el-button type="success" @click="copyOutput">Copy output</el-button></div></el-card></div></template><template #actions><el-button type="primary" v-for="a in cfg.actions" :key="a" @click="run(a)">{{labels[a] || a}}</el-button></template><template #footer><el-tag>Review generated code before production use</el-tag><el-tag>Plain text only</el-tag><el-tag>No upload required</el-tag></template></ymir-tool-frame>'
  };
  var app = Vue.createApp(App);
  if (Shared.components) Object.keys(Shared.components).forEach(function (name) { app.component(name, Shared.components[name]); });
  app.use(ElementPlus);
  app.mount(root);
})();
