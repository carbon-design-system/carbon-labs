/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type RefObject,
} from 'react';
import {
  CONTENT_SWAP,
  DURATION_FLOOR_MS,
  afterLayout,
  animateLayout,
  inLayout,
  motionTokens,
  reflowTiming,
  type LayoutTransaction,
  easingCss,
  cubicBezier,
} from '@carbon-labs/v12-motion';
import { useLatest } from '@carbon-labs/react-selection-kit';

/* ============================================================================
 * useFilterPresence — a keyed list whose items come and go (a search
 * filtering it, an item removed), as the family's out, then in: the
 * listbox's content change (dropdown/ListboxSurface.tsx), for a list in the
 * page.
 *
 *   out     the items leaving fade where they are (CONTENT_SWAP.out:
 *           fast-01, exit-productive); nothing else moves yet
 *   move    then ONE layout transaction (`animateLayout`) on the list: its
 *           height, and the items that stay sliding to their new places
 *           (on both axes, so a wrapping list of tags reflows too),
 *           on one clock from the farthest travel (`reflowTiming`, the
 *           structure tier's `structureTiming`: duration by travel). Begun
 *           inside another layout change (a side panel pushing), it joins
 *           that clock: the items move over the time it has left, on its
 *           curve, and land on its frame
 *   hold    an out that ends while a layout change already covers the list
 *           (a side panel still pushing) waits for that change's end before
 *           the move: the list's own change is queued, as a holder's
 *           (carbon-motion's choreography contract), and plays as one move
 *           from where things are then
 *   in      then the new items fade in where they land (CONTENT_SWAP.in:
 *           fast-02, entrance-productive), staggered (`useStagger`'s
 *           delays, passed in), first to last
 *   turn    an item wanted again while it leaves fades back from where it
 *           is; a change while the out runs waits for it, then commits the
 *           latest
 *   typing  a change within `BURST_MS` of the one before (typing in a
 *           search) lands at once: whatever is running is cut to its end
 *           and the list is simply there. So the sequence plays for the
 *           first key after a pause, and a burst never waits on it
 *   reduced fades only, on the reduced clock, still out then in; no
 *           travel (the height lands at once)
 *
 * The items are the list's direct children carrying `data-cds-key` (their
 * React key): the box's, or `listRef`'s when the items sit deeper than the
 * box whose height moves (a table's rows, in its tbody, in the box).
 * Returns the elements to render: they lag `target` while the out runs
 * (the leaving ones are still there, fading). `enabled: false` lands every
 * change at once (a table still revealing out of its skeleton).
 *
 * A candidate carbon-motion pattern: a keyed list's presence (out, one
 * reflow, staggered in), which the listbox, the contained list and the tag
 * set's modal share.
 * ========================================================================== */

/** Changes closer together than this are a burst (typing): at once. The listbox's `TYPING_BURST_MS`. */
export const BURST_MS = 200;

const bezier = (name: keyof typeof motionTokens.easing) => easingCss(name);

/* ── the passes, read then write ──────────────────────────────────────────
 *
 * Each pass over the items reads everything first, then writes: a read
 * after a write (an animation started or cancelled, `data-out` dropped)
 * flushes style or layout again, so a per-item read-write loop costs one
 * flush per item on every key. Shared with the listbox's presence
 * (dropdown/ListboxSurface.tsx), which has the same out, move, in.
 * ------------------------------------------------------------------------- */

/**
 * Every animation on `els`, cancelled, and `data-out` dropped: all read,
 * then all cancelled, so one style flush for the lot. `spare` keeps an
 * animation running (a surface's snap).
 */
export function settleItems(
  els: Iterable<Element | null | undefined>,
  spare?: (a: Animation) => boolean
): void {
  const list = [...els].filter((e): e is Element => !!e);
  const anims = list.map((e) => e.getAnimations());
  for (const xs of anims) {
    for (const a of xs) {
      if (!spare?.(a)) {
        a.cancel();
      }
    }
  }
  for (const e of list) {
    if (e instanceof HTMLElement) {
      delete e.dataset.out;
    }
  }
}

export interface OutsOptions {
  /** The items on screen, in order. */
  items: readonly HTMLElement[];
  /** An item's key (`data-cds-key`; the listbox's `data-key`). */
  keyOf: (el: HTMLElement) => string;
  /** The item stays where it is in the new list (else it leaves). */
  stays: (key: string) => boolean;
  /** The outs running, by key: the caller's, kept across changes. */
  running: Map<string, Animation>;
  /** The fades' clock scale (reduced × slow motion). */
  k: number;
  /** The shortest fade, ms. */
  floor: number;
  /** An item starts (or keeps) leaving. */
  onLeave?: (key: string) => void;
}

/**
 * The out: the items leaving fade where they are (CONTENT_SWAP.out); one
 * wanted again while it leaves fades back from where it is. Every item's
 * drawn opacity is read first (one style flush), then the fades start and
 * stop. Returns how long until the last out ends, ms (0: nothing leaving).
 */
