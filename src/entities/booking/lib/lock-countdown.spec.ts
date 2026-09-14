import { describe, expect, it } from 'vitest';
import { computeLockCountdown } from './lock-countdown';

describe('computeLockCountdown', () => {
  it('formats remaining time as m:ss', () => {
    const now = Date.parse('2026-01-01T12:00:00.000Z');
    const expires = '2026-01-01T12:02:05.000Z';
    expect(computeLockCountdown(expires, now)).toEqual({
      expired: false,
      remainingMs: 125_000,
      label: '2:05',
    });
  });

  it('marks expired locks', () => {
    const now = Date.parse('2026-01-01T12:00:00.000Z');
    const expires = '2026-01-01T11:59:59.000Z';
    expect(computeLockCountdown(expires, now)).toEqual({
      expired: true,
      remainingMs: 0,
      label: '0:00',
    });
  });
});
