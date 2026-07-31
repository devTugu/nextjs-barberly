import { ROUTES } from '@/shared/config/routes';

/** Platform routes that require an authenticated admin session. */
export const PLATFORM_PROTECTED_PREFIXES = [
  ROUTES.PLATFORM_DASHBOARD,
  ROUTES.PLATFORM_TENANTS,
  ROUTES.PLATFORM_ANALYTICS,
  ROUTES.PLATFORM_WITHDRAWALS,
  ROUTES.PLATFORM_USERS,
  ROUTES.PLATFORM_ROLES,
  ROUTES.PLATFORM_PERMISSIONS,
  ROUTES.PLATFORM_AUDIT,
  ROUTES.PLATFORM_SECURITY,
  ROUTES.PLATFORM_SUPPORT,
  ROUTES.PLATFORM_LANDING,
] as const;

/** Platform-only paths on tenant hosts (redirect to platform dashboard). */
export const PLATFORM_ONLY_PREFIXES = [
  '/tenants',
  '/analytics',
  '/withdrawals',
  '/users',
  '/roles',
  '/permissions',
  '/audit',
  '/security',
  '/support',
  '/landing',
] as const;

export function isPlatformProtectedPath(pathname: string): boolean {
  return PLATFORM_PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
}

export function isPlatformOnlyPath(pathname: string): boolean {
  if (pathname === '/login' || pathname === '/dashboard') return true;
  return PLATFORM_ONLY_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
