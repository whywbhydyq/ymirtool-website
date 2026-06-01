#!/usr/bin/env python3
"""AdSense content hardening pass for Ymir Tool static HTML.

This script does not build the site and does not run tests. It enriches static
HTML pages in place so AdSense reviewers see publisher content, clear page
purpose, usage guidance, and safe-use boundaries before the Vue app mounts.
"""
from __future__ import annotations

import html
import json
import re
from pathlib import Path
from xml.sax.saxutils import escape as xml_escape

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "static/script/ymir-vue-tool-manifest.json"
STAMP = "20260601"
VERSION = "20260601-adsense-hardening"

CATEGORY_CONTEXT = {
    "json": {
        "audience": "API debugging, configuration review, log inspection, and documentation cleanup",
        "checks": "confirm strict JSON syntax, preserve field names, and compare the final structure with the original payload",
        "limits": "It should not be used as the only validation layer for production API contracts or security-sensitive payloads.",
        "example": "A typical workflow is to paste a small API response, format it, check nested objects and arrays, then copy a compact version only after the schema still matches the source.",
    },
    "encode": {
        "audience": "encoding, decoding, escaping, and compatibility checks for text, URLs, browser snippets, and data samples",
        "checks": "verify the expected character set, watch for double encoding, and test a short sample before processing a longer value",
        "limits": "Encoding is not encryption, and browser encoding helpers should not be treated as secure storage or access control.",
        "example": "A typical workflow is to paste a harmless sample, run the conversion, compare visible characters and escaped bytes, then repeat with the real non-sensitive text.",
    },
    "hash": {
        "audience": "checksum comparison, digest demonstrations, migration checks, and non-sensitive test strings",
        "checks": "compare the algorithm name, input whitespace, line endings, and uppercase or lowercase digest formatting before sharing a result",
        "limits": "Digest helpers are not a password storage system. Use reviewed password hashing and key-management libraries for production security.",
        "example": "A typical workflow is to hash a known sample first, confirm the expected digest length, then calculate the digest for a non-secret value that needs quick comparison.",
    },
    "text": {
        "audience": "copy editing, content cleanup, line comparison, counting, replacement, and everyday text transformation",
        "checks": "review changed whitespace, punctuation, capitalization, line breaks, and copied output before using the result elsewhere",
        "limits": "Text tools do not understand business intent, legal meaning, or confidential data handling rules; users should review important output manually.",
        "example": "A typical workflow is to paste a small sample, run the text action, inspect the exact changed lines, then copy only the output that matches the intended edit.",
    },
    "network": {
        "audience": "network lookup, HTTP inspection, DNS reference, browser diagnostics, and webmaster troubleshooting",
        "checks": "confirm the environment, browser, DNS resolver, protocol, and regional assumptions before treating a result as final",
        "limits": "Network helpers are for diagnosis and planning. They do not replace authoritative logs, monitoring, or provider documentation.",
        "example": "A typical workflow is to collect the current value, compare it with the expected reference, then document the exact browser or network context that produced the result.",
    },
    "calc": {
        "audience": "quick arithmetic, unit conversion, planning estimates, timestamp checks, and everyday numeric verification",
        "checks": "confirm units, rounding, precision, timezone, and formula assumptions before copying numbers into another workflow",
        "limits": "Calculator results are quick estimates and should not replace audited financial, legal, engineering, medical, or compliance calculations.",
        "example": "A typical workflow is to enter a simple known value first, confirm units and rounding, then calculate the target value and record the assumptions beside the result.",
    },
    "format": {
        "audience": "code readability, snippet review, documentation cleanup, and quick formatting before manual inspection",
        "checks": "compare the formatted code with the source, review comments and string literals, and run official tooling before production use",
        "limits": "Formatter output is a convenience layer, not a compiler, linter, minifier guarantee, or security review.",
        "example": "A typical workflow is to paste a small snippet, format it, check bracket balance and indentation, then move the cleaned result into the project toolchain for authoritative validation.",
    },
    "reference": {
        "audience": "quick lookup of developer tables, codes, headers, commands, symbols, and implementation references",
        "checks": "confirm the exact version, platform, protocol, or vendor documentation before applying reference data to a production system",
        "limits": "Reference pages are compact lookup aids and should not override official platform documentation or local operational rules.",
        "example": "A typical workflow is to search the table, copy the relevant row, then verify the item against the official source required by the project.",
    },
}

