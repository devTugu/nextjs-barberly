import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { RequirePermission } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { AdminPageHeader } from '@/shared/ui/admin-page-header';
import { AdminCalendarPanel } from '@/widgets/admin-calendar';
import { Skeleton } from '@/shared/ui/skeleton';

export default async function AdminCalendarPage() {
  const tNav = await getTranslations('nav');

  return (
    <RequirePermission permission={PERMISSION_CODES.BOOKING_READ}>
      <div className="space-y-6">
        <div className="hidden md:block">
          <AdminPageHeader title={tNav('adminCalendar')} />
        </div>
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <AdminCalendarPanel />
        </Suspense>
      </div>
    </RequirePermission>
  );
}
