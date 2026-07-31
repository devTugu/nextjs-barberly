'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ExternalLink, Store } from 'lucide-react';
import { useBrandDashboard } from '@/entities/dashboard';
import { ROUTES } from '@/shared/config/routes';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { tenantAdminUrl } from '@/shared/lib/tenant-url';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';

function todayUtcRange(): { from: string; to: string } {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { from: start.toISOString(), to: end.toISOString() };
}

export function BrandDashboardPanel({
  compact = false,
}: {
  compact?: boolean;
}) {
  const t = useTranslations('dashboard.brand');
  const tBookings = useTranslations('entities.bookings');
  const tenant = useTenantSubdomain();
  const range = useMemo(() => todayUtcRange(), []);
  const { data, isLoading, isError } = useBrandDashboard(tenant, range);

  const isMultiBranch = (data?.branches.length ?? 0) > 1;

  if (isError) return null;
  if (compact && (isLoading || !isMultiBranch)) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <Store className="size-4 text-muted-foreground" />
            {data?.brandName ?? t('title')}
          </CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </div>
        {compact ? (
          <Button asChild variant="outline" size="sm">
            <Link href={ROUTES.ADMIN_BRAND}>{t('viewAll')}</Link>
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : !data ? (
          <p className="text-muted-foreground text-sm">{t('empty')}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('branch')}</TableHead>
                <TableHead className="text-right">
                  {tBookings('todayBookings')}
                </TableHead>
                <TableHead className="text-right">
                  {tBookings('todayRevenue')}
                </TableHead>
                <TableHead className="text-right">
                  {tBookings('pendingPayments')}
                </TableHead>
                <TableHead className="text-right">{t('openAdmin')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.branches.map((branch) => (
                <TableRow key={branch.tenantId}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{branch.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {branch.subdomain}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {branch.todayBookings}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {branch.todayRevenue.toLocaleString()}₮
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {branch.pendingCount}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <a
                        href={tenantAdminUrl(
                          branch.subdomain,
                          ROUTES.ADMIN_DASHBOARD,
                        )}
                      >
                        <ExternalLink className="size-4" />
                        <span className="sr-only">{t('openAdmin')}</span>
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="font-medium">{t('totals')}</TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  {data.totals.todayBookings}
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  {data.totals.todayRevenue.toLocaleString()}₮
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  {data.totals.pendingCount}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