DEFAULT_CONTEXT = {
    "audience": "quick browser-based utility work, documentation cleanup, and non-sensitive sample processing",
    "checks": "compare the output with the original input, check edge cases, and keep the source nearby until the result is confirmed",
    "limits": "Browser tools are convenient helpers and do not replace authoritative systems, production validation, or professional review.",
    "example": "A typical workflow is to test with a small sample, review the result, then repeat with the intended non-sensitive input and copy only the verified output.",
}

GUIDE_EXTRA = {
    "calculator-tools-guide.html": ["单位换算前先确认量纲是否一致，例如长度、面积、体积和数据大小不能混用。", "涉及利息、工程、安全边界或采购数量时，应把本站结果作为草稿估算，再用权威计算器或业务表格复核。"],
    "code-formatting-guide.html": ["代码格式化适合先提升可读性，再交给项目内的 formatter、linter、compiler 做最终判断。", "压缩、混淆或复制来的脚本尤其要检查字符串、注释、正则和模板语法，避免格式化后误判逻辑。"],
    "color-tools-guide.html": ["颜色工具适合快速换算 HEX、RGB 和调色板，但品牌色、印刷色和无障碍对比度仍应单独验证。", "同一个颜色在不同屏幕、浏览器和色彩配置下可能显示不同，最终设计应以项目规范为准。"],
    "common-errors-guide.html": ["排查在线工具问题时，先缩小输入样本，再逐步恢复原始数据，这比直接处理完整大段文本更容易定位问题。", "乱码、复制失败和脚本异常通常与编码、浏览器权限、扩展插件或粘贴内容中的隐藏字符有关。"],
    "developer-reference-guide.html": ["开发者对照表用于快速定位状态码、Content-Type、端口、命令和权限名，再回到官方文档确认版本差异。", "参考表中的名称和说明应服务于定位问题，而不是替代协议、平台或供应商的正式说明。"],
    "encoding-tools-guide.html": ["编码转换前要先判断目标是传输、展示、转义还是压缩；Base64、URL 编码和 Unicode 转义解决的是不同问题。", "重复编码是常见错误，尤其是 URL 参数、百分号和中文文本，需要用短样本确认一次再处理长文本。"],
    "hash-tools-guide.html": ["哈希摘要适合校验一致性和演示算法差异，但 MD5、SHA-1 等不适合存储密码。", "计算摘要前要确认输入是否包含空格、换行或不同大小写，因为微小差异会生成完全不同的结果。"],
    "network-tools-guide.html": ["网络工具适合浏览器侧诊断和资料查询；真正的线上故障还要结合服务器日志、DNS 控制台和监控系统。", "DNS、WebSocket、HTTP 头和浏览器信息都受到地区、网络、代理和浏览器策略影响，结果需要带上下文记录。"],
    "online-toolbox-guide.html": ["首页目录适合按任务查找工具，核心工具页提供更完整的示例、边界和相关入口。", "如果某个长尾工具暂时只用于快速处理，应把它当作辅助入口，而不是把它作为主要内容页提交给广告审核。"],
    "text-tools-guide.html": ["文本处理前要明确目标是比较、统计、替换、去重还是排版，不同工具会改变不同层面的内容。", "复制结果前应检查空格、换行、标点、大小写和隐藏字符，尤其是配置文件、合同文本和代码片段。"],
    "time-tools-guide.html": ["时间戳转换最常见的错误是秒级和毫秒级混淆，以及 UTC 与本地时区混淆。", "记录转换结果时建议同时写下时区、输入单位和原始时间，方便团队成员复核。"],
    "webmaster-tools-guide.html": ["站长工具适合生成草稿和排查配置，但 robots、sitemap、meta、重定向和服务器规则需要上线后再次抓取确认。", "涉及搜索引擎、广告审核或生产流量时，应把页面源代码、HTTP 状态码和实际抓取结果一起检查。"],
}


