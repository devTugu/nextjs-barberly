import { ROUTES } from '@/shared/config/routes';
import { isPlatformProtectedPath } from '@/shared/config/platform-protected-paths';

export function resolveAdminLoginPath(pathname: string): string {
  if (pathname.startsWith('/admin')) {
    return ROUTES.ADMIN_LOGIN;
  }
  return ROUTES.PLATFORM_LOGIN;
}

export function resolveAdminDashboardPath(pathname: string): string {
  if (pathname.startsWith('/admin')) {
    return ROUTES.ADMIN_DASHBOARD;
  }
  return ROUTES.PLATFORM_DASHBOARD;
}

export function isAdminAreaPath(pathname: string): boolean {
  return pathname.startsWith('/admin');
}

export function isPlatformAreaPath(pathname: string): boolean {
  return (
    pathname === ROUTES.PLATFORM_LOGIN || isPlatformProtectedPath(pathname)
  );
}
