import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { RequirePermission } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { AdminPageHeader } from '@/widgets/admin-page-header';
import { ScheduleSetupWizard } from '@/widgets/admin-schedule';
import { Skeleton } from '@/shared/ui/skeleton';

export default async function AdminScheduleSetupPage() {
  const t = await getTranslations('adminSchedule.setup');

  return (
    <RequirePermission permission={PERMISSION_CODES.SCHEDULE_UPDATE}>
      <div className="space-y-6">
        <AdminPageHeader title={t('title')} description={t('description')} />
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <ScheduleSetupWizard />
        </Suspense>
      </div>
    </RequirePermission>
  );
}
