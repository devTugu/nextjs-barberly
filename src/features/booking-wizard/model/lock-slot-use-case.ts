import {
  attachCustomerBooking,
  fetchCustomerSession,
} from '@/entities/customer';
import {
  buildAvailableSlotsQuery,
  fetchAvailableSlots,
  lockBookingSlot,
  mapAvailableSlots,
  type LockedBooking,
} from '@/entities/booking';

export async function loadAvailableSlotsUseCase(input: {
  tenant: string;
  date: string;
  durationMinutes: number;
  serviceIds: number[];
  anyStaff: boolean;
  selectedStaffId: number | null;
}): Promise<{
  timezone: string;
  slots: Array<{ startAtUtc: string; staffId: number }>;
}> {
  const query = buildAvailableSlotsQuery({
    date: input.date,
    durationMinutes: input.durationMinutes,
    serviceIds: input.serviceIds,
    anyStaff: input.anyStaff,
    selectedStaffId: input.selectedStaffId,
  });
  const result = await fetchAvailableSlots(input.tenant, query);
  return {
    timezone: result.timezone ?? 'UTC',
    slots: mapAvailableSlots(result, input.selectedStaffId),
  };
}

export type LockSlotRoute = 'pay' | 'otp';

export async function lockSlotAndRouteUseCase(input: {
  tenant: string;
  serviceIds: number[];
  startAtUtc: string;
  staffId: number;
}): Promise<{ booking: LockedBooking; route: LockSlotRoute }> {
  const booking = await lockBookingSlot(input.tenant, {
    serviceIds: input.serviceIds,
    startAtUtc: input.startAtUtc,
    staffId: input.staffId,
  });

  const session = await fetchCustomerSession(input.tenant);
  if (session && !session.needsProfile) {
    if (!booking.customerId) {
      await attachCustomerBooking(input.tenant, booking.id);
    }
    return { booking, route: 'pay' };
  }

  return { booking, route: 'otp' };
}
