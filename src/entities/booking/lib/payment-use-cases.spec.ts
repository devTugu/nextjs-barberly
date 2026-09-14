import { beforeEach, describe, expect, it, vi } from 'vitest';

const publicGet = vi.fn();
const publicPost = vi.fn();

vi.mock('@/shared/lib/public-api', () => ({
  publicGet: (...args: unknown[]) => publicGet(...args),
  publicPost: (...args: unknown[]) => publicPost(...args),
}));

import {
  pollBalanceClearedUseCase,
  pollDepositConfirmationUseCase,
  simulateQpayPaymentUseCase,
  startBalancePaymentUseCase,
  startDepositPaymentUseCase,
} from './payment-use-cases';

describe('payment-use-cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts deposit payment and fills missing amount from total', async () => {
    publicPost.mockResolvedValueOnce({
      paymentId: 1,
      invoiceId: 'inv-1',
      amount: undefined,
      qrText: 'qr',
      qrImage: null,
      urls: [],
    });

    const result = await startDepositPaymentUseCase('demo', 9, 25000);
    expect(publicPost).toHaveBeenCalledWith('/bookings/9/pay', 'demo', {
      kind: 'deposit',
    });
    expect(result.amount).toBe(25000);
  });

  it('starts balance payment', async () => {
    publicPost.mockResolvedValueOnce({
      paymentId: 2,
      invoiceId: 'inv-2',
      amount: 8000,
      qrText: 'qr',
      qrImage: null,
      urls: [],
    });

    await startBalancePaymentUseCase('demo', 9);
    expect(publicPost).toHaveBeenCalledWith('/bookings/9/pay', 'demo', {
      kind: 'balance',
    });
  });

  it('polls deposit confirmation outcomes', async () => {
    publicGet
      .mockResolvedValueOnce({ status: 'pending' })
      .mockResolvedValueOnce({ status: 'confirmed' })
      .mockResolvedValueOnce({ status: 'expired' });

    expect(await pollDepositConfirmationUseCase('demo', 1)).toEqual({
      kind: 'pending',
    });
    expect(await pollDepositConfirmationUseCase('demo', 1)).toEqual({
      kind: 'confirmed',
    });
    expect(await pollDepositConfirmationUseCase('demo', 1)).toEqual({
      kind: 'expired',
    });
  });

  it('polls balance cleared outcomes', async () => {
    publicGet
      .mockResolvedValueOnce({ remainingBalance: 5000 })
      .mockResolvedValueOnce({ remainingBalance: 0 });

    expect(await pollBalanceClearedUseCase('demo', 1)).toEqual({
      kind: 'pending',
    });
    expect(await pollBalanceClearedUseCase('demo', 1)).toEqual({
      kind: 'cleared',
    });
  });

  it('simulates qpay payment payload', async () => {
    publicPost.mockResolvedValueOnce(undefined);
    await simulateQpayPaymentUseCase('demo', {
      invoiceId: 'inv-9',
      amount: 1000,
      paymentIdSuffix: 'fixed',
    });
    expect(publicPost).toHaveBeenCalledWith('/webhooks/qpay/simulate', 'demo', {
      invoice_id: 'inv-9',
      payment_id: 'sim-fixed',
      payment_status: 'PAID',
      payment_amount: 1000,
    });
  });
});
