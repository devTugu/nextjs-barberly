'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { BookingOutput } from '@/entities/booking';
import type { StaffOutput } from '@/entities/staff';
import type { TenantDashboardStats } from '@/entities/dashboard';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { PageEmpty, PageLoading } from '@/shared/ui/page-states';
import { Skeleton } from '@/shared/ui/skeleton';

function staffLaneColor(staffId: number): string {
  const hue = (staffId * 47) % 360;
  return `hsl(${hue} 65% 50%)`;
}

function formatTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat(undefined, {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function formatDayHeading(
  dateKey: string,
  timeZone: string,
  todayLabel: string,
): string {
  const date = new Date(`${dateKey}T12:00:00`);
  const todayKey = new Intl.DateTimeFormat('en-CA', { timeZone }).format(
    new Date(),
  );
  const isToday = dateKey === todayKey;
  const formatted = new Intl.DateTimeFormat(undefined, {
    timeZone,
    month: 'long',
    day: 'numeric',
  }).format(date);
  return isToday ? `${todayLabel}, ${formatted}` : formatted;
}

function serviceSummary(booking: BookingOutput): string {
  return booking.services.map((s) => s.serviceName).join(' + ') || '—';
}

function bookingStatusVariant(
  status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'confirmed') return 'default';
  if (status === 'completed') return 'secondary';
  if (status === 'pending_payment') return 'outline';
  return 'destructive';
}

interface AdminMobileDayCalendarProps {
  tenantSubdomain: string | null;
  dateKey: string;
  timeZone: string;
  bookings: BookingOutput[];
  staffList: StaffOutput[];
  staffFilterId: string;
  onStaffFilterChange: (id: string) => void;
  isStaffScoped: boolean;
  stats?: TenantDashboardStats;
  statsLoading: boolean;
  isLoading: boolean;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
}

export function AdminMobileDayCalendar({
  tenantSubdomain,
  dateKey,
  timeZone,
  bookings,
  staffList,
  staffFilterId,
  onStaffFilterChange,
  isStaffScoped,
  stats,
  statsLoading,
  isLoading,
  onPrevDay,
  onNextDay,
  onToday,
}: AdminMobileDayCalendarProps) {
  const t = useTranslations('entities.bookings');
  const tShell = useTranslations('adminShell');

  const confirmedCount = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'completed',
  ).length;
  const totalCount = bookings.length;

  const visibleStaff = staffList.slice(0, 2);
  const extraStaff = Math.max(0, staffList.length - 2);

  return (
    <div className="space-y-4 px-4 pt-4 md:hidden">
      {tenantSubdomain ? (
        <p className="text-xs text-muted-foreground">
          {tenantSubdomain}.barberly.mn
        </p>
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={onToday}
            className="text-left text-2xl font-bold leading-tight"
          >
            {formatDayHeading(dateKey, timeZone, t('today'))}
          </button>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <button type="button" onClick={onPrevDay} aria-label={t('prevDay')}>
              ‹
            </button>
            <button type="button" onClick={onToday} className="underline-offset-2 hover:underline">
              {t('today')}
            </button>
            <button type="button" onClick={onNextDay} aria-label={t('nextDay')}>
              ›
            </button>
          </div>
        </div>
        <Button
          size="icon"
          className="size-11 shrink-0 rounded-full"
          asChild
        >
          <Link href={ROUTES.ADMIN_BOOKINGS_NEW} aria-label={t('manualBooking')}>
            <Plus className="size-5" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border/60 bg-card/80 p-4">
          <p className="text-xs text-muted-foreground">{t('todayRevenue')}</p>
          {statsLoading ? (
            <Skeleton className="mt-2 h-8 w-24" />
          ) : (
            <p className="mt-1 text-xl font-bold">
              {(stats?.todayRevenue ?? 0).toLocaleString()}₮
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/80 p-4">
          <p className="text-xs text-muted-foreground">{tShell('bookingsRatio')}</p>
          {isLoading ? (
            <Skeleton className="mt-2 h-8 w-16" />
          ) : (
            <p className="mt-1 text-xl font-bold">
              {confirmedCount} / {totalCount || stats?.todayBookings || 0}
            </p>
          )}
        </div>
      </div>

      {!isStaffScoped && staffList.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => onStaffFilterChange('all')}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors',
              staffFilterId === 'all'
                ? 'border-[var(--brand-primary,#f97316)] bg-[var(--brand-primary,#f97316)]/10'
                : 'border-border bg-card/60',
            )}
          >
            {tShell('allStaff')}
          </button>
          {visibleStaff.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => onStaffFilterChange(String(member.id))}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors',
                staffFilterId === String(member.id)
                  ? 'border-[var(--brand-primary,#f97316)] bg-[var(--brand-primary,#f97316)]/10'
                  : 'border-border bg-card/60',
              )}
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: staffLaneColor(member.id) }}
              />
              {member.displayName}
            </button>
          ))}
          {extraStaff > 0 ? (
            <span className="inline-flex shrink-0 items-center rounded-full border border-border bg-card/60 px-3 py-1.5 text-sm text-muted-foreground">
              +{extraStaff}
            </span>
          ) : null}
        </div>
      ) : null}

      {isLoading ? <PageLoading rows={4} /> : null}
      {!isLoading && bookings.length === 0 ? (
        <PageEmpty title={t('noBookingsInRange')} />
      ) : null}

      {!isLoading && bookings.length > 0 ? (
        <ul className="space-y-3 pb-2">
          {bookings.map((booking) => {
            const start = formatTime(booking.startAtUtc, timeZone);
            const end = formatTime(booking.endAtUtc, timeZone);
            const customer =
              booking.customerName?.trim() || t('unknownCustomer');
            const isPaid =
              booking.status === 'confirmed' || booking.status === 'completed';

            return (
              <li key={booking.id} className="flex gap-3">
                <span className="w-12 shrink-0 pt-3 text-sm font-medium text-muted-foreground">
                  {start}
                </span>
                <Link
                  href={ROUTES.adminBooking(booking.id)}
                  className="min-h-11 flex-1 rounded-2xl border border-border/60 bg-card/80 p-3 transition-colors hover:bg-card"
                  style={{
                    borderLeftWidth: 4,
                    borderLeftColor: staffLaneColor(booking.staffId),
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium leading-snug">
                      {customer} · {serviceSummary(booking)}
                    </p>
                    {isPaid ? (
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {t('status.confirmed')}
                      </Badge>
                    ) : (
                      <Badge
                        variant={bookingStatusVariant(booking.status)}
                        className="shrink-0 text-xs"
                      >
                        {t(`status.${booking.status}`)}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {start} – {end}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
