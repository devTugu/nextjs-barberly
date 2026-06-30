'use client';

import { useSearchParams } from 'next/navigation';

const DEFAULT_TENANT = 'demo';

export function useShopTenant(): string {
  const searchParams = useSearchParams();
  return searchParams.get('tenant') ?? DEFAULT_TENANT;
}

export function shopQueryParams(
  tenant: string,
  extra?: Record<string, string | number | undefined>,
) {
  return { tenant, ...extra };
}
