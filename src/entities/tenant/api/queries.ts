'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { listQueryOptions } from '@/shared/api/list-query-options';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import type { ListQueryParams, PaginatedResult } from '@/shared/api';
import type { Tenant } from '../types/tenant';

export const tenantKeys = {
  all: ['tenants'] as const,
  lists: () => [...tenantKeys.all, 'list'] as const,
  list: (params: ListQueryParams) => [...tenantKeys.lists(), params] as const,
  details: () => [...tenantKeys.all, 'detail'] as const,
  detail: (id: number) => [...tenantKeys.details(), id] as const,
};

export const useTenants = (params: ListQueryParams) => {
  return useQuery({
    queryKey: tenantKeys.list(params),
    queryFn: () =>
      api.get<PaginatedResult<Tenant>>(API_ENDPOINTS.TENANTS.LIST, { params }),
    ...listQueryOptions,
  });
};

export const useTenant = (id: number, enabled = true) => {
  return useQuery({
    queryKey: tenantKeys.detail(id),
    queryFn: () => api.get<Tenant>(API_ENDPOINTS.TENANTS.BY_ID(id)),
    enabled: enabled && id > 0,
  });
};
