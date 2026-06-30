import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { RequirePermission } from '@/features/auth';
import { BookingsTable } from '@/features/shop-bookings';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { AdminPageHeader } from '@/widgets/admin-page-header';
import { Skeleton } from '@/shared/ui/skeleton';

export default async function ShopBookingsPage() {
  const tNav = await getTranslations('nav');
  const t = await getTranslations('entities.bookings');

  return (
    <RequirePermission permission={PERMISSION_CODES.BOOKING_READ}>
      <div className="space-y-6">
        <AdminPageHeader
          title={tNav('shopBookings')}
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
          <BookingsTable />
        </Suspense>
      </div>
    </RequirePermission>
  );
}
