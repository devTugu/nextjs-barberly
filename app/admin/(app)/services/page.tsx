import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { RequirePermission } from '@/features/auth';
import { ServicesTable } from '@/features/admin-services';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { AdminPageHeader } from '@/shared/ui/admin-page-header';
import { Skeleton } from '@/shared/ui/skeleton';

export default async function ShopServicesPage() {
  const tNav = await getTranslations('nav');
  const t = await getTranslations('entities.services');

  return (
    <RequirePermission permission={PERMISSION_CODES.SERVICE_READ}>
      <div className="space-y-6">
        <AdminPageHeader
          title={tNav('adminServices')}
          description={t('pageDescription')}
        />
        <Suspense
          fallback={
            <div className="space-y-4">
              <Skeleton className="h-10 w-full max-w-sm" />
              <Skeleton className="h-64 w-full" />
            </div>
          }
        >
          <ServicesTable />
        </Suspense>
      </div>
    </RequirePermission>
  );
}
