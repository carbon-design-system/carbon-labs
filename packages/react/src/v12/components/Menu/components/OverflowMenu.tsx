/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useId,
  type ButtonHTMLAttributes,
  type ElementType,
  type ReactNode,
} from 'react';
import type { SelectionMoveInfo } from '@carbon-labs/v12-motion';
import { OverflowMenuVertical } from '@carbon-labs/react-motion-icons';
import { Menu, type MenuMotion, type MenuStyleProps } from './Menu';
import { menuSizeFor } from './menu-size';
import { useMenuTrigger } from '@carbon-labs/v12-motion';
import type { SelectionLoadingProps } from '@carbon-labs/react-selection-kit';
import { iconSizeFor, useWithTimeScale } from '@carbon-labs/react-props';

/* ============================================================================
 * OverflowMenu — v11's OverflowMenu (the v12 one, whose children are
 * MenuItems): an icon button that opens a Menu. The trigger is an icon
 * button with the rollover, its fill inset inside its box by the kit's inset;
 * a circle by default, 8px corners with `corners="rounded"`; its
 * motion icon plays on hover.
 * ========================================================================== */

export interface OverflowMenuProps
  extends
    MenuStyleProps,
    SelectionLoadingProps,
    Omit<
      ButtonHTMLAttributes<HTMLButtonElement>,
      'children' | 'onClick' | 'onKeyDown' | 'onPointerDown' | 'type'
    > {
  /** MenuItems. */
  children?: ReactNode;
  /** The trigger's accessible name and the menu's. Default `Options` (v11). */
  label?: string;
  /** The trigger's icon — a motion icon. Default OverflowMenuVertical. */
  renderIcon?: ElementType;
  /** The trigger's size, and its menu's (an xs trigger opens an sm menu). Default `md`. */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Default `bottom-start` (v12's); `flipped` gives `bottom-end`. */
  menuAlignment?: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
  /** v11's classic flag: align the menu's end with the trigger's. */
  flipped?: boolean;
  disabled?: boolean;
  menuTarget?: Element | null;
  /** The snap starts at the press point (default) or the trigger's center. */
  openFrom?: 'pointer' | 'trigger';
  /** The menu's own size, when it differs from the trigger's. */
  menuSize?: 'xs' | 'sm' | 'md' | 'lg';
  motion?: Partial<MenuMotion>;
  /** Slow motion: multiplies the durations. Default 1. Wins over `motion.timeScale`. */
  timeScale?: number;
  onMove?: (info: SelectionMoveInfo) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export function OverflowMenu({
  children,
  label = 'Options',
  renderIcon: Icon = OverflowMenuVertical,
  size = 'md',
  menuAlignment,
  flipped,
  disabled,
  menuTarget,
  openFrom = 'pointer',
  menuSize,
  motion: motionProp,
  timeScale,
  onMove,
  onOpen,
  onClose,
  variant,
  lowContrast,
  corners,
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
}: OverflowMenuProps) {
  const motion = useWithTimeScale(motionProp, timeScale);
  const { open, setOpen, button, setButton, origin, initialFocus, handlers } =
    useMenuTrigger({
      openFrom,
      disabled,
      timeScale: motion?.timeScale,
    });
  const menuId = `cds-overflow-${useId().replace(/:/g, '')}`;
  return (
    <>
      <button
        {...rest}
        ref={setButton}
        type="button"
        className={[
          'cds-menu-trigger',
          'cds-menu-trigger--icon',
          `cds-menu-trigger--${size}`,
          corners === 'square' && 'cds-menu-trigger--square',
          (corners ?? 'full') === 'full' && 'cds-menu-trigger--full',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        disabled={disabled}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        data-motion-icon-frame=""
        {...handlers}>
        <Icon size={iconSizeFor(size)} aria-hidden="true" />
      </button>
      <Menu
        id={menuId}
        label={label}
        open={open}
        onOpen={onOpen}
        onClose={() => {
          setOpen(false);
          onClose?.();
        }}
        anchor={button}
        menuAlignment={
          menuAlignment ?? (flipped ? 'bottom-end' : 'bottom-start')
        }
        target={menuTarget}
        origin={origin}
        initialFocus={initialFocus}
        size={menuSizeFor(size, menuSize)}
        motion={motion}
        onMove={onMove}
        variant={variant}
        lowContrast={lowContrast}
        // Its menu is 8px whatever the trigger's shape: a pill only when
        // `corners` (or KitDefaults') asks for one.
        corners={corners}
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
OverflowMenu.displayName = 'OverflowMenu';
