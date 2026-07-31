'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import { tenantQueryParams } from '@/shared/hooks/use-tenant-subdomain';
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
        params: tenantQueryParams(tenant),
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
        params: tenantQueryParams(tenant),
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
        params: tenantQueryParams(tenant),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.list(tenant) });
    },
  });
};
