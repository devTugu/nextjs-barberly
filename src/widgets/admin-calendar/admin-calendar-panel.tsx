'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useBookings, type BookingOutput } from '@/entities/booking';
import { useTenantDashboardStats } from '@/entities/dashboard';
import { useStaffList } from '@/entities/staff';
import { useMyTenant } from '@/entities/tenant';
import { useAuthPermissions } from '@/features/auth';
import { useMe } from '@/entities/user';
import { ROUTES } from '@/shared/config/routes';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { useOnlineStatus } from '@/shared/hooks/use-online-status';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { PageEmpty, PageLoading } from '@/shared/ui/page-states';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { AdminMobileDayCalendar } from './admin-mobile-day-calendar';
import { CalendarWorkingHoursOverlay } from './calendar-working-hours-overlay';
import {
  DAY_END_HOUR,
  DAY_END_MINUTES,
  DAY_START_HOUR,
  DAY_START_MINUTES,
  DAY_TIMELINE_HEIGHT_PX,
  GRID_HOURS,
  HOUR_HEIGHT_PX,
  MINUTE_HEIGHT_PX,
  staffLaneColor,
  type CalendarView,
  zonedTimeToUtc,
} from './calendar-layout';

function getDateKeyInTimezone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(date);
}

function addDaysToDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return next.toISOString().slice(0, 10);
}

function getZonedDayRange(
  dateKey: string,
  timeZone: string,
): { fromUtc: string; toUtc: string } {
  const fromUtc = zonedTimeToUtc(dateKey, 0, 0, timeZone).toISOString();
  const toUtc = zonedTimeToUtc(
    addDaysToDateKey(dateKey, 1),
    0,
    0,
    timeZone,
  ).toISOString();
  return { fromUtc, toUtc };
}

function getWeekDateKeys(dateKey: string, timeZone: string): string[] {
  const start = zonedTimeToUtc(dateKey, 12, 0, timeZone);
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
  }).format(start);
  const weekdayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(
    weekday,
  );
  const mondayOffset = weekdayIndex === 0 ? -6 : 1 - weekdayIndex;
  const mondayKey = addDaysToDateKey(dateKey, mondayOffset);
  return Array.from({ length: 7 }, (_, index) =>
    addDaysToDateKey(mondayKey, index),
  );
}

function getZonedWeekRange(
  dateKey: string,
  timeZone: string,
): { fromUtc: string; toUtc: string } {
  const weekKeys = getWeekDateKeys(dateKey, timeZone);
  const fromUtc = zonedTimeToUtc(weekKeys[0], 0, 0, timeZone).toISOString();
  const toUtc = zonedTimeToUtc(
    addDaysToDateKey(weekKeys[6], 1),
    0,
    0,
    timeZone,
  ).toISOString();
  return { fromUtc, toUtc };
}

function shiftDateKey(
  dateKey: string,
  view: CalendarView,
  direction: -1 | 1,
): string {
  const delta = view === 'day' ? direction : direction * 7;
  return addDaysToDateKey(dateKey, delta);
}

function getMinuteOfDayInTimezone(iso: string, timeZone: string): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(new Date(iso)).map((part) => [part.type, part.value]),
  );
  return Number(parts.hour) * 60 + Number(parts.minute);
}

