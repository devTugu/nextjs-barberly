import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { RequirePermission } from '@/features/auth';
import { AdminLandingContentForm } from '@/features/admin-settings/ui/admin-landing-content-form';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { AdminPageHeader } from '@/widgets/admin-page-header';
import { Skeleton } from '@/shared/ui/skeleton';

export default async function AdminLandingSettingsPage() {
  const t = await getTranslations('adminSettings');

  return (
    <RequirePermission permission={PERMISSION_CODES.TENANT_SETTINGS_READ}>
      <div className="space-y-6">
        <AdminPageHeader title={t('landingTitle')} description={t('landingDescription')} />
        <Suspense fallback={<Skeleton className="h-96 w-full max-w-2xl" />}>
          <AdminLandingContentForm />
        </Suspense>
      </div>
    </RequirePermission>
  );
}
