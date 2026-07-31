'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ScheduleTemplate } from '@/entities/schedule';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Switch } from '@/shared/ui/switch';

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

type ShiftDraft = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

type Props = {
  template?: ScheduleTemplate | null;
  onSubmit: (values: {
    name: string;
    description?: string;
    shifts: Array<{ dayOfWeek: number; startTime: string; endTime: string }>;
  }) => Promise<void>;
  onCancel: () => void;
  pending?: boolean;
};

function toInputTime(value: string): string {
  return value.slice(0, 5);
}

function toApiTime(value: string): string {
  return value.length === 5 ? `${value}:00` : value;
}

function buildDrafts(template?: ScheduleTemplate | null): Record<number, ShiftDraft[]> {
  const drafts: Record<number, ShiftDraft[]> = {};
  for (let day = 1; day <= 7; day += 1) {
    const dayShifts =
      template?.shifts.filter((s) => s.dayOfWeek === day) ?? [];
    drafts[day] =
      dayShifts.length > 0
        ? dayShifts.map((s) => ({
            dayOfWeek: day,
            startTime: toInputTime(s.startTime),
            endTime: toInputTime(s.endTime),
          }))
        : [];
  }
  return drafts;
}

export function ScheduleTemplateEditor({
  template,
  onSubmit,
  onCancel,
  pending,
}: Props) {
  const t = useTranslations('entities.schedule');
  const tCommon = useTranslations('common');
  const [name, setName] = useState(template?.name ?? '');
  const [description, setDescription] = useState(template?.description ?? '');
  const [enabledDays, setEnabledDays] = useState<Record<number, boolean>>({});
  const [drafts, setDrafts] = useState<Record<number, ShiftDraft[]>>({});

  useEffect(() => {
    const nextDrafts = buildDrafts(template);
    setDrafts(nextDrafts);
    const enabled: Record<number, boolean> = {};
    for (let day = 1; day <= 7; day += 1) {
      enabled[day] = (nextDrafts[day]?.length ?? 0) > 0;
    }
    setEnabledDays(enabled);
    setName(template?.name ?? '');
    setDescription(template?.description ?? '');
  }, [template]);

  const toggleDay = (day: number, checked: boolean) => {
    setEnabledDays((prev) => ({ ...prev, [day]: checked }));
    if (checked && (drafts[day]?.length ?? 0) === 0) {
      setDrafts((prev) => ({
        ...prev,
        [day]: [{ dayOfWeek: day, startTime: '09:00', endTime: '18:00' }],
      }));
    }
  };

  const updateBlock = (
    day: number,
    index: number,
    field: 'startTime' | 'endTime',
    value: string,
  ) => {
    setDrafts((prev) => {
      const blocks = [...(prev[day] ?? [])];
      blocks[index] = { ...blocks[index], [field]: value };
      return { ...prev, [day]: blocks };
    });
  };

  const addBlock = (day: number) => {
    setDrafts((prev) => ({
      ...prev,
      [day]: [
        ...(prev[day] ?? []),
        { dayOfWeek: day, startTime: '13:00', endTime: '17:00' },
      ],
    }));
  };

  const removeBlock = (day: number, index: number) => {
    setDrafts((prev) => {
      const blocks = (prev[day] ?? []).filter((_, i) => i !== index);
      return { ...prev, [day]: blocks };
    });
  };

  const handleSubmit = async () => {
    const shifts = Object.entries(enabledDays).flatMap(([dayKey, enabled]) => {
      if (!enabled) return [];
      const day = Number(dayKey);
      return (drafts[day] ?? []).map((block) => ({
        dayOfWeek: day,
        startTime: toApiTime(block.startTime),
        endTime: toApiTime(block.endTime),
      }));
    });
    await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      shifts,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('templateName')}</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>{t('templateDescription')}</Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="space-y-3">
        {DAY_KEYS.map((dayKey, index) => {
          const day = index + 1;
          const enabled = enabledDays[day] ?? false;
          const blocks = drafts[day] ?? [];
          return (
            <div key={day} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{t(`days.${dayKey}`)}</span>
                <Switch
                  checked={enabled}
                  onCheckedChange={(checked) => toggleDay(day, checked)}
                />
              </div>
              {enabled ? (
                <div className="space-y-2">
                  {blocks.map((block, blockIndex) => (
                    <div
                      key={`${day}-${blockIndex}`}
                      className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
                    >
                      <Input
                        type="time"
                        value={block.startTime}
                        onChange={(e) =>
                          updateBlock(day, blockIndex, 'startTime', e.target.value)
                        }
                      />
                      <Input
                        type="time"
                        value={block.endTime}
                        onChange={(e) =>
                          updateBlock(day, blockIndex, 'endTime', e.target.value)
                        }
                      />
                      {blocks.length > 1 ? (
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
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => addBlock(day)}
                  >
                    <Plus className="mr-1 size-4" />
                    {t('addBlock')}
                  </Button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <Button
          disabled={pending || !name.trim()}
          onClick={() => void handleSubmit()}
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {tCommon('save')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {tCommon('cancel')}
        </Button>
      </div>
    </div>
  );
}
