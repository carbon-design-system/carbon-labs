/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type SVGAttributes,
} from 'react';
import {
  DURATION_FLOOR_MS,
  SKELETON_WAVE,
  SNAP,
  durationStepForDistance,
  motionTokens,
  snapFadeFor,
  type DurationToken,
  easingCss,
} from '@carbon-labs/v12-motion';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import { LOADER_KIT, useKitProps } from '@carbon-labs/react-kit-defaults';
import { useLoopVisibility } from '@carbon-labs/react-util';
import './spinner.scss';

/* ============================================================================
 * Spinner — the kit's one circular indeterminate mark. Loading,
 * InlineLoading (through the status mark's pending kind), the busy Button
 * and ComboButton, the modal's busy
 * primary button, the file uploader (through ProgressRing) and the chat
 * prompt's Stop ring all draw this one.
 *
 *   look      a quiet base ring and a loud arc. The base
 *             is a full ring in the loaders' neutral base (`--cds-loader-base`,
 *             a host's `--cds-spinner-base` over it); the arc is
 *             `currentColor` (neutral: the host's colour). Hero
 *             (`variant="hero"`): the arc in the kit's brand (`--cds-hero-loader`,
 *             IBM blue unless a `KitDefaults brand` or a brand zone says
 *             otherwise), over the same neutral base, as the ring's and the
 *             progress bar's (`_loader-color.scss`, styles/_brand.scss).
 *             Neutral by default, as every loader; `KitDefaults variant`
 *             reaches it when no `variant` is given (a busy button passes
 *             `neutral`, so its spinner stays the button's colour)
 *   gap      by size, whatever the stroke (`loaderGap`): 2px at 16px
 *             (`SPINNER_MOTION.gapSmall`) to 4px at 64px (`gapLarge`),
 *             linearly by size between, rounded to whole pixels: 2, 2, 2,
 *             3, 3 and 4px at 16, 20, 24, 32, 48 and 64px.
 *             `gapStyle: 'break'` (default): the base breaks round the arc,
 *             stopping short of each of its ends by the gap along the
 *             circle, so the arc never touches it. `"inset"`: the arc on its
 *             own circle, the gap inside the base ring
 *   arc       half the circle (`SPINNER_MOTION.arc`), swinging between 30%
 *             and 70% of it (`swing`, ±20%) on its own, slower clock
 *             (`swingPeriods` loading periods), its head and tail moving
 *             apart and back about its middle
 *   turn      one turn per loading period (`SPINNER_MOTION.periodMs`, the
 *             skeleton wave's 1000ms), linear
 *   phase     from its reveal: the turn and the swing start where the reveal
 *             ends, from 12 o'clock, so spinners that start together turn
 *             together.
 *   line      by size: size / 16, at most 2px (`loaderStroke`): 1px at
 *             16px, 2px from 32px up, or `stroke` px. One drawing at every
 *             size: the icons' 32-unit box, the base's outer edge at 14
 *             (Carbon's ring)
 *   start     the reveal, as it mounts too, clockwise only, from 12
 *             o'clock: the turn and the swing
 *             wait while the arc draws on from 12 o'clock, its tail held
 *             there and its head running clockwise to the arc's length, and
 *             the base fades up; then the turn and the swing start from
 *             there. Its clock is the step for the head's travel in px
 *             (`loaderRevealStep`), never under `start` (`moderate-01`), on
 *             entrance-productive with its end eased to the speed the head
 *             then turns at, so the turn takes over without a hitch
 *   enter    a new spinner (and a ring with no value) comes in at 60% scale
 *             and grows to its size alongside the reveal: the svg's `scale` from
 *             `SPINNER_MOTION.enterScale`, its line counter-scaled so it
 *             holds its px, as the hand-off's out does. The step for its
 *             outer edge's growth in px, never under `SPINNER_MOTION.enter`
 *             (`spinnerEnterStep`: `moderate-02`, 220ms, at every size),
 *             entrance-productive. So it
 *             outlasts the reveal (`moderate-01`), the turn starting while it
 *             still grows. `enterScale` and `enter` are dials (`motion`, and
 *             the store). No fade. Each fresh start: as it mounts, and
 *             starting again after a full stop
 *   stop      `active={false}`: the turn and the swing hold, the tail
 *             catches up with the head and the base fades (`fast-02`,
 *             exit-productive). A change mid-way turns round from where it is
 *   reduced   nothing turns or swings: three still dots in the arc's box,
 *             there or gone at once, at full size. A still arc over the base would read as
 *             an amount (ProgressRing's look); dots read as "in progress".
 *             Chosen by the feedback family's `reduced`, never a media query
 * ========================================================================== */

