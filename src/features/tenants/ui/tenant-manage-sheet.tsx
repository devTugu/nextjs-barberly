'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  createTenantSchema,
  updateTenantSchema,
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import { Switch } from '@/shared/ui/switch';

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
  const tTable = useTranslations('table');
  const tVal = useTranslations('validation');
  const { can } = useAuthPermissions();
  const createTenant = useCreateTenant();
  const updateTenant = useUpdateTenant();

  const isCreate = state?.mode === 'create';
  const isEdit = state?.mode === 'edit';
  const tenant = isEdit ? state.tenant : null;
  const open = state !== null;

  const validationMessages = useMemo(
    () => ({
      nameMinLength: tVal('nameMinLength'),
      subdomainInvalid: t('subdomainInvalid'),
    }),
    [tVal, t],
  );

  const createSchema = useMemo(
    () => createTenantSchema(validationMessages),
    [validationMessages],
  );
  const updateSchema = useMemo(() => updateTenantSchema(), []);

  const createForm = useForm<CreateTenantFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      subdomain: '',
      name: '',
      timezone: 'Asia/Ulaanbaatar',
      phone: '',
      address: '',
    },
  });

  const editForm = useForm<UpdateTenantFormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (!open) return;
    if (isCreate) {
      createForm.reset({
        subdomain: '',
        name: '',
        timezone: 'Asia/Ulaanbaatar',
        phone: '',
        address: '',
      });
      return;
    }
    if (tenant) {
      editForm.reset({
        name: tenant.name,
        timezone: tenant.timezone,
        isActive: tenant.isActive,
        phone: tenant.settings.phone ?? '',
        address: tenant.settings.address ?? '',
        slotLockMinutes: tenant.policies.slotLockMinutes,
        cancelHoursBefore: tenant.policies.cancelHoursBefore,
        rescheduleHoursBefore: tenant.policies.rescheduleHoursBefore,
        commissionPercent: tenant.policies.commissionPercent,
      });
    }
  }, [open, isCreate, tenant, createForm, editForm]);

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
      description={
        isCreate ? t('createDescription') : t('editDescription')
      }
      size="lg"
      showContentLocale={false}
      footer={footer}
    >
      {isCreate ? (
        <Form {...createForm}>
          <form
            id={formId}
            onSubmit={createForm.handleSubmit(onCreateSubmit)}
            className="space-y-4"
          >
            <FormField
              control={createForm.control}
              name="subdomain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tTable('slug')}</FormLabel>
                  <FormControl>
                    <Input placeholder="demo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={createForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tTable('name')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={createForm.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tTable('timezone')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={createForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('phone')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={createForm.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('address')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      ) : (
        <Form {...editForm}>
          <form
            id={formId}
            onSubmit={editForm.handleSubmit(onEditSubmit)}
            className="space-y-4"
          >
            <FormItem>
              <FormLabel>{tTable('slug')}</FormLabel>
              <Input value={tenant?.subdomain ?? ''} disabled readOnly />
            </FormItem>
            <FormField
              control={editForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tTable('name')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={editForm.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tTable('timezone')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={editForm.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <FormLabel>{t('activeTenant')}</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value ?? true}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={editForm.control}
                name="slotLockMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('slotLockMinutes')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber || 0)
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="commissionPercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('commissionPercent')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber || 0)
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      )}
    </AdminFormSheet>
  );
}
