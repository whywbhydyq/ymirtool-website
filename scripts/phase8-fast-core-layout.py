#!/usr/bin/env python3
from __future__ import annotations

import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERSION = "20260810-v68"
FAST_CSS = f'/static/style/ymir-fast-core-v66.css?v={VERSION}'
FAST_SCRIPT = f'/static/script/ymir-fast-core-v66.mjs?v={VERSION}'
START = '<!-- ymir-fast-workbench:start -->'
END = '<!-- ymir-fast-workbench:end -->'
HOME_START = '<!-- ymir-fast-home:start -->'
HOME_END = '<!-- ymir-fast-home:end -->'

TOOL_CONFIGS = {
    "json": {
        "title": "JSON 格式化与校验",
        "description": "粘贴严格 JSON，在浏览器中完成格式化、压缩、语法校验与结果复制。",
        "category": "JSON 工具",
        "kind": "text",
        "sample": '{"status":"ok","items":[{"id":1,"name":"Ymir Tool"}]}',
        "primary": "formatJson",
        "actions": [("formatJson", "格式化", True), ("minifyJson", "压缩", False), ("validateJson", "校验", False)],
        "input_label": "JSON 输入",
        "output_label": "检查后的输出",
        "placeholder": '{"name":"Ymir Tool"}',
        "uses": ["整理 API 响应、配置片段和日志中的 JSON。", "在复制前检查尾随逗号、引号、转义字符和数据类型。"],
        "checks": [("输入边界", "先移除日志前缀、HTTP 头、JSONP 包装和 HTML 错误页。"), ("键和值", "核对对象键、数组位置、字符串、数字、布尔值与 null。"), ("大整数", "可能丢失精度的标识符应保持为字符串。")],
        "faq": [("格式化会改变 JSON 的值吗？", "不会。只有输入通过严格 JSON 解析后，工具才会调整空白或压缩空白。"), ("为什么 JavaScript 对象写法会报错？", "JSON 不允许注释、单引号、未加引号的键或尾随逗号。")],
        "related": [("/json-format-guide.html", "JSON 格式化排错指南"), ("/json-schema-checklist.html", "JSON Schema 检查清单"), ("/json-api-response-debugging-checklist.html", "API 响应排查清单")],
    },
    "base64": {
        "title": "Base64 编码与解码",
        "description": "在浏览器中编码 UTF-8 文本，或解码标准 Base64 与 Base64URL 文本。",
        "category": "编码工具",
        "kind": "text",
        "sample": "Ymir Tool 支持 UTF-8 text",
        "primary": "encodeBase64",
        "actions": [("encodeBase64", "编码", True), ("decodeBase64", "解码", False)],
        "input_label": "文本或 Base64 输入",
        "output_label": "编码或解码结果",
        "placeholder": "输入文本或 Base64 值",
        "uses": ["处理短文本、接口样例、配置值与 Base64URL 片段。", "检查 padding、字符集和二进制内容边界。"],
        "checks": [("编码类型", "确认目标使用标准 Base64 还是 Base64URL。"), ("填充符", "不要盲目补齐 =，先确认接收方规则。"), ("输出类型", "乱码可能表示二进制、压缩或非 UTF-8 数据。")],
        "faq": [("Base64 是加密吗？", "不是。Base64 可以直接逆向解码，不能提供保密性。"), ("能处理中文和 emoji 吗？", "可以，文本会按 UTF-8 编码和解码。")],
        "related": [("/base64-encoding-guide.html", "Base64 编码指南"), ("/base64-padding-troubleshooting.html", "Padding 错误排查"), ("/base64url-vs-base64-guide.html", "Base64URL 与 Base64 对比")],
    },
    "urlencode": {
        "title": "URL 编码与解码",
        "description": "在浏览器中编码 URL 组件，或解码包含 UTF-8 文本的百分号编码值。",
        "category": "编码工具",
        "kind": "text",
        "sample": "https://ymirtool.com/search?q=中文 test&source=tool",
        "primary": "encodeUrl",
        "actions": [("encodeUrl", "编码组件", True), ("decodeUrl", "解码", False)],
        "input_label": "URL 组件或已编码值",
        "output_label": "转换结果",
        "placeholder": "粘贴 URL 组件或百分号编码值",
        "uses": ["处理查询参数、路径片段、回调地址、中文与空格。", "检查重复编码和保留字符是否被错误转换。"],
        "checks": [("编码层级", "先确定处理完整 URL、路径片段还是 query value。"), ("重复编码", "出现 %25、%252F 时检查是否编码了两次。"), ("空格与加号", "确认接收方把 + 当作加号还是表单空格。")],
        "faq": [("应该编码整个 URL 吗？", "通常不应该。应分别编码参数值或路径片段。"), ("为什么百分号变成 %25？", "这通常说明已编码的内容又被编码了一次。")],
        "related": [("/url-encoding-guide.html", "URL 编码指南"), ("/encodeuri-vs-encodeuricomponent.html", "encodeURI 与 encodeURIComponent"), ("/url-double-encoding-debugging.html", "重复编码排查")],
    },
    "formatjs": {
        "title": "JavaScript Formatter",
        "description": "整理 JavaScript 片段的缩进，或执行轻量压缩，再检查并复制结果。",
        "category": "格式化工具",
        "kind": "text",
        "sample": 'function hello(name){if(name){return "Hello, "+name;}return "Ymir Tool";}',
        "primary": "formatJavaScript",
        "actions": [("formatJavaScript", "格式化", True), ("minifyJavaScript", "轻量压缩", False)],
        "input_label": "JavaScript 输入",
        "output_label": "格式化结果",
        "placeholder": "粘贴 JavaScript 代码片段",
        "uses": ["让压缩或紧凑的代码片段更容易阅读。", "复制前复核缩进、括号、字符串和模板字面量。"],
        "checks": [("语法支持", "确认片段使用的语法特性在格式化器支持范围内。"), ("字符串与正则", "检查引号、转义、模板字符串和正则表达式。"), ("运行结果", "格式化不是测试，发布前仍需在目标环境执行测试。")],
        "faq": [("工具会执行粘贴的代码吗？", "不会。它只处理文本，不应运行粘贴的 JavaScript。"), ("格式化一定不会改变行为吗？", "目标是只调整布局，但仍应通过 diff 和项目测试复核。")],
        "related": [("/javascript-formatter-guide.html", "JavaScript 格式化指南"), ("/code-formatting-guide.html", "代码格式化检查方法"), ("/release-copy-paste-review-checklist.html", "复制发布检查清单")],
    },
    "regex": {
        "title": "JavaScript 正则测试器",
        "description": "使用样本文本检查正则表达式、flags、捕获组和每个匹配的位置。",
        "category": "开发工具",
        "kind": "regex",
        "primary": "testRegex",
        "pattern": r"\b(error|warning)\b",
        "text": "INFO ready\nWARNING retry\nERROR failed",
        "uses": ["测试校验、日志筛选、文本提取和替换规则。", "同时准备应匹配、不应匹配和边界样例。"],
        "checks": [("运行引擎", "确认目标环境使用 JavaScript RegExp 语法。"), ("边界条件", "检查锚点、换行、Unicode、空输入和标点。"), ("性能", "用较长的近似匹配文本检查回溯风险。")],
        "faq": [("为什么反斜杠会消失？", "有些编程语言会先处理字符串转义，正则引擎看到的是第二层结果。"), ("一个正则能验证所有邮箱吗？", "不能可靠覆盖全部规则，应按实际业务范围设计并由服务端再次校验。")],
        "related": [("/regex-tester-guide.html", "正则测试指南"), ("/regex-javascript-flags-guide.html", "JavaScript flags 指南"), ("/regex-production-review.html", "正则上线检查清单")],
    },
    "textdiff": {
        "title": "在线文本差异对比工具",
        "description": "逐行比较两段文本，复核新增、删除和修改内容后再复制。",
        "category": "文本工具",
        "kind": "diff",
        "primary": "compareText",
        "original": "Release notes\n- Added JSON validation\n- Fixed copy flow",
        "changed": "Release notes\n- Added JSON and URL validation\n- Fixed copy flow",
        "uses": ["比较配置、发布说明、翻译、提示词和文档改动。", "识别空白、标点、大小写与换行符差异。"],
        "checks": [("左右含义", "先标明哪一侧是原文，哪一侧是修改稿。"), ("不可见字符", "检查空格、Tab、CRLF/LF 和 Unicode 相似字符。"), ("格式语义", "代码或结构化数据应再使用格式感知的 diff。")],
        "faq": [("工具会自动合并两个版本吗？", "不会。它只展示差异，最终保留内容仍由你决定。"), ("看起来相同的行为什么有差异？", "常见原因是不可见空白、换行符或 Unicode 规范化不同。")],
        "related": [("/text-diff-guide.html", "文本差异指南"), ("/text-diff-whitespace-line-ending-guide.html", "空白与换行排查"), ("/text-diff-release-review.html", "发布前文本复核")],
    },
    "txtcount": {
        "title": "在线字数与字符统计工具",
        "description": "输入时实时统计字符、非空白字符、单词或 CJK 字符以及行数。",
        "category": "文本工具",
        "kind": "metrics",
        "primary": "countText",
        "sample": "Ymir Tool counts words, 中文字符, and lines.\nEverything runs locally.",
        "uses": ["检查标题、描述、表单、翻译和短文案的长度。", "区分字符数、单词数、行数和 UTF-8 字节等口径。"],
        "checks": [("目标口径", "确认目标平台统计字符、代码点、可见字形还是字节。"), ("多语言文本", "中文、emoji 与组合字符可能使用不同计数规则。"), ("最终版本", "按实际提交内容保留空格、标点和换行后再统计。")],
        "faq": [("为什么字节数会大于字符数？", "UTF-8 中许多中文和 emoji 会占用多个字节。"), ("空格是否算字符？", "大多数平台会计入空格，使用前应以目标平台规则为准。")],
        "related": [("/text-count-guide.html", "文本统计指南"), ("/text-tools-guide.html", "文本工具使用指南"), ("/copy-paste-safety-checklist.html", "复制粘贴检查清单")],
    },
    "unixtime": {
        "title": "Unix 时间戳转换器",
        "description": "把 Unix 秒或毫秒转换为 ISO 时间，也可把日期转回两种时间戳。",
        "category": "时间工具",
        "kind": "time",
        "primary": "timestampToDate",
        "timestamp": "1767225600",
        "date": "2026-01-01T00:00:00Z",
        "uses": ["核对日志、API、数据库和 webhook 中的时间值。", "判断时间戳单位、UTC 与本地时区显示。"],
        "checks": [("单位", "10 位通常是秒、13 位通常是毫秒，但仍需以来源协议为准。"), ("时区", "同时记录 UTC 时间、本地时区名称与偏移量。"), ("往返校验", "使用相同单位把日期转回时间戳并比较原值。")],
        "faq": [("为什么不同电脑显示的时间不同？", "同一时刻可按不同时区显示，协作时优先核对 UTC。"), ("Unix 时间戳包含时区吗？", "不包含。它表示一个时间点，时区只影响展示方式。")],
        "related": [("/unix-time-guide.html", "Unix 时间戳指南"), ("/timestamp-log-analysis-guide.html", "日志时间分析"), ("/timezone-log-debugging-guide.html", "时区排错指南")],
    },
}


