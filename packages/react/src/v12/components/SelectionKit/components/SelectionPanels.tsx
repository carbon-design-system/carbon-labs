/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  Children,
  useLayoutEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { recentArrowDirection } from '@carbon-labs/v12-motion';
import {
  animateLayout,
  beginLayout,
  holdLayout,
  inLayout,
  motionTokens,
  DURATION_FLOOR_MS,
  selectionDuration,
  CONTENT_SWAP,
  playContentSwap,
  easingCss,
} from '@carbon-labs/v12-motion';
import { usePrefersReducedMotion } from '@carbon-labs/v12-motion';
import { inertProps } from '@carbon-labs/react-util';

/* ============================================================================
 * SelectionPanels — the content a selection switches (the content switcher's
 * panels, vertical tabs' panels). `axis` is the direction of the list: the
 * content swaps along it, in the direction the selection moved.
 * ============================================================================
 *
 * Carbon v11 leaves this to the app. The kit gives it one motion, the
 * content swap (`playContentSwap`), in the direction of the switch —
 * OUT THEN IN, never overlapping (the general rule for a content swap):
 *
 *   out   the old content moves 8px (`distance-sm`) the way the selector
 *         goes and fades (`fast-01`, exit-productive)
 *   in    once it's gone, the new content follows from 8px behind
 *         (`fast-02`, entrance-productive)
 *   box   `fit="content"` (default): the container is the one surface, and it resizes to the new panel's
 *         height as a window — standard-productive, on the switcher's own
 *         timing (40 / 80 / 120 / 160ms), starting with the in, so the old
 *         content leaves the box it is in — clipping the content, which
 *         never reflows or scales. `fit="largest"`: every panel in one cell,
 *         so the container holds the largest panel's size and never resizes
 *         (principle 12).
 *   interrupt   the container and the content turn round from where they are
 *   reduced     a snap: the new panel replaces the old on one frame, no
 *               travel, no fade; the container resizes at once
 *
 * `travel="with"` (default): the content travels the way the selector
 * moves on screen, RTL included; `against` is the other way.
 * ========================================================================== */

export interface SelectionPanelsProps {
  /** The panel to show — the switcher's selected index. */
  selectedIndex: number;
  /** One child per switch. */
  children: ReactNode;
  /** The container — in `content` mode it is the surface that resizes, so give it the background. */
  className?: string;
  /** `content` (default): the container resizes to each panel. `largest`: it holds the largest panel's size. */
  fit?: 'content' | 'largest';
  /** Multiplies the durations (slow motion). */
  timeScale?: number;
  /** The list's axis: the content swaps along it. Default `x`. */
  axis?: 'x' | 'y';
  /**
   * Which way the content travels, relative to the selection's move on screen.
   * `with` (default; the content switcher, tabs, vertical tabs): the content
   * travels the way the selector does — a switch to the right, and the old
   * content leaves to the right as the new comes in from the left. It reads
   * the container's `direction`, so in RTL it still follows the selector on
   * screen. `against`: the new content comes in from the side the selection
   * moved toward.
   */
  travel?: 'with' | 'against';
  /** How far each piece travels, px. Default the content swap's (`CONTENT_SWAP.distance`, sm 8px). */
  distance?: number;
  /**
   * Extra attributes for each panel's wrapper — an id, `aria-labelledby`, a
   * class (vertical tabs). The kit's own role, visibility and `inert` win.
   */
  panelProps?: (index: number) => HTMLAttributes<HTMLDivElement>;
}

const css = (n: keyof typeof motionTokens.easing) => easingCss(n);

