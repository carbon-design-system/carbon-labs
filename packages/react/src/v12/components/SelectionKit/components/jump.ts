/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DURATION_FLOOR_MS,
  motionTokens,
  SELECTION_ARRIVAL,
  selectionDuration,
  type Selection,
  type SelectionRect,
  easingCss,
} from '@carbon-labs/v12-motion';
import { SELECTION_LANDED_PX } from '@carbon-labs/v12-motion';
import type { SelectionMotion } from '@carbon-labs/v12-motion';

/* ============================================================================
 * The jump — how a selector goes where a glide would mislead: out, then in
 * (the side nav between groups; the tree anywhere but between two leaves of
 * one group). Selectors never fade; a glide is only for a move within a
 * group.
 *
 *   out      the old selector, from where it is (leaning, if a press reached
 *            toward the new row), shrinks JUMP_OUT_SHRINK px in width and
 *            height (half on every side), exit-productive, opaque to its
 *            last frame, and is gone: the kit's leave (the engine's `hide`,
 *            `leave: 'hold'`). It starts on the frame after the
 *            commit that asked for it
 *   in       then the new one comes in at the new row JUMP_IN_SHRINK px
 *            small, opaque, growing to full, entrance-snap: the kit's
 *            arrival (the engine's `show`)
 *   clock    the whole jump runs on the glide's shortest clock, one row's
 *            travel (a row and the gap: fast-01, 80ms, at every size), in
 *            the component's slow motion; a third for the out, two thirds
 *            for the in
 *   hover    the new row keeps an unselected row's hover round the selector
 *            until it has landed (`data-landing`, `@mixin selection-landing`),
 *            a glide's as a jump's. On a jump that hover shrinks with the old
 *            selector, by the same amount on the same clock and curve
 *            (`--sel-jump-inset`), and waits there for the new selector,
 *            which comes in at exactly its size. Without a
 *            hover (a keyboard move, a change from outside) the selector
 *            shrinks and grows alone, the same amounts and clock
 *   moves    a move during the out waits for it; the in plays at whatever
 *            is current then. The in also waits for a row to land on (the
 *            side nav's page in a group still opening: ghost's swap), the
 *            hover held meanwhile
 *   gone     a jump from a selector already gone (the side nav's, folded
 *            away with its group as another opened): the hover's shrink
 *            alone is the out, on the same clock, then the in
 *   reduced  no size change and no fade: the selector is at the new row at
 *            once
 *
 * The component decides when a move is a jump, and plays the in when its
 * sync finds the selector hidden after the out (`arriving()`).
 * ========================================================================== */

/**
 * The jump's sizes, px off the selector's width and height, half on every
 * side, as the arrival's `shrink` counts them: the old selector goes 4px
 * small (2px in on every side), the new one comes in from 4px small, so the
 * jump reads clearly.
 */
export const JUMP_OUT_SHRINK = 4;
export const JUMP_IN_SHRINK = 4;
/**
 * The out's share of the jump's clock; the in has the rest (the new selector coming in takes
 * longer than the old one going out).
 */
export const JUMP_OUT_SHARE = 1 / 3;

/** The hover's inset on a jump, px on every side (registered in selection-kit.scss). */
const INSET = '--sel-jump-inset';
const ITEM = '.sel__item';

/**
 * The jump's whole clock, out and in: the glide's shortest, the step its
 * timing table gives one row's travel (a row and the gap: fast-01, 80ms, at
 * every size), in the component's slow motion.
 */
export function jumpClock(
  root: HTMLElement,
  row: Element,
  sel: Selection,
  m: SelectionMotion
): number {
  const r = sel.rectOf(row);
  const gap =
    parseFloat(getComputedStyle(root).getPropertyValue('--sel-gap')) || 0;
  return Math.max(
    DURATION_FLOOR_MS,
    motionTokens.duration[selectionDuration(r.b - r.t + gap, m.timing)] *
      m.timeScale
  );
}

/**
 * The selector's edges are the row's: it has landed. Within the engine's own
 * `SELECTION_LANDED_PX` (an edge that close is put on its target exactly, and
 * a glide ends on it exactly), so a landing is never missed by a remainder.
 */
