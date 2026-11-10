/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useLayoutEffect, useRef, type RefObject } from 'react';

/* ============================================================================
 * The move's ends — for a selector that is only a line (vertical line tabs)
 * ============================================================================
 *
 * The kit draws each label twice and windows the selected face to the
 * selector's live box (selection-kit.scss, `.sel__face--on`), so a label
 * takes its selected color where the selector covers it, mid-glide. With a
 * filled selector that is right: the fill is there, under the label. With a
 * selector that is a 2px bar on the list's side, the box is invisible, so
 * every row a glide passes over would light up, primary and heavier, and go
 * out again, one after another: a blink.
 *
 * `.sel--ends` on the root (selection-kit.scss) restyles only the move's two
 * ends: the row it leaves and the row it lands on. Every row in between
 * keeps its unselected face, whole, and its hover, as the bar slides past
 * (the stillness standard: what isn't the subject stays still). The row it
 * lands on is the selected one; this hook marks the row it leaves
 * (`data-sel-from`) from the change until the selector has left it (the
 * engine drops `data-selection-covered`), so its label hands back to
 * unselected exactly as the bar's span leaves it, as the new one's comes in.
 *
 * `selected` is the selected item's element (or null). Only marks while `on`.
 * ========================================================================== */

const FROM = 'data-sel-from';
const COVERED = 'data-selection-covered';
/** The rows still marked, and their watchers (one each). */
const watching = new WeakMap<Element, MutationObserver>();

function markFrom(el: Element) {
  if (!el.hasAttribute(COVERED)) {
    return;
  }
  el.setAttribute(FROM, '');
  if (watching.has(el)) {
    return;
  }
  const mo = new MutationObserver(() => {
    if (el.hasAttribute(COVERED)) {
      return;
    }
    el.removeAttribute(FROM);
    mo.disconnect();
    watching.delete(el);
  });
  mo.observe(el, { attributes: true, attributeFilter: [COVERED] });
  watching.set(el, mo);
}

export function useSelectionEnds(
  rootRef: RefObject<HTMLElement | null>,
  selected: () => Element | null | undefined,
  on: boolean,
  key: unknown
) {
  const prev = useRef<Element | null>(null);
  useLayoutEffect(() => {
    const el = selected() ?? null;
    const from = prev.current;
    prev.current = el;
    if (
      on &&
      from &&
      from !== el &&
      from.isConnected &&
      rootRef.current?.contains(from)
    ) {
      markFrom(from);
    }
  });
  // Turned off (another frame) or a new layout: nothing is left marked.
  useLayoutEffect(() => {
    if (on) {
      return;
    }
    rootRef.current?.querySelectorAll(`[${FROM}]`).forEach((el) => {
      el.removeAttribute(FROM);
      watching.get(el)?.disconnect();
      watching.delete(el);
    });
  }, [on, key, rootRef]);
}
