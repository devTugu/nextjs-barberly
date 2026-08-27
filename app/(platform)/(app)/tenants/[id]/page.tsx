import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { RequirePermission } from '@/features/auth';
import { TenantDetailPage } from '@/features/tenants';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { AdminPageHeader } from '@/shared/ui/admin-page-header';
import { Skeleton } from '@/shared/ui/skeleton';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PlatformTenantDetailPage({ params }: PageProps) {
  const { id } = await params;
  const tNav = await getTranslations('nav');

  return (
    <RequirePermission permission={PERMISSION_CODES.TENANT_READ}>
      <div className="space-y-6">
        <AdminPageHeader title={tNav('tenants')} />
        <Suspense fallback={<Skeleton className="mx-auto h-64 max-w-2xl" />}>
          <TenantDetailPage id={Number(id)} />
        </Suspense>
      </div>
    </RequirePermission>
  );
}
