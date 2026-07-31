import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { RequirePermission } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { AdminPageHeader } from '@/widgets/admin-page-header';
import { BrandDashboardPanel } from '@/widgets/admin-dashboard/brand-dashboard-panel';
import { Skeleton } from '@/shared/ui/skeleton';

export default async function AdminBrandDashboardPage() {
  const t = await getTranslations('dashboard.brand');

  return (
    <RequirePermission permission={PERMISSION_CODES.BOOKING_READ}>
      <div className="space-y-6">
        <AdminPageHeader title={t('title')} description={t('description')} />
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <BrandDashboardPanel />
        </Suspense>
      </div>
    </RequirePermission>
  );
}
