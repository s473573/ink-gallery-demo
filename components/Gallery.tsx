'use client';

import * as React from 'react';

/**
 * Gallery goals (learning + product demo):
 * calm grid, restrained motion, typographic clarity.
 */

type BaseCard = {
  id: string;
  title: string;
  seed: number; // deterministic cover generation
};

export type CaseStudyCard = BaseCard & {
  kind: 'case';
  subtitle?: string;
  tags: readonly string[];
  year: number;
};

export type NoteCard = BaseCard & {
  kind: 'note';
  quote: string;
  author?: string;
};

export type LinkCard = BaseCard & {
  kind: 'link';
  label: string;
  href: string;
  external?: boolean;
};

export type MetricCard = BaseCard & {
  kind: 'metric';
  label: string;
  value: string;
  hint?: string;
};

export type CardItem = CaseStudyCard | NoteCard | LinkCard | MetricCard;

// Interaction state machine (hover vs locked)

type GalleryState =
  | { mode: 'none' }
  | { mode: 'hover'; id: string }
  | { mode: 'locked'; id: string };

type GalleryAction =
  | { type: 'enter'; id: string }
  | { type: 'leave'; id: string }
  | { type: 'toggleLock'; id: string }
  | { type: 'escape' };

function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${String(x)}`);
}

// δ
function galleryReducer(state: GalleryState, action: GalleryAction): GalleryState {
  switch (action.type) {
    case 'enter': {
      // intentional locked state is “stronger” than hover.
      if (state.mode === 'locked') return state;
      return { mode: 'hover', id: action.id };
    }

    case 'leave': {
      if (state.mode !== 'hover') return state;
      if (state.id !== action.id) return state;
      return { mode: 'none' };
    }

    case 'toggleLock': {
      if (state.mode === 'locked' && state.id === action.id) {
        return { mode: 'none' };
      }
      if (state.mode === 'none') return state;
      return { mode: 'locked', id: state.id };
    }

    case 'escape': {
      return { mode: 'none' };
    }

    default:
      assertNever(action);
  }
}

// Deterministic covers (seeded SVG)

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function coverDataUrlFromSeed(seed: number): string {
  const r = mulberry32(seed);

  // low saturation + tight luminance range.
  const hue = Math.floor(r() * 360);
  const sat = 6 + Math.floor(r() * 10); // 6–16%
  const l1 = 10 + Math.floor(r() * 10); // 10–20%
  const l2 = 16 + Math.floor(r() * 10); // 16–26%

  // layout primitives
  const cx1 = Math.floor(r() * 800);
  const cy1 = Math.floor(r() * 520);
  const cx2 = Math.floor(r() * 800);
  const cy2 = Math.floor(r() * 520);

  const strokeA = clamp01(0.10 + r() * 0.12); // 0.10–0.22
  const strokeB = clamp01(0.06 + r() * 0.10); // 0.06–0.16

  const ring = {
    x: Math.floor(r() * 800),
    y: Math.floor(r() * 520),
    rad: 120 + Math.floor(r() * 220),
  };

  const lineY = 80 + Math.floor(r() * 360);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520" viewBox="0 0 800 520">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue} ${sat}% ${l1}%)"/>
      <stop offset="100%" stop-color="hsl(${(hue + 24) % 360} ${sat}% ${l2}%)"/>
    </linearGradient>

    <!-- Grain / paper noise -->
    <filter id="grain" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
      <feColorMatrix type="matrix" values="
        1 0 0 0 0
        0 1 0 0 0
        0 0 1 0 0
        0 0 0 0.12 0" />
    </filter>

    <!-- Soft vignette -->
    <radialGradient id="v" cx="50%" cy="50%" r="70%">
      <stop offset="40%" stop-color="rgba(0,0,0,0)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.55)"/>
    </radialGradient>
  </defs>

  <rect width="800" height="520" fill="url(#g)"/>
  <rect width="800" height="520" filter="url(#grain)" opacity="0.85"/>

  <!-- Minimal geometry (subtle, “studio”) -->
  <circle cx="${cx1}" cy="${cy1}" r="${70 + Math.floor(r() * 160)}"
          fill="none" stroke="rgba(255,255,255,${strokeA})" stroke-width="1.2"/>
  <circle cx="${cx2}" cy="${cy2}" r="${40 + Math.floor(r() * 140)}"
          fill="none" stroke="rgba(255,255,255,${strokeB})" stroke-width="1"/>

  <circle cx="${ring.x}" cy="${ring.y}" r="${ring.rad}"
          fill="none" stroke="rgba(255,255,255,${strokeB})" stroke-width="0.9"
          stroke-dasharray="${4 + Math.floor(r() * 10)} ${10 + Math.floor(r() * 18)}"/>

  <path d="M 0 ${lineY} C 220 ${lineY - 30} 520 ${lineY + 30} 800 ${lineY - 10}"
        fill="none" stroke="rgba(255,255,255,${strokeA})" stroke-width="1"/>

  <rect width="800" height="520" fill="url(#v)" opacity="0.75"/>
</svg>`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Demo data (mixed types)

