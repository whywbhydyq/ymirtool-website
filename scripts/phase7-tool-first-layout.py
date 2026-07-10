#!/usr/bin/env python3
from __future__ import annotations

import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERSION = "20260710-v65"
OLD_CSS = ROOT / "static/style/ymir-tool-bundle-v64.css"
NEW_CSS = ROOT / "static/style/ymir-tool-bundle-v65.css"

TOOL_FIRST_CSS = r'''

/* ===== Ymir Tool v64 tool-first page layout ===== */
body.ymir-modern-body main[data-ymir-tool][data-tool-first="true"] {
  padding-top: 18px !important;
}
body.ymir-modern-body main[data-ymir-tool][data-tool-first="true"] > .ymir-vue-tool-root {
  width: 100% !important;
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
  grid-column: 1 / -1 !important;
}
body.ymir-modern-body main[data-ymir-tool][data-tool-first="true"] > .ymir-static-tool-lead {
  grid-column: 1 / -1 !important;
  padding: 17px 19px !important;
  border-radius: 18px !important;
  background: var(--yt-surface) !important;
  box-shadow: var(--yt-shadow-sm) !important;
}
body.ymir-modern-body main[data-ymir-tool][data-tool-first="true"] > .ymir-static-tool-lead::after {
  display: none !important;
}
body.ymir-modern-body main[data-ymir-tool][data-tool-first="true"] .ymir-breadcrumb {
  min-height: 0 !important;
  margin: 0 0 8px !important;
  font-size: 11px !important;
}
body.ymir-modern-body main[data-ymir-tool][data-tool-first="true"] .ymir-lead-kicker {
  margin: 0 0 8px !important;
}
body.ymir-modern-body main[data-ymir-tool][data-tool-first="true"] .ymir-lead-kicker > span:not(.ymir-category-pill) {
  display: none !important;
}
body.ymir-modern-body main[data-ymir-tool][data-tool-first="true"] .ymir-lead-layout {
  grid-template-columns: minmax(0, 1fr) auto !important;
  align-items: center !important;
  gap: 18px !important;
}
body.ymir-modern-body main[data-ymir-tool][data-tool-first="true"] .ymir-static-tool-lead h1 {
  max-width: none !important;
  font-size: clamp(1.35rem, 2vw, 1.78rem) !important;
  line-height: 1.16 !important;
  letter-spacing: -.025em !important;
}
body.ymir-modern-body main[data-ymir-tool][data-tool-first="true"] .ymir-static-tool-lead h1 + p,
body.ymir-modern-body main[data-ymir-tool][data-tool-first="true"] .ymir-lead-copy > p:first-of-type {
  max-width: 940px !important;
  margin-top: 6px !important;
  font-size: .9rem !important;
  line-height: 1.55 !important;
}
body.ymir-modern-body main[data-ymir-tool][data-tool-first="true"] .ymir-static-tool-lead ul {
  margin-top: 9px !important;
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 6px !important;
}
body.ymir-modern-body main[data-ymir-tool][data-tool-first="true"] .ymir-static-tool-lead li {
  min-height: 0 !important;
  padding: 5px 8px !important;
  border-radius: 999px !important;
  font-size: 11px !important;
  line-height: 1.35 !important;
}
body.ymir-modern-body main[data-ymir-tool][data-tool-first="true"] .ymir-static-tool-lead li::before {
  margin-right: 5px !important;
}
body.ymir-modern-body main[data-ymir-tool][data-tool-first="true"] .ymir-lead-aside {
  width: auto !important;
  min-width: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}
body.ymir-modern-body main[data-ymir-tool][data-tool-first="true"] .ymir-lead-aside > p,
body.ymir-modern-body main[data-ymir-tool][data-tool-first="true"] .ymir-lead-aside > small {
  display: none !important;
}
body.ymir-modern-body main[data-ymir-tool][data-tool-first="true"] .ymir-lead-actions {
  display: flex !important;
  flex-wrap: wrap !important;
  justify-content: flex-end !important;
  gap: 7px !important;
}
body.ymir-modern-body main[data-ymir-tool][data-tool-first="true"] .ymir-lead-action,
body.ymir-modern-body main[data-ymir-tool][data-tool-first="true"] .ymir-lead-action.is-primary {
  min-height: 36px !important;
  grid-column: auto !important;
  padding: 7px 10px !important;
}
@media (max-width: 820px) {
  body.ymir-modern-body main[data-ymir-tool][data-tool-first="true"] {
    padding-top: 12px !important;
  }
  body.ymir-modern-body main[data-ymir-tool][data-tool-first="true"] .ymir-lead-layout {
    grid-template-columns: 1fr !important;
  }
  body.ymir-modern-body main[data-ymir-tool][data-tool-first="true"] .ymir-lead-actions {
    justify-content: flex-start !important;
  }
}
@media (max-width: 560px) {
  body.ymir-modern-body main[data-ymir-tool][data-tool-first="true"] > .ymir-static-tool-lead {
    padding: 14px !important;
  }
  body.ymir-modern-body main[data-ymir-tool][data-tool-first="true"] .ymir-static-tool-lead ul {
    display: none !important;
  }
  body.ymir-modern-body main[data-ymir-tool][data-tool-first="true"] .ymir-lead-action {
    flex: 1 1 auto !important;
  }
}
/* ===== end v64 tool-first layout ===== */
'''


