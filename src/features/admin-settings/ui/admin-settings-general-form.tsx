'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { z } from 'zod';
import { useMyTenant, useUpdateMyTenant } from '@/entities/tenant';
import { useAuthPermissions } from '@/entities/session';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { getErrorMessage } from '@/shared/api';
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
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';
import { Textarea } from '@/shared/ui/textarea';

const generalSchema = z.object({
  phone: z.string().max(32).optional().nullable(),
  address: z.string().optional().nullable(),
});

type GeneralFormValues = z.infer<typeof generalSchema>;

export function AdminSettingsGeneralForm() {
  const t = useTranslations('adminSettings');
  const tCommon = useTranslations('common');
  const tenant = useTenantSubdomain();
  const { can } = useAuthPermissions();
  const { data, isLoading } = useMyTenant(tenant);
  const updateTenant = useUpdateMyTenant(tenant);

  const form = useForm<GeneralFormValues>({
    resolver: zodResolver(generalSchema),
    defaultValues: { phone: '', address: '' },
  });

  useEffect(() => {
    if (!data) return;
    form.reset({
      phone: data.settings.phone ?? '',
      address: data.settings.address ?? '',
    });
  }, [data, form]);

  const canSubmit = can(PERMISSION_CODES.TENANT_SETTINGS_UPDATE);

  const onSubmit = async (values: GeneralFormValues) => {
    try {
      await updateTenant.mutateAsync({
        phone: values.phone || null,
        address: values.address || null,
      });
      toast.success(tCommon('changesSaved'));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (isLoading) {
    return <Skeleton className="h-48 w-full max-w-lg" />;
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>{t('generalTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('phone')}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
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
                    <Textarea rows={2} {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
