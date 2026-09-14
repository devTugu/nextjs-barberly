'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  publicBookingKeys,
  startBalancePaymentUseCase,
  watchBalanceClearedUseCase,
  type BookingPayResult,
} from '@/entities/booking';
import { isAbortError } from '@/shared/lib/abortable-wait';

export interface BalancePaymentFlowAdapters {
  onCleared: () => void;
  onStartError?: (message: string) => void;
}

/** Owns balance start + cleared watch. Toast stays in adapters. */
export function useBalancePaymentFlow(
  tenant: string,
  bookingId: number,
  adapters: BalancePaymentFlowAdapters,
) {
  const queryClient = useQueryClient();
  const [payment, setPayment] = useState<BookingPayResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startPayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await startBalancePaymentUseCase(tenant, bookingId);
      setPayment(result);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Payment failed';
      setError(message);
      adapters.onStartError?.(message);
    } finally {
      setLoading(false);
    }
  };

  const clearPayment = () => setPayment(null);

  const invalidateBooking = () =>
    queryClient.invalidateQueries({
      queryKey: publicBookingKeys.detail(tenant, bookingId),
    });

  useEffect(() => {
    if (!payment) return;
    const controller = new AbortController();
    setPolling(true);
    void watchBalanceClearedUseCase(
      tenant,
      bookingId,
      {
        onCleared: async () => {
          await invalidateBooking();
          adapters.onCleared();
          setPayment(null);
        },
      },
      { signal: controller.signal },
    )
      .catch((e) => {
        if (isAbortError(e)) return;
      })
      .finally(() => {
        if (!controller.signal.aborted) setPolling(false);
      });
    return () => {
      controller.abort();
      setPolling(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, payment, tenant]);

  return {
    payment,
    loading,
    polling,
    error,
    startPayment,
    clearPayment,
    setError,
    setLoading,
    invalidateBooking,
  };
}
