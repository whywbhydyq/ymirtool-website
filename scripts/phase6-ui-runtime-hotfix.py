#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERSION = "20260710-v63"
OLD_VERSION = "20260710-v62"

STYLE_OLD = ROOT / "static/style/ymir-tool-bundle-v62.css"
STYLE_NEW = ROOT / "static/style/ymir-tool-bundle-v63.css"
RUNTIME_OLD = ROOT / "static/script/ymir-tool-runtime-v62.js"
RUNTIME_NEW = ROOT / "static/script/ymir-tool-runtime-v63.js"
CORE_OLD = ROOT / "static/script/ymir-tool-core-runtime-v62.js"
CORE_NEW = ROOT / "static/script/ymir-tool-core-runtime-v63.js"
SHELL_OLD = ROOT / "static/script/ymir-tool-shell-v62.js"
SHELL_NEW = ROOT / "static/script/ymir-tool-shell-v63.js"
WATCHDOG = ROOT / "static/script/ymir-tool-watchdog-v63.js"
MANIFEST_JS = ROOT / "static/script/ymir-tools-manifest.js"
MANIFEST_JSON = ROOT / "static/script/ymir-vue-tool-manifest.json"

HOTFIX_CSS = r'''

/* ===== Ymir Tool v63 layout and runtime recovery hotfix ===== */
body.ymir-modern-body .ymir-page[data-ymir-tool] {
  align-items: start !important;
  gap: 16px !important;
}
body.ymir-modern-body .ymir-static-tool-lead {
  padding: 22px 24px 24px !important;
}
body.ymir-modern-body .ymir-lead-layout {
  grid-template-columns: minmax(0, 1fr) 244px !important;
  align-items: stretch !important;
  gap: 28px !important;
}
body.ymir-modern-body .ymir-lead-copy {
  display: flex !important;
  min-width: 0 !important;
  flex-direction: column !important;
  justify-content: center !important;
}
body.ymir-modern-body .ymir-static-tool-lead h1 {
  max-width: 820px !important;
  font-size: clamp(2.15rem, 3.25vw, 3.15rem) !important;
  line-height: 1.06 !important;
  letter-spacing: -.048em !important;
}
body.ymir-modern-body .ymir-static-tool-lead h1 + p,
body.ymir-modern-body .ymir-lead-copy > p:first-of-type {
  max-width: 820px !important;
  margin-top: 12px !important;
  font-size: clamp(.98rem, 1.2vw, 1.08rem) !important;
  line-height: 1.62 !important;
}
body.ymir-modern-body .ymir-static-tool-lead ul {
  width: 100% !important;
  max-width: none !important;
  margin-top: 15px !important;
  display: grid !important;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  gap: 8px !important;
}
body.ymir-modern-body .ymir-static-tool-lead li {
  min-height: 58px !important;
  display: flex !important;
  align-items: flex-start !important;
  padding: 10px 11px !important;
  border-radius: 12px !important;
  line-height: 1.45 !important;
}
body.ymir-modern-body .ymir-static-tool-lead li::before {
  content: "✓";
  flex: 0 0 auto;
  margin: 0 8px 0 0;
  color: var(--yt-success);
  font-weight: 900;
}
body.ymir-modern-body .ymir-lead-aside {
  align-self: stretch !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
}
body.ymir-modern-body .ymir-vue-tool-root {
  min-height: 280px !important;
}
body.ymir-modern-body .ymir-vue-tool-root:empty {
  min-height: 280px !important;
}
body.ymir-modern-body .ymir-vue-tool-root:empty::after {
  content: "正在加载工具…";
  position: absolute;
  margin-top: 82px;
  color: var(--yt-text-3);
  font-size: 13px;
  font-weight: 680;
}
html[lang^="en"] body.ymir-modern-body .ymir-vue-tool-root:empty::after {
  content: "Loading tool…";
}
body.ymir-modern-body .ymir-vue-tool-root:empty {
  position: relative !important;
}
body.ymir-modern-body .ymir-runtime-error {
  width: min(620px, calc(100% - 32px));
  margin: auto;
  padding: 24px;
  border: 1px solid color-mix(in srgb, var(--yt-danger) 28%, var(--yt-border));
  border-radius: 18px;
  color: var(--yt-text-2);
  background: var(--yt-surface);
  box-shadow: var(--yt-shadow-sm);
  text-align: center;
}
body.ymir-modern-body .ymir-runtime-error strong {
  display: block;
  margin-bottom: 8px;
  color: var(--yt-text);
  font-size: 18px;
}
body.ymir-modern-body .ymir-runtime-error p {
  margin: 0 auto 16px;
  max-width: 520px;
  line-height: 1.65;
}
body.ymir-modern-body .ymir-runtime-error__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 9px;
}
body.ymir-modern-body .ymir-runtime-error button,
body.ymir-modern-body .ymir-runtime-error a {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 9px 14px;
  border: 1px solid var(--yt-border);
  border-radius: 11px;
  color: var(--yt-text-2);
  background: var(--yt-surface-2);
  font: inherit;
  font-weight: 760;
  text-decoration: none;
  cursor: pointer;
}
body.ymir-modern-body .ymir-runtime-error button {
  color: #fff;
  border-color: var(--yt-accent);
  background: var(--yt-accent);
}
body.ymir-modern-body.ymir-tool-failed .ymir-static-tool-fallback {
  display: block !important;
}
body.ymir-modern-body .ymir-page[data-ymir-tool] > .ymir-content-card,
body.ymir-modern-body .ymir-page[data-ymir-tool] > .ymir-help,
body.ymir-modern-body .ymir-page[data-ymir-tool] > .ymir-faq,
body.ymir-modern-body .ymir-page[data-ymir-tool] > .ymir-related {
  align-self: start !important;
}
@media (max-width: 1100px) and (min-width: 821px) {
  body.ymir-modern-body .ymir-lead-layout {
    grid-template-columns: minmax(0, 1fr) 220px !important;
    gap: 20px !important;
  }
  body.ymir-modern-body .ymir-static-tool-lead ul {
    grid-template-columns: 1fr !important;
  }
  body.ymir-modern-body .ymir-static-tool-lead li {
    min-height: 0 !important;
  }
}
@media (max-width: 820px) {
  body.ymir-modern-body .ymir-lead-layout {
    grid-template-columns: 1fr !important;
  }
  body.ymir-modern-body .ymir-static-tool-lead ul {
    grid-template-columns: 1fr !important;
  }
  body.ymir-modern-body .ymir-static-tool-lead li {
    min-height: 0 !important;
  }
  body.ymir-modern-body .ymir-lead-aside {
    width: 100% !important;
    max-width: none !important;
  }
}
@media (max-width: 620px) {
  body.ymir-modern-body .ymir-static-tool-lead h1 {
    font-size: clamp(1.85rem, 9vw, 2.45rem) !important;
  }
  body.ymir-modern-body .ymir-vue-tool-root,
  body.ymir-modern-body .ymir-vue-tool-root:empty {
    min-height: 240px !important;
  }
}
/* ===== end v63 hotfix ===== */
'''

