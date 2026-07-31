'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { usePublicStaffList } from '@/entities/staff';
import { ROUTES } from '@/shared/config/routes';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { readBookingDraft, writeBookingDraft } from '../lib/booking-session';
import { BookingWizardShell } from './booking-wizard-shell';
import { ANY_STAFF_ID, StaffCardPicker } from './staff-card-picker';
import { brandPrimaryButtonClass } from '@/shared/lib/brand-styles';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { PageEmpty, PageLoading } from '@/shared/ui/page-states';

export function BookStaffStep() {
  const router = useRouter();
  const tenant = useTenantSubdomain();
  const t = useTranslations('bookingWizard');
  const draft = readBookingDraft();
  const { data: staff, isLoading, isError } = usePublicStaffList(tenant);
  const [selectedId, setSelectedId] = useState<number | null>(
    draft.anyStaff ? ANY_STAFF_ID : draft.selectedStaffId,
  );

  useEffect(() => {
    if (!draft.serviceIds.length) {
      router.replace(ROUTES.BOOK);
    }
  }, [draft.serviceIds.length, router]);

  if (isLoading) return <PageLoading />;
  if (isError || !staff?.length) {
    return <PageEmpty title={t('errors.loadStaff')} />;
  }

  const onContinue = () => {
    if (selectedId === null) return;
    const today = new Date().toISOString().slice(0, 10);
    const anyStaff = selectedId === ANY_STAFF_ID;
    writeBookingDraft({
      anyStaff,
      selectedStaffId: anyStaff ? null : selectedId,
      date: draft.date || today,
    });
    router.push(ROUTES.BOOK_SLOT);
  };

  const footer = (
    <Button
      disabled={selectedId === null}
      onClick={onContinue}
      className={cn('min-h-12 w-full rounded-xl text-base', brandPrimaryButtonClass)}
    >
      {t('nextSlot')}
    </Button>
  );

  return (
    <BookingWizardShell
      step={2}
      title={t('pickStaff')}
      backHref={ROUTES.BOOK}
      footer={footer}
    >
      <p className="mb-4 text-sm font-medium text-muted-foreground">
        {t('pickStaff')}
      </p>
      <StaffCardPicker
        staff={staff}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
    </BookingWizardShell>
  );
}
