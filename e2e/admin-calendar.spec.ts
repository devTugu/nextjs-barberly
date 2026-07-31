import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { loginAsAdmin } from './helpers/auth';

test.describe('Admin calendar', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/calendar');
  });

  test('shows day view and navigates dates', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.getByRole('tab', { name: /week/i }).click();
    await page.getByRole('tab', { name: /day/i }).click();
    await page.getByRole('button').filter({ has: page.locator('svg') }).first().click();
  });

  test('passes axe accessibility scan', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
