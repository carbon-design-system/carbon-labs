/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useContext,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type ElementType,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { attachRollover } from '@carbon-labs/v12-motion';
import {
  IconButton,
  useDisabledReason,
  type IconButtonProps,
} from '@carbon-labs/react-tooltip';
import { joinHandlers } from '@carbon-labs/react-tooltip';
import { CONTROL_KIT, useKitProps } from '@carbon-labs/react-kit-defaults';
import { quietSteps } from '@carbon-labs/react-util';
import {
  resolveButtonLook,
  type ButtonFrame,
  type ButtonLook,
  type ButtonVariant,
} from '@carbon-labs/react-props';
import { Spinner } from '@carbon-labs/react-feedback';
import { useBusySwap } from '@carbon-labs/react-loading';
import './button.scss';
import { TooltipMotionContext } from '@carbon-labs/v12-motion';
import { useReducedGetter } from '@carbon-labs/react-util';
import { IN_DEVELOPMENT } from '@carbon-labs/react-util';

/* ============================================================================
 * Button — Carbon v11's Button on the kit's look and motion
 * ============================================================================
 *
 * v11's API, prop for prop (`@carbon/react` Button / ButtonBase): `kind`,
 * `size`, `isExpressive`, `renderIcon`, `iconDescription`, `hasIconOnly` and
 * its tooltip props, `isSelected`, `href`, `as`, `disabled`, `type`,
 * `dangerDescription`, the ref. v11's markup and a11y: an `<a>` for `href`
 * (a `<button disabled>` when disabled, as v11), the danger description as
 * a visually hidden `aria-describedby`, and icon-only delegated to
 * IconButton, whose label is the tooltip and the name (v11 does the same).
 *
 * The kit adds:
 *
 *   hover     the rollover: a glow of the matched-lightness hover color
 *             under the pointer (fast-02 in, fast-01 out)
 *   size      grows 1px on hover and presses 1px in from its rest edge
 *   press     the flat pressed color while held; the release circle opens
 *             from the release point. The coloured outline and ghost kinds
 *             hover and press in tints of their own colour (toned), the
 *             label a Carbon step further from the backdrop, and more if
 *             it would still fall under 4.5:1 (the kit's `rollover-tone`)
 *   busy      `busy`: aria-busy + aria-disabled, the label kept, the icon
 *             slot the kit's one Spinner (an icon with its own pending
 *             motion keeps it: `ownsPending`), no presses. Out, then in: the icon fades out
 *             (`fast-02`), then the spinner draws on (`moderate-01`); busy
 *             ending, the spinner closes (`fast-02`), then the icon fades
 *             back (`moderate-01`). With no icon the label takes the icon's
 *             turn. Reduced motion: at once, the spinner its still dots
 *   focus     keyboard only: a 2px ring in the button's own text color just
 *             inside its edge, a 2px rim of the fill round it on a filled
 *             button. No v11 blue
 *   corners   full: a pill, the label starting half the height in, the
 *             icon as far in from the end; with no icon, the same inset
 *             at both ends, and busy, its spinner in the label's place, so
 *             the width holds. `corners` also takes 'rounded' (8px) and
 *             'square' (v11's), not shown on the page
 *   icon      a motion icon plays on the button's hover or keyboard focus
 *             (`data-motion-icon-frame`)
 *   axes      `kind` is the role
 *             (primary · secondary · danger), `variant` the treatment
 *             (`outlined`, v11's tertiary; `tonal`, the quiet fill), `frame`
 *             what it stands on (`ghost`, v11's ghost; `none`, the text
 *             button). v11's kind names stay the class names
 *             (`.cds-btn--tertiary` …, `resolveButtonLook`)
 *   text      `frame="none"`: the family's link-blue text button
 *   outlined  a neutral outline: `$text-primary` on the light themes, not
 *             v11's blue 60, and v11's white on the dark;
 *             `--cds-tertiary`, styles/_tertiary.scss
 * ========================================================================== */

