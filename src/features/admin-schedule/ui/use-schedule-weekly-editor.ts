'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import {
  WEEKLY_DAY_KEYS,
  buildDayDrafts,
  toApiTime,
  type ScheduleBlockDraft,
  type ScheduleDayDraft,
} from './schedule-weekly-draft';

export function useScheduleWeeklyEditor({
  staffId: externalStaffId,
  hideStaffSelector = false,
}: { staffId?: number; hideStaffSelector?: boolean } = {}) {
  const t = useTranslations('entities.schedule');
  const tenant = useTenantSubdomain();
  const { can, isStaff } = useAuthPermissions();
  const { data: me } = useMe();
  const staffQuery = useStaffList(tenant);
  const [staffId, setStaffId] = useState(0);
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

  const withBase = (
    updater: (base: Record<number, ScheduleDayDraft>) => Record<number, ScheduleDayDraft>,
  ) => {
    setDrafts((prev) =>
      updater(Object.keys(prev).length ? prev : buildDayDrafts(shifts)),
    );
  };

  const handleStaffChange = (value: string) => {
    setStaffId(Number(value));
    setDrafts({});
  };

  const updateDay = (day: number, patch: Partial<ScheduleDayDraft>) => {
    withBase((base) => ({ ...base, [day]: { ...base[day], ...patch } }));
  };

  const updateBlock = (
    day: number,
    index: number,
    field: keyof ScheduleBlockDraft,
    value: string,
  ) => {
    withBase((base) => {
      const blocks = [...base[day].blocks];
      blocks[index] = { ...blocks[index], [field]: value };
      return { ...base, [day]: { ...base[day], blocks } };
    });
  };

  const addBlock = (day: number) => {
    withBase((base) => ({
      ...base,
      [day]: {
        ...base[day],
        blocks: [...base[day].blocks, { startTime: '13:00', endTime: '17:00' }],
      },
    }));
  };

  const removeBlock = (day: number, index: number) => {
    withBase((base) => {
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
      const existing = shifts.filter((shift) => shift.dayOfWeek === day);
      if (!draft.enabled) {
        await Promise.all(existing.map((shift) => deleteShift.mutateAsync(shift.id)));
      } else {
        const keptIds = new Set(
          draft.blocks.map((block) => block.id).filter((id): id is number => id != null),
        );
        await Promise.all(
          existing
            .filter((shift) => !keptIds.has(shift.id))
            .map((shift) => deleteShift.mutateAsync(shift.id)),
        );
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
        toast.success(t('daySaved', { day: t(`days.${WEEKLY_DAY_KEYS[day - 1]}`) }));
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
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
      /* saveDay already toasts */
    } finally {
      setSavingAll(false);
    }
  };

  return {
    t,
    hideStaffSelector,
    isStaff,
    lockedStaffId,
    canUpdate,
    drafts,
    savingDay,
    editingDay,
    setEditingDay,
    savingAll,
    staffQuery,
    shiftsQuery,
    staff: staffQuery.data ?? [],
    selectedId: activeStaffId,
    handleStaffChange,
    updateDay,
    updateBlock,
    addBlock,
    removeBlock,
    saveDay,
    saveAllDays,
  };
}

export type ScheduleWeeklyEditorModel = ReturnType<typeof useScheduleWeeklyEditor>;