def escape(value: str) -> str:
    return html.escape(value, quote=True)


def button(action: str, label: str, primary: bool = False, target: str | None = None) -> str:
    classes = "ymir-fast-button" + (" ymir-fast-button--primary" if primary else "")
    target_attr = f' data-fast-target="{escape(target)}"' if target else ""
    return f'<button class="{classes}" data-fast-action="{escape(action)}"{target_attr} type="button">{escape(label)}</button>'


def text_panel(config: dict[str, object]) -> str:
    sample = escape(str(config["sample"]))
    return f'''<div class="ymir-fast-grid">
<section class="ymir-fast-panel"><div class="ymir-fast-panel-head"><strong>{escape(str(config["input_label"]))}</strong><span>输入</span></div><textarea aria-label="{escape(str(config["input_label"]))}" class="ymir-fast-input" data-fast-input="input" data-fast-sample="{sample}" placeholder="{escape(str(config["placeholder"]))}" spellcheck="false"></textarea></section>
<section class="ymir-fast-panel"><div class="ymir-fast-panel-head"><strong>{escape(str(config["output_label"]))}</strong><span>输出</span></div><textarea aria-label="{escape(str(config["output_label"]))}" class="ymir-fast-output" data-fast-output="output" placeholder="运行操作后在这里查看结果" readonly spellcheck="false"></textarea></section>
</div>'''


