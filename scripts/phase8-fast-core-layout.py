#!/usr/bin/env python3
from __future__ import annotations

import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERSION = "20260809-v66"
FAST_CSS = f'/static/style/ymir-fast-core-v66.css?v={VERSION}'
FAST_SCRIPT = f'/static/script/ymir-fast-core-v66.mjs?v={VERSION}'
START = '<!-- ymir-fast-workbench:start -->'
END = '<!-- ymir-fast-workbench:end -->'
HOME_START = '<!-- ymir-fast-home:start -->'
HOME_END = '<!-- ymir-fast-home:end -->'

TOOL_CONFIGS = {
    "json": {
        "title": "JSON Formatter & Validator",
        "description": "Paste strict JSON, then format, validate, minify, and copy it locally in your browser.",
        "kind": "text",
        "sample": '{"status":"ok","items":[{"id":1,"name":"Ymir Tool"}]}',
        "primary": "formatJson",
        "actions": [("formatJson", "Format", True), ("minifyJson", "Minify", False), ("validateJson", "Validate", False)],
        "input_label": "JSON input",
        "output_label": "Reviewed output",
        "placeholder": '{"name":"Ymir Tool"}',
    },
    "base64": {
        "title": "Base64 Encoder & Decoder",
        "description": "Encode UTF-8 text to Base64 or decode standard and URL-safe Base64 without uploading content.",
        "kind": "text",
        "sample": "Ymir Tool 支持 UTF-8 text",
        "primary": "encodeBase64",
        "actions": [("encodeBase64", "Encode", True), ("decodeBase64", "Decode", False)],
        "input_label": "Text or Base64 input",
        "output_label": "Encoded or decoded output",
        "placeholder": "Enter text or a Base64 value",
    },
    "urlencode": {
        "title": "URL Encoder & Decoder",
        "description": "Encode URL components or decode percent-encoded values locally, including UTF-8 text.",
        "kind": "text",
        "sample": "https://ymirtool.com/search?q=中文 test&source=tool",
        "primary": "encodeUrl",
        "actions": [("encodeUrl", "Encode component", True), ("decodeUrl", "Decode", False)],
        "input_label": "URL component or encoded value",
        "output_label": "Converted output",
        "placeholder": "Paste a URL component or percent-encoded value",
    },
    "formatjs": {
        "title": "JavaScript Formatter",
        "description": "Apply lightweight indentation or minification to a JavaScript snippet before reviewing and copying it.",
        "kind": "text",
        "sample": 'function hello(name){if(name){return "Hello, "+name;}return "Ymir Tool";}',
        "primary": "formatJavaScript",
        "actions": [("formatJavaScript", "Format", True), ("minifyJavaScript", "Light minify", False)],
        "input_label": "JavaScript input",
        "output_label": "Formatted output",
        "placeholder": "Paste a JavaScript snippet",
    },
    "regex": {
        "title": "JavaScript Regex Tester",
        "description": "Test a JavaScript regular expression, flags, capture groups, and match positions against sample text.",
        "kind": "regex",
        "primary": "testRegex",
        "pattern": r"\b(error|warning)\b",
        "text": "INFO ready\nWARNING retry\nERROR failed",
    },
    "textdiff": {
        "title": "Text Difference Checker",
        "description": "Compare two text blocks line by line and review added, removed, and changed lines before copying.",
        "kind": "diff",
        "primary": "compareText",
        "original": "Release notes\n- Added JSON validation\n- Fixed copy flow",
        "changed": "Release notes\n- Added JSON and URL validation\n- Fixed copy flow",
    },
    "txtcount": {
        "title": "Word & Character Counter",
        "description": "Count characters, non-space characters, words or CJK characters, and lines as you type.",
        "kind": "metrics",
        "primary": "countText",
        "sample": "Ymir Tool counts words, 中文字符, and lines.\nEverything runs locally.",
    },
    "unixtime": {
        "title": "Unix Timestamp Converter",
        "description": "Convert Unix seconds or milliseconds to ISO time and convert a date back to both timestamp units.",
        "kind": "time",
        "primary": "timestampToDate",
        "timestamp": "1767225600",
        "date": "2026-01-01T00:00:00Z",
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
<section class="ymir-fast-panel"><div class="ymir-fast-panel-head"><strong>{escape(str(config["input_label"]))}</strong><span>Input</span></div><textarea class="ymir-fast-input" data-fast-input="input" data-fast-sample="{sample}" placeholder="{escape(str(config["placeholder"]))}" spellcheck="false"></textarea></section>
<section class="ymir-fast-panel"><div class="ymir-fast-panel-head"><strong>{escape(str(config["output_label"]))}</strong><span>Output</span></div><textarea class="ymir-fast-output" data-fast-output="output" placeholder="Run an action to see the result" readonly spellcheck="false"></textarea></section>
</div>'''


def regex_panel(config: dict[str, object]) -> str:
    return f'''<div class="ymir-fast-controls"><div class="ymir-fast-control-stack"><label class="ymir-fast-field">Pattern<input class="ymir-fast-single-input" data-fast-input="pattern" data-fast-sample="{escape(str(config["pattern"]))}" placeholder="Enter a JavaScript regex pattern" spellcheck="false" type="text"/></label><fieldset class="ymir-fast-field"><legend>Flags</legend><span class="ymir-fast-flags"><label class="ymir-fast-flag"><input checked data-fast-default data-fast-flag="g" type="checkbox"/>g</label><label class="ymir-fast-flag"><input checked data-fast-default data-fast-flag="i" type="checkbox"/>i</label><label class="ymir-fast-flag"><input data-fast-flag="m" type="checkbox"/>m</label></span></fieldset></div></div>
<div class="ymir-fast-grid"><section class="ymir-fast-panel"><div class="ymir-fast-panel-head"><strong>Test text</strong><span>Input</span></div><textarea class="ymir-fast-input" data-fast-input="text" data-fast-sample="{escape(str(config["text"]))}" placeholder="Paste text to test" spellcheck="false"></textarea></section><section class="ymir-fast-panel"><div class="ymir-fast-panel-head"><strong>Matches and positions</strong><span>Output</span></div><textarea class="ymir-fast-output" data-fast-output="output" placeholder="Run the regex to see matches" readonly spellcheck="false"></textarea></section></div>'''


def diff_panel(config: dict[str, object]) -> str:
    return f'''<div class="ymir-fast-grid ymir-fast-grid--three"><section class="ymir-fast-panel"><div class="ymir-fast-panel-head"><strong>Original text</strong><span>Input A</span></div><textarea class="ymir-fast-input" data-fast-input="original" data-fast-sample="{escape(str(config["original"]))}" placeholder="Paste the original text"></textarea></section><section class="ymir-fast-panel"><div class="ymir-fast-panel-head"><strong>Changed text</strong><span>Input B</span></div><textarea class="ymir-fast-input" data-fast-input="changed" data-fast-sample="{escape(str(config["changed"]))}" placeholder="Paste the changed text"></textarea></section><section class="ymir-fast-panel"><div class="ymir-fast-panel-head"><strong>Line differences</strong><span>Output</span></div><textarea class="ymir-fast-output" data-fast-output="output" placeholder="Compare to see added and removed lines" readonly></textarea></section></div>'''


def metrics_panel(config: dict[str, object]) -> str:
    return f'''<div class="ymir-fast-grid"><section class="ymir-fast-panel"><div class="ymir-fast-panel-head"><strong>Text to count</strong><span>Live input</span></div><textarea class="ymir-fast-input" data-fast-input="input" data-fast-sample="{escape(str(config["sample"]))}" placeholder="Type or paste text"></textarea></section><section class="ymir-fast-panel"><div class="ymir-fast-panel-head"><strong>Text metrics</strong><span>Live result</span></div><div class="ymir-fast-metrics"><div class="ymir-fast-metric"><strong data-fast-metric="characters">0</strong><span>Characters</span></div><div class="ymir-fast-metric"><strong data-fast-metric="charactersNoSpaces">0</strong><span>No spaces</span></div><div class="ymir-fast-metric"><strong data-fast-metric="words">0</strong><span>Words / CJK chars</span></div><div class="ymir-fast-metric"><strong data-fast-metric="lines">0</strong><span>Lines</span></div></div><textarea class="ymir-fast-output" data-fast-output="output" hidden readonly></textarea></section></div>'''


def time_panel(config: dict[str, object]) -> str:
    return f'''<div class="ymir-fast-grid"><section class="ymir-fast-panel"><div class="ymir-fast-panel-head"><strong>Timestamp to ISO date</strong><span>Seconds or milliseconds</span></div><label class="ymir-fast-field">Unix timestamp<input class="ymir-fast-single-input" data-fast-input="timestamp" data-fast-sample="{escape(str(config["timestamp"]))}" inputmode="numeric" placeholder="1767225600" type="text"/></label><label class="ymir-fast-field">ISO result<textarea class="ymir-fast-output" data-fast-output="dateOutput" placeholder="Run timestamp conversion" readonly></textarea></label></section><section class="ymir-fast-panel"><div class="ymir-fast-panel-head"><strong>Date to timestamp</strong><span>ISO or local date</span></div><label class="ymir-fast-field">Date<input class="ymir-fast-single-input" data-fast-input="date" data-fast-sample="{escape(str(config["date"]))}" placeholder="2026-01-01T00:00:00Z" type="text"/></label><label class="ymir-fast-field">Seconds and milliseconds<textarea class="ymir-fast-output" data-fast-output="timestampOutput" placeholder="Run date conversion" readonly></textarea></label></section></div>'''


def action_bar(config: dict[str, object]) -> str:
    if config["kind"] == "time":
        primary_actions = button("timestampToDate", "Timestamp → date", True, "dateOutput") + button("dateToTimestamp", "Date → timestamp", False, "timestampOutput")
    elif config["kind"] == "metrics":
        primary_actions = button("countText", "Count text", True, "output")
    elif config["kind"] in {"regex", "diff"}:
        label = "Test regex" if config["kind"] == "regex" else "Compare text"
        primary_actions = button(str(config["primary"]), label, True, "output")
    else:
        primary_actions = "".join(button(action, label, primary, "output") for action, label, primary in config["actions"])
    return primary_actions + '<span class="ymir-fast-actions-spacer"></span>' + button("sample", "Load sample") + button("copy", "Copy result", target="output") + button("clear", "Clear")


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
<section aria-labelledby="ymir-fast-{slug}-title" class="ymir-fast-workbench" data-fast-primary-action="{escape(str(config["primary"]))}" data-fast-tool="{slug}"{extra_attrs}>
<header class="ymir-fast-head"><div><p class="ymir-fast-eyebrow">Instant browser tool</p><p class="ymir-fast-title" id="ymir-fast-{slug}-title">{escape(str(config["title"]))}</p><p class="ymir-fast-description">{escape(str(config["description"]))}</p></div><span class="ymir-fast-badge">Local · ready on load</span></header>
<div class="ymir-fast-body">{panel_builders[str(config["kind"])](config)}</div>
<div class="ymir-fast-actions">{actions}</div>
<div aria-live="polite" class="ymir-fast-status" data-fast-status role="status">Ready.</div>
</section><noscript><div class="ymir-fast-noscript">JavaScript is disabled. The workbench is visible, but local transformations require JavaScript.</div></noscript>
{END}'''


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
    if fast_css_tag not in text:
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
    text = re.sub(r"\s*" + re.escape(fast_css_tag) + r"\s*", "\n", text)
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
