/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useId, type FieldsetHTMLAttributes, type ReactNode } from 'react';
import { FieldMessage } from '@carbon-labs/react-text-input';
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
 * v11's props: `legendText`, `children`, `className`, `orientation`
 * (`vertical` by default, v11's), `helperText`, `disabled`, `readOnly`;
 * other fieldset attributes go to the fieldset. Not yet: the group's
 * `invalid` / `warn` (each Checkbox has its own).
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
}

export function CheckboxGroup({
  children,
  className,
  legendText,
  orientation = 'vertical',
  helperText,
  disabled: ownDisabled = false,
  readOnly: ownReadOnly = false,
  ...rest
}: CheckboxGroupProps) {
  // A FormSection's disabled and read-only reach every field in it.
  const { disabled, readOnly } = useFormFieldState(ownDisabled, ownReadOnly);
  const helperId = `cds-checkbox-group-helper-${useId()}`;
  return (
    <fieldset
      {...rest}
      className={cx(
        'cds-checkbox-group',
        `cds-checkbox-group--${orientation}`,
        className
      )}
      disabled={disabled}
      aria-readonly={readOnly || undefined}
      aria-describedby={helperText ? helperId : rest['aria-describedby']}>
      <legend className="cds-checkbox-group__legend">{legendText}</legend>
      <div className="cds-checkbox-group__boxes">{children}</div>
      {helperText ? (
        <FieldMessage
          status="none"
          helperText={helperText}
          helperId={helperId}
          warnId={`${helperId}-warn`}
          invalidId={`${helperId}-invalid`}
          disabled={disabled}
          placement="flow"
        />
      ) : null}
    </fieldset>
  );
}
