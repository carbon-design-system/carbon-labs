/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** Marks `el` held (`data-held`) until the press is released or cancelled (a touch turned scroll). */
export function holdUntilRelease(el: HTMLElement): void {
  el.dataset.held = '';
  const end = () => {
    delete el.dataset.held;
    window.removeEventListener('pointerup', end);
    window.removeEventListener('pointercancel', end);
  };
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);
}
