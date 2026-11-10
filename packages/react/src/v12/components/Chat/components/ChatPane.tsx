/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  beginLayout,
  DURATION_FLOOR_MS,
  motionTokens,
  paneMove,
  playPaneContent,
  reduceTokens,
  toEasing,
} from '@carbon-labs/v12-motion';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import { disclosureArrival } from '@carbon-labs/react-disclosure';
import { inertProps } from '@carbon-labs/react-util';
import './chat.scss';

/* ============================================================================
 * ChatPane: a pane beside the chat that opens its own space.
 *
 *   move     one layout transaction on the row, the pane leading: its width by
 *            travel on standard-expressive, one step faster shutting
 *   content  laid out at full width, anchored to the far edge, under the soft
 *            edge; opening, it moves with the opening; closing, it holds still
 *   turn     reversed mid-move, it turns round from where it is
 *   reduced  no travel: it fades on the reduced clock
 * ========================================================================== */

export interface ChatPaneProps {
  open: boolean;
  /** A CSS length, or `fill` (an equal share of the row). Default `fill`. */
  size?: string;
  /** Its accessible name (a region). */
  label: string;
  /** Slow motion. Default 1. */
  timeScale?: number;
  className?: string;
  children?: ReactNode;
}

const EASE = `cubic-bezier(${toEasing({ name: 'standard', mode: 'expressive' }).join(', ')})`;

export function ChatPane({
  open,
  size = 'fill',
  label,
  timeScale = 1,
  className,
  children,
}: ChatPaneProps) {
  const [present, setPresent] = useState(open);
  if (open && !present) setPresent(true);
  const { reduced } = useFeedbackMotion();
  const ref = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  // Laid out at least once since it last mounted: a fresh mount opens from 0.
  const laidOut = useRef(false);
  const softRef = useRef<{ stop: () => void } | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const inner = innerRef.current;
    // What's there on the first render is simply there.
    if (first.current) {
      first.current = false;
      laidOut.current = !!el;
      return;
    }
    if (!el || !inner) return;
    const k = timeScale;
    // From where it is (a turn mid-move), or from nothing on a fresh mount.
    const from = laidOut.current ? el.getBoundingClientRect().width : 0;
    laidOut.current = true;
    el.getAnimations().forEach((a) => a.cancel());
    inner.getAnimations().forEach((a) => a.cancel());
    softRef.current?.stop();
    // Its full width: where it's going, or where it has been.
    const release = () => {
      el.style.removeProperty('inline-size');
      el.style.removeProperty('flex');
    };
    release();
    const full = open
      ? el.getBoundingClientRect().width
      : Math.max(from, inner.getBoundingClientRect().width);
    const to = open ? full : 0;
    const settle = () => {
      inner.style.inlineSize = '';
      if (!open) {
        // Held shut until React drops it (no frame back at full width between).
        laidOut.current = false;
        setPresent(false);
        return;
      }
      release();
    };

    if (reduced) {
      inner
        .animate(
          { opacity: open ? [0, 1] : [1, 0] },
          {
            duration: Math.max(
              DURATION_FLOOR_MS,
              motionTokens.duration['moderate-01'] *
                reduceTokens.reduced.durationScale *
                k
            ),
            easing: 'linear',
            fill: 'forwards',
          }
        )
        .finished.then(settle, () => {});
      return;
    }
    if (full < 1) return settle();

    // Held at its full width, anchored to the far edge, while the space moves.
    inner.style.inlineSize = `${full}px`;
    el.style.flex = 'none';
    el.style.inlineSize = `${to}px`;
    const opening = to > from;
    const { ms, arrive } = paneMove(inner, Math.abs(to - from), opening, {
      turn: opening && from > 0.5,
      timeScale: k,
      disclosureArrival,
    });
    const row = (el.parentElement as HTMLElement | null) ?? el;
    const tx = beginLayout(row, {
      ms,
      easing: EASE,
      lead: el,
      reason: open ? 'chat-pane-open' : 'chat-pane-close',
    });
    const move = el.animate(
      [{ inlineSize: `${from}px` }, { inlineSize: `${to}px` }],
      { duration: ms, easing: EASE }
    );
    softRef.current = playPaneContent(inner, full, from, to, ms, arrive);
    const done = () => {
      tx.end();
      settle();
    };
    move.finished.then(done, () => tx.end());
  }, [open, reduced, timeScale]);

  if (!present) return null;
  return (
    <section
      ref={ref}
      className={[
        'cds-chat-pane',
        size === 'fill' && 'cds-chat-pane--fill',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        size === 'fill'
          ? undefined
          : ({ '--chat-pane-size': size } as CSSProperties)
      }
      aria-label={label}
      {...inertProps(!open)}>
      <div ref={innerRef} className="cds-chat-pane__content">
        {children}
      </div>
    </section>
  );
}
ChatPane.displayName = 'ChatPane';