/** Where the gap goes: the base breaks round the arc, or the arc sits inside the base. */
export type SpinnerGapStyle = 'break' | 'inset';
export type SpinnerVariant = 'neutral' | 'hero';

/**
 * The spinner's motion and drawing, read when a spinner or ring draws. Its
 * tunable numbers (`SpinnerMotion`) change through `setSpinnerMotion`, which
 * redraws every spinner and ring on the page (below). A continuous turn's period
 * isn't a transition duration, so it isn't a duration token: it's the loading
 * clock, the skeleton wave's period (`SKELETON_WAVE.periodMs`, 1000ms), which
 * the progress bar's indeterminate loop also runs on. The swing's clock is a
 * number of those periods.
 */
export const SPINNER_MOTION = {
  /** One turn, ms: the loading clock. */
  get periodMs(): number {
    return SKELETON_WAVE.periodMs;
  },
  /** The arc drawing on from 12, as it starts: the shortest its reveal takes (`loaderRevealStep`). */
  start: 'moderate-01' as DurationToken,
  /** The arc closing, as it stops: one step faster. */
  stop: 'fast-02' as DurationToken,
  /**
   * The scale a new spinner comes in at, growing to 1 as it reveals (its line holding its px): 0.6.
   */
  enterScale: 0.6,
  /**
   * The shortest the scale-in takes (`spinnerEnterStep`): its edge's travel is 2–11px at 60%, a `fast-02`
   * on travel alone, which on entrance-productive is all but over in 50ms. So `moderate-02` (220ms), at
   * every size, on entrance-productive.
   */
  enter: 'moderate-02' as DurationToken,
  /** The arc's share of the circle, about which it swings. */
  arc: 0.5,
  /** How far the arc swings either side, as a share of the circle (0: a fixed arc): 30% to 70%. */
  swing: 0.2,
  /** The swing's clock, in loading periods: slower than the turn, and not a whole number of turns. */
  swingPeriods: 2.5,
  /** One swing, ms. */
  get swingMs(): number {
    return this.periodMs * this.swingPeriods;
  },
  /** The gap between the base and the arc, px, at 16px (the smallest), whatever the stroke. */
  gapSmall: 2,
  /**
   * The gap, px, at 64px (the largest); sizes between take it linearly by size, rounded to whole
   * pixels (`loaderGap`): 2 at 16px and 4 at 64px, in whole pixel steps between.
   */
  gapLarge: 4,
  /** Where the gap goes. */
  gapStyle: 'break' as SpinnerGapStyle,
  /** The stroke at each size, × size / 16. */
  strokeScale: 1,
  /** The stroke's most, px (before the scale): the large spinner's 2px. */
  strokeMax: 2,
};

/* ── Tuning: a `motion` prop per spinner, and a shared store for all ─────
 * The numbers below are the tunable ones: the arc's share, the
 * swing, its period, the gap (its two px, by size, and its style) and the
 * stroke. The kit's one tuning pattern:
 *
 *   one       `motion` on a Spinner or a ProgressRing
 *             (`Partial<SpinnerMotion>`), over the store's numbers, for that
 *             instance alone (`resolveSpinnerMotion`), as ProgressBar's and
 *             ShimmerText's `motion` are theirs
 *   every     the store, for a tuning page only, to dial every spinner at once:
 *             `setSpinnerMotion` writes the numbers into `SPINNER_MOTION`
 *             and tells every mounted Spinner and ProgressRing
 *             (`useSpinnerMotion`), so busy buttons, InlineLoading, the
 *             uploader, a ring with no value and the chat's Stop ring all
 *             follow at once while they are dialled. A product never
 *             calls it: it changes every spinner on the page
 *
 * A plain store, not CSS custom properties: the swing is keyframes and the
 * gap and stroke are geometry, all worked out in JS. The kit doesn't
 * remember a draft; the tuning page does.
 * Once a draft is chosen, its numbers go into `SPINNER_MOTION` above, and
 * `SPINNER_SHIPPED` follows. */

