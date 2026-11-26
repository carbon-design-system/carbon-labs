/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { usePrefix } from '@carbon/react';
import { WarningFilled } from '@carbon/icons-react';

export interface SystemMessageProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;

  /**
   * How much the notice is owed. `status` is a fact about the conversation —
   * a model change, a new session. `alert` is something that cost the person
   * work, and moves the ink, the glyph and what a screen reader hears
   * together.
   */
  severity?: 'status' | 'alert';

  /**
   * What happened, as plain text. Deliberately not a node: a notice is a fact
   * about the conversation, and anything richer starts to read as something a
   * party said.
   */
  text: string;
}

/**
 * Marks something that happened *to* the conversation — a model change, a
 * cleared context, a compaction, a day — without implying either party said
 * it. The companion to HistoryRail: the rail is the whole history at a glance,
 * and this is the same event in its place in the flow. It is the words only: a
 * boundary is a `ChatSection`, a Rule either side of one of these, so the text
 * can say anything without the rule being part of it.
 */
export const SystemMessage = forwardRef<HTMLDivElement, SystemMessageProps>(
  function SystemMessage(
    { className, severity = 'status', text, ...rest },
    ref
  ) {
    const prefix = usePrefix();
    const block = `${prefix}--system-message`;
    const alert = severity === 'alert';

    return (
      <div
        ref={ref}
        // Severity moves what is heard, not only what is seen: a notice that
        // cost the person work interrupts, and a fact about the conversation
        // waits its turn.
        role={alert ? 'alert' : 'status'}
        aria-live={alert ? 'assertive' : 'polite'}
        className={cx(block, { [`${block}--alert`]: alert }, className)}
        {...rest}>
        {alert ? (
          <WarningFilled size={16} className={`${block}__icon`} />
        ) : null}
        <span className={`${block}__text`}>{text}</span>
      </div>
    );
  }
);

SystemMessage.displayName = 'SystemMessage';

SystemMessage.propTypes = {
  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,

  /**
   * How much the notice is owed. `status` is a fact about the conversation —
   * a model change, a new session. `alert` is something that cost the person
   * work, and moves the ink, the glyph and what a screen reader hears
   * together.
   */
  severity: PropTypes.oneOf(['status', 'alert'] as const),

  /**
   * What happened, as plain text. Deliberately not a node: a notice is a fact
   * about the conversation, and anything richer starts to read as something a
   * party said.
   */
  text: PropTypes.string.isRequired,
} as React.WeakValidationMap<SystemMessageProps>;
