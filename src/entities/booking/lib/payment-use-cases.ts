import type { BookingPayResult } from '../api/public-booking';
import {
  isBalanceCleared,
  isBookingConfirmed,
  isBookingExpired,
} from './payment-amounts';
import {
  fetchPublicBookingStatus,
  simulateQpayPayment,
  startBookingPayment,
  type SimulateQpayPaymentInput,
} from './public-payment';

export async function startDepositPaymentUseCase(
  tenant: string,
  bookingId: number,
  fallbackTotalPrice: number,
): Promise<BookingPayResult> {
  const result = await startBookingPayment(tenant, bookingId, {
    kind: 'deposit',
  });
  return {
    ...result,
    amount: result.amount ?? fallbackTotalPrice,
  };
}

export async function startBalancePaymentUseCase(
  tenant: string,
  bookingId: number,
): Promise<BookingPayResult> {
  return startBookingPayment(tenant, bookingId, { kind: 'balance' });
}

export async function simulateQpayPaymentUseCase(
  tenant: string,
  input: SimulateQpayPaymentInput,
): Promise<void> {
  await simulateQpayPayment(tenant, input);
}

export type DepositPollOutcome =
  | { kind: 'confirmed' }
  | { kind: 'expired' }
  | { kind: 'pending' };

export async function pollDepositConfirmationUseCase(
  tenant: string,
  bookingId: number,
): Promise<DepositPollOutcome> {
  const booking = await fetchPublicBookingStatus(tenant, bookingId);
  if (isBookingConfirmed(booking.status)) return { kind: 'confirmed' };
  if (isBookingExpired(booking.status)) return { kind: 'expired' };
  return { kind: 'pending' };
}

export type BalancePollOutcome =
  | { kind: 'cleared' }
  | { kind: 'pending' };

export async function pollBalanceClearedUseCase(
  tenant: string,
  bookingId: number,
): Promise<BalancePollOutcome> {
  const booking = await fetchPublicBookingStatus(tenant, bookingId);
  if (isBalanceCleared(booking.remainingBalance)) return { kind: 'cleared' };
  return { kind: 'pending' };
}
