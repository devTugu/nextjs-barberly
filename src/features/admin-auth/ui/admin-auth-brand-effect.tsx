'use client';

import { useEffect, useState } from 'react';
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

export function AdminAuthBrandEffect() {
  const [tenant, setTenant] = useState(DEFAULT_TENANT_SUBDOMAIN);
  const { data } = useMyTenant(tenant);
  const brandColor = data?.settings.brandColor;

  useEffect(() => {
    setTenant(getBrowserTenant());
  }, []);

  useEffect(() => {
    applyBrandPrimary(brandColor);
  }, [brandColor]);

  return null;
}
