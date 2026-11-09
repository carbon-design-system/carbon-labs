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
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { useTheme } from '@carbon/react';
import {
  contrastRatio,
  motionTokens,
  parseColor,
  type RGBA,
  cubicBezier,
} from '@carbon-labs/v12-motion';
import { DURATION_FLOOR_MS, SKELETON_WAVE } from '@carbon-labs/v12-motion';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import {
  useLoopVisibility,
  type LoopVisibility,
} from '@carbon-labs/react-util';
import { onThemeChange } from '@carbon-labs/react-util';
import './shimmer-text.scss';

/* ============================================================================
 * ShimmerText — a label that shows live work: a band passes through the
 * text, which rests a step quieter than the band.
 *
 *   band     a copy of the words lies over them, in the band's color
 *            (`$text-primary`) and one step up in weight, and a soft mask
 *            shows it only under the band. The copy is the
 *            label's `::after`, drawn from `data-shimmer-words`: the words
 *            are in the page once, and it is silent to assistive technology.
 *            The band is soft (eased stops, no hard middle), and as wide as
 *            the label is long: a share of the
 *            label's width along the sweep, `SHIMMER_TEXT.band` (75%),
 *            between `bandMinPx` (96) and `bandMaxPx` (240); or px
 *   rest     under the band's edges and between passes the words are the
 *            primary text over their backdrop, solved per theme against that
 *            backdrop, as the skeleton's blocks are: as far toward it as text can be and still
 *            read, `SHIMMER_TEXT.restContrast` (4.5:1) on the backdrop
 *            (`solveShimmerRest`)
 *   ink      the band's colour is solved too, over the rest, so it is never
 *            too overt: the primary over the rest, as near the rest as keeps
 *            `SHIMMER_TEXT.bandContrast` (2.25:1) on it
 *            (`solveShimmerBand`),
 *            so every theme's band stands the same step above its rest. Both
 *            are solved as it starts and again when a theme changes round
 *            it. Before the first solve (and with no script), the
 *            rest is `$text-primary` at 60% and the band `$text-primary`
 *   weight   the copy is the same face with a stroke in its own color, as
 *            thick as the step from regular (400) to semibold (600) adds to
 *            Plex's stems (0.048em), at the next smaller size on Carbon's
 *            type scale: a 14px label takes what semibold adds
 *            at 12px, 0.58px (`shimmerStroke`). A stroke keeps every glyph's
 *            advance, so the heavier letters sit exactly on the lighter ones:
 *            Plex's 600 is 3 to 4% wider, and the variable face's width axis
 *            only matches a whole label to within a pixel, glyph by glyph
 *   pass     one rule by the words' length: the band crosses
 *            from wholly before the label to wholly past it on
 *            standard-productive at a speed by the words' length
 *            (`shimmerSpeed`: 0.09px/ms at "Thinking…"'s 66px, 0.16 at the
 *            long line's 381px, linearly between, held outside), then rests
 *            `SHIMMER_TEXT.restMs` (500ms), the same for every label, and
 *            passes again, so the pauses never run long. It is slow
 *            only where it is off the words, so it never stops on them
 *   start    a label's passes start when it does: its
 *            first pass sets off at once, the band from wholly before the
 *            words, the moment it mounts or turns active, never part-way
 *            across them and never after a wait for a page-wide phase.
 *            After a reveal (`playShimmerReveal`), which is a pass of its
 *            own, the first pass sets off one rest (`restMs`) after the
 *            reveal's band has gone, so the words keep the pass, rest,
 *            pass rhythm from their arrival, never waiting for a page
 *            phase's next pass (a step running a second or two would show none)
 *   wave     labels that start together (one commit: a page's labels as it
 *            loads) pass as one wave on the skeleton wave's angle (45°):
 *            the first along the sweep at once, each other `along / speed`
 *            (its own speed) after it, within one of its own passes. A
 *            change of words or of the clock keeps the phase
 *   states   `active` sweeps; inactive is plain text in its host's color,
 *            its band at rest before the words, there for a reveal to pass
 *            (`playShimmerReveal`). Turning it off finishes no pass: the band
 *            goes at once. The words' colour moves between the host's and
 *            the rest on its own clock (`SHIMMER_TEXT.restToken`,
 *            standard-productive), either way. The band needs plain words
 *            (a string); other children are plain text
 *   reduced  plain text in its host's color, and so under forced colors
 *   slow     the pass times the feedback family's time scale
 * ========================================================================== */

