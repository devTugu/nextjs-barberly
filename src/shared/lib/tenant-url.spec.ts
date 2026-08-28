import { describe, expect, it } from 'vitest';
import { requestOrigin, tenantSiteUrlForHost } from './tenant-url';

describe('tenantSiteUrlForHost', () => {
  it('maps localhost platform host to the tenant subdomain', () => {
    expect(tenantSiteUrlForHost('platform.localhost:3000', 'atelier', '/')).toBe(
      'http://atelier.localhost:3000/',
    );
  });

  it('maps production platform host to https tenant sites', () => {
    expect(tenantSiteUrlForHost('platform.barberly.mn', 'atelier', '/book')).toBe(
      'https://atelier.barberly.mn/book',
    );
  });

  it('maps the apex domain to tenant subdomains', () => {
    expect(tenantSiteUrlForHost('barberly.mn', 'demo')).toBe(
      'https://demo.barberly.mn/',
    );
  });
});

describe('requestOrigin', () => {
  it('uses http for localhost and https for production hosts', () => {
    expect(requestOrigin('localhost:3000')).toBe('http://localhost:3000');
    expect(requestOrigin('platform.localhost:3000')).toBe(
      'http://platform.localhost:3000',
    );
    expect(requestOrigin('barberly.mn')).toBe('https://barberly.mn');
  });
});
