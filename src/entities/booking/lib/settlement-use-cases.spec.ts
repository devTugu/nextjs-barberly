import { describe, expect, it, vi } from 'vitest';
import {
  recordOfflineSettlementUseCase,
  reopenOfflineSettlementUseCase,
  SettlementNotAllowedError,
} from './settlement-use-cases';

const booking = {
  id: 9,
  status: 'confirmed' as const,
  remainingBalance: 8000,
  balanceRecordedOfflineAmount: 0,
  paymentSettlementStatus: 'deposit_paid' as const,
};

describe('settlement-use-cases', () => {
  it('records offline settlement when allowed', async () => {
    const post = vi.fn().mockResolvedValue({ booking: { id: 9 } });
    await recordOfflineSettlementUseCase('demo', booking, 'cash', { post });
    expect(post).toHaveBeenCalledWith('demo', 9, 'cash');
  });

  it('refuses offline settlement when rules fail', async () => {
    const post = vi.fn();
    await expect(
      recordOfflineSettlementUseCase(
        'demo',
        { ...booking, remainingBalance: 0 },
        'card',
        { post },
      ),
    ).rejects.toBeInstanceOf(SettlementNotAllowedError);
    expect(post).not.toHaveBeenCalled();
  });

  it('reopens settlement when allowed', async () => {
    const post = vi.fn().mockResolvedValue({ id: 9 });
    await reopenOfflineSettlementUseCase(
      'demo',
      {
        ...booking,
        status: 'completed',
        remainingBalance: 0,
        balanceRecordedOfflineAmount: 8000,
        paymentSettlementStatus: 'fully_settled',
      },
      { isOwner: true, canUpdate: true },
      { post },
    );
    expect(post).toHaveBeenCalledWith('demo', 9);
  });

  it('refuses reopen when not owner', async () => {
    const post = vi.fn();
    await expect(
      reopenOfflineSettlementUseCase(
        'demo',
        {
          ...booking,
          status: 'completed',
          remainingBalance: 0,
          balanceRecordedOfflineAmount: 8000,
          paymentSettlementStatus: 'fully_settled',
        },
        { isOwner: false, canUpdate: true },
        { post },
      ),
    ).rejects.toBeInstanceOf(SettlementNotAllowedError);
    expect(post).not.toHaveBeenCalled();
  });
});
