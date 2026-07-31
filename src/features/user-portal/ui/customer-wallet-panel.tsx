'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Gift, Wallet } from 'lucide-react';
import { publicGet } from '@/shared/lib/public-api';
import { ROUTES } from '@/shared/config/routes';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { formatBookingDateTime, formatMnt } from '@/features/booking-wizard/lib/booking-format';
import { PageEmpty, PageLoading } from '@/shared/ui/page-states';
import { Button } from '@/shared/ui/button';
import { BookingStatusBadge } from './booking-status-badge';

interface WalletResponse {
  totalSpent: number;
  completedBookings: number;
  completedVisits: number;
  loyalty: {
    isActive: boolean;
    visitsRequired: number;
    discountPercent: number;
    visitsUntilReward: number | null;
    eligible: boolean;
  };
  recentActivity: Array<{
    bookingId: number;
    status: string;
    totalPrice: number;
    startAtUtc: string;
    serviceNames: string[];
  }>;
}

export function CustomerWalletPanel() {
  const t = useTranslations('customerWallet');
  const locale = useLocale();
  const tenant = useTenantSubdomain();

  const { data, isLoading, error } = useQuery({
    queryKey: ['customer-wallet', tenant],
    queryFn: () => publicGet<WalletResponse>('/customer-auth/me/wallet', tenant),
    enabled: Boolean(tenant),
  });

  if (isLoading) return <PageLoading rows={4} />;
  if (error || !data) {
    return (
      <div className="space-y-4 px-4 py-6">
        <h1 className="text-xl font-semibold">{t('title')}</h1>
        <PageEmpty title={t('loginRequired')} description="" />
        <Button asChild className="w-full rounded-xl">
          <Link href={ROUTES.USER_LOGIN}>{t('signIn')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-6">
      <h1 className="text-xl font-semibold">{t('title')}</h1>

      <div className="rounded-2xl border border-border/60 bg-card p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Wallet className="size-4" />
          <span className="text-sm">{t('totalSpent')}</span>
        </div>
        <p className="mt-2 text-3xl font-bold">{formatMnt(data.totalSpent, locale)}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('completedCount', { count: data.completedBookings })}
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-4">
        <div className="flex items-center gap-2">
          <Gift className="size-4 text-[var(--brand-primary,#f97316)]" />
          <h2 className="font-semibold">{t('loyaltyTitle')}</h2>
        </div>
        {data.loyalty.isActive ? (
          <div className="mt-3 space-y-2 text-sm">
            <p>
              {t('loyaltyProgress', {
                current: data.completedVisits,
                required: data.loyalty.visitsRequired,
              })}
            </p>
            <p className="text-muted-foreground">
              {data.loyalty.eligible
                ? t('loyaltyEligible', { percent: data.loyalty.discountPercent })
                : t('loyaltyReward', {
                    percent: data.loyalty.discountPercent,
                    required: data.loyalty.visitsRequired,
                  })}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">{t('loyaltyInactive')}</p>
        )}
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t('recentActivity')}
        </h2>
        {data.recentActivity.length === 0 ? (
          <PageEmpty title={t('noActivity')} description="" />
        ) : (
          data.recentActivity.map((item) => (
            <Link
              key={item.bookingId}
              href={ROUTES.userBooking(item.bookingId)}
              className="block rounded-2xl border border-border/60 bg-card p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {item.serviceNames.join(', ') || `#${item.bookingId}`}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatBookingDateTime(item.startAtUtc, locale)}
                  </p>
                </div>
                <BookingStatusBadge status={item.status} />
              </div>
              <p className="mt-2 text-sm font-medium">
                {formatMnt(item.totalPrice, locale)}
              </p>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
