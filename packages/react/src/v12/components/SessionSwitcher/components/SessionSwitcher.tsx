/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { forwardRef, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import {
  Menu,
  MenuItem,
  MenuItemDivider,
  MenuItemRadioGroup,
  usePrefix,
} from '@carbon/react';
import { ChevronDown } from '@carbon/icons-react';
import { MegaButton } from '@carbon-labs/react-mega-button';

export interface SessionSwitcherSession {
  /** Identifies the session to the product. Returned by `onSelect`. */
  id: string;

  /** What the session is called — the words a person recognises it by. */
  label: string;
}

export interface SessionSwitcherProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onSelect' | 'children'
> {
  /**
   * An action under the sessions, below a divider — "New conversation". It is
   * separated because starting a session is not choosing one, and a menu that
   * mixes the two invites the wrong click.
   */
  action?: { label: string; onClick?: () => void };

  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;

  /**
   * The session the person is in. It is the button's label and the selected
   * row, so the menu says where you already are rather than making you
   * remember.
   */
  currentId: string;

  /**
   * Names the menu for assistive technology — "Switch conversation".
   */
  label?: string;

  /**
   * Called with the chosen session's id.
   */
  onSelect?: (id: string) => void;

  /**
   * The sessions to choose between, the current one included.
   */
  sessions: SessionSwitcherSession[];

  /**
   * The button's size. The bar it sits in decides it.
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * The control that says which conversation you are in and moves you to
 * another. It is a MegaButton carrying the menu's chevron inside it, so the
 * affordance is part of the control rather than a glyph beside it.
 *
 * The sessions are a radio group, not a list of actions: exactly one is
 * current, so the menu marks it **selected**. A plain MenuItem can only ever
 * look active as the pointer crosses it, which says "this is where the cursor
 * is", not "this is where you are".
 */
export const SessionSwitcher = forwardRef<HTMLDivElement, SessionSwitcherProps>(
  function SessionSwitcher(
    {
      action,
      className,
      currentId,
      label = 'Switch conversation',
      onSelect,
      sessions,
      size = 'md',
      ...rest
    },
    ref
  ) {
    const prefix = usePrefix();
    const block = `${prefix}--session-switcher`;
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(false);
    const [host, setHost] = useState<HTMLDivElement | null>(null);

    const current = sessions.find((session) => session.id === currentId);
    // Carbon's Menu is position: fixed, so a transformed or contained ancestor
    // changes what its coordinates mean. Both rects are read in the frame the
    // menu opens and the offset taken between them, which is how ChatInput's
    // own menus place themselves.
    const rect = open ? triggerRef.current?.getBoundingClientRect() : undefined;
    const origin = open ? host?.getBoundingClientRect() : undefined;

    return (
      <div ref={ref} className={cx(block, className)} {...rest}>
        {/* No `isSelected`: that is MegaButton's toggle state and sets
            aria-pressed, so the control would announce as both pressed and
            expanded for the one thing. A menu button says aria-expanded, and
            the open menu is the state made visible. */}
        <MegaButton
          ref={triggerRef}
          aria-expanded={open}
          aria-haspopup="menu"
          className={`${block}__trigger`}
          kind="ghost"
          size={size}
          renderIcon={ChevronDown}
          iconPosition="trailing"
          onClick={() => setOpen((was) => !was)}>
          {current?.label ?? label}
        </MegaButton>
        <div ref={setHost} className={`${block}__anchor`} />
        {rect && origin ? (
          <Menu
            className={`${block}__menu`}
            open={open}
            label={label}
            target={host ?? undefined}
            size={size === 'lg' ? 'lg' : 'sm'}
            x={rect.left - origin.left}
            y={rect.bottom - origin.top}
            onClose={() => {
              setOpen(false);
              triggerRef.current?.focus();
            }}>
            {/* Carbon infers this group's item type as `unknown`, so the ids
                are read back as such rather than annotated as strings — an
                annotation here does not narrow the generic, it just fails to
                match it. */}
            <MenuItemRadioGroup
              label={label}
              items={sessions.map((session) => session.id)}
              itemToString={(id: unknown) =>
                sessions.find((session) => session.id === id)?.label ??
                String(id)
              }
              selectedItem={currentId}
              onChange={(id: unknown) => onSelect?.(String(id))}
            />
            {action ? <MenuItemDivider /> : null}
            {action ? (
              <MenuItem label={action.label} onClick={action.onClick} />
            ) : null}
          </Menu>
        ) : null}
      </div>
    );
  }
);

SessionSwitcher.displayName = 'SessionSwitcher';

SessionSwitcher.propTypes = {
  /**
   * An action under the sessions, below a divider — "New conversation". It is
   * separated because starting a session is not choosing one.
   */
  action: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func,
  }) as unknown as React.Validator<SessionSwitcherProps['action']>,

  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,

  /**
   * The session the person is in: the button's label and the selected row.
   */
  currentId: PropTypes.string.isRequired,

  /**
   * Names the menu for assistive technology — "Switch conversation".
   */
  label: PropTypes.string,

  /**
   * Called with the chosen session's id.
   */
  onSelect: PropTypes.func,

  /**
   * The sessions to choose between, the current one included.
   */
  sessions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }).isRequired
  ).isRequired as unknown as React.Validator<SessionSwitcherProps['sessions']>,

  /**
   * The button's size. The bar it sits in decides it.
   */
  size: PropTypes.oneOf(['sm', 'md', 'lg'] as const),
} as React.WeakValidationMap<SessionSwitcherProps>;
