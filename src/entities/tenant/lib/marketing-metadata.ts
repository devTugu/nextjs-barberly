import type { Metadata } from 'next';
import type { PlatformLandingContent } from '../types/landing-content';

const OG_LOCALE: Record<string, string> = {
  mn: 'mn_MN',
  en: 'en_US',
};

interface PageSeoInput {
  title: string;
  description: string;
  origin: string;
  path?: string;
  locale: string;
  siteName: string;
  imageUrl?: string | null;
}

export function documentTitle(title: string, siteName: string): string {
  if (!title || title === siteName) return siteName;
  return `${title} · ${siteName}`;
}

export function absolutePageUrl(origin: string, path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${origin.replace(/\/$/, '')}${normalized === '/' ? '/' : normalized}`;
}

export function buildPageSeoMetadata({
  title,
  description,
  origin,
  path = '/',
  locale,
  siteName,
  imageUrl,
}: PageSeoInput): Metadata {
  const url = absolutePageUrl(origin, path);
  const openGraphLocale = OG_LOCALE[locale] ?? 'mn_MN';
  const absoluteTitle = documentTitle(title, siteName);

  return {
    metadataBase: new URL(origin),
    title: { absolute: absoluteTitle },
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: openGraphLocale,
      url,
      siteName,
      title,
      description,
      ...(imageUrl ? { images: [{ url: imageUrl }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}

export function buildPlatformJsonLd(input: {
  origin: string;
  siteName: string;
  description: string;
  email: string;
}): Record<string, unknown> {
  const url = absolutePageUrl(input.origin);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: input.siteName,
        url,
        email: input.email,
      },
      {
        '@type': 'SoftwareApplication',
        name: input.siteName,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url,
        description: input.description,
        offers: {
          '@type': 'Offer',
          availability: 'https://schema.org/InStock',
          priceCurrency: 'MNT',
        },
      },
      {
        '@type': 'WebSite',
        name: input.siteName,
        url,
        inLanguage: ['mn', 'en'],
      },
    ],
  };
}

export function platformLandingSeo(
  content: PlatformLandingContent,
  origin: string,
  locale: string,
  siteName: string,
): Metadata {
  return buildPageSeoMetadata({
    title: content.heroTitle,
    description: content.heroSubtitle,
    origin,
    locale,
    siteName,
  });
}

export function tenantLandingSeo(input: {
  name: string;
  tagline?: string | null;
  about?: string | null;
  origin: string;
  locale: string;
  imageUrl?: string | null;
}): Metadata {
  const description = input.about ?? input.tagline ?? 'Barbershop booking';
  const title = input.tagline ?? input.about ?? input.name;
  return buildPageSeoMetadata({
    title,
    description,
    origin: input.origin,
    locale: input.locale,
    siteName: input.name,
    imageUrl: input.imageUrl,
  });
}
