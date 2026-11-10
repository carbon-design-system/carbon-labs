/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { attachRollover } from '@carbon-labs/v12-motion';
import { useStableCallback } from '@carbon-labs/react-util';
import { FieldMessage } from '@carbon-labs/react-text-input';
import './radio-button.scss';
import { useFormFieldState } from '@carbon-labs/react-util';
import { cx } from '@carbon-labs/react-util';
import { useReducedGetter } from '@carbon-labs/react-util';

/* ============================================================================
 * RadioButton and RadioButtonGroup — Carbon v11's, on the selection family's
 * look, as the Checkbox.
 *
 *   mark       a 16px circle; off, a 1px `$border-strong` stroke and no
 *              fill; on, the family's inverse selector fill
 *              (`$layer-selected-inverse`) with a 6px dot in `$icon-inverse`
 *              — the Checkbox's on, round. RadioTile wears the same mark
 *   hover      the rollover on the circle: off, a wash of the text color (8%);
 *              on, a toned step of the fill (86%); no press colour, as the
 *              Checkbox. 1px out on hover, 1px in on press. Hovering and
 *              pressing the label plays it too (the label passes both on to
 *              its input), however the label wraps
 *   hit area   4px round the circle (24px)
 *   dot        grows from its center when chosen (half size to full, fast-02,
 *              entrance-productive, the snap's mark; 40ms after the fill, so
 *              the state reads first); shrinks and fades when unchosen
 *              (fast-01). Reduced motion: at once
 *   focus      the family's keyboard ring: 2px `$text-primary`, 2px outside
 *              the circle (keyboard only); 3px while a status shows, as the
 *              Checkbox
 *   keyboard   a native radio group, as v11: one tab stop (the chosen one, or
 *              the first), the arrow keys move the choice and wrap
 *   disabled   off, a `$border-disabled` stroke; on, a muted fill (the
 *              inverse half mixed into the page); the label `$text-disabled`
 *   read-only  v11's: no fill, a `$border-disabled` stroke, the dot in
 *              `$icon-primary`; focusable, the arrows and clicks change
 *              nothing
 *   invalid    the circle's stroke in `$support-error` and 1px more outside
 *              it, so the shape never changes; the message below (the text
 *              input's FieldMessage). The ring is the rollover surface's, so
 *              it grows out with the hover at the same 2px
 *   warn       error's ring all in `$support-warning` (all yellow, as the
 *              Checkbox); the message below. A group's
 *              invalid or warn rings every button in it
 *
 * v11's props: RadioButton `labelText`, `value`, `checked`, `defaultChecked`,
 * `disabled`, `hideLabel`, `id`, `labelPosition`, `name`, `onChange(value,
 * name, event)`, `onClick`, `required`, `invalid`, `invalidText`, `warn`,
 * `warnText`, `readOnly`, `className`; RadioButtonGroup `name`, `legendText`,
 * `valueSelected`, `defaultSelected`, `onChange(selection, name, event)`,
 * `orientation` (`horizontal` default · `vertical`), `labelPosition`,
 * `disabled`, `readOnly`, `required`, `helperText`, `invalid`,
 * `invalidText`, `warn`, `warnText`, `className`. Not taken: `decorator` /
 * `slug` (the kit has no AI label).
 * ========================================================================== */

/** Where the label sits, logical so right to left mirrors it: `end` (default, after the button) or `start`. */
export type RadioButtonLabelPosition = 'start' | 'end';

type Value = string | number;
type Status = 'none' | 'warn' | 'error';
interface GroupState {
  name: string;
  selected: Value | undefined;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  invalid: boolean;
  warn: boolean;
  labelPosition: RadioButtonLabelPosition;
  timeScale: number | undefined;
  choose: (value: Value, event: ChangeEvent<HTMLInputElement>) => void;
}

const GroupContext = createContext<GroupState | null>(null);

/** The circle's rollover, unless it can't be used. */
function useMarkRollover(
  ref: React.RefObject<HTMLElement | null>,
  off: boolean,
  timeScale: number | undefined
) {
  const rolloverReduced = useReducedGetter();
  useEffect(() => {
    const node = ref.current;
    if (!node || off) return;
    return attachRollover(node, {
      selector: '.cds-radio__circle',
      // Its own steps (radio-button.scss), as the Checkbox's.
      colors: 'tokens',
      timeScale,
      reduced: rolloverReduced,
    });
  }, [ref, off, timeScale, rolloverReduced]);
}

