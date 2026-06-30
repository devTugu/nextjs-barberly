'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import { shopQueryParams } from '@/shared/hooks/use-shop-tenant';
import type {
  CreateServiceInput,
  ServiceOutput,
  UpdateServiceInput,
} from '../types/service';
import { serviceKeys } from './queries';

export const useCreateService = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateServiceInput) =>
      api.post<ServiceOutput>(API_ENDPOINTS.SERVICES.LIST, data, {
        params: shopQueryParams(tenant),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.list(tenant) });
    },
  });
};

export const useUpdateService = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateServiceInput }) =>
      api.patch<ServiceOutput>(API_ENDPOINTS.SERVICES.BY_ID(id), data, {
        params: shopQueryParams(tenant),
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.list(tenant) });
      queryClient.invalidateQueries({
        queryKey: serviceKeys.detail(tenant, id),
      });
    },
  });
};

export const useDeleteService = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete<void>(API_ENDPOINTS.SERVICES.BY_ID(id), {
        params: shopQueryParams(tenant),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.list(tenant) });
    },
  });
};
