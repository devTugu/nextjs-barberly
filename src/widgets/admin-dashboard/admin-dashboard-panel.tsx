'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { CalendarDays, CheckCircle2, Clock, Wallet } from 'lucide-react';
import { useTenantDashboardStats } from '@/entities/dashboard';
import { useWalletBalance } from '@/entities/wallet';
import { ROUTES } from '@/shared/config/routes';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

function todayUtcRange(): { fromUtc: string; toUtc: string } {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { fromUtc: start.toISOString(), toUtc: end.toISOString() };
}

export function AdminDashboardPanel() {
  const t = useTranslations('entities.bookings');
  const tenant = useTenantSubdomain();
  const range = useMemo(() => todayUtcRange(), []);
  const { data: stats, isLoading } = useTenantDashboardStats(tenant, range);
  const { data: wallet, isLoading: walletLoading } = useWalletBalance(tenant);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t('todayBookings')}
            </CardTitle>
            <CalendarDays className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold">{stats?.todayBookings ?? 0}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t('todayRevenue')}
            </CardTitle>
            <Wallet className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-3xl font-bold">
                {(stats?.todayRevenue ?? 0).toLocaleString()}₮
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t('pendingPayments')}
            </CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold">{stats?.pendingCount ?? 0}</p>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="max-w-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            {t('walletBalance')}
          </CardTitle>
          <Wallet className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {walletLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="text-3xl font-bold">
              {(wallet?.balance ?? 0).toLocaleString()}₮
            </p>
          )}
        </CardContent>
      </Card>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" className="h-14 flex-1 text-base">
          <Link href={ROUTES.ADMIN_CALENDAR}>
            <CalendarDays className="mr-2 size-5" />
            {t('openCalendar')}
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary" className="h-14 flex-1 text-base">
          <Link href={ROUTES.ADMIN_BOOKINGS_NEW}>
            <CheckCircle2 className="mr-2 size-5" />
            {t('manualBooking')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
