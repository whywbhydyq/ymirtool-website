const success = (value, meta) => ({
  ok: true,
  value: String(value ?? ''),
  ...(meta === undefined ? {} : { meta }),
});

const failure = (message) => ({ ok: false, value: '', error: String(message) });

const errorMessage = (prefix, error) => {
  const detail = error instanceof Error ? error.message : String(error);
  return `${prefix}: ${detail.replace(/^JSON\.parse:\s*/i, '')}`;
};

export function formatJson(input) {
  try {
    return success(JSON.stringify(JSON.parse(String(input ?? '')), null, 2));
  } catch (error) {
    return failure(errorMessage('Invalid JSON', error));
  }
}

export function minifyJson(input) {
  try {
    return success(JSON.stringify(JSON.parse(String(input ?? ''))));
  } catch (error) {
    return failure(errorMessage('Invalid JSON', error));
  }
}

export function validateJson(input) {
  try {
    const parsed = JSON.parse(String(input ?? ''));
    const type = parsed === null ? 'null' : Array.isArray(parsed) ? 'array' : typeof parsed;
    const entries = Array.isArray(parsed)
      ? parsed.length
      : parsed && typeof parsed === 'object'
        ? Object.keys(parsed).length
        : 1;
    return success('Valid JSON', { type, entries });
  } catch (error) {
    return failure(errorMessage('Invalid JSON', error));
  }
}

function bytesToBinary(bytes) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return binary;
}

function binaryToBytes(binary) {
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function encodeBinary(binary) {
  if (typeof btoa === 'function') return btoa(binary);
  if (typeof Buffer !== 'undefined') return Buffer.from(binary, 'binary').toString('base64');
  throw new Error('Base64 encoding is unavailable in this browser');
}

function decodeBinary(encoded) {
  if (typeof atob === 'function') return atob(encoded);
  if (typeof Buffer !== 'undefined') return Buffer.from(encoded, 'base64').toString('binary');
  throw new Error('Base64 decoding is unavailable in this browser');
}

export function encodeBase64(input) {
  try {
    const bytes = new TextEncoder().encode(String(input ?? ''));
    return success(encodeBinary(bytesToBinary(bytes)), { bytes: bytes.length });
  } catch (error) {
    return failure(errorMessage('Base64 encode failed', error));
  }
}

export function decodeBase64(input) {
  try {
    let encoded = String(input ?? '').replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
    if (!encoded) return success('', { bytes: 0 });
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(encoded) || encoded.length % 4 === 1) {
      return failure('Base64 decode failed: invalid alphabet or padding');
    }
    encoded += '='.repeat((4 - (encoded.length % 4)) % 4);
    const bytes = binaryToBytes(decodeBinary(encoded));
    const value = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return success(value, { bytes: bytes.length });
  } catch (error) {
    return failure(errorMessage('Base64 decode failed', error));
  }
}

export function encodeUrl(input) {
  try {
    return success(encodeURIComponent(String(input ?? '')));
  } catch (error) {
    return failure(errorMessage('URL encode failed', error));
  }
}

export function decodeUrl(input) {
  try {
    return success(decodeURIComponent(String(input ?? '')));
  } catch (error) {
    return failure(errorMessage('URL decode failed', error));
  }
}

const isWordCharacter = (character) => /[A-Za-z0-9_$]/.test(character || '');
const isQuote = (character) => character === '"' || character === "'" || character === '`';

