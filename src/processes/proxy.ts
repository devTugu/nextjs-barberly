import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES } from '@/shared/config/routes';
import { AUTH_COOKIE_NAMES } from '@/shared/lib/auth-cookies';
import { CUSTOMER_AUTH_COOKIE_NAMES } from '@/shared/lib/customer-auth-cookies';
import {
  PLATFORM_PROTECTED_PREFIXES,
} from '@/shared/config/platform-protected-paths';
import {
  isPlatformOnlyPath,
  isTenantOnlyPath,
  resolveHostContext,
} from '@/shared/lib/host-context';

const ADMIN_PROTECTED_PREFIX = '/admin';
const ADMIN_PUBLIC_ROUTES = [
  ROUTES.ADMIN_LOGIN,
  ROUTES.ADMIN_LOGIN_STAFF,
  ROUTES.ADMIN_ACCEPT_INVITE,
];
const PLATFORM_PROTECTED_PREFIXES_LIST = [...PLATFORM_PROTECTED_PREFIXES];
const PLATFORM_AUTH_ROUTES = [ROUTES.PLATFORM_LOGIN];
const USER_PROTECTED_PREFIX = '/user';
const USER_AUTH_ROUTES = [ROUTES.USER_LOGIN];

function hasAdminSession(request: NextRequest): boolean {
  const hasSessionHint =
    request.cookies.get(AUTH_COOKIE_NAMES.SESSION)?.value === '1';
  const hasRefreshToken = Boolean(
    request.cookies.get(AUTH_COOKIE_NAMES.REFRESH_TOKEN)?.value,
  );
  return hasSessionHint && hasRefreshToken;
}

function hasCustomerSession(request: NextRequest): boolean {
  return Boolean(
    request.cookies.get(CUSTOMER_AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value,
  );
}

export function createProxyHandler() {
  return function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const hostCtx = resolveHostContext(request.headers.get('host') ?? '');
    const requestHeaders = new Headers(request.headers);

    if (hostCtx.subdomain) {
      requestHeaders.set('x-tenant-subdomain', hostCtx.subdomain);
    }

    const next = () =>
      NextResponse.next({
        request: { headers: requestHeaders },
      });

    if (hostCtx.scope === 'platform') {
      if (isTenantOnlyPath(pathname)) {
        return NextResponse.redirect(
          new URL(ROUTES.PLATFORM_DASHBOARD, request.url),
        );
      }

      const isPlatformProtected = PLATFORM_PROTECTED_PREFIXES_LIST.some((prefix) =>
        pathname.startsWith(prefix),
      );
      const isPlatformAuth = PLATFORM_AUTH_ROUTES.some((route) =>
        pathname.startsWith(route),
      );
      const session = hasAdminSession(request);

      if (isPlatformProtected && !session) {
        return NextResponse.redirect(
          new URL(ROUTES.PLATFORM_LOGIN, request.url),
        );
      }

      if (isPlatformAuth && session) {
        return NextResponse.redirect(
          new URL(ROUTES.PLATFORM_DASHBOARD, request.url),
        );
      }

      return next();
    }

    if (hostCtx.scope === 'tenant' && isPlatformOnlyPath(pathname)) {
      return NextResponse.redirect(new URL(ROUTES.ADMIN_DASHBOARD, request.url));
    }

    const isAdminProtected =
      pathname.startsWith(ADMIN_PROTECTED_PREFIX) &&
      !ADMIN_PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
    const isAdminAuth = ADMIN_PUBLIC_ROUTES.some(
      (r) =>
        pathname.startsWith(r) &&
        r !== ROUTES.ADMIN_ACCEPT_INVITE,
    );
    const adminSession = hasAdminSession(request);

    if (isAdminProtected && !adminSession) {
      return NextResponse.redirect(new URL(ROUTES.ADMIN_LOGIN, request.url));
    }

    if (isAdminAuth && adminSession) {
      return NextResponse.redirect(new URL(ROUTES.ADMIN_DASHBOARD, request.url));
    }

    const isUserProtected =
      pathname.startsWith(USER_PROTECTED_PREFIX) &&
      !USER_AUTH_ROUTES.some((r) => pathname.startsWith(r));
    const isUserAuth = USER_AUTH_ROUTES.some((r) => pathname.startsWith(r));
    const customerSession = hasCustomerSession(request);

    if (isUserProtected && !customerSession) {
      return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
    }

    if (isUserAuth && customerSession) {
      return NextResponse.redirect(new URL(ROUTES.USER_DASHBOARD, request.url));
    }

    return next();
  };
}

export const proxy = createProxyHandler();
