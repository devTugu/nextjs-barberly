"use client";

import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { CreateUserFormValues } from "@/entities/user";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";

interface UserCreateFormProps {
  form: UseFormReturn<CreateUserFormValues>;
  formId: string;
  onSubmit: (values: CreateUserFormValues) => void;
}

export function UserCreateForm({
  form,
  formId,
  onSubmit,
}: UserCreateFormProps) {
  const t = useTranslations("entities.users");
  const tAuth = useTranslations("auth");

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tAuth("email")}</FormLabel>
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
              <FormLabel>{tAuth("password")}</FormLabel>
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
                <FormLabel>{t("activeAccount")}</FormLabel>
                <p className="text-xs text-muted-foreground">
                  {t("activeAccountHint")}
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
