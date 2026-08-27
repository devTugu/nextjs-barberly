'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import { tenantQueryParams } from '@/shared/hooks/use-tenant-subdomain';
import type { WalletTransaction, WithdrawInput } from '../types/wallet';
import { walletKeys } from './queries';
import { withdrawalKeys } from '@/entities/withdrawal';

export const useRequestWithdrawal = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: WithdrawInput) =>
      api.post<WalletTransaction>(API_ENDPOINTS.WALLET.WITHDRAW, data, {
        params: tenantQueryParams(tenant),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
};

export interface WithdrawBatchItemInput {
  tenantId: number;
  amount: number;
}

export interface WithdrawBatchInput {
  items: WithdrawBatchItemInput[];
  reference?: string;
}

export const useRequestWithdrawalBatch = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: WithdrawBatchInput) =>
      api.post(API_ENDPOINTS.WALLET.WITHDRAW_BATCH, data, {
        params: tenantQueryParams(tenant),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      queryClient.invalidateQueries({ queryKey: withdrawalKeys.all });
    },
  });
};
