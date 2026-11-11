/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import type { SelectionMoveInfo } from '@carbon-labs/v12-motion';
import { useMenuTrigger } from '@carbon-labs/v12-motion';
import { ChevronDownToggle } from '@carbon-labs/react-motion-icons';
import {
  Menu,
  menuSizeFor,
  type MenuAlignment,
  type MenuMotion,
  type MenuStyleProps,
} from '@carbon-labs/react-menu';
import {
  cellClasses,
  cutStyle,
  rowCuts,
  shellClasses,
  useShellRollover,
  type ShellLook,
} from '@carbon-labs/react-button';
import { resolveButtonLook, useWithTimeScale } from '@carbon-labs/react-props';
import { Spinner } from '@carbon-labs/react-feedback';
import { useBusySwap } from '@carbon-labs/react-loading';

/* ============================================================================
 * SplitButton — Carbon v11's ComboButton on the button shell
 * ============================================================================
 *
 * A primary action, and beside it a chevron that opens a menu of related
 * actions ("Save" | ⌄ "Save as draft", "Save and close"). Not for two equal
 * actions: use two Buttons. Not for a choice between options: that is the
 * ContentSwitcher.
 *
 * v11's API (`@carbon/react` 1.116 ComboButton): `label`, `onClick`,
 * `children` (MenuItems), `disabled`, `size` (default lg), `menuAlignment`,
 * `tooltipAlignment` (accepted: the trigger has no tooltip here, its label
 * is its name), `translateWithId` (`carbon.combo-button.additional-actions`,
 * "Additional actions"), `className`, the ref (the group).
 *
 * The kit's look and motion (shell.ts, button-shell.scss):
 *
 *   shell     one pill (`corners`, as the Button: full by default) in two
 *             cells, rounded only outside. Between them, the kit's seam rule:
 *             a 1px knockout on primary and secondary, a 1px line in the
 *             outline's colour on tertiary, the quiet 1px hairline on
 *             neutral
 *   hover     the Button's rollover in each cell, its glow, pressed colour
 *             and release circle clipped to the cell; no growth or press-in
 *   focus     each cell its own keyboard ring, round outside, square at the
 *             seam
 *   chevron   on a pill, the icon the Button pill's icon's inset from the
 *             end and the pill's gap from the seam (a square cell, as wide
 *             as the shell is tall, on rounded and square): motion-icons'
 *             ChevronDownToggle, turning while the menu shows (MenuButton's).
 *             It opens the kit's Menu at the shell's inline start, content-
 *             width but never narrower than the shell, with its surface, snap
 *             and keys (↓ / Enter / Space open on the first row, ↑ on the last)
 *   a11y      two <button>s in `role="group"`; the trigger has
 *             `aria-haspopup="menu"`, `aria-expanded` and its label
 *   busy      the action cell shows the kit's Spinner in its label's place,
 *             out then in as the Button's (the label fades out, the spinner
 *             draws on; the reverse as busy ends)
 *             (aria-busy, aria-disabled, focus kept); the chevron is disabled
 *   sizes     xs 24 (toolbars), sm 32, md 40, lg 48 (default)
 *   looks     `kind` primary (default) or secondary; `variant` outlined (v11's
 *             tertiary) or tonal (the shell's quieter look, shell.ts); no ghost frame: no surface to divide
 * ========================================================================== */

/** The roles (`kind`). */
export const SplitButtonKinds = ['primary', 'secondary'] as const;
export type SplitButtonKind = (typeof SplitButtonKinds)[number];
/** The treatments (`variant`), `filled` the default. */
export const SplitButtonVariants = ['filled', 'outlined', 'tonal'] as const;
export type SplitButtonVariant = (typeof SplitButtonVariants)[number];
export const SplitButtonSizes = ['xs', 'sm', 'md', 'lg'] as const;
export type SplitButtonSize = (typeof SplitButtonSizes)[number];

const TRANSLATIONS = {
  'carbon.combo-button.additional-actions': 'Additional actions',
} as const;
export type SplitButtonTranslationKey = keyof typeof TRANSLATIONS;

export interface SplitButtonProps
  extends
    Omit<MenuStyleProps, 'variant'>,
    Omit<HTMLAttributes<HTMLDivElement>, 'onClick' | 'children'> {
  /** The primary action's label (v11). */
  label: string;
  /** The primary action (v11). */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** MenuItems: the related actions (v11). */
  children?: ReactNode;
  /** Both cells (v11). */
  disabled?: boolean;
  /** xs 24, sm 32, md 40, lg 48 (default, v11's). Also the menu's, but an xs shell opens an sm menu. */
  size?: SplitButtonSize;
  /** Where the menu opens, against the whole shell (never narrower than it). Default `bottom-start`. */
  menuAlignment?: MenuAlignment;
  /** v11's trigger tooltip: accepted; the trigger is named by its label instead. */
  tooltipAlignment?: string;
  /** v11's translation hook: the trigger's and the menu's label. */
  translateWithId?: (messageId: SplitButtonTranslationKey) => string;
  // @carbon-proposal api: button-axes — Button splits the old kinds into `kind` (the role), `variant` (outlined, tonal) and `frame` (ghost, none), so each prop says one thing. TBD
  /** The role: `primary` (default) or `secondary`. */
  kind?: SplitButtonKind;
  // @carbon-proposal api: variant-prop — The colour treatment is one `variant` prop (inverse, tonal, outlined, hero, neutral or filled), so colour is never said by a role or a structure. TBD
  /** The treatment: `filled` (default), the role's fill; `outlined` (v11's tertiary) or `tonal` (the quieter look, the shell's standard surface). */
  variant?: SplitButtonVariant;
  /** The menu's treatment (Menu's `variant`): `inverse` (default), `tonal`, `outlined`. */
  menuVariant?: MenuStyleProps['variant'];
  /** The action is running: its spinner, no presses, the chevron disabled. */
  busy?: boolean;
  /** The menu's own size, when it differs from the shell's. */
  menuSize?: SplitButtonSize;
  /** Where the menu is portalled. */
  menuTarget?: Element | null;
  /** The menu's snap starts at the press point (default) or the chevron's center. */
  openFrom?: 'pointer' | 'trigger';
  motion?: Partial<MenuMotion>;
  /** Slow motion: multiplies the durations. Default 1. Wins over `motion.timeScale`. */
  timeScale?: number;
  onMove?: (info: SelectionMoveInfo) => void;
}

