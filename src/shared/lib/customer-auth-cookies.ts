import type { NextResponse } from 'next/server';

export const CUSTOMER_AUTH_COOKIE_NAMES = {
  ACCESS_TOKEN: 'customerAccessToken',
  SESSION: 'customerSession',
} as const;

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Shared parent-domain cookie for brand-group SSO (ADR-019).
 *
 * - Production: `.barberly.mn` (or NEXT_PUBLIC_ROOT_DOMAIN)
 * - Development default: **host-only** (no Domain) — `.localhost` is unreliable
 *   in Chrome/Safari and causes "No customer session" right after OTP.
 * - Opt-in shared domain in dev: set CUSTOMER_COOKIE_DOMAIN=.barberly.test
 * - Force host-only anywhere: CUSTOMER_COOKIE_HOST_ONLY=1
 */
export function resolveCustomerCookieDomain(): string | undefined {
  if (process.env.CUSTOMER_COOKIE_HOST_ONLY === '1') {
    return undefined;
  }
  const explicit = process.env.CUSTOMER_COOKIE_DOMAIN?.trim();
  if (explicit) {
    return explicit.startsWith('.') ? explicit : `.${explicit}`;
  }

  if (isProduction) {
    const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'barberly.mn';
    return root.startsWith('.') ? root : `.${root}`;
  }

  return undefined;
}

function cookieBase(httpOnly: boolean) {
  const domain = resolveCustomerCookieDomain();
  return {
    httpOnly,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    ...(domain ? { domain } : {}),
  };
}

/** Drop stale Domain=.localhost cookies that break host-only sessions. */
function clearLegacyLocalhostDomainCookies(response: NextResponse) {
  if (resolveCustomerCookieDomain()) return;
  for (const name of Object.values(CUSTOMER_AUTH_COOKIE_NAMES)) {
    response.cookies.set(name, '', {
      httpOnly: name !== CUSTOMER_AUTH_COOKIE_NAMES.SESSION,
      secure: false,
      sameSite: 'lax',
      path: '/',
      domain: '.localhost',
      maxAge: 0,
    });
  }
}

export function setCustomerAuthCookies(
  response: NextResponse,
  accessToken: string,
  expiresIn: number,
): NextResponse {
  clearLegacyLocalhostDomainCookies(response);

  response.cookies.set(CUSTOMER_AUTH_COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
    ...cookieBase(true),
    maxAge: expiresIn,
  });

  response.cookies.set(CUSTOMER_AUTH_COOKIE_NAMES.SESSION, '1', {
    ...cookieBase(false),
    maxAge: expiresIn,
  });

  return response;
}

export function clearCustomerAuthCookies(response: NextResponse): NextResponse {
  clearLegacyLocalhostDomainCookies(response);
  for (const name of Object.values(CUSTOMER_AUTH_COOKIE_NAMES)) {
    response.cookies.set(name, '', {
      ...cookieBase(name !== CUSTOMER_AUTH_COOKIE_NAMES.SESSION),
      maxAge: 0,
    });
  }
  return response;
}
