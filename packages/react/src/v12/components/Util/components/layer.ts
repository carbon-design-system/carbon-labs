/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  useEffect,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from 'react';
import { useLatest } from '@carbon-labs/v12-motion';

/* ============================================================================
 * The page's layers — the modal (ComposedModal), the side panel and the
 * tearsheet — and what they share. A leaf: it imports no component, so a
 * SidePanel-only app doesn't load the modal.
 *
 *   stack    one stack of the open layers, oldest first, whatever their
 *            kind: Escape, the focus guard and a press outside belong to
 *            the topmost. A modal opened from a panel is above it (it
 *            closes first); a panel or tearsheet opened from a modal is
 *            above the modal, so the modal's guard leaves its focus alone
 *   escape   the topmost layer asks to close (unless something inside
 *            already handled the key: a menu)
 *   trap     a modal layer (a modal, a tearsheet, a side panel with an
 *            overlay): focus that escapes it is brought back, Tab wraps
 *            inside it. Menus, popovers and tooltips opened from inside it
 *            are left alone, as are its `selectorsFloatingMenus`, and any
 *            layer above it
 *   outside  a press that starts and ends on the given element (the overlay)
 *            on the topmost layer
 * ========================================================================== */

const layers: object[] = [];

export function enterLayer(token: object): void {
  if (!layers.includes(token)) {
    layers.push(token);
  }
}

export function leaveLayer(token: object): void {
  const i = layers.indexOf(token);
  if (i >= 0) {
    layers.splice(i, 1);
  }
}

/** The open layers, oldest first (a copy): for tests and diagnostics. */
export function openLayers(): readonly object[] {
  return [...layers];
}

/** `token` is the topmost open layer: the keys, the focus guard and a press outside are its. */
export function isTopLayer(token: object): boolean {
  return layers[layers.length - 1] === token;
}

/**
 * Floating layers opened from inside a layer: focus there is theirs. (A
 * modal opened from a layer needs no entry: it is above it in the stack.)
 */
const FLOATING = [
  '[data-cds-menu]',
  '.cds-menu-portal',
  '.cds-popover',
  '.sel__tip',
];

/** The ones a press outside dismisses first (not tooltips). */
const DISMISSABLE = ['[data-cds-menu]', '.cds-menu-portal > *', '.cds-popover'];

/**
 * Whether a dismissable floating layer is up (shown, not leaving): a press
 * outside that only dismisses it doesn't also close the layer under it.
 */
export function floatingOpen(extra: string[] = []): boolean {
  for (const sel of [...DISMISSABLE, ...extra]) {
    for (const n of Array.from(document.querySelectorAll<HTMLElement>(sel))) {
      if (n.closest('[data-leaving], [hidden]') || !n.getClientRects().length) {
        continue;
      }
      if (getComputedStyle(n).visibility !== 'hidden') {
        return true;
      }
    }
  }
  return false;
}

const TABBABLE = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/** The tab stops inside `root`, in order (visible, not in an inert or leaving layer). */
export function tabbablesIn(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(TABBABLE)).filter(
    (el) =>
      el.tabIndex >= 0 &&
      el.getClientRects().length > 0 &&
      !el.closest('[inert]')
  );
}

function inFloating(n: Node | null, extra: string[] = []): boolean {
  if (!(n instanceof Element)) {
    return false;
  }
  return [...FLOATING, ...extra].some((s) => n.closest(s));
}

/** Tab wraps inside `el` (a surface's onKeyDown). */
export function wrapTab(
  e: ReactKeyboardEvent<HTMLElement>,
  el: HTMLElement | null
): void {
  if (
    e.key !== 'Tab' ||
    !el ||
    !el.contains(e.target as Node) ||
    e.defaultPrevented
  ) {
    return;
  }
  const stops = tabbablesIn(el);
  const first = stops[0];
  const last = stops[stops.length - 1];
  if (!first || !last) {
    e.preventDefault();
    el.focus();
  } else if (e.shiftKey && (e.target === first || e.target === el)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && e.target === last) {
    e.preventDefault();
    first.focus();
  }
}

