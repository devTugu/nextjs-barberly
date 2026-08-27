'use client';

import type { BookingOutput } from '@/entities/booking';
import { cn } from '@/shared/lib/utils';
import {
  DAY_TIMELINE_HEIGHT_PX,
  GRID_HOURS,
  HOUR_HEIGHT_PX,
  zonedTimeToUtc,
} from './calendar-layout';
import { BookingCell } from './calendar-booking-cell';
import { CalendarWorkingHoursOverlay } from './calendar-working-hours-overlay';
import {
  formatHourLabel,
  layoutOverlappingBookings,
} from './calendar-time';

interface CalendarWeekGridProps {
  weekKeys: string[];
  grouped: Map<string, BookingOutput[]>;
  cursorDateKey: string;
  timeZone: string;
  staffFilterId: string;
  tStatus: (status: string) => string;
}

export function CalendarWeekGrid({
  weekKeys,
  grouped,
  cursorDateKey,
  timeZone,
  staffFilterId,
  tStatus,
}: CalendarWeekGridProps) {
  return (
    <div className="min-w-[640px]">
      <div className="grid grid-cols-[4rem_repeat(7,minmax(0,1fr))] gap-1 border-b pb-2">
        <div />
        {weekKeys.map((dateKey) => (
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
                top: Math.min(index * HOUR_HEIGHT_PX, DAY_TIMELINE_HEIGHT_PX),
              }}
            >
              {formatHourLabel(hour, timeZone)}
            </span>
          ))}
        </div>
        {weekKeys.map((dateKey) => {
          const dayBookings = grouped.get(dateKey) ?? [];
          const placements = layoutOverlappingBookings(dayBookings, timeZone);
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
              {staffFilterId !== 'all' ? (
                <CalendarWorkingHoursOverlay
                  staffId={Number(staffFilterId)}
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
  );
}
