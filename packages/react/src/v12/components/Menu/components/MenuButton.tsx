/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import type { SelectionMoveInfo } from '@carbon-labs/v12-motion';
import { ChevronDownToggle } from '@carbon-labs/react-motion-icons';
import {
  Menu,
  type MenuAlignment,
  type MenuMotion,
  type MenuStyleProps,
} from './Menu';
import { menuSizeFor } from './menu-size';
import { useMenuTrigger } from '@carbon-labs/v12-motion';
import type { SelectionLoadingProps } from '@carbon-labs/react-selection-kit';
import {
  cellClasses,
  shellClasses,
  useShellRollover,
  type ShellLook,
} from '@carbon-labs/react-button';
import { resolveButtonLook, useWithTimeScale } from '@carbon-labs/react-props';
import { MENU_BUTTON_KIT, useKitProps } from '@carbon-labs/react-kit-defaults';

/* ============================================================================
 * MenuButton — v11's MenuButton: a labelled button that only opens a Menu,
 * its chevron turning while the menu shows (motion-icons' ChevronDownToggle).
 *
 * On the button shell (`../button/shell.ts`), one cell: the same
 * visual language as SplitButton's chevron cell — the Button's looks
 * (`kind` primary · secondary, `variant` outlined · tonal, `frame` ghost; the
 * menu's own treatment is `menuVariant`) and sizes (xs 24 … lg 48), its
 * rollover (no growth or press-in), its keyboard-only ring, the
 * chevron and its turn. Its menu is never narrower than the button. A pill by default,
 * 8px corners with `corners="rounded"`, square with `"square"`; the label
 * and the chevron each the pill's inset from their ends. The menu keeps its
 * own default (8px). `className` and the rest go on the <button>, as v11.
 * ========================================================================== */

export interface MenuButtonProps
  extends
    Omit<MenuStyleProps, 'variant'>,
    SelectionLoadingProps,
    Omit<
      ButtonHTMLAttributes<HTMLButtonElement>,
      'children' | 'onClick' | 'onKeyDown' | 'onPointerDown' | 'type'
    > {
  label: string;
  /** MenuItems. */
  children?: ReactNode;
  /** The role: `primary` (default) or `secondary`. */
  kind?: 'primary' | 'secondary';
  /** The treatment: `filled` (default), the role's fill; `outlined` (v11's tertiary) or `tonal` (the shell's quieter look). */
  variant?: 'filled' | 'outlined' | 'tonal';
  /** What it stands on: `inset` (default), its own surface; `ghost`, v11's ghost, no surface of its own. Wins over `variant`. */
  frame?: 'inset' | 'ghost';
  /** The menu's treatment (Menu's `variant`): `inverse` (default), `tonal`, `outlined`; KitDefaults' `variant` when not given. */
  menuVariant?: MenuStyleProps['variant'];
  /** The button's size, and its menu's (an xs button opens an sm menu). Default `lg`. */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Default `bottom-start`. */
  menuAlignment?: MenuAlignment;
  disabled?: boolean;
  /** Where the menu is portalled. */
  menuTarget?: Element | null;
  /** The snap starts at the press point (default) or the button's center. */
  openFrom?: 'pointer' | 'trigger';
  /** The menu's own size, when it differs from the button's. */
  menuSize?: 'xs' | 'sm' | 'md' | 'lg';
  motion?: Partial<MenuMotion>;
  /** Slow motion: multiplies the durations. Default 1. Wins over `motion.timeScale`. */
  timeScale?: number;
  onMove?: (info: SelectionMoveInfo) => void;
}

export function MenuButton({
  label,
  children,
  kind = 'primary',
  size: sizeProp,
  menuAlignment = 'bottom-start',
  disabled,
  menuTarget,
  openFrom = 'pointer',
  menuSize,
  motion: motionProp,
  timeScale,
  onMove,
  variant,
  frame,
  menuVariant: menuVariantProp,
  lowContrast,
  corners: cornersProp,
  contour,
  outlinedFill,
  outline,
  shadow,
  className,
  // The menu's rows are loading (the trigger itself isn't).
  loading,
  skeletonCount,
  skeletonLabels,
  skeletonIcon,
  ...rest
}: MenuButtonProps) {
  // KitDefaults: the provider's size, corners and menu variant (`menuVariant`) for the props not given.
  const {
    size = 'lg',
    corners,
    variant: menuVariant,
  } = useKitProps(
    { size: sizeProp, corners: cornersProp, variant: menuVariantProp },
    MENU_BUTTON_KIT
  );
  const motion = useWithTimeScale(motionProp, timeScale);
  const { open, setOpen, button, setButton, origin, initialFocus, handlers } =
    useMenuTrigger({
      openFrom,
      disabled,
      timeScale: motion?.timeScale,
    });
  const menuId = `cds-menubutton-${useId().replace(/:/g, '')}`;
  const shellRef = useRef<HTMLDivElement | null>(null);
  const look = resolveButtonLook({ kind, variant, frame }) as ShellLook;
  useShellRollover(
    shellRef,
    `${look}/${disabled}`,
    motion?.timeScale,
    look === 'neutral'
  );
  return (
    <>
      <div
        ref={shellRef}
        className={shellClasses({
          look,
          size,
          corners: corners ?? 'full',
          className: 'cds-menu-button',
        })}>
        <button
          {...rest}
          ref={setButton}
          type="button"
          className={cellClasses({ look, role: 'menu', disabled, className })}
          disabled={disabled}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          data-motion-icon-frame=""
          {...handlers}>
          <span className="cds-btn-cell__label">{label}</span>
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
        label={label}
        open={open}
        onClose={() => setOpen(false)}
        anchor={button}
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
        // A menu from a pill is a pill: full by default, as its trigger.
        corners={corners ?? 'full'}
        contour={contour}
        outlinedFill={outlinedFill}
        outline={outline}
        shadow={shadow}
        loading={loading}
        skeletonCount={skeletonCount}
        skeletonLabels={skeletonLabels}
        skeletonIcon={skeletonIcon}>
        {children}
      </Menu>
    </>
  );
}
MenuButton.displayName = 'MenuButton';
