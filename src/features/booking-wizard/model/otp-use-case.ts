import {
  fetchCustomerSession,
  sendCustomerOtp,
  verifyCustomerOtp,
  type FetchLike,
  type MutatingHeadersFn,
  type SendOtpResult,
} from '@/entities/customer';

export type { SendOtpResult };

export async function sendBookingOtpUseCase(
  tenant: string,
  phone: string,
  options: {
    fetchFn?: FetchLike;
    headersFn?: MutatingHeadersFn;
    fallbackMessage?: string;
  } = {},
): Promise<SendOtpResult> {
  return sendCustomerOtp(tenant, phone, options);
}

export async function verifyBookingOtpUseCase(
  tenant: string,
  input: { phone: string; code: string; bookingId: number },
  options: {
    fetchFn?: FetchLike;
    headersFn?: MutatingHeadersFn;
    fallbackMessage?: string;
  } = {},
): Promise<void> {
  await verifyCustomerOtp(tenant, input, options);
}

/** Prefer explicit dev code from send response when present. */
export function resolveOtpDevHint(result: SendOtpResult): string | null {
  return result.devCode ?? result.devBypassCode ?? null;
}

/** Skip OTP when the customer already has an authenticated profile session. */
export async function shouldSkipBookingOtpUseCase(
  tenant: string,
): Promise<boolean> {
  const session = await fetchCustomerSession(tenant);
  return session !== null && !session.needsProfile;
}
