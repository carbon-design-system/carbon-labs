/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from '@carbon-labs/react-motion-icons';
import { iconSizeFor } from '@carbon-labs/react-props';
import './time-picker.scss';

/* ============================================================================
 * TimePickerSelect — Carbon v11's TimePickerSelect: a native `<select>` (its
 * keyboard and list are the platform's) beside the TimePicker's field, on
 * the same hairline ladder, with motion-icons' chevron. v11's props: `id`,
 * `children` (`<SelectItem>`s or `<option>`s), `defaultValue`, `disabled`,
 * `className`, `aria-label` (default "open list of options"); the rest on
 * the `<select>`, which is the ref.
 * ========================================================================== */

export interface TimePickerSelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'size'
> {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  id: string;
  /** Set by the TimePicker: the value holds. */
  readOnly?: boolean;
  /** Set by the TimePicker: its size. */
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const TimePickerSelect = forwardRef<
  HTMLSelectElement,
  TimePickerSelectProps
>(function TimePickerSelect(
  {
    'aria-label': ariaLabel = 'open list of options',
    children,
    id,
    disabled = false,
    readOnly = false,
    size = 'md',
    className,
    ...rest
  },
  ref
) {
  return (
    <div
      className={[
        'cds-time-picker-select',
        disabled && 'cds-time-picker-select--disabled',
        readOnly && 'cds-time-picker-select--readonly',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-motion-icon-frame="">
      <select
        {...rest}
        ref={ref}
        id={id}
        aria-label={ariaLabel}
        aria-readonly={readOnly || undefined}
        className="cds-time-picker-select__input"
        disabled={disabled}>
        {children}
      </select>
      <span className="cds-time-picker-select__chevron" aria-hidden="true">
        <ChevronDown size={iconSizeFor(size)} aria-hidden="true" />
      </span>
    </div>
  );
});
TimePickerSelect.displayName = 'TimePickerSelect';
