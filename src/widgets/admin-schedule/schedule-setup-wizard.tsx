'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  useApplyScheduleTemplate,
  useCreateScheduleTemplate,
  useCreateTenantHoliday,
  useScheduleTemplates,
  useStaffShifts,
} from '@/entities/schedule';
import { splitShiftWithBreak } from '@/entities/schedule';
import { useStaffList } from '@/entities/staff';
import { ScheduleWeeklyEditor } from '@/features/admin-schedule';
import { ROUTES } from '@/shared/config/routes';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { getErrorMessage } from '@/shared/api';
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

type OperationType = 'daily' | 'weekly' | 'custom';

export function ScheduleSetupWizard() {
  const t = useTranslations('adminSchedule.setup');
  const tenant = useTenantSubdomain();
  const router = useRouter();
  const staffQuery = useStaffList(tenant);
  const templatesQuery = useScheduleTemplates(tenant);
  const createTemplate = useCreateScheduleTemplate(tenant);
  const applyTemplate = useApplyScheduleTemplate(tenant);
  const createHoliday = useCreateTenantHoliday(tenant);

  const [step, setStep] = useState(1);
  const [operation, setOperation] = useState<OperationType>('weekly');
  const [staffId, setStaffId] = useState(0);
  const [templateName, setTemplateName] = useState('');
  const [breakStart, setBreakStart] = useState('13:00');
  const [breakEnd, setBreakEnd] = useState('14:00');
  const [addBreak, setAddBreak] = useState(false);
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayName, setHolidayName] = useState('');

  const activeStaffId = staffId || staffQuery.data?.[0]?.id || 0;
  const shiftsQuery = useStaffShifts(tenant, activeStaffId, activeStaffId > 0);

  const finish = async () => {
    if (activeStaffId <= 0) {
      toast.error(t('selectStaff'));
      return;
    }
    try {
      const shifts = shiftsQuery.data ?? [];
      let templateShifts = shifts.map((s) => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
      }));

      if (addBreak && operation !== 'custom') {
        templateShifts = templateShifts.flatMap((shift) =>
          splitShiftWithBreak(
            shift.startTime.slice(0, 5),
            shift.endTime.slice(0, 5),
            breakStart,
            breakEnd,
          ).map((block) => ({
            dayOfWeek: shift.dayOfWeek,
            startTime: `${block.startTime}:00`,
            endTime: `${block.endTime}:00`,
          })),
        );
      }

      if (operation === 'daily') {
        templateShifts = [1, 2, 3, 4, 5, 6, 7].flatMap((day) =>
          splitShiftWithBreak('09:00', '18:00', breakStart, breakEnd).map(
            (block) => ({
              dayOfWeek: day,
              startTime: `${block.startTime}:00`,
              endTime: `${block.endTime}:00`,
            }),
          ),
        );
      }

      const name = templateName || t('defaultTemplateName');
      const created = await createTemplate.mutateAsync({
        name,
        shifts: templateShifts,
      });
      await applyTemplate.mutateAsync({
        templateId: created.id,
        staffId: activeStaffId,
      });

      if (holidayDate && holidayName) {
        await createHoliday.mutateAsync({
          localDate: holidayDate,
          name: holidayName,
        });
      }

      toast.success(t('completed'));
      router.push(ROUTES.ADMIN_SCHEDULE);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {t('step', { current: step, total: 4 })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 ? (
            <>
              <Label>{t('operationType')}</Label>
              <Select
                value={operation}
                onValueChange={(v) => setOperation(v as OperationType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{t('dailySame')}</SelectItem>
                  <SelectItem value="weekly">{t('weeklyVaried')}</SelectItem>
                  <SelectItem value="custom">{t('customOption')}</SelectItem>
                </SelectContent>
              </Select>
              <div className="space-y-2">
                <Label>{t('selectStaff')}</Label>
                <Select
                  value={String(activeStaffId)}
                  onValueChange={(v) => setStaffId(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(staffQuery.data ?? []).map((member) => (
                      <SelectItem key={member.id} value={String(member.id)}>
                        {member.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : null}

          {step === 2 && operation !== 'daily' ? (
            <ScheduleWeeklyEditor staffId={activeStaffId} hideStaffSelector />
          ) : null}

          {step === 2 && operation === 'daily' ? (
            <p className="text-muted-foreground text-sm">{t('dailyHint')}</p>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>{t('templateName')}</Label>
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <input
                  id="add-break"
                  type="checkbox"
                  checked={addBreak}
                  onChange={(e) => setAddBreak(e.target.checked)}
                />
                <Label htmlFor="add-break">{t('addTeaBreak')}</Label>
              </div>
              {addBreak ? (
                <>
                  <div className="space-y-2">
                    <Label>{t('breakStart')}</Label>
                    <Input
                      type="time"
                      value={breakStart}
                      onChange={(e) => setBreakStart(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('breakEnd')}</Label>
                    <Input
                      type="time"
                      value={breakEnd}
                      onChange={(e) => setBreakEnd(e.target.value)}
                    />
                  </div>
                </>
              ) : null}
              <div className="space-y-2">
                <Label>{t('holidayDate')}</Label>
                <Input
                  type="date"
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('holidayName')}</Label>
                <Input
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                />
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-2 text-sm">
              <p>{t('reviewStaff')}: {staffQuery.data?.find((s) => s.id === activeStaffId)?.displayName}</p>
              <p>{t('reviewOperation')}: {t(operation)}</p>
              <p>{t('reviewTemplates')}: {templatesQuery.data?.length ?? 0}</p>
            </div>
          ) : null}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              disabled={step === 1}
              onClick={() => setStep((s) => s - 1)}
            >
              {t('back')}
            </Button>
            {step < 4 ? (
              <Button onClick={() => setStep((s) => s + 1)}>{t('next')}</Button>
            ) : (
              <Button onClick={() => void finish()}>{t('finish')}</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
