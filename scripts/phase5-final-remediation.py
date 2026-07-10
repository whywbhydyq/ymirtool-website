#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
TODAY = "2026-07-10"
VERSION = "20260710-v62"
ADSENSE_ID = "ca-pub-1653188471819736"

MANIFEST_JSON = ROOT / "static/script/ymir-vue-tool-manifest.json"
MANIFEST_JS = ROOT / "static/script/ymir-tools-manifest.js"


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def compact_description(text: str) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    replacements = [
        (" Search rows quickly with a compact table UI.", ""),
        (" Runs quickly for quick text, lookup, or calculator work.", ""),
        (" with a tool workbench and copy-ready output", ""),
        (" with a copy-ready formatter workbench and copy-ready output for review", " for quick review"),
        (" and copy-ready output for review", " for quick review"),
    ]
    for old, new in replacements:
        text = text.replace(old, new)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def update_manifest() -> dict:
    manifest = json.loads(read(MANIFEST_JSON))
    manifest["version"] = VERSION
    manifest["site"]["lastmod"] = TODAY
    manifest["site"]["version"] = VERSION
    manifest["site"]["generator"] = "v62 audited catalog and tool runtime"
    runtime = manifest.setdefault("runtime", {})
    runtime["vendor"] = ["/static/script/ymir-tool-runtime-v62.js"]
    runtime["sharedScripts"] = []
    runtime["coreToolScripts"] = ["/static/script/ymir-tool-core-runtime-v62.js"]
    for tool in manifest["tools"]:
        for key in ("descriptionZh", "descriptionEn"):
            if tool.get(key):
                tool[key] = compact_description(tool[key])
        shell = tool.setdefault("shell", {})
        if shell.get("description"):
            shell["description"] = compact_description(shell["description"])
        shell["lastmod"] = TODAY
    manifest["policy"] = {
        "inlineExecutableScripts": False,
        "generator": "v62 audited catalog and tool runtime",
        "indexing": {
            "indexableTools": 8,
            "additionalTools": 142,
            "additionalToolRobots": "noindex, follow"
        },
        "advertising": {
            "ownershipMetadata": "indexable-pages",
            "runtime": "homepage-only"
        }
    }
    existing_catalog_urls = manifest.get("catalog", {}).get("toolUrls", [])
    all_tool_urls = list(existing_catalog_urls or manifest.get("sitemap", {}).pop("toolUrls", []))
    if not all_tool_urls:
        all_tool_urls = [tool["url"] for tool in manifest["tools"]]
    manifest["catalog"] = {"toolUrls": all_tool_urls}
    manifest.setdefault("sitemap", {})["indexableToolUrls"] = [
        tool["url"] for tool in manifest["tools"] if tool["slug"] in {
            "json", "base64", "urlencode", "formatjs", "regex", "textdiff", "txtcount", "unixtime"
        }
    ]
    write(MANIFEST_JSON, json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    wrapper = "(function () {\n  'use strict';\n  window.YmirToolsManifest = " + json.dumps(manifest, ensure_ascii=False, indent=2) + ";\n})();\n"
    write(MANIFEST_JS, wrapper)
    return manifest


def make_bundles() -> None:
    css_files = [
        "static/style/bootstrap-compat.css",
        "static/style/font-fix.css",
        "static/style/tool.css",
        "static/style/ymir-modern-tools.css",
        "static/style/ymir-tool-components.css",
        "static/vendor/element-plus/index.css",
        "static/style/ymir-vue-element.css",
        "static/style/ymir-tool-system-v61.css",
    ]
    css = ["/* Ymir Tool v62 UI bundle. Component order is intentional. */\n"]
    for rel in css_files:
        css.append(f"\n/* ===== {rel} ===== */\n")
        css.append(read(ROOT / rel))
        css.append("\n")
    css.append("""
/* ===== v62 final additions ===== */
.ymir-tool-notes{display:grid;gap:1rem}
.ymir-tool-notes__intro{max-width:78ch;color:var(--ymir-text-muted,#667085)}
.ymir-tool-notes__grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.85rem}
.ymir-tool-note{min-width:0;padding:1rem;border:1px solid var(--ymir-border,#d9e1ec);border-radius:16px;background:color-mix(in srgb,var(--ymir-surface,#fff) 94%,transparent)}
.ymir-tool-note h3{margin:0 0 .45rem;font-size:.92rem;line-height:1.35}
.ymir-tool-note p{margin:0;color:var(--ymir-text-muted,#667085);font-size:.9rem;line-height:1.62}
.ymir-tool-note a{font-weight:650}
.ymir-source-list{display:grid;gap:.75rem;margin:1rem 0 0;padding:0;list-style:none}
.ymir-source-list li{padding:1rem;border:1px solid var(--ymir-border,#d9e1ec);border-radius:14px;background:var(--ymir-surface,#fff)}
.ymir-source-list strong{display:block;margin-bottom:.3rem}
.ymir-trust-links{display:flex;flex-wrap:wrap;gap:.55rem .9rem;align-items:center}
.ymir-trust-links a{white-space:nowrap}
@media(max-width:980px){.ymir-tool-notes__grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:620px){.ymir-tool-notes__grid{grid-template-columns:1fr}.ymir-tool-note{padding:.9rem}}
""")
    write(ROOT / "static/style/ymir-tool-bundle-v62.css", "".join(css))

    # Make the legacy i18n file safe when loaded after DOMContentLoaded.
    i18n_path = ROOT / "static/script/ymir-i18n.js"
    i18n = read(i18n_path)
    old = "document.addEventListener('DOMContentLoaded', function () { setLanguage(detectLang(), false); });"
    new = "if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setLanguage(detectLang(), false); }, { once: true }); else setLanguage(detectLang(), false);"
    if old in i18n:
        i18n = i18n.replace(old, new)
        write(i18n_path, i18n)

    js_files = [
        "static/script/ymir-ui.js",
        "static/script/ymir-i18n.js",
        "static/vendor/vue/vue.global.prod.js",
        "static/vendor/element-plus/index.full.min.js",
        "static/script/ymir-vue-core.js",
        "static/script/ymir-vue-render-helpers.js",
        "static/script/ymir-vue-actions.js",
        "static/script/ymir-vue-app-factory.js",
        "static/script/ymir-vue-shared.js",
    ]
    js = ["/*! Ymir Tool v62 runtime bundle. Third-party license details: /licenses.html */\n"]
    for rel in js_files:
        js.append(f"\n/* ===== {rel} ===== */\n")
        js.append(read(ROOT / rel))
        js.append("\n")
    write(ROOT / "static/script/ymir-tool-runtime-v62.js", "".join(js))

    core_files = [
        "static/script/ymir-vue-core-tool-engines.js",
        "static/script/ymir-vue-core-tools-schema.js",
    ]
    core = ["/*! Ymir Tool v62 core-tool runtime bundle. */\n"]
    for rel in core_files:
        core.append(f"\n/* ===== {rel} ===== */\n")
        core.append(read(ROOT / rel))
        core.append("\n")
    write(ROOT / "static/script/ymir-tool-core-runtime-v62.js", "".join(core))


def build_loader() -> None:
    text = r"""(function () {
  'use strict';

  var VERSION = '20260710-v62';
  var MANIFEST_SCRIPT = '/static/script/ymir-tools-manifest.js';
  var RUNTIME_SCRIPT = '/static/script/ymir-tool-runtime-v62.js';
  var CORE_RUNTIME_SCRIPT = '/static/script/ymir-tool-core-runtime-v62.js';

  function findRoot() {
    return document.querySelector('.ymir-vue-tool-root[data-tool]') || document.getElementById('ymir-vue-tool-app');
  }

  function currentVersion() {
    var script = document.currentScript || document.querySelector('script[src*="ymir-vue-loader.js"]');
    if (!script) return VERSION;
    var match = String(script.src || '').match(/[?&]v=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : VERSION;
  }

  function scriptExists(src) {
    return !!document.querySelector('script[src^="' + src + '"]');
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (scriptExists(src)) { resolve(); return; }
      var s = document.createElement('script');
      s.src = src + (src.indexOf('?') === -1 ? '?v=' : '&v=') + encodeURIComponent(currentVersion());
      s.async = false;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('Failed to load ' + src)); };
      document.body.appendChild(s);
    });
  }

  function fail(root, message) {
    if (!root) return;
    root.innerHTML = '<div class="ymir-vue-noscript" role="alert">' + String(message || 'Tool failed to load.').replace(/[&<>"']/g, function (ch) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch];
    }) + '</div>';
  }

  function manifest() { return window.YmirToolsManifest || null; }

  function manifestTool(slug) {
    var m = manifest();
    if (!m || !Array.isArray(m.tools)) return null;
    for (var i = 0; i < m.tools.length; i += 1) if (m.tools[i] && m.tools[i].slug === slug) return m.tools[i];
    return null;
  }

  function boot() {
    var root = findRoot();
    if (!root) return;
    var page = document.querySelector('[data-ymir-tool]');
    var tool = root.getAttribute('data-tool') || (page && page.getAttribute('data-ymir-tool')) || '';

    Promise.all([loadScript(MANIFEST_SCRIPT), loadScript(RUNTIME_SCRIPT)])
      .then(function () {
        var m = manifest();
        var app = m && m.appByTool && m.appByTool[tool];
        if (!app) throw new Error('Tool mapping is missing for: ' + tool);
        if (!window.Vue || !window.ElementPlus || !window.YmirVueAppFactory) throw new Error('The shared tool runtime did not initialize.');
        root.setAttribute('data-tool-app', app);
        var item = manifestTool(tool);
        if (item && item.category) root.setAttribute('data-tool-category', item.category);
        var coreApp = m.runtime && m.runtime.coreApp;
        var coreReady = app === coreApp ? loadScript(CORE_RUNTIME_SCRIPT) : Promise.resolve();
        return coreReady.then(function () { return loadScript(app); });
      })
      .catch(function (error) { fail(root, error && error.message ? error.message : 'Tool failed to load.'); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  window.YmirVueToolLoader = {
    version: VERSION,
    manifestScript: MANIFEST_SCRIPT,
    runtimeScript: RUNTIME_SCRIPT,
    getManifest: manifest,
    getAppByTool: function () { return (manifest() && manifest().appByTool) || {}; }
  };
})();
"""
    write(ROOT / "static/script/ymir-vue-loader.js", text)


def update_shell() -> None:
    source_path = ROOT / "static/script/ymir-tool-shell-v62.js"
    text = read(source_path)
    text = text.replace("20260710-v61", VERSION)
    text = text.replace("ymir-tool-page-v61", "ymir-tool-page-v62")
    text = text.replace("main.setAttribute('data-ui-version', '61');", "main.setAttribute('data-ui-version', '62');")
    text = text.replace("var nonceSource = qs('script[nonce]');\n      if (nonceSource) script.setAttribute('nonce', nonceSource.getAttribute('nonce') || '');\n", "")
    # Add trust links to the generated mobile menu.
    text = text.replace(
        "<a href=\"/about.html\"><span>' + text('关于 Ymir Tool', 'About Ymir Tool') + '</span></a></div>'",
        "<a href=\"/about.html\"><span>' + text('关于 Ymir Tool', 'About Ymir Tool') + '</span></a><a href=\"/methodology.html\"><span>' + text('测试方法', 'Methodology') + '</span></a><a href=\"/sources.html\"><span>' + text('来源', 'Sources') + '</span></a></div>'"
    )
    write(ROOT / "static/script/ymir-tool-shell-v62.js", text)


def page_lang(soup: BeautifulSoup) -> str:
    return (soup.html.get("lang") if soup.html else "en") or "en"


def doc_copy(tool: dict, lang: str) -> dict[str, str]:
    title = tool.get("titleZh") if lang.startswith("zh") else tool.get("titleEn")
    title = title or tool.get("shell", {}).get("heroTitle") or tool["slug"]
    desc = tool.get("descriptionZh") if lang.startswith("zh") else tool.get("descriptionEn")
    desc = compact_description(desc or "")
    cat = tool.get("category") or "text"

    zh = lang.startswith("zh")
    if zh:
        templates = {
            "format": ("源代码或标记片段", "整理后的文本或压缩结果", "在目标项目中运行解析器、lint、编译或测试；排版成功不代表语义正确。"),
            "calc": ("数值、单位和必要的换算选项", "按页面说明计算或换算后的数值", "确认输入单位、精度、舍入和适用公式；工程或财务结果需使用正式流程复核。"),
            "text": ("普通文本或脱敏样例", "转换后的文本、统计值或对比结果", "检查 Unicode、空白、换行和目标平台限制，保留原始输入。"),
            "encode": ("文本、编码串或页面指定的数据格式", "编码、解码或兼容性检查结果", "确认字符集、字节边界和目标协议；编码不是加密。"),
            "json": ("JSON、CSV、XML 或页面声明的结构化样例", "转换、格式化或生成的结构化结果", "检查字段类型、数组层级、转义和大整数精度。"),
            "network": ("地址、查询词或网络参考条件", "匹配的网络信息、目录行或诊断结果", "目录数据可能变化，正式配置前请以运营商、IANA 或设备文档为准。"),
            "reference": ("关键词、代码、扩展名或命令名称", "可筛选和复制的参考条目", "参考表用于快速查找；版本敏感的结论应回到官方文档确认。"),
            "hash": ("非敏感文本或测试数据", "一个或多个摘要、校验值或兼容性输出", "哈希不是加密；涉及密码、真实性或签名时使用适当的现代方案。"),
        }
        input_text, output_text, review = templates.get(cat, templates["text"])
        return {
            "intro": f"{title} 用于{desc.rstrip('。')}。页面在浏览器中运行，先用短小、脱敏的样例确认行为。",
            "use": f"需要完成“{title}”对应的单次转换、检查或查找任务时使用。",
            "input": input_text,
            "output": output_text,
            "review": f"针对 {title}：{review}",
        }
    templates = {
        "format": ("source code or markup snippets", "formatted text or a compact representation", "Run the result through the target parser, linter, compiler, or test suite; readable formatting does not prove semantic correctness."),
        "calc": ("numbers, units, and the options shown by the calculator", "the calculated or converted values described on the page", "Confirm units, precision, rounding, and formula scope. Use an authoritative workflow for engineering or financial decisions."),
        "text": ("plain text or a redacted sample", "transformed text, counts, or comparison output", "Check Unicode, whitespace, line endings, and target-platform limits. Keep the original input for comparison."),
        "encode": ("text, an encoded string, or the data format named by the tool", "an encoded, decoded, or compatibility-check result", "Confirm the character set, byte boundary, and target protocol. Encoding is not encryption."),
        "json": ("JSON, CSV, XML, or the structured sample named by the tool", "converted, formatted, or generated structured data", "Check field types, array shape, escaping, and large-number precision before reuse."),
        "network": ("an address, search term, or network reference condition", "matching network information, directory rows, or diagnostic output", "Network directories can age. Verify production settings with the operator, IANA registry, device vendor, or current official documentation."),
        "reference": ("a keyword, code, extension, permission, header, or command name", "filterable reference rows that can be copied into notes", "Treat the table as a lookup aid. Confirm version-sensitive details in the linked official source before implementation."),
        "hash": ("non-sensitive text or test data", "one or more digests, checksums, or compatibility values", "A digest is not encryption. Use an appropriate modern construction for passwords, authenticity, or signatures."),
    }
    input_text, output_text, review = templates.get(cat, templates["text"])
    return {
        "intro": f"{title} is for this task: {desc.rstrip('.')}. It runs in the browser; start with a short, non-sensitive sample and confirm the behavior before processing more data.",
        "use": f"Use it for a focused {title} task when a quick browser workbench is appropriate.",
        "input": input_text,
        "output": output_text,
        "review": f"For {title}: {review}",
    }


def ensure_meta(soup: BeautifulSoup, name: str, content: str) -> None:
    tag = soup.find("meta", attrs={"name": name})
    if not tag:
        tag = soup.new_tag("meta")
        tag["name"] = name
        soup.head.append(tag)
    tag["content"] = content


def normalize_description(text: str, lang: str) -> str:
    text = re.sub(r"\s+", " ", text or "").strip()
    # Remove the old length-padding suffixes. A concise, page-specific description
    # is preferable to repeating generic review language across the site.
    text = text.replace(" 并说明输入输出边界、常见错误和结果复核方法。", "。")
    text = text.replace(" Review inputs, outputs, limitations, and common mistakes before reusing the result.", ".")
    text = re.sub(r"[。.]{2,}$", lambda m: "。" if lang.startswith("zh") else ".", text)
    if len(text) > 168:
        stops = [m.end() for m in re.finditer(r"[。.!?]", text[:169])]
        if stops and stops[-1] >= 90:
            text = text[:stops[-1]]
        else:
            text = text[:165].rstrip(" ,，;；:") + ("。" if lang.startswith("zh") else ".")
    return text


def replace_description_tags(soup: BeautifulSoup, description: str) -> None:
    ensure_meta(soup, "description", description)
    for attrs in ({"property": "og:description"}, {"name": "twitter:description"}):
        tag = soup.find("meta", attrs=attrs)
        if tag:
            tag["content"] = description


def remove_duplicate_guide_filler(soup: BeautifulSoup) -> None:
    for selector in ["section.ymir-deep-practice", "section.ymir-deep-scenario", "section.ymir-depth-floor", "section.ymir-final-depth"]:
        for node in soup.select(selector):
            node.decompose()
    repeated = {
        "用于排查时请使用脱敏样本。不要粘贴访问令牌、Cookie、客户资料、内部域名、未公开商业规则、支付记录或完整生产日志。页面适合处理公开示例、教学片段、复现样本和已经替换真实值的配置。",
        "这类指南面向开发者、站长、运营、学生和办公用户。用户可以不经过搜索引擎，直接从首页、指南中心或收藏夹进入，按任务选择 JSON、编码、文本、时间、网络、计算和参考类工具。",
        "先保留原始输入，再打开相关工具运行样例，确认输出格式、编码、空格、换行、单位或时间范围符合预期。样例验证通过后，才处理更长文本，并在复制到正式流程前再次人工检查。",
        "本页作为辅助入口使用，适合先判断任务类型，再进入更具体的工具或深度指南。使用任何在线工具前，请先确认输入是否适合在线处理，并尽量使用短的脱敏样例完成第一次验证。",
    }
    for tag in list(soup.find_all(["p", "li"])):
        text = " ".join(tag.get_text(" ", strip=True).split())
        if text in repeated:
            tag.decompose()


def uniquify_tool_copy(soup: BeautifulSoup, tool: dict) -> None:
    title = tool.get("titleEn") or tool.get("shell", {}).get("heroTitle") or tool["slug"]
    generic = {
        "Use this tool for data conversion, code generation, HTML conversion, or copy-ready text transformation. Generated code is a starter scaffold; review names, types, escaping, and edge cases before production use.",
        "Paste input, load the sample if needed, choose an action, review the output, and copy the result.",
        "Use this formatter for quick cleanup, review, examples, documentation, and copy-ready snippets. The formatter is heuristic rather than a full compiler parser, so review generated formatting before production use.",
        "Search by keyword, protocol, code, permission, extension, or command. Copy a single row or the filtered result set for notes, tickets, configuration checks, or documentation drafts.",
        "Search by DNS provider, IP address, ISP, country, province, city, or feature. Copy one row or the filtered result set for network setup notes, router configuration, troubleshooting tickets, or documentation drafts.",
        "Paste non-sensitive sample data first; do not paste secrets, tokens, customer data, or production keys.",
        "For new security-sensitive work, use a reviewed modern cryptographic design outside this compatibility helper.",
    }
    for tag in soup.find_all(["p", "li"]):
        value = " ".join(tag.get_text(" ", strip=True).split())
        if value in generic:
            tag.string = f"{title}: {value}"


def add_tool_notes(soup: BeautifulSoup, tool: dict) -> None:
    main = soup.find(attrs={"data-ymir-tool": True})
    if not main:
        return
    robots = soup.find("meta", attrs={"name": "robots"})
    if not robots or "noindex" not in robots.get("content", ""):
        for old in main.select("section.ymir-tool-notes"):
            old.decompose()
        return
    for old in main.select("section.ymir-tool-notes"):
        old.decompose()
    copy = doc_copy(tool, page_lang(soup))
    zh = page_lang(soup).startswith("zh")
    section = BeautifulSoup(f"""
<section class="ymir-container ymir-card ymir-tool-notes" data-tool-documentation="{tool['slug']}">
  <div>
    <h2>{'使用边界与结果复核' if zh else 'Usage boundaries and result checks'}</h2>
    <p class="ymir-tool-notes__intro">{copy['intro']}</p>
  </div>
  <div class="ymir-tool-notes__grid">
    <article class="ymir-tool-note"><h3>{'适用任务' if zh else 'Best use'}</h3><p>{copy['use']}</p></article>
    <article class="ymir-tool-note"><h3>{'输入' if zh else 'Input'}</h3><p>{copy['input']}</p></article>
    <article class="ymir-tool-note"><h3>{'输出' if zh else 'Output'}</h3><p>{copy['output']}</p></article>
    <article class="ymir-tool-note"><h3>{'复制前检查' if zh else 'Before reuse'}</h3><p>{copy['review']} <a href="/methodology.html">{'查看测试方法' if zh else 'See the test method'}</a>.</p></article>
  </div>
</section>
""", "html.parser").section
    related = main.select_one("section.ymir-related")
    if related:
        related.insert_before(section)
    else:
        main.append(section)


def update_schema(soup: BeautifulSoup, tool: dict | None = None) -> None:
    for tag in soup.find_all("script", attrs={"type": "application/ld+json"}):
        try:
            data = json.loads(tag.string or tag.get_text())
        except Exception:
            continue
        if isinstance(data, dict):
            typ = data.get("@type")
            if typ == "WebApplication":
                data.pop("datePublished", None)
                data["dateModified"] = TODAY
                data["softwareVersion"] = "2026.07"
                data["softwareHelp"] = {"@type": "CreativeWork", "url": "https://ymirtool.com/methodology.html"}
                if tool:
                    notes = doc_copy(tool, "en")
                    data["featureList"] = [notes["use"], notes["output"]]
            elif typ in ("Article", "AboutPage", "ContactPage", "WebPage", "CollectionPage"):
                data["dateModified"] = TODAY
                if typ == "Article":
                    data["author"] = {"@type": "Organization", "name": "Ymir Tool Editorial", "url": "https://ymirtool.com/about.html#editorial-policy"}
                    data["reviewedBy"] = {"@type": "Organization", "name": "Ymir Tool", "url": "https://ymirtool.com/methodology.html"}
        tag.string = json.dumps(data, ensure_ascii=False, separators=(",", ":"))


def footer_links(soup: BeautifulSoup) -> None:
    footer = soup.select_one("footer.ymir-footer")
    if not footer:
        body = soup.body
        if body is None:
            return
        footer = soup.new_tag("footer")
        footer["class"] = ["ymir-footer"]
        copyright_span = soup.new_tag("span")
        copyright_span.string = "© 2026 Ymir Tool"
        footer.append(copyright_span)
        tagline = soup.new_tag("span")
        tagline.string = "Practical browser-based tools with documented limits and review guidance."
        footer.append(tagline)
        # Keep the footer above page scripts so it remains part of the visible document flow.
        first_script = body.find("script", recursive=False)
        if first_script:
            first_script.insert_before(footer)
        else:
            body.append(footer)
    wanted = [
        ("/tools.html", "All Tools"),
        ("/about.html", "About"),
        ("/methodology.html", "Methodology"),
        ("/sources.html", "Sources"),
        ("/licenses.html", "Licenses"),
        ("/changelog.html", "Changelog"),
        ("/privacy.html", "Privacy"),
        ("/terms.html", "Terms"),
        ("/disclaimer.html", "Disclaimer"),
        ("/contact.html", "Contact"),
    ]
    for href, label in wanted:
        if footer.find("a", href=href):
            continue
        a = soup.new_tag("a", href=href)
        a.string = label
        # Insert before final tagline span when possible.
        spans = footer.find_all("span", recursive=False)
        if spans:
            spans[-1].insert_before(a)
        else:
            footer.append(a)


def update_html(manifest: dict) -> None:
    tools = {t["slug"]: t for t in manifest["tools"]}
    indexable = set()
    for p in ROOT.rglob("*.html"):
        rel = p.relative_to(ROOT).as_posix()
        html = read(p)
        html = re.sub(r"\s+nonce=(['\"])__CSP_NONCE__\1", "", html)
        soup = BeautifulSoup(html, "html.parser")
        lang = page_lang(soup)
        robots = soup.find("meta", attrs={"name": "robots"})
        is_indexable = bool(robots and "index" in robots.get("content", "") and "noindex" not in robots.get("content", ""))
        if is_indexable:
            indexable.add(rel)
            ensure_meta(soup, "google-adsense-account", ADSENSE_ID)
        else:
            for tag in soup.find_all("meta", attrs={"name": "google-adsense-account"}):
                tag.decompose()

        # Ad runtime stays only on the homepage while ownership metadata remains on indexable pages.
        for tag in list(soup.find_all("script", src=re.compile(r"pagead2\.googlesyndication\.com/pagead/js/adsbygoogle\.js"))):
            if rel != "index.html":
                tag.decompose()
        for link in list(soup.find_all("link", href=re.compile(r"pagead2\.googlesyndication\.com"))):
            if rel != "index.html":
                link.decompose()

        # Analytics only on indexable pages; no external telemetry on the 190 noindex pages.
        if not is_indexable:
            for tag in list(soup.find_all("script", src="https://cdn.vercel-insights.com/v1/script.js")):
                tag.decompose()
            for link in list(soup.find_all("link", href="https://cdn.vercel-insights.com")):
                link.decompose()
        elif not soup.find("script", src="https://cdn.vercel-insights.com/v1/script.js"):
            analytics = soup.new_tag("script", src="https://cdn.vercel-insights.com/v1/script.js")
            analytics["defer"] = ""
            soup.head.append(analytics)

        # Normalize metadata length and social descriptions.
        desc_tag = soup.find("meta", attrs={"name": "description"})
        if desc_tag:
            description = normalize_description(desc_tag.get("content", ""), lang)
            replace_description_tags(soup, description)

        slug = None
        main = soup.find(attrs={"data-ymir-tool": True})
        if main:
            slug = main.get("data-ymir-tool")
        if slug and slug in tools:
            tool = tools[slug]
            # Replace the old multi-file CSS stack with one ordered bundle.
            remove_hrefs = {
                "/static/style/bootstrap-compat.css?v=20260531-v58",
                "/static/style/font-fix.css?v=20260531-v58",
                "/static/style/tool.css?v=20260531-v58",
                "/static/style/ymir-modern-tools.css?v=20260531-v58",
                "/static/style/ymir-tool-components.css?v=20260531-v58",
                "/static/vendor/element-plus/index.css?v=20260531-v58",
                "/static/style/ymir-vue-element.css?v=20260531-v58",
                "/static/style/ymir-tool-system-v61.css?v=20260710-v61",
            }
            for link in list(soup.find_all("link", href=True)):
                if link.get("href") in remove_hrefs:
                    link.decompose()
            if not soup.find("link", href=f"/static/style/ymir-tool-bundle-v62.css?v={VERSION}"):
                link = soup.new_tag("link", rel="stylesheet", href=f"/static/style/ymir-tool-bundle-v62.css?v={VERSION}")
                soup.head.append(link)
            for tag in list(soup.find_all("script", src=True)):
                src = tag.get("src", "")
                if src in ("/static/script/ymir-ui.js?v=20260531-v58", "/static/script/ymir-i18n.js?v=20260531-v58") or "ymir-vue-loader.js" in src or "ymir-tool-shell-v61.js" in src or "ymir-tool-shell-v62.js" in src:
                    tag.decompose()
            loader = soup.new_tag("script", defer=True, src=f"/static/script/ymir-vue-loader.js?v={VERSION}")
            shell = soup.new_tag("script", defer=True, src=f"/static/script/ymir-tool-shell-v62.js?v={VERSION}")
            soup.body.append(loader)
            soup.body.append(shell)
            main["class"] = ["ymir-tool-page-v62" if c == "ymir-tool-page-v61" else c for c in (main.get("class") or [])]
            add_tool_notes(soup, tool)
            uniquify_tool_copy(soup, tool)
            update_schema(soup, tool)
        else:
            # Site-wide shell upgrade.
            for link in soup.find_all("link", href="/static/style/ymir-tool-system-v61.css?v=20260710-v61"):
                link["href"] = f"/static/style/ymir-tool-system-v61.css?v={VERSION}"
            for tag in list(soup.find_all("script", src="/static/script/ymir-tool-shell-v61.js?v=20260710-v61")):
                tag["src"] = f"/static/script/ymir-tool-shell-v62.js?v={VERSION}"
            update_schema(soup)
            remove_duplicate_guide_filler(soup)

        # Add stable browser metadata.
        ensure_meta(soup, "color-scheme", "light dark")
        ensure_meta(soup, "format-detection", "telephone=no")
        footer_links(soup)
        write(p, "<!DOCTYPE html>\n" + str(soup).replace("<!DOCTYPE html>\n", "").replace("<!DOCTYPE html>", ""))


def common_head(title: str, description: str, canonical: str, schema_type: str) -> str:
    data = {
        "@context": "https://schema.org",
        "@type": schema_type,
        "@id": canonical + "#webpage",
        "url": canonical,
        "name": title,
        "description": description,
        "dateModified": TODAY,
        "inLanguage": "zh-CN",
        "isPartOf": {"@id": "https://ymirtool.com/#website"},
        "publisher": {"@id": "https://ymirtool.com/#organization"},
    }
    return f"""<meta charset="utf-8">
<meta name="robots" content="index, follow">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="google-adsense-account" content="{ADSENSE_ID}">
<meta name="color-scheme" content="light dark">
<meta name="format-detection" content="telephone=no">
<title>{title}</title>
<meta name="description" content="{description}">
<link rel="canonical" href="{canonical}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:type" content="website">
<meta property="og:url" content="{canonical}">
<meta property="og:site_name" content="Ymir Tool">
<meta property="og:image" content="https://ymirtool.com/static/images/og.png">
<meta property="og:image:alt" content="Ymir Tool">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{description}">
<meta name="twitter:image" content="https://ymirtool.com/static/images/og.png">
<link rel="icon" href="/favicon.ico" type="image/x-icon">
<link rel="apple-touch-icon" href="/static/images/ymir-tool-apple-touch-icon.png" sizes="180x180">
<script defer src="/static/script/ymir-theme.js?v=20260531-v58"></script>
<link rel="stylesheet" href="/static/style/bootstrap-compat.css?v=20260531-v58">
<link rel="stylesheet" href="/static/style/tool.css?v=20260531-v58">
<link rel="stylesheet" href="/static/style/inline-style-migration.css?v=20260531-v58">
<link rel="stylesheet" href="/static/style/ymir-developer-aesthetics-v58.css?v=20260531-v58">
<link rel="stylesheet" href="/static/style/ymir-tool-system-v61.css?v={VERSION}">
<script type="application/ld+json">{json.dumps(data, ensure_ascii=False, separators=(',', ':'))}</script>"""


def page_template(title: str, description: str, filename: str, heading: str, body: str, schema_type: str = "WebPage") -> str:
    canonical = f"https://ymirtool.com/{filename}"
    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
{common_head(title, description, canonical, schema_type)}
</head>
<body class="ymir-modern-body">
<nav class="ymir-topbar"><div class="ymir-topbar-inner"><a class="ymir-brand" href="/">Ymir Tool</a><div class="ymir-nav"><a href="/tools.html">All Tools</a><a href="/guides.html">Guides</a><a href="/about.html">About</a></div><div class="ymir-topbar-actions"></div></div></nav>
<main class="container ymir-guide-page">
<h1>{heading}</h1>
<p>最后更新：2026 年 7 月 10 日</p>
{body}
</main>
<footer class="ymir-footer"><span>Copyright ©2026 <a href="/">Ymir Tool</a></span><a href="/tools.html">All Tools</a><a href="/about.html">About</a><a href="/methodology.html">Methodology</a><a href="/sources.html">Sources</a><a href="/licenses.html">Licenses</a><a href="/changelog.html">Changelog</a><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a><a href="/disclaimer.html">Disclaimer</a><a href="/contact.html">Contact</a><span>浏览器端开发者工具与可复现测试说明。</span></footer>
<script defer src="/static/script/ymir-tool-shell-v62.js?v={VERSION}"></script>
</body>
</html>
"""


def add_trust_pages() -> None:
    sources_body = """
<section class="ymir-card"><h2>来源原则</h2><p>Ymir Tool 优先引用规范制定组织、浏览器标准、官方项目文档和公共注册表。参考表用于快速查找，不替代目标平台当前版本的正式文档。数据或行为可能随标准、浏览器和供应商版本变化，因此页面会标注适用边界，并在实质性复测后更新日期。</p></section>
<section class="ymir-card"><h2>核心标准与官方资料</h2><ul class="ymir-source-list">
<li><strong>JSON</strong><a href="https://www.rfc-editor.org/rfc/rfc8259" rel="external noopener">RFC 8259</a> 与 <a href="https://www.json.org/" rel="external noopener">JSON.org</a>，用于严格语法、字符串转义、数字和结构边界。</li>
<li><strong>URL 与编码</strong><a href="https://url.spec.whatwg.org/" rel="external noopener">WHATWG URL Standard</a>、<a href="https://www.rfc-editor.org/rfc/rfc3986" rel="external noopener">RFC 3986</a> 与 <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent" rel="external noopener">MDN encodeURIComponent</a>。</li>
<li><strong>Base64</strong><a href="https://www.rfc-editor.org/rfc/rfc4648" rel="external noopener">RFC 4648</a>，用于标准 Base64、Base64URL 和 padding 规则。</li>
<li><strong>JavaScript 与正则</strong><a href="https://tc39.es/ecma262/" rel="external noopener">ECMAScript 语言规范</a> 与 <a href="https://developer.mozilla.org/docs/Web/JavaScript/Guide/Regular_expressions" rel="external noopener">MDN Regular Expressions</a>。</li>
<li><strong>Unicode</strong><a href="https://www.unicode.org/standard/standard.html" rel="external noopener">The Unicode Standard</a>，用于字符、码点、规范化和文本计数边界。</li>
<li><strong>时间</strong><a href="https://datatracker.ietf.org/doc/html/rfc3339" rel="external noopener">RFC 3339</a> 与 <a href="https://www.iana.org/time-zones" rel="external noopener">IANA Time Zone Database</a>。</li>
<li><strong>HTTP、MIME、状态码和端口</strong><a href="https://www.iana.org/assignments/http-fields/http-fields.xhtml" rel="external noopener">IANA HTTP Fields</a>、<a href="https://www.iana.org/assignments/media-types/media-types.xhtml" rel="external noopener">Media Types</a>、<a href="https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml" rel="external noopener">HTTP Status Codes</a> 与 <a href="https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml" rel="external noopener">Service Names and Port Numbers</a>。</li>
<li><strong>密码学兼容性说明</strong><a href="https://csrc.nist.gov/publications" rel="external noopener">NIST CSRC publications</a>、<a href="https://www.rfc-editor.org/rfc/rfc7465" rel="external noopener">RFC 7465</a> 与 <a href="https://httpd.apache.org/docs/current/programs/htpasswd.html" rel="external noopener">Apache htpasswd</a>。</li>
<li><strong>Android 参考</strong><a href="https://developer.android.com/reference/android/Manifest.permission" rel="external noopener">Manifest permissions</a> 与 <a href="https://developer.android.com/reference/android/view/KeyEvent" rel="external noopener">KeyEvent constants</a>。</li>
<li><strong>Linux 命令</strong><a href="https://www.kernel.org/doc/man-pages/" rel="external noopener">Linux man-pages</a> 与 <a href="https://www.gnu.org/software/coreutils/manual/" rel="external noopener">GNU Coreutils manual</a>。</li>
</ul></section>
<section class="ymir-card"><h2>站内数据集边界</h2><p>DNS、节日、行政区号、历史时间线、货币代码和其他参考表可能包含静态快照。它们适合快速查询和构造测试样例，不适合直接作为路由、安全、合规、支付或生产配置的唯一依据。正式使用前应向运营商、政府、标准组织或目标系统文档复核。</p><p>发现来源过期或条目错误时，请通过 <a href="/contact.html">联系页面</a> 提交页面 URL、具体条目和可核验来源。</p></section>
"""
    write(ROOT / "sources.html", page_template(
        "Ymir Tool 参考来源：标准、注册表与数据边界",
        "查看 Ymir Tool 使用的 JSON、URL、Base64、Unicode、HTTP、时间、密码学和平台官方来源，以及静态参考表的适用边界和纠错方式。",
        "sources.html", "参考来源与数据边界", sources_body
    ))

    licenses_body = """
<section class="ymir-card"><h2>站点代码与内容</h2><p>Ymir Tool 的页面结构、工具编排、说明文字、测试样例和站内设计由站点维护者整理。除非文件中另有许可证声明，站点内容和自有代码不自动授予复制、再发布或商业再利用许可。规范事实、协议名称和第三方商标归各自权利人所有。</p></section>
<section class="ymir-card"><h2>随站点分发的第三方组件</h2><div class="ymir-table-wrap"><table><thead><tr><th>组件</th><th>版本/用途</th><th>许可证或声明</th></tr></thead><tbody>
<tr><td>Vue</td><td>3.5.35，工具界面运行时</td><td>MIT</td></tr>
<tr><td>Element Plus</td><td>2.14.1，表单与交互组件</td><td>MIT</td></tr>
<tr><td>CryptoJS</td><td>3.0.2，仅用于 AES、Rabbit 与 Triple DES 旧格式兼容演示</td><td>原文件保留上游版权与许可证链接</td></tr>
<tr><td>JsBarcode</td><td>3.9.0，条形码工具</td><td>MIT</td></tr>
<tr><td>兼容转换数据与算法文件</td><td>拼音、简繁转换和 htpasswd 等少量旧工具</td><td>保留文件中的原始版权、作者和许可证声明</td></tr>
</tbody></table></div></section>
<section class="ymir-card"><h2>分发与审计说明</h2><p>第三方文件保留在 <code>/static/vendor/</code> 或 <code>/static/script/</code> 中，构建后的 v62 运行时文件在文件头指向本页。项目根目录的 <code>THIRD-PARTY-NOTICES.md</code> 提供同一份机器可读清单。若发现遗漏或许可证标注错误，请通过 <a href="/contact.html">联系页面</a> 提交具体文件路径。</p></section>
"""
    write(ROOT / "licenses.html", page_template(
        "Ymir Tool 第三方组件与许可证说明",
        "查看 Ymir Tool 随站点分发的 Vue、Element Plus、CryptoJS、JsBarcode 和少量兼容算法文件的版本、用途与许可证声明。",
        "licenses.html", "第三方组件与许可证", licenses_body
    ))

    methodology_body = """
<section class="ymir-card"><h2>测试目标</h2><p>每个工具至少要回答四个问题：接受什么输入、产生什么输出、哪些边界会失败、结果如何在目标环境中复核。工具页面用于执行单次任务，指南用于解释错误模式；两者不会以重复段落替代真实测试。</p></section>
<section class="ymir-card"><h2>最小测试矩阵</h2><div class="ymir-table-wrap"><table><thead><tr><th>测试类型</th><th>示例</th><th>通过条件</th></tr></thead><tbody>
<tr><td>正常输入</td><td>短小、公开或合成样例</td><td>输出与标准或可独立计算的结果一致。</td></tr>
<tr><td>空输入</td><td>空字符串、空数组、空表格</td><td>页面给出明确状态，不产生误导性结果。</td></tr>
<tr><td>错误输入</td><td>无效 JSON、错误编码、非法单位</td><td>错误位置或原因可理解，页面保持可继续操作。</td></tr>
<tr><td>边界输入</td><td>Unicode、换行、大整数、极小/极大数值</td><td>限制被说明，结果不会静默改变关键数据。</td></tr>
<tr><td>复制与重置</td><td>复制、清空、加载样例、切换主题</td><td>键盘与触控操作可用，状态变化可被辅助技术读取。</td></tr>
</tbody></table></div></section>
<section class="ymir-card"><h2>发布检查</h2><ol><li>运行站内 SEO、链接、Schema、资源引用和工具清单检查。</li><li>对 JavaScript 执行语法检查，对 CSS 执行结构检查。</li><li>在桌面与移动端预览代表性工具组，检查输入、输出、复制、下载、表格、Canvas 和沙箱页面。</li><li>只有功能、来源、样例或结论发生实质变化时更新修改日期。</li><li>用户反馈必须包含页面 URL、脱敏输入、期望结果、实际结果和浏览器环境。</li></ol></section>
<section class="ymir-card"><h2>隐私与复核</h2><p>测试样例不使用真实密码、令牌、私钥、客户数据或完整生产日志。浏览器输出只是一项辅助结果；生产配置、安全结论、工程数值和正式发布内容必须回到项目测试、官方文档或组织流程确认。</p><p>标准和数据来源见 <a href="/sources.html">参考来源</a>，第三方组件见 <a href="/licenses.html">许可证说明</a>，具体改动见 <a href="/changelog.html">更新记录</a>。</p></section>
"""
    write(ROOT / "methodology.html", page_template(
        "Ymir Tool 测试方法：输入、边界、复核与发布检查",
        "了解 Ymir Tool 如何使用正常、错误和边界样例测试 150 个工具，如何检查复制、移动端、无障碍、来源和发布质量，并记录发布回归与用户纠错。",
        "methodology.html", "测试方法与发布检查", methodology_body
    ))

    changelog_body = """
<section class="ymir-card"><h2>2026-07-10 · 冗余资源清理</h2><ul><li>移除旧阶段报告、过期验证脚本和 v61 shell 源文件。</li><li>删除未被页面、Manifest、构建或部署配置引用的迁移脚本、旧监听器、重复社交图片和废弃第三方组件。</li><li>保留 150 个工具页面、当前构建源文件、许可证声明和最终验证流程。</li></ul></section>
<section class="ymir-card"><h2>2026-07-10 · v62 最终整改</h2><ul><li>保留全部 150 个工具 URL，同时为 142 个附加工具补充输入、输出、适用任务和结果复核说明。</li><li>将工具页的多层 CSS 和共享 JavaScript 合并为可缓存的 v62 资源，减少请求瀑布。</li><li>移除每次请求生成 CSP nonce 的 HTML 中转层，改用静态安全响应头和 CDN 缓存。</li><li>移除批量指南中的重复填充段落，增加来源、许可证、测试方法和更新记录页面。</li><li>广告运行时仅保留在首页；其他可索引页面保留站点所有权元数据，附加工具无广告且 noindex。</li><li>统一元描述长度、Schema 修改日期、页脚信任链接和全站无障碍元数据。</li></ul></section>
<section class="ymir-card"><h2>2026-07-10 · v61 全站 UI</h2><p>统一 213 个页面的导航、搜索、主题、工具工作区、移动布局、键盘焦点、状态区域和内容卡片；150 个工具均接入同一 UI shell。</p></section>
<section class="ymir-card"><h2>2026-07-10 · v60 首页与安全边界</h2><p>重做首页任务导航和工具发现，修正 Base64、Escape、哈希、DES、RC4、Triple DES 与 htpasswd 等页面的编码和安全表述。</p></section>
<section class="ymir-card"><h2>2026-07-10 · 内容清理</h2><p>保留旧工具地址，清除批量重复文案，建立完整工具目录，并把附加工具限定为无广告、noindex 的直接访问页面。</p></section>
<section class="ymir-card"><h2>反馈</h2><p>更新记录只描述已经进入源码的改动。功能异常、来源过期或说明错误可通过 <a href="/contact.html">联系页面</a> 提交可复现报告。</p></section>
"""
    write(ROOT / "changelog.html", page_template(
        "Ymir Tool 更新记录：工具、UI、性能与内容修复",
        "查看 Ymir Tool 在 2026 年 7 月完成的 150 个工具保留、全站 UI、性能缓存、内容去重、来源和许可证透明度等实际改动。",
        "changelog.html", "更新记录", changelog_body
    ))

    notices = """# Third-Party Notices\n\nThis repository includes third-party software. Copyright and license notices in the original files remain authoritative.\n\n| Component | Version | License / notice | Primary path |\n|---|---:|---|---|\n| Vue | 3.5.35 | MIT | `static/vendor/vue/vue.global.prod.js` |\n| Element Plus | 2.14.1 | MIT | `static/vendor/element-plus/` |\n| CryptoJS | 3.0.2 | See source header and upstream license link | `static/script/pcjs/aes.js`, `static/script/pcjs/rabbit.js`, `static/script/pcjs/tripledes.js` |\n| JsBarcode | 3.9.0 | MIT | `static/script/pcjs/barcode.js` |\n| Compatibility data and algorithms | mixed retained notices | `static/script/pcjs/htpasswd/`, `static/script/pcjs/jianfan.js`, `static/script/pcjs/pinyin.js` |\n\nThe generated `ymir-tool-runtime-v62.js` bundle contains Vue, Element Plus, and the shared Ymir runtime in source order. Original source files required to rebuild the bundle are retained. Unreferenced migration assets are excluded from the deployable project.\n"""
    write(ROOT / "THIRD-PARTY-NOTICES.md", notices)


def update_about_and_policy_copy() -> None:
    replacements = {
        "about.html": [
            ("广告只出现在具有完整功能和说明的主要页面；附加工具目录、政策页、错误页和单纯导航页不加载广告脚本。广告不会改变工具输出，也不参与内容结论。", "当前只有首页加载 AdSense 站点验证脚本，工具页、指南页、政策页、错误页和完整目录不加载广告运行时。未来如启用广告，也只会放在内容完整且不遮挡工具操作的主要页面。广告不会改变工具输出，也不参与内容结论。"),
            ("当前指南索引见 <a href=\"/guides.html\">指南中心</a>。涉及规范定义时，指南会直接链接到相关官方文档。", "当前指南索引见 <a href=\"/guides.html\">指南中心</a>。完整测试流程见 <a href=\"/methodology.html\">测试方法</a>，规范和数据出处见 <a href=\"/sources.html\">参考来源</a>。"),
        ],
        "privacy.html": [
            ("本站不会把广告脚本放在隐私政策、使用条款、免责声明、联系页、404 页面或附加工具目录页上。这样做是为了让广告只出现在具有明确内容和工具价值的主要页面。", "当前只有首页加载 AdSense 站点验证脚本；工具页、指南页、政策页、404 页面和附加工具目录不加载广告运行时。未来如启用广告，将限制在内容完整且不遮挡操作的主要页面。"),
        ],
        "terms.html": [
            ("本站不会在政策页、404 页、附加工具目录和纯导航页面放置广告脚本，广告策略也不会代替内容质量和用户体验。", "当前广告运行时仅限首页的站点验证用途；政策页、工具页、404 页和目录页不加载广告运行时。广告策略不会代替内容质量和用户体验。"),
        ],
    }
    for rel, pairs in replacements.items():
        p = ROOT / rel
        text = read(p)
        for old, new in pairs:
            text = text.replace(old, new)
        write(p, text)


def update_sitemaps_and_llms() -> None:
    policy = ROOT / "sitemap-policy.xml"
    soup = BeautifulSoup(read(policy), "xml")
    urlset = soup.find("urlset")
    existing = {u.loc.text for u in soup.find_all("url") if u.loc}
    for name in ["sources.html", "licenses.html", "methodology.html", "changelog.html"]:
        loc = f"https://ymirtool.com/{name}"
        if loc in existing:
            continue
        u = soup.new_tag("url")
        l = soup.new_tag("loc"); l.string = loc
        m = soup.new_tag("lastmod"); m.string = TODAY
        u.append(l); u.append(m); urlset.append(u)
    for m in soup.find_all("lastmod"):
        if m.parent and m.parent.loc and m.parent.loc.text.endswith(("about.html", "privacy.html", "terms.html", "disclaimer.html", "contact.html")):
            m.string = TODAY
    write(policy, str(soup))

    for fname in ["llms.txt", "llms-full.txt"]:
        p = ROOT / fname
        text = read(p)
        block = "\n## Transparency and maintenance\n- Methodology: https://ymirtool.com/methodology.html\n- Sources: https://ymirtool.com/sources.html\n- Third-party licenses: https://ymirtool.com/licenses.html\n- Changelog: https://ymirtool.com/changelog.html\n"
        if "https://ymirtool.com/methodology.html" not in text:
            text = text.rstrip() + "\n" + block
            write(p, text)


def configure_headers() -> None:
    csp = "; ".join([
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "form-action 'self'",
        "script-src 'self' https://cdn.vercel-insights.com https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com https://*.gstatic.com",
        "style-src 'self'",
        "style-src-attr 'unsafe-inline'",
        "img-src 'self' data: blob: https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com",
        "font-src 'self' data:",
        "connect-src 'self' ws: wss: https://vitals.vercel-insights.com https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com",
        "frame-src 'self' data: blob: https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com",
        "worker-src 'self' blob:",
        "manifest-src 'self'",
        "upgrade-insecure-requests",
        "report-uri /api/csp-report",
        "report-to ymir-csp-report",
    ])
    common = [
        {"key": "Content-Security-Policy", "value": csp},
        {"key": "X-Frame-Options", "value": "DENY"},
        {"key": "X-Content-Type-Options", "value": "nosniff"},
        {"key": "Referrer-Policy", "value": "strict-origin-when-cross-origin"},
        {"key": "Cross-Origin-Opener-Policy", "value": "same-origin"},
        {"key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload"},
        {"key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()"},
        {"key": "X-Permitted-Cross-Domain-Policies", "value": "none"},
        {"key": "Reporting-Endpoints", "value": 'ymir-csp-report="/api/csp-report"'},
        {"key": "Report-To", "value": '{"group":"ymir-csp-report","max_age":604800,"endpoints":[{"url":"/api/csp-report"}],"include_subdomains":true}'},
        {"key": "Cache-Control", "value": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400"},
    ]
    vercel = {
        "$schema": "https://openapi.vercel.sh/vercel.json",
        "ignoreCommand": "node scripts/skip-old-vercel-builds.mjs",
        "git": {"deploymentEnabled": {"site-foundation-fix": False}},
        "headers": [
            {"source": "/(.*)", "headers": common},
            {"source": "/static/(.*)", "headers": [
                {"key": "Cache-Control", "value": "public, max-age=31536000, immutable"},
                {"key": "X-Content-Type-Options", "value": "nosniff"},
            ]},
            {"source": "/favicon.ico", "headers": [{"key": "Cache-Control", "value": "public, max-age=31536000, immutable"}]},
            {"source": "/(llms.txt|llms-full.txt|ads.txt)", "headers": [{"key": "Cache-Control", "value": "public, max-age=3600, must-revalidate"}]},
            {"source": "/ai-context/(.*)", "headers": [{"key": "Content-Type", "value": "text/markdown; charset=UTF-8"}, {"key": "Cache-Control", "value": "public, max-age=3600, must-revalidate"}]},
            {"source": "/(sitemap.xml|sitemap-guides.xml|sitemap-policy.xml)", "headers": [{"key": "Content-Type", "value": "application/xml; charset=UTF-8"}]},
        ],
    }
    write(ROOT / "vercel.json", json.dumps(vercel, indent=2) + "\n")

    netlify = f'''[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "{csp}"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()"
    Cross-Origin-Opener-Policy = "same-origin"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
    X-Permitted-Cross-Domain-Policies = "none"
    Reporting-Endpoints = 'ymir-csp-report="/api/csp-report"'
    Report-To = '{{"group":"ymir-csp-report","max_age":604800,"endpoints":[{{"url":"/api/csp-report"}}],"include_subdomains":true}}'
    Cache-Control = "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400"

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/static/images/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/favicon.ico"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/llms.txt"
  [headers.values]
    Content-Type = "text/plain; charset=UTF-8"
    Cache-Control = "public, max-age=3600, must-revalidate"

[[headers]]
  for = "/llms-full.txt"
  [headers.values]
    Content-Type = "text/plain; charset=UTF-8"
    Cache-Control = "public, max-age=3600, must-revalidate"

[[headers]]
  for = "/ai-context/*"
  [headers.values]
    Content-Type = "text/markdown; charset=UTF-8"
    Cache-Control = "public, max-age=3600, must-revalidate"

[[headers]]
  for = "/sitemap*.xml"
  [headers.values]
    Content-Type = "application/xml; charset=UTF-8"

[[headers]]
  for = "/robots.txt"
  [headers.values]
    Content-Type = "text/plain; charset=UTF-8"

[[redirects]]
  from = "/api/csp-report"
  to = "/.netlify/functions/csp-report"
  status = 200
  force = true
'''
    write(ROOT / "netlify.toml", netlify)
    edge = ROOT / "netlify/edge-functions/csp-nonce.ts"
    if edge.exists():
        edge.unlink()
    csp_html = ROOT / "api/csp-html.js"
    if csp_html.exists():
        csp_html.unlink()


def clean_obsolete_files() -> None:
    for rel in [
        "static/script/jquery-1.11.3.min.js",
        "static/style/ymir-tool-page-v51.css",
        "static/script/pcjs/calculator.js",
        "static/script/pcjs/html2js.js",
        "static/script/pcjs/subnetmask.js",
    ]:
        p = ROOT / rel
        if p.exists():
            p.unlink()


def update_package() -> None:
    p = ROOT / "package.json"
    data = json.loads(read(p))
    data["scripts"] = {
        "clean": "python3 scripts/cleanup-unused-assets.py",
        "seo:check": "node scripts/seo-check.mjs",
        "seo:cache": "node scripts/seo-check.mjs --write-cache",
        "remediate": "python3 scripts/phase5-final-remediation.py",
        "validate": "node scripts/phase5-validate.mjs",
        "audit": "python3 scripts/phase5-audit.py --output .seo-cache/final-audit.json",
        "smoke": "python3 scripts/phase5-http-smoke.py",
        "test": "npm run seo:check && npm run validate && npm run audit && npm run smoke"
    }
    write(p, json.dumps(data, indent=2) + "\n")


def main() -> None:
    manifest = update_manifest()
    make_bundles()
    build_loader()
    update_shell()
    update_html(manifest)
    add_trust_pages()
    update_about_and_policy_copy()
    # Re-run HTML normalization for the new pages and policy copy, without duplicating notes.
    update_html(manifest)
    update_sitemaps_and_llms()
    configure_headers()
    clean_obsolete_files()
    update_package()
    print("Phase 5 remediation completed.")


if __name__ == "__main__":
    main()