type EasingName = keyof typeof motionTokens.easing;
type DurationName = keyof typeof motionTokens.duration;

/** The weight under the band: the step from regular to medium (500) or to semibold (600), as a stroke in em. */
export type ShimmerWeight = 'regular' | 'medium' | 'semibold';

/** The stroke that adds what each weight adds to IBM Plex Sans's stems over regular, em (measured: 400 → 0.086em, 500 → 0.115em, 600 → 0.134em). */
export const SHIMMER_WEIGHT_EM: Record<ShimmerWeight, number> = {
  regular: 0,
  medium: 0.029,
  semibold: 0.048,
};

/** Which size's weight step the band adds: the next smaller on the type scale (the default), or the label's own. */
export type ShimmerWeightAt = 'smaller' | 'own';

/** Carbon's type scale, px (`@carbon/type`'s `scale`, its steps up to 92). */
export const TYPE_SCALE_PX = [
  12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 54, 60, 68, 76, 84, 92,
] as const;

/**
 * The band's stroke for a label of `fontPx`, px: what `weight` adds to the
 * stems at the next smaller size on the type scale (14px → 12px's), or at its
 * own. The scale's smallest (12px) has nothing smaller and keeps its own.
 */
export function shimmerStroke(
  fontPx: number,
  weight: ShimmerWeight = SHIMMER_TEXT.weight,
  at: ShimmerWeightAt = 'smaller'
): number {
  const smaller = TYPE_SCALE_PX.filter((s) => s < fontPx - 0.5).pop();
  return (
    SHIMMER_WEIGHT_EM[weight] *
    (at === 'smaller' && smaller != null ? smaller : fontPx)
  );
}

/** The shimmer's dials. The loading period and the angle are the skeleton wave's, read when used. */
export const SHIMMER_TEXT = {
  /**
   * The band's average speed across a label, px per ms along the sweep, by the words' length:
   * `short` for words `shortPx` long ("Thinking…",
   * 66px at 14px), `long` for words `longPx` long (the long line, 381px), linearly between, held outside
   * (`shimmerSpeed`).
   */
  speed: { short: 0.09, long: 0.16 },
  /** The words' length the short speed is for, px: "Thinking…" at 14px. */
  shortPx: 66,
  /** The words' length the long speed is for, px: "Reading the Q4 pipeline report and its regional breakdowns" at 14px. */
  longPx: 381,
  /**
   * The rest between passes, ms, the same for every label: one pass is its crossing and this
   * (`shimmerPass`). Half a loading period, so the pauses never run long.
   */
  restMs: SKELETON_WAVE.periodMs / 2,
  /**
   * The band's width: a share of the label's width along the sweep, soft on both sides, between
   * `bandMinPx` and `bandMaxPx`, narrower on short words and wider on long ones. "Thinking…" takes
   * the least (96px), the long line 75% of its 263px (197px).
   */
  band: '75%' as ShimmerBand,
  /** The narrowest a share makes the band, px along the sweep: a short label's. */
  bandMinPx: 96,
  /** The widest a share makes the band, px along the sweep: a long label's. */
  bandMaxPx: 240,
  /** The rest's contrast on its backdrop: the least readable (WCAG AA for text), so the band has the most room above it. */
  restContrast: 4.5,
  /**
   * The band's contrast on the rest: 2.25, so the band is never too overt (at `$text-primary` it
   * would be 3.98 and 3.64:1 on white and g100).
   */
  bandContrast: 2.25,
  /** The weight under the band: one step up from regular (Carbon's 400 → 600). */
  weight: 'semibold' as ShimmerWeight,
  /** The band's travel: standard-productive. */
  easing: 'standard-productive' as EasingName,
  /** The words' colour, host's ⇄ rest, as `active` turns on or off: its own clock, on `easing`. */
  restToken: 'fast-02' as DurationName,
  /** The sweep's direction, degrees: 0 = left → right, 90 = top → bottom. */
  get angleDeg(): number {
    return SKELETON_WAVE.angleDeg;
  },
};

