/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { forwardRef, useId, useState, type ReactNode } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Loading, usePrefix } from '@carbon/react';
import { ChevronDown, ChevronRight, ErrorFilled } from '@carbon/icons-react';

export type ReasoningStepStatus = 'done' | 'running' | 'failed';

export interface ReasoningStepTranslations {
  running: string;
  failed: string;
}

export interface ReasoningStepProps extends Omit<
  React.LiHTMLAttributes<HTMLLIElement>,
  'children'
> {
  /**
   * What the step found or did, shown when it is expanded. A step without one
   * has no disclosure.
   */
  children?: ReactNode;

  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;

  /**
   * Open on mount (uncontrolled).
   */
  defaultExpanded?: boolean;

  /**
   * Show the detail (controlled). Pair with `onExpandedChange`.
   */
  expanded?: boolean;

  /**
   * What the agent did, in the past tense once it is done ("Read files"), in
   * the present while it runs ("Reading files").
   */
  label: ReactNode;

  /**
   * Called when the step is opened or closed.
   */
  onExpandedChange?: (expanded: boolean) => void;

  /**
   * `done` sits quietly; `running` is the live step, with Carbon's small
   * Loading; `failed` carries ErrorFilled.
   */
  status?: ReasoningStepStatus;

  /**
   * The words read out for a status, for translation.
   */
  translations?: Partial<ReasoningStepTranslations>;
}

const defaultTranslations: ReasoningStepTranslations = {
  running: 'In progress',
  failed: 'Failed',
};

/**
 * One step in a ReasoningTrace. Done steps are secondary text; the running
 * step is primary text with Carbon's small Loading, so the live step reads as
 * live rather than disabled; a failed step says so in words as well as with
 * the icon. A step with detail opens to show it.
 */
export const ReasoningStep = forwardRef<HTMLLIElement, ReasoningStepProps>(
  function ReasoningStep(
    {
      children,
      className,
      defaultExpanded = false,
      expanded: expandedProp,
      label,
      onExpandedChange,
      status = 'done',
      translations,
      ...rest
    },
    ref
  ) {
    const prefix = usePrefix();
    const block = `${prefix}--reasoning-step`;
    const t = { ...defaultTranslations, ...translations };
    const detailId = useId();
    const [expandedState, setExpandedState] = useState(defaultExpanded);
    const expanded = expandedProp ?? expandedState;
    const hasDetail = children !== undefined && children !== null;

    function toggle() {
      const next = !expanded;
      if (expandedProp === undefined) {
        setExpandedState(next);
      }
      onExpandedChange?.(next);
    }

    const statusMark =
      status === 'running' ? (
        <Loading
          small
          withOverlay={false}
          description={t.running}
          className={`${block}__status`}
        />
      ) : status === 'failed' ? (
        <>
          <ErrorFilled
            size={16}
            className={`${block}__status ${block}__status--failed`}
            aria-hidden="true"
          />
          <span className={`${prefix}--visually-hidden`}>{t.failed}: </span>
        </>
      ) : null;

    const Chevron = expanded ? ChevronDown : ChevronRight;

    return (
      <li
        ref={ref}
        className={cx(block, `${block}--${status}`, className)}
        {...rest}>
        <div className={`${block}__line`}>
          {statusMark}
          {hasDetail ? (
            <button
              type="button"
              className={`${block}__toggle`}
              aria-expanded={expanded}
              aria-controls={detailId}
              onClick={toggle}>
              <span className={`${block}__label`}>{label}</span>
              <Chevron
                size={16}
                className={`${block}__chevron`}
                aria-hidden="true"
              />
            </button>
          ) : (
            <span className={`${block}__label`}>{label}</span>
          )}
        </div>
        {hasDetail ? (
          <div id={detailId} className={`${block}__detail`} hidden={!expanded}>
            {children}
          </div>
        ) : null}
      </li>
    );
  }
);

ReasoningStep.displayName = 'ReasoningStep';

ReasoningStep.propTypes = {
  /**
   * What the step found or did, shown when it is expanded. A step without one
   * has no disclosure.
   */
  children: PropTypes.node,

  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,

  /**
   * Open on mount (uncontrolled).
   */
  defaultExpanded: PropTypes.bool,

  /**
   * Show the detail (controlled). Pair with `onExpandedChange`.
   */
  expanded: PropTypes.bool,

  /**
   * What the agent did, in the past tense once it is done ("Read files"), in
   * the present while it runs ("Reading files").
   */
  label: PropTypes.node.isRequired,

  /**
   * Called when the step is opened or closed.
   */
  onExpandedChange: PropTypes.func,

  /**
   * `done` sits quietly; `running` is the live step, with Carbon's small
   * Loading; `failed` carries ErrorFilled.
   */
  status: PropTypes.oneOf(['done', 'running', 'failed'] as const),

  /**
   * The words read out for a status, for translation.
   */
  translations: PropTypes.shape({
    running: PropTypes.string,
    failed: PropTypes.string,
  }),
} as React.WeakValidationMap<ReasoningStepProps>;
