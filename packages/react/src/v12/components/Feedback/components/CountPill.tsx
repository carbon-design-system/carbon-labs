/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  motionTokens,
  DURATION_FLOOR_MS,
  REDUCED_MOTION,
  easingCss,
} from '@carbon-labs/v12-motion';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import { rollParts } from '@carbon-labs/react-roll-text';
// Its own styles (fb-count): it renders styled wherever it's imported.
import './feedback.scss';

/* ============================================================================
 * The count pill — how many things one notification stands for (a group's
 * count). It counts up and down, and arrives as the charts' status pill.
 *
 *   arrive   the charts' status pill entrance (`FreshnessPill`): a circle
 *            the pill's height, 50% → 100% (`fast-02`, entrance-productive),
 *            then — wider than a circle — its window opens into the pill
 *            (`moderate-02`, standard-expressive); the figure is there from
 *            the first frame, inside the circle. A pill within 4px of its
 *            circle (a single figure) doesn't open: it is there
 *   count    the figure rolls: up, the old one leaves upward and the new
 *            comes from below; down, the reverse — 10px and a fade, on
 *            `moderate-01` (motion-icons' count roll, `COUNT`); the pill's
 *            width follows on the same clock, from where it is
 *   still    only the figures that changed roll (RollText's rule,
 *            `rollParts`): with as
 *            many digits, figures stay by place — 12 → 13 rolls the 2, the 1
 *            still; 10 → 20 rolls the 1, the 0 still. A different number of
 *            digits (9 → 10, 99 → 100), or less than half the figures staying
 *            (19 → 20), rolls the whole number. The figures that stay are a
 *            layer of their own; the rolling layers keep their places, so
 *            every layer lines up (tabular figures, one cell). Mid-roll, a
 *            count whose still figures differ (18 → 19 → 20) rolls whole,
 *            and keeps rolling whole until it lands (as RollText): the
 *            figures that stood still leave from where they stood
 *   burst    a roll interrupted by the next count turns round from where the
 *            figure is on screen: the figure leaving starts at its live
 *            offset and fade, never popping back to full, and one already
 *            leaving rolls on to the end rather than vanishing
 *   from     mounted with `from`, it rolls on from that count instead of
 *            arriving (a group's card come back to the front as a new card)
 *   reduced  the new figure fades in place on the reduced clock; no roll, no grow
 *   clock    a count that changes as part of a larger event (a group's next
 *            member cross-fading in) rolls — or arrives, circle and window
 *            together — on that event's clock, given by its host (`clock`),
 *            so the figure lands as the words do: one motion, one clock,
 *            the standard. `null`: the figure
 *            changes with words swapped out, then in — no motion of its own
 *   rest     on whole pixels: its width rounded up to
 *            the whole pixel, and its start, which follows the title's text
 *            width, nudged to the nearest whole pixel (`left`, so nothing
 *            else moves). Measured whenever it renders, its fonts load or
 *            its line resizes; drawn at a scale (arriving), it waits
 * ========================================================================== */

const dur = (t: keyof typeof motionTokens.duration) => motionTokens.duration[t];
const ease = (t: keyof typeof motionTokens.easing) => easingCss(t);
/** The roll's travel, px (motion-icons' count roll). */
const ROLL = 10;
/** Wider than its circle by more than this, px, the arriving pill opens its window; less, it arrives as it is. */
const OPEN_MIN = 4;

/** The clock of the event a count changes in: the roll and the pill's width run on it. `ms` as played (scaled). */
export interface CountClock {
  ms: number;
  easing: string;
}

export interface CountPillProps {
  value: number;
  /**
   * The clock of the event this count changes in (one motion, one clock):
   * the roll and the width run on it, so the figure lands with the rest of
   * the event. Default: the count's own (`moderate-01`, standard-productive).
   * `null`: no roll — the figure changes with the words around it, which the
   * host swaps out, then in.
   */
  clock?: CountClock | null;
  /** The count before it mounted: it rolls on from this instead of arriving. */
  from?: number;
  /** Its accessible name. Default `"<n> notifications"`. */
  label?: string;
  className?: string;
}

/** How a figure splits: the count of figures still at its start (`pre`) and end (`post`); none, it rolls whole. */
interface Split {
  pre: number;
  post: number;
}
const WHOLE: Split = { pre: 0, post: 0 };
const isWhole = (s: Split) => s.pre + s.post === 0;

