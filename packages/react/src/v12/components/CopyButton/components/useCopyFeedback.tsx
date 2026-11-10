/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { motionTokens } from '@carbon-labs/v12-motion';
import { TooltipMotionContext } from '@carbon-labs/v12-motion';
import { useTooltipReduced } from '@carbon-labs/react-tooltip';
import { RollText } from '@carbon-labs/react-roll-text';

/* ============================================================================
 * The copy feedback — v11's `Copy` behaviour, shared by CopyButton and the
 * inline CodeSnippet: a click turns the tooltip's description into the
 * feedback ("Copied") for `feedbackTimeout`, then back.
 * ============================================================================
 *
 *   label     the tooltip's text, a RollText: description → feedback is a
 *             change of meaning, so it is replaced whole, sideways: the
 *             description leaves to the start and the feedback comes in from
 *             the end, then back the other way, on the roll's clock
 *             (moderate-01), its window resizing with it. Under reduced
 *             motion it swaps at once
 *   place     the tooltip re-places itself on every frame its box resizes
 *             (its width follows the roll), so it stays centred on its
 *             trigger. The surface re-places on a scroll or a resize; a
 *             ResizeObserver on it raises one (`scroll` on the tooltip
 *             element, which only its own listener reads), a candidate for
 *             carbon-motion's tooltip surface to do itself
 *   timing    v11's: `feedbackTimeout` from the last copy (a copy restarts
 *             it). If the pointer and focus left in the last moments, the
 *             label waits for the tooltip to have gone, so a leaving tooltip
 *             never changes its text as it goes
 *   action    `copies` steps on each copy: the Copy icon's `actionKey`
 *   announce  `announcement`: the feedback, for a polite live region (a
 *             name change alone isn't read out)
 * ========================================================================== */

/** How long a leaving tooltip takes to be gone: its leave delay and its snap out, with room (motion-literals.test.ts checks it). */
export const LEAVING_MS = motionTokens.duration['slow-01'];

export interface CopyFeedbackOptions {
  feedback: string;
  description: string;
  feedbackTimeout: number;
}

export interface CopyFeedback {
  /** The tooltip's content (the RollText, or the plain text under reduced motion). */
  label: ReactNode;
  /** The text the label shows now. */
  text: string;
  /** Feedback is showing. */
  copied: boolean;
  /** Steps on each copy (the Copy icon's `actionKey`). */
  copies: number;
  /** For a polite live region: the feedback after a copy, else empty. */
  announcement: string;
  /** Call on a copy. */
  copy: () => void;
  /** The trigger's pointer and focus, so the label knows when its tooltip has left. */
  handlers: {
    onPointerEnter: () => void;
    onPointerLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
  };
}

/**
 * The copy feedback for a trigger (`triggerRef`, the element its tooltip
 * labels through `aria-labelledby`).
 */
export function useCopyFeedback(
  triggerRef: RefObject<HTMLElement | null>,
  { feedback, description, feedbackTimeout }: CopyFeedbackOptions
): CopyFeedback {
  const { timeScale } = useContext(TooltipMotionContext);
  const reduced = useTooltipReduced();
  const [copied, setCopied] = useState(false);
  const [copies, setCopies] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const timer = useRef(0);
  /** The announcement's next tick (cleared on unmount, audit CT-8). */
  const announceTimer = useRef(0);
  const over = useRef({ hover: false, focus: false, leftAt: 0 });

  const copy = useCallback(() => {
    window.clearTimeout(timer.current);
    window.clearTimeout(announceTimer.current);
    setCopied(true);
    setCopies((c) => c + 1);
    // Cleared first, so the same feedback twice is read out twice.
    setAnnouncement('');
    announceTimer.current = window.setTimeout(
      () => setAnnouncement(feedback),
      0
    );
    const end = () => {
      const o = over.current;
      const present = o.hover || o.focus;
      // Left a moment ago: its tooltip is still leaving; wait for it to go.
      const wait = present
        ? 0
        : Math.max(0, o.leftAt + LEAVING_MS * timeScale - performance.now());
      if (wait > 0) {
        timer.current = window.setTimeout(end, wait);
        return;
      }
      setCopied(false);
      setAnnouncement('');
    };
    timer.current = window.setTimeout(end, feedbackTimeout);
  }, [feedback, feedbackTimeout, timeScale]);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      window.clearTimeout(announceTimer.current);
    },
    []
  );

  // Re-place the tooltip whenever its box resizes (the roll's window).
  useEffect(() => {
    const trigger = triggerRef.current;
    const id = trigger?.getAttribute('aria-labelledby');
    const tip = id ? document.getElementById(id) : null;
    if (
      !tip ||
      !tip.classList.contains('sel__tip') ||
      typeof ResizeObserver === 'undefined'
    )
      return;
    let first = true;
    const ro = new ResizeObserver(() => {
      // Its first report is the observe itself.
      if (first) {
        first = false;
        return;
      }
      if (!tip.hidden) tip.dispatchEvent(new Event('scroll'));
    });
    ro.observe(tip);
    return () => ro.disconnect();
  }, [triggerRef]);

  const left = () => {
    const o = over.current;
    if (!o.hover && !o.focus) o.leftAt = performance.now();
  };
  const handlers = {
    onPointerEnter: () => void (over.current.hover = true),
    onPointerLeave: () => {
      over.current.hover = false;
      left();
    },
    onFocus: () => void (over.current.focus = true),
    onBlur: () => {
      over.current.focus = false;
      left();
    },
  };

  const text = copied ? feedback : description;
  const label = reduced ? (
    text
  ) : (
    <RollText
      text={text}
      order={copied ? 1 : 0}
      direction="horizontal"
      timeScale={timeScale}
    />
  );
  return { label, text, copied, copies, announcement, copy, handlers };
}
