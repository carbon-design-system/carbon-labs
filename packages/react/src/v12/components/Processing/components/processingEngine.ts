/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  SKELETON_WAVE,
  motionTokens,
  type DurationToken,
  type EasingToken,
  easingCss,
} from '@carbon-labs/v12-motion';
import { clamp01 } from '@carbon-labs/v12-motion';

/* ============================================================================
 * The Processing engine: the framework-free choreography behind
 * <Processing>, on carbon-motion's tokens.
 *
 * It drives four dots; a view layer (the React component, or a web
 * component later) only renders the markup and forwards calls. Each dot
 * sits at 0,0 and is placed by its transform, in polar terms round the
 * drawing's centre: `translate(centre) rotate(angle) translate(radius)
 * scale(presence)`. A dot is a group of rings whose scale is the pulse
 * ("The pulse as a transform"), or one circle whose `r` is.
 *
 *   clock     one page clock for every mark: the loading period's phase on
 *             the document timeline (its grid, as the skeleton wave's), and
 *             a slow-motion change keeps the phase where it is. The pulse
 *             and the spin both read it, so marks on a page pulse and turn
 *             together whenever each one mounted
 *   pulse     each dot's pulse is one infinite animation on that clock, at
 *             its own phase: the dots pulse in sets, with time between
 *             them, one after another a quarter of a period apart in every
 *             formation (the square's four too, not compressed), each
 *             swelling into its ring over 225ms and settling over 600ms,
 *             then all at rest for the same quiet in every formation,
 *             175ms. So a set is 1.5 periods in the line and
 *             the triangle and 1.75 in the square (`processingSetPeriods`),
 *             on the page clock's grid for its formation. A pulse is never
 *             restarted: when a dot takes another place in the set its
 *             phase slides there, gently (a twelfth of a period a period);
 *             into or out of the square the set changes, so the dots finish
 *             the set they are in and the new set starts on the new grid
 *   presence  growing in (the load-in), shrinking out and the square's
 *             fourth dot are each dot's scale, so a dot joins the running
 *             pulse wherever it is: the load-in starts at once and never
 *             waits for, or stretches to, the grid
 *   swing     every formation change is one swing, the original's arcs:
 *             the formation turns clockwise round the centre,
 *             PROCESSING_MOTION.swingDeg into a shape (150°) and at least
 *             PROCESSING_MOTION.unwindDeg into the line (90°), every dot on
 *             an arc (spiralling in or out as its radius changes, lifting
 *             out to the original's
 *             arc radius between two shapes), in a cascade, the longest arc
 *             first. Line → shape, shape → line and triangle ↔ square all
 *             swing; none passes through another formation. The clock is
 *             the longest arc's (PROCESSING_MOTION.travel). An unwind gives
 *             the line's places to whichever dots the shortest swing brings
 *             there, as the original does
 *   turns     a new request mid-swing starts from where the dots are and how
 *             fast they are going, and swings on clockwise at least as far
 *             as they are already going: it never reverses, never jumps
 *   wiggle    each dot in turn bobs and comes back: up from the line; out
 *             from the centre (the shape's centroid) in a shape, half as far
 *   idle      while nothing moves no script runs: the pulses, and in a shape
 *             one spin animation per dot, are Web Animations. Swings,
 *             presence, the wiggle and a phase sliding are drawn frame by
 *             frame
 *
 * Every clock is read when a move starts: the loading period
 * (`SKELETON_WAVE.periodMs`), the duration tokens, and the host's time scale
 * (slow motion), so a token draft reaches it too.
 * ========================================================================== */

export type ProcessingMode = 'loading' | 'triangle' | 'square' | 'out';

/** Every method resolves true once its state is reached, false if superseded. */
export interface ProcessingEngine {
  /** Restart from nothing: grow in, in `mode`. Static paints end states only. */
  run(
    mode: ProcessingMode,
    loop: boolean,
    staticOnly: boolean
  ): Promise<boolean>;
  /**
   * Go to `mode` from wherever the dots are. Restarts instead when nothing is
   * showing (before the first run, after out) or `loop` / `staticOnly` changed.
   */
  setMode(
    mode: ProcessingMode,
    loop: boolean,
    staticOnly: boolean
  ): Promise<boolean>;
  toLoading(): Promise<boolean>;
  toTriangle(): Promise<boolean>;
  toSquare(): Promise<boolean>;
  wiggle(): Promise<boolean>;
  out(): Promise<boolean>;
  /** The host's time scale changed: retime the pulse, the spin and any move in place, keeping their phase. */
  retime(): void;
  destroy(): void;
}

export interface ProcessingEngineOptions {
  /** Multiplies every duration (slow motion), read as each move starts. Default 1. */
  timeScale?: () => number;
  /**
   * The engine started or re-timed its infinite loops (the pulses, the spin):
   * the host re-applies its visibility to them (`useLoopVisibility`), so loops
   * started off screen hold there too.
   */
  onLoops?: () => void;
}

/** A step of the travel table: swings whose longest arc is shorter than `under` drawing units take `token`. */
export interface ProcessingTravelStep {
  under: number;
  token: DurationToken;
}

/**
 * Processing's motion, on carbon-motion's tokens. The pulse and the spin are
 * the loading clock (read when used); every swing takes its clock from its
 * longest arc; presence and the wiggle are duration tokens.
 */
