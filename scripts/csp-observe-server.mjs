import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CSP_REPORT_ENDPOINT, CSP_REPORT_ONLY_POLICY, REPORTING_ENDPOINTS_HEADER, REPORT_TO_HEADER } from './csp-policy.mjs';

const root = path.resolve(process.argv[2] || process.cwd());
const port = Number(process.env.PORT || process.argv[3] || 4173);
const reportFile = path.resolve(process.env.CSP_REPORT_FILE || path.join(root, 'csp-report-local.ndjson'));
const MAX_BODY_BYTES = 64 * 1024;

const contentTypes = new Map([
  ['.html', 'text/html; charset=UTF-8'],
  ['.css', 'text/css; charset=UTF-8'],
  ['.js', 'text/javascript; charset=UTF-8'],
  ['.mjs', 'text/javascript; charset=UTF-8'],
  ['.json', 'application/json; charset=UTF-8'],
  ['.xml', 'application/xml; charset=UTF-8'],
  ['.txt', 'text/plain; charset=UTF-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.gif', 'image/gif'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
  ['.ttf', 'font/ttf']
]);

function safeJoin(base, requestPath) {
  const decoded = decodeURIComponent(requestPath.split('?')[0]);
  const normalized = path.normalize(decoded).replace(/^([/\\])+/, '');
  const resolved = path.resolve(base, normalized);
  if (!resolved.startsWith(base + path.sep) && resolved !== base) {
    return null;
  }
  return resolved;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('CSP report body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function normalizeReportPayload(rawBody, req) {
  let parsed;
  try {
    parsed = rawBody ? JSON.parse(rawBody) : null;
  } catch (error) {
    parsed = { invalidJson: true, rawBody: rawBody.slice(0, 512), error: error.message };
  }

  const reports = Array.isArray(parsed) ? parsed : [parsed];
  return reports.map((report) => ({
    receivedAt: new Date().toISOString(),
    userAgent: req.headers['user-agent'] || '',
    report
  }));
}

function applySecurityHeaders(res) {
  res.setHeader('Content-Security-Policy-Report-Only', CSP_REPORT_ONLY_POLICY);
  res.setHeader('Reporting-Endpoints', REPORTING_ENDPOINTS_HEADER);
  res.setHeader('Report-To', REPORT_TO_HEADER);
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}

const server = http.createServer(async (req, res) => {
  applySecurityHeaders(res);

  if (req.method === 'POST' && req.url && req.url.split('?')[0] === CSP_REPORT_ENDPOINT) {
    try {
      const rawBody = await readBody(req);
      const rows = normalizeReportPayload(rawBody, req);
      fs.appendFileSync(reportFile, rows.map((row) => JSON.stringify(row)).join('\n') + '\n');
      res.writeHead(204);
      res.end();
    } catch (error) {
      console.error('[csp-observe-server] failed to record report:', error.message);
      res.writeHead(204);
      res.end();
    }
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD, POST' });
    res.end('Method Not Allowed');
    return;
  }

  let filePath = safeJoin(root, req.url || '/');
  if (!filePath) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  try {
    const stat = fs.existsSync(filePath) ? fs.statSync(filePath) : null;
    if (stat && stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    if (!fs.existsSync(filePath)) {
      filePath = path.join(root, '404.html');
      res.statusCode = 404;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.setHeader('Content-Type', contentTypes.get(ext) || 'application/octet-stream');
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
    res.end(error.message);
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`CSP observe server: http://127.0.0.1:${port}`);
  console.log(`Root: ${root}`);
  console.log(`Reports: ${reportFile}`);
});

if (import.meta.url === `file://${fileURLToPath(process.argv[1])}`) {
  process.on('SIGINT', () => server.close(() => process.exit(0)));
}
