'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import { tenantQueryParams } from '@/shared/hooks/use-tenant-subdomain';

export interface FinanceSummary {
  tenantId: number;
  currency: string;
  withdrawableBalance: number;
  ownerAvailable: number;
  tenantEscrow: number;
  rentInvoice: number;
  staffEarnings: Array<{ staffId: number | null; balance: number }>;
}

export const financeKeys = {
  all: ['finance'] as const,
  summary: (tenant: string) => [...financeKeys.all, 'summary', tenant] as const,
  earnings: (tenant: string) => [...financeKeys.all, 'earnings', tenant] as const,
};

export function useFinanceSummary(tenant: string) {
  return useQuery({
    queryKey: financeKeys.summary(tenant),
    queryFn: () =>
      api.get<FinanceSummary>(API_ENDPOINTS.FINANCE.SUMMARY, {
        params: tenantQueryParams(tenant),
      }),
    enabled: Boolean(tenant),
  });
}

export function useStaffEarnings(tenant: string) {
  return useQuery({
    queryKey: financeKeys.earnings(tenant),
    queryFn: () =>
      api.get<{ tenantId: number; staffId: number | null; balance: number; currency: string }>(
        API_ENDPOINTS.FINANCE.STAFF_EARNINGS,
        { params: tenantQueryParams(tenant) },
      ),
    enabled: Boolean(tenant),
  });
}
