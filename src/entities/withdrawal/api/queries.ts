'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type PaginatedResult } from '@/shared/api';
import { listQueryOptions } from '@/shared/api/list-query-options';
import { API_ENDPOINTS } from '@/shared/config/api.config';

export interface WithdrawalRequest {
  id: number;
  tenantId: number;
  walletTransactionId: number;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  reference: string | null;
  reviewedByUserId: number | null;
  reviewedByEmail: string | null;
  reviewedAt: string | null;
  rejectReason: string | null;
  createdAt: string;
  batchId: number | null;
}

export interface WithdrawalBatch {
  id: number;
  ownerUserId: number;
  brandRootId: number;
  status: 'pending' | 'approved' | 'rejected';
  totalAmount: number;
  branchCount: number;
  reference: string | null;
  reviewedByUserId: number | null;
  reviewedByEmail: string | null;
  reviewedAt: string | null;
  rejectReason: string | null;
  createdAt: string;
  requests?: WithdrawalRequest[];
}

export interface WithdrawalListParams {
  page?: number;
  limit?: number;
  status?: WithdrawalRequest['status'];
  tenantId?: number;
  standaloneOnly?: boolean;
}

export interface WithdrawalBatchListParams {
  page?: number;
  limit?: number;
  status?: WithdrawalBatch['status'];
  brandRootId?: number;
}

export const withdrawalKeys = {
  all: ['withdrawals'] as const,
  lists: () => [...withdrawalKeys.all, 'list'] as const,
  list: (params: WithdrawalListParams) =>
    [...withdrawalKeys.lists(), params] as const,
  batches: () => [...withdrawalKeys.all, 'batches'] as const,
  batchList: (params: WithdrawalBatchListParams) =>
    [...withdrawalKeys.batches(), params] as const,
  batchDetail: (id: number) =>
    [...withdrawalKeys.batches(), 'detail', id] as const,
  detail: (id: number) => [...withdrawalKeys.all, id] as const,
};

export function useWithdrawals(
  params: WithdrawalListParams = {},
  enabled = true,
  refetchInterval?: number | false,
) {
  return useQuery({
    queryKey: withdrawalKeys.list(params),
    queryFn: () =>
      api.get<PaginatedResult<WithdrawalRequest>>(
        API_ENDPOINTS.WITHDRAWALS.LIST,
        { params },
      ),
    enabled,
    refetchInterval: refetchInterval === false ? false : refetchInterval,
    ...listQueryOptions,
  });
}

export function useWithdrawalBatches(
  params: WithdrawalBatchListParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: withdrawalKeys.batchList(params),
    queryFn: () =>
      api.get<PaginatedResult<WithdrawalBatch>>(
        API_ENDPOINTS.WITHDRAWALS.BATCHES,
        { params },
      ),
    enabled,
    ...listQueryOptions,
  });
}

export function useWithdrawal(id: number) {
  return useQuery({
    queryKey: withdrawalKeys.detail(id),
    queryFn: () =>
      api.get<WithdrawalRequest>(API_ENDPOINTS.WITHDRAWALS.BY_ID(id)),
    enabled: id > 0,
  });
}

export function useApproveWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.patch(API_ENDPOINTS.WITHDRAWALS.APPROVE(id), {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: withdrawalKeys.all }),
  });
}

export function useRejectWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      api.patch(API_ENDPOINTS.WITHDRAWALS.REJECT(id), { reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: withdrawalKeys.all }),
  });
}

export function useApproveWithdrawalBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.patch(API_ENDPOINTS.WITHDRAWALS.BATCH_APPROVE(id), {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: withdrawalKeys.all }),
  });
}

export function useRejectWithdrawalBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      api.patch(API_ENDPOINTS.WITHDRAWALS.BATCH_REJECT(id), { reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: withdrawalKeys.all }),
  });
}
