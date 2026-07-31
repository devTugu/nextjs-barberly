import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Admin schedule', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/schedule');
  });

  test('schedule hub loads with weekly tab', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /weekly|долоо хоног/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /save/i })).toBeVisible();
  });

  test('exceptions redirect shows day exceptions tab', async ({ page }) => {
    await page.goto('/admin/schedule/exceptions');
    await expect(page).toHaveURL(/\/admin\/schedule/);
    await expect(
      page.getByRole('tab', { name: /exception|онцгой/i }),
    ).toBeVisible();
  });

  test('setup wizard page loads', async ({ page }) => {
    await page.goto('/admin/schedule/setup');
    await expect(page.getByRole('button', { name: /next|дараах/i })).toBeVisible();
  });
});
