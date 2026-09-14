import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearBookingDraft,
  readBookingDraft,
  sanitizeBookingDraft,
  writeBookingDraft,
} from './booking-session';

describe('booking-session', () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    });
  });

  it('strips payment/QR secrets when sanitizing drafts', () => {
    const sanitized = sanitizeBookingDraft({
      serviceIds: [1],
      payment: {
        paymentId: 9,
        invoiceId: 'inv',
        amount: 1000,
        qrText: 'secret-qr',
        qrImage: 'data:image/png;base64,abc',
        urls: [{ name: 'bank', link: 'https://x', description: '' }],
      },
      phone: '99112233',
    });
    expect(sanitized.serviceIds).toEqual([1]);
    expect(sanitized.phone).toBe('99112233');
    expect(sanitized).not.toHaveProperty('payment');
  });

  it('never persists payment fields to sessionStorage', () => {
    writeBookingDraft({
      serviceIds: [2],
      // @ts-expect-error legacy callers may still pass payment
      payment: {
        paymentId: 1,
        invoiceId: 'inv',
        amount: 500,
        qrText: 'qr',
        qrImage: null,
        urls: [],
      },
    });
    const raw = sessionStorage.getItem('barberly.booking.draft');
    expect(raw).toBeTruthy();
    expect(raw!).not.toContain('qrText');
    expect(raw!).not.toContain('payment');
    expect(readBookingDraft().serviceIds).toEqual([2]);
  });

  it('clears draft storage', () => {
    writeBookingDraft({ phone: '111' });
    clearBookingDraft();
    expect(readBookingDraft().phone).toBe('');
  });
});
