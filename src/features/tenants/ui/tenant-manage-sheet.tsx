'use client';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  type CreateTenantFormValues,
  type UpdateTenantFormValues,
  type Tenant,
  useCreateTenant,
  useUpdateTenant,
} from '@/entities/tenant';
import { useAuthPermissions } from '@/entities/session';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { getErrorMessage } from '@/shared/api';
import { AdminFormSheet } from '@/shared/ui/admin-form-sheet';
import { Button } from '@/shared/ui/button';
import {
  TenantSheetCreateForm,
  TenantSheetEditForm,
} from './tenant-sheet-forms';

export type TenantSheetState =
  | { mode: 'create' }
  | { mode: 'edit'; tenant: Tenant };

interface TenantManageSheetProps {
  state: TenantSheetState | null;
  onOpenChange: (open: boolean) => void;
}

export function TenantManageSheet({
  state,
  onOpenChange,
}: TenantManageSheetProps) {
  const t = useTranslations('entities.tenants');
  const tCommon = useTranslations('common');
  const { can } = useAuthPermissions();
  const createTenant = useCreateTenant();
  const updateTenant = useUpdateTenant();

  const isCreate = state?.mode === 'create';
  const isEdit = state?.mode === 'edit';
  const tenant = isEdit ? state.tenant : null;
  const open = state !== null;

  if (!open) return null;

  const canSubmit =
    (isCreate && can(PERMISSION_CODES.TENANT_CREATE)) ||
    (isEdit && can(PERMISSION_CODES.TENANT_UPDATE));

  const onCreateSubmit = async (values: CreateTenantFormValues) => {
    try {
      await createTenant.mutateAsync(values);
      toast.success(t('toastCreated'));
      onOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const onEditSubmit = async (values: UpdateTenantFormValues) => {
    if (!tenant) return;
    try {
      await updateTenant.mutateAsync({ id: tenant.id, data: values });
      toast.success(t('toastUpdated'));
      onOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const isPending = createTenant.isPending || updateTenant.isPending;
  const formId = isCreate ? 'tenant-create-form' : 'tenant-edit-form';

  const footer = canSubmit ? (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}
        disabled={isPending}
      >
        {tCommon('cancel')}
      </Button>
      <Button type="submit" form={formId} disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        {isCreate ? tCommon('create') : tCommon('save')}
      </Button>
    </div>
  ) : null;

  return (
    <AdminFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={
        isCreate
          ? t('createTitle')
          : t('editTitle', { name: tenant?.name ?? '' })
      }
      description={isCreate ? t('createDescription') : t('editDescription')}
      size="lg"
      showContentLocale={false}
      footer={footer}
    >
      {isCreate ? (
        <TenantSheetCreateForm
          key="create"
          formId={formId}
          onSubmit={onCreateSubmit}
        />
      ) : tenant ? (
        <TenantSheetEditForm
          key={tenant.id}
          formId={formId}
          tenant={tenant}
          onSubmit={onEditSubmit}
        />
      ) : null}
    </AdminFormSheet>
  );
}
