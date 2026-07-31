import { NextRequest, NextResponse } from 'next/server';
import { fetchInternal, parseInternalJson } from '@/shared/lib/internal-api';
import { assertCsrf } from '@/shared/lib/bff-csrf';
import {
  CUSTOMER_AUTH_COOKIE_NAMES,
  setCustomerAuthCookies,
} from '@/shared/lib/customer-auth-cookies';

type ExchangeResult = {
  accessToken: string;
  expiresIn: number;
  customer: {
    id: number;
    tenantId: number;
    phone: string;
    name: string | null;
    needsProfile?: boolean;
  };
};

/** Same-host exchange then client navigates (ADR-019 preferred path). */
export async function POST(request: NextRequest) {
  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;

  const token = request.cookies.get(
    CUSTOMER_AUTH_COOKIE_NAMES.ACCESS_TOKEN,
  )?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, error: { message: 'Not authenticated' } },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);
  const targetSubdomain =
    typeof body?.targetSubdomain === 'string'
      ? body.targetSubdomain.trim().toLowerCase()
      : '';
  if (!targetSubdomain) {
    return NextResponse.json(
      { success: false, error: { message: 'targetSubdomain required' } },
      { status: 400 },
    );
  }

  const upstream = await fetchInternal(
    '/public/customer-auth/session/exchange',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ targetSubdomain }),
    },
  );

  const envelope = await parseInternalJson<ExchangeResult>(upstream);
  if (!upstream.ok) {
    return NextResponse.json(envelope, { status: upstream.status });
  }

  const response = NextResponse.json({
    success: true,
    data: {
      expiresIn: envelope.data.expiresIn,
      customer: envelope.data.customer,
      targetSubdomain,
    },
  });

  return setCustomerAuthCookies(
    response,
    envelope.data.accessToken,
    envelope.data.expiresIn,
  );
}
