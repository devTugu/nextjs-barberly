'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
  type CreateServiceFormValues,
  type UpdateServiceFormValues,
  type ServiceOutput,
  useCreateService,
  useUpdateService,
} from '@/entities/service';
import { useAuthPermissions } from '@/entities/session';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { getErrorMessage } from '@/shared/api';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { AdminFormSheet } from '@/shared/ui/admin-form-sheet';
import { Button } from '@/shared/ui/button';
import { ServiceCreateForm, ServiceEditForm } from './service-sheet-forms';

export type ServiceSheetState =
  | { mode: 'create' }
  | { mode: 'edit'; service: ServiceOutput };

interface ServiceManageSheetProps {
  state: ServiceSheetState | null;
  onOpenChange: (open: boolean) => void;
}

export function ServiceManageSheet({
  state,
  onOpenChange,
}: ServiceManageSheetProps) {
  const t = useTranslations('entities.services');
  const tCommon = useTranslations('common');
  const tenant = useTenantSubdomain();
  const { can } = useAuthPermissions();
  const createService = useCreateService(tenant);
  const updateService = useUpdateService(tenant);

  const isCreate = state?.mode === 'create';
  const isEdit = state?.mode === 'edit';
  const service = isEdit ? state.service : null;
  const open = state !== null;

  if (!open) return null;

  const canSubmit =
    (isCreate && can(PERMISSION_CODES.SERVICE_CREATE)) ||
    (isEdit && can(PERMISSION_CODES.SERVICE_UPDATE));

  const onCreateSubmit = async (values: CreateServiceFormValues) => {
    try {
      await createService.mutateAsync(values);
      toast.success(t('toastCreated'));
      onOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const onEditSubmit = async (values: UpdateServiceFormValues) => {
    if (!service) return;
    try {
      await updateService.mutateAsync({ id: service.id, data: values });
      toast.success(t('toastUpdated'));
      onOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const isPending = createService.isPending || updateService.isPending;
  const formId = isCreate ? 'service-create-form' : 'service-edit-form';

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
          : t('editTitle', { name: service?.name ?? '' })
      }
      description={isCreate ? t('createDescription') : t('editDescription')}
      showContentLocale={false}
      footer={footer}
    >
      {isCreate ? (
        <ServiceCreateForm
          key="create"
          formId={formId}
          onSubmit={onCreateSubmit}
        />
      ) : service ? (
        <ServiceEditForm
          key={service.id}
          formId={formId}
          service={service}
          onSubmit={onEditSubmit}
        />
      ) : null}
    </AdminFormSheet>
  );
}
