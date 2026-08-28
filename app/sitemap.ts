import type { MetadataRoute } from 'next';
import { loadPublicShopSitemapEntries } from '@/entities/tenant';
import { configuredSiteOrigin, tenantSiteUrlForHost } from '@/shared/lib/tenant-url';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = configuredSiteOrigin();
  const host = new URL(origin).host;
  const shops = await loadPublicShopSitemapEntries();

  return [
    {
      url: `${origin}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...shops.map((shop) => ({
      url: tenantSiteUrlForHost(host, shop.subdomain),
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