WATCHDOG_JS = r'''(function () {
  'use strict';
  var VERSION = '20260710-v63';
  var MAX_WAIT_MS = 8000;

  function root() {
    return document.querySelector('.ymir-vue-tool-root[data-tool]') || document.getElementById('ymir-vue-tool-app');
  }
  function isMounted(node) {
    if (!node) return false;
    if (node.hasAttribute('data-v-app')) return true;
    return !!node.querySelector('.ymir-vue-workbench, .ymir-vue-app, [data-v-app]');
  }
  function isExplicitFailure(node) {
    return !!(node && node.querySelector('.ymir-vue-noscript'));
  }
  function language() {
    return String(document.documentElement.lang || '').toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en';
  }
  function diagnostics() {
    var missing = [];
    if (!window.YmirToolsManifest) missing.push('manifest');
    if (!window.Vue) missing.push('Vue');
    if (!window.ElementPlus) missing.push('ElementPlus');
    if (!window.YmirVueAppFactory) missing.push('app factory');
    return missing;
  }
  function showFailure(node) {
    if (!node || isMounted(node) || node.getAttribute('data-runtime-state') === 'failed') return;
    var zh = language() === 'zh';
    var missing = diagnostics();
    node.setAttribute('data-runtime-state', 'failed');
    node.setAttribute('data-runtime-version', VERSION);
    node.setAttribute('data-runtime-missing', missing.join(','));
    node.innerHTML = '<div class="ymir-runtime-error" role="alert">' +
      '<strong>' + (zh ? '工具组件未能正常启动' : 'The tool could not start') + '</strong>' +
      '<p>' + (zh ? '页面已停止无限加载。请重新加载一次；如果浏览器仍使用旧缓存，可进行强制刷新。下方静态示例仍可用于确认输入输出格式。' : 'The endless loader has been stopped. Reload once; if the browser still uses an older cached asset, perform a hard refresh. The static example below remains available.') + '</p>' +
      '<div class="ymir-runtime-error__actions"><button type="button" data-ymir-runtime-retry>' + (zh ? '重新加载' : 'Reload') + '</button>' +
      '<a href="#ymir-static-fallback">' + (zh ? '查看静态示例' : 'View static example') + '</a></div></div>';
    document.body.classList.add('ymir-tool-failed');
    var fallback = document.querySelector('.ymir-static-tool-fallback');
    if (fallback) fallback.id = 'ymir-static-fallback';
    var retry = node.querySelector('[data-ymir-runtime-retry]');
    if (retry) retry.addEventListener('click', function () { window.location.reload(); });
    if (window.console && console.error) console.error('Ymir Tool runtime failed to mount.', { version: VERSION, missing: missing });
  }
  function markReady(node) {
    if (!node) return;
    node.setAttribute('data-runtime-state', 'ready');
    node.setAttribute('data-runtime-version', VERSION);
    document.body.classList.add('ymir-tool-ready');
    document.body.classList.remove('ymir-tool-failed');
  }
  function start() {
    var node = root();
    if (!node) return;
    if (isMounted(node)) { markReady(node); return; }
    if (isExplicitFailure(node)) { showFailure(node); return; }
    var started = Date.now();
    var observer = new MutationObserver(function () {
      if (isMounted(node)) { observer.disconnect(); markReady(node); }
      else if (isExplicitFailure(node)) { observer.disconnect(); showFailure(node); }
    });
    observer.observe(node, { childList: true, subtree: true, attributes: true });
    var timer = window.setInterval(function () {
      if (isMounted(node)) {
        window.clearInterval(timer);
        observer.disconnect();
        markReady(node);
      } else if (isExplicitFailure(node) || Date.now() - started >= MAX_WAIT_MS) {
        window.clearInterval(timer);
        observer.disconnect();
        showFailure(node);
      }
    }, 250);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
  window.YmirToolWatchdog = { version: VERSION, start: start };
})();
'''


