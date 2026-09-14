'use client';

import { useEffect, useState } from 'react';
import {
  startDepositPaymentUseCase,
  watchDepositConfirmationUseCase,
  type BookingPayResult,
} from '@/entities/booking';
import { isAbortError } from '@/shared/lib/abortable-wait';

export interface DepositPaymentFlowAdapters {
  onConfirmed: (bookingId: number) => void;
  onExpired: () => void;
  onStartError?: (message: string) => void;
}

/** Owns deposit start + confirmation watch. Router/toast stay in adapters. */
export function useDepositPaymentFlow(
  tenant: string,
  bookingId: number | null,
  fallbackTotalPrice: number,
  adapters: DepositPaymentFlowAdapters,
) {
  const [payment, setPayment] = useState<BookingPayResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const retry = () => {
    setPayment(null);
    setError(null);
  };

  useEffect(() => {
    if (!bookingId || payment) return;
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const result = await startDepositPaymentUseCase(
          tenant,
          bookingId,
          fallbackTotalPrice,
        );
        if (!cancelled) setPayment(result);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Payment failed';
        if (!cancelled) {
          setError(message);
          adapters.onStartError?.(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, fallbackTotalPrice, payment, tenant]);

  useEffect(() => {
    if (!bookingId || !payment) return;
    const controller = new AbortController();
    setPolling(true);
    void watchDepositConfirmationUseCase(
      tenant,
      bookingId,
      {
        onConfirmed: () => adapters.onConfirmed(bookingId),
        onExpired: () => adapters.onExpired(),
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

  return { payment, loading, polling, error, retry, setError, setLoading };
}
