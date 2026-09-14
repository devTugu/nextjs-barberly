import { publicGet, publicPost } from '@/shared/lib/public-api';
import type {
  BookingPayInput,
  BookingPayResult,
  PublicBooking,
} from '../api/public-booking';

export async function startBookingPayment(
  tenant: string,
  bookingId: number,
  input: BookingPayInput = { kind: 'deposit' },
): Promise<BookingPayResult> {
  return publicPost<BookingPayResult>(
    `/bookings/${bookingId}/pay`,
    tenant,
    input,
  );
}

export async function fetchPublicBookingStatus(
  tenant: string,
  bookingId: number,
): Promise<Pick<PublicBooking, 'status' | 'remainingBalance'>> {
  return publicGet<Pick<PublicBooking, 'status' | 'remainingBalance'>>(
    `/bookings/${bookingId}`,
    tenant,
  );
}

export interface SimulateQpayPaymentInput {
  invoiceId: string;
  amount: number;
  paymentIdSuffix?: string;
}

export async function simulateQpayPayment(
  tenant: string,
  input: SimulateQpayPaymentInput,
): Promise<void> {
  await publicPost('/webhooks/qpay/simulate', tenant, {
    invoice_id: input.invoiceId,
    payment_id: `sim-${input.paymentIdSuffix ?? Date.now()}`,
    payment_status: 'PAID',
    payment_amount: input.amount,
  });
}
