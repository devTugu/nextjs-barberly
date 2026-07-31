'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import { tenantQueryParams } from '@/shared/hooks/use-tenant-subdomain';
import type {
  ApplyScheduleTemplateInput,
  CreateScheduleTemplateInput,
  CreateStaffDayExceptionInput,
  CreateStaffShiftInput,
  CreateStaffTimeBlockInput,
  CreateTenantHolidayInput,
  ScheduleTemplate,
  StaffDayException,
  StaffShift,
  StaffTimeBlock,
  TenantHoliday,
  UpdateScheduleTemplateInput,
  UpdateStaffDayExceptionInput,
  UpdateStaffShiftInput,
} from '../types/schedule';
import { scheduleKeys } from './queries';

export const useCreateStaffShift = (tenant: string, staffId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStaffShiftInput) =>
      api.post<StaffShift>(API_ENDPOINTS.SCHEDULES.SHIFTS(staffId), data, {
        params: tenantQueryParams(tenant),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scheduleKeys.shifts(tenant, staffId),
      });
    },
  });
};

export const useUpdateStaffShift = (tenant: string, staffId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateStaffShiftInput & { id: number }) =>
      api.patch<StaffShift>(API_ENDPOINTS.SCHEDULES.SHIFT(staffId, id), data, {
        params: tenantQueryParams(tenant),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scheduleKeys.shifts(tenant, staffId),
      });
    },
  });
};

export const useDeleteStaffShift = (tenant: string, staffId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete<void>(API_ENDPOINTS.SCHEDULES.SHIFT(staffId, id), {
        params: tenantQueryParams(tenant),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scheduleKeys.shifts(tenant, staffId),
      });
    },
  });
};

export const useCreateStaffDayException = (tenant: string, staffId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStaffDayExceptionInput) =>
      api.post<StaffDayException>(
        API_ENDPOINTS.SCHEDULES.DAY_EXCEPTIONS(staffId),
        data,
        { params: tenantQueryParams(tenant) },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...scheduleKeys.all, 'day-exceptions', tenant, staffId],
      });
    },
  });
};

export const useUpdateStaffDayException = (tenant: string, staffId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: UpdateStaffDayExceptionInput & { id: number }) =>
      api.patch<StaffDayException>(
        API_ENDPOINTS.SCHEDULES.DAY_EXCEPTION(staffId, id),
        data,
        { params: tenantQueryParams(tenant) },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...scheduleKeys.all, 'day-exceptions', tenant, staffId],
      });
    },
  });
};

export const useDeleteStaffDayException = (tenant: string, staffId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete<void>(API_ENDPOINTS.SCHEDULES.DAY_EXCEPTION(staffId, id), {
        params: tenantQueryParams(tenant),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...scheduleKeys.all, 'day-exceptions', tenant, staffId],
      });
    },
  });
};

export const useCreateStaffTimeBlock = (tenant: string, staffId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStaffTimeBlockInput) =>
      api.post<StaffTimeBlock>(
        API_ENDPOINTS.SCHEDULES.TIME_BLOCKS(staffId),
        data,
        { params: tenantQueryParams(tenant) },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...scheduleKeys.all, 'time-blocks', tenant, staffId],
      });
    },
  });
};

export const useDeleteStaffTimeBlock = (tenant: string, staffId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete<void>(API_ENDPOINTS.SCHEDULES.TIME_BLOCK(staffId, id), {
        params: tenantQueryParams(tenant),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...scheduleKeys.all, 'time-blocks', tenant, staffId],
      });
    },
  });
};

export const useCreateTenantHoliday = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTenantHolidayInput) =>
      api.post<TenantHoliday>(API_ENDPOINTS.SCHEDULES.TENANT_HOLIDAYS, data, {
        params: tenantQueryParams(tenant),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...scheduleKeys.all, 'holidays', tenant],
      });
    },
  });
};

export const useDeleteTenantHoliday = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete<void>(API_ENDPOINTS.SCHEDULES.TENANT_HOLIDAY(id), {
        params: tenantQueryParams(tenant),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...scheduleKeys.all, 'holidays', tenant],
      });
    },
  });
};

export const useCreateScheduleTemplate = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateScheduleTemplateInput) =>
      api.post<ScheduleTemplate>(API_ENDPOINTS.SCHEDULES.TEMPLATES, data, {
        params: tenantQueryParams(tenant),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scheduleKeys.templates(tenant),
      });
    },
  });
};

export const useUpdateScheduleTemplate = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateScheduleTemplateInput & { id: number }) =>
      api.patch<ScheduleTemplate>(API_ENDPOINTS.SCHEDULES.TEMPLATE(id), data, {
        params: tenantQueryParams(tenant),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scheduleKeys.templates(tenant),
      });
    },
  });
};

export const useDeleteScheduleTemplate = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete<void>(API_ENDPOINTS.SCHEDULES.TEMPLATE(id), {
        params: tenantQueryParams(tenant),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scheduleKeys.templates(tenant),
      });
    },
  });
};

export const useApplyScheduleTemplate = (tenant: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      templateId,
      ...data
    }: ApplyScheduleTemplateInput & { templateId: number }) =>
      api.post<StaffShift[]>(
        API_ENDPOINTS.SCHEDULES.APPLY_TEMPLATE(templateId),
        data,
        { params: tenantQueryParams(tenant) },
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: scheduleKeys.shifts(tenant, variables.staffId),
      });
    },
  });
};
