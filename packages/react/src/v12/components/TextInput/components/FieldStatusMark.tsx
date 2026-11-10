/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { memo, useEffect, useLayoutEffect, useRef } from 'react';
import {
  WarningAltFilled,
  WarningFilled,
  type MotionIconHandle,
} from '@carbon-labs/react-motion-icons';
import {
  playContentSwap,
  usePrefersReducedMotion,
} from '@carbon-labs/v12-motion';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import type { FieldStatus } from '@carbon-labs/v12-motion';
import './field.scss';

/* ============================================================================
 * FieldStatusMark — a field's status mark, at the control's trailing edge:
 * v11's icons (WarningFilled for an error, WarningAltFilled for a warning,
 * its glyph in black) as motion-icons.
 * ============================================================================
 *
 * Quiet, because fields repeat: both marks share one cell, and a change is
 * the content swap (`playContentSwap`), out then in, 8px down: the old mark
 * leaves on fast-01, then the new one arrives on fast-02; from no status it
 * arrives at once. No frame shows both. Reduced motion: a snap. It ignores the pointer. `beat`: the
 * arriving mark plays its motion-icon once (off by default; a lab dial).
 * Decorative: the message line carries the words.
 * ========================================================================== */

export interface FieldStatusMarkProps {
  status: FieldStatus;
  /** 16 (default) or 20. */
  size?: 16 | 20;
  /** Play the arriving mark's motion once. Default false. */
  beat?: boolean;
  className?: string;
}

/**
 * Memoized: its props are a few strings, and its two motion icons build their shapes on every
 * render, so a field re-rendered on every keystroke or a slider's every drag move would rebuild them
 * each time.
 */
export const FieldStatusMark = memo(function FieldStatusMark({
  status,
  size = 16,
  beat = false,
  className,
}: FieldStatusMarkProps) {
  const warnRef = useRef<MotionIconHandle>(null);
  const errorRef = useRef<MotionIconHandle>(null);
  const prev = useRef(status);
  const faces = useRef<Partial<Record<FieldStatus, HTMLElement | null>>>({});
  const shown = useRef(status);
  const reduced = usePrefersReducedMotion();
  const { timeScale } = useFeedbackMotion();

  // A change of status: the content swap, from the mark shown to the new one (`none` is an empty face).
  useLayoutEffect(() => {
    const was = shown.current;
    shown.current = status;
    const incoming = faces.current[status];
    if (was === status || !incoming) return;
    // From no status nothing is shown, so the mark comes in at once, unless one is still leaving.
    const leaving = (s: FieldStatus) =>
      faces.current[s]?.getAnimations().some((a) => a.playState === 'running');
    const out =
      was !== 'none'
        ? (faces.current[was] ?? null)
        : ((['warn', 'error'] as const)
            .map((s) => (leaving(s) ? faces.current[s]! : null))
            .find(Boolean) ?? null);
    // A mark at rest is whole until its class hides it on this commit: it leaves from 1.
    if (out && !out.getAnimations().some((a) => a.playState === 'running'))
      out
        .animate([{ opacity: 1 }, { opacity: 1 }], {
          duration: 0,
          fill: 'forwards',
        })
        .finish();
    playContentSwap({
      out,
      in: incoming,
      axis: 'y',
      direction: 1,
      timeScale,
      reduced,
    });
  }, [status, reduced, timeScale]);

  useEffect(() => {
    const was = prev.current;
    prev.current = status;
    if (!beat || was === status || status === 'none') return;
    void (status === 'error' ? errorRef : warnRef).current?.play();
  }, [status, beat]);

  return (
    <span
      className={['cds-field-mark', className].filter(Boolean).join(' ')}
      data-status={status}
      aria-hidden="true">
      <span
        ref={(el) => void (faces.current.none = el)}
        className="cds-field-mark__icon cds-field-mark__icon--none"
        data-on={status === 'none' || undefined}
      />
      <span
        ref={(el) => void (faces.current.warn = el)}
        className="cds-field-mark__icon cds-field-mark__icon--warn"
        data-on={status === 'warn' || undefined}>
        <WarningAltFilled ref={warnRef} size={size} />
      </span>
      <span
        ref={(el) => void (faces.current.error = el)}
        className="cds-field-mark__icon cds-field-mark__icon--error"
        data-on={status === 'error' || undefined}>
        <WarningFilled ref={errorRef} size={size} />
      </span>
    </span>
  );
});