const landed = (a: SelectionRect, b: SelectionRect) =>
  Math.abs(a.l - b.l) < SELECTION_LANDED_PX &&
  Math.abs(a.t - b.t) < SELECTION_LANDED_PX &&
  Math.abs(a.r - b.r) < SELECTION_LANDED_PX &&
  Math.abs(a.b - b.b) < SELECTION_LANDED_PX;

const sameRect = (a: SelectionRect, b: SelectionRect) =>
  a.l === b.l && a.t === b.t && a.r === b.r && a.b === b.b;

/**
 * A per-frame landing check that reads no layout while the selector is
 * plainly still on its way: no layout reads in a frame loop. The
 * selector's live edges are the engine's own numbers (no read);
 * the item's box (`rectOf`) is a layout read, and in a frame loop a forced
 * one, since the engine writes the selector each frame before it. So the box
 * is read once, as the check starts, and again only when the selector has
 * reached that box (to confirm it: the landing is seen on the same frame as
 * before) or has stopped short of it (the item moved: a resize retargeted the
 * move). Mid-glide, nothing is read; landed and still (a press's release
 * playing out), nothing either.
 */
export function landingCheck(): (sel: Selection, item: Element) => boolean {
  let el: Element | null = null;
  let box: SelectionRect | null = null;
  let last: SelectionRect | null = null;
  /** The last answer was a confirmed landing (a fresh box). */
  let was = false;
  return (sel, item) => {
    const live = sel.live();
    const moved = !last || !sameRect(last, live);
    last = { ...live };
    if (item !== el || !box) {
      el = item;
      box = sel.rectOf(item);
    } else if (was && !moved) {
      return true;
    } // landed, and nothing has moved since
    else if (landed(live, box) || !moved) {
      box = sel.rectOf(item);
    } else {
      return (was = false);
    }
    return (was = landed(live, box));
  };
}

/** The engine's leave: the opacity animation `hide()` just started on the selector, if any. */
function leaveAnimation(root: HTMLElement): Animation | undefined {
  const ind = root.querySelector<HTMLElement>(':scope > .sel__indicator');
  // A script animation (not a CSS transition's or animation's) on opacity.
  return ind
    ?.getAnimations()
    .filter(
      (a) =>
        !('transitionProperty' in a) &&
        !('animationName' in a) &&
        a.effect instanceof KeyframeEffect &&
        a.effect.getKeyframes().some((k) => 'opacity' in k)
    )
    .pop();
}

export interface SelectionJumpOptions {
  /** The track: the selection's root, which carries `data-landing`, `data-jump` and the hover's inset. */
  root: () => HTMLElement | null;
  sel: () => Selection | null;
  /** The component's motion dials (its slow motion, its timing table, its arrival). */
  motion: () => SelectionMotion;
  /** Reduced motion: a jump is at the new row at once. */
  reduced: () => boolean;
  /** The row the selector is landing on. Default the root's `.sel__item[data-selected]`. */
  current?: () => Element | null;
}

export interface SelectionJump {
  /** A jump's out is under way: the in waits for it (the component's sync returns). */
  leaving(): boolean;
  /** The out is done and the in hasn't played: the next arrival is the jump's in. */
  arriving(): boolean;
  /** The jump's out, from where the selector is, toward `to`; then `next` (the component's sync, to play the in). Reduced: at `to` at once. */
  leave(to: Element, next: () => void): void;
  /** The jump's in at `row` (the selector is hidden and `arriving()`). */
  arrive(row: Element): void;
  /** No in is coming: the selector arrives some other way, or has nowhere to go. */
  clear(): void;
  /** The row keeps its hover round the selector until the selector has landed on it (a glide calls this as it starts; a jump's out does). */
  hold(): void;
  /** Unmounted: nothing comes in. */
  dispose(): void;
}

