import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { RequirePermission } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { AdminPageHeader } from '@/shared/ui/admin-page-header';
import { AdminDashboardPanel } from '@/widgets/admin-dashboard';
import { BrandDashboardPanel } from '@/widgets/admin-dashboard';
import { Skeleton } from '@/shared/ui/skeleton';

export default async function AdminDashboardPage() {
  const tNav = await getTranslations('nav');

  return (
    <RequirePermission permission={PERMISSION_CODES.BOOKING_READ}>
      <div className="space-y-6">
        <AdminPageHeader title={tNav('adminDashboard')} />
        <Suspense fallback={<Skeleton className="h-48 w-full" />}>
          <AdminDashboardPanel />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
          <BrandDashboardPanel compact />
        </Suspense>
      </div>
    </RequirePermission>
  );
}
