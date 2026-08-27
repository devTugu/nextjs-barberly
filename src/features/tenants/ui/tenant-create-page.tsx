'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  createTenantSchema,
  useCreateTenant,
  useTenants,
  useUpdateTenant,
  type CreateTenantFormValues,
} from '@/entities/tenant';
import { useSendOwnerInvite } from '@/entities/tenant';
import { useAuthPermissions } from '@/entities/session';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { ROUTES } from '@/shared/config/routes';
import { getErrorMessage } from '@/shared/api';
import { normalizeHexColor } from '@/shared/lib/normalize-hex-color';
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

export function TenantCreatePage() {
  const t = useTranslations('entities.tenants');
  const tCommon = useTranslations('common');
  const tTable = useTranslations('table');
  const tVal = useTranslations('validation');
  const router = useRouter();
  const { can } = useAuthPermissions();
  const createTenant = useCreateTenant();
  const updateTenant = useUpdateTenant();
  const sendOwnerInvite = useSendOwnerInvite();
  const { data: tenantsList } = useTenants({ page: 1, limit: 100 });
  const brandRoots = (tenantsList?.items ?? []).filter(
    (tenant) => tenant.parentTenantId == null,
  );
  const validationMessages = useMemo(
    () => ({
      nameMinLength: tVal('nameMinLength'),
      subdomainInvalid: t('subdomainInvalid'),
    }),
    [tVal, t],
  );
  const schema = useMemo(
    () => createTenantSchema(validationMessages),
    [validationMessages],
  );
  const form = useForm<CreateTenantFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      subdomain: '',
      name: '',
      timezone: 'Asia/Ulaanbaatar',
      phone: '',
      address: '',
      brandColor: '',
      ownerEmail: '',
      commissionPercent: 10,
      parentTenantId: null,
    },
  });
  const canSubmit = can(PERMISSION_CODES.TENANT_CREATE);
  const onSubmit = async (values: CreateTenantFormValues) => {
    try {
      const brandColor = normalizeHexColor(values.brandColor) ?? undefined;
      const tenant = await createTenant.mutateAsync({
        subdomain: values.subdomain,
        name: values.name,
        timezone: values.timezone,
        phone: values.phone,
        address: values.address,
        brandColor,
        parentTenantId: values.parentTenantId ?? null,
      });
      if (values.commissionPercent !== undefined) {
        await updateTenant.mutateAsync({
          id: tenant.id,
          data: { commissionPercent: values.commissionPercent },
        });
      }
      if (values.ownerEmail?.trim()) {
        await sendOwnerInvite.mutateAsync({
          tenantId: tenant.id,
          email: values.ownerEmail.trim(),
        });
      }
      toast.success(t('toastCreated'));
      router.push(ROUTES.platformTenant(tenant.id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };
  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>{t('createTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              name="ownerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('ownerEmail')}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="owner@example.com" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="commissionPercent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('commissionPercent')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={field.value ?? 10}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('phone')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            {canSubmit ? (
              <Button type="submit" disabled={createTenant.isPending}>
                {createTenant.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                {tCommon('create')}
              </Button>
            ) : null}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
