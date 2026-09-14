import { describe, expect, it } from 'vitest';
import {
  isPublicBffPathAllowed,
  PUBLIC_BFF_ROUTE_DEFINITIONS,
} from './public-bff-allowlist';
import { QPAY_SIMULATE_PUBLIC_PATH } from './qpay-simulate';

describe('public-bff-allowlist', () => {
  it('does not list qpay simulate on the static allowlist', () => {
    expect(
      PUBLIC_BFF_ROUTE_DEFINITIONS.some(
        (route) => route.path === QPAY_SIMULATE_PUBLIC_PATH,
      ),
    ).toBe(false);
  });

  it('allows known public booking money routes', () => {
    expect(isPublicBffPathAllowed('/public/bookings/lock', 'POST')).toBe(true);
    expect(isPublicBffPathAllowed('/public/bookings/12/pay', 'POST')).toBe(true);
    expect(isPublicBffPathAllowed('/public/bookings/12', 'GET')).toBe(true);
    expect(isPublicBffPathAllowed('/public/available-slots', 'GET')).toBe(true);
  });

  it('blocks qpay simulate in production by default', () => {
    expect(
      isPublicBffPathAllowed(QPAY_SIMULATE_PUBLIC_PATH, 'POST', {
        NODE_ENV: 'production',
      }),
    ).toBe(false);
  });

  it('allows qpay simulate in production when explicitly enabled', () => {
    expect(
      isPublicBffPathAllowed(QPAY_SIMULATE_PUBLIC_PATH, 'POST', {
        NODE_ENV: 'production',
        NEXT_PUBLIC_QPAY_SIMULATE_ENABLED: 'true',
      }),
    ).toBe(true);
  });

  it('allows qpay simulate in development by default', () => {
    expect(
      isPublicBffPathAllowed(QPAY_SIMULATE_PUBLIC_PATH, 'POST', {
        NODE_ENV: 'development',
      }),
    ).toBe(true);
  });

  it('rejects unknown public paths', () => {
    expect(isPublicBffPathAllowed('/public/secret', 'GET')).toBe(false);
  });
});