export const PROCESSING_MOTION = {
  /** One pulse, ms: the loading clock. */
  get periodMs(): number {
    return SKELETON_WAVE.periodMs;
  },
  /** One steady revolution of a formation, in loading periods. */
  revolutionPeriods: 8,
  /**
   * How far a change into a shape (from the line, or from the other shape)
   * turns the formation clockwise, degrees: a long, dramatic sweep (the
   * original swings up to 330° into a shape). A shape
   * can stand anywhere, so the swing is exactly this, give or take each
   * dot's fold (±30° from the line to a triangle). Not wider: the fastest
   * dot grows with the swing, on a clock that can't grow past slow-03 (a
   * swing turned back mid-move peaks at 1.77 units a frame at 90°, 2.07 at
   * 150°, 2.3 at 180°).
   */
  swingDeg: 150,
  /**
   * The least a change into the line turns the formation clockwise, degrees
   * (the original's unwind turned at least this far). The line's places are
   * fixed, so an unwind swings on to the first time they come round: this up
   * to one turn of the shape's symmetry more (90° to 210° from a triangle,
   * 90° to 180° from a square). Not wider: the longest unwind is already
   * the fastest dot on the slowest clock the mark has (slow-03).
   */
  unwindDeg: 90,
  /**
   * A swing's clock by the longest arc any dot travels, in units of the
   * 32-unit drawing (so a swing takes the same time at every size). Duration
   * follows travel, on the mark's own scale, as the selection kit's glides
   * have theirs: line → square swings the line's ends about 18 units,
   * triangle ↔ square about 20 and line → triangle about 22, so every swing
   * into a shape takes slow-03; an unwind 11 to 29. (slow-03 from 16 units,
   * so the wider swings take the longer clock and keep their speed; slow-02
   * and slow-03 are the mark's recorded exception.)
   */
  travel: [
    { under: 8, token: 'moderate-03' },
    { under: 12, token: 'slow-01' },
    { under: 16, token: 'slow-02' },
    { under: Infinity, token: 'slow-03' },
  ] as readonly ProcessingTravelStep[],
  /** The delay between dots setting off on a swing, the longest arc first. */
  swingStagger: 'fast-00' as DurationToken,
  /** Each dot growing in (the load-in, or a restart). */
  grow: 'slow-01' as DurationToken,
  /** The delay between dots growing in. */
  growStagger: 'fast-02' as DurationToken,
  /** Each dot shrinking to nothing. */
  out: 'fast-01' as DurationToken,
  /** The delay between dots shrinking. */
  outStagger: 'fast-00' as DurationToken,
  /** One dot's bob, in the line or in a shape. */
  wiggle: 'slow-01' as DurationToken,
  /** The delay between dots' bobs. */
  wiggleStagger: 'moderate-02' as DurationToken,
  /**
   * One dot's swell into its ring, in loading periods: 0.225, 225ms.
   */
  pulseSwell: 0.225,
  /** Its settle back to rest, in loading periods (0.6): the pulse is 825ms. */
  pulseSettle: 0.6,
  /**
   * The delay between one dot's pulse and the next in a set, in loading periods: a quarter (250ms), in
   * every formation.
   */
  pulseStagger: 0.25,
  /**
   * The quiet between sets, in loading periods: from the last dot's pulse back at rest to the first
   * dot's next pulse, the same in every formation, the square too: 175ms. A set is its pulses and
   * this quiet (`processingSetPeriods`):
   * the line's and the triangle's three pulses start 0, 250 and 500ms in, the last is back at rest by
   * 1325ms, and the next set starts at 1500ms; the square's fourth starts at 750ms, is at rest by 1575ms,
   * and its next set starts at 1750ms.
   */
  pulseRest: 0.175,
  /** The pulse's swell and a dot growing in. */
  entrance: 'entrance-expressive' as EasingToken,
  /** A dot shrinking. */
  exit: 'exit-expressive' as EasingToken,
  /** The pulse's fall back to rest: it leaves the peak at rest, so the peak is round, not a cusp. */
  settle: 'standard-productive' as EasingToken,
  /** The swings: their speed peaks under three times the average, never a whip. */
  move: 'standard-productive' as EasingToken,
  /** The wiggle. */
  standard: 'standard-expressive' as EasingToken,
};

/** The duration token for a swing whose longest arc is `units` of the 32-unit drawing. */
export function processingTravelToken(units: number): DurationToken {
  const table = PROCESSING_MOTION.travel;
  for (const step of table) {
    if (units < step.under) {
      return step.token;
    }
  }
  return table[table.length - 1]!.token;
}

export type ProcessingKind = 'line' | 'triangle' | 'square';
type Kind = ProcessingKind;

// ─── Geometry (32×32 viewBox) ─────────────────────────────────────────────────

const C = 16;
const R_LINE = 8; // the line's outer dots, from the centre
const R_VERTEX = 6; // triangle and square vertices share this circle
const R_ARC = 7; // the original's arc: a swing between two shapes lifts out to it
const WIGGLE_RISE = 6; // the line's bob, up, in viewBox units
const WIGGLE_PUSH = 3; // a shape's bob, out from the centre: half the line's
const EPS = 1e-3;
/** How fast a pulse's phase slides, in periods per period (steadily): a dot's interval changes by a twelfth while it slides. */
const SLIDE_RATE = 1 / 12;

/** One place in a formation: its angle (from the formation's base), radius, presence and its turn in the set of pulses. */
interface Slot {
  deg: number;
  r: number;
  p: number;
  /** Its pulse's turn in a set: 0 first, a stagger apart (`PROCESSING_MOTION.pulseStagger`). */
  order: number;
}

/*
 * The formations, place by place. In the line, 0 is left, 1 the centre and 2
 * right (angles clockwise from 3 o'clock; the centre's is nominal); the
 * fourth place is hidden at the centre. The shapes are clockwise from their
 * base, which turns with the page's spin, so each pulse runs clockwise round
 * the shape with the spin. The triangle keeps its fourth place hidden in its
 * open side, where the square's fourth dot grows in, its turn in the set the
 * fourth's, so it joins the set where the square's fourth pulses (the line's
 * hidden place too). Each dot holds the same
 * place number from formation to formation (Formation.perm), except that an
 * unwind may hand the line's places round.
 */
const SLOTS: Record<Kind, readonly Slot[]> = {
  line: [
    { deg: 180, r: R_LINE, p: 1, order: 0 },
    { deg: 270, r: 0, p: 1, order: 1 },
    { deg: 0, r: R_LINE, p: 1, order: 2 },
    { deg: 90, r: 0, p: 0, order: 3 },
  ],
  triangle: [
    { deg: 0, r: R_VERTEX, p: 1, order: 0 },
    { deg: 120, r: R_VERTEX, p: 1, order: 1 },
    { deg: 240, r: R_VERTEX, p: 1, order: 2 },
    { deg: 300, r: R_VERTEX, p: 0, order: 3 },
  ],
  square: [
    { deg: 0, r: R_VERTEX, p: 1, order: 0 },
    { deg: 90, r: R_VERTEX, p: 1, order: 1 },
    { deg: 180, r: R_VERTEX, p: 1, order: 2 },
    { deg: 270, r: R_VERTEX, p: 1, order: 3 },
  ],
};
/** How many places turn round in an unwind: the shape's visible ones (the triangle's hidden place stays put). */
const TURNING: Record<Kind, number> = { line: 3, triangle: 3, square: 4 };
/** A place's pulse phase, in loading periods into its set: its turn × the stagger. */
const phOf = (slot: Slot) => slot.order * PROCESSING_MOTION.pulseStagger;
/**
 * One set of pulses in a formation, in loading periods: every shown dot's pulse in turn, a stagger
 * apart, and then the quiet (`PROCESSING_MOTION.pulseRest`), so the quiet is the same in every
 * formation: 1.5 periods for the line and the triangle, 1.75 for the square.
 */
export function processingSetPeriods(kind: Kind): number {
  const { pulseStagger, pulseSwell, pulseSettle, pulseRest } =
    PROCESSING_MOTION;
  return (
    (TURNING[kind] - 1) * pulseStagger + pulseSwell + pulseSettle + pulseRest
  );
}
/** Where a shape stands when it appears on its own, and its still picture: the triangle point up, the square level. */
const HOME: Record<Kind, number> = { line: 0, triangle: 150, square: 135 };
const IDENTITY = [0, 1, 2, 3] as const;

// ─── Appearance ───────────────────────────────────────────────────────────────

const R_REST = '0.875px';
const R_PEAK = '2.5px';
const SW1 = '1.72';

