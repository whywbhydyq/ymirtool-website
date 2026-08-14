#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERSION = "20260809-v67"
MANIFEST = ROOT / "static" / "script" / "ymir-vue-tool-manifest.json"
CORE_SLUGS = {"json", "base64", "urlencode", "formatjs", "regex", "textdiff", "txtcount", "unixtime"}
CATEGORY_ORDER = ["json", "encode", "format", "text", "hash", "calc", "network", "reference"]
CATEGORY_COPY = {
    "json": ("JSON", "结构化数据的格式化、转换与检查"),
    "encode": ("编码与转换", "文本、URL、进制与加解码辅助工具"),
    "format": ("代码格式化", "代码、标记语言与查询语句整理"),
    "text": ("文本处理", "对比、统计、替换与常用文本操作"),
    "hash": ("哈希摘要", "常见摘要算法与校验值生成"),
    "calc": ("计算与换算", "单位换算、日期和日常计算"),
    "network": ("网络工具", "DNS、IP、请求信息与网络排查"),
    "reference": ("开发对照表", "命令、状态码、键码与开发参考"),
}

GUIDE_GROUPS = [
    ("data", "数据与编码", "从语法、字符集和传输层定位问题", [
        ("/json-format-guide.html", "JSON 格式化与错误排查", "定位尾随逗号、单引号、未转义字符、API 响应外壳和大整数风险。", "JSON 严格语法 API 响应"),
        ("/base64-encoding-guide.html", "Base64 编码与 Unicode 排查", "区分标准 Base64 与 Base64URL，处理 padding、UTF-8、乱码和二进制边界。", "Base64 Unicode padding 乱码"),
        ("/url-encoding-guide.html", "URL 参数编码排查", "判断应编码完整 URL、路径片段还是 query value，并识别重复编码。", "URL query 路径 重复编码"),
    ]),
    ("code", "代码与匹配", "检查格式、语法边界和匹配规则", [
        ("/javascript-formatter-guide.html", "JavaScript 格式化指南", "理解格式化能解决什么、不能解决什么，并检查语法错误与输出差异。", "JavaScript 格式化 语法"),
        ("/regex-tester-guide.html", "JavaScript 正则测试指南", "用正例和反例检查 flags、转义、捕获组、Unicode 与潜在性能问题。", "正则 RegExp flags 捕获组"),
    ]),
    ("text", "文本与时间", "核对内容差异、计数口径与时间单位", [
        ("/text-diff-guide.html", "文本差异比较指南", "区分内容变化、空白变化、换行符差异和 Unicode 规范化问题。", "文本差异 空白 换行"),
        ("/text-count-guide.html", "文本统计指南", "解释字符、单词、行、CJK 文本与 emoji 计数口径的差异。", "字数 字符 CJK emoji"),
        ("/unix-time-guide.html", "Unix 时间戳排查指南", "区分秒、毫秒与微秒，并核对 UTC、本地时区和夏令时显示。", "Unix 时间戳 UTC 时区"),
    ]),
]


def esc(value: object) -> str:
    return html.escape(str(value or ""), quote=True)


def chinese_description(tool: dict[str, object]) -> str:
    description = str(tool.get("descriptionZh") or "").strip()
    if re.search(r"[\u3400-\u9fff]", description):
        return description
    title = str(tool.get("titleZh") or tool.get("titleEn") or tool.get("slug") or "当前工具")
    category = str(tool.get("categoryLabelZh") or "开发")
    return f"打开{title}，在浏览器中完成{category}相关处理并复核结果。"


def tool_icon(tool: dict[str, object]) -> str:
    slug = str(tool.get("slug") or "YT")
    curated = {"json": "{}", "base64": "64", "urlencode": "%", "formatjs": "JS", "regex": ".*", "textdiff": "≠", "txtcount": "字", "unixtime": "T"}
    return curated.get(slug, slug[:2].upper())