/**
 * Where focus starts in a layer: `selector`, else the first tab stop in its
 * body (`body`), else the close button (`[data-layer-close]`), else the
 * surface itself.
 */
export function focusInto(
  el: HTMLElement | null,
  selector?: string,
  body?: HTMLElement | null
): void {
  if (!el) {
    return;
  }
  const pick =
    (selector ? el.querySelector<HTMLElement>(selector) : null) ??
    (body ? tabbablesIn(body)[0] : null) ??
    el.querySelector<HTMLElement>('[data-layer-close]') ??
    el;
  pick.focus({ preventScroll: true });
}

export interface LayerKeysOptions {
  open: boolean;
  token: object;
  surface: RefObject<HTMLElement | null>;
  /** Escape on the topmost layer. */
  onEscape: (e: KeyboardEvent) => void;
  /** Keep focus inside (a modal layer). */
  trap: boolean;
  /** Where focus goes back to when it escapes. */
  refocus: () => void;
  selectorsFloatingMenus?: string[];
}

/** Escape and the focus guard, while open. */
export function useLayerKeys(o: LayerKeysOptions): void {
  const latest = useLatest(o);
  useEffect(() => {
    if (!o.open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      const { token, onEscape } = latest.current;
      // An Escape that cancels a composition is the input method's (inline: this file imports no kit module).
      if (
        e.key !== 'Escape' ||
        e.defaultPrevented ||
        e.isComposing ||
        e.keyCode === 229 ||
        !isTopLayer(token)
      ) {
        return;
      }
      e.preventDefault();
      onEscape(e);
    };
    const onFocus = (e: FocusEvent) => {
      const { token, surface, trap, refocus, selectorsFloatingMenus } =
        latest.current;
      const el = surface.current;
      const t = e.target as Node | null;
      if (!trap || !el || !isTopLayer(token) || !t || el.contains(t)) {
        return;
      }
      if (inFloating(t, selectorsFloatingMenus)) {
        return;
      }
      refocus();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('focusin', onFocus);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('focusin', onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [o.open]);
}

/**
 * A press outside: it starts and ends on one of `targets()` (the overlay, the
 * layer's own backdrop), on the topmost layer, with the main button. Window
 * capture, so nothing in the page can hide it. `skip()`, read as the press
 * starts, lets it pass (the modal: a menu opened from it is up, and the
 * press only dismisses that).
 */
export function usePressOutside(
  open: boolean,
  token: object,
  targets: () => (Element | null)[],
  onPress: (e: PointerEvent) => void,
  skip?: () => boolean
): void {
  const latest = useLatest({ token, targets, onPress, skip });
  useEffect(() => {
    if (!open) {
      return;
    }
    let press: number | null = null;
    const on = (t: EventTarget | null) =>
      latest.current.targets().some((x) => x && x === t);
    const onDown = (e: PointerEvent) => {
      press = null;
      if (
        e.button !== 0 ||
        !isTopLayer(latest.current.token) ||
        !on(e.target)
      ) {
        return;
      }
      if (latest.current.skip?.()) {
        return;
      }
      press = e.pointerId;
    };
    const onUp = (e: PointerEvent) => {
      const id = press;
      press = null;
      if (id !== e.pointerId || !isTopLayer(latest.current.token)) {
        return;
      }
      if (!on(document.elementFromPoint(e.clientX, e.clientY))) {
        return;
      }
      latest.current.onPress(e);
    };
    const onCancel = () => (press = null);
    window.addEventListener('pointerdown', onDown, true);
    window.addEventListener('pointerup', onUp, true);
    window.addEventListener('pointercancel', onCancel, true);
    return () => {
      window.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('pointerup', onUp, true);
      window.removeEventListener('pointercancel', onCancel, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}
