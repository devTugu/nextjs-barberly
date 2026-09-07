'use client';

import { cn } from '@/shared/lib/utils';
import { getDateLocale } from '@/shared/i18n/messages';
import type { Locale } from '@/shared/i18n/config';

interface DateStripProps {
  value: string;
  onChange: (date: string) => void;
  locale?: string;
  days?: number;
}

function toLocalIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DateStrip({ value, onChange, locale, days = 14 }: DateStripProps) {
  const dateLocale = getDateLocale((locale ?? 'en') as Locale);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const options = Array.from({ length: days }, (_, index) => {
    const next = new Date(today);
    next.setDate(next.getDate() + index);
    return next;
  });
  const selected = options.find((date) => toLocalIsoDate(date) === value) ?? today;
  const monthLabel = new Intl.DateTimeFormat(dateLocale, {
    month: 'long',
    year: 'numeric',
  }).format(selected);

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium capitalize">{monthLabel}</p>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {options.map((date) => {
          const iso = toLocalIsoDate(date);
          const active = iso === value;
          const weekday = new Intl.DateTimeFormat(dateLocale, { weekday: 'short' })
            .format(date)
            .replace('.', '');
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onChange(iso)}
              className="flex min-w-[3rem] flex-col items-center gap-2"
            >
              <span className="text-[11px] uppercase text-muted-foreground">{weekday}</span>
              <span
                className={cn(
                  'flex size-10 items-center justify-center rounded-full text-sm font-semibold',
                  active
                    ? 'bg-[var(--brand-primary,#3b82f6)] text-white'
                    : 'text-foreground',
                )}
              >
                {date.getDate()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
