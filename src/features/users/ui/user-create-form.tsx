'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import {
  createUserSchema,
  type CreateUserFormValues,
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

interface UserCreateFormProps {
  formId: string;
  onSubmit: (values: CreateUserFormValues) => void;
}

export function UserCreateForm({ formId, onSubmit }: UserCreateFormProps) {
  const t = useTranslations('entities.users');
  const tAuth = useTranslations('auth');
  const tVal = useTranslations('validation');
  const schema = useMemo(
    () =>
      createUserSchema({
        invalidEmail: tVal('invalidEmail'),
        passwordMinLength: tVal('passwordMinLength'),
      }),
    [tVal],
  );
  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', isActive: true },
  });

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tAuth('email')}</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tAuth('password')}</FormLabel>
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