export function createSelectionJump(o: SelectionJumpOptions): SelectionJump {
  /** The out under way: its token, so a later one replaces it. */
  let out: object | null = null;
  let pendingIn = false;
  let landFrame = 0;
  /** The hover's shrink with the old selector (on the root, held until the landing ends). */
  let inset: Animation | null = null;
  const current =
    o.current ??
    (() => o.root()?.querySelector(`${ITEM}[data-selected]`) ?? null);

  const endInset = (root: HTMLElement | null) => {
    inset?.cancel();
    inset = null;
    if (root) {
      delete root.dataset.jump;
    }
  };

  const hold = () => {
    const root = o.root();
    if (!root) {
      return;
    }
    root.dataset.landing = '';
    cancelAnimationFrame(landFrame);
    const isLanded = landingCheck();
    // Checked every frame, from the move's start until the selector is shown
    // and its edges are the row's (or there's no current row and no in to
    // wait for). A later move keeps the one check going. While a jump waits
    // there may be no current row yet: the side nav's new page is in a group
    // still opening (marked once it has landed, then the in plays). Mid-glide
    // it reads no layout (`landingCheck`).
    const check = () => {
      const sel = o.sel();
      const el = current();
      const waiting = !!out || pendingIn;
      if (sel && (waiting || (el && sel.shown() && !isLanded(sel, el)))) {
        landFrame = requestAnimationFrame(check);
        return;
      }
      delete root.dataset.landing;
      endInset(root);
    };
    landFrame = requestAnimationFrame(check);
  };

  return {
    leaving: () => !!out,
    arriving: () => pendingIn,
    clear: () => void (pendingIn = false),
    hold: () => {
      // A glide: the hover round its row is whole.
      endInset(o.root());
      hold();
    },
    leave(to, next) {
      const root = o.root();
      const sel = o.sel();
      if (!root || !sel) {
        return;
      }
      pendingIn = false;
      // Reduced: no size change and no fade; the selector is there at once.
      if (o.reduced()) {
        if (sel.shown()) {
          sel.moveTo(to, { instant: true });
        } else {
          sel.show(to, { instant: true });
        }
        return;
      }
      const token = {};
      out = token;
      endInset(root);
      root.dataset.jump = '';
      hold();
      const done = () => {
        if (out !== token) {
          return;
        }
        out = null;
        pendingIn = true;
        next();
      };
      // It starts on the next frame, not in this commit: a click's commit
      // can run longer than the out's whole share (a third of 80ms), which
      // would then pass unseen. Until then the selector is where it was, as
      // painted.
      requestAnimationFrame(() => {
        if (out !== token) {
          return;
        }
        // On its share of the jump's clock (the leave's own clock rescaled).
        const m = o.motion();
        const { arrival, timeScale } = m;
        const ms = jumpClock(root, to, sel, m) * JUMP_OUT_SHARE;
        // Already gone (the side nav's selector left with its group as the
        // person opened another, ghost's one open group): the hover shrinks
        // alone, on the same clock, and then the in.
        const shown = sel.shown();
        if (shown) {
          sel.configure({
            arrival: { ...arrival, from: undefined, shrink: JUMP_OUT_SHRINK },
            timeScale: ms / motionTokens.duration[SELECTION_ARRIVAL.out],
          });
          sel.hide({ leave: 'hold' });
          sel.configure({ arrival, timeScale });
        }
        // The held leave's opacity animation is the out's clock, started with the shrink:
        // left pending, it could take the frame before's start and end the out early.
        const now = performance.now();
        const leave = shown ? leaveAnimation(root) : undefined;
        if (leave) {
          leave.startTime = now;
        }
        // The hover round the new row shrinks with the old selector: the
        // same amount (half the shrink on every side), clock, curve and
        // start, and holds there for the in, which starts at its size.
        inset = root.animate(
          [{ [INSET]: '0px' }, { [INSET]: `${JUMP_OUT_SHRINK / 2}px` }],
          {
            duration: Math.max(DURATION_FLOOR_MS, ms),
            easing: easingCss('exit-productive'),
            fill: 'forwards',
          }
        );
        inset.startTime = now;
        // The out's clock: the leave's, or with nothing to leave the hover's.
        void (leave ?? inset).finished.then(done, done);
      });
    },
    arrive(row) {
      const root = o.root();
      const sel = o.sel();
      pendingIn = false;
      if (!root || !sel) {
        return;
      }
      // The kit's arrival, from JUMP_IN_SHRINK small, on its share of the
      // jump's clock (the arrival's own clock rescaled).
      const m = o.motion();
      const { arrival, timeScale } = m;
      sel.configure({
        arrival: { ...arrival, from: undefined, shrink: JUMP_IN_SHRINK },
        timeScale:
          (jumpClock(root, row, sel, m) * (1 - JUMP_OUT_SHARE)) /
          motionTokens.duration[SELECTION_ARRIVAL.in],
      });
      sel.show(row);
      sel.configure({ arrival, timeScale });
    },
    dispose() {
      out = null;
      pendingIn = false;
      cancelAnimationFrame(landFrame);
      endInset(o.root());
    },
  };
}

