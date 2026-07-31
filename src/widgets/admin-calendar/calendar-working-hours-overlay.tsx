'use client';

import { useMemo } from 'react';
import { resolveEffectiveHours } from '@/entities/schedule/lib/effective-hours';
import {
  useStaffDayExceptions,
  useStaffShifts,
  useTenantHolidays,
} from '@/entities/schedule';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';

const DAY_START_MINUTES = 8 * 60;
const MINUTE_HEIGHT_PX = 72 / 60;

type Props = {
  staffId: number;
  localDate: string;
  timeZone: string;
  heightPx: number;
};

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m ?? 0);
}

export function CalendarWorkingHoursOverlay({
  staffId,
  localDate,
  timeZone,
  heightPx,
}: Props) {
  const tenant = useTenantSubdomain();
  const year = localDate.slice(0, 4);
  const holidaysQuery = useTenantHolidays(tenant, {
    from: `${year}-01-01`,
    to: `${year}-12-31`,
  });
  const exceptionsQuery = useStaffDayExceptions(
    tenant,
    staffId,
    { from: localDate, to: localDate },
    staffId > 0,
  );
  const shiftsQuery = useStaffShifts(tenant, staffId, staffId > 0, {
    includeAll: true,
  });

  const windows = useMemo(() => {
    const holiday = holidaysQuery.data?.find((h) => h.localDate === localDate);
    const dayException = exceptionsQuery.data?.[0] ?? null;
    return resolveEffectiveHours({
      localDate,
      timezone: timeZone,
      weeklyShifts: shiftsQuery.data ?? [],
      tenantHoliday: holiday ?? null,
      dayException,
    });
  }, [
    holidaysQuery.data,
    exceptionsQuery.data,
    shiftsQuery.data,
    localDate,
    timeZone,
  ]);

  if (staffId <= 0) return null;

  if (windows.length === 0) {
    return (
      <div
        className="pointer-events-none absolute inset-0 bg-muted/30"
        style={{ height: heightPx }}
        aria-hidden
      />
    );
  }

  return (
    <>
      {windows.map((window, index) => {
        const start = toMinutes(window.startTime.slice(0, 5));
        const end = toMinutes(window.endTime.slice(0, 5));
        const top = Math.max(0, (start - DAY_START_MINUTES) * MINUTE_HEIGHT_PX);
        const height = Math.max(0, (end - start) * MINUTE_HEIGHT_PX);
        return (
          <div
            key={`${window.startTime}-${index}`}
            className="pointer-events-none absolute inset-x-0 bg-primary/5"
            style={{ top, height }}
            aria-hidden
          />
        );
      })}
    </>
  );
}
