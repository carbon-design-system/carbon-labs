/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useEffect,
  useLayoutEffect,
  useReducer,
  type ComponentType,
  type RefObject,
} from 'react';
import { registerCastShadow } from '@carbon-labs/v12-motion';
import type { FlyoutMenuProps } from './FlyoutMenu';

/* ============================================================================
 * The rail's flyout, loaded on demand: the Menu and what it brings weigh
 * 41 kB gz, and
 * only a nav that folds to a rail ever opens it.
 *
 *   rendered   only for a nav that can fold (SideNav's `collapsible`): a nav
 *              that never folds loads none of it
 *   loaded     when the page is first idle after such a nav mounts, or on the
 *              first hover or focus of a rail group header (a header with
 *              `aria-haspopup="menu"`, only in the rail) if that comes
 *              sooner, so the module is in by the click and the first open is
 *              as instant as the next; or at the first open, if it comes first
 *   then       the same Menu, rendered the same way, as before
 * ========================================================================== */

let Impl: ComponentType<FlyoutMenuProps> | null = null;
let loading: Promise<void> | null = null;

/** Loads the flyout's Menu (once; again after a failed load). */
export function loadFlyout(): Promise<void> {
  loading ??= import('./FlyoutMenu').then(
    (m) => {
      Impl = m.FlyoutMenu;
    },
    () => {
      loading = null;
    }
  );
  return loading;
}

export interface SideNavFlyoutProps extends Omit<FlyoutMenuProps, 'fly'> {
  /** The nav: its rail headers prefetch the Menu. */
  navRef: RefObject<HTMLElement | null>;
  fly: FlyoutMenuProps['fly'] | null;
}

export function SideNavFlyout({ navRef, fly, ...rest }: SideNavFlyoutProps) {
  const [, loaded] = useReducer((n: number) => n + 1, 0);

  // The Menu can cast a shadow (`KitDefaults shadow`; none by default), and
  // registering its properties restyles the
  // whole document: on the first open that is a forced recalc in the open's
  // frame (50ms; 650ms under 4× CPU). Registered as the nav mounts, it rides
  // the page's first style pass instead (this runs before the nav's own
  // layout effects, which measure).
  useLayoutEffect(registerCastShadow, []);

  // The load starts when the page is first idle, or at the first hover or
  // focus of a rail group header if that comes sooner. Its stylesheet
  // restyles the whole document as it lands (60ms here), which a hover
  // would feel; idle, nothing is moving.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav || Impl) return;
    const load = () => {
      off();
      void loadFlyout().then(loaded);
    };
    const warm = (e: Event) => {
      if ((e.target as Element | null)?.closest?.('[aria-haspopup="menu"]'))
        load();
    };
    const idle =
      typeof requestIdleCallback === 'function'
        ? requestIdleCallback(load, { timeout: 3000 })
        : window.setTimeout(load, 1000);
    const off = () => {
      if (typeof cancelIdleCallback === 'function') cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      nav.removeEventListener('pointerover', warm);
      nav.removeEventListener('focusin', warm);
    };
    nav.addEventListener('pointerover', warm);
    nav.addEventListener('focusin', warm);
    return off;
  }, [navRef]);

  // Asked for before it loaded: open it once it has.
  useEffect(() => {
    if (fly && !Impl) void loadFlyout().then(loaded);
  }, [fly]);

  return Impl && fly ? <Impl fly={fly} {...rest} /> : null;
}
