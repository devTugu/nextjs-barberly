import { describe, expect, it, vi } from 'vitest';
import {
  resolveOtpDevHint,
  sendBookingOtpUseCase,
  verifyBookingOtpUseCase,
} from './otp-use-case';

describe('otp-use-case', () => {
  it('sends OTP and returns payload', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { devCode: '123456' } }),
    });
    const headersFn = vi.fn().mockResolvedValue({ 'x-csrf': 't' });

    const result = await sendBookingOtpUseCase('demo', '+97699112233', {
      fetchFn,
      headersFn,
    });

    expect(result).toEqual({ devCode: '123456' });
    expect(fetchFn).toHaveBeenCalledWith(
      '/api/customer-auth/otp/send?tenant=demo',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ phone: '+97699112233' }),
      }),
    );
  });

  it('verifies OTP with booking id', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    const headersFn = vi.fn().mockResolvedValue({});

    await verifyBookingOtpUseCase(
      'demo',
      { phone: '+976', code: '1111', bookingId: 42 },
      { fetchFn, headersFn },
    );

    expect(fetchFn).toHaveBeenCalledWith(
      '/api/customer-auth/otp/verify?tenant=demo',
      expect.objectContaining({
        body: JSON.stringify({
          phone: '+976',
          code: '1111',
          bookingId: 42,
        }),
      }),
    );
  });

  it('resolves dev hint preference', () => {
    expect(resolveOtpDevHint({ devCode: 'a', devBypassCode: 'b' })).toBe('a');
    expect(resolveOtpDevHint({ devBypassCode: 'b' })).toBe('b');
    expect(resolveOtpDevHint({})).toBeNull();
  });
});