export function formatJavaScript(input) {
  const source = String(input ?? '');
  if (!source.trim()) return failure('JavaScript format failed: enter source code');

  try {
    let output = '';
    let indent = 0;
    let quote = '';
    let escaped = false;
    let lineComment = false;
    let blockComment = false;
    let pendingSpace = false;

    const atLineStart = () => !output || output.endsWith('\n');
    const appendIndent = () => {
      if (atLineStart()) output += '  '.repeat(Math.max(0, indent));
    };
    const trimLineEnd = () => { output = output.replace(/[ \t]+$/g, ''); };
    const newline = () => {
      trimLineEnd();
      if (!output.endsWith('\n')) output += '\n';
      pendingSpace = false;
    };
    const append = (value) => {
      appendIndent();
      output += value;
    };

    for (let index = 0; index < source.length; index += 1) {
      const character = source[index];
      const next = source[index + 1] || '';

      if (lineComment) {
        append(character);
        if (character === '\n') lineComment = false;
        continue;
      }
      if (blockComment) {
        append(character);
        if (character === '*' && next === '/') {
          append('/');
          index += 1;
          blockComment = false;
        }
        continue;
      }
      if (quote) {
        append(character);
        if (escaped) escaped = false;
        else if (character === '\\') escaped = true;
        else if (character === quote) quote = '';
        continue;
      }

      if (character === '/' && next === '/') {
        if (pendingSpace && !atLineStart()) append(' ');
        append('//');
        index += 1;
        lineComment = true;
        pendingSpace = false;
        continue;
      }
      if (character === '/' && next === '*') {
        if (pendingSpace && !atLineStart()) append(' ');
        append('/*');
        index += 1;
        blockComment = true;
        pendingSpace = false;
        continue;
      }
      if (isQuote(character)) {
        const previous = output.at(-1) || '';
        if (pendingSpace && isWordCharacter(previous)) append(' ');
        append(character);
        quote = character;
        pendingSpace = false;
        continue;
      }
      if (/\s/.test(character)) {
        pendingSpace = true;
        continue;
      }

      if (character === '{') {
        trimLineEnd();
        if (!atLineStart() && output.at(-1) !== ' ') output += ' ';
        append('{');
        indent += 1;
        newline();
        continue;
      }
      if (character === '}') {
        indent = Math.max(0, indent - 1);
        trimLineEnd();
        if (!atLineStart()) newline();
        append('}');
        if (next && !/[;,)]/.test(next)) newline();
        pendingSpace = false;
        continue;
      }
      if (character === ';') {
        trimLineEnd();
        append(';');
        newline();
        continue;
      }
      if (character === ',') {
        trimLineEnd();
        append(', ');
        pendingSpace = false;
        continue;
      }
      if (character === ':') {
        trimLineEnd();
        append(': ');
        pendingSpace = false;
        continue;
      }
      if (/[+\-*=/%<>!&|?]/.test(character)) {
        let operator = character;
        while (/[+\-*=/%<>!&|?]/.test(source[index + 1] || '')) {
          operator += source[index + 1];
          index += 1;
        }
        trimLineEnd();
        if (!atLineStart()) output += ' ';
        append(operator);
        output += ' ';
        pendingSpace = false;
        continue;
      }

      const previous = output.at(-1) || '';
      if (pendingSpace && (isWordCharacter(previous) && isWordCharacter(character))) append(' ');
      append(character);
      pendingSpace = false;
    }

    return success(output.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim());
  } catch (error) {
    return failure(errorMessage('JavaScript format failed', error));
  }
}

export function minifyJavaScript(input) {
  const source = String(input ?? '');
  if (!source.trim()) return failure('JavaScript minify failed: enter source code');

  try {
    let output = '';
    let quote = '';
    let escaped = false;
    let lineComment = false;
    let blockComment = false;
    let pendingSpace = false;

    for (let index = 0; index < source.length; index += 1) {
      const character = source[index];
      const next = source[index + 1] || '';
      if (lineComment) {
        if (character === '\n') { lineComment = false; pendingSpace = true; }
        continue;
      }
      if (blockComment) {
        if (character === '*' && next === '/') { blockComment = false; pendingSpace = true; index += 1; }
        continue;
      }
      if (quote) {
        output += character;
        if (escaped) escaped = false;
        else if (character === '\\') escaped = true;
        else if (character === quote) quote = '';
        continue;
      }
      if (character === '/' && next === '/') { lineComment = true; index += 1; continue; }
      if (character === '/' && next === '*') { blockComment = true; index += 1; continue; }
      if (/\s/.test(character)) { pendingSpace = true; continue; }

      const previous = output.at(-1) || '';
      if (pendingSpace && (
        (isWordCharacter(previous) && isWordCharacter(character)) ||
        (isWordCharacter(previous) && isQuote(character)) ||
        (isQuote(previous) && isWordCharacter(character))
      )) output += ' ';
      output += character;
      pendingSpace = false;
      if (isQuote(character)) quote = character;
    }
    return success(output.trim());
  } catch (error) {
    return failure(errorMessage('JavaScript minify failed', error));
  }
}

