'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { api, getErrorMessage } from '@/shared/api';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import {
  normalizePlatformLanding,
  type PlatformLandingContent,
} from '@/entities/tenant';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Skeleton } from '@/shared/ui/skeleton';
import { TestimonialFields } from './testimonial-fields';

export function PlatformLandingEditor() {
  const { data, isLoading } = useQuery({
    queryKey: ['platform', 'landing'],
    queryFn: () => api.get<PlatformLandingContent>(API_ENDPOINTS.PLATFORM.LANDING),
  });

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <PlatformLandingEditorForm
      defaultValues={normalizePlatformLanding(data)}
    />
  );
}

function PlatformLandingEditorForm({
  defaultValues,
}: {
  defaultValues: PlatformLandingContent;
}) {
  const t = useTranslations('platformLanding');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();
  const form = useForm<PlatformLandingContent>({ defaultValues });
  const featureFields = useFieldArray({ control: form.control, name: 'features' });
  const benefitFields = useFieldArray({ control: form.control, name: 'benefits' });

  const updateMutation = useMutation({
    mutationFn: (body: PlatformLandingContent) =>
      api.patch<PlatformLandingContent>(API_ENDPOINTS.PLATFORM.LANDING, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['platform', 'landing'] });
      toast.success(t('saved'));
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('editorTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => updateMutation.mutate(values))}
        >
          <Input placeholder={t('heroTitle')} {...form.register('heroTitle')} />
          <Textarea rows={3} placeholder={t('heroSubtitle')} {...form.register('heroSubtitle')} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder={t('heroCtaPrimary')} {...form.register('heroCtaPrimary')} />
            <Input placeholder={t('heroCtaSecondary')} {...form.register('heroCtaSecondary')} />
          </div>
          <Input placeholder={t('partnersTitle')} {...form.register('partnersTitle')} />
          <div className="space-y-3">
            <p className="text-sm font-medium">{t('features')}</p>
            {featureFields.fields.map((field, index) => (
              <div key={field.id} className="grid gap-2 sm:grid-cols-2">
                <Input placeholder={t('featureTitle')} {...form.register(`features.${index}.title`)} />
                <Input placeholder={t('featureDescription')} {...form.register(`features.${index}.description`)} />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium">{t('benefits')}</p>
            {benefitFields.fields.map((field, index) => (
              <div key={field.id} className="grid gap-2 sm:grid-cols-2">
                <Input placeholder={t('featureTitle')} {...form.register(`benefits.${index}.title`)} />
                <Input placeholder={t('featureDescription')} {...form.register(`benefits.${index}.description`)} />
              </div>
            ))}
          </div>
          <TestimonialFields
            control={form.control}
            setValue={form.setValue}
            register={form.register}
          />
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {tCommon('save')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
