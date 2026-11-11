/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  DURATION_FLOOR_MS,
  SKELETON_WAVE,
  durationStepForDistance,
  motionTokens,
  stepDown,
  type DurationToken,
  easingCss,
} from '@carbon-labs/v12-motion';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import {
  CheckmarkFilled,
  ErrorFilled,
  type MotionIconHandle,
} from '@carbon-labs/react-motion-icons';
import { SwapSlot } from '@carbon-labs/react-feedback';
import { LOADER_KIT, useKitProps } from '@carbon-labs/react-kit-defaults';
import { LOADER_GROWTH, loaderGrowth } from '@carbon-labs/react-loading';
import { useLoopVisibility } from '@carbon-labs/react-util';
import {
  curveAtSpeed,
  curveCss,
  curveFrom,
  readSpeed,
  remainingMs,
  startNow,
  tweenSpeed,
  type Reading,
  type Tween,
} from './retarget';
import './progress-bar.scss';

/* ============================================================================
 * ProgressBar — Carbon v11's, prop for prop, on the kit's motion.
 *
 * The same API as `@carbon/react`'s ProgressBar: `label`, `value`, `max`,
 * `status` ('active' | 'finished' | 'error'), `size` ('small' | 'big'),
 * `type` ('default' | 'inline' | 'indented'), `helperText`, `hideLabel`;
 * indeterminate when `value` is unset; `role="progressbar"` with its value
 * attributes, `aria-busy`, `aria-invalid`, and the polite "Done" /
 * "Loading" announcement.
 *
 *   line        the loaders' stroke (size / 16 at most 2px, the Spinner's
 *               rule): the small bar is a 1px line (a 16px loader's), the big
 *               one 2px (a 32px loader's and up). The fill's ends are round, and the base (the
 *               track) is knocked out round it: it stops 2× the stroke short
 *               of the fill on each side, as the Spinner's base stops short
 *               of its arc. The base's own ends are round too, so the bar's
 *               two outer ends look the same whatever the value
 *   weight      the fill grows with the value: 1px more
 *               from 15% to 85% of the work, so the big bar's fill goes 2px
 *               → 3px and the small one's 1px → 2px, linearly, held outside
 *               that span (`PROGRESS_BAR_LINE`, on the loaders'
 *               `LOADER_GROWTH`). Only the fill grows, not the base line:
 *               the base keeps its rest stroke, and the fill
 *               grows down from the top edge it shares with the base (a
 *               centred growth would put the line on half pixels). The
 *               track's box is the rest stroke, so the label, the status
 *               icon and the layout never move; the knockout keeps
 *               its rest width. Unlike the ring, whose arc and base grow
 *               together (one line, one circle). It rides on the fill's own tween
 *               (`--cds-progress-bar-w`, in the same keyframes as the edges);
 *               the indeterminate loop has no amount, so it keeps the rest
 *               width
 *   colour      the loaders' (as the Spinner's and the ring's): neutral by
 *               default, the fill in `$icon-primary`, as every loader, not
 *               v11's blue; or
 *               `variant="hero"`, the fill in the kit's brand (`--cds-hero-loader`:
 *               IBM blue, v11's, unless a `KitDefaults brand` says
 *               otherwise). `KitDefaults variant` when none is given.
 *               Finished and error take the support colours. All over the
 *               neutral base, under every brand
 *   fill        travels from where it is to the new value, its clock from the
 *               distance (`durationStepForDistance`), on standard-productive.
 *               The fill's edges are two numbers on the track
 *               (`--cds-progress-bar-l` / `-r`, the share cut from each end),
 *               which the fill's clip and the base's knockout are both drawn
 *               from (progress-bar.scss); their live values are where a
 *               change starts from
 *   burst       at most one new tween per `fast-02`: an update inside that
 *               window retargets the running tween from the fill's place and
 *               speed, so a value updated many times a second moves the fill
 *               continuously toward the latest value (retarget.ts)
 *   loop        indeterminate: a segment crosses the track, at its widest
 *               `PROGRESS_BAR_MOTION.segment` of it (40%; v11's is a
 *               quarter), round at both ends with the knockout on both
 *               sides, one pass per period of the loading clock (`SKELETON_WAVE.periodMs`,
 *               the skeleton wave's: one loading rhythm on a page), each pass
 *               on standard-productive. The pass is pinned to the document
 *               timeline, so every bar on a page is in one phase, whenever
 *               it mounted (the Spinner's turn starts at its reveal from 12).
 *               Turning determinate picks up from the segment's live edges
 *               instead of restarting
 *   finished    the fill travels to the end; once it lands the bar takes the
 *               success color and the status icon swaps in (out then in,
 *               `playContentSwap`), then plays its beat once
 *   error       the bar takes the error color at once (it failed now) and
 *               stays where it failed: the fill doesn't run on to full, as
 *               v11's does. The error icon swaps in
 *   icon        one place in every example, the same for error and
 *               success: its end on the bar's end, centred on the label
 *               row, 17px above the line's top, at either size, with a label
 *               or a hidden one, with helper text or without. Indented sets
 *               the words in, not the icon; inline, the line gone, the icon
 *               at the bar's end on its one row (both departures from v11,
 *               whose icon moves with the label, kept on purpose).
 *               A hidden label keeps its row always, whether the icon shows
 *               or not, so the bar's height never changes as it ends
 *               (progress-bar.scss)
 *   mark        `mark={false}`: the bar never shows a status mark (the kit's
 *               `mark`): no icon and no swap, and nothing held for
 *               one, so with `hideLabel` it is the bare line, v11's hidden
 *               label (no row above it). Finished and error still colour the
 *               line; inline, the line stays rather than giving way to the
 *               label
 *   active      back from a status: the icon swaps out, the fill travels
 *   pulse       `pulse`: while the bar is active and determinate, a highlight
 *               resolves along the filled part from its start to the leading
 *               edge and out through it: one pass per loading period, every
 *               `PROGRESS_BAR_MOTION.pulsePeriods` periods (2), in the page's
 *               phase. It never passes the leading edge, so it shows the work
 *               moving, not progress. Off under reduced motion, finished or
 *               in error
 *   rtl         the bar is mirrored (`:dir(rtl)`), so the fill, the
 *               segment and the pulse run from the right
 *   reduced     no travel: the fill is at its value at once. Indeterminate is
 *               a still texture, three short segments evenly spaced on the
 *               track in the bar's color (the still dots' rhythm in bar
 *               form): nothing loops. The icon snaps, with no beat
 * ========================================================================== */

