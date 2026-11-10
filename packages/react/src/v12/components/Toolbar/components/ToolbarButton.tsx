/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ElementType,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { deriveLightnessColors } from '@carbon-labs/v12-motion';
import {
  MenuItem,
  MenuItemDivider,
  MenuItemSelectable,
} from '@carbon-labs/react-menu';
import { useStillTrigger } from '@carbon-labs/react-tooltip';
import { useLatest } from '@carbon-labs/react-selection-kit';
import { chain, mergeRefs, useTooltipTrigger } from '@carbon-labs/v12-motion';
import { ToggleGroupContext, iconPx, useToolbar } from './context';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import '@carbon-labs/react-tooltip/scss/tooltip.scss';
import './toolbar.scss';
import { TOOLTIP_LEAVE_LABEL_MS } from '@carbon-labs/react-tooltip';

/* ============================================================================
 * ToolbarButton, ToolbarToggle, ToolbarDivider and the control they are drawn
 * as (ToolbarControl, also the more button).
 *
 *   look      the ghost IconButton (`.cds-icon-btn--ghost`): 16px icons, 20 at lg
 *   tooltip   an icon control's label is its tooltip and its name
 *   focus     one stop of the toolbar's roving tab stop (`data-toolbar-stop`)
 *   pressed   a toggle's fill is the variant's selector: in fast-02, out fast-01
 *   overflow  each control registers the menu item it becomes in the more menu
 * ========================================================================== */

/** The event a toolbar action gets: a click on the button, or its menu item's activation once it overflows. */
export type ToolbarActionEvent =
  | ReactMouseEvent<HTMLElement>
  | ReactKeyboardEvent<HTMLElement>;

interface ToolbarControlProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  /** The tooltip and the name (an icon control), or the visible text. */
  label: string;
  /** A motion icon; it plays on the control's hover. */
  renderIcon?: ElementType;
  /** The icon as an element, instead of `renderIcon`. */
  icon?: ReactNode;
  /** Show the label beside the icon (no tooltip then). */
  showLabel?: boolean;
  /** A toggle: `aria-pressed` and the pressed fill. */
  toggle?: boolean;
  pressed?: boolean;
  /** Keep the tooltip closed (the "more" button while its menu is open). */
  noTooltip?: boolean;
  buttonRef?: Ref<HTMLButtonElement>;
}

