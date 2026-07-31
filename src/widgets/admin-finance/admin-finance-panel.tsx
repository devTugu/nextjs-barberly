'use client';

import { useTranslations } from 'next-intl';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { useFinanceSummary } from '@/entities/finance/api/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { PageLoading } from '@/shared/ui/page-states';

function formatMnt(value: number) {
  return new Intl.NumberFormat('mn-MN', {
    style: 'currency',
    currency: 'MNT',
    maximumFractionDigits: 0,
  }).format(value);
}

export function AdminFinancePanel() {
  const t = useTranslations('entities.tenantFinance');
  const tenant = useTenantSubdomain();
  const { data, isLoading } = useFinanceSummary(tenant);

  if (isLoading || !data) return <PageLoading />;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>{t('escrow')}</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold tabular-nums">
          {formatMnt(data.tenantEscrow)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('available')}</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold tabular-nums">
          {formatMnt(data.ownerAvailable)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('staffEarningsTotal')}</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold tabular-nums">
          {formatMnt(
            data.staffEarnings.reduce((sum, row) => sum + row.balance, 0),
          )}
        </CardContent>
      </Card>
    </div>
  );
}
