'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Loader2, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useUploadMedia } from '@/entities/media/api/mutations';
import { useMyTenant, useUpdateMyTenant } from '@/entities/tenant';
import {
  DEFAULT_TENANT_LANDING,
  type TenantLandingContent,
} from '@/entities/tenant/types/landing-content';
import { useAuthPermissions } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { getErrorMessage } from '@/shared/api';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Skeleton } from '@/shared/ui/skeleton';
import { InheritOverrideToggle } from './inherit-override-toggle';

function toFormValues(content?: TenantLandingContent | null): TenantLandingContent {
  return {
    ...DEFAULT_TENANT_LANDING,
    ...content,
    features: content?.features ?? DEFAULT_TENANT_LANDING.features ?? [],
  };
}

type ImageField = 'aboutImageUrl' | 'pricingImageUrl';

export function AdminLandingContentForm() {
  const t = useTranslations('adminSettings');
  const tCommon = useTranslations('common');
  const tenant = useTenantSubdomain();
  const { can } = useAuthPermissions();
  const { data, isLoading } = useMyTenant(tenant);
  const updateTenant = useUpdateMyTenant(tenant);
  const uploadMedia = useUploadMedia();
  const aboutInputRef = useRef<HTMLInputElement>(null);
  const pricingInputRef = useRef<HTMLInputElement>(null);
  const isChild = Boolean(data?.inheritance?.isChild);
  const [inheritLanding, setInheritLanding] = useState(true);

  const form = useForm<TenantLandingContent>({
    defaultValues: toFormValues(),
  });

  const { fields } = useFieldArray({ control: form.control, name: 'features' });

  useEffect(() => {
    if (!data) return;
    const own = data.inheritance?.own;
    const inherited = isChild && own?.landingContent == null;
    setInheritLanding(inherited);
    form.reset(
      toFormValues(
        inherited
          ? data.settings.landingContent
          : (own?.landingContent ?? data.settings.landingContent),
      ),
    );
  }, [data, form, isChild]);

  const canSubmit = can(PERMISSION_CODES.TENANT_SETTINGS_UPDATE);
  const canUpload =
    canSubmit && can(PERMISSION_CODES.MEDIA_UPLOAD) && !inheritLanding;

  const handleUpload = async (file: File, field: ImageField) => {
    try {
      const result = await uploadMedia.mutateAsync(file);
      form.setValue(field, result.url);
      toast.success(t('uploadSuccess'));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const onSubmit = async (values: TenantLandingContent) => {
    try {
      await updateTenant.mutateAsync({
        landingContent: inheritLanding ? null : values,
      });
      toast.success(tCommon('changesSaved'));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const renderImageField = (
    name: ImageField,
    label: string,
    inputRef: React.RefObject<HTMLInputElement | null>,
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="flex gap-2">
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ''}
                disabled={inheritLanding}
              />
            </FormControl>
            {canUpload ? (
              <>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleUpload(file, name);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => inputRef.current?.click()}
                  disabled={uploadMedia.isPending}
                >
                  <Upload className="size-4" />
                </Button>
              </>
            ) : null}
          </div>
        </FormItem>
      )}
    />
  );

  if (isLoading) return <Skeleton className="h-96 w-full max-w-2xl" />;

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{t('landingTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <InheritOverrideToggle
              isChild={isChild}
              inherited={inheritLanding}
              disabled={!canSubmit}
              onChange={(inherit) => {
                setInheritLanding(inherit);
                if (inherit && data) {
                  form.reset(toFormValues(data.settings.landingContent));
                }
              }}
            />
            <fieldset disabled={inheritLanding} className="space-y-4 border-0 p-0">
            <FormField control={form.control} name="verticalLabel" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('landingVerticalLabel')}</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="sidebarBrandName" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('landingSidebarBrand')}</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="establishedYear" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('landingEstablishedYear')}</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="heroTagline" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('landingHeroTagline')}</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="heroSubtitle" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('landingHeroSubtitle')}</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="aboutTitle" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('landingAboutTitle')}</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="aboutDescription" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('landingAboutDescription')}</FormLabel>
                <FormControl><Textarea rows={5} {...field} value={field.value ?? ''} /></FormControl>
              </FormItem>
            )} />
            {renderImageField('aboutImageUrl', t('landingAboutImageUrl'), aboutInputRef)}
            {renderImageField('pricingImageUrl', t('landingPricingImageUrl'), pricingInputRef)}
            <FormField control={form.control} name="faqAnswer" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('landingFaqAnswer')}</FormLabel>
                <FormControl><Textarea rows={4} {...field} value={field.value ?? ''} /></FormControl>
              </FormItem>
            )} />
            <div className="space-y-3">
              <p className="text-sm font-medium">{t('landingFeatures')}</p>
              {fields.map((field, index) => (
                <div key={field.id} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-2">
                  <FormField control={form.control} name={`features.${index}.title`} render={({ field: f }) => (
                    <FormItem>
                      <FormLabel>{t('landingFeatureTitle')}</FormLabel>
                      <FormControl><Input {...f} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name={`features.${index}.subtitle`} render={({ field: f }) => (
                    <FormItem>
                      <FormLabel>{t('landingFeatureSubtitle')}</FormLabel>
                      <FormControl><Input {...f} /></FormControl>
                    </FormItem>
                  )} />
                </div>
              ))}
            </div>
            </fieldset>
            {canSubmit ? (
              <Button type="submit" disabled={updateTenant.isPending}>
                {updateTenant.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                {tCommon('save')}
              </Button>
            ) : null}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
