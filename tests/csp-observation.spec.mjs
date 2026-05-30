import { test, expect } from '@playwright/test';

const cspPages = [
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
];

test.describe('CSP report-only observation', () => {
  for (const route of cspPages) {
    test(`${route} has no local securitypolicyviolation events`, async ({ page }) => {
      const violations = [];
      const consoleErrors = [];

      page.on('console', (message) => {
        if (message.type() === 'error') {
          consoleErrors.push(message.text());
        }
      });

      page.on('pageerror', (error) => {
        consoleErrors.push(error.message);
      });

      await page.addInitScript(() => {
        window.__ymirCspViolations = [];
        document.addEventListener('securitypolicyviolation', (event) => {
          window.__ymirCspViolations.push({
            blockedURI: event.blockedURI,
            documentURI: event.documentURI,
            effectiveDirective: event.effectiveDirective,
            violatedDirective: event.violatedDirective,
            disposition: event.disposition,
            sourceFile: event.sourceFile,
            lineNumber: event.lineNumber,
            columnNumber: event.columnNumber,
            sample: event.sample
          });
        });
      });

      await page.goto(route, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      violations.push(...await page.evaluate(() => window.__ymirCspViolations || []));

      expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
      expect(consoleErrors, JSON.stringify(consoleErrors, null, 2)).toEqual([]);
    });
  }
});