def regex_panel(config: dict[str, object]) -> str:
    return f'''<div class="ymir-fast-controls"><div class="ymir-fast-control-stack"><label class="ymir-fast-field">正则表达式<input class="ymir-fast-single-input" data-fast-input="pattern" data-fast-sample="{escape(str(config["pattern"]))}" placeholder="输入 JavaScript 正则表达式（无需斜杠）" spellcheck="false" type="text"/></label><fieldset class="ymir-fast-field"><legend>匹配标志</legend><span class="ymir-fast-flags"><label class="ymir-fast-flag"><input checked data-fast-default data-fast-flag="g" type="checkbox"/>g</label><label class="ymir-fast-flag"><input checked data-fast-default data-fast-flag="i" type="checkbox"/>i</label><label class="ymir-fast-flag"><input data-fast-flag="m" type="checkbox"/>m</label></span></fieldset></div></div>
<div class="ymir-fast-grid"><section class="ymir-fast-panel"><div class="ymir-fast-panel-head"><strong>测试文本</strong><span>输入</span></div><textarea aria-label="测试文本" class="ymir-fast-input" data-fast-input="text" data-fast-sample="{escape(str(config["text"]))}" placeholder="粘贴用于测试的文本" spellcheck="false"></textarea></section><section class="ymir-fast-panel"><div class="ymir-fast-panel-head"><strong>匹配结果与位置</strong><span>输出</span></div><textarea aria-label="匹配结果与位置" class="ymir-fast-output" data-fast-output="output" placeholder="运行正则后查看匹配结果" readonly spellcheck="false"></textarea></section></div>'''


