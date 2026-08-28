import { describe, expect, it } from 'vitest';
import { DEFAULT_PLATFORM_LANDING } from '../types/landing-content';
import {
  absolutePageUrl,
  buildPageSeoMetadata,
  buildPlatformJsonLd,
  platformLandingSeo,
} from './marketing-metadata';

describe('absolutePageUrl', () => {
  it('joins origin and path without duplicate slashes', () => {
    expect(absolutePageUrl('https://barberly.mn/', '/')).toBe(
      'https://barberly.mn/',
    );
    expect(absolutePageUrl('https://barberly.mn', 'login')).toBe(
      'https://barberly.mn/login',
    );
  });
});

describe('buildPageSeoMetadata', () => {
  it('sets canonical, Open Graph, and Twitter tags', () => {
    const metadata = buildPageSeoMetadata({
      title: 'A site for every shop',
      description: 'Booking and QPay for salons.',
      origin: 'https://barberly.mn',
      locale: 'mn',
      siteName: 'Barberly',
    });

    expect(metadata.alternates).toEqual({ canonical: 'https://barberly.mn/' });
    expect(metadata.openGraph?.type).toBe('website');
    expect(metadata.openGraph?.locale).toBe('mn_MN');
    expect(metadata.twitter?.card).toBe('summary_large_image');
    expect(metadata.robots).toEqual({ index: true, follow: true });
  });
});

describe('platformLandingSeo', () => {
  it('uses the CMS hero copy for title and description', () => {
    const metadata = platformLandingSeo(
      DEFAULT_PLATFORM_LANDING,
      'https://barberly.mn',
      'mn',
      'Barberly',
    );
    expect(metadata.description).toBe(DEFAULT_PLATFORM_LANDING.heroSubtitle);
  });
});

describe('buildPlatformJsonLd', () => {
  it('emits Organization and SoftwareApplication nodes', () => {
    const json = buildPlatformJsonLd({
      origin: 'https://barberly.mn',
      siteName: 'Barberly',
      description: 'Salon SaaS',
      email: 'hello@barberly.mn',
    });
    const graph = json['@graph'] as Array<{ '@type': string }>;
    expect(graph.map((node) => node['@type'])).toEqual([
      'Organization',
      'SoftwareApplication',
      'WebSite',
    ]);
  });
});
