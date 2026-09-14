'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  bookingKeys,
  cancelBookingCommand,
  completeBookingCommand,
  confirmBookingCommand,
  createManualBookingCommand,
  noShowBookingCommand,
  offlineSettlementCommand,
  reopenSettlementCommand,
  type ManualBookingInput,
  type OfflineSettlementMethod,
} from '@/entities/booking';

function invalidateBookings(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: bookingKeys.all });
}

export const useCompleteBooking = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => completeBookingCommand(tenant, id),
    onSuccess: () => invalidateBookings(queryClient),
  });
};

export const useCancelBooking = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelBookingCommand(tenant, id),
    onSuccess: () => invalidateBookings(queryClient),
  });
};

export const useNoShowBooking = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => noShowBookingCommand(tenant, id),
    onSuccess: () => invalidateBookings(queryClient),
  });
};

export const useConfirmBooking = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => confirmBookingCommand(tenant, id),
    onSuccess: () => invalidateBookings(queryClient),
  });
};

export const useCreateManualBooking = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ManualBookingInput) =>
      createManualBookingCommand(tenant, data),
    onSuccess: () => invalidateBookings(queryClient),
  });
};

export const useOfflineSettlement = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      method,
    }: {
      id: number;
      method: OfflineSettlementMethod;
    }) => offlineSettlementCommand(tenant, id, method),
    onSuccess: () => invalidateBookings(queryClient),
  });
};

export const useReopenSettlement = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reopenSettlementCommand(tenant, id),
    onSuccess: () => invalidateBookings(queryClient),
  });
};
