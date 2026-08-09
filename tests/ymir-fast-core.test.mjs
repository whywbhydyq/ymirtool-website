import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  formatJson,
  minifyJson,
  validateJson,
  encodeBase64,
  decodeBase64,
  encodeUrl,
  decodeUrl,
  formatJavaScript,
  minifyJavaScript,
  testRegex,
  compareText,
  countText,
  timestampToDate,
  dateToTimestamp,
} from '../static/script/ymir-fast-core-v66.mjs';

test('invalid JSON clears the value instead of retaining an old result', () => {
  const result = formatJson('{bad');

  assert.equal(result.ok, false);
  assert.equal(result.value, '');
  assert.match(result.error, /^Invalid JSON:/);
});

test('JSON operations format, minify, and validate strict JSON', () => {
  assert.equal(formatJson('{"name":"Ymir"}').value, '{\n  "name": "Ymir"\n}');
  assert.equal(minifyJson('{ "name": "Ymir" }').value, '{"name":"Ymir"}');
  assert.deepEqual(validateJson('{"ok":true}'), {
    ok: true,
    value: 'Valid JSON',
    meta: { type: 'object', entries: 1 },
  });
});

test('Base64 and URL operations preserve UTF-8 input', () => {
  const source = '中文 Ymir / x=1&ready=true';
  assert.equal(decodeBase64(encodeBase64(source).value).value, source);
  assert.equal(decodeUrl(encodeUrl(source).value).value, source);
});

test('JavaScript formatting keeps string contents while restructuring source', () => {
  const source = 'function hello(name){if(name){return "Hello, "+name;}return "Ymir";}';
  const formatted = formatJavaScript(source);

  assert.equal(formatted.ok, true);
  assert.match(formatted.value, /function hello\(name\) \{/);
  assert.match(formatted.value, /return "Hello, " \+ name;/);
  assert.equal(minifyJavaScript(formatted.value).value, source);
});

test('regex testing reports matches and rejects invalid expressions', () => {
  const result = testRegex('y(\\w+)', 'gi', 'Ymir ytool');

  assert.equal(result.ok, true);
  assert.equal(result.meta.matches.length, 2);
  assert.deepEqual(result.meta.matches[0].groups, ['mir']);

  const invalid = testRegex('(', 'g', 'text');
  assert.equal(invalid.ok, false);
  assert.equal(invalid.value, '');
});

test('diff and count operations expose reviewable metrics', () => {
  const diff = compareText('a\nb', 'a\nc');
  assert.equal(diff.ok, true);
  assert.equal(diff.meta.changed, 1);
  assert.match(diff.value, /- b/);
  assert.match(diff.value, /\+ c/);

  assert.deepEqual(countText('hello 世界\nnext').meta, {
    characters: 13,
    charactersNoSpaces: 11,
    words: 4,
    lines: 2,
  });
});

test('timestamp conversion is deterministic and rejects invalid dates', () => {
  assert.equal(timestampToDate('0').value, '1970-01-01T00:00:00.000Z');
  assert.equal(dateToTimestamp('1970-01-01T00:00:01Z').meta.seconds, 1);

  const invalid = dateToTimestamp('not-a-date');
  assert.equal(invalid.ok, false);
  assert.equal(invalid.value, '');
});

test('browser controller has stable accessible selectors and clears output before failure', () => {
  const source = fs.readFileSync(
    new URL('../static/script/ymir-fast-core-v66.mjs', import.meta.url),
    'utf8',
  );

  assert.match(source, /export function initFastWorkbench/);
  assert.match(source, /\[data-fast-action\]/);
  assert.match(source, /output\.value = ''/);
  assert.match(source, /aria-live/);
});

test('fast CSS is standalone, responsive, and below the 100 KB budget', () => {
  const cssUrl = new URL('../static/style/ymir-fast-core-v66.css', import.meta.url);
  const css = fs.readFileSync(cssUrl, 'utf8');

  assert.ok(Buffer.byteLength(css) < 100_000);
  assert.doesNotMatch(css, /@import|\.el-/);
  assert.match(css, /\.ymir-fast-workbench/);
  assert.match(css, /@media \(max-width:/);
  assert.equal((css.match(/{/g) || []).length, (css.match(/}/g) || []).length);
});
