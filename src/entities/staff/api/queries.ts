'use client';



import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/shared/api';

import { listQueryOptions } from '@/shared/api/list-query-options';

import { API_ENDPOINTS } from '@/shared/config/api.config';

import { tenantQueryParams } from '@/shared/hooks/use-tenant-subdomain';



export interface StaffOutput {

  id: number;

  tenantId: number;

  userId: number | null;

  displayName: string;

  phone: string | null;

  isActive: boolean;

  isDefault: boolean;

}



export type EmploymentType = 'salaried' | 'chair_rent' | 'commission';



export interface StaffCompensationOutput {

  staffId: number;

  employmentType: EmploymentType;

  staffSharePercent: number;

  rentPercent: number | null;

  rentFixed: number | null;

}



export const staffKeys = {

  all: ['staff'] as const,

  list: (tenant: string) => [...staffKeys.all, 'list', tenant] as const,

  detail: (tenant: string, id: number) =>

    [...staffKeys.all, 'detail', tenant, id] as const,

  compensation: (tenant: string, id: number) =>

    [...staffKeys.all, 'compensation', tenant, id] as const,

};



export const useStaffList = (tenant: string, enabled = true) => {

  return useQuery({

    queryKey: staffKeys.list(tenant),

    queryFn: () =>

      api.get<StaffOutput[]>(API_ENDPOINTS.STAFF.LIST, {

        params: tenantQueryParams(tenant),

      }),

    enabled,

    ...listQueryOptions,

  });

};



export const useStaffDetail = (

  tenant: string,

  id: number,

  enabled = true,

) => {

  return useQuery({

    queryKey: staffKeys.detail(tenant, id),

    queryFn: () =>

      api.get<StaffOutput>(API_ENDPOINTS.STAFF.BY_ID(id), {

        params: tenantQueryParams(tenant),

      }),

    enabled: enabled && Boolean(tenant) && id > 0,

    ...listQueryOptions,

  });

};



export const useStaffCompensation = (

  tenant: string,

  id: number,

  enabled = true,

) => {

  return useQuery({

    queryKey: staffKeys.compensation(tenant, id),

    queryFn: () =>

      api.get<StaffCompensationOutput>(API_ENDPOINTS.STAFF.COMPENSATION(id), {

        params: tenantQueryParams(tenant),

      }),

    enabled: enabled && Boolean(tenant) && id > 0,

    ...listQueryOptions,

  });

};



export const useCreateStaff = (tenant: string) => {

  const queryClient = useQueryClient();

  return useMutation({

    mutationFn: (data: {

      displayName: string;

      phone?: string;

      isDefault?: boolean;

    }) =>

      api.post<StaffOutput>(API_ENDPOINTS.STAFF.LIST, data, {

        params: tenantQueryParams(tenant),

      }),

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: staffKeys.list(tenant) });

    },

  });

};



export const useUpdateStaff = (tenant: string, id: number) => {

  const queryClient = useQueryClient();

  return useMutation({

    mutationFn: (data: {

      displayName?: string;

      phone?: string | null;

      isActive?: boolean;

      isDefault?: boolean;

    }) =>

      api.patch<StaffOutput>(API_ENDPOINTS.STAFF.BY_ID(id), data, {

        params: tenantQueryParams(tenant),

      }),

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: staffKeys.list(tenant) });

      queryClient.invalidateQueries({ queryKey: staffKeys.detail(tenant, id) });

    },

  });

};



export const useUpsertStaffCompensation = (tenant: string, id: number) => {

  const queryClient = useQueryClient();

  return useMutation({

    mutationFn: (data: Omit<StaffCompensationOutput, 'staffId'>) =>

      api.patch<StaffCompensationOutput>(

        API_ENDPOINTS.STAFF.COMPENSATION(id),

        data,

        { params: tenantQueryParams(tenant) },

      ),

    onSuccess: () => {

      queryClient.invalidateQueries({

        queryKey: staffKeys.compensation(tenant, id),

      });

    },

  });

};



export const useLinkStaffToBranch = (tenant: string, staffId: number) => {

  const queryClient = useQueryClient();

  return useMutation({

    mutationFn: (data: { targetTenantId: number }) =>

      api.post<StaffOutput>(

        API_ENDPOINTS.STAFF.LINK_BRANCH(staffId),

        data,

        { params: tenantQueryParams(tenant) },

      ),

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: staffKeys.list(tenant) });

    },

  });

};


