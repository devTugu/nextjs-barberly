import { describe, expect, it } from 'vitest';
import { isQpaySimulateAllowed } from './qpay-simulate';

describe('isQpaySimulateAllowed', () => {
  it('allows simulate outside production by default', () => {
    expect(isQpaySimulateAllowed({ NODE_ENV: 'development' })).toBe(true);
    expect(isQpaySimulateAllowed({ NODE_ENV: 'test' })).toBe(true);
  });

  it('blocks simulate in production unless explicitly enabled', () => {
    expect(isQpaySimulateAllowed({ NODE_ENV: 'production' })).toBe(false);
    expect(
      isQpaySimulateAllowed({
        NODE_ENV: 'production',
        NEXT_PUBLIC_QPAY_SIMULATE_ENABLED: 'false',
      }),
    ).toBe(false);
  });

  it('allows simulate in production when explicitly enabled', () => {
    expect(
      isQpaySimulateAllowed({
        NODE_ENV: 'production',
        NEXT_PUBLIC_QPAY_SIMULATE_ENABLED: 'true',
      }),
    ).toBe(true);
  });

  it('respects explicit false even outside production', () => {
    expect(
      isQpaySimulateAllowed({
        NODE_ENV: 'development',
        NEXT_PUBLIC_QPAY_SIMULATE_ENABLED: 'false',
      }),
    ).toBe(false);
  });
});
