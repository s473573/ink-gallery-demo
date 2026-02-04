'use client';

import * as React from 'react';
import {
  forwardPointerToCanvas,
  useFluid,
  type FluidConfig,
} from '@/hooks/useFluid';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export type FluidStageProps = {
  children: React.ReactNode;
  className?: string;
  config?: FluidConfig;
  showStatus?: boolean;
};

const DEFAULT_CONFIG: FluidConfig = {
  TRIGGER: 'hover',          // doesn't hijack scrolling/touch by default
  IMMEDIATE: false,          // adds a tiny bit of smoothing
  SIM_RESOLUTION: 256,       // stable + light
  DYE_RESOLUTION: 512,       // crisp color

  DENSITY_DISSIPATION: 2.0,  
  VELOCITY_DISSIPATION: 2.0,
  
  PRESSURE: 0.7,
  PRESSURE_ITERATIONS: 18,
  
  CURL: 15,                  // lower swirliness = calmer
  SPLAT_RADIUS: 0.15,        // smaller interactions = less splashy
  SPLAT_FORCE: 800,         // noticeable but not explosive
  
  SHADING: true,            // makes it feel volumetric
  COLORFUL: true,           // subtle single/limited palette by default
  TRANSPARENT: false,       // plays well over backgrounds
  
  BLOOM: false,             // scene doesn't need lighting
  SUNRAYS: false
};

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(' ');
}

export function FluidStage({
  children,
  className,
  config,
  showStatus,
}: FluidStageProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const enabled = !prefersReducedMotion;

  const mergedConfig = React.useMemo(() => {
    return { ...DEFAULT_CONFIG, ...config };
  }, [config]);

  const state = useFluid(canvasRef, mergedConfig, { enabled });
  
   React.useEffect(() => {
    if (!enabled) return;
    if (state.status !== 'ready') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const opts: AddEventListenerOptions = { capture: true, passive: true };

    const makeHandler =
      (type: 'pointerdown' | 'pointermove' | 'pointerup') =>
      (e: PointerEvent) => {
        if (!e.isTrusted) return;
        console.log("registered at", e.clientX, e.clientY)

        forwardPointerToCanvas(canvas, type, e);
      };

    const onMove = makeHandler('pointermove');

    window.addEventListener('pointermove', onMove, opts);

    return () =>
      window.removeEventListener('pointermove', onMove, opts);
  }, [enabled, state.status]);

  // const forward = React.useCallback(
  //   (type: 'pointerdown' | 'pointermove' | 'pointerup') =>
  //     (e: React.PointerEvent) => {
  //       const canvas = canvasRef.current;
  //       if (!canvas) return;
  //       if (!e.isTrusted) return;

  //       forwardPointerToCanvas(canvas, type, e.nativeEvent);
  //     },
  //   [state.status]
  // );

  return (
    <div className={cx('fluidStage', className)}>
      <canvas ref={canvasRef} className="fluidCanvas" aria-hidden="true" />

      <div
        className="fluidOverlay"
        // onPointerDownCapture={forward('pointerdown')}
        // onPointerMoveCapture={forward('pointermove')}
        // onPointerUpCapture={forward('pointerup')}
        // onPointerCancelCapture={forward('pointerup')}
      >
        {children}
      </div>

      {showStatus ? (
        <div className="fluidStatus" role='status' aria-live='polite'>
          { state.status === 'error' ? (
            <span className="fluidBadge fluidBadge--error">
              {state.error.message}
            </span>
          ) : state.status === 'loading' ? (
            <span className="fluidBadge fluidBadge--loading">Loading…</span>
          ) : state.status === 'ready' ? (
            <span className="fluidBadge fluidBadge--ready">Ready</span>
          ) : (
            <span className="fluidBadge">Idle</span>
          )}
        </div>
      ) : null}
    </div>
  );
}
