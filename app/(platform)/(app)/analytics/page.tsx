import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { RequirePermission } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { PlatformAnalytics } from '@/widgets/dashboard-stats';
import { AdminPageHeader } from '@/widgets/admin-page-header';
import { Skeleton } from '@/shared/ui/skeleton';

export default async function AnalyticsPage() {
  const tNav = await getTranslations('nav');
  const t = await getTranslations('dashboard.finance');

  return (
    <RequirePermission permission={PERMISSION_CODES.TENANT_READ}>
      <div className="space-y-6">
        <AdminPageHeader title={tNav('analytics')} description={t('description')} />
        <Suspense
          fallback={
            <div className="space-y-6">
              <Skeleton className="h-[380px] w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          }
        >
          <PlatformAnalytics />
        </Suspense>
      </div>
    </RequirePermission>
  );
}