def build_filters(items: list[tuple[str, str]]) -> str:
    buttons = ['<button aria-pressed="true" class="is-active" data-discovery-filter="all" type="button">全部</button>']
    buttons.extend(
        f'<button aria-pressed="false" data-discovery-filter="{esc(value)}" type="button">{esc(label)}</button>'
        for value, label in items
    )
    return '<div aria-label="按分类筛选" class="ymir-discovery-filters" role="group">' + "".join(buttons) + "</div>"


def footer() -> str:
    return '''<footer class="ymir-footer" lang="zh-CN"><span>© 2026 <a href="/">Ymir Tool</a></span><a href="/tools.html">全部工具</a><a href="/guides.html">使用指南</a><a href="/about.html">关于我们</a><a href="/privacy.html">隐私政策</a><a href="/terms.html">使用条款</a><a href="/contact.html">联系我们</a><a href="/methodology.html">测试方法</a><a href="/sources.html">资料来源</a><a href="/licenses.html">开源许可</a><a href="/changelog.html">更新记录</a><a href="/disclaimer.html">免责声明</a><span>所有工具均以公开或脱敏样例进行测试。</span></footer>'''


def topbar() -> str:
    return '''<nav class="ymir-topbar" lang="zh-CN"><div class="ymir-topbar-inner"><a class="ymir-brand" href="/"><span aria-hidden="true" class="ymir-brand-mark">Y</span><span>Ymir Tool</span></a><div class="ymir-nav"><a href="/json/">JSON</a><a href="/base64/">Base64</a><a href="/urlencode/">URL 编码</a><a href="/formatjs/">JavaScript 格式化</a><a href="/textdiff/">文本对比</a><a href="/guides.html">使用指南</a></div><div class="ymir-topbar-actions"></div></div></nav>'''


def build_tools_main(manifest: dict[str, object]) -> str:
    grouped: dict[str, list[dict[str, object]]] = defaultdict(list)
    for tool in manifest["tools"]:
        grouped[str(tool["category"])].append(tool)

    filters = build_filters([(category, CATEGORY_COPY[category][0]) for category in CATEGORY_ORDER])
    sections: list[str] = []
    for category in CATEGORY_ORDER:
        label, summary = CATEGORY_COPY[category]
        tools = sorted(
            grouped[category],
            key=lambda item: (0 if item.get("slug") in CORE_SLUGS else 1, str(item.get("titleZh") or item.get("titleEn") or "")),
        )
        cards: list[str] = []
        for tool in tools:
            slug = str(tool["slug"])
            title = str(tool.get("titleZh") or tool.get("titleEn") or slug)
            description = chinese_description(tool)
            search = " ".join(str(tool.get(key) or "") for key in ("titleZh", "titleEn", "descriptionZh", "descriptionEn", "keywords", "slug"))
            badge = '<span class="ymir-tool-badge">重点维护</span>' if slug in CORE_SLUGS else '<span class="ymir-tool-badge is-secondary">完整目录</span>'
            cards.append(f'''<a class="ymir-tool-directory-card" data-discovery-card data-discovery-category="{esc(category)}" data-search="{esc(search)}" data-tool-card="" href="/{esc(slug)}/">
<span aria-hidden="true" class="ymir-tool-directory-icon">{esc(tool_icon(tool))}</span>
<span class="ymir-tool-directory-copy"><strong>{esc(title)}</strong><span>{esc(description)}</span></span>
<span class="ymir-tool-directory-meta"><code>/{esc(slug)}/</code>{badge}</span>
</a>''')
        sections.append(f'''<section class="ymir-discovery-group" data-discovery-group data-tool-group="{esc(category)}">
<header><div><p>{esc(label)}</p><h2>{esc(summary)}</h2></div><span>{len(tools)} 个工具</span></header>
<div class="ymir-tool-directory-grid">{"".join(cards)}</div>
</section>''')

    return f'''<main class="ymir-discovery-page ymir-tools-page" data-discovery-root data-discovery-unit="工具">
<header class="ymir-discovery-hero"><div><p class="ymir-discovery-eyebrow">全部工具</p><h1>150 个浏览器工具，按任务快速找到</h1><p>优先显示持续维护的核心入口，同时保留完整工具目录和原有网址。技术名称保留英文，操作说明统一使用中文。</p></div><dl><div><dt>150</dt><dd>工具</dd></div><div><dt>8</dt><dd>重点维护</dd></div><div><dt>8</dt><dd>任务分类</dd></div></dl></header>
<section aria-label="搜索和筛选工具" class="ymir-discovery-control">
<label class="ymir-discovery-search" for="allToolsSearch"><span>搜索工具</span><input autocomplete="off" data-discovery-search id="allToolsSearch" placeholder="输入 JSON、编码、DNS、单位换算或工具名称" type="search"/></label>
{filters}
<div class="ymir-discovery-summary"><p id="allToolsCount" aria-live="polite" data-discovery-count>显示 150 个工具</p><button data-discovery-reset type="button">清除筛选</button></div>
</section>
<section class="ymir-discovery-empty" data-discovery-empty id="allToolsEmpty" hidden><strong>没有找到匹配的工具</strong><p>换一个关键词，或清除当前分类后再试。</p><button data-discovery-reset type="button">查看全部工具</button></section>
{"".join(sections)}
</main>'''


