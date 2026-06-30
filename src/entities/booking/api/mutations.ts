'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import { shopQueryParams } from '@/shared/hooks/use-shop-tenant';
import type { BookingOutput, ManualBookingInput } from '../types/booking';
import { bookingKeys } from './queries';

function invalidateBookings(
  queryClient: ReturnType<typeof useQueryClient>,
  tenant: string,
) {
  queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
  void tenant;
}

export const useCompleteBooking = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.patch<{ booking: BookingOutput }>(
        API_ENDPOINTS.BOOKINGS.COMPLETE(id),
        undefined,
        { params: shopQueryParams(tenant) },
      ),
    onSuccess: () => invalidateBookings(queryClient, tenant),
  });
};

export const useCancelBooking = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.patch<{ booking: BookingOutput }>(
        API_ENDPOINTS.BOOKINGS.CANCEL(id),
        undefined,
        { params: shopQueryParams(tenant) },
      ),
    onSuccess: () => invalidateBookings(queryClient, tenant),
  });
};

export const useNoShowBooking = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.patch<BookingOutput>(API_ENDPOINTS.BOOKINGS.NO_SHOW(id), undefined, {
        params: shopQueryParams(tenant),
      }),
    onSuccess: () => invalidateBookings(queryClient, tenant),
  });
};

export const useConfirmBooking = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.patch<BookingOutput>(API_ENDPOINTS.BOOKINGS.CONFIRM(id), undefined, {
        params: shopQueryParams(tenant),
      }),
    onSuccess: () => invalidateBookings(queryClient, tenant),
  });
};

export const useCreateManualBooking = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ManualBookingInput) =>
      api.post<BookingOutput>(API_ENDPOINTS.BOOKINGS.MANUAL, data, {
        params: shopQueryParams(tenant),
      }),
    onSuccess: () => invalidateBookings(queryClient, tenant),
  });
};
