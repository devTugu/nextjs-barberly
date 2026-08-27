'use client';

import { useMemo } from 'react';
import { useForm, type Control, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import {
  createTenantSchema,
  updateTenantSchema,
  type CreateTenantFormValues,
  type UpdateTenantFormValues,
  type Tenant,
} from '@/entities/tenant';
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

function asFieldControl(control: unknown): Control<FieldValues> {
  return control as Control<FieldValues>;
}

interface TenantCreateFormProps {
  formId: string;
  onSubmit: (values: CreateTenantFormValues) => void;
}

export function TenantSheetCreateForm({
  formId,
  onSubmit,
}: TenantCreateFormProps) {
  const t = useTranslations('entities.tenants');
  const tTable = useTranslations('table');
  const tVal = useTranslations('validation');
  const schema = useMemo(
    () =>
      createTenantSchema({
        nameMinLength: tVal('nameMinLength'),
        subdomainInvalid: t('subdomainInvalid'),
      }),
    [tVal, t],
  );
  const form = useForm<CreateTenantFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      subdomain: '',
      name: '',
      timezone: 'Asia/Ulaanbaatar',
      phone: '',
      address: '',
    },
  });

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
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
        <TextField
          control={asFieldControl(form.control)}
          name="name"
          label={tTable('name')}
        />
        <TextField
          control={asFieldControl(form.control)}
          name="timezone"
          label={tTable('timezone')}
        />
        <TextField
          control={asFieldControl(form.control)}
          name="phone"
          label={t('phone')}
        />
        <TextField
          control={asFieldControl(form.control)}
          name="address"
          label={t('address')}
        />
      </form>
    </Form>
  );
}

interface TenantEditFormProps {
  formId: string;
  tenant: Tenant;
  onSubmit: (values: UpdateTenantFormValues) => void;
}

export function TenantSheetEditForm({
  formId,
  tenant,
  onSubmit,
}: TenantEditFormProps) {
  const t = useTranslations('entities.tenants');
  const tTable = useTranslations('table');
  const schema = useMemo(() => updateTenantSchema(), []);
  const form = useForm<UpdateTenantFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: tenant.name,
      timezone: tenant.timezone,
      isActive: tenant.isActive,
      phone: tenant.settings.phone ?? '',
      address: tenant.settings.address ?? '',
      slotLockMinutes: tenant.policies.slotLockMinutes,
      cancelHoursBefore: tenant.policies.cancelHoursBefore,
      rescheduleHoursBefore: tenant.policies.rescheduleHoursBefore,
      commissionPercent: tenant.policies.commissionPercent,
    },
  });

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormItem>
          <FormLabel>{tTable('slug')}</FormLabel>
          <Input value={tenant.subdomain} disabled readOnly />
        </FormItem>
        <TextField
          control={asFieldControl(form.control)}
          name="name"
          label={tTable('name')}
        />
        <TextField
          control={asFieldControl(form.control)}
          name="timezone"
          label={tTable('timezone')}
        />
        <FormField
          control={form.control}
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
          <NumberField
            control={asFieldControl(form.control)}
            name="slotLockMinutes"
            label={t('slotLockMinutes')}
          />
          <NumberField
            control={asFieldControl(form.control)}
            name="commissionPercent"
            label={t('commissionPercent')}
          />
        </div>
      </form>
    </Form>
  );
}

function TextField({
  control,
  name,
  label,
}: {
  control: Control<FieldValues>;
  name: string;
  label: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} value={field.value ?? ''} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function NumberField({
  control,
  name,
  label,
}: {
  control: Control<FieldValues>;
  name: string;
  label: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              {...field}
              onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