def build_guides_main() -> str:
    filters = build_filters([(group_id, title) for group_id, title, _summary, _guides in GUIDE_GROUPS])
    sections: list[str] = []
    for group_id, title, summary, guides in GUIDE_GROUPS:
        cards = "".join(
            f'''<a class="ymir-guide-directory-card" data-discovery-card data-discovery-category="{esc(group_id)}" data-guide-card="" data-search="{esc(title + ' ' + description + ' ' + keywords)}" href="{esc(href)}"><span class="ymir-guide-card-kicker">{esc(title)}</span><strong>{esc(title_text)}</strong><span>{esc(description)}</span><em>打开指南 →</em></a>'''
            for href, title_text, description, keywords in guides
        )
        sections.append(f'''<section class="ymir-discovery-group" data-discovery-group data-guide-group="{esc(group_id)}"><header><div><p>{esc(title)}</p><h2>{esc(summary)}</h2></div><span>{len(guides)} 篇指南</span></header><div class="ymir-guide-directory-grid">{cards}</div></section>''')

    steps = [
        ("01", "确认问题", "记录输入类型、错误提示和预期结果。"),
        ("02", "缩小样例", "用不含敏感数据的最小样例复现。"),
        ("03", "使用工具", "按指南步骤处理输入并查看边界提示。"),
        ("04", "回到目标系统", "把结果放回真实环境再次验证。"),
    ]
    workflow = "".join(
        f'<li class="ymir-workflow-step"><span>{number}</span><strong>{title}</strong><p>{description}</p></li>'
        for number, title, description in steps
    )
    return f'''<main class="ymir-discovery-page ymir-guides-page" data-discovery-root data-discovery-unit="指南">
<header class="ymir-discovery-hero"><div><p class="ymir-discovery-eyebrow">使用指南</p><h1>从具体问题出发，找到可执行的排查步骤</h1><p>按数据、代码或文本任务筛选指南。每篇内容都连接到对应工具，避免在泛化文章中反复寻找答案。</p></div><dl><div><dt>8</dt><dd>任务指南</dd></div><div><dt>3</dt><dd>问题分类</dd></div><div><dt>4</dt><dd>验证步骤</dd></div></dl></header>
<section aria-label="搜索和筛选指南" class="ymir-discovery-control">
<label class="ymir-discovery-search" for="guideSearch"><span>搜索指南</span><input autocomplete="off" data-discovery-search id="guideSearch" placeholder="输入 JSON、Base64、正则、文本差异或时间戳" type="search"/></label>
{filters}
<div class="ymir-discovery-summary"><p id="guideCount" aria-live="polite" data-discovery-count>显示 8 篇指南</p><button data-discovery-reset type="button">清除筛选</button></div>
</section>
<section class="ymir-discovery-empty" data-discovery-empty id="guideEmpty" hidden><strong>没有找到匹配的指南</strong><p>换一个问题关键词，或清除当前分类后再试。</p><button data-discovery-reset type="button">查看全部指南</button></section>
{"".join(sections)}
<section class="ymir-guide-workflow"><header><p>推荐流程</p><h2>不要停在网页结果，完成一次闭环验证</h2></header><ol>{workflow}</ol></section>
</main>'''


