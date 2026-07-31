'use client';

import { ROUTES } from '@/shared/config/routes';
import { resolveAdminLoginPath } from '@/shared/lib/admin-auth-routes';
import { mutatingFetchHeaders } from '@/shared/lib/csrf-client';
import { sessionHint } from '@/shared/lib/session-hint';

export async function clearClientSession(): Promise<void> {
  sessionHint.clear();

  try {
    const headers = await mutatingFetchHeaders().catch(() => ({}));
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers,
    });
  } catch {
    // Stale or invalid cookies — local hint is already cleared.
  }
}

export function redirectToLogin(): void {
  if (typeof window === 'undefined') return;

  void clearClientSession().finally(() => {
    if (
      !window.location.pathname.startsWith(ROUTES.PLATFORM_LOGIN) &&
      !window.location.pathname.startsWith(ROUTES.ADMIN_LOGIN)
    ) {
      window.location.href = resolveAdminLoginPath(window.location.pathname);
    }
  });
}
