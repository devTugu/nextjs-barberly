'use client';

import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
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

export function ScheduleWeeklyMobile({
  model,
}: {
  model: ScheduleWeeklyEditorModel;
}) {
  const t = useTranslations('entities.schedule');
  const {
    hideStaffSelector,
    isStaff,
    canUpdate,
    drafts,
    editingDay,
    setEditingDay,
    savingAll,
    savingDay,
    shiftsQuery,
    staff,
    selectedId,
    handleStaffChange,
    updateDay,
    updateBlock,
    addBlock,
    removeBlock,
    saveAllDays,
  } = model;
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
                  isEditing &&
                    'border-[var(--brand-primary,#3b82f6)] ring-1 ring-[var(--brand-primary,#3b82f6)]/40',
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
                    <span className="text-sm text-muted-foreground">
                      {t('resting')}
                    </span>
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
                          onChange={(event) => {
                            setEditingDay(day);
                            updateBlock(day, blockIndex, 'startTime', event.target.value);
                          }}
                          disabled={!canUpdate}
                          className="h-9"
                        />
                        <span className="text-muted-foreground">–</span>
                        <Input
                          type="time"
                          value={block.endTime}
                          onFocus={() => setEditingDay(day)}
                          onChange={(event) => {
                            setEditingDay(day);
                            updateBlock(day, blockIndex, 'endTime', event.target.value);
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
        <div className="fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 border-t border-border/60 bg-card/95 p-4 backdrop-blur md:hidden">
          <Button
            className="h-12 w-full text-base"
            disabled={savingAll || savingDay !== null}
            onClick={() => void saveAllDays()}
          >
            {savingAll ? <Loader2 className="size-4 animate-spin" /> : t('saveAll')}
          </Button>
        </div>
      ) : null}
    </>
  );
}
