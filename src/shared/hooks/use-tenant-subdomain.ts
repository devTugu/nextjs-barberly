'use client';

import { useSearchParams } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { resolveTenantSubdomain } from '@/shared/lib/host-context';

function getHostname(): string {
  if (typeof window === 'undefined') return 'localhost';
  return window.location.hostname;
}

function subscribeHostname(callback: () => void): () => void {
  window.addEventListener('popstate', callback);
  return () => window.removeEventListener('popstate', callback);
}

export function useTenantSubdomain(): string {
  const searchParams = useSearchParams();
  const queryTenant = searchParams.get('tenant');
  const hostname = useSyncExternalStore(
    subscribeHostname,
    getHostname,
    () => 'localhost',
  );
  return resolveTenantSubdomain(hostname, queryTenant);
}

/** @deprecated Use useTenantSubdomain */
export const useShopTenant = useTenantSubdomain;

export function tenantQueryParams(
  tenant: string,
  extra?: Record<string, string | number | undefined>,
) {
  const params: Record<string, string> = { tenant };
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value !== undefined) params[key] = String(value);
    }
  }
  return params;
}

/** @deprecated Use tenantQueryParams */
export const shopQueryParams = tenantQueryParams;
