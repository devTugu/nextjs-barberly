'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { listQueryOptions } from '@/shared/api/list-query-options';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import { tenantQueryParams } from '@/shared/hooks/use-tenant-subdomain';
import type {
  ScheduleTemplate,
  StaffDayException,
  StaffShift,
  StaffTimeBlock,
  TenantHoliday,
} from '../types/schedule';

export const scheduleKeys = {
  all: ['schedules'] as const,
  shifts: (tenant: string, staffId: number, options?: { includeAll?: boolean }) =>
    [...scheduleKeys.all, 'shifts', tenant, staffId, options?.includeAll] as const,
  dayExceptions: (
    tenant: string,
    staffId: number,
    range?: { from: string; to: string },
  ) => [...scheduleKeys.all, 'day-exceptions', tenant, staffId, range] as const,
  timeBlocks: (
    tenant: string,
    staffId: number,
    range: { from: string; to: string },
  ) => [...scheduleKeys.all, 'time-blocks', tenant, staffId, range] as const,
  holidays: (
    tenant: string,
    range?: { from: string; to: string },
  ) => [...scheduleKeys.all, 'holidays', tenant, range] as const,
  templates: (tenant: string) =>
    [...scheduleKeys.all, 'templates', tenant] as const,
};

export const useStaffShifts = (
  tenant: string,
  staffId: number,
  enabled = true,
  options?: { includeAll?: boolean },
) =>
  useQuery({
    queryKey: scheduleKeys.shifts(tenant, staffId, options),
    queryFn: () =>
      api.get<StaffShift[]>(API_ENDPOINTS.SCHEDULES.SHIFTS(staffId), {
        params: {
          ...tenantQueryParams(tenant),
          ...(options?.includeAll ? { all: 'true' } : {}),
        },
      }),
    enabled: enabled && Boolean(tenant) && staffId > 0,
    ...listQueryOptions,
  });

export const useStaffDayExceptions = (
  tenant: string,
  staffId: number,
  range: { from: string; to: string },
  enabled = true,
) =>
  useQuery({
    queryKey: scheduleKeys.dayExceptions(tenant, staffId, range),
    queryFn: () =>
      api.get<StaffDayException[]>(
        API_ENDPOINTS.SCHEDULES.DAY_EXCEPTIONS(staffId),
        {
          params: {
            ...tenantQueryParams(tenant),
            from: range.from,
            to: range.to,
          },
        },
      ),
    enabled:
      enabled && Boolean(tenant) && staffId > 0 && Boolean(range.from && range.to),
    ...listQueryOptions,
  });

export const useStaffTimeBlocks = (
  tenant: string,
  staffId: number,
  range: { from: string; to: string },
  enabled = true,
) =>
  useQuery({
    queryKey: scheduleKeys.timeBlocks(tenant, staffId, range),
    queryFn: () =>
      api.get<StaffTimeBlock[]>(API_ENDPOINTS.SCHEDULES.TIME_BLOCKS(staffId), {
        params: {
          ...tenantQueryParams(tenant),
          from: range.from,
          to: range.to,
        },
      }),
    enabled:
      enabled && Boolean(tenant) && staffId > 0 && Boolean(range.from && range.to),
    ...listQueryOptions,
  });

export const useTenantHolidays = (
  tenant: string,
  range: { from: string; to: string },
  enabled = true,
) =>
  useQuery({
    queryKey: scheduleKeys.holidays(tenant, range),
    queryFn: () =>
      api.get<TenantHoliday[]>(API_ENDPOINTS.SCHEDULES.TENANT_HOLIDAYS, {
        params: {
          ...tenantQueryParams(tenant),
          from: range.from,
          to: range.to,
        },
      }),
    enabled: enabled && Boolean(tenant) && Boolean(range.from && range.to),
    ...listQueryOptions,
  });

export const useScheduleTemplates = (tenant: string, enabled = true) =>
  useQuery({
    queryKey: scheduleKeys.templates(tenant),
    queryFn: () =>
      api.get<ScheduleTemplate[]>(API_ENDPOINTS.SCHEDULES.TEMPLATES, {
        params: tenantQueryParams(tenant),
      }),
    enabled: enabled && Boolean(tenant),
    ...listQueryOptions,
  });
