/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useLayoutEffect, useRef, useState } from 'react';
import { bezierEase } from '@carbon-labs/v12-motion';
import {
  animateLayout,
  CONTENT_SWAP,
  durationStepForDistance,
  motionTokens,
  playSoftEdge,
  stepDown,
  toEasing,
} from '@carbon-labs/v12-motion';
import { FeedbackMotion, useFeedbackMotion } from '@carbon-labs/v12-motion';
import { disclosureArrival } from '@carbon-labs/react-disclosure';
import { NotificationButton } from '@carbon-labs/react-notification';
import {
  StatusMark,
  SwapSlot,
  type FeedbackKind,
} from '@carbon-labs/react-feedback';
import { useLatest } from '@carbon-labs/react-selection-kit';
import { useChatRollover } from './rollover';
import './chat.scss';

/* ============================================================================
 * PromptNotice: a notification docked behind the prompt's top edge.
 *
 *   look     the notification family's: a hairline in the status color on the
 *            quiet surface, or inverse
 *   arrive   the band rises from behind the field by travel, its content moving
 *            with the opening under the field's soft edge
 *   change   the content swap in place; the band keeps the leaving look
 *   leave    the band sinks back one step faster, its content still
 *   reduced  no travel: there or gone, the content fading
 * ========================================================================== */

export interface PromptNoticeValue {
  /** Identifies it: a new id is a new notice (out, then in). Default the message. */
  id?: string;
  kind: FeedbackKind;
  message: string;
  /** One action: the notification family's action button (`.fb-action`, outlined), at the band's 24px. */
  action?: { label: string; onClick?: () => void };
  /** The notification family's style: `outlined` (default, the quiet surface) or `inverse`. */
  variant?: 'outlined' | 'inverse';
}

export interface PromptNoticeProps {
  notice: PromptNoticeValue | null;
  /** The close button. None: no close. */
  onClose?: () => void;
  /** The close button's name. Default "Close notification". */
  closeButtonLabel?: string;
  timeScale?: number;
}

/** How far the band runs under the field (the reference's 22px). */
export const NOTICE_TUCK = 22;
const D = motionTokens.duration;
const ease = (name: 'entrance' | 'exit') =>
  `cubic-bezier(${toEasing({ name, mode: 'productive' }).join(',')})`;
const curve = (name: 'entrance' | 'exit') =>
  bezierEase(toEasing({ name, mode: 'productive' }));
const keyOf = (n: PromptNoticeValue | null) =>
  n ? (n.id ?? `${n.kind}:${n.message}`) : null;