/** The spinner's dialled numbers. */
export type SpinnerMotion = Pick<
  typeof SPINNER_MOTION,
  | 'arc'
  | 'swing'
  | 'swingPeriods'
  | 'gapSmall'
  | 'gapLarge'
  | 'gapStyle'
  | 'strokeScale'
  | 'strokeMax'
  | 'enterScale'
  | 'enter'
>;
export const SPINNER_TUNING_KEYS = [
  'arc',
  'swing',
  'swingPeriods',
  'gapSmall',
  'gapLarge',
  'gapStyle',
  'strokeScale',
  'strokeMax',
  'enterScale',
  'enter',
] as const satisfies readonly (keyof SpinnerMotion)[];

/** The current dialled numbers. */
export function spinnerTuning(): SpinnerMotion {
  const {
    arc,
    swing,
    swingPeriods,
    gapSmall,
    gapLarge,
    gapStyle,
    strokeScale,
    strokeMax,
    enterScale,
    enter,
  } = SPINNER_MOTION;
  return {
    arc,
    swing,
    swingPeriods,
    gapSmall,
    gapLarge,
    gapStyle,
    strokeScale,
    strokeMax,
    enterScale,
    enter,
  };
}

/** The numbers as shipped (`SPINNER_MOTION` as written above), for a reset and a readout. */
export const SPINNER_SHIPPED: Readonly<SpinnerMotion> =
  Object.freeze(spinnerTuning());

/** Whether `v` is a value the dial `key` takes. */
const isDial = (key: keyof SpinnerMotion, v: unknown) =>
  key === 'gapStyle'
    ? v === 'break' || v === 'inset'
    : key === 'enter'
      ? typeof v === 'string' && v in motionTokens.duration
      : typeof v === 'number' && Number.isFinite(v);

/**
 * One spinner's numbers: its own `motion` over the store's
 * (`SPINNER_MOTION`). Anything else in `motion` (a stale or mistyped key, a
 * number that isn't one) is skipped.
 */
export function resolveSpinnerMotion(
  motion?: Partial<SpinnerMotion>
): SpinnerMotion {
  const t = spinnerTuning();
  if (!motion) return t;
  for (const key of SPINNER_TUNING_KEYS) {
    const v = (motion as Record<string, unknown>)[key];
    if (isDial(key, v)) (t as Record<string, unknown>)[key] = v;
  }
  return t;
}

const tuned = new Set<() => void>();
let tuning = 0;

/**
 * A tuning page's dial for every spinner: the given numbers into
 * `SPINNER_MOTION`, then every mounted Spinner and ProgressRing draws again
 * with them. For a tuning page only; one spinner's numbers are its `motion` prop.
 * Anything else in `patch` (a stale or mistyped key, a number that isn't
 * one) is skipped.
 */
export function setSpinnerMotion(patch: Partial<SpinnerMotion>): void {
  let changed = false;
  for (const key of SPINNER_TUNING_KEYS) {
    const v = (patch as Record<string, unknown>)[key];
    if (!isDial(key, v) || SPINNER_MOTION[key] === v) continue;
    (SPINNER_MOTION as Record<string, unknown>)[key] = v;
    changed = true;
  }
  if (!changed) return;
  tuning += 1;
  tuned.forEach((fn) => fn());
}

/** Back to the numbers as shipped. */
export function resetSpinnerMotion(): void {
  setSpinnerMotion(SPINNER_SHIPPED);
}

/** Called after each change to the dialled numbers; returns the unsubscribe. */
export function subscribeSpinnerMotion(fn: () => void): () => void {
  tuned.add(fn);
  return () => void tuned.delete(fn);
}

const tuningVersion = () => tuning;

