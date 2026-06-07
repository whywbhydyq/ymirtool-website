'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const NONCE_PLACEHOLDER = '__CSP_NONCE__';
const HTML_FILES = new Set([
  "404.html",
  "about.html",
  "aesencrypt/index.html",
  "alldns/index.html",
  "allencrypt/index.html",
  "androidkeycode/index.html",
  "androidmanifest/index.html",
  "api-response-debugging-guide.html",
  "areacode/index.html",
  "ascii/index.html",
  "asciicode/index.html",
  "autoformat/index.html",
  "barcode/index.html",
  "base64/index.html",
  "base64-encoding-guide.html",
  "base64-is-not-encryption.html",
  "base64-padding-error-guide.html",
  "base64-padding-troubleshooting.html",
  "base64-unicode-btoa-atob-guide.html",
  "base64url-vs-base64-guide.html",
  "bootstrapicon/index.html",
  "browserinfo/index.html",
  "calcangle/index.html",
  "calcarea/index.html",
  "calcdata/index.html",
  "calcforce/index.html",
  "calcheat/index.html",
  "calclength/index.html",
  "calcpower/index.html",
  "calcpressure/index.html",
  "calcspeed/index.html",
  "calctemperature/index.html",
  "calcthickness/index.html",
  "calctime/index.html",
  "calculator/index.html",
  "calculator-guide.html",
  "calculator-tools-guide.html",
  "calcvolume/index.html",
  "camelcase/index.html",
  "capital/index.html",
  "chaodai/index.html",
  "code-formatting-guide.html",
  "color-tools-guide.html",
  "common-errors-guide.html",
  "confundirjs/index.html",
  "contact.html",
  "contenttype/index.html",
  "copy-paste-safety-checklist.html",
  "createmeta/index.html",
  "currency/index.html",
  "deencrypt/index.html",
  "desencrypt/index.html",
  "developer-reference-guide.html",
  "disclaimer.html",
  "dns/index.html",
  "dnsdx/index.html",
  "dnsedu/index.html",
  "dnslt/index.html",
  "dnstt/index.html",
  "dnsusa/index.html",
  "dnsyd/index.html",
  "editor/index.html",
  "encodeuri-vs-encodeuricomponent.html",
  "encoding-tools-guide.html",
  "endecodejs/index.html",
  "enlower/index.html",
  "escape/index.html",
  "excel2json/index.html",
  "formatc/index.html",
  "formatcpp/index.html",
  "formatcs/index.html",
  "formatcsql/index.html",
  "formatcss/index.html",
  "formatfilter/index.html",
  "formathtml/index.html",
  "formatjava/index.html",
  "formatjs/index.html",
  "formatperl/index.html",
  "formatphp/index.html",
  "formatpy/index.html",
  "formatruby/index.html",
  "formatsql/index.html",
  "formatvbs/index.html",
  "formatxml/index.html",
  "guid/index.html",
  "guides.html",
  "hash-tools-guide.html",
  "hexconvert/index.html",
  "hexrgb/index.html",
  "htaccess2nginx/index.html",
  "html2all/index.html",
  "html2cj/index.html",
  "html2js/index.html",
  "html2php/index.html",
  "html2ubb/index.html",
  "htmlescape/index.html",
  "htmlescapechar/index.html",
  "htmlfromcsv/index.html",
  "htmlmarkdown/index.html",
  "htmloutjs/index.html",
  "htmltable/index.html",
  "htpasswd/index.html",
  "httpheader/index.html",
  "huoxingwen/index.html",
  "img2base64/index.html",
  "index.html",
  "ip2long/index.html",
  "javascript-formatter-guide.html",
  "jianfan/index.html",
  "jieri/index.html",
  "json/index.html",
  "json-api-response-debugging-checklist.html",
  "json-format-guide.html",
  "json-formatter-examples.html",
  "json-large-number-precision-guide.html",
  "json-schema-checklist.html",
  "json-stringify-parse-data-loss.html",
  "json-trailing-comma-single-quote-errors.html",
  "json2cs/index.html",
  "json2excel/index.html",
  "json2get/index.html",
  "json2go/index.html",
  "json2java/index.html",
  "json2xml/index.html",
  "json2yaml/index.html",
  "jsonlrview/index.html",
  "jsonudview/index.html",
  "jsonzip/index.html",
  "keyboardcode/index.html",
  "keyboardtest/index.html",
  "linuxcmd/index.html",
  "md5/index.html",
  "md5-checksum-file-verification.html",
  "md5-checksum-verification-workflow.html",
  "md5-hash-guide.html",
  "morse/index.html",
  "navtiveunicode/index.html",
  "network-tools-guide.html",
  "nianlvli/index.html",
  "online-toolbox-guide.html",
  "pagecode/index.html",
  "password/index.html",
  "pinyin/index.html",
  "ports/index.html",
  "priority-tools-guide.html",
  "privacy.html",
  "px2rem/index.html",
  "quanbaojiao/index.html",
  "quchong/index.html",
  "rabbitencrypt/index.html",
  "random/index.html",
  "rc4encrypt/index.html",
  "refresh/index.html",
  "regex/index.html",
  "regex-capture-group-debugging.html",
  "regex-greedy-lazy-quantifier-guide.html",
  "regex-javascript-flags-guide.html",
  "regex-production-review.html",
  "regex-tester-guide.html",
  "regexcode/index.html",
  "regexdso/index.html",
  "regexsucha/index.html",
  "release-copy-paste-review-checklist.html",
  "requestmethod/index.html",
  "rmbdaxie/index.html",
  "runjs/index.html",
  "shaencrypt/index.html",
  "shaoshuminzu/index.html",
  "shizhong/index.html",
  "shortcut/index.html",
  "shupai/index.html",
  "sql2java/index.html",
  "subnetmask/index.html",
  "terms.html",
  "tesufuhao/index.html",
  "text-count-guide.html",
  "text-diff-guide.html",
  "text-diff-release-review.html",
  "text-diff-whitespace-line-ending-guide.html",
  "text-tools-guide.html",
  "textdiff/index.html",
  "textflip/index.html",
  "tiaoseban/index.html",
  "time-tools-guide.html",
  "timestamp-log-analysis-guide.html",
  "timezone-log-debugging-guide.html",
  "tool-quality-standards.html",
  "tripledes/index.html",
  "tuya/index.html",
  "txtcount/index.html",
  "txtreplace/index.html",
  "unicode/index.html",
  "unix-time-guide.html",
  "unix-timestamp-seconds-vs-milliseconds.html",
  "unixtime/index.html",
  "url-double-encoding-debugging.html",
  "url-encoding-guide.html",
  "url-plus-vs-percent20-guide.html",
  "url-query-encoding-cases.html",
  "url-query-parameter-encoding-guide.html",
  "urlcode/index.html",
  "urlencode/index.html",
  "urlthunder/index.html",
  "useragent/index.html",
  "utf8/index.html",
  "uuid/index.html",
  "webmaster-tools-guide.html",
  "websocket/index.html",
  "wenzitexiao/index.html",
  "worldtime/index.html",
  "xpath/index.html",
  "zipstringtext/index.html"
]);

