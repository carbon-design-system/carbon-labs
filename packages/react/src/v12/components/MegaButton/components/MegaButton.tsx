/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {
  forwardRef,
  type ElementType,
  type PointerEvent,
  type ReactNode,
} from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Tooltip, usePrefix } from '@carbon/react';
import { KeyboardShortcut } from '../../KeyboardShortcut';
import { toAriaKeyShortcuts } from '../internal/ariaKeyShortcuts';

// @carbon-proposal api: mega-button-kinds — Carbon's secondary is the fill and its tertiary the outline; MegaButton swaps them on purpose (the outline reads better beside a neutral primary), and keeps two red kinds. TBD
export const megaButtonKinds = [
  'primary',
  'secondary',
  'tertiary',
  'ghost',
  'danger',
  'danger--secondary',
] as const;

export type MegaButtonKind = (typeof megaButtonKinds)[number];

export const megaButtonSizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

export type MegaButtonSize = (typeof megaButtonSizes)[number];

// Carbon's IconButton stops at lg; an icon-only MegaButton does too.
const iconOnlySizes: readonly MegaButtonSize[] = ['xs', 'sm', 'md', 'lg'];

export type MegaButtonIconPosition = 'leading' | 'trailing';

export interface MegaButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  /**
   * The label. For an icon-only button it is the accessible name and the
   * tooltip, and is required.
   */
  children?: ReactNode;

  /**
   * Provide an optional class to be applied to the button
   */
  className?: string;

  /**
   * Disable the button. It keeps its place and colour family, muted.
   */
  disabled?: boolean;

  /**
   * Show only the icon. The label becomes the tooltip and the accessible
   * name, and the key command moves into the tooltip as keycaps.
   */
  hasIconOnly?: boolean;

  /**
   * Which side of the label the one icon sits on. With a key command the icon
   * always leads, so the label, the icon and the chord never crowd the end of
   * the button; the key command is always last.
   */
  iconPosition?: MegaButtonIconPosition;

  /**
   * Whether a toggle button is on. Sets `aria-pressed`, which is what draws
   * the selected state; colour is never the only signal.
   */
  isSelected?: boolean;

  /**
   * A key command to show on the button, written as KeyboardShortcut's
   * `keys` (`['mod', 's']`). It only shows the shortcut and announces it
   * through `aria-keyshortcuts`; the product binds the keys.
   */
  keyCommand?: string[];

  /**
   * The kind. `primary` is neutral at rest and blue when acted on;
   * `secondary` is the outline; `tertiary` the tinted fill; `ghost` has no
   * container at rest; `danger` and `danger--secondary` are the red fill and
   * the red outline.
   */
  kind?: MegaButtonKind;

  /**
   * Called on pointer down. The button also uses it to start the press from
   * where the pointer went down.
   */
  onPointerDown?: (event: PointerEvent<HTMLButtonElement>) => void;

  /**
   * An icon from `@carbon/icons-react`, rendered at 16.
   */
  renderIcon?: ElementType;

  /**
   * The height: `xs` 24, `sm` 32, `md` 40, `lg` 48, `xl` 64, `2xl` 80. An
   * icon-only button takes `xs` to `lg`.
   */
  size?: MegaButtonSize;

  /**
   * Where the icon-only tooltip opens.
   */
  tooltipAlignment?: 'top' | 'bottom' | 'left' | 'right';

  /**
   * The button's type. A MegaButton never submits a form by accident.
   */
  type?: 'button' | 'submit';
}