export type ProgressBarStatus = 'active' | 'finished' | 'error';

export interface ProgressBarProps {
  /** Additional class names. */
  className?: string;
  /** Text below the bar (hidden with `type="inline"`). */
  helperText?: ReactNode;
  /** Visually hide the label (it still names the bar). */
  hideLabel?: boolean;
  /** The bar's label. */
  label: string;
  /** The value at which the bar is full. Default 100. */
  max?: number;
  /** `big` (a 2px line, default) or `small` (1px): the loaders' stroke, size / 16, of a 32px and a 16px loader. */
  size?: 'small' | 'big';
  /** `active` (default), `finished` or `error`. */
  status?: ProgressBarStatus;
  /** `default`, `inline` (the label beside the bar) or `indented` (the text set in 16px). */
  type?: 'default' | 'inline' | 'indented';
  /** The current value. Unset: indeterminate. */
  value?: number;
  /**
   * A highlight that resolves along the filled part toward the leading edge,
   * repeating, while the bar is active and determinate: the work is moving.
   * It adds no progress. Off under reduced motion. Default false.
   */
  pulse?: boolean;
  /** Tuning: the indeterminate segment's widest share and the pulse's period. */
  motion?: Partial<ProgressBarMotion>;
  /**
   * The status mark (the check or the error icon at the bar's end). Default
   * true. False: the bar never shows one, and holds no room for it; with
   * `hideLabel`, the bare line. Finished and error still colour the line.
   */
  mark?: boolean;
  // @carbon-proposal api: variant-prop — The colour treatment is one `variant` prop (inverse, tonal, outlined, hero, neutral or filled), so colour is never said by a role or a structure. TBD
  /** `neutral` (default, `$icon-primary` over the neutral base) or `hero` (the kit's brand, IBM blue by default), as the Spinner's and the ring's. Not given: `KitDefaults variant`, else neutral. */
  variant?: 'neutral' | 'hero';
}

