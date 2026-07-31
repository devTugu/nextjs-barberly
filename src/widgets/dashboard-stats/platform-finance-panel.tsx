'use client';

import { useMemo, useState, useTransition } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  Download,
  Percent,
  Store,
  Wallet,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  downloadPlatformFinanceCsv,
  usePlatformFinance,
} from '@/entities/dashboard';
import { usePlatformFinanceColumns } from '@/entities/dashboard/ui/platform-finance-columns';
import {
  DataTable,
  DataTableEmpty,
  DataTableQueryState,
} from '@/widgets/data-table';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Skeleton } from '@/shared/ui/skeleton';
import { PageError } from '@/shared/ui/page-states';
import { getErrorMessage } from '@/shared/api';
import { cn } from '@/shared/lib/utils';

function currentMonthKey(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${month}`;
}

const formatMnt = (amount: number) => `${amount.toLocaleString()}₮`;

interface FinanceStatProps {
  title: string;
  value: string;
  loading: boolean;
  icon: typeof Banknote;
  accent?: 'emerald' | 'amber' | 'rose' | 'blue' | 'violet';
}

const accentStyles = {
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
} as const;

function FinanceStat({
  title,
  value,
  loading,
  icon: Icon,
  accent = 'blue',
}: FinanceStatProps) {
  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardDescription className="line-clamp-2">{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums">
          {loading ? <Skeleton className="h-8 w-28" /> : value}
        </CardTitle>
        <div
          className={cn(
            'flex size-9 items-center justify-center rounded-lg',
            accentStyles[accent],
          )}
        >
          <Icon className="size-4" aria-hidden />
        </div>
      </CardHeader>
    </Card>
  );
}

export function PlatformFinancePanel({
  showHeading = true,
}: {
  showHeading?: boolean;
}) {
  const t = useTranslations('dashboard.finance');
  const [month, setMonth] = useState(currentMonthKey);
  const [isExporting, startExport] = useTransition();
  const [exportError, setExportError] = useState<Error | null>(null);
  const columns = usePlatformFinanceColumns();
  const { data, isLoading, isError, error, refetch } = usePlatformFinance(month);

  const tableColumns = useMemo(() => columns, [columns]);
  const summary = data?.summary;

  const handleExport = () => {
    setExportError(null);
    startExport(async () => {
      try {
        await downloadPlatformFinanceCsv(month);
        toast.success(t('exportSuccess'));
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error(t('exportError'));
        setExportError(error);
        toast.error(getErrorMessage(err) || t('exportError'));
      }
    });
  };

  return (
    <section className="space-y-4">
      {exportError ? (
        <PageError error={exportError} reset={() => setExportError(null)} />
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        {showHeading ? (
          <div>
            <h3 className="text-sm font-medium">{t('title')}</h3>
            <p className="text-muted-foreground text-sm">{t('description')}</p>
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-medium">{t('monthlyBreakdown')}</h3>
            <p className="text-muted-foreground text-sm">
              {t('monthlyBreakdownDescription')}
            </p>
          </div>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="grid w-full max-w-xs gap-2">
            <Label htmlFor="finance-month">{t('month')}</Label>
            <Input
              id="finance-month"
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleExport}
            disabled={isExporting || isLoading}
          >
            <Download className="size-4" aria-hidden />
            {isExporting ? t('exporting') : t('exportCsv')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FinanceStat
          title={t('gross')}
          value={formatMnt(summary?.grossPayments ?? 0)}
          loading={isLoading}
          icon={Banknote}
          accent="emerald"
        />
        <FinanceStat
          title={t('commission')}
          value={formatMnt(summary?.platformCommission ?? 0)}
          loading={isLoading}
          icon={Percent}
          accent="amber"
        />
        <FinanceStat
          title={t('netToTenants')}
          value={formatMnt(summary?.netToTenants ?? 0)}
          loading={isLoading}
          icon={ArrowDownLeft}
          accent="blue"
        />
        <FinanceStat
          title={t('withdrawals')}
          value={formatMnt(summary?.withdrawals ?? 0)}
          loading={isLoading}
          icon={ArrowUpRight}
          accent="rose"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FinanceStat
          title={t('refunds')}
          value={formatMnt(summary?.refunds ?? 0)}
          loading={isLoading}
          icon={ArrowUpRight}
          accent="rose"
        />
        <FinanceStat
          title={t('walletBalanceTotal')}
          value={formatMnt(summary?.totalWalletBalance ?? 0)}
          loading={isLoading}
          icon={Wallet}
          accent="violet"
        />
        <FinanceStat
          title={t('bookings')}
          value={String(summary?.completedBookings ?? 0)}
          loading={isLoading}
          icon={CalendarDays}
          accent="blue"
        />
        <FinanceStat
          title={t('activeTenants')}
          value={String(summary?.activeTenants ?? 0)}
          loading={isLoading}
          icon={Store}
          accent="emerald"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('byShop')}</CardTitle>
          <CardDescription>
            {t('period', { month: data?.period.month ?? month })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTableQueryState isError={isError} error={error} refetch={refetch}>
            <DataTable
              columns={tableColumns}
              data={data?.byTenant ?? []}
              pageCount={1}
              pagination={{ pageIndex: 0, pageSize: 50 }}
              onPaginationChange={() => undefined}
              isLoading={isLoading}
              emptyContent={<DataTableEmpty title={t('empty')} />}
            />
          </DataTableQueryState>
        </CardContent>
      </Card>
    </section>
  );
}
