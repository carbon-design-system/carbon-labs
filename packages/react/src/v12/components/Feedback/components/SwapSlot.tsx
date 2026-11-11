/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {
  distanceTokens,
  playContentSwap,
  reflowTiming,
  cubicBezier,
} from '@carbon-labs/v12-motion';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import { playShimmerReveal } from '@carbon-labs/react-shimmer-text';
import './feedback.scss';

/* ============================================================================
 * The swap slot — one place whose content changes, out then in
 * (carbon-motion's `playContentSwap`): a progress bar's status icon, a
 * progress step's icon (in place), a region's content (travelling).
 *
 *   key       `swapKey` names what is shown. A new key keeps the old face in
 *             the slot until it has left, then the new one comes in. Faces
 *             share one grid cell, so the slot never resizes. The old face
 *             leaves showing what it showed last (its words may change under
 *             one key: the ticking seconds), never what it arrived with
 *   in place  `fit="hug"`, a mark or a label: no travel, a mark that changes
 *             in place has no direction to move in. The swap with
 *             `distance: 0`: out `fast-01`, then in `fast-02`, fades only
 *   travel    `fit="fill"`, a region's content (a table, an empty state):
 *             the content swap, 16px (`distance`): the old face leaves up as
 *             it fades, then the new one comes up from below (`direction`
 *             -1: the reverse). The slot holds the old height while it
 *             leaves, then moves to the new one's with the in, clipped
 *   empty     a face with no content has nothing to fade: it leaves at
 *             once, so the new face doesn't wait for it
 *   inDelay   the new face waits at least this long (ms, before slow motion)
 *   enter     `fade` (default) or `reveal`: the new face arrives through the
 *             shimmer's band, one pass of it (`playShimmerReveal`),
 *             for words that should arrive softly (the turn's status, a
 *             step's words)
 *   landed    `onLanded` once the new face is in: the place for its beat
 *   reduced   a snap either way: the new face at once, no wait, the height
 *             at once
 *   first     the first face is simply there: no entrance
 *   fit       `hug` (default) or `fill`, the kit's `fit`.
 *             `hug`: inline, each face centred and no larger than
 *             its content, for a mark or a label. `fill`: a block, the
 *             container's width, and each face a block that fills it, for a
 *             region's content (a table, a panel). `hug` swaps in place,
 *             `fill` travels (above)
 * ========================================================================== */

interface Face {
  key: string;
  node: ReactNode;
  empty: boolean;
}

export interface SwapSlotProps {
  /** What is shown: a new key swaps it. */
  swapKey: string;
  /** The face for `swapKey`. */
  children?: ReactNode;
  /** The face has no content (nothing to fade out). Default: no children. */
  empty?: boolean;
  /** The new face waits at least this long, ms (slow motion multiplies it). */
  inDelay?: number;
  /** How the new face arrives: a fade (default), or through the shimmer's band (its reveal). */
  enter?: 'fade' | 'reveal';
  /** `hug` (default): inline, faces centred at their content's size, swapping in place. `fill`: a block, each face filling the slot, its content travelling 16px. */
  fit?: 'hug' | 'fill';
  /** `fill`'s way: 1 (default), the new face comes up from below; -1, down from above. */
  direction?: 1 | -1;
  /** `fill`'s travel, px. Default 16. */
  distance?: number;
  /** Called once the new face is in (not on the first face). */
  onLanded?: (face: HTMLElement) => void;
  className?: string;
  faceClassName?: string;
}

