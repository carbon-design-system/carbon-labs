/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  fieldAria,
  hasText,
  normalizeFieldProps,
  useLateStatus,
} from '@carbon-labs/v12-motion';
import { mergeRefs } from '@carbon-labs/react-tooltip';
import { FieldStatusMark } from '@carbon-labs/react-text-input';
import { FieldFrame } from '@carbon-labs/react-dropdown';
import { PICKER_KIT, useKitProps } from '@carbon-labs/react-kit-defaults';
import type { TimePickerSelectProps } from './TimePickerSelect';
import './time-picker.scss';
import { useFormFieldState } from '@carbon-labs/react-util';
import { holdUntilRelease } from '@carbon-labs/react-util';

/* ============================================================================
 * TimePicker — Carbon v11's TimePicker on the kit's text field: a short
 * text field for the time (`hh:mm`) and its TimePickerSelects (AM / PM, a
 * time zone) beside it, under one label, over one message line.
 * ============================================================================
 *
 * v11's props: `id`, `labelText`, `hideLabel`, `value`, `placeholder`
 * (default `hh:mm`), `pattern` (default `(1[012]|[1-9]):[0-5][0-9](\s)?`),
 * `maxLength` (default 5), `type`, `size` (xs · sm · md · lg), `disabled`,
 * `readOnly`, `invalid` / `invalidText`, `warning` / `warningText` (v11's
 * names; their defaults too), `onChange`, `onClick`, `onBlur`, `className`
 * (the wrapper), `inputClassName`, `pickerClassName`, `light` (accepted);
 * the rest goes on the `<input>`, which is the ref. The children are
 * TimePickerSelects: they take the picker's `disabled` (unless they set
 * their own) and `readOnly`, which holds their value (v11).
 *
 * The field is the text input's (fill, hairline ladder, focus
 * edge, the status mark settling in, the one message line); the selects
 * take the same ladder and motion-icons' chevron.
 * ========================================================================== */

export type TimePickerSize = 'xs' | 'sm' | 'md' | 'lg';

export interface TimePickerProps extends Omit<
  HTMLAttributes<HTMLInputElement>,
  'id' | 'onChange' | 'onClick' | 'onBlur'
> {
  /** TimePickerSelects, after the field. */
  children?: ReactNode;
  /** The wrapper's classes. */
  className?: string;
  /** The `<input>`'s classes. */
  inputClassName?: string;
  /** The classes of the row that holds the field and the selects. */
  pickerClassName?: string;
  disabled?: boolean;
  hideLabel?: boolean;
  id: string;
  invalid?: boolean;
  /** Default v11's "Error message goes here". */
  invalidText?: ReactNode;
  warning?: boolean;
  /** Default v11's "Warning message goes here". */
  warningText?: ReactNode;
  labelText?: ReactNode;
  /** @deprecated v11: `<Layer>` instead. Accepted. */
  light?: boolean;
  /** Default 5. */
  maxLength?: number;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onClick?: (e: MouseEvent<HTMLInputElement>) => void;
  pattern?: string;
  /** Default `hh:mm`. */
  placeholder?: string;
  readOnly?: boolean;
  /** Default `md` (40px), or a `KitDefaults` density's (the fields' map: compact sm, default md, spacious lg). */
  size?: TimePickerSize;
  /** Default `text`. */
  type?: string;
  value?: string;

  /* ── Beyond Carbon's API ─────────────────────────────────────────────── */

  // @carbon-explore corners-prop — Corner mode is one `corners` prop (full, rounded or square) that a provider can set for a subtree, where `rounded` is the component's own radius. TBD
  /** `rounded` (8px, default), `full` or `square`, as the text input's. */
  corners?: 'full' | 'rounded' | 'square';
}

