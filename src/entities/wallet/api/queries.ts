'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { listQueryOptions } from '@/shared/api/list-query-options';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import { shopQueryParams } from '@/shared/hooks/use-shop-tenant';
import type {
  WalletBalance,
  WalletTransactionListResult,
} from '../types/wallet';

export const walletKeys = {
  all: ['wallet'] as const,
  balance: (tenant: string) => [...walletKeys.all, 'balance', tenant] as const,
  transactions: (tenant: string, params: { page?: number; limit?: number }) =>
    [...walletKeys.all, 'transactions', tenant, params] as const,
};

export const useWalletBalance = (tenant: string) => {
  return useQuery({
    queryKey: walletKeys.balance(tenant),
    queryFn: () =>
      api.get<WalletBalance>(API_ENDPOINTS.WALLET.BALANCE, {
        params: shopQueryParams(tenant),
      }),
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
        { params: { ...shopQueryParams(tenant), ...params } },
      );
      return {
        ...result,
        totalPages: Math.ceil(result.total / (result.limit || 20)) || 1,
      };
    },
    ...listQueryOptions,
  });
};