/** The roles (`kind`, Carbon's). v11's tertiary is `variant="outlined"`, its ghost `frame="ghost"`. */
export const ButtonKinds = ['primary', 'secondary', 'danger'] as const;
export type ButtonKind = (typeof ButtonKinds)[number];
/** The treatments (`variant`), `filled` the default. */
export const ButtonVariants = ['filled', 'outlined', 'tonal'] as const;
/** The frames (`frame`), `inset` the default. */
export const ButtonFrames = ['inset', 'ghost', 'none'] as const;
export const ButtonSizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
export type ButtonSize = (typeof ButtonSizes)[number];
export const ButtonTooltipAlignments = ['start', 'center', 'end'] as const;
export type ButtonTooltipAlignment = (typeof ButtonTooltipAlignments)[number];
export const ButtonTooltipPositions = [
  'top',
  'right',
  'bottom',
  'left',
] as const;
export type ButtonTooltipPosition = (typeof ButtonTooltipPositions)[number];
export type ButtonCorners = 'rounded' | 'full' | 'square';

/** Icon-only takes these looks (v11's IconButton kinds); any other is primary. */
const ICON_ONLY_LOOKS: Partial<
  Record<ButtonLook, Pick<IconButtonProps, 'kind' | 'variant' | 'frame'>>
> = {
  primary: { kind: 'primary' },
  secondary: { kind: 'secondary' },
  tertiary: { variant: 'outlined' },
  ghost: { frame: 'ghost' },
};
const ICON_ONLY_SIZES: readonly string[] = ['xs', 'sm', 'md', 'lg'];

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Render the root as this element or component (v11). */
  as?: ElementType;
  /** Icon-only: let the tooltip find room (v11, experimental). */
  autoAlign?: boolean;
  /**
   * The action is running. `aria-busy` and `aria-disabled`, the
   * label kept, the icon slot shows an indeterminate spinner (an icon with a
   * static `ownPending`, or the status Save or Send, keeps its own); clicks and
   * presses do nothing until it's cleared. Focus stays.
   */
  busy?: boolean;
  children?: ReactNode;
  className?: string;
  // @carbon-explore corners-prop — Corner mode is one `corners` prop (full, rounded or square) that a provider can set for a subtree, where `rounded` is the component's own radius. TBD
  /** The corner. Default 'full' (buttons are pills); 'rounded' (8px) and 'square' (v11's) remain, unadvertised. */
  corners?: ButtonCorners;
  /** The screen-reader message for the danger kinds (v11). */
  dangerDescription?: string;
  disabled?: boolean;
  /** Why it's disabled: it stays focusable and shows this in a tooltip on hover and focus. */
  disabledReason?: string;
  /** An icon-only button: `iconDescription` is its tooltip and its name (v11). */
  hasIconOnly?: boolean;
  /** Render an `<a>` (v11). */
  href?: string;
  /** The icon's description; for icon-only, the tooltip and the name. */
  iconDescription?: string;
  /** v11's expressive button: body-compact-02 and a 20px icon. */
  isExpressive?: boolean;
  /** Icon-only ghost: the selected (toggled) look and `aria-pressed` (v11). */
  isSelected?: boolean;
  // @carbon-proposal api: button-axes — Button splits the old kinds into `kind` (the role), `variant` (outlined, tonal) and `frame` (ghost, none), so each prop says one thing. TBD
  /** The role: `primary` (default), `secondary`, `danger`. */
  kind?: ButtonKind;
  // @carbon-proposal api: variant-prop — The colour treatment is one `variant` prop (inverse, tonal, outlined, hero, neutral or filled), so colour is never said by a role or a structure. TBD
  /**
   * The treatment: `filled` (default), the role's own fill. `outlined`
   * (v11's tertiary; with `kind="danger"`, danger--tertiary). `tonal`: the
   * quiet fill (the standard surface, its hairline, a `$text-primary` label).
   */
  variant?: ButtonVariant;
  // @carbon-proposal api: frame-prop — What a component stands on is one `frame` prop (ghost, inset, flush, floating or line), so structure is never said by a kind or a colour. TBD
  /**
   * What it stands on: `inset` (default), its own rounded surface, the label
   * inset in it. `ghost` (v11's ghost; with `kind="danger"`, danger--ghost):
   * no surface of its own. `none`: no box at
   * all, the label alone (the link-blue text button). Wins over `variant`.
   */
  frame?: ButtonFrame;
  rel?: string;
  /** The icon as a component. A motion icon plays on hover. */
  renderIcon?: ElementType;
  /** v11's sizes. Default lg (48px). */
  size?: ButtonSize;
  target?: string;
  /** Icon-only: the tooltip's alignment along its side. Default center. */
  tooltipAlignment?: ButtonTooltipAlignment;
  /** v11: accepted, not drawn (the kit's tooltip has no shadow). */
  tooltipDropShadow?: boolean;
  /** v11: accepted; the tooltip is always inverse. */
  tooltipHighContrast?: boolean;
  /** Icon-only: the tooltip's side. Default top. */
  tooltipPosition?: ButtonTooltipPosition;
  /** Icon-only (v11's IconButton props, passed through). */
  closeOnActivation?: boolean;
  defaultOpen?: boolean;
  enterDelayMs?: number;
  leaveDelayMs?: number;
  wrapperClasses?: string;
  /** Slow motion: multiplies the rollover's durations (and, icon-only, the tooltip's). Default 1. */
  timeScale?: number;
}

