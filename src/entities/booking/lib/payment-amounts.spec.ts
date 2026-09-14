import { describe, expect, it } from 'vitest';
import {
  isBalanceCleared,
  isBookingConfirmed,
  isBookingExpired,
  resolveBalanceDue,
  resolveDepositAmount,
} from './payment-amounts';

describe('payment-amounts', () => {
  it('resolves deposit preferring explicit deposit then payment amount', () => {
    expect(
      resolveDepositAmount({
        depositAmount: 5000,
        paymentAmount: 4000,
        totalPrice: 20000,
      }),
    ).toBe(5000);
    expect(
      resolveDepositAmount({
        paymentAmount: 4000,
        totalPrice: 20000,
      }),
    ).toBe(4000);
    expect(resolveDepositAmount({ totalPrice: 20000 })).toBe(20000);
  });

  it('resolves balance due from explicit value or residual', () => {
    expect(
      resolveBalanceDue({
        balanceDue: 12000,
        totalPrice: 20000,
        depositAmount: 5000,
      }),
    ).toBe(12000);
    expect(
      resolveBalanceDue({
        totalPrice: 20000,
        depositAmount: 5000,
      }),
    ).toBe(15000);
  });

  it('classifies booking and balance outcomes', () => {
    expect(isBookingConfirmed('confirmed')).toBe(true);
    expect(isBookingExpired('expired')).toBe(true);
    expect(isBalanceCleared(0)).toBe(true);
    expect(isBalanceCleared(100)).toBe(false);
  });
});
