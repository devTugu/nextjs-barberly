export interface StaffShift {
  id: number;
  staffId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  sourceTemplateId: number | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
}

export interface TimeBlock {
  startTime: string;
  endTime: string;
}

export interface StaffDayException {
  id: number;
  staffId: number;
  localDate: string;
  kind: 'closed' | 'custom_hours';
  reason: string | null;
  blocks: TimeBlock[];
}

export interface StaffTimeBlock {
  id: number;
  staffId: number;
  startAtUtc: string;
  endAtUtc: string;
  reason: string | null;
}

export interface TenantHoliday {
  id: number;
  localDate: string;
  name: string;
}

export interface ScheduleTemplateShift {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface ScheduleTemplate {
  id: number;
  tenantId: number;
  name: string;
  description: string | null;
  isSystemPreset: boolean;
  shifts: ScheduleTemplateShift[];
}

export interface CreateStaffShiftInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface UpdateStaffShiftInput {
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
}

export interface CreateStaffDayExceptionInput {
  localDate: string;
  kind: 'closed' | 'custom_hours';
  reason?: string;
  blocks?: TimeBlock[];
}

export interface UpdateStaffDayExceptionInput {
  kind?: 'closed' | 'custom_hours';
  reason?: string;
  blocks?: TimeBlock[];
}

export interface CreateStaffTimeBlockInput {
  startAtUtc: string;
  endAtUtc: string;
  reason?: string;
}

export interface CreateTenantHolidayInput {
  localDate: string;
  name: string;
}

export interface CreateScheduleTemplateInput {
  name: string;
  description?: string;
  shifts: Array<{ dayOfWeek: number; startTime: string; endTime: string }>;
}

export interface UpdateScheduleTemplateInput {
  name?: string;
  description?: string;
  shifts?: Array<{ dayOfWeek: number; startTime: string; endTime: string }>;
}

export interface ApplyScheduleTemplateInput {
  staffId: number;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface PublicScheduleDayBlock {
  startTime: string;
  endTime: string;
}

export interface PublicScheduleDay {
  dayOfWeek: number;
  label: string;
  closed: boolean;
  blocks: PublicScheduleDayBlock[];
}

export interface PublicScheduleSummary {
  timezone: string;
  referenceDate: string;
  openingHoursSummary: string | null;
  days: PublicScheduleDay[];
  upcomingHolidays: Array<{ localDate: string; name: string }>;
}