type Curve = (x: number) => number;
const curves = new Map<EasingToken, Curve>();
/** A token's cubic-bezier as a function, for the moves drawn frame by frame. */
const curve = (token: EasingToken): Curve => {
  let fn = curves.get(token);
  if (fn) {
    return fn;
  }
  const [x1, y1, x2, y2] = motionTokens.easing[token] as [
    number,
    number,
    number,
    number,
  ];
  const at = (s: number, a: number, b: number) =>
    3 * (1 - s) * (1 - s) * s * a + 3 * (1 - s) * s * s * b + s * s * s;
  fn = (x: number) => {
    if (x <= 0) {
      return 0;
    }
    if (x >= 1) {
      return 1;
    }
    let lo = 0;
    let hi = 1;
    let s = x;
    for (let k = 0; k < 30; k++) {
      const v = at(s, x1, x2);
      if (Math.abs(v - x) < 1e-7) {
        break;
      }
      if (v < x) {
        lo = s;
      } else {
        hi = s;
      }
      s = (lo + hi) / 2;
    }
    return at(s, y1, y2);
  };
  curves.set(token, fn);
  return fn;
};
const bezier = (token: EasingToken) => easingCss(token);

/** One pulse over a set's clock (`setPeriods` loading periods): swell to the peak, round over it, settle to rest, hold to the next set. */
const pulseFrames = (setPeriods: number): Keyframe[] => {
  const { pulseSwell, pulseSettle } = PROCESSING_MOTION;
  return [
    { r: R_REST, easing: bezier(PROCESSING_MOTION.entrance) },
    {
      r: R_PEAK,
      offset: pulseSwell / setPeriods,
      easing: bezier(PROCESSING_MOTION.settle),
    },
    { r: R_REST, offset: Math.min(1, (pulseSwell + pulseSettle) / setPeriods) },
    { r: R_REST },
  ];
};

// ─── Math ─────────────────────────────────────────────────────────────────────

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;
const mod = (x: number, m: number) => ((x % m) + m) % m;
/** Into (−180, 180]. */
const wrap180 = (deg: number) => 180 - mod(180 - deg, 360);
const fmt = (n: number) => Math.round(n * 1e4) / 1e4;
/** The weighted circular mean of `degs`, or null when nothing weighs. */
const meanDeg = (degs: number[], weights: number[]) => {
  let x = 0;
  let y = 0;
  degs.forEach((d, k) => {
    x += weights[k]! * Math.cos(toRad(d));
    y += weights[k]! * Math.sin(toRad(d));
  });
  return Math.hypot(x, y) < 1e-6 ? null : toDeg(Math.atan2(y, x));
};

/** Whether this environment implements the Web Animations API (jsdom does not). */
export const canAnimate = () =>
  typeof Element !== 'undefined' &&
  typeof Element.prototype.animate === 'function';

// ─── The pulse as a transform ─────────────────────────────────────────────────

/*
 * A ring keeps its stroke as it swells, and a scale would swell the stroke
 * too. So a dot drawn as a group holds PROCESSING_RINGS fixed rings, each at
 * the peak's outer size: from a solid dot (the rest) to the peak's ring. One
 * scale moves them all, on the `r` pulse's keyframes and curves, so the
 * outer edge is exactly the `r` pulse's (`r` and half the stroke); the ring
 * that shows is the one whose hole is nearest the pulse's at that moment (a
 * step of opacity), within 0.2 units. Transform and opacity animate off the
 * main thread: at rest the pulse costs no layout, no style and no script. A
 * dot drawn as one circle pulses its `r`, as before.
 */
const REST = parseFloat(R_REST);
const PEAK = parseFloat(R_PEAK);
const HALF_STROKE = parseFloat(SW1) / 2;
const OUTER = PEAK + HALF_STROKE;
/** The peak ring's hole, a share of its outer radius. */
const PEAK_HOLE = (PEAK - HALF_STROKE) / OUTER;
/** How many rings a dot drawn as a group holds. */
export const PROCESSING_RINGS = 5;
const holeOf = (k: number) => (PEAK_HOLE * k) / (PROCESSING_RINGS - 1);
/** Ring `k`'s circle: its radius and stroke, its outer edge the peak's. */
export function processingRing(k: number): { r: number; stroke: number } {
  const stroke = OUTER * (1 - holeOf(k));
  return { r: fmt(OUTER - stroke / 2), stroke: fmt(stroke) };
}
/** The scale that puts the rings' outer edge where a circle of radius `r` has its own. */
const scaleOf = (r: number) => `scale(${fmt((r + HALF_STROKE) / OUTER)})`;
/** The `r` at which the pulse's hole is `hole` of its outer radius. */
const rOfHole = (hole: number) => (HALF_STROKE * (1 + hole)) / (1 - hole);
/** The first progress at which `ease` reaches `y`. */
const inverse = (ease: Curve, y: number) => {
  const N = 200;
  for (let i = 1; i <= N; i++) {
    if (ease(i / N) < y) {
      continue;
    }
    let lo = (i - 1) / N;
    let hi = i / N;
    for (let k = 0; k < 24; k++) {
      const mid = (lo + hi) / 2;
      if (ease(mid) >= y) {
        hi = mid;
      } else {
        lo = mid;
      }
    }
    return hi;
  }
  return 1;
};
/** Ring `k`'s keyframes over a set: the scale every ring shares, and its own opacity's steps. */
const ringFrames = (setPeriods: number, k: number) => {
  const { pulseSwell, pulseSettle } = PROCESSING_MOTION;
  const swell = pulseSwell / setPeriods;
  const settle = Math.min(1, (pulseSwell + pulseSettle) / setPeriods);
  const span = PEAK - REST;
  // Where the swell, then the settle, passes a hole of `h`.
  const up = (h: number) =>
    swell *
    inverse(curve(PROCESSING_MOTION.entrance), (rOfHole(h) - REST) / span);
  const down = (h: number) =>
    swell +
    (settle - swell) *
      inverse(curve(PROCESSING_MOTION.settle), (PEAK - rOfHole(h)) / span);
  const last = PROCESSING_RINGS - 1;
  const lo = k > 0 ? (holeOf(k - 1) + holeOf(k)) / 2 : null;
  const hi = k < last ? (holeOf(k) + holeOf(k + 1)) / 2 : null;
  // Shown while the hole is between `lo` and `hi`: on the swell, then on the settle.
  const steps: [number, number][] = [];
  if (lo !== null) {
    steps.push([up(lo), 1]);
  }
  if (hi !== null) {
    steps.push([up(hi), 0], [down(hi), 1]);
  }
  if (lo !== null) {
    steps.push([down(lo), 0]);
  }
  const first = lo === null ? 1 : 0;
  const scale: Keyframe[] = [
    { transform: scaleOf(REST), easing: bezier(PROCESSING_MOTION.entrance) },
    {
      transform: scaleOf(PEAK),
      offset: swell,
      easing: bezier(PROCESSING_MOTION.settle),
    },
    { transform: scaleOf(REST), offset: settle },
    { transform: scaleOf(REST) },
  ];
  const opacity: Keyframe[] = [
    { opacity: first, offset: 0, easing: 'step-end' },
    ...steps.map(([offset, value]) => ({
      opacity: value,
      offset,
      easing: 'step-end',
    })),
    { opacity: first, offset: 1 },
  ];
  return { scale, opacity };
};

