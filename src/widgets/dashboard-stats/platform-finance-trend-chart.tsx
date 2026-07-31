'use client';

import { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { useLocale, useTranslations } from 'next-intl';
import { usePlatformFinanceTrend } from '@/entities/dashboard';
import { getDateLocale, resolveLocale } from '@/shared/i18n/messages';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/ui/chart';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Skeleton } from '@/shared/ui/skeleton';

const TREND_RANGES = [6, 12, 24] as const;

const chartConfig = {
  grossPayments: {
    label: 'Gross',
    color: 'var(--chart-1)',
  },
  platformCommission: {
    label: 'Commission',
    color: 'var(--chart-2)',
  },
  netToTenants: {
    label: 'Net',
    color: 'var(--chart-3)',
  },
  withdrawals: {
    label: 'Withdrawals',
    color: 'var(--chart-4)',
  },
} satisfies ChartConfig;

function formatMonthLabel(month: string, locale: string): string {
  const [year, mon] = month.split('-').map(Number);
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: '2-digit',
  }).format(new Date(Date.UTC(year, mon - 1, 1)));
}

export function PlatformFinanceTrendChart() {
  const t = useTranslations('dashboard.finance');
  const locale = useLocale();
  const dateLocale = getDateLocale(resolveLocale(locale));
  const [months, setMonths] = useState<number>(12);
  const { data, isLoading, isError } = usePlatformFinanceTrend(months);

  const chartData = useMemo(
    () =>
      (data?.points ?? []).map((point) => ({
        ...point,
        label: formatMonthLabel(point.month, dateLocale),
      })),
    [data?.points, dateLocale],
  );

  const localizedConfig = useMemo(
    () =>
      ({
        grossPayments: {
          ...chartConfig.grossPayments,
          label: t('gross'),
        },
        platformCommission: {
          ...chartConfig.platformCommission,
          label: t('commission'),
        },
        netToTenants: {
          ...chartConfig.netToTenants,
          label: t('netToTenants'),
        },
        withdrawals: {
          ...chartConfig.withdrawals,
          label: t('withdrawals'),
        },
      }) satisfies ChartConfig,
    [t],
  );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base">{t('trendTitle')}</CardTitle>
          <CardDescription>{t('trendDescription')}</CardDescription>
        </div>
        <Select
          value={String(months)}
          onValueChange={(value) => setMonths(Number(value))}
        >
          <SelectTrigger className="w-[180px]" aria-label={t('monthsRange')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TREND_RANGES.map((range) => (
              <SelectItem key={range} value={String(range)}>
                {t('monthsRangeOption', { count: range })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[320px] w-full" />
        ) : isError ? (
          <p className="text-muted-foreground text-sm">{t('trendError')}</p>
        ) : (
          <ChartContainer config={localizedConfig} className="h-[320px] w-full">
            <LineChart data={chartData} margin={{ left: 8, right: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={72}
                tickFormatter={(value: number) => value.toLocaleString()}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => `${Number(value).toLocaleString()}₮`}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                dataKey="grossPayments"
                stroke="var(--color-grossPayments)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="platformCommission"
                stroke="var(--color-platformCommission)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="netToTenants"
                stroke="var(--color-netToTenants)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="withdrawals"
                stroke="var(--color-withdrawals)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
