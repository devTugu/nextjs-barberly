'use client';

import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import type { PolicyReasonCode } from '@/entities/booking';
import { env } from '@/shared/config/env';
import { publicGet } from '@/shared/lib/public-api';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/tooltip';
import { useTranslations } from 'next-intl';

export const simulateEnabled =
  process.env.NEXT_PUBLIC_QPAY_SIMULATE_ENABLED === 'true' ||
  env.APP_ENV !== 'production';

const POLICY_REASON_CODES: PolicyReasonCode[] = [
  'BOOKING_NOT_ACTIVE',
  'RESCHEDULE_WINDOW_PASSED',
];

function isPolicyReasonCode(
  value: string | null | undefined,
): value is PolicyReasonCode {
  return POLICY_REASON_CODES.includes(value as PolicyReasonCode);
}

export function usePolicyReasonLabel() {
  const t = useTranslations('userPortal');

  return (reasonCode: string | null | undefined, fallback?: string | null) => {
    if (isPolicyReasonCode(reasonCode)) {
      return t(`policyReason.${reasonCode}`);
    }
    return fallback ?? t('cancelPolicyHint');
  };
}

export interface TenantPolicies {
  cancelHoursBefore: number;
  rescheduleHoursBefore: number;
}

export function useTenantPolicies(tenant: string) {
  const [policies, setPolicies] = useState<TenantPolicies | null>(null);

  useEffect(() => {
    publicGet<{ policies: TenantPolicies }>('/tenant', tenant)
      .then((data) => setPolicies(data.policies))
      .catch(() => setPolicies(null));
  }, [tenant]);

  return policies;
}

export function PolicyHint({ label }: { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground inline-flex size-6 items-center justify-center rounded-full"
          aria-label={label}
        >
          <Info className="size-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
