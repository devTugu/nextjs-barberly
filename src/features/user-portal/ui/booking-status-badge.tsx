'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';

const BOOKING_STATUSES = [
  'confirmed',
  'pending_payment',
  'cancelled',
  'cancelled_by_customer',
  'cancelled_by_barber',
  'expired',
  'completed',
  'no_show',
] as const;

type BookingStatusKey = (typeof BOOKING_STATUSES)[number];

function statusClass(status: string): string {
  if (status === 'confirmed') {
    return 'border-[var(--brand-primary,#f97316)]/40 bg-[var(--brand-primary,#f97316)]/15 text-[var(--brand-primary,#f97316)]';
  }
  if (status === 'pending_payment') {
    return 'border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400';
  }
  if (status === 'completed') {
    return 'border-border bg-muted text-muted-foreground';
  }
  return 'border-destructive/30 bg-destructive/10 text-destructive';
}

export function BookingStatusBadge({ status }: { status: string }) {
  const t = useTranslations('userPortal');

  const label = (BOOKING_STATUSES as readonly string[]).includes(status)
    ? t(`bookingStatus.${status as BookingStatusKey}`)
    : status;

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        statusClass(status),
      )}
    >
      {label}
    </span>
  );
}
