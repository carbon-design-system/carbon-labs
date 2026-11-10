/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ElementType,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { attachRollover } from '@carbon-labs/v12-motion';
import { useMergedRef } from '@carbon-labs/react-popover';
import { Information } from '@carbon-labs/react-motion-icons';
import { useLatest } from '@carbon-labs/react-selection-kit';
import {
  Popover,
  PopoverContent,
  POPOVER_CONTENT,
  type PopoverProps,
} from '@carbon-labs/react-popover';
import './toggletip.scss';
import { useReducedGetter } from '@carbon-labs/react-util';
import { isComposing } from '@carbon-labs/react-util';

/* ============================================================================
 * Toggletip — Carbon v11's Toggletip, ToggletipLabel, ToggletipButton,
 * ToggletipContent and ToggletipActions on the kit's Popover.
 * ============================================================================
 *
 * A button that opens a small high-contrast panel whose content can hold
 * links and buttons — where a tooltip can't, since a tooltip's content isn't
 * interactive. The same API as `@carbon/react`'s:
 *
 *   Toggletip         the container: `align`, `autoAlign`, `as`,
 *                     `defaultOpen`, `className`, and the Popover's props
 *                     (v11 spreads them onto its Popover: `dropShadow`
 *                     …). High contrast, no caret, no shadow
 *   ToggletipButton   toggles it: `aria-expanded`, `aria-controls`, and
 *                     `aria-describedby` while open; `label` its accessible
 *                     name (default "Show information"); `as` a non-button
 *                     (then only the click). Its icon defaults to the
 *                     Information motion icon, which plays on hover
 *   ToggletipContent  the panel's content (an `id` for the button)
 *   ToggletipActions  one or two actions at its foot
 *   ToggletipLabel    a label beside the button (`as`)
 *
 *   open / close   a click on the button toggles it; Escape (on the button
 *                  or inside) closes it and returns focus to the button; a
 *                  press outside, focus leaving or the window losing focus
 *                  closes it. Tab goes from the button into the content
 *   motion         the Popover's: the floating snap from the press on the
 *                  button (from its center by keyboard), the content riding
 *                  the frame on y; out by the far edge folding back. Reduced
 *                  motion: there and gone at once
 *   button         the sm ghost IconButton's hit area and fill round the
 *                  16px icon in its 16px box: a 32px hit area, the
 *                  rollover in a 26px full-round fill (a neutral glow,
 *                  grown 1px on hover, a press back to rest, the release);
 *                  keyboard focus a ring in the icon's color on the fill's
 *                  edge; while open, the selected fill
 * ========================================================================== */

interface ToggletipContextValue {
  open: boolean;
  id: string;
  toggle: () => void;
}

const ToggletipContext = createContext<ToggletipContextValue | null>(null);

/* ── Toggletip ────────────────────────────────────────────────────────── */

export interface ToggletipProps extends Omit<
  PopoverProps,
  'open' | 'children' | 'anchor' | 'label' | 'onClose'
> {
  /** Open on first render (v11). */
  defaultOpen?: boolean;
  children?: ReactNode;
}

export const Toggletip = forwardRef<HTMLElement, ToggletipProps>(
  function Toggletip(
    {
      align,
      as,
      autoAlign,
      className,
      children,
      defaultOpen = false,
      onKeyDown,
      ...rest
    },
    forwardedRef
  ) {
    const [open, setOpen] = useState(defaultOpen);
    const id = `cds-toggletip-${useId().replace(/:/g, '')}`;
    const ref = useRef<HTMLElement>(null);
    const containerRef = useMergedRef(ref, forwardedRef);
    const latest = useLatest(open);

    // The window losing focus closes it (v11).
    useEffect(() => {
      if (!open) return;
      const onBlur = () => setOpen(false);
      window.addEventListener('blur', onBlur);
      return () => window.removeEventListener('blur', onBlur);
    }, [open]);

    const context = useMemo(
      () => ({ open, id, toggle: () => setOpen((o) => !o) }),
      [open, id]
    );

    // Escape, on the button or inside: closed, focus back on the button (v11).
    const onKey = (e: ReactKeyboardEvent<HTMLElement>) => {
      onKeyDown?.(e);
      if (!latest.current || e.key !== 'Escape' || isComposing(e)) return;
      e.stopPropagation();
      e.preventDefault();
      setOpen(false);
      ref.current?.querySelector<HTMLElement>('.cds-toggletip-button')?.focus();
    };

    return (
      <ToggletipContext.Provider value={context}>
        <Popover
          align={align}
          as={as}
          autoAlign={autoAlign}
          highContrast
          {...rest}
          ref={containerRef}
          open={open}
          onRequestClose={() => setOpen(false)}
          onKeyDown={onKey}
          className={['cds-toggletip', open && 'cds-toggletip--open', className]
            .filter(Boolean)
            .join(' ')}>
          {children}
        </Popover>
      </ToggletipContext.Provider>
    );
  }
);
Toggletip.displayName = 'Toggletip';

