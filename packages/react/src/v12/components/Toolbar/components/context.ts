/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createContext, useContext, type ReactNode } from 'react';
import type {
  SelectionMotion,
  SelectionSize,
  SelectionStyleProps,
} from '@carbon-labs/react-selection-kit';

/* ============================================================================
 * What a toolbar tells the controls inside it: its size, orientation, look
 * and motion, and a registry its overflow menu reads — every control
 * registers the menu item it becomes when it doesn't fit.
 * ========================================================================== */

export type ToolbarOrientation = 'horizontal' | 'vertical';
/** What an exclusive group stands on (the kit's `frame`): `inset`, a track, or `ghost`, none. */
export type ToolbarGroupFrame = 'inset' | 'ghost';

/** The toolbar's look, as the kit's style props (the ones that apply to a row of controls). */
export type ToolbarStyleProps = Pick<
  SelectionStyleProps,
  | 'variant'
  | 'lowContrast'
  | 'corners'
  | 'interaction'
  | 'contour'
  | 'outlinedFill'
  | 'selectorGlow'
  | 'outline'
>;

/** A control's overflow entry: `el` places it; `menu` builds its items on open; `divider` marks a divider. */
export interface OverflowEntry {
  el: () => Element | null;
  menu: (key: string) => ReactNode;
  divider?: boolean;
}

export interface ToolbarContextValue {
  size: SelectionSize;
  orientation: ToolbarOrientation;
  style: ToolbarStyleProps;
  groupFrame: ToolbarGroupFrame;
  motion: SelectionMotion;
  reduced: boolean;
  /** Adds an overflow entry; returns its removal. */
  register: (entry: OverflowEntry) => () => void;
}

export const ToolbarContext = createContext<ToolbarContextValue | null>(null);

export function useToolbar(): ToolbarContextValue | null {
  return useContext(ToolbarContext);
}

/** A multiple toggle group's state, for the ToolbarToggles inside it. */
export interface ToggleGroupContextValue {
  isPressed: (value: string) => boolean;
  toggle: (value: string) => void;
  disabled: boolean;
}

export const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(
  null
);

/** The control sizes, px: Carbon's icon button sizes. */
export const CONTROL_PX = { xs: 24, sm: 32, md: 40, lg: 48 } as const;
/** The icon size, px: 16, 20 at lg (the kit's). */
export const iconPx = (size: SelectionSize): 16 | 20 =>
  size === 'lg' ? 20 : 16;
