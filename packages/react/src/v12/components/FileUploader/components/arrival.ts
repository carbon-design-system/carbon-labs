/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { moveDisclosure } from '@carbon-labs/react-disclosure';
import {
  STAGGER,
  motionTokens,
  staggerMsForSize,
  staggerSteps,
  easingCss,
} from '@carbon-labs/v12-motion';

/* ============================================================================
 * File items arriving and leaving: the list's two layout moves, for items
 * the app renders itself (v11's FileUploaderDropContainer pattern: the app
 * keeps the list and renders a FileUploaderItem per file).
 *
 *   batch     the items that mount under one list in one commit are one
 *             batch (gathered in a microtask, once every layout effect has
 *             run): they open their places in document order on a stagger,
 *             its step from the items' pitch (`staggerMsForSize`, the step
 *             `useStagger` takes for `size`) and clamped so the last starts
 *             within the stagger window (`STAGGER.windowMs`), as `useStagger`
 *             does. `useStagger` needs its count in one component; here the
 *             count is only known once the siblings have mounted, so the
 *             batch is gathered from the DOM
 *   each      an item's open is a disclosure move (the travel's step, the
 *             content following from half the open), so what's below the
 *             list moves down with each place as it opens
 *   leave     an item removed from the app's list leaves a copy where it
 *             stood, and the copy's place closes (a disclosure shut: one step
 *             faster, the content held still under the closing edge); the
 *             copy goes once it has closed. Items removed together leave in
 *             order (dismiss all's stagger), then close as one motion
 *   reduced   no batch and no copy: an item is there, or gone, at once
 * ========================================================================== */

interface Pending {
  row: HTMLElement;
  start: () => void;
  pitch: number;
  timeScale: number;
  timer: number | null;
}

const pending = new Map<HTMLElement, Pending[]>();

function flush(list: HTMLElement) {
  const batch = pending.get(list);
  pending.delete(list);
  if (!batch?.length) {
    return;
  }
  batch.sort((a, b) =>
    a.row.compareDocumentPosition(b.row) & Node.DOCUMENT_POSITION_FOLLOWING
      ? -1
      : 1
  );
  // Every row's shut style, computed once, so each open moves from it.
  for (const p of batch) {
    void getComputedStyle(p.row).gridTemplateRows;
  }
  const n = batch.length;
  const pitch = batch[0]!.pitch;
  const scale = batch[0]!.timeScale;
  const step =
    Math.min(staggerMsForSize(pitch), STAGGER.windowMs / Math.max(n - 1, 1)) *
    scale;
  batch.forEach((p, i) => {
    if (i === 0) {
      p.start();
    } else {
      p.timer = window.setTimeout(p.start, i * step);
    }
  });
}

/**
 * Join this commit's arrivals under `list`. `start` opens the row's place.
 * Returns a cancel (the item unmounted before it opened).
 */
export function joinArrival(
  list: HTMLElement,
  row: HTMLElement,
  start: () => void,
  opts: { pitch: number; timeScale: number }
): () => void {
  let batch = pending.get(list);
  if (!batch) {
    batch = [];
    pending.set(list, batch);
    queueMicrotask(() => flush(list));
  }
  const p: Pending = {
    row,
    start,
    pitch: opts.pitch,
    timeScale: opts.timeScale,
    timer: null,
  };
  batch.push(p);
  return () => {
    const b = pending.get(list);
    if (b) {
      const i = b.indexOf(p);
      if (i >= 0) {
        b.splice(i, 1);
      }
    }
    if (p.timer != null) {
      window.clearTimeout(p.timer);
    }
  };
}

/** Copies leaving one list in one commit, gathered as arrivals are. */
const leaving = new Map<
  HTMLElement,
  { row: HTMLElement; copy: HTMLElement }[]
>();

/** The copies' places close, as one motion (the disclosure's multi-body move). */
function shutCopies(list: HTMLElement, copies: HTMLElement[]) {
  for (const copy of copies) {
    // Its open style first, then shut: the close is a disclosure move.
    void getComputedStyle(copy).gridTemplateRows;
    copy.removeAttribute('data-open');
    copy.removeAttribute('data-unclipped');
    moveDisclosure(list, copy, false, () => copy.remove(), {
      reason: (n) => (n > 1 ? 'file-remove-all' : 'file-remove'),
    });
  }
}

function flushLeaving(list: HTMLElement, timeScale: number) {
  const batch = leaving.get(list) ?? [];
  leaving.delete(list);
  const copies: HTMLElement[] = [];
  for (const { row, copy } of batch) {
    // A StrictMode re-run: the item is still there.
    if (row.isConnected) {
      copy.remove();
    } else if (copy.isConnected) {
      copies.push(copy);
    }
  }
  if (copies.length < 2) {
    return shutCopies(list, copies);
  }
  // Remove all: every row up 8px and out in order, on the notifications
  // panel's dismiss-all step (02), then the list closes up.
  copies.sort((a, b) =>
    a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
  );
  const step =
    Math.min(staggerSteps['02'], STAGGER.windowMs / (copies.length - 1)) *
    timeScale;
  const out = copies.map((copy, i) =>
    (
      copy.querySelector<HTMLElement>('.cds-disclosure__content') ?? copy
    ).animate(
      [
        { opacity: 1, transform: 'none' },
        { opacity: 0, transform: 'translateY(-8px)' },
      ],
      {
        duration: motionTokens.duration['fast-01'] * timeScale,
        delay: i * step,
        easing: easingCss('exit-productive'),
        fill: 'forwards',
      }
    )
  );
  void Promise.all(out.map((a) => a.finished)).then(
    () =>
      shutCopies(
        list,
        copies.filter((c) => c.isConnected)
      ),
    () =>
      shutCopies(
        list,
        copies.filter((c) => c.isConnected)
      )
  );
}

/**
 * The item is leaving (its layout effect's cleanup, while it is still in the
 * DOM): a copy takes its place and closes it. A StrictMode re-run (the item
 * still there a microtask later) drops the copy.
 */
export function leaveWithCopy(
  row: HTMLElement,
  opts: { timeScale?: number } = {}
) {
  const list = row.parentElement;
  if (!list || !row.isConnected) {
    return;
  }
  const copy = row.cloneNode(true) as HTMLElement;
  copy.setAttribute('aria-hidden', 'true');
  copy.inert = true;
  copy.removeAttribute('data-file-row');
  copy.setAttribute('data-file-leaving', '');
  for (const el of [copy, ...copy.querySelectorAll<HTMLElement>('[id]')]) {
    el.removeAttribute('id');
  }
  list.insertBefore(copy, row);
  let batch = leaving.get(list);
  if (!batch) {
    batch = [];
    leaving.set(list, batch);
    queueMicrotask(() => flushLeaving(list, opts.timeScale ?? 1));
  }
  batch.push({ row, copy });
}
