import { cn } from '@/shared/lib/utils';

/** Primary CTA using tenant brand color CSS variable. */
export const brandPrimaryButtonClass = cn(
  'bg-[var(--brand-primary,#f97316)] text-white hover:opacity-90',
);

export const brandPrimarySlotClass = cn(
  'border-transparent bg-[var(--brand-primary,#f97316)] text-white',
);
