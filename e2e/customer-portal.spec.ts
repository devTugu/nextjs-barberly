import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { loginAsCustomer } from './helpers/customer-auth';

const bookingDraft = {
  serviceIds: [1],
  totalDurationMinutes: 30,
  date: '2030-01-15',
  selectedSlot: {
    startAtUtc: '2030-01-15T04:00:00.000Z',
    staffId: 1,
  },
  booking: {
    id: 1,
    status: 'pending_payment',
    totalPrice: 25000,
    startAtUtc: '2030-01-15T04:00:00.000Z',
    lockExpiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
    services: [
      {
        serviceId: 1,
        serviceName: 'Haircut',
        durationMinutes: 30,
        price: 25000,
      },
    ],
  },
  phone: '99119911',
  payment: {
    paymentId: 1,
    invoiceId: 'test-invoice',
    amount: 25000,
    qrText: 'qpay-test',
    qrImage: null,
    urls: [],
  },
};

test.describe('Customer portal', () => {
  test('unauthenticated user dashboard redirects to home', async ({ page }) => {
    await page.goto('/user/dashboard?tenant=demo');
    await expect(page).toHaveURL(/\/(\?|$)/);
  });

  test('login page renders OTP form', async ({ page }) => {
    await page.goto('/user/login?tenant=demo');
    await expect(page.getByLabel(/phone/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /send/i })).toBeVisible();
  });

  test('login page passes axe scan', async ({ page }) => {
    await page.goto('/user/login?tenant=demo');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('book landing passes axe scan', async ({ page }) => {
    await page.goto('/book?tenant=demo');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('book pay page passes axe scan', async ({ page }) => {
    await page.addInitScript((draft) => {
      sessionStorage.setItem('barberly.booking.draft', JSON.stringify(draft));
    }, bookingDraft);
    await page.goto('/book/pay?tenant=demo');
    await expect(page.getByRole('heading', { name: /pay|төл/i })).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('cancel preview page loads for confirmed booking', async ({ page }) => {
    await loginAsCustomer(page);
    const upcoming = page.getByRole('link', { name: /#/ }).first();
    if ((await upcoming.count()) === 0) {
      test.skip();
    }
    await upcoming.click();
    await page.getByRole('link', { name: /cancel|цуцлах/i }).click();
    await expect(page.getByRole('heading', { name: /cancel|цуцлах/i })).toBeVisible();
    await expect(page.getByText(/refund|буцаалт|policy|бодлого/i)).toBeVisible();
  });

  test('reschedule page loads date picker', async ({ page }) => {
    await loginAsCustomer(page);
    const upcoming = page.getByRole('link', { name: /#/ }).first();
    if ((await upcoming.count()) === 0) {
      test.skip();
    }
    await upcoming.click();
    await page.getByRole('link', { name: /reschedule|цаг солих/i }).click();
    await expect(
      page.getByRole('heading', { name: /reschedule|цаг солих/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/date|огноо/i)).toBeVisible();
  });
});