def diff_panel(config: dict[str, object]) -> str:
    return f'''<div class="ymir-fast-grid ymir-fast-grid--three"><section class="ymir-fast-panel"><div class="ymir-fast-panel-head"><strong>原始文本</strong><span>输入 A</span></div><textarea aria-label="原始文本" class="ymir-fast-input" data-fast-input="original" data-fast-sample="{escape(str(config["original"]))}" placeholder="粘贴原始文本"></textarea></section><section class="ymir-fast-panel"><div class="ymir-fast-panel-head"><strong>修改后文本</strong><span>输入 B</span></div><textarea aria-label="修改后文本" class="ymir-fast-input" data-fast-input="changed" data-fast-sample="{escape(str(config["changed"]))}" placeholder="粘贴修改后的文本"></textarea></section><section class="ymir-fast-panel"><div class="ymir-fast-panel-head"><strong>逐行差异</strong><span>输出</span></div><textarea aria-label="逐行差异" class="ymir-fast-output" data-fast-output="output" placeholder="点击对比后查看新增和删除行" readonly></textarea></section></div>'''


def metrics_panel(config: dict[str, object]) -> str:
    return f'''<div class="ymir-fast-grid"><section class="ymir-fast-panel"><div class="ymir-fast-panel-head"><strong>待统计文本</strong><span>实时输入</span></div><textarea aria-label="待统计文本" class="ymir-fast-input" data-fast-input="input" data-fast-sample="{escape(str(config["sample"]))}" placeholder="输入或粘贴文本"></textarea></section><section class="ymir-fast-panel"><div class="ymir-fast-panel-head"><strong>文本统计</strong><span>实时结果</span></div><div class="ymir-fast-metrics"><div class="ymir-fast-metric"><strong data-fast-metric="characters">0</strong><span>字符数</span></div><div class="ymir-fast-metric"><strong data-fast-metric="charactersNoSpaces">0</strong><span>非空白字符</span></div><div class="ymir-fast-metric"><strong data-fast-metric="words">0</strong><span>单词 / CJK 字符</span></div><div class="ymir-fast-metric"><strong data-fast-metric="lines">0</strong><span>行数</span></div></div><textarea class="ymir-fast-output" data-fast-output="output" hidden readonly></textarea></section></div>'''


