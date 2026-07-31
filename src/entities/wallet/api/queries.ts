'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { listQueryOptions } from '@/shared/api/list-query-options';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import { tenantQueryParams } from '@/shared/hooks/use-tenant-subdomain';
import type {
  WalletBalance,
  WalletTransactionListResult,
} from '../types/wallet';

export interface WalletWithdrawalRequest {
  id: number;
  tenantId: number;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  reference: string | null;
  createdAt: string;
  batchId?: number | null;
}

export interface WalletWithdrawalListResult {
  items: WalletWithdrawalRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface BrandBranchBalance {
  tenantId: number;
  name: string;
  subdomain: string;
  balance: number;
}

export interface BrandBranchBalancesResult {
  brandRootId: number;
  brandName: string;
  currency: string;
  branches: BrandBranchBalance[];
}

export const walletKeys = {
  all: ['wallet'] as const,
  balance: (tenant: string) => [...walletKeys.all, 'balance', tenant] as const,
  brandBranchBalances: (tenant: string) =>
    [...walletKeys.all, 'brand-branch-balances', tenant] as const,
  transactions: (tenant: string, params: { page?: number; limit?: number }) =>
    [...walletKeys.all, 'transactions', tenant, params] as const,
  withdrawals: (
    tenant: string,
    params: { page?: number; limit?: number; status?: string },
  ) => [...walletKeys.all, 'withdrawals', tenant, params] as const,
};

export const useWalletBalance = (tenant: string) => {
  return useQuery({
    queryKey: walletKeys.balance(tenant),
    queryFn: () =>
      api.get<WalletBalance>(API_ENDPOINTS.WALLET.BALANCE, {
        params: tenantQueryParams(tenant),
      }),
    ...listQueryOptions,
  });
};

export const useBrandBranchBalances = (tenant: string, enabled = true) => {
  return useQuery({
    queryKey: walletKeys.brandBranchBalances(tenant),
    queryFn: () =>
      api.get<BrandBranchBalancesResult>(
        API_ENDPOINTS.WALLET.BRAND_BRANCH_BALANCES,
        { params: tenantQueryParams(tenant) },
      ),
    enabled: Boolean(tenant) && enabled,
    ...listQueryOptions,
  });
};

export const useWalletTransactions = (
  tenant: string,
  params: { page?: number; limit?: number },
) => {
  return useQuery({
    queryKey: walletKeys.transactions(tenant, params),
    queryFn: async () => {
      const result = await api.get<WalletTransactionListResult>(
        API_ENDPOINTS.WALLET.TRANSACTIONS,
        { params: { ...tenantQueryParams(tenant), ...params } },
      );
      return {
        ...result,
        totalPages: Math.ceil(result.total / (result.limit || 20)) || 1,
      };
    },
    ...listQueryOptions,
  });
};

export const useWalletWithdrawals = (
  tenant: string,
  params: { page?: number; limit?: number; status?: string },
) => {
  return useQuery({
    queryKey: walletKeys.withdrawals(tenant, params),
    queryFn: async () => {
      const result = await api.get<WalletWithdrawalListResult>(
        API_ENDPOINTS.WALLET.WITHDRAWALS,
        { params: { ...tenantQueryParams(tenant), ...params } },
      );
      return {
        ...result,
        totalPages: Math.ceil(result.total / (result.limit || 20)) || 1,
      };
    },
    ...listQueryOptions,
  });
};
