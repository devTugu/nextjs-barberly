'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import type { DashboardStats } from '../types/dashboard-stats';
import type { PlatformFinance } from '../types/platform-finance';
import type { PlatformFinanceTrend } from '../types/platform-finance-trend';
import type { BrandDashboard } from '../types/brand-dashboard';
import type { BrandCatalogSyncStatus } from '../types/brand-catalog-sync';
import type { TenantDashboardStats } from '../types/tenant-dashboard-stats';
import { tenantQueryParams } from '@/shared/hooks/use-tenant-subdomain';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  tenantStats: (tenant: string, range?: { fromUtc?: string; toUtc?: string }) =>
    [...dashboardKeys.all, 'tenant-stats', tenant, range] as const,
  brandDashboard: (
    tenant: string,
    range?: { from?: string; to?: string },
  ) => [...dashboardKeys.all, 'brand', tenant, range] as const,
  brandCatalogSync: (tenant: string) =>
    [...dashboardKeys.all, 'brand-catalog-sync', tenant] as const,
  platformFinance: (month: string) =>
    [...dashboardKeys.all, 'platform-finance', month] as const,
  platformFinanceTrend: (months: number) =>
    [...dashboardKeys.all, 'platform-finance-trend', months] as const,
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => api.get<DashboardStats>(API_ENDPOINTS.DASHBOARD.STATS),
    staleTime: 30 * 1000,
  });
};

export const useTenantDashboardStats = (
  tenant: string,
  range?: { fromUtc?: string; toUtc?: string },
) => {
  return useQuery({
    queryKey: dashboardKeys.tenantStats(tenant, range),
    queryFn: () =>
      api.get<TenantDashboardStats>(API_ENDPOINTS.DASHBOARD.TENANT_STATS, {
        params: { ...tenantQueryParams(tenant), ...range },
      }),
    staleTime: 30 * 1000,
    enabled: Boolean(tenant),
  });
};

export const useBrandDashboard = (
  tenant: string,
  range?: { from?: string; to?: string },
) => {
  return useQuery({
    queryKey: dashboardKeys.brandDashboard(tenant, range),
    queryFn: () =>
      api.get<BrandDashboard>(API_ENDPOINTS.DASHBOARD.BRAND, {
        params: { ...tenantQueryParams(tenant), ...range },
      }),
    staleTime: 30 * 1000,
    enabled: Boolean(tenant),
    retry: false,
  });
};

export const useBrandCatalogSyncStatus = (tenant: string, enabled = true) => {
  return useQuery({
    queryKey: dashboardKeys.brandCatalogSync(tenant),
    queryFn: () =>
      api.get<BrandCatalogSyncStatus>(
        API_ENDPOINTS.DASHBOARD.BRAND_CATALOG_SYNC,
        { params: tenantQueryParams(tenant) },
      ),
    staleTime: 30 * 1000,
    enabled: enabled && Boolean(tenant),
    retry: false,
  });
};

export const usePlatformFinance = (month: string) => {
  return useQuery({
    queryKey: dashboardKeys.platformFinance(month),
    queryFn: () =>
      api.get<PlatformFinance>(API_ENDPOINTS.DASHBOARD.PLATFORM_FINANCE, {
        params: { month },
      }),
    staleTime: 30 * 1000,
    enabled: Boolean(month),
  });
};

export const usePlatformFinanceTrend = (months: number) => {
  return useQuery({
    queryKey: dashboardKeys.platformFinanceTrend(months),
    queryFn: () =>
      api.get<PlatformFinanceTrend>(
        API_ENDPOINTS.DASHBOARD.PLATFORM_FINANCE_TREND,
        { params: { months } },
      ),
    staleTime: 60 * 1000,
  });
};
