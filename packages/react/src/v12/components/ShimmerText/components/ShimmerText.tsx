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
import { motionTokens, cubicBezier } from '@carbon-labs/v12-motion';
import { DURATION_FLOOR_MS, SKELETON_WAVE } from '@carbon-labs/v12-motion';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import {
  useLoopVisibility,
  type LoopVisibility,
} from '@carbon-labs/react-util';
import './shimmer-text.scss';

/* ============================================================================
 * ShimmerText — a label that shows live work: a band passes through the
 * text, which rests a step quieter than the band.
 *
 *   band     one text layer: the words' fill is a moving gradient clipped
 *            to their glyphs (`background-clip: text`), so the band is
 *            drawn on the letters themselves, never on a copy of them, and
 *            the type weight never changes. The band is soft (eased stops,
 *            no hard middle), and as wide as the label is long: a share of
 *            the label's width along the sweep, `SHIMMER_TEXT.band` (75%),
 *            between `bandMinPx` (96) and `bandMaxPx` (240); or px
 *   colours  theme tokens, no solving at run time: the band in the primary
 *            text (`--cds-shimmer-band-color`), the words at rest one step
 *            quieter, the secondary text (`--cds-shimmer-rest-color`); a
 *            host can set either. Under the band's edges the two mix
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
}

export interface ShimmerTextProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children'
> {
  /** Whether the band sweeps. Default true. */
  active?: boolean;
  /** The element. Default `span`. */
  as?: ElementType;
  /** Tuning: the length rule's `shortSpeed`, `longSpeed` and `restMs`, and the band's `band` width. */
  motion?: Partial<ShimmerTextMotion>;
  children?: ReactNode;
}

/** Whether forced colors are on (read at use). */
export const forcedColors = () =>
  typeof matchMedia === 'function' &&
  matchMedia('(forced-colors: active)').matches;

/** The band's place along the sweep, px: a registered length, so it interpolates. */
export const SHIMMER_AT = '--cds-shimmer-at';
/** A reveal's band: its own layer of the fill and its own place, so it never contends with a pass. */
export const SHIMMER_RIDE_AT = '--cds-shimmer-ride';
/** A reveal's band's width, px: its own, so a pass keeps the label's. */
export const SHIMMER_RIDE_BAND = '--cds-shimmer-ride-band';
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
  const { reduced, timeScale } = useFeedbackMotion();
  const ref = useRef<HTMLElement>(null);
  // Off screen, closed or the page hidden: the pass holds, and comes back on its phase.
  const loopVis = useLoopVisibility(ref);
  const words =
    typeof children === 'string' || typeof children === 'number'
      ? String(children)
      : null;
  // The band needs plain words (a change of them re-times the pass), and motion.
  const banded = words != null && !reduced;
  const sweeping = active && banded;

  // The speed rule, for a reveal that crosses the label (`shimmerLabelSpeed`).
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !banded) return;
    rules.set(el, { shortSpeed, longSpeed });
    return () => void rules.delete(el);
  }, [banded, shortSpeed, longSpeed]);

  // `active` turned on or off: the words' colour moves between the host's and the rest on the
  // rest's own token, slowed with the family. Only for that change, so the host's own colour
  // changes (a rollover's glow in the letters) still reach the words at once. None under
  // reduced motion or forced colors (not banded): at once.
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
      style={bandStyle}>
      {children}
    </As>
  );
}
ShimmerText.displayName = 'ShimmerText';
