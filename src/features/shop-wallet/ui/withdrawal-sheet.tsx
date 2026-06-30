'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  withdrawSchema,
  type WithdrawFormValues,
  useRequestWithdrawal,
  useWalletBalance,
} from '@/entities/wallet';
import { useAuthPermissions } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { getErrorMessage } from '@/shared/api';
import { useShopTenant } from '@/shared/hooks/use-shop-tenant';
import { AdminFormSheet } from '@/widgets/admin-form-sheet';
import { Button } from '@/shared/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';

interface WithdrawalSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WithdrawalSheet({ open, onOpenChange }: WithdrawalSheetProps) {
  const t = useTranslations('entities.wallet');
  const tCommon = useTranslations('common');
  const tTable = useTranslations('table');
  const tVal = useTranslations('validation');
  const tenant = useShopTenant();
  const { can } = useAuthPermissions();
  const withdraw = useRequestWithdrawal(tenant);
  const { data: balance } = useWalletBalance(tenant);

  const schema = useMemo(
    () => withdrawSchema({ amountMin: tVal('required') }),
    [tVal],
  );

  const form = useForm<WithdrawFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 0, reference: '' },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({ amount: 0, reference: '' });
  }, [open, form]);

  if (!open) return null;

  const canSubmit = can(PERMISSION_CODES.WALLET_UPDATE);
  const formId = 'withdraw-form';
  const isPending = withdraw.isPending;

  const onSubmit = async (values: WithdrawFormValues) => {
    try {
      await withdraw.mutateAsync({
        amount: values.amount,
        reference: values.reference || undefined,
      });
      toast.success(t('toastWithdrawal'));
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const footer = canSubmit ? (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}
        disabled={isPending}
      >
        {tCommon('cancel')}
      </Button>
      <Button type="submit" form={formId} disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        {t('submitWithdrawal')}
      </Button>
    </div>
  ) : null;

  return (
    <AdminFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('withdrawTitle')}
      description={t('withdrawDescription', {
        balance: balance?.balance.toLocaleString() ?? '—',
      })}
      showContentLocale={false}
      footer={footer}
    >
      <Form {...form}>
        <form
          id={formId}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tTable('price')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
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
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('referenceLabel')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('referencePlaceholder')} {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </AdminFormSheet>
  );
}
