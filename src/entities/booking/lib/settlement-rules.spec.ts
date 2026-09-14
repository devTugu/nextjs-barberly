import { describe, expect, it } from 'vitest';
import {
  canCompleteBooking,
  canRecordOfflineSettlement,
  canReopenOfflineSettlement,
  isFullySettled,
} from './settlement-rules';

describe('settlement-rules', () => {
  it('detects fully settled status', () => {
    expect(isFullySettled('fully_settled')).toBe(true);
    expect(isFullySettled('deposit_paid')).toBe(false);
  });

  it('allows offline settle only for confirmed bookings with balance', () => {
    expect(
      canRecordOfflineSettlement({ status: 'confirmed', remainingBalance: 1000 }),
    ).toBe(true);
    expect(
      canRecordOfflineSettlement({ status: 'confirmed', remainingBalance: 0 }),
    ).toBe(false);
    expect(
      canRecordOfflineSettlement({ status: 'completed', remainingBalance: 1000 }),
    ).toBe(false);
  });

  it('allows reopen only for owners on completed bookings with offline amount', () => {
    expect(
      canReopenOfflineSettlement({
        status: 'completed',
        balanceRecordedOfflineAmount: 5000,
        isOwner: true,
        canUpdate: true,
      }),
    ).toBe(true);
    expect(
      canReopenOfflineSettlement({
        status: 'completed',
        balanceRecordedOfflineAmount: 5000,
        isOwner: false,
        canUpdate: true,
      }),
    ).toBe(false);
  });

  it('requires full settlement before complete', () => {
    expect(
      canCompleteBooking({
        status: 'confirmed',
        paymentSettlementStatus: 'fully_settled',
      }),
    ).toBe(true);
    expect(
      canCompleteBooking({
        status: 'confirmed',
        paymentSettlementStatus: 'deposit_paid',
      }),
    ).toBe(false);
  });
});
