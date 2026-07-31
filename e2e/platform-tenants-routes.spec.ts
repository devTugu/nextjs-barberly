import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Platform tenant routes', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('tenants new page loads', async ({ page }) => {
    await page.goto('/tenants/new');
    await expect(page.getByRole('button', { name: /create|save/i })).toBeVisible();
  });

  test('tenants list links to detail', async ({ page }) => {
    await page.goto('/tenants');
    const firstRow = page.getByRole('row').nth(1);
    if (await firstRow.count()) {
      await firstRow.click();
      await expect(page).toHaveURL(/\/tenants\/\d+/);
    }
  });

  test('tenant edit saves policy fields', async ({ page }) => {
    await page.goto('/tenants');
    const firstRow = page.getByRole('row').nth(1);
    if ((await firstRow.count()) === 0) {
      test.skip();
    }
    await firstRow.click();
    await expect(page).toHaveURL(/\/tenants\/\d+/);

    const tenantId = page.url().match(/\/tenants\/(\d+)/)?.[1];
    if (!tenantId) {
      test.skip();
    }

    await page.goto(`/tenants/${tenantId}/edit`);
    const cancelInput = page.getByLabel(/cancel window|цуцлах цонх/i);
    const rescheduleInput = page.getByLabel(/reschedule window|цаг солих цонх/i);
    await cancelInput.fill('36');
    await rescheduleInput.fill('18');
    await page.getByRole('button', { name: /save|хадгал/i }).click();
    await expect(page).toHaveURL(new RegExp(`/tenants/${tenantId}$`));
    await expect(page.getByText('36')).toBeVisible();
    await expect(page.getByText('18')).toBeVisible();
  });
});
