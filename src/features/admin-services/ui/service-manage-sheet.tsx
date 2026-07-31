'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  createServiceSchema,
  updateServiceSchema,
  type CreateServiceFormValues,
  type UpdateServiceFormValues,
  type ServiceOutput,
  useCreateService,
  useUpdateService,
} from '@/entities/service';
import { useAuthPermissions } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { getErrorMessage } from '@/shared/api';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { AdminFormSheet } from '@/widgets/admin-form-sheet';
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
import { Textarea } from '@/shared/ui/textarea';

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
  const tTable = useTranslations('table');
  const tVal = useTranslations('validation');
  const tenant = useTenantSubdomain();
  const { can } = useAuthPermissions();
  const createService = useCreateService(tenant);
  const updateService = useUpdateService(tenant);

  const isCreate = state?.mode === 'create';
  const isEdit = state?.mode === 'edit';
  const service = isEdit ? state.service : null;
  const open = state !== null;

  const validationMessages = useMemo(
    () => ({ nameMinLength: tVal('nameMinLength') }),
    [tVal],
  );

  const createSchema = useMemo(
    () => createServiceSchema(validationMessages),
    [validationMessages],
  );

  const updateSchema = useMemo(() => updateServiceSchema(), []);

  const createForm = useForm<CreateServiceFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      name: '',
      description: '',
      durationMinutes: 30,
      price: 0,
      sortOrder: 0,
    },
  });

  const editForm = useForm<UpdateServiceFormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (!open) return;
    if (isCreate) {
      createForm.reset({
        name: '',
        description: '',
        durationMinutes: 30,
        price: 0,
        sortOrder: 0,
      });
      return;
    }
    if (service) {
      editForm.reset({
        name: service.name,
        description: service.description ?? '',
        durationMinutes: service.durationMinutes,
        price: service.price,
        isActive: service.isActive,
        sortOrder: service.sortOrder,
      });
    }
  }, [open, isCreate, service, createForm, editForm]);

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
      description={
        isCreate ? t('createDescription') : t('editDescription')
      }
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tTable('name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('namePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={createForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tTable('description')}</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={createForm.control}
                name="durationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tTable('duration')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={5}
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tTable('price')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      ) : (
        <Form {...editForm}>
          <form
            id={formId}
            onSubmit={editForm.handleSubmit(onEditSubmit)}
            className="space-y-4"
          >
            <FormField
              control={editForm.control}
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
              control={editForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tTable('description')}</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} value={field.value ?? ''} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={editForm.control}
                name="durationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tTable('duration')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={5}
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
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tTable('price')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
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
            <FormField
              control={editForm.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel>{t('activeService')}</FormLabel>
                    <p className="text-muted-foreground text-sm">
                      {t('activeServiceHint')}
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? true}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      )}
    </AdminFormSheet>
  );
}
