'use client';

import { Suspense, useState } from 'react';
import { useTranslations } from 'next-intl';
import { RequirePermission } from '@/features/auth';
import { ManualBookingSheet } from '@/features/admin-bookings';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { AdminPageHeader } from '@/shared/ui/admin-page-header';
import { Button } from '@/shared/ui/button';

function ManualBookingPageContent() {
  const t = useTranslations('entities.bookings');
  const [open, setOpen] = useState(true);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('manualTitle')}
        description={t('manualDescription')}
      />
      <Button size="lg" className="h-14 w-full" onClick={() => setOpen(true)}>
        {t('addManual')}
      </Button>
      <ManualBookingSheet open={open} onOpenChange={setOpen} />
    </div>
  );
}

export default function AdminNewBookingPage() {
  return (
    <RequirePermission permission={PERMISSION_CODES.BOOKING_CREATE}>
      <Suspense>
        <ManualBookingPageContent />
      </Suspense>
    </RequirePermission>
  );
}
