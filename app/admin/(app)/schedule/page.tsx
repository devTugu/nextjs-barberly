import { Suspense } from 'react';

import { getTranslations } from 'next-intl/server';

import { RequirePermission } from '@/features/auth';

import { PERMISSION_CODES } from '@/shared/config/permissions';

import { AdminPageHeader } from '@/shared/ui/admin-page-header';
import { ScheduleHub } from '@/widgets/admin-schedule';

import { Skeleton } from '@/shared/ui/skeleton';



export default async function AdminSchedulePage() {

  const tSchedule = await getTranslations('adminSettings');

  const t = await getTranslations('entities.schedule');



  return (

    <RequirePermission permission={PERMISSION_CODES.SCHEDULE_READ}>

      <div className="space-y-6">

        <div className="hidden md:block">

          <AdminPageHeader

            title={tSchedule('schedule')}

            description={t('pageDescription')}

          />

        </div>

        <Suspense fallback={<Skeleton className="h-64 w-full" />}>

          <ScheduleHub />

        </Suspense>

      </div>

    </RequirePermission>

  );

}