/** A band width: px along the sweep, or a share of the label's width along it (`"60%"`), kept between `SHIMMER_TEXT.bandMinPx` and `bandMaxPx`. */
export type ShimmerBand = number | `${number}%`;

/** One pass over a box, before slow motion: its geometry and its clock. */
export interface ShimmerPass {
  /** The band's width along the sweep, px. */
  bandPx: number;
  /** The band's travel, px along the sweep: from wholly before the box to wholly past it. */
  span: number;
  /** The band's average speed, px per ms along the sweep: by the words' length (`shimmerSpeed`). */
  speed: number;
  /** The travel's time, ms: `span / speed`. */
  travelMs: number;
  /** The pass, ms: the travel and the rest (`SHIMMER_TEXT.restMs`). */
  periodMs: number;
}

/** The shimmer's length rule's numbers: the two speeds and the rest. */
export interface ShimmerRule {
  shortSpeed: number;
  longSpeed: number;
  restMs: number;
}

/**
 * The band's average speed for words `wordsPx` long, px per ms: `shortSpeed` (0.09) at
 * `SHIMMER_TEXT.shortPx` (66px), `longSpeed` (0.16) at `longPx` (381px), linearly by length between, held
 * outside. So a longer label crosses faster, but not in proportion: "Thinking…" crosses in 1.7s, the long
 * line in 3.0s.
 */
export function shimmerSpeed(
  wordsPx: number,
  shortSpeed = SHIMMER_TEXT.speed.short,
  longSpeed = SHIMMER_TEXT.speed.long
): number {
  const t = Math.min(
    1,
    Math.max(
      0,
      (wordsPx - SHIMMER_TEXT.shortPx) /
        (SHIMMER_TEXT.longPx - SHIMMER_TEXT.shortPx)
    )
  );
  return shortSpeed + (longSpeed - shortSpeed) * t;
}

/**
 * The rest: `band` over `backdrop`, as far toward the backdrop as keeps
 * `ratio` on it, as an opaque color (its channels whole, so the ratio holds
 * as drawn). The band itself when even it doesn't hold the ratio.
 */
export function solveShimmerRest(
  band: RGBA,
  backdrop: RGBA,
  ratio = SHIMMER_TEXT.restContrast
): RGBA {
  const mix = (a: number): RGBA =>
    [0, 1, 2]
      .map((i) => Math.round(a * band[i]! + (1 - a) * backdrop[i]!))
      .concat(1) as RGBA;
  const holds = (a: number) => contrastRatio(mix(a), backdrop) >= ratio;
  if (!holds(1)) return mix(1);
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (holds(mid)) hi = mid;
    else lo = mid;
  }
  return mix(hi);
}

/**
 * The band: `ink` (the primary) over `rest`, as near the rest as keeps `ratio` on it, as an opaque
 * color with whole channels. The ink itself when even it doesn't hold the ratio.
 */
export function solveShimmerBand(
  ink: RGBA,
  rest: RGBA,
  ratio = SHIMMER_TEXT.bandContrast
): RGBA {
  return solveShimmerRest(ink, rest, ratio);
}