const ITEMS: readonly CardItem[] = [
  {
    kind: 'case',
    id: 'c-01',
    title: 'Quiet System',
    subtitle: 'Components, tokens, and motion rules',
    tags: ['design', 'system', 'ui'],
    year: 2026,
    seed: 101,
  },
  {
    kind: 'link',
    id: 'l-01',
    title: 'Fluid Sim Reference',
    label: 'Open webgl docs',
    href: 'https://github.com/PavelDoGreat/WebGL-Fluid-Simulation',
    external: false,
    seed: 505,
  },
  {
    kind: 'note',
    id: 'n-01',
    title: 'Principle',
    quote: 'Less animation. More intention.',
    author: 'Studio note',
    seed: 202,
  },
  {
    kind: 'metric',
    id: 'm-01',
    title: 'Demo Goal',
    label: 'Time-to-demo',
    value: '4h',
    hint: 'ship a small, coherent product slice',
    seed: 303,
  },
  {
    kind: 'case',
    id: 'c-02',
    title: 'Ink Hover',
    subtitle: 'Interaction that stays in the background',
    tags: ['interaction', 'webgl', 'polish'],
    year: 2026,
    seed: 404,
  },
  {
    kind: 'note',
    id: 'n-02',
    title: 'Tone',
    quote: 'The UI should feel confident even when it’s quiet.',
    author: 'Product energy',
    seed: 606,
  },
  {
    kind: 'case',
    id: 'c-03',
    title: 'Cards as Content',
    subtitle: 'Discriminated unions in the UI layer',
    tags: ['typescript', 'react', 'patterns'],
    year: 2026,
    seed: 707,
  },
  {
    kind: 'metric',
    id: 'm-02',
    title: 'Motion Budget',
    label: 'Transitions',
    value: '160ms',
    hint: 'low amplitude, UI-native easing',
    seed: 808,
  },
];

// UI: Card component (narrow by kind)

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ');
}

// adapter
function useEscapeToClose(dispatch: React.Dispatch<GalleryAction>) {
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch({ type: 'escape' });
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dispatch]); // closure borrows it
}

function Card(props: {
  item: CardItem;
  state: GalleryState;
  dispatch: React.Dispatch<GalleryAction>;
}) {
  const { item, state, dispatch } = props;

  const isHovered = state.mode === 'hover' && state.id === item.id;
  const isLocked = state.mode === 'locked' && state.id === item.id;
  const isActive = isHovered || isLocked;

  const cover = React.useMemo(() => coverDataUrlFromSeed(item.seed), [item.seed]);

  // ui events adapted
  const onEnter = () => dispatch({ type: 'enter', id: item.id });
  const onLeave = () => dispatch({ type: 'leave', id: item.id });
  const onToggle = () => dispatch({ type: 'toggleLock', id: item.id });

  return (
    <article
      className={cx(
        'card',
        isHovered && 'card--hovered',
        isLocked && 'card--locked'
      )}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      <button
        type="button"
        className="card__surface"
        onClick={onToggle}
        aria-pressed={isLocked}
        aria-label={`${item.title}${isLocked ? ', locked' : ''}`}
      >
        <div className="card__cover" aria-hidden="true">
          <img className="card__img" src={cover} alt="" />
          <div className={cx('card__reveal', isActive && 'card__reveal--on')} />
        </div>

        <div className="card__body">
          <div className="card__top">
            <h3 className="card__title">{item.title}</h3>

            {/* narrow by kind*/}
            {item.kind === 'case' ? (
              <div className="card__meta">
                <span className="card__muted">{item.year}</span>
                <span className="card__dot" aria-hidden="true">
                  ·
                </span>
                <span className="card__muted">{item.tags.join(' / ')}</span>
              </div>
            ) : item.kind === 'note' ? (
              <div className="card__meta">
                <span className="card__muted">{item.author ?? 'Note'}</span>
              </div>
            ) : item.kind === 'metric' ? (
              <div className="card__meta">
                <span className="card__muted">{item.label}</span>
              </div>
            ) : item.kind === 'link' ? (
              <div className="card__meta">
                <span className="card__muted">{item.label}</span>
              </div>
            ) : (
              assertNever(item)
            )}

            {/* content */}
            {item.kind === 'case' ? (
              item.subtitle ? <p className="card__text">{item.subtitle}</p> : null
            ) : item.kind === 'note' ? (
              <p className="card__quote">“{item.quote}”</p>
            ) : item.kind === 'metric' ? (
              <div className="card__metric">
                <div className="card__metricValue">{item.value}</div>
                {item.hint ? <div className="card__muted">{item.hint}</div> : null}
              </div>
            ) : item.kind === 'link' ? (
              <p className="card__text">
                Click to pin, then open when you’re ready.
              </p>
            ) : (
              assertNever(item)
            )}
          </div>

          {/* keeps hover lightweight */}
          {isLocked ? (
            <div className="card__actions">
              {item.kind === 'link' ? (
                <a
                  className="card__action"
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noreferrer' : undefined}
                >
                  Open ↗
                </a>
              ) : (
                <span className="card__muted">Pinned • Press Esc to close</span>
              )}
            </div>
          ) : null}
        </div>
      </button>
    </article>
  );
}

export function Gallery() {
  const [state, dispatch] = React.useReducer(galleryReducer, { mode: 'none' });

  useEscapeToClose(dispatch);

  return (
    <section className="gallery" aria-label="Palace">
      {ITEMS.map((item) => (
        <Card key={item.id} item={item} state={state} dispatch={dispatch} />
      ))}
    </section>
  );
}
