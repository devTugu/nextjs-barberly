import type {
  StaffDayException,
  StaffShift,
  TenantHoliday,
} from '../types/schedule';

export interface EffectiveHoursWindow {
  startTime: string;
  endTime: string;
}

export interface EffectiveHoursInput {
  localDate: string;
  timezone: string;
  weeklyShifts: StaffShift[];
  tenantHoliday?: TenantHoliday | null;
  dayException?: StaffDayException | null;
}

export function resolveEffectiveHours(
  input: EffectiveHoursInput,
): EffectiveHoursWindow[] {
  if (input.tenantHoliday) return [];
  if (input.dayException?.kind === 'closed') return [];
  if (input.dayException?.kind === 'custom_hours') {
    return input.dayException.blocks.map((block) => ({
      startTime: block.startTime,
      endTime: block.endTime,
    }));
  }

  const dow = getWeekday(input.localDate, input.timezone);
  return input.weeklyShifts
    .filter(
      (shift) =>
        shift.dayOfWeek === dow && isShiftActiveOnDate(shift, input.localDate),
    )
    .map((shift) => ({
      startTime: shift.startTime,
      endTime: shift.endTime,
    }));
}

function isShiftActiveOnDate(shift: StaffShift, localDate: string): boolean {
  if (shift.effectiveFrom && localDate < shift.effectiveFrom) return false;
  if (shift.effectiveTo && localDate > shift.effectiveTo) return false;
  return true;
}

function getWeekday(localDate: string, timezone: string): number {
  const date = new Date(`${localDate}T12:00:00`);
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
  }).format(date);
  const map: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };
  return map[weekday] ?? 1;
}

export function splitShiftWithBreak(
  startTime: string,
  endTime: string,
  breakStart: string,
  breakEnd: string,
): EffectiveHoursWindow[] {
  if (breakStart <= startTime || breakEnd >= endTime || breakStart >= breakEnd) {
    return [{ startTime, endTime }];
  }
  const blocks: EffectiveHoursWindow[] = [];
  if (breakStart > startTime) {
    blocks.push({ startTime, endTime: breakStart });
  }
  if (breakEnd < endTime) {
    blocks.push({ startTime: breakEnd, endTime });
  }
  return blocks;
}
