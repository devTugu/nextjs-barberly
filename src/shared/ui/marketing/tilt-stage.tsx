'use client';

import { useCallback, useRef } from 'react';
import { usePrefersReducedMotion } from '@/shared/hooks/use-prefers-reduced-motion';
import { cn } from '@/shared/lib/utils';

interface TiltStageProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  maxTilt?: number;
}

const REST_TRANSFORM = 'rotateX(10deg) rotateY(-16deg)';

export function TiltStage({
  children,
  className,
  innerClassName,
  maxTilt = 10,
}: TiltStageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const handleMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (reduced) return;
      const node = ref.current;
      if (!node) return;
      const box = node.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width;
      const y = (event.clientY - box.top) / box.height;
      node.style.transform = `rotateX(${(0.5 - y) * maxTilt}deg) rotateY(${(x - 0.5) * maxTilt * 2}deg)`;
    },
    [maxTilt, reduced],
  );

  const handleLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = REST_TRANSFORM;
  }, []);

  return (
    <div className={cn('[perspective:1400px]', className)}>
      <div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className={cn(
          'h-full w-full origin-center transition-transform duration-300 ease-out will-change-transform [transform-style:preserve-3d] max-md:[transform:none!important]',
          innerClassName,
        )}
        style={reduced ? undefined : { transform: REST_TRANSFORM }}
      >
        {children}
      </div>
    </div>
  );
}