/** The bar's tuning. */
export interface ProgressBarMotion {
  /** The indeterminate segment at its widest, a share of the track (0.05–0.95). */
  segment: number;
  /** The pulse's period, in loading periods (`SKELETON_WAVE.periodMs`): a pass takes one, then it rests for the rest. */
  pulsePeriods: number;
}

export const PROGRESS_BAR_MOTION: ProgressBarMotion = {
  // Wider than the Carbon bar's quarter as it travels.
  segment: 0.4,
  // A pass on every other turn of the spinner: calmer than one a second.
  pulsePeriods: 2,
};

/**
 * The fill's growth with the value: `growPx` more from
 * `growFrom` (15%) to `growTo` (85%) of the work, linearly, held outside that
 * span: big 2px → 3px, small 1px → 2px; the base keeps its rest stroke.
 * The span is the loaders' one
 * (`LOADER_GROWTH`, the ring's too). progress-bar.scss draws the same from
 * the live weight.
 */
export const PROGRESS_BAR_LINE = {
  growFrom: LOADER_GROWTH.from,
  growTo: LOADER_GROWTH.to,
  growPx: 1,
};

/** The bar's line at a share of the work (0–1), px, from its rest width: `rest` up to 15%, `rest + growPx` from 85%. */
export function progressBarLine(rest: number, share: number): number {
  const { growFrom, growTo, growPx } = PROGRESS_BAR_LINE;
  return rest + growPx * loaderGrowth(share, growFrom, growTo);
}

/** The pulse's period, ms (unscaled): a whole number of loading periods. */
export function progressBarPulseMs(
  periods = PROGRESS_BAR_MOTION.pulsePeriods
): number {
  return SKELETON_WAVE.periodMs * Math.max(1, Math.round(periods));
}

/** The fill as a clip of the full bar: the share cut from each end (0–1). */
interface Clip {
  l: number;
  r: number;
}

const STANDARD = easingCss('standard-productive');
/** The burst window: at most one new tween per this step. */
const BURST: DurationToken = 'fast-02';

/** The fill's edges, on the track (registered numbers, progress-bar.scss). Physical: right to left mirrors the drawing. */
const L = '--cds-progress-bar-l';
const R = '--cds-progress-bar-r';
/** The pulse's place along the filled part: 0 behind its start, 1 out through the leading edge. */
const P = '--cds-progress-bar-pulse';

/** The share of the work the line's weight follows (0–1): the value, at rest; 0 while indeterminate. */
const W = '--cds-progress-bar-w';

const num = (n: number) => n.toFixed(5);
/** A keyframe for a clip, and the line's weight with it when given. */
const frame = ({ l, r }: Clip, w?: number): Keyframe =>
  w === undefined
    ? { [L]: num(l), [R]: num(r) }
    : { [L]: num(l), [R]: num(r), [W]: num(w) };
/** The clip at rest, and the weight. */
function place(track: HTMLElement, { l, r }: Clip, w: number) {
  track.style.setProperty(L, num(l));
  track.style.setProperty(R, num(r));
  track.style.setProperty(W, num(w));
}

/** The line's live weight, mid-animation included. */
function liveWeight(track: HTMLElement): number {
  const w = parseFloat(getComputedStyle(track).getPropertyValue(W));
  return Number.isFinite(w) ? w : 0;
}