/** The figures of `a` → `b` that stay still (RollText's rule). */
function splitOf(a: string, b: string): Split {
  const parts = rollParts(a, b);
  if (parts.length === 1) return WHOLE;
  const [first, last] = [parts[0]!, parts[parts.length - 1]!];
  return {
    pre: 'still' in first ? first.still.length : 0,
    post: 'still' in last ? last.still.length : 0,
  };
}

/** A count's text cut at its split: the still start, the part that rolls, the still end. */
function cut(value: number, split: Split): [string, string, string] {
  const t = String(value);
  const pre = Math.min(split.pre, t.length);
  const post = Math.min(split.post, t.length - pre);
  return [
    t.slice(0, pre),
    t.slice(pre, t.length - post),
    t.slice(t.length - post),
  ];
}

/** Figures that hold their place, unseen (the part of a layer drawn by another). */
const hold = (s: string) =>
  s ? <span className="fb-count__hold">{s}</span> : null;

/** A figure on its way out: where it is on screen as the next one comes, which way it goes, and on what clock. */
interface Out {
  key: number;
  value: number;
  /** Its figures that stood still: they stay (drawn by the new count's still layer), or (`stills`) leave too, from where they stood. */
  split: Split;
  stills: boolean;
  up: boolean;
  opacity: number;
  y: number;
  ms: number;
  easing: string;
}

let outSeq = 0;

/** An element's live opacity and y offset (its `translate`), mid-animation included. */
function liveOf(el: HTMLElement | null): { opacity: number; y: number } {
  if (!el) return { opacity: 1, y: 0 };
  const cs = getComputedStyle(el);
  const tr = cs.translate;
  const y =
    !tr || tr === 'none' ? 0 : parseFloat(tr.split(/\s+/)[1] ?? '0') || 0;
  return { opacity: Number(cs.opacity), y };
}

/**
 * The pill's resting width: its live figure's, plus its padding, rounded up
 * to the whole pixel (at least its circle). Read as laid out, whatever scale
 * it is drawn at (its arrival's, uniform).
 */
function restWidth(el: HTMLElement, figure: HTMLElement | null): number {
  const cs = getComputedStyle(el);
  const s = el.getBoundingClientRect().height / el.offsetHeight || 1;
  const fig = figure ? figure.getBoundingClientRect().width / s : 0;
  const w = fig + parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
  return Math.max(parseFloat(cs.minWidth) || 0, Math.ceil(w - 0.01));
}

/** What moves a box: a running animation or transition of one of these, on it or around it, means it isn't at rest. */
const GEOMETRY =
  /^(transform|translate|scale|rotate|top|left|right|bottom|inset|width|height|inlineSize|blockSize|margin|padding)/;

/**
 * What is moving the element's box: the running animations and transitions of its geometry on it or an
 * ancestor. Each one's own animations (not the page's, audit FB-3), read once per pass.
 */
function movers(el: HTMLElement): Animation[] {
  const found: Animation[] = [];
  for (let n: HTMLElement | null = el; n; n = n.parentElement) {
    for (const a of n.getAnimations()) {
      if (a.playState !== 'running') continue;
      const geometry =
        a instanceof CSSTransition
          ? GEOMETRY.test(
              a.transitionProperty.replace(/-(\w)/g, (_, c: string) =>
                c.toUpperCase()
              )
            )
          : a.effect instanceof KeyframeEffect &&
            a.effect
              .getKeyframes()
              .some((f) => Object.keys(f).some((k) => GEOMETRY.test(k)));
      if (geometry) found.push(a);
    }
  }
  return found;
}

/** How many times a rest pass waits for moves to finish before it gives up (each wait is one set of moves). */
const MAX_REST_ROUNDS = 8;

