'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import { tenantQueryParams } from '@/shared/hooks/use-tenant-subdomain';
import { bookingKeys } from './queries';
import type { BookingOutput } from '../types/booking';

export const useBooking = (tenant: string, bookingId: number) => {
  return useQuery({
    queryKey: [...bookingKeys.all, 'detail', tenant, bookingId] as const,
    queryFn: () =>
      api.get<BookingOutput>(API_ENDPOINTS.BOOKINGS.DETAIL(bookingId), {
        params: tenantQueryParams(tenant),
      }),
    enabled: bookingId > 0,
  });
};
