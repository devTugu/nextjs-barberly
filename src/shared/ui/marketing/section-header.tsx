import { cn } from '@/shared/lib/utils';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'mb-10 max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow ? (
        <p className="mb-2 text-sm font-medium tracking-wide uppercase text-[var(--marketing-indigo)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-semibold tracking-tight text-[var(--marketing-navy)] md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-base text-[var(--marketing-text-muted)] md:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
