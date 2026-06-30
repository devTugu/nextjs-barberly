import type { CSSProperties } from 'react';
import { cn } from '@/shared/lib/utils';

const gridPatternStyle: CSSProperties = {
  backgroundImage: [
    'linear-gradient(to right, var(--marketing-grid-pattern-color) 1px, transparent 1px)',
    'linear-gradient(to bottom, var(--marketing-grid-pattern-color) 1px, transparent 1px)',
  ].join(', '),
  backgroundSize:
    'var(--marketing-grid-pattern-size-x) var(--marketing-grid-pattern-size-y)',
  WebkitMaskImage:
    'radial-gradient(ellipse 90% 70% at 50% 15%, #000 25%, transparent 92%)',
  maskImage:
    'radial-gradient(ellipse 90% 70% at 50% 15%, #000 25%, transparent 92%)',
};

interface MarketingGridPatternProps {
  className?: string;
}

/** Fine tiled grid with faint lines and radial fade — Magic UI / Stripe landing style. */
export function MarketingGridPattern({ className }: MarketingGridPatternProps) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0', className)}
      style={gridPatternStyle}
    />
  );
}
