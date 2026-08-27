import type { StaffShift } from '@/entities/schedule';

export const WEEKLY_DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

export type ScheduleBlockDraft = {
  id?: number;
  startTime: string;
  endTime: string;
};

export type ScheduleDayDraft = {
  enabled: boolean;
  blocks: ScheduleBlockDraft[];
};

export function toInputTime(value: string): string {
  return value.slice(0, 5);
}

export function toApiTime(value: string): string {
  return value.length === 5 ? `${value}:00` : value;
}

export function buildDayDrafts(shifts: StaffShift[]): Record<number, ScheduleDayDraft> {
  const drafts: Record<number, ScheduleDayDraft> = {};
  for (let day = 1; day <= 7; day += 1) {
    const dayShifts = shifts.filter((shift) => shift.dayOfWeek === day);
    drafts[day] = {
      enabled: dayShifts.length > 0,
      blocks:
        dayShifts.length > 0
          ? dayShifts.map((shift) => ({
              id: shift.id,
              startTime: toInputTime(shift.startTime),
              endTime: toInputTime(shift.endTime),
            }))
          : [{ startTime: '09:00', endTime: '18:00' }],
    };
  }
  return drafts;
}
