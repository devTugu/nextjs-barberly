'use client';

import { useMemo, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  useCreateStaffDayException,
  useDeleteStaffDayException,
  useStaffDayExceptions,
} from '@/entities/schedule';
import { ScheduleDeleteButton } from './schedule-delete-button';
import { useAuthPermissions } from '@/entities/session';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { getErrorMessage } from '@/shared/api';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Skeleton } from '@/shared/ui/skeleton';

function defaultRange(): { from: string; to: string } {
  const now = new Date();
  const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const end = new Date(now.getFullYear(), now.getMonth() + 3, 0);
  const to = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
  return { from, to };
}

type Props = { staffId: number };

export function ScheduleDayExceptionsPanel({ staffId }: Props) {
  const t = useTranslations('entities.schedule');
  const tCommon = useTranslations('common');
  const tenant = useTenantSubdomain();
  const { can } = useAuthPermissions();
  const range = useMemo(() => defaultRange(), []);
  const exceptionsQuery = useStaffDayExceptions(
    tenant,
    staffId,
    range,
    staffId > 0,
  );
  const createException = useCreateStaffDayException(tenant, staffId);
  const deleteException = useDeleteStaffDayException(tenant, staffId);

  const [localDate, setLocalDate] = useState('');
  const [kind, setKind] = useState<'closed' | 'custom_hours'>('closed');
  const [reason, setReason] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('14:00');
  const [block2Start, setBlock2Start] = useState('16:00');
  const [block2End, setBlock2End] = useState('18:00');
  const [useSecondBlock, setUseSecondBlock] = useState(false);

  const canCreate =
    can(PERMISSION_CODES.SCHEDULE_CREATE) ||
    can(PERMISSION_CODES.SCHEDULE_UPDATE);
  const canDelete = can(PERMISSION_CODES.SCHEDULE_DELETE);

  const handleCreate = async () => {
    if (!localDate) return;
    try {
      await createException.mutateAsync({
        localDate,
        kind,
        reason: reason || undefined,
        blocks:
          kind === 'custom_hours'
            ? useSecondBlock
              ? [
                  { startTime: `${startTime}:00`, endTime: `${endTime}:00` },
                  {
                    startTime: `${block2Start}:00`,
                    endTime: `${block2End}:00`,
                  },
                ]
              : [{ startTime: `${startTime}:00`, endTime: `${endTime}:00` }]
            : undefined,
      });
      toast.success(t('overrideSaved'));
      setLocalDate('');
      setReason('');
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
          <CardTitle>{t('dayExceptionsTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {exceptionsQuery.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : exceptionsQuery.data?.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('noDayExceptions')}</p>
          ) : (
            exceptionsQuery.data?.map((row) => (
              <div
                key={row.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{row.localDate}</p>
                  <p className="text-muted-foreground text-sm">
                    {row.kind === 'closed'
                      ? t('overrideClosed')
                      : row.blocks
                          .map((b) => `${b.startTime.slice(0, 5)}–${b.endTime.slice(0, 5)}`)
                          .join(', ')}
                  </p>
                  {row.reason ? (
                    <p className="text-muted-foreground text-sm">{row.reason}</p>
                  ) : null}
                </div>
                {canDelete ? (
                  <ScheduleDeleteButton
                    title={t('deleteExceptionTitle')}
                    description={t('deleteExceptionDescription', {
                      date: row.localDate,
                    })}
                    onConfirm={() => deleteException.mutateAsync(row.id)}
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
            <CardTitle>{t('addDayException')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('overrideDate')}</Label>
              <Input type="date" value={localDate} onChange={(e) => setLocalDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t('overrideKind')}</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as 'closed' | 'custom_hours')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="closed">{t('overrideClosed')}</SelectItem>
                  <SelectItem value="custom_hours">{t('overrideCustomHours')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t('reason')}</Label>
              <Input value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            {kind === 'custom_hours' ? (
              <>
                <div className="space-y-2">
                  <Label>{t('startTime')}</Label>
                  <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('endTime')}</Label>
                  <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="sm:col-span-2 w-fit"
                  onClick={() => setUseSecondBlock((v) => !v)}
                >
                  <Plus className="mr-2 size-4" />
                  {useSecondBlock ? t('singleBlock') : t('addBlock')}
                </Button>
                {useSecondBlock ? (
                  <>
                    <div className="space-y-2">
                      <Label>{t('startTime')} 2</Label>
                      <Input type="time" value={block2Start} onChange={(e) => setBlock2Start(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('endTime')} 2</Label>
                      <Input type="time" value={block2End} onChange={(e) => setBlock2End(e.target.value)} />
                    </div>
                  </>
                ) : null}
              </>
            ) : null}
            <Button
              className="sm:col-span-2 w-fit"
              disabled={createException.isPending}
              onClick={() => void handleCreate()}
            >
              {createException.isPending ? (
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
