/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  Children,
  Fragment,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ElementType,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { createPortal } from 'react-dom';
import {
  attachRollover,
  usePrefersReducedMotion,
} from '@carbon-labs/v12-motion';
import { MenuToggle } from '@carbon-labs/react-motion-icons';
import { IconButton } from '@carbon-labs/react-tooltip';
import {
  AppShellActionsSlotContext,
  AppShellContext,
  AppShellFootSlotContext,
  AppShellHeaderSlotContext,
  AppShellMenuButtonContext,
  type AppShellHeaderPlacement,
} from './context';
import { ThemeZone, type ZoneTheme } from '@carbon-labs/react-theme-zone';
import './app-shell.scss';
import { assignRef } from '@carbon-labs/react-util';
import { isRtl, useReducedGetter } from '@carbon-labs/react-util';

/* ============================================================================
 * Header — the kit's global header
 * ============================================================================
 *
 * 48px, square.
 *
 *   frame     flush: a bar, the quiet surface (`--cds-surface`) and a
 *             hairline under it (`--cds-surface-rule`); ghost: no surface and
 *             no hairline, on what's behind it. In an AppShell, ghost in every
 *             place (`HEADER_FRAME_AT`), on the shell's chrome; outside one,
 *             flush. Its own `frame` wins
 *   theme     each frame's own default (`HEADER_THEME`): a flush bar is dark
 *             on every theme, as Carbon's UI shell; a ghost header is the theme
 *             round it (in an AppShell, the chrome's: dark by default).
 *             `light`, `dark`, `page` or `inverse` (the opposite of the theme
 *             round it) can be given
 *   in the nav column (AppShell `headerPlacement="nav"`, medium and wider)
 *             the name is the column's top row and the actions are pinned to
 *             its foot (AppShellFootSlotContext), ghost; on a rail, the logo
 *             alone (the name kept for assistive tech) and the actions
 *             stacked as the rail's icons
 *
 *   menu      a ghost lg IconButton, `corners="full"`, shown while the shell's nav is an
 *             overlay; it opens the nav and, while it's open, is its Close
 *             (Carbon's HeaderMenuButton): the Menu icon match-cuts to Close
 *             (motion-icons' MenuToggle, at once under reduced motion), its
 *             name changing with it. Focus comes back to it when the nav
 *             closes. Outside an AppShell, `menuButton`, `menuOpen`,
 *             `menuControls` and `menuButtonRef` wire it to a nav of the
 *             caller's (NavOverlay)
 *   home      the product name, a link: an optional logo, the name, and an
 *             optional product in semibold; the rollover (a glow inset 4px
 *             from the bar, fully rounded, as the ghost IconButtons beside
 *             it) and the family's keyboard-only ring
 *   actions   the global actions, at the end: IconButtons, ghost, lg,
 *             `corners="full"` (the header's round hover)
 *   overflow  while the nav is an overlay (`actionsOverflow`), the actions
 *             that don't fit beside the name move into the top of the
 *             overlay (NavOverlay's actions row), the first ones first, so
 *             the last (a profile, a switcher) keeps its place longest. Fit
 *             is measured: the room past the name against each action's
 *             width, as the header resizes. While the overlay is shut they
 *             aren't drawn; open, they're its first stops
 * ========================================================================== */

/** The header's theme: a Carbon theme, `page` (the page's own) or `inverse` (the opposite of the theme round it). */
export type HeaderTheme = ZoneTheme;
/** What the header stands on: `flush`, its own bar (the quiet surface, a hairline under it), or `ghost`, no surface of its own. */
export type HeaderFrame = 'flush' | 'ghost';
export const HEADER_FRAMES: readonly HeaderFrame[] = ['flush', 'ghost'];
/** Each place in an AppShell's frame when none is given: ghost, on the shell's chrome. Outside a shell, `flush`. */
export const HEADER_FRAME_AT: Record<AppShellHeaderPlacement, HeaderFrame> = {
  bar: 'ghost',
  nav: 'ghost',
};
/** Each frame's theme when none is given: a flush bar dark (as Carbon's UI shell), a ghost header the page's own. */
export const HEADER_THEME: Record<HeaderFrame, HeaderTheme> = {
  flush: 'dark',
  ghost: 'page',
};

