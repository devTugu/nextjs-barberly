'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { z } from 'zod';
import { useUploadMedia } from '@/entities/media';
import { useMyTenant, useUpdateMyTenant, type Tenant } from '@/entities/tenant';
import { useAuthPermissions } from '@/entities/session';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { getErrorMessage } from '@/shared/api';
import { applyBrandPrimary } from '@/shared/lib/apply-brand-primary';
import { normalizeHexColor } from '@/shared/lib/normalize-hex-color';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { ColorPickerField } from '@/shared/ui/form-fields';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';
import { AdminBrandingPreview } from './admin-branding-preview';
import { InheritOverrideToggle } from './inherit-override-toggle';

const brandingSchema = z.object({
  logoUrl: z.string().max(512).optional().nullable(),
  bannerUrl: z.string().max(512).optional().nullable(),
  brandColor: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) =>
        val === undefined ||
        val === null ||
        val === '' ||
        /^#[0-9A-Fa-f]{6}$/.test(val),
      'Invalid hex color',
    ),
});

type BrandingFormValues = z.infer<typeof brandingSchema>;

export function AdminBrandingForm() {
  const tenant = useTenantSubdomain();
  const { data, isLoading } = useMyTenant(tenant);
  if (isLoading) {
    return <Skeleton className="h-64 w-full max-w-lg" />;
  }
  if (!data) return null;
  return <AdminBrandingFormLoaded key={data.id} data={data} tenant={tenant} />;
}

function AdminBrandingFormLoaded({
  data,
  tenant,
}: {
  data: Tenant;
  tenant: string;
}) {
  const t = useTranslations('adminSettings');
  const tCommon = useTranslations('common');
  const { can } = useAuthPermissions();
  const updateTenant = useUpdateMyTenant(tenant);
  const uploadMedia = useUploadMedia();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const isChild = Boolean(data.inheritance?.isChild);
  const own = data.inheritance?.own;
  const logoInherited = isChild && own?.logoUrl == null;
  const colorInherited = isChild && own?.brandColor == null;
  const [inheritLogo, setInheritLogo] = useState(logoInherited);
  const [inheritColor, setInheritColor] = useState(colorInherited);

  const form = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      logoUrl: logoInherited
        ? (data.settings.logoUrl ?? '')
        : (own?.logoUrl ?? data.settings.logoUrl ?? ''),
      bannerUrl: data.settings.bannerUrl ?? '',
      brandColor: colorInherited
        ? (data.settings.brandColor ?? '')
        : (own?.brandColor ?? data.settings.brandColor ?? ''),
    },
  });

  const previewValues = form.watch();

  useEffect(() => {
    applyBrandPrimary(previewValues.brandColor ?? data.settings.brandColor ?? '');
  }, [previewValues.brandColor, data.settings.brandColor]);

  const canSubmit =
    can(PERMISSION_CODES.TENANT_SETTINGS_UPDATE) &&
    can(PERMISSION_CODES.MEDIA_UPLOAD);

  const handleUpload = async (
    file: File,
    field: 'logoUrl' | 'bannerUrl',
  ) => {
    try {
      const result = await uploadMedia.mutateAsync(file);
      form.setValue(field, result.url);
      if (field === 'logoUrl') setInheritLogo(false);
      toast.success(t('uploadSuccess'));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const onSubmit = async (values: BrandingFormValues) => {
    const brandColor = inheritColor
      ? null
      : (normalizeHexColor(values.brandColor) ?? null);
    try {
      await updateTenant.mutateAsync({
        logoUrl: inheritLogo ? null : values.logoUrl || null,
        bannerUrl: values.bannerUrl || null,
        brandColor,
      });
      applyBrandPrimary(
        inheritColor
          ? (data?.settings.brandColor ?? brandColor)
          : brandColor,
      );
      toast.success(tCommon('changesSaved'));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="grid max-w-4xl gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <Card>
        <CardHeader>
          <CardTitle>{t('brandingTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <InheritOverrideToggle
                  isChild={isChild}
                  inherited={inheritLogo}
                  disabled={!can(PERMISSION_CODES.TENANT_SETTINGS_UPDATE)}
                  onChange={(inherit) => {
                    setInheritLogo(inherit);
                    if (inherit && data) {
                      form.setValue('logoUrl', data.settings.logoUrl ?? '');
                    }
                  }}
                />
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('logoUrl')}</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ''}
                            disabled={inheritLogo}
                          />
                        </FormControl>
                        {canSubmit && !inheritLogo ? (
                          <>
                            <input
                              ref={logoInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) void handleUpload(file, 'logoUrl');
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => logoInputRef.current?.click()}
                              disabled={uploadMedia.isPending}
                            >
                              <Upload className="size-4" />
                            </Button>
                          </>
                        ) : null}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="bannerUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('bannerUrl')}</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} />
                      </FormControl>
                      {canSubmit ? (
                        <>
                          <input
                            ref={bannerInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) void handleUpload(file, 'bannerUrl');
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => bannerInputRef.current?.click()}
                            disabled={uploadMedia.isPending}
                          >
                            <Upload className="size-4" />
                          </Button>
                        </>
                      ) : null}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <InheritOverrideToggle
                  isChild={isChild}
                  inherited={inheritColor}
                  disabled={!can(PERMISSION_CODES.TENANT_SETTINGS_UPDATE)}
                  onChange={(inherit) => {
                    setInheritColor(inherit);
                    if (inherit && data) {
                      form.setValue(
                        'brandColor',
                        data.settings.brandColor ?? '',
                      );
                    }
                  }}
                />
                <ColorPickerField
                  control={form.control}
                  name="brandColor"
                  label={t('brandColor')}
                  description={t('brandColorDescription')}
                  disabled={
                    inheritColor ||
                    !can(PERMISSION_CODES.TENANT_SETTINGS_UPDATE)
                  }
                />
              </div>
              {can(PERMISSION_CODES.TENANT_SETTINGS_UPDATE) ? (
                <Button type="submit" disabled={updateTenant.isPending}>
                  {updateTenant.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  {tCommon('save')}
                </Button>
              ) : null}
            </form>
          </Form>
        </CardContent>
      </Card>

      <AdminBrandingPreview
        values={previewValues}
        name={data.name ?? tenant}
      />
    </div>
  );
}