/** Redraws the calling component whenever the spinner is dialled; returns a version number. */
export function useSpinnerMotion(): number {
  return useSyncExternalStore(
    subscribeSpinnerMotion,
    tuningVersion,
    tuningVersion
  );
}

export const SPINNER_SIZES = [16, 20, 24, 32, 48, 64] as const;
export type SpinnerSize = (typeof SPINNER_SIZES)[number];

/**
 * The loaders' stroke for a size, px: size / 16, at most 2px (1px at 16px,
 * 1.25 at 20, 1.5 at 24, 2px at 32, 48 and 64), times the draft's scale (1).
 * The spinner, the progress ring and anything that should match their
 * weight read it; the progress bar's 1px and 2px lines are its 16px and
 * 32px. `m`: a spinner's own numbers (`resolveSpinnerMotion`), else the store's.
 */
export function loaderStroke(
  size: number,
  m: Pick<SpinnerMotion, 'strokeMax' | 'strokeScale'> = SPINNER_MOTION
): number {
  return Math.min(size / 16, m.strokeMax) * m.strokeScale;
}

/**
 * The loaders' gap for a size, px, whatever the stroke: `gapSmall` (2px) at
 * 16px to `gapLarge` (6px) at 64px, linearly by size, held outside:
 * 2, 2.33, 2.67, 3.33, 4.67 and 6px at 16, 20, 24, 32, 48 and 64px. `m` as for
 * `loaderStroke`.
 */
export function loaderGap(
  size: number,
  m: Pick<SpinnerMotion, 'gapSmall' | 'gapLarge'> = SPINNER_MOTION
): number {
  const t = Math.min(1, Math.max(0, (size - 16) / (64 - 16)));
  return Math.round(m.gapSmall + (m.gapLarge - m.gapSmall) * t);
}

/** The loaders' drawing box: the icons' 32 units, the base ring's outer edge at 14 (Carbon's ring). */
export const LOADER_BOX = 32;
/** The base ring's outer edge, in box units: where a loader's footprint ends, whatever its line. */
export const LOADER_EDGE = 14;

export interface LoaderDrawing {
  /** The line, in box units. */
  line: number;
  /** The base ring's radius and circumference. */
  r: number;
  circ: number;
  /** The arc's radius and circumference (the base's, unless inset). */
  arcR: number;
  arcCirc: number;
  /** The gap, in box units: along the circle (break), or between the circles (inset). */
  gap: number;
  gapStyle: SpinnerGapStyle;
}

/** The spinner's (and the progress ring's) drawing at a size, a stroke (px) and its `motion` (over the store's numbers). */
export function loaderDrawing(
  size: number,
  stroke?: number,
  motion?: Partial<SpinnerMotion>
): LoaderDrawing {
  const m = resolveSpinnerMotion(motion);
  const { gapStyle } = m;
  const line = Math.min(
    8,
    Math.max(0.25, ((stroke ?? loaderStroke(size, m)) * LOADER_BOX) / size)
  );
  const r = LOADER_EDGE - line / 2;
  // The gap is px on screen, by size alone: the same at any stroke.
  const gap = (loaderGap(size, m) * LOADER_BOX) / size;
  const arcR = gapStyle === 'inset' ? Math.max(line / 2, r - line - gap) : r;
  return {
    line,
    r,
    circ: 2 * Math.PI * r,
    arcR,
    arcCirc: 2 * Math.PI * arcR,
    gap,
    gapStyle,
  };
}

/**
 * One swing of the arc's share: a sine about `arc`, sampled finely enough
 * that the linear steps between samples don't show.
 */
function swingFrames(arc: number, swing: number): Keyframe[] {
  const n = 24;
  return Array.from({ length: n + 1 }, (_, i) => ({
    '--cds-spinner-share': `${arc + swing * Math.sin((2 * Math.PI * i) / n)}`,
  }));
}

const ease = (name: 'entrance-productive' | 'exit-productive') =>
  easingCss(name);

/**
 * The reveal's clock: the step for a travel in px (the arc's length on
 * screen, as it draws on from 12), never under `SPINNER_MOTION.start`, so
 * spinners of every size that start together turn together. The progress
 * ring's draw-on takes it too.
 */
