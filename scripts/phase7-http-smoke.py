#!/usr/bin/env python3
from __future__ import annotations

import contextlib
import functools
import http.server
import sys
import threading
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATHS = [
    "/",
    "/json/",
    "/aesencrypt/",
    "/tools.html",
    "/methodology.html",
    "/static/style/ymir-tool-bundle-v64.css",
    "/static/script/ymir-tools-manifest.js",
    "/static/script/ymir-tool-runtime-v63.js",
    "/static/script/ymir-tool-core-runtime-v63.js",
    "/static/script/ymir-vue-tools-app.js",
    "/static/script/ymir-tool-shell-v63.js",
    "/static/script/ymir-tool-watchdog-v63.js",
]

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:
        return


def main() -> int:
    handler = functools.partial(QuietHandler, directory=str(ROOT))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    port = server.server_address[1]
    failures: list[str] = []
    try:
        for route in PATHS:
            url = f"http://127.0.0.1:{port}{route}"
            try:
                with contextlib.closing(urllib.request.urlopen(url, timeout=10)) as response:
                    data = response.read()
                    print(f"{route:<62} HTTP {response.status}, {len(data)} bytes")
                    if response.status != 200 or not data:
                        failures.append(route)
            except Exception as exc:
                print(f"{route:<62} FAILED: {exc}")
                failures.append(route)
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)
    if failures:
        print(f"HTTP smoke failed for {len(failures)} route(s).", file=sys.stderr)
        return 1
    print("Phase 7 local HTTP smoke passed.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
