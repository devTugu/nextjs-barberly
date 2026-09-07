'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import { publicGet } from '@/shared/lib/public-api';
import { ROUTES } from '@/shared/config/routes';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { clearBookingDraft } from '@/features/booking-wizard';
import { formatBookingDateTime, formatMnt, serviceLabel } from '@/entities/booking';
import { PageLoading } from '@/shared/ui/page-states';
import { Button } from '@/shared/ui/button';
import { brandPrimaryButtonClass } from '@/shared/lib/brand-styles';
import { cn } from '@/shared/lib/utils';
import type { PublicBooking } from '@/entities/booking';

type BookingStatus =
  | 'confirmed'
  | 'pending_payment'
  | 'expired'
  | 'cancelled'
  | 'unknown';

function resolveTitleKey(status: BookingStatus | null): string {
  if (!status) return 'waiting';
  if (status === 'confirmed') return 'successTitle';
  if (status === 'pending_payment') return 'waiting';
  if (status === 'expired') return 'expired';
  if (status === 'cancelled') return 'cancelled';
  return 'unknownStatus';
}

export default function BookConfirmPage() {
  const t = useTranslations('bookingConfirm');
  const locale = useLocale();
  const params = useParams();
  const tenant = useTenantSubdomain();
  const bookingId = params.bookingId as string;
  const [booking, setBooking] = useState<PublicBooking | null>(null);
  const [status, setStatus] = useState<BookingStatus | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const fetchBooking = async () => {
      try {
        const data = await publicGet<PublicBooking>(`/bookings/${bookingId}`, tenant);
        if (cancelled) return;
        setBooking(data);
        const next = data.status as BookingStatus;
        setStatus(
          ['confirmed', 'pending_payment', 'expired', 'cancelled'].includes(data.status)
            ? next
            : 'unknown',
        );
        if (data.status === 'confirmed') clearBookingDraft();
        if (data.status !== 'pending_payment' && intervalId) {
          clearInterval(intervalId);
          intervalId = undefined;
        }
      } catch {
        if (!cancelled) setStatus('unknown');
      }
    };

    void fetchBooking();
    intervalId = setInterval(() => void fetchBooking(), 3000);
    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [bookingId, tenant]);

  const titleKey = resolveTitleKey(status);

  return (
    <div className="flex min-h-svh flex-col px-5 pb-8 pt-10">
      <div className="flex flex-1 flex-col items-center text-center">
        {status === 'confirmed' ? (
          <div className="relative mb-6 flex size-24 items-center justify-center rounded-full bg-[var(--brand-primary,#3b82f6)] text-white">
            <Check className="size-12" strokeWidth={2.5} />
          </div>
        ) : null}
        <h1 className="text-2xl font-semibold">{t(titleKey)}</h1>
        {status === 'confirmed' ? (
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">{t('success')}</p>
        ) : null}
        {!status ? <PageLoading rows={1} /> : null}

        {booking ? (
          <div className="mt-8 w-full rounded-3xl border bg-card p-4 text-left text-sm">
            <p className="font-medium">
              {serviceLabel(booking.services) || `#${booking.id}`}
            </p>
            <p className="mt-1 text-muted-foreground">
              {formatBookingDateTime(booking.startAtUtc, locale)}
            </p>
            <p className="mt-3 text-lg font-semibold">
              {formatMnt(booking.totalPrice, locale)}
            </p>
          </div>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Button asChild className={cn('min-h-12 rounded-2xl', brandPrimaryButtonClass)}>
          <Link href={ROUTES.USER_DASHBOARD}>{t('view')}</Link>
        </Button>
        <Button asChild variant="outline" className="min-h-12 rounded-2xl">
          <Link href={ROUTES.USER_DASHBOARD}>{t('toHome')}</Link>
        </Button>
      </div>
    </div>
  );
}
