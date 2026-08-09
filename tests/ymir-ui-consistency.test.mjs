import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (relativePath) => fs.readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');
const coreSlugs = ['json', 'base64', 'urlencode', 'formatjs', 'regex', 'textdiff', 'txtcount', 'unixtime'];

function bodyOf(html) {
  return html.match(/<body\b[\s\S]*?<\/body>/i)?.[0] || '';
}

function hexToRgb(hex) {
  const normalized = hex.replace('#', '');
  return [0, 2, 4].map((index) => Number.parseInt(normalized.slice(index, index + 2), 16));
}

function relativeLuminance(hex) {
  const channels = hexToRgb(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(first, second) {
  const a = relativeLuminance(first);
  const b = relativeLuminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function token(block, name) {
  return block.match(new RegExp(`${name}:\\s*(#[0-9a-f]{6})`, 'i'))?.[1];
}

test('eight maintained tool pages render a Chinese interface and Chinese task content by default', () => {
  for (const slug of coreSlugs) {
    const html = read(`${slug}/index.html`);
    const body = bodyOf(html);

    assert.match(html, /<html\b[^>]*\blang="zh-CN"/i, `${slug} must default to Chinese`);
    assert.match(body, /data-fast-language="zh-CN"/, `${slug} workbench must declare its language`);
    assert.match(body, /[\u3400-\u9fff]/, `${slug} must contain Chinese content`);
    assert.doesNotMatch(
      body,
      /Instant browser tool|Local · ready on load|Run an action to see the result|Ready\.|About this tool|When this tool is useful|Before copying the result/,
      `${slug} still exposes the old English interface or article shell`,
    );
  }
});

test('maintained workbench runtime localizes result labels, errors, and interaction status', () => {
  const runtime = read('static/script/ymir-fast-core-v66.mjs');

  assert.match(runtime, /function localizeUiText\(root, value\)/);
  assert.match(runtime, /JSON 有效/);
  assert.match(runtime, /未找到匹配/);
  assert.match(runtime, /已可复制/);
  assert.match(runtime, /已复制到剪贴板/);
  assert.match(runtime, /请先运行工具再复制/);
  assert.match(runtime, /字符数:/);
});

test('fast and full pages share canonical theme tokens with accessible foreground contrast', () => {
  const fastCss = read('static/style/ymir-fast-core-v66.css');
  const fullCss = read('static/style/ymir-tool-system-v61.css');

  assert.doesNotMatch(fastCss, /--yf-/, 'fast pages must not maintain a second theme-token namespace');
  for (const name of ['--yt-bg', '--yt-surface', '--yt-text', '--yt-text-2', '--yt-border', '--yt-primary', '--yt-on-primary']) {
    assert.match(fastCss, new RegExp(`${name}:`), `fast CSS missing ${name}`);
    assert.match(fullCss, new RegExp(`${name}:`), `full CSS missing ${name}`);
  }

  for (const css of [fastCss, fullCss]) {
    const light = css.match(/:root\s*\{([\s\S]*?)\}/)?.[1] || '';
    const dark = css.match(/html\[data-theme="dark"\]\s*\{([\s\S]*?)\}/)?.[1] || '';
    for (const [label, block] of [['light', light], ['dark', dark]]) {
      const surface = token(block, '--yt-surface');
      const text = token(block, '--yt-text');
      const muted = token(block, '--yt-text-2');
      const primary = token(block, '--yt-primary');
      const onPrimary = token(block, '--yt-on-primary');
      assert.ok(surface && text && muted && primary && onPrimary, `${label} theme tokens must use six-digit hex colors`);
      assert.ok(contrastRatio(surface, text) >= 7, `${label} primary text contrast must be at least 7:1`);
      assert.ok(contrastRatio(surface, muted) >= 4.5, `${label} secondary text contrast must be at least 4.5:1`);
      assert.ok(contrastRatio(primary, onPrimary) >= 4.5, `${label} primary button contrast must be at least 4.5:1`);
    }
  }
});

test('theme state is persistent and consistent on maintained, guide, and directory pages', () => {
  const theme = read('static/script/ymir-theme.js');

  assert.match(theme, /localStorage\.setItem\(STORAGE_KEY, value\)/);
  assert.match(theme, /data-theme-preference/);
  assert.match(theme, /data-theme-state/);
  assert.doesNotMatch(theme, /btn\.textContent\s*=\s*iconFor/, 'theme state must not replace shell icons with unrelated glyphs');

  for (const file of ['tools.html', 'guides.html', ...coreSlugs.map((slug) => `${slug}/index.html`)]) {
    const html = read(file);
    assert.match(html, /<html\b[^>]*class="[^"]*ymir-modern-html/);
    assert.match(html, /\/static\/script\/ymir-theme\.js/);
    assert.equal(
      (html.match(/\/static\/script\/ymir-theme\.js/g) || []).length,
      1,
      `${file} must initialize the shared theme exactly once`,
    );
  }
});

test('Chinese document language wins over browser language unless the user explicitly chose otherwise', () => {
  const i18n = read('static/script/ymir-i18n.js');

  assert.match(i18n, /function documentLang\(\)/);
  assert.match(i18n, /queryLang\(\) \|\| storedLang\(\) \|\| documentLang\(\) \|\| browserLang\(\) \|\| 'zh'/);
});

test('all-tools page has static Chinese cards, category filters, result count, and an empty state', () => {
  const html = read('tools.html');
  const body = bodyOf(html);

  assert.equal((body.match(/data-tool-card=/g) || []).length, 150);
  assert.equal((body.match(/data-tool-group=/g) || []).length, 8);
  assert.match(body, /id="allToolsSearch"/);
  assert.match(body, /data-discovery-filter="all"/);
  assert.match(body, /data-discovery-filter="encode"/);
  assert.match(body, /id="allToolsCount"[^>]*aria-live="polite"/);
  assert.match(body, /id="allToolsEmpty"[^>]*hidden/);
  assert.match(body, /没有找到匹配的工具/);
  assert.match(body, /data-discovery-reset/);
  assert.doesNotMatch(body, />All Tools<|>Guides<|>About<|>Privacy<|>Terms</);
});

test('guide center supports task search, category filters, meaningful empty state, and four-step workflow', () => {
  const html = read('guides.html');
  const body = bodyOf(html);

  assert.match(body, /id="guideSearch"/);
  assert.match(body, /data-discovery-filter="data"/);
  assert.match(body, /data-discovery-filter="code"/);
  assert.match(body, /data-discovery-filter="text"/);
  assert.match(body, /id="guideCount"[^>]*aria-live="polite"/);
  assert.match(body, /id="guideEmpty"[^>]*hidden/);
  assert.equal((body.match(/data-guide-card=/g) || []).length, 8);
  assert.equal((body.match(/class="ymir-workflow-step"/g) || []).length, 4);
});

test('shared discovery assets cover filters, empty states, keyboard-safe controls, and mobile layout', () => {
  const script = read('static/script/ymir-discovery-pages.js');
  const css = read('static/style/ymir-discovery-pages.css');

  assert.match(script, /aria-pressed/);
  assert.match(script, /data-discovery-filter/);
  assert.match(script, /data-discovery-empty/);
  assert.match(script, /data-discovery-reset/);
  assert.match(script, /hidden\s*=/);
  assert.match(css, /var\(--yt-surface\)/);
  assert.match(css, /var\(--yt-text\)/);
  assert.match(css, /@media\s*\(max-width:\s*720px\)/);
  assert.match(css, /\.ymir-discovery-empty/);
  assert.equal((css.match(/{/g) || []).length, (css.match(/}/g) || []).length);
});
