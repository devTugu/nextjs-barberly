import { cn } from '@/shared/lib/utils';
import { MarketingColumnGrid } from './marketing-column-grid';
import { MarketingGridPattern } from './marketing-grid-pattern';

interface SectionProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
  /** Fine grid + radial fade for this section. */
  showGridPattern?: boolean;
  gridPatternClassName?: string;
  /** Allow media to bleed onto grid lines (uses overflow-visible). */
  allowBleed?: boolean;
}

export function Section({
  id,
  className,
  children,
  showGridPattern = true,
  gridPatternClassName,
  allowBleed = false,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'py-16 md:py-24',
        showGridPattern && 'relative',
        showGridPattern && (allowBleed ? 'overflow-visible' : 'overflow-hidden'),
        className,
      )}
    >
      {showGridPattern ? (
        <>
          <MarketingGridPattern className={cn('z-[1]', gridPatternClassName)} />
          <MarketingColumnGrid className="z-[1]" />
        </>
      ) : null}
      {showGridPattern ? (
        <div className="relative z-[2]">{children}</div>
      ) : (
        children
      )}
    </section>
  );
}