def read_source(new: Path, old: Path) -> str:
    if new.exists():
        return new.read_text(encoding="utf-8")
    if old.exists():
        return old.read_text(encoding="utf-8")
    raise FileNotFoundError(f"Missing source asset: {new} / {old}")


def write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8", newline="\n")


def parse_manifest(text: str) -> dict:
    match = re.search(r"window\.YmirToolsManifest\s*=\s*(\{.*\});\s*\}\)\(\);\s*$", text, re.S)
    if not match:
        raise RuntimeError("Unable to parse ymir-tools-manifest.js")
    return json.loads(match.group(1))


def write_manifest(data: dict) -> None:
    data["version"] = VERSION
    data.setdefault("site", {})["version"] = VERSION
    data["site"]["generator"] = "v63 deterministic tool bootstrap and UI hotfix"
    data["entrypoint"] = "/static/script/ymir-tool-runtime-v63.js"
    runtime = data.setdefault("runtime", {})
    runtime["vendor"] = ["/static/script/ymir-tool-runtime-v63.js"]
    runtime["coreToolScripts"] = ["/static/script/ymir-tool-core-runtime-v63.js"]
    data.setdefault("policy", {})["generator"] = "v63 deterministic tool bootstrap and UI hotfix"
    payload = json.dumps(data, ensure_ascii=False, indent=2)
    write(MANIFEST_JS, "(function () {\n  'use strict';\n  window.YmirToolsManifest = " + payload + ";\n})();\n")
    write(MANIFEST_JSON, json.dumps(data, ensure_ascii=False, indent=2) + "\n")


