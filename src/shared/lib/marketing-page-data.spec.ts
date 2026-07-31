import { describe, expect, it } from 'vitest';
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