/* ── ToggletipButton ──────────────────────────────────────────────────── */

export interface ToggletipButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** A non-button element (then only its click toggles, as v11). */
  as?: ElementType;
  /** The icon. Default the Information motion icon. */
  children?: ReactNode;
  className?: string;
  /** Its accessible name. Default "Show information" (v11). */
  label?: string;
}

export const ToggletipButton = forwardRef<
  HTMLButtonElement,
  ToggletipButtonProps
>(function ToggletipButton(
  { as, children, className, label = 'Show information', ...rest },
  ref
) {
  const ctx = useContext(ToggletipContext);
  const own = useRef<HTMLButtonElement | null>(null);
  const buttonRef = useMergedRef<HTMLButtonElement>(own, ref);
  const rolloverReduced = useReducedGetter();
  const classes = [
    'cds-toggletip-button',
    ctx?.open && 'cds-toggletip-button--open',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const icon = children ?? <Information size={16} />;

  // The rollover: hover glow (the fill 1px out), a press back to rest, release.
  useEffect(() => {
    const el = own.current;
    if (!el || as) return;
    const detach = attachRollover(el, {
      selector: '.cds-toggletip-button',
      reduced: rolloverReduced,
    });
    return () => detach();
  }, [as, rolloverReduced]);

  if (as) {
    const As = as;
    return (
      <As {...rest} className={classes} onClick={ctx?.toggle}>
        {icon}
      </As>
    );
  }
  return (
    <button
      aria-expanded={ctx?.open ?? false}
      aria-controls={ctx?.id}
      aria-describedby={ctx?.open ? ctx.id : undefined}
      aria-label={label}
      type="button"
      data-motion-icon-frame=""
      {...rest}
      ref={buttonRef}
      className={classes}
      onClick={(e) => {
        ctx?.toggle();
        rest.onClick?.(e);
      }}>
      {icon}
    </button>
  );
});
ToggletipButton.displayName = 'ToggletipButton';

/* ── ToggletipContent / Actions / Label ───────────────────────────────── */

export interface ToggletipContentProps {
  children?: ReactNode;
  className?: string;
}

export const ToggletipContent = forwardRef<HTMLElement, ToggletipContentProps>(
  function ToggletipContent({ children, className }, ref) {
    const ctx = useContext(ToggletipContext);
    return (
      <PopoverContent className={className} id={ctx?.id} ref={ref}>
        <span className="cds-toggletip-content">{children}</span>
      </PopoverContent>
    );
  }
);
ToggletipContent.displayName = 'ToggletipContent';
(ToggletipContent as unknown as Record<symbol, boolean>)[POPOVER_CONTENT] =
  true;

export interface ToggletipActionsProps {
  children?: ReactNode;
  className?: string;
}

export function ToggletipActions({
  children,
  className,
}: ToggletipActionsProps) {
  return (
    <span
      className={['cds-toggletip-actions', className]
        .filter(Boolean)
        .join(' ')}>
      {children}
    </span>
  );
}
ToggletipActions.displayName = 'ToggletipActions';

export interface ToggletipLabelProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  children?: ReactNode;
  className?: string;
}

export function ToggletipLabel({
  as: As = 'span',
  children,
  className,
  ...rest
}: ToggletipLabelProps) {
  return (
    <As
      {...rest}
      className={['cds-toggletip-label', className].filter(Boolean).join(' ')}>
      {children}
    </As>
  );
}
ToggletipLabel.displayName = 'ToggletipLabel';