export function loaderRevealStep(px: number): DurationToken {
  const step = durationStepForDistance(px);
  return motionTokens.duration[step] >
    motionTokens.duration[SPINNER_MOTION.start]
    ? step
    : SPINNER_MOTION.start;
}

/**
 * entrance-productive, its end handle set so the curve lands at `slope` (its
 * final rate, in the curve's own units: speed × duration ÷ distance) rather
 * than at rest, so a turn that takes over at that speed doesn't hitch.
 */
function easeInto(slope: number): string {
  const [x1, y1, x2] = motionTokens.easing['entrance-productive'];
  const k = Math.min(1.5, Math.max(0, slope));
  return `cubic-bezier(${x1}, ${y1}, ${x2}, ${(1 - (1 - x2) * k).toFixed(4)})`;
}

/**
 * The entrance's clock: the step for the outer edge's growth in px, never
 * under `SPINNER_MOTION.enter` (`moderate-02`), so the scale-in can be seen on
 * every spinner. The growth is 2.8–11.2px (16 to 64px at 60%), a `fast-02` on
 * travel alone; floored, it is `moderate-02` at every size (220ms), as the reveal's clock is
 * floored at `moderate-01` (`loaderRevealStep`). `m`: a spinner's own numbers,
 * else the store's.
 */
export function spinnerEnterStep(
  px: number,
  m: Pick<SpinnerMotion, 'enter'> = SPINNER_MOTION
): DurationToken {
  const step = durationStepForDistance(px);
  return motionTokens.duration[step] > motionTokens.duration[m.enter]
    ? step
    : m.enter;
}

/**
 * The entrance: the spinner's svg grows from `enterScale` (0.6) to its size,
 * its lines counter-scaled so they hold their px. Its clock is
 * `spinnerEnterStep` for its outer edge's growth in px, entrance-productive.
 * `motion`: the spinner's own numbers, over the store's. Returns the
 * animations (none without Web Animations, or with nothing to grow).
 */
export function playSpinnerEnter(
  svg: SVGSVGElement,
  size: number,
  timeScale: number,
  motion?: Partial<SpinnerMotion>
): Animation[] {
  if (typeof svg.animate !== 'function') return [];
  const m = resolveSpinnerMotion(motion);
  const from = Math.min(1, Math.max(0.5, m.enterScale));
  if (from > 0.9999) return [];
  const edge = ((LOADER_EDGE * size) / LOADER_BOX) * (1 - from);
  const opts: KeyframeAnimationOptions = {
    duration: spinnerMs(spinnerEnterStep(edge, m), timeScale),
    easing: ease('entrance-productive'),
  };
  // `scale`, not `transform`: the turn is the transform.
  const anims = [svg.animate([{ scale: `${from}` }, { scale: '1' }], opts)];
  // The line is the inverse of the scale on every frame: the easing is the whole effect's, so these keyframes sit on
  // the eased progress, as the scale's straight line does, and 1 / scale is sampled finely enough that the line holds
  // its px to well under 1% (two keyframes held it at 85%, but bow by 7% from 60%).
  const n = 12;
  for (const c of svg.querySelectorAll<SVGCircleElement>(
    '.cds-spinner__base, .cds-spinner__arc'
  )) {
    const w = parseFloat(c.getAttribute('stroke-width') ?? '') || 0;
    const frames = Array.from({ length: n + 1 }, (_, k) => ({
      strokeWidth: `${w / (from + ((1 - from) * k) / n)}`,
    }));
    anims.push(c.animate(frames, opts));
  }
  return anims;
}

/** A loader leaving with no status: to the snap mark's `from`, on the mark's out (a tag's) and the exit curve. */
export const SPINNER_EXIT = {
  to: SNAP.mark.from,
  out: 'fast-01' as DurationToken,
  ease: 'exit-productive' as const,
};

/** Shrinks about its centre, lines held, fading over the last 40ms, ending at `endMs` (default the stop's clock):
 *  its last frames, or with `fill` the whole of it. Held; callers cancel it on a restart, skip it when reduced. */
