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
  isValidElement,
  useId,
  type FieldsetHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { FieldMessage } from '@carbon-labs/react-text-input';
import { Checkbox, type CheckboxProps } from './Checkbox';
import './checkbox.scss';
import { useFormFieldState } from '@carbon-labs/react-util';
import { cx } from '@carbon-labs/react-util';

/* ============================================================================
 * CheckboxGroup — Carbon v11's CheckboxGroup: a fieldset of checkboxes under
 * one label. The label is the kit's group label (styles/_text-pairs.scss):
 * label-01 in `$text-secondary`, 8px above the first checkbox's row, as
 * RadioButtonGroup's and TileGroup's legends are. The checkboxes are 8px
 * apart, as RadioButtonGroup's buttons are.
 *
 * status    v11's: the group's `invalid` or `warn` reaches each Checkbox in
 *           it that sets none of its own (its box rings in the status's
 *           colour), and the group's message, `invalidText` or `warnText`,
 *           shows under the group in the helper's place. Invalid wins over
 *           warn; both are off while the group is disabled or read-only
 *
 * v11's props: `legendText`, `children`, `className`, `orientation`
 * (`vertical` by default, v11's), `helperText`, `disabled`, `readOnly`,
 * `invalid` / `invalidText`, `warn` / `warnText`; other fieldset attributes
 * go to the fieldset.
 * ========================================================================== */

export interface CheckboxGroupProps extends Omit<
  FieldsetHTMLAttributes<HTMLFieldSetElement>,
  'children'
> {
  children?: ReactNode;
  /** The group's label (a `<legend>`). */
  legendText: ReactNode;
  /** Default `vertical` (v11). */
  orientation?: 'horizontal' | 'vertical';
  helperText?: ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  /** The group is in error: each checkbox in it shows it, the message under the group. */
  invalid?: boolean;
  invalidText?: ReactNode;
  /** The group has a warning: each checkbox in it shows it, the message under the group. */
  warn?: boolean;
  warnText?: ReactNode;
}

export function CheckboxGroup({
  children,
  className,
  legendText,
  orientation = 'vertical',
  helperText,
  disabled: ownDisabled = false,
  readOnly: ownReadOnly = false,
  invalid,
  invalidText,
  warn,
  warnText,
  ...rest
}: CheckboxGroupProps) {
  // A FormSection's disabled and read-only reach every field in it.
  const { disabled, readOnly } = useFormFieldState(ownDisabled, ownReadOnly);
  const helperId = `cds-checkbox-group-helper-${useId()}`;
  const ids = {
    warn: `${helperId}-warn`,
    invalid: `${helperId}-invalid`,
  };
  // v11: invalid wins over warn; both off when disabled or read-only.
  const status =
    disabled || readOnly ? 'none' : invalid ? 'error' : warn ? 'warn' : 'none';
  // The message shown: a status's text, else the helper (FieldMessage's rule).
  const described =
    status === 'error' && invalidText
      ? ids.invalid
      : status === 'warn' && warnText
        ? ids.warn
        : helperText
          ? helperId
          : rest['aria-describedby'];
  // The group's status and its read-only state reach each Checkbox that sets none of its own
  // (v11).
  const boxes = Children.map(children, (child) => {
    if (!isValidElement(child) || child.type !== Checkbox) return child;
    const own = child.props as CheckboxProps;
    const set: Partial<CheckboxProps> = {};
    if (invalid !== undefined && own.invalid === undefined)
      set.invalid = status === 'error';
    if (warn !== undefined && own.warn === undefined)
      set.warn = status === 'warn';
    if (readOnly && own.readOnly === undefined) set.readOnly = true;
    return Object.keys(set).length
      ? cloneElement(child as ReactElement<CheckboxProps>, set)
      : child;
  });
  return (
    <fieldset
      {...rest}
      className={cx(
        'cds-checkbox-group',
        `cds-checkbox-group--${orientation}`,
        status === 'error' && 'cds-checkbox-group--invalid',
        status === 'warn' && 'cds-checkbox-group--warn',
        className
      )}
      disabled={disabled}
      aria-describedby={described}>
      <legend className="cds-checkbox-group__legend">{legendText}</legend>
      <div className="cds-checkbox-group__boxes">{boxes}</div>
      {helperText || invalidText || warnText ? (
        <FieldMessage
          status={status}
          helperText={helperText}
          invalidText={invalidText}
          warnText={warnText}
          helperId={helperId}
          warnId={ids.warn}
          invalidId={ids.invalid}
          disabled={disabled}
          placement="flow"
        />
      ) : null}
    </fieldset>
  );
}
