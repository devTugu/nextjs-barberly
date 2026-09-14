import type {
  BookingStatus,
  PaymentSettlementStatus,
} from '../types/booking';

export function isFullySettled(
  status: PaymentSettlementStatus | null | undefined,
): boolean {
  return status === 'fully_settled';
}

export function canRecordOfflineSettlement(input: {
  status: BookingStatus;
  remainingBalance: number;
}): boolean {
  return input.status === 'confirmed' && input.remainingBalance > 0;
}

export function canReopenOfflineSettlement(input: {
  status: BookingStatus;
  balanceRecordedOfflineAmount: number;
  isOwner: boolean;
  canUpdate: boolean;
}): boolean {
  return (
    input.isOwner &&
    input.canUpdate &&
    input.status === 'completed' &&
    input.balanceRecordedOfflineAmount > 0
  );
}

export function canCompleteBooking(input: {
  status: BookingStatus;
  paymentSettlementStatus: PaymentSettlementStatus;
}): boolean {
  return (
    input.status === 'confirmed' && isFullySettled(input.paymentSettlementStatus)
  );
}
