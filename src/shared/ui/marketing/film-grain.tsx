import { cn } from '@/shared/lib/utils';

interface FilmGrainProps {
  className?: string;
}

/** Tiled film grain — rasterized once at 160px, not a viewport-sized SVG filter. */
export function FilmGrain({ className }: FilmGrainProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 opacity-[0.11] mix-blend-overlay',
        className,
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
          `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#n)' opacity='.55'/></svg>`,
        )}")`,
        backgroundSize: '160px 160px',
        backgroundRepeat: 'repeat',
      }}
    />
  );
}
