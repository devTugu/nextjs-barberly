'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { listQueryOptions } from '@/shared/api/list-query-options';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import { tenantQueryParams } from '@/shared/hooks/use-tenant-subdomain';
import type { BookingListParams, BookingListResult } from '../types/booking';

export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (tenant: string, params: BookingListParams) =>
    [...bookingKeys.lists(), tenant, params] as const,
};

export const useBookings = (tenant: string, params: BookingListParams) => {
  return useQuery({
    queryKey: bookingKeys.list(tenant, params),
    queryFn: async () => {
      const result = await api.get<BookingListResult>(
        API_ENDPOINTS.BOOKINGS.LIST,
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
