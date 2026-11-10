/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { usePrefersReducedMotion } from '@carbon-labs/v12-motion';
import { KitDefaults } from '@carbon-labs/react-kit-defaults';
import {
  SidePanel,
  fadeSidePanelOverlay,
  type SidePanelScope,
} from '@carbon-labs/react-side-panel';
import { tabbablesIn } from '@carbon-labs/react-util';
import { lockPageScroll } from '@carbon-labs/react-scroller';
import { useLatest } from '@carbon-labs/react-selection-kit';
import './app-shell.scss';

/* ============================================================================
 * NavOverlay — the overlay nav
 * ============================================================================
 *
 * The nav over the page, under the header, opened from the header's menu
 * button, as Carbon's UI shell below lg: the header stays live over it and
 * its menu button is the overlay's Close (no close bar of its own). A
 * SidePanel at the start (`placement="start"`, `size="xs"`) on the page's
 * background, so the nav's own panel reads as it does in a column. AppShell
 * shows its nav in one at compact; a shell of its own (the site's) can use
 * it as it is.
 *
 *   frame    the nav in it is `inset` by default, as in the column (a
 *            main nav looks the same at every width): the
 *            side panel is a framed surface, which would make it ghost, so
 *            it sets `KitDefaults frame="inset"` back; a nav's own `frame`
 *            still wins
 *
 *   top      an actions row (`actionsRef`): the header's actions that don't
 *            fit go here (Header `actionsOverflow`), above the nav; empty,
 *            it takes no room
 *   close    Escape, a press on the overlay, the menu button, or a link
 *            followed in it all ask `onRequestClose`
 *   focus    in on open (`selectorPrimaryFocus`, else the first tab stop);
 *            Tab and Shift+Tab go round the menu button and the overlay's
 *            stops (Carbon's menu button and side nav are one sequence);
 *            back to `launcherButtonRef` (else what had it) as it leaves
 *   overlay  the dim behind it, under the header; the page's scroll locked
 *            while it's there (not `scope="container"`)
 *   motion   the SidePanel's own: Snap's larger-surface entrance timed by
 *            its width, the exit a step shorter, the content riding the
 *            opening; the dim on the side panel's overlay clocks
 *            (SIDE_PANEL_MOTION). Reduced, the snap's fade and the dim on
 *            the reduced clock
 * ========================================================================== */

export interface NavOverlayProps {
  open: boolean;
  /** Every way of closing asks here; set `open` to close it. */
  onRequestClose: () => void;
  /** Its accessible name (a dialog): the nav's. Default "Navigation". AppShell's `navLabel` is passed here. */
  navLabel?: string;
  /** The dialog's id (the menu button's `aria-controls`). */
  id?: string;
  /** Where focus goes back as it leaves: the menu button. */
  launcherButtonRef?: RefObject<HTMLElement | null>;
  /** The header's menu button, its Close while open: in the Tab sequence with the overlay. */
  menuButtonRef?: RefObject<HTMLElement | null>;
  /** The actions row at its top (Header's `actionsOverflowTarget`); null while it's shut. */
  actionsRef?: Ref<HTMLDivElement>;
  /** Focused on open; default the first tab stop in the nav. */
  selectorPrimaryFocus?: string;
  /** Where it is placed: `page` (default), over the viewport; `container`, in its positioned container (SidePanel's `scope`). */
  scope?: SidePanelScope;
  /** Slow motion. Default 1. */
  timeScale?: number;
  className?: string;
  /** The nav. */
  children?: ReactNode;
}

export function NavOverlay({
  open,
  onRequestClose,
  navLabel = 'Navigation',
  id,
  launcherButtonRef,
  menuButtonRef,
  actionsRef,
  selectorPrimaryFocus,
  scope = 'page',
  timeScale = 1,
  className,
  children,
}: NavOverlayProps) {
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const release = useRef<(() => void) | null>(null);
  const reduced = usePrefersReducedMotion();
  const latest = useLatest({
    reduced,
    timeScale,
    onRequestClose,
    menuButtonRef,
  });

  // The dialog takes the nav's name (SidePanel names itself by a title it doesn't have here).
  const surface = useCallback(
    (el: HTMLDivElement | null) => {
      surfaceRef.current = el;
      el?.setAttribute('aria-label', navLabel);
    },
    [navLabel]
  );

  // The dim: the side panel's own overlay fade (`fadeSidePanelOverlay`), on its clocks.
  useLayoutEffect(() => {
    const el = dimRef.current;
    if (!el) return;
    const { reduced: r, timeScale: k } = latest.current;
    fadeSidePanelOverlay(el, open, { reduced: r, timeScale: k });
  }, [open, latest]);

  // The page's scroll, locked while it's there (let go once it has left).
  useEffect(() => {
    if (open && scope !== 'container') release.current ??= lockPageScroll();
  }, [open, scope]);
  const letGo = useCallback(() => {
    release.current?.();
    release.current = null;
  }, []);
  useEffect(() => letGo, [letGo]);

  // Tab goes round the menu button and the overlay's stops.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key !== 'Tab' ||
        e.defaultPrevented ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey
      )
        return;
      const panel = surfaceRef.current;
      const menu = latest.current.menuButtonRef?.current ?? null;
      const at = document.activeElement;
      if (
        !panel ||
        !(at instanceof HTMLElement) ||
        !(panel.contains(at) || at === menu)
      )
        return;
      const lead = menu?.isConnected ? [menu] : [];
      const stops = [...lead, ...tabbablesIn(panel)];
      if (!stops.length) return;
      const i = stops.indexOf(at);
      // From the panel itself (focused when it has nothing else): its first stop, or back round.
      const next =
        i < 0
          ? stops[
              e.shiftKey
                ? stops.length - 1
                : Math.min(lead.length, stops.length - 1)
            ]
          : stops[(i + (e.shiftKey ? -1 : 1) + stops.length) % stops.length];
      e.preventDefault();
      next?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, latest]);

  // Following a link closes it (a group's header is a button, not a link).
  const closeOnLink = (e: ReactMouseEvent<HTMLElement>) => {
    if ((e.target as Element).closest?.('a[href]')) onRequestClose();
  };

  return (
    <>
      {/* The dim: a press on it closes. It keeps focus where it is (as the side panel's overlay). */}
      <div
        ref={dimRef}
        className={[
          'cds-side-panel__overlay',
          'cds-app-shell__nav-dim',
          scope === 'container' && 'cds-side-panel__overlay--contained',
        ]
          .filter(Boolean)
          .join(' ')}
        data-open={open || undefined}
        aria-hidden="true"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => latest.current.onRequestClose()}
      />
      <SidePanel
        ref={surface}
        id={id}
        open={open}
        onRequestClose={onRequestClose}
        onUnmount={letGo}
        launcherButtonRef={launcherButtonRef}
        selectorPrimaryFocus={selectorPrimaryFocus}
        placement="start"
        size="xs"
        scope={scope}
        animateTitle={false}
        timeScale={timeScale}
        className={['cds-app-shell__nav-sheet', className]
          .filter(Boolean)
          .join(' ')}>
        <div className="cds-app-shell__nav-sheet-body" onClick={closeOnLink}>
          <div ref={actionsRef} className="cds-app-shell__nav-actions" />
          {/* A main nav is inset at every width: the panel's framed-surface default (ghost) set back. */}
          <KitDefaults frame="inset">{children}</KitDefaults>
        </div>
      </SidePanel>
    </>
  );
}
