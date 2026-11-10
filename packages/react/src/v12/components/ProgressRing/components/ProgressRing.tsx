/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  DURATION_FLOOR_MS,
  durationStepForDistance,
  motionTokens,
  type DurationToken,
  easingCss,
} from '@carbon-labs/v12-motion';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import { useLatest } from '@carbon-labs/react-selection-kit';
import { StatusMark } from '@carbon-labs/react-feedback';
import { usePreviousCommit } from '@carbon-labs/react-feedback';
import { LOADER_KIT, useKitProps } from '@carbon-labs/react-kit-defaults';
import { playHandoffOut } from '@carbon-labs/react-feedback';
import {
  LOADER_BOX,
  LOADER_EDGE,
  SPINNER_MOTION,
  Spinner,
  loaderDrawing,
  loaderRevealStep,
  useSpinnerMotion,
  type SpinnerMotion,
  type SpinnerVariant,
} from '@carbon-labs/react-feedback';
import { LOADER_GROWTH, loaderGrowth } from '@carbon-labs/react-loading';
import {
  continueFrom,
  easeFrom,
  retargetFrom,
  startNow,
  type Reading,
} from '@carbon-labs/react-progress-bar';
import './progress-ring.scss';

/* ============================================================================
 * ProgressRing — a determinate ring for small places (a file chip, a row, an
 * uploader item): the Spinner's sibling, with ProgressBar's names.
 *
 *   drawing   the Spinner's (`loaderDrawing`), at its icon sizes (16, 20, 24,
 *             32): the icons' 32-unit box, the line size / 16, at most 2px
 *             (1px at 16px, 2px at 32px), or `stroke` px, butt ends. The loud
 *             arc over the spinner's quiet base (`--cds-loader-base`), with
 *             the spinner's gap (by size, whatever the stroke: `loaderGap`,
 *             2, 2, 2 and 3px at 16, 20, 24 and 32px): the base breaks round the
 *             arc, stopping short of each end by the gap (or, inset, the arc
 *             on its own circle inside it). The loaders' colours, as the
 *             progress bar's: neutral (`$icon-primary`, the default;
 *             `KitDefaults variant` when none is given), or
 *             `variant="hero"`: the arc in the kit's brand (`--cds-hero-loader`),
 *             IBM blue unless a `KitDefaults brand` says otherwise; always
 *             over the neutral base, error too
 *             The arc runs from 12 o'clock, clockwise (counter-clockwise in
 *             RTL); the base turns with it, so its gaps follow the arc
 *   weight    the line grows with the value, inset: its base width up to 15%, twice that
 *             from 85%, linearly between (`progressRingLine`,
 *             `PROGRESS_RING_MOTION`). Inset: the outer edge holds at 14, so
 *             the ring's footprint never changes and the line grows inward;
 *             the arc and the base grow together, so the arc sits on its
 *             base. The gap is the spinner's, whatever the line. It rides on
 *             the value's own tween (`--cds-ring-weight`, in the same
 *             keyframes as the arc's share), never a tween of its own. With
 *             no value it is the Spinner's line, fixed
 *   arrival   the arc draws on from 12 o'clock, clockwise, from nothing to
 *             its value, as the track fades up: as it mounts with a value
 *             and in a place that had another mark, clockwise only. The Spinner's
 *             reveal clock (`loaderRevealStep`: the step for the arc's
 *             travel in px, never under `moderate-01`), entrance-productive
 *   no value  it is the kit's Spinner (half the circle, swinging between 30%
 *             and 70% of it as it turns, on the loading clock; its reveal
 *             from 12, the start and stop; the still dots)
 *   hand-off  turning to a value is one move: the turn decelerates so the
 *             arc's tail lands at 12 o'clock while its length eases to the
 *             value, its base already there, all on one clock: the farther
 *             travel's step (`durationStepForDistance`), floored so the turn
 *             averages at most twice the spinner's speed (`handoffStep`). The
 *             turn leaves at the spinner's own speed, so it never stops and
 *             restarts
 *   value     the arc's end travels by its length in px (its step from the
 *             distance), on standard-productive, from the live end. At most
 *             one new tween per `fast-02`; a burst retargets it (retarget.ts)
 *   finished  the arc completes to the full ring; then the status hand-off
 *             (feedback/statusHandoff.ts), out then in,
 *             with no fades: the ring shrinks 4px, opaque (`fast-01`); then
 *             the success disc grows from 4px under its size (`fast-02`);
 *             then its check draws on from the short arm (`fast-02`). With no
 *             value the spinner shrinks the same way, still turning
 *   error     every error lands on the error disc by the same hand-off, its slash drawing on
 *             from the top left. With a value: it turns red where it failed,
 *             finishes its travel there (it doesn't fill to full), then the
 *             ring shrinks. With no value (the size unknown) there is no
 *             amount to stop at, so the whole loader fails while it shrinks:
 *             the spinner's arc and its base, all red
 *   back      to active from a mark: the mark fades out (`fast-02`), then
 *             the ring or the spinner draws on (`moderate-01` and up)
 *   reduced   values land at once; the indeterminate form is the Spinner's
 *             still dots; the hand-off, the close and the marks are at once
 *
 * The machine stays honest: the arc shows the value it is given, and nothing
 * else. It never grows on its own, and a value that goes back is shown going
 * back (the host's job is not to send one: v11's "never decreases").
 * ========================================================================== */