/** A toolbar control: a ghost icon button (or a labelled one), its tooltip in the toolbar's group, one stop of its roving focus. */
export function ToolbarControl({
  label,
  renderIcon: Icon,
  icon,
  showLabel = false,
  toggle = false,
  pressed = false,
  noTooltip = false,
  buttonRef,
  disabled = false,
  className,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  onClick,
  onKeyDown,
  ...rest
}: ToolbarControlProps) {
  const tb = useToolbar();
  const size = tb?.size ?? 'md';
  const hasIcon = !!Icon || icon != null;
  const iconOnly = hasIcon && !showLabel;
  const { props: trigger, tooltip } = useTooltipTrigger({
    label: iconOnly ? label : undefined,
    enterDelayMs: 100,
    leaveDelayMs: TOOLTIP_LEAVE_LABEL_MS,
    closeOnActivation: true,
    disabled: disabled || !iconOnly || noTooltip,
  });
  // A button that comes under a resting pointer shows no tooltip until it moves.
  const gated = useStillTrigger(trigger);

  // One stable ref for the button: the tooltip's (it only records the
  // element, so its first callback serves for good) and the caller's.
  const [triggerRef] = useState(() => trigger.ref);
  const setRef = useMemo(
    () => mergeRefs<HTMLButtonElement>(triggerRef, buttonRef),
    [triggerRef, buttonRef]
  );

  type H = (e: never) => void;
  return (
    <>
      <button
        type="button"
        {...rest}
        ref={setRef}
        // The toolbar sets the one stop to 0 (React leaves it alone while this stays -1).
        tabIndex={-1}
        data-toolbar-stop=""
        {...(hasIcon ? { 'data-motion-icon-frame': '' } : null)}
        className={[
          'cds-icon-btn',
          'cds-icon-btn--ghost',
          `cds-icon-btn--${size}`,
          'cds-toolbar__ctl',
          toggle && 'cds-toolbar__ctl--toggle',
          !iconOnly && 'cds-toolbar__ctl--text',
          disabled && 'cds-icon-btn--disabled',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        disabled={disabled}
        aria-pressed={toggle ? pressed : undefined}
        aria-labelledby={rest['aria-labelledby'] ?? trigger['aria-labelledby']}
        data-tooltip-trigger={trigger['data-tooltip-trigger']}
        onPointerEnter={chain(gated.onPointerEnter as H, onPointerEnter as H)}
        onPointerLeave={chain(gated.onPointerLeave as H, onPointerLeave as H)}
        onFocus={chain(trigger.onFocus as H, onFocus as H)}
        onBlur={chain(trigger.onBlur as H, onBlur as H)}
        onClick={chain(trigger.onClick as H, onClick as H)}
        onKeyDown={chain(trigger.onKeyDown as H, onKeyDown as H)}>
        {Icon ? <Icon size={iconPx(size)} aria-hidden="true" /> : icon}
        {!iconOnly && <span className="cds-toolbar__label">{label}</span>}
      </button>
      {tooltip}
    </>
  );
}

/* ── ToolbarButton ─────────────────────────────────────────────────────── */

export interface ToolbarButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'onClick'
> {
  /** The tooltip and the accessible name; the visible text of a labelled button. */
  label: string;
  /** A motion icon (16px, 20 at lg). Without one, the button shows its label. */
  renderIcon?: ElementType;
  /** The icon as an element, instead of `renderIcon`. */
  children?: ReactNode;
  /** Show the label beside the icon. */
  showLabel?: boolean;
  disabled?: boolean;
  /** Runs on a click, or on its menu item once it has moved into the overflow menu. */
  onClick?: (event: ToolbarActionEvent) => void;
}

/** An action: an icon button whose label is its tooltip, or a labelled button. */
export function ToolbarButton({
  label,
  renderIcon,
  children,
  showLabel,
  disabled,
  onClick,
  ...rest
}: ToolbarButtonProps) {
  const register = useToolbar()?.register;
  const ref = useRef<HTMLButtonElement>(null);
  const latest = useLatest({ label, renderIcon, disabled, onClick });
  useLayoutEffect(
    () =>
      register?.({
        el: () => ref.current,
        menu: (key) => {
          const p = latest.current;
          return (
            <MenuItem
              key={key}
              label={p.label}
              renderIcon={p.renderIcon}
              disabled={p.disabled}
              onClick={(e) => p.onClick?.(e)}
            />
          );
        },
      }),
    [register, latest]
  );
  return (
    <ToolbarControl
      {...rest}
      label={label}
      renderIcon={renderIcon}
      icon={children}
      showLabel={showLabel ?? (!renderIcon && children == null)}
      disabled={disabled}
      buttonRef={ref}
      onClick={onClick}
    />
  );
}
ToolbarButton.displayName = 'ToolbarButton';

/* ── ToolbarToggle ─────────────────────────────────────────────────────── */

export interface ToolbarToggleProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'onChange' | 'value'
> {
  /** The tooltip and the accessible name; the visible text of a labelled toggle. */
  label: string;
  renderIcon?: ElementType;
  /** The icon as an element, instead of `renderIcon`. */
  children?: ReactNode;
  showLabel?: boolean;
  disabled?: boolean;
  /** Controlled. Ignored inside a ToolbarToggleGroup (the group's `value` decides). */
  pressed?: boolean;
  defaultPressed?: boolean;
  onChange?: (pressed: boolean) => void;
  /** Inside a ToolbarToggleGroup: this toggle's value (default: its label). */
  value?: string;
}

/** A toggle button (`aria-pressed`), alone or in a ToolbarToggleGroup (a single group reads it as a track's switch). */
export function ToolbarToggle({
  label,
  renderIcon,
  children,
  showLabel,
  disabled,
  pressed: pressedProp,
  defaultPressed = false,
  onChange,
  value,
  onClick,
  ...rest
}: ToolbarToggleProps) {
  const tb = useToolbar();
  const register = tb?.register;
  const group = useContext(ToggleGroupContext);
  const [inner, setInner] = useState(defaultPressed);
  const key = value ?? label;
  const pressed = group ? group.isPressed(key) : (pressedProp ?? inner);
  const off = !!disabled || !!group?.disabled;

  const set = (next: boolean) => {
    if (group) return group.toggle(key);
    if (pressedProp === undefined) setInner(next);
    onChange?.(next);
  };

  const ref = useRef<HTMLButtonElement>(null);
  // Matched-lightness hover is derived from the rest color as the pointer arrives;
  // pressed under the pointer, derive it again from the new rest (the CSS holds it at once).
  useLayoutEffect(() => {
    const el = ref.current;
    if (el?.matches(':hover')) deriveLightnessColors(el);
  }, [pressed]);

  // In a group, the group's entry stands for it in the overflow menu.
  const latest = useLatest({ label, renderIcon, off, pressed, set });
  const inGroup = !!group;
  useLayoutEffect(() => {
    if (inGroup) return;
    return register?.({
      el: () => ref.current,
      menu: (k) => {
        const p = latest.current;
        return (
          <MenuItemSelectable
            key={k}
            label={p.label}
            renderIcon={p.renderIcon}
            disabled={p.off}
            selected={p.pressed}
            onChange={(s) => p.set(s)}
          />
        );
      },
    });
  }, [register, latest, inGroup]);

  return (
    <ToolbarControl
      {...rest}
      label={label}
      renderIcon={renderIcon}
      icon={children}
      showLabel={showLabel ?? (!renderIcon && children == null)}
      disabled={off}
      toggle
      pressed={pressed}
      buttonRef={ref}
      onClick={(e) => {
        set(!pressed);
        onClick?.(e);
      }}
    />
  );
}
ToolbarToggle.displayName = 'ToolbarToggle';

/* ── ToolbarDivider ────────────────────────────────────────────────────── */

/** A hairline between groups (`separator`): upright in a row, level in a column. */
export function ToolbarDivider({ className }: { className?: string }) {
  const tb = useToolbar();
  const register = tb?.register;
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(
    () =>
      register?.({
        el: () => ref.current,
        menu: (key) => <MenuItemDivider key={key} />,
        divider: true,
      }),
    [register]
  );
  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation={
        tb?.orientation === 'vertical' ? 'horizontal' : 'vertical'
      }
      className={['cds-toolbar__divider', className].filter(Boolean).join(' ')}
    />
  );
}
ToolbarDivider.displayName = 'ToolbarDivider';
