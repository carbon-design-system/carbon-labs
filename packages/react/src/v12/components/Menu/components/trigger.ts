/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  useMemo,
  useState,
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {
  chain,
  mergeRefs,
  useTooltipTrigger,
  type SelectionMoveInfo,
} from '@carbon-labs/v12-motion';
import type {
  SelectionLoadingProps,
  TooltipAlign,
  TooltipAlignDeprecated,
} from '@carbon-labs/react-selection-kit';
import {
  TOOLTIP_LEAVE_LABEL_MS,
  useStillTrigger,
} from '@carbon-labs/react-tooltip';
import type { MenuAlignment, MenuMotion, MenuStyleProps } from './Menu';
import type { MenuSize } from './menu-size';

/* ============================================================================
 * The menu triggers' shared parts: MenuButton, OverflowMenu and ComboButton.
 *
 *   props     one type for what every trigger passes to its Menu: its items,
 *             size, placement, portal, motion and the menu's look (its
 *             `variant` is each trigger's own: the button's look on
 *             MenuButton and ComboButton, the menu's on OverflowMenu)
 *   tooltip   an icon-only trigger (OverflowMenu, ComboButton's chevron) is
 *             named by its label in Carbon's tooltip (`aria-labelledby`), as
 *             v11's IconButton: shown on hover and keyboard focus, closed on
 *             activation, never while the trigger is disabled or its menu is
 *             open
 * ========================================================================== */

/** What MenuButton, OverflowMenu and ComboButton share: the trigger and its Menu. */
export interface MenuTriggerProps
  extends Omit<MenuStyleProps, 'variant'>, SelectionLoadingProps {
  /** MenuItems. */
  children?: ReactNode;
  /** The trigger's size, and its menu's (an xs trigger opens an sm menu). */
  size?: MenuSize;
  /** The menu's own size, when it differs from the trigger's. */
  menuSize?: MenuSize;
  /** Where the menu opens against the trigger. Default `bottom-start`. */
  menuAlignment?: MenuAlignment;
  disabled?: boolean;
  /** Where the menu is portalled. */
  menuTarget?: Element | null;
  /** The menu's snap starts at the press point (default) or the trigger's center. */
  openFrom?: 'pointer' | 'trigger';
  motion?: Partial<MenuMotion>;
  /** Slow motion: multiplies the durations. Default 1. Wins over `motion.timeScale`. */
  timeScale?: number;
  onMove?: (info: SelectionMoveInfo) => void;
  /** The menu opened. */
  onOpen?: () => void;
  /** The menu closed. */
  onClose?: () => void;
}

/** An icon-only trigger's tooltip (v11's OverflowMenu and ComboButton props). */
export interface MenuTriggerTooltipProps {
  /** Where the trigger's tooltip shows. Default `top`. */
  tooltipAlignment?: TooltipAlign | TooltipAlignDeprecated;
  /** Flip the tooltip to stay in view. */
  tooltipAutoAlign?: boolean;
}

type H = (e: never) => void;

/** The handlers an icon trigger's tooltip chains ahead of the caller's. */
interface TriggerHandlers {
  onPointerEnter?: (e: PointerEvent<HTMLButtonElement>) => void;
  onPointerLeave?: (e: PointerEvent<HTMLButtonElement>) => void;
  onFocus?: (e: FocusEvent<HTMLButtonElement>) => void;
  onBlur?: (e: FocusEvent<HTMLButtonElement>) => void;
}

/**
 * An icon trigger's tooltip: the props for its button (its ref, name and
 * handlers, chained ahead of the caller's and the menu trigger's) and the
 * tooltip to render beside it (fixed, out of flow).
 */
export function useTriggerTooltip(o: {
  label: ReactNode;
  /** The trigger is disabled or its menu is open: no tooltip. */
  off: boolean;
  align?: TooltipAlign | TooltipAlignDeprecated;
  autoAlign?: boolean;
  /** The button's own ref (the menu trigger's `setButton`). */
  buttonRef: Ref<HTMLButtonElement>;
  /** The caller's handlers. */
  own: TriggerHandlers;
  /** The menu trigger's handlers. */
  menu: {
    onClick: H;
    onKeyDown: H;
    onPointerDown: H;
  };
}) {
  const { props: trigger, tooltip } = useTooltipTrigger({
    label: o.label,
    align: o.align,
    autoAlign: o.autoAlign,
    enterDelayMs: 100,
    leaveDelayMs: TOOLTIP_LEAVE_LABEL_MS,
    closeOnActivation: true,
    disabled: o.off,
  });
  // A trigger that comes under a resting pointer shows no tooltip until it moves.
  const gated = useStillTrigger(trigger);
  // One stable ref: the tooltip's only records the element.
  const [tipRef] = useState(() => trigger.ref);
  const { buttonRef } = o;
  const ref = useMemo(
    () => mergeRefs<HTMLButtonElement>(tipRef, buttonRef),
    [tipRef, buttonRef]
  );
  return {
    tooltip,
    props: {
      ref,
      'aria-labelledby': trigger['aria-labelledby'],
      'data-tooltip-trigger': trigger['data-tooltip-trigger'],
      onPointerEnter: chain(gated.onPointerEnter as H, o.own.onPointerEnter),
      onPointerLeave: chain(gated.onPointerLeave as H, o.own.onPointerLeave),
      onFocus: chain(trigger.onFocus as H, o.own.onFocus),
      onBlur: chain(trigger.onBlur as H, o.own.onBlur),
      onPointerDown: o.menu.onPointerDown,
      onClick: chain(trigger.onClick as H, o.menu.onClick),
      onKeyDown: chain(trigger.onKeyDown as H, o.menu.onKeyDown),
    },
  };
}
