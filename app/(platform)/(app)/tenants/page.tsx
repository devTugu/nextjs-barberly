import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { RequirePermission } from '@/features/auth';
import { TenantsTable } from '@/features/tenants';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { AdminPageHeader } from '@/shared/ui/admin-page-header';
import { Skeleton } from '@/shared/ui/skeleton';

export default async function TenantsPage() {
  const tNav = await getTranslations('nav');
  const t = await getTranslations('entities.tenants');

  return (
    <RequirePermission permission={PERMISSION_CODES.TENANT_READ}>
      <div className="space-y-6">
        <AdminPageHeader
          title={tNav('tenants')}
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
          <TenantsTable />
        </Suspense>
      </div>
    </RequirePermission>
  );
}
