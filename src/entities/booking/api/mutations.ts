'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import { tenantQueryParams } from '@/shared/hooks/use-tenant-subdomain';
import type { BookingOutput, ManualBookingInput } from '../types/booking';
import { bookingKeys } from './queries';

function invalidateBookings(
  queryClient: ReturnType<typeof useQueryClient>,
  tenant: string,
) {
  queryClient.invalidateQueries({ queryKey: bookingKeys.all });
  void tenant;
}

export const useCompleteBooking = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.patch<{ booking: BookingOutput }>(
        API_ENDPOINTS.BOOKINGS.COMPLETE(id),
        undefined,
        { params: tenantQueryParams(tenant) },
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
        { params: tenantQueryParams(tenant) },
      ),
    onSuccess: () => invalidateBookings(queryClient, tenant),
  });
};

export const useNoShowBooking = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.patch<BookingOutput>(API_ENDPOINTS.BOOKINGS.NO_SHOW(id), undefined, {
        params: tenantQueryParams(tenant),
      }),
    onSuccess: () => invalidateBookings(queryClient, tenant),
  });
};

export const useConfirmBooking = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.patch<BookingOutput>(API_ENDPOINTS.BOOKINGS.CONFIRM(id), undefined, {
        params: tenantQueryParams(tenant),
      }),
    onSuccess: () => invalidateBookings(queryClient, tenant),
  });
};

export const useCreateManualBooking = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ManualBookingInput) =>
      api.post<BookingOutput>(API_ENDPOINTS.BOOKINGS.MANUAL, data, {
        params: tenantQueryParams(tenant),
      }),
    onSuccess: () => invalidateBookings(queryClient, tenant),
  });
};

export type OfflineSettlementMethod = 'cash' | 'card';

export const useOfflineSettlement = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      method,
    }: {
      id: number;
      method: OfflineSettlementMethod;
    }) =>
      api.post<{ booking: BookingOutput }>(
        API_ENDPOINTS.BOOKINGS.OFFLINE_SETTLEMENT(id),
        { method },
        { params: tenantQueryParams(tenant) },
      ),
    onSuccess: () => invalidateBookings(queryClient, tenant),
  });
};

export const useReopenSettlement = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.post<BookingOutput>(
        API_ENDPOINTS.BOOKINGS.REOPEN_SETTLEMENT(id),
        undefined,
        { params: tenantQueryParams(tenant) },
      ),
    onSuccess: () => invalidateBookings(queryClient, tenant),
  });
};
