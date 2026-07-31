import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchInternal, parseInternalJson } from '@/shared/lib/internal-api';
import { CUSTOMER_AUTH_COOKIE_NAMES } from '@/shared/lib/customer-auth-cookies';

async function customerToken() {
  return (await cookies()).get(CUSTOMER_AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value;
}

function tenantFrom(request: NextRequest) {
  return (
    request.nextUrl.searchParams.get('tenant') ??
    request.headers.get('x-tenant-subdomain')
  );
}

export async function POST(request: NextRequest) {
  const token = await customerToken();
  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'No customer session' },
      },
      { status: 401 },
    );
  }

  const tenant = tenantFrom(request);
  const body = await request.json();

  const upstream = await fetchInternal(
    '/public/customer-auth/me/attach-booking',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(tenant ? { 'X-Tenant-Subdomain': tenant } : {}),
      },
      body: JSON.stringify(body),
    },
  );

  const envelope = await parseInternalJson(upstream);
  return NextResponse.json(envelope, { status: upstream.status });
}
