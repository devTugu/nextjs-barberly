import {
  postOfflineSettlement,
  postReopenSettlement,
  type OfflineSettlementMethod,
} from '../api/settlement-api';
import type {
  BookingOutput,
  BookingStatus,
  PaymentSettlementStatus,
} from '../types/booking';
import {
  canRecordOfflineSettlement,
  canReopenOfflineSettlement,
} from './settlement-rules';

export class SettlementNotAllowedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SettlementNotAllowedError';
  }
}

export interface SettlementBookingSnapshot {
  id: number;
  status: BookingStatus;
  remainingBalance: number;
  balanceRecordedOfflineAmount: number;
  paymentSettlementStatus: PaymentSettlementStatus;
}

export async function recordOfflineSettlementUseCase(
  tenant: string,
  booking: SettlementBookingSnapshot,
  method: OfflineSettlementMethod,
  deps: {
    post?: typeof postOfflineSettlement;
  } = {},
): Promise<{ booking: BookingOutput }> {
  if (
    !canRecordOfflineSettlement({
      status: booking.status,
      remainingBalance: booking.remainingBalance,
    })
  ) {
    throw new SettlementNotAllowedError(
      'Offline settlement is not allowed for this booking.',
    );
  }
  const post = deps.post ?? postOfflineSettlement;
  return post(tenant, booking.id, method);
}

export async function reopenOfflineSettlementUseCase(
  tenant: string,
  booking: SettlementBookingSnapshot,
  auth: { isOwner: boolean; canUpdate: boolean },
  deps: {
    post?: typeof postReopenSettlement;
  } = {},
): Promise<BookingOutput> {
  if (
    !canReopenOfflineSettlement({
      status: booking.status,
      balanceRecordedOfflineAmount: booking.balanceRecordedOfflineAmount,
      isOwner: auth.isOwner,
      canUpdate: auth.canUpdate,
    })
  ) {
    throw new SettlementNotAllowedError(
      'Reopening settlement is not allowed for this booking.',
    );
  }
  const post = deps.post ?? postReopenSettlement;
  return post(tenant, booking.id);
}
