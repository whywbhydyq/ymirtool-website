#!/usr/bin/env python3
from __future__ import annotations

import argparse
import collections
import gzip
import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlparse

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
ASSETS = [
    "static/style/ymir-tool-bundle-v62.css",
    "static/script/ymir-tool-runtime-v62.js",
    "static/script/ymir-tool-core-runtime-v62.js",
    "static/script/ymir-tool-shell-v62.js",
    "static/script/ymir-vue-loader.js",
]


def html_files() -> list[Path]:
    return sorted(
        p for p in ROOT.rglob("*.html")
        if ".git" not in p.parts and "node_modules" not in p.parts and ".seo-cache" not in p.parts
    )


def local_candidates(page: Path, raw_url: str) -> list[Path]:
    parsed = urlparse(raw_url)
    route = unquote(parsed.path)
    if route.startswith("/"):
        candidate = ROOT / route.lstrip("/")
    else:
        candidate = page.parent / route
    candidates = [candidate]
    if route.endswith("/"):
        candidates.append(candidate / "index.html")
    elif not candidate.suffix:
        candidates.extend([candidate / "index.html", candidate.with_suffix(".html")])
    return candidates


def main() -> int:
    parser = argparse.ArgumentParser(description="Run final Ymir Tool structural/content audit.")
    parser.add_argument("--output", type=Path, help="Optional JSON output path")
    args = parser.parse_args()

    pages = html_files()
    failures: list[str] = []
    broken: list[dict[str, str]] = []
    long_copy: dict[str, list[str]] = collections.defaultdict(list)
    title_map: dict[str, list[str]] = collections.defaultdict(list)
    desc_map: dict[str, list[str]] = collections.defaultdict(list)
    h1_map: dict[str, list[str]] = collections.defaultdict(list)
    desc_outside: list[dict[str, object]] = []
    checked_references = 0
    counts = collections.Counter()

    for page in pages:
        rel = page.relative_to(ROOT).as_posix()
        text = page.read_text(encoding="utf-8", errors="replace")
        soup = BeautifulSoup(text, "html.parser")

        robots = soup.find("meta", attrs={"name": "robots"})
        noindex = bool(robots and "noindex" in robots.get("content", "").lower())
        counts["noindex" if noindex else "indexable"] += 1
        counts["ads_runtime_pages"] += int("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js" in text)
        counts["analytics_pages"] += int("cdn.vercel-insights.com/v1/script.js" in text)
        counts["tool_pages"] += int(bool(soup.find(attrs={"data-ymir-tool": True})))
        counts["tool_documentation_sections"] += int(bool(soup.find(attrs={"data-tool-documentation": True})))

        title = " ".join((soup.title.get_text(" ", strip=True) if soup.title else "").split())
        h1 = soup.find("h1")
        h1_text = " ".join((h1.get_text(" ", strip=True) if h1 else "").split())
        desc_node = soup.find("meta", attrs={"name": "description"})
        desc = " ".join((desc_node.get("content", "") if desc_node else "").split())
        if title:
            title_map[title].append(rel)
        if h1_text:
            h1_map[h1_text].append(rel)
        if desc:
            desc_map[desc].append(rel)
            if not noindex and not 70 <= len(desc) <= 170:
                desc_outside.append({"page": rel, "length": len(desc)})

        for node in soup.find_all(["p", "li"]):
            paragraph = " ".join(node.get_text(" ", strip=True).split())
            if len(paragraph) >= 80:
                normalized = re.sub(r"\s+", " ", paragraph).strip().lower()
                long_copy[normalized].append(rel)

        for tag, attr in [("a", "href"), ("link", "href"), ("script", "src"), ("img", "src"), ("source", "src")]:
            for node in soup.find_all(tag):
                value = node.get(attr)
                if not value or value.startswith(("#", "mailto:", "tel:", "javascript:", "data:", "blob:", "//")):
                    continue
                parsed = urlparse(value)
                if parsed.scheme in {"http", "https"} or not parsed.path:
                    continue
                checked_references += 1
                if not any(candidate.exists() for candidate in local_candidates(page, value)):
                    broken.append({"page": rel, "reference": value})

    duplicate_long = [
        {"text": text, "pages": sorted(set(locations))}
        for text, locations in long_copy.items()
        if len(set(locations)) >= 3
    ]
    duplicate_titles = {key: value for key, value in title_map.items() if len(value) > 1}
    duplicate_descriptions = {key: value for key, value in desc_map.items() if len(value) > 1}
    duplicate_h1 = {key: value for key, value in h1_map.items() if len(value) > 1}

    expected = {
        "html_files": 217,
        "indexable": 27,
        "noindex": 190,
        "tool_pages": 150,
        "tool_documentation_sections": 142,
        "ads_runtime_pages": 1,
        "analytics_pages": 27,
    }
    actual = {"html_files": len(pages), **{key: counts[key] for key in expected if key != "html_files"}}
    for key, value in expected.items():
        if actual[key] != value:
            failures.append(f"{key}: expected {value}, found {actual[key]}")
    if broken:
        failures.append(f"broken local references: {len(broken)}")
    if duplicate_long:
        failures.append(f"long paragraph groups repeated on 3+ pages: {len(duplicate_long)}")
    if duplicate_titles:
        failures.append(f"duplicate title groups: {len(duplicate_titles)}")
    if duplicate_descriptions:
        failures.append(f"duplicate meta description groups: {len(duplicate_descriptions)}")
    if duplicate_h1:
        failures.append(f"duplicate H1 groups: {len(duplicate_h1)}")
    if desc_outside:
        failures.append(f"indexable meta descriptions outside 70–170 chars: {len(desc_outside)}")

    asset_sizes = {}
    for rel in ASSETS:
        data = (ROOT / rel).read_bytes()
        asset_sizes[rel] = {"raw_bytes": len(data), "gzip_bytes": len(gzip.compress(data, 9))}

    report = {
        "status": "passed" if not failures else "failed",
        "expected": expected,
        "actual": actual,
        "local_references_checked": checked_references,
        "broken_local_references": broken,
        "long_paragraph_groups_repeated_on_3plus_pages": duplicate_long,
        "duplicate_title_groups": duplicate_titles,
        "duplicate_description_groups": duplicate_descriptions,
        "duplicate_h1_groups": duplicate_h1,
        "indexable_meta_descriptions_outside_70_170": desc_outside,
        "asset_sizes": asset_sizes,
        "failures": failures,
    }
    encoded = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    if args.output:
        output = args.output if args.output.is_absolute() else ROOT / args.output
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(encoded, encoding="utf-8")
    print(encoded, end="")
    if failures:
        return 1
    print(
        f"Phase 5 audit passed: {len(pages)} HTML, {checked_references} local references, "
        "0 broken references, 0 repeated long-copy groups, and unique titles/descriptions/H1s."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
