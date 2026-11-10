/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useState, type ReactNode } from 'react';
import { usePrefersReducedMotion } from '@carbon-labs/v12-motion';
import { hasText, type FieldStatus } from '@carbon-labs/v12-motion';
import './field.scss';

/* ============================================================================
 * FieldMessage — a field's ONE message line: helper text, a warning or an
 * error, swapped in place.
 * ============================================================================
 *
 *   place     one 20px line — 4px above it and 16px of helper-text-01 — that
 *             sits inside the 32px gap a kit form leaves between
 *             fields (`placement="gap"`, the default: the line hangs below the
 *             field's box, so an error appears without moving anything, and a
 *             form of fields with no messages is as dense as v11). A message
 *             longer than the line wraps and moves what follows by its
 *             overflow only. `placement="flow"`: in the layout, outside that
 *             rhythm (no room with no text in any state); `inline` beside the
 *             field (v11's inline TextInput).
 *   swap      the three faces share one cell, swapped in place, out then in
 *             (the kit's content swap, not a crossfade): the
 *             face leaving fades on fast-01, then the new one fades in where
 *             it is, nothing slides. With nothing showing before (no helper),
 *             the new face comes in at once. An error fades in on moderate-02
 *             (it settles in with the field's border).
 *   reduced   at once: the new words replace the old on one frame, from the
 *             motion level (`MotionProvider`) or the system setting.
 *   a11y      only the shown face is visible to assistive tech (the others
 *             are `visibility: hidden` once faded); the ids are v11's so the
 *             control's `aria-describedby` / `aria-errormessage` point at it.
 *
 * Validation reuses this as it is: TextArea, NumberInput, Select
 * and the groups give it their status and texts.
 * ========================================================================== */

export interface FieldMessageProps {
  /** The status to show — from `useLateStatus`, not the raw props. */
  status: FieldStatus;
  helperText?: ReactNode;
  warnText?: ReactNode;
  invalidText?: ReactNode;
  helperId: string;
  warnId: string;
  invalidId: string;
  disabled?: boolean;
  /** `gap` (default): in the inter-field gap. `flow`: in the layout. */
  placement?: 'gap' | 'flow';
  /** Beside the field, v11's inline layout. */
  inline?: boolean;
  className?: string;
}

export function FieldMessage({
  status,
  helperText,
  warnText,
  invalidText,
  helperId,
  warnId,
  invalidId,
  disabled = false,
  placement = 'gap',
  inline = false,
  className,
}: FieldMessageProps) {
  // A status without its text shows the helper (v11 renders an empty requirement).
  const faces: [FieldStatus, ReactNode, string][] = [
    ['none', helperText, helperId],
    ['warn', warnText, warnId],
    ['error', invalidText, invalidId],
  ];
  const any = faces.some(([, t]) => hasText(t));
  // The status shown before this one: when it had text, the new face waits for it to leave.
  const [swap, setSwap] = useState({ status, from: status });
  if (swap.status !== status) setSwap({ status, from: swap.status });
  const leaving =
    swap.from !== status &&
    faces.some(([f, t]) => f === swap.from && hasText(t));
  const reduced = usePrefersReducedMotion();
  return (
    <div
      className={[
        'cds-field-message',
        inline
          ? 'cds-field-message--inline'
          : `cds-field-message--${placement}`,
        disabled && 'cds-field-message--disabled',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-status={status}
      data-swap={leaving || undefined}
      data-reduced={reduced || undefined}
      data-empty={any ? undefined : ''}
      aria-hidden={any ? undefined : true}>
      {faces.map(([s, text, id]) =>
        hasText(text) ? (
          <div
            key={s}
            id={id}
            className={`cds-field-message__face cds-field-message__face--${s}`}
            data-on={s === status || undefined}>
            {text}
          </div>
        ) : null
      )}
    </div>
  );
}
