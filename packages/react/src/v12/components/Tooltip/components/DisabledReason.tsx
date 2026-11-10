/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type MutableRefObject,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import {
  useTooltipTrigger,
  type TooltipTriggerProps,
} from '@carbon-labs/v12-motion';
import type { TooltipAlign } from '@carbon-labs/react-selection-kit';
import { useStillTrigger } from './still';
import { TOOLTIP_LEAVE_TEXT_MS } from './delays';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import './tooltip.scss';

/* ============================================================================
 * Disabled with a reason: a disabled control that says why.
 *
 *   focus     the control keeps its place in the tab order (`aria-disabled`,
 *             never the `disabled` attribute), so the keyboard reaches it
 *   reason    a description tooltip on hover and keyboard focus, named by
 *             `aria-describedby`, so a screen reader reads it with the control
 *   blocked   a click, Enter or Space does nothing
 *   motion    the tooltip's own: its snap, its warm runs, reduced motion at once
 *
 * One hook for every control: `useDisabledReason(disabled, reason)`.
 * ========================================================================== */

export interface DisabledReasonOptions {
  /** The tooltip's side. Default `top`. */
  align?: TooltipAlign;
  /** Flip to stay in view. Default true. */
  autoAlign?: boolean;
}

type Handlers = Pick<
  TooltipTriggerProps,
  'onPointerEnter' | 'onPointerLeave' | 'onFocus' | 'onBlur'
>;

export interface DisabledReasonState {
  /** Disabled and given a reason: the control keeps focus and shows the reason. */
  active: boolean;
  /** The tooltip's id, for the control's `aria-describedby`. */
  id: string;
  /** On the element the tooltip is placed against and hovered on: the control's visible box. */
  anchorProps: {
    ref?: (el: HTMLElement | null) => void;
    onPointerEnter?: (e: PointerEvent<HTMLElement>) => void;
    onPointerLeave?: (e: PointerEvent<HTMLElement>) => void;
  };
  /** On the focusable element. Empty when not active. */
  controlProps: {
    'aria-disabled'?: true;
    onFocus?: (e: FocusEvent<HTMLElement>) => void;
    onBlur?: (e: FocusEvent<HTMLElement>) => void;
    onClick?: (e: MouseEvent<HTMLElement>) => void;
    onKeyDown?: (e: KeyboardEvent<HTMLElement>) => void;
  };
  /** `aria-describedby` with the reason joined to the control's own ids. */
  describedBy: (own?: string) => string | undefined;
  /** Render beside the control, never inside a button (its text would join the name). */
  tooltip: ReactNode;
}

/** A reason worth showing: any text. */
const hasReason = (reason: string | undefined): reason is string => !!reason;

/** Call each handler given, in order (any may be missing). */
export function joinHandlers<E>(
  ...fns: (((e: E) => void) | null | undefined)[]
): (e: E) => void {
  return (e) => {
    for (const f of fns) f?.(e);
  };
}

/** Activation keys: a click from the keyboard. */
const ACTIVATES = new Set(['Enter', ' ']);

/** Disabled with a reason, for any control: `controlProps` on the focusable element (no `disabled`
 * while `active`), `anchorProps` on its visible box, `describedBy`, and `tooltip` beside it. */
export function useDisabledReason(
  disabled: boolean | undefined,
  reason: string | undefined,
  options: DisabledReasonOptions = {}
): DisabledReasonState {
  const active = !!disabled && hasReason(reason);
  const id = `cds-disabled-reason-${useId().replace(/:/g, '')}`;
  const anchorRef = useRef<HTMLElement | null>(null);
  const bridgeRef = useRef<Handlers | null>(null);
  if (!active) return INACTIVE;

  type E = never;
  return {
    active,
    id,
    anchorProps: {
      ref: (el) => void (anchorRef.current = el),
      onPointerEnter: (e) => bridgeRef.current?.onPointerEnter(e as E),
      onPointerLeave: (e) => bridgeRef.current?.onPointerLeave(e as E),
    },
    controlProps: {
      'aria-disabled': true,
      onFocus: (e) => bridgeRef.current?.onFocus(e as E),
      onBlur: (e) => bridgeRef.current?.onBlur(e as E),
      // A native checkbox's click flips it; preventing the default puts it back.
      onClick: (e) => e.preventDefault(),
      onKeyDown: (e) => {
        if (ACTIVATES.has(e.key)) e.preventDefault();
      },
    },
    describedBy: (own) => [own, id].filter(Boolean).join(' '),
    tooltip: (
      <ReasonPlace anchorRef={anchorRef}>
        <ReasonTip
          id={id}
          reason={reason!}
          anchorRef={anchorRef}
          bridgeRef={bridgeRef}
          align={options.align}
          autoAlign={options.autoAlign ?? true}
        />
      </ReasonPlace>
    ),
  };
}

/** A control with no reason: nothing to add, the same object every render. */
const INACTIVE: DisabledReasonState = {
  active: false,
  id: '',
  anchorProps: {},
  controlProps: {},
  describedBy: (own) => own || undefined,
  tooltip: null,
};

/** Roles that own only their items: a reason's tooltip goes beside them, not in them. */
const OWNERS =
  '[role="menu"], [role="menubar"], [role="tablist"], [role="listbox"], [role="tree"], [role="grid"]';

/** Where the tooltip goes: beside the control, or just outside a list that owns only its items.
 * Mounted only while a reason shows, so a control without one runs no effect. */
function ReasonPlace({
  anchorRef,
  children,
}: {
  anchorRef: MutableRefObject<HTMLElement | null>;
  children: ReactNode;
}) {
  const [host, setHost] = useState<{ el: Element | null }>();
  // Read from the DOM once it's laid out, before paint: the tooltip mounts on the next render.
  useLayoutEffect(() => {
    const el = anchorRef.current?.closest(OWNERS)?.parentElement ?? null;
    setHost({ el });
  }, [anchorRef]);
  if (!host) return null;
  return host.el ? createPortal(children, host.el) : children;
}

/** The tooltip, mounted only while a reason shows, so a control without one carries none. */
function ReasonTip({
  id,
  reason,
  anchorRef,
  bridgeRef,
  align,
  autoAlign,
}: {
  id: string;
  reason: string;
  anchorRef: MutableRefObject<HTMLElement | null>;
  bridgeRef: MutableRefObject<Handlers | null>;
  align?: TooltipAlign;
  autoAlign: boolean;
}) {
  const { props: trigger, tooltip } = useTooltipTrigger({
    id,
    description: reason,
    align,
    autoAlign,
    enterDelayMs: 100,
    leaveDelayMs: TOOLTIP_LEAVE_TEXT_MS,
    // Its own surface: in a group, the group's tooltip is the controls' names.
    group: false,
  });
  // A hover that arrives under a pointer that hasn't moved waits for it to move (still.ts).
  const gated = useStillTrigger(trigger);
  useLayoutEffect(() => {
    trigger.ref(anchorRef.current);
    bridgeRef.current = {
      onPointerEnter: gated.onPointerEnter,
      onPointerLeave: gated.onPointerLeave,
      onFocus: trigger.onFocus,
      onBlur: trigger.onBlur,
    };
  });
  useLayoutEffect(
    () => () => {
      bridgeRef.current = null;
    },
    [bridgeRef]
  );
  return tooltip;
}
