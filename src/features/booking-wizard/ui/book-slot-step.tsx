'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { publicGet } from '@/shared/lib/public-api';
import { isPublicApiError } from '@/shared/lib/public-api-error';
import { ROUTES } from '@/shared/config/routes';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { PageEmpty } from '@/shared/ui/page-states';
import { readBookingDraft, writeBookingDraft } from '../lib/booking-session';
import {
  loadAvailableSlotsUseCase,
  lockSlotAndRouteUseCase,
} from '../model/lock-slot-use-case';
import { sumServicePrice, formatMnt } from '@/entities/booking';
import { BookingWizardShell } from './booking-wizard-shell';
import { DateStrip } from './date-strip';
import { TimeSlotGrid, type SlotSelection } from './time-slot-grid';
import { brandPrimaryButtonClass } from '@/shared/lib/brand-styles';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';

type Service = { id: number; name: string; price: number; durationMinutes: number };

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
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [locking, setLocking] = useState(false);

  useEffect(() => {
    if (!draft.serviceIds.length || (!draft.selectedStaffId && !draft.anyStaff)) {
      router.replace(
        draft.serviceIds.length ? ROUTES.BOOK_STAFF : ROUTES.BOOK,
      );
    }
  }, [draft.anyStaff, draft.serviceIds.length, draft.selectedStaffId, router]);

  useEffect(() => {
    publicGet<Service[]>('/services', tenant)
      .then(setServices)
      .catch(() => undefined);
  }, [tenant]);

  const duration =
    draft.totalDurationMinutes > 0 ? draft.totalDurationMinutes : 60;
  const serviceIdsKey = draft.serviceIds.join(',');
  const selectedStaffId = draft.selectedStaffId;
  const anyStaff = draft.anyStaff;

  const totalPrice = useMemo(
    () => sumServicePrice(services, draft.serviceIds),
    [services, draft.serviceIds],
  );

  const loadSlots = useCallback(async () => {
    if (!date || (!selectedStaffId && !anyStaff)) return;
    setLoadingSlots(true);
    setError(null);
    setSelectedSlot(null);
    try {
      const result = await loadAvailableSlotsUseCase({
        tenant,
        date,
        durationMinutes: duration,
        serviceIds: draft.serviceIds,
        anyStaff,
        selectedStaffId,
      });
      setTimezone(result.timezone);
      setSlots(result.slots);
    } catch (e) {
      const code = isPublicApiError(e) ? e.code : 'UNKNOWN';
      const message = e instanceof Error ? e.message : '';
      setError(
        message.includes('Too Many') || code === 'TOO_MANY_REQUESTS'
          ? t('errors.tooManyRequests')
          : code === 'CONFLICT'
            ? t('errors.slotTaken')
            : message || t('errors.loadSlots'),
      );
    } finally {
      setLoadingSlots(false);
    }
  }, [anyStaff, date, duration, draft.serviceIds, selectedStaffId, t, tenant]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSlots();
    }, 350);
    return () => window.clearTimeout(timer);
  }, [loadSlots]);

  const onDateChange = (next: string) => {
    setDate(next);
    writeBookingDraft({ date: next });
  };

  const lockSlot = async () => {
    if (!selectedSlot) return;
    setLocking(true);
    setError(null);
    try {
      const { booking, route } = await lockSlotAndRouteUseCase({
        tenant,
        serviceIds: draft.serviceIds,
        startAtUtc: selectedSlot.startAtUtc,
        staffId: selectedSlot.staffId,
      });
      writeBookingDraft({
        selectedSlot,
        date,
        booking,
      });
      router.push(route === 'pay' ? ROUTES.BOOK_PAY : ROUTES.BOOK_OTP);
    } catch (e) {
      setError(
        isPublicApiError(e) && e.code === 'CONFLICT'
          ? t('errors.slotTaken')
          : e instanceof Error
            ? e.message
            : t('errors.lockFailed'),
      );
    } finally {
      setLocking(false);
    }
  };

  const footer = (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{t('pay.totalLabel')}</span>
        <span className="text-lg font-semibold">
          {formatMnt(totalPrice || draft.booking?.totalPrice || 0, locale)}
        </span>
      </div>
      <Button
        disabled={!selectedSlot || locking}
        onClick={lockSlot}
        className={cn('min-h-12 w-full rounded-xl text-base', brandPrimaryButtonClass)}
      >
        {locking ? <Loader2 className="size-5 animate-spin" /> : t('otpPayCta')}
      </Button>
    </div>
  );

  return (
    <BookingWizardShell
      step={3}
      title={t('slot.pageTitle')}
      backHref={ROUTES.BOOK_STAFF}
      footer={footer}
    >
      <div className="space-y-6">
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            {t('dateLabel')}
          </h2>
          <DateStrip value={date} onChange={onDateChange} locale={locale} />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            {t('slot.title')}
          </h2>
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
