'use client';



import Link from 'next/link';

import { useRouter } from 'next/navigation';

import { useEffect, useMemo } from 'react';

import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { ExternalLink, Loader2 } from 'lucide-react';

import { useTranslations } from 'next-intl';

import { toast } from 'sonner';

import {

  createTenantSchema,

  updateTenantSchema,

  useCreateTenant,

  useTenant,

  useTenants,

  useUpdateTenant,

  type CreateTenantFormValues,

  type UpdateTenantFormValues,

} from '@/entities/tenant';
import { useSendOwnerInvite } from '@/entities/tenant/api/owner-invite';

import { useAuthPermissions } from '@/features/auth';

import { PERMISSION_CODES } from '@/shared/config/permissions';

import { ROUTES } from '@/shared/config/routes';

import { getErrorMessage } from '@/shared/api';

import { normalizeHexColor } from '@/shared/lib/normalize-hex-color';

import { tenantAdminUrl } from '@/shared/lib/tenant-url';

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

import { ColorPickerField } from '@/shared/ui/form-fields';

import { Input } from '@/shared/ui/input';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';

import { Separator } from '@/shared/ui/separator';

import { Skeleton } from '@/shared/ui/skeleton';

import { Switch } from '@/shared/ui/switch';

import { TenantContractForm } from './tenant-contract-form';



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



export function TenantDetailPage({ id }: { id: number }) {

  const t = useTranslations('entities.tenants');

  const tSettings = useTranslations('adminSettings');

  const tCommon = useTranslations('common');

  const tTable = useTranslations('table');

  const tStatus = useTranslations('status');

  const { data, isLoading } = useTenant(id);



  if (isLoading) {

    return <Skeleton className="mx-auto h-64 max-w-2xl" />;

  }



  if (!data) {

    return <p className="text-muted-foreground text-sm">{tCommon('notFound')}</p>;

  }



  return (

    <Card className="mx-auto max-w-2xl">

      <CardHeader className="flex flex-row items-center justify-between">

        <CardTitle>{data.name}</CardTitle>

        <div className="flex gap-2">

          <Button asChild variant="outline" size="sm">

            <Link href={ROUTES.platformTenantEdit(data.id)}>

              {t('editTenant')}

            </Link>

          </Button>

          <Button asChild variant="outline" size="sm">

            <Link href={`${ROUTES.PLATFORM_AUDIT}?tenantId=${data.id}`}>

              {t('viewAuditLogs')}

            </Link>

          </Button>

          <Button asChild variant="outline" size="sm">

            <Link href={tenantAdminUrl(data.subdomain, ROUTES.ADMIN_DASHBOARD)}>

              <ExternalLink className="mr-1 size-3.5" />

              {t('openShop')}

            </Link>

          </Button>

        </div>

      </CardHeader>

      <CardContent className="space-y-6 text-sm">

        <div className="grid gap-3 sm:grid-cols-2">

          <div>

            <p className="text-muted-foreground">{tTable('slug')}</p>

            <p className="font-medium">{data.subdomain}</p>

          </div>

          <div>

            <p className="text-muted-foreground">{tTable('timezone')}</p>

            <p className="font-medium">{data.timezone}</p>

          </div>

          <div>

            <p className="text-muted-foreground">{tTable('status')}</p>

            <p className="font-medium">

              {data.isActive ? tStatus('active') : tStatus('inactive')}

            </p>

          </div>

          <div>

            <p className="text-muted-foreground">{t('phone')}</p>

            <p className="font-medium">{data.settings.phone ?? '—'}</p>

          </div>

          <div className="sm:col-span-2">

            <p className="text-muted-foreground">{t('address')}</p>

            <p className="font-medium">{data.settings.address ?? '—'}</p>

          </div>

        </div>



        <Separator />



        <div>

          <h3 className="mb-3 font-medium">{tSettings('brandingTitle')}</h3>

          <div className="grid gap-3 sm:grid-cols-2">

            <div>

              <p className="text-muted-foreground">{tSettings('logoUrl')}</p>

              <p className="font-medium break-all">

                {data.settings.logoUrl ?? '—'}

              </p>

            </div>

            <div>

              <p className="text-muted-foreground">{tSettings('bannerUrl')}</p>

              <p className="font-medium break-all">

                {data.settings.bannerUrl ?? '—'}

              </p>

            </div>

            <div>

              <p className="text-muted-foreground">{tSettings('brandColor')}</p>

              <div className="mt-1 flex items-center gap-2">

                {data.settings.brandColor ? (

                  <>

                    <span

                      className="size-5 rounded border"

                      style={{ backgroundColor: data.settings.brandColor }}

                    />

                    <span className="font-mono font-medium">

                      {data.settings.brandColor}

                    </span>

                  </>

                ) : (

                  <span className="font-medium">—</span>

                )}

              </div>

            </div>

          </div>

        </div>



        <Separator />



        <div>

          <h3 className="mb-3 font-medium">{tSettings('policyTitle')}</h3>

          <div className="grid gap-3 sm:grid-cols-2">

            <div>

              <p className="text-muted-foreground">{t('slotLockMinutes')}</p>

              <p className="font-medium">{data.policies.slotLockMinutes}</p>

            </div>

            <div>

              <p className="text-muted-foreground">{t('commissionPercent')}</p>

              <p className="font-medium">{data.policies.commissionPercent}%</p>

            </div>

            <div>

              <p className="text-muted-foreground">

                {tSettings('cancelHoursBefore')}

              </p>

              <p className="font-medium">{data.policies.cancelHoursBefore}</p>

            </div>

            <div>

              <p className="text-muted-foreground">

                {tSettings('rescheduleHoursBefore')}

              </p>

              <p className="font-medium">

                {data.policies.rescheduleHoursBefore}

              </p>

            </div>

          </div>

        </div>

      </CardContent>

    </Card>

  );

}



