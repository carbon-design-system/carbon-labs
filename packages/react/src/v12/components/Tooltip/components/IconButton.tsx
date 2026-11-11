/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  forwardRef,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  type ButtonHTMLAttributes,
  type ElementType,
  type ReactNode,
} from 'react';
import { attachRollover } from '@carbon-labs/v12-motion';
import {
  useIconPixelSnap,
  useLatest,
  type TooltipAlign,
  type TooltipAlignDeprecated,
} from '@carbon-labs/react-selection-kit';
import {
  chain,
  mergeRefs,
  TooltipMotionContext,
  useTooltipTrigger,
} from '@carbon-labs/v12-motion';
import { CONTROL_KIT, useKitProps } from '@carbon-labs/react-kit-defaults';
import { TooltipHoldContext } from './hold';
import { joinHandlers, useDisabledReason } from './DisabledReason';
import { useStillGate } from './still';
import { resolveButtonLook, type ButtonRole } from '@carbon-labs/react-props';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import './tooltip.scss';
import { TOOLTIP_LEAVE_LABEL_MS } from './delays';
import { useReducedGetter } from '@carbon-labs/react-util';

/* ============================================================================
 * IconButton — Carbon v11's IconButton: an icon-only button whose `label` is
 * its tooltip and its accessible name (`aria-labelledby`).
 * ============================================================================
 *
 * v11's props: `label`, `kind` (the role: primary · secondary · danger; v11's
 * tertiary is `variant="outlined"`, its ghost `frame="ghost"`, as the
 * Button's), `size`
 * (xs 24 · sm 32 · md 40 · lg 48, and the Button's xl 64 · 2xl 80), `align`,
 * `autoAlign`, `disabled`, `enterDelayMs` / `leaveDelayMs` (100 / 120, `fast-02`),
 * `closeOnActivation` (true), `defaultOpen`, `isSelected`, `href`, `as`,
 * `badgeCount`, `wrapperClasses`; the icon as `children` or `renderIcon`.
 *
 * In the kit:
 *
 *   hover     the rollover (one hover and press for every control): a glow
 *             under the pointer, the surface grown 1px on hover and pressed
 *             1px in from rest (both), the release circle;
 *             Carbon's button tokens as rest colors, matched-lightness hover
 *             and press; tertiary, danger--tertiary and danger--ghost are
 *             toned: tints of their own colour, the icon a Carbon step
 *             from the backdrop, kept at 4.5:1 (the rollover's
 *             `rollover-tone`); the
 *             plain ghost's neutral icon keeps the neutral wash
 *   icon      a motion icon plays on the button's hover or focus
 *             (`data-motion-icon-frame`); 16px, 20 at lg, on whole device
 *             pixels
 *   shape     `corners`: `full` (a circle, default: an icon on its own
 *             hovers full-round),
 *             `rounded` (8px, the selection kit's outer radius), `square`
 *             (v11's)
 *   tooltip   the snap; in a `TooltipGroup`, one tooltip slides between
 *             neighbors. No tooltip while disabled (v11 hides it). Inside a
 *             surface still moving in (`TooltipHoldContext`: a side panel),
 *             a hover or focus waits for it to land, so the tooltip is
 *             placed against the button's final box
 * ========================================================================== */

