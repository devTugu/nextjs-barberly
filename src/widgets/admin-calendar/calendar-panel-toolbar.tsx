'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { StaffOutput } from '@/entities/staff';
import { Button } from '@/shared/ui/button';
import { CardHeader, CardTitle } from '@/shared/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import type { CalendarView } from './calendar-layout';

interface CalendarPanelToolbarProps {
  view: CalendarView;
  heading: string;
  isStaff: boolean;
  staffFilterId: string;
  staffList: StaffOutput[];
  onViewChange: (view: CalendarView) => void;
  onStaffFilterChange: (id: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function CalendarPanelToolbar({
  view,
  heading,
  isStaff,
  staffFilterId,
  staffList,
  onViewChange,
  onStaffFilterChange,
  onPrev,
  onNext,
  onToday,
}: CalendarPanelToolbarProps) {
  const t = useTranslations('entities.bookings');

  return (
    <CardHeader className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>{t('calendarTitle')}</CardTitle>
        <Tabs
          value={view}
          onValueChange={(value) => onViewChange(value as CalendarView)}
        >
          <TabsList className="min-h-11">
            <TabsTrigger value="day" className="min-h-11">
              {t('dayView')}
            </TabsTrigger>
            <TabsTrigger value="week" className="min-h-11">
              {t('weekView')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {!isStaff ? (
          <Select value={staffFilterId} onValueChange={onStaffFilterChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All staff</SelectItem>
              {staffList.map((member) => (
                <SelectItem key={member.id} value={String(member.id)}>
                  {member.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="icon"
          className="min-h-11 min-w-11"
          onClick={onPrev}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div className="text-center">
          <p className="font-medium">{heading}</p>
          <Button
            variant="link"
            size="sm"
            className="text-muted-foreground h-auto min-h-11 p-0"
            onClick={onToday}
          >
            {t('today')}
          </Button>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="min-h-11 min-w-11"
          onClick={onNext}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </CardHeader>
  );
}
