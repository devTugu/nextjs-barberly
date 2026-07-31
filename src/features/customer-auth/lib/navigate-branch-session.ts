import { mutatingFetchHeaders } from '@/shared/lib/csrf-client';
import { tenantSiteUrl } from '@/shared/lib/tenant-url';

/**
 * ADR-019 preferred path: same-host session exchange, then navigate.
 * If not logged in, navigates without exchange (OTP on target).
 */
export async function navigateToBranchWithSession(
  targetSubdomain: string,
  path = '/book',
): Promise<void> {
  const target = targetSubdomain.trim().toLowerCase();
  const dest = tenantSiteUrl(target, path);

  try {
    const headers = await mutatingFetchHeaders();
    const res = await fetch('/api/customer-auth/session/exchange', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ targetSubdomain: target }),
    });
    if (res.status === 401) {
      window.location.href = dest;
      return;
    }
    if (!res.ok) {
      window.location.href = dest;
      return;
    }
  } catch {
    /* fall through to navigation */
  }

  window.location.href = dest;
}