/**
 * What a move holds round the item it lands on: the hover the item showed
 * before the move. `hover` for a pointer (and for a key, whose focus only
 * just moved there: no hover showed yet unless the pointer rests on it),
 * `hover-focus` when the item already had keyboard focus (Enter or Space on
 * a focused item, manual activation), `none` when nothing showed (the
 * selector dragged and dropped there: no hover while dragging).
 */
export type LandingHold = 'hover' | 'hover-focus' | 'none';

export interface LandingHoldOptions extends Pick<
  SelectionJumpOptions,
  'root' | 'sel' | 'reduced'
> {
  /** How the list marks its selected item. Default `[aria-selected="true"]` (tabs, the content switcher). */
  selected?: string;
}

/**
 * For the lists that only glide (tabs, vertical tabs, the content switcher):
 * the item a move lands on keeps the hover it showed round the selector
 * until the selector has landed, `data-landing` on the root from the move's
 * start (the side nav's and the tree's `hold`, the same rule:
 * `@mixin selection-landing`). Call it with the move's clock as the move
 * starts. A move at once (reduced motion), or onto an item that showed no
 * hover, holds nothing: there the selected item's own hover is simply there.
 * (Their selector is always placed, never shown or hidden, so the jump's
 * `hold`, which waits only on a shown one, doesn't fit them.)
 */
export function useLandingHold(
  o: LandingHoldOptions
): (el: Element, ms: number | undefined, how: LandingHold) => void {
  // The getters read refs: the first render's are always current.
  const [{ root, sel, reduced, selected = '[aria-selected="true"]' }] =
    useState(o);
  const frame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  return useCallback(
    (el, ms, how) => {
      const r = root();
      if (!r) {
        return;
      }
      cancelAnimationFrame(frame.current);
      const shown =
        how !== 'none' &&
        el.matches(how === 'hover' ? ':hover' : ':hover, :focus-visible');
      // A move that holds nothing ends a hold still running for an earlier
      // one (a key after a click): its item has no hover to keep.
      if (!ms || !shown || reduced()) {
        delete r.dataset.landing;
        return;
      }
      r.dataset.landing = '';
      // Every frame until the selector's edges are the selected item's (it
      // is the new one from the commit this move starts), and the press's
      // release on it has played out (the rollover's script animations: the
      // circle that opens the pressed color back to the hover), so the
      // selected item's hover takes over from the hover alone.
      const releasing = (item: Element) =>
        item
          .getAnimations()
          .some(
            (a) =>
              !('transitionProperty' in a) &&
              !('animationName' in a) &&
              a.playState === 'running'
          );
      // Mid-glide it reads no layout (`landingCheck`); the item's animations
      // are read only once the selector has landed.
      const isLanded = landingCheck();
      const check = () => {
        const s = sel();
        const cur = r.querySelector(`${ITEM}${selected}`);
        if (s && cur && (!isLanded(s, cur) || releasing(cur))) {
          frame.current = requestAnimationFrame(check);
          return;
        }
        delete r.dataset.landing;
      };
      frame.current = requestAnimationFrame(check);
    },
    [root, sel, reduced, selected]
  );
}

/** A component's jump, made once and disposed on unmount. Its getters read refs, so they are always current. */
export function useSelectionJump(o: SelectionJumpOptions): SelectionJump {
  const [jump] = useState(() => createSelectionJump(o));
  useEffect(() => () => jump.dispose(), [jump]);
  return jump;
}
