/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {
  attachSkeletonWaveRoot,
  SKELETON_WAVE_ATTR,
} from '@carbon-labs/v12-motion';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import { SkeletonBar } from './Skeleton';
import { waveOptions } from './SkeletonWave';
import { inertProps } from '@carbon-labs/react-util';
import './skeleton.scss';

/* ============================================================================
 * SkeletonOf: a component's skeleton made of the component itself.
 *
 *   markup    the component renders as it will load, so every box, gap and
 *             line is the loaded one's and nothing moves on arrival
 *   data      text slots are bars (`SkeletonRun`, `SkeletonLines`); `blocks`
 *             turns parts into blocks of their own box and corners; `unseen`
 *             keeps a part's room with nothing drawn
 *   still     `inert`: no focus, hover or press, and hidden from assistive
 *             tech; the page's SkeletonWave owns the busy state and the one
 *             announcement
 *   wave      the page's `SkeletonWave`, else its own on the document's sweep
 *   reduced   no pulse: the blocks rest at their peak
 * ========================================================================== */

export interface SkeletonOfProps {
  /** The component, rendered with its data slots as bars. */
  children: ReactNode;
  /** A selector: parts that are data, each drawn as a block of its own box and corners. */
  blocks?: string;
  /** A selector: parts that keep their room with nothing drawn. */
  unseen?: string;
  className?: string;
}

export function SkeletonOf({
  children,
  blocks,
  unseen,
  className,
}: SkeletonOfProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const { timeScale, reduced } = useFeedbackMotion();

  // Every render: a part React re-created is marked again (the attributes aren't React's).
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (blocks)
      el.querySelectorAll<HTMLElement>(blocks).forEach((part) => {
        part.setAttribute('data-skeleton', '');
        part.setAttribute('data-skeleton-part', '');
        part.setAttribute('aria-hidden', 'true');
      });
    if (unseen)
      el.querySelectorAll<HTMLElement>(unseen).forEach((part) =>
        part.setAttribute('data-skeleton-unseen', '')
      );
  });

  // Its own wave, measured from the document's corner like every lone skeleton's;
  // under a page's SkeletonWave it attaches nothing.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    return attachSkeletonWaveRoot(
      el,
      waveOptions(timeScale, reduced, {
        origin: el.ownerDocument.documentElement,
      })
    );
  }, [timeScale, reduced]);

  return (
    // A span with `display: contents`: it adds no box, and it may wrap block content.
    <span
      ref={ref}
      className={['fb-skeleton-of', className].filter(Boolean).join(' ')}
      {...{ [SKELETON_WAVE_ATTR]: '' }}
      {...inertProps(true)}>
      {children}
    </span>
  );
}

export interface SkeletonLinesProps {
  /** The expected text, printed unseen: it sizes the slot, and its lines are the bars. */
  children: ReactNode;
  /** The slot's element. Default `span` (a block). */
  as?: 'span' | 'p' | 'div';
  className?: string;
}

/** A text slot of one or more lines: the expected text unseen, one block over the lines it
 * wraps to (the merge rule). */
export function SkeletonLines({
  children,
  as: As = 'span',
  className,
}: SkeletonLinesProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shape, setShape] = useState<{ lines: number; line: number } | null>(
    null
  );
  // Measured on mount and whenever the slot resizes (its width, so its wrap).
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const cs = getComputedStyle(el);
      const line = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.25;
      const inner =
        el.clientHeight -
        parseFloat(cs.paddingTop) -
        parseFloat(cs.paddingBottom);
      const lines = Math.max(1, Math.round(inner / line));
      setShape((s) =>
        s?.lines === lines && s.line === line ? s : { lines, line }
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <As
      ref={(el: HTMLElement | null) => void (ref.current = el)}
      className={['fb-skeleton-lines', className].filter(Boolean).join(' ')}
      aria-hidden="true">
      {children}
      {shape && (
        <span className="fb-skeleton-lines__bars">
          <SkeletonBar
            paragraph
            lineCount={shape.lines}
            lineHeight={`${shape.line}px`}
          />
        </span>
      )}
    </As>
  );
}
