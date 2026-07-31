import { test, expect } from '@playwright/test';

/**
 * A4 cookie smoke (ADR-019).
 * Dev default is host-only cookies; shared Domain requires CUSTOMER_COOKIE_DOMAIN.
 */
test.describe('customer cookie domain smoke', () => {
  test('host-only session cookie is readable on the current subdomain', async ({
    context,
    page,
  }) => {
    await context.addCookies([
      {
        name: 'customerSession',
        value: '1',
        domain: 'demo.localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    await page.goto('http://demo.localhost:3000/');
    const onDemo = await page.evaluate(() => document.cookie);
    test.info().annotations.push({
      type: 'cookie-smoke',
      description: `demo.localhost cookies: ${onDemo}`,
    });
    expect(onDemo.includes('customerSession=1')).toBeTruthy();
  });
});