def time_panel(config: dict[str, object]) -> str:
    return f'''<div class="ymir-fast-grid"><section class="ymir-fast-panel"><div class="ymir-fast-panel-head"><strong>时间戳转 ISO 日期</strong><span>秒或毫秒</span></div><label class="ymir-fast-field">Unix 时间戳<input class="ymir-fast-single-input" data-fast-input="timestamp" data-fast-sample="{escape(str(config["timestamp"]))}" inputmode="numeric" placeholder="1767225600" type="text"/></label><label class="ymir-fast-field">ISO 结果<textarea class="ymir-fast-output" data-fast-output="dateOutput" placeholder="运行时间戳转换" readonly></textarea></label></section><section class="ymir-fast-panel"><div class="ymir-fast-panel-head"><strong>日期转时间戳</strong><span>ISO 或本地日期</span></div><label class="ymir-fast-field">日期<input class="ymir-fast-single-input" data-fast-input="date" data-fast-sample="{escape(str(config["date"]))}" placeholder="2026-01-01T00:00:00Z" type="text"/></label><label class="ymir-fast-field">秒与毫秒<textarea class="ymir-fast-output" data-fast-output="timestampOutput" placeholder="运行日期转换" readonly></textarea></label></section></div>'''


def action_bar(config: dict[str, object]) -> str:
    if config["kind"] == "time":
        primary_actions = button("timestampToDate", "时间戳 → 日期", True, "dateOutput") + button("dateToTimestamp", "日期 → 时间戳", False, "timestampOutput")
    elif config["kind"] == "metrics":
        primary_actions = button("countText", "统计文本", True, "output")
    elif config["kind"] in {"regex", "diff"}:
        label = "测试正则" if config["kind"] == "regex" else "对比文本"
        primary_actions = button(str(config["primary"]), label, True, "output")
    else:
        primary_actions = "".join(button(action, label, primary, "output") for action, label, primary in config["actions"])
    return primary_actions + '<span class="ymir-fast-actions-spacer"></span>' + button("sample", "载入样例") + button("copy", "复制结果", target="output") + button("clear", "清空")


def build_workbench(slug: str, config: dict[str, object]) -> str:
    panel_builders = {
        "text": text_panel,
        "regex": regex_panel,
        "diff": diff_panel,
        "metrics": metrics_panel,
        "time": time_panel,
    }
    extra_attrs = ' data-fast-auto-action="countText" data-fast-primary-target="output"' if config["kind"] == "metrics" else ""
    copy_target = "dateOutput" if config["kind"] == "time" else "output"
    actions = action_bar(config).replace('data-fast-action="copy" data-fast-target="output"', f'data-fast-action="copy" data-fast-target="{copy_target}"')
    return f'''{START}
<section aria-labelledby="ymir-fast-{slug}-title" class="ymir-fast-workbench" data-fast-language="zh-CN" data-fast-primary-action="{escape(str(config["primary"]))}" data-fast-tool="{slug}"{extra_attrs}>
<header class="ymir-fast-head"><div><p class="ymir-fast-eyebrow">浏览器本地工具</p><p class="ymir-fast-title" id="ymir-fast-{slug}-title">{escape(str(config["title"]))}</p><p class="ymir-fast-description">{escape(str(config["description"]))}</p></div><span class="ymir-fast-badge">本地处理 · 打开即用</span></header>
<div class="ymir-fast-body">{panel_builders[str(config["kind"])](config)}</div>
<div class="ymir-fast-actions">{actions}</div>
<div aria-live="polite" class="ymir-fast-status" data-fast-status role="status">已就绪。</div>
</section><noscript><div class="ymir-fast-noscript">工具框已经显示，但本地转换需要启用 JavaScript。</div></noscript>
{END}'''


def build_tool_content(slug: str, config: dict[str, object]) -> str:
    uses = "".join(f"<li>{escape(str(item))}</li>" for item in config["uses"])
    checks = "".join(
        f"<tr><th scope=\"row\">{escape(str(label))}</th><td>{escape(str(detail))}</td></tr>"
        for label, detail in config["checks"]
    )
    faq = "".join(
        f"<h3>{escape(str(question))}</h3><p>{escape(str(answer))}</p>"
        for question, answer in config["faq"]
    )
    related = "".join(
        f'<a href="{escape(str(href))}">{escape(str(label))}</a>'
        for href, label in config["related"]
    )
    return f'''<section class="ymir-static-tool-lead ymir-container" data-static-tool-lead="{slug}">
<p class="ymir-breadcrumb"><a href="/">首页</a> / <a href="/tools.html">全部工具</a> / {escape(str(config["category"]))}</p>
<h1>{escape(str(config["title"]))}</h1>
<p>{escape(str(config["description"]))}</p>
<ul>{uses}</ul>
</section>
<section class="ymir-container ymir-help ymir-card"><h2>使用场景与边界</h2><p>本工具直接在当前浏览器页面中处理输入，适合快速检查和复制结果。请使用公开、测试或脱敏样例，不要把格式化或转换结果代替目标系统中的最终验证。</p></section>
<section class="ymir-container ymir-core-depth ymir-card"><h2>复制前检查</h2><div class="ymir-table-wrap"><table><thead><tr><th>检查项</th><th>需要确认的内容</th></tr></thead><tbody>{checks}</tbody></table></div></section>
<section class="ymir-container ymir-faq ymir-card"><h2>常见问题</h2>{faq}</section>
<section class="ymir-container ymir-related ymir-card"><h2>相关指南</h2><div class="ymir-related-grid">{related}<a href="/tools.html">浏览全部工具</a></div></section>'''


