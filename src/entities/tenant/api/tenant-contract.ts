'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { API_ENDPOINTS } from '@/shared/config/api.config';

export type PlanTier = 'starter' | 'pro' | 'enterprise';

export interface TenantContract {
  tenantId: number;
  planTier: PlanTier;
  monthlyFee: number;
  platformCommissionPercent: number;
  depositPercentOverride: number | null;
  createdAt: string;
}

export interface UpsertTenantContractInput {
  planTier: PlanTier;
  monthlyFee: number;
  platformCommissionPercent: number;
  depositPercentOverride?: number | null;
}

export const tenantContractKeys = {
  all: ['tenant-contract'] as const,
  detail: (tenantId: number) =>
    [...tenantContractKeys.all, tenantId] as const,
};

export const useTenantContract = (tenantId: number, enabled = true) => {
  return useQuery({
    queryKey: tenantContractKeys.detail(tenantId),
    queryFn: () =>
      api.get<TenantContract>(API_ENDPOINTS.TENANTS.CONTRACT(tenantId)),
    enabled: enabled && tenantId > 0,
    staleTime: 60 * 1000,
  });
};

export const useUpsertTenantContract = (tenantId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpsertTenantContractInput) =>
      api.patch<TenantContract>(
        API_ENDPOINTS.TENANTS.CONTRACT(tenantId),
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: tenantContractKeys.detail(tenantId),
      });
    },
  });
};