def update_page(path: Path, main_html: str) -> bool:
    original = path.read_text(encoding="utf-8")
    text = original
    text = re.sub(r'<html\b[^>]*>', '<html class="ymir-modern-html" lang="zh-CN">', text, count=1, flags=re.I)
    text = re.sub(r'<nav\b[^>]*class="ymir-topbar"[^>]*>.*?</nav>', lambda _match: topbar(), text, count=1, flags=re.S | re.I)
    text = re.sub(r'<main\b[^>]*>.*?</main>', lambda _match: main_html, text, count=1, flags=re.S | re.I)
    text = re.sub(r'<footer\b[^>]*class="ymir-footer"[^>]*>.*?</footer>', lambda _match: footer(), text, count=1, flags=re.S | re.I)
    text = re.sub(r'\s*<link href="/static/style/(?:ymir-tools-directory|ymir-discovery-pages)\.css\?v=[^"]+" rel="stylesheet"/>', '', text)
    system_link = '<link href="/static/style/ymir-tool-system-v61.css?v=20260710-v62" rel="stylesheet"/>'
    discovery_link = f'<link href="/static/style/ymir-discovery-pages.css?v={VERSION}" rel="stylesheet"/>'
    if system_link not in text:
        raise RuntimeError(f"{path.name}: shared tool-system stylesheet is missing")
    text = text.replace(system_link, system_link + "\n" + discovery_link, 1)
    text = re.sub(
        r'\s*<script\b(?=[^>]*\bsrc="/static/script/ymir-theme\.js\?v=[^"]+")[^>]*>\s*</script>',
        '',
        text,
        flags=re.I,
    )
    text = text.replace('</head>', f'<script defer src="/static/script/ymir-theme.js?v={VERSION}"></script>\n</head>', 1)
    text = re.sub(
        r'\s*<script\b(?=[^>]*\bsrc="/static/script/(?:ymir-tools-directory|ymir-discovery-pages)\.js\?v=[^"]+")[^>]*>\s*</script>',
        '',
        text,
        flags=re.I,
    )
    discovery_script = f'<script defer src="/static/script/ymir-discovery-pages.js?v={VERSION}"></script>'
    shell_script = re.search(r'<script defer src="/static/script/ymir-tool-shell-v63\.js\?v=[^"]+"></script>', text)
    if not shell_script:
        raise RuntimeError(f"{path.name}: shared shell script is missing")
    text = text.replace(shell_script.group(0), discovery_script + "\n" + shell_script.group(0), 1)
    if text != original:
        path.write_text(text, encoding="utf-8", newline="\n")
        return True
    return False


def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    if int(manifest.get("toolCount", 0)) != 150:
        raise RuntimeError("The discovery page requires the complete 150-tool manifest")
    changed = []
    if update_page(ROOT / "tools.html", build_tools_main(manifest)):
        changed.append("tools.html")
    if update_page(ROOT / "guides.html", build_guides_main()):
        changed.append("guides.html")
    print(f"Refined discovery pages; changed {len(changed)} file(s).")
    if changed:
        print("Changed: " + ", ".join(changed))


if __name__ == "__main__":
    main()
