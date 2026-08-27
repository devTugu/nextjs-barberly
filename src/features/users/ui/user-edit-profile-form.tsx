'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import {
  updateUserSchema,
  type UpdateUserFormValues,
} from '@/entities/user';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import { Switch } from '@/shared/ui/switch';

interface UserEditProfileFormProps {
  formId: string;
  email: string;
  isActive: boolean;
  onSubmit: (values: UpdateUserFormValues) => void;
}

export function UserEditProfileForm({
  formId,
  email,
  isActive,
  onSubmit,
}: UserEditProfileFormProps) {
  const t = useTranslations('entities.users');
  const tAuth = useTranslations('auth');
  const tVal = useTranslations('validation');
  const schema = useMemo(
    () =>
      updateUserSchema({
        invalidEmail: tVal('invalidEmail'),
        passwordMinLength: tVal('passwordMinLength'),
      }),
    [tVal],
  );
  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', isActive },
  });

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormItem>
          <FormLabel>{tAuth('email')}</FormLabel>
          <Input value={email} disabled readOnly />
        </FormItem>
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('newPasswordOptional')}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-md border p-3">
              <div className="space-y-0.5">
                <FormLabel>{t('activeAccount')}</FormLabel>
                <p className="text-xs text-muted-foreground">
                  {t('activeAccountHint')}
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
