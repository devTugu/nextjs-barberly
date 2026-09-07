'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { brandPrimarySlotClass } from '@/shared/lib/brand-styles';
import { formatSlotTime } from '@/entities/booking';

export type SlotSelection = { startAtUtc: string; staffId: number };

type SlotPeriod = 'morning' | 'afternoon' | 'evening';

interface TimeSlotGridProps {
  slots: SlotSelection[];
  selected: SlotSelection | null;
  onSelect: (slot: SlotSelection) => void;
  locale?: string;
  timeZone?: string;
  loading?: boolean;
}

function getHourInTimezone(iso: string, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hour12: false,
    timeZone,
  }).formatToParts(new Date(iso));
  return Number(parts.find((part) => part.type === 'hour')?.value ?? 0);
}

function slotPeriod(hour: number): SlotPeriod {
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export function TimeSlotGrid({
  slots,
  selected,
  onSelect,
  locale,
  timeZone = 'UTC',
  loading,
}: TimeSlotGridProps) {
  const t = useTranslations('bookingWizard');

  if (loading && slots.length === 0) {
    return (
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-10 animate-pulse rounded-full bg-muted" />
        ))}
      </div>
    );
  }

  const groups: Record<SlotPeriod, SlotSelection[]> = {
    morning: [],
    afternoon: [],
    evening: [],
  };
  for (const slot of slots) {
    groups[slotPeriod(getHourInTimezone(slot.startAtUtc, timeZone))].push(slot);
  }

  return (
    <div className="space-y-5">
      {(['morning', 'afternoon', 'evening'] as const).map((period) => {
        const periodSlots = groups[period];
        if (periodSlots.length === 0) return null;
        return (
          <section key={period}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t(`slot.${period}`)}
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {periodSlots.map((slot) => {
                const isSelected = selected?.startAtUtc === slot.startAtUtc;
                return (
                  <button
                    key={`${slot.startAtUtc}-${slot.staffId}`}
                    type="button"
                    onClick={() => onSelect(slot)}
                    className={cn(
                      'min-h-10 rounded-full border text-sm font-medium',
                      isSelected
                        ? brandPrimarySlotClass
                        : 'border-border bg-card text-foreground',
                    )}
                  >
                    {formatSlotTime(slot.startAtUtc, locale, timeZone)}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