/** What the engine does with a dot's pulse: one animation, or a ring group's together. */
interface Pulse {
  startTime: CSSNumberish | null;
  readonly effect: { updateTiming(timing: OptionalEffectTiming): void } | null;
  onfinish: Animation['onfinish'];
  cancel(): void;
}
/** A dot's rings, or none (a dot drawn as one circle). */
const ringsOf = (d: SVGElement): SVGElement[] =>
  d instanceof SVGCircleElement
    ? []
    : [...d.querySelectorAll<SVGElement>('circle')];
/** A dot at rest with no pulse: the rest's radius, or the solid ring at the rest's scale. */
const restDot = (d: SVGElement) => {
  const rings = ringsOf(d);
  if (!rings.length) {
    d.setAttribute('r', R_REST);
    d.setAttribute('stroke-width', SW1);
    return;
  }
  rings.forEach((c, k) => {
    c.style.transform = scaleOf(REST);
    c.style.opacity = k ? '0' : '1';
  });
};
/** Start a dot's pulse over a set of `setPeriods`, `duration` ms, repeating. */
const pulseOn = (
  d: SVGElement,
  setPeriods: number,
  duration: number
): Pulse => {
  const timing = { duration, iterations: Infinity };
  const rings = ringsOf(d);
  if (!rings.length) {
    return d.animate(pulseFrames(setPeriods), timing);
  }
  const all = rings.flatMap((c, k) => {
    const f = ringFrames(setPeriods, k);
    return [c.animate(f.scale, timing), c.animate(f.opacity, timing)];
  });
  return {
    get startTime() {
      return all[0]!.startTime;
    },
    set startTime(t) {
      all.forEach((a) => (a.startTime = t));
    },
    effect: {
      updateTiming: (t) => all.forEach((a) => a.effect?.updateTiming(t)),
    },
    get onfinish() {
      return all[0]!.onfinish;
    },
    set onfinish(f) {
      all[0]!.onfinish = f;
    },
    cancel: () => all.forEach((a) => a.cancel()),
  };
};

// ─── The page's clock ─────────────────────────────────────────────────────────

/*
 * The loading phase, in periods, shared by every mark on the page. It starts
 * on the document timeline's grid (phase 0 at time 0, as the skeleton wave);
 * a change of period (slow motion) re-anchors it so the phase carries on.
 * One time scale per page: marks under different scales would re-anchor it
 * in turn.
 */
const clock = { period: 0, t: 0, phase: 0 };
const tune = (period: number, t: number) => {
  if (clock.period === period) {
    return;
  }
  if (clock.period > 0) {
    clock.phase += (t - clock.t) / clock.period;
    clock.t = t;
  }
  clock.period = period;
};
const phaseAt = (t: number) => clock.phase + (t - clock.t) / clock.period;
/** The time the page's clock reaches `phase` (periods). */
const timeAt = (phase: number) =>
  clock.t + (phase - clock.phase) * clock.period;

// ─── Tracks: where each dot is at a time ──────────────────────────────────────

/** A dot's place: angle (unwrapped), radius, presence in the formation. */
interface Dot {
  deg: number;
  r: number;
  p: number;
}
/**
 * A formation at rest (turning, for a shape). `perm` is the place each dot
 * holds; `turn` carries the whole turns a swing added to a dot.
 */
interface Formation {
  kind: Kind;
  base: number;
  perm: readonly number[];
  turn: number[];
}
/** A swing from wherever `from` is to `to`: each dot sets off after its `delay` and takes `dur`. */
interface Move {
  from: Track;
  to: Formation;
  t0: number;
  dur: number;
  delay: number[];
  /** The formation's common clockwise turn, degrees: a dot leaving the centre spirals out through it. */
  swing: number;
  /** Per dot: whether it spirals out of the centre (where it has no angle to start from). */
  fromCentre: boolean[];
  grows: boolean[];
}
type Track = Formation | Move;
const isMove = (k: Track): k is Move => 'from' in k;
const endOf = (m: Move) => m.t0 + Math.max(...m.delay) + m.dur;

/** A dot's presence fade (growing in, shrinking out), apart from the formation's. */
interface Fade {
  from: number;
  to: number;
  start: number;
  dur: number;
  ease: Curve;
}
const fadeAt = (f: Fade, t: number) =>
  t <= f.start
    ? f.from
    : t >= f.start + f.dur
      ? f.to
      : f.from + (f.to - f.from) * f.ease((t - f.start) / f.dur);

/** A dot's pulse phase (periods, unwrapped), sliding from one place in the wave to another. */
interface Slide {
  from: number;
  to: number;
  start: number;
  dur: number;
}

// ─── Engine ───────────────────────────────────────────────────────────────────