/** A pass over a `width` × `height` box at the sweep's angle. Pure: the component, the reveal and the tests share it. */
export function shimmerPass({
  width,
  height,
  band = SHIMMER_TEXT.band,
  words = width,
  shortSpeed = SHIMMER_TEXT.speed.short,
  longSpeed = SHIMMER_TEXT.speed.long,
  restMs = SHIMMER_TEXT.restMs,
}: {
  width: number;
  height: number;
  band?: ShimmerBand;
  /** The words' own width, px, when the box is wider than they are (a grid cell, a stretched flex item). Default the box's. */
  words?: number;
} & Partial<ShimmerRule>): ShimmerPass {
  const a = (SHIMMER_TEXT.angleDeg * Math.PI) / 180;
  // The gradient line's length for this box at the sweep's angle.
  const line = width * Math.abs(Math.cos(a)) + height * Math.abs(Math.sin(a));
  // A share is of the words' width (never more than the box's), measured along the sweep, between the least and the most.
  const bandPx =
    typeof band === 'number'
      ? band
      : Math.min(
          SHIMMER_TEXT.bandMaxPx,
          Math.max(
            SHIMMER_TEXT.bandMinPx,
            (parseFloat(band) / 100) *
              Math.min(words, width) *
              Math.abs(Math.cos(a))
          )
        );
  const span = line + bandPx;
  // One rule for every label: the speed by the words' length, then the same short rest.
  const speed = shimmerSpeed(Math.min(words, width), shortSpeed, longSpeed);
  const travelMs = span / speed;
  return {
    bandPx,
    span,
    speed,
    travelMs,
    periodMs: travelMs + Math.max(0, restMs),
  };
}

/** The shimmer's tuning, as `motion` takes it: each one unset is `SHIMMER_TEXT`'s. */
export interface ShimmerTextMotion extends ShimmerRule {
  /** The band's average speed for a short label (`SHIMMER_TEXT.shortPx`, 66px), px per ms along the sweep. Default `SHIMMER_TEXT.speed.short` (0.09). */
  shortSpeed: number;
  /** Its speed for a long one (`SHIMMER_TEXT.longPx`, 381px); a length between takes a speed between. Default `SHIMMER_TEXT.speed.long` (0.16). */
  longSpeed: number;
  /** The rest between passes, ms, every label's. Default `SHIMMER_TEXT.restMs` (500). */
  restMs: number;
  /** The band's width: px along the sweep, or a share of the label's width (`"60%"`), 96 to 240px. Default `SHIMMER_TEXT.band` (75%). */
  band: ShimmerBand;
  /** The weight under the band. Default `SHIMMER_TEXT.weight` (semibold). */
  weight: ShimmerWeight;
  /** Which size's weight step the band adds: the next smaller on the type scale (default), or the label's own. */
  weightAt: ShimmerWeightAt;
}

export interface ShimmerTextProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children'
> {
  /** Whether the band sweeps. Default true. */
  active?: boolean;
  /** The element. Default `span`. */
  as?: ElementType;
  /** Tuning: the length rule's `shortSpeed`, `longSpeed` and `restMs`, the band's `band` width and `weight`, and `weightAt`. */
  motion?: Partial<ShimmerTextMotion>;
  children?: ReactNode;
}

/** Whether forced colors are on (read at use). */
export const forcedColors = () =>
  typeof matchMedia === 'function' &&
  matchMedia('(forced-colors: active)').matches;

const opaque = (s: string) => {
  const c = parseColor(s);
  return c && c[3] >= 0.999 ? c : null;
};

/**
 * What the words sit on: the first opaque surface behind them, as the
 * skeleton's backdrop read finds it (a surface's frame, `data-snap-frame`; an
 * ancestor's background; a `::before` that paints it), except that a
 * `::before` counts only if it covers its element: a StepList's 1px rule is
 * a `::before` too, and isn't what its words sit on.
 */
export function shimmerBackdrop(el: HTMLElement): RGBA {
  for (let n = el.parentElement; n; n = n.parentElement) {
    const frame = n.querySelector<HTMLElement>(':scope > [data-snap-frame]');
    const framed =
      frame && !frame.contains(el)
        ? opaque(getComputedStyle(frame).backgroundColor)
        : null;
    if (framed) return framed;
    const own = opaque(getComputedStyle(n).backgroundColor);
    if (own) return own;
    const b = getComputedStyle(n, '::before');
    if (
      b.content !== 'none' &&
      b.position === 'absolute' &&
      parseFloat(b.width) >= n.clientWidth - 1 &&
      parseFloat(b.height) >= n.clientHeight - 1
    ) {
      const painted = opaque(b.backgroundColor);
      if (painted) return painted;
    }
  }
  return [255, 255, 255, 1];
}

