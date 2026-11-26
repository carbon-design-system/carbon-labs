/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { forwardRef, type ReactNode } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { usePrefix } from '@carbon/react';
import { Rule } from '@carbon-labs/react-rule';

export interface ChatSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The notice the section names, usually a SystemMessage: a date, a model
   * change, a compaction, a deletion. The section draws no text of its own, so
   * whatever the notice says is the notice's to say.
   */
  children?: ReactNode;

  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;
}

/**
 * A boundary in the transcript: a Rule either side of a notice. The rules are
 * the section's, the words are the notice's, so either can change without the
 * other. It is not a turn; the thread gives it a list item of its own.
 */
export const ChatSection = forwardRef<HTMLDivElement, ChatSectionProps>(
  function ChatSection({ children, className, ...rest }, ref) {
    const prefix = usePrefix();
    const block = `${prefix}--chat-section`;

    return (
      <div ref={ref} className={cx(block, className)} {...rest}>
        {/* Decorative: they flank the notice, which carries the meaning. */}
        <Rule aria-hidden="true" className={`${block}__rule`} />
        <div className={`${block}__content`}>{children}</div>
        <Rule aria-hidden="true" className={`${block}__rule`} />
      </div>
    );
  }
);

ChatSection.displayName = 'ChatSection';

ChatSection.propTypes = {
  /**
   * The notice the section names, usually a SystemMessage.
   */
  children: PropTypes.node as PropTypes.Validator<ReactNode>,

  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,
};
