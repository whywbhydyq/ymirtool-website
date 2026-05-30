'use strict';

function sanitizeReport(input) {
  const report = input && typeof input === 'object' ? input : {};
  const cspReport = report['csp-report'] || report.body || report;
  return {
    type: report.type || 'csp-violation',
    age: report.age,
    disposition: cspReport.disposition,
    effectiveDirective: cspReport['effective-directive'] || cspReport.effectiveDirective,
    violatedDirective: cspReport['violated-directive'] || cspReport.violatedDirective,
    blockedUri: String(cspReport['blocked-uri'] || cspReport.blockedURL || '').slice(0, 512),
    documentUri: String(cspReport['document-uri'] || cspReport.documentURL || cspReport.url || '').slice(0, 512),
    sourceFile: String(cspReport['source-file'] || cspReport.sourceFile || '').slice(0, 512),
    lineNumber: cspReport['line-number'] || cspReport.lineNumber,
    columnNumber: cspReport['column-number'] || cspReport.columnNumber,
    statusCode: cspReport['status-code'] || cspReport.statusCode,
    sample: String(cspReport['script-sample'] || cspReport.sample || '').slice(0, 160)
  };
}

exports.handler = async function cspReportHandler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: { Allow: 'POST, OPTIONS' }, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { Allow: 'POST, OPTIONS' }, body: 'Method Not Allowed' };
  }

  try {
    if (event.body) {
      const parsed = JSON.parse(event.body);
      const reports = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of reports) {
        console.warn('[csp-report]', JSON.stringify(sanitizeReport(item)));
      }
    }
  } catch (error) {
    console.warn('[csp-report] invalid report', error && error.message ? error.message : String(error));
  }

  return { statusCode: 204, body: '' };
};
