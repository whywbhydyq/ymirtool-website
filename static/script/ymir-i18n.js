(function () {
  var STORAGE_KEY = 'ymir_lang';
  var currentLang = 'en';

  function normalizeLang(value) {
    value = String(value || '').toLowerCase();
    if (value.indexOf('zh') === 0 || value.indexOf('cn') === 0) return 'zh';
    if (value.indexOf('en') === 0) return 'en';
    return '';
  }
  function queryLang() {
    try { return normalizeLang(new URLSearchParams(window.location.search).get('lang')); } catch (e) { return ''; }
  }
  function storedLang() {
    try { return normalizeLang(localStorage.getItem(STORAGE_KEY)); } catch (e) { return ''; }
  }
  function browserLang() {
    var langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
    for (var i = 0; i < langs.length; i++) {
      var n = normalizeLang(langs[i]);
      if (n) return n;
    }
    return 'en';
  }
  function detectLang() { return queryLang() || storedLang() || browserLang() || 'en'; }
  function textFor(value) { return value && value[currentLang] != null ? value[currentLang] : ''; }
  function setText(el, value) { if (el && value != null) el.textContent = value; }
  function setPlaceholder(id, value) { var el = document.getElementById(id); if (el && value != null) el.setAttribute('placeholder', value); }
  function setBySelector(selector, value) { setText(document.querySelector(selector), value); }
  function setByAll(selector, values) {
    var els = document.querySelectorAll(selector);
    for (var i = 0; i < els.length && i < values.length; i++) setText(els[i], values[i]);
  }
  function applyDataAttrs() {
    document.querySelectorAll('[data-i18n-zh],[data-i18n-en]').forEach(function (el) {
      var value = el.getAttribute('data-i18n-' + currentLang);
      if (value != null) el.textContent = value;
    });
    document.querySelectorAll('[data-i18n-placeholder-zh],[data-i18n-placeholder-en]').forEach(function (el) {
      var value = el.getAttribute('data-i18n-placeholder-' + currentLang);
      if (value != null) el.setAttribute('placeholder', value);
    });
    document.querySelectorAll('[data-i18n-aria-label-zh],[data-i18n-aria-label-en]').forEach(function (el) {
      var value = el.getAttribute('data-i18n-aria-label-' + currentLang);
      if (value != null) el.setAttribute('aria-label', value);
    });
  }

  var common = {
    nav: {
      '/json/': { zh: 'JSON', en: 'JSON' },
      '/base64/': { zh: 'Base64', en: 'Base64' },
      '/md5/': { zh: 'MD5', en: 'MD5' },
      '/formatjs/': { zh: 'JS 格式化', en: 'JavaScript' },
      '/textdiff/': { zh: '文本对比', en: 'Text Diff' },
      '/guides.html': { zh: '指南', en: 'Guides' }
    },
    trust: {
      zh: ['浏览器本地处理', '无需注册', '免费使用'],
      en: ['Runs in your browser', 'No registration', 'Free to use']
    },
    footer: {
      zh: '多数文本和编码工具在浏览器中处理。',
      en: 'Most text and encoding tools run in your browser.'
    }
  };

  var homeCards = {
    '/json/': { zh: ['JSON 格式化', '格式化、校验和压缩 JSON。'], en: ['JSON Formatter', 'Format, validate, and minify JSON.'] },
    '/base64/': { zh: ['Base64 编码 / 解码', '编码和解码 UTF-8 文本。'], en: ['Base64 Encoder / Decoder', 'Encode and decode UTF-8 text.'] },
    '/md5/': { zh: ['MD5 哈希生成器', '生成 32 位和 16 位 MD5 哈希。'], en: ['MD5 Hash Generator', 'Generate 32-bit and 16-bit MD5 hashes.'] },
    '/urlencode/': { zh: ['URL 编码 / 解码', '编码中文、空格和查询参数。'], en: ['URL Encoder / Decoder', 'Encode Chinese, spaces, and query strings.'] },
    '/formatjs/': { zh: ['JavaScript 格式化', '整理 JavaScript 代码片段。'], en: ['JavaScript Formatter', 'Clean up JavaScript snippets.'] },
    '/unixtime/': { zh: ['Unix 时间戳转换', '转换秒、毫秒和日期。'], en: ['Unix Timestamp Converter', 'Convert seconds, milliseconds, and dates.'] },
    '/textdiff/': { zh: ['文本对比', '逐行比较两段文本。'], en: ['Text Diff', 'Compare two text blocks line by line.'] },
    '/txtcount/': { zh: ['字数统计', '统计字符、单词、行数和字节。'], en: ['Word Counter', 'Count characters, words, lines, and bytes.'] },
    '/regex/': { zh: ['正则测试', '用样本文本测试正则表达式。'], en: ['Regex Tester', 'Test patterns against sample text.'] },
    '/calculator/': { zh: ['科学计算器', '快速运行基础计算。'], en: ['Scientific Calculator', 'Run basic calculations quickly.'] },
    '/guid/': { zh: ['GUID 生成器', '生成一个或多个 GUID 值。'], en: ['GUID Generator', 'Generate one or many GUID values.'] },
    '/password/': { zh: ['密码生成器', '在本地创建随机密码。'], en: ['Password Generator', 'Create local random passwords.'] }
  };

  var home = {
    eyebrow: { zh: '免费在线工具箱', en: 'Free Online Toolbox' },
    title: { zh: '免费在线工具箱', en: 'Free browser-based tools for developers' },
    subtitle: { zh: '快速完成 JSON 格式化、URL 编码、哈希生成、文本对比和时间戳转换。', en: 'Format JSON, encode URLs, generate hashes, compare text, and convert timestamps.' },
    search: { zh: '搜索工具：JSON、MD5、Base64、URL、时间戳、文本对比...', en: 'Search tools: JSON, MD5, Base64, URL, timestamp, text diff...' },
    featuredTitle: { zh: '常用工具', en: 'Featured tools' },
    featuredSubtitle: { zh: '从最常用的格式化、编码、哈希和文本工具开始。', en: 'Start with the most common formatting, encoding, hashing, and text utilities.' },
    whyTitle: { zh: '为什么使用 Ymir Tool？', en: 'Why use Ymir Tool?' },
    whyTexts: {
      zh: ['无需注册。粘贴内容、运行工具、复制结果。', '多数文本、编码、哈希和格式化工具在浏览器中处理。涉及网络检测或外部请求的工具，会在具体页面说明。'],
      en: ['No signup. Paste input, run a clear action, and copy the result.', 'Most text, encoding, hashing, and formatting tools run in your browser. Network-related or external-service tools are described on their pages when applicable.']
    },
    directoryTitle: { zh: '全部工具目录', en: 'Full tool directory' },
    directorySubtitle: { zh: '浏览所有分类。搜索会同时匹配英文、中文、别名和目录链接。', en: 'Browse all categories; search matches English, Chinese, aliases, and directory links.' },
    noResult: { zh: '没有找到匹配工具。请尝试其他关键词。', en: 'No matching tools found. Try another keyword.' }
  };

  var tools = {
    json: { eyebrow: ['开发者工具', 'Developer Tool'], title: ['JSON 格式化与校验', 'JSON Formatter and Validator'], subtitle: ['粘贴 JSON，格式化、校验、压缩并复制清理后的结果。处理过程在浏览器中完成。', 'Paste JSON, format it, validate syntax, minify it, and copy the cleaned result. Processing runs in your browser.'], panels: [['JSON 输入', '格式化输出'], ['JSON Input', 'Formatted Output']], placeholders: { toolInput: ['在这里粘贴 JSON', 'Paste JSON here'], toolOutput: ['结果', 'Result'] } },
    base64: { eyebrow: ['编码工具', 'Encoding Tool'], title: ['Base64 编码与解码', 'Base64 Encoder and Decoder'], subtitle: ['将 UTF-8 文本编码为 Base64，或将 Base64 解码回可读文本。Base64 是编码，不是加密。', 'Encode UTF-8 text to Base64 or decode Base64 back to readable text. Base64 is encoding, not encryption.'], panels: [['文本或 Base64 输入', '输出'], ['Text or Base64 Input', 'Output']], placeholders: { toolInput: ['粘贴文本或 Base64', 'Paste text or Base64 here'], toolOutput: ['结果', 'Result'] } },
    md5: { eyebrow: ['哈希工具', 'Hash Tool'], title: ['MD5 哈希生成器', 'MD5 Hash Generator'], subtitle: ['生成 32 位和 16 位 MD5 哈希，支持小写和大写。MD5 不是加密。', 'Generate 32-character and 16-character MD5 hashes in lowercase and uppercase. MD5 is not encryption.'], panels: [['文本输入', '32 位小写 MD5', '32 位大写 MD5', '16 位小写 MD5', '16 位大写 MD5'], ['Text Input', '32-character lowercase MD5', '32-character uppercase MD5', '16-character lowercase MD5', '16-character uppercase MD5']], placeholders: { toolInput: ['输入要生成哈希的文本', 'Enter text to hash'] } },
    formatjs: { eyebrow: ['代码格式化工具', 'Code Formatting Tool'], title: ['JavaScript 格式化与压缩', 'JavaScript Formatter and Minifier'], subtitle: ['格式化 JavaScript 片段以便阅读，或执行轻量压缩。它不是 linter 或编译器。', 'Format JavaScript snippets for readability or run a quick lightweight minify pass. This is not a linter or compiler.'], panels: [['JavaScript 输入', '格式化输出'], ['JavaScript Input', 'Formatted Output']], placeholders: { toolInput: ['粘贴 JavaScript', 'Paste JavaScript here'], toolOutput: ['结果', 'Result'] } },
    urlencode: { eyebrow: ['编码工具', 'Encoding Tool'], title: ['URL 编码与解码', 'URL Encoder and Decoder'], subtitle: ['在浏览器中直接编码或解码 URL、查询字符串、中文、空格和保留字符。', 'Encode or decode URLs, query strings, Chinese characters, spaces, and reserved characters directly in your browser.'], panels: [['URL 或文本输入', '输出'], ['URL or Text Input', 'Output']], placeholders: { toolInput: ['粘贴 URL 或文本', 'Paste URL or text here'], toolOutput: ['结果', 'Result'] } },
    unixtime: { eyebrow: ['时间工具', 'Time Tool'], title: ['Unix 时间戳转换器', 'Unix Timestamp Converter'], subtitle: ['将 Unix 时间戳转换为可读日期，或将日期转换回秒和毫秒。', 'Convert Unix timestamps to readable dates and convert dates back to seconds or milliseconds.'], panels: [['当前时间戳', '时间戳转日期', '日期转时间戳'], ['Current timestamp', 'Convert timestamp to date', 'Convert date to timestamp']], placeholders: { timestampInput: ['秒或毫秒', 'Seconds or milliseconds'], dateInput: ['2026-05-25 12:00:00', '2026-05-25 12:00:00'] } },
    textdiff: { eyebrow: ['文本工具', 'Text Tool'], title: ['文本对比工具', 'Text Diff Checker'], subtitle: ['逐行比较两段文本，查看新增、删除或变更的行。', 'Compare two text blocks line by line and see added, removed, or changed lines.'], panels: [['原始文本', '修改后文本', '差异摘要'], ['Original text', 'Changed text', 'Diff summary']], placeholders: { textA: ['粘贴原始文本', 'Paste original text'], textB: ['粘贴修改后文本', 'Paste changed text'], toolOutput: ['对比结果', 'Comparison result'] } },
    txtcount: { eyebrow: ['文本工具', 'Text Tool'], title: ['字数与字符统计', 'Word and Character Counter'], subtitle: ['输入时实时统计字符数、去空格字符数、单词数、行数、段落数和字节大小。', 'Count characters, characters without spaces, words, lines, paragraphs, and byte size as you type.'], panels: [['文本输入', '摘要'], ['Text Input', 'Summary']], placeholders: { toolInput: ['粘贴文本', 'Paste text here'] } },
    regex: { eyebrow: ['开发者工具', 'Developer Tool'], title: ['正则表达式测试', 'Regex Tester'], subtitle: ['用常见标志位测试正则表达式，并输出清晰的匹配结果。', 'Test regular expressions against sample text with common flags and clear match output.'], panels: [['表达式输入', '匹配结果', '测试文本'], ['Pattern input', 'Matches result', 'Test text']], placeholders: { regexPattern: ['输入正则表达式，不需要斜杠', 'Enter regular expression without slashes'], regexText: ['粘贴要测试的文本', 'Paste text to test'] } },
    calculator: { eyebrow: ['计算工具', 'Calculator Tool'], title: ['在线科学计算器', 'Online Scientific Calculator'], subtitle: ['在浏览器中快速计算数字、括号、百分号和基础运算符。', 'Run quick browser-based calculations with numbers, parentheses, percentages, and basic operators.'], panels: [['表达式', '结果'], ['Expression', 'Result']], placeholders: { calcInput: ['(128 + 256) / 3', '(128 + 256) / 3'] } },
    guid: { eyebrow: ['生成工具', 'Generator Tool'], title: ['GUID 生成器', 'GUID Generator'], subtitle: ['在浏览器中本地生成一个或多个 GUID / UUID 值。', 'Generate one or many GUID / UUID values locally in your browser.'], panels: [['生成 GUID 值'], ['Generate GUID values']], placeholders: { toolOutput: ['生成的 GUID 值', 'Generated GUID values'] } },
    password: { eyebrow: ['生成工具', 'Generator Tool'], title: ['密码生成器', 'Password Generator'], subtitle: ['使用长度和字符集选项在本地生成随机密码。', 'Generate random passwords locally with length and character-set controls.'], panels: [['密码选项'], ['Password options']], placeholders: { toolOutput: ['生成的密码', 'Generated password'] } }
  };

  var actionText = {
    'json-format': ['格式化 JSON', 'Format JSON'], 'json-minify': ['压缩', 'Minify'], 'json-validate': ['校验', 'Validate'],
    'base64-encode': ['编码', 'Encode'], 'base64-decode': ['解码', 'Decode'],
    'md5-generate': ['生成哈希', 'Generate Hash'], 'copy-lower32': ['复制小写', 'Copy Lowercase'], 'copy-upper32': ['复制大写', 'Copy Uppercase'],
    'js-format': ['格式化 JavaScript', 'Format JavaScript'], 'js-minify': ['压缩', 'Minify'],
    'url-encode-component': ['编码 URI 组件', 'Encode URI Component'], 'url-decode-component': ['解码 URI 组件', 'Decode URI Component'], 'url-encode-uri': ['编码 URI', 'Encode URI'], 'url-decode-uri': ['解码 URI', 'Decode URI'],
    'time-now': ['载入当前时间', 'Load Current Time'], 'timestamp-to-date': ['时间戳转日期', 'Timestamp to Date'], 'date-to-timestamp': ['日期转时间戳', 'Date to Timestamp'], 'copy-date': ['复制结果', 'Copy Result'],
    'diff-compare': ['对比', 'Compare'], 'regex-test': ['测试正则', 'Test Regex'], 'calc-run': ['计算', 'Calculate'], 'guid-generate': ['生成 GUID', 'Generate GUID'], 'password-generate': ['生成密码', 'Generate Password'],
    'load-example': ['载入示例', 'Load Example'], 'copy-output': ['复制结果', 'Copy Result'], 'clear-all': ['清空', 'Clear']
  };

  var exactText = {
    'How to use this tool / 使用说明': ['使用说明', 'How to use this tool'],
    'Privacy note / 隐私说明': ['隐私说明', 'Privacy note'],
    'FAQ / 常见问题': ['常见问题', 'FAQ'],
    'Related tools / 相关工具': ['相关工具', 'Related tools'],
    'Characters': ['字符数', 'Characters'],
    'No spaces': ['去空格字符', 'No spaces'],
    'Words': ['单词数', 'Words'],
    'Lines': ['行数', 'Lines'],
    'Paragraphs': ['段落数', 'Paragraphs'],
    'Bytes': ['字节', 'Bytes']
  };

  var messageExact = {
    'Copy failed': '复制失败', 'Nothing to copy': '没有可复制的内容', 'Copied result to clipboard.': '结果已复制到剪贴板。',
    'Valid JSON. Formatted with 2-space indentation.': 'JSON 有效，已按 2 个空格缩进格式化。', 'Valid JSON. Minified output is ready.': 'JSON 有效，压缩结果已生成。', 'Valid JSON. No syntax errors found.': 'JSON 有效，未发现语法错误。',
    'Example loaded. Click Format JSON to see the result.': '示例已载入。点击“格式化 JSON”查看结果。', 'Encoded as Base64. Base64 is encoding, not encryption.': '已编码为 Base64。Base64 是编码，不是加密。', 'Decoded Base64 text.': '已解码 Base64 文本。', 'Invalid Base64 input or unsupported binary data.': 'Base64 输入无效或包含不支持的二进制数据。', 'Example loaded. Click Encode to convert it.': '示例已载入。点击“编码”进行转换。',
    'Enter text before generating an MD5 hash.': '请先输入要生成 MD5 的文本。', 'MD5 hashes generated in your browser. MD5 is not encryption.': 'MD5 哈希已在浏览器中生成。MD5 不是加密。', 'Copied 32-character lowercase MD5.': '已复制 32 位小写 MD5。', 'Copied 32-character uppercase MD5.': '已复制 32 位大写 MD5。',
    'JavaScript formatted for readability.': 'JavaScript 已格式化，便于阅读。', 'Basic minified output is ready. This is not a full compiler.': '基础压缩结果已生成。此功能不是完整编译器。', 'Example loaded. Click Format JavaScript.': '示例已载入。点击“格式化 JavaScript”。',
    'Encoded with encodeURIComponent.': '已使用 encodeURIComponent 编码。', 'Decoded with decodeURIComponent.': '已使用 decodeURIComponent 解码。', 'Encoded with encodeURI.': '已使用 encodeURI 编码。', 'Decoded with decodeURI.': '已使用 decodeURI 解码。', 'Example loaded. Try Encode URI Component.': '示例已载入。可尝试“编码 URI 组件”。',
    'Current browser time loaded.': '已载入当前浏览器时间。', 'Enter a Unix timestamp.': '请输入 Unix 时间戳。', 'Timestamp must be a number.': '时间戳必须是数字。', 'Invalid timestamp.': '时间戳无效。', 'Timestamp converted using your browser timezone display.': '已按浏览器时区显示转换结果。', 'Enter a date/time value.': '请输入日期或时间。', 'Invalid date/time value.': '日期或时间无效。', 'Date converted to Unix timestamp.': '日期已转换为 Unix 时间戳。', 'Copied timestamp result.': '时间戳结果已复制。',
    'No line-level differences found.': '未发现行级差异。', 'Text statistics updated.': '文本统计已更新。', 'No matches found.': '未找到匹配项。', 'Enter a calculation first.': '请先输入计算表达式。', 'Only numbers, parentheses, and basic operators are supported.': '仅支持数字、括号和基础运算符。', 'Calculation complete.': '计算完成。', 'Result is not finite. Check division by zero.': '结果不是有限数，请检查是否除以零。', 'Copied result.': '结果已复制。', 'Select at least one character set.': '请至少选择一种字符集。', 'Password generated locally in your browser.': '密码已在浏览器中本地生成。'
  };

  function translateMessage(message) {
    if (currentLang !== 'zh' || !message) return message || '';
    var msg = String(message);
    if (messageExact[msg]) return messageExact[msg];
    if (msg.indexOf('Invalid JSON:') === 0) return 'JSON 无效：' + msg.slice(13).trim();
    if (msg.indexOf('Could not format JavaScript:') === 0) return '无法格式化 JavaScript：' + msg.slice(28).trim();
    if (msg.indexOf('Invalid percent-encoding:') === 0) return '百分号编码无效：' + msg.slice(25).trim();
    if (msg.indexOf('Invalid URI encoding:') === 0) return 'URI 编码无效：' + msg.slice(21).trim();
    if (msg.indexOf('Added lines:') === 0) return msg.replace('Added lines:', '新增行：').replace('Removed lines:', '删除行：').replace('Changed line pairs:', '变更行对：');
    if (msg.indexOf('Matches found:') === 0) return msg.replace('Matches found:', '匹配数量：');
    if (msg.indexOf('Regex error:') === 0) return '正则错误：' + msg.slice(12).trim();
    if (msg.indexOf('Calculation error:') === 0) return '计算错误：' + msg.slice(18).trim();
    if (msg.indexOf('Generated ') === 0 && msg.indexOf(' GUID value') > -1) return msg.replace('Generated ', '已生成 ').replace(' GUID values', ' 个 GUID').replace(' GUID value', ' 个 GUID').replace(' in your browser.', '。');
    return msg;
  }

  function injectToggle() {
    var inner = document.querySelector('.ymir-topbar-inner');
    if (!inner || inner.querySelector('.ymir-lang-toggle')) return;
    var wrap = document.createElement('div');
    wrap.className = 'ymir-lang-toggle';
    wrap.setAttribute('aria-label', 'Language');
    wrap.innerHTML = '<button type="button" data-ymir-lang-option="zh">中文</button><button type="button" data-ymir-lang-option="en">EN</button>';
    inner.appendChild(wrap);
    wrap.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-ymir-lang-option]');
      if (!btn) return;
      setLanguage(btn.getAttribute('data-ymir-lang-option'), true);
    });
  }
  function updateToggle() {
    document.querySelectorAll('[data-ymir-lang-option]').forEach(function (btn) {
      var active = btn.getAttribute('data-ymir-lang-option') === currentLang;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }
  function applyCommon() {
    document.querySelectorAll('.ymir-nav a').forEach(function (a) {
      var value = common.nav[a.getAttribute('href')];
      if (value) setText(a, textFor(value));
    });
    var badges = document.querySelectorAll('.ymir-trust-badge');
    var trust = common.trust[currentLang];
    for (var i = 0; i < badges.length && i < trust.length; i++) badges[i].textContent = trust[i];
    var foot = document.querySelector('.ymir-footer span:last-child');
    if (foot) foot.textContent = textFor(common.footer);
  }
  function applyHome() {
    if (!document.querySelector('.ymir-home-hero')) return;
    setBySelector('.ymir-hero-eyebrow', textFor(home.eyebrow));
    setBySelector('.ymir-hero-title', textFor(home.title));
    setBySelector('.ymir-hero-subtitle', textFor(home.subtitle));
    setPlaceholder('toolSearch', textFor(home.search));
    var input = document.getElementById('toolSearch');
    if (input) input.setAttribute('aria-label', currentLang === 'zh' ? '按中文或英文关键词搜索工具' : 'Search tools by English or Chinese keywords');
    setBySelector('#featuredTools .ymir-section-title', textFor(home.featuredTitle));
    setBySelector('#featuredTools .ymir-section-subtitle', textFor(home.featuredSubtitle));
    document.querySelectorAll('.ymir-featured-grid .ymir-tool-link').forEach(function (a) {
      var data = homeCards[a.getAttribute('href')];
      if (!data) return;
      var title = a.querySelector('strong');
      var desc = a.querySelector('span');
      setText(title, data[currentLang === 'zh' ? 'zh' : 'en'][0]);
      setText(desc, data[currentLang === 'zh' ? 'zh' : 'en'][1]);
    });
    var why = document.querySelectorAll('.ymir-card .ymir-section-title');
    if (why.length > 1) setText(why[1], textFor(home.whyTitle));
    var whyParas = document.querySelectorAll('.ymir-card .ymir-grid p');
    var whyText = home.whyTexts[currentLang];
    for (var i = 0; i < whyParas.length && i < whyText.length; i++) whyParas[i].textContent = whyText[i];
    var titles = document.querySelectorAll('.ymir-container > .ymir-section-title');
    for (var j = 0; j < titles.length; j++) {
      if (titles[j].textContent.indexOf('全部工具目录') > -1 || titles[j].textContent.indexOf('Full tool directory') > -1) setText(titles[j], textFor(home.directoryTitle));
    }
    var sub = document.querySelector('#toolDirectory') && document.querySelector('#toolDirectory').parentElement.querySelector('.ymir-section-subtitle');
    if (sub) sub.textContent = textFor(home.directorySubtitle);
    var no = document.getElementById('noResult');
    if (no) no.textContent = textFor(home.noResult);
  }
  function applyTool() {
    var page = document.querySelector('[data-ymir-tool]');
    if (!page) return;
    var key = page.getAttribute('data-ymir-tool');
    var data = tools[key];
    if (!data) return;
    var index = currentLang === 'zh' ? 0 : 1;
    setBySelector('.ymir-hero-eyebrow', data.eyebrow[index]);
    setBySelector('.ymir-hero-title', data.title[index]);
    setBySelector('.ymir-hero-subtitle', data.subtitle[index]);
    setByAll('.ymir-panel-title', data.panels[index]);
    Object.keys(data.placeholders || {}).forEach(function (id) { setPlaceholder(id, data.placeholders[id][index]); });
    document.querySelectorAll('button[data-action]').forEach(function (btn) {
      var value = actionText[btn.getAttribute('data-action')];
      if (value) btn.textContent = value[index];
    });
    document.querySelectorAll('h2,h3,span').forEach(function (el) {
      var raw = el.textContent.trim();
      var value = exactText[raw];
      if (value) el.textContent = value[index];
    });
  }
  function setLanguage(lang, persist) {
    currentLang = normalizeLang(lang) || 'en';
    if (persist) { try { localStorage.setItem(STORAGE_KEY, currentLang); } catch (e) {} }
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
    document.documentElement.setAttribute('data-ui-lang', currentLang);
    document.body && document.body.setAttribute('data-ui-lang', currentLang);
    injectToggle();
    applyDataAttrs();
    applyCommon();
    applyHome();
    applyTool();
    updateToggle();
    window.dispatchEvent(new CustomEvent('ymir-language-applied', { detail: { lang: currentLang } }));
  }
  function getLanguage() { return currentLang; }

  window.YmirI18n = { setLanguage: function (lang) { setLanguage(lang, true); }, getLanguage: getLanguage, translateMessage: translateMessage };
  document.addEventListener('DOMContentLoaded', function () { setLanguage(detectLang(), false); });
  window.addEventListener('languagechange', function () { if (!storedLang()) setLanguage(browserLang(), false); });
})();
