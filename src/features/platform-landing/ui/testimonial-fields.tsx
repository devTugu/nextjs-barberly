'use client';

import {
  useFieldArray,
  type Control,
  type UseFormRegister,
  type UseFormSetValue,
} from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTenants, type PlatformLandingContent, type Tenant } from '@/entities/tenant';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';

interface TestimonialFieldsProps {
  control: Control<PlatformLandingContent>;
  setValue: UseFormSetValue<PlatformLandingContent>;
  register: UseFormRegister<PlatformLandingContent>;
}

const EMPTY_TESTIMONIAL = {
  quote: '',
  name: '',
  role: '',
  tenantSubdomain: '',
};

export function TestimonialFields({
  control,
  setValue,
  register,
}: TestimonialFieldsProps) {
  const t = useTranslations('platformLanding');
  const { fields, append, remove } = useFieldArray({ control, name: 'testimonials' });
  const { data } = useTenants({ page: 1, limit: 100 });
  const tenants = data?.items ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{t('testimonials')}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(EMPTY_TESTIMONIAL)}
        >
          <Plus className="size-4" />
          {t('addTestimonial')}
        </Button>
      </div>
      <p className="text-muted-foreground text-xs">{t('testimonialsHint')}</p>
      <Input placeholder={t('testimonialsTitle')} {...register('testimonialsTitle')} />
      {fields.map((field, index) => (
        <TestimonialRow
          key={field.id}
          index={index}
          tenants={tenants}
          register={register}
          setValue={setValue}
          onRemove={() => remove(index)}
        />
      ))}
    </div>
  );
}

interface TestimonialRowProps {
  index: number;
  tenants: Tenant[];
  register: UseFormRegister<PlatformLandingContent>;
  setValue: UseFormSetValue<PlatformLandingContent>;
  onRemove: () => void;
}

function TestimonialRow({
  index,
  tenants,
  register,
  setValue,
  onRemove,
}: TestimonialRowProps) {
  const t = useTranslations('platformLanding');
  const tenantField = register(`testimonials.${index}.tenantSubdomain`);

  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex items-center gap-2">
        <select
          className="border-input h-9 min-w-0 flex-1 rounded-md border bg-transparent px-3 text-sm"
          {...tenantField}
          onChange={(event) => {
            void tenantField.onChange(event);
            const subdomain = event.target.value;
            const tenant = tenants.find((item) => item.subdomain === subdomain);
            if (!tenant) return;
            setValue(`testimonials.${index}.name`, tenant.name);
            setValue(`testimonials.${index}.role`, t('tenantOwnerRole'));
          }}
        >
          <option value="">{t('pickTenant')}</option>
          {tenants.map((tenant) => (
            <option key={tenant.id} value={tenant.subdomain}>
              {tenant.name} ({tenant.subdomain})
            </option>
          ))}
        </select>
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 className="size-4" />
          <span className="sr-only">{t('removeTestimonial')}</span>
        </Button>
      </div>
      <Textarea
        rows={3}
        placeholder={t('testimonialQuote')}
        {...register(`testimonials.${index}.quote`)}
      />
      <div className="grid gap-2 sm:grid-cols-2">
        <Input placeholder={t('testimonialName')} {...register(`testimonials.${index}.name`)} />
        <Input placeholder={t('testimonialRole')} {...register(`testimonials.${index}.role`)} />
      </div>
    </div>
  );
}
