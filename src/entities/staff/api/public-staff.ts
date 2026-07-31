'use client';

import { useQuery } from '@tanstack/react-query';
import { publicGet } from '@/shared/lib/public-api';

export interface PublicStaffOutput {
  id: number;
  tenantId: number;
  displayName: string;
  isActive: boolean;
  isDefault: boolean;
}

export const publicStaffKeys = {
  all: ['public-staff'] as const,
  list: (tenant: string) => [...publicStaffKeys.all, tenant] as const,
};

export function usePublicStaffList(tenant: string, enabled = true) {
  return useQuery({
    queryKey: publicStaffKeys.list(tenant),
    queryFn: () =>
      publicGet<PublicStaffOutput[]>('/staff', tenant),
    enabled: Boolean(tenant) && enabled,
  });
}