export const PROGRESS_RING_SIZES = [16, 20, 24, 32] as const;
export type ProgressRingSize = (typeof PROGRESS_RING_SIZES)[number];
export type ProgressRingStatus = 'active' | 'finished' | 'error';

export interface ProgressRingProps {
  /** Additional class names. */
  className?: string;
  /** Text beside the label, under it. */
  helperText?: ReactNode;
  /** Visually hide the label (it still names the ring). */
  hideLabel?: boolean;
  /** The ring's label: its accessible name, and the text beside it. */
  label: string;
  /** The value at which the ring is full. Default 100. */
  max?: number;
  /** px: the Spinner's icon sizes, 16 (default), 20, 24 or 32. */
  size?: ProgressRingSize;
  /** The line, px. Default size / 16, at most 2px (`loaderStroke`), as the Spinner's. */
  stroke?: number;
  /** `neutral` (default, `$icon-primary`) or `hero` (the kit's brand, IBM blue by default), as the Spinner's and the progress bar's. Not given: `KitDefaults variant`, else neutral. */
  variant?: SpinnerVariant;
  /** `active` (default), `finished` or `error`. */
  status?: ProgressRingStatus;
  /** Tuning, this ring's alone: the Spinner's (`SpinnerMotion`: its gap, stroke and, with no value, its arc and swing), over the shipped numbers. */
  motion?: Partial<SpinnerMotion>;
  /** The current value. Unset: indeterminate (the Spinner). */
  value?: number;
}

/** What the mark shows: the spinner, the ring, or a status mark: success, or failed (the error disc, every error's). */
type Face = 'spin' | 'ring' | 'success' | 'failed';
/** The faces the status hand-off lands on. */
const isStatus = (f: Face) => f === 'success' || f === 'failed';

/** The drawing's box: the icons' 32 units (the Spinner's; its line and radii come from `loaderDrawing`). */
const BOX = LOADER_BOX;

/**
 * The line's growth with the value: from `growFrom` (15%) to `growTo` (85%)
 * of the ring the line grows by `grow` of its base width (1: to twice it),
 * linearly, and holds outside that span. The span is the loaders' one
 * (`LOADER_GROWTH`), shared with the progress bar.
 */
export const PROGRESS_RING_MOTION = {
  growFrom: LOADER_GROWTH.from,
  growTo: LOADER_GROWTH.to,
  grow: 1,
};

/**
 * The ring's line at a share of the ring (0–1), in the units of `base` (its
 * width at rest): `base` up to `growFrom`, `base × (1 + grow)` from `growTo`,
 * linear between. progress-ring.scss draws the same from the live share.
 */
