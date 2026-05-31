(function () {
  'use strict';
  var root = document.getElementById('ymir-vue-formatter-app');
  if (!root) return;
  if (!window.YmirVueShared) {
    root.innerHTML = '<div class="ymir-vue-noscript">Shared tool UI failed to load. This tool cannot start.</div>';
    return;
  }
  var Shared = window.YmirVueShared;
  var ElementPlus = window.ElementPlus;

  function compactWhitespace(text) {
    return String(text || '').replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/([^:])\/\/.*$/gm, '$1').replace(/\s+/g, ' ').trim();
  }
  function countLines(text) { return String(text || '').split(/\r?\n/).length; }
  function formatBraces(input) {
    var src = String(input || '').replace(/\r\n/g, '\n').trim();
    var out = '', quote = '', escapeNext = false;
    for (var i = 0; i < src.length; i++) {
      var ch = src[i];
      if (quote) {
        out += ch;
        if (escapeNext) escapeNext = false;
        else if (ch === '\\') escapeNext = true;
        else if (ch === quote) quote = '';
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { quote = ch; out += ch; continue; }
      if (ch === '{') out += ' {\n';
      else if (ch === '}') out += '\n}\n';
      else if (ch === ';') out += ';\n';
      else if (ch === ',') out += ', ';
      else out += ch;
    }
    var lines = out.split(/\n+/), level = 0, result = [];
    lines.forEach(function (line) {
      line = line.replace(/[ \t]+/g, ' ').trim();
      if (!line) return;
      if (/^}/.test(line)) level = Math.max(0, level - 1);
      if (/^else\b|^catch\b|^finally\b/.test(line) && result.length) result[result.length - 1] += ' ' + line;
      else result.push(Array(level + 1).join('  ') + line);
      if (/{\s*$/.test(line) && !/^}/.test(line)) level++;
    });
    return result.join('\n');
  }
  function formatPythonLike(input) {
    var level = 0, result = [];
    String(input || '').split(/\r?\n/).forEach(function (raw) {
      var line = raw.trim();
      if (!line) { if (result[result.length - 1] !== '') result.push(''); return; }
      if (/^(elif|else|except|finally)\b/.test(line)) level = Math.max(0, level - 1);
      result.push(Array(level + 1).join('    ') + line);
      if (/:\s*(#.*)?$/.test(line)) level++;
    });
    return result.join('\n').trim();
  }
  function formatKeywordBlocks(input, opts) {
    opts = opts || {};
    var open = opts.open || /\b(class|module|def|do|if|unless|case|begin|for|while|sub|function|select|with)\b/i;
    var middle = opts.middle || /\b(else|elsif|elseif|when|case)\b/i;
    var close = opts.close || /\b(end|next|loop|wend)\b/i;
    var level = 0, result = [];
    String(input || '').split(/\r?\n|;/).forEach(function (raw) {
      var line = raw.trim();
      if (!line) return;
      if (close.test(line)) level = Math.max(0, level - 1);
      if (middle.test(line)) level = Math.max(0, level - 1);
      result.push(Array(level + 1).join('  ') + line);
      if (open.test(line) && !close.test(line)) level++;
      if (middle.test(line)) level++;
    });
    return result.join('\n');
  }
  function formatSql(input) {
    var keywords = ['SELECT','FROM','WHERE','GROUP BY','ORDER BY','HAVING','LIMIT','VALUES','SET','JOIN','LEFT JOIN','RIGHT JOIN','INNER JOIN','OUTER JOIN','ON','AND','OR','CREATE','ALTER','DROP','INSERT INTO','UPDATE','DELETE FROM'];
    var text = String(input || '').replace(/\s+/g, ' ').trim();
    keywords.forEach(function (kw) {
      var pattern = new RegExp('\\s+' + kw.replace(/ /g, '\\s+') + '\\s+', 'ig');
      text = text.replace(pattern, '\n' + kw + ' ');
    });
    text = text.replace(/,\s*/g, ',\n  ');
    return text.split(/\n/).map(function (line) { return line.trim(); }).filter(Boolean).join('\n');
  }
  function formatCode(input, mode) {
    if (mode === 'sql') return formatSql(input);
    if (mode === 'python') return formatPythonLike(input);
    if (mode === 'ruby') return formatKeywordBlocks(input, { open:/\b(class|module|def|do|if|unless|case|begin|for|while)\b/i, middle:/\b(else|elsif|when|rescue|ensure)\b/i, close:/\bend\b/i });
    if (mode === 'vbs') return formatKeywordBlocks(input, { open:/\b(sub|function|if|for|do|while|select|with)\b/i, middle:/\b(else|elseif|case)\b/i, close:/\b(end|next|loop|wend)\b/i });
    if (mode === 'perl') return formatBraces(input).replace(/\n\s*}/g, '\n}');
    return formatBraces(input);
  }

  var TOOLS = {
    formatc: { icon:'C', title:'C Code Formatter', category:'Code Formatter', desc:'Format C snippets with a heuristic formatter and copy the result for review.', mode:'c', sample:'int main(){printf("Hello Ymir Tool");return 0;}', tags:['C','Formatter','Copy-ready'] },
    formatcpp: { icon:'C++', title:'C++ Code Formatter', category:'Code Formatter', desc:'Format C++ snippets with brace-aware indentation.', mode:'cpp', sample:'#include <iostream>\nint main(){std::cout<<"Hello";return 0;}', tags:['C++','Formatter','Copy-ready'] },
    formatcs: { icon:'C#', title:'C# Code Formatter', category:'Code Formatter', desc:'Format C# methods, classes, and blocks into readable indentation.', mode:'csharp', sample:'public class App{public void Run(){Console.WriteLine("Hello");}}', tags:['C#','Formatter','Copy-ready'] },
    formatcsql: { icon:'SQL', title:'SQL Code Formatter', category:'Code Formatter', desc:'Format common SQL clauses and comma-separated columns into readable lines.', mode:'sql', sample:'select id,name,email from users where active=1 order by created_at desc', tags:['SQL','Formatter','Copy'] },
    formatjava: { icon:'JAVA', title:'Java Code Formatter', category:'Code Formatter', desc:'Format Java classes and methods with readable indentation and copy-ready output.', mode:'java', sample:'public class App{public static void main(String[] args){System.out.println("Hello");}}', tags:['Java','Formatter','Copy-ready'] },
    formatperl: { icon:'PERL', title:'Perl Code Formatter', category:'Code Formatter', desc:'Format Perl blocks and simple statements before pasting into scripts.', mode:'perl', sample:'sub hello{my $name=shift;print "Hello $name\\n";}hello("Ymir");', tags:['Perl','Formatter','Copy-ready'] },
    formatphp: { icon:'PHP', title:'PHP Code Formatter', category:'Code Formatter', desc:'Format PHP blocks and statements with a quick heuristic formatter.', mode:'php', sample:'<?php function hello($name){echo "Hello ".$name;} hello("Ymir"); ?>', tags:['PHP','Formatter','Copy-ready'] },
    formatpy: { icon:'PY', title:'Python Code Formatter', category:'Code Formatter', desc:'Format indentation for simple Python blocks using colon-based rules.', mode:'python', sample:'def hello(name):\nprint("Hello", name)\nif name:\nprint("ready")', tags:['Python','Formatter','Copy-ready'] },
    formatruby: { icon:'RB', title:'Ruby Code Formatter', category:'Code Formatter', desc:'Format Ruby keyword blocks for quick cleanup and copying.', mode:'ruby', sample:'class App\ndef hello(name)\nputs "Hello #{name}"\nend\nend', tags:['Ruby','Formatter','Copy-ready'] },
    formatvbs: { icon:'VBS', title:'VBScript Code Formatter', category:'Code Formatter', desc:'Format VBScript Sub, Function, If, For, and Select blocks quickly.', mode:'vbs', sample:'Sub Hello(name)\nIf name <> "" Then\nMsgBox "Hello " & name\nEnd If\nEnd Sub', tags:['VBScript','Formatter','Copy-ready'] }
  };

  var toolKey = root.getAttribute('data-tool') || 'formatc';
  var initialTool = TOOLS[toolKey] || TOOLS.formatc;
  Shared.mountConfiguredToolApp({
    root: root,
    name: 'YmirVueFormatterToolsApp',
    data: function () {
      return { toolKey: toolKey, c: initialTool, lang: Shared.getLang(), input: initialTool.sample, output: '', statusType: 'info', statusTitle: 'Ready. Formatters in this batch use shared tool UI and local heuristic rules.' };
    },
    computed: {
      inputMeta: function () { return Shared.bytes(this.input) + ' bytes · ' + countLines(this.input) + ' lines'; },
      outputMeta: function () { return Shared.bytes(this.output) + ' bytes · ' + countLines(this.output) + ' lines'; },
      actionItems: function () { return [
        { key:'format', label:this.lang === 'zh' ? '格式化' : 'Format code', type:'primary' },
        { key:'compact', label:this.lang === 'zh' ? '压缩空白' : 'Compact' },
        { key:'sample', label:this.lang === 'zh' ? '载入示例' : 'Load sample' },
        { key:'copy', label:this.lang === 'zh' ? '复制结果' : 'Copy result' },
        { key:'clear', label:this.lang === 'zh' ? '清空' : 'Clear' }
      ]; }
    },
    methods: {
      setLang: function (v) { this.lang = Shared.setLang(v); this.statusTitle = this.lang === 'zh' ? '已切换语言。' : 'Language switched.'; },
      run: function (key) {
        try {
          if (key === 'sample') { this.input = this.c.sample; this.output = ''; this.statusType = 'info'; this.statusTitle = this.lang === 'zh' ? '已载入示例。' : 'Sample loaded.'; return; }
          if (key === 'clear') { this.input = ''; this.output = ''; this.statusType = 'info'; this.statusTitle = this.lang === 'zh' ? '已清空。' : 'Cleared.'; return; }
          if (key === 'copy') { Shared.copyText(this.output, ElementPlus); return; }
          if (!String(this.input || '').trim()) throw new Error('Paste code first.');
          if (key === 'compact') this.output = compactWhitespace(this.input);
          else this.output = formatCode(this.input, this.c.mode);
          this.statusType = 'success';
          this.statusTitle = this.lang === 'zh' ? '已生成结果。该格式化器为启发式规则，生产代码请复核。' : 'Result generated. This formatter uses heuristic rules; review production code.';
        } catch (e) {
          this.statusType = 'error'; this.statusTitle = e && e.message ? e.message : 'Failed to process input.';
        }
      }
    },
    shell: function () {
      return { icon: this.c.icon, category: this.c.category, title: this.c.title, subtitle: this.c.desc, tags: this.c.tags, appClass: 'ymir-vue-app--formatter', footerTags: [{ label: 'Shared tool shell' }, { label: 'Copy-ready output' }, { label: 'Heuristic formatter' }] };
    },
    renderBody: function (h, El) {
      return Shared.renderTextWorkbench(h, El, this, {
        gridClass: 'ymir-vue-body',
        inputTitle: 'Input code', inputMeta: this.inputMeta, inputRows: 14,
        outputTitle: 'Formatted output', outputMeta: this.outputMeta, outputRows: 14
      });
    },
    renderActions: function (h, El) {
      return Shared.renderActionButtons(h, El, this, this.actionItems, { onRun: function (key) { this.run(key); } });
    }
  });
})();