export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(
  function TimePicker(
    {
      'aria-describedby': describedBy,
      children,
      className,
      inputClassName,
      pickerClassName,
      disabled: ownDisabled = false,
      hideLabel = false,
      id,
      invalidText = 'Error message goes here',
      invalid = false,
      warningText = 'Warning message goes here',
      warning = false,
      labelText,
      light: _light,
      maxLength = 5,
      onChange,
      onClick,
      onBlur,
      onFocus,
      pattern = '(1[012]|[1-9]):[0-5][0-9](\\s)?',
      placeholder = 'hh:mm',
      readOnly: ownReadOnly = false,
      size: sizeProp,
      type = 'text',
      value,
      corners: cornersProp,
      ...rest
    },
    ref
  ) {
    // A FormSection's disabled and read-only reach every field in it.
    const { disabled, readOnly } = useFormFieldState(ownDisabled, ownReadOnly);
    // KitDefaults: the provider's density through the fields' map and its corners, for the props not given.
    const { size = 'md', corners } = useKitProps(
      { size: sizeProp, corners: cornersProp },
      PICKER_KIT
    );
    const norm = normalizeFieldProps({
      id,
      readOnly,
      disabled,
      invalid,
      warn: warning,
    });
    const late = useLateStatus(norm.status, { late: false });
    const shown = late.shown;
    const aria = fieldAria({
      shown,
      ids: norm,
      hasHelper: false,
      hasWarnText: hasText(warningText),
      hasInvalidText: hasText(invalidText),
      describedBy,
    });

    const inputRef = useRef<HTMLInputElement>(null);
    const fieldRef = useRef<HTMLDivElement>(null);
    const mergedRef = useMemo(
      () => mergeRefs<HTMLInputElement>(inputRef, ref),
      [ref]
    );
    const [focus, setFocus] = useState<'pointer' | 'keyboard' | null>(null);
    const pointerDown = useRef(false);

    // v11: a read-only picker's selects hold their value (no list, no keys).
    const readOnlyHandlers = {
      onMouseDown: (e: MouseEvent<HTMLSelectElement>) => {
        if (readOnly) {
          e.preventDefault();
          (e.target as HTMLSelectElement).focus();
        }
      },
      onKeyDown: (e: KeyboardEvent<HTMLSelectElement>) => {
        if (readOnly && ['ArrowDown', 'ArrowUp', ' '].includes(e.key))
          e.preventDefault();
      },
    };
    const selects = Children.map(children, (child) => {
      if (!isValidElement(child)) return child;
      const el = child as ReactElement<TimePickerSelectProps>;
      return cloneElement(el, {
        disabled: el.props.disabled ?? disabled,
        readOnly,
        size,
        ...readOnlyHandlers,
      });
    });

    return (
      <FieldFrame
        id={id}
        labelId={`${id}-label`}
        labelFor
        titleText={labelText ?? undefined}
        hideLabel={hideLabel}
        warnText={warningText}
        invalidText={invalidText}
        shown={shown}
        norm={norm}
        size={size}
        readOnly={readOnly}
        corners={corners}
        className={className}
        variantClass="cds-time-picker-wrapper">
        <div
          className={[
            'cds-time-picker',
            `cds-time-picker--${size}`,
            pickerClassName,
          ]
            .filter(Boolean)
            .join(' ')}>
          <div
            ref={fieldRef}
            className="cds-text-input__field cds-time-picker__field"
            data-focus={focus ?? undefined}
            onPointerDown={(e) => {
              if (
                e.target === inputRef.current &&
                document.activeElement !== inputRef.current
              )
                pointerDown.current = true;
              const field = fieldRef.current;
              if (field && document.activeElement === inputRef.current) {
                holdUntilRelease(field);
              }
            }}
            onMouseDown={(e) => {
              if (e.target === inputRef.current || norm.disabled) return;
              e.preventDefault();
              pointerDown.current = true;
              inputRef.current?.focus();
            }}>
            <input
              {...rest}
              {...aria}
              ref={mergedRef}
              id={id}
              className={['cds-text-input__input', inputClassName]
                .filter(Boolean)
                .join(' ')}
              type={type}
              value={value}
              maxLength={maxLength}
              pattern={pattern}
              placeholder={placeholder}
              title={placeholder}
              disabled={norm.disabled}
              readOnly={readOnly}
              data-invalid={norm.invalid || undefined}
              onClick={(e) => {
                if (!norm.disabled) onClick?.(e);
              }}
              onChange={(e) => {
                if (!norm.disabled && !readOnly) onChange?.(e);
              }}
              onFocus={(e) => {
                setFocus(pointerDown.current ? 'pointer' : 'keyboard');
                pointerDown.current = false;
                late.onFocus();
                onFocus?.(e);
              }}
              onBlur={(e) => {
                setFocus(null);
                late.onBlur();
                if (!norm.disabled) onBlur?.(e);
              }}
            />
            <span className="cds-text-input__trail">
              <span className="cds-text-input__mark-slot">
                <FieldStatusMark status={shown} />
              </span>
            </span>
          </div>
          {selects}
        </div>
      </FieldFrame>
    );
  }
);
TimePicker.displayName = 'TimePicker';
