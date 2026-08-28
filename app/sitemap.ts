import type { MetadataRoute } from 'next';
import { configuredSiteOrigin } from '@/shared/lib/tenant-url';

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = configuredSiteOrigin();
  return [
    {
      url: `${origin}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
