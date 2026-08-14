import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const read = (relativePath) => fs.readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');
const manifest = JSON.parse(read('static/script/ymir-vue-tool-manifest.json'));
const tools = manifest.tools || [];
const indexable = new Set((manifest.sitemap?.indexableToolUrls || []).map((url) => new URL(url).pathname));
const CACHE_VERSION = '20260814-v69';
const CHINESE_CONTENT_SLUGS = new Set([
  'base64', 'calculator', 'formatjs', 'json', 'regex', 'textdiff', 'txtcount', 'unixtime', 'urlencode',
]);

function managedHtmlFiles() {
  const rootPages = fs.readdirSync(new URL('../', import.meta.url), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => entry.name)
    .sort();
  const toolPages = tools.map((tool) => `${tool.slug}/index.html`).sort();
  return { rootPages, pages: [...rootPages, ...toolPages] };
}

function openingTag(html, tagName) {
  return html.match(new RegExp(`<${tagName}\\b[^>]*>`, 'i'))?.[0] || '';
}

function section(html, selectorClass) {
  return html.match(new RegExp(`<(?:nav|footer)\\b[^>]*class="[^"]*\\b${selectorClass}\\b[^"]*"[^>]*>[\\s\\S]*?<\\/(?:nav|footer)>`, 'i'))?.[0] || '';
}

function count(text, needle) {
  return text.split(needle).length - 1;
}

test('the shell contract covers all 150 manifest tool pages without changing canonical or robots policy', () => {
  assert.equal(manifest.toolCount, 150);
  assert.equal(tools.length, 150);
  assert.equal(indexable.size, 8);

  let noindexPages = 0;
  for (const tool of tools) {
    const html = read(`${tool.slug}/index.html`);
    const expectedUrl = `https://ymirtool.com/${tool.slug}/`;
    const canonical = html.match(/<link\b[^>]*href="([^"]+)"[^>]*rel="canonical"[^>]*\/>/i)?.[1];
    const robots = html.match(/<meta\b[^>]*content="([^"]+)"[^>]*name="robots"[^>]*\/>/i)?.[1];

    assert.equal(canonical, expectedUrl, `${tool.slug}: canonical changed`);
    if (indexable.has(`/${tool.slug}/`)) {
      assert.equal(robots, 'index, follow', `${tool.slug}: indexable page policy changed`);
    } else {
      noindexPages += 1;
      assert.equal(robots, 'noindex, follow', `${tool.slug}: noindex policy changed`);
    }
  }
  assert.equal(noindexPages, 142);
});

test('all 150 tool pages expose the same Chinese shell before JavaScript runs', () => {
  const forbiddenEnglishShell = />(?:All Tools|Guides|About|Privacy|Terms|Contact|Methodology|Sources|Licenses|Changelog|Disclaimer)</;

  for (const tool of tools) {
    const html = read(`${tool.slug}/index.html`);
    const htmlTag = openingTag(html, 'html');
    const bodyTag = openingTag(html, 'body');
    const topbar = section(html, 'ymir-topbar');
    const footer = section(html, 'ymir-footer');

    assert.match(htmlTag, /\bclass="[^"]*\bymir-modern-html\b[^"]*"/i, `${tool.slug}: modern html theme class missing`);
    assert.match(htmlTag, /\bdata-shell-language="zh-CN"/i, `${tool.slug}: Chinese shell language marker missing`);
    assert.match(bodyTag, /\bclass="[^"]*\bymir-modern-body\b[^"]*"/i, `${tool.slug}: modern body class missing`);
    assert.ok(topbar, `${tool.slug}: topbar missing`);
    assert.match(topbar, /\blang="zh-CN"/i, `${tool.slug}: Chinese topbar needs an explicit language boundary`);
    assert.match(topbar, />全部工具</);
    assert.match(topbar, />使用指南</);
    assert.match(topbar, />关于</);
    assert.doesNotMatch(topbar, forbiddenEnglishShell, `${tool.slug}: English shell navigation remains`);
    assert.ok(footer, `${tool.slug}: footer missing`);
    assert.match(footer, /\blang="zh-CN"/i, `${tool.slug}: Chinese footer needs an explicit language boundary`);
    for (const label of ['全部工具', '使用指南', '关于我们', '隐私政策', '使用条款', '联系我们']) {
      assert.match(footer, new RegExp(`>${label}<`), `${tool.slug}: footer label ${label} missing`);
    }
    assert.doesNotMatch(footer, forbiddenEnglishShell, `${tool.slug}: English footer navigation remains`);
    assert.equal(count(html, '/static/script/ymir-theme.js'), 1, `${tool.slug}: shared theme runtime must load exactly once`);
  }
});