export interface HeaderProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children'
> {
  /** The header's accessible name (a banner landmark). */
  'aria-label': string;
  /** The product name. */
  name: ReactNode;
  /** A product after the name, in semibold. */
  product?: ReactNode;
  /** A logo before the name (a 20px icon). (`mark` is the vocabulary's boolean for a status mark.) */
  logo?: ReactNode;
  /** Where the name links. Default `/`. */
  href?: string;
  /** Render the home link as this (a router's link); it gets `href`, or `linkProps`. */
  linkAs?: ElementType;
  /** More props for the home link (a router link's `to`). */
  linkProps?: Record<string, unknown>;
  /** The global actions: IconButtons, `frame="ghost"`, `size="lg"`, `corners="full"`. */
  actions?: ReactNode;
  // @carbon-proposal api: frame-prop — What a component stands on is one `frame` prop (ghost, inset, flush, floating or line), so structure is never said by a kind or a colour. TBD
  /** `flush` (a bar on the quiet surface, a hairline under it) or `ghost` (no surface, no hairline). Default `ghost` in an AppShell (`HEADER_FRAME_AT`), `flush` outside one. */
  frame?: HeaderFrame;
  /** `light`, `dark`, `page` (the theme round it) or `inverse`. Default the frame's (`HEADER_THEME`): flush `dark`, as Carbon's UI shell; ghost `page`. */
  theme?: HeaderTheme;
  /** Show the menu button. Default: while the shell's nav is an overlay. */
  menuButton?: boolean;
  /** The menu button's name while the nav is shut. Default "Open menu". */
  menuLabel?: string;
  /** Its name while the nav is open. Default "Close menu". */
  closeMenuLabel?: string;
  /** Called on the menu button, as well as the shell's toggle. */
  onMenuClick?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  /** Outside an AppShell: the nav the menu button opens is open (its `aria-expanded`). Inside one, the shell's. */
  menuOpen?: boolean;
  /** Outside an AppShell: the id of the nav it opens (its `aria-controls`, while open). */
  menuControls?: string;
  /** The menu button: where a nav outside an AppShell sends focus back as it closes. */
  menuButtonRef?: Ref<HTMLButtonElement>;
  /**
   * Move the actions that don't fit into the nav overlay's actions row. Default: inside an
   * AppShell, while its nav is an overlay. Outside one, set it while your nav is a NavOverlay.
   */
  actionsOverflow?: boolean;
  /** Outside an AppShell: the overlay's actions row (NavOverlay's `actionsRef`); null while it's shut. */
  actionsOverflowTarget?: HTMLElement | null;
  /** Slow motion: multiplies the rollover's durations. Default 1. */
  timeScale?: number;
}

/** The actions one by one: fragments opened up (`<>…</>` is the usual way to pass several). */
function actionList(node: ReactNode): ReactNode[] {
  return Children.toArray(node).flatMap((c) =>
    isValidElement<{ children?: ReactNode }>(c) && c.type === Fragment
      ? actionList(c.props.children)
      : [c]
  );
}

/** An element's width with its inline margins. */
function outerWidth(el: Element): number {
  const cs = getComputedStyle(el);
  return (
    el.getBoundingClientRect().width +
    (parseFloat(cs.marginInlineStart) || 0) +
    (parseFloat(cs.marginInlineEnd) || 0)
  );
}

