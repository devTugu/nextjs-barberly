'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useMyTenant } from '@/entities/tenant';
import { applyBrandPrimary } from '@/shared/lib/apply-brand-primary';
import {
  DEFAULT_TENANT_SUBDOMAIN,
  resolveTenantSubdomain,
} from '@/shared/lib/host-context';

function getBrowserTenant(): string {
  if (typeof window === 'undefined') return DEFAULT_TENANT_SUBDOMAIN;
  const queryTenant = new URLSearchParams(window.location.search).get('tenant');
  return resolveTenantSubdomain(window.location.hostname, queryTenant);
}

function subscribeLocation(onStoreChange: () => void): () => void {
  window.addEventListener('popstate', onStoreChange);
  return () => window.removeEventListener('popstate', onStoreChange);
}

export function AdminAuthBrandEffect() {
  const tenant = useSyncExternalStore(
    subscribeLocation,
    getBrowserTenant,
    () => DEFAULT_TENANT_SUBDOMAIN,
  );
  const { data } = useMyTenant(tenant);
  const brandColor = data?.settings.brandColor;

  useEffect(() => {
    applyBrandPrimary(brandColor);
  }, [brandColor]);

  return null;
}