export type IconButtonKind = ButtonRole;
export type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type IconButtonCorners = 'rounded' | 'full' | 'square';

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  /** Default `top` (or the enclosing TooltipGroup's). */
  align?: TooltipAlign | TooltipAlignDeprecated;
  autoAlign?: boolean;
  /** The icon. A motion icon plays on hover. */
  children?: ReactNode;
  /** The icon as a component, instead of `children` (Carbon's `renderIcon` convention). */
  renderIcon?: ElementType;
  className?: string;
  /** Default true (v11). */
  closeOnActivation?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  /** Why it's disabled: it stays focusable and shows this in a tooltip on hover and focus. */
  disabledReason?: string;
  /** v11: accepted, not drawn. */
  dropShadow?: boolean;
  /** Default 100 (v11). */
  enterDelayMs?: number;
  /** v11: accepted; the tooltip is always inverse. */
  highContrast?: boolean;
  /** v11: the selected (toggled) look, `$background-selected`. */
  isSelected?: boolean;
  // @carbon-proposal api: button-axes — Button splits the old kinds into `kind` (the role), `variant` (outlined, tonal) and `frame` (ghost, none), so each prop says one thing. TBD
  /** The role: `primary` (default, v11), `secondary`, `danger`. */
  kind?: IconButtonKind;
  // @carbon-proposal api: variant-prop — The colour treatment is one `variant` prop (inverse, tonal, outlined, hero, neutral or filled), so colour is never said by a role or a structure. TBD
  /** The treatment: `filled` (default), the role's fill; `outlined`, v11's tertiary (with `kind="danger"`, danger--tertiary). */
  variant?: 'filled' | 'outlined';
  // @carbon-proposal api: frame-prop — What a component stands on is one `frame` prop (ghost, inset, flush, floating or line), so structure is never said by a kind or a colour. TBD
  /** What it stands on: `inset` (default), its own surface; `ghost`, v11's ghost, no surface of its own (with `kind="danger"`, danger--ghost). Wins over `variant`. */
  frame?: 'inset' | 'ghost';
  /** The tooltip, and the button's accessible name. */
  label: ReactNode;
  /** Default 100 (v11). */
  leaveDelayMs?: number;
  /** Default `md` (40px). v11's is 48 (`lg`); see the docs. */
  size?: IconButtonSize;
  /** Render an `<a>`. */
  href?: string;
  /** Render this element or component instead (v11's `as`); it gets the button's props. */
  as?: ElementType;
  /** v11: a count in a badge at the top end (a ghost `lg` button, as v11 draws it); 0 none, over 999 shows 999+. */
  badgeCount?: number;
  // @carbon-explore corners-prop — Corner mode is one `corners` prop (full, rounded or square) that a provider can set for a subtree, where `rounded` is the component's own radius. TBD
  /** `full` (a circle, default), `rounded` (8px), `square` (v11's). */
  corners?: IconButtonCorners;
  target?: string;
  rel?: string;
  /** Classes on the wrapper. */
  wrapperClasses?: string;
  /** The tooltip's outlined surface: a 1px hairline, the inverse fill mixed 12% toward its text. Default none (or the enclosing `TooltipMotion`'s). */
  outline?: boolean;
  /**
   * The button is the frame its motion icon plays hover from (default true).
   * False when an ancestor marked `data-motion-icon-frame` is (a search's
   * field, so hovering anywhere on it plays the magnifier).
   */
  iconFrame?: boolean;
  /**
   * Slow motion: multiplies the rollover's and the tooltip's durations.
   * Default: the enclosing `TooltipMotion`'s (1). In a `TooltipGroup`, the
   * group's shared tooltip keeps the group's clock.
   */
  timeScale?: number;
}

