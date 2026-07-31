'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import { tenantQueryParams } from '@/shared/hooks/use-tenant-subdomain';
import type { Tenant } from '../types/tenant';

import type { TenantLandingContent } from '../types/landing-content';

export interface UpdateMyTenantInput {
  phone?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  brandColor?: string | null;
  slotLockMinutes?: number;
  cancelHoursBefore?: number | null;
  rescheduleHoursBefore?: number | null;
  depositPercent?: number | null;
  landingContent?: TenantLandingContent | null;
}

export const myTenantKeys = {
  all: ['my-tenant'] as const,
  detail: (tenant: string) => [...myTenantKeys.all, tenant] as const,
};

export const useMyTenant = (tenant: string, enabled = true) => {
  return useQuery({
    queryKey: myTenantKeys.detail(tenant),
    queryFn: () =>
      api.get<Tenant>(API_ENDPOINTS.MY_TENANT, {
        params: tenantQueryParams(tenant),
      }),
    enabled: enabled && Boolean(tenant),
    staleTime: 60 * 1000,
  });
};

export const useUpdateMyTenant = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateMyTenantInput) =>
      api.patch<Tenant>(API_ENDPOINTS.MY_TENANT, data, {
        params: tenantQueryParams(tenant),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myTenantKeys.detail(tenant) });
    },
  });
};
