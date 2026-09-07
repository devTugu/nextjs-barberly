'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { publicGet } from '@/shared/lib/public-api';
import { isPublicApiError } from '@/shared/lib/public-api-error';
import { ROUTES } from '@/shared/config/routes';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { PageEmpty } from '@/shared/ui/page-states';
import { readBookingDraft, writeBookingDraft } from '../lib/booking-session';
import { BookingWizardShell } from './booking-wizard-shell';
import { DateStrip } from './date-strip';
import { TimeSlotGrid, type SlotSelection } from './time-slot-grid';
import { brandPrimaryButtonClass } from '@/shared/lib/brand-styles';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';

export function BookSlotStep() {
  const router = useRouter();
  const tenant = useTenantSubdomain();
  const locale = useLocale();
  const t = useTranslations('bookingWizard');
  const draft = readBookingDraft();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [date, setDate] = useState(draft.date || today);
  const [selectedSlot, setSelectedSlot] = useState<SlotSelection | null>(
    draft.selectedSlot,
  );
  const [slots, setSlots] = useState<SlotSelection[]>([]);
  const [timezone, setTimezone] = useState('UTC');
  const [error, setError] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (!draft.serviceIds.length || (!draft.selectedStaffId && !draft.anyStaff)) {
      router.replace(draft.serviceIds.length ? ROUTES.BOOK_STAFF : ROUTES.BOOK);
    }
  }, [draft.anyStaff, draft.serviceIds.length, draft.selectedStaffId, router]);

  const duration =
    draft.totalDurationMinutes > 0 ? draft.totalDurationMinutes : 60;
  const serviceIdsKey = draft.serviceIds.join(',');

  const loadSlots = useCallback(async () => {
    if (!date || (!draft.selectedStaffId && !draft.anyStaff)) return;
    setLoadingSlots(true);
    setError(null);
    setSelectedSlot(null);
    try {
      const query: Record<string, string> = {
        date,
        durationMinutes: String(duration),
      };
      if (serviceIdsKey) query.serviceIds = serviceIdsKey;
      if (draft.anyStaff) query.anyStaff = 'true';
      else if (draft.selectedStaffId) query.staffId = String(draft.selectedStaffId);
      const result = await publicGet<{
        staffId?: number;
        timezone: string;
        slots: Array<{ startUtc: string; staffId?: number }>;
      }>('/available-slots', tenant, query);
      setTimezone(result.timezone ?? 'UTC');
      setSlots(
        (result.slots ?? []).map((slot) => ({
          startAtUtc: slot.startUtc,
          staffId: slot.staffId ?? result.staffId ?? draft.selectedStaffId!,
        })),
      );
    } catch (err) {
      const code = isPublicApiError(err) ? err.code : 'UNKNOWN';
      setError(
        code === 'TOO_MANY_REQUESTS'
          ? t('errors.tooManyRequests')
          : code === 'CONFLICT'
            ? t('errors.slotTaken')
            : t('errors.loadSlots'),
      );
    } finally {
      setLoadingSlots(false);
    }
  }, [date, draft.anyStaff, draft.selectedStaffId, duration, serviceIdsKey, t, tenant]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadSlots(), 350);
    return () => window.clearTimeout(timer);
  }, [loadSlots]);

  const onContinue = () => {
    if (!selectedSlot) return;
    writeBookingDraft({ selectedSlot, date });
    router.push(ROUTES.BOOK_REVIEW);
  };

  return (
    <BookingWizardShell
      title={t('pickDateTime')}
      subtitle={
        draft.staffName ? t('staffSubtitle', { name: draft.staffName }) : undefined
      }
      backHref={ROUTES.BOOK_STAFF}
      footer={
        <Button
          disabled={!selectedSlot}
          onClick={onContinue}
          className={cn('min-h-12 w-full rounded-2xl text-base', brandPrimaryButtonClass)}
        >
          {t('continue')}
        </Button>
      }
    >
      <div className="space-y-6">
        <DateStrip
          value={date}
          onChange={(next) => {
            setDate(next);
            writeBookingDraft({ date: next });
          }}
          locale={locale}
        />
        <section>
          <h2 className="mb-3 text-sm font-medium">{t('pickTime')}</h2>
          {error ? (
            <div className="mb-3 space-y-2">
              <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
              <Button type="button" variant="outline" size="sm" onClick={loadSlots}>
                {t('errors.retry')}
              </Button>
            </div>
          ) : null}
          {!loadingSlots && slots.length === 0 && !error ? (
            <PageEmpty title={t('slot.empty')} />
          ) : (
            <TimeSlotGrid
              slots={slots}
              selected={selectedSlot}
              onSelect={setSelectedSlot}
              locale={locale}
              timeZone={timezone}
              loading={loadingSlots}
            />
          )}
        </section>
      </div>
    </BookingWizardShell>
  );
}
