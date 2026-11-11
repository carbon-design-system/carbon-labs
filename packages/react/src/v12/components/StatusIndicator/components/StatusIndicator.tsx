/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useLayoutEffect, useRef, useState, type HTMLAttributes } from 'react';
import { CONTENT_SWAP, playContentSwap } from '@carbon-labs/v12-motion';
import { DURATION_FLOOR_MS, reflowTiming } from '@carbon-labs/v12-motion';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import { StatusMark, type StatusMarkKind } from '@carbon-labs/react-feedback';
import type { SpinnerVariant } from '@carbon-labs/react-feedback';
import './status-indicator.scss';

/* ============================================================================
 * StatusIndicator: a status as a mark and a label.
 *
 *   mark      StatusMark: a new kind match-cuts; to and from pending, the status hand-off
 *   label     out then in, 8px on y (`labelSwap="in-place"`: no travel), out `fast-01`, in `fast-02`
 *   width     the label's width moves to the new one's with the in, on its travel's clock
 *   labels    every label it can show: it keeps the widest one's width, so nothing shifts
 *   pending   the kit's Spinner, its loops held off screen
 *   reduced   the new mark and label at once, the width with them
 *
 * API: Carbon's IconIndicator (`kind`, `label`, `size`), plus `labels`, `labelSwap`, `variant`.
 * ========================================================================== */

export type StatusIndicatorKind =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'pending'
  | 'not-started'
  | 'paused'
  | 'unknown';
export type StatusIndicatorSize = 'sm' | 'md' | 'lg';

export const STATUS_INDICATOR_KINDS: readonly StatusIndicatorKind[] = [
  'success',
  'warning',
  'error',
  'info',
  'pending',
  'not-started',
  'paused',
  'unknown',
];

/** Each kind's mark: a shape of its own, so colour is never the only signal. */
export const STATUS_INDICATOR_MARK: Record<
  StatusIndicatorKind,
  StatusMarkKind
> = {
  success: 'success',
  warning: 'warning-alt',
  error: 'error',
  info: 'info-square',
  pending: 'pending',
  'not-started': 'not-started',
  paused: 'paused',
  unknown: 'unknown',
};

/** The mark's size per size, px: the type's line beside it. */
export const STATUS_INDICATOR_ICON: Record<StatusIndicatorSize, 16 | 20> = {
  sm: 16,
  md: 16,
  lg: 20,
};

export interface StatusIndicatorProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'children'
> {
  /** The status. Pending is the spinner. */
  kind: StatusIndicatorKind;
  /** The words beside the mark. They name the status, so the mark is hidden from assistive technology. */
  label: string;
  /** Small, medium or large, with the type beside it. Default md. */
  size?: StatusIndicatorSize;
  /** Every label it can show: it keeps the widest one's width, so a change never shifts a table cell. */
  labels?: readonly string[];
  /** A new label travels (8px up and out, then up from below) or swaps in place. Default travel; in place with `labels`. */
  labelSwap?: 'travel' | 'in-place';
  // @carbon-proposal api: variant-prop — The colour treatment is one `variant` prop (inverse, tonal, outlined, hero, neutral or filled), so colour is never said by a role or a structure. TBD
  /** Pending's spinner: neutral, or hero (the kit's brand). Default neutral. */
  variant?: SpinnerVariant;
}

const width = (el: Element) => el.getBoundingClientRect().width;

export function StatusIndicator({
  kind,
  label,
  size = 'md',
  labels,
  labelSwap,
  variant = 'neutral',
  className,
  ...rest
}: StatusIndicatorProps) {
  const { reduced, timeScale } = useFeedbackMotion();
  const slotRef = useRef<HTMLSpanElement>(null);
  // The label shown, and the one leaving (out then in); `swaps` keys the faces.
  const [faces, setFaces] = useState<{
    label: string;
    leaving: string | null;
    swaps: number;
  }>({ label, leaving: null, swaps: 0 });
  /** The slot's width as the label changes (live, mid-move), px: where its move starts. */
  const lastWidth = useRef(0);
  if (faces.label !== label) {
    // eslint-disable-next-line react-hooks/refs -- read once, before the new label commits: the width it moves from
    lastWidth.current = slotRef.current ? width(slotRef.current) : 0;
    setFaces({
      label,
      leaving: reduced ? null : faces.label,
      swaps: faces.swaps + 1,
    });
  }
  const move = useRef<Animation | null>(null);
  const travel =
    (labelSwap ?? (labels ? 'in-place' : 'travel')) === 'travel'
      ? CONTENT_SWAP.distance
      : 0;

  // A new label: the old one leaves, then the new one comes in, the width moving with the in.
  useLayoutEffect(() => {
    const slot = slotRef.current;
    if (faces.swaps === 0 || !slot) return;
    const incoming = slot.querySelector<HTMLElement>(
      ':scope > [data-face="in"]'
    );
    if (!incoming) return;
    move.current?.cancel();
    move.current = null;
    if (reduced) return;
    const out = slot.querySelector<HTMLElement>(':scope > [data-face="out"]');
    // In place (distance 0) keeps the 8px swap's clocks: a short label still reads as one change.
    const swap = playContentSwap({
      out,
      in: incoming,
      axis: 'y',
      direction: 1,
      distance: travel,
      timeScale,
      reduced: false,
    });
    const from = lastWidth.current;
    const to = Math.max(
      0,
      ...[...slot.children].filter((c) => c !== out).map(width)
    );
    if (from > 0 && Math.abs(to - from) >= 0.5) {
      const t = reflowTiming(Math.abs(to - from), timeScale);
      move.current = slot.animate(
        [{ inlineSize: `${from}px` }, { inlineSize: `${to}px` }],
        {
          duration: Math.max(DURATION_FLOOR_MS, t.ms),
          delay: swap.wait,
          easing: `cubic-bezier(${t.ease.join(', ')})`,
          fill: 'backwards',
        }
      );
    }
    const n = faces.swaps;
    let live = true;
    const gone = () =>
      live && setFaces((s) => (s.swaps === n ? { ...s, leaving: null } : s));
    if (swap.outAnimation) swap.outAnimation.finished.then(gone, () => {});
    else gone();
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per new label
  }, [faces.swaps]);

  return (
    <span
      {...rest}
      className={[
        'cds-status-indicator',
        `cds-status-indicator--${size}`,
        `cds-status-indicator--${kind}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-kind={kind}
      data-motion-icon-frame="">
      <span className="cds-status-indicator__mark" aria-hidden="true">
        <StatusMark
          kind={STATUS_INDICATOR_MARK[kind]}
          size={STATUS_INDICATOR_ICON[size]}
          variant={variant}
          description={label}
        />
      </span>
      <span ref={slotRef} className="cds-status-indicator__label">
        {labels?.map((l) => (
          <span
            key={`reserve:${l}`}
            className="cds-status-indicator__reserve"
            aria-hidden="true">
            {l}
          </span>
        ))}
        {faces.leaving !== null && (
          <span
            key={faces.swaps - 1}
            className="cds-status-indicator__face"
            data-face="out"
            aria-hidden="true">
            {faces.leaving}
          </span>
        )}
        <span
          key={faces.swaps}
          className="cds-status-indicator__face"
          data-face="in">
          {label}
        </span>
      </span>
    </span>
  );
}
