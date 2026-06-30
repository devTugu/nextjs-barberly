'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import type { DashboardStats } from '../types/dashboard-stats';
import type { PlatformFinance } from '../types/platform-finance';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  platformFinance: (month: string) =>
    [...dashboardKeys.all, 'platform-finance', month] as const,
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => api.get<DashboardStats>(API_ENDPOINTS.DASHBOARD.STATS),
    staleTime: 30 * 1000,
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
