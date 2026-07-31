'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useLocale, useTranslations } from 'next-intl';
import { Info, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  publicBookingKeys,
  useCancelPreview,
  usePublicBooking,
  useReschedulePreview,
  type PolicyReasonCode,
  type BookingPayResult,
} from '@/entities/booking/api/public-booking';
import { bookingServicesDuration } from '@/features/booking-wizard/lib/booking-math';
import { formatMnt } from '@/features/booking-wizard/lib/booking-format';
import { SlotPicker, type SlotSelection } from '@/features/booking-wizard/ui/slot-picker';
import { ROUTES } from '@/shared/config/routes';
import { env } from '@/shared/config/env';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { publicGet, publicPost } from '@/shared/lib/public-api';
import { PageError, PageLoading } from '@/shared/ui/page-states';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip';
import { BookingStatusBadge } from './booking-status-badge';

const QrCode = dynamic(
  () => import('react-qr-code').then((m) => m.default),
  { ssr: false },
);

const simulateEnabled =
  process.env.NEXT_PUBLIC_QPAY_SIMULATE_ENABLED === 'true' ||
  env.APP_ENV !== 'production';

function UserBookingBalancePay({
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

const POLICY_REASON_CODES: PolicyReasonCode[] = [
  'BOOKING_NOT_ACTIVE',
  'RESCHEDULE_WINDOW_PASSED',
];

function isPolicyReasonCode(value: string | null | undefined): value is PolicyReasonCode {
  return POLICY_REASON_CODES.includes(value as PolicyReasonCode);
}

function usePolicyReasonLabel() {
  const t = useTranslations('userPortal');

  return (reasonCode: string | null | undefined, fallback?: string | null) => {
    if (isPolicyReasonCode(reasonCode)) {
      return t(`policyReason.${reasonCode}`);
    }
    return fallback ?? t('cancelPolicyHint');
  };
}

interface TenantPolicies {
  cancelHoursBefore: number;
  rescheduleHoursBefore: number;
}

function useTenantPolicies(tenant: string) {
  const [policies, setPolicies] = useState<TenantPolicies | null>(null);

  useEffect(() => {
    publicGet<{ policies: TenantPolicies }>('/tenant', tenant)
      .then((data) => setPolicies(data.policies))
      .catch(() => setPolicies(null));
  }, [tenant]);

  return policies;
}

function PolicyHint({ label }: { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground inline-flex size-6 items-center justify-center rounded-full"
          aria-label={label}
        >
          <Info className="size-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function UserBookingDetail({ bookingId }: { bookingId: number }) {
  const t = useTranslations('userPortal');
  const tenant = useTenantSubdomain();
  const router = useRouter();
  const policyReason = usePolicyReasonLabel();
  const policies = useTenantPolicies(tenant);
  const { data: booking, isLoading, isError } = usePublicBooking(tenant, bookingId);
  const { data: reschedulePreview } = useReschedulePreview(
    tenant,
    bookingId,
    booking?.status === 'confirmed',
  );
  const { data: cancelPreview } = useCancelPreview(
    tenant,
    bookingId,
    booking?.status === 'confirmed',
  );

  if (isLoading) return <PageLoading rows={3} />;
  if (isError || !booking) return <PageError />;

  const canManage = booking.status === 'confirmed';
  const remainingBalance = booking.remainingBalance ?? 0;
  const showPayBalance = canManage && remainingBalance > 0;
  const cancelPolicyLabel = policies
    ? t('cancelHoursPolicy', { hours: policies.cancelHoursBefore })
    : t('cancelPolicyHint');
  const reschedulePolicyLabel = policies
    ? t('rescheduleHoursPolicy', {
        hours:
          reschedulePreview?.rescheduleHoursBefore ??
          policies.rescheduleHoursBefore,
      })
    : t('cancelPolicyHint');

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-lg space-y-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('bookingTitle', { id: booking.id })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <BookingStatusBadge status={booking.status} />
            <p>{new Date(booking.startAtUtc).toLocaleString()}</p>
            <p>{booking.totalPrice.toLocaleString()}₮</p>
            {remainingBalance > 0 ? (
              <p className="text-sm text-muted-foreground">
                {t('remainingBalance')}: {remainingBalance.toLocaleString()}₮
              </p>
            ) : null}
            <ul className="text-muted-foreground space-y-1 text-sm">
              {booking.services?.map((s) => (
                <li key={s.serviceId}>
                  {s.serviceName} · {s.durationMinutes}m · {s.price.toLocaleString()}₮
                </li>
              ))}
            </ul>
            {showPayBalance ? (
              <UserBookingBalancePay
                bookingId={booking.id}
                remainingBalance={remainingBalance}
                tenant={tenant}
              />
            ) : null}
            {canManage ? (
              <div className="grid gap-2 pt-2">
                <div className="flex items-center gap-1">
                  <Button
                    asChild
                    className="min-h-11 flex-1"
                    disabled={reschedulePreview?.allowed === false}
                  >
                    <Link href={ROUTES.userBookingReschedule(booking.id)}>
                      {t('reschedule')}
                    </Link>
                  </Button>
                  <PolicyHint label={reschedulePolicyLabel} />
                </div>
                {reschedulePreview?.allowed === false ? (
                  <p className="text-muted-foreground text-xs">
                    {policyReason(
                      reschedulePreview.reasonCode,
                      reschedulePreview.reason,
                    )}
                  </p>
                ) : null}
                <div className="flex items-center gap-1">
                  <Button
                    variant="destructive"
                    asChild
                    className="min-h-11 flex-1"
                    disabled={cancelPreview?.allowed === false}
                  >
                    <Link href={ROUTES.userBookingCancel(booking.id)}>
                      {t('cancel')}
                    </Link>
                  </Button>
                  <PolicyHint label={cancelPolicyLabel} />
                </div>
              </div>
            ) : null}
            <Button variant="link" onClick={() => router.push(ROUTES.USER_DASHBOARD)}>
              {t('back')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}

export function UserBookingReschedule({ bookingId }: { bookingId: number }) {
  const t = useTranslations('userPortal');
  const tenant = useTenantSubdomain();
  const router = useRouter();
  const policyReason = usePolicyReasonLabel();
  const { data: booking, isLoading } = usePublicBooking(tenant, bookingId);
  const { data: preview } = useReschedulePreview(tenant, bookingId);
  const [date, setDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<SlotSelection | null>(null);
  const [pending, setPending] = useState(false);

  const duration = useMemo(
    () => (booking ? bookingServicesDuration(booking.services ?? []) : 60),
    [booking],
  );
  const serviceIds = useMemo(
    () => booking?.services?.map((s) => s.serviceId) ?? [],
    [booking],
  );

  const reschedule = async () => {
    if (!selectedSlot) return;
    setPending(true);
    try {
      const csrf = await import('@/shared/lib/csrf-client').then((m) =>
        m.mutatingFetchHeaders(),
      );
      const res = await fetch(
        `/api/public/bookings/${bookingId}/reschedule?tenant=${tenant}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', ...(await csrf) },
          body: JSON.stringify({
            newStartAtUtc: selectedSlot.startAtUtc,
            durationMinutes: duration,
          }),
        },
      );
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error?.message ?? t('rescheduleFailed'));
      }
      toast.success(t('rescheduleTitle'));
      router.push(ROUTES.userBooking(bookingId));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('rescheduleFailed'));
    } finally {
      setPending(false);
    }
  };

  if (isLoading || !booking) return <PageLoading rows={4} />;
  if (preview && !preview.allowed) {
    return (
      <PageError
        error={
          new Error(
            policyReason(preview.reasonCode, preview.reason),
          )
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4">
      <h1 className="text-xl font-semibold">{t('rescheduleTitle')}</h1>
      <div className="space-y-2">
        <Label htmlFor="reschedule-date">{t('pickDate')}</Label>
        <Input
          id="reschedule-date"
          type="date"
          value={date}
          min={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      {date ? (
        <SlotPicker
          tenant={tenant}
          date={date}
          durationMinutes={duration}
          serviceIds={serviceIds}
          selectedSlot={selectedSlot}
          onSelect={setSelectedSlot}
        />
      ) : null}
      <Button
        className="min-h-11 w-full"
        disabled={!selectedSlot || pending}
        onClick={reschedule}
      >
        {t('reschedule')}
      </Button>
    </div>
  );
}

export function UserBookingCancel({ bookingId }: { bookingId: number }) {
  const t = useTranslations('userPortal');
  const tenant = useTenantSubdomain();
  const router = useRouter();
  const policyReason = usePolicyReasonLabel();
  const { data: booking, isLoading: bookingLoading } = usePublicBooking(
    tenant,
    bookingId,
  );
  const { data: preview, isLoading: previewLoading } = useCancelPreview(
    tenant,
    bookingId,
  );
  const [pending, setPending] = useState(false);

  const cancel = async () => {
    setPending(true);
    try {
      const csrf = await import('@/shared/lib/csrf-client').then((m) =>
        m.mutatingFetchHeaders(),
      );
      const res = await fetch(
        `/api/public/bookings/${bookingId}/cancel?tenant=${tenant}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { ...(await csrf) },
        },
      );
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message ?? t('cancelFailed'));
      }
      const refund = body.data?.refundPercent as number | undefined;
      toast.success(
        refund != null
          ? t('cancelSuccess', { percent: refund })
          : t('confirmCancel'),
      );
      router.push(ROUTES.USER_DASHBOARD);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('cancelFailed'));
    } finally {
      setPending(false);
    }
  };

  if (bookingLoading || previewLoading) return <PageLoading rows={3} />;

  const refundLabel = preview?.allowed
    ? t('refundPreview', {
        percent: preview.refundPercent,
        amount: `${preview.refundAmount.toLocaleString()}₮`,
      })
    : policyReason(preview?.reasonCode, preview?.reason);

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('cancelTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {booking ? (
            <p className="text-sm">
              {new Date(booking.startAtUtc).toLocaleString()} ·{' '}
              {booking.totalPrice.toLocaleString()}₮
            </p>
          ) : null}
          <p className="text-muted-foreground text-sm">{t('cancelPolicyHint')}</p>
          {preview ? (
            <Alert>
              <AlertDescription>{refundLabel}</AlertDescription>
            </Alert>
          ) : null}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="min-h-11 w-full"
                disabled={preview?.allowed === false || pending}
              >
                {t('confirmCancel')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('cancelTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {preview?.allowed
                    ? t('refundPreview', {
                        percent: preview.refundPercent,
                        amount: `${preview.refundAmount.toLocaleString()}₮`,
                      })
                    : t('cancelPolicyHint')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('back')}</AlertDialogCancel>
                <AlertDialogAction onClick={cancel}>
                  {t('confirmCancel')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
