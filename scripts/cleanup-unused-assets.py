#!/usr/bin/env python3
"""Remove superseded remediation artifacts and unreachable static assets.

The reachability scan starts from every non-static project file (HTML, deployment
configuration, build/test scripts, manifests, and trust documents), then follows
literal local asset references. Files required to rebuild v62 bundles remain
reachable through the final remediation script.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
TEXT_SUFFIXES = {".html", ".css", ".js", ".mjs", ".json", ".xml", ".txt", ".md", ".toml", ".py"}
SUPERSEDED = (
    "REMEDIATION-PHASE-1.md",
    "REMEDIATION-PHASE-2.md",
    "REMEDIATION-PHASE-3.md",
    "REMEDIATION-PHASE-4.md",
    "REMEDIATION-PHASE-5.md",
    "UI-AUDIT-PHASE-4.json",
    "scripts/phase2-preserve-tools.mjs",
    "scripts/phase3-validate.mjs",
    "scripts/phase4-site-shell.mjs",
    "scripts/phase4-ui-overhaul.mjs",
    "scripts/phase4-validate.mjs",
    "static/script/ymir-tool-shell-v61.js",
)

STATIC_LITERAL = re.compile(r"(?:(?:https?://(?:www\.)?ymirtool\.com)?/?)(static/[A-Za-z0-9_./-]+)", re.I)
ATTR_REF = re.compile(r"(?:src|href|content|action)\s*=\s*[\"']([^\"']+)[\"']", re.I)
CSS_URL = re.compile(r"url\(\s*[\"']?([^\"')]+)", re.I)
QUOTED_RELATIVE = re.compile(r"[\"']((?:\.\.?/)+[^\"'?#\s]+)")


def project_files() -> dict[str, Path]:
    return {p.relative_to(ROOT).as_posix(): p for p in ROOT.rglob("*") if p.is_file()}


def local_target(source: Path, raw: str) -> str | None:
    raw = raw.strip().split("#", 1)[0].split("?", 1)[0]
    if not raw or raw.startswith(("data:", "mailto:", "tel:", "javascript:", "#", "blob:", "ws:", "wss:")):
        return None
    parsed = urlparse(raw)
    if parsed.scheme in {"http", "https"}:
        if parsed.netloc not in {"ymirtool.com", "www.ymirtool.com"}:
            return None
        target = ROOT / parsed.path.lstrip("/")
    elif raw.startswith("/"):
        target = ROOT / raw.lstrip("/")
    else:
        target = source.parent / raw
    try:
        return target.resolve().relative_to(ROOT.resolve()).as_posix()
    except ValueError:
        return None


def build_graph(files: dict[str, Path]) -> dict[str, set[str]]:
    graph = {rel: set() for rel in files}
    for rel, path in files.items():
        if path.suffix.lower() not in TEXT_SUFFIXES:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for match in STATIC_LITERAL.finditer(text):
            candidate = match.group(1).rstrip(".,);]")
            if candidate in files:
                graph[rel].add(candidate)
        for pattern in (ATTR_REF, CSS_URL, QUOTED_RELATIVE):
            for raw in pattern.findall(text):
                candidate = local_target(path, raw)
                if candidate in files:
                    graph[rel].add(candidate)
    return graph


def unreachable_static(files: dict[str, Path], graph: dict[str, set[str]]) -> list[str]:
    entries = {rel for rel in files if not rel.startswith("static/")}
    seen = set(entries)
    stack = list(entries)
    while stack:
        current = stack.pop()
        for target in graph.get(current, ()):
            if target not in seen:
                seen.add(target)
                stack.append(target)
    return sorted(rel for rel in files if rel.startswith("static/") and rel not in seen)


def prune_empty_directories() -> None:
    for path in sorted((p for p in ROOT.rglob("*") if p.is_dir()), key=lambda p: len(p.parts), reverse=True):
        if path == ROOT:
            continue
        try:
            path.rmdir()
        except OSError:
            pass


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()

    before_files = project_files()
    before_bytes = sum(path.stat().st_size for path in before_files.values())
    removed: list[dict[str, int | str]] = []

    for rel in SUPERSEDED:
        path = ROOT / rel
        if path.is_file():
            removed.append({"path": rel, "bytes": path.stat().st_size, "reason": "superseded"})
            if not args.dry_run:
                path.unlink()

    files = project_files() if not args.dry_run else {k: v for k, v in before_files.items() if k not in SUPERSEDED}
    graph = build_graph(files)
    for rel in unreachable_static(files, graph):
        path = ROOT / rel
        removed.append({"path": rel, "bytes": path.stat().st_size, "reason": "unreachable"})
        if not args.dry_run:
            path.unlink()

    if not args.dry_run:
        prune_empty_directories()
    after_files = project_files() if not args.dry_run else {k: v for k, v in files.items() if k not in {r["path"] for r in removed}}
    after_bytes = sum(path.stat().st_size for path in after_files.values()) if not args.dry_run else before_bytes - sum(int(r["bytes"]) for r in removed)
    report = {
        "status": "dry-run" if args.dry_run else "cleaned",
        "files_before": len(before_files),
        "files_after": len(after_files),
        "files_removed": len(removed),
        "bytes_before": before_bytes,
        "bytes_after": after_bytes,
        "bytes_removed": before_bytes - after_bytes,
        "removed": removed,
    }
    output = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    if args.report:
        target = args.report if args.report.is_absolute() else ROOT / args.report
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(output, encoding="utf-8")
    print(output, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
