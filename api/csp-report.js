'use strict';

const MAX_BODY_BYTES = 64 * 1024;

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

function sanitizeReport(input) {
  const report = input && typeof input === 'object' ? input : {};
  const cspReport = report['csp-report'] || report.body || report;
  const blockedUri = String(cspReport['blocked-uri'] || cspReport.blockedURL || cspReport.blockedURL || '');
  const documentUri = String(cspReport['document-uri'] || cspReport.documentURL || cspReport.url || '');
  const sourceFile = String(cspReport['source-file'] || cspReport.sourceFile || '');
  return {
    type: report.type || 'csp-violation',
    age: report.age,
    disposition: cspReport.disposition,
    effectiveDirective: cspReport['effective-directive'] || cspReport.effectiveDirective,
    violatedDirective: cspReport['violated-directive'] || cspReport.violatedDirective,
    blockedUri: blockedUri.slice(0, 512),
    documentUri: documentUri.slice(0, 512),
    sourceFile: sourceFile.slice(0, 512),
    lineNumber: cspReport['line-number'] || cspReport.lineNumber,
    columnNumber: cspReport['column-number'] || cspReport.columnNumber,
    statusCode: cspReport['status-code'] || cspReport.statusCode,
    sample: String(cspReport['script-sample'] || cspReport.sample || '').slice(0, 160)
  };
}

async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Allow', 'POST, OPTIONS');
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST, OPTIONS');
    res.end('Method Not Allowed');
    return;
  }

  try {
    const rawBody = typeof req.body === 'string'
      ? req.body
      : req.body && typeof req.body === 'object'
        ? JSON.stringify(req.body)
        : await readBody(req);

    if (rawBody) {
      const parsed = JSON.parse(rawBody);
      const reports = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of reports) {
        console.warn('[csp-report]', JSON.stringify(sanitizeReport(item)));
      }
    }

    res.statusCode = 204;
    res.end();
  } catch (error) {
    console.warn('[csp-report] invalid report', error && error.message ? error.message : String(error));
    res.statusCode = 204;
    res.end();
  }
}

module.exports = handler;
