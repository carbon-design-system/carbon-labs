/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  Children,
  cloneElement,
  isValidElement,
  type ElementType,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { SNAP_EXIT_FADE_ATTR } from '@carbon-labs/v12-motion';
import {
  type TooltipAlign,
  type TooltipAlignDeprecated,
} from '@carbon-labs/react-selection-kit';
import {
  chain,
  mergeRefs,
  useTooltipTrigger,
  type TooltipTriggerProps,
} from '@carbon-labs/v12-motion';
import { useStillTrigger } from './still';
import { elementRef } from '@carbon-labs/react-util';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import './tooltip.scss';
import { TOOLTIP_LEAVE_TEXT_MS } from './delays';

/* ============================================================================
 * Tooltip — Carbon v11's Tooltip, on the selection family's look and motion.
 * ============================================================================
 *
 * The same API as `@carbon/react`'s Tooltip: one child, the trigger, given
 * `aria-labelledby` (`label`) or `aria-describedby` (`description`);
 * `align` (v11's twelve, and its deprecated names), `enterDelayMs` (100),
 * `leaveDelayMs` (300), `defaultOpen`, `closeOnActivation`, and `autoAlign`
 * (v11 has it on Popover; here on every tooltip). Shows on hover and on
 * keyboard focus; Escape dismisses; the pointer can move onto the tooltip
 * without it leaving (WCAG 1.4.13).
 *
 * In the kit:
 *
 *   look      the selection kit's tooltip (`.sel__tip`): `$background-inverse`,
 *             4px corners (the ladder's small surface), no caret; a label in the compact look, a
 *             description wrapping at v11's 18rem
 *   motion    the snap: in from the pointer (from the trigger from the
 *             keyboard), growing over fast-01, its text riding it on fast-01;
 *             out, the far edge folds back into the trigger over fast-00
 *             (carbon-motion's SNAP.tooltip). It fades over fast-00, the
 *             fade standard; `exitFade={false}` leaves opaque; an
 *             interruption turns round where it is;
 *             a warm run and reduced motion, at once
 *   group     inside a `TooltipGroup`, triggers share one tooltip that jumps
 *             between them with its text changing in place
 *   place     `position: fixed` in its trigger's DOM: it escapes overflow and
 *             scroll containers and keeps its theme zone
 * ========================================================================== */

export interface TooltipProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'children'
> {
  /** The wrapper's element (v11's `as`). Default `span`. */
  as?: ElementType;
  /** Default `top` (or the enclosing TooltipGroup's). */
  align?: TooltipAlign | TooltipAlignDeprecated;
  /** Flip to stay in view (the viewport, cut down by scroll containers). */
  autoAlign?: boolean;
  /** The trigger: one element. */
  children?: ReactElement;
  className?: string;
  /** Close when the trigger is activated (click, Enter, Space). Default false (v11). */
  closeOnActivation?: boolean;
  defaultOpen?: boolean;
  /** Describes the trigger (`aria-describedby`). Ignored when `label` is given (v11). */
  description?: ReactNode;
  /** v11: accepted, not drawn (the kit's tooltip has no shadow). */
  dropShadow?: boolean;
  /** Default 100 (v11). */
  enterDelayMs?: number;
  /** v11: accepted; the kit's tooltip is always high contrast (inverse). */
  highContrast?: boolean;
  /** Names the trigger (`aria-labelledby`). */
  label?: ReactNode;
  /** Default 300 (v11). */
  leaveDelayMs?: number;
  /** The outlined surface: a 1px hairline, the inverse fill mixed 12% toward its text. Default none (or the enclosing `TooltipMotion`'s). */
  outline?: boolean;
  /**
   * The snap exit's fade (the fade standard). Default true, every snap exit's
   * (carbon-motion's `snapExitFades`). `false`: it folds back opaque and is
   * gone on its last frame.
   */
  exitFade?: boolean;
}

type ChildProps = Partial<Record<keyof TooltipTriggerProps, unknown>> & {
  ref?: Ref<HTMLElement>;
};

export function Tooltip({
  as: As = 'span',
  align,
  autoAlign,
  children,
  className,
  closeOnActivation = false,
  defaultOpen = false,
  description,
  dropShadow: _dropShadow,
  enterDelayMs = 100,
  highContrast: _highContrast,
  label,
  leaveDelayMs = TOOLTIP_LEAVE_TEXT_MS,
  outline,
  exitFade = true,
  ...rest
}: TooltipProps) {
  const { props: trigger, tooltip } = useTooltipTrigger({
    label,
    description,
    align,
    defaultAlign: 'top',
    autoAlign,
    enterDelayMs,
    leaveDelayMs,
    defaultOpen,
    closeOnActivation,
    outline,
  });

  // A hover that arrives under a pointer that has not moved waits for it to move (tooltip/still.ts).
  const gated = useStillTrigger(trigger);

  const child = Children.only(children);
  let clone: ReactNode = null;
  if (isValidElement<ChildProps>(child)) {
    const cp = child.props;
    type H = (e: never) => void;
    const on = (k: keyof TooltipTriggerProps) =>
      chain(
        (k === 'onPointerEnter' || k === 'onPointerLeave'
          ? gated[k]
          : trigger[k]) as H,
        cp[k] as H | undefined
      );
    clone = cloneElement(child, {
      ref: mergeRefs(elementRef<HTMLElement>(child), trigger.ref),
      onPointerEnter: on('onPointerEnter'),
      onPointerLeave: on('onPointerLeave'),
      onFocus: on('onFocus'),
      onBlur: on('onBlur'),
      onClick: on('onClick'),
      onKeyDown: on('onKeyDown'),
      // The child's own labelling wins (v11).
      'aria-labelledby': cp['aria-labelledby'] ?? trigger['aria-labelledby'],
      'aria-describedby': cp['aria-describedby'] ?? trigger['aria-describedby'],
      'data-tooltip-trigger': trigger['data-tooltip-trigger'],
    } as ChildProps);
  }

  return (
    <As
      {...rest}
      {...(exitFade ? null : { [SNAP_EXIT_FADE_ATTR]: 'false' })}
      className={['cds-tooltip', className].filter(Boolean).join(' ')}>
      {clone}
      {tooltip}
    </As>
  );
}
Tooltip.displayName = 'Tooltip';