def build_topbar() -> str:
    return '''<nav aria-label="主导航" class="ymir-topbar" data-shell-language="zh-CN" lang="zh-CN"><div class="ymir-topbar-inner"><a class="ymir-brand" href="/">Ymir Tool</a><div class="ymir-nav"><a href="/tools.html">全部工具</a><a href="/guides.html">使用指南</a><a href="/about.html">关于</a></div><div class="ymir-topbar-actions"></div></div></nav>'''


def build_footer() -> str:
    return '''<footer class="ymir-footer" lang="zh-CN"><span>© 2026 <a href="/">Ymir Tool</a></span><a href="/tools.html">全部工具</a><a href="/guides.html">使用指南</a><a href="/about.html">关于我们</a><a href="/privacy.html">隐私政策</a><a href="/terms.html">使用条款</a><a href="/contact.html">联系我们</a><a href="/methodology.html">测试方法</a><a href="/sources.html">资料来源</a><a href="/licenses.html">开源许可</a><a href="/changelog.html">更新记录</a><a href="/disclaimer.html">免责声明</a><span>使用公开或脱敏样例进行测试。</span></footer>'''


def localize_tool_page(text: str, slug: str, config: dict[str, object]) -> str:
    text = re.sub(r'<html\b[^>]*>', '<html class="ymir-modern-html" lang="zh-CN" data-shell-language="zh-CN">', text, count=1, flags=re.I)
    text = re.sub(r'<title>.*?</title>', f'<title>{escape(str(config["title"]))} | Ymir Tool</title>', text, count=1, flags=re.S | re.I)
    text = text.replace('"inLanguage":"en"', '"inLanguage":"zh-CN"')
    text = re.sub(r'<nav\b[^>]*class="ymir-topbar"[^>]*>.*?</nav>', build_topbar(), text, count=1, flags=re.S | re.I)
    text = re.sub(r'<footer\b[^>]*class="ymir-footer"[^>]*>.*?</footer>', build_footer(), text, count=1, flags=re.S | re.I)
    content_pattern = re.compile(re.escape(END) + r'.*?</main>', re.S | re.I)
    replacement = END + "\n" + build_tool_content(slug, config) + "\n</main>"
    text, replacements = content_pattern.subn(lambda _match: replacement, text, count=1)
    if replacements != 1:
        raise RuntimeError(f"Could not replace retained content for {slug}")
    return text


