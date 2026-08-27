'use client';

import { Skeleton } from '@/shared/ui/skeleton';
import { ScheduleWeeklyDesktop } from './schedule-weekly-desktop';
import { ScheduleWeeklyMobile } from './schedule-weekly-mobile';
import { useScheduleWeeklyEditor } from './use-schedule-weekly-editor';

export function ScheduleWeeklyEditor({
  staffId,
  hideStaffSelector = false,
}: { staffId?: number; hideStaffSelector?: boolean } = {}) {
  const model = useScheduleWeeklyEditor({ staffId, hideStaffSelector });
  const t = model.t;

  if (model.staffQuery.isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }
  if (model.staff.length === 0) {
    return <p className="text-muted-foreground text-sm">{t('noStaff')}</p>;
  }
  if (model.selectedId <= 0) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <>
      <ScheduleWeeklyMobile model={model} />
      <ScheduleWeeklyDesktop model={model} />
    </>
  );
}
