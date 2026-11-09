/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import {
  CONTENT_SLIDE_PX,
  DURATION_FLOOR_MS,
  RELAYOUT,
  REDUCED_MOTION,
  animateLayout,
  durationStepForDistance,
  motionTokens,
  toEasing,
  type DurationToken,
  cubicBezier,
} from '@carbon-labs/v12-motion';

/* ============================================================================
 * The list reflow — a short row of items that gains or loses members (a
 * breadcrumb's trail, a pagination nav's window of page numbers), animated as
 * one change. Items are marked `data-reflow-key`; when the hook's `key`
 * changes, the row as it stands on screen is read during the render (before
 * React commits the new one: each item's box), and the difference plays
 * after the commit, where the items that left are copied (the elements React
 * took out, as they stood):
 *
 *   moves      an item in both rows slides from its old place to its new one
 *              (motion-core `animateLayout`, one layout transaction on the
 *              root, so whatever lives inside holds or follows), its clock
 *              from the largest edge travel (`durationStepForDistance`), on
 *              the productive standard curve
 *   leaving    a copy of the item, left in its old place (`aria-hidden`, inert),
 *              fades out on fast-02 (exit-productive): exits are faster than
 *              entrances
 *   arriving   fades in on moderate-01 (entrance-productive), sliding the
 *              content slide (8px) from the side it grows from; with
 *              `enter: 'snap'` it appears at once when its turn comes and
 *              only slides (the breadcrumb)
 *
 * Two orders:
 *
 *   sequence   out, then the moves, then in: a leaving item is fully gone
 *              before anything moves into its place, and an arriving one
 *              comes in once the row has made room (the breadcrumb). A
 *              removal alone (items leave, none arrive) plays together
 *              instead: the leaving items fade where they are as the rest
 *              close the gap, both starting on the same frame
 *              (removals play together everywhere, as TagSet's
 *              dismissal does); swaps and arrivals keep out, then in
 *   carry      one strip: the moves, leaving and arriving items all travel by
 *              the row's shift on the move's clock, the leaving fading out as
 *              they go, the arriving fading in from the relayout's `enterAt`,
 *              or once a still item leaving has faded out, whichever is later
 *              (the pagination nav's window)
 *
 * An item with a `data-reflow-target` descendant moves that layer instead of
 * itself (its box stays where layout put it).
 *
 * An item marked `data-reflow-still` arrives and leaves in place (a fade):
 * a fixed member of the row, such as a pagination nav's "…".
 *
 * A leaving item's copy is placed in its nearest `data-reflow-clip` ancestor
 * inside the root (positioned), else in the root: a part of the row that
 * clips or masks what moves in it (a pagination nav's window of numbers,
 * between soft edges) keeps clipping the copies too, and a copy keeps the
 * styles of the list it sat in.
 *
 * Interrupted, the row is read where it is on screen (transforms included),
 * so a new change turns round from there. Reduced motion: nothing travels;
 * the leaving fade out, then the arriving fade in, on the reduced clock.
 *
 * A candidate carbon-motion pattern.
 * ========================================================================== */

const ATTR = 'data-reflow-key';
/** An item that comes and goes in place (fades only), never travelling with the row: a "…" between numbers. */
const STILL = 'data-reflow-still';
/**
 * What travels: an item's `data-reflow-target` descendant if it has one, else
 * the item. Moving an inner layer leaves the item's own box where layout put
 * it, so whatever measures the items (a selection marker) reads their places,
 * not their moves.
 */
const TARGET = 'data-reflow-target';
const targetOf = (el: HTMLElement) =>
  el.querySelector<HTMLElement>(`[${TARGET}]`) ?? el;
/** Where a leaving item's copy goes: its nearest clipping part of the row, else the root. */
const CLIP = 'data-reflow-clip';

export interface ListReflowMove {
  /** The moves' duration token and ms (0 under reduced motion, or when nothing moves). */
  token: DurationToken;
  ms: number;
  /** When the moves start, ms after the change (the leaving items' fade in `sequence`). */
  delay: number;
  /** The largest edge travel, px. */
  travel: number;
  /** The moves' curve, as CSS. */
  easing: string;
}