export function PromptNotice({
  notice,
  onClose,
  closeButtonLabel = 'Close notification',
  timeScale = 1,
}: PromptNoticeProps) {
  const { reduced } = useFeedbackMotion();
  // What's on screen: `notice`, except while the band sinks (it trails by the exit).
  const [shown, setShown] = useState(notice);
  const [sinking, setSinking] = useState(false);
  // A band that has sunk is a new band: the next notice rises from nothing.
  const [band, setBand] = useState(0);
  if (notice && !sinking && notice !== shown) setShown(notice);
  // Reduced: gone at once.
  if (shown && !notice && reduced) setShown(null);
  const dockRef = useRef<HTMLDivElement>(null);
  useChatRollover(dockRef);
  const contentRef = useRef<HTMLDivElement>(null);
  // The band that has risen (its number), if any.
  const risen = useRef<number | null>(notice ? band : null);
  // The notice now: one asked for while the band sinks rises once it has.
  const latest = useLatest(notice);

  // The band's soft edge at the field's top edge while the dock moves `from` to `to` px over `ms`;
  // `shift(t)` is the content's own offset below its place at `t` ms.
  const edgeRef = useRef<{ stop: () => void } | null>(null);
  const softEdge = (
    content: HTMLElement,
    from: number,
    to: number,
    ms: number,
    total: number,
    bandEase: (p: number) => number,
    shift: (t: number) => number
  ) => {
    edgeRef.current?.stop();
    const top = content.offsetTop;
    const open = Math.max(from, to);
    edgeRef.current = playSoftEdge(
      content,
      total,
      { w: content.offsetWidth, h: content.offsetHeight },
      (p) => {
        const t = p * total;
        const h = from + (to - from) * bandEase(Math.min(1, t / ms));
        // Its width `min(16px, h, H − h)`: it grows over the first 16px and closes over the last.
        return [
          {
            side: 'bottom',
            pos: h - top - shift(t),
            d: Math.min(Math.abs(to - h), Math.abs(h - from)),
            extent: open,
          },
        ];
      }
    );
  };

  // Gone: the band sinks behind the field, the content held still in it
  // (reduced: at once, in render, above).
  useLayoutEffect(() => {
    const dock = dockRef.current;
    const content = contentRef.current;
    if (notice || !shown || sinking || reduced || !dock || !content) return;
    setSinking(true);
    content.getAnimations().forEach((a) => a.cancel());
    const h = dock.getBoundingClientRect().height;
    const ms = D[stepDown(durationStepForDistance(h))] * timeScale;
    const { animation } = animateLayout(
      (dock.closest('.cds-prompt') as HTMLElement | null) ?? dock,
      dock,
      { blockSize: [`${h}px`, '0px'] },
      { ms, easing: ease('exit'), reason: 'prompt-notice' }
    );
    softEdge(content, h, 0, ms, ms, curve('exit'), () => 0);
    const end = () => {
      dock.style.blockSize = '0px';
      setSinking(false);
      setBand((b) => b + 1);
      // Asked for again while it sank: it rises again (render, above).
      setShown(latest.current);
    };
    animation.finished.then(end, end);
  }, [notice, shown, sinking, reduced, timeScale, latest]);

  // A band with nothing risen: it rises, then its content. Another notice in
  // a band that's there is the swap's (SwapSlot); an update, nothing.
  const shownKey = keyOf(shown);
  useLayoutEffect(() => {
    if (!shownKey) {
      risen.current = null;
      return;
    }
    if (risen.current === band) return;
    risen.current = band;
    const dock = dockRef.current;
    const content = contentRef.current;
    if (!dock || !content) return;
    dock.style.blockSize = '';
    const k = timeScale;
    if (reduced) {
      content.animate(
        { opacity: [0, 1] },
        {
          duration: D[CONTENT_SWAP.in.duration] * k * CONTENT_SWAP.reducedScale,
        }
      );
      return;
    }
    // From nothing: the band rises on its travel's step, and the content comes
    // up 8px into place from half of it, under the field's soft edge.
    edgeRef.current?.stop();
    const h = dock.getBoundingClientRect().height;
    const ms = D[durationStepForDistance(h)] * k;
    animateLayout(
      (dock.closest('.cds-prompt') as HTMLElement | null) ?? dock,
      dock,
      { blockSize: ['0px', `${h}px`] },
      { ms, easing: ease('entrance'), reason: 'prompt-notice' }
    );
    const arrive = disclosureArrival(content, ms, { timeScale: k });
    content.animate(
      [
        { transform: `translateY(${arrive.distance}px)` },
        { transform: 'none' },
      ],
      {
        duration: arrive.duration,
        delay: arrive.delay,
        easing: arrive.easing,
        fill: 'backwards',
      }
    );
    const settle = curve('entrance');
    const shift = (t: number) =>
      arrive.distance *
      (1 -
        settle(Math.min(1, Math.max(0, (t - arrive.delay) / arrive.duration))));
    softEdge(
      content,
      0,
      h,
      ms,
      Math.max(ms, arrive.delay + arrive.duration),
      curve('entrance'),
      shift
    );
    // On what's shown, and a new band.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shownKey, band]);

  if (!shown) return null;
  const inverse = shown.variant === 'inverse';
  return (
    <div key={band} ref={dockRef} className="cds-prompt__dock">
      <div className="cds-prompt-notice" role="status">
        <div ref={contentRef} className="cds-prompt-notice__place">
          <FeedbackMotion timeScale={timeScale} reduced={reduced}>
            <SwapSlot swapKey={shownKey!} fit="fill">
              {/* The band's look follows the face (chat.scss): the leaving one's until it has gone. */}
              <div
                className={[
                  'cds-prompt-notice__content',
                  `cds-prompt-notice__content--${shown.kind}`,
                  inverse && 'cds-prompt-notice__content--inverse',
                ]
                  .filter(Boolean)
                  .join(' ')}>
                <StatusMark
                  kind={shown.kind}
                  size={16}
                  className="cds-prompt-notice__mark"
                />
                <span className="cds-prompt-notice__message">
                  {shown.message}
                </span>
                {shown.action && (
                  <button
                    type="button"
                    className="fb-action fb-action--outline cds-chat-rollover cds-prompt-notice__action"
                    onClick={shown.action.onClick}>
                    {shown.action.label}
                  </button>
                )}
                {onClose && (
                  <NotificationButton
                    notificationType="inline"
                    className="cds-prompt-notice__close"
                    aria-label={closeButtonLabel}
                    onClick={onClose}
                  />
                )}
              </div>
            </SwapSlot>
          </FeedbackMotion>
        </div>
      </div>
    </div>
  );
}
PromptNotice.displayName = 'PromptNotice';