export function CountPill({
  value,
  from,
  clock,
  label,
  className,
}: CountPillProps) {
  const { reduced, timeScale } = useFeedbackMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const figureRef = useRef<HTMLSpanElement>(null);
  const [outgoing, setOutgoing] = useState<Out[]>([]);
  const prev = useRef<number | null>(
    from != null && from !== value ? from : null
  );
  /** The figures that stay still as the count rolls (none at rest from an arrival, or rolling whole). */
  const [split, setSplit] = useState<Split>(WHOLE);
  const width = useRef<number | null>(null);
  const k = (t: keyof typeof motionTokens.duration) =>
    Math.max(DURATION_FLOOR_MS, dur(t) * timeScale);
  // The roll's clock: the event's, when the host gives one; else its own.
  const rollMs = clock ? clock.ms : k('moderate-01');
  const rollEase = clock ? clock.easing : ease('standard-productive');

  /** Its width at rest, rounded up to the whole pixel (not while the width moves: that ends on a rounded width). */
  const restSize = () => {
    const el = ref.current;
    if (!el || el.getAnimations().some((a) => a.id === 'count-width')) return;
    el.style.inlineSize = '';
    el.style.inlineSize = `${restWidth(el, figureRef.current)}px`;
  };
  /** Its start on the nearest whole pixel; false while something moves it or it is drawn at a scale (then it can't be read). */
  const nudge = useRef(0);
  /** True once placed (or nothing to place); else the moves it waits on (none: it can't be read now). */
  const restAt = (): true | Animation[] => {
    const el = ref.current;
    const p = el?.offsetParent;
    if (!el || !p) return true;
    const moves = movers(el);
    if (moves.length) return moves;
    const r = el.getBoundingClientRect();
    // Drawn at a scale with nothing on it or around it moving: it can't be read.
    if (Math.abs(r.height - el.offsetHeight) > 0.01) return [];
    const x = r.left - p.getBoundingClientRect().left - nudge.current;
    const dx = Math.round(x) - x;
    if (Math.abs(dx - nudge.current) > 0.001) {
      nudge.current = dx;
      // In full: layout is in 1/64px, and a rounded nudge (0.328 for 0.328125) lands a step short.
      el.style.left = Math.abs(dx) < 0.001 ? '' : `${dx}px`;
    }
    return true;
  };
  const rest = useRef<() => void>(() => undefined);
  /** The pass under way: a newer one supersedes it. */
  const pass = useRef(0);
  useLayoutEffect(() => {
    rest.current = () => {
      restSize();
      const mine = ++pass.current;
      // Moving (its arrival, its card's): measure once those moves have finished, and again if others
      // have started by then. A bounded number of rounds, and nothing polls in between (audit FB-3).
      const settle = (round: number) => {
        const moves = restAt();
        if (moves === true || !moves.length || round >= MAX_REST_ROUNDS) return;
        // A loop never finishes: it is measured at its next pass instead.
        if (moves.some((a) => a.effect?.getTiming().iterations === Infinity))
          return;
        void Promise.allSettled(moves.map((a) => a.finished)).then(() => {
          // A frame after the last of them, so a move that follows on is under way.
          requestAnimationFrame(() => {
            if (pass.current === mine) settle(round + 1);
          });
        });
      };
      settle(0);
    };
  });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const was = prev.current;
    prev.current = value;
    const live = el.getAnimations().some((a) => a.id === 'count-width')
      ? el.offsetWidth
      : width.current;
    el.getAnimations().forEach((a) => a.id === 'count-width' && a.cancel());
    restSize();
    const w = el.offsetWidth;
    width.current = w;

    if (was === null) {
      // Arriving: the status pill's circle, then the pill. Arriving as part
      // of a larger event (a group's second member cross-fading in), on that
      // event's clock: the circle and the window together. Coming in with
      // words swapped in (`clock` null), it is theirs: no arrival of its own.
      if (clock === null) return;
      if (reduced) {
        el.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: clock ? clock.ms : k('moderate-01') * REDUCED_MOTION.clock,
          easing: 'linear',
        });
        return;
      }
      const h = el.offsetHeight;
      el.animate(
        [{ transform: 'scale(0.5)' }, { transform: 'scale(1)' }],
        clock
          ? { duration: clock.ms, easing: clock.easing }
          : { duration: k('fast-02'), easing: ease('entrance-productive') }
      );
      // Its window opens only when the pill is a pill: a single figure is a
      // circle give or take 2px, and opening 1.5px over moderate-02 is sub-pixel
      // shimmer with nothing to say.
      if (w > h + OPEN_MIN) {
        el.animate(
          [
            { clipPath: `inset(0px ${(w - h) / 2}px round ${h / 2}px)` },
            { clipPath: `inset(0px 0px round ${h / 2}px)` },
          ],
          clock
            ? { duration: clock.ms, easing: clock.easing }
            : {
                duration: k('moderate-02'),
                delay: k('fast-02'),
                easing: ease('standard-expressive'),
                fill: 'backwards',
              }
        );
      }
      return;
    }
    if (was === value) return;
    // Changing with words swapped out, then in: the figure is theirs, no roll of its own.
    if (clock === null) {
      // (Its split stays unchanged: its layers line up figure by figure, so it reads as one figure.)
      figureRef.current?.getAnimations().forEach((a) => a.cancel());
      return;
    }
    const up = value > was;
    // The figure leaving goes from where it is on screen, not from full.
    const fig = figureRef.current;
    const at = liveOf(fig);
    const rolling = !!fig
      ?.getAnimations()
      .some((a) => a.playState === 'running');
    fig?.getAnimations().forEach((a) => a.cancel());
    // Only the figures that changed roll; mid-roll with other still figures, the whole count rolls.
    let next = splitOf(String(was), String(value));
    if (rolling && (next.pre !== split.pre || next.post !== split.post))
      next = WHOLE;
    setSplit(next);
    // Rolling whole, the figures that stood still leave too; else they stay, and only the rest leaves.
    const out = isWhole(next)
      ? { split, stills: true }
      : { split: next, stills: false };
    // Its own clock is reduced here; an event's clock comes already reduced by its host.
    const ms = reduced && !clock ? rollMs * REDUCED_MOTION.clock : rollMs;
    setOutgoing((o) => [
      ...o,
      { key: ++outSeq, value: was, ...out, up, ...at, ms, easing: rollEase },
    ]);
    if (reduced) {
      fig?.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: ms,
        easing: 'linear',
      });
      return;
    }
    fig?.animate(
      [
        { translate: `0 ${up ? ROLL : -ROLL}px`, opacity: 0 },
        { translate: '0 0', opacity: 1 },
      ],
      { duration: ms, easing: rollEase }
    );
    if (live != null && Math.abs(live - w) > 0.5) {
      const a = el.animate([{ width: `${live}px` }, { width: `${w}px` }], {
        duration: ms,
        easing: rollEase,
      });
      a.id = 'count-width';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- on a new value only
  }, [value]);

  // At rest on whole pixels: when its count, its words or its look change, its fonts load, or its line
  // resizes. Not on every render (audit FB-3): an unrelated one changes nothing it measures.
  useLayoutEffect(() => rest.current(), [value, label, className, split]);
  useEffect(() => {
    const el = ref.current;
    const passes = pass;
    if (!el) return;
    let on = true;
    void document.fonts?.ready.then(() => on && rest.current());
    const ro =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => rest.current());
    if (el.parentElement) ro?.observe(el.parentElement);
    return () => {
      on = false;
      ro?.disconnect();
      passes.current++;
    };
  }, []);

  const done = (key: number) =>
    setOutgoing((o) => o.filter((x) => x.key !== key));
  const [pre, mid, post] = cut(value, split);

  return (
    <span
      ref={ref}
      className={['fb-count', className].filter(Boolean).join(' ')}
      role="img"
      aria-label={label ?? `${value} notifications`}>
      {pre || post ? (
        <span className="fb-count__still" aria-hidden="true">
          {pre}
          {hold(mid)}
          {post}
        </span>
      ) : null}
      <span ref={figureRef} className="fb-count__figure" aria-hidden="true">
        {hold(pre)}
        {mid}
        {hold(post)}
      </span>
      {outgoing.map((o) => (
        <OutFigure key={o.key} out={o} reduced={reduced} onDone={done} />
      ))}
    </span>
  );
}

