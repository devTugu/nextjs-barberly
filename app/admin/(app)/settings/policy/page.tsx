import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { RequirePermission } from '@/features/auth';
import { AdminPolicyForm } from '@/features/admin-settings';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { AdminPageHeader } from '@/shared/ui/admin-page-header';
import { Skeleton } from '@/shared/ui/skeleton';

export default async function AdminPolicyPage() {
  const tNav = await getTranslations('nav');
  const t = await getTranslations('adminSettings');

  return (
    <RequirePermission permission={PERMISSION_CODES.TENANT_SETTINGS_READ}>
      <div className="space-y-6">
        <AdminPageHeader
          title={`${tNav('adminSettings')} — ${t('policies')}`}
          description={t('policyDescription')}
        />
        <Suspense fallback={<Skeleton className="h-64 w-full max-w-lg" />}>
          <AdminPolicyForm />
        </Suspense>
      </div>
    </RequirePermission>
  );
}
