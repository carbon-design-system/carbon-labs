/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The `d` a path is showing right now — use it as the first keyframe of a
 * `d` morph (`attrD: [liveD(el, REST), HOVER]`) so an interrupted hover
 * resumes from where the shape actually is instead of snapping to REST.
 * motion's full engine writes the `d` attribute every frame, so this is the
 * live mid-morph value. (Passing `null` as the first keyframe doesn't work
 * for `attrD`: motion reads the non-existent `attr-d` attribute.)
 */
/* @__NO_SIDE_EFFECTS__ */
export function liveD(
  el: Element | null | undefined,
  fallback: string
): string {
  return el?.getAttribute('d') ?? fallback;
}

/** Same idea for numeric attributes such as a `<line>`'s x1/y1/x2/y2. */
/* @__NO_SIDE_EFFECTS__ */
export function liveNum(
  el: Element | null | undefined,
  name: string,
  fallback: number
): number {
  const v = el ? Number.parseFloat(el.getAttribute(name) ?? '') : Number.NaN;
  return Number.isFinite(v) ? v : fallback;
}
