'use client';

import { useMemo } from 'react';
import { useForm, type Control, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import {
  createServiceSchema,
  updateServiceSchema,
  type CreateServiceFormValues,
  type UpdateServiceFormValues,
  type ServiceOutput,
} from '@/entities/service';
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

function asFieldControl(control: unknown): Control<FieldValues> {
  return control as Control<FieldValues>;
}

interface ServiceCreateFormProps {
  formId: string;
  onSubmit: (values: CreateServiceFormValues) => void;
}

export function ServiceCreateForm({ formId, onSubmit }: ServiceCreateFormProps) {
  const t = useTranslations('entities.services');
  const tTable = useTranslations('table');
  const tVal = useTranslations('validation');
  const schema = useMemo(
    () => createServiceSchema({ nameMinLength: tVal('nameMinLength') }),
    [tVal],
  );
  const form = useForm<CreateServiceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      durationMinutes: 30,
      price: 0,
      sortOrder: 0,
    },
  });

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <NameDescriptionFields
          control={asFieldControl(form.control)}
          t={t}
          tTable={tTable}
        />
        <DurationPriceFields
          control={asFieldControl(form.control)}
          tTable={tTable}
        />
      </form>
    </Form>
  );
}

interface ServiceEditFormProps {
  formId: string;
  service: ServiceOutput;
  onSubmit: (values: UpdateServiceFormValues) => void;
}

export function ServiceEditForm({
  formId,
  service,
  onSubmit,
}: ServiceEditFormProps) {
  const t = useTranslations('entities.services');
  const tTable = useTranslations('table');
  const schema = useMemo(() => updateServiceSchema(), []);
  const form = useForm<UpdateServiceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: service.name,
      description: service.description ?? '',
      durationMinutes: service.durationMinutes,
      price: service.price,
      isActive: service.isActive,
      sortOrder: service.sortOrder,
    },
  });

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <NameDescriptionFields
          control={asFieldControl(form.control)}
          t={t}
          tTable={tTable}
        />
        <DurationPriceFields
          control={asFieldControl(form.control)}
          tTable={tTable}
        />
        <FormField
          control={form.control}
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
  );
}

function NameDescriptionFields({
  control,
  t,
  tTable,
}: {
  control: Control<FieldValues>;
  t: (key: string) => string;
  tTable: (key: string) => string;
}) {
  return (
    <>
      <FormField
        control={control}
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
        control={control}
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
    </>
  );
}

function DurationPriceFields({
  control,
  tTable,
}: {
  control: Control<FieldValues>;
  tTable: (key: string) => string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField
        control={control}
        name="durationMinutes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{tTable('duration')}</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={5}
                {...field}
                onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{tTable('price')}</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                {...field}
                onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
