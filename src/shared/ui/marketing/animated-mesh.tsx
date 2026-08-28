'use client';

import { useEffect, useRef, useState } from 'react';
import { useIsMounted } from '@/shared/hooks/use-is-mounted';
import { usePrefersReducedMotion } from '@/shared/hooks/use-prefers-reduced-motion';
import { StripeGradientEngine } from '@/shared/lib/stripe-gradient';
import { STRIPE_GRADIENT_DEFAULT_COLORS } from '@/shared/lib/stripe-gradient/stripe-gradient-config';
import { cn } from '@/shared/lib/utils';
import { GradientMeshBlobs } from './gradient-mesh-blobs';
import { meshBandClipStyle, meshBandShellClassName } from './mesh-band-layout';

interface AnimatedMeshProps {
  className?: string;
  gradientColors?: readonly string[];
}

function scheduleIdle(callback: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const idleId = window.requestIdleCallback(callback, { timeout: 1500 });
    return () => window.cancelIdleCallback(idleId);
  }
  const timeoutId = window.setTimeout(callback, 1);
  return () => window.clearTimeout(timeoutId);
}

export function AnimatedMesh({ className, gradientColors }: AnimatedMeshProps) {
  const mounted = useIsMounted();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [allowCanvas, setAllowCanvas] = useState(false);
  const showCanvas = mounted && !prefersReducedMotion && allowCanvas;
  const stripeColors = gradientColors?.length
    ? [...gradientColors]
    : [...STRIPE_GRADIENT_DEFAULT_COLORS];
  const colorsKey = stripeColors.join(',');

  useEffect(() => {
    if (!mounted || prefersReducedMotion) return undefined;
    return scheduleIdle(() => setAllowCanvas(true));
  }, [mounted, prefersReducedMotion]);

  useEffect(() => {
    if (!showCanvas) return undefined;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    let engine: StripeGradientEngine | null = null;

    const ensureEngine = (width: number, height: number) => {
      if (width <= 0 || height <= 0) return;

      if (!engine) {
        try {
          engine = new StripeGradientEngine({
            canvas,
            width,
            height,
            colors: stripeColors,
          });
          engine.play();
        } catch {
          return;
        }
      }

      engine.resize(width, height);
    };

    ensureEngine(container.clientWidth, container.clientHeight);

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      ensureEngine(width, height);
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        engine?.setVisible(entry?.isIntersecting ?? true);
      },
      { threshold: 0, rootMargin: '100px 0px' },
    );
    intersectionObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      engine?.disconnect();
    };
  }, [showCanvas, colorsKey]);

  return (
    <div aria-hidden className={cn(meshBandShellClassName, className)}>
      <div className="absolute inset-0" style={meshBandClipStyle}>
        <GradientMeshBlobs />
        {showCanvas ? (
          <div ref={containerRef} className="absolute inset-0">
            <canvas ref={canvasRef} className="block h-full w-full" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
