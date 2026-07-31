import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Admin settings', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('settings hub links to branding and policy', async ({ page }) => {
    await page.goto('/admin/settings');
    await expect(page.getByRole('link', { name: /branding/i })).toBeVisible();
    await page.getByRole('link', { name: /policies/i }).click();
    await expect(page).toHaveURL(/\/admin\/settings\/policy/);
  });

  test('branding page loads form', async ({ page }) => {
    await page.goto('/admin/settings/branding');
    await expect(page.getByRole('button', { name: /save/i })).toBeVisible();
  });
});