export interface RadioButtonProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'type' | 'value' | 'size'
> {
  labelText: ReactNode;
  value?: Value;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  hideLabel?: boolean;
  id?: string;
  /** `end` (default): the label after the button; `start`, before it. */
  labelPosition?: RadioButtonLabelPosition;
  name?: string;
  /** v11: the value, the name, the event. */
  onChange?: (
    value: Value | undefined,
    name: string | undefined,
    event: ChangeEvent<HTMLInputElement>
  ) => void;
  required?: boolean;
  invalid?: boolean;
  invalidText?: ReactNode;
  warn?: boolean;
  warnText?: ReactNode;
  readOnly?: boolean;
  className?: string;
  /** Slow motion: multiplies the rollover's durations. Default: the group's, else 1. */
  timeScale?: number;
}

export function RadioButton({
  labelText,
  value = '',
  checked,
  defaultChecked,
  disabled: ownDisabled = false,
  hideLabel = false,
  id,
  labelPosition: ownPosition,
  name: ownName,
  onChange,
  onClick,
  required,
  invalid: ownInvalid = false,
  invalidText,
  warn = false,
  warnText,
  readOnly: ownReadOnly = false,
  className,
  timeScale,
  ...rest
}: RadioButtonProps) {
  const group = useContext(GroupContext);
  const circle = useRef<HTMLSpanElement>(null);
  const uid = useId();
  const inputId = id ?? `cds-radio-${uid}`;
  const disabled = ownDisabled || !!group?.disabled;
  const readOnly = ownReadOnly || !!group?.readOnly;
  const invalid = ownInvalid || !!group?.invalid;
  const warned = warn || !!group?.warn;
  const position = ownPosition ?? group?.labelPosition ?? 'end';
  const name = group?.name ?? ownName;
  // In a group the group holds the choice; alone, the props (or the DOM).
  const isChecked = group ? group.selected === value : checked;
  // Its own message's status; the ring takes the group's status too.
  const status: Status =
    disabled || readOnly
      ? 'none'
      : ownInvalid
        ? 'error'
        : warn
          ? 'warn'
          : 'none';
  const ring: Status =
    disabled || readOnly
      ? 'none'
      : invalid
        ? 'error'
        : warned
          ? 'warn'
          : 'none';
  const ids = {
    helper: `${inputId}-helper`,
    warn: `${inputId}-warn`,
    invalid: `${inputId}-invalid`,
  };
  useMarkRollover(circle, disabled || readOnly, timeScale ?? group?.timeScale);

  return (
    <div
      className={cx(
        'cds-radio',
        position === 'start' && 'cds-radio--start',
        disabled && 'cds-radio--disabled',
        readOnly && 'cds-radio--readonly',
        ring === 'error' && 'cds-radio--invalid',
        ring === 'warn' && 'cds-radio--warn',
        className
      )}>
      <label className="cds-radio__row" htmlFor={inputId}>
        <span
          ref={circle}
          className="cds-radio__circle"
          aria-disabled={disabled || readOnly || undefined}>
          <input
            {...rest}
            id={inputId}
            type="radio"
            className="cds-radio__input"
            name={name}
            value={String(value)}
            checked={isChecked}
            defaultChecked={group ? undefined : defaultChecked}
            disabled={disabled}
            required={required ?? group?.required}
            aria-readonly={readOnly || undefined}
            aria-invalid={status === 'error' || undefined}
            aria-describedby={
              status === 'error'
                ? ids.invalid
                : status === 'warn'
                  ? ids.warn
                  : undefined
            }
            onClick={(e) => {
              if (readOnly) {
                e.preventDefault();
                return;
              }
              onClick?.(e);
            }}
            onChange={(e) => {
              if (readOnly) return;
              if (group) group.choose(value, e);
              onChange?.(value, name, e);
            }}
          />
          <span className="cds-radio__dot" aria-hidden="true" />
        </span>
        <span
          className={
            hideLabel
              ? 'cds-radio__label cds-radio__label--hidden'
              : 'cds-radio__label'
          }>
          {labelText}
        </span>
      </label>
      {(invalidText || warnText) && (
        <FieldMessage
          status={status}
          warnText={warnText}
          invalidText={invalidText}
          helperId={ids.helper}
          warnId={ids.warn}
          invalidId={ids.invalid}
          disabled={disabled}
          placement="flow"
          className="cds-radio__message"
        />
      )}
    </div>
  );
}

