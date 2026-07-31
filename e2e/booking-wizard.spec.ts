import { test, expect } from '@playwright/test';

function tomorrowIsoDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

test.describe('booking wizard', () => {
  test('services step loads on tenant host', async ({ page }) => {
    await page.goto('http://demo.localhost:3000/book');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByLabel(/date/i)).toBeVisible();
  });

  test('full booking flow with OTP bypass and simulated payment', async ({
    page,
  }) => {
    test.setTimeout(120_000);

    await page.goto('/book?tenant=demo');

    const serviceCheckbox = page.locator('label').filter({ has: page.locator('[role="checkbox"]') }).first();
    await expect(serviceCheckbox).toBeVisible({ timeout: 30_000 });
    await serviceCheckbox.click();

    await page.getByLabel(/date/i).fill(tomorrowIsoDate());
    await page.getByRole('button', { name: /next|pick a time/i }).click();

    await expect(page.getByRole('heading', { name: /pick a time/i })).toBeVisible({
      timeout: 30_000,
    });

    const slotButton = page
      .locator('button')
      .filter({ hasNotText: /back|reserve/i })
      .first();
    await expect(slotButton).toBeVisible({ timeout: 30_000 });
    await slotButton.click();

    await page.getByRole('button', { name: /reserve/i }).click();

    await expect(page.getByRole('heading', { name: /verify phone/i })).toBeVisible({
      timeout: 30_000,
    });

    await page.getByPlaceholder(/phone/i).fill('99119911');

    const devBypass = page.getByRole('button', { name: /^dev$/i });
    if (await devBypass.isVisible()) {
      await devBypass.click();
    } else {
      await page.getByRole('button', { name: /send code/i }).click();
      await page.getByPlaceholder(/6-digit|code/i).fill('000000');
      await page.getByRole('button', { name: /verify/i }).click();
    }

    await expect(page.getByRole('heading', { name: /pay/i })).toBeVisible({
      timeout: 30_000,
    });

    const simulateButton = page.getByRole('button', {
      name: /simulate payment/i,
    });
    await expect(simulateButton).toBeVisible({ timeout: 30_000 });
    await simulateButton.click();

    await expect(page).toHaveURL(/\/book\/confirm\/\d+/, { timeout: 30_000 });
    await expect(
      page.getByRole('heading', { name: /booking confirmed/i }),
    ).toBeVisible({ timeout: 30_000 });
  });
});