export interface ListReflowOptions {
  /** Changes whenever the row's items change: a reflow plays. */
  key: string;
  /** `sequence` (out, move, in) or `carry` (one strip). Default `sequence`. */
  mode?: 'sequence' | 'carry';
  /** Arriving items slide from this side in `sequence`: -1 the start, 1 the end. Default -1. */
  enterFrom?: -1 | 1;
  /** `fade` (default): arriving items fade in. `snap`: they appear at once, when their turn comes (no fade; the slide stays). */
  enter?: 'fade' | 'snap';
  /** The leaving items' fade-out duration token. Default `fast-02`. */
  exitToken?: DurationToken;
  /** Multiplies every duration (slow motion). Default 1. */
  timeScale?: number;
  reduced: boolean;
  /**
   * After the commit, the new row measured, before anything is transformed:
   * a selection marker can measure and glide on the moves' clock here.
   */
  onReflow?: (move: ListReflowMove) => void;
  /** The layout transaction's reason. */
  reason?: string;
  /**
   * Where the moves' layout transaction is opened: `root` (default), one
   * transaction on the root that everything inside holds or follows; `item`,
   * one per moving item, so nothing else in the root follows them (a
   * selection marker inside that keeps its own glide).
   */
  transaction?: 'root' | 'item';
}

interface Before {
  box: DOMRect;
  /** The item itself: a leaving one is copied after the commit (`copyOf`), only if it left. */
  el: HTMLElement;
  /** The item's `data-reflow-clip` ancestor inside the root, if any. */
  host: HTMLElement | null;
}

interface Leaving {
  box: DOMRect;
  clone: HTMLElement;
  host: HTMLElement | null;
}

const css = (name: 'standard' | 'entrance' | 'exit') =>
  cubicBezier(toEasing({ name, mode: 'productive' }));
const translate = (x: number, y = 0) => `translate(${x}px, ${y}px)`;

/**
 * The row as it is on screen: each item's box, and the item. Only reads: the
 * copies are made after the commit, of the items that left (`copyOf`), not of
 * every item on every change.
 */
function capture(root: HTMLElement): Map<string, Before> {
  const out = new Map<string, Before>();
  root.querySelectorAll<HTMLElement>(`[${ATTR}]`).forEach((el) => {
    const host = el.parentElement?.closest<HTMLElement>(`[${CLIP}]`) ?? null;
    out.set(el.getAttribute(ATTR)!, {
      box: el.getBoundingClientRect(),
      el,
      host: host && root.contains(host) ? host : null,
    });
  });
  return out;
}

/**
 * A copy of a leaving item to leave behind: the element React has just
 * taken out of the row (detached, as it stood), or, if it is still in the
 * document, as it is now.
 */
function copyOf(el: HTMLElement): HTMLElement {
  const clone = el.cloneNode(true) as HTMLElement;
  clone.removeAttribute(ATTR);
  clone.removeAttribute('id');
  clone.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
  clone.querySelectorAll(`[${ATTR}]`).forEach((n) => n.removeAttribute(ATTR));
  clone.setAttribute('aria-hidden', 'true');
  clone.setAttribute('inert', '');
  clone.dataset.reflowCopy = '';
  return clone;
}

/** What a reflow has running: its animations, its copies, the items it holds in place. */
interface Running {
  running: Animation[];
  copies: HTMLElement[];
  held: HTMLElement[];
}

/** Stops a reflow where it is: its animations cancelled, its copies gone, its holds let go. */
function stopReflow(r: Running) {
  r.running.forEach((a) => a.cancel());
  r.running = [];
  r.copies.forEach((c) => c.remove());
  r.copies = [];
  r.held.forEach((el) => {
    el.style.removeProperty('opacity');
    el.style.removeProperty('transform');
  });
  r.held = [];
}