function formatHourLabel(hour: number, timeZone: string): string {
  const date = zonedTimeToUtc('2000-01-01', hour, 0, timeZone);
  return new Intl.DateTimeFormat(undefined, {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function bookingStatusVariant(
  status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'confirmed') return 'default';
  if (status === 'completed') return 'secondary';
  if (status === 'pending_payment') return 'outline';
  return 'destructive';
}

function groupBookingsByDate(
  bookings: BookingOutput[],
  timeZone: string,
  weekKeys?: string[],
): Map<string, BookingOutput[]> {
  const grouped = new Map<string, BookingOutput[]>();
  bookings.forEach((booking) => {
    const dateKey = getDateKeyInTimezone(new Date(booking.startAtUtc), timeZone);
    if (weekKeys && !weekKeys.includes(dateKey)) return;
    const list = grouped.get(dateKey) ?? [];
    list.push(booking);
    grouped.set(dateKey, list);
  });
  return grouped;
}

type TimelinePlacement = {
  booking: BookingOutput;
  top: number;
  height: number;
  column: number;
  totalColumns: number;
};

function layoutOverlappingBookings(
  bookings: BookingOutput[],
  timeZone: string,
): TimelinePlacement[] {
  type TimedBooking = {
    booking: BookingOutput;
    top: number;
    height: number;
    start: number;
    end: number;
  };

  const timed = bookings
    .map((booking) => {
      const style = getDayTimelineStyle(booking, timeZone);
      if (!style) return null;
      return {
        booking,
        ...style,
        start: getMinuteOfDayInTimezone(booking.startAtUtc, timeZone),
        end: getMinuteOfDayInTimezone(booking.endAtUtc, timeZone),
      };
    })
    .filter((item): item is TimedBooking => item !== null)
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const placements: TimelinePlacement[] = [];
  let cluster: TimedBooking[] = [];
  let clusterEnd = -1;

  const flushCluster = () => {
    if (cluster.length === 0) return;

    const columnEnds: number[] = [];
    const clusterPlacements: Array<{ item: TimedBooking; column: number }> = [];

    cluster.forEach((item) => {
      let column = columnEnds.findIndex((end) => end <= item.start);
      if (column === -1) {
        column = columnEnds.length;
        columnEnds.push(item.end);
      } else {
        columnEnds[column] = item.end;
      }
      clusterPlacements.push({ item, column });
    });

    const totalColumns = columnEnds.length;
    clusterPlacements.forEach(({ item, column }) => {
      placements.push({
        booking: item.booking,
        top: item.top,
        height: item.height,
        column,
        totalColumns,
      });
    });

    cluster = [];
    clusterEnd = -1;
  };

  timed.forEach((item) => {
    if (cluster.length > 0 && item.start >= clusterEnd) {
      flushCluster();
    }
    cluster.push(item);
    clusterEnd = Math.max(clusterEnd, item.end);
  });
  flushCluster();

  return placements;
}

function getDayTimelineStyle(
  booking: BookingOutput,
  timeZone: string,
): { top: number; height: number } | null {
  const startMinutes = getMinuteOfDayInTimezone(booking.startAtUtc, timeZone);
  const endMinutes = getMinuteOfDayInTimezone(booking.endAtUtc, timeZone);
  const visibleStart = Math.max(startMinutes, DAY_START_MINUTES);
  const visibleEnd = Math.min(endMinutes, DAY_END_MINUTES);

  if (visibleEnd <= DAY_START_MINUTES || visibleStart >= DAY_END_MINUTES) {
    return null;
  }

  return {
    top: (visibleStart - DAY_START_MINUTES) * MINUTE_HEIGHT_PX,
    height: Math.max((visibleEnd - visibleStart) * MINUTE_HEIGHT_PX, 44),
  };
}

function BookingCell({
  booking,
  timeZone,
  tStatus,
  className,
}: {
  booking: BookingOutput;
  timeZone: string;
  tStatus: (key: string) => string;
  className?: string;
}) {
  return (
    <Button
      variant="outline"
      className={cn(
        'min-h-11 h-auto w-full justify-start border-l-4 px-2 py-2 text-left',
        className,
      )}
      style={{ borderLeftColor: staffLaneColor(booking.staffId) }}
      asChild
    >
      <Link href={ROUTES.adminBooking(booking.id)}>
        <div className="space-y-1">
          <p className="text-xs font-medium">
            {new Intl.DateTimeFormat(undefined, {
              timeZone,
              hour: '2-digit',
              minute: '2-digit',
            }).format(new Date(booking.startAtUtc))}
            {' · '}#{booking.id}
          </p>
          <Badge
            variant={bookingStatusVariant(booking.status)}
            className="text-xs"
          >
            {tStatus(booking.status)}
          </Badge>
        </div>
      </Link>
    </Button>
  );
}

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
  const [cursorDateKey, setCursorDateKey] = useState(() =>
    getDateKeyInTimezone(new Date(), 'UTC'),
  );

  useEffect(() => {
    if (tenantData?.timezone) {
      setCursorDateKey(getDateKeyInTimezone(new Date(), tenantData.timezone));
    }
  }, [tenantData?.timezone]);

  useEffect(() => {
    if (isStaff && scopedStaffId) {
      setStaffFilterId(String(scopedStaffId));
    }
  }, [isStaff, scopedStaffId]);

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

  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (data && isOnline) {
      setLastSyncedAt(new Date(dataUpdatedAt));
    }
  }, [data, dataUpdatedAt, isOnline]);

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
                  }).format(lastSyncedAt),
                })}
              </>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{t('calendarTitle')}</CardTitle>
          <Tabs
            value={view}
            onValueChange={(value) => setView(value as CalendarView)}
          >
            <TabsList className="min-h-11">
              <TabsTrigger value="day" className="min-h-11">
                {t('dayView')}
              </TabsTrigger>
              <TabsTrigger value="week" className="min-h-11">
                {t('weekView')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!isStaff ? (
            <Select value={staffFilterId} onValueChange={setStaffFilterId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All staff</SelectItem>
                {(staffList ?? []).map((member) => (
                  <SelectItem key={member.id} value={String(member.id)}>
                    {member.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="icon"
            className="min-h-11 min-w-11"
            onClick={() =>
              setCursorDateKey((key) => shiftDateKey(key, view, -1))
            }
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div className="text-center">
            <p className="font-medium">{heading}</p>
            <Button
              variant="link"
              size="sm"
              className="text-muted-foreground h-auto min-h-11 p-0"
              onClick={() =>
                setCursorDateKey(getDateKeyInTimezone(new Date(), timeZone))
              }
            >
              {t('today')}
            </Button>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="min-h-11 min-w-11"
            onClick={() =>
              setCursorDateKey((key) => shiftDateKey(key, view, 1))
            }
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? <PageLoading rows={6} /> : null}
        {!isLoading && items.length === 0 ? (
          <PageEmpty title={t('noBookingsInRange')} />
        ) : null}
        {!isLoading && items.length > 0 ? (
          <div className="overflow-x-auto">
            {view === 'day' ? (
              <div className="min-w-[280px] rounded-md border">
                <div
                  className="relative grid grid-cols-[4rem_1fr]"
                  style={{ height: DAY_TIMELINE_HEIGHT_PX }}
                >
                  <div className="relative">
                    {GRID_HOURS.map((hour, index) => (
                      <span
                        key={hour}
                        className="text-muted-foreground absolute right-2 -translate-y-1/2 text-xs font-medium"
                        style={{
                          top: Math.min(
                            index * HOUR_HEIGHT_PX,
                            DAY_TIMELINE_HEIGHT_PX,
                          ),
                        }}
                      >
                        {formatHourLabel(hour, timeZone)}
                      </span>
                    ))}
                  </div>
                  <div className="relative border-l">
                    {GRID_HOURS.map((hour, index) => (
                      <div
                        key={hour}
                        className="absolute inset-x-0 border-t"
                        style={{
                          top: Math.min(
                            index * HOUR_HEIGHT_PX,
                            DAY_TIMELINE_HEIGHT_PX,
                          ),
                        }}
                      />
                    ))}
                    {effectiveStaffFilter !== 'all' ? (
                      <CalendarWorkingHoursOverlay
                        staffId={Number(effectiveStaffFilter)}
                        localDate={cursorDateKey}
                        timeZone={timeZone}
                        heightPx={DAY_TIMELINE_HEIGHT_PX}
                      />
                    ) : null}
                    {items.map((booking) => {
                      const style = getDayTimelineStyle(booking, timeZone);
                      if (!style) return null;
                      return (
                        <div
                          key={booking.id}
                          className="absolute left-2 right-2"
                          style={style}
                        >
                          <BookingCell
                            booking={booking}
                            timeZone={timeZone}
                            tStatus={tStatus}
                            className="h-full overflow-hidden"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="min-w-[640px]">
                <div className="grid grid-cols-[4rem_repeat(7,minmax(0,1fr))] gap-1 border-b pb-2">
                  <div />
                  {weekKeys!.map((dateKey) => (
                    <div
                      key={dateKey}
                      className={cn(
                        'text-center text-xs font-medium',
                        dateKey === cursorDateKey && 'text-primary',
                      )}
                    >
                      {new Intl.DateTimeFormat(undefined, {
                        timeZone,
                        weekday: 'short',
                        day: 'numeric',
                      }).format(zonedTimeToUtc(dateKey, 12, 0, timeZone))}
                    </div>
                  ))}
                </div>
                <div
                  className="grid grid-cols-[4rem_repeat(7,minmax(0,1fr))]"
                  style={{ height: DAY_TIMELINE_HEIGHT_PX }}
                >
                  <div className="relative">
                    {GRID_HOURS.map((hour, index) => (
                      <span
                        key={hour}
                        className="text-muted-foreground absolute right-2 -translate-y-1/2 text-xs font-medium"
                        style={{
                          top: Math.min(
                            index * HOUR_HEIGHT_PX,
                            DAY_TIMELINE_HEIGHT_PX,
                          ),
                        }}
                      >
                        {formatHourLabel(hour, timeZone)}
                      </span>
                    ))}
                  </div>
                  {weekKeys!.map((dateKey) => {
                    const dayBookings = grouped.get(dateKey) ?? [];
                    const placements = layoutOverlappingBookings(
                      dayBookings,
                      timeZone,
                    );
                    return (
                      <div
                        key={dateKey}
                        className={cn(
                          'relative border-l',
                          dateKey === cursorDateKey && 'bg-primary/5',
                        )}
                      >
                        {GRID_HOURS.map((hour, index) => (
                          <div
                            key={hour}
                            className="absolute inset-x-0 border-t"
                            style={{
                              top: Math.min(
                                index * HOUR_HEIGHT_PX,
                                DAY_TIMELINE_HEIGHT_PX,
                              ),
                            }}
                          />
                        ))}
                        {effectiveStaffFilter !== 'all' ? (
                          <CalendarWorkingHoursOverlay
                            staffId={Number(effectiveStaffFilter)}
                            localDate={dateKey}
                            timeZone={timeZone}
                            heightPx={DAY_TIMELINE_HEIGHT_PX}
                          />
                        ) : null}
                        {placements.map((placement) => (
                          <div
                            key={placement.booking.id}
                            className="absolute px-0.5"
                            style={{
                              top: placement.top,
                              height: placement.height,
                              left: `${(placement.column / placement.totalColumns) * 100}%`,
                              width: `${100 / placement.totalColumns}%`,
                            }}
                          >
                            <BookingCell
                              booking={placement.booking}
                              timeZone={timeZone}
                              tStatus={tStatus}
                              className="h-full overflow-hidden"
                            />
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
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
