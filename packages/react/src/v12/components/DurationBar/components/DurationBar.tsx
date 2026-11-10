/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { Slider } from '@carbon-labs/react-slider';
import './duration-bar.scss';

/* ============================================================================
 * DurationBar — a duration on a shared scale, as the kit's Slider: the
 * `track` variant at `sm`, its
 * fill the duration, dots every 100ms, so a column of them reads as the
 * scale. With `onChange`, drag the knob or press the track, use the keys
 * (5ms; Shift, 50ms) or type in the Slider's number field; values snap to
 * 5ms and stay within 0–`max`. `reference` marks a second value (the last
 * set value, a baseline) with the Slider's reference mark.
 *
 * Without `onChange` it is a fixed value, not a control: the Slider's
 * `readOnly` (a bar to the value on its geometry, no stops, no knob, no hover
 * or press; a meter to assistive tech), the number in the field's column.
 *
 * No disabled state: a duration that can't be edited here reads only.
 * Disabled colors needn't meet contrast, so a disabled bar would hide the
 * value it exists to show.
 * ========================================================================== */

export interface DurationBarProps {
  /** ms. */
  value: number;
  /** Editable when given. */
  onChange?: (ms: number) => void;
  /** A second value marked on the track (the last set value, a baseline), ms. */
  reference?: number | null;
  /** The scale's end, ms. Default 1000. */
  max?: number;
  /** Its accessible name (the token's name). */
  label: string;
  /** Hide the number. Default false. */
  hideNumber?: boolean;
  className?: string;
}

const STEP = 5;
const GRID = 100;

export function DurationBar({
  value,
  onChange,
  reference,
  max = 1000,
  label,
  hideNumber = false,
  className,
}: DurationBarProps) {
  const editable = !!onChange;
  const snap = (ms: number) =>
    Math.min(max, Math.max(0, Math.round(ms / STEP) * STEP));

  return (
    <div className={['cds-duration-bar', className].filter(Boolean).join(' ')}>
      <Slider
        className="cds-duration-bar__slider"
        shape="track"
        size="sm"
        // Read only, the unit follows the number (below), so the label carries it.
        labelText={editable ? label : `${label}, ms`}
        hideLabel
        ariaLabelInput={`${label}, ms`}
        min={0}
        max={max}
        step={STEP}
        stepMultiplier={GRID / STEP / 2}
        ticks={GRID}
        value={value}
        reference={reference}
        readOnly={!editable}
        hideTextInput={hideNumber}
        readout={false}
        formatLabel={editable ? (v) => `${v}ms` : (v) => String(v)}
        onChange={({ value: v }) => {
          const next = snap(v);
          if (next !== value) onChange?.(next);
        }}
      />
      {!hideNumber && (
        <span className="cds-duration-bar__unit" aria-hidden="true">
          ms
        </span>
      )}
    </div>
  );
}
