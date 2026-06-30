'use client';

import { useId, type SVGProps } from 'react';
import { cn } from '@/shared/lib/utils';

export interface GridPatternProps extends SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  /** Highlighted cell coordinates [column, row]. */
  squares?: Array<[number, number]>;
  strokeDasharray?: string;
}

export function GridPattern({
  width = 48,
  height = 48,
  x = -1,
  y = -1,
  strokeDasharray = '0',
  squares,
  className,
  ...props
}: GridPatternProps) {
  const patternId = useId();

  return (
    <svg
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full stroke-[var(--marketing-grid-line)] fill-[var(--marketing-grid-line)]/20',
        className,
      )}
      {...props}
    >
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${patternId})`} />
      {squares?.length ? (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([column, row]) => (
            <rect
              key={`${column}-${row}`}
              strokeWidth={0}
              width={width - 1}
              height={height - 1}
              x={column * width + 1}
              y={row * height + 1}
            />
          ))}
        </svg>
      ) : null}
    </svg>
  );
}
