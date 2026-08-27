import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { RequirePermission } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { AdminPageHeader } from '@/shared/ui/admin-page-header';
import { AdminStaffPanel } from '@/widgets/admin-staff';
import { Skeleton } from '@/shared/ui/skeleton';

export default async function AdminStaffPage() {
  const tNav = await getTranslations('nav');
  const t = await getTranslations('entities.tenantStaff');

  return (
    <RequirePermission permission={PERMISSION_CODES.STAFF_READ}>
      <div className="space-y-6">
        <AdminPageHeader
          title={tNav('adminStaff')}
          description={t('pageDescription')}
        />
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <AdminStaffPanel />
        </Suspense>
      </div>
    </RequirePermission>
  );
}
