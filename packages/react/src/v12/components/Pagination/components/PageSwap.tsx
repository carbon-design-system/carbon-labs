/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useLayoutEffect, useRef, useState } from 'react';
import {
  playContentSwap,
  usePrefersReducedMotion,
  easingCss,
} from '@carbon-labs/v12-motion';

/* ============================================================================
 * PageSwap — the part of a text of the bar that changes with the page, out then in
 * ============================================================================
 *
 * Only what changes with the page swaps; the rest moves to its new place:
 *
 *   range    the "11–20" of "11–20 of 103 items": the content swap along x by
 *            the page's direction. The rest ("of 103 items") is not swapped:
 *            it moves from its old place to where the new range leaves it, on
 *            the swap's clock (out and in together, the standard easing)
 *   number   the page number (the select's, or "page 3"'s): the swap along y;
 *            forward (a higher page) the old number leaves upward and the new
 *            one comes up from below, back the other way
 *
 * The old text leaves 8px, fading; then the new one comes in from the other
 * side: the content swap (`playContentSwap`), out then in. A change with the page unmoved
 * (a new page size) comes from the end side.
 *
 * On x the leaving face is out of the flow, so the rest takes its new place at
 * once and glides there; on y the faces share one cell and the slot holds the
 * wider of the two while one leaves. The leaving face is aria-hidden: only the
 * current one is read. Reduced motion: a snap, the new text on one frame with
 * no fade, and the rest is there at once. The first text is simply there.
 * ========================================================================== */

interface Face {
  text: string;
  order: number;
}

export interface PageSwapProps {
  /** The text before the part that swaps (kept as written, spaces included). */
  before?: string;
  /** The part that swaps with the page. A new text swaps it. */
  text: string;
  /** The text after it: it moves to its new place as the part changes. */
  after?: string;
  /** Where the text sits in the sequence (the page): the direction of the change. */
  order: number;
  /** The axis of the swap: `x` (the range) or `y` (a number: forward leaves upward). Default `x`. */
  axis?: 'x' | 'y';
  timeScale?: number;
  className?: string;
}

/** The "11–20" of a range text, split from what is around it; the whole text when there is no such part. */
export function splitRange(text: string): {
  before: string;
  part: string;
  after: string;
} {
  // A range starts at a number's first digit, so a long run of digits is
  // scanned once, not from each of its digits.
  const m = /(?<![\d.,])\d[\d.,]*\s*[–—-]\s*\d[\d.,]*/.exec(text);
  if (!m) return { before: '', part: text, after: '' };
  return {
    before: text.slice(0, m.index),
    part: m[0],
    after: text.slice(m.index + m[0].length),
  };
}

/** A number in a text, split from what is around it; the whole text when it isn't there. */
export function splitNumber(
  text: string,
  n: number
): { before: string; part: string; after: string } {
  const at = text.lastIndexOf(String(n));
  if (at < 0) return { before: '', part: text, after: '' };
  return {
    before: text.slice(0, at),
    part: String(n),
    after: text.slice(at + String(n).length),
  };
}

const translateOf = (el: HTMLElement): number => {
  const t = getComputedStyle(el).transform;
  return t && t !== 'none' ? new DOMMatrixReadOnly(t).m41 : 0;
};

export function PageSwap({
  before = '',
  text,
  after = '',
  order,
  axis = 'x',
  timeScale = 1,
  className,
}: PageSwapProps) {
  const reduced = usePrefersReducedMotion();
  const [state, setState] = useState<{
    current: Face;
    leaving: Face | null;
    direction: number;
    swaps: number;
  }>({
    current: { text, order },
    leaving: null,
    direction: 1,
    swaps: 0,
  });
  if (state.current.text !== text) {
    setState({
      current: { text, order },
      leaving: state.current,
      // On y a higher page comes from below (+1), leaving upward; on x from the end side.
      direction: Math.sign(order - state.current.order) || 1,
      swaps: state.swaps + 1,
    });
  }
  const slotRef = useRef<HTMLSpanElement>(null);
  const afterRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (state.swaps === 0) return;
    const slot = slotRef.current;
    const incoming = slot?.querySelector<HTMLElement>(
      ':scope > [data-swap-face="in"]'
    );
    if (!slot || !incoming) return;
    const outgoing = slot.querySelector<HTMLElement>(
      ':scope > [data-swap-face="out"]'
    );
    // On x the leaving face is out of the flow, so the rest is already at its new place: the shift is
    // the difference of the two faces' widths (a translate doesn't change a width).
    const shift =
      axis === 'x' && outgoing
        ? outgoing.offsetWidth - incoming.offsetWidth
        : 0;
    const swap = playContentSwap({
      out: outgoing,
      in: incoming,
      axis,
      direction: state.direction,
      timeScale,
      reduced,
    });

    // The rest glides to its new place on the swap's clock, from its old place (or where it is, if
    // it is already moving).
    const rest = afterRef.current;
    if (rest && axis === 'x' && !reduced) {
      // Right to left, the rest sits before the slot on screen: it moves the other way.
      const sign = getComputedStyle(rest).direction === 'rtl' ? -1 : 1;
      const from = sign * shift + translateOf(rest);
      rest.getAnimations().forEach((a) => a.cancel());
      if (Math.abs(from) > 0.5) {
        rest.animate(
          [
            { transform: `translateX(${from}px)` },
            { transform: 'translateX(0)' },
          ],
          {
            duration: swap.wait + swap.inMs,
            easing: easingCss('standard-productive'),
          }
        );
      }
    }

    let live = true;
    const done = () => {
      if (live)
        setState((s) =>
          s.swaps === state.swaps ? { ...s, leaving: null } : s
        );
    };
    if (swap.outAnimation) swap.outAnimation.finished.then(done, () => {});
    else done();
    // A hidden tab never finishes it: the clock ends it too.
    const t = window.setTimeout(done, swap.outMs + 50);
    return () => {
      live = false;
      window.clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per swap
  }, [state.swaps]);

  // Keyed by their own text, so the face shown stays the same node as it starts to leave.
  const slot = (
    <span
      ref={slotRef}
      className={[
        'cds-pagination__swap',
        axis === 'x' && 'cds-pagination__swap--x',
      ]
        .filter(Boolean)
        .join(' ')}>
      {state.leaving && state.leaving.text !== text && (
        <span
          key={state.leaving.text}
          className="cds-pagination__swap-face"
          data-swap-face="out"
          aria-hidden="true">
          {state.leaving.text}
        </span>
      )}
      <span
        key={text}
        className="cds-pagination__swap-face"
        data-swap-face="in">
        {text}
      </span>
    </span>
  );
  // A bare number (the select's) is just the slot; a text with a part around it is the three.
  if (!before && !after)
    return className ? <span className={className}>{slot}</span> : slot;
  return (
    <span
      className={['cds-pagination__swap-text', className]
        .filter(Boolean)
        .join(' ')}>
      {before && <span className="cds-pagination__swap-rest">{before}</span>}
      {slot}
      {after && (
        <span
          ref={afterRef}
          className="cds-pagination__swap-rest cds-pagination__swap-rest--after">
          {after}
        </span>
      )}
    </span>
  );
}