def build_assets() -> dict:
    css = read_source(STYLE_NEW, STYLE_OLD)
    if "Ymir Tool v63 layout and runtime recovery hotfix" not in css:
        css = css.rstrip() + HOTFIX_CSS
    write(STYLE_NEW, css)

    runtime = read_source(RUNTIME_NEW, RUNTIME_OLD)
    runtime = runtime.replace("Ymir Tool v62 runtime bundle", "Ymir Tool v63 runtime bundle", 1)
    write(RUNTIME_NEW, runtime)

    core = read_source(CORE_NEW, CORE_OLD)
    core = core.replace("Ymir Tool v62 core-tool runtime bundle", "Ymir Tool v63 core-tool runtime bundle", 1)
    write(CORE_NEW, core)

    shell = read_source(SHELL_NEW, SHELL_OLD)
    shell = shell.replace("var VERSION = '20260710-v62';", "var VERSION = '20260710-v63';")
    shell = shell.replace("ymir-tool-page-v62", "ymir-tool-page-v63")
    shell = shell.replace("data-ui-version', '62'", "data-ui-version', '63'")
    write(SHELL_NEW, shell)
    write(WATCHDOG, WATCHDOG_JS)

    manifest = parse_manifest(MANIFEST_JS.read_text(encoding="utf-8"))
    write_manifest(manifest)
    return manifest


def remove_script(text: str, token: str) -> str:
    pattern = re.compile(r'<script\b[^>]*\bsrc=["\'][^"\']*' + re.escape(token) + r'[^"\']*["\'][^>]*>\s*</script>\s*', re.I)
    return pattern.sub('', text)


def process_html(manifest: dict) -> tuple[int, int]:
    mappings = manifest.get("appByTool", {})
    core_app = manifest.get("runtime", {}).get("coreApp")
    tool_pages = 0
    all_pages = 0
    app_tokens = sorted({Path(value).name for value in mappings.values()})

    for path in ROOT.rglob("*.html"):
        if any(part.startswith(".") for part in path.relative_to(ROOT).parts):
            continue
        text = path.read_text(encoding="utf-8", errors="strict")
        original = text
        all_pages += 1
        text = text.replace("/static/style/ymir-tool-bundle-v62.css?v=" + OLD_VERSION,
                            "/static/style/ymir-tool-bundle-v63.css?v=" + VERSION)
        text = text.replace("/static/style/ymir-tool-bundle-v62.css", "/static/style/ymir-tool-bundle-v63.css")
        text = text.replace("ymir-tool-page-v62", "ymir-tool-page-v63")
        text = text.replace("/static/script/ymir-tool-shell-v62.js?v=" + OLD_VERSION,
                            "/static/script/ymir-tool-shell-v63.js?v=" + VERSION)
        text = text.replace("/static/script/ymir-tool-shell-v62.js", "/static/script/ymir-tool-shell-v63.js")

        match = re.search(r'data-ymir-tool=["\']([^"\']+)["\']', text)
        if match and "ymir-vue-tool-root" in text:
            slug = match.group(1)
            app = mappings.get(slug)
            if not app:
                raise RuntimeError(f"Missing app mapping for {slug}: {path}")
            tool_pages += 1
            for token in [
                "ymir-vue-loader.js", "ymir-tools-manifest.js", "ymir-tool-runtime-v62.js",
                "ymir-tool-runtime-v63.js", "ymir-tool-core-runtime-v62.js", "ymir-tool-core-runtime-v63.js",
                "ymir-tool-shell-v62.js", "ymir-tool-shell-v63.js", "ymir-tool-watchdog-v63.js",
            ] + app_tokens:
                text = remove_script(text, token)
            scripts = [
                f'<script defer src="/static/script/ymir-tools-manifest.js?v={VERSION}"></script>',
                f'<script defer src="/static/script/ymir-tool-runtime-v63.js?v={VERSION}"></script>',
            ]
            if app == core_app:
                scripts.append(f'<script defer src="/static/script/ymir-tool-core-runtime-v63.js?v={VERSION}"></script>')
            scripts.extend([
                f'<script defer src="{app}?v={VERSION}"></script>',
                f'<script defer src="/static/script/ymir-tool-shell-v63.js?v={VERSION}"></script>',
                f'<script defer src="/static/script/ymir-tool-watchdog-v63.js?v={VERSION}"></script>',
            ])
            block = "\n" + "\n".join(scripts) + "\n"
            text = re.sub(r"\s*</body>", block + "</body>", text, count=1, flags=re.I)
        else:
            # Non-tool pages keep the unified shell but do not load the tool runtime.
            text = remove_script(text, "ymir-tool-shell-v63.js")
            text = remove_script(text, "ymir-tool-shell-v62.js")
            if "ymir-modern-body" in text and "</body>" in text:
                text = re.sub(r"\s*</body>", f'\n<script defer src="/static/script/ymir-tool-shell-v63.js?v={VERSION}"></script>\n</body>', text, count=1, flags=re.I)

        if text != original:
            write(path, text)
    return all_pages, tool_pages