def build_home_workbench() -> str:
    links = [
        ("/base64/", "Base64"),
        ("/urlencode/", "URL 编码"),
        ("/formatjs/", "JavaScript"),
        ("/regex/", "正则"),
        ("/textdiff/", "文本对比"),
        ("/txtcount/", "字数统计"),
        ("/unixtime/", "时间戳"),
    ]
    link_html = "".join(f'<a href="{href}">{label}</a>' for href, label in links)
    sample = escape('{"name":"Ymir Tool","ready":true,"tools":8}')
    return f'''{HOME_START}
<section aria-labelledby="ymir-fast-home-title" class="ymir-fast-workbench ymir-fast-workbench--home" data-fast-home="true" data-fast-primary-action="formatJson" data-fast-primary-target="output" data-fast-tool="json">
<header class="ymir-fast-head"><div><p class="ymir-fast-eyebrow" data-i18n-en="USE IT NOW" data-i18n-zh="现在就能用">现在就能用</p><p class="ymir-fast-title" id="ymir-fast-home-title" data-i18n-en="Instant JSON formatter" data-i18n-zh="JSON 即时格式化">JSON 即时格式化</p><p class="ymir-fast-description" data-i18n-en="The real workbench is already in the page. Paste JSON and format, minify, validate or copy it without waiting for the full tool directory." data-i18n-zh="真实工具框已直接写入页面。粘贴 JSON 后可立即格式化、压缩、校验或复制，不必等待完整工具目录加载。">真实工具框已直接写入页面。粘贴 JSON 后可立即格式化、压缩、校验或复制，不必等待完整工具目录加载。</p><nav aria-label="其他核心工具" class="ymir-fast-links">{link_html}</nav></div><span class="ymir-fast-badge" data-i18n-en="Local · ready" data-i18n-zh="本地处理 · 已就绪">本地处理 · 已就绪</span></header>
<div class="ymir-fast-body"><div class="ymir-fast-grid">
<section class="ymir-fast-panel"><div class="ymir-fast-panel-head"><strong data-i18n-en="JSON input" data-i18n-zh="JSON 输入">JSON 输入</strong><span>Input</span></div><textarea aria-label="JSON 输入" class="ymir-fast-input" data-fast-input="input" data-fast-sample="{sample}" placeholder='{{"name":"Ymir Tool"}}' spellcheck="false">{{"name":"Ymir Tool","ready":true,"tools":8}}</textarea></section>
<button class="ymir-fast-button ymir-fast-button--primary ymir-fast-mobile-primary" data-fast-action="formatJson" data-fast-target="output" type="button">格式化并查看结果</button>
<section class="ymir-fast-panel"><div class="ymir-fast-panel-head"><strong data-i18n-en="Reviewed output" data-i18n-zh="检查后的输出">检查后的输出</strong><span>Output</span></div><textarea aria-label="JSON 输出" class="ymir-fast-output" data-fast-output="output" placeholder="点击格式化、压缩或校验" readonly spellcheck="false"></textarea></section>
</div></div>
<div class="ymir-fast-actions"><button class="ymir-fast-button ymir-fast-button--primary" data-fast-action="formatJson" data-fast-target="output" type="button">格式化</button><button class="ymir-fast-button" data-fast-action="minifyJson" data-fast-target="output" type="button">压缩</button><button class="ymir-fast-button" data-fast-action="validateJson" data-fast-target="output" type="button">校验</button><span class="ymir-fast-actions-spacer"></span><button class="ymir-fast-button" data-fast-action="sample" type="button">载入样例</button><button class="ymir-fast-button" data-fast-action="copy" data-fast-target="output" type="button">复制结果</button><button class="ymir-fast-button" data-fast-action="clear" type="button">清空</button></div>
<div aria-live="polite" class="ymir-fast-status" data-fast-status role="status">已就绪。</div>
</section><noscript><div class="ymir-fast-noscript ymir-fast-workbench--home">工具框已经显示，但本地转换需要启用 JavaScript。</div></noscript>
{HOME_END}'''


def replace_workbench(text: str, workbench: str) -> str:
    generated = re.compile(re.escape(START) + r".*?" + re.escape(END), re.S)
    if generated.search(text):
        # Use a callable replacement so backslashes in samples (for example
        # regex word boundaries) are inserted literally instead of being
        # interpreted as replacement-string escapes by re.sub().
        return generated.sub(lambda _match: workbench, text, count=1)
    legacy = re.compile(
        r'<section\b[^>]*class="[^"]*ymir-vue-tool-root[^"]*"[^>]*>.*?</section>'
        r'\s*<noscript>.*?</noscript>'
        r'\s*<section\b[^>]*class="[^"]*ymir-static-tool-fallback[^"]*"[^>]*>.*?</section>',
        re.S | re.I,
    )
    updated, replacements = legacy.subn(lambda _match: workbench, text, count=1)
    if replacements != 1:
        raise RuntimeError("Could not replace the legacy workbench and fallback")
    return updated


