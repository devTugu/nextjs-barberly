import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface SelectRowProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function SelectRow({ selected, onClick, children }: SelectRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-colors',
        selected
          ? 'border-[var(--brand-primary,#3b82f6)] bg-[var(--brand-primary,#3b82f6)]/5'
          : 'border-border bg-card',
      )}
    >
      {children}
      <span
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-full border',
          selected
            ? 'border-[var(--brand-primary,#3b82f6)] bg-[var(--brand-primary,#3b82f6)] text-white'
            : 'border-muted-foreground/30',
        )}
      >
        {selected ? <Check className="size-3.5" /> : null}
      </span>
    </button>
  );
}