export function TenantEditPage({ id }: { id: number }) {

  const t = useTranslations('entities.tenants');

  const tSettings = useTranslations('adminSettings');

  const tCommon = useTranslations('common');

  const tTable = useTranslations('table');

  const router = useRouter();

  const { can } = useAuthPermissions();

  const { data, isLoading } = useTenant(id);

  const updateTenant = useUpdateTenant();

  const { data: tenantsList } = useTenants({ page: 1, limit: 100 });

  const brandRoots = (tenantsList?.items ?? []).filter(
    (tenant) => tenant.parentTenantId == null && tenant.id !== id,
  );



  const schema = useMemo(() => updateTenantSchema(), []);



  const form = useForm<UpdateTenantFormValues>({

    resolver: zodResolver(schema),

    defaultValues: {},

  });



  useEffect(() => {

    if (!data) return;

    form.reset({

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

    });

  }, [data, form]);



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



  if (isLoading) {

    return <Skeleton className="mx-auto h-64 max-w-lg" />;

  }



  if (!data) {

    return <p className="text-muted-foreground text-sm">{tCommon('notFound')}</p>;

  }



  return (

    <>

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

              <FormField

                control={form.control}

                name="slotLockMinutes"

                render={({ field }) => (

                  <FormItem>

                    <FormLabel>{t('slotLockMinutes')}</FormLabel>

                    <FormControl>

                      <Input

                        type="number"

                        {...field}

                        onChange={(e) =>

                          field.onChange(e.target.valueAsNumber || 0)

                        }

                      />

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

                        {...field}

                        onChange={(e) =>

                          field.onChange(e.target.valueAsNumber || 0)

                        }

                      />

                    </FormControl>

                  </FormItem>

                )}

              />

              <FormField

                control={form.control}

                name="cancelHoursBefore"

                render={({ field }) => (

                  <FormItem>

                    <FormLabel>{tSettings('cancelHoursBefore')}</FormLabel>

                    <FormControl>

                      <Input

                        type="number"

                        {...field}

                        onChange={(e) =>

                          field.onChange(e.target.valueAsNumber || 0)

                        }

                      />

                    </FormControl>

                  </FormItem>

                )}

              />

              <FormField

                control={form.control}

                name="rescheduleHoursBefore"

                render={({ field }) => (

                  <FormItem>

                    <FormLabel>{tSettings('rescheduleHoursBefore')}</FormLabel>

                    <FormControl>

                      <Input

                        type="number"

                        {...field}

                        onChange={(e) =>

                          field.onChange(e.target.valueAsNumber || 0)

                        }

                      />

                    </FormControl>

                  </FormItem>

                )}

              />

            </div>



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

    <TenantContractForm tenantId={id} />

    </>

  );

}

