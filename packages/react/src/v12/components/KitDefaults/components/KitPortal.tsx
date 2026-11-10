/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  useLayoutEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { KIT_BRANDS, useKitDefaults, type KitBrand } from './KitDefaults';

/* ============================================================================
 * KitPortal: the kit's portal for a surface that draws brand colour. Its
 * container carries the opener's brand zone (`data-cds-brand`) out of the
 * page, so the surface draws its hero in the zone's hue. The theme class
 * stays the component's, in `className`.
 * ========================================================================== */

/** The element a portalled surface opens from, or a getter for it (read after the commit). */
export type PortalAnchor =
  | Element
  | null
  | undefined
  | (() => Element | null | undefined);

/** The nearest brand zone's hue at `el`, if any. */
export function brandAt(el: Element | null | undefined): KitBrand | undefined {
  const v = el?.closest?.('[data-cds-brand]')?.getAttribute('data-cds-brand');
  return v && (KIT_BRANDS as readonly string[]).includes(v)
    ? (v as KitBrand)
    : undefined;
}

/** `data-cds-brand` on `ref`'s element: `anchor`'s zone, else KitDefaults'. Set after each commit; `hold` keeps it. */
export function usePortalBrand(
  ref: RefObject<Element | null>,
  anchor: PortalAnchor,
  { enabled = true, hold = false }: { enabled?: boolean; hold?: boolean } = {}
) {
  const { brand: outer } = useKitDefaults();
  const set = useRef(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || (hold && set.current)) return;
    set.current = true;
    const b = enabled
      ? (brandAt(typeof anchor === 'function' ? anchor() : anchor) ?? outer)
      : undefined;
    if (b) {
      if (el.getAttribute('data-cds-brand') !== b)
        el.setAttribute('data-cds-brand', b);
    } else if (el.hasAttribute('data-cds-brand'))
      el.removeAttribute('data-cds-brand');
  });
}

export interface KitPortalProps extends HTMLAttributes<HTMLDivElement> {
  /** Where it's rendered. Default the body. */
  target?: Element | DocumentFragment | null;
  /** The element it opens from: its brand zone is the one carried. */
  anchor?: PortalAnchor;
  /** Keep the brand it has rather than follow the anchor: true while it leaves. */
  hold?: boolean;
  children?: ReactNode;
}

/** A portal whose container carries the opener's brand. Nothing on the server. */
export function KitPortal({
  target,
  anchor,
  hold,
  children,
  ...div
}: KitPortalProps) {
  const box = useRef<HTMLDivElement>(null);
  usePortalBrand(box, anchor, { hold });
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div {...div} ref={box}>
      {children}
    </div>,
    target ?? document.body
  );
}
KitPortal.displayName = 'KitPortal';