test('Chinese shell markers do not relabel the 141 existing English tool documents', () => {
  const counts = { en: 0, 'zh-CN': 0 };

  for (const tool of tools) {
    const html = read(`${tool.slug}/index.html`);
    const documentLanguage = openingTag(html, 'html').match(/\blang="([^"]+)"/i)?.[1];
    const expectedLanguage = CHINESE_CONTENT_SLUGS.has(tool.slug) ? 'zh-CN' : 'en';

    assert.equal(documentLanguage, expectedLanguage, `${tool.slug}: document language boundary changed`);
    assert.match(openingTag(html, 'html'), /\bdata-shell-language="zh-CN"/i);
    counts[expectedLanguage] += 1;
  }

  assert.deepEqual(counts, { en: 141, 'zh-CN': 9 });
});

test('all changed immutable assets use the current generated cache key', () => {
  const assets = new Map([
    ['/static/script/ymir-tool-runtime-v63.js', 142],
    ['/static/style/ymir-tool-bundle-v65.css', 142],
    ['/static/style/ymir-tool-system-v61.css', 67],
    ['/static/style/ymir-fast-core-v66.css', 9],
  ]);

  const { rootPages, pages } = managedHtmlFiles();
  assert.equal(rootPages.length, 67);
  assert.equal(pages.length, 217);
  for (const [asset, expectedReferences] of assets) {
    let references = 0;
    for (const page of pages) {
      const html = read(page);
      const matches = [...html.matchAll(new RegExp(`${asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\?v=([^"']+)`, 'g'))];
      references += matches.length;
      for (const match of matches) {
        assert.equal(match[1], CACHE_VERSION, `${page}: stale immutable cache key for ${asset}`);
      }
    }
    assert.equal(references, expectedReferences, `${asset}: reference coverage changed`);
  }

  for (const generator of [
    'scripts/refine-discovery-pages.py',
    'scripts/phase8-fast-core-layout.py',
    'scripts/phase9-unify-tool-shell.py',
  ]) {
    assert.match(read(generator), new RegExp(`ASSET_VERSION = ["']${CACHE_VERSION}["']`));
  }
});

