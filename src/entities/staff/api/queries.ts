'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { listQueryOptions } from '@/shared/api/list-query-options';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import { shopQueryParams } from '@/shared/hooks/use-shop-tenant';

export interface StaffOutput {
  id: number;
  tenantId: number;
  userId: number | null;
  displayName: string;
  isActive: boolean;
  isDefault: boolean;
}

export const staffKeys = {
  all: ['staff'] as const,
  list: (tenant: string) => [...staffKeys.all, 'list', tenant] as const,
};

export const useStaffList = (tenant: string, enabled = true) => {
  return useQuery({
    queryKey: staffKeys.list(tenant),
    queryFn: () =>
      api.get<StaffOutput[]>(API_ENDPOINTS.STAFF.LIST, {
        params: shopQueryParams(tenant),
      }),
    enabled,
    ...listQueryOptions,
  });
};
