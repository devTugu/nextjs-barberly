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
  return Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
}

function slotPeriod(hour: number): SlotPeriod {
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function groupSlots(
  slots: SlotSelection[],
  timeZone: string,
): Record<SlotPeriod, SlotSelection[]> {
  const groups: Record<SlotPeriod, SlotSelection[]> = {
    morning: [],
    afternoon: [],
    evening: [],
  };
  for (const slot of slots) {
    const hour = getHourInTimezone(slot.startAtUtc, timeZone);
    groups[slotPeriod(hour)].push(slot);
  }
  return groups;
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
  const periodLabels = {
    morning: t('slot.morning'),
    afternoon: t('slot.afternoon'),
    evening: t('slot.evening'),
  };

  if (loading && slots.length === 0) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-11 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (!loading && slots.length === 0) {
    return null;
  }

  const groups = groupSlots(slots, timeZone);
  const order: SlotPeriod[] = ['morning', 'afternoon', 'evening'];

  return (
    <div className="space-y-5">
      {order.map((period) => {
        const periodSlots = groups[period];
        if (periodSlots.length === 0) return null;
        return (
          <section key={period}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {periodLabels[period]}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {periodSlots.map((slot) => {
                const isSelected = selected?.startAtUtc === slot.startAtUtc;
                const label = formatSlotTime(slot.startAtUtc, locale, timeZone);
                return (
                  <button
                    key={`${slot.startAtUtc}-${slot.staffId}`}
                    type="button"
                    onClick={() => onSelect(slot)}
                    className={cn(
                      'min-h-11 rounded-xl border text-sm font-medium transition-colors',
                      isSelected
                        ? brandPrimarySlotClass
                        : 'border-border/60 bg-card hover:border-[var(--brand-primary,#f97316)]/50',
                    )}
                  >
                    {label}
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
