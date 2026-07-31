'use client';

import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  useCreateTenantHoliday,
  useDeleteTenantHoliday,
  useTenantHolidays,
} from '@/entities/schedule';
import { ScheduleDeleteButton } from '@/features/admin-schedule/ui/schedule-delete-button';
import {
  canManageSchedule,
  defaultScheduleRange,
} from '@/features/admin-schedule/ui/schedule-tenant-shared';
import { useAuthPermissions } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { getErrorMessage } from '@/shared/api';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Skeleton } from '@/shared/ui/skeleton';

export function ScheduleTenantHolidaysPanel() {
  const t = useTranslations('entities.schedule');
  const tCommon = useTranslations('common');
  const tenant = useTenantSubdomain();
  const { can } = useAuthPermissions();
  const range = useMemo(() => defaultScheduleRange(), []);
  const holidaysQuery = useTenantHolidays(tenant, range);
  const createHoliday = useCreateTenantHoliday(tenant);
  const deleteHoliday = useDeleteTenantHoliday(tenant);
  const [localDate, setLocalDate] = useState('');
  const [name, setName] = useState('');

  const canCreate = canManageSchedule(can);
  const canDelete = can(PERMISSION_CODES.SCHEDULE_DELETE);

  const handleCreate = async () => {
    if (!localDate || !name) return;
    try {
      await createHoliday.mutateAsync({ localDate, name });
      toast.success(t('holidaySaved'));
      setLocalDate('');
      setName('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('holidaysTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {holidaysQuery.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : holidaysQuery.data?.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('noHolidays')}</p>
          ) : (
            holidaysQuery.data?.map((row) => (
              <div
                key={row.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{row.localDate}</p>
                  <p className="text-muted-foreground text-sm">{row.name}</p>
                </div>
                {canDelete ? (
                  <ScheduleDeleteButton
                    title={t('deleteHolidayTitle')}
                    description={t('deleteHolidayDescription', {
                      name: row.name,
                      date: row.localDate,
                    })}
                    onConfirm={() => deleteHoliday.mutateAsync(row.id)}
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
            <CardTitle>{t('addHoliday')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('overrideDate')}</Label>
              <Input type="date" value={localDate} onChange={(e) => setLocalDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t('holidayName')}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <Button
              className="sm:col-span-2 w-fit"
              disabled={createHoliday.isPending}
              onClick={() => void handleCreate()}
            >
              {createHoliday.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              {tCommon('save')}
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