/**
 * A figure rolling away from where it stood, then dropped: the part that rolled, from its live
 * offset and fade, and (`stills`) the figures that stood still, from where they stood.
 */
function OutFigure({
  out,
  reduced,
  onDone,
}: {
  out: Out;
  reduced: boolean;
  onDone: (key: number) => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const stillRef = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const leave = (el: HTMLElement, y: number, opacity: number) =>
      reduced
        ? el.animate([{ opacity }, { opacity: 0 }], {
            duration: Math.max(DURATION_FLOOR_MS, out.ms * opacity),
            easing: 'linear',
            fill: 'forwards',
          })
        : el.animate(
            [
              { translate: `0 ${y}px`, opacity },
              { translate: `0 ${out.up ? -ROLL : ROLL}px`, opacity: 0 },
            ],
            { duration: out.ms, easing: out.easing, fill: 'forwards' }
          );
    if (stillRef.current) leave(stillRef.current, 0, 1);
    if (!ref.current) return;
    leave(ref.current, out.y, out.opacity).finished.then(
      () => onDone(out.key),
      () => undefined
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on mount
  }, []);
  const [pre, mid, post] = cut(out.value, out.split);
  return (
    <>
      {out.stills && (pre || post) ? (
        <span
          ref={stillRef}
          className="fb-count__figure fb-count__figure--out"
          aria-hidden="true">
          {pre}
          {hold(mid)}
          {post}
        </span>
      ) : null}
      <span
        ref={ref}
        className="fb-count__figure fb-count__figure--out"
        aria-hidden="true">
        {hold(pre)}
        {mid}
        {hold(post)}
      </span>
    </>
  );
}
