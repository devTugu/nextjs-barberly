import type { NextRequest } from 'next/server';
import { proxy as handleProxy } from '@/processes/proxy';

export function proxy(request: NextRequest) {
  return handleProxy(request);
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/admin',
    '/user/:path*',
    '/user',
    '/login',
    '/dashboard/:path*',
    '/dashboard',
    '/tenants/:path*',
    '/tenants',
    '/analytics',
    '/withdrawals/:path*',
    '/withdrawals',
    '/users',
    '/roles',
    '/permissions',
    '/audit',
    '/security',
    '/support',
  ],
};