OUTPUT_READABILITY_CSS = r'''
/* ===== Ymir Tool v65 readable output editor hotfix =====
   Prevent legacy readonly textarea rules from painting a dark editor while
   the active light theme still supplies dark text. Keep output contrast
   theme-aware and consistent across every Vue/Element Plus tool page. */
body.ymir-modern-body main[data-ymir-tool] .ymir-vue-output .ymir-vue-editor-frame.is-readonly,
body.ymir-modern-body main[data-ymir-tool] .ymir-vue-output .ymir-vue-editor-input {
  background: var(--yt-surface-2) !important;
}
body.ymir-modern-body main[data-ymir-tool] .ymir-vue-output textarea.el-textarea__inner[readonly],
body.ymir-modern-body main[data-ymir-tool] .ymir-vue-editor-frame.is-readonly textarea.el-textarea__inner[readonly],
body.ymir-modern-body main[data-ymir-tool] .ymir-vue-inline-output textarea.el-textarea__inner[readonly] {
  background: transparent !important;
  color: var(--yt-text) !important;
  -webkit-text-fill-color: var(--yt-text) !important;
  caret-color: transparent !important;
  opacity: 1 !important;
}
body.ymir-modern-body main[data-ymir-tool] .ymir-vue-output textarea.el-textarea__inner[readonly]::placeholder,
body.ymir-modern-body main[data-ymir-tool] .ymir-vue-editor-frame.is-readonly textarea.el-textarea__inner[readonly]::placeholder,
body.ymir-modern-body main[data-ymir-tool] .ymir-vue-inline-output textarea.el-textarea__inner[readonly]::placeholder {
  color: var(--yt-text-3) !important;
  -webkit-text-fill-color: var(--yt-text-3) !important;
  opacity: 1 !important;
}
body.ymir-modern-body main[data-ymir-tool] .ymir-vue-output .ymir-vue-line-gutter,
body.ymir-modern-body main[data-ymir-tool] .ymir-vue-editor-frame.is-readonly .ymir-vue-line-gutter {
  color: var(--yt-text-3) !important;
  background: var(--yt-surface-3) !important;
}
/* ===== end v65 readable output editor hotfix ===== */
'''

LEAD_ROOT_RE = re.compile(
    r'(?P<lead><section\s+class="[^"]*\bymir-static-tool-lead\b[^"]*"[^>]*>.*?</section>)'
    r'(?P<space1>\s*)'
    r'(?P<root><section\b[^>]*class="[^"]*\bymir-vue-tool-root\b[^"]*"[^>]*>.*?</section>)'
    r'(?P<tail>\s*(?:<noscript>.*?</noscript>\s*)?(?:<section\b[^>]*class="[^"]*\bymir-static-tool-fallback\b[^"]*"[^>]*>.*?</section>\s*)?)',
    re.S,
)


def is_tool_page(text: str) -> bool:
    return 'data-ymir-tool=' in text and 'ymir-vue-tool-root' in text and 'ymir-static-tool-lead' in text


def mark_main(text: str) -> str:
    pattern = re.compile(r'(<main\b[^>]*\bdata-ymir-tool="[^"]+"[^>]*)(>)', re.I)
    match = pattern.search(text)
    if not match:
        return text
    tag = match.group(1)
    if 'data-tool-first=' not in tag:
        tag += ' data-tool-first="true"'
    return text[:match.start()] + tag + match.group(2) + text[match.end():]


def reorder(text: str, rel: Path) -> str:
    match = LEAD_ROOT_RE.search(text)
    if not match:
        raise RuntimeError(f"{rel}: lead/root sequence not found")
    replacement = match.group('root') + match.group('tail') + '\n' + match.group('lead') + match.group('space1')
    return text[:match.start()] + replacement + text[match.end():]


def update_html(path: Path) -> bool:
    text = path.read_text(encoding='utf-8')
    if not is_tool_page(text):
        return False
    rel = path.relative_to(ROOT)
    root_pos = text.find('ymir-vue-tool-root')
    lead_pos = text.find('ymir-static-tool-lead')
    if lead_pos < root_pos:
        text = reorder(text, rel)
    text = mark_main(text)
    text = text.replace('/static/style/ymir-tool-bundle-v64.css?v=20260710-v64', '/static/style/ymir-tool-bundle-v65.css?v=' + VERSION)
    text = text.replace('/static/style/ymir-tool-bundle-v64.css', '/static/style/ymir-tool-bundle-v65.css')
    path.write_text(text, encoding='utf-8')
    return True


def main() -> None:
    if NEW_CSS.exists():
        css = NEW_CSS.read_text(encoding='utf-8')
    elif OLD_CSS.exists():
        shutil.copy2(OLD_CSS, NEW_CSS)
        css = NEW_CSS.read_text(encoding='utf-8')
    else:
        raise SystemExit('Missing v64/v65 CSS bundle')

    marker = 'Ymir Tool v64 tool-first page layout'
    if marker not in css:
        css = css.rstrip() + TOOL_FIRST_CSS + '\n'
    output_marker = 'Ymir Tool v65 readable output editor hotfix'
    if output_marker not in css:
        css = css.rstrip() + OUTPUT_READABILITY_CSS + '\n'
    NEW_CSS.write_text(css, encoding='utf-8')

    changed = 0
    for path in sorted(ROOT.rglob('*.html')):
        if update_html(path):
            changed += 1

    if changed != 150:
        raise SystemExit(f'Expected 150 tool pages, updated {changed}')

    if OLD_CSS.exists():
        OLD_CSS.unlink()

    print(f'Phase 7 applied: {changed} tool pages now render the workbench before the descriptive panel.')


if __name__ == '__main__':
    main()
