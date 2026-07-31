'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { publicGet } from '@/shared/lib/public-api';
import { ROUTES } from '@/shared/config/routes';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { clearBookingDraft } from '@/features/booking-wizard/lib/booking-session';
import { BookingServicesSummary } from '@/features/booking-wizard/ui/booking-services-summary';
import { LocaleSwitcher } from '@/shared/i18n/locale-switcher';
import { PageLoading } from '@/shared/ui/page-states';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import type { PublicBooking } from '@/entities/booking/api/public-booking';

type BookingStatus =
  | 'confirmed'
  | 'pending_payment'
  | 'expired'
  | 'cancelled'
  | 'unknown';

function resolveTitleKey(status: BookingStatus | null): string {
  if (!status) return 'waiting';
  if (status === 'confirmed') return 'title';
  if (status === 'pending_payment') return 'waiting';
  if (status === 'expired') return 'expired';
  if (status === 'cancelled') return 'cancelled';
  return 'unknownStatus';
}

export default function BookConfirmPage() {
  const t = useTranslations('bookingConfirm');
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
          ['confirmed', 'pending_payment', 'expired', 'cancelled'].includes(
            data.status,
          )
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

  const calendarUrl =
    status === 'confirmed'
      ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Barberly+Booking&details=Booking+%23${bookingId}`
      : null;

  const titleKey = resolveTitleKey(status);

  return (
    <div className="mx-auto max-w-md space-y-4 p-6">
      <div className="flex justify-end">
        <LocaleSwitcher />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t(titleKey)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!status ? <PageLoading rows={1} /> : null}
          {status === 'confirmed' ? (
            <p className="text-muted-foreground text-sm">{t('success')}</p>
          ) : null}
          {booking?.services?.length ? (
            <BookingServicesSummary
              services={booking.services}
              startAtUtc={booking.startAtUtc}
              totalPrice={booking.totalPrice}
            />
          ) : null}
          <div className="grid gap-2">
            {calendarUrl ? (
              <Button variant="outline" asChild className="min-h-11">
                <a href={calendarUrl} target="_blank" rel="noopener noreferrer">
                  {t('addToCalendar')}
                </a>
              </Button>
            ) : null}
            <Button asChild className="min-h-11">
              <Link href={ROUTES.USER_DASHBOARD}>{t('viewBookings')}</Link>
            </Button>
            <Button variant="secondary" asChild className="min-h-11">
              <Link href={ROUTES.BOOK}>{t('bookAnother')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
