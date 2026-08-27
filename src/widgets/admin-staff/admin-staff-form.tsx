'use client';

import { useQuery } from '@tanstack/react-query';
import {
  useCreateStaff,
  useLinkStaffToBranch,
  useStaffCompensation,
  useStaffDetail,
  useUpdateStaff,
  useUpsertStaffCompensation,
} from '@/entities/staff';
import { api } from '@/shared/api';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { PageLoading } from '@/shared/ui/page-states';
import {
  AdminStaffFormLoaded,
  type TenantMembership,
} from './admin-staff-form-loaded';

interface AdminStaffFormProps {
  staffId?: number;
}

export function AdminStaffForm({ staffId }: AdminStaffFormProps) {
  const tenant = useTenantSubdomain();
  const isEdit = staffId != null && staffId > 0;
  const detailQuery = useStaffDetail(tenant, staffId ?? 0, isEdit);
  const compensationQuery = useStaffCompensation(tenant, staffId ?? 0, isEdit);
  const createStaff = useCreateStaff(tenant);
  const updateStaff = useUpdateStaff(tenant, staffId ?? 0);
  const upsertCompensation = useUpsertStaffCompensation(tenant, staffId ?? 0);
  const linkStaff = useLinkStaffToBranch(tenant, staffId ?? 0);

  const membershipsQuery = useQuery({
    queryKey: ['auth', 'my-tenants'],
    queryFn: () =>
      api.get<{ items: TenantMembership[] }>(API_ENDPOINTS.AUTH.MY_TENANTS),
    enabled: isEdit,
  });

  if (isEdit && (detailQuery.isLoading || compensationQuery.isLoading)) {
    return <PageLoading />;
  }

  return (
    <AdminStaffFormLoaded
      key={isEdit ? `edit-${staffId}` : 'new'}
      isEdit={isEdit}
      detail={detailQuery.data}
      compensation={compensationQuery.data}
      memberships={membershipsQuery.data?.items ?? []}
      createStaff={createStaff}
      updateStaff={updateStaff}
      upsertCompensation={upsertCompensation}
      linkStaff={linkStaff}
    />
  );
}
