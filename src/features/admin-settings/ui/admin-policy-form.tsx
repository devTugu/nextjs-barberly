'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { z } from 'zod';
import { useMyTenant, useUpdateMyTenant } from '@/entities/tenant';
import { useAuthPermissions } from '@/features/auth';
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
import { InheritOverrideToggle } from './inherit-override-toggle';

const policySchema = z.object({
  slotLockMinutes: z.number().int().min(1).max(60),
  cancelHoursBefore: z.number().int().min(0),
  rescheduleHoursBefore: z.number().int().min(0),
  depositPercent: z.number().int().min(1).max(100),
});

type PolicyFormValues = z.infer<typeof policySchema>;

export function AdminPolicyForm() {
  const t = useTranslations('adminSettings');
  const tCommon = useTranslations('common');
  const tenant = useTenantSubdomain();
  const { can } = useAuthPermissions();
  const { data, isLoading } = useMyTenant(tenant);
  const updateTenant = useUpdateMyTenant(tenant);

  const isChild = Boolean(data?.inheritance?.isChild);
  const [inheritCancel, setInheritCancel] = useState(true);
  const [inheritReschedule, setInheritReschedule] = useState(true);
  const [inheritDeposit, setInheritDeposit] = useState(true);

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      slotLockMinutes: 15,
      cancelHoursBefore: 24,
      rescheduleHoursBefore: 24,
      depositPercent: 50,
    },
  });

  useEffect(() => {
    if (!data) return;
    const own = data.inheritance?.own;
    setInheritCancel(isChild && own?.cancelHoursBefore == null);
    setInheritReschedule(isChild && own?.rescheduleHoursBefore == null);
    setInheritDeposit(isChild && own?.depositPercent == null);
    form.reset({
      slotLockMinutes: data.policies.slotLockMinutes,
      cancelHoursBefore: data.policies.cancelHoursBefore,
      rescheduleHoursBefore: data.policies.rescheduleHoursBefore,
      depositPercent: data.policies.depositPercent ?? 50,
    });
  }, [data, form, isChild]);

  const canSubmit = can(PERMISSION_CODES.TENANT_SETTINGS_UPDATE);

  const onSubmit = async (values: PolicyFormValues) => {
    try {
      await updateTenant.mutateAsync({
        slotLockMinutes: values.slotLockMinutes,
        cancelHoursBefore: inheritCancel ? null : values.cancelHoursBefore,
        rescheduleHoursBefore: inheritReschedule
          ? null
          : values.rescheduleHoursBefore,
        depositPercent: inheritDeposit ? null : values.depositPercent,
      });
      toast.success(tCommon('changesSaved'));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full max-w-lg" />;
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>{t('policyTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="slotLockMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('slotLockMinutes')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={60}
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.valueAsNumber || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <InheritOverrideToggle
                isChild={isChild}
                inherited={inheritCancel}
                disabled={!canSubmit}
                onChange={(inherit) => {
                  setInheritCancel(inherit);
                  if (inherit && data) {
                    form.setValue(
                      'cancelHoursBefore',
                      data.policies.cancelHoursBefore,
                    );
                  }
                }}
              />
              <FormField
                control={form.control}
                name="cancelHoursBefore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('cancelHoursBefore')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        disabled={inheritCancel}
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-2">
              <InheritOverrideToggle
                isChild={isChild}
                inherited={inheritReschedule}
                disabled={!canSubmit}
                onChange={(inherit) => {
                  setInheritReschedule(inherit);
                  if (inherit && data) {
                    form.setValue(
                      'rescheduleHoursBefore',
                      data.policies.rescheduleHoursBefore,
                    );
                  }
                }}
              />
              <FormField
                control={form.control}
                name="rescheduleHoursBefore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('rescheduleHoursBefore')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        disabled={inheritReschedule}
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-2">
              <InheritOverrideToggle
                isChild={isChild}
                inherited={inheritDeposit}
                disabled={!canSubmit}
                onChange={(inherit) => {
                  setInheritDeposit(inherit);
                  if (inherit && data) {
                    form.setValue(
                      'depositPercent',
                      data.policies.depositPercent ?? 50,
                    );
                  }
                }}
              />
              <FormField
                control={form.control}
                name="depositPercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('depositPercent')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        disabled={inheritDeposit}
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
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
  );
}
