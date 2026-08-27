'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useBookings } from '@/entities/booking';
import { useTenantDashboardStats } from '@/entities/dashboard';
import { useStaffList } from '@/entities/staff';
import { useMyTenant } from '@/entities/tenant';
import { useAuthPermissions } from '@/entities/session';
import { useMe } from '@/entities/user';
import { ROUTES } from '@/shared/config/routes';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { useOnlineStatus } from '@/shared/hooks/use-online-status';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { PageEmpty, PageLoading } from '@/shared/ui/page-states';
import { AdminMobileDayCalendar } from './admin-mobile-day-calendar';
import { CalendarDayTimeline } from './calendar-day-timeline';
import { CalendarWeekGrid } from './calendar-week-grid';
import { CalendarPanelToolbar } from './calendar-panel-toolbar';
import { type CalendarView, zonedTimeToUtc } from './calendar-layout';
import {
  getDateKeyInTimezone,
  getWeekDateKeys,
  getZonedDayRange,
  getZonedWeekRange,
  groupBookingsByDate,
  shiftDateKey,
} from './calendar-time';

export function AdminCalendarPanel() {
  const t = useTranslations('entities.bookings');
  const isOnline = useOnlineStatus();
  const tenantSubdomain = useTenantSubdomain();
  const { isStaff } = useAuthPermissions();
  const { data: me } = useMe();
  const { data: tenantData } = useMyTenant(tenantSubdomain);
  const { data: staffList } = useStaffList(tenantSubdomain);
  const scopedStaffId = me?.staffMemberId ?? null;
  const [staffFilterId, setStaffFilterId] = useState<string>('all');
  const timeZone = tenantData?.timezone ?? 'UTC';
  const [view, setView] = useState<CalendarView>('day');
  const [nowMs] = useState(() => Date.now());
  const defaultCursorKey = getDateKeyInTimezone(new Date(nowMs), timeZone);
  const [cursorOverride, setCursorOverride] = useState<string | null>(null);
  const cursorDateKey = cursorOverride ?? defaultCursorKey;
  const setCursorDateKey = (next: string | ((key: string) => string)) => {
    setCursorOverride((prev) => {
      const current = prev ?? defaultCursorKey;
      return typeof next === 'function' ? next(current) : next;
    });
  };

  const effectiveStaffFilter =
    isStaff && scopedStaffId ? String(scopedStaffId) : staffFilterId;

  const weekKeys = useMemo(
    () => (view === 'week' ? getWeekDateKeys(cursorDateKey, timeZone) : undefined),
    [view, cursorDateKey, timeZone],
  );

  const range = useMemo(
    () =>
      view === 'day'
        ? getZonedDayRange(cursorDateKey, timeZone)
        : getZonedWeekRange(cursorDateKey, timeZone),
    [view, cursorDateKey, timeZone],
  );

  const todayRange = useMemo(
    () => getZonedDayRange(cursorDateKey, timeZone),
    [cursorDateKey, timeZone],
  );

  const { data: dayStats, isLoading: statsLoading } = useTenantDashboardStats(
    tenantSubdomain,
    todayRange,
  );

  const { data, isLoading, dataUpdatedAt } = useBookings(tenantSubdomain, {
    page: 1,
    limit: 200,
    fromUtc: range.fromUtc,
    toUtc: range.toUtc,
    staffId:
      effectiveStaffFilter === 'all'
        ? undefined
        : Number(effectiveStaffFilter),
  });

  const lastSyncedAt = data ? dataUpdatedAt : null;

  const items = useMemo(
    () =>
      (data?.items ?? []).sort(
        (a, b) =>
          new Date(a.startAtUtc).getTime() - new Date(b.startAtUtc).getTime(),
      ),
    [data?.items],
  );

  const grouped = useMemo(
    () => groupBookingsByDate(items, timeZone, weekKeys),
    [items, timeZone, weekKeys],
  );

  const heading = useMemo(() => {
    if (view === 'day') {
      return new Intl.DateTimeFormat(undefined, {
        timeZone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(zonedTimeToUtc(cursorDateKey, 12, 0, timeZone));
    }
    const start = zonedTimeToUtc(weekKeys![0], 12, 0, timeZone);
    const end = zonedTimeToUtc(weekKeys![6], 12, 0, timeZone);
    const fmt = new Intl.DateTimeFormat(undefined, {
      timeZone,
      month: 'short',
      day: 'numeric',
    });
    return `${fmt.format(start)} – ${fmt.format(end)}`;
  }, [view, cursorDateKey, timeZone, weekKeys]);

  const tStatus = (status: string) => t(`status.${status}`);

  const dayBookings = useMemo(() => {
    if (view !== 'day') return items;
    return items.filter(
      (booking) =>
        getDateKeyInTimezone(new Date(booking.startAtUtc), timeZone) ===
        cursorDateKey,
    );
  }, [items, view, cursorDateKey, timeZone]);

  return (
    <>
    <AdminMobileDayCalendar
      tenantSubdomain={tenantSubdomain}
      dateKey={cursorDateKey}
      timeZone={timeZone}
      bookings={dayBookings}
      staffList={staffList ?? []}
      staffFilterId={effectiveStaffFilter}
      onStaffFilterChange={setStaffFilterId}
      isStaffScoped={isStaff}
      stats={dayStats}
      statsLoading={statsLoading}
      isLoading={isLoading}
      onPrevDay={() => setCursorDateKey((key) => shiftDateKey(key, 'day', -1))}
      onNextDay={() => setCursorDateKey((key) => shiftDateKey(key, 'day', 1))}
      onToday={() =>
        setCursorDateKey(getDateKeyInTimezone(new Date(), timeZone))
      }
    />
    <Card className="hidden md:block">
      {!isOnline ? (
        <Alert className="rounded-none border-x-0 border-t-0">
          <AlertDescription>
            {t('offlineCachedData')}
            {lastSyncedAt ? (
              <>
                {' '}
                {t('lastSyncedAt', {
                  time: new Intl.DateTimeFormat(undefined, {
                    timeZone,
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(lastSyncedAt)),
                })}
              </>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}
      <CalendarPanelToolbar
        view={view}
        heading={heading}
        isStaff={isStaff}
        staffFilterId={staffFilterId}
        staffList={staffList ?? []}
        onViewChange={setView}
        onStaffFilterChange={setStaffFilterId}
        onPrev={() => setCursorDateKey((key) => shiftDateKey(key, view, -1))}
        onNext={() => setCursorDateKey((key) => shiftDateKey(key, view, 1))}
        onToday={() =>
          setCursorDateKey(getDateKeyInTimezone(new Date(), timeZone))
        }
      />
      <CardContent>
        {isLoading ? <PageLoading rows={6} /> : null}
        {!isLoading && items.length === 0 ? (
          <PageEmpty title={t('noBookingsInRange')} />
        ) : null}
        {!isLoading && items.length > 0 ? (
          <div className="overflow-x-auto">
            {view === 'day' ? (
              <CalendarDayTimeline
                bookings={items}
                timeZone={timeZone}
                dateKey={cursorDateKey}
                staffFilterId={effectiveStaffFilter}
                tStatus={tStatus}
              />
            ) : (
              <CalendarWeekGrid
                weekKeys={weekKeys ?? []}
                grouped={grouped}
                cursorDateKey={cursorDateKey}
                timeZone={timeZone}
                staffFilterId={effectiveStaffFilter}
                tStatus={tStatus}
              />
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
    <Button
      asChild
      size="lg"
      className="fixed bottom-6 right-6 z-50 min-h-11 rounded-full px-5 shadow-lg"
    >
      <Link href={ROUTES.ADMIN_BOOKINGS_NEW} aria-label={t('addManual')}>
        <Plus className="size-5" />
        {t('addManual')}
      </Link>
    </Button>
    </>
  );
}
