'use client';

import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
import { WEEKLY_DAY_KEYS as DAY_KEYS } from './schedule-weekly-draft';
import type { ScheduleWeeklyEditorModel } from './use-schedule-weekly-editor';

export function ScheduleWeeklyDesktop({
  model,
}: {
  model: ScheduleWeeklyEditorModel;
}) {
  const t = useTranslations('entities.schedule');
  const tCommon = useTranslations('common');
  const {
    hideStaffSelector,
    isStaff,
    lockedStaffId,
    canUpdate,
    drafts,
    savingDay,
    shiftsQuery,
    staff,
    selectedId,
    handleStaffChange,
    updateDay,
    updateBlock,
    addBlock,
    removeBlock,
    saveDay,
  } = model;

  return (
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
                          onChange={(event) =>
                            updateBlock(day, blockIndex, 'startTime', event.target.value)
                          }
                          disabled={!canUpdate}
                        />
                        <Input
                          type="time"
                          value={block.endTime}
                          onChange={(event) =>
                            updateBlock(day, blockIndex, 'endTime', event.target.value)
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
  );
}
