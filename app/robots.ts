import type { MetadataRoute } from 'next';
import { configuredSiteOrigin } from '@/shared/lib/tenant-url';

export default function robots(): MetadataRoute.Robots {
  const origin = configuredSiteOrigin();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/user', '/api/', '/dashboard'],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
  };
}
