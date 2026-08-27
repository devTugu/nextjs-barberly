'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { publicGet } from '@/shared/lib/public-api';
import { ROUTES } from '@/shared/config/routes';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import {
  formatBookingDateTime,
  formatMnt,
  serviceLabel,
} from '@/entities/booking';
import { PageEmpty, PageLoading } from '@/shared/ui/page-states';
import { BookingStatusBadge } from './booking-status-badge';
import { CustomerBookingCard, CustomerHomeHeader, UpcomingBookingCard } from './customer-home';
import { CustomerBranchPicker } from './customer-branch-picker';
import { Button } from '@/shared/ui/button';

interface BookingItem {
  id: number;
  status: string;
  startAtUtc: string;
  totalPrice: number;
  services?: Array<{ serviceName: string }>;
}

const TERMINAL = [
  'cancelled_by_customer',
  'cancelled_by_barber',
  'completed',
  'no_show',
  'expired',
  'cancelled',
];

export function UserBookingsDashboard() {
  const tenant = useTenantSubdomain();
  return <UserBookingsDashboardInner key={tenant} tenant={tenant} />;
}

function UserBookingsDashboardInner({ tenant }: { tenant: string }) {
  const t = useTranslations('userPortal');
  const tShell = useTranslations('customerShell');
  const locale = useLocale();
  const [items, setItems] = useState<BookingItem[]>([]);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [nowMs] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      publicGet<{ items: BookingItem[] }>('/bookings/mine', tenant).catch(() => ({
        items: [] as BookingItem[],
      })),
      fetch(`/api/customer-auth/me?tenant=${tenant}`, { credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ])
      .then(([bookings, meBody]) => {
        if (cancelled) return;
        setItems(bookings.items ?? []);
        setCustomerName(meBody?.data?.name ?? null);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tenant]);

  const now = nowMs;
  const upcoming = items.filter(
    (b) =>
      new Date(b.startAtUtc).getTime() >= now && !TERMINAL.includes(b.status),
  );
  const past = items.filter((b) => !upcoming.includes(b));

  if (loading) return <PageLoading rows={4} />;

  return (
    <div className="space-y-6 pb-4">
      <CustomerHomeHeader name={customerName} />
      <CustomerBranchPicker />

      {error ? (
        <p className="px-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <section className="space-y-3 px-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t('upcoming')}
        </h2>
        {upcoming.length === 0 ? (
          <PageEmpty title={t('noUpcoming')} description="" />
        ) : (
          upcoming.map((b) => (
            <UpcomingBookingCard
              key={b.id}
              id={b.id}
              status={b.status}
              serviceLabel={serviceLabel(b.services) || `#${b.id}`}
              dateTime={formatBookingDateTime(b.startAtUtc, locale)}
              price={formatMnt(b.totalPrice, locale)}
              tenant={tenant}
            />
          ))
        )}
      </section>

      <section className="space-y-3 px-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t('past')}
        </h2>
        {past.length === 0 ? (
          <PageEmpty title={t('noPast')} description="" />
        ) : (
          past.map((b) => (
            <CustomerBookingCard
              key={b.id}
              id={b.id}
              serviceLabel={serviceLabel(b.services) || `#${b.id}`}
              status={<BookingStatusBadge status={b.status} />}
              dateTime={formatBookingDateTime(b.startAtUtc, locale)}
              price={formatMnt(b.totalPrice, locale)}
              href={ROUTES.userBooking(b.id)}
              action={{ label: tShell('rebook'), href: ROUTES.BOOK }}
            />
          ))
        )}
      </section>

      <div className="px-4">
        <Button asChild variant="outline" className="min-h-11 w-full rounded-xl">
          <Link href={ROUTES.BOOK}>{t('bookAgain')}</Link>
        </Button>
      </div>
    </div>
  );
}
