/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {
  Children,
  Fragment,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { usePrefix } from '@carbon/react';
import { ChatMessage } from './ChatMessage';

export type ChatThreadAlign = 'bottom' | 'top';
export type ChatThreadDensity = 'balanced' | 'compact';

export interface ChatThreadProps extends React.HTMLAttributes<HTMLOListElement> {
  /**
   * Where a short conversation sits: `bottom` against the composer, which is
   * where the eye already is, or `top` for a transcript read as a document.
   */
  align?: ChatThreadAlign;

  /**
   * What the thread announces when a reply lands, through its polite live
   * region. The reply itself is not read out as it streams.
   */
  announcement?: string;

  /**
   * The turns: ChatMessage children, in the order they happened. Anything
   * else — a divider — is given a list item of its own and scrolls with them.
   */
  children?: ReactNode;

  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;

  /**
   * How far apart the turns sit: `balanced` at full measure, `compact` for a
   * narrow pane or one thread among several.
   */
  density?: ChatThreadDensity;

  /**
   * Names the list for assistive technology ("Conversation with the
   * assistant"). Required: an unnamed list of turns is read as a bare list.
   */
  label: string;
}

/**
 * The transcript: an ordered list of turns and the one polite live region
 * that announces a reply when it lands. It paints nothing — no fill, no
 * border, no radius — and contributes rhythm only, so a turn used alone
 * carries no orphan margin. Scrolling, stick-to-bottom and the
 * scroll-to-bottom control belong to the pane, not to the thread.
 */
/** The children with fragments opened, so a fragment of turns stays turns. */
function flatten(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement(child) && child.type === Fragment
      ? flatten(
          (child as ReactElement<{ children?: ReactNode }>).props.children
        )
      : [child]
  );
}

export const ChatThread = forwardRef<HTMLOListElement, ChatThreadProps>(
  function ChatThread(
    {
      align = 'bottom',
      announcement,
      children,
      className,
      density = 'balanced',
      label,
      ...rest
    },
    ref
  ) {
    const prefix = usePrefix();
    const block = `${prefix}--chat-thread`;

    return (
      <>
        <ol
          ref={ref}
          aria-label={label}
          className={cx(
            block,
            `${block}--${align}`,
            `${block}--${density}`,
            className
          )}
          {...rest}>
          {/* A turn is its own list item. Anything else in the flow — a day
              or iteration divider, a SystemMessage — is wrapped in one, so it
              scrolls with the turns it sits between and the list stays a list. */}
          {flatten(children).map((child, index) =>
            isValidElement(child) && child.type === ChatMessage ? (
              child
            ) : (
              <li
                key={(isValidElement(child) && child.key) || `item-${index}`}
                className={`${block}__item`}>
                {child}
              </li>
            )
          )}
        </ol>
        {/* One region for the whole thread: a region per turn would announce
            every streamed fragment. */}
        <span className={`${prefix}--visually-hidden`} aria-live="polite">
          {announcement}
        </span>
      </>
    );
  }
);

ChatThread.displayName = 'ChatThread';

ChatThread.propTypes = {
  /**
   * Where a short conversation sits: `bottom` against the composer, which is
   * where the eye already is, or `top` for a transcript read as a document.
   */
  align: PropTypes.oneOf(['bottom', 'top'] as const),

  /**
   * What the thread announces when a reply lands, through its polite live
   * region. The reply itself is not read out as it streams.
   */
  announcement: PropTypes.string,

  /**
   * The turns: ChatMessage children, in the order they happened.
   */
  children: PropTypes.node,

  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,

  /**
   * How far apart the turns sit: `balanced` at full measure, `compact` for a
   * narrow pane or one thread among several.
   */
  density: PropTypes.oneOf(['balanced', 'compact'] as const),

  /**
   * Names the list for assistive technology ("Conversation with the
   * assistant"). Required: an unnamed list of turns is read as a bare list.
   */
  label: PropTypes.string.isRequired,
} as React.WeakValidationMap<ChatThreadProps>;