def replace_resources(text: str) -> str:
    css_pattern = re.compile(r'<link href="/static/style/ymir-tool-bundle-v65\.css\?v=[^"]+" rel="stylesheet"/>')
    fast_css_tag = f'<link href="{FAST_CSS}" rel="stylesheet"/>'
    existing_fast_css = re.compile(r'<link href="/static/style/ymir-fast-core-v66\.css\?v=[^"]+" rel="stylesheet"/>')
    if existing_fast_css.search(text):
        text = existing_fast_css.sub(fast_css_tag, text, count=1)
    elif fast_css_tag not in text:
        text, replacements = css_pattern.subn(fast_css_tag, text, count=1)
        if replacements != 1:
            raise RuntimeError("Could not replace the legacy CSS tag")

    script_pattern = re.compile(
        r'\s*<script\s+defer(?:="")?\s+src="/static/script/(?:ymir-tools-manifest|ymir-tool-runtime-v63|ymir-tool-core-runtime-v63|ymir-vue-tools-app|ymir-tool-shell-v63|ymir-tool-watchdog-v63)\.js\?v=[^"]+"\s*></script>',
        re.I,
    )
    text = script_pattern.sub("", text)
    module_pattern = re.compile(r'\s*<script type="module" src="/static/script/ymir-fast-core-v66\.mjs\?v=[^"]+"></script>')
    text = module_pattern.sub("", text)
    text = text.replace('</body>', f'<script type="module" src="{FAST_SCRIPT}"></script>\n</body>', 1)
    return text


def update_tool(slug: str, config: dict[str, object]) -> bool:
    path = ROOT / slug / "index.html"
    original = path.read_text(encoding="utf-8")
    text = replace_workbench(original, build_workbench(slug, config))
    text = replace_resources(text)
    text = localize_tool_page(text, slug, config)
    text = re.sub(r'\s+data-vue-replaced="[^"]*"', '', text, count=1)
    if 'data-fast-core="v66"' not in text:
        text = re.sub(r'(<main\b[^>]*data-ymir-tool="' + re.escape(slug) + r'"[^>]*)>', r'\1 data-fast-core="v66">', text, count=1)
    if text != original:
        path.write_text(text, encoding="utf-8", newline="\n")
        return True
    return False


def update_home() -> bool:
    path = ROOT / "index.html"
    original = path.read_text(encoding="utf-8")
    text = original
    home_pattern = re.compile(re.escape(HOME_START) + r".*?" + re.escape(HOME_END), re.S)
    workbench = build_home_workbench()
    text = re.sub(r"\s*" + re.escape(HOME_START) + r".*?" + re.escape(HOME_END) + r"\s*", "\n", text, count=1, flags=re.S)
    main_anchor = '<main class="ymir-page ymir-home-page">'
    if main_anchor not in text:
        raise RuntimeError("Could not find the homepage main element")
    text = text.replace(main_anchor, f"{main_anchor}\n{workbench}", 1)

    fast_css_tag = f'<link href="{FAST_CSS}" rel="stylesheet"/>'
    text = re.sub(r'\s*<link href="/static/style/ymir-fast-core-v66\.css\?v=[^"]+" rel="stylesheet"/>\s*', "\n", text)
    css_anchor = '<link href="/static/style/bootstrap-compat.css?v=20260531-v58" rel="stylesheet"/>'
    if css_anchor not in text:
        raise RuntimeError("Could not find the homepage CSS anchor")
    text = text.replace(css_anchor, f"{fast_css_tag}\n{css_anchor}", 1)

    text = re.sub(
        r'\s*<script\s+defer(?:="")?\s+src="/static/script/ymir-tools-manifest\.js\?v=[^"]+"\s*></script>',
        "",
        text,
        flags=re.I,
    )
    text = re.sub(
        r'/static/script/ymir-home-dashboard\.js\?v=[^"\s]+',
        f'/static/script/ymir-home-dashboard.js?v={VERSION}',
        text,
        count=1,
    )
    module_pattern = re.compile(r'\s*<script type="module" src="/static/script/ymir-fast-core-v66\.mjs\?v=[^"]+"></script>')
    text = module_pattern.sub("", text)
    text = text.replace("</body>", f'<script type="module" src="{FAST_SCRIPT}"></script>\n</body>', 1)

    if text != original:
        path.write_text(text, encoding="utf-8", newline="\n")
        return True
    return False


def main() -> None:
    changed = [slug for slug, config in TOOL_CONFIGS.items() if update_tool(slug, config)]
    home_changed = update_home()
    print(f"Phase 8 generated {len(TOOL_CONFIGS)} fast core pages and the homepage workbench; changed {len(changed) + int(home_changed)} file(s).")
    if changed:
        print("Changed: " + ", ".join(changed))
    if home_changed:
        print("Changed: homepage")


if __name__ == "__main__":
    main()
