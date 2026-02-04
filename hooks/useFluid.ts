'use client';

import * as React from 'react';

/**
 * Subset of config keys from webgl-fluid docs.
 */
export type FluidConfig = {
  TRIGGER?: 'hover';
  IMMEDIATE?: boolean;

  SIM_RESOLUTION?: number;
  DYE_RESOLUTION?: number;

  DENSITY_DISSIPATION?: number;
  VELOCITY_DISSIPATION?: number;
  PRESSURE?: number;
  PRESSURE_ITERATIONS?: number;
  CURL?: number;

  SPLAT_RADIUS?: number;
  SPLAT_FORCE?: number;

  SHADING?: boolean;
  COLORFUL?: boolean;
  COLOR_UPDATE_SPEED?: number;

  PAUSED?: boolean;
  TRANSPARENT?: boolean;
  BACK_COLOR?: { r: number; g: number; b: number };
  BLOOM?: boolean;
  SUNRAYS?: boolean;
};

// state machine as a discriminated union
type FluidState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'error'; error: Error };

// represents events
type FluidAction =
| {type: 'start'}   // user drives
| {type: 'ready'}   // buffers initialized
| {type: 'error'; error: Error};

// TODO(1): implement reducer for FluidState
function fluidReducer(_state: FluidState, _action: FluidAction): FluidState {
  switch (_action.type) {
    case 'start': return {status: 'loading'}
    case 'ready': return {status: 'ready'}
    case 'error': return {status: 'error', error: _action.error}
    default: return _state;
  }
}

type WebglFluidFn = (canvas: HTMLCanvasElement, config?: FluidConfig) => void;

// We’ll treat the dynamic import as unknown on purpose (for TS practice).
// It can be either { default: fn } OR directly a function depending on bundling.
type WebglFluidModule = { default: WebglFluidFn } | WebglFluidFn;

// TODO(2): write a type guard that checks “is object-like record”
function isRecord(value: unknown): value is Record<string, unknown> {
  // cant have null.foo
  return typeof value === 'object' && value !== null;
}

// TODO(3): write a type guard that narrows unknown -> WebglFluidFn
function toWebglFluidFn(mod: unknown): WebglFluidFn {
  /**
   * Requirements:
   * - if mod is a function, return it
   * - else if mod is a record AND has 'default' AND that default is a function, return that
   * - otherwise throw a helpful Error
   */
  if (typeof mod === 'function') return mod as WebglFluidFn;
  if (isRecord(mod) && 'default' in mod) {
    const rec_mod = mod as Record<string, unknown>;
    const inner = rec_mod.default;
    if (typeof inner === 'function') return inner as WebglFluidFn;
  }
  throw new Error(
    'Unknown function type — expected function or { default: function }'
  );
}

function patchLocalCoords(ev: Event, localX: number, localY: number) {
  const define = (name: string, value: number) => {
    try {
      Object.defineProperty(ev, name, {
        configurable: true,
        enumerable: true,
        get: () => value,
      });
    } catch {
      // ignore if non-configurable
    }
  };

  define('offsetX', localX);
  define('offsetY', localY);
  define('layerX', localX);
  define('layerY', localY);
  define('x', localX);
  define('y', localY);
}

/**
 * Forwards pointer events from UI elements to the canvas
 * so the fluid sim reacts even when the pointer is over a card.
 */
export function forwardPointerToCanvas(
  canvas: HTMLCanvasElement,
  type: 'pointerdown' | 'pointermove' | 'pointerup',
  e: Pick<PointerEvent, 'clientX' | 'clientY' | 'pointerId' | 'buttons' | 'button' |  'pointerType'>
) {
  const rect = canvas.getBoundingClientRect();

  // library expects mouse events and local coords
  const localX = e.clientX - rect.left;
  const localY = e.clientY - rect.top;
  const mouseType =
    type === 'pointerdown'
      ? 'mousedown'
      : type === 'pointerup'
      ? 'mouseup'
      : 'mousemove';

  const me = new MouseEvent(mouseType, e);
  patchLocalCoords(me, localX, localY);
  canvas.dispatchEvent(me);
}

/**
 * Mounts webgl-fluid onto a canvas ref.
 */
export function useFluid(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  config: FluidConfig,
  opts?: { enabled?: boolean }
) {
  const enabled = opts?.enabled ?? true;

  const [state, dispatch] = React.useReducer(fluidReducer, { status: 'idle' });

  // Memoize config so we don’t re-init for identity changes.
  const stableConfig = React.useMemo(() => config, [config]);

  React.useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;

    async function boot(c: HTMLCanvasElement) {
      dispatch({ type: 'start' });

      try {
        // TODO(5): dynamic import 'webgl-fluid' (client-side),
        // narrow it via toWebglFluidFn, then call it with (canvas, stableConfig).
        // Finally dispatch ready (unless cancelled).
        const mod = await import('webgl-fluid');
        const fn: WebglFluidFn = toWebglFluidFn(mod);
        
        fn(c, stableConfig);
        if (!cancelled) dispatch({ type: 'ready'});
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error while starting fluid');
        if (!cancelled) dispatch({ type: 'error', error });
      }
    }

    boot(canvas);

    return () => {
      cancelled = true;
      // NOTE: webgl-fluid doesn’t expose a cleanup API in its quick-start;
      // we’ll handle teardown pragmatically later (e.g., pausing on unmount).
    };
  }, [canvasRef, enabled, stableConfig]);

  return state;
}