export function SwapSlot({
  swapKey,
  children,
  empty,
  inDelay = 0,
  enter = 'fade',
  fit = 'hug',
  direction = 1,
  distance: travel,
  onLanded,
  className,
  faceClassName,
}: SwapSlotProps) {
  const { timeScale, reduced } = useFeedbackMotion();
  const isEmpty = empty ?? (children == null || children === false);
  // `current` is the face as its key arrived with it: it leaves with what it showed.
  const [state, setState] = useState<{
    current: Face;
    leaving: Face | null;
    swaps: number;
  }>({
    current: { key: swapKey, node: children, empty: isEmpty },
    leaving: null,
    swaps: 0,
  });
  // What the face showed last: its words may have changed under one key (the
  // ticking seconds), and it leaves showing those, not the ones it arrived with.
  const shown = useRef<ReactNode>(children);
  if (state.current.key !== swapKey) {
    setState({
      current: { key: swapKey, node: children, empty: isEmpty },
      // eslint-disable-next-line react-hooks/refs -- read once, as the face starts to leave: what it last showed
      leaving: { ...state.current, node: shown.current },
      swaps: state.swaps + 1,
    });
  }
  useLayoutEffect(() => {
    shown.current = children;
  });
  const slotRef = useRef<HTMLSpanElement>(null);
  const onLandedRef = useRef(onLanded);
  useLayoutEffect(() => {
    onLandedRef.current = onLanded;
  });

  // A region's slot resizing for its new content: it holds the old
  // content's height while that leaves (an inline height, the faces clipped
  // to it), then moves to the new one's, read once the old face is gone (so
  // content that settles its height as it mounts, an empty state, is
  // followed), as the new one comes in.
  const resize = useRef<{ from: number; move: Animation | null } | null>(null);
  const heightOf = (el: HTMLElement) =>
    parseFloat(getComputedStyle(el).height) || 0;
  const holdForTheIn = (
    slot: HTMLElement,
    leavingEl: HTMLElement | null,
    incoming: HTMLElement
  ) => {
    // From where it is: holding or mid-move, its live height; else the old content's.
    const from = resize.current
      ? heightOf(slot)
      : (leavingEl?.offsetHeight ?? incoming.offsetHeight);
    resize.current?.move?.cancel();
    resize.current = null;
    slot.style.removeProperty('block-size');
    delete slot.dataset.resizing;
    if (reduced) return;
    slot.style.blockSize = `${from}px`;
    slot.dataset.resizing = '';
    resize.current = { from, move: null };
  };
  // The old face gone: the move to the new content's height, with the in.
  useLayoutEffect(() => {
    const slot = slotRef.current;
    const r = resize.current;
    if (state.leaving || !slot || !r || r.move) return;
    slot.style.removeProperty('block-size');
    const to = heightOf(slot);
    const settle = () => {
      resize.current = null;
      delete slot.dataset.resizing;
    };
    if (Math.abs(to - r.from) < 0.5) return settle();
    const t = reflowTiming(Math.abs(to - r.from), timeScale);
    const move = slot.animate(
      [{ blockSize: `${r.from}px` }, { blockSize: `${to}px` }],
      {
        duration: Math.max(1, t.ms),
        easing: cubicBezier(t.ease),
      }
    );
    r.move = move;
    move.finished.then(
      () => resize.current?.move === move && settle(),
      () => {}
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once the old face has gone
  }, [state.leaving]);

  useLayoutEffect(() => {
    if (state.swaps === 0) return;
    const slot = slotRef.current;
    const incoming = slot?.querySelector<HTMLElement>(
      ':scope > [data-swap-face="in"]'
    );
    if (!slot || !incoming) return;
    const leavingEl = slot.querySelector<HTMLElement>(
      ':scope > [data-swap-face="out"]'
    );
    const out = state.leaving && !state.leaving.empty ? leavingEl : null;
    // A region's content travels (16px unless given), its way; a mark swaps in place. Reduced: a snap.
    const distance = fit === 'fill' ? (travel ?? distanceTokens.md) : 0;
    const swap = playContentSwap({
      out,
      in: incoming,
      axis: 'y',
      direction: fit === 'fill' ? direction : 1,
      distance,
      timeScale,
      reduced,
    });
    const delay = reduced ? 0 : Math.max(swap.wait, inDelay * timeScale);
    // A snap's in has finished: a delay would re-arm it, showing the new face early.
    if (!reduced) swap.inAnimation.effect?.updateTiming({ delay });
    if (fit === 'fill') holdForTheIn(slot, leavingEl, incoming);
    // The reveal: the shimmer's band brings the new face in, after the same wait.
    const revealed =
      enter === 'reveal' && !reduced && !state.current.empty
        ? playShimmerReveal(incoming, { timeScale, delay })
        : null;
    if (revealed) swap.inAnimation.cancel();
    const arrival = revealed ?? swap.inAnimation;
    const landsEmpty = state.current.empty;
    let live = true;
    const done = () => {
      if (live)
        setState((s) =>
          s.swaps === state.swaps ? { ...s, leaving: null } : s
        );
    };
    if (swap.outAnimation) swap.outAnimation.finished.then(done, () => {});
    else done();
    arrival.finished.then(
      () => live && !landsEmpty && onLandedRef.current?.(incoming),
      () => {}
    );
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per swap
  }, [state.swaps]);

  const slotClass = [
    'cds-swap-slot',
    fit === 'fill' && 'cds-swap-slot--fill',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const face = faceClassName
    ? `cds-swap-slot__face ${faceClassName}`
    : 'cds-swap-slot__face';
  // Keyed by their own key, so the face shown stays the same node as it starts to leave.
  return (
    <span ref={slotRef} className={slotClass}>
      {state.leaving && state.leaving.key !== swapKey && (
        <span
          key={state.leaving.key}
          className={face}
          data-swap-face="out"
          aria-hidden="true">
          {state.leaving.node}
        </span>
      )}
      <span key={swapKey} className={face} data-swap-face="in">
        {children}
      </span>
    </span>
  );
}
