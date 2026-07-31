import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { RequirePermission } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { AdminPageHeader } from '@/widgets/admin-page-header';
import { AdminFinancePanel } from '@/widgets/admin-finance/admin-finance-panel';
import { Skeleton } from '@/shared/ui/skeleton';

export default async function AdminFinancePage() {
  const tNav = await getTranslations('nav');
  const t = await getTranslations('entities.tenantFinance');

  return (
    <RequirePermission permission={PERMISSION_CODES.WALLET_READ}>
      <div className="space-y-6">
        <AdminPageHeader
          title={tNav('adminFinance')}
          description={t('pageDescription')}
        />
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <AdminFinancePanel />
        </Suspense>
      </div>
    </RequirePermission>
  );
}
