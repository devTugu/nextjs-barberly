'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  type PlanTier,
  useTenantContract,
  useUpsertTenantContract,
} from '@/entities/tenant';
import { useAuthPermissions } from '@/entities/session';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { getErrorMessage } from '@/shared/api';
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
import { Skeleton } from '@/shared/ui/skeleton';

const contractSchema = z.object({
  planTier: z.enum(['starter', 'pro', 'enterprise']),
  monthlyFee: z.number().min(0),
  platformCommissionPercent: z.number().min(0).max(100),
  depositPercentOverride: z
    .union([z.number().int().min(1).max(100), z.literal('')])
    .optional(),
});

type ContractFormValues = z.infer<typeof contractSchema>;

interface TenantContractFormProps {
  tenantId: number;
}

export function TenantContractForm({ tenantId }: TenantContractFormProps) {
  const t = useTranslations('entities.tenants');
  const tCommon = useTranslations('common');
  const { can } = useAuthPermissions();
  const { data, isLoading } = useTenantContract(tenantId);
  const upsertContract = useUpsertTenantContract(tenantId);

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      planTier: 'starter',
      monthlyFee: 0,
      platformCommissionPercent: 10,
      depositPercentOverride: '',
    },
  });

  useEffect(() => {
    if (!data) return;
    form.reset({
      planTier: data.planTier as PlanTier,
      monthlyFee: data.monthlyFee,
      platformCommissionPercent: data.platformCommissionPercent,
      depositPercentOverride: data.depositPercentOverride ?? '',
    });
  }, [data, form]);

  const canSubmit = can(PERMISSION_CODES.TENANT_UPDATE);

  const onSubmit = async (values: ContractFormValues) => {
    try {
      await upsertContract.mutateAsync({
        planTier: values.planTier,
        monthlyFee: values.monthlyFee,
        platformCommissionPercent: values.platformCommissionPercent,
        depositPercentOverride:
          values.depositPercentOverride === '' ||
          values.depositPercentOverride === undefined
            ? null
            : values.depositPercentOverride,
      });
      toast.success(tCommon('changesSaved'));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (isLoading) {
    return <Skeleton className="mx-auto mt-4 h-64 max-w-lg" />;
  }

  return (
    <Card className="mx-auto mt-4 max-w-lg">
      <CardHeader>
        <CardTitle>{t('contractTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="planTier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('planTier')}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="starter">{t('planStarter')}</SelectItem>
                      <SelectItem value="pro">{t('planPro')}</SelectItem>
                      <SelectItem value="enterprise">
                        {t('planEnterprise')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="monthlyFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('monthlyFee')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
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
            <FormField
              control={form.control}
              name="platformCommissionPercent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('platformCommissionPercent')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={100}
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
            <FormField
              control={form.control}
              name="depositPercentOverride"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('depositPercentOverride')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      placeholder={t('depositPercentOverridePlaceholder')}
                      value={field.value === '' ? '' : field.value}
                      onChange={(e) => {
                        const raw = e.target.value;
                        field.onChange(
                          raw === '' ? '' : e.target.valueAsNumber || 0,
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {canSubmit ? (
              <Button type="submit" disabled={upsertContract.isPending}>
                {upsertContract.isPending ? (
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
