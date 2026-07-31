'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { listQueryOptions } from '@/shared/api/list-query-options';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import { tenantQueryParams } from '@/shared/hooks/use-tenant-subdomain';
import type { ServiceOutput } from '../types/service';

export const serviceKeys = {
  all: ['services'] as const,
  lists: () => [...serviceKeys.all, 'list'] as const,
  list: (tenant: string) => [...serviceKeys.lists(), tenant] as const,
  details: () => [...serviceKeys.all, 'detail'] as const,
  detail: (tenant: string, id: number) =>
    [...serviceKeys.details(), tenant, id] as const,
};

export const useServices = (tenant: string) => {
  return useQuery({
    queryKey: serviceKeys.list(tenant),
    queryFn: () =>
      api.get<ServiceOutput[]>(API_ENDPOINTS.SERVICES.LIST, {
        params: tenantQueryParams(tenant),
      }),
    ...listQueryOptions,
  });
};

export const useService = (tenant: string, id: number, enabled = true) => {
  return useQuery({
    queryKey: serviceKeys.detail(tenant, id),
    queryFn: () =>
      api.get<ServiceOutput>(API_ENDPOINTS.SERVICES.BY_ID(id), {
        params: tenantQueryParams(tenant),
      }),
    enabled: enabled && id > 0,
  });
};
