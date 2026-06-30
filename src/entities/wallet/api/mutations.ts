'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import { shopQueryParams } from '@/shared/hooks/use-shop-tenant';
import type { WalletTransaction, WithdrawInput } from '../types/wallet';
import { walletKeys } from './queries';

export const useRequestWithdrawal = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: WithdrawInput) =>
      api.post<WalletTransaction>(API_ENDPOINTS.WALLET.WITHDRAW, data, {
        params: shopQueryParams(tenant),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
};
