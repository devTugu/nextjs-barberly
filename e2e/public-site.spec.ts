import { test, expect } from '@playwright/test';

test.describe('Public site', () => {
  test('platform home has a hero and shop directory', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('header a[href="/"]').first()).toBeVisible();
    await expect(page.locator('#shops')).toBeVisible();
  });

  test('header shows brand site name link to home', async ({ page }) => {
    await page.goto('/');
    const homeBrandLink = page.locator('header a[href="/"]').first();
    await expect(homeBrandLink).toBeVisible();
    await expect(homeBrandLink).not.toBeEmpty();
  });
});
