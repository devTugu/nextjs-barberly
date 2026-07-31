import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { RequirePermission } from '@/features/auth';
import { TenantCreatePage } from '@/features/tenants/ui/tenant-pages';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { AdminPageHeader } from '@/widgets/admin-page-header';
import { Skeleton } from '@/shared/ui/skeleton';

export default async function PlatformTenantNewPage() {
  const tNav = await getTranslations('nav');
  const t = await getTranslations('entities.tenants');

  return (
    <RequirePermission permission={PERMISSION_CODES.TENANT_CREATE}>
      <div className="space-y-6">
        <AdminPageHeader
          title={tNav('tenants')}
          description={t('createDescription')}
        />
        <Suspense fallback={<Skeleton className="mx-auto h-64 max-w-lg" />}>
          <TenantCreatePage />
        </Suspense>
      </div>
    </RequirePermission>
  );
}
