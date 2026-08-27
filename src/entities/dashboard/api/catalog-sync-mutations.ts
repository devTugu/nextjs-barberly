'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import { tenantQueryParams } from '@/shared/hooks/use-tenant-subdomain';
import { dashboardKeys } from './queries';
import type { BrandCatalogSyncStatus } from '../types/brand-catalog-sync';

export function useApplyBrandCatalogSync(tenant: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (branchTenantIds?: number[]) =>
      api.post<BrandCatalogSyncStatus>(
        API_ENDPOINTS.DASHBOARD.BRAND_CATALOG_SYNC,
        branchTenantIds?.length ? { branchTenantIds } : {},
        { params: tenantQueryParams(tenant) },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: dashboardKeys.brandCatalogSync(tenant),
      });
    },
  });
}
