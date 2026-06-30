import type { NextResponse } from 'next/server';

export const CUSTOMER_AUTH_COOKIE_NAMES = {
  ACCESS_TOKEN: 'customerAccessToken',
  SESSION: 'customerSession',
} as const;

const isProduction = process.env.NODE_ENV === 'production';

const httpOnlyOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  path: '/',
};

export function setCustomerAuthCookies(
  response: NextResponse,
  accessToken: string,
  expiresIn: number,
): NextResponse {
  response.cookies.set(
    CUSTOMER_AUTH_COOKIE_NAMES.ACCESS_TOKEN,
    accessToken,
    {
      ...httpOnlyOptions,
      maxAge: expiresIn,
    },
  );

  response.cookies.set(CUSTOMER_AUTH_COOKIE_NAMES.SESSION, '1', {
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: expiresIn,
  });

  return response;
}

export function clearCustomerAuthCookies(response: NextResponse): NextResponse {
  for (const name of Object.values(CUSTOMER_AUTH_COOKIE_NAMES)) {
    response.cookies.set(name, '', {
      httpOnly: name !== CUSTOMER_AUTH_COOKIE_NAMES.SESSION,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
  }
  return response;
}
