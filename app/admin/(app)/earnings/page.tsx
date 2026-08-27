import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { RequirePermission } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { AdminPageHeader } from '@/shared/ui/admin-page-header';
import { AdminEarningsPanel } from '@/widgets/admin-finance';
import { Skeleton } from '@/shared/ui/skeleton';

export default async function AdminEarningsPage() {
  const tNav = await getTranslations('nav');
  const t = await getTranslations('entities.tenantFinance');

  return (
    <RequirePermission permission={PERMISSION_CODES.DASHBOARD_READ}>
      <div className="space-y-6">
        <AdminPageHeader
          title={tNav('adminEarnings')}
          description={t('earningsDescription')}
        />
        <Suspense fallback={<Skeleton className="h-48 w-full max-w-lg" />}>
          <AdminEarningsPanel />
        </Suspense>
      </div>
    </RequirePermission>
  );
}
