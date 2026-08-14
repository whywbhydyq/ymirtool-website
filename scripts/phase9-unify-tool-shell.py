#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "static" / "script" / "ymir-vue-tool-manifest.json"
SYSTEM_CSS = ROOT / "static" / "style" / "ymir-tool-system-v61.css"
LEGACY_BUNDLE = ROOT / "static" / "style" / "ymir-tool-bundle-v65.css"
I18N_SOURCE = ROOT / "static" / "script" / "ymir-i18n.js"
RUNTIME_BUNDLE = ROOT / "static" / "script" / "ymir-tool-runtime-v63.js"
ASSET_VERSION = "20260814-v69"
CACHE_BUSTED_ASSETS = (
    "/static/script/ymir-tool-runtime-v63.js",
    "/static/style/ymir-tool-bundle-v65.css",
    "/static/style/ymir-tool-system-v61.css",
    "/static/style/ymir-fast-core-v66.css",
)

SYSTEM_MARKER = "/* ===== static/style/ymir-tool-system-v61.css ===== */"
SYSTEM_SUFFIX_MARKER = "/* ===== v62 final additions ===== */"
I18N_MARKER = "/* ===== static/script/ymir-i18n.js ===== */"
I18N_SUFFIX_MARKER = "/* ===== static/vendor/vue/vue.global.prod.js ===== */"

TOPBAR = '''<nav aria-label="主导航" class="ymir-topbar" data-shell-language="zh-CN" lang="zh-CN"><div class="ymir-topbar-inner"><a class="ymir-brand" href="/">Ymir Tool</a><div class="ymir-nav"><a href="/tools.html">全部工具</a><a href="/guides.html">使用指南</a><a href="/about.html">关于</a></div><div class="ymir-topbar-actions"></div></div></nav>'''

FOOTER = '''<footer class="ymir-footer" lang="zh-CN"><span>© 2026 <a href="/">Ymir Tool</a></span><a href="/tools.html">全部工具</a><a href="/guides.html">使用指南</a><a href="/about.html">关于我们</a><a href="/privacy.html">隐私政策</a><a href="/terms.html">使用条款</a><a href="/contact.html">联系我们</a><a href="/methodology.html">测试方法</a><a href="/sources.html">资料来源</a><a href="/licenses.html">开源许可</a><a href="/changelog.html">更新记录</a><a href="/disclaimer.html">免责声明</a><span>使用公开或脱敏样例进行测试。</span></footer>'''

HTML_TAG_RE = re.compile(r"<html\b[^>]*>", re.I)
TOPBAR_RE = re.compile(r'<nav\b[^>]*class="[^"]*\bymir-topbar\b[^"]*"[^>]*>.*?</nav>', re.I | re.S)
FOOTER_RE = re.compile(r'<footer\b[^>]*class="[^"]*\bymir-footer\b[^"]*"[^>]*>.*?</footer>', re.I | re.S)
THEME_SRC_RE = re.compile(r'/static/script/ymir-theme\.js\?v=[^"\']+')
SHELL_SRC_RE = re.compile(r'/static/script/ymir-tool-shell-v63\.js\?v=[^"\']+')
CANONICAL_RE = re.compile(r'<link\b[^>]*href="([^"]+)"[^>]*rel="canonical"[^>]*/>', re.I)
ROBOTS_RE = re.compile(r'<meta\b[^>]*content="([^"]+)"[^>]*name="robots"[^>]*/>', re.I)
ASSET_REF_RE = re.compile(
    rf'({"|".join(re.escape(asset) for asset in CACHE_BUSTED_ASSETS)})\?v=[^"\']+'
)


def read_utf8(path: Path) -> str:
    return path.read_bytes().decode("utf-8")


def write_utf8_lf(path: Path, text: str) -> None:
    path.write_bytes(text.replace("\r\n", "\n").encode("utf-8"))


def set_html_shell_contract(tag: str) -> str:
    class_match = re.search(r'\bclass=(?P<quote>["\'])(?P<value>.*?)(?P=quote)', tag, re.I)
    if class_match:
        classes = class_match.group("value").split()
        if "ymir-modern-html" not in classes:
            classes.append("ymir-modern-html")
        replacement = f'class={class_match.group("quote")}{" ".join(classes)}{class_match.group("quote")}'
        tag = tag[: class_match.start()] + replacement + tag[class_match.end() :]
    else:
        tag = tag[:-1] + ' class="ymir-modern-html">'

    if re.search(r'\bdata-shell-language=', tag, re.I):
        tag = re.sub(
            r'\bdata-shell-language=(?P<quote>["\']).*?(?P=quote)',
            'data-shell-language="zh-CN"',
            tag,
            count=1,
            flags=re.I,
        )
    else:
        tag = tag[:-1] + ' data-shell-language="zh-CN">'
    return tag


