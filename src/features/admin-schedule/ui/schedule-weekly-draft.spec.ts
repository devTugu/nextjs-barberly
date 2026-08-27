import { describe, expect, it } from 'vitest';
import { buildDayDrafts, toApiTime, toInputTime } from './schedule-weekly-draft';
import type { StaffShift } from '@/entities/schedule';

describe('schedule-weekly-draft', () => {
  it('normalizes API times to HH:mm inputs', () => {
    expect(toInputTime('09:00:00')).toBe('09:00');
    expect(toApiTime('09:00')).toBe('09:00:00');
    expect(toApiTime('09:00:00')).toBe('09:00:00');
  });

  it('builds empty weekday drafts with a default block', () => {
    const drafts = buildDayDrafts([]);
    expect(Object.keys(drafts)).toHaveLength(7);
    expect(drafts[1]?.enabled).toBe(false);
    expect(drafts[1]?.blocks).toEqual([{ startTime: '09:00', endTime: '18:00' }]);
  });

  it('maps existing shifts onto the matching weekday', () => {
    const shifts: StaffShift[] = [
      {
        id: 4,
        staffId: 1,
        dayOfWeek: 2,
        startTime: '10:00:00',
        endTime: '14:00:00',
        sourceTemplateId: null,
        effectiveFrom: null,
        effectiveTo: null,
      },
    ];
    const drafts = buildDayDrafts(shifts);
    expect(drafts[2]).toEqual({
      enabled: true,
      blocks: [{ id: 4, startTime: '10:00', endTime: '14:00' }],
    });
  });
});
