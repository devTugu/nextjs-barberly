import { describe, expect, it } from 'vitest';
import { DEFAULT_PLATFORM_LANDING } from '../types/landing-content';
import {
  absolutePageUrl,
  buildPageSeoMetadata,
  buildPlatformJsonLd,
  documentTitle,
  platformLandingSeo,
  tenantLandingSeo,
} from './marketing-metadata';
import { buildTenantJsonLd } from './tenant-json-ld';

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

describe('documentTitle', () => {
  it('does not duplicate the shop name', () => {
    expect(documentTitle('Atelier', 'Atelier')).toBe('Atelier');
    expect(documentTitle('Precision cuts', 'Atelier')).toBe(
      'Precision cuts · Atelier',
    );
  });
});

describe('tenantLandingSeo', () => {
  it('uses the tagline in the title and the about text as description', () => {
    const metadata = tenantLandingSeo({
      name: 'Atelier',
      tagline: 'Precision cuts',
      about: 'A modern barbershop in Ulaanbaatar.',
      origin: 'https://atelier.barberly.mn',
      locale: 'mn',
      imageUrl: 'https://cdn.example/banner.jpg',
    });
    expect(metadata.title).toEqual({ absolute: 'Precision cuts · Atelier' });
    expect(metadata.description).toBe('A modern barbershop in Ulaanbaatar.');
    expect(metadata.openGraph?.images).toEqual([
      { url: 'https://cdn.example/banner.jpg' },
    ]);
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

describe('buildTenantJsonLd', () => {
  it('emits HairSalon NAP and opening hours', () => {
    const json = buildTenantJsonLd({
      origin: 'https://atelier.barberly.mn',
      name: 'Atelier',
      description: 'Cuts',
      telephone: '99112233',
      address: 'UB',
      image: 'https://cdn.example/banner.jpg',
      scheduleDays: [
        {
          dayOfWeek: 1,
          closed: false,
          blocks: [{ startTime: '09:00:00', endTime: '18:00:00' }],
        },
      ],
    });
    expect(json['@type']).toBe('HairSalon');
    expect(json.telephone).toBe('99112233');
    const hours = json.openingHoursSpecification as Array<{ opens: string }>;
    expect(hours[0]?.opens).toBe('09:00');
  });
});