def update_config_and_docs() -> None:
    for config in [ROOT / "vercel.json", ROOT / "netlify.toml"]:
        if not config.exists():
            continue
        text = config.read_text(encoding="utf-8")
        text = text.replace("public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
                            "public, max-age=0, s-maxage=300, stale-while-revalidate=60")
        write(config, text)

    notice = ROOT / "THIRD-PARTY-NOTICES.md"
    if notice.exists():
        text = notice.read_text(encoding="utf-8")
        text = text.replace("ymir-tool-runtime-v62.js", "ymir-tool-runtime-v63.js")
        text = text.replace("v62 runtime", "v63 runtime")
        write(notice, text)

    changelog = ROOT / "changelog.html"
    if changelog.exists():
        text = changelog.read_text(encoding="utf-8")
        if "v63 工具加载与排版修复" not in text:
            entry = '<section class="ymir-card"><h2>2026-07-10 · v63 工具加载与排版修复</h2><ul><li>将工具依赖改为按文档顺序直接加载，移除可能长期停留在转圈状态的动态脚本瀑布。</li><li>为全部工具加入八秒启动监控、可读错误状态和静态示例回退。</li><li>使用新的 v63 静态资源地址，避免 immutable 缓存继续组合旧版 HTML、清单和运行时。</li><li>重排工具页标题、功能要点和快捷操作区域，使桌面和移动端对齐更稳定。</li></ul></section>'
            text = text.replace("</main>", entry + "</main>", 1)
            write(changelog, text)


def update_package() -> None:
    path = ROOT / "package.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    scripts = data.setdefault("scripts", {})
    scripts["remediate"] = "python3 scripts/phase6-ui-runtime-hotfix.py"
    scripts["validate"] = "node scripts/phase6-validate.mjs"
    scripts["smoke"] = "python3 scripts/phase6-http-smoke.py"
    scripts["test"] = "npm run seo:check && npm run validate && npm run audit && npm run smoke"
    write(path, json.dumps(data, ensure_ascii=False, indent=2) + "\n")


def remove_old_assets() -> None:
    for path in [STYLE_OLD, RUNTIME_OLD, CORE_OLD, SHELL_OLD, ROOT / "static/script/ymir-vue-loader.js"]:
        if path.exists() and path not in [STYLE_NEW, RUNTIME_NEW, CORE_NEW, SHELL_NEW]:
            path.unlink()


def main() -> None:
    manifest = build_assets()
    all_pages, tool_pages = process_html(manifest)
    update_config_and_docs()
    update_package()
    remove_old_assets()
    print(f"Phase 6 hotfix applied: {all_pages} HTML files, {tool_pages} tool pages, version {VERSION}")


if __name__ == "__main__":
    main()
