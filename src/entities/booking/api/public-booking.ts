import { useQuery } from '@tanstack/react-query';
import { publicGet } from '@/shared/lib/public-api';

export interface PublicBookingService {
  serviceId: number;
  serviceName: string;
  durationMinutes: number;
  price: number;
}

import type { PaymentSettlementStatus } from '../types/booking';

export interface PublicBooking {
  id: number;
  status: string;
  startAtUtc: string;
  endAtUtc?: string;
  totalPrice: number;
  depositAmount?: number;
  balanceDue?: number;
  depositPaidAmount?: number;
  balancePaidOnlineAmount?: number;
  balanceRecordedOfflineAmount?: number;
  paymentSettlementStatus?: PaymentSettlementStatus;
  remainingBalance?: number;
  services: PublicBookingService[];
}

export interface BookingPayInput {
  kind?: 'deposit' | 'balance';
}

export interface BookingPayResult {
  paymentId: number;
  invoiceId: string;
  amount: number;
  qrText: string;
  qrImage: string | null;
  urls: Array<{ name: string; link: string; description: string }>;
}

export type PolicyReasonCode =
  | 'BOOKING_NOT_ACTIVE'
  | 'RESCHEDULE_WINDOW_PASSED';

export interface CancelPreview {
  allowed: boolean;
  refundPercent: number;
  refundAmount: number;
  reason: string | null;
  reasonCode: PolicyReasonCode | null;
}

export interface ReschedulePreview {
  allowed: boolean;
  reason: string | null;
  reasonCode: PolicyReasonCode | null;
  hoursUntilStart: number;
  rescheduleHoursBefore: number;
}

export const publicBookingKeys = {
  detail: (tenant: string, id: number) =>
    ['public-booking', tenant, id] as const,
  cancelPreview: (tenant: string, id: number) =>
    ['public-booking-cancel-preview', tenant, id] as const,
  reschedulePreview: (tenant: string, id: number) =>
    ['public-booking-reschedule-preview', tenant, id] as const,
};

export function usePublicBooking(tenant: string, id: number) {
  return useQuery({
    queryKey: publicBookingKeys.detail(tenant, id),
    queryFn: () => publicGet<PublicBooking>(`/bookings/${id}`, tenant),
    enabled: id > 0,
  });
}

export function useCancelPreview(tenant: string, id: number, enabled = true) {
  return useQuery({
    queryKey: publicBookingKeys.cancelPreview(tenant, id),
    queryFn: () =>
      publicGet<CancelPreview>(`/bookings/${id}/cancel-preview`, tenant),
    enabled: enabled && id > 0,
  });
}

export function useReschedulePreview(
  tenant: string,
  id: number,
  enabled = true,
) {
  return useQuery({
    queryKey: publicBookingKeys.reschedulePreview(tenant, id),
    queryFn: () =>
      publicGet<ReschedulePreview>(
        `/bookings/${id}/reschedule-preview`,
        tenant,
      ),
    enabled: enabled && id > 0,
  });
}
