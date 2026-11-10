/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The press that opened a modal, for the cursor origin rule (carbon-motion's
 * `pattern.pointer-origin`, principle 6):
 *
 *   pointer   the last press anywhere (client px, at pointerdown: the moment
 *             of the action), while it is the latest input and within
 *             `MODAL_CAUSE_MS` of it
 *   keyboard  a key after the press (Enter, Space on the launcher) clears it;
 *             the modal then grows from the focused launcher's centre
 *             (`modalCause`), or from
 *             its own centre when no launcher is known
 *
 * Watched from load, on the window's capture phase (passive), so a modal
 * mounted by the click that opens it still sees the press. The floating side
 * panel and the Popover keep their own copies of the same rule.
 */

/** A press counts as the modal's cause this long, ms (the Popover's rule). */
export const MODAL_CAUSE_MS = 1000;

let last: { x: number; y: number; t: number } | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointerdown',
    (e: PointerEvent) => {
      last = { x: e.clientX, y: e.clientY, t: performance.now() };
    },
    { capture: true, passive: true }
  );
  window.addEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      // A modifier alone isn't an action.
      if (!['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) {
        last = null;
      }
    },
    { capture: true, passive: true }
  );
}

/** The press that opened it, client px: the latest input, if it was a press and just now; else null. */
export function modalPressCause(): { x: number; y: number } | null {
  const p = last;
  return p && performance.now() - p.t < MODAL_CAUSE_MS
    ? { x: p.x, y: p.y }
    : null;
}

/**
 * Where a modal grows from, client px (the snap's `cause`, clamped into the
 * modal's box by the surface): the press that opened it; else, from a key,
 * the centre of the launcher that had
 * focus when it opened (`launcher`: the element focused then, or the
 * caller's launcher ref); else null, its own centre (a programmatic open,
 * focus on the body, a launcher with no box).
 */
export function modalCause(
  launcher: Element | null | undefined
): { x: number; y: number } | null {
  const press = modalPressCause();
  if (press) {
    return press;
  }
  if (
    !launcher?.isConnected ||
    launcher === document.body ||
    launcher === document.documentElement
  ) {
    return null;
  }
  const r = launcher.getBoundingClientRect();
  if (r.width <= 0 && r.height <= 0) {
    return null;
  }
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
