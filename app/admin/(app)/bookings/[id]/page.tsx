import { Suspense } from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { RequirePermission } from '@/features/auth';
import { BookingDetailActions } from '@/features/admin-bookings/ui/booking-detail-actions';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { ROUTES } from '@/shared/config/routes';
import { AdminPageHeader } from '@/widgets/admin-page-header';
import { Button } from '@/shared/ui/button';
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminBookingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const t = await getTranslations('entities.bookings');
  const tCommon = await getTranslations('common');

  return (
    <RequirePermission permission={PERMISSION_CODES.BOOKING_READ}>
      <div className="mx-auto max-w-lg space-y-6">
        <AdminPageHeader
          title={t('detailTitle', { id })}
          description={t('pageDescription')}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href={ROUTES.ADMIN_BOOKINGS}>{tCommon('back')}</Link>
            </Button>
          }
        />
        <Suspense>
          <BookingDetailActions bookingId={Number(id)} />
        </Suspense>
      </div>
    </RequirePermission>
  );
}