/** The fill's live edges, mid-animation included. */
function liveClip(track: HTMLElement): Clip {
  const cs = getComputedStyle(track);
  const l = parseFloat(cs.getPropertyValue(L));
  const r = parseFloat(cs.getPropertyValue(R));
  return { l: Number.isFinite(l) ? l : 0, r: Number.isFinite(r) ? r : 1 };
}

/** One pass of the indeterminate segment: in from the start, across at its widest, out at the end. */
function loopFrames(segment: number): Keyframe[] {
  const travel = 1 + segment;
  return [
    { offset: 0, ...frame({ l: 0, r: 1 }) },
    { offset: segment / travel, ...frame({ l: 0, r: 1 - segment }) },
    { offset: 1 / travel, ...frame({ l: 1 - segment, r: 0 }) },
    { offset: 1, ...frame({ l: 1, r: 0 }) },
  ];
}

type Shown = 'finished' | 'error' | 'none';

export function ProgressBar({
  className,
  helperText,
  hideLabel,
  label,
  max = 100,
  size = 'big',
  status = 'active',
  type = 'default',
  value,
  pulse = false,
  motion,
  mark = true,
  variant: variantProp,
}: ProgressBarProps) {
  // KitDefaults: the provider's variant when none is given; every loader is neutral by default (v11's is the blue).
  const { variant = 'neutral' } = useKitProps(
    { variant: variantProp },
    LOADER_KIT
  );
  const labelId = useId();
  const helperTextId = useId();
  const { timeScale, reduced } = useFeedbackMotion();

  const isFinished = status === 'finished';
  const isError = status === 'error';
  const indeterminate =
    !isFinished && !isError && (value === null || value === undefined);

  // v11's capping: the value within 0…max, max when finished. An error keeps
  // the value it failed at (v11 resets it to 0 and fills the track); with no
  // value, 0.
  let capped = value;
  if (capped != null && capped > max) capped = max;
  if (capped != null && capped < 0) capped = 0;
  if (isError) capped = capped ?? 0;
  else if (isFinished) capped = max;
  const share = isFinished ? 1 : Math.min(1, Math.max(0, (capped ?? 0) / max));

  const segment = Math.min(
    0.95,
    Math.max(0.05, motion?.segment ?? PROGRESS_BAR_MOTION.segment)
  );
  const pulsePeriods = Math.max(
    1,
    Math.round(motion?.pulsePeriods ?? PROGRESS_BAR_MOTION.pulsePeriods)
  );

  /** The track: it carries the fill's edges, which the fill and the base are drawn from. */
  const trackRef = useRef<HTMLDivElement>(null);
  const placed = useRef(false);
  /** The fill's running tween (its share's ends and curve) and when its window started (the burst throttle's). */
  const fill = useRef<(Tween & { at: number }) | null>(null);
  /** The fill's share at the last update, to start a new tween at the speed it is moving. */
  const reading = useRef<Reading | null>(null);
  /** The loop is what shows (a rerun of the loop, as on a slow-motion change, isn't a fill leaving). */
  const looping = useRef(false);
  const statusKey: Shown = isFinished ? 'finished' : isError ? 'error' : 'none';
  /**
   * The status as shown: the icon and the bar's color. Finished waits for
   * the fill to land; error and active show at once.
   */
  const [shown, setShown] = useState<Shown>(statusKey);

  /* ── the fill ──────────────────────────────────────────────────────────── */

  const target = indeterminate ? null : share;
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const from = placed.current ? liveClip(track) : null;
    // The line's weight as it is now: a change starts from it, as from the edges.
    const fromW = from ? liveWeight(track) : 0;
    placed.current = true;
    const width = track.getBoundingClientRect().width;
    const ms = (token: DurationToken) =>
      Math.max(DURATION_FLOOR_MS, motionTokens.duration[token] * timeScale);
    const now = performance.now();
    let fillMs = 0;

    // A burst: inside the window, the running tween is retargeted from where the fill is, at its speed.
    const running = fill.current;
    const last = running ? reading.current : null;
    if (from) reading.current = { value: 1 - from.r, at: now };
    const live =
      running && running.anim.playState === 'running' ? running : null;
    const speed = live && from && from.l < 0.001 ? tweenSpeed(live) : null;
    const inWindow = !!live && now - live.at < ms(BURST);
    track.getAnimations().forEach((a) => a.cancel());
    fill.current = null;
    if (target === null) {
      const period = Math.max(
        DURATION_FLOOR_MS,
        SKELETON_WAVE.periodMs * timeScale
      );
      // No fill, the whole base, at its rest width (no amount to grow by). Reduced, the still texture is drawn over it (progress-bar.scss).
      place(track, { l: 0, r: 1 }, 0);
      if (!reduced) {
        // A fill already showing leaves toward the end first, a step faster than its travel, the line thinning with it.
        let leave = 0;
        if (from && !looping.current && 1 - from.r - from.l > 0.001) {
          const out = { l: 1 - from.r, r: from.r };
          leave = ms(
            stepDown(durationStepForDistance((out.l - from.l) * width))
          );
          track.animate([frame(from, fromW), frame(out, 0)], {
            duration: leave,
            easing: STANDARD,
          });
        }
        const loop = track.animate(loopFrames(segment), {
          duration: period,
          iterations: Infinity,
          easing: STANDARD,
        });
        // The page's phase (the document timeline, as the Spinner's turn): a bar
        // mounted mid-pass starts mid-track. After a leave, the loop joins at
        // the page's next pass.
        const t = Number(document.timeline.currentTime ?? 0);
        loop.startTime =
          leave > 0 ? Math.ceil((t + leave) / period) * period : 0;
      }
      looping.current = true;
    } else {
      looping.current = false;
      // Determinate: from the live edges (the loop's segment included) to the value, the line's weight with them
      // (from the loop's rest width, or from where it is).
      const to: Clip = { l: 0, r: 1 - target };
      place(track, to, target);
      if (from && !reduced) {
        // An error with no amount, from the loop: the segment leaves toward the end.
        const end =
          isError && target === 0 && from.l > 0.001
            ? { l: 1 - from.r, r: from.r }
            : to;
        const travel =
          Math.max(Math.abs(from.l - end.l), Math.abs(from.r - end.r)) * width;
        if (travel >= 0.5) {
          fillMs = ms(durationStepForDistance(travel));
          // Retargeted inside the window: never sooner than the running tween would have landed.
          if (inWindow) fillMs = Math.max(fillMs, remainingMs(live.anim));
          // Already moving: the new tween leaves at the fill's speed, the running tween's or the last readings'.
          const along = from.l < 0.001 && end.l < 0.001;
          const curve = along
            ? curveAtSpeed(
                speed ?? readSpeed(last, 1 - from.r, now),
                1 - from.r,
                1 - end.r,
                fillMs
              )
            : curveFrom(0);
          const anim = startNow(
            track.animate([frame(from, fromW), frame(end, target)], {
              duration: fillMs,
              easing: curveCss(curve),
            })
          );
          fill.current = {
            anim,
            from: 1 - from.r,
            to: 1 - end.r,
            curve,
            at: inWindow ? live.at : now,
          };
        }
      }
    }

    if (statusKey === 'finished' && fillMs > 0) {
      const t = setTimeout(() => setShown('finished'), fillMs);
      return () => clearTimeout(t);
    }
    setShown(statusKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- isError follows statusKey
  }, [target, reduced, timeScale, statusKey, segment]);

  /* ── the pulse ─────────────────────────────────────────────────────────── */

  // Active and determinate only: the loop is its own motion, and a finished
  // or failed bar has no work moving. Reduced motion: off.
  const pulsing = pulse && !reduced && !indeterminate && status === 'active';
  const pulseRef = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const band = pulseRef.current;
    if (!band || !pulsing) return;
    // One pass per loading period, on standard-productive, then a rest to the end of the pulse's period.
    const anim = band.animate(
      [
        { offset: 0, [P]: '0', easing: STANDARD },
        { offset: 1 / pulsePeriods, [P]: '1' },
        { offset: 1, [P]: '1' },
      ],
      {
        duration: Math.max(
          DURATION_FLOOR_MS,
          progressBarPulseMs(pulsePeriods) * timeScale
        ),
        iterations: Infinity,
      }
    );
    // The page's phase, as the loop's: each pass starts as the spinners pass 12 o'clock.
    anim.startTime = 0;
    return () => anim.cancel();
  }, [pulsing, timeScale, pulsePeriods]);

  // Off screen, closed or the page hidden: the loop and the pulse hold, and come back on the page's phase.
  useLoopVisibility(trackRef);

  /* ── the status icon ───────────────────────────────────────────────────── */

  // One handle per icon: the leaving icon's unmount mustn't clear the arriving one's.
  const finishedRef = useRef<MotionIconHandle>(null);
  const errorRef = useRef<MotionIconHandle>(null);
  const beat = useCallback(() => {
    if (reduced) return;
    void (shown === 'finished' ? finishedRef : errorRef).current?.play();
  }, [reduced, shown]);
  const statusIcon = !mark ? null : shown === 'finished' ? (
    <CheckmarkFilled ref={finishedRef} size={16} aria-hidden="true" />
  ) : shown === 'error' ? (
    <ErrorFilled ref={errorRef} size={16} aria-hidden="true" />
  ) : null;

  const classes = [
    'cds-progress-bar',
    `cds-progress-bar--${size}`,
    `cds-progress-bar--${type}`,
    variant === 'hero' && 'cds-progress-bar--hero',
    indeterminate && 'cds-progress-bar--indeterminate',
    shown === 'finished' && 'cds-progress-bar--finished',
    shown === 'error' && 'cds-progress-bar--error',
    reduced && 'cds-progress-bar--reduced',
    pulsing && 'cds-progress-bar--pulse',
    !mark && 'cds-progress-bar--markless',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} data-status={status}>
      <div
        className={[
          'cds-progress-bar__label',
          hideLabel && 'cds-progress-bar__hidden',
        ]
          .filter(Boolean)
          .join(' ')}
        id={labelId}>
        <span className="cds-progress-bar__label-text">{label}</span>
        {mark && (
          <SwapSlot
            swapKey={shown}
            className="cds-progress-bar__status"
            onLanded={beat}>
            {statusIcon}
          </SwapSlot>
        )}
      </div>
      <div
        ref={trackRef}
        className="cds-progress-bar__track"
        style={
          {
            '--cds-progress-bar-grow-from': PROGRESS_BAR_LINE.growFrom,
            '--cds-progress-bar-grow-to': PROGRESS_BAR_LINE.growTo,
            '--cds-progress-bar-grow': `${PROGRESS_BAR_LINE.growPx}px`,
          } as CSSProperties
        }
        role="progressbar"
        aria-busy={!isFinished}
        aria-invalid={isError}
        aria-labelledby={labelId}
        aria-describedby={helperText ? helperTextId : undefined}
        aria-valuemin={!indeterminate ? 0 : undefined}
        aria-valuemax={!indeterminate ? max : undefined}
        aria-valuenow={!indeterminate ? capped : undefined}>
        <div className="cds-progress-bar__base cds-progress-bar__base--start" />
        <div className="cds-progress-bar__base cds-progress-bar__base--end" />
        <div className="cds-progress-bar__bar">
          {pulsing && (
            <span className="cds-progress-bar__pulse">
              <span className="cds-progress-bar__pulse-band" ref={pulseRef} />
            </span>
          )}
        </div>
      </div>
      {helperText && (
        <div id={helperTextId} className="cds-progress-bar__helper-text">
          {helperText}
          <div className="cds-progress-bar__hidden" aria-live="polite">
            {isFinished ? 'Done' : 'Loading'}
          </div>
        </div>
      )}
    </div>
  );
}
ProgressBar.displayName = 'ProgressBar';
