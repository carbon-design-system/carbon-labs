/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createContext, useContext } from 'react';
import type { SizeClass } from './useSizeClass';
import type { NodeRef } from '@carbon-labs/react-util';

/** How the shell shows its nav: over the page (from the header's menu button), a rail of icons, or a panel. */
export type AppShellNavMode = 'overlay' | 'rail' | 'panel';
/** How the shell shows its panel: a full-width sheet over the page, over the page, or pushed beside main. */
export type AppShellPanelMode = 'sheet' | 'over' | 'push';

/**
 * What main stands on: `flush`, the page itself (main is a column on the
 * page, today's), or `inset`, the workspace: its own rounded surface
 * standing in from the page's edges, the nav and the header ghost beside it
 * on the page (the workspace layout).
 */
export type AppShellFrame = 'flush' | 'inset';
/** Where the header goes: `bar`, across the top; `nav`, the nav column's top row, its actions at the column's foot. */
export type AppShellHeaderPlacement = 'bar' | 'nav';

/** Where the shell draws the nav's fold toggle: the header's row in the nav column, the column's foot, or the SideNav's own row. */
export type AppShellFoldPlacement = 'header' | 'foot' | 'nav';

/** Where the shell lives: the page (the header fixed, main scrolling with the page) or its container. SidePanel's and NavOverlay's word. */
export type AppShellScope = 'page' | 'container';

/**
 * The header's height, as CSS: its one value is `--cds-app-header-height`
 * (app-shell.scss, 48px). For what is placed under the header from script,
 * as the window's scroller is.
 */
export const APP_HEADER_HEIGHT = 'var(--cds-app-header-height)';

/**
 * Each size class's nav and panel, and what an inset shell's main and a
 * header placed in the nav become there: at compact the workspace goes flush
 * and square (attached to the edges, the ladder's rule) and the header back
 * to a bar (the menu button needs it); from medium up, inset and in the nav
 * column (on a rail, the logo alone).
 */
/** One size class's layout: the nav's and the panel's modes, an inset shell's main, and where a header placed in the nav goes. */
export interface AppShellLayout {
  nav: AppShellNavMode;
  panel: AppShellPanelMode;
  main: AppShellFrame;
  header: AppShellHeaderPlacement;
}

export const APP_SHELL_LAYOUT: Record<SizeClass, AppShellLayout> = {
  compact: { nav: 'overlay', panel: 'sheet', main: 'flush', header: 'bar' },
  medium: { nav: 'rail', panel: 'over', main: 'inset', header: 'nav' },
  expanded: { nav: 'panel', panel: 'push', main: 'inset', header: 'nav' },
  large: { nav: 'panel', panel: 'push', main: 'inset', header: 'nav' },
};

/** How the overlay nav opens (`openNav`). */
export interface AppShellOpenNavOptions {
  /** A selector in the nav focused on open; default the shell's `navFocus`, else the nav's first tab stop. */
  focus?: string;
  /** Where focus goes back as it closes: `menu` (default), the header's menu button; `previous`, what had it before. */
  returnFocus?: 'menu' | 'previous';
}

/** What `useAppShell()` gives a recipe, the header or anything else in the shell. */
export interface AppShellState {
  /** The shell's size class, from its own width. */
  sizeClass: SizeClass;
  /** The nav's mode for that class. */
  navMode: AppShellNavMode;
  /** The panel's mode for that class. */
  panelMode: AppShellPanelMode;
  /** Main's frame at that class: `inset` (the workspace) or `flush`. Always flush on a flush shell. */
  mainFrame: AppShellFrame;
  /** Where the header is at that class: `bar` or `nav`. Always bar on a shell with `headerPlacement="bar"`. */
  headerPlacement: AppShellHeaderPlacement;
  /** Where the shell lives. */
  scope: AppShellScope;
  /** The overlay nav is open (only ever true while `navMode` is `overlay`). */
  navOpen: boolean;
  /** Opens the overlay nav; `options` say what takes focus in it and where focus goes back. */
  openNav: (options?: AppShellOpenNavOptions) => void;
  closeNav: () => void;
  toggleNav: () => void;
  /** The overlay nav's id (the menu button's `aria-controls`). */
  navId: string;
}

export const AppShellContext = createContext<AppShellState | null>(null);

/** The shell the caller is in, or null outside one. */
export function useAppShell(): AppShellState | null {
  return useContext(AppShellContext);
}

/** The shell's own wiring for its header: where focus goes back when the overlay nav closes. */
export const AppShellMenuButtonContext =
  createContext<NodeRef<HTMLButtonElement> | null>(null);

/** Where the shell placed the header round it: `bar` or `nav` (its column's top row); null outside a shell's header slot. */
export const AppShellHeaderSlotContext =
  createContext<AppShellHeaderPlacement | null>(null);

/** The shell's own wiring for its header: the nav column's foot, where a header placed in the nav pins its actions (null otherwise). */
export const AppShellFootSlotContext = createContext<HTMLElement | null>(null);

/** The shell's own wiring for its header: the overlay nav's actions row, where the actions that don't fit go (null while it's shut). */
export const AppShellActionsSlotContext = createContext<HTMLElement | null>(
  null
);

/**
 * The shell's own wiring for its nav: true while the shell draws the fold toggle itself (the nav column's
 * header or foot, `foldToggle`), so the SideNav leaves its own end-of-nav toggle out.
 */
export const AppShellFoldToggleContext = createContext<boolean>(false);

/** Inside an inset workspace (AppShell `frame="inset"`): what opens there takes the workspace's defaults (a contextual bar inverse). */
export const AppShellWorkspaceContext = createContext<boolean>(false);
