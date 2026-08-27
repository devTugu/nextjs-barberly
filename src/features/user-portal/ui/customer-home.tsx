'use client';

import Link from 'next/link';
import { ArrowRight, CalendarPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  useCancelPreview,
  useReschedulePreview,
} from '@/entities/booking';
import { ROUTES } from '@/shared/config/routes';
import { brandPrimaryButtonClass } from '@/shared/lib/brand-styles';
import { cn } from '@/shared/lib/utils';
import { getInitials } from '@/entities/booking';
import { Button } from '@/shared/ui/button';
import { BookingStatusBadge } from './booking-status-badge';

interface CustomerHomeHeaderProps {
  name: string | null;
}

export function CustomerHomeHeader({ name }: CustomerHomeHeaderProps) {
  const t = useTranslations('customerShell');
  const displayName = name?.trim() || t('guest');
  const initials = getInitials(displayName);

  return (
    <header className="space-y-4 px-4 pt-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-[var(--brand-primary,#f97316)] text-sm font-semibold text-white">
            {initials}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('greeting')}</p>
            <p className="font-semibold">{displayName}</p>
          </div>
        </div>
      </div>

      <Button
        asChild
        className={cn('min-h-12 w-full rounded-2xl text-base font-semibold shadow-lg', brandPrimaryButtonClass)}
      >
        <Link href={ROUTES.BOOK}>
          <CalendarPlus className="mr-2 size-5" />
          {t('bookNew')}
        </Link>
      </Button>
    </header>
  );
}

interface CustomerBookingCardProps {
  id: number;
  serviceLabel: string;
  status: React.ReactNode;
  dateTime: string;
  price: string;
  href: string;
  action?: { label: string; href: string };
  footer?: React.ReactNode;
}

export function CustomerBookingCard({
  id,
  serviceLabel,
  status,
  dateTime,
  price,
  href,
  action,
  footer,
}: CustomerBookingCardProps) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <Link href={href} className="block transition-colors hover:opacity-90">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold">{serviceLabel || `#${id}`}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">#{id}</p>
            <p className="mt-1 text-sm text-muted-foreground">{dateTime}</p>
          </div>
          {status}
        </div>
      </Link>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{price}</span>
        {action ? (
          <Link
            href={action.href}
            className="flex items-center gap-1 text-sm text-[var(--brand-primary,#f97316)]"
          >
            {action.label}
            <ArrowRight className="size-4" />
          </Link>
        ) : null}
      </div>
      {footer}
    </div>
  );
}

interface UpcomingBookingCardProps {
  id: number;
  status: string;
  serviceLabel: string;
  dateTime: string;
  price: string;
  tenant: string;
}

export function UpcomingBookingCard({
  id,
  status,
  serviceLabel,
  dateTime,
  price,
  tenant,
}: UpcomingBookingCardProps) {
  const t = useTranslations('userPortal');
  const isConfirmed = status === 'confirmed';
  const { data: reschedulePreview } = useReschedulePreview(tenant, id, isConfirmed);
  const { data: cancelPreview } = useCancelPreview(tenant, id, isConfirmed);

  const footer =
    isConfirmed ? (
      <div className="mt-3 flex gap-2 border-t border-border/60 pt-3">
        <Button
          asChild
          size="sm"
          variant="outline"
          className="min-h-9 flex-1 rounded-xl"
          disabled={reschedulePreview?.allowed === false}
        >
          <Link href={ROUTES.userBookingReschedule(id)}>{t('reschedule')}</Link>
        </Button>
        <Button
          asChild
          size="sm"
          variant="outline"
          className="min-h-9 flex-1 rounded-xl text-destructive hover:text-destructive"
          disabled={cancelPreview?.allowed === false}
        >
          <Link href={ROUTES.userBookingCancel(id)}>{t('cancel')}</Link>
        </Button>
      </div>
    ) : null;

  return (
    <CustomerBookingCard
      id={id}
      serviceLabel={serviceLabel}
      status={<BookingStatusBadge status={status} />}
      dateTime={dateTime}
      price={price}
      href={ROUTES.userBooking(id)}
      footer={footer}
    />
  );
}