export function playSpinnerExit(
  svg: SVGSVGElement,
  timeScale: number,
  endMs = spinnerMs(SPINNER_MOTION.stop, timeScale),
  { fill = false }: { fill?: boolean } = {}
): Animation[] {
  if (typeof svg.animate !== 'function') return [];
  const out = fill
    ? endMs
    : Math.min(endMs, spinnerMs(SPINNER_EXIT.out, timeScale));
  const fade = Math.min(
    out,
    spinnerMs(snapFadeFor(motionTokens.duration[SPINNER_EXIT.out]), timeScale)
  );
  const live = parseFloat(getComputedStyle(svg).scale);
  const from = Number.isFinite(live) ? live : 1;
  const to = SPINNER_EXIT.to;
  // `scale`, not `transform` (the turn); held at its live scale until the shrink starts.
  const opts: KeyframeAnimationOptions = {
    duration: out,
    delay: endMs - out,
    easing: ease(SPINNER_EXIT.ease),
    fill: 'both',
  };
  const anims = [svg.animate([{ scale: `${from}` }, { scale: `${to}` }], opts)];
  // The line, the inverse of the scale on every frame, as the entrance holds it.
  const n = 12;
  for (const c of svg.querySelectorAll<SVGCircleElement>(
    '.cds-spinner__base, .cds-spinner__arc'
  )) {
    const w = parseFloat(c.getAttribute('stroke-width') ?? '') || 0;
    anims.push(
      c.animate(
        Array.from({ length: n + 1 }, (_, k) => ({
          strokeWidth: `${w / (from + ((to - from) * k) / n)}`,
        })),
        opts
      )
    );
  }
  anims.push(
    svg.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: fade,
      delay: endMs - fade,
      easing: 'linear',
      fill: 'forwards',
    })
  );
  return anims;
}

export interface SpinnerProps extends Omit<
  SVGAttributes<SVGSVGElement>,
  'children' | 'stroke'
> {
  /** px: 16, 20, 24, 32, 48 or 64. Default 16. */
  size?: SpinnerSize;
  /** The line, px. Default size / 16, at most 2px (`loaderStroke`): 1px at 16px, 2px from 32px. */
  stroke?: number;
  // @carbon-proposal api: variant-prop — The colour treatment is one `variant` prop (inverse, tonal, outlined, hero, neutral or filled), so colour is never said by a role or a structure. TBD
  /** `neutral` (default): the arc in the host's colour. `hero`: the arc in the kit's brand (IBM blue by default; `KitDefaults brand`). Both over the neutral base. Not given: `KitDefaults variant`, else neutral. */
  variant?: SpinnerVariant;
  /**
   * Tuning, this spinner's alone: any of `SpinnerMotion` (the arc's share,
   * the swing and its period, the gap's px and style, the stroke's scale
   * and most) over the shipped numbers, or the store's (`setSpinnerMotion`).
   * `{ gapStyle: 'break' }` keeps the base breaking round the arc whatever
   * the store holds.
   */
  motion?: Partial<SpinnerMotion>;
  /** Turning. Default true. False: the arc closes and the base fades (the dots go at once). */
  active?: boolean;
  /** Its name for assistive technology (an image with a title). None: decorative, hidden. */
  description?: string;
  /** Called once the arc has closed after `active` goes false (at once under reduced motion). */
  onStopped?: () => void;
}

/** A clock in ms: the token at the family's time scale, never under the floor. */
export function spinnerMs(token: DurationToken, timeScale: number): number {
  return Math.max(DURATION_FLOOR_MS, motionTokens.duration[token] * timeScale);
}

/** The document timeline's time now, ms. */
const timelineNow = () =>
  Number(document.timeline.currentTime ?? performance.now());

