# Ink Gallery UI

![Next.js](https://img.shields.io/badge/Next.js-App%20Router-111111?style=flat&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-Client%20Components-111111?style=flat&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-111111?style=flat&logo=typescript&logoColor=white)
![WebGL](https://img.shields.io/badge/WebGL-Fluid%20Canvas-111111?style=flat&logo=webgl&logoColor=white)
![A11y](https://img.shields.io/badge/A11y-Reduced%20Motion%20%2B%20ARIA-111111?style=flat&logo=accessibility&logoColor=white)


A small UI-design demo: an interactive card gallery placed over a fluid canvas -- hovering becomes feedback, cursor movement turns into atmosphere.  

---

## Goals

- Practice **React + TypeScript patterns** in a realistic product scene.
- Keep a clean separation between:
  - UI components (normal React)
  - the fluid effect (background layer)
  - the bridge between them (event forwarding)

---

## What’s inside

### 1) Gallery built with discriminated unions (TypeScript)
Cards are typed as a union (`CardItem`) with a `kind` discriminator (`case`, `note`, `metric`, `link`).  
That keeps rendering explicit and safe via type narrowing.

### 2) Reducer-driven UI states
Card behavior uses a reducer to keep interaction states predictable.
Gallery is a state machine, consisting of _hover preview_, _pinned_, _idle_.

### 3) Accessibility awareness
- **`prefers-reduced-motion`**: disables the fluid effect when requested.
- **ARIA semantics** for pinned state / status when enabled.

### 4) WebGL fluid as a background layer (with robust event bridging)
The fluid sim is initialized once via dynamic import and runs its own RAF loop.

### 5) Tone-mapping
The fluid is processed like a visual material to match the scene setting:
- saturation/brightness/contrast tuning
- optional scrim/vignette

---

## Tech stack

- **Next.js (App Router)**
- **React**
- **TypeScript**
- **webgl-fluid**
- CSS for layout + card glass treatment + tone-map

---

## Project structure (high-level)

- `components/FluidStage.tsx` — canvas + UI overlay composition
- `hooks/useFluid.ts` — dynamic import + pointer forwarding + local coordinate patching
- `components/Gallery.tsx` — union-typed models + reducer interactions
- `app/gallery.css` — gallery grid + card visuals
- `app/fluid.css` — tone-map + scrim/vignette
- `app/page.tsx` — demo layout

---

## Run locally

```bash
npm install
npm run dev