export function useListReflow(
  rootRef: RefObject<HTMLElement | null>,
  o: ListReflowOptions
) {
  const committed = useRef<string | null>(null);
  const before = useRef<Map<string, Before> | null>(null);
  const run = useRef<Running>({ running: [], copies: [], held: [] });

  // During the render that brings a new row: read the old one where it is on
  // screen (React hasn't committed yet; a layout effect would already see the
  // new row). Read once per change, and only read: a discarded render leaves
  // nothing behind but a snapshot the next commit replaces.
  const root = rootRef.current;
  if (
    root &&
    committed.current !== null &&
    committed.current !== o.key &&
    !before.current
  ) {
    before.current = capture(root);
  }

  useEffect(() => {
    const r = run.current;
    return () => stopReflow(r);
  }, []);

  useLayoutEffect(() => {
    const el = rootRef.current;
    const prev = before.current;
    before.current = null;
    const changed = committed.current !== null && committed.current !== o.key;
    committed.current = o.key;
    if (!el || !prev || !changed) {
      return;
    }
    const items = Array.from(el.querySelectorAll<HTMLElement>(`[${ATTR}]`));
    const keys = new Set(items.map((item) => item.getAttribute(ATTR)!));
    // The leaving items copied as they were, before a reflow under way lets go of them.
    const leaving: Leaving[] = [...prev]
      .filter(([k]) => !keys.has(k))
      .map(([, b]) => ({ box: b.box, host: b.host, clone: copyOf(b.el) }));
    stopReflow(run.current);
    playReflow(el, prev, items, leaving, o, run.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [o.key]);
}

/** Plays the difference between the row before (`prev`) and the row as it is now. */
function playReflow(
  root: HTMLElement,
  prev: Map<string, Before>,
  items: HTMLElement[],
  leaving: Leaving[],
  o: ListReflowOptions,
  run: Running
) {
  const {
    mode = 'sequence',
    enterFrom = -1,
    enter = 'fade',
    exitToken = 'fast-02',
    timeScale = 1,
    reduced,
    onReflow,
    reason,
    transaction = 'root',
  } = o;
  const rootBox = root.getBoundingClientRect();

  // ── what moved, what arrived, what left ──────────────────────────────
  const moves: { el: HTMLElement; dx: number; dy: number }[] = [];
  const arriving: HTMLElement[] = [];
  let travel = 0;
  for (const item of items) {
    const b = prev.get(item.getAttribute(ATTR)!);
    if (!b) {
      arriving.push(item);
      continue;
    }
    const a = item.getBoundingClientRect();
    const dx = b.box.left - a.left;
    const dy = b.box.top - a.top;
    travel = Math.max(
      travel,
      Math.abs(dx),
      Math.abs(dy),
      Math.abs(b.box.right - a.right),
      Math.abs(b.box.bottom - a.bottom)
    );
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
      moves.push({ el: targetOf(item), dx, dy });
    }
  }
  if (!moves.length && !arriving.length && !leaving.length) {
    return;
  }

  // ── the clocks ────────────────────────────────────────────────────────
  const fadeK = timeScale * (reduced ? REDUCED_MOTION.clock : 1);
  const exitMs = Math.max(
    DURATION_FLOOR_MS,
    motionTokens.duration[exitToken] * fadeK
  );
  const enterMs = Math.max(
    DURATION_FLOOR_MS,
    motionTokens.duration['moderate-01'] * fadeK
  );
  const token = durationStepForDistance(travel);
  const moveMs =
    reduced || !moves.length ? 0 : motionTokens.duration[token] * timeScale;
  const easing = css('standard');
  const sequence = mode === 'sequence' || reduced;
  // A removal alone: the leaving items fade as the rest close the gap.
  const together =
    sequence && !reduced && leaving.length > 0 && !arriving.length;
  const delay = sequence && leaving.length && !together ? exitMs : 0;
  // The row's shift (carry): the moving items' mean travel along the row.
  const shift = moves.length
    ? moves.reduce((s, m) => s + m.dx, 0) / moves.length
    : 0;

  onReflow?.({ token, ms: moveMs, delay, travel, easing });

  // ── leaving: copies where they were ───────────────────────────────────
  // Every host read first, then the copies placed: no read after a write.
  const placed = leaving.map(({ box, clone, host: clip }) => {
    const host = clip?.isConnected ? clip : root;
    const hostBox = host === root ? rootBox : host.getBoundingClientRect();
    return {
      box,
      clone,
      host,
      left: box.left - hostBox.left - host.clientLeft + host.scrollLeft,
      top: box.top - hostBox.top - host.clientTop + host.scrollTop,
    };
  });
  for (const { box, clone, host, left, top } of placed) {
    clone.style.position = 'absolute';
    clone.style.margin = '0';
    clone.style.boxSizing = 'border-box';
    clone.style.left = `${left}px`;
    clone.style.top = `${top}px`;
    clone.style.width = `${box.width}px`;
    clone.style.height = `${box.height}px`;
    clone.style.pointerEvents = 'none';
    host.appendChild(clone);
    run.copies.push(clone);
    const fade = clone.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: exitMs,
      easing: css('exit'),
      fill: 'forwards',
    });
    run.running.push(fade);
    if (!sequence && Math.abs(shift) > 0.5 && !clone.hasAttribute(STILL)) {
      run.running.push(
        clone.animate(
          [{ transform: translate(0) }, { transform: translate(-shift) }],
          {
            duration: moveMs,
            easing,
            fill: 'forwards',
          }
        )
      );
    }
    const done = () => {
      clone.remove();
      run.copies = run.copies.filter((c) => c !== clone);
    };
    fade.finished.then(done, () => undefined);
  }

  // ── moves ─────────────────────────────────────────────────────────────
  const startMoves = () => {
    for (const { el: m, dx, dy } of moves) {
      m.style.removeProperty('transform');
      const { animation } = animateLayout(
        transaction === 'root' ? root : m,
        m,
        [{ transform: translate(dx, dy) }, { transform: 'none' }],
        { ms: moveMs, easing, reason: reason ?? 'list-reflow' }
      );
      run.running.push(animation);
    }
  };
  if (moveMs > 0) {
    if (delay > 0) {
      // Held where they were until the leaving items are gone.
      for (const { el: m, dx, dy } of moves) {
        m.style.transform = translate(dx, dy);
        run.held.push(m);
      }
      const t = window.setTimeout(startMoves, delay);
      run.running.push({
        cancel: () => window.clearTimeout(t),
      } as unknown as Animation);
    } else {
      startMoves();
    }
  }

  // ── arriving ──────────────────────────────────────────────────────────
  // Carry: from the relayout's `enterAt`, and never while an item that goes
  // in place (`data-reflow-still`, a "…") is still fading: a number arriving
  // where the "…" stood comes in once it has gone (out, then in).
  const stillLeaving = leaving.some(({ clone }) => clone.hasAttribute(STILL));
  const enterAt = sequence
    ? delay + moveMs
    : Math.max(moveMs * RELAYOUT.enterAt, stillLeaving ? exitMs : 0);
  for (const a of arriving) {
    const still = a.hasAttribute(STILL);
    const from =
      reduced || still
        ? 'none'
        : sequence
          ? translate(enterFrom * CONTENT_SLIDE_PX)
          : translate(shift);
    if (!sequence && !reduced && !still && Math.abs(shift) > 0.5) {
      run.running.push(
        targetOf(a).animate([{ transform: from }, { transform: 'none' }], {
          duration: moveMs,
          easing,
        })
      );
    }
    if (enter === 'snap' && !still) {
      // Unseen until its turn, then there: the slide (if any) without the fade.
      if (enterAt > 0) {
        run.running.push(
          a.animate([{ opacity: 0 }, { opacity: 0 }], { duration: enterAt })
        );
      }
      if (sequence && !reduced) {
        run.running.push(
          a.animate([{ transform: from }, { transform: 'none' }], {
            duration: enterMs,
            delay: enterAt,
            easing: css('entrance'),
            fill: 'backwards',
          })
        );
      }
      continue;
    }
    run.running.push(
      a.animate(
        sequence && !reduced && !still
          ? [
              { opacity: 0, transform: from },
              { opacity: 1, transform: 'none' },
            ]
          : [{ opacity: 0 }, { opacity: 1 }],
        {
          duration: enterMs,
          delay: enterAt,
          easing: css('entrance'),
          fill: 'backwards',
        }
      )
    );
  }
}

/** The data attribute an item carries: its key in the row. */
export const reflowKey = (key: string) => ({ [ATTR]: key });
