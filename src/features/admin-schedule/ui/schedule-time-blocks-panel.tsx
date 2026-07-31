'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  useCreateStaffTimeBlock,
  useDeleteStaffTimeBlock,
  useStaffTimeBlocks,
} from '@/entities/schedule';
import { ScheduleDeleteButton } from '@/features/admin-schedule/ui/schedule-delete-button';
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

const timeBlockSchema = z
  .object({
    startAtUtc: z.string().min(1),
    endAtUtc: z.string().min(1),
    reason: z.string().optional(),
  })
  .refine((v) => new Date(v.endAtUtc) > new Date(v.startAtUtc), {
    message: 'End must be after start',
    path: ['endAtUtc'],
  });

type TimeBlockFormValues = z.infer<typeof timeBlockSchema>;

function defaultRange(): { from: string; to: string } {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 3, 0, 23, 59, 59),
  );
  return { from: start.toISOString(), to: end.toISOString() };
}

type Props = { staffId: number };

export function ScheduleTimeBlocksPanel({ staffId }: Props) {
  const t = useTranslations('entities.schedule');
  const tCommon = useTranslations('common');
  const tenant = useTenantSubdomain();
  const { can } = useAuthPermissions();
  const range = useMemo(() => defaultRange(), []);
  const blocksQuery = useStaffTimeBlocks(tenant, staffId, range, staffId > 0);
  const createBlock = useCreateStaffTimeBlock(tenant, staffId);
  const deleteBlock = useDeleteStaffTimeBlock(tenant, staffId);

  const form = useForm<TimeBlockFormValues>({
    resolver: zodResolver(timeBlockSchema),
    defaultValues: { startAtUtc: '', endAtUtc: '', reason: '' },
  });

  const canCreate =
    can(PERMISSION_CODES.SCHEDULE_CREATE) ||
    can(PERMISSION_CODES.SCHEDULE_UPDATE);
  const canDelete = can(PERMISSION_CODES.SCHEDULE_DELETE);

  const onSubmit = async (values: TimeBlockFormValues) => {
    try {
      await createBlock.mutateAsync({
        startAtUtc: new Date(values.startAtUtc).toISOString(),
        endAtUtc: new Date(values.endAtUtc).toISOString(),
        reason: values.reason,
      });
      toast.success(t('timeBlockCreated'));
      form.reset();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (staffId <= 0) {
    return <p className="text-muted-foreground text-sm">{t('selectStaff')}</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('timeBlocksTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {blocksQuery.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : blocksQuery.data?.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('noTimeBlocks')}</p>
          ) : (
            blocksQuery.data?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">
                    {new Date(item.startAtUtc).toLocaleString()} –{' '}
                    {new Date(item.endAtUtc).toLocaleString()}
                  </p>
                  {item.reason ? (
                    <p className="text-muted-foreground text-sm">{item.reason}</p>
                  ) : null}
                </div>
                {canDelete ? (
                  <ScheduleDeleteButton
                    title={t('deleteTimeBlockTitle')}
                    description={t('deleteTimeBlockDescription')}
                    onConfirm={() => deleteBlock.mutateAsync(item.id)}
                  />
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {canCreate ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('addTimeBlock')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-4 sm:grid-cols-2"
              >
                <FormField
                  control={form.control}
                  name="startAtUtc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('startAt')}</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endAtUtc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('endAt')}</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>{t('reason')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={createBlock.isPending}
                  className="sm:col-span-2 w-fit"
                >
                  {createBlock.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  {tCommon('create')}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
