import { test, expect } from '@playwright/test';

test.describe('Public site', () => {
  test('platform home has hero, partners, stories, pricing, and contact', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('header a[href="/"]').first()).toBeVisible();
    await expect(page.locator('#partners')).toBeVisible();
    await expect(page.locator('#testimonials')).toBeVisible();
    await expect(page.locator('#pricing')).toBeVisible();
    await expect(page.locator('#contact')).toBeVisible();
  });

  test('header shows brand site name link to home', async ({ page }) => {
    await page.goto('/');
    const homeBrandLink = page.locator('header a[href="/"]').first();
    await expect(homeBrandLink).toBeVisible();
    await expect(homeBrandLink).not.toBeEmpty();
  });
});
