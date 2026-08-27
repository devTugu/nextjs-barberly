import type { BookingOutput } from '@/entities/booking';
import {
  DAY_END_MINUTES,
  DAY_START_MINUTES,
  MINUTE_HEIGHT_PX,
  type CalendarView,
  zonedTimeToUtc,
} from './calendar-layout';

export function getDateKeyInTimezone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(date);
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return next.toISOString().slice(0, 10);
}

export function getZonedDayRange(
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

export function getWeekDateKeys(dateKey: string, timeZone: string): string[] {
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

export function getZonedWeekRange(
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

export function shiftDateKey(
  dateKey: string,
  view: CalendarView,
  direction: -1 | 1,
): string {
  const delta = view === 'day' ? direction : direction * 7;
  return addDaysToDateKey(dateKey, delta);
}

export function getMinuteOfDayInTimezone(iso: string, timeZone: string): number {
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

export function formatHourLabel(hour: number, timeZone: string): string {
  const date = zonedTimeToUtc('2000-01-01', hour, 0, timeZone);
  return new Intl.DateTimeFormat(undefined, {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function bookingStatusVariant(
  status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'confirmed') return 'default';
  if (status === 'completed') return 'secondary';
  if (status === 'pending_payment') return 'outline';
  return 'destructive';
}

export function groupBookingsByDate(
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

export function layoutOverlappingBookings(
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

export function getDayTimelineStyle(
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