export interface RadioButtonGroupProps {
  children?: ReactNode;
  className?: string;
  name: string;
  legendText?: ReactNode;
  valueSelected?: Value;
  defaultSelected?: Value;
  /** v11: the chosen value, the name, the event. */
  onChange?: (
    selection: Value,
    name: string,
    event: ChangeEvent<HTMLInputElement>
  ) => void;
  /** Default `horizontal` (v11). */
  orientation?: 'horizontal' | 'vertical';
  /** Every button's label: `end` (default) or `start`. */
  labelPosition?: RadioButtonLabelPosition;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  helperText?: ReactNode;
  invalid?: boolean;
  invalidText?: ReactNode;
  warn?: boolean;
  warnText?: ReactNode;
  /** Slow motion for every button inside: multiplies the rollover's durations. Default 1. */
  timeScale?: number;
}

export function RadioButtonGroup({
  children,
  className,
  name,
  legendText,
  valueSelected,
  defaultSelected,
  onChange,
  orientation = 'horizontal',
  labelPosition = 'end',
  disabled: ownDisabled = false,
  readOnly: ownReadOnly = false,
  required = false,
  helperText,
  invalid = false,
  invalidText,
  warn = false,
  warnText,
  timeScale,
}: RadioButtonGroupProps) {
  // A FormSection's disabled and read-only reach every field in it.
  const { disabled, readOnly } = useFormFieldState(ownDisabled, ownReadOnly);
  const [own, setOwn] = useState<Value | undefined>(defaultSelected);
  const selected = valueSelected !== undefined ? valueSelected : own;
  const uid = useId();
  const ids = {
    helper: `${name}-helper-${uid}`,
    warn: `${name}-warn-${uid}`,
    invalid: `${name}-invalid-${uid}`,
  };
  const status: Status =
    disabled || readOnly ? 'none' : invalid ? 'error' : warn ? 'warn' : 'none';
  // Stable, and the context value held while nothing in it changed: a render
  // of the group (a parent's, an inline `onChange`) doesn't render every button.
  const choose = useStableCallback(
    (value: Value, event: ChangeEvent<HTMLInputElement>) => {
      if (readOnly || value === selected) return;
      setOwn(value);
      onChange?.(value, name, event);
    }
  );
  const state = useMemo<GroupState>(
    () => ({
      name,
      selected,
      disabled,
      readOnly,
      required,
      invalid: status === 'error',
      warn: status === 'warn',
      labelPosition,
      timeScale,
      choose,
    }),
    [
      name,
      selected,
      disabled,
      readOnly,
      required,
      status,
      labelPosition,
      timeScale,
      choose,
    ]
  );
  return (
    <fieldset
      className={cx(
        'cds-radio-group',
        `cds-radio-group--${orientation}`,
        className
      )}
      disabled={disabled}
      aria-readonly={readOnly || undefined}
      aria-describedby={
        status === 'error'
          ? ids.invalid
          : status === 'warn'
            ? ids.warn
            : helperText
              ? ids.helper
              : undefined
      }>
      {legendText ? (
        <legend className="cds-radio-group__legend">{legendText}</legend>
      ) : null}
      <div className="cds-radio-group__buttons">
        <GroupContext.Provider value={state}>{children}</GroupContext.Provider>
      </div>
      {(helperText || invalidText || warnText) && (
        <FieldMessage
          status={status}
          helperText={helperText}
          warnText={warnText}
          invalidText={invalidText}
          helperId={ids.helper}
          warnId={ids.warn}
          invalidId={ids.invalid}
          disabled={disabled}
          placement="flow"
        />
      )}
    </fieldset>
  );
}

/** The mark alone, for a control that draws a radio it doesn't own (RadioTile). */
export function RadioMark({
  checked,
  disabled,
  className,
}: {
  checked: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cx('cds-radio__circle', 'cds-radio__circle--mark', className)}
      data-checked={checked || undefined}
      data-disabled={disabled || undefined}
      aria-hidden="true">
      <span className="cds-radio__dot" />
    </span>
  );
}
