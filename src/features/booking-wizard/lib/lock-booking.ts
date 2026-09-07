import { publicPost } from '@/shared/lib/public-api';
import { attachCustomerBooking, fetchCustomerSession } from '@/entities/customer';
import { readBookingDraft, writeBookingDraft, type BookingDraft } from './booking-session';

export type LockedBooking = NonNullable<BookingDraft['booking']>;

export async function lockDraftSlot(tenant: string): Promise<{
  booking: LockedBooking;
  needsAuth: boolean;
}> {
  const draft = readBookingDraft();
  const slot = draft.selectedSlot;
  if (!slot || !draft.serviceIds.length) {
    throw new Error('Missing booking selection');
  }

  const locked = await publicPost<LockedBooking>('/bookings/lock', tenant, {
    serviceIds: draft.serviceIds,
    startAtUtc: slot.startAtUtc,
    staffId: slot.staffId,
  });
  writeBookingDraft({ selectedSlot: slot, booking: locked });

  const session = await fetchCustomerSession(tenant);
  const ready = Boolean(session && !session.needsProfile);
  if (ready && !locked.customerId) {
    await attachCustomerBooking(tenant, locked.id);
  }
  return { booking: locked, needsAuth: !ready };
}