export function testRegex(pattern, flags, text) {
  try {
    const expression = new RegExp(String(pattern ?? ''), String(flags ?? ''));
    const source = String(text ?? '');
    const matches = [];
    let match;
    do {
      match = expression.exec(source);
      if (!match) break;
      matches.push({
        match: match[0],
        index: match.index,
        groups: match.slice(1),
        namedGroups: match.groups || {},
      });
      if (!expression.global) break;
      if (match[0] === '') expression.lastIndex += 1;
    } while (expression.lastIndex <= source.length && matches.length < 10_000);

    const value = matches.length
      ? matches.map((item, index) => `${index + 1}. [${item.index}] ${item.match}`).join('\n')
      : 'No matches';
    return success(value, { matches, count: matches.length });
  } catch (error) {
    return failure(errorMessage('Regex error', error));
  }
}

export function compareText(original, changed) {
  const left = String(original ?? '').split(/\r?\n/);
  const right = String(changed ?? '').split(/\r?\n/);
  const lines = [];
  let added = 0;
  let removed = 0;
  let changedCount = 0;
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    if (left[index] === right[index]) {
      if (left[index] !== undefined) lines.push(`  ${left[index]}`);
      continue;
    }
    if (left[index] !== undefined) { lines.push(`- ${left[index]}`); removed += 1; }
    if (right[index] !== undefined) { lines.push(`+ ${right[index]}`); added += 1; }
    if (left[index] !== undefined && right[index] !== undefined) changedCount += 1;
  }
  return success(lines.join('\n'), { added, removed, changed: changedCount, lines: length });
}

