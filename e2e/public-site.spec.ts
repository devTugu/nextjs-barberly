import { test, expect } from '@playwright/test';

test.describe('Public site', () => {
  test('platform home has hero, partners, stories, pricing, and contact', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('header a[href="/"]').first()).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('#product')).toBeVisible();
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

  test('platform home exposes SEO tags and has no page errors', async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    await page.goto('/');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      /.*/,
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /https?:\/\//,
    );
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
    expect(pageErrors).toEqual([]);
  });
});
