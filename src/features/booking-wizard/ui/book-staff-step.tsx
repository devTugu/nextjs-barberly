'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { usePublicStaffList } from '@/entities/staff';
import { getInitials, staffRatingPlaceholder } from '@/entities/booking';
import { ROUTES } from '@/shared/config/routes';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { readBookingDraft, writeBookingDraft } from '../lib/booking-session';
import { BookingWizardShell } from './booking-wizard-shell';
import { ANY_STAFF_ID } from './staff-card-picker';
import { SelectRow } from './select-row';
import { brandPrimaryButtonClass } from '@/shared/lib/brand-styles';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { PageEmpty, PageLoading } from '@/shared/ui/page-states';
import { Star, Users } from 'lucide-react';

export function BookStaffStep() {
  const router = useRouter();
  const tenant = useTenantSubdomain();
  const t = useTranslations('bookingWizard');
  const draft = readBookingDraft();
  const { data: staff, isLoading, isError } = usePublicStaffList(tenant);
  const [selectedId, setSelectedId] = useState<number | null>(
    draft.anyStaff ? ANY_STAFF_ID : draft.selectedStaffId,
  );
  const serviceLabel = draft.serviceNames[0] ?? '';

  useEffect(() => {
    if (!draft.serviceIds.length) router.replace(ROUTES.BOOK);
  }, [draft.serviceIds.length, router]);

  if (isLoading) return <PageLoading />;
  if (isError || !staff?.length) {
    return <PageEmpty title={t('errors.loadStaff')} />;
  }

  const onContinue = () => {
    if (selectedId === null) return;
    const anyStaff = selectedId === ANY_STAFF_ID;
    const member = staff.find((item) => item.id === selectedId);
    writeBookingDraft({
      anyStaff,
      selectedStaffId: anyStaff ? null : selectedId,
      staffName: anyStaff ? t('anyStaff') : member?.displayName ?? '',
      date: draft.date || new Date().toISOString().slice(0, 10),
    });
    router.push(ROUTES.BOOK_SLOT);
  };

  return (
    <BookingWizardShell
      title={t('pickStaff')}
      subtitle={serviceLabel ? t('selectedService', { name: serviceLabel }) : undefined}
      backHref={ROUTES.BOOK}
      footer={
        <Button
          disabled={selectedId === null}
          onClick={onContinue}
          className={cn('min-h-12 w-full rounded-2xl text-base', brandPrimaryButtonClass)}
        >
          {t('continue')}
        </Button>
      }
    >
      <div className="space-y-2">
        <SelectRow
          selected={selectedId === ANY_STAFF_ID}
          onClick={() => setSelectedId(ANY_STAFF_ID)}
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Users className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium">{t('anyStaff')}</p>
            <p className="text-sm text-muted-foreground">{t('anyStaffHint')}</p>
          </div>
        </SelectRow>
        {staff.map((member) => (
          <SelectRow
            key={member.id}
            selected={selectedId === member.id}
            onClick={() => setSelectedId(member.id)}
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-[var(--brand-primary,#3b82f6)]">
              {getInitials(member.displayName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{member.displayName}</p>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                {t('staffRole')}
                <Star className="size-3 fill-amber-400 text-amber-400" />
                {staffRatingPlaceholder(member.id)}
              </p>
            </div>
          </SelectRow>
        ))}
      </div>
    </BookingWizardShell>
  );
}