export function SelectionPanels({
  selectedIndex,
  children,
  className,
  fit = 'content',
  timeScale = 1,
  axis = 'x',
  travel = 'with',
  distance = CONTENT_SWAP.distance,
  panelProps,
}: SelectionPanelsProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const prev = useRef(selectedIndex);
  /** The container's height as last laid out, px — where a resize starts. */
  const lastH = useRef<number | null>(null);
  const reduced = usePrefersReducedMotion();
  const panels = Children.toArray(children);

  // At rest, keep the starting height current (content that changes size on
  // its own). Inside a layout transaction it holds, and reads it once at the
  // settle.
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box || typeof ResizeObserver === 'undefined') return;
    const read = () => {
      if (!box.getAnimations().length) lastH.current = box.offsetHeight;
    };
    const hold = holdLayout(box, read);
    const ro = new ResizeObserver(() => {
      if (!hold.holding()) read();
    });
    ro.observe(box);
    return () => {
      ro.disconnect();
      hold.detach();
    };
  }, []);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const from = prev.current;
    prev.current = selectedIndex;
    refs.current.forEach((el, i) => {
      if (!el) return;
      // Panels not involved in this swap sit hidden.
      if (i !== selectedIndex && i !== from) {
        el.getAnimations().forEach((a) => a.cancel());
        el.style.visibility = 'hidden';
      }
    });
    const inEl = refs.current[selectedIndex];
    if (!inEl || !box) return;
    inEl.style.visibility = '';
    if (from === selectedIndex) {
      lastH.current = box.offsetHeight;
      return;
    }
    const outEl = refs.current[from];
    // A wrap (an arrow past an end: last ⇄ first) slides the way the marker
    // travels it — on, past the end — not back across the list.
    const n = refs.current.length;
    const key = recentArrowDirection();
    const wrapped =
      key !== undefined &&
      n > 2 &&
      Math.abs(selectedIndex - from) === n - 1 &&
      Math.sign(selectedIndex - from) !== key;
    const dir = wrapped ? key : Math.sign(selectedIndex - from) || 1;
    // `playContentSwap`'s direction is the side the new content comes from
    // (+1 right / below). `against`: the index's way, as before. `with`: the
    // other side of the selector's move on screen (its index way, mirrored
    // along x in RTL), so the content travels with it.
    const rtl = axis === 'x' && getComputedStyle(box).direction === 'rtl';
    const direction = travel === 'with' ? -(rtl ? -dir : dir) : dir;

    // The content: out, then in (each from where it is).
    if (outEl) outEl.style.visibility = '';
    const swap = playContentSwap({
      out: outEl ?? null,
      in: inEl,
      axis,
      direction,
      distance,
      timeScale,
      reduced,
    });
    const hideOut = () => {
      if (outEl && prev.current !== from) outEl.style.visibility = 'hidden';
      swap.outAnimation?.cancel();
    };
    if (swap.outAnimation) swap.outAnimation.onfinish = hideOut;
    else hideOut();

    // The container: from its live height to the new panel's, as a window,
    // starting with the in.
    if (fit === 'content') {
      const running = box.getAnimations();
      const h0 = running.length
        ? parseFloat(getComputedStyle(box).height)
        : (lastH.current ?? box.offsetHeight);
      running.forEach((a) => a.cancel());
      const h1 = box.offsetHeight;
      if (!reduced && Math.abs(h1 - h0) > 0.5) {
        const t = selectionDuration(h1 - h0);
        const ms = Math.max(
          DURATION_FLOOR_MS,
          motionTokens.duration[t] * timeScale
        );
        const keyframes = [{ height: `${h0}px` }, { height: `${h1}px` }];
        const outer = inLayout(box);
        if (outer && outer.root !== box) {
          // Inside an outer layout transaction (a panel opening beside it):
          // the container resizes with the outer move, over its time left on
          // its curve, landing on the lead's frame;
          // the new content still waits for the move's end (the swap).
          animateLayout(box, box, keyframes, {
            ms,
            easing: css('standard-productive'),
            reason: 'selection-panels',
          });
          lastH.current = h1;
          return;
        }
        // A layout transaction on the container, the container leading, from
        // the swap's start (the wait included) to the resize's end.
        const tx = beginLayout(box, {
          ms: swap.wait + ms,
          easing: css('standard-productive'),
          lead: box,
          reason: 'selection-panels',
        });
        const a = box.animate(keyframes, {
          duration: ms,
          delay: swap.wait,
          easing: css('standard-productive'),
          fill: 'backwards',
        });
        a.finished.then(
          () => tx.end(),
          () => tx.cancel()
        );
        // A hidden tab never finishes it: the clock ends it too.
        window.setTimeout(() => tx.end(), swap.wait + ms + 50);
      }
      lastH.current = h1;
    }
  }, [selectedIndex, reduced, timeScale, fit, axis, travel, distance]);

  return (
    <div
      ref={boxRef}
      className={['sel-panels', `sel-panels--${fit}`, className]
        .filter(Boolean)
        .join(' ')}>
      {panels.map((child, i) => {
        const extra = panelProps?.(i);
        return (
          <div
            {...extra}
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className={
              extra?.className
                ? `sel-panels__panel ${extra.className}`
                : 'sel-panels__panel'
            }
            role="tabpanel"
            aria-hidden={i !== selectedIndex}
            {...inertProps(i !== selectedIndex)}
            data-active={i === selectedIndex || undefined}
            style={
              i === selectedIndex
                ? extra?.style
                : { ...extra?.style, visibility: 'hidden' }
            }>
            {child}
          </div>
        );
      })}
    </div>
  );
}