export function createProcessingEngine(
  _group: SVGGElement,
  dots: readonly SVGElement[],
  options: ProcessingEngineOptions = {}
): ProcessingEngine {
  const scale = options.timeScale ?? (() => 1);
  let timeScale = scale();
  const tok = (t: DurationToken) => motionTokens.duration[t] * timeScale;
  const period = () => PROCESSING_MOTION.periodMs * timeScale;
  /** The set the pulses run on, in loading periods: the formation's (`processingSetPeriods`). */
  let setPeriods = processingSetPeriods('line');
  /** One set of pulses, ms: the pulses' own clock. */
  const cycle = () => period() * setPeriods;
  const spinAt = (t: number) =>
    (360 * phaseAt(t)) / PROCESSING_MOTION.revolutionPeriods;
  const now = () => (document.timeline?.currentTime as number | null) ?? 0;
  const noop = () => {};
  const loopsChanged = () => options.onLoops?.();

  const moveEase = () => curve(PROCESSING_MOTION.move);
  const growEase = () => curve(PROCESSING_MOTION.entrance);
  const shrinkEase = () => curve(PROCESSING_MOTION.exit);

  let visible = false;
  let staticOnly = false;
  let loopForever = true;
  let track: Track = {
    kind: 'line',
    base: 0,
    perm: IDENTITY,
    turn: [0, 0, 0, 0],
  };
  const fades: Fade[] = dots.map(() => ({
    from: 0,
    to: 0,
    start: 0,
    dur: 0,
    ease: growEase(),
  }));
  const slides: Slide[] = dots.map((_, i) => {
    const ph = phOf(SLOTS.line[i]!);
    return { from: ph, to: ph, start: 0, dur: 0 };
  });
  let goal: { kind: Kind | 'out'; resolve: (landed: boolean) => void } | null =
    null;
  let wig: {
    t0: number;
    dur: number;
    stagger: number;
    /** The formation it bobs in: up from the line, out from a shape's centre. */
    kind: Kind;
    /** Each dot's turn in the run: its place, left to right in the line, clockwise round a shape. */
    order: readonly number[];
    fade: { t0: number; dur: number } | null;
    resolve: (landed: boolean) => void;
  } | null = null;
  let queuedWiggle: ((landed: boolean) => void) | null = null;
  /** For loop = false: once grown in, each dot shrinks after one pulse. */
  let once: 'growing' | 'pulsing' | null = null;

  const pulses: (Pulse | null)[] = dots.map(() => null);
  /**
   * A change of set (into or out of the square): the old pulses run out their set (`retiring`), and the
   * new ones wait for the first set on the new formation's grid at or after its end, `at` (ms). `rest`
   * is the old set's end (periods): where a second change before `at` starts from.
   */
  let handover: { at: number; rest: number } | null = null;
  const retiring: Pulse[] = [];
  const pulsePh = dots.map(() => 0);
  const spins: (Animation | null)[] = dots.map(() => null);
  const lastTf = dots.map(() => '');
  let raf = 0;
  /** Places are drawn frame by frame (a swing, presence or the wiggle), not by the spin's animations. */
  let drawing = false;

  const slotOf = (f: Formation, i: number) => SLOTS[f.kind][f.perm[i]!]!;
  const formAt = (f: Formation, i: number, t: number): Dot => {
    const s = slotOf(f, i);
    return {
      deg: s.deg + (f.kind === 'line' ? 0 : f.base + spinAt(t)) + f.turn[i]!,
      r: s.r,
      p: s.p,
    };
  };
  const at = (k: Track, i: number, t: number): Dot => {
    if (!isMove(k)) {
      return formAt(k, i, t);
    }
    if (t >= endOf(k)) {
      return formAt(k.to, i, t);
    }
    // A finished inner swing is its target from now on, so retargets never pile up.
    if (isMove(k.from) && t >= endOf(k.from)) {
      k.from = k.from.to;
    }
    const F = at(k.from, i, t);
    const T = formAt(k.to, i, t);
    const s = clamp01((t - k.t0 - k.delay[i]!) / k.dur);
    const e = moveEase()(s);
    // Between two shapes the arc lifts out to the original's arc radius and
    // settles back; the bump is in the eased progress, so it starts and lands
    // at rest. Nothing lifts past R_ARC, and a spiral to or from the centre
    // stays monotonic (6e + 4e(1 − e) only grows).
    const lift = Math.max(0, R_ARC - Math.max(F.r, T.r));
    return {
      deg: k.fromCentre[i]
        ? T.deg - k.swing * (1 - e)
        : F.deg + (T.deg - F.deg) * e,
      r: F.r + (T.r - F.r) * e + lift * 4 * e * (1 - e),
      p: F.p + (T.p - F.p) * (k.grows[i] ? growEase()(s) : shrinkEase()(s)),
    };
  };
  const headingOf = (k: Track): Formation => (isMove(k) ? k.to : k);
  const kindOf = (k: Track): Kind => headingOf(k).kind;

  /** A dot's pulse phase at `t`, in loading periods into its set. */
  const phaseOf = (i: number, t: number) => {
    const s = slides[i]!;
    if (s.dur <= 0 || t >= s.start + s.dur) {
      return s.to;
    }
    if (t <= s.start) {
      return s.from;
    }
    // At a steady rate, so no beat stretches or shrinks by more than the rate.
    return s.from + ((s.to - s.from) * (t - s.start)) / s.dur;
  };
  const sliding = (t: number) => slides.some((s) => t < s.start + s.dur);
  /**
   * Slide every dot's phase to its place in `perm`'s formation, each the
   * shorter way round the set; steadily, at SLIDE_RATE (at least over one
   * period). Line, triangle and square share their turns, so only an unwind
   * that hands the line's places round slides anything.
   */
  const slideTo = (kind: Kind, perm: readonly number[], t: number) => {
    const cur = dots.map((_, i) => phaseOf(i, t));
    const half = setPeriods / 2;
    const by = dots.map(
      (_, i) =>
        mod(phOf(SLOTS[kind][perm[i]!]!) - cur[i]! + half, setPeriods) - half
    );
    const longest = Math.max(...by.map(Math.abs));
    // It moves at SLIDE_RATE periods a period.
    const dur = period() * Math.max(1, longest / SLIDE_RATE);
    by.forEach((d, i) => {
      slides[i] =
        Math.abs(d) < 1e-6
          ? { from: cur[i]!, to: cur[i]!, start: t, dur: 0 }
          : { from: cur[i]!, to: cur[i]! + d, start: t, dur };
    });
  };

  // ── drawing ─────────────────────────────────────────────────────────────────

  const transform = (deg: number, r: number, p: number, dy = 0) =>
    `translate(${C}px, ${fmt(C + dy)}px) rotate(${fmt(deg)}deg) translate(${fmt(r)}px) scale(${fmt(p)})`;
  const write = (i: number, value: string) => {
    if (value === lastTf[i]) {
      return;
    }
    dots[i]!.style.transform = value;
    lastTf[i] = value;
  };
  const cancel = (a: Pulse | null) => {
    try {
      a?.cancel();
    } catch {
      // already gone
    }
  };
  /** The start time that puts a pulse at phase `ph` (periods into its set) of the page's clock at `t`: sets start on the clock's grid, one every `setPeriods`. */
  const pulseStart = (ph: number, t: number) =>
    t - mod(phaseAt(t) - ph, setPeriods) * period();
  const startPulses = (t: number) => {
    dots.forEach((d, i) => {
      cancel(pulses[i]!);
      const ph = phaseOf(i, t);
      const a = pulseOn(d, setPeriods, cycle());
      a.startTime = pulseStart(ph, t);
      pulses[i] = a;
      pulsePh[i] = ph;
    });
    loopsChanged();
  };
  /** Keep each pulse at its dot's phase while the phase slides. */
  const syncPulses = (t: number) =>
    pulses.forEach((pulse, i) => {
      const ph = phaseOf(i, t);
      if (
        pulse &&
        Math.abs(
          mod(ph - pulsePh[i]! + setPeriods / 2, setPeriods) - setPeriods / 2
        ) > 1e-6
      ) {
        pulse.startTime = pulseStart(ph, t);
        pulsePh[i] = ph;
      }
    });
  const stopPulses = () => {
    pulses.forEach((a, i) => (cancel(a), (pulses[i] = null)));
    retiring.splice(0).forEach(cancel);
    handover = null;
  };
  /** Whether the pulses are waiting, at `t`, for a new formation's first set. */
  const waiting = (t: number) => handover != null && t < handover.at;
  /**
   * Into a formation with another set (the square's is a stagger longer than the line's and the
   * triangle's): the dots finish the set they are in, and the new set starts on the new formation's
   * grid at or after its end, every dot at its new place in it (nothing slides: no pulse is under way
   * in between). Each old pulse runs on to its next start at or after the old set's end, when its dot
   * is at rest (a dot still settling past that end, the line's hidden fourth, finishes first).
   */
  const changeSet = (kind: Kind, perm: readonly number[], t: number) => {
    let rest: number;
    if (handover && waiting(t)) {
      // The new set hasn't started, and now never will; the old pulses are still running out.
      pulses.forEach(cancel);
      rest = handover.rest;
    } else {
      rest = Math.ceil(phaseAt(t) / setPeriods - 1e-9) * setPeriods;
      const end = timeAt(rest);
      const C = cycle();
      pulses.forEach((a) => {
        if (!a) {
          return;
        }
        const iterations = Math.ceil(
          (end - Number(a.startTime ?? end)) / C - 1e-6
        );
        if (iterations <= 0) {
          return cancel(a);
        }
        a.effect?.updateTiming({ iterations });
        a.onfinish = () => {
          const idx = retiring.indexOf(a);
          if (idx >= 0) {
            retiring.splice(idx, 1);
          }
        };
        retiring.push(a);
      });
    }
    setPeriods = processingSetPeriods(kind);
    const at = timeAt(Math.ceil(rest / setPeriods - 1e-9) * setPeriods);
    handover = { at, rest };
    dots.forEach((d, i) => {
      const ph = phOf(SLOTS[kind][perm[i]!]!);
      slides[i] = { from: ph, to: ph, start: t, dur: 0 };
      const a = pulseOn(d, setPeriods, cycle());
      a.startTime = at + ph * period();
      pulses[i] = a;
      pulsePh[i] = ph;
    });
    loopsChanged();
  };
  /** Every dot's pulse to its place in `perm`'s formation: slid there within the set, or from the next set of another formation's. */
  const placePulses = (kind: Kind, perm: readonly number[], t: number) => {
    if (processingSetPeriods(kind) !== setPeriods || waiting(t)) {
      changeSet(kind, perm, t);
    } else {
      slideTo(kind, perm, t);
    }
  };
  const stopSpins = () =>
    spins.forEach((a, i) => (cancel(a), (spins[i] = null)));
  /** Hand a resting shape's turning to one Web Animation per dot, from where each is now. */
  const startSpins = (t: number) => {
    stopSpins();
    if (kindOf(track) === 'line') {
      return;
    }
    const rev = PROCESSING_MOTION.revolutionPeriods * period();
    dots.forEach((d, i) => {
      const { deg, r, p } = at(track, i, t);
      const shown = p * fadeAt(fades[i]!, t);
      if (shown < EPS) {
        return;
      }
      const from = mod(deg, 360);
      const a = d.animate(
        [
          { transform: transform(from, r, shown) },
          { transform: transform(from + 360, r, shown) },
        ],
        {
          duration: rev,
          iterations: Infinity,
        }
      );
      a.startTime = t;
      spins[i] = a;
    });
    loopsChanged();
  };

  /** Dot `i`'s bob at `t`, 0 to 1 and back: in the line by its place left to right, in a shape clockwise round it. */
  const bobAt = (i: number, t: number) => {
    if (!wig) {
      return 0;
    }
    const s = (t - wig.t0 - wig.stagger * wig.order[i]!) / wig.dur;
    if (s <= 0 || s >= 1) {
      return 0;
    }
    const ef = curve(PROCESSING_MOTION.standard);
    const bump = s <= 0.5 ? ef(s * 2) : 1 - ef(s * 2 - 1);
    const fade = wig.fade
      ? 1 - moveEase()(clamp01((t - wig.fade.t0) / wig.fade.dur))
      : 1;
    return bump * fade;
  };
  const wiggleEnd = () =>
    wig ? wig.t0 + wig.stagger * (TURNING[wig.kind] - 1) + wig.dur : 0;

  /** Draw every dot at `t`: its place and presence, and the wiggle's bob. */
  const render = (t: number) => {
    dots.forEach((_, i) => {
      const d = at(track, i, t);
      const bob = bobAt(i, t);
      const line = wig?.kind === 'line';
      write(
        i,
        transform(
          mod(d.deg, 360),
          d.r + (line ? 0 : WIGGLE_PUSH * bob),
          d.p * fadeAt(fades[i]!, t),
          line ? -WIGGLE_RISE * bob : 0
        )
      );
    });
  };
  const moving = (t: number) =>
    (isMove(track) && t < endOf(track)) ||
    fades.some((f) => t < f.start + f.dur) ||
    (wig != null && t < wiggleEnd());

  const frame = () => {
    raf = 0;
    const t = now();
    if (drawing) {
      render(t);
      if (!moving(t)) {
        drawing = false;
        land(t);
      }
    }
    syncPulses(t);
    if ((drawing || sliding(t)) && !raf) {
      raf = requestAnimationFrame(frame);
    }
    // At rest: the pulses' last re-timing is this frame's.
    else if (!raf) {
      loopsChanged();
    }
  };
  /** Something started moving at `t`: draw it from now and keep drawing until it lands. */
  const kick = (t: number) => {
    drawing = true;
    render(t);
    syncPulses(t);
    stopSpins(); // after drawing, so the hand-off from the spin is seamless
    if (!raf) {
      raf = requestAnimationFrame(frame);
    }
  };

  const resolveGoal = (landed: boolean) => {
    const g = goal;
    goal = null;
    g?.resolve(landed);
  };
  /** Nothing is moving any more (a phase may still be sliding: the frames carry on for it alone). */
  const land = (t: number) => {
    if (isMove(track)) {
      track = track.to;
    }
    // The turns only mattered while moving (what is left is whole turns, or a
    // dot at the centre, where its angle shows nothing).
    if (!isMove(track)) {
      track = { ...track, turn: [0, 0, 0, 0] };
    }
    render(t);
    if (wig) {
      const w = wig;
      wig = null;
      w.resolve(!w.fade);
    }
    const out = fades.every((f) => f.to === 0);
    if (out) {
      visible = false;
      once = null;
      stopPulses();
      stopSpins();
      if (goal?.kind === 'out') {
        resolveGoal(true);
      }
      return;
    }
    if (goal && goal.kind === kindOf(track)) {
      resolveGoal(true);
    }
    if (once === 'growing') {
      once = 'pulsing';
      shrinkAfterOnePulse(t);
      return;
    }
    if (queuedWiggle) {
      const resolve = queuedWiggle;
      queuedWiggle = null;
      startWiggle(t, resolve);
      return;
    }
    startSpins(t);
  };

  // ── presence ────────────────────────────────────────────────────────────────

  const growIn = (t: number) =>
    fades.forEach((f, i) => {
      const from = fadeAt(f, t);
      fades[i] = {
        from,
        to: 1,
        start: t + tok(PROCESSING_MOTION.growStagger) * i,
        dur: tok(PROCESSING_MOTION.grow),
        ease: growEase(),
      };
    });
  const shrinkOut = (t: number, starts?: number[]) =>
    fades.forEach((f, i) => {
      const from = fadeAt(f, t);
      fades[i] = {
        from,
        to: 0,
        start: starts?.[i] ?? t + tok(PROCESSING_MOTION.outStagger) * i,
        dur: tok(PROCESSING_MOTION.out),
        ease: shrinkEase(),
      };
    });
  /** loop = false: each dot shrinks as its first full pulse after growing in ends. */
  const shrinkAfterOnePulse = (t: number) => {
    const C = cycle();
    const swell = PROCESSING_MOTION.pulseSwell * period();
    const settle = PROCESSING_MOTION.pulseSettle * period();
    const starts = fades.map((f, i) => {
      const st = pulseStart(phaseOf(i, t), t); // its pulse's start in a set, at or before t
      let peak = st + swell;
      while (peak < f.start + f.dur / 2) {
        peak += C;
      }
      while (peak - C >= f.start + f.dur / 2) {
        peak -= C;
      }
      return peak + settle;
    });
    shrinkOut(t, starts);
    kick(t);
  };

  // ── static end states (reduced motion, no WAAPI) ────────────────────────────

  const snap = (target: Kind | 'out') => {
    cancelAnimationFrame(raf);
    raf = 0;
    drawing = false;
    stopPulses();
    stopSpins();
    wig = null;
    queuedWiggle?.(false);
    queuedWiggle = null;
    once = null;
    const kind = target === 'out' ? 'line' : target;
    const shown = target === 'out' ? 0 : 1;
    setPeriods = processingSetPeriods(kind);
    track = { kind, base: HOME[kind], perm: IDENTITY, turn: [0, 0, 0, 0] };
    fades.forEach(
      (_, i) =>
        (fades[i] = {
          from: shown,
          to: shown,
          start: 0,
          dur: 0,
          ease: growEase(),
        })
    );
    slides.forEach((_, i) => {
      const ph = phOf(SLOTS[kind][i]!);
      slides[i] = { from: ph, to: ph, start: 0, dur: 0 };
    });
    dots.forEach((d, i) => {
      const s = SLOTS[kind][i]!;
      restDot(d);
      write(i, transform(mod(s.deg + HOME[kind], 360), s.r, s.p * shown));
    });
    visible = target !== 'out';
  };

  // ── swings ──────────────────────────────────────────────────────────────────

  /** One way to swing into `kind`: the places, where the formation stands, each dot's turn and arc. */
  const plan = (
    kind: Kind,
    perm: readonly number[],
    F: Dot[],
    floor: number,
    t: number
  ) => {
    const slots = perm.map((j) => SLOTS[kind][j]!);
    // A shape stands where the dots already are (the circular mean of each
    // shown dot's angle less its place's), then swings `floor` on from there.
    // The line has no choice: it swings on to the first time its places come
    // round, at least `floor`.
    let base = 0;
    if (kind !== 'line') {
      const spin = spinAt(t);
      const m = meanDeg(
        F.map((d, i) => d.deg - slots[i]!.deg - spin),
        F.map((d, i) => d.r * Math.min(d.p, slots[i]!.p))
      );
      base = m ?? HOME[kind] - spin;
    }
    const to: Formation = { kind, base, perm, turn: [0, 0, 0, 0] };
    let T = dots.map((_, i) => formAt(to, i, t));
    // A dot at the centre spirals out, one bound for it spirals in: neither
    // has an angle to keep at the centre, so each simply turns the swing.
    const fromCentre = F.map((d) => d.r < EPS);
    const free = F.map((d, i) => fromCentre[i] || T[i]!.r < EPS);
    const raw = T.map((d, i) => d.deg - F[i]!.deg);
    const weights = F.map((d, i) =>
      free[i] ? 0 : Math.min(d.p, T[i]!.p) * (d.r + T[i]!.r)
    );
    const mean = meanDeg(raw, weights) ?? 0;
    let swing: number;
    if (kind === 'line') {
      swing = mean + 360 * Math.ceil((floor - mean) / 360 - 1e-9);
    } else {
      swing = floor;
      to.base += floor - mean;
      T = dots.map((_, i) => formAt(to, i, t));
    }
    // Each travelling dot: the common swing, give or take its own fold. The
    // place's turn takes it there exactly (a dot spiralling into the centre
    // lands at its start's angle plus the swing, so nothing jumps there).
    const arcs = T.map((d, i) =>
      free[i] ? swing : swing + wrap180(d.deg - F[i]!.deg - swing)
    );
    T.forEach((d, i) => {
      if (!fromCentre[i]) {
        to.turn[i] = arcs[i]! - (d.deg - F[i]!.deg);
      }
    });
    const travel = T.map((d, i) => {
      const src = F[i]!;
      if (Math.max(src.p, d.p) < EPS) {
        return 0;
      }
      const lift = Math.max(0, R_ARC - Math.max(src.r, d.r));
      return Math.hypot(
        d.r - src.r,
        ((src.r + d.r) / 2 + lift / 2) * toRad(Math.abs(arcs[i]!))
      );
    });
    return { to, swing, fromCentre, arcs, travel, T };
  };

  /** Start one swing to `kind` from wherever the dots are at `t`, at the speed they are going. */
  const moveTo = (kind: Kind, t: number) => {
    const F = dots.map((_, i) => at(track, i, t));
    const heading = headingOf(track);
    // Mid-swing, the dots swing on at least as far as they were going.
    let floor =
      kind === 'line'
        ? PROCESSING_MOTION.unwindDeg
        : PROCESSING_MOTION.swingDeg;
    if (isMove(track)) {
      let sum = 0;
      let weight = 0;
      F.forEach((d, i) => {
        // Only dots bound for a place on the circle: one spiralling into the
        // centre has no angle to reach.
        const H = formAt(heading, i, t);
        const w = Math.min(d.p, H.p) * H.r;
        sum += w * (H.deg - d.deg);
        weight += w;
      });
      if (weight > 0) {
        floor = Math.max(floor, sum / weight);
      }
    }
    // Into the line from a shape, the line's places go to whichever dots the
    // shortest swing brings there (each turn of the shape's symmetry is a
    // candidate); otherwise every dot keeps its place number.
    const n = TURNING[heading.kind];
    const perms =
      kind === 'line' && heading.kind !== 'line'
        ? Array.from({ length: n }, (_, k) =>
            heading.perm.map((j) => (j < n ? (j + k) % n : j))
          )
        : [heading.perm];
    const best = perms
      .map((perm) => plan(kind, perm, F, floor, t))
      .reduce((a, b) => (b.swing < a.swing - 1e-6 ? b : a));
    // The cascade: the longest arc sets off first, the rest one stagger apart.
    const stagger = tok(PROCESSING_MOTION.swingStagger);
    const order = dots
      .map((_, i) => i)
      .filter((i) => best.travel[i]! > 0)
      .sort(
        (a, b) => Math.abs(best.arcs[b]!) - Math.abs(best.arcs[a]!) || a - b
      );
    const delay = dots.map(() => 0);
    order.forEach((i, k) => (delay[i] = stagger * k));
    track = {
      from: track,
      to: best.to,
      t0: t,
      dur: tok(processingTravelToken(Math.max(0, ...best.travel))),
      delay,
      swing: best.swing,
      fromCentre: best.fromCentre,
      grows: best.T.map((d, i) => d.p >= F[i]!.p),
    };
    placePulses(kind, best.to.perm, t);
    // A wiggle under way bows out over the swing.
    if (wig && !wig.fade) {
      wig.resolve(false);
      wig.resolve = noop;
      wig.fade = { t0: t, dur: endOf(track) - t };
    }
  };

  const startWiggle = (t: number, resolve: (landed: boolean) => void) => {
    wig = {
      t0: t,
      dur: tok(PROCESSING_MOTION.wiggle),
      stagger: tok(PROCESSING_MOTION.wiggleStagger),
      kind: kindOf(track),
      order: headingOf(track).perm,
      fade: null,
      resolve,
    };
    kick(t);
  };

  const request = (target: Kind | 'wiggle'): Promise<boolean> => {
    if (target === 'wiggle') {
      return wiggle();
    }
    // Nothing showing (after out): grow in again, in the target.
    if (!visible) {
      return run(
        target === 'line' ? 'loading' : target,
        loopForever,
        staticOnly
      );
    }
    if (staticOnly) {
      snap(target);
      return Promise.resolve(true);
    }
    const t = now();
    tune(period(), t);
    resolveGoal(false);
    queuedWiggle?.(false);
    queuedWiggle = null;
    once = null;
    // An out under way turns round and grows back.
    if (fades.some((f) => f.to === 0)) {
      growIn(t);
    }
    if (kindOf(track) !== target) {
      moveTo(target, t);
    }
    return new Promise((resolve) => {
      goal = { kind: target, resolve };
      kick(t);
    });
  };

  const wiggle = (): Promise<boolean> => {
    if (!visible || fades.some((f) => f.to === 0)) {
      return Promise.resolve(false);
    }
    // Reduced motion: the still picture stays still.
    if (staticOnly) {
      return Promise.resolve(true);
    }
    const t = now();
    // Still on its way somewhere (or growing in, or mid-wiggle): bob once it lands.
    if (moving(t)) {
      queuedWiggle?.(false);
      return new Promise((resolve) => (queuedWiggle = resolve));
    }
    return new Promise((resolve) => startWiggle(t, resolve));
  };

  const out = (): Promise<boolean> => {
    if (!visible) {
      return Promise.resolve(false);
    }
    resolveGoal(false);
    queuedWiggle?.(false);
    queuedWiggle = null;
    once = null;
    if (staticOnly) {
      snap('out');
      return Promise.resolve(true);
    }
    // Every dot shrinks from wherever it is; a swing or the spin carries on under it.
    const t = now();
    shrinkOut(t);
    return new Promise((resolve) => {
      goal = { kind: 'out', resolve };
      kick(t);
    });
  };

  const run = (
    mode: ProcessingMode,
    loop: boolean,
    isStatic: boolean
  ): Promise<boolean> => {
    resolveGoal(false);
    queuedWiggle?.(false);
    queuedWiggle = null;
    staticOnly = isStatic;
    loopForever = loop;
    const kind: Kind = mode === 'triangle' || mode === 'square' ? mode : 'line';
    if (staticOnly) {
      snap(mode === 'out' ? 'out' : kind);
      return Promise.resolve(true);
    }
    snap('out');
    if (mode === 'out') {
      return Promise.resolve(true);
    }
    const t = now();
    timeScale = scale();
    tune(period(), t);
    track = {
      kind,
      base: kind === 'line' ? 0 : HOME[kind] - spinAt(t),
      perm: IDENTITY,
      turn: [0, 0, 0, 0],
    };
    setPeriods = processingSetPeriods(kind);
    slides.forEach((_, i) => {
      const ph = phOf(SLOTS[kind][i]!);
      slides[i] = { from: ph, to: ph, start: t, dur: 0 };
    });
    visible = true;
    once = loop ? null : 'growing';
    startPulses(t);
    growIn(t);
    return new Promise((resolve) => {
      goal = { kind, resolve };
      kick(t);
    });
  };

  const setMode = (mode: ProcessingMode, loop: boolean, isStatic: boolean) =>
    !visible || loop !== loopForever || isStatic !== staticOnly
      ? run(mode, loop, isStatic)
      : mode === 'out'
        ? out()
        : request(mode === 'loading' ? 'line' : mode);

  const retime = () => {
    const next = scale();
    if (next === timeScale) {
      return;
    }
    const k = next / timeScale;
    const t = now();
    timeScale = next;
    tune(period(), t);
    if (staticOnly || !visible) {
      return;
    }
    const at0 = (from: number) => t - (t - from) * k;
    const stretch = (m: Track) => {
      if (!isMove(m)) {
        return;
      }
      m.t0 = at0(m.t0);
      m.dur *= k;
      m.delay = m.delay.map((d) => d * k);
      stretch(m.from);
    };
    stretch(track);
    fades.forEach((f) => {
      f.start = at0(f.start);
      f.dur *= k;
    });
    slides.forEach((s) => {
      s.start = at0(s.start);
      s.dur *= k;
    });
    if (wig) {
      wig.t0 = at0(wig.t0);
      wig.dur *= k;
      wig.stagger *= k;
      if (wig.fade) {
        wig.fade.t0 = at0(wig.fade.t0);
        wig.fade.dur *= k;
      }
    }
    // A change of set under way lands at once: the new set's pulses take their places now.
    retiring.splice(0).forEach(cancel);
    handover = null;
    pulses.forEach((a, i) => {
      if (!a) {
        return;
      }
      a.effect?.updateTiming({ duration: cycle() });
      a.startTime = pulseStart(pulsePh[i]!, t);
    });
    if (drawing) {
      return loopsChanged();
    }
    if (spins.some(Boolean)) {
      startSpins(t);
    } else {
      loopsChanged();
    }
  };

  // Nothing shows until the first run.
  dots.forEach((d, i) => {
    restDot(d);
    write(i, transform(SLOTS.line[i]!.deg, SLOTS.line[i]!.r, 0));
  });

  return {
    run,
    setMode,
    toLoading: () => request('line'),
    toTriangle: () => request('triangle'),
    toSquare: () => request('square'),
    wiggle: () => request('wiggle'),
    out,
    retime,
    destroy: () => {
      cancelAnimationFrame(raf);
      raf = 0;
      drawing = false;
      resolveGoal(false);
      queuedWiggle?.(false);
      queuedWiggle = null;
      wig?.resolve(false);
      wig = null;
      stopPulses();
      stopSpins();
      visible = false;
    },
  };
}
