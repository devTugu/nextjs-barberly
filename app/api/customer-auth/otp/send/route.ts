import { NextRequest, NextResponse } from 'next/server';
import { fetchInternal, parseInternalJson } from '@/shared/lib/internal-api';
import { assertCsrf } from '@/shared/lib/bff-csrf';

type OtpSendResult = { sent: boolean; phone: string; expiresInSec: number };

export async function POST(request: NextRequest) {
  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;

  const tenant =
    request.nextUrl.searchParams.get('tenant') ??
    request.headers.get('x-tenant-subdomain');
  const body = await request.text();

  const upstream = await fetchInternal('/public/customer-auth/otp/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(tenant ? { 'X-Tenant-Subdomain': tenant } : {}),
    },
    body,
  });

  const envelope = await parseInternalJson<OtpSendResult>(upstream);
  return NextResponse.json(envelope, { status: upstream.status });
}
