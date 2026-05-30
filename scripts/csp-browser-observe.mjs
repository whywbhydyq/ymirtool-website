import fs from 'node:fs';

const baseUrl = (process.env.YMIR_CSP_OBSERVE_BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const outputFile = process.env.YMIR_CSP_OBSERVE_OUTPUT || 'csp-browser-violations.json';
const paths = (process.env.YMIR_CSP_OBSERVE_PATHS || [
  '/',
  '/calculator/',
  '/json/',
  '/runjs/',
  '/urlcode/',
  '/morse/',
  '/subnetmask/',
  '/editor/',
  '/formatjava/',
  '/tuya/',
  '/htmltable/',
  '/barcode/',
  '/worldtime/'
].join(',')).split(',').map((item) => item.trim()).filter(Boolean);

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch (error) {
  console.error('Playwright is required for browser CSP observation. Install it locally, then rerun this script.');
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const route of paths) {
    const page = await browser.newPage();
    const pageResult = { path: route, url: `${baseUrl}${route}`, consoleErrors: [], cspViolations: [] };

    page.on('console', (message) => {
      if (message.type() === 'error') {
        pageResult.consoleErrors.push(message.text());
      }
    });

    page.on('pageerror', (error) => {
      pageResult.consoleErrors.push(error.message);
    });

    await page.addInitScript(() => {
      window.__ymirCspViolations = [];
      document.addEventListener('securitypolicyviolation', (event) => {
        window.__ymirCspViolations.push({
          blockedURI: event.blockedURI,
          documentURI: event.documentURI,
          effectiveDirective: event.effectiveDirective,
          violatedDirective: event.violatedDirective,
          originalPolicy: event.originalPolicy,
          disposition: event.disposition,
          sourceFile: event.sourceFile,
          lineNumber: event.lineNumber,
          columnNumber: event.columnNumber,
          sample: event.sample
        });
      });
    });

    await page.goto(pageResult.url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    pageResult.cspViolations = await page.evaluate(() => window.__ymirCspViolations || []);
    results.push(pageResult);
    await page.close();
  }
} finally {
  await browser.close();
}

fs.writeFileSync(outputFile, JSON.stringify({ baseUrl, generatedAt: new Date().toISOString(), results }, null, 2));

const violationCount = results.reduce((sum, item) => sum + item.cspViolations.length, 0);
const errorCount = results.reduce((sum, item) => sum + item.consoleErrors.length, 0);
console.log(`Wrote ${outputFile}`);
console.log(`CSP violations: ${violationCount}`);
console.log(`Console/page errors: ${errorCount}`);
process.exit(violationCount || errorCount ? 1 : 0);
