/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {
  Children,
  forwardRef,
  isValidElement,
  useId,
  useState,
  type ReactNode,
} from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { usePrefix } from '@carbon/react';
import { ChevronDown, ChevronRight, Maximize } from '@carbon/icons-react';
import { ReasoningStep } from './ReasoningStep';
import { ThinkingIndicator } from './ThinkingIndicator';

export type ReasoningTraceStatus = 'running' | 'complete';

export interface ReasoningTraceProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  /**
   * What the trace shows when open: ReasoningSteps, which sit in a card, or
   * other content such as a CodeSnippet, which brings its own.
   */
  children?: ReactNode;

  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;

  /**
   * Open on mount (uncontrolled).
   */
  defaultOpen?: boolean;

  /**
   * The id of the region `onViewDetails` opens, for `aria-controls`.
   */
  detailsControls?: string;

  /**
   * The footer's words: "Planning…" while it runs, "View plan details" when
   * it is done. Shown only with `onViewDetails`.
   */
  detailsLabel?: string;

  /**
   * Whether the region `onViewDetails` opens is open, for `aria-expanded`.
   */
  detailsOpen?: boolean;

  /**
   * How long it took or has taken so far (`22s`, `1m 48s`).
   */
  duration?: string;

  /**
   * What happened, in a word or two: "Thinking", "Complete", "Running",
   * "Used tool".
   */
  label: string;

  /**
   * Called when the trace is opened or closed.
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Opens the full trace (the PlanCanvas). Adds the footer button.
   */
  onViewDetails?: () => void;

  /**
   * Show the content (controlled). Pair with `onOpenChange`.
   */
  open?: boolean;

  /**
   * `running` while the agent works, `complete` once it has finished. The
   * change is announced.
   */
  status?: ReasoningTraceStatus;

  /**
   * What the trace is about, named in the header: an InlineCode for a file or
   * a tool (`page.py`, `carbon-mcp`).
   */
  subject?: ReactNode;

  /**
   * Lead with the thinking animation. On by default while running; turn it
   * off for a running tool or code step. A finished trace never shows it.
   */
  thinking?: boolean;
}

/**
 * An agent's reasoning, tool use or code, as a disclosure: a header that says
 * what happened and how long it took, and, when open, the steps in a card or
 * the code it ran. While the agent thinks the header leads with the
 * ThinkingIndicator; once it resolves the header sits flush, with no icon.
 */
export const ReasoningTrace = forwardRef<HTMLDivElement, ReasoningTraceProps>(
  function ReasoningTrace(
    {
      children,
      className,
      defaultOpen = false,
      detailsControls,
      detailsLabel,
      detailsOpen,
      duration,
      label,
      onOpenChange,
      onViewDetails,
      open: openProp,
      status = 'complete',
      subject,
      thinking,
      ...rest
    },
    ref
  ) {
    const prefix = usePrefix();
    const block = `${prefix}--reasoning-trace`;
    const panelId = useId();
    const [openState, setOpenState] = useState(defaultOpen);
    const open = openProp ?? openState;
    const showThinking = status === 'running' && (thinking ?? true);

    const items = Children.toArray(children);
    const isStepList =
      items.length > 0 &&
      items.every(
        (item) => isValidElement(item) && item.type === ReasoningStep
      );

    function toggle() {
      const next = !open;
      if (openProp === undefined) {
        setOpenState(next);
      }
      onOpenChange?.(next);
    }

    const Chevron = open ? ChevronDown : ChevronRight;
    const footer = onViewDetails ? (
      <button
        type="button"
        className={`${block}__details`}
        aria-expanded={detailsOpen}
        aria-controls={detailsControls}
        onClick={onViewDetails}>
        <span className={`${block}__details-label`}>
          {detailsLabel ??
            (status === 'running' ? 'Planning…' : 'View plan details')}
        </span>
        <Maximize
          size={16}
          className={`${block}__details-icon`}
          aria-hidden="true"
        />
      </button>
    ) : null;

    return (
      <div
        ref={ref}
        className={cx(block, `${block}--${status}`, className)}
        {...rest}>
        <button
          type="button"
          className={`${block}__header`}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={toggle}>
          {showThinking ? <ThinkingIndicator /> : null}
          <span className={`${block}__label`}>{label}</span>
          {subject ? (
            <span className={`${block}__subject`}>{subject}</span>
          ) : null}
          {duration ? (
            <span className={`${block}__duration`}>{duration}</span>
          ) : null}
          <Chevron
            size={16}
            className={`${block}__chevron`}
            aria-hidden="true"
          />
        </button>
        {/* The header's words change from "Thinking" to "Complete"; a
            status region says so, since a name change is not announced. */}
        <span className={`${prefix}--visually-hidden`} aria-live="polite">
          {status === 'complete'
            ? [label, duration].filter(Boolean).join(', ')
            : ''}
        </span>
        <div
          id={panelId}
          className={cx(`${block}__panel`, {
            [`${block}__panel--open`]: open,
          })}>
          <div className={`${block}__panel-inner`}>
            {isStepList ? (
              <div className={`${block}__card`}>
                <ol className={`${block}__steps`}>{items}</ol>
                {footer}
              </div>
            ) : (
              <>
                {children}
                {footer}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ReasoningTrace.displayName = 'ReasoningTrace';

ReasoningTrace.propTypes = {
  /**
   * What the trace shows when open: ReasoningSteps, which sit in a card, or
   * other content such as a CodeSnippet, which brings its own.
   */
  children: PropTypes.node,

  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,

  /**
   * Open on mount (uncontrolled).
   */
  defaultOpen: PropTypes.bool,

  /**
   * The id of the region `onViewDetails` opens, for `aria-controls`.
   */
  detailsControls: PropTypes.string,

  /**
   * The footer's words: "Planning…" while it runs, "View plan details" when
   * it is done. Shown only with `onViewDetails`.
   */
  detailsLabel: PropTypes.string,

  /**
   * Whether the region `onViewDetails` opens is open, for `aria-expanded`.
   */
  detailsOpen: PropTypes.bool,

  /**
   * How long it took or has taken so far (`22s`, `1m 48s`).
   */
  duration: PropTypes.string,

  /**
   * What happened, in a word or two: "Thinking", "Complete", "Running",
   * "Used tool".
   */
  label: PropTypes.string.isRequired,

  /**
   * Called when the trace is opened or closed.
   */
  onOpenChange: PropTypes.func,

  /**
   * Opens the full trace (the PlanCanvas). Adds the footer button.
   */
  onViewDetails: PropTypes.func,

  /**
   * Show the content (controlled). Pair with `onOpenChange`.
   */
  open: PropTypes.bool,

  /**
   * `running` while the agent works, `complete` once it has finished. The
   * change is announced.
   */
  status: PropTypes.oneOf(['running', 'complete'] as const),

  /**
   * What the trace is about, named in the header: an InlineCode for a file or
   * a tool (`page.py`, `carbon-mcp`).
   */
  subject: PropTypes.node,

  /**
   * Lead with the thinking animation. On by default while running; turn it
   * off for a running tool or code step. A finished trace never shows it.
   */
  thinking: PropTypes.bool,
} as React.WeakValidationMap<ReasoningTraceProps>;
