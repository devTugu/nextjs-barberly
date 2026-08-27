'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useStaffList } from '@/entities/staff';
import { useStaffShifts } from '@/entities/schedule';
import { useMe } from '@/entities/user';
import { useAuthPermissions } from '@/entities/session';
import { ScheduleDayExceptionsPanel } from '@/features/admin-schedule';
import { ScheduleTimeBlocksPanel } from '@/features/admin-schedule';
import {
  ScheduleTemplatesPanel,
  ScheduleTenantHolidaysPanel,
} from '@/features/admin-schedule';
import { ScheduleWeeklyEditor } from '@/features/admin-schedule';
import { ROUTES } from '@/shared/config/routes';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Skeleton } from '@/shared/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';

const TAB_VALUES = [
  'weekly',
  'day-exceptions',
  'time-blocks',
  'holidays',
  'templates',
] as const;

type TabValue = (typeof TAB_VALUES)[number];

function parseTab(value: string | null): TabValue {
  return TAB_VALUES.includes(value as TabValue)
    ? (value as TabValue)
    : 'weekly';
}

export function ScheduleHub() {
  const t = useTranslations('entities.schedule');
  const tenant = useTenantSubdomain();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isStaff } = useAuthPermissions();
  const { data: me } = useMe();
  const staffQuery = useStaffList(tenant);
  const [staffId, setStaffId] = useState(0);
  const [activeTab, setActiveTab] = useState<TabValue>(() =>
    parseTab(searchParams.get('tab')),
  );
  const lockedStaffId = isStaff ? me?.staffMemberId ?? 0 : 0;
  const activeStaffId = useMemo(
    () => lockedStaffId || staffId || staffQuery.data?.[0]?.id || 0,
    [lockedStaffId, staffId, staffQuery.data],
  );
  const shiftsQuery = useStaffShifts(
    tenant,
    activeStaffId,
    activeStaffId > 0,
  );

  useEffect(() => {
    setActiveTab(parseTab(searchParams.get('tab')));
  }, [searchParams]);

  useEffect(() => {
    if (
      activeStaffId > 0 &&
      shiftsQuery.isSuccess &&
      (shiftsQuery.data?.length ?? 0) === 0 &&
      activeTab === 'weekly'
    ) {
      router.replace(ROUTES.ADMIN_SCHEDULE_SETUP);
    }
  }, [
    activeStaffId,
    shiftsQuery.isSuccess,
    shiftsQuery.data,
    activeTab,
    router,
  ]);

  const handleTabChange = (value: string) => {
    const tab = parseTab(value);
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'weekly') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    const query = params.toString();
    router.replace(query ? `${ROUTES.ADMIN_SCHEDULE}?${query}` : ROUTES.ADMIN_SCHEDULE);
  };

  if (staffQuery.isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const staff = staffQuery.data ?? [];
  if (staff.length === 0) {
    return (
      <div className="space-y-4 rounded-lg border p-6 text-center">
        <p className="text-muted-foreground">{t('noStaff')}</p>
        <Button asChild>
          <Link href={ROUTES.ADMIN_SCHEDULE_SETUP}>{t('setupCta')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full max-w-xs space-y-2">
          <Label>{t('staffMember')}</Label>
          {lockedStaffId ? (
            <p className="text-sm font-medium">
              {staff.find((m) => m.id === lockedStaffId)?.displayName}
            </p>
          ) : (
            <Select
              value={String(activeStaffId)}
              onValueChange={(v) => setStaffId(Number(v))}
            >
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
        </div>
        <Button variant="outline" asChild>
          <Link href={ROUTES.ADMIN_SCHEDULE_SETUP}>{t('setupWizard')}</Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start">
          <TabsTrigger value="weekly">{t('tabWeekly')}</TabsTrigger>
          <TabsTrigger value="day-exceptions">{t('tabDayExceptions')}</TabsTrigger>
          <TabsTrigger value="time-blocks">{t('tabTimeBlocks')}</TabsTrigger>
          <TabsTrigger value="holidays">{t('tabHolidays')}</TabsTrigger>
          <TabsTrigger value="templates">{t('tabTemplates')}</TabsTrigger>
        </TabsList>
        <TabsContent value="weekly" className="mt-6">
          <ScheduleWeeklyEditor staffId={activeStaffId} hideStaffSelector />
        </TabsContent>
        <TabsContent value="day-exceptions" className="mt-6">
          <ScheduleDayExceptionsPanel staffId={activeStaffId} />
        </TabsContent>
        <TabsContent value="time-blocks" className="mt-6">
          <ScheduleTimeBlocksPanel staffId={activeStaffId} />
        </TabsContent>
        <TabsContent value="holidays" className="mt-6">
          <ScheduleTenantHolidaysPanel />
        </TabsContent>
        <TabsContent value="templates" className="mt-6">
          <ScheduleTemplatesPanel staffId={activeStaffId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
