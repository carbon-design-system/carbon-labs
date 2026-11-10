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

  /**
   * `divider` draws the text between two rules — a boundary in the
   * transcript, such as a date. It carries no severity: a boundary is not
   * something that went wrong.
   */
  variant?: 'default' | 'divider';
}

/**
 * Marks something that happened *to* the conversation — a model change, a
 * cleared context, a day boundary — without implying either party said it.
 * The companion to HistoryRail: the rail is the whole history at a glance,
 * and this is the same event in its place in the flow.
 */
export const SystemMessage = forwardRef<HTMLDivElement, SystemMessageProps>(
  function SystemMessage(
    { className, severity = 'status', text, variant = 'default', ...rest },
    ref
  ) {
    const prefix = usePrefix();
    const block = `${prefix}--system-message`;
    // A boundary has no severity, so the alert ink and glyph are not reachable
    // from the divider variant at all, rather than drawn and ignored.
    const alert = variant === 'default' && severity === 'alert';

    return (
      <div
        ref={ref}
        // Severity moves what is heard, not only what is seen: a notice that
        // cost the person work interrupts, and a fact about the conversation
        // waits its turn.
        role={alert ? 'alert' : 'status'}
        aria-live={alert ? 'assertive' : 'polite'}
        className={cx(
          block,
          `${block}--${variant}`,
          { [`${block}--alert`]: alert },
          className
        )}
        {...rest}>
        {variant === 'divider' ? (
          <span className={`${block}__rule`} aria-hidden="true" />
        ) : null}
        {alert ? (
          <WarningFilled size={16} className={`${block}__icon`} />
        ) : null}
        <span className={`${block}__text`}>{text}</span>
        {variant === 'divider' ? (
          <span className={`${block}__rule`} aria-hidden="true" />
        ) : null}
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

  /**
   * `divider` draws the text between two rules — a boundary in the
   * transcript, such as a date. It carries no severity: a boundary is not
   * something that went wrong.
   */
  variant: PropTypes.oneOf(['default', 'divider'] as const),
} as React.WeakValidationMap<SystemMessageProps>;