export function countText(input) {
  const text = String(input ?? '');
  const words = (text.trim().match(/[A-Za-z0-9_'-]+|[\u4e00-\u9fff]/g) || []).length;
  const meta = {
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, '').length,
    words,
    lines: text ? text.split(/\r?\n/).length : 0,
  };
  return success(
    `Characters: ${meta.characters}\nNo spaces: ${meta.charactersNoSpaces}\nWords/CJK chars: ${meta.words}\nLines: ${meta.lines}`,
    meta,
  );
}

export function timestampToDate(input) {
  try {
    const numeric = Number(String(input ?? '').trim());
    if (!Number.isFinite(numeric)) return failure('Timestamp error: enter seconds or milliseconds');
    const milliseconds = Math.abs(numeric) < 1e12 ? numeric * 1000 : numeric;
    const date = new Date(milliseconds);
    if (Number.isNaN(date.getTime())) return failure('Timestamp error: value is outside the supported date range');
    return success(date.toISOString(), {
      seconds: Math.trunc(milliseconds / 1000),
      milliseconds: Math.trunc(milliseconds),
    });
  } catch (error) {
    return failure(errorMessage('Timestamp error', error));
  }
}

export function dateToTimestamp(input) {
  try {
    const milliseconds = Date.parse(String(input ?? '').trim());
    if (!Number.isFinite(milliseconds)) return failure('Date error: enter a valid ISO or local date');
    const seconds = Math.trunc(milliseconds / 1000);
    return success(`${seconds}\n${milliseconds}`, { seconds, milliseconds });
  } catch (error) {
    return failure(errorMessage('Date error', error));
  }
}

const ACTIONS = {
  formatJson: ({ input }) => formatJson(input),
  minifyJson: ({ input }) => minifyJson(input),
  validateJson: ({ input }) => validateJson(input),
  encodeBase64: ({ input }) => encodeBase64(input),
  decodeBase64: ({ input }) => decodeBase64(input),
  encodeUrl: ({ input }) => encodeUrl(input),
  decodeUrl: ({ input }) => decodeUrl(input),
  formatJavaScript: ({ input }) => formatJavaScript(input),
  minifyJavaScript: ({ input }) => minifyJavaScript(input),
  testRegex: ({ pattern, flags, text }) => testRegex(pattern, flags, text),
  compareText: ({ original, changed }) => compareText(original, changed),
  countText: ({ input }) => countText(input),
  timestampToDate: ({ timestamp }) => timestampToDate(timestamp),
  dateToTimestamp: ({ date }) => dateToTimestamp(date),
};

function setControlValue(control, value) {
  if ('value' in control) control.value = String(value ?? '');
  else control.textContent = String(value ?? '');
}

function readWorkbenchValues(root) {
  const values = {};
  root.querySelectorAll('[data-fast-input]').forEach((control) => {
    const key = control.getAttribute('data-fast-input');
    if (!key) return;
    if (control instanceof HTMLInputElement && control.type === 'checkbox') {
      values[key] = control.checked ? control.value : '';
    } else {
      values[key] = control.value ?? control.textContent ?? '';
    }
  });
  values.flags = Array.from(root.querySelectorAll('[data-fast-flag]:checked'))
    .map((control) => control.getAttribute('data-fast-flag') || '')
    .join('');
  return values;
}

function clearOutputs(root) {
  root.querySelectorAll('[data-fast-output]').forEach((output) => {
    if ('value' in output) output.value = '';
    else output.textContent = '';
  });
  root.querySelectorAll('[data-fast-metric]').forEach((metric) => { metric.textContent = '0'; });
}

function setStatus(root, message, type = 'info') {
  const status = root.querySelector('[data-fast-status]');
  if (!status) return;
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('data-status-type', type);
  status.textContent = String(message || '');
}

function renderMetrics(root, meta = {}) {
  root.querySelectorAll('[data-fast-metric]').forEach((metric) => {
    const key = metric.getAttribute('data-fast-metric');
    if (key && Object.hasOwn(meta, key)) metric.textContent = String(meta[key]);
  });
}

function renderResult(root, result, targetName) {
  if (!result.ok) {
    setStatus(root, result.error, 'error');
    return;
  }
  const selector = targetName
    ? `[data-fast-output="${globalThis.CSS?.escape ? CSS.escape(targetName) : targetName}"]`
    : '[data-fast-output]';
  const output = root.querySelector(selector) || root.querySelector('[data-fast-output]');
  if (output) setControlValue(output, result.value);
  renderMetrics(root, result.meta);
  setStatus(root, 'Ready to copy.', 'success');
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'readonly');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  if (!copied) throw new Error('Copy command was rejected');
}

function fillSamples(root) {
  root.querySelectorAll('[data-fast-input]').forEach((control) => {
    const sample = control.getAttribute('data-fast-sample');
    if (sample !== null && 'value' in control) control.value = sample;
  });
}

function clearWorkbench(root) {
  root.querySelectorAll('[data-fast-input]').forEach((control) => {
    if (control instanceof HTMLInputElement && control.type === 'checkbox') {
      control.checked = control.hasAttribute('data-fast-default');
    } else if ('value' in control) {
      control.value = '';
    }
  });
  clearOutputs(root);
  setStatus(root, 'Cleared.', 'info');
}

export function initFastWorkbench(root) {
  if (!root || root.getAttribute('data-fast-ready') === 'true') return;
  root.setAttribute('data-fast-ready', 'true');
  const run = (actionName, targetName) => {
    const action = ACTIONS[actionName];
    if (!action) return;
    clearOutputs(root);
    const result = action(readWorkbenchValues(root));
    renderResult(root, result, targetName);
  };

  root.querySelectorAll('[data-fast-action]').forEach((button) => {
    button.addEventListener('click', async () => {
      const actionName = button.getAttribute('data-fast-action');
      if (actionName === 'sample') {
        fillSamples(root);
        const primary = root.getAttribute('data-fast-primary-action');
        if (primary) run(primary, root.getAttribute('data-fast-primary-target'));
        else setStatus(root, 'Sample loaded.', 'info');
        return;
      }
      if (actionName === 'clear') {
        clearWorkbench(root);
        return;
      }
      if (actionName === 'copy') {
        const targetName = button.getAttribute('data-fast-target');
        const selector = targetName ? `[data-fast-output="${targetName}"]` : '[data-fast-output]';
        const output = root.querySelector(selector) || root.querySelector('[data-fast-output]');
        const value = output ? ('value' in output ? output.value : output.textContent) : '';
        if (!value) { setStatus(root, 'Run the tool before copying.', 'error'); return; }
        try {
          await copyText(value);
          setStatus(root, 'Copied to clipboard.', 'success');
        } catch (error) {
          setStatus(root, errorMessage('Copy failed', error), 'error');
        }
        return;
      }
      run(actionName, button.getAttribute('data-fast-target'));
    });
  });

  const automaticAction = root.getAttribute('data-fast-auto-action');
  if (automaticAction) {
    root.querySelectorAll('[data-fast-input]').forEach((control) => {
      control.addEventListener('input', () => run(automaticAction, root.getAttribute('data-fast-primary-target')));
    });
    run(automaticAction, root.getAttribute('data-fast-primary-target'));
  }
  setStatus(root, 'Ready.', 'info');
}

export function initFastWorkbenches(scope = document) {
  scope.querySelectorAll('[data-fast-tool]').forEach(initFastWorkbench);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initFastWorkbenches(document), { once: true });
  } else {
    initFastWorkbenches(document);
  }
}