export function progressRingLine(base: number, share: number): number {
  const { growFrom, growTo, grow } = PROGRESS_RING_MOTION;
  return base * (1 + grow * loaderGrowth(share, growFrom, growTo));
}
/** The ring at rest: the arc's start (an svg circle's 3 o'clock) turned to 12. */
const REST = -90;
/**
 * The hand-off's clock: the step for the farther travel in px, as for any
 * travel, but never so short that the turn would average more than
 * `HANDOFF_SPEED` times the spinner's own speed getting to 12 o'clock. A ring
 * is small, so its travels in px are short (a whole turn at 16px is 41px, a
 * `moderate-01`); a tail that has nearly a whole turn to go would otherwise
 * whip round in 160ms. Measured in the unscaled clock, so slow motion scales
 * it like every other step.
 */
const HANDOFF_SPEED = 2;
const HANDOFF_STEPS: DurationToken[] = [
  'fast-02',
  'moderate-01',
  'moderate-02',
  'moderate-03',
  'slow-01',
];
function handoffStep(px: number, degrees: number): DurationToken {
  const step = durationStepForDistance(px);
  const atSpeed = degrees / ((HANDOFF_SPEED * 360) / SPINNER_MOTION.periodMs);
  const floor =
    HANDOFF_STEPS.find((t) => motionTokens.duration[t] >= atSpeed) ?? 'slow-01';
  return motionTokens.duration[floor] > motionTokens.duration[step]
    ? floor
    : step;
}
/** The burst window. */
const BURST: DurationToken = 'fast-02';

const curve = (
  name: 'standard-productive' | 'exit-productive' | 'entrance-productive'
) => easingCss(name);
const mod = (a: number, n: number) => ((a % n) + n) % n;