/** The band's place along the sweep, px: a registered length, so it interpolates. */
export const SHIMMER_AT = '--cds-shimmer-at';
/** The band's copy of the words for the label's own passes: its pseudo-element. */
export const SHIMMER_BAND = '::after';
/** A reveal's band: its own copy and its own place, so it never contends with a pass. */
export const SHIMMER_RIDE = '::before';
export const SHIMMER_RIDE_AT = '--cds-shimmer-ride';
let registered = false;
/** Registers the band's place, once. */
export function registerShimmer() {
  if (registered) return;
  registered = true;
  try {
    for (const name of [SHIMMER_AT, SHIMMER_RIDE_AT])
      CSS.registerProperty({
        name,
        syntax: '<length>',
        inherits: false,
        initialValue: '0px',
      });
  } catch {
    // Already registered (a second copy of the kit), or unsupported: then the band steps instead of gliding.
  }
}

/** Each banded label's speed rule (its `motion`'s speeds): for a reveal to cross it at its pace. */
const rules = new WeakMap<
  HTMLElement,
  Pick<ShimmerRule, 'shortSpeed' | 'longSpeed'>
>();

/** A banded label's own pass speed, px per ms along the sweep: by its words' length and its rule. */
export function shimmerLabelSpeed(el: HTMLElement): number {
  const range = document.createRange();
  range.selectNodeContents(el);
  const r = rules.get(el);
  return shimmerSpeed(
    Math.min(
      el.offsetWidth,
      range.getBoundingClientRect().width || el.offsetWidth
    ),
    r?.shortSpeed,
    r?.longSpeed
  );
}

/** Each banded label's own pass while it sweeps, and its rest between crossings, ms (slowed): for a reveal to hand over to. */
const passes = new WeakMap<HTMLElement, { anim: Animation; restMs: number }>();
/** Each banded label's visibility hold: a pass placed outside a render is re-held if it can't be seen. */
const visOf = new WeakMap<HTMLElement, LoopVisibility>();
/** A label's first pass, held until this time on the document timeline (a reveal's band, then a rest). */
const deferred = new WeakMap<HTMLElement, number>();
/** The labels that started in this commit, their first passes not yet placed. */
let starting:
  | { el: HTMLElement; anim: Animation; lag: number; period: number }[]
  | null = null;

const timelineNow = () =>
  Number(document.timeline?.currentTime ?? performance.now());

/**
 * Places the first passes of the labels that started together: the first along the sweep at once, each
 * other its `along / speed` behind it within one of its own passes (the wave), a deferred one at its time.
 * Run once the commit's layout effects (a reveal's among them) have all run.
 */
function placeStarting() {
  const group = (starting ?? []).filter((s) => s.anim.playState !== 'idle');
  starting = null;
  const now = timelineNow();
  const free = group.filter((s) => !deferred.has(s.el));
  const lead = Math.min(...free.map((s) => s.lag));
  for (const s of group) {
    const at = deferred.get(s.el);
    deferred.delete(s.el);
    s.anim.startTime = at ?? now + ((s.lag - lead) % s.period);
    visOf.get(s.el)?.refresh();
  }
}

/**
 * Holds a banded label's first (or next) pass until `afterMs` from now (slowed), then one rest: a reveal's
 * band crossing the words is a pass, so the label's own sets off a rest after it has gone. For
 * `playShimmerReveal`; a label not sweeping is left alone.
 */
export function deferShimmerPass(el: HTMLElement, afterMs: number) {
  const pass = passes.get(el);
  if (!pass || pass.anim.playState === 'idle') return;
  const at = timelineNow() + afterMs + pass.restMs;
  if (starting?.some((s) => s.el === el)) deferred.set(el, at);
  else {
    pass.anim.startTime = at;
    visOf.get(el)?.refresh();
  }
}

/** A motion token's easing, for the Web Animations API. */
export const easingCss = (name: EasingName) =>
  cubicBezier(motionTokens.easing[name]);

