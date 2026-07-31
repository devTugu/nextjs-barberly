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
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function DateStrip({ value, onChange, locale, days = 14 }: DateStripProps) {
  const dateLocale = getDateLocale((locale ?? 'en') as Locale);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const options = Array.from({ length: days }, (_, i) => {
    const next = new Date(today);
    next.setDate(next.getDate() + i);
    return next;
  });

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {options.map((date) => {
        const iso = toLocalIsoDate(date);
        const selected = iso === value;
        const weekday = new Intl.DateTimeFormat(dateLocale, { weekday: 'short' })
          .format(date)
          .replace('.', '');
        const dayNum = date.getDate();
        return (
          <button
            key={iso}
            type="button"
            onClick={() => onChange(iso)}
            className={cn(
              'flex min-w-[3.25rem] flex-col items-center rounded-xl px-3 py-2 text-sm transition-colors',
              selected
                ? 'bg-[var(--brand-primary,#f97316)] font-semibold text-white'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted',
            )}
          >
            <span className="text-xs uppercase">{weekday}</span>
            <span className="text-lg leading-none">{dayNum}</span>
          </button>
        );
      })}
    </div>
  );
}
