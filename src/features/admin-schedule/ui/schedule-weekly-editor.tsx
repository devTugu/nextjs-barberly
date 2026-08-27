'use client';
import { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  useCreateStaffShift,
  useDeleteStaffShift,
  useStaffShifts,
  useUpdateStaffShift,
} from '@/entities/schedule';
import { useStaffList } from '@/entities/staff';
import { useMe } from '@/entities/user';
import { useAuthPermissions } from '@/entities/session';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { getErrorMessage } from '@/shared/api';
import { cn } from '@/shared/lib/utils';
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
import { Switch } from '@/shared/ui/switch';
import {
  WEEKLY_DAY_KEYS as DAY_KEYS,
  buildDayDrafts,
  toApiTime,
  type ScheduleBlockDraft,
  type ScheduleDayDraft,
} from './schedule-weekly-draft';
export function ScheduleWeeklyEditor({
  staffId: externalStaffId,
  hideStaffSelector = false,
}: { staffId?: number; hideStaffSelector?: boolean } = {}) {
  const t = useTranslations('entities.schedule');
  const tCommon = useTranslations('common');
  const tenant = useTenantSubdomain();
  const { can, isStaff } = useAuthPermissions();
  const { data: me } = useMe();
  const staffQuery = useStaffList(tenant);
  const [staffId, setStaffId] = useState<number>(0);
  const lockedStaffId = isStaff ? me?.staffMemberId ?? 0 : 0;
  const activeStaffId =
    externalStaffId ?? (lockedStaffId || staffId || staffQuery.data?.[0]?.id || 0);
  const shiftsQuery = useStaffShifts(tenant, activeStaffId, activeStaffId > 0);
  const createShift = useCreateStaffShift(tenant, activeStaffId);
  const updateShift = useUpdateStaffShift(tenant, activeStaffId);
  const deleteShift = useDeleteStaffShift(tenant, activeStaffId);
  const [drafts, setDrafts] = useState<Record<number, ScheduleDayDraft>>({});
  const [savingDay, setSavingDay] = useState<number | null>(null);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const shifts = useMemo(() => shiftsQuery.data ?? [], [shiftsQuery.data]);
  useEffect(() => {
    setDrafts(buildDayDrafts(shifts));
  }, [activeStaffId, shifts]);
  const canUpdate =
    can(PERMISSION_CODES.SCHEDULE_CREATE) ||
    can(PERMISSION_CODES.SCHEDULE_UPDATE);
  const handleStaffChange = (value: string) => {
    setStaffId(Number(value));
    setDrafts({});
  };
  const updateDay = (day: number, patch: Partial<ScheduleDayDraft>) => {
    setDrafts((prev) => {
      const base = Object.keys(prev).length ? prev : buildDayDrafts(shifts);
      return { ...base, [day]: { ...base[day], ...patch } };
    });
  };
  const updateBlock = (
    day: number,
    index: number,
    field: keyof ScheduleBlockDraft,
    value: string,
  ) => {
    setDrafts((prev) => {
      const base = Object.keys(prev).length ? prev : buildDayDrafts(shifts);
      const blocks = [...base[day].blocks];
      blocks[index] = { ...blocks[index], [field]: value };
      return { ...base, [day]: { ...base[day], blocks } };
    });
  };
  const addBlock = (day: number) => {
    setDrafts((prev) => {
      const base = Object.keys(prev).length ? prev : buildDayDrafts(shifts);
      return {
        ...base,
        [day]: {
          ...base[day],
          blocks: [...base[day].blocks, { startTime: '13:00', endTime: '17:00' }],
        },
      };
    });
  };
  const removeBlock = (day: number, index: number) => {
    setDrafts((prev) => {
      const base = Object.keys(prev).length ? prev : buildDayDrafts(shifts);
      const blocks = base[day].blocks.filter((_, i) => i !== index);
      return {
        ...base,
        [day]: {
          ...base[day],
          blocks: blocks.length ? blocks : [{ startTime: '09:00', endTime: '18:00' }],
        },
      };
    });
  };
  const saveDay = async (day: number, options?: { silent?: boolean }) => {
    const draft = drafts[day];
    if (!draft || activeStaffId <= 0) return;
    setSavingDay(day);
    try {
      const existing = shifts.filter((s) => s.dayOfWeek === day);
      if (!draft.enabled) {
        await Promise.all(existing.map((s) => deleteShift.mutateAsync(s.id)));
      } else {
        const keptIds = new Set(
          draft.blocks.map((b) => b.id).filter((id): id is number => id != null),
        );
        const toDelete = existing.filter((s) => !keptIds.has(s.id));
        await Promise.all(toDelete.map((s) => deleteShift.mutateAsync(s.id)));
        for (const block of draft.blocks) {
          const payload = {
            dayOfWeek: day,
            startTime: toApiTime(block.startTime),
            endTime: toApiTime(block.endTime),
          };
          if (block.id) {
            await updateShift.mutateAsync({ id: block.id, ...payload });
          } else {
            await createShift.mutateAsync(payload);
          }
        }
      }
      if (!options?.silent) {
        toast.success(t('daySaved', { day: t(`days.${DAY_KEYS[day - 1]}`) }));
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    } finally {
      setSavingDay(null);
    }
  };
  const saveAllDays = async () => {
    if (!canUpdate || activeStaffId <= 0) return;
    setSavingAll(true);
    try {
      for (let day = 1; day <= 7; day += 1) {
        await saveDay(day, { silent: true });
      }
      toast.success(t('saveAll'));
    } catch {
      // saveDay already toasts
    } finally {
      setSavingAll(false);
    }
  };
  if (staffQuery.isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }
  const staff = staffQuery.data ?? [];
  if (staff.length === 0) {
    return <p className="text-muted-foreground text-sm">{t('noStaff')}</p>;
  }
  const selectedId = activeStaffId;
  if (selectedId <= 0) {
    return <Skeleton className="h-64 w-full" />;
  }
  const selectedStaff = staff.find((member) => member.id === selectedId);
  return (
    <>
      <div className="space-y-4 px-4 pb-24 md:hidden">
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/80 p-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-lg font-semibold">
            {selectedStaff?.displayName?.charAt(0) ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold">{selectedStaff?.displayName}</p>
            <p className="text-sm text-muted-foreground">{t('staffMember')}</p>
          </div>
        </div>
        {!hideStaffSelector && !isStaff && staff.length > 1 ? (
          <Select value={String(selectedId)} onValueChange={handleStaffChange}>
            <SelectTrigger>
              <SelectValue placeholder={t('selectStaff')} />
            </SelectTrigger>
            <SelectContent>
              {staff.map((member) => (
                <SelectItem key={member.id} value={String(member.id)}>
                  {member.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
        {shiftsQuery.isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          DAY_KEYS.map((dayKey, index) => {
            const day = index + 1;
            const draft = drafts[day];
            const isEditing = editingDay === day;
            return (
              <div
                key={day}
                className={cn(
                  'rounded-2xl border border-border/60 bg-card/80 p-3 space-y-3',
                  isEditing && 'border-[var(--brand-primary,#3b82f6)] ring-1 ring-[var(--brand-primary,#3b82f6)]/40',
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="w-10 shrink-0 text-sm font-medium">
                    {t(`daysShort.${dayKey}`)}
                  </span>
                  <Switch
                    checked={draft?.enabled ?? false}
                    onCheckedChange={(checked) =>
                      updateDay(day, { enabled: checked })
                    }
                    disabled={!canUpdate}
                  />
                  {!draft?.enabled ? (
                    <span className="text-sm text-muted-foreground">{t('resting')}</span>
                  ) : null}
                  {isEditing ? (
                    <span className="ml-auto text-xs text-[var(--brand-primary,#3b82f6)]">
                      {t('editing')}
                    </span>
                  ) : null}
                </div>
                {draft?.enabled ? (
                  <div className="space-y-2 pl-13">
                    {draft.blocks.map((block, blockIndex) => (
                      <div
                        key={`${day}-mobile-${blockIndex}-${block.id ?? 'new'}`}
                        className="flex items-center gap-2"
                      >
                        <Input
                          type="time"
                          value={block.startTime}
                          onFocus={() => setEditingDay(day)}
                          onChange={(e) => {
                            setEditingDay(day);
                            updateBlock(day, blockIndex, 'startTime', e.target.value);
                          }}
                          disabled={!canUpdate}
                          className="h-9"
                        />
                        <span className="text-muted-foreground">–</span>
                        <Input
                          type="time"
                          value={block.endTime}
                          onFocus={() => setEditingDay(day)}
                          onChange={(e) => {
                            setEditingDay(day);
                            updateBlock(day, blockIndex, 'endTime', e.target.value);
                          }}
                          disabled={!canUpdate}
                          className="h-9"
                        />
                        {canUpdate && draft.blocks.length > 1 ? (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removeBlock(day, blockIndex)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        ) : null}
                      </div>
                    ))}
                    {canUpdate ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2"
                        onClick={() => {
                          setEditingDay(day);
                          addBlock(day);
                        }}
                      >
                        <Plus className="mr-1 size-4" />
                        {t('addBlock')}
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
      {canUpdate ? (
        <div
          className="fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 border-t border-border/60 bg-card/95 p-4 backdrop-blur md:hidden"
        >
          <Button
            className="h-12 w-full text-base"
            disabled={savingAll || savingDay !== null}
            onClick={() => void saveAllDays()}
          >
            {savingAll ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              t('saveAll')
            )}
          </Button>
        </div>
      ) : null}
    <Card className="hidden md:block">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>{t('weeklyTitle')}</CardTitle>
        <div className="w-full max-w-xs">
          {!hideStaffSelector ? (
            <>
          <Label className="sr-only">{t('staffMember')}</Label>
          {isStaff && lockedStaffId ? (
            <p className="text-sm font-medium">
              {staff.find((member) => member.id === lockedStaffId)?.displayName ??
                t('staffMember')}
            </p>
          ) : (
            <Select value={String(selectedId)} onValueChange={handleStaffChange}>
            <SelectTrigger>
              <SelectValue placeholder={t('selectStaff')} />
            </SelectTrigger>
            <SelectContent>
              {staff.map((member) => (
                <SelectItem key={member.id} value={String(member.id)}>
                  {member.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          )}
            </>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {shiftsQuery.isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          DAY_KEYS.map((dayKey, index) => {
            const day = index + 1;
            const draft = drafts[day];
            return (
              <div key={day} className="rounded-lg border p-3 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{t(`days.${dayKey}`)}</span>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`day-${day}-active`} className="text-sm">
                      {draft?.enabled ? t('working') : t('dayOff')}
                    </Label>
                    <Switch
                      id={`day-${day}-active`}
                      checked={draft?.enabled ?? false}
                      onCheckedChange={(checked) =>
                        updateDay(day, { enabled: checked })
                      }
                      disabled={!canUpdate}
                    />
                  </div>
                </div>
                {draft?.enabled ? (
                  <div className="space-y-2">
                    {draft.blocks.map((block, blockIndex) => (
                      <div
                        key={`${day}-${blockIndex}-${block.id ?? 'new'}`}
                        className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
                      >
                        <Input
                          type="time"
                          value={block.startTime}
                          onChange={(e) =>
                            updateBlock(day, blockIndex, 'startTime', e.target.value)
                          }
                          disabled={!canUpdate}
                        />
                        <Input
                          type="time"
                          value={block.endTime}
                          onChange={(e) =>
                            updateBlock(day, blockIndex, 'endTime', e.target.value)
                          }
                          disabled={!canUpdate}
                        />
                        {canUpdate && draft.blocks.length > 1 ? (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removeBlock(day, blockIndex)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        ) : (
                          <span />
                        )}
                      </div>
                    ))}
                    {canUpdate ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => addBlock(day)}
                      >
                        <Plus className="mr-1 size-4" />
                        {t('addBlock')}
                      </Button>
                    ) : null}
                  </div>
                ) : null}
                {canUpdate ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={savingDay === day}
                    onClick={() => void saveDay(day)}
                  >
                    {savingDay === day ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      tCommon('save')
                    )}
                  </Button>
                ) : null}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
    </>
  );
}
