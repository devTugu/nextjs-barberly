'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useMe } from '@/entities/user';
import { useAuthStore } from '../model/store';
import { useAuthPermissions } from '../hooks/use-permissions';
import { resolveAdminLoginPath } from '@/shared/lib/admin-auth-routes';
import { redirectToLogin } from '@/shared/lib/clear-client-session';
import { sessionHint } from '@/shared/lib/session-hint';
import { Skeleton } from '@/shared/ui/skeleton';
import { ROUTES } from '@/shared/config/routes';

const STAFF_ALLOWED_PREFIXES = [
  ROUTES.ADMIN_CALENDAR,
  ROUTES.ADMIN_BOOKINGS,
  ROUTES.ADMIN_SCHEDULE,
  ROUTES.ADMIN_EARNINGS,
];

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);
  const user = useAuthStore((s) => s.user);
  const hasSession = sessionHint.hasSession();
  const { isStaff } = useAuthPermissions();

  const { data, isLoading, isError } = useMe(hasSession);

  useEffect(() => {
    if (!hasSession) {
      router.replace(resolveAdminLoginPath(pathname));
      return;
    }
    if (data) setSession(data);
    if (isError) {
      clearSession();
      redirectToLogin();
    }
  }, [hasSession, data, isError, router, pathname, setSession, clearSession]);

  useEffect(() => {
    if (!isStaff || !pathname) return;
    const allowed = STAFF_ALLOWED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
    if (!allowed) {
      router.replace(ROUTES.ADMIN_CALENDAR);
    }
  }, [isStaff, pathname, router]);

  if (!hasSession || isLoading || (!user && !data)) {
    return (
      <div className="flex min-h-svh flex-col gap-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return <>{children}</>;
};
