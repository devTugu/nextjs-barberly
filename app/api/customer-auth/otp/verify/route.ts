import { NextRequest, NextResponse } from 'next/server';
import { fetchInternal, parseInternalJson } from '@/shared/lib/internal-api';
import { assertCsrf } from '@/shared/lib/bff-csrf';
import { setCustomerAuthCookies } from '@/shared/lib/customer-auth-cookies';

type VerifyResult = {
  accessToken: string;
  expiresIn: number;
  customer: { id: number; tenantId: number; phone: string };
};

export async function POST(request: NextRequest) {
  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;

  const tenant =
    request.nextUrl.searchParams.get('tenant') ??
    request.headers.get('x-tenant-subdomain');
  const body = await request.text();

  const upstream = await fetchInternal('/public/customer-auth/otp/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(tenant ? { 'X-Tenant-Subdomain': tenant } : {}),
    },
    body,
  });

  const envelope = await parseInternalJson<VerifyResult>(upstream);
  if (!upstream.ok) {
    return NextResponse.json(envelope, { status: upstream.status });
  }

  const response = NextResponse.json({
    success: true,
    data: {
      expiresIn: envelope.data.expiresIn,
      customer: envelope.data.customer,
    },
  });

  return setCustomerAuthCookies(
    response,
    envelope.data.accessToken,
    envelope.data.expiresIn,
  );
}