export const MegaButton = forwardRef<HTMLButtonElement, MegaButtonProps>(
  function MegaButton(
    {
      children,
      className,
      disabled = false,
      hasIconOnly = false,
      iconPosition = 'trailing',
      isSelected,
      keyCommand,
      kind = 'primary',
      onPointerDown,
      renderIcon: Icon,
      size = 'lg',
      tooltipAlignment = 'bottom',
      type = 'button',
      ...rest
    },
    ref
  ) {
    const prefix = usePrefix();
    const block = `${prefix}--mega-button`;
    const hasKeyCommand = Boolean(keyCommand && keyCommand.length > 0);
    // A key command takes the end of the button, so the icon moves to lead
    // (decided by the human, INBOX row 19).
    const position: MegaButtonIconPosition = hasKeyCommand
      ? 'leading'
      : iconPosition;

    // The press grows from where the pointer went down, so the position is
    // handed to the stylesheet as two custom properties. Keyboard activation
    // never sets them, and the press grows from the centre.
    function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
      const { currentTarget, clientX, clientY } = event;
      const box = currentTarget.getBoundingClientRect();
      currentTarget.style.setProperty(
        `--${block}-press-x`,
        `${clientX - box.left}px`
      );
      currentTarget.style.setProperty(
        `--${block}-press-y`,
        `${clientY - box.top}px`
      );
      onPointerDown?.(event);
    }

    const icon = Icon ? (
      <Icon aria-hidden="true" className={`${block}__icon`} size={16} />
    ) : null;

    const classes = cx(
      block,
      `${block}--${kind}`,
      `${block}--${size}`,
      // Carbon's layout context: the stylesheet reads the height from it.
      `${prefix}--layout--size-${size}`,
      {
        [`${block}--icon-only`]: hasIconOnly,
        [`${block}--icon-leading`]: !hasIconOnly && position === 'leading',
      },
      className
    );

    const button = (
      <button
        ref={ref}
        // @carbon-proposal api: mega-button-key-command — a visible key command on a button, announced by aria-keyshortcuts; Carbon's Button has none. TBD
        aria-keyshortcuts={
          hasKeyCommand ? toAriaKeyShortcuts(keyCommand as string[]) : undefined
        }
        aria-pressed={isSelected === undefined ? undefined : isSelected}
        className={classes}
        disabled={disabled}
        onPointerDown={handlePointerDown}
        type={type === 'submit' ? 'submit' : 'button'}
        {...rest}>
        {hasIconOnly ? (
          icon
        ) : (
          <>
            {/* @carbon-proposal api: mega-button-icon-position — Carbon's Button only trails its icon. TBD */}
            {position === 'leading' && icon}
            <span className={`${block}__label`}>{children}</span>
            {position === 'trailing' && icon}
            {hasKeyCommand && (
              // The button is named by its label alone; the chord is
              // announced by aria-keyshortcuts, so the visible hint is hidden
              // from assistive technology rather than read twice.
              <KeyboardShortcut
                aria-hidden="true"
                className={`${block}__key-command`}
                keys={keyCommand as string[]}
                kind="plain"
              />
            )}
          </>
        )}
      </button>
    );

    if (!hasIconOnly) {
      return button;
    }

    // Icon-only: the label is the tooltip and, through it, the accessible
    // name, as Carbon's IconButton does. The key command joins it as keycaps.
    // @carbon-proposal api: mega-button-danger-icon-only — the danger kinds may be icon-only; Carbon's IconButton has no danger kinds. TBD
    return (
      <Tooltip
        align={tooltipAlignment}
        label={
          <>
            {children}
            {hasKeyCommand && (
              <>
                {' '}
                <KeyboardShortcut keys={keyCommand as string[]} kind="keycap" />
              </>
            )}
          </>
        }>
        {button}
      </Tooltip>
    );
  }
);

MegaButton.displayName = 'MegaButton';

MegaButton.propTypes = {
  /**
   * The label. For an icon-only button it is the accessible name and the
   * tooltip, and is required.
   */
  // Labs's idiom: prop-types' node is typed against an older ReactNode.
  children: PropTypes.node as unknown as React.Validator<ReactNode>,

  /**
   * Provide an optional class to be applied to the button
   */
  className: PropTypes.string,

  /**
   * Disable the button. It keeps its place and colour family, muted.
   */
  disabled: PropTypes.bool,

  /**
   * Show only the icon. The label becomes the tooltip and the accessible
   * name, and the key command moves into the tooltip as keycaps.
   */
  hasIconOnly: PropTypes.bool,

  /**
   * Which side of the label the one icon sits on. With a key command the icon
   * always leads, so the label, the icon and the chord never crowd the end of
   * the button; the key command is always last.
   */
  iconPosition: PropTypes.oneOf(['leading', 'trailing'] as const),

  /**
   * Whether a toggle button is on. Sets `aria-pressed`, which is what draws
   * the selected state; colour is never the only signal.
   */
  isSelected: PropTypes.bool,

  /**
   * A key command to show on the button, written as KeyboardShortcut's
   * `keys` (`['mod', 's']`). It only shows the shortcut and announces it
   * through `aria-keyshortcuts`; the product binds the keys.
   */
  keyCommand: PropTypes.arrayOf(PropTypes.string.isRequired),

  /**
   * The kind. `primary` is neutral at rest and blue when acted on;
   * `secondary` is the outline; `tertiary` the tinted fill; `ghost` has no
   * container at rest; `danger` and `danger--secondary` are the red fill and
   * the red outline.
   */
  kind: PropTypes.oneOf(megaButtonKinds),

  /**
   * Called on pointer down. The button also uses it to start the press from
   * where the pointer went down.
   */
  onPointerDown: PropTypes.func,

  /**
   * An icon from `@carbon/icons-react`, rendered at 16.
   */
  // As Carbon's Button types it: a component is a function or, wrapped, an object.
  renderIcon: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
  ]) as unknown as React.Validator<ElementType>,

  /**
   * The height: `xs` 24, `sm` 32, `md` 40, `lg` 48, `xl` 64, `2xl` 80. An
   * icon-only button takes `xs` to `lg`.
   */
  size: (props, propName, componentName) => {
    const value = props[propName];
    if (value === undefined) {
      return null;
    }
    if (!(megaButtonSizes as readonly string[]).includes(value)) {
      return new Error(
        `${componentName}: \`${propName}\` must be one of ${megaButtonSizes.join(', ')}; got \`${value}\`.`
      );
    }
    if (props.hasIconOnly && !iconOnlySizes.includes(value)) {
      return new Error(
        `${componentName}: an icon-only MegaButton takes xs to lg, as Carbon's IconButton does; got \`${value}\`.`
      );
    }
    return null;
  },

  /**
   * Where the icon-only tooltip opens.
   */
  tooltipAlignment: PropTypes.oneOf([
    'top',
    'bottom',
    'left',
    'right',
  ] as const),

  /**
   * The button's type. A MegaButton never submits a form by accident.
   */
  type: PropTypes.oneOf(['button', 'submit'] as const),
};
