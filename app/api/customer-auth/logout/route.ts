import { NextRequest, NextResponse } from 'next/server';
import { clearCustomerAuthCookies } from '@/shared/lib/customer-auth-cookies';
import { assertCsrf } from '@/shared/lib/bff-csrf';

export async function POST(request: NextRequest) {
  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;

  const response = NextResponse.json({ success: true, data: null });
  return clearCustomerAuthCookies(response);
}
