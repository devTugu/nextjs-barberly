'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatMnt, simulateQpayPaymentUseCase } from '@/entities/booking';
import { Button } from '@/shared/ui/button';
import { isQpaySimulateAllowed } from '@/shared/config/qpay-simulate';
import { useBalancePaymentFlow } from '../model/use-balance-payment-flow';

const simulateEnabled = isQpaySimulateAllowed();

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

  const adapters = useMemo(
    () => ({
      onCleared: () => {
        toast.success(t('payBalanceSuccess'));
      },
    }),
    [t],
  );

  const {
    payment,
    loading,
    polling,
    error,
    startPayment,
    clearPayment,
    setError,
    setLoading,
    invalidateBooking,
  } = useBalancePaymentFlow(tenant, bookingId, adapters);

  const simulatePay = async () => {
    if (!payment) return;
    setLoading(true);
    try {
      await simulateQpayPaymentUseCase(tenant, {
        invoiceId: payment.invoiceId,
        amount: payment.amount,
      });
      await invalidateBooking();
      toast.success(t('payBalanceSuccess'));
      clearPayment();
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
        <p className="text-2xl font-bold">{formatMnt(payment.amount, locale)}</p>
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
            onClick={() => void simulatePay()}
            disabled={loading}
            className="min-h-11 w-full"
          >
            {tPay('simulate')}
          </Button>
        ) : null}
        <Button variant="ghost" onClick={clearPayment}>
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