def seo_fingerprint(text: str, slug: str) -> tuple[str, str]:
    canonical = CANONICAL_RE.search(text)
    robots = ROBOTS_RE.search(text)
    if not canonical or not robots:
        raise RuntimeError(f"{slug}: canonical or robots policy is missing")
    return canonical.group(1), robots.group(1)


def update_tool_page(path: Path, slug: str) -> bool:
    original = read_utf8(path)
    before_seo = seo_fingerprint(original, slug)

    text, html_count = HTML_TAG_RE.subn(lambda match: set_html_shell_contract(match.group(0)), original, count=1)
    text, topbar_count = TOPBAR_RE.subn(TOPBAR, text, count=1)
    text, footer_count = FOOTER_RE.subn(FOOTER, text, count=1)
    if (html_count, topbar_count, footer_count) != (1, 1, 1):
        raise RuntimeError(
            f"{slug}: expected one html tag, topbar and footer; got "
            f"{html_count}, {topbar_count}, {footer_count}"
        )

    text = THEME_SRC_RE.sub(f"/static/script/ymir-theme.js?v={ASSET_VERSION}", text)
    text = SHELL_SRC_RE.sub(f"/static/script/ymir-tool-shell-v63.js?v={ASSET_VERSION}", text)

    if seo_fingerprint(text, slug) != before_seo:
        raise RuntimeError(f"{slug}: shell generation changed canonical or robots policy")
    text = text.replace("\r\n", "\n")
    if text == original:
        return False
    write_utf8_lf(path, text)
    return True


def synchronize_legacy_tokens() -> bool:
    original = read_utf8(LEGACY_BUNDLE)
    system_start = original.find(SYSTEM_MARKER)
    suffix_start = original.find(SYSTEM_SUFFIX_MARKER, system_start)
    if system_start < 0 or suffix_start <= system_start:
        raise RuntimeError("legacy CSS bundle is missing its system or compatibility marker")

    prefix = original[: system_start + len(SYSTEM_MARKER)].rstrip()
    suffix = original[suffix_start:].lstrip()
    system = read_utf8(SYSTEM_CSS).replace("\r\n", "\n").strip()
    updated = f"{prefix}\n{system}\n\n{suffix.rstrip()}\n"
    updated = updated.replace("\r\n", "\n")
    if updated == original:
        return False
    write_utf8_lf(LEGACY_BUNDLE, updated)
    return True


def synchronize_runtime_i18n() -> bool:
    original = read_utf8(RUNTIME_BUNDLE)
    source_start = original.find(I18N_MARKER)
    suffix_start = original.find(I18N_SUFFIX_MARKER, source_start)
    if source_start < 0 or suffix_start <= source_start:
        raise RuntimeError("legacy runtime bundle is missing its i18n or vendor marker")

    prefix = original[: source_start + len(I18N_MARKER)].rstrip()
    suffix = original[suffix_start:].lstrip()
    i18n = read_utf8(I18N_SOURCE).replace("\r\n", "\n").strip()
    updated = f"{prefix}\n{i18n}\n\n{suffix.rstrip()}\n"
    updated = updated.replace("\r\n", "\n")
    if updated == original:
        return False
    write_utf8_lf(RUNTIME_BUNDLE, updated)
    return True


def synchronize_asset_cache_keys() -> int:
    changed_pages = 0
    for path in ROOT.rglob("*.html"):
        original = read_utf8(path)
        updated = ASSET_REF_RE.sub(lambda match: f"{match.group(1)}?v={ASSET_VERSION}", original)
        if updated == original:
            continue
        write_utf8_lf(path, updated)
        changed_pages += 1
    return changed_pages


def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    tools = manifest.get("tools") or []
    if manifest.get("toolCount") != 150 or len(tools) != 150:
        raise RuntimeError("phase 9 requires the complete 150-tool manifest")

    changed_pages: list[str] = []
    for tool in tools:
        slug = str(tool["slug"])
        path = ROOT / slug / "index.html"
        if not path.exists():
            raise RuntimeError(f"{slug}: tool page is missing")
        if update_tool_page(path, slug):
            changed_pages.append(slug)

    css_changed = synchronize_legacy_tokens()
    runtime_changed = synchronize_runtime_i18n()
    asset_pages_changed = synchronize_asset_cache_keys()
    print(
        f"Phase 9 unified the Chinese shell across {len(tools)} tool pages; "
        f"changed {len(changed_pages)} page(s), legacy token bundle changed={str(css_changed).lower()}, "
        f"runtime i18n changed={str(runtime_changed).lower()}, "
        f"immutable asset cache keys changed on {asset_pages_changed} page(s)."
    )


if __name__ == "__main__":
    main()
