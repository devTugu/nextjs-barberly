import { publicGet, publicPost } from '@/shared/lib/public-api';

export interface AvailableSlotDto {
  startUtc: string;
  staffId?: number;
}

export interface AvailableSlotsResult {
  staffId?: number;
  anyStaff?: boolean;
  timezone: string;
  slots: AvailableSlotDto[];
}

export interface LockBookingInput {
  serviceIds: number[];
  startAtUtc: string;
  staffId: number;
}

export interface LockedBooking {
  id: number;
  status: string;
  totalPrice: number;
  depositAmount?: number;
  balanceDue?: number;
  remainingBalance?: number;
  startAtUtc: string;
  lockExpiresAt?: string | null;
  endAtUtc?: string;
  customerId?: number | null;
  services?: Array<{
    serviceId: number;
    serviceName: string;
    durationMinutes: number;
    price: number;
  }>;
}

export async function fetchAvailableSlots(
  tenant: string,
  query: Record<string, string>,
): Promise<AvailableSlotsResult> {
  return publicGet<AvailableSlotsResult>('/available-slots', tenant, query);
}

export async function lockBookingSlot(
  tenant: string,
  input: LockBookingInput,
): Promise<LockedBooking> {
  return publicPost<LockedBooking>('/bookings/lock', tenant, input);
}

export function buildAvailableSlotsQuery(input: {
  date: string;
  durationMinutes: number;
  serviceIds: number[];
  anyStaff: boolean;
  selectedStaffId: number | null;
}): Record<string, string> {
  const query: Record<string, string> = {
    date: input.date,
    durationMinutes: String(input.durationMinutes),
  };
  if (input.serviceIds.length) {
    query.serviceIds = input.serviceIds.join(',');
  }
  if (input.anyStaff) {
    query.anyStaff = 'true';
  } else if (input.selectedStaffId) {
    query.staffId = String(input.selectedStaffId);
  }
  return query;
}

export function mapAvailableSlots(
  result: AvailableSlotsResult,
  fallbackStaffId: number | null,
): Array<{ startAtUtc: string; staffId: number }> {
  return (result.slots ?? []).map((slot) => ({
    startAtUtc: slot.startUtc,
    staffId: slot.staffId ?? result.staffId ?? fallbackStaffId!,
  }));
}
