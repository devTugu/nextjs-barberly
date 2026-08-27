'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  publicBookingKeys,
  type BookingPayResult,
} from '@/entities/booking';
import { formatMnt } from '@/entities/booking';
import { publicGet, publicPost } from '@/shared/lib/public-api';
import { Button } from '@/shared/ui/button';
import { simulateEnabled } from './user-booking-shared';

const QrCode = dynamic(
  () => import('react-qr-code').then((m) => m.default),
  { ssr: false },
);

export function UserBookingBalancePay({
  bookingId,
  remainingBalance,
  tenant,
}: {
  bookingId: number;
  remainingBalance: number;
  tenant: string;
}) {
  const t = useTranslations('userPortal');
  const tPay = useTranslations('bookingWizard.pay');
  const locale = useLocale();
  const queryClient = useQueryClient();
  const [payment, setPayment] = useState<BookingPayResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startPayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await publicPost<BookingPayResult>(
        `/bookings/${bookingId}/pay`,
        tenant,
        { kind: 'balance' },
      );
      setPayment(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('payBalanceFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!payment) return;
    setPolling(true);
    const id = window.setInterval(async () => {
      try {
        const booking = await publicGet<{ remainingBalance?: number }>(
          `/bookings/${bookingId}`,
          tenant,
        );
        if ((booking.remainingBalance ?? 0) <= 0) {
          window.clearInterval(id);
          queryClient.invalidateQueries({
            queryKey: publicBookingKeys.detail(tenant, bookingId),
          });
          toast.success(t('payBalanceSuccess'));
          setPayment(null);
        }
      } catch {
        /* keep polling */
      }
    }, 3000);
    return () => {
      window.clearInterval(id);
      setPolling(false);
    };
  }, [bookingId, payment, queryClient, t, tenant]);

  const simulatePay = async () => {
    if (!payment) return;
    setLoading(true);
    try {
      await publicPost('/webhooks/qpay/simulate', tenant, {
        invoice_id: payment.invoiceId,
        payment_id: `sim-${Date.now()}`,
        payment_status: 'PAID',
        payment_amount: payment.amount,
      });
      queryClient.invalidateQueries({
        queryKey: publicBookingKeys.detail(tenant, bookingId),
      });
      toast.success(t('payBalanceSuccess'));
      setPayment(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('payBalanceFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (payment) {
    return (
      <div className="space-y-3 rounded-xl border p-4">
        <p className="text-sm text-muted-foreground">{tPay('scanQr')}</p>
        <p className="text-2xl font-bold">
          {formatMnt(payment.amount, locale)}
        </p>
        <div className="flex justify-center rounded-xl border bg-white p-4">
          {payment.qrImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={payment.qrImage}
              alt="QPay QR"
              className="size-48 object-contain"
            />
          ) : (
            <QrCode value={payment.qrText} size={192} />
          )}
        </div>
        {payment.urls.map((item) => (
          <Button key={item.link} variant="outline" className="min-h-11 w-full" asChild>
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              {tPay('openBank', { name: item.name })}
            </a>
          </Button>
        ))}
        {polling ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            {tPay('waiting')}
          </p>
        ) : null}
        {simulateEnabled ? (
          <Button
            onClick={simulatePay}
            disabled={loading}
            className="min-h-11 w-full"
          >
            {tPay('simulate')}
          </Button>
        ) : null}
        <Button variant="ghost" onClick={() => setPayment(null)}>
          {t('back')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        className="min-h-11 w-full"
        disabled={loading}
        onClick={() => void startPayment()}
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : null}
        {t('payBalance', { amount: formatMnt(remainingBalance, locale) })}
      </Button>
    </div>
  );
}
