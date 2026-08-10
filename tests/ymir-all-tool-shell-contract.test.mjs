import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (relativePath) => fs.readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');
const manifest = JSON.parse(read('static/script/ymir-vue-tool-manifest.json'));
const tools = manifest.tools || [];
const indexable = new Set((manifest.sitemap?.indexableToolUrls || []).map((url) => new URL(url).pathname));

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
    assert.match(topbar, />全部工具</);
    assert.match(topbar, />使用指南</);
    assert.match(topbar, />关于</);
    assert.doesNotMatch(topbar, forbiddenEnglishShell, `${tool.slug}: English shell navigation remains`);
    assert.ok(footer, `${tool.slug}: footer missing`);
    for (const label of ['全部工具', '使用指南', '关于我们', '隐私政策', '使用条款', '联系我们']) {
      assert.match(footer, new RegExp(`>${label}<`), `${tool.slug}: footer label ${label} missing`);
    }
    assert.doesNotMatch(footer, forbiddenEnglishShell, `${tool.slug}: English footer navigation remains`);
    assert.equal(count(html, '/static/script/ymir-theme.js'), 1, `${tool.slug}: shared theme runtime must load exactly once`);
  }
});

test('theme and legacy shell runtimes resolve interface language from the explicit shell marker', () => {
  const theme = read('static/script/ymir-theme.js');
  const shell = read('static/script/ymir-tool-shell-v63.js');

  assert.match(theme, /getAttribute\(['"]data-shell-language['"]\)/);
  assert.match(shell, /getAttribute\(['"]data-shell-language['"]\)/);
  assert.match(theme, /localStorage\.setItem\(STORAGE_KEY, value\)/);
  assert.match(theme, /data-theme-state/);
  assert.match(shell, /text\('全部工具', 'All tools'\)/);
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
