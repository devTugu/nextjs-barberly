import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { RequirePermission } from '@/features/auth';
import { TenantEditPage } from '@/features/tenants/ui/tenant-pages';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { AdminPageHeader } from '@/widgets/admin-page-header';
import { Skeleton } from '@/shared/ui/skeleton';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PlatformTenantEditRoute({ params }: PageProps) {
  const { id } = await params;
  const t = await getTranslations('entities.tenants');

  return (
    <RequirePermission permission={PERMISSION_CODES.TENANT_UPDATE}>
      <div className="space-y-6">
        <AdminPageHeader title={t('editTenant')} />
        <Suspense fallback={<Skeleton className="mx-auto h-64 max-w-lg" />}>
          <TenantEditPage id={Number(id)} />
        </Suspense>
      </div>
    </RequirePermission>
  );
}