function makeNonce() {
  return crypto.randomBytes(16).toString('base64url');
}

function normalizeRequestPath(value) {
  let raw = typeof value === 'string' && value ? value : '/';
  try { raw = decodeURIComponent(raw); } catch (_) { raw = '/'; }
  raw = raw.split('?')[0].split('#')[0];
  if (!raw.startsWith('/')) raw = '/' + raw;
  if (raw === '/') return 'index.html';
  let rel = raw.slice(1);
  if (rel.endsWith('/')) rel += 'index.html';
  return rel;
}

function resolveHtmlFile(req) {
  const url = new URL(req.url || '/api/csp-html', 'https://ymirtool.com');
  const rel = normalizeRequestPath(url.searchParams.get('path') || '/');
  if (!HTML_FILES.has(rel)) return null;
  return { rel, abs: path.join(process.cwd(), rel) };
}

function buildCsp(nonce) {
  // AdSense documents strict CSP as nonce + strict-dynamic, with https/http fallback for ad script endpoints.
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `script-src 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' 'unsafe-eval' https: http: 'report-sample'`,
    "style-src 'self' 'report-sample'",
    "img-src 'self' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://vitals.vercel-insights.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com ws: wss:",
    "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com data: blob:",
    "worker-src 'self' blob:",
    'upgrade-insecure-requests',
    'report-uri /api/csp-report',
    'report-to ymir-csp-report'
  ].join('; ');
}

function setSecurityHeaders(res, nonce) {
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.setHeader('Content-Security-Policy', buildCsp(nonce));
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Reporting-Endpoints', 'ymir-csp-report="/api/csp-report"');
  res.setHeader('Report-To', '{"group":"ymir-csp-report","max_age":604800,"endpoints":[{"url":"/api/csp-report"}],"include_subdomains":true}');
  // Per-request nonces must not be cached as reusable HTML responses.
  res.setHeader('Cache-Control', 'no-store');
}

module.exports = function cspHtmlHandler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
    res.end('Method Not Allowed');
    return;
  }

  const target = resolveHtmlFile(req);
  if (!target) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
    res.end('Not Found');
    return;
  }

  let html;
  try {
    html = fs.readFileSync(target.abs, 'utf8');
  } catch (error) {
    console.error('[csp-html] failed to read', target.rel, error && error.message ? error.message : error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
    res.end('Internal Server Error');
    return;
  }

  const nonce = makeNonce();
  const body = html.split(NONCE_PLACEHOLDER).join(nonce);
  setSecurityHeaders(res, nonce);
  res.statusCode = 200;
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  res.end(body);
};
