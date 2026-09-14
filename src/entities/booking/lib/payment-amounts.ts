/** Pure deposit / balance helpers for booking money UI. */

export function resolveDepositAmount(input: {
  depositAmount?: number | null;
  paymentAmount?: number | null;
  totalPrice: number;
}): number {
  if (typeof input.depositAmount === 'number') return input.depositAmount;
  if (typeof input.paymentAmount === 'number') return input.paymentAmount;
  return input.totalPrice;
}

export function resolveBalanceDue(input: {
  balanceDue?: number | null;
  totalPrice: number;
  depositAmount: number;
}): number {
  if (typeof input.balanceDue === 'number') return input.balanceDue;
  return Math.max(0, input.totalPrice - input.depositAmount);
}

export function isBookingConfirmed(status: string): boolean {
  return status === 'confirmed';
}

export function isBookingExpired(status: string): boolean {
  return status === 'expired';
}

export function isBalanceCleared(remainingBalance?: number | null): boolean {
  return (remainingBalance ?? 0) <= 0;
}
