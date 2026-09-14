import { isQpaySimulateAllowed } from '@/shared/config/qpay-simulate';
import { abortableWait, isAbortError, type WaitFn } from '@/shared/lib/abortable-wait';
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

export class QpaySimulateDisabledError extends Error {
  constructor() {
    super('QPay simulate is disabled in this environment.');
    this.name = 'QpaySimulateDisabledError';
  }
}

export async function simulateQpayPaymentUseCase(
  tenant: string,
  input: SimulateQpayPaymentInput,
  env: NodeJS.ProcessEnv = process.env,
): Promise<void> {
  if (!isQpaySimulateAllowed(env)) {
    throw new QpaySimulateDisabledError();
  }
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

export interface AwaitPaymentOptions {
  intervalMs?: number;
  signal?: AbortSignal;
  wait?: WaitFn;
}

/**
 * Poll until deposit is confirmed or lock expired.
 * Injectable `wait` keeps the loop framework-free and unit-testable.
 */
export async function awaitDepositConfirmationUseCase(
  tenant: string,
  bookingId: number,
  options: AwaitPaymentOptions = {},
): Promise<'confirmed' | 'expired'> {
  const intervalMs = options.intervalMs ?? 3000;
  const wait = options.wait ?? abortableWait;

  while (true) {
    if (options.signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
    const outcome = await pollDepositConfirmationUseCase(tenant, bookingId);
    if (outcome.kind === 'confirmed' || outcome.kind === 'expired') {
      return outcome.kind;
    }
    await wait(intervalMs, options.signal);
  }
}

/**
 * Poll until remaining balance is cleared.
 */
export async function awaitBalanceClearedUseCase(
  tenant: string,
  bookingId: number,
  options: AwaitPaymentOptions = {},
): Promise<'cleared'> {
  const intervalMs = options.intervalMs ?? 3000;
  const wait = options.wait ?? abortableWait;

  while (true) {
    if (options.signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
    const outcome = await pollBalanceClearedUseCase(tenant, bookingId);
    if (outcome.kind === 'cleared') {
      return 'cleared';
    }
    await wait(intervalMs, options.signal);
  }
}

export interface DepositWatchPorts {
  onConfirmed: () => void | Promise<void>;
  onExpired: () => void | Promise<void>;
}

/**
 * Awaits deposit confirmation and dispatches framework-free ports.
 * UI supplies router/toast via ports; abort is swallowed (unmount).
 */
export async function watchDepositConfirmationUseCase(
  tenant: string,
  bookingId: number,
  ports: DepositWatchPorts,
  options: AwaitPaymentOptions = {},
): Promise<void> {
  try {
    const outcome = await awaitDepositConfirmationUseCase(
      tenant,
      bookingId,
      options,
    );
    if (outcome === 'confirmed') {
      await ports.onConfirmed();
      return;
    }
    await ports.onExpired();
  } catch (error) {
    if (isAbortError(error) || options.signal?.aborted) return;
    throw error;
  }
}

export interface BalanceWatchPorts {
  onCleared: () => void | Promise<void>;
}

/**
 * Awaits balance cleared and notifies via port (invalidate/toast live here).
 */
export async function watchBalanceClearedUseCase(
  tenant: string,
  bookingId: number,
  ports: BalanceWatchPorts,
  options: AwaitPaymentOptions = {},
): Promise<void> {
  try {
    await awaitBalanceClearedUseCase(tenant, bookingId, options);
    await ports.onCleared();
  } catch (error) {
    if (isAbortError(error) || options.signal?.aborted) return;
    throw error;
  }
}
