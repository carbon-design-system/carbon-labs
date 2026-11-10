/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { forwardRef, useState, type MouseEvent } from 'react';
import { ViewOffToggle } from '@carbon-labs/react-motion-icons';
import { IconButton, type TooltipAlign } from '@carbon-labs/react-tooltip';
import { FieldCore, type TextInputProps } from './TextInput';
import { CONTROL_SIZES, useDefaultSize } from '@carbon-labs/react-kit-defaults';
import { iconSizeFor } from '@carbon-labs/react-props';
import { useFormFieldState } from '@carbon-labs/react-util';

/* ============================================================================
 * PasswordInput — Carbon v11's PasswordInput on the kit's text field.
 * ============================================================================
 *
 * v11's props: TextInput's (less the counter), `hidePasswordLabel` ("Hide
 * password") / `showPasswordLabel` ("Show password") as the toggle's
 * tooltip and name, `onTogglePasswordVisibility`, `tooltipPosition`
 * (bottom) and `tooltipAlignment` (end), and `type` (password; a change of
 * `type` resets the visibility, as in v11).
 *
 * The toggle is the selection family's IconButton (ghost) inside
 * the field, inset from its edge as the kit's selector sits in its track
 * (the kit's inset; its hover and press a circle on its glyph), with the
 * rollover and the family's tooltip. Its icon is the motion-icons
 * `ViewOffToggle` — View while the password is hidden, View off while it
 * shows — and the button is its `data-motion-icon-frame`, so the slash draws
 * on the button's click, and the icon's hover plays on the button's.
 * ========================================================================== */

export interface PasswordInputProps extends Omit<
  TextInputProps,
  'enableCounter' | 'maxCount'
> {
  /** Default "Hide password". */
  hidePasswordLabel?: string;
  /** Default "Show password". */
  showPasswordLabel?: string;
  onTogglePasswordVisibility?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** Default `bottom`. */
  tooltipPosition?: 'top' | 'right' | 'bottom' | 'left';
  /** Default `end`. */
  tooltipAlignment?: 'start' | 'center' | 'end';
}

/** v11's position + alignment → one alignment. */
function toAlign(
  position: PasswordInputProps['tooltipPosition'],
  alignment: PasswordInputProps['tooltipAlignment']
): TooltipAlign {
  const p = position ?? 'bottom';
  if (p === 'left' || p === 'right') return p;
  if (alignment === 'center') return p;
  return `${p}-${alignment ?? 'end'}`;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    {
      hidePasswordLabel = 'Hide password',
      showPasswordLabel = 'Show password',
      onTogglePasswordVisibility,
      tooltipPosition = 'bottom',
      tooltipAlignment = 'end',
      type = 'password',
      size: sizeProp,
      disabled: ownDisabled = false,
      readOnly: ownReadOnly = false,
      ...rest
    },
    ref
  ) {
    // A FormSection's disabled and read-only reach every field in it.
    const { disabled, readOnly } = useFormFieldState(ownDisabled, ownReadOnly);
    // KitDefaults: the provider's size when none is given (the field takes its corners and variant).
    const size = useDefaultSize(sizeProp, CONTROL_SIZES, 'md');
    // Visibility resets when `type` changes (v11's effect), adjusted during render.
    const [baseType, setBaseType] = useState(type);
    const [inputType, setInputType] = useState(type);
    if (baseType !== type) {
      setBaseType(type);
      setInputType(type);
    }
    const visible = inputType === 'text';

    if (!hidePasswordLabel.trim() || !showPasswordLabel.trim()) {
      console.warn(
        `Warning: The "${!hidePasswordLabel.trim() ? 'hidePasswordLabel' : 'showPasswordLabel'}" should not be blank.`
      );
    }

    const toggle = (
      <IconButton
        className="cds-text-input__toggle"
        frame="ghost"
        size={size === 'lg' ? 'lg' : 'md'}
        label={visible ? hidePasswordLabel : showPasswordLabel}
        align={toAlign(tooltipPosition, tooltipAlignment)}
        disabled={disabled && !readOnly}
        onClick={(e) => {
          setInputType(visible ? 'password' : 'text');
          onTogglePasswordVisibility?.(e as MouseEvent<HTMLButtonElement>);
        }}>
        <ViewOffToggle
          size={iconSizeFor(size)}
          toggled={visible}
          disableToggle
        />
      </IconButton>
    );

    return (
      <FieldCore
        {...rest}
        ref={ref}
        type={inputType}
        size={size}
        disabled={disabled}
        readOnly={readOnly}
        trailing={toggle}
        variantClass="cds-text-input--password"
        data-toggle-password-visibility={inputType === 'password'}
      />
    );
  }
);
PasswordInput.displayName = 'PasswordInput';
