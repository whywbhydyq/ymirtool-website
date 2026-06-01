import { test, expect } from '@playwright/test';

const pages = [
  { path: '/json/', selector: '#json-src' },
  { path: '/runjs/', selector: '#content' },
  { path: '/urlcode/', selector: 'textarea,input' },
  { path: '/morse/', selector: 'textarea,input' },
  { path: '/subnetmask/', selector: 'input' },
  { path: '/calculator/', selector: '#calcInput' },
  { path: '/refresh/', selector: '#frequency' },
  { path: '/worldtime/', selector: 'form[name="clock"]' },
  { path: '/editor/', selector: '#content' },
  { path: '/formatfilter/', selector: '#content' },
  { path: '/formatjava/', selector: '#code' },
  { path: '/tuya/', selector: '#canvas' },
  { path: '/hexrgb/', selector: '#hexInp' }
];

test.describe('legacy browser smoke checks', () => {
  for (const item of pages) {
    test(`${item.path} loads core input`, async ({ page }) => {
      await page.goto(item.path);
      await expect(page.locator(item.selector).first()).toBeVisible();
    });
  }



  test('Calculator evaluates without eval-like runtime compilation', async ({ page }) => {
    await page.goto('/calculator/');
    await page.locator('#calcInput').fill('(128 + 256) / 3');
    await page.locator('[data-action="calc-run"]').click();
    await expect(page.locator('#calcResult')).toHaveValue('128');
  });

  test('RunJS preview stays sandboxed', async ({ page }) => {
    await page.goto('/runjs/');
    await page.locator('#content').fill('<script>document.body.textContent="sandboxed"</script>');
    await page.locator('input[value="调试预览"]').click();
    await expect(page.locator('#ymir-runjs-preview')).toHaveAttribute('sandbox', /allow-scripts/);
  });

  test('Format filter works without jQuery 1.7.1', async ({ page }) => {
    await page.goto('/formatfilter/');
    await expect(page.locator('script[src*="jquery-1.7.1"]')).toHaveCount(0);
    await page.locator('#content').fill('<style>.x{}</style><script>bad()</script><b>Hello</b>');
    await page.locator('input[name="type"][value="0"]').check();
    await page.locator('input[name="type"][value="1"]').check();
    await page.locator('input[name="type"][value="2"]').check();
    await page.locator('input[value="快速过滤"]').click();
    await expect(page.locator('#result')).toContainText('Hello');
  });

  test('CodeMirror formatter initializes without unused unpacker helpers', async ({ page }) => {
    await page.goto('/formatjava/');
    await expect(page.locator('script[src*="sanitytest.js"]')).toHaveCount(0);
    await expect(page.locator('script[src*="p_a_c_k_e_r_unpacker.js"]')).toHaveCount(0);
    await expect(page.locator('.CodeMirror').first()).toBeVisible();
  });

  test('Tuya drawing page is canvas-only without Zepto', async ({ page }) => {
    await page.goto('/tuya/');
    await expect(page.locator('script[src*="zepto.min.js"]')).toHaveCount(0);
    await expect(page.locator('#canvas')).toBeVisible();
  });

  test('Hex RGB page uses stylesheet swatches instead of inline background styles', async ({ page }) => {
    await page.goto('/hexrgb/');
    await expect(page.locator('link[href="/static/style/page-hexrgb.css"]')).toHaveCount(1);
    await expect(page.locator('td.hexrgb-color-swatch').first()).toBeVisible();
  });

});