export function Spinner({
  size = 16,
  stroke,
  variant: variantProp,
  motion,
  active = true,
  description,
  onStopped,
  className,
  style,
  ...rest
}: SpinnerProps) {
  const { reduced, timeScale } = useFeedbackMotion();
  // KitDefaults: the provider's variant when none is given; every loader is neutral by default.
  const { variant = 'neutral' } = useKitProps(
    { variant: variantProp },
    LOADER_KIT
  );
  useSpinnerMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  // Off screen, closed or the page hidden: the turn and the swing hold, and come back on their phase.
  const loopVis = useLoopVisibility(svgRef);
  const loops = useRef<Animation[]>([]);
  const draw = useRef<Animation | null>(null);
  /** The entrance's animations (the scale, the lines' counter-scale), while it grows. */
  const entering = useRef<Animation[]>([]);
  const shut = useRef(!active);
  /** Drawing on from 12 (or back to it, stopped mid-way): the tail held at 12, the turn and the swing waiting. */
  const revealing = useRef(false);
  /** When the turn and the swing started (the document timeline, ms), once the reveal has ended. */
  const origin = useRef<number | null>(null);
  const mounted = useRef(false);
  const stopped = useRef(onStopped);
  useLayoutEffect(() => {
    stopped.current = onStopped;
  });

  const m = resolveSpinnerMotion(motion);
  const d = loaderDrawing(size, stroke, m);
  const c = LOADER_BOX / 2;
  const { arc, swing } = m;
  const period = Math.max(
    DURATION_FLOOR_MS,
    SPINNER_MOTION.periodMs * timeScale
  );
  const swingPeriod = Math.max(
    DURATION_FLOOR_MS,
    SPINNER_MOTION.periodMs * m.swingPeriods * timeScale
  );
  // The turn's first angle: the arc's tail (half the arc behind its middle, at 3 o'clock in the turning frame) at 12.
  const turnFrom = arc * 180 - 90;

  // The turn and the swing: from where the reveal ended (`origin`), or waiting at their start while it draws on.
  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg || reduced || typeof svg.animate !== 'function') return;
    const turn = svg.animate(
      [
        { transform: `rotate(${turnFrom}deg)` },
        { transform: `rotate(${turnFrom + 360}deg)` },
      ],
      {
        duration: period,
        iterations: Infinity,
        easing: 'linear',
      }
    );
    const all = [turn];
    if (swing > 0)
      all.push(
        svg.animate(swingFrames(arc, swing), {
          duration: swingPeriod,
          iterations: Infinity,
          easing: 'linear',
        })
      );
    all.forEach((a) => {
      if (origin.current === null) {
        a.pause();
        a.currentTime = 0;
        return;
      }
      a.startTime = origin.current;
      if (shut.current || !active || revealing.current) a.pause();
    });
    loops.current = all;
    return () => {
      all.forEach((a) => a.cancel());
      loops.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `active` is read for a re-dial while stopped
  }, [reduced, period, swingPeriod, arc, swing, turnFrom]);

  // The arc's start and stop, from wherever it is now; the class holds where it lands.
  useLayoutEffect(() => {
    const first = !mounted.current;
    mounted.current = true;
    const svg = svgRef.current;
    // A fresh start (mounting, or after a full stop) reveals from 12; a stop it hadn't finished turns round.
    const fresh = active && (first || shut.current);
    if (fresh) {
      revealing.current = true;
      origin.current = null;
      loops.current.forEach((a) => {
        a.pause();
        a.currentTime = 0;
      });
    } else if (active && !revealing.current)
      loops.current.forEach((a) => a.play());
    else if (!active) {
      loops.current.forEach((a) => a.pause());
      // Stopped while off screen: they stay stopped when it comes back.
      loopVis.release(loops.current);
    }
    if (active) shut.current = false;
    // The arc's tail is held at 12 while it reveals (or, stopped mid-reveal, while it goes back there).
    svg?.style.setProperty(
      '--cds-spinner-anchor',
      revealing.current ? '1' : '0'
    );
    // Reduced motion: the dots, at once. A spinner mounted stopped: nothing to close.
    if (!svg || reduced || (first && !active)) {
      draw.current?.cancel();
      draw.current = null;
      revealing.current = false;
      svg?.style.setProperty('--cds-spinner-anchor', '0');
      if (active) {
        origin.current = timelineNow();
        loops.current.forEach((a) => (a.startTime = origin.current));
      }
      if (!active && !first) stopped.current?.();
      if (!active) shut.current = true;
      return;
    }
    const live = draw.current
      ? parseFloat(getComputedStyle(svg).getPropertyValue('--cds-spinner-draw'))
      : NaN;
    draw.current?.cancel();
    const from = Number.isFinite(live) ? live : active ? 0 : 1;
    let duration = spinnerMs(SPINNER_MOTION.stop, timeScale);
    let easing = ease('exit-productive');
    if (active) {
      // The reveal: the head's travel in px sets the clock; it lands at the speed the head then turns at.
      const share = revealing.current
        ? arc
        : parseFloat(
            getComputedStyle(svg).getPropertyValue('--cds-spinner-share')
          ) || arc;
      const travel = (share * d.arcCirc * size) / LOADER_BOX;
      duration = spinnerMs(loaderRevealStep(travel), timeScale);
      const headSpeed =
        360 / period + (180 * swing * 2 * Math.PI) / swingPeriod;
      easing = revealing.current
        ? easeInto((headSpeed * duration) / (share * 360))
        : ease('entrance-productive');
    }
    const anim = svg.animate(
      [
        { '--cds-spinner-draw': `${from}` },
        { '--cds-spinner-draw': active ? '1' : '0' },
      ],
      { duration, easing }
    );
    draw.current = anim;
    // A fresh start comes in at 60% and grows to its size, alongside the reveal.
    if (fresh) {
      entering.current.forEach((a) => a.cancel());
      entering.current = playSpinnerEnter(svg, size, timeScale, motion);
    }
    anim.finished.then(
      () => {
        if (draw.current !== anim) return;
        draw.current = null;
        if (active && revealing.current) {
          // Drawn on: the turn and the swing start here, the tail leaving 12. The anchor doesn't matter from here (the arc is whole).
          revealing.current = false;
          svg.style.setProperty('--cds-spinner-anchor', '0');
          origin.current = timelineNow();
          loops.current.forEach((a) => (a.startTime = origin.current));
          // Drawn on off screen: the turn waits there too.
          loopVis.refresh();
        }
        if (!active) {
          revealing.current = false;
          svg.style.setProperty('--cds-spinner-anchor', '0');
          shut.current = true;
          stopped.current?.();
        }
      },
      () => {}
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per start or stop
  }, [active]);
  // Unmounting (or a strict-mode remount, which then draws on again as a mount does).
  useLayoutEffect(
    () => () => {
      draw.current?.cancel();
      draw.current = null;
      entering.current.forEach((a) => a.cancel());
      entering.current = [];
      mounted.current = false;
    },
    []
  );

  // The geometry, in box units; spinner.scss draws the dashes from these and the two animated shares.
  const vars = {
    '--cds-spinner-share': `${arc}`,
    '--cds-spinner-c': d.circ.toFixed(3),
    '--cds-spinner-ac': d.arcCirc.toFixed(3),
    '--cds-spinner-gap': d.gap.toFixed(3),
  } as CSSProperties;
  // The still dots: across the middle, as wide as the line allows.
  const dot = Math.min(4, Math.max(1.5, 1.5 * d.line));

  return (
    <svg
      {...rest}
      ref={svgRef}
      className={[
        'cds-spinner',
        `cds-spinner--${d.gapStyle}`,
        variant === 'hero' && 'cds-spinner--hero',
        !active && 'cds-spinner--stop',
        reduced && 'cds-spinner--reduced',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      viewBox={`0 0 ${LOADER_BOX} ${LOADER_BOX}`}
      width={size}
      height={size}
      style={{ ...vars, ...style }}
      data-spinner-size={size}
      {...(description
        ? { role: 'img', 'aria-label': description }
        : { 'aria-hidden': true })}>
      {description && <title>{description}</title>}
      <circle
        className="cds-spinner__base"
        cx={c}
        cy={c}
        r={d.r}
        strokeWidth={d.line}
      />
      <circle
        className="cds-spinner__arc"
        cx={c}
        cy={c}
        r={d.arcR}
        strokeWidth={d.line}
      />
      {reduced && (
        <g className="cds-spinner__dots">
          {[c - 10, c, c + 10].map((cx) => (
            <circle key={cx} cx={cx} cy={c} r={dot} />
          ))}
        </g>
      )}
    </svg>
  );
}
Spinner.displayName = 'Spinner';
