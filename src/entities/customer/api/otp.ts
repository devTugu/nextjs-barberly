/**
 * Customer OTP API (BFF). Injectable fetch/headers for unit tests.
 * Default CSRF loader matches other customer mutating calls.
 */

export type FetchLike = typeof fetch;
export type MutatingHeadersFn = () => Promise<Record<string, string>>;

export interface SendOtpResult {
  devCode?: string;
  devBypassCode?: string;
}

export class CustomerOtpError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CustomerOtpError';
  }
}

async function defaultMutatingHeaders(): Promise<Record<string, string>> {
  const { mutatingFetchHeaders } = await import('@/shared/lib/csrf-client');
  return mutatingFetchHeaders();
}

async function readErrorMessage(
  res: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = (await res.json()) as { error?: { message?: string } };
    return body.error?.message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function sendCustomerOtp(
  tenant: string,
  phone: string,
  options: {
    fetchFn?: FetchLike;
    headersFn?: MutatingHeadersFn;
    fallbackMessage?: string;
  } = {},
): Promise<SendOtpResult> {
  const fetchFn = options.fetchFn ?? fetch;
  const headersFn = options.headersFn ?? defaultMutatingHeaders;
  const fallback = options.fallbackMessage ?? 'Failed to send OTP';

  const csrf = await headersFn();
  const res = await fetchFn(`/api/customer-auth/otp/send?tenant=${tenant}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...csrf },
    body: JSON.stringify({ phone }),
  });

  const body = (await res.json()) as {
    data?: SendOtpResult;
    error?: { message?: string };
  };

  if (!res.ok) {
    throw new CustomerOtpError(body.error?.message ?? fallback);
  }

  return body.data ?? {};
}

export async function verifyCustomerOtp(
  tenant: string,
  input: { phone: string; code: string; bookingId?: number },
  options: {
    fetchFn?: FetchLike;
    headersFn?: MutatingHeadersFn;
    fallbackMessage?: string;
  } = {},
): Promise<void> {
  const fetchFn = options.fetchFn ?? fetch;
  const headersFn = options.headersFn ?? defaultMutatingHeaders;
  const fallback = options.fallbackMessage ?? 'Failed to verify OTP';

  const csrf = await headersFn();
  const res = await fetchFn(`/api/customer-auth/otp/verify?tenant=${tenant}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...csrf },
    body: JSON.stringify({
      phone: input.phone,
      code: input.code,
      bookingId: input.bookingId,
    }),
  });

  if (!res.ok) {
    throw new CustomerOtpError(await readErrorMessage(res, fallback));
  }
}
