'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { publicGet } from '@/shared/lib/public-api';
import { ROUTES } from '@/shared/config/routes';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import {
  formatBookingDateTime,
  formatMnt,
  serviceLabel,
} from '@/entities/booking';
import { fetchCustomerSession } from '@/entities/customer';
import { usePublicStaffList } from '@/entities/staff';
import { PageLoading } from '@/shared/ui/page-states';
import { BookingStatusBadge } from './booking-status-badge';
import { CustomerBookingCard, UpcomingBookingCard } from './customer-home';
import { CustomerBranchPicker } from './customer-branch-picker';
import { CustomerHomeActions, CustomerHomeHeader } from './customer-home-header';
import { CustomerHomeCatalog } from './customer-home-catalog';

interface BookingItem {
  id: number;
  status: string;
  startAtUtc: string;
  totalPrice: number;
  services?: Array<{ serviceName: string }>;
}

interface PublicService {
  id: number;
  name: string;
  durationMinutes: number;
  price: number;
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
  const bookingsQuery = useQuery({
    queryKey: ['bookings-mine', tenant],
    queryFn: () =>
      publicGet<{ items: BookingItem[] }>('/bookings/mine', tenant).catch(
        () => ({ items: [] as BookingItem[] }),
      ),
  });
  const meQuery = useQuery({
    queryKey: ['customer-session', tenant],
    queryFn: () => fetchCustomerSession(tenant),
  });
  const servicesQuery = useQuery({
    queryKey: ['public-services', tenant],
    queryFn: () => publicGet<PublicService[]>('/services', tenant),
  });
  const staffQuery = usePublicStaffList(tenant);

  const items = bookingsQuery.data?.items ?? [];
  const [now] = useState(() => Date.now());
  const upcoming = items.filter(
    (booking) =>
      new Date(booking.startAtUtc).getTime() >= now &&
      !TERMINAL.includes(booking.status),
  );
  const past = items.filter((booking) => !upcoming.includes(booking));
  const nextBooking = upcoming[0];

  if (bookingsQuery.isLoading) return <PageLoading rows={4} />;

  return (
    <div className="space-y-6 pb-6">
      <CustomerHomeHeader name={meQuery.data?.name ?? null} />

      {nextBooking ? (
        <Link
          href={ROUTES.userBooking(nextBooking.id)}
          className="mx-4 block overflow-hidden rounded-3xl bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] p-4 text-white"
        >
          <p className="text-xs uppercase tracking-wide text-white/80">
            {tShell('bookingStatus')}
          </p>
          <p className="mt-2 text-lg font-semibold">
            {serviceLabel(nextBooking.services) || `#${nextBooking.id}`}
          </p>
          <p className="mt-1 text-sm text-white/85">
            {formatBookingDateTime(nextBooking.startAtUtc, locale)}
          </p>
        </Link>
      ) : (
        <div className="mx-4 rounded-3xl bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] p-4 text-white">
          <p className="text-xs uppercase tracking-wide text-white/80">
            {tShell('bookingStatus')}
          </p>
          <p className="mt-2 text-lg font-semibold">{tShell('noUpcomingShort')}</p>
        </div>
      )}

      <CustomerHomeActions />
      <CustomerBranchPicker />
      <CustomerHomeCatalog
        services={servicesQuery.data ?? []}
        staff={staffQuery.data ?? []}
      />

      <section className="space-y-3 px-4">
        <h2 className="text-sm font-semibold text-muted-foreground">{t('upcoming')}</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('noUpcoming')}</p>
        ) : (
          upcoming.map((booking) => (
            <UpcomingBookingCard
              key={booking.id}
              id={booking.id}
              status={booking.status}
              serviceLabel={serviceLabel(booking.services) || `#${booking.id}`}
              dateTime={formatBookingDateTime(booking.startAtUtc, locale)}
              price={formatMnt(booking.totalPrice, locale)}
              tenant={tenant}
            />
          ))
        )}
      </section>

      <section id="history" className="scroll-mt-20 space-y-3 px-4">
        <h2 className="text-sm font-semibold text-muted-foreground">{t('past')}</h2>
        {past.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('noPast')}</p>
        ) : (
          past.map((booking) => (
            <CustomerBookingCard
              key={booking.id}
              id={booking.id}
              serviceLabel={serviceLabel(booking.services) || `#${booking.id}`}
              status={<BookingStatusBadge status={booking.status} />}
              dateTime={formatBookingDateTime(booking.startAtUtc, locale)}
              price={formatMnt(booking.totalPrice, locale)}
              href={ROUTES.userBooking(booking.id)}
              action={{ label: tShell('rebook'), href: ROUTES.BOOK }}
            />
          ))
        )}
      </section>
    </div>
  );
}
