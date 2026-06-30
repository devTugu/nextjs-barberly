export const BOOKING_STATUSES = [
  'pending_payment',
  'confirmed',
  'expired',
  'rescheduled',
  'cancelled_by_customer',
  'cancelled_by_barber',
  'completed',
  'no_show',
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export interface BookingServiceLine {
  serviceId: number;
  serviceName: string;
  durationMinutes: number;
  price: number;
}

export interface BookingOutput {
  id: number;
  tenantId: number;
  customerId: number | null;
  staffId: number;
  startAtUtc: string;
  endAtUtc: string;
  status: BookingStatus;
  totalPrice: number;
  lockExpiresAt: string | null;
  services: BookingServiceLine[];
  createdAt: string;
  updatedAt: string;
}

export interface BookingListResult {
  items: BookingOutput[];
  total: number;
  page: number;
  limit: number;
}

export interface ManualBookingInput {
  staffId: number;
  startAtUtc: string;
  endAtUtc: string;
  totalPrice: number;
  customerId?: number;
  services: BookingServiceLine[];
}

export interface BookingListParams {
  page?: number;
  limit?: number;
  status?: string;
  staffId?: number;
}