export function Header({
  name,
  product,
  logo,
  href = '/',
  linkAs,
  linkProps,
  actions,
  frame: frameProp,
  theme: themeProp,
  menuButton,
  menuLabel = 'Open menu',
  closeMenuLabel = 'Close menu',
  onMenuClick,
  menuOpen,
  menuControls,
  menuButtonRef,
  actionsOverflow,
  actionsOverflowTarget,
  timeScale = 1,
  className,
  ...rest
}: HeaderProps) {
  const shell = useContext(AppShellContext);
  const menuRef = useContext(AppShellMenuButtonContext);
  const shellSlot = useContext(AppShellActionsSlotContext);
  const footSlot = useContext(AppShellFootSlotContext);
  // Where the shell placed it (null outside one): its frame's default is the place's, flush outside a shell.
  const placed = useContext(AppShellHeaderSlotContext);
  const frame = frameProp ?? (placed ? HEADER_FRAME_AT[placed] : 'flush');
  const theme = themeProp ?? HEADER_THEME[frame];
  const rootRef = useRef<HTMLElement | null>(null);
  const homeRef = useRef<HTMLElement | null>(null);
  const reduced = usePrefersReducedMotion();
  const rolloverReduced = useReducedGetter();

  // Hover, Press, Release on the home link.
  useEffect(() => {
    const home = homeRef.current;
    if (!home) return;
    return attachRollover(home, {
      selector: '.cds-app-header__home',
      timeScale,
      reduced: rolloverReduced,
    });
  }, [timeScale, rolloverReduced]);

  const setMenuRef = useCallback(
    (el: HTMLButtonElement | HTMLAnchorElement | null) => {
      const button = el instanceof HTMLButtonElement ? el : null;
      if (menuRef) menuRef.current = button;
      assignRef(menuButtonRef, button);
    },
    [menuRef, menuButtonRef]
  );

  const showMenu = menuButton ?? shell?.navMode === 'overlay';
  // In the shell's nav column: the actions at its foot, the logo alone on a rail.
  const inNav = placed === 'nav';
  const logoOnly = inNav && shell?.navMode === 'rail' && logo != null;

  // The actions, and how many of them (from the start) are in the overlay.
  const items = actionList(actions);
  const n = items.length;
  const overflowOn =
    !inNav && (actionsOverflow ?? shell?.navMode === 'overlay') && n > 0;
  const target =
    actionsOverflowTarget !== undefined ? actionsOverflowTarget : shellSlot;
  const [overflowState, setOverflow] = useState(0);
  const overflow = overflowOn ? Math.min(overflowState, n) : 0;
  // Each action's width, measured while it is in the bar (one in the overlay
  // can't be measured there), kept while there are as many actions.
  const widths = useRef<{ n: number; w: (number | undefined)[] }>({
    n: 0,
    w: [],
  });

  // Fit: the room past the name against the actions' widths, the last first.
  // An action not measured yet goes back in the bar first (before the paint:
  // a layout effect), and the next pass settles it.
  useLayoutEffect(() => {
    const home = homeRef.current;
    const bar = home?.parentElement;
    if (!overflowOn || !home || !bar) return;
    if (widths.current.n !== n) widths.current = { n, w: [] };
    const measure = () => {
      const w = widths.current.w;
      bar
        .querySelectorAll<HTMLElement>(
          ':scope > .cds-app-header__actions > [data-action-index]'
        )
        .forEach((el) => {
          w[Number(el.dataset.actionIndex)] = outerWidth(el);
        });
      // What the name takes, from the bar's inline start: its left edge, or
      // its right right to left.
      const b = bar.getBoundingClientRect();
      const h = home.getBoundingClientRect();
      const room =
        bar.clientWidth - (isRtl(bar) ? b.right - h.left : h.right - b.left);
      let fit = 0;
      let used = 0;
      for (let i = n - 1; i >= 0; i--) {
        const wi = w[i];
        if (wi === undefined) return setOverflow(0);
        if (used + wi > room + 0.5) break;
        used += wi;
        fit++;
      }
      setOverflow(n - fit);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(bar, { box: 'border-box' });
    ro.observe(home, { box: 'border-box' });
    return () => ro.disconnect();
  }, [overflowOn, n, showMenu, overflow]);

  // The shell's nav, else the caller's.
  const open = shell ? shell.navOpen : (menuOpen ?? false);
  const expanded = shell || menuOpen !== undefined ? open : undefined;
  const controls = open ? (shell ? shell.navId : menuControls) : undefined;
  const Home: ElementType = linkAs ?? 'a';

  const body = (
    <>
      {showMenu && (
        <IconButton
          ref={setMenuRef}
          frame="ghost"
          size="lg"
          corners="full"
          align="bottom-start"
          label={open ? closeMenuLabel : menuLabel}
          aria-expanded={expanded}
          aria-controls={controls}
          className="cds-app-header__menu"
          timeScale={timeScale}
          onClick={(e) => {
            onMenuClick?.(e as ReactMouseEvent<HTMLButtonElement>);
            shell?.toggleNav();
          }}>
          {/* Carbon's HeaderMenuButton: Close while the nav is open, the
              icon's own match cut, at once under the kit's reduced motion
              (a page's Reduced motion setting too, not only the OS's); the
              button carries the name. */}
          <MenuToggle
            size={20}
            toggled={open}
            disableToggle
            animated={!reduced}
            aria-hidden="true"
          />
        </IconButton>
      )}
      <Home
        ref={homeRef}
        href={linkAs ? undefined : href}
        {...linkProps}
        className="cds-app-header__home"
        data-motion-icon-frame="">
        {logo != null && <span className="cds-app-header__logo">{logo}</span>}
        {/* On a rail, the logo alone: the name kept for assistive tech. */}
        <span
          className={
            logoOnly
              ? 'cds-app-header__words cds-app-header__words--hidden'
              : 'cds-app-header__words'
          }>
          <span className="cds-app-header__name">{name}</span>
          {product != null && (
            <span className="cds-app-header__product">{product}</span>
          )}
        </span>
      </Home>
      {/* In the nav column: the actions pinned to its foot. */}
      {inNav &&
        n > 0 &&
        footSlot &&
        createPortal(
          <div
            className="cds-app-header__actions cds-app-header__actions--foot"
            role="group"
            aria-label={rest['aria-label']}>
            {items.map((node, i) => (
              <span key={i} className="cds-app-header__action">
                {node}
              </span>
            ))}
          </div>,
          footSlot
        )}
      {!inNav && n > overflow && (
        <div className="cds-app-header__actions">
          {items.slice(overflow).map((node, k) => (
            <span
              key={overflow + k}
              className="cds-app-header__action"
              data-action-index={overflow + k}>
              {node}
            </span>
          ))}
        </div>
      )}
      {/* The ones that don't fit: in the overlay's actions row while it's there. */}
      {overflow > 0 &&
        target &&
        createPortal(
          items.slice(0, overflow).map((node, i) => (
            <span key={i} className="cds-app-header__action">
              {node}
            </span>
          )),
          target
        )}
    </>
  );

  const classes = [
    'cds-app-header',
    `cds-app-header--${frame}`,
    showMenu && 'cds-app-header--menu',
    inNav && 'cds-app-header--in-nav',
    logoOnly && 'cds-app-header--logo-only',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const attrs = {
    'data-actions-overflow': overflow > 0 ? overflow : undefined,
    'data-frame': frame,
  };
  if (theme !== 'page')
    return (
      <ThemeZone
        as="header"
        ref={rootRef}
        theme={theme}
        {...rest}
        {...attrs}
        className={classes}>
        {body}
      </ThemeZone>
    );
  return (
    <header ref={rootRef} {...rest} {...attrs} className={classes}>
      {body}
    </header>
  );
}
