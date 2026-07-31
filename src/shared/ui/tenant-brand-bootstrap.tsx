'use client';

import { useEffect, useState } from 'react';
import { publicGet } from '@/shared/lib/public-api';
import { applyBrandPrimary } from '@/shared/lib/apply-brand-primary';
import {
  DEFAULT_TENANT_SUBDOMAIN,
  resolveTenantSubdomain,
} from '@/shared/lib/host-context';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';

function getBrowserTenant(): string {
  if (typeof window === 'undefined') return DEFAULT_TENANT_SUBDOMAIN;
  const queryTenant = new URLSearchParams(window.location.search).get('tenant');
  return resolveTenantSubdomain(window.location.hostname, queryTenant);
}

export function TenantBrandBootstrap() {
  const tenantFromHook = useTenantSubdomain();
  const [tenant, setTenant] = useState(tenantFromHook || DEFAULT_TENANT_SUBDOMAIN);
  const [brandColor, setBrandColor] = useState<string | null | undefined>(
    undefined,
  );

  useEffect(() => {
    setTenant(tenantFromHook || getBrowserTenant());
  }, [tenantFromHook]);

  useEffect(() => {
    if (!tenant) return;
    let cancelled = false;
    publicGet<{ settings?: { brandColor?: string | null } }>('/tenant', tenant)
      .then((data) => {
        if (!cancelled) setBrandColor(data.settings?.brandColor ?? null);
      })
      .catch(() => {
        if (!cancelled) setBrandColor(null);
      });
    return () => {
      cancelled = true;
    };
  }, [tenant]);

  useEffect(() => {
    if (brandColor === undefined) return;
    applyBrandPrimary(brandColor);
  }, [brandColor]);

  return null;
}