/** The button itself, under the time scale its wrapper set. */
const IconButtonBody = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  Omit<IconButtonProps, 'timeScale'>
>(function IconButtonBody(
  {
    align,
    autoAlign,
    children,
    renderIcon: Icon,
    className,
    closeOnActivation = true,
    defaultOpen = false,
    disabled = false,
    disabledReason,
    dropShadow: _dropShadow,
    enterDelayMs = 100,
    highContrast: _highContrast,
    isSelected,
    kind,
    variant,
    frame,
    label,
    leaveDelayMs = TOOLTIP_LEAVE_LABEL_MS,
    size: sizeProp,
    href,
    as: As,
    badgeCount,
    corners: cornersProp,
    target,
    rel,
    wrapperClasses,
    outline,
    iconFrame = true,
    onPointerEnter,
    onPointerLeave,
    onFocus,
    onBlur,
    onClick,
    onKeyDown,
    ...rest
  },
  ref
) {
  // KitDefaults: the provider's size and corners for the props not given.
  const look = resolveButtonLook({ kind, variant, frame });
  const { size = 'md', corners = 'full' } = useKitProps(
    { size: sizeProp, corners: cornersProp },
    CONTROL_KIT
  );
  const { props: trigger, tooltip } = useTooltipTrigger({
    label,
    align,
    autoAlign,
    enterDelayMs,
    leaveDelayMs,
    defaultOpen,
    closeOnActivation,
    disabled,
    outline,
  });

  const btnRef = useRef<HTMLElement | null>(null);
  const { timeScale, reduced: tipReduced } = useContext(TooltipMotionContext);
  // Disabled with a reason: the label stays the name; the reason is the tooltip.
  const reason = useDisabledReason(disabled, disabledReason);
  const rc = reason.controlProps;

  // Inside a surface still moving in (a side panel): a hover or a focus
  // waits for it to land, then asks again, measured against the button's
  // final box (tooltip/hold.ts).
  const hold = useContext(TooltipHoldContext);
  const waited = useRef<{
    pointer: { clientX: number; clientY: number } | null;
    focus: boolean;
  }>({
    pointer: null,
    focus: false,
  });
  // Waiting for the landing (one callback at a time). Not let go on unmount:
  // the hold drops it as it lands, and a button gone by then does nothing.
  const unwait = useRef<(() => void) | null>(null);
  const triggerRef = useLatest(trigger);
  // A hover that arrives with no movement of the pointer (the button came
  // under it) waits for the pointer to move (tooltip/still.ts).
  const still = useStillGate();
  const wait = () => {
    if (unwait.current || !hold) return;
    unwait.current = hold.onLand(() => {
      unwait.current = null;
      const el = btnRef.current;
      const w = waited.current;
      waited.current = { pointer: null, focus: false };
      if (!el?.isConnected) return;
      type E = never;
      const t = triggerRef.current;
      // Focus first (its own open, focus-visible only: the keyboard in use), else the hover.
      if (w.focus && document.activeElement === el)
        t.onFocus({ currentTarget: el, target: el } as E);
      else if (w.pointer && el.matches(':hover'))
        t.onPointerEnter(w.pointer as E);
    });
  };
  const held: Pick<
    typeof trigger,
    'onPointerEnter' | 'onPointerLeave' | 'onFocus' | 'onBlur'
  > = {
    onPointerEnter: (e) => {
      if (!hold?.held())
        return still.enter(e, (at) =>
          triggerRef.current.onPointerEnter(at as never)
        );
      waited.current.pointer = { clientX: e.clientX, clientY: e.clientY };
      wait();
    },
    onPointerLeave: (e) => {
      waited.current.pointer = null;
      still.cancel();
      trigger.onPointerLeave(e);
    },
    onFocus: (e) => {
      if (!hold?.held() || e.currentTarget !== e.target)
        return trigger.onFocus(e);
      waited.current.focus = true;
      wait();
    },
    onBlur: (e) => {
      if (e.currentTarget === e.target) waited.current.focus = false;
      trigger.onBlur(e);
    },
  };
  const rolloverReduced = useReducedGetter(tipReduced);

  // The rollover: hover glow, flat press, release circle.
  useEffect(() => {
    const el = btnRef.current;
    if (!el || disabled) return;
    const detach = attachRollover(el, {
      selector: '.cds-icon-btn',
      timeScale,
      reduced: rolloverReduced,
    });
    return () => {
      detach();
      el.style.removeProperty('--cds-motion-rollover-hover-color');
      el.style.removeProperty('--cds-motion-rollover-press-color');
      el.style.removeProperty('--cds-motion-rollover-color');
      el.style.removeProperty('--cds-motion-rollover-label');
    };
  }, [disabled, timeScale, rolloverReduced, look, isSelected]);

  useIconPixelSnap(btnRef, 'svg', size);

  const classes = [
    'cds-icon-btn',
    `cds-icon-btn--${look}`,
    `cds-icon-btn--${size}`,
    corners !== 'rounded' && `cds-icon-btn--${corners}`,
    isSelected && 'cds-icon-btn--selected',
    disabled && 'cds-icon-btn--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  type H = (e: never) => void;
  const shared = {
    ref: mergeRefs<HTMLElement>(
      trigger.ref,
      btnRef,
      ref as never,
      reason.anchorProps.ref
    ),
    className: classes,
    'data-motion-icon-frame': iconFrame ? '' : undefined,
    'aria-labelledby': rest['aria-labelledby'] ?? trigger['aria-labelledby'],
    'data-tooltip-trigger': trigger['data-tooltip-trigger'],
    onPointerEnter: chain(
      held.onPointerEnter as H,
      joinHandlers(reason.anchorProps.onPointerEnter as H, onPointerEnter as H)
    ),
    onPointerLeave: chain(
      held.onPointerLeave as H,
      joinHandlers(reason.anchorProps.onPointerLeave as H, onPointerLeave as H)
    ),
    onFocus: chain(
      held.onFocus as H,
      joinHandlers(rc.onFocus as H, onFocus as H)
    ),
    onBlur: chain(held.onBlur as H, joinHandlers(rc.onBlur as H, onBlur as H)),
    onClick: reason.active
      ? (rc.onClick as H)
      : chain(trigger.onClick as H, onClick as H),
    onKeyDown: reason.active
      ? (rc.onKeyDown as H)
      : chain(trigger.onKeyDown as H, onKeyDown as H),
    ...(reason.active ? { 'aria-disabled': true as const } : null),
  };
  // With a reason it stays focusable: aria-disabled, never the attribute.
  const off = disabled && !reason.active;
  // v11's badge: the count beside the icon, described to assistive tech.
  const badgeId = useId();
  const badge =
    badgeCount != null && badgeCount > 0 ? (
      <span className="cds-icon-btn__badge" id={badgeId}>
        {badgeCount > 999 ? '999+' : badgeCount}
      </span>
    ) : null;
  const described = reason.describedBy(
    badge
      ? [rest['aria-describedby'], badgeId].filter(Boolean).join(' ')
      : rest['aria-describedby']
  );
  const icon = (
    <>
      {Icon ? <Icon aria-hidden="true" /> : children}
      {badge}
    </>
  );

  return (
    <span
      className={['cds-tooltip', 'cds-icon-tooltip', wrapperClasses]
        .filter(Boolean)
        .join(' ')}>
      {As ? (
        <As
          {...rest}
          {...shared}
          aria-describedby={described}
          href={href}
          disabled={off}
          aria-pressed={isSelected}>
          {icon}
        </As>
      ) : href && !disabled ? (
        <a
          {...(rest as object)}
          {...shared}
          aria-describedby={described}
          href={href}
          target={target}
          rel={rel}>
          {icon}
        </a>
      ) : (
        <button
          type="button"
          {...rest}
          {...shared}
          aria-describedby={described}
          disabled={off}
          aria-pressed={isSelected}>
          {icon}
        </button>
      )}
      {tooltip}
      {reason.tooltip}
    </span>
  );
});

export const IconButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  IconButtonProps
>(function IconButton({ timeScale, ...props }, ref) {
  // A `timeScale` of its own reaches its tooltip (the trigger reads the
  // context) and its rollover; without one, the context passes through.
  const ctx = useContext(TooltipMotionContext);
  const value = useMemo(
    () => (timeScale === undefined ? ctx : { ...ctx, timeScale }),
    [ctx, timeScale]
  );
  return (
    <TooltipMotionContext.Provider value={value}>
      <IconButtonBody {...props} ref={ref} />
    </TooltipMotionContext.Provider>
  );
});
IconButton.displayName = 'IconButton';
