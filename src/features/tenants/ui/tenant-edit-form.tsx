'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  updateTenantSchema,
  useUpdateTenant,
  type Tenant,
  type UpdateTenantFormValues,
} from '@/entities/tenant';
import { useAuthPermissions } from '@/entities/session';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { ROUTES } from '@/shared/config/routes';
import { getErrorMessage } from '@/shared/api';
import { normalizeHexColor } from '@/shared/lib/normalize-hex-color';
import { Alert, AlertDescription } from '@/shared/ui/alert';
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
import { Input } from '@/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Switch } from '@/shared/ui/switch';
import { TenantEditExtraFields } from './tenant-edit-extra-fields';

interface TenantEditFormProps {
  id: number;
  data: Tenant;
  brandRoots: Tenant[];
}

export function TenantEditForm({ id, data, brandRoots }: TenantEditFormProps) {
  const t = useTranslations('entities.tenants');
  const tCommon = useTranslations('common');
  const tTable = useTranslations('table');
  const router = useRouter();
  const { can } = useAuthPermissions();
  const updateTenant = useUpdateTenant();
  const schema = useMemo(() => updateTenantSchema(), []);
  const form = useForm<UpdateTenantFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: data.name,
      timezone: data.timezone,
      isActive: data.isActive,
      phone: data.settings.phone ?? '',
      address: data.settings.address ?? '',
      logoUrl: data.settings.logoUrl ?? '',
      bannerUrl: data.settings.bannerUrl ?? '',
      brandColor: data.settings.brandColor ?? '',
      slotLockMinutes: data.policies.slotLockMinutes,
      cancelHoursBefore: data.policies.cancelHoursBefore,
      rescheduleHoursBefore: data.policies.rescheduleHoursBefore,
      commissionPercent: data.policies.commissionPercent,
      parentTenantId: data.parentTenantId,
    },
  });
  const canSubmit = can(PERMISSION_CODES.TENANT_UPDATE);
  const onSubmit = async (values: UpdateTenantFormValues) => {
    const brandColor = normalizeHexColor(values.brandColor) ?? null;
    try {
      await updateTenant.mutateAsync({
        id,
        data: {
          ...values,
          brandColor,
          logoUrl: values.logoUrl || null,
          bannerUrl: values.bannerUrl || null,
        },
      });
      toast.success(t('toastUpdated'));
      router.push(ROUTES.platformTenant(id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };
  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>{t('editTitle', { name: data.name })}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <FormLabel>{t('subdomainReadOnly')}</FormLabel>
              <Input value={data.subdomain} readOnly disabled />
              <Alert>
                <AlertDescription>{t('subdomainReadOnlyWarning')}</AlertDescription>
              </Alert>
            </div>
            <FormField
              control={form.control}
              name="parentTenantId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('parentTenant')}</FormLabel>
                  <Select
                    value={field.value == null ? 'none' : String(field.value)}
                    onValueChange={(v) =>
                      field.onChange(v === 'none' ? null : Number(v))
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('parentTenantNone')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">{t('parentTenantNone')}</SelectItem>
                      {brandRoots.map((root) => (
                        <SelectItem key={root.id} value={String(root.id)}>
                          {root.name} ({root.subdomain})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground text-xs">
                    {t('parentTenantHint')}
                  </p>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
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
              control={form.control}
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
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('phone')}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('address')}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                </FormItem>
              )}
            />
            <TenantEditExtraFields form={form} />
            {canSubmit ? (
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
  );
}