def clean_title(t: dict) -> str:
    return (t.get("shell", {}).get("heroTitle") or t.get("titleEn") or t.get("titleZh") or t.get("slug") or "Ymir Tool").strip()


def clean_desc(t: dict) -> str:
    return (t.get("descriptionEn") or t.get("shell", {}).get("description") or t.get("descriptionZh") or "Use this browser-based tool for quick, non-sensitive utility work.").strip()


def context_for(t: dict) -> dict:
    cat = (t.get("category") or "").lower()
    if t.get("slug") in {"json", "jsonzip", "json2xml", "json2yaml", "json2go", "json2java", "json2cs", "json2excel", "json2get", "jsonlrview", "jsonudview"}:
        return CATEGORY_CONTEXT["json"]
    if cat in CATEGORY_CONTEXT:
        return CATEGORY_CONTEXT[cat]
    return DEFAULT_CONTEXT


def tool_section(t: dict, include_h1: bool) -> str:
    title = html.escape(clean_title(t))
    desc = html.escape(clean_desc(t))
    slug = html.escape(t.get("slug") or t.get("id") or "tool")
    category = html.escape(t.get("categoryLabelEn") or t.get("category") or "Utility")
    zh = html.escape(t.get("titleZh") or title)
    ctx = context_for(t)
    related_hint = html.escape(", ".join([x for x in [t.get("categoryLabelEn"), t.get("categoryLabelZh"), t.get("titleZh")] if x][:3]))
    h1 = f"\n<section class=\"ymir-static-tool-lead ymir-container\" data-static-tool-lead=\"{slug}\" data-adsense-hardening-lead=\"{STAMP}\">\n  <p class=\"ymir-breadcrumb\">Home / {category} tools / {title}</p>\n  <h1>{title}</h1>\n  <p>{desc}</p>\n  <ul><li>Use a small sample first, then process the full non-sensitive input.</li><li>Review the output before copying it into documentation, code, or another system.</li><li>Keep the original text nearby so changed formatting, encoding, units, or whitespace can be compared.</li></ul>\n</section>\n" if include_h1 else ""
    body = f"""
<section class=\"ymir-container ymir-help ymir-card ymir-adsense-quality\" data-adsense-hardening=\"{STAMP}\">
  <h2>How to use {title}</h2>
  <p>{title} is built for {html.escape(ctx['audience'])}. {desc}</p>
  <p>Start with a short input that you already understand. After the tool returns a result, compare the visible output with the expected format, then repeat the task with the full non-sensitive value. This keeps the page useful as a workbench instead of a blank converter screen.</p>
  <h2>Review checklist before copying</h2>
  <ul>
    <li>{html.escape(ctx['checks']).capitalize()}.</li>
    <li>Check whether spaces, line breaks, punctuation, case, units, timezone, or escaped characters changed during processing.</li>
    <li>For shared documents, add a short note explaining what changed and why the result is acceptable.</li>
  </ul>
  <h2>Use cases and boundaries</h2>
  <p>This page is most useful for {related_hint.lower()} workflows where a fast browser-side check saves time. {html.escape(ctx['limits'])}</p>
  <p>{html.escape(ctx['example'])} For sensitive material such as passwords, private keys, customer data, access tokens, or production credentials, use your approved internal workflow instead of a general online tool.</p>
  <h2>Related context</h2>
  <p>The Chinese label for this tool is {zh}. Users usually reach it from the Ymir Tool directory, a related guide, or a direct bookmark when they need one focused action rather than a large application.</p>
</section>
"""
    return h1 + body


def has_h1(text: str) -> bool:
    return bool(re.search(r"<h1[\s>]", text, re.I))


