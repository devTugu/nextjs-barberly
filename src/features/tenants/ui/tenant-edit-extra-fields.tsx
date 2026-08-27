'use client';

import { useTranslations } from 'next-intl';
import type { UseFormReturn } from 'react-hook-form';
import type { UpdateTenantFormValues } from '@/entities/tenant';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/shared/ui/form';
import { ColorPickerField } from '@/shared/ui/form-fields';
import { Input } from '@/shared/ui/input';
import { Separator } from '@/shared/ui/separator';

interface TenantEditExtraFieldsProps {
  form: UseFormReturn<UpdateTenantFormValues>;
}

export function TenantEditExtraFields({ form }: TenantEditExtraFieldsProps) {
  const t = useTranslations('entities.tenants');
  const tSettings = useTranslations('adminSettings');

  return (
    <>
      <Separator />
      <p className="text-sm font-medium">{tSettings('brandingTitle')}</p>
      <FormField
        control={form.control}
        name="logoUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{tSettings('logoUrl')}</FormLabel>
            <FormControl>
              <Input {...field} value={field.value ?? ''} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="bannerUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{tSettings('bannerUrl')}</FormLabel>
            <FormControl>
              <Input {...field} value={field.value ?? ''} />
            </FormControl>
          </FormItem>
        )}
      />
      <ColorPickerField
        control={form.control}
        name="brandColor"
        label={tSettings('brandColor')}
        description={tSettings('brandColorDescription')}
      />
      <Separator />
      <p className="text-sm font-medium">{tSettings('policyTitle')}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          form={form}
          name="slotLockMinutes"
          label={t('slotLockMinutes')}
        />
        <NumberField
          form={form}
          name="commissionPercent"
          label={t('commissionPercent')}
        />
        <NumberField
          form={form}
          name="cancelHoursBefore"
          label={tSettings('cancelHoursBefore')}
        />
        <NumberField
          form={form}
          name="rescheduleHoursBefore"
          label={tSettings('rescheduleHoursBefore')}
        />
      </div>
    </>
  );
}

function NumberField({
  form,
  name,
  label,
}: {
  form: UseFormReturn<UpdateTenantFormValues>;
  name:
    | 'slotLockMinutes'
    | 'commissionPercent'
    | 'cancelHoursBefore'
    | 'rescheduleHoursBefore';
  label: string;
}) {
  return (
    <FormField
      control={form.control}
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
