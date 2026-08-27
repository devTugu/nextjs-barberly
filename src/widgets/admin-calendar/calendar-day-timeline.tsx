'use client';

import type { BookingOutput } from '@/entities/booking';
import {
  DAY_TIMELINE_HEIGHT_PX,
  GRID_HOURS,
  HOUR_HEIGHT_PX,
} from './calendar-layout';
import { BookingCell } from './calendar-booking-cell';
import { CalendarWorkingHoursOverlay } from './calendar-working-hours-overlay';
import { formatHourLabel, getDayTimelineStyle } from './calendar-time';

interface CalendarDayTimelineProps {
  bookings: BookingOutput[];
  timeZone: string;
  dateKey: string;
  staffFilterId: string;
  tStatus: (status: string) => string;
}

export function CalendarDayTimeline({
  bookings,
  timeZone,
  dateKey,
  staffFilterId,
  tStatus,
}: CalendarDayTimelineProps) {
  return (
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
                top: Math.min(index * HOUR_HEIGHT_PX, DAY_TIMELINE_HEIGHT_PX),
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
                top: Math.min(index * HOUR_HEIGHT_PX, DAY_TIMELINE_HEIGHT_PX),
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
          {bookings.map((booking) => {
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
  );
}