export function ProgressRing({
  className,
  helperText,
  hideLabel,
  label,
  max = 100,
  size = 16,
  status = 'active',
  stroke,
  value,
  variant: variantProp,
  motion,
}: ProgressRingProps) {
  // KitDefaults: the provider's variant when none is given; every loader is neutral by default.
  const { variant = 'neutral' } = useKitProps(
    { variant: variantProp },
    LOADER_KIT
  );
  // Drawn again when the spinner is dialled (its stroke and gap are the ring's).
  useSpinnerMotion();
  const drawing = loaderDrawing(size, stroke, motion);
  /** The arc's circle at rest (the spinner's, at its line): the measure of a travel along the ring, and of the spinner's arc. */
  const CIRC = drawing.arcCirc;
  const labelId = useId();
  const helperTextId = useId();
  const { reduced, timeScale } = useFeedbackMotion();

  const isFinished = status === 'finished';
  const isError = status === 'error';
  const indeterminate = !isFinished && !isError && value == null;
  // ProgressBar's capping: within 0…max, max when finished; an error keeps the value it failed at.
  let capped = value;
  if (capped != null) capped = Math.min(max, Math.max(0, capped));
  if (isFinished) capped = max;
  else if (isError) capped = capped ?? 0;
  /** The arc's share of the ring (0–1): its length, and the weight its line follows. */
  const share = isFinished ? 1 : Math.min(1, Math.max(0, (capped ?? 0) / max));

  const want: Face = isFinished
    ? 'success'
    : isError
      ? 'failed'
      : value == null
        ? 'spin'
        : 'ring';
  const [shown, setShown] = useState<Face>(want);
  const wantRef = useLatest(want);

  const glyphRef = useRef<HTMLSpanElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const arcRef = useRef<SVGCircleElement>(null);
  const turnRef = useRef<SVGGElement>(null);
  const trackRef = useRef<SVGCircleElement>(null);
  /** The spinner's live state, taken as it hands off to the ring. */
  const handoff = useRef<{
    angle: number;
    share: number;
    base: number;
    scale: number;
    rtl: boolean;
  } | null>(null);
  /** The arc's running length tween and when it started (the burst window). */
  const tween = useRef<{ anim: Animation; at: number } | null>(null);
  /** The arc's share at the last value, to start a new tween at the speed it is moving. */
  const reading = useRef<Reading | null>(null);
  /** A step out in flight: the ring closing, or a mark fading out. */
  const leaving = useRef<Animation[] | null>(null);
  /** The success mark's fade out, held at 0 until the next face has taken its place. */
  const faded = useRef<Animation | null>(null);
  /** Whether the ring's svg has drawn since it mounted. */
  const drawn = useRef(false);
  const [landed, setLanded] = useState(0);

  const ms = (token: DurationToken) =>
    Math.max(DURATION_FLOOR_MS, motionTokens.duration[token] * timeScale);
  /** px on screen for a length on the 32-unit box. */
  const px = (units: number) => (units * size) / BOX;

  /* ── the arc: drawing on, the hand-off, and each value ─────────────────── */

  useLayoutEffect(() => {
    if (shown !== 'ring') {
      drawn.current = false;
      return;
    }
    const svg = svgRef.current;
    const arc = arcRef.current;
    const turn = turnRef.current;
    const track = trackRef.current;
    if (
      !svg ||
      !arc ||
      !turn ||
      !track ||
      leaving.current ||
      wantRef.current === 'spin'
    )
      return;
    const now = performance.now();
    // The arc's share (`--cds-ring-share`) draws the arc and the base's break; the weight (`--cds-ring-weight`,
    // the share the line follows) draws the line (progress-ring.scss). At rest the two are the value.
    const place = (v: number) => {
      svg.style.setProperty('--cds-ring-share', `${v}`);
      svg.style.setProperty('--cds-ring-weight', `${v}`);
    };
    /** One tween's keyframes: the share from `a` to `b`, and the weight with it (from `wa`, when it starts elsewhere). */
    const shares = (a: number, b: number, wa = a): Keyframe[] => [
      { '--cds-ring-share': `${a}`, '--cds-ring-weight': `${wa}` },
      { '--cds-ring-share': `${b}`, '--cds-ring-weight': `${b}` },
    ];
    const live = (name: string, fallback: number) => {
      const v = parseFloat(getComputedStyle(svg).getPropertyValue(name));
      return Number.isFinite(v) ? v : fallback;
    };
    const filling = (anim: Animation, at: number) => {
      tween.current = { anim, at };
      anim.finished.then(
        () => {
          if (tween.current?.anim !== anim) return;
          tween.current = null;
          setLanded((n) => n + 1);
        },
        () => {}
      );
    };

    if (!drawn.current) {
      drawn.current = true;
      const h = handoff.current;
      handoff.current = null;
      place(share);
      // At once under reduced motion. (An error mounts as its disc, never as the ring.)
      if (reduced) return;
      if (h) {
        // One move: the turn settles so the tail lands at 12 while the length eases to the value.
        const period = Math.max(
          DURATION_FLOOR_MS,
          SPINNER_MOTION.periodMs * timeScale
        );
        // The ring's turn that puts its arc where the spinner's is (mirrored in RTL), and where it rests.
        const from = h.rtl ? 180 - h.share * 360 - h.angle : h.angle;
        const by = h.rtl ? -mod(from - REST, 360) : mod(REST - from, 360);
        const travel = Math.max(
          px((Math.abs(by) / 360) * CIRC),
          px(Math.abs(share - h.share) * CIRC)
        );
        const d = ms(handoffStep(travel, Math.abs(by)));
        // All three start on this frame, where the spinner is read, so the turn doesn't hold for a frame.
        const start = startNow;
        if (Math.abs(by) > 0.5) {
          const slope = ((360 / period) * d) / Math.abs(by);
          start(
            turn.animate(
              [
                { transform: `rotate(${from}deg)` },
                { transform: `rotate(${from + by}deg)` },
              ],
              { duration: d, easing: easeFrom(slope) }
            )
          );
        }
        // The spinner's line is the ring's at rest: the weight comes from 0 as the value arrives.
        const grow = start(
          svg.animate(shares(h.share, share, 0), {
            duration: d,
            easing: curve('standard-productive'),
          })
        );
        // The spinner's base is the track: it stays, coming up the rest of the way if the spinner is still drawing on.
        if (h.base < 0.99)
          start(
            track.animate([{ opacity: h.base }, { opacity: 1 }], {
              duration: d,
              easing: 'linear',
            })
          );
        // Still growing in: the ring grows the rest of the way on the same clock, so its size doesn't jump.
        if (h.scale < 0.999)
          start(
            svg.animate([{ scale: `${h.scale}` }, { scale: '1' }], {
              duration: d,
              easing: curve('entrance-productive'),
            })
          );
        filling(grow, now);
        return;
      }
      // Arriving (mounting with a value, or in a place that had another mark): from nothing at 12 to the value, clockwise, the track with it.
      const step = ms(loaderRevealStep(px(share * CIRC)));
      filling(
        svg.animate(shares(0, share), {
          duration: step,
          easing: curve('entrance-productive'),
        }),
        now
      );
      track.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: step,
        easing: 'linear',
      });
      return;
    }

    // A new value: from the live end, by its length. A burst retargets the running tween.
    const at = live('--cds-ring-share', share);
    const weight = live('--cds-ring-weight', at);
    const last = tween.current ? reading.current : null;
    reading.current = { value: at, at: now };
    const running = tween.current;
    const s0 =
      running && !reduced
        ? retargetFrom(running.anim, running.at, now, ms(BURST), at, share)
        : null;
    if (
      running &&
      s0 !== null &&
      running.anim.effect instanceof KeyframeEffect
    ) {
      // The weight is retargeted at the same progress, so it holds where it is too.
      const w0 =
        retargetFrom(running.anim, running.at, now, ms(BURST), weight, share) ??
        s0;
      running.anim.effect.setKeyframes(shares(s0, share, w0));
      place(share);
      return;
    }
    running?.anim.cancel();
    tween.current = null;
    place(share);
    if (
      reduced ||
      (Math.abs(at - share) < 1e-3 && Math.abs(weight - share) < 1e-3)
    ) {
      setLanded((n) => n + 1);
      return;
    }
    const d = ms(durationStepForDistance(px(Math.abs(share - at) * CIRC)));
    filling(
      startNow(
        svg.animate(shares(at, share, weight), {
          duration: d,
          easing: continueFrom(last, at, now, d, share),
        })
      ),
      now
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- per value, per face
  }, [share, shown, reduced, timeScale]);

  /* ── the faces: one step at a time, out then in ────────────────────────── */

  useLayoutEffect(() => {
    faded.current?.cancel();
    faded.current = null;
    if (shown === want) {
      // Back before it had gone: the step out turns round.
      const out = leaving.current;
      if (out) {
        leaving.current = null;
        out.forEach((a) => {
          a.reverse();
          a.finished.then(
            () => a.cancel(),
            () => {}
          );
        });
      }
      return;
    }
    if (leaving.current) return;
    /** The status hand-off's out: the loader shrinks 4px, opaque; then the status mark takes its place, and plays the in. */
    const handOff = (svg: SVGSVGElement | null | undefined) => {
      const out = svg ? playHandoffOut(svg, { timeScale, reduced }) : [];
      if (!out.length) {
        setShown(want);
        return;
      }
      leaving.current = out;
      out[0].finished.then(
        () => {
          if (leaving.current !== out) return;
          leaving.current = null;
          const w = wantRef.current;
          if (isStatus(w)) setShown(w);
          else {
            // Asked for something else while it shrank: back to size, and take the next step from there.
            out.forEach((a) => a.cancel());
            setLanded((n) => n + 1);
          }
        },
        () => {}
      );
    };
    if (shown === 'spin') {
      // To a status: the spinner shrinks, still turning.
      if (isStatus(want)) {
        handOff(glyphRef.current?.querySelector<SVGSVGElement>('.cds-spinner'));
        return;
      }
      if (want !== 'ring') return;
      // The hand-off: take the spinner's angle and arc as they are now.
      const svg =
        glyphRef.current?.querySelector<SVGSVGElement>('.cds-spinner');
      const arc = svg?.querySelector<SVGCircleElement>('.cds-spinner__arc');
      if (svg && arc && !reduced) {
        const m = new DOMMatrix(getComputedStyle(svg).transform);
        const cs = getComputedStyle(arc);
        const base = svg.querySelector('.cds-spinner__base');
        handoff.current = {
          // The tail: the turn, and the dash's offset (the arc is centred on the turn, and draws on from its head).
          angle:
            (Math.atan2(m.b, m.a) * 180) / Math.PI -
            ((parseFloat(cs.strokeDashoffset) || 0) * 360) / CIRC,
          share: (parseFloat(cs.strokeDasharray) || 0) / CIRC,
          base: base ? parseFloat(getComputedStyle(base).opacity) : 1,
          // A spinner still growing in from 60% (its 220ms entrance): the ring takes its size from there.
          scale: parseFloat(getComputedStyle(svg).scale) || 1,
          rtl: getComputedStyle(svg).direction === 'rtl',
        };
      }
      // In the layout effect, so the ring takes the spinner's place before the next paint.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one step of the hand-off, read from the DOM
      setShown('ring');
      return;
    }
    if (shown === 'ring') {
      if (isStatus(want)) {
        // To a status: the arc reaches the full ring (or where it failed) first; then the hand-off.
        if (tween.current) return;
        handOff(svgRef.current);
        return;
      }
      // Back to turning: the ring closes, then the spinner draws on.
      const arc = arcRef.current;
      const track = trackRef.current;
      // (A status asked for while it closes takes the closed ring's place.)
      const go = () =>
        setShown(
          wantRef.current === 'spin' || isStatus(wantRef.current)
            ? wantRef.current
            : shown
        );
      if (!arc || !track || reduced) {
        go();
        return;
      }
      // The ring closes: the tail catches the head, and the track fades with it. The arc's drawn length and
      // its circle as they are now (its line, and so its radius, follow the weight).
      const svg = svgRef.current;
      const cs = getComputedStyle(arc);
      const drawn = parseFloat(cs.strokeDasharray) || 0;
      const circle = 2 * Math.PI * (parseFloat(cs.r) || drawing.arcR);
      const held = svg ? getComputedStyle(svg) : null;
      const hold = held
        ? (['--cds-ring-share', '--cds-ring-weight'] as const).map(
            (name) => [name, held.getPropertyValue(name)] as const
          )
        : [];
      tween.current?.anim.cancel();
      tween.current = null;
      // The base's break and the line hold where they were as it closes.
      for (const [name, v] of hold) if (v) svg?.style.setProperty(name, v);
      const d = ms('fast-02');
      const close = arc.animate(
        [
          { strokeDasharray: `${drawn} ${2 * circle}`, strokeDashoffset: '0' },
          { strokeDasharray: `0 ${2 * circle}`, strokeDashoffset: `${-drawn}` },
        ],
        { duration: d, easing: curve('exit-productive'), fill: 'forwards' }
      );
      const fade = track.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: d,
        easing: curve('exit-productive'),
        fill: 'forwards',
      });
      const out = [close, fade];
      leaving.current = out;
      close.finished.then(
        () => {
          if (leaving.current !== out) return;
          leaving.current = null;
          go();
        },
        () => {}
      );
      return;
    }
    // From a status mark: it fades out, then the ring or the spinner draws on.
    const glyph = glyphRef.current;
    if (!glyph || reduced) {
      setShown(want);
      return;
    }
    const fade = glyph.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: ms('fast-02'),
      easing: curve('exit-productive'),
      fill: 'forwards',
    });
    const out = [fade];
    leaving.current = out;
    fade.finished.then(
      () => {
        if (leaving.current !== out) return;
        leaving.current = null;
        if (wantRef.current === shown) {
          fade.cancel();
          return;
        }
        faded.current = fade;
        setShown(wantRef.current);
      },
      () => {}
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- per face, and when the arc lands
  }, [want, shown, landed]);

  /** The face shown before this one: a status mark that takes a loader's place plays the hand-off's in. */
  const prevShown = usePreviousCommit<Face | null>(shown, null);

  let glyph: ReactNode;
  if (shown === 'spin') {
    glyph = (
      <Spinner size={size} stroke={stroke} variant={variant} motion={motion} />
    );
  } else if (isStatus(shown)) {
    // Mounted once the loader has shrunk out: it plays the hand-off's in (the disc grows, the glyph draws on).
    glyph = (
      <StatusMark
        kind={shown === 'failed' ? 'error' : 'success'}
        size={size}
        from={prevShown === null ? undefined : 'pending'}
        description={label}
      />
    );
  } else {
    glyph = (
      <svg
        ref={svgRef}
        className={`cds-progress-ring__svg cds-progress-ring__svg--${drawing.gapStyle}`}
        viewBox={`0 0 ${BOX} ${BOX}`}
        width={size}
        height={size}
        aria-hidden="true"
        // The arc's share and weight are the arc effect's to place, before the paint: set here, a new
        // value would land at once and the effect would read it as where the arc already is. The rest is
        // the drawing at rest, in box units, which progress-ring.scss grows the line from.
        style={
          {
            '--cds-ring-edge': LOADER_EDGE,
            '--cds-ring-line0': drawing.line.toFixed(4),
            '--cds-ring-gap': drawing.gap.toFixed(4),
            '--cds-ring-grow-from': PROGRESS_RING_MOTION.growFrom,
            '--cds-ring-grow-to': PROGRESS_RING_MOTION.growTo,
            '--cds-ring-grow': PROGRESS_RING_MOTION.grow,
          } as CSSProperties
        }>
        <g className="cds-progress-ring__dir">
          <g ref={turnRef} className="cds-progress-ring__turn">
            <circle
              ref={trackRef}
              className="cds-progress-ring__track"
              cx={BOX / 2}
              cy={BOX / 2}
              r={drawing.r}
              strokeWidth={drawing.line}
            />
            <circle
              ref={arcRef}
              className="cds-progress-ring__arc"
              cx={BOX / 2}
              cy={BOX / 2}
              r={drawing.arcR}
              strokeWidth={drawing.line}
            />
          </g>
        </g>
      </svg>
    );
  }

  const textHidden = hideLabel && !helperText;
  return (
    <div
      className={[
        'cds-progress-ring',
        `cds-progress-ring--${size}`,
        variant === 'hero' && 'cds-progress-ring--hero',
        isError && 'cds-progress-ring--error',
        isError && value == null && 'cds-progress-ring--unknown',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-status={status}
      data-face={shown}
      style={{ '--cds-progress-ring-size': `${size}px` } as CSSProperties}>
      <span
        className="cds-progress-ring__mark"
        role="progressbar"
        aria-busy={!isFinished}
        aria-invalid={isError}
        aria-labelledby={labelId}
        aria-describedby={helperText ? helperTextId : undefined}
        aria-valuemin={!indeterminate ? 0 : undefined}
        aria-valuemax={!indeterminate ? max : undefined}
        aria-valuenow={!indeterminate ? capped : undefined}>
        <span
          ref={glyphRef}
          className="cds-progress-ring__glyph"
          aria-hidden="true">
          {glyph}
        </span>
      </span>
      <span
        className={[
          'cds-progress-ring__text',
          textHidden && 'cds-progress-ring__hidden',
        ]
          .filter(Boolean)
          .join(' ')}>
        <span
          id={labelId}
          className={[
            'cds-progress-ring__label',
            hideLabel && 'cds-progress-ring__hidden',
          ]
            .filter(Boolean)
            .join(' ')}>
          {label}
        </span>
        {helperText && (
          <span id={helperTextId} className="cds-progress-ring__helper-text">
            {helperText}
            <span className="cds-progress-ring__hidden" aria-live="polite">
              {isFinished ? 'Done' : 'Loading'}
            </span>
          </span>
        )}
      </span>
    </div>
  );
}
ProgressRing.displayName = 'ProgressRing';
