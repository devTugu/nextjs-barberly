import { describe, expect, it } from 'vitest';
import { DEFAULT_PLATFORM_LANDING } from '../types/landing-content';
import { resolvePlatformLoginUrl } from './marketing-page-data';

describe('resolvePlatformLoginUrl', () => {
  it('uses relative login on platform host', () => {
    expect(resolvePlatformLoginUrl('platform.barberly.mn')).toBe('/login');
    expect(resolvePlatformLoginUrl('platform.localhost:3000')).toBe('/login');
  });

  it('uses absolute platform login on tenant host', () => {
    const url = resolvePlatformLoginUrl('baihku.barberly.mn');
    expect(url).toContain('platform.');
    expect(url).toContain('/login');
  });
});

describe('DEFAULT_PLATFORM_LANDING', () => {
  it('includes partner, story, price, and contact sections', () => {
    expect(DEFAULT_PLATFORM_LANDING.testimonials).toHaveLength(3);
    expect(DEFAULT_PLATFORM_LANDING.plans).toHaveLength(3);
    expect(DEFAULT_PLATFORM_LANDING.contact.email).toContain('@');
    expect(DEFAULT_PLATFORM_LANDING.partnersTitle.length).toBeGreaterThan(0);
  });
});
