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
      '/formatjs/': { zh: 'JS 格式化', en: 'JS Formatter' },
      '/textdiff/': { zh: '文本对比', en: 'Text Diff' },
      '/guides.html': { zh: '指南', en: 'Guides' }
    },
    trust: {
      zh: ['无需注册', '打开即用', '150+ 工具', '快速复制'],
      en: ['No sign-up', 'Ready to use', '150+ tools', 'Quick copy']
    },
    footer: {
      zh: '打开工具，快速处理并复制结果。',
      en: 'Open tools quickly and copy results when ready.'
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
    '/password/': { zh: ['密码生成器', '快速创建随机密码。'], en: ['Password Generator', 'Create random passwords quickly.'] }
  };

  var home = {
    eyebrow: { zh: '在线工具箱', en: 'Online Toolbox' },
    title: { zh: '免费在线工具箱', en: 'Free Online Toolbox' },
    subtitle: { zh: '搜索并打开 JSON、Base64、MD5、URL、文本对比、时间戳等常用工具。', en: 'Search and open JSON, Base64, MD5, URL, text diff, timestamp, and other common tools.' },
    search: { zh: '搜索工具：JSON、MD5、Base64、URL、时间戳、文本对比...', en: 'Search tools: JSON, MD5, Base64, URL, timestamp, text diff...' },
    featuredTitle: { zh: '常用工具', en: 'Featured tools' },
    featuredSubtitle: { zh: '高频工具直接打开，输入后立即处理。', en: 'Open high-frequency tools and process input immediately.' },
    whyTitle: { zh: '轻量说明', en: 'Notes' },
    whyTexts: {
      zh: ['无需注册，直接粘贴、处理、复制。', '常用工具打开即用，结果可快速复制。'],
      en: ['No signup. Paste, process, and copy directly.', 'Common tools are ready to use, with quick result copying.']
    },
    directoryTitle: { zh: '全部工具目录', en: 'Full tool directory' },
    directorySubtitle: { zh: '搜索支持中英文、别名和目录链接。', en: 'Search supports English, Chinese, aliases, and directory links.' },
    noResult: { zh: '没有找到匹配工具。请尝试其他关键词。', en: 'No matching tools found. Try another keyword.' }
  };

  var tools = {
    json: { eyebrow: ['开发者工具', 'Developer Tool'], title: ['JSON 格式化与校验', 'JSON Formatter and Validator'], subtitle: ['粘贴 JSON，格式化、校验、压缩并复制结果。', 'Paste JSON, format, validate, minify, and copy the result.'], panels: [['JSON 输入', '格式化输出'], ['JSON Input', 'Formatted Output']], placeholders: { toolInput: ['在这里粘贴 JSON', 'Paste JSON here'], toolOutput: ['结果', 'Result'] } },
    base64: { eyebrow: ['编码工具', 'Encoding Tool'], title: ['Base64 编码与解码', 'Base64 Encoder and Decoder'], subtitle: ['编码或解码 UTF-8 文本。Base64 是编码，不是加密。', 'Encode or decode UTF-8 text. Base64 is encoding, not encryption.'], panels: [['文本或 Base64 输入', '输出'], ['Text or Base64 Input', 'Output']], placeholders: { toolInput: ['粘贴文本或 Base64', 'Paste text or Base64 here'], toolOutput: ['结果', 'Result'] } },
    md5: { eyebrow: ['哈希工具', 'Hash Tool'], title: ['MD5 哈希生成器', 'MD5 Hash Generator'], subtitle: ['生成 32 位和 16 位 MD5 哈希。MD5 不是加密。', 'Generate 32-character and 16-character MD5 hashes. MD5 is not encryption.'], panels: [['文本输入', '32 位小写 MD5', '32 位大写 MD5', '16 位小写 MD5', '16 位大写 MD5'], ['Text Input', '32-character lowercase MD5', '32-character uppercase MD5', '16-character lowercase MD5', '16-character uppercase MD5']], placeholders: { toolInput: ['输入要生成哈希的文本', 'Enter text to hash'], md5Lower32: ['运行后生成', 'Generated after running'], md5Upper32: ['运行后生成', 'Generated after running'], md5Lower16: ['运行后生成', 'Generated after running'], md5Upper16: ['运行后生成', 'Generated after running'] } },
    formatjs: { eyebrow: ['代码格式化工具', 'Code Formatting Tool'], title: ['JavaScript 格式化与压缩', 'JavaScript Formatter and Minifier'], subtitle: ['格式化或轻量压缩 JavaScript 片段。', 'Format or lightly minify JavaScript snippets.'], panels: [['JavaScript 输入', '格式化输出'], ['JavaScript Input', 'Formatted Output']], placeholders: { toolInput: ['粘贴 JavaScript', 'Paste JavaScript here'], toolOutput: ['结果', 'Result'] } },
    urlencode: { eyebrow: ['编码工具', 'Encoding Tool'], title: ['URL 编码与解码', 'URL Encoder and Decoder'], subtitle: ['编码或解码 URL、查询字符串、中文和空格。', 'Encode or decode URLs, query strings, Chinese characters, and spaces.'], panels: [['URL 或文本输入', '输出'], ['URL or Text Input', 'Output']], placeholders: { toolInput: ['粘贴 URL 或文本', 'Paste URL or text here'], toolOutput: ['结果', 'Result'] } },
    unixtime: { eyebrow: ['时间工具', 'Time Tool'], title: ['Unix 时间戳转换器', 'Unix Timestamp Converter'], subtitle: ['时间戳与可读日期互转。', 'Convert timestamps and readable dates.'], panels: [['当前时间戳', '时间戳转日期', '日期转时间戳'], ['Current timestamp', 'Convert timestamp to date', 'Convert date to timestamp']], placeholders: { timestampInput: ['秒或毫秒', 'Seconds or milliseconds'], dateInput: ['2026-05-25 12:00:00', '2026-05-25 12:00:00'] } },
    textdiff: { eyebrow: ['文本工具', 'Text Tool'], title: ['文本对比工具', 'Text Diff Checker'], subtitle: ['逐行比较两段文本差异。', 'Compare two text blocks line by line.'], panels: [['原始文本', '修改后文本', '差异摘要'], ['Original text', 'Changed text', 'Diff summary']], placeholders: { textA: ['粘贴原始文本', 'Paste original text'], textB: ['粘贴修改后文本', 'Paste changed text'], toolOutput: ['对比结果', 'Comparison result'] } },
    txtcount: { eyebrow: ['文本工具', 'Text Tool'], title: ['字数与字符统计', 'Word and Character Counter'], subtitle: ['实时统计字符、单词、行数和字节。', 'Count characters, words, lines, and bytes as you type.'], panels: [['文本输入', '摘要'], ['Text Input', 'Summary']], placeholders: { toolInput: ['粘贴文本', 'Paste text here'] } },
    regex: { eyebrow: ['开发者工具', 'Developer Tool'], title: ['正则表达式测试', 'Regex Tester'], subtitle: ['测试正则表达式并查看匹配结果。', 'Test regex patterns and inspect matches.'], panels: [['表达式输入', '匹配结果', '测试文本'], ['Pattern input', 'Matches result', 'Test text']], placeholders: { regexPattern: ['输入正则表达式，不需要斜杠', 'Enter regular expression without slashes'], regexText: ['粘贴要测试的文本', 'Paste text to test'] } },
    calculator: { eyebrow: ['计算工具', 'Calculator Tool'], title: ['在线科学计算器', 'Online Scientific Calculator'], subtitle: ['快速计算数字、括号、百分号和基础运算符。', 'Calculate numbers, parentheses, percentages, and basic operators quickly.'], panels: [['表达式', '结果'], ['Expression', 'Result']], placeholders: { calcInput: ['(128 + 256) / 3', '(128 + 256) / 3'], calcResult: ['结果显示在这里', 'Result appears here'] } },
    guid: { eyebrow: ['生成工具', 'Generator Tool'], title: ['GUID 生成器', 'GUID Generator'], subtitle: ['生成一个或多个 GUID / UUID 值。', 'Generate one or many GUID / UUID values.'], panels: [['生成 GUID 值'], ['Generate GUID values']], placeholders: { toolOutput: ['生成的 GUID 值', 'Generated GUID values'] } },
    password: { eyebrow: ['生成工具', 'Generator Tool'], title: ['密码生成器', 'Password Generator'], subtitle: ['使用长度和字符集选项生成随机密码。', 'Generate random passwords with length and character-set controls.'], panels: [['密码选项'], ['Password options']], placeholders: { toolOutput: ['生成的密码', 'Generated password'] } }
  };

  var toolBadges = {
    json: [['格式化 JSON','校验语法','复制结果'], ['Format JSON','Validate syntax','Copy result']],
    base64: [['文本编码','文本解码','复制结果'], ['Encode text','Decode text','Copy result']],
    md5: [['32 位 MD5','16 位 MD5','复制哈希'], ['32-character MD5','16-character MD5','Copy hash']],
    formatjs: [['整理缩进','基础压缩','复制代码'], ['Clean indentation','Basic minify','Copy code']],
    urlencode: [['URI 组件','完整 URI','复制结果'], ['URI component','Full URI','Copy result']],
    unixtime: [['秒 / 毫秒','日期互转','复制结果'], ['Seconds / milliseconds','Date conversion','Copy result']],
    textdiff: [['双文本输入','行级对比','复制摘要'], ['Two text inputs','Line diff','Copy summary']],
    txtcount: [['字符统计','单词统计','字节统计'], ['Character count','Word count','Byte count']],
    regex: [['模式测试','匹配结果','错误提示'], ['Pattern test','Match result','Error feedback']],
    calculator: [['表达式输入','快速计算','复制结果'], ['Expression input','Quick calculate','Copy result']],
    guid: [['批量生成','GUID / UUID','复制结果'], ['Batch generate','GUID / UUID','Copy result']],
    password: [['长度选项','字符集选项','复制结果'], ['Length option','Character sets','Copy result']]
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
    'Usage notes / 使用说明': ['使用说明', 'Usage notes'],
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
    'Generate a result before copying.': '请先生成结果再复制。', 'Paste JSON before formatting.': '请先粘贴 JSON 再格式化。', 'Paste JSON before minifying.': '请先粘贴 JSON 再压缩。', 'Paste JSON before validating.': '请先粘贴 JSON 再校验。', 'Enter text before encoding.': '请先输入要编码的文本。', 'Enter Base64 text before decoding.': '请先输入 Base64 文本再解码。', 'Paste two text blocks before comparing.': '请先粘贴两段文本再对比。', 'Password generated quickly.': '密码已生成。',
    'Copy failed': '复制失败', 'Nothing to copy': '没有可复制的内容', 'Copied result to clipboard.': '结果已复制到剪贴板。',
    'Valid JSON. Formatted with 2-space indentation.': 'JSON 有效，已按 2 个空格缩进格式化。', 'Valid JSON. Minified output is ready.': 'JSON 有效，压缩结果已生成。', 'Valid JSON. No syntax errors found.': 'JSON 有效，未发现语法错误。',
    'Example loaded. Click Format JSON to see the result.': '示例已载入。点击“格式化 JSON”查看结果。', 'Encoded as Base64. Base64 is encoding, not encryption.': '已编码为 Base64。Base64 是编码，不是加密。', 'Decoded Base64 text.': '已解码 Base64 文本。', 'Invalid Base64 input or unsupported binary data.': 'Base64 输入无效或包含不支持的二进制数据。', 'Example loaded. Click Encode to convert it.': '示例已载入。点击“编码”进行转换。',
    'Enter text before generating an MD5 hash.': '请先输入要生成 MD5 的文本。', 'MD5 hashes generated. MD5 is not encryption.': 'MD5 哈希已生成。MD5 不是加密。', 'Copied 32-character lowercase MD5.': '已复制 32 位小写 MD5。', 'Copied 32-character uppercase MD5.': '已复制 32 位大写 MD5。',
    'JavaScript formatted for readability.': 'JavaScript 已格式化，便于阅读。', 'Basic minified output is ready. This is not a full compiler.': '基础压缩结果已生成。此功能不是完整编译器。', 'Example loaded. Click Format JavaScript.': '示例已载入。点击“格式化 JavaScript”。',
    'Encoded with encodeURIComponent.': '已使用 encodeURIComponent 编码。', 'Decoded with decodeURIComponent.': '已使用 decodeURIComponent 解码。', 'Encoded with encodeURI.': '已使用 encodeURI 编码。', 'Decoded with decodeURI.': '已使用 decodeURI 解码。', 'Example loaded. Try Encode URI Component.': '示例已载入。可尝试“编码 URI 组件”。',
    'Current browser time loaded.': '已载入当前浏览器时间。', 'Enter a Unix timestamp.': '请输入 Unix 时间戳。', 'Timestamp must be a number.': '时间戳必须是数字。', 'Invalid timestamp.': '时间戳无效。', 'Timestamp converted using your browser timezone display.': '已按浏览器时区显示转换结果。', 'Enter a date/time value.': '请输入日期或时间。', 'Invalid date/time value.': '日期或时间无效。', 'Date converted to Unix timestamp.': '日期已转换为 Unix 时间戳。', 'Copied timestamp result.': '时间戳结果已复制。',
    'No line-level differences found.': '未发现行级差异。', 'Text statistics updated.': '文本统计已更新。', 'No matches found.': '未找到匹配项。', 'Enter a calculation first.': '请先输入计算表达式。', 'Only numbers, parentheses, and basic operators are supported.': '仅支持数字、括号和基础运算符。', 'Calculation complete.': '计算完成。', 'Result is not finite. Check division by zero.': '结果不是有限数，请检查是否除以零。', 'Copied result.': '结果已复制。', 'Select at least one character set.': '请至少选择一种字符集。', 'Password generated.': '密码已生成。'
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
    if (msg.indexOf('Generated ') === 0 && msg.indexOf(' GUID value') > -1) return msg.replace('Generated ', '已生成 ').replace(' GUID values', ' 个 GUID').replace(' GUID value', ' 个 GUID').replace('.', '。');
    return msg;
  }

  function injectToggle() {
    var inner = document.querySelector('.ymir-topbar-inner');
    if (inner && !inner.querySelector('.ymir-lang-toggle')) {
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
      return;
    }
    var legacy = document.querySelector('.navbar .navbar-header') || document.querySelector('.navbar .container') || document.querySelector('.navbar');
    if (!legacy || legacy.querySelector('.ymir-legacy-lang-toggle')) return;
    var legacyWrap = document.createElement('div');
    legacyWrap.className = 'ymir-legacy-lang-toggle ymir-lang-toggle';
    legacyWrap.setAttribute('aria-label', 'Language');
    legacyWrap.innerHTML = '<button type="button" data-ymir-lang-option="zh">中文</button><button type="button" data-ymir-lang-option="en">EN</button>';
    legacy.appendChild(legacyWrap);
    legacyWrap.addEventListener('click', function (e) {
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
    if (!document.querySelector('.ymir-home-hero') && !document.querySelector('.ymir-home-dashboard')) return;
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

  var toolStaticText = {
    'Use cases and limits': ['使用场景与限制', 'Use cases and limits'],
    'Safe use note': ['安全使用提示', 'Safe use note'],
    'FAQ': ['常见问题', 'FAQ'],
    'Related tools': ['相关工具', 'Related tools'],
    'How to use this tool / 使用说明': ['使用说明', 'How to use this tool'],
    'Usage notes / 使用说明': ['使用说明', 'Usage notes'],
    'Seconds, milliseconds, and timezones': ['秒、毫秒与时区', 'Seconds, milliseconds, and timezones'],
    'Length': ['长度', 'Length'],
    'Count': ['数量', 'Count'],
    'Uppercase': ['大写字母', 'Uppercase'],
    'Lowercase': ['小写字母', 'Lowercase'],
    'Numbers': ['数字', 'Numbers'],
    'Symbols': ['符号', 'Symbols'],
    'Global': ['全局匹配', 'Global'],
    'Ignore case': ['忽略大小写', 'Ignore case'],
    'Multiline': ['多行模式', 'Multiline'],
    'Use this tool when API responses, logs, configuration snippets, or JSON samples need readable indentation, compact output, or a quick syntax check.': ['当 API 响应、日志、配置片段或 JSON 示例需要缩进、压缩或快速语法检查时使用此工具。', 'Use this tool when API responses, logs, configuration snippets, or JSON samples need readable indentation, compact output, or a quick syntax check.'],
    'The validator checks strict JSON syntax. Common failures include trailing commas, single quotes, comments, missing quotes around keys, and HTML error pages returned instead of JSON.': ['校验器检查严格 JSON 语法。常见错误包括尾随逗号、单引号、注释、键名缺少引号，以及误把 HTML 错误页当作 JSON 粘贴。', 'The validator checks strict JSON syntax. Common failures include trailing commas, single quotes, comments, missing quotes around keys, and HTML error pages returned instead of JSON.'],
    'Avoid pasting secrets, production credentials, private keys, access tokens, or sensitive personal data into any online tool. Use the output for formatting, review, and copying only.': ['不要把密钥、生产凭据、私钥、访问令牌或敏感个人信息粘贴到任何在线工具中。输出仅用于格式化、检查和复制。', 'Avoid pasting secrets, production credentials, private keys, access tokens, or sensitive personal data into any online tool. Use the output for formatting, review, and copying only.'],
    'Use this tool for text snippets that need Base64 encoding or decoding, such as test payloads, small configuration values, or examples in documentation.': ['此工具适合对测试 payload、小型配置值或文档示例等文本片段进行 Base64 编码或解码。', 'Use this tool for text snippets that need Base64 encoding or decoding, such as test payloads, small configuration values, or examples in documentation.'],
    'Base64 does not protect data. Anyone with the encoded string can decode it, so do not use Base64 as a password, encryption method, or access-control mechanism.': ['Base64 不会保护数据。拿到编码字符串的人可以解码，因此不要把 Base64 当作密码、加密方式或访问控制机制。', 'Base64 does not protect data. Anyone with the encoded string can decode it, so do not use Base64 as a password, encryption method, or access-control mechanism.'],
    'MD5 can be useful for legacy checksums, cache keys, sample data, and quick text comparisons where cryptographic security is not required.': ['MD5 可用于旧校验和、缓存键、示例数据或不需要密码学安全性的快速文本对比。', 'MD5 can be useful for legacy checksums, cache keys, sample data, and quick text comparisons where cryptographic security is not required.'],
    'Do not use MD5 for password storage, signatures, or security-sensitive verification. Use modern password hashing or cryptographic algorithms appropriate to your system.': ['不要将 MD5 用于密码存储、签名或安全敏感校验。请使用适合系统的现代密码哈希或加密算法。', 'Do not use MD5 for password storage, signatures, or security-sensitive verification. Use modern password hashing or cryptographic algorithms appropriate to your system.'],
    'Avoid pasting secrets, production credentials, private keys, or sensitive personal data into any online hash generator. Treat the result as a utility checksum, not a security guarantee.': ['不要把密钥、生产凭据、私钥或敏感个人信息粘贴到任何在线哈希生成器中。请把结果当作工具性校验值，而不是安全保证。', 'Avoid pasting secrets, production credentials, private keys, or sensitive personal data into any online hash generator. Treat the result as a utility checksum, not a security guarantee.'],
    'Use this tool for drafts, configuration snippets, short documents, release notes, and small text changes where line-level comparison is enough.': ['此工具适合草稿、配置片段、短文档、发布说明和只需行级对比的小文本变更。', 'Use this tool for drafts, configuration snippets, short documents, release notes, and small text changes where line-level comparison is enough.'],
    'For large files, binary files, or repository-level code review, use a dedicated diff tool or Git. This page focuses on quick pasted-text comparison.': ['大型文件、二进制文件或代码仓库级审查应使用专门的 diff 工具或 Git。本页专注于快速粘贴文本对比。', 'For large files, binary files, or repository-level code review, use a dedicated diff tool or Git. This page focuses on quick pasted-text comparison.'],
    'Use this page for quick cleanup, readable indentation, and inspecting copied JavaScript snippets. It does not guarantee that code is safe, valid, or compatible with every runtime.': ['此页面用于快速整理缩进、提高可读性和检查复制来的 JavaScript 片段。它不保证代码安全、有效或兼容所有运行环境。', 'Use this page for quick cleanup, readable indentation, and inspecting copied JavaScript snippets. It does not guarantee that code is safe, valid, or compatible with every runtime.'],
    'Choose a length, select the character sets allowed by the target service, click': ['选择长度和目标服务允许的字符集，然后点击', 'Choose a length, select the character sets allowed by the target service, click'],
    'Use a password manager to store generated passwords. Do not reuse the same password across important accounts.': ['使用密码管理器保存生成的密码。不要在重要账号之间重复使用同一个密码。', 'Use a password manager to store generated passwords. Do not reuse the same password across important accounts.']
  };
  function translateStaticText(root) {
    root = root || document;
    root.querySelectorAll('h2,h3,p,label,a,small,strong,span').forEach(function (el) {
      if (el.closest('.ymir-nav') || el.closest('.ymir-lang-toggle') || el.closest('.ymir-actions') || el.closest('.ymir-footer') || el.closest('.ymir-related-grid')) return;
      var key = el.getAttribute('data-i18n-key') || el.textContent.trim();
      var value = toolStaticText[key];
      if (!value) return;
      if (!el.getAttribute('data-i18n-key')) el.setAttribute('data-i18n-key', key);
      el.textContent = value[currentLang === 'zh' ? 0 : 1];
    });
  }

  function applyTool() {
    var page = document.querySelector('[data-ymir-tool]');
    if (!page) { translateStaticText(document); return; }
    var key = page.getAttribute('data-ymir-tool');
    var data = tools[key];
    if (!data) { translateStaticText(document); return; }
    var index = currentLang === 'zh' ? 0 : 1;
    setBySelector('.ymir-hero-eyebrow', data.eyebrow[index]);
    setBySelector('.ymir-hero-title', data.title[index]);
    setBySelector('.ymir-hero-subtitle', data.subtitle[index]);
    var badgeData = toolBadges[key];
    if (badgeData) {
      document.querySelectorAll('.ymir-trust-badge').forEach(function (badge, i) {
        if (badgeData[index] && badgeData[index][i]) badge.textContent = badgeData[index][i];
      });
    }
    setByAll('.ymir-panel-title', data.panels[index]);
    Object.keys(data.placeholders || {}).forEach(function (id) { setPlaceholder(id, data.placeholders[id][index]); });
    document.querySelectorAll('button[data-action]').forEach(function (btn) {
      var value = actionText[btn.getAttribute('data-action')];
      if (value) btn.textContent = value[index];
    });
    document.querySelectorAll('h2,h3,span,label').forEach(function (el) {
      var raw = el.textContent.trim();
      var value = exactText[raw];
      if (value) el.textContent = value[index];
    });
    translateStaticText(page);
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