const defaultTranslate = (id: SplitButtonTranslationKey) => TRANSLATIONS[id];

export const SplitButton = forwardRef<HTMLDivElement, SplitButtonProps>(
  function SplitButton(
    {
      label,
      onClick,
      children,
      disabled = false,
      size = 'lg',
      menuAlignment = 'bottom-start',
      tooltipAlignment: _tooltipAlignment,
      translateWithId: t = defaultTranslate,
      kind = 'primary',
      variant,
      menuVariant,
      busy = false,
      menuSize,
      menuTarget,
      openFrom = 'pointer',
      motion: motionProp,
      timeScale,
      onMove,
      lowContrast,
      corners,
      contour,
      outlinedFill,
      outline,
      shadow,
      className,
      onFocus,
      onMouseDown,
      ...rest
    },
    ref
  ) {
    const motion = useWithTimeScale(motionProp, timeScale);
    const triggerOff = disabled || busy;
    const { open, setOpen, button, setButton, origin, initialFocus, handlers } =
      useMenuTrigger({
        openFrom,
        disabled: triggerOff,
        timeScale: motion?.timeScale,
      });
    // Busy or disabled while open: the menu closes.
    useEffect(() => {
      if (triggerOff && open) setOpen(false);
    }, [triggerOff, open, setOpen]);
    const shellRef = useRef<HTMLDivElement | null>(null);
    // The shell is the menu's anchor (it opens under the whole shell): state, so the menu has it.
    const [anchor, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const setShell = useCallback(
      (el: HTMLDivElement | null) => {
        shellRef.current = el;
        setAnchorEl(el);
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      },
      [ref]
    );
    const look = resolveButtonLook({ kind, variant }) as ShellLook;
    useShellRollover(
      shellRef,
      `${look}/${disabled}/${busy}`,
      motion?.timeScale,
      look === 'neutral'
    );
    const swap = useBusySwap(busy);
    const menuId = `cds-split-${useId().replace(/:/g, '')}`;
    const moreLabel = t('carbon.combo-button.additional-actions');

    const act = (e: MouseEvent<HTMLButtonElement>) => {
      if (busy || disabled) {
        e.preventDefault();
        return;
      }
      // The action runs; an open menu closes (the choice is made).
      if (open) setOpen(false);
      onClick?.(e);
    };

    return (
      <>
        <div
          {...rest}
          ref={setShell}
          role="group"
          // Programmatically focusable only: the menu returns focus to its
          // anchor, the shell, which hands it to the chevron.
          tabIndex={-1}
          className={shellClasses({
            look,
            size,
            corners,
            className: ['cds-split-button', className]
              .filter(Boolean)
              .join(' '),
          })}
          onFocus={(e: FocusEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget)
              button?.focus({ preventScroll: true });
            onFocus?.(e);
          }}
          onMouseDown={(e) => {
            // A press on the shell itself (between cells) doesn't focus it.
            if (e.target === e.currentTarget) e.preventDefault();
            onMouseDown?.(e);
          }}>
          <button
            type="button"
            className={cellClasses({
              look,
              role: 'label',
              disabled,
              busy,
              className: swap.restHidden && 'cds-btn-cell--swapped',
            })}
            style={{ ...cutStyle(rowCuts(0, 2)), ...swap.vars }}
            disabled={disabled}
            aria-busy={busy || undefined}
            aria-disabled={busy || undefined}
            onClick={act}>
            <span className="cds-btn-cell__label">{label}</span>
            {swap.spinner ? (
              <Spinner
                className="cds-btn__spinner"
                size={16}
                variant="neutral"
                active={swap.spinning}
              />
            ) : null}
          </button>
          <button
            ref={setButton}
            type="button"
            className={cellClasses({
              look,
              role: 'chevron',
              disabled: triggerOff,
            })}
            style={cutStyle(rowCuts(1, 2))}
            disabled={triggerOff}
            aria-label={moreLabel}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={open ? menuId : undefined}
            data-motion-icon-frame=""
            {...handlers}>
            <ChevronDownToggle
              size={16}
              toggled={open}
              disableToggle
              aria-hidden="true"
            />
          </button>
        </div>
        <Menu
          id={menuId}
          label={moreLabel}
          open={open}
          onClose={() => setOpen(false)}
          anchor={anchor}
          menuAlignment={menuAlignment}
          fitAnchor
          target={menuTarget}
          origin={origin}
          initialFocus={initialFocus}
          size={menuSizeFor(size, menuSize)}
          motion={motion}
          onMove={onMove}
          variant={menuVariant}
          lowContrast={lowContrast}
          // Its menu is 8px whatever the trigger's shape: a pill only when
          // `corners` (or KitDefaults') asks for one.
          corners={corners}
          contour={contour}
          outlinedFill={outlinedFill}
          outline={outline}
          shadow={shadow}>
          {children}
        </Menu>
      </>
    );
  }
);
SplitButton.displayName = 'SplitButton';
