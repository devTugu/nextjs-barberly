import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { RequirePermission } from '@/features/auth';
import { AdminBrandingForm } from '@/features/admin-settings';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { AdminPageHeader } from '@/shared/ui/admin-page-header';
import { Skeleton } from '@/shared/ui/skeleton';

export default async function AdminBrandingPage() {
  const tNav = await getTranslations('nav');
  const t = await getTranslations('adminSettings');

  return (
    <RequirePermission permission={PERMISSION_CODES.TENANT_SETTINGS_READ}>
      <div className="space-y-6">
        <AdminPageHeader
          title={`${tNav('adminSettings')} — ${t('branding')}`}
          description={t('brandingDescription')}
        />
        <Suspense fallback={<Skeleton className="h-64 w-full max-w-lg" />}>
          <AdminBrandingForm />
        </Suspense>
      </div>
    </RequirePermission>
  );
}
