'use client';

import { useEffect, useState } from 'react';
import { publicGet } from '@/shared/lib/public-api';
import { applyBrandPrimary } from '@/shared/lib/apply-brand-primary';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';

export function TenantBrandBootstrap() {
  const tenant = useTenantSubdomain();
  const [brandColor, setBrandColor] = useState<string | null | undefined>(
    undefined,
  );

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