/** v11's mapping of `tooltipPosition` + `tooltipAlignment` to IconButton's `align`. */
function tooltipAlign(
  position: ButtonTooltipPosition,
  alignment: ButtonTooltipAlignment
) {
  if (position === 'left' || position === 'right') return position;
  return alignment === 'center'
    ? position
    : (`${position}-${alignment}` as const);
}

/** Status icons that draw their own pending state, by name, so Button needn't import them. */
const OWN_PENDING = new Set(['Save', 'Send']);
/** An icon keeps its own pending motion: it says so (`ownPending`), or it is the status Save or Send. */
function ownsPending(Icon: unknown): boolean {
  if (!Icon || (typeof Icon !== 'object' && typeof Icon !== 'function'))
    return false;
  const c = Icon as {
    ownPending?: boolean;
    status?: unknown;
    displayName?: string;
  };
  if (c.ownPending !== undefined) return c.ownPending;
  return !!c.status && OWN_PENDING.has(c.displayName ?? '');
}

/** v11's icon-only warning, given once a page, not on every render. */
let warnedUndescribed = false;

export const Button = forwardRef<HTMLElement, ButtonProps>(
  function Button(props, ref) {
    const {
      as,
      autoAlign = false,
      busy = false,
      children,
      className,
      corners: cornersProp,
      dangerDescription = '',
      disabled = false,
      disabledReason,
      hasIconOnly = false,
      href,
      iconDescription,
      isExpressive = false,
      isSelected,
      kind = 'primary',
      variant,
      frame,
      renderIcon: Icon,
      size: sizeProp,
      tabIndex,
      tooltipAlignment = 'center',
      tooltipDropShadow = false,
      tooltipHighContrast = true,
      tooltipPosition = 'top',
      type = 'button',
      closeOnActivation,
      defaultOpen,
      enterDelayMs,
      leaveDelayMs,
      wrapperClasses,
      timeScale,
      ...rest
    } = props;
    // KitDefaults: the provider's size and corners for the props not given.
    const look = resolveButtonLook({ kind, variant, frame });
    const { size, corners = 'full' } = useKitProps(
      { size: sizeProp, corners: cornersProp },
      CONTROL_KIT
    );

    const elRef = useRef<HTMLElement | null>(null);
    const rolloverReduced = useReducedGetter(
      useContext(TooltipMotionContext).reduced
    );
    const setRef = useCallback(
      (el: HTMLElement | null) => {
        elRef.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      },
      [ref]
    );
    const iconOnly = hasIconOnly;
    const live = !disabled && !iconOnly && !busy;
    // What the root is: the effects re-attach when it changes.
    const node: ElementType = as ?? (href && !disabled ? 'a' : 'button');

    // The rollover: hover glow, flat press, release circle (as IconButton).
    useEffect(() => {
      const el = elRef.current;
      if (!el || !live) return;
      // The toned kinds (tertiary, danger--tertiary, ghost, danger--ghost)
      // declare their tone in button.scss (the kit's `rollover-tone`): the
      // rollover solves their tints and the label's 4.5:1 step against the
      // backdrop, and holds `data-rollover-held` for the press's instant label
      // step.
      const detach = attachRollover(el, {
        selector: '.cds-btn, .cds-text-btn',
        timeScale,
        // Neutral: the quiet card hover's steps, as the shell's neutral cells.
        steps: look === 'neutral' ? quietSteps() : undefined,
        reduced: rolloverReduced,
      });
      return () => {
        detach();
        el.style.removeProperty('--cds-motion-rollover-hover-color');
        el.style.removeProperty('--cds-motion-rollover-press-color');
        el.style.removeProperty('--cds-motion-rollover-color');
        el.style.removeProperty('--cds-motion-rollover-label');
      };
    }, [live, look, node, rolloverReduced, timeScale]);

    // Busy: the icon (or a label-only button's label) and the spinner take turns, out then in.
    // An icon with its own pending motion doesn't swap; it is matched by name, not imported.
    const ownPending = ownsPending(Icon);
    const swap = useBusySwap(busy && !ownPending);

    const descriptionId = `danger-description-${useId()}`;
    // Icon-only hands the reason to IconButton, which has its own.
    const reason = useDisabledReason(disabled && !iconOnly, disabledReason);

    // v11's warning, word for word: once a page, in development, from an effect (not every render).
    const undescribed = !!Icon && !children && !iconDescription;
    useEffect(() => {
      if (!undescribed || warnedUndescribed || !IN_DEVELOPMENT) return;
      warnedUndescribed = true;
      console.error(
        'Button: renderIcon property specified without also providing an iconDescription property. This may impact accessibility for screen reader users.'
      );
    }, [undescribed]);

    // Icon-only: v11 hands it to IconButton; so does this (the kit's).
    if (iconOnly) {
      const k = ICON_ONLY_LOOKS[look] ?? { kind: 'primary' as const };
      // v11's default is lg (48px); xl and 2xl are v11 Button sizes IconButton lacks.
      const s = size && ICON_ONLY_SIZES.includes(size) ? (size as 'md') : 'lg';
      return (
        <IconButton
          {...(rest as object)}
          ref={setRef as never}
          label={iconDescription}
          {...k}
          size={s}
          // The Button's corners (default `full`): an icon on its own is round,
          // as every icon-only hover is.
          corners={corners}
          align={tooltipAlign(tooltipPosition, tooltipAlignment)}
          autoAlign={autoAlign}
          disabled={disabled}
          disabledReason={disabledReason}
          isSelected={look === 'ghost' ? isSelected : undefined}
          href={href}
          tabIndex={tabIndex}
          type={type}
          highContrast={tooltipHighContrast}
          dropShadow={tooltipDropShadow}
          closeOnActivation={closeOnActivation}
          defaultOpen={defaultOpen}
          enterDelayMs={enterDelayMs}
          leaveDelayMs={leaveDelayMs}
          wrapperClasses={wrapperClasses}
          timeScale={timeScale}
          className={[
            corners !== 'rounded' && `cds-btn-corners--${corners}`,
            (size === 'xl' || size === '2xl') && `cds-btn-icon-only--${size}`,
            className,
          ]
            .filter(Boolean)
            .join(' ')}>
          {Icon ? (
            <Icon size={size === 'lg' ? 20 : 16} aria-hidden="true" />
          ) : (
            children
          )}
        </IconButton>
      );
    }

    const isText = look === 'text';
    // v11: isExpressive applies the sizes only from xl up; below, the default (lg).
    const sizeClass =
      size && (!isExpressive || size === 'xl' || size === '2xl') ? size : 'lg';
    const classes = [
      isText ? 'cds-text-btn' : 'cds-btn',
      !isText && `cds-btn--${sizeClass}`,
      !isText && `cds-btn--${look}`,
      !isText && corners !== 'rounded' && `cds-btn--${corners}`,
      !isText && !Icon && 'cds-btn--no-icon',
      isExpressive && 'cds-btn--expressive',
      disabled && 'cds-btn--disabled',
      busy && 'cds-btn--busy',
      swap.restHidden && 'cds-btn--swapped',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const hasDanger = kind === 'danger' && Boolean(dangerDescription);
    const ariaPressed = rest['aria-pressed'];
    let other: Record<string, unknown> = {
      // With a reason it stays focusable: aria-disabled, never the attribute.
      disabled: disabled && !reason.active,
      type,
      'aria-describedby': reason.describedBy(
        hasDanger ? descriptionId : rest['aria-describedby'] || undefined
      ),
      'aria-pressed': ariaPressed,
    };
    if (as) other = { ...other, href };
    // v11: a disabled `href` button renders a <button disabled>, not a dead link.
    else if (node === 'a') other = { href };
    if (busy) {
      // Still focusable (no `disabled`), so focus isn't lost while it runs.
      other = { ...other, 'aria-busy': true, 'aria-disabled': true };
    }
    const guardedClick =
      busy || reason.active
        ? (e: MouseEvent<HTMLButtonElement>) => e.preventDefault()
        : rest.onClick;

    // The icon slot: the button's icon and, while busy, the kit's Spinner in
    // the same 16px (20px expressive) box, in the button's own color, at the
    // icons' line (1px at 16px, 1.25px at 20px). The icon stays while the
    // spinner shows, hidden, so it can fade back. An icon with its own pending
    // motion (`ownsPending`) keeps it; every other icon gives way to the spinner.
    const iconSize = isExpressive ? 20 : 16;
    const icon = Icon ? (
      ownPending && busy ? (
        <Icon
          className="cds-btn__icon"
          size={iconSize}
          status="pending"
          aria-hidden="true"
        />
      ) : (
        <Icon className="cds-btn__icon" size={iconSize} aria-hidden="true" />
      )
    ) : null;
    // Neutral, always: the arc is the button's colour, whatever a KitDefaults variant says.
    const spinner = swap.spinner ? (
      <Spinner
        className="cds-btn__icon cds-btn__spinner"
        size={iconSize}
        variant="neutral"
        active={swap.spinning}
      />
    ) : null;

    const Root = node;
    const { ref: anchorRef, ...anchor } = reason.anchorProps;
    const control = reason.controlProps;
    const root = (
      <Root
        {...rest}
        {...other}
        {...anchor}
        {...(reason.active
          ? {
              'aria-disabled': true,
              onFocus: joinHandlers(
                control.onFocus as never,
                rest.onFocus as never
              ),
              onBlur: joinHandlers(
                control.onBlur as never,
                rest.onBlur as never
              ),
              onKeyDown: control.onKeyDown,
            }
          : null)}
        onClick={guardedClick}
        tabIndex={tabIndex}
        className={classes}
        ref={
          reason.active
            ? (el: HTMLElement | null) => (setRef(el), anchorRef?.(el))
            : setRef
        }
        style={{ ...swap.vars, ...rest.style }}
        {...(Icon ? { 'data-motion-icon-frame': '' } : null)}>
        {hasDanger ? (
          <span id={descriptionId} className="cds-btn__assistive">
            {dangerDescription}
          </span>
        ) : null}
        {/* No icon: the label in a span, so a busy pill can hide it under its
          spinner (button.scss). */}
        {!isText && !Icon ? (
          <span className="cds-btn__label">{children}</span>
        ) : (
          children
        )}
        {icon}
        {spinner}
      </Root>
    );
    return reason.active ? (
      <>
        {root}
        {reason.tooltip}
      </>
    ) : (
      root
    );
  }
);
Button.displayName = 'Button';
