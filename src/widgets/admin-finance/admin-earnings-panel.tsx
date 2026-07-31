'use client';

import { useTranslations } from 'next-intl';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { useStaffEarnings } from '@/entities/finance/api/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { PageLoading } from '@/shared/ui/page-states';

export function AdminEarningsPanel() {
  const t = useTranslations('entities.tenantFinance');
  const tenant = useTenantSubdomain();
  const { data, isLoading } = useStaffEarnings(tenant);

  if (isLoading || !data) return <PageLoading />;

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>{t('myEarnings')}</CardTitle>
      </CardHeader>
      <CardContent className="text-3xl font-semibold tabular-nums">
        {new Intl.NumberFormat('mn-MN', {
          style: 'currency',
          currency: data.currency,
          maximumFractionDigits: 0,
        }).format(data.balance)}
      </CardContent>
    </Card>
  );
}
