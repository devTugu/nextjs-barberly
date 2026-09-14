import { beforeEach, describe, expect, it, vi } from 'vitest';

const publicGet = vi.fn();
const publicPost = vi.fn();

vi.mock('@/shared/lib/public-api', () => ({
  publicGet: (...args: unknown[]) => publicGet(...args),
  publicPost: (...args: unknown[]) => publicPost(...args),
}));

import {
  awaitBalanceClearedUseCase,
  awaitDepositConfirmationUseCase,
  pollBalanceClearedUseCase,
  pollDepositConfirmationUseCase,
  QpaySimulateDisabledError,
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
    await simulateQpayPaymentUseCase(
      'demo',
      {
        invoiceId: 'inv-9',
        amount: 1000,
        paymentIdSuffix: 'fixed',
      },
      { NODE_ENV: 'development' },
    );
    expect(publicPost).toHaveBeenCalledWith('/webhooks/qpay/simulate', 'demo', {
      invoice_id: 'inv-9',
      payment_id: 'sim-fixed',
      payment_status: 'PAID',
      payment_amount: 1000,
    });
  });

  it('refuses simulate when disabled', async () => {
    await expect(
      simulateQpayPaymentUseCase(
        'demo',
        { invoiceId: 'inv-9', amount: 1000 },
        {
          NODE_ENV: 'production',
          NEXT_PUBLIC_QPAY_SIMULATE_ENABLED: 'false',
        },
      ),
    ).rejects.toBeInstanceOf(QpaySimulateDisabledError);
    expect(publicPost).not.toHaveBeenCalled();
  });

  it('awaits deposit confirmation with injectable wait', async () => {
    publicGet
      .mockResolvedValueOnce({ status: 'pending' })
      .mockResolvedValueOnce({ status: 'confirmed' });
    const wait = vi.fn().mockResolvedValue(undefined);

    await expect(
      awaitDepositConfirmationUseCase('demo', 1, {
        intervalMs: 10,
        wait,
      }),
    ).resolves.toBe('confirmed');
    expect(wait).toHaveBeenCalledTimes(1);
  });

  it('awaits balance cleared with injectable wait', async () => {
    publicGet
      .mockResolvedValueOnce({ remainingBalance: 100 })
      .mockResolvedValueOnce({ remainingBalance: 0 });
    const wait = vi.fn().mockResolvedValue(undefined);

    await expect(
      awaitBalanceClearedUseCase('demo', 1, { intervalMs: 10, wait }),
    ).resolves.toBe('cleared');
    expect(wait).toHaveBeenCalledTimes(1);
  });

  it('aborts await deposit loop', async () => {
    publicGet.mockResolvedValue({ status: 'pending' });
    const controller = new AbortController();
    const wait = vi.fn().mockImplementation(async () => {
      controller.abort();
      throw new DOMException('Aborted', 'AbortError');
    });

    await expect(
      awaitDepositConfirmationUseCase('demo', 1, {
        signal: controller.signal,
        wait,
      }),
    ).rejects.toMatchObject({ name: 'AbortError' });
  });
});