def insert_into_tool_page(path: Path, t: dict) -> bool:
    text = path.read_text(encoding="utf-8", errors="ignore")
    if f'data-adsense-hardening="{STAMP}"' in text:
        return False
    include_h1 = not has_h1(text)
    lead = tool_section(t, True).split('<section class="ymir-container ymir-help ymir-card ymir-adsense-quality"', 1)[0] if include_h1 else ""
    body = tool_section(t, False)
    if include_h1:
        text = re.sub(r"(<main\b[^>]*>)", r"\1" + lead, text, count=1, flags=re.I)
    # Insert detailed quality section before related links or before end of main.
    if '<section class="ymir-container ymir-related' in text:
        text = text.replace('<section class="ymir-container ymir-related', body + '\n<section class="ymir-container ymir-related', 1)
    else:
        text = text.replace('</main>', body + '\n</main>', 1)
    path.write_text(text, encoding="utf-8")
    return True


def patch_duplicate_titles() -> list[str]:
    changes = []
    fixes = {
        "ascii/index.html": {
            "old_title": "ASCII Code Converter | Ymir Tool",
            "new_title": "ASCII Text Encoder and Decoder | Ymir Tool",
            "old_desc": "Convert text to ASCII code lists and decode ASCII codes back to text.",
            "new_desc": "Convert plain text to ASCII decimal code lists and decode ASCII values back to readable text for compatibility checks.",
            "schema_name": "ASCII Text Encoder and Decoder",
        },
        "asciicode/index.html": {
            "old_title": "ASCII Code Converter | Ymir Tool",
            "new_title": "ASCII Table and Code Reference | Ymir Tool",
            "old_desc": "Convert text to ASCII code lists and decode ASCII codes back to text.",
            "new_desc": "Look up ASCII control codes, printable characters, decimal values, and text conversion notes in a compact reference page.",
            "schema_name": "ASCII Table and Code Reference",
        },
        "desencrypt/index.html": {
            "old_title": "DES Encrypt / Decrypt - Ymir Tool",
            "new_title": "DES Compatibility Encrypt / Decrypt - Ymir Tool",
            "old_desc": "Encrypt or decrypt DES text with a passphrase. DES is legacy and should only be used for compatibility checks.",
            "new_desc": "Encrypt or decrypt DES text for legacy compatibility checks and migration testing with non-sensitive sample data.",
            "schema_name": "DES Compatibility Encrypt / Decrypt",
        },
    }
    for rel, f in fixes.items():
        p = ROOT / rel
        if not p.exists():
            continue
        text = p.read_text(encoding="utf-8", errors="ignore")
        before = text
        text = text.replace(f"<title>{html.escape(f['old_title'])}</title>", f"<title>{html.escape(f['new_title'])}</title>")
        text = text.replace(f"content=\"{html.escape(f['old_desc'])}\"", f"content=\"{html.escape(f['new_desc'])}\"", 1)
        text = text.replace(f"property=\"og:title\" content=\"{html.escape(f['old_title'])}\"", f"property=\"og:title\" content=\"{html.escape(f['new_title'])}\"")
        text = text.replace(f"property=\"og:description\" content=\"{html.escape(f['old_desc'])}\"", f"property=\"og:description\" content=\"{html.escape(f['new_desc'])}\"")
        text = text.replace(f"name=\"twitter:title\" content=\"{html.escape(f['old_title'])}\"", f"name=\"twitter:title\" content=\"{html.escape(f['new_title'])}\"")
        text = text.replace(f"name=\"twitter:description\" content=\"{html.escape(f['old_desc'])}\"", f"name=\"twitter:description\" content=\"{html.escape(f['new_desc'])}\"")
        text = re.sub(r'("name"\s*:\s*)"[^"]+"', lambda m: m.group(1) + json.dumps(f['schema_name']), text, count=1) if rel in {"ascii/index.html", "asciicode/index.html", "desencrypt/index.html"} else text
        if text != before:
            p.write_text(text, encoding="utf-8")
            changes.append(rel)
    return changes