export function playOuts({
  items,
  keyOf,
  stays,
  running,
  k,
  floor,
  onLeave,
}: OutsOptions): number {
  const read = items.map((el) => {
    const key = keyOf(el);
    return {
      el,
      key,
      was: running.get(key),
      opacity: Number(getComputedStyle(el).opacity),
    };
  });
  let wait = 0;
  for (const { el, key, was, opacity } of read) {
    if (stays(key)) {
      // Wanted again while leaving: back from where it is.
      if (!was) {
        continue;
      }
      was.cancel();
      running.delete(key);
      delete el.dataset.out;
      el.animate([{ opacity }, { opacity: 1 }], {
        duration: Math.max(floor, motionTokens.duration['fast-01'] * k),
        easing: bezier('standard-productive'),
      });
      continue;
    }
    onLeave?.(key);
    if (was) {
      const t = was.effect?.getComputedTiming();
      wait = Math.max(
        wait,
        Number(t?.endTime ?? 0) - Number(was.currentTime ?? 0)
      );
      continue;
    }
    el.dataset.out = '';
    const ms = Math.max(
      floor,
      motionTokens.duration[CONTENT_SWAP.out.duration] * k * opacity
    );
    running.set(
      key,
      el.animate([{ opacity }, { opacity: 0 }], {
        duration: ms,
        easing: bezier(CONTENT_SWAP.out.easing),
        fill: 'forwards',
      })
    );
    wait = Math.max(wait, ms);
  }
  return wait;
}

export interface FilterPresenceOptions {
  /** Slow motion. Default 1. */
  timeScale?: number;
  reduced: boolean;
  /** The stagger's delay for the `i`th entering item, ms (`useStagger().delay`). */
  staggerDelay?: (index: number) => number;
  /** The items' parent, when it isn't the box (a tbody inside the box). Default the box. */
  listRef?: RefObject<HTMLElement | null>;
  /** False: every change lands at once, with nothing running. Default true. */
  enabled?: boolean;
}