export function ShimmerText({
  active = true,
  as: As = 'span',
  motion,
  className,
  style,
  children,
  ...rest
}: ShimmerTextProps) {
  const shortSpeed = motion?.shortSpeed ?? SHIMMER_TEXT.speed.short;
  const longSpeed = motion?.longSpeed ?? SHIMMER_TEXT.speed.long;
  const restMs = motion?.restMs ?? SHIMMER_TEXT.restMs;
  const band = motion?.band ?? SHIMMER_TEXT.band;
  const weight = motion?.weight ?? SHIMMER_TEXT.weight;
  const weightAt = motion?.weightAt ?? 'smaller';
  const { reduced, timeScale } = useFeedbackMotion();
  const ref = useRef<HTMLElement>(null);
  // Off screen, closed or the page hidden: the pass holds, and comes back on its phase; the rest isn't re-solved.
  const loopVis = useLoopVisibility(ref);
  const words =
    typeof children === 'string' || typeof children === 'number'
      ? String(children)
      : null;
  // The band needs plain words (its copy is drawn from them), and motion.
  const banded = words != null && !reduced;
  const sweeping = active && banded;
  // A Carbon theme scope's change re-solves the rest at once (a page's own theme follows at the next pass).
  const { theme } = useTheme();

  // The speed rule, for a reveal that crosses the label (`shimmerLabelSpeed`).
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !banded) return;
    rules.set(el, { shortSpeed, longSpeed });
    return () => void rules.delete(el);
  }, [banded, shortSpeed, longSpeed]);

  // The band's stroke, from the label's size: set before paint, so the copy never shows another weight.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !banded) return;
    el.style.setProperty(
      '--cds-shimmer-weight',
      `${shimmerStroke(parseFloat(getComputedStyle(el).fontSize), weight, weightAt).toFixed(3)}px`
    );
    return () => {
      el.style.removeProperty('--cds-shimmer-weight');
    };
  }, [banded, weight, weightAt, words, className]);

  // `active` turned on or off: the words' colour moves between the host's and the rest on the
  // rest's own token, slowed with the family. Only for that change, so the host's own colour
  // changes (a rollover's glow in the letters) still reach the words at once. None under
  // reduced motion or forced colors (not banded): at once. Before the rest's solve below, whose
  // style read would otherwise land the new colour first.
  const shownSweeping = useRef(sweeping);
  useLayoutEffect(() => {
    const el = ref.current;
    if (shownSweeping.current === sweeping) return;
    shownSweeping.current = sweeping;
    if (!el || !banded || forcedColors()) return;
    const ms = Math.max(
      DURATION_FLOOR_MS,
      motionTokens.duration[SHIMMER_TEXT.restToken] * timeScale
    );
    const own = el.style.transition;
    el.style.transition = `color ${ms}ms ${easingCss(SHIMMER_TEXT.easing)}`;
    const id = window.setTimeout(() => {
      el.style.transition = own;
    }, ms);
    return () => {
      window.clearTimeout(id);
      el.style.transition = own;
    };
  }, [sweeping, banded, timeScale]);

  // The rest, solved against the backdrop, and the band against the rest, as it starts and again on a theme change.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !sweeping || forcedColors()) return;
    const solve = () => {
      // Nobody sees it: the next pass after it's back solves it.
      if (loopVis.hidden()) return;
      // The ink: the band's color before its solve (a host's `--cds-shimmer-band-color`, else the primary
      // text). Read and solved in one go, so no frame shows it unsolved.
      el.style.removeProperty('--cds-shimmer-band-solved');
      const ink = parseColor(getComputedStyle(el, SHIMMER_BAND).color);
      if (!ink) return;
      const rest = solveShimmerRest(ink, shimmerBackdrop(el));
      const band = solveShimmerBand(ink, rest);
      el.style.setProperty(
        '--cds-shimmer-rest-solved',
        `rgb(${rest[0]} ${rest[1]} ${rest[2]})`
      );
      el.style.setProperty(
        '--cds-shimmer-band-solved',
        `rgb(${band[0]} ${band[1]} ${band[2]})`
      );
    };
    solve();
    // Again when a theme changes round it, or a surface under it eases to a new colour, once a frame.
    let raf = 0;
    const offTheme = onThemeChange(
      el,
      () => {
        if (!raf)
          raf = requestAnimationFrame(() => {
            raf = 0;
            solve();
          });
      },
      { backgrounds: true }
    );
    // Back on screen: solved at once (a re-run while hidden leaves it unsolved).
    const off = loopVis.onShow(solve);
    return () => {
      off();
      offTheme();
      cancelAnimationFrame(raf);
      el.style.removeProperty('--cds-shimmer-rest-solved');
      el.style.removeProperty('--cds-shimmer-band-solved');
    };
  }, [sweeping, theme, className, loopVis]);

  // The pass's start on the document timeline, kept across a re-run while it sweeps; a new start once it stops.
  const phase = useRef<number | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (
      !el ||
      !sweeping ||
      forcedColors() ||
      typeof el.animate !== 'function'
    ) {
      phase.current = null;
      return;
    }
    registerShimmer();
    // The band follows the words' length, not the box's (a label in a grid cell or a stretched row is wider than its words).
    const range = document.createRange();
    range.selectNodeContents(el);
    const pass = shimmerPass({
      width: el.offsetWidth,
      height: el.offsetHeight,
      band,
      words: range.getBoundingClientRect().width,
      shortSpeed,
      longSpeed,
      restMs,
    });
    const period = Math.max(DURATION_FLOOR_MS, pass.periodMs * timeScale);
    el.style.setProperty('--cds-shimmer-band', `${pass.bandPx}px`);
    // Across on standard-productive, then at rest past the words until the next pass.
    const end = pass.travelMs / pass.periodMs;
    const frames: Keyframe[] = [
      {
        [SHIMMER_AT]: '0px',
        offset: 0,
        easing: easingCss(SHIMMER_TEXT.easing),
      },
      { [SHIMMER_AT]: `${pass.span}px`, offset: end },
    ];
    if (end < 1) frames.push({ [SHIMMER_AT]: `${pass.span}px`, offset: 1 });
    const anim = el.animate(frames, {
      duration: period,
      iterations: Infinity,
      pseudoElement: SHIMMER_BAND,
    });
    passes.set(el, { anim, restMs: period * (1 - end) });
    visOf.set(el, loopVis);
    if (phase.current != null) {
      // A change of words or of the clock while it sweeps: the pass carries on from its start.
      anim.startTime = phase.current;
    } else {
      // A start: with the labels starting in this commit, once they all have (the wave), or a reveal's rest after it.
      const a = (SHIMMER_TEXT.angleDeg * Math.PI) / 180;
      const r = el.getBoundingClientRect();
      const along =
        (r.left + window.scrollX) * Math.cos(a) +
        (r.top + window.scrollY) * Math.sin(a);
      if (!starting) {
        starting = [];
        queueMicrotask(placeStarting);
      }
      starting.push({
        el,
        anim,
        lag: (along / pass.speed) * timeScale,
        period,
      });
    }
    return () => {
      // Held off screen, it keeps the start it had.
      const start = loopVis.startTime(anim);
      phase.current = start == null ? null : Number(start);
      anim.cancel();
      if (passes.get(el)?.anim === anim) passes.delete(el);
      el.style.removeProperty('--cds-shimmer-band');
    };
  }, [
    sweeping,
    shortSpeed,
    longSpeed,
    restMs,
    band,
    timeScale,
    words,
    loopVis,
  ]);

  const bandStyle = banded
    ? ({
        '--cds-shimmer-angle': `${90 + SHIMMER_TEXT.angleDeg}deg`,
        ...style,
      } as CSSProperties)
    : style;
  return (
    <As
      {...rest}
      ref={ref}
      className={[
        'cds-shimmer-text',
        banded && 'cds-shimmer-text--banded',
        sweeping && 'cds-shimmer-text--active',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-shimmer-words={banded ? words : undefined}
      style={bandStyle}>
      {children}
    </As>
  );
}
ShimmerText.displayName = 'ShimmerText';