def guide_addition(path: Path) -> str:
    name = path.name
    title = re.search(r"<h1[^>]*>(.*?)</h1>", path.read_text(encoding="utf-8", errors="ignore"), re.S | re.I)
    h1 = re.sub(r"<.*?>", "", title.group(1)).strip() if title else path.stem.replace('-', ' ')
    bullets = GUIDE_EXTRA.get(name, ["先用短样本验证工具行为，再处理完整内容。", "重要结果需要结合业务规则、官方文档或项目内工具再次复核。"])
    return f"""
<section class=\"ymir-guide-review ymir-card\" data-adsense-hardening=\"{STAMP}\">
<h2>审核与使用建议</h2>
<p>{html.escape(h1)} 不应只作为入口列表存在。更可靠的使用方式是先明确输入来源、处理目标、输出去向和复核标准，再打开对应工具完成具体操作。</p>
<ul>
<li>{html.escape(bullets[0])}</li>
<li>{html.escape(bullets[1])}</li>
<li>如果结果会进入生产配置、客户交付、财务估算、法律文件或安全流程，应保留原始输入和操作记录，便于回滚和人工复核。</li>
</ul>
<h2>适合直接访问本站的用户</h2>
<p>这类指南面向开发者、站长、运营、学生和办公用户。用户可以不经过搜索引擎，直接从首页、指南中心或收藏夹进入，按任务选择 JSON、编码、文本、时间、网络、计算和参考类工具。</p>
<p>本站的目标不是堆砌关键词，而是把常见在线工具的使用边界写清楚：哪些输入适合浏览器里快速处理，哪些结果需要权威来源确认，哪些敏感信息不应该粘贴进通用网页工具。</p>
</section>
"""


def patch_guides() -> list[str]:
    changed = []
    for name in GUIDE_EXTRA:
        path = ROOT / name
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        before = text
        text = text.replace('<meta name="robots" content="noindex, follow"/>', '<meta name="robots" content="index, follow"/>')
        text = text.replace('<meta name="robots" content="noindex, follow">', '<meta name="robots" content="index, follow">')
        if f'data-adsense-hardening="{STAMP}"' not in text:
            if '<section class="ymir-guide-related"' in text:
                text = text.replace('<section class="ymir-guide-related"', guide_addition(path) + '\n<section class="ymir-guide-related"', 1)
            else:
                text = text.replace('</div>\n</body>', guide_addition(path) + '\n</div>\n</body>', 1)
        if text != before:
            path.write_text(text, encoding="utf-8")
            changed.append(name)
    return changed


def patch_sitemap_guides() -> bool:
    path = ROOT / "sitemap-guides.xml"
    text = path.read_text(encoding="utf-8", errors="ignore")
    changed = False
    for name in GUIDE_EXTRA:
        loc = f"https://ymirtool.com/{name}"
        if loc not in text:
            entry = f'  <url><loc>{xml_escape(loc)}</loc><lastmod>2026-06-01</lastmod><changefreq>monthly</changefreq><priority>0.55</priority></url>\n'
            text = text.replace('</urlset>', entry + '</urlset>')
            changed = True
    if changed:
        path.write_text(text, encoding="utf-8")
    return changed


def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    changed_tools = []
    for t in manifest.get("tools", []):
        slug = t.get("slug") or t.get("id")
        if not slug:
            continue
        path = ROOT / slug / "index.html"
        if path.exists() and insert_into_tool_page(path, t):
            changed_tools.append(slug)
    changed_guides = patch_guides()
    duplicate_fixes = patch_duplicate_titles()
    sitemap_changed = patch_sitemap_guides()
    report = {
        "version": VERSION,
        "stamp": STAMP,
        "changedToolPages": len(changed_tools),
        "changedToolSlugs": changed_tools,
        "changedGuidePages": changed_guides,
        "duplicateMetadataFixes": duplicate_fixes,
        "sitemapGuidesChanged": sitemap_changed,
        "note": "No npm build and no tests were run. Static HTML was updated in place.",
    }
    (ROOT / "ADSENSE_CONTENT_HARDENING_20260601.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
