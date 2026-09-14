'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  computeLockCountdown,
  formatMnt,
  resolveBalanceDue,
  resolveDepositAmount,
} from '@/entities/booking';
import { ROUTES } from '@/shared/config/routes';
import { isQpaySimulateAllowed } from '@/shared/config/qpay-simulate';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import {
  clearBookingDraft,
  readBookingDraft,
} from '../lib/booking-session';
import { simulateQpayPaymentUseCase } from '../model/payment-use-cases';
import { useDepositPaymentFlow } from '../model/use-deposit-payment-flow';
import { BookingWizardShell } from './booking-wizard-shell';
import { BookingServicesSummary } from './booking-services-summary';
import { Button } from '@/shared/ui/button';

const QrCode = dynamic(
  () => import('react-qr-code').then((m) => m.default),
  { ssr: false },
);

const simulateEnabled = isQpaySimulateAllowed();

export function BookPayStep() {
  const router = useRouter();
  const tenant = useTenantSubdomain();
  const locale = useLocale();
  const t = useTranslations('bookingWizard');
  const draft = readBookingDraft();
  const [lockLabel, setLockLabel] = useState<string | null>(null);

  const handleLockExpired = () => {
    toast.error(t('pay.lockExpired'));
    clearBookingDraft();
    router.replace(ROUTES.BOOK_SLOT);
  };

  const bookingId = draft.booking?.id ?? null;
  const totalPrice = draft.booking?.totalPrice ?? 0;

  const adapters = useMemo(
    () => ({
      onConfirmed: (id: number) => {
        router.push(`${ROUTES.BOOK_CONFIRM}/${id}`);
      },
      onExpired: handleLockExpired,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, t],
  );

  const {
    payment,
    loading,
    polling,
    error,
    retry,
    setError,
    setLoading,
  } = useDepositPaymentFlow(tenant, bookingId, totalPrice, adapters);

  useEffect(() => {
    if (!draft.booking) router.replace(ROUTES.BOOK);
  }, [draft.booking, router]);

  useEffect(() => {
    const expires = draft.booking?.lockExpiresAt;
    if (!expires) return;
    let id = 0;
    const tick = () => {
      const countdown = computeLockCountdown(expires, Date.now());
      if (countdown.expired) {
        window.clearInterval(id);
        setLockLabel(t('pay.lockExpired'));
        handleLockExpired();
        return;
      }
      setLockLabel(t('pay.lockExpires', { time: countdown.label }));
    };
    tick();
    id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.booking?.lockExpiresAt, t]);

  const simulatePay = async () => {
    if (!payment || !draft.booking) return;
    setLoading(true);
    try {
      await simulateQpayPaymentUseCase(tenant, {
        invoiceId: payment.invoiceId,
        amount: payment.amount,
      });
      router.push(`${ROUTES.BOOK_CONFIRM}/${draft.booking.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errors.paymentFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (!draft.booking) return null;

  const depositAmount = resolveDepositAmount({
    depositAmount: draft.booking.depositAmount,
    paymentAmount: payment?.amount,
    totalPrice: draft.booking.totalPrice,
  });
  const balanceDue = resolveBalanceDue({
    balanceDue: draft.booking.balanceDue,
    totalPrice: draft.booking.totalPrice,
    depositAmount,
  });
  const amount = payment?.amount ?? depositAmount;

  return (
    <BookingWizardShell step={5} title={t('pay.title')} backHref={ROUTES.BOOK_OTP}>
      {error ? (
        <div className="mb-4 space-y-2">
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
          <Button variant="outline" size="sm" onClick={retry}>
            {t('pay.retry')}
          </Button>
        </div>
      ) : null}

      {lockLabel ? (
        <p className="mb-4 text-sm text-muted-foreground">{lockLabel}</p>
      ) : null}

      {draft.booking.services?.length ? (
        <div className="mb-4">
          <BookingServicesSummary
            services={draft.booking.services}
            startAtUtc={draft.booking.startAtUtc}
            totalPrice={draft.booking.totalPrice}
          />
        </div>
      ) : null}

      <div className="rounded-2xl border border-border/60 bg-card p-4">
        <p className="text-sm text-muted-foreground">{t('pay.amount')}</p>
        <p className="mt-1 text-3xl font-bold">{formatMnt(amount, locale)}</p>
        <div className="mt-3 space-y-1 text-sm text-muted-foreground">
          <p>
            {t('pay.depositDue')}: {formatMnt(depositAmount, locale)}
          </p>
          <p>
            {t('pay.balanceDue')}: {formatMnt(balanceDue, locale)}
          </p>
          <p>
            {t('pay.totalLabel')}: {formatMnt(draft.booking.totalPrice, locale)}
          </p>
        </div>

        {loading && !payment ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            …
          </p>
        ) : null}

        {payment ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">{t('pay.scanQr')}</p>
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
              <Button
                key={item.link}
                variant="outline"
                className="min-h-11 w-full rounded-xl"
                asChild
              >
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  {t('pay.openBank', { name: item.name })}
                </a>
              </Button>
            ))}
            {polling ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                {t('pay.waiting')}
              </p>
            ) : null}
            {simulateEnabled ? (
              <Button
                onClick={() => void simulatePay()}
                disabled={loading}
                className="min-h-11 w-full rounded-xl"
              >
                {t('pay.simulate')}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </BookingWizardShell>
  );
}
