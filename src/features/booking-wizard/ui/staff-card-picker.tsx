'use client';

import { Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { getInitials } from '@/entities/booking';

export const ANY_STAFF_ID = 0;

export interface StaffOption {
  id: number;
  displayName: string;
  isDefault?: boolean;
}

interface StaffCardPickerProps {
  staff: StaffOption[];
  selectedId: number | null;
  onSelect: (staffId: number) => void;
}

export function StaffCardPicker({ staff, selectedId, onSelect }: StaffCardPickerProps) {
  const t = useTranslations('bookingWizard');

  return (
    <div className="grid gap-3">
      <button
        type="button"
        onClick={() => onSelect(ANY_STAFF_ID)}
        className={cn(
          'flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors',
          selectedId === ANY_STAFF_ID
            ? 'border-[var(--brand-primary,#f97316)] bg-[var(--brand-primary,#f97316)]/10'
            : 'border-border/60 bg-card hover:border-border',
        )}
      >
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-muted">
          <Users className="size-6" />
        </div>
        <div>
          <p className="font-medium">{t('anyStaff')}</p>
          <p className="text-sm text-muted-foreground">{t('anyStaffHint')}</p>
        </div>
      </button>

      {staff.map((member) => {
        const selected = selectedId === member.id;
        return (
          <button
            key={member.id}
            type="button"
            onClick={() => onSelect(member.id)}
            className={cn(
              'flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors',
              selected
                ? 'border-[var(--brand-primary,#f97316)] bg-[var(--brand-primary,#f97316)]/10'
                : 'border-border/60 bg-card hover:border-border',
            )}
          >
            <div
              className={cn(
                'flex size-14 shrink-0 items-center justify-center rounded-full text-base font-semibold',
                selected
                  ? 'bg-[var(--brand-primary,#f97316)] text-white'
                  : 'bg-muted text-foreground',
              )}
            >
              {getInitials(member.displayName)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-medium">{member.displayName}</p>
                {member.isDefault ? (
                  <span className="rounded-full bg-[var(--brand-primary,#f97316)]/15 px-2 py-0.5 text-xs font-medium text-[var(--brand-primary,#f97316)]">
                    {t('staffRecommended')}
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">{t('staffRole')}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
