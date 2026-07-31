'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';

const STEPS = 5;

const STEP_LABEL_KEYS = [
  'stepService',
  'stepStaff',
  'stepSlot',
  'stepOtp',
  'stepPay',
] as const;

export function BookingStepIndicator({ current }: { current: number }) {
  const t = useTranslations('bookingWizard');
  const labelKey = STEP_LABEL_KEYS[current - 1];
  const stepLabel = labelKey ? t(labelKey) : '';

  return (
    <div className="mt-3 space-y-1.5">
      <div
        className="flex gap-1.5"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={STEPS}
        aria-label={stepLabel}
      >
        {Array.from({ length: STEPS }, (_, i) => {
          const step = i + 1;
          const active = step <= current;
          return (
            <div
              key={step}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                active ? 'bg-[var(--brand-primary,#f97316)]' : 'bg-muted',
              )}
            />
          );
        })}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        {t('stepProgress', { current, total: STEPS })}
        {stepLabel ? ` · ${stepLabel}` : ''}
      </p>
    </div>
  );
}