export function useFilterPresence(
  rootRef: RefObject<HTMLElement | null>,
  boxRef: RefObject<HTMLElement | null>,
  target: ReactElement[],
  {
    timeScale = 1,
    reduced,
    staggerDelay = () => 0,
    listRef,
    enabled = true,
  }: FilterPresenceOptions
): ReactElement[] {
  const keyOf = (e: ReactElement) => String(e.key);
  const [rendered, setRendered] = useState<ReactElement[]>(target);
  const byKey = new Map(target.map((e) => [keyOf(e), e]));
  // A row still on screen takes the latest props; one leaving keeps its last.
  const rows = rendered.map((r) => byKey.get(keyOf(r)) ?? r);
  const targetSig = target.map(keyOf).join('|');
  const renderedSig = rendered.map(keyOf).join('|');

  const latest = useLatest({ target, timeScale, reduced, staggerDelay });
  const flip = useRef<{
    at: Map<string, { x: number; y: number }>;
    h: number;
  } | null>(null);
  const outAnims = useRef(new Map<string, Animation>());
  const outTimer = useRef(0);
  const lastChange = useRef(-Infinity);
  const atOnce = useRef(false);
  const seen = useRef(false);
  /** The commit waiting for a layout change to end (its token), or null. */
  const held = useRef<object | null>(null);
  /** The list's own move's transaction: a change during it turns round, it doesn't wait. */
  const own = useRef<LayoutTransaction | null>(null);

  const items = () =>
    Array.from(
      (listRef ?? boxRef).current?.querySelectorAll<HTMLElement>(
        ':scope > [data-cds-key]'
      ) ?? []
    );

  const commit = () => {
    outTimer.current = 0;
    const box = boxRef.current;
    // Hold: a layout change still covering the list goes first (not its own:
    // a change during its own move turns round from where it is).
    const covering = box ? inLayout(box) : null;
    if (box && covering && covering !== own.current) {
      const token = {};
      held.current = token;
      outTimer.current = -1;
      void afterLayout(box).then(() => {
        if (held.current !== token) {
          return;
        }
        held.current = null;
        commit();
      });
      return;
    }
    if (box) {
      // Reads only: one layout.
      const at = new Map<string, { x: number; y: number }>();
      const b = box.getBoundingClientRect();
      for (const el of items()) {
        if (el.dataset.out != null) {
          continue;
        }
        // From the box's corner, not the viewport's: a scroll between here
        // and the commit (the page's scroll anchoring) doesn't count as travel.
        const r = el.getBoundingClientRect();
        at.set(el.dataset.cdsKey!, { x: r.left - b.left, y: r.top - b.top });
      }
      flip.current = { at, h: b.height };
    }
    outAnims.current.clear();
    setRendered(latest.current.target);
  };

  /** Everything running, cut to its end. */
  const cut = () => {
    window.clearTimeout(outTimer.current);
    outTimer.current = 0;
    held.current = null;
    outAnims.current.forEach((a) => a.cancel());
    outAnims.current.clear();
    flip.current = null;
    const box = boxRef.current;
    settleItems([box, ...items()]);
    if (box) {
      box.style.overflow = '';
    }
  };

  useLayoutEffect(() => {
    // The first render is the list as it is: nothing animates (principle 3).
    if (!seen.current) {
      seen.current = true;
      return;
    }
    const running = outTimer.current !== 0 || outAnims.current.size > 0;
    if (targetSig === renderedSig && !running) {
      return;
    }
    const now = performance.now();
    const burst = now - lastChange.current < BURST_MS;
    lastChange.current = now;
    if (burst || !enabled || !boxRef.current) {
      // Off, only its own motion is cut: the items may be playing someone
      // else's (a table's rows fading in out of its skeleton).
      if (enabled || running) {
        cut();
      }
      atOnce.current = true;
      setRendered(target);
      return;
    }
    const keep = new Set(target.map(keyOf));
    const wait = playOuts({
      items: items(),
      keyOf: (el) => el.dataset.cdsKey!,
      stays: (key) => keep.has(key),
      running: outAnims.current,
      k: (reduced ? CONTENT_SWAP.reducedScale : 1) * timeScale,
      floor: DURATION_FLOOR_MS,
    });
    window.clearTimeout(outTimer.current);
    outTimer.current = 0;
    held.current = null;
    // Only items turning back: nothing to commit.
    if (targetSig === renderedSig) {
      return;
    }
    if (wait <= 0) {
      commit();
    } else {
      outTimer.current = window.setTimeout(commit, wait);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- on a change of the keys
  }, [targetSig]);

  // Committed: the height and the items that stay move as one layout
  // transaction; the new items fade in after it, staggered.
  useLayoutEffect(() => {
    const f = flip.current;
    flip.current = null;
    const once = atOnce.current;
    atOnce.current = false;
    const box = boxRef.current;
    const root = rootRef.current;
    if (once || !f || !box || !root) {
      return;
    }
    const {
      timeScale: ts,
      reduced: red,
      staggerDelay: delayOf,
    } = latest.current;
    const k = (red ? CONTENT_SWAP.reducedScale : 1) * ts;
    // Writes, then reads: everything settled, then every box in one layout.
    const list = items();
    settleItems([box, ...list]);
    const at0 = box.getBoundingClientRect();
    const h1 = at0.height;
    const boxes = list.map((el) => el.getBoundingClientRect());
    const moves: [HTMLElement, number, number][] = [];
    const entering: HTMLElement[] = [];
    let travel = 0;
    list.forEach((el, i) => {
      const old = f.at.get(el.dataset.cdsKey!);
      if (old === undefined) {
        entering.push(el);
        return;
      }
      const r = boxes[i]!;
      const dx = old.x - (r.left - at0.left);
      const dy = old.y - (r.top - at0.top);
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        moves.push([el, dx, dy]);
      }
      travel = Math.max(travel, Math.hypot(dx, dy));
    });
    travel = Math.max(travel, Math.abs(h1 - f.h));
    const fadeIn = (after: number) =>
      entering.forEach((el, i) =>
        el.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: Math.max(
            DURATION_FLOOR_MS,
            motionTokens.duration[CONTENT_SWAP.in.duration] * k
          ),
          delay: after + delayOf(i) * ts,
          easing: bezier(CONTENT_SWAP.in.easing),
          fill: 'backwards',
        })
      );
    if (red || travel < 0.5) {
      fadeIn(0);
      return;
    }
    const t = reflowTiming(travel, ts);
    box.style.overflow = 'hidden';
    const { animation, transaction } = animateLayout(
      root,
      box,
      [{ blockSize: `${f.h}px` }, { blockSize: `${h1}px` }],
      {
        ms: t.ms,
        easing: cubicBezier(t.ease),
        reason: 'list-filter',
        reduced: red,
      }
    );
    own.current = transaction;
    void transaction.finished.then(() => {
      box.style.overflow = '';
      if (own.current === transaction) {
        own.current = null;
      }
    });
    // The box's own timing: its travel's, or, joined to a layout change
    // already under way, the time that one has left on its curve.
    const timing = animation.effect?.getTiming();
    const ms = Number(timing?.duration ?? t.ms);
    const easing = timing?.easing ?? 'linear';
    moves.forEach(([el, dx, dy]) => {
      const move = el.animate(
        [{ translate: `${dx}px ${dy}px` }, { translate: '0 0' }],
        {
          duration: ms,
          easing,
        }
      );
      if (animation.startTime !== null) {
        move.startTime = animation.startTime;
      }
    });
    fadeIn(ms);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- after a commit only
  }, [renderedSig]);

  useEffect(() => () => window.clearTimeout(outTimer.current), []);

  return rows;
}
