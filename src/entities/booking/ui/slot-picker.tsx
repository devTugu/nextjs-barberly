'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { publicGet } from '@/shared/lib/public-api';
import { isPublicApiError } from '@/shared/lib/public-api-error';
import { PageEmpty, PageLoading } from '@/shared/ui/page-states';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export type SlotSelection = { startAtUtc: string; staffId: number };

type SlotResponse = {
  staffId: number;
  timezone: string;
  slots: Array<{ startUtc: string }>;
};

interface SlotPickerProps {
  tenant: string;
  date: string;
  durationMinutes: number;
  staffId?: number;
  serviceIds?: number[];
  timezone?: string;
  selectedSlot: SlotSelection | null;
  onSelect: (slot: SlotSelection | null) => void;
  locale?: string;
}

export function SlotPicker({
  tenant,
  date,
  durationMinutes,
  staffId,
  serviceIds,
  timezone,
  selectedSlot,
  onSelect,
  locale,
}: SlotPickerProps) {
  const t = useTranslations('bookingWizard');
  const [slots, setSlots] = useState<SlotSelection[]>([]);
  const [resolvedTimezone, setResolvedTimezone] = useState(timezone ?? 'UTC');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const serviceIdsKey = serviceIds?.join(',') ?? '';

  const loadSlots = useCallback(async () => {
    if (!date || durationMinutes <= 0 || !staffId) return;
    setLoading(true);
    setError(null);
    try {
      const query: Record<string, string> = {
        date,
        durationMinutes: String(durationMinutes),
      };
      if (serviceIdsKey) {
        query.serviceIds = serviceIdsKey;
      }
      if (staffId) query.staffId = String(staffId);
      if (timezone) query.timezone = timezone;

      const result = await publicGet<SlotResponse>(
        '/available-slots',
        tenant,
        query,
      );
      setResolvedTimezone(result.timezone ?? timezone ?? 'UTC');
      setSlots(
        (result.slots ?? []).map((slot) => ({
          startAtUtc: slot.startUtc,
          staffId: result.staffId,
        })),
      );
    } catch (e) {
      const code = isPublicApiError(e) ? e.code : 'UNKNOWN';
      if (code === 'CONFLICT') {
        setError(t('errors.slotTaken'));
      } else {
        setError(e instanceof Error ? e.message : t('errors.loadSlots'));
      }
    } finally {
      setLoading(false);
    }
  }, [date, durationMinutes, serviceIdsKey, staffId, tenant, timezone]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSlots();
    }, 350);
    return () => window.clearTimeout(timer);
  }, [loadSlots]);

  const formatSlot = (startAtUtc: string) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: resolvedTimezone,
    }).format(new Date(startAtUtc));

  if (loading && slots.length === 0) {
    return <PageLoading rows={4} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('slot.title')}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {error ? (
          <div className="space-y-2">
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
            <Button type="button" variant="outline" size="sm" onClick={loadSlots}>
              {t('errors.retry')}
            </Button>
          </div>
        ) : null}
        {!loading && slots.length === 0 && !error ? (
          <PageEmpty title={t('slot.empty')} />
        ) : null}
        {slots.map((slot) => (
          <Button
            key={slot.startAtUtc}
            type="button"
            className="min-h-11"
            variant={
              selectedSlot?.startAtUtc === slot.startAtUtc
                ? 'default'
                : 'outline'
            }
            onClick={() => onSelect(slot)}
          >
            {formatSlot(slot.startAtUtc)}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
