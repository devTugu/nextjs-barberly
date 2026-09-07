import { test, expect } from '@playwright/test';

test.describe('booking wizard', () => {
  test('services step loads on tenant host', async ({ page }) => {
    await page.goto('http://demo.localhost:3000/book');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page.getByPlaceholder(/search services|үйлчилгээ хайх/i),
    ).toBeVisible();
  });

  test('full booking flow with OTP bypass and simulated payment', async ({
    page,
  }) => {
    test.setTimeout(120_000);

    await page.goto('/book?tenant=demo');

    const serviceRow = page.locator('button').filter({ hasText: /₮|mnt/i }).first();
    await expect(serviceRow).toBeVisible({ timeout: 30_000 });
    await serviceRow.click();
    await page.getByRole('button', { name: /continue|үргэлжлүүлэх/i }).click();

    await expect(
      page.getByRole('heading', { name: /barber|үсчин/i }),
    ).toBeVisible({ timeout: 30_000 });
    await page.getByRole('button', { name: /continue|үргэлжлүүлэх/i }).click();

    await expect(
      page.getByRole('heading', { name: /date and time|цаг, огноо/i }),
    ).toBeVisible({ timeout: 30_000 });

    const slotButton = page
      .locator('button')
      .filter({ hasText: /^\d{1,2}:\d{2}/ })
      .first();
    await expect(slotButton).toBeVisible({ timeout: 30_000 });
    await slotButton.click();
    await page.getByRole('button', { name: /continue|үргэлжлүүлэх/i }).click();

    await expect(
      page.getByRole('heading', { name: /confirm|баталгаажуулах/i }),
    ).toBeVisible({ timeout: 30_000 });
    await page.getByRole('button', { name: /pay|төлбөр/i }).click();

    const otpHeading = page.getByRole('heading', { name: /verify phone|утас баталгаажуулах/i });
    if (await otpHeading.isVisible({ timeout: 8_000 }).catch(() => false)) {
      await page.getByPlaceholder(/phone/i).fill('99119911');
      const devBypass = page.getByRole('button', { name: /^dev$/i });
      if (await devBypass.isVisible()) {
        await devBypass.click();
      } else {
        await page.getByRole('button', { name: /send code|код илгээх/i }).click();
        await page.getByPlaceholder(/6-digit|code|код/i).fill('000000');
        await page.getByRole('button', { name: /verify|баталгаажуулах/i }).click();
      }
    }

    await expect(page.getByRole('heading', { name: /pay|төл/i })).toBeVisible({
      timeout: 30_000,
    });

    const payButton = page.getByRole('button', {
      name: /make payment|төлбөр хийх|simulate/i,
    });
    await expect(payButton).toBeVisible({ timeout: 30_000 });
    await payButton.click();

    await expect(page).toHaveURL(/\/book\/confirm\/\d+/, { timeout: 30_000 });
    await expect(
      page.getByRole('heading', { name: /successful|амжилттай|confirmed|баталгааж/i }),
    ).toBeVisible({ timeout: 30_000 });
  });
});