test('phase 9 scopes cache-key generation to the deterministic 217 managed HTML files', () => {
  const generator = read('scripts/phase9-unify-tool-shell.py');
  const { rootPages, pages } = managedHtmlFiles();
  const ignoredFixture = '.tmp/ignored-cache-key-fixture.html';

  assert.equal(rootPages.length, 67);
  assert.equal(pages.length, 217);
  assert.ok(!pages.includes(ignoredFixture));
  assert.doesNotMatch(generator, /ROOT\.rglob\(["']\*\.html["']\)/);
  assert.match(generator, /ROOT\.glob\(["']\*\.html["']\)/);
  assert.match(generator, /len\(root_pages\)\s*!=\s*67/);
  assert.match(generator, /len\(managed_pages\)\s*!=\s*217/);
});

test('phase 9 rejects unsafe, duplicate, aliased, and missing manifest tool paths before writing', () => {
  const probe = String.raw`
import importlib.util
import pathlib
import tempfile

spec = importlib.util.spec_from_file_location("phase9", pathlib.Path("scripts/phase9-unify-tool-shell.py"))
phase9 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(phase9)

def expect_bad(tools, expected_count, message, **kwargs):
    try:
        phase9.validate_tool_pages(tools, root=root, expected_count=expected_count, **kwargs)
    except RuntimeError:
        return
    raise AssertionError(message)

with tempfile.TemporaryDirectory() as temp:
    root = pathlib.Path(temp)
    for slug in ("alpha", "beta"):
        page = root / slug / "index.html"
        page.parent.mkdir(parents=True)
        page.write_text(slug, encoding="utf-8")

    valid = phase9.validate_tool_pages([{"slug": "alpha"}, {"slug": "beta"}], root=root, expected_count=2)
    assert len(valid) == 2
    before = sorted((path.relative_to(root).as_posix(), path.read_bytes()) for path in root.rglob("*index.html"))

    for slug in ("../escape", "nested/path", r"nested\path", "/absolute", r"C:\absolute"):
        expect_bad([{"slug": slug}], 1, f"unsafe slug accepted: {slug}")
    expect_bad([{"slug": "alpha"}, {"slug": "alpha"}], 2, "duplicate slug accepted")
    expect_bad([{"slug": "missing"}], 1, "missing tool page accepted")

    physical = root / "physical" / "index.html"
    physical.parent.mkdir()
    physical.write_text("physical", encoding="utf-8")
    expect_bad(
        [{"slug": "alpha"}, {"slug": "beta"}],
        2,
        "duplicate resolved path accepted",
        resolve_path=lambda _path: physical.resolve(),
    )

    outside = root.parent / "outside-index.html"
    outside.write_text("outside", encoding="utf-8")
    try:
        expect_bad(
            [{"slug": "alpha"}],
            1,
            "out-of-root resolved path accepted",
            resolve_path=lambda _path: outside.resolve(),
        )
    finally:
        outside.unlink()

    after = sorted((path.relative_to(root).as_posix(), path.read_bytes()) for path in root.rglob("*index.html"))
    assert before == [item for item in after if item[0] in {"alpha/index.html", "beta/index.html"}]
`;
  const result = spawnSync('python', ['-c', probe], {
    cwd: fileURLToPath(new URL('../', import.meta.url)),
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test('theme and legacy shell runtimes resolve interface language from the explicit shell marker', () => {
  const theme = read('static/script/ymir-theme.js');
  const shell = read('static/script/ymir-tool-shell-v63.js');

  assert.match(theme, /getAttribute\(['"]data-shell-language['"]\)/);
  assert.match(shell, /getAttribute\(['"]data-shell-language['"]\)/);
  assert.match(shell, /topbar\.setAttribute\('lang', isZh\(\) \? 'zh-CN' : 'en'\)/);
  assert.match(theme, /localStorage\.setItem\(STORAGE_KEY, value\)/);
  assert.match(theme, /data-theme-state/);
  assert.match(shell, /text\('全部工具', 'All tools'\)/);
});

test('legacy runtime embeds the maintained document-language preference logic', () => {
  const runtime = read('static/script/ymir-tool-runtime-v63.js');
  const i18n = read('static/script/ymir-i18n.js').trim();
  const marker = '/* ===== static/script/ymir-i18n.js ===== */';
  const nextMarker = '/* ===== static/vendor/vue/vue.global.prod.js ===== */';
  const start = runtime.indexOf(marker);
  const end = runtime.indexOf(nextMarker, start);

  assert.ok(start >= 0 && end > start, 'legacy runtime is missing its maintained i18n section');
  assert.equal(runtime.slice(start + marker.length, end).trim(), i18n);
  assert.match(i18n, /queryLang\(\) \|\| storedLang\(\) \|\| documentLang\(\) \|\| browserLang\(\)/);
});

test('legacy bundle embeds the canonical light and dark token system used by fast pages', () => {
  const bundle = read('static/style/ymir-tool-bundle-v65.css');
  const system = read('static/style/ymir-tool-system-v61.css').trim();
  const fast = read('static/style/ymir-fast-core-v66.css');
  const systemMarker = '/* ===== static/style/ymir-tool-system-v61.css ===== */';
  const suffixMarker = '/* ===== v62 final additions ===== */';
  const systemStart = bundle.indexOf(systemMarker);
  const suffixStart = bundle.indexOf(suffixMarker, systemStart);

  assert.ok(systemStart >= 0, 'legacy bundle is missing the shared token-system marker');
  assert.ok(suffixStart > systemStart, 'legacy bundle is missing its post-system compatibility suffix');
  assert.equal(bundle.slice(systemStart + systemMarker.length, suffixStart).trim(), system);

  const tokenNames = ['--yt-bg', '--yt-surface', '--yt-text', '--yt-text-2', '--yt-border', '--yt-primary', '--yt-on-primary'];
  for (const name of tokenNames) {
    assert.match(system, new RegExp(`${name}:`), `canonical token system missing ${name}`);
  }
  assert.match(system, /html\[data-theme="dark"\]\s*\{/);

  for (const selector of [':root', 'html[data-theme="dark"]']) {
    const pattern = selector === ':root'
      ? /:root\s*\{([\s\S]*?)\}/
      : /html\[data-theme="dark"\]\s*\{([\s\S]*?)\}/;
    const systemBlock = system.match(pattern)?.[1] || '';
    const fastBlock = fast.match(pattern)?.[1] || '';
    for (const name of tokenNames) {
      const valuePattern = new RegExp(`${name}:\\s*([^;]+)`);
      assert.equal(
        fastBlock.match(valuePattern)?.[1]?.trim(),
        systemBlock.match(valuePattern)?.[1]?.trim(),
        `fast and canonical ${selector} token ${name} diverged`,
      );
    }
  }

  for (const tool of tools) {
    const html = read(`${tool.slug}/index.html`);
    const usesFastSystem = html.includes('/static/style/ymir-fast-core-v66.css');
    const usesLegacySystem = html.includes('/static/style/ymir-tool-bundle-v65.css');
    assert.notEqual(usesFastSystem, usesLegacySystem, `${tool.slug}: page must use exactly one canonical token-system delivery path`);
  }
});

test('canonical body tokens override legacy component-level light values in dark mode', () => {
  const legacyComponents = read('static/style/ymir-tool-components.css');
  const system = read('static/style/ymir-tool-system-v61.css');
  const legacyBody = legacyComponents.match(/body\.ymir-modern-body\s*\{([\s\S]*?)\}/)?.[1] || '';
  const systemLightRoot = system.match(/:root\s*\{([\s\S]*?)\}/)?.[1] || '';
  const systemDarkRoot = system.match(/html\[data-theme="dark"\]\s*\{([\s\S]*?)\}/)?.[1] || '';
  const systemLightBody = system.match(/body\.ymir-modern-body\s*\{([\s\S]*?)\}/)?.[1] || '';
  const systemDarkBody = system.match(/html\[data-theme="dark"\]\s+body\.ymir-modern-body\s*\{([\s\S]*?)\}/)?.[1] || '';
  const collisionNames = ['--yt-surface', '--yt-border', '--yt-danger'];

  for (const name of collisionNames) {
    const valuePattern = new RegExp(`${name}:\\s*([^;]+)`);
    assert.match(legacyBody, valuePattern, `test fixture: legacy body no longer defines ${name}`);
    assert.equal(
      systemLightBody.match(valuePattern)?.[1]?.trim(),
      systemLightRoot.match(valuePattern)?.[1]?.trim(),
      `canonical light body must reset legacy ${name}`,
    );
    assert.equal(
      systemDarkBody.match(valuePattern)?.[1]?.trim(),
      systemDarkRoot.match(valuePattern)?.[1]?.trim(),
      `canonical dark body must reset legacy ${name}`,
    );
  }
});

test('canonical shell removes the obsolete generated brand square', () => {
  const system = read('static/style/ymir-tool-system-v61.css');

  assert.match(
    system,
    /body\.ymir-modern-body \.ymir-brand::before\s*\{[^}]*content:\s*none\s*!important/i,
    'the legacy brand pseudo-element otherwise renders beside the real logo on tools and legacy pages',
  );
});
