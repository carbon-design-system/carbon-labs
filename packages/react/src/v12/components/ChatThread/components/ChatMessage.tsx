/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { forwardRef, type ComponentType, type ReactNode } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { usePrefix } from '@carbon/react';
import { MegaButton } from '@carbon-labs/react-mega-button';

export type ChatMessageRole = 'user' | 'assistant';

export interface ChatMessageProps extends Omit<
  React.LiHTMLAttributes<HTMLLIElement>,
  'children'
> {
  /**
   * What the turn said: a paragraph, a ReasoningTrace, a CodeSnippet, a card.
   * A trace belongs first, above the words it explains.
   */
  children?: ReactNode;

  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;

  /**
   * The controls for this turn — ChatMessageAction children. They appear on
   * hover or keyboard focus, in the thread's gap below the turn, so showing
   * them never moves the conversation.
   */
  actions?: ReactNode;

  /**
   * Who spoke. `user` sits flush right in a bubble, at most three quarters of
   * the measure; `assistant` sits flush left at full measure, with no bubble,
   * because a reply is the page's content rather than an aside. Named `from`
   * rather than `role`, which would shadow the ARIA attribute of that name.
   */
  from: ChatMessageRole;

  /**
   * When it was said. Shown beside the actions, so it costs no line at rest.
   * Leave it out when the turn carries a trace or a plan, which already says
   * how long the work took.
   */
  timestamp?: ReactNode;
}

/**
 * One turn in a ChatThread. It carries no padding and no footer of its own:
 * the thread sets the rhythm, so a turn used alone has no orphan margin.
 */
export const ChatMessage = forwardRef<HTMLLIElement, ChatMessageProps>(
  function ChatMessage(
    { actions, children, className, from, timestamp, ...rest },
    ref
  ) {
    const prefix = usePrefix();
    const block = `${prefix}--chat-message`;
    const hasFooter = Boolean(actions) || Boolean(timestamp);

    return (
      <li
        ref={ref}
        className={cx(block, `${block}--${from}`, className)}
        {...rest}>
        <div className={`${block}__content`}>{children}</div>
        {hasFooter ? (
          <div className={`${block}__footer`}>
            {actions}
            {timestamp ? (
              <span className={`${block}__timestamp`}>{timestamp}</span>
            ) : null}
          </div>
        ) : null}
      </li>
    );
  }
);

ChatMessage.displayName = 'ChatMessage';

ChatMessage.propTypes = {
  /**
   * The controls for this turn — ChatMessageAction children. They appear on
   * hover or keyboard focus, in the thread's gap below the turn, so showing
   * them never moves the conversation.
   */
  actions: PropTypes.node,

  /**
   * What the turn said: a paragraph, a ReasoningTrace, a CodeSnippet, a card.
   * A trace belongs first, above the words it explains.
   */
  children: PropTypes.node,

  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,

  /**
   * Who spoke. `user` sits flush right in a bubble, at most three quarters of
   * the measure; `assistant` sits flush left at full measure, with no bubble,
   * because a reply is the page's content rather than an aside. Named `from`
   * rather than `role`, which would shadow the ARIA attribute of that name.
   */
  from: PropTypes.oneOf(['user', 'assistant'] as const).isRequired,

  /**
   * When it was said. Shown beside the actions, so it costs no line at rest.
   * Leave it out when the turn carries a trace or a plan, which already says
   * how long the work took.
   */
  timestamp: PropTypes.node,
} as React.WeakValidationMap<ChatMessageProps>;

// `type` is narrowed rather than inherited: the DOM's own attribute allows
// `reset`, which MegaButton does not, and the rest of these props are spread
// straight into it.
export interface ChatMessageActionProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'type'
> {
  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;

  /**
   * The Carbon icon to draw, as a component: `ThumbsUp`, `Renew`, `Copy`.
   */
  icon: ComponentType<{ size?: number }>;

  /**
   * Whether the control is on: a cast vote, for instance.
   */
  isSelected?: boolean;

  /**
   * What the control does, in words — the tooltip and the accessible name.
   * Icon-only is a proposal here: feedback and regenerate are not on Carbon's
   * icon-only allow-list, so the name carries the meaning either way.
   */
  label: string;

  /**
   * The button's type. A MegaButton never submits a form by accident.
   */
  type?: 'button' | 'submit';
}

/**
 * One control under a turn: a small ghost button, icon-only with a tooltip.
 */
export const ChatMessageAction = forwardRef<
  HTMLButtonElement,
  ChatMessageActionProps
>(function ChatMessageAction({ className, icon, label, ...rest }, ref) {
  const prefix = usePrefix();

  return (
    <MegaButton
      ref={ref}
      className={cx(`${prefix}--chat-message__action`, className)}
      kind="ghost"
      size="xs"
      hasIconOnly
      renderIcon={icon}
      tooltipAlignment="top"
      {...rest}>
      {label}
    </MegaButton>
  );
});

ChatMessageAction.displayName = 'ChatMessageAction';

ChatMessageAction.propTypes = {
  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,

  /**
   * The Carbon icon to draw, as a component: `ThumbsUp`, `Renew`, `Copy`.
   */
  icon: PropTypes.elementType.isRequired,

  /**
   * Whether the control is on: a cast vote, for instance.
   */
  isSelected: PropTypes.bool,

  /**
   * What the control does, in words — the tooltip and the accessible name.
   * Icon-only is a proposal here: feedback and regenerate are not on Carbon's
   * icon-only allow-list, so the name carries the meaning either way.
   */
  label: PropTypes.string.isRequired,

  /**
   * The button's type. A MegaButton never submits a form by accident.
   */
  type: PropTypes.oneOf(['button', 'submit'] as const),
} as React.WeakValidationMap<ChatMessageActionProps>;
