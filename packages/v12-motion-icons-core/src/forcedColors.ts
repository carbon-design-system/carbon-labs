/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Status tones under forced colors (Windows High Contrast and the like): the
 * user's palette applies. A toned mark or pill paints with a theme custom
 * property (`var(--cds-support-*)`, status.ts TONE), which a forced-colors
 * browser leaves alone in SVG, so these rules move every toned paint to
 * `currentColor` (the forced text colour). The knockouts are geometry, so
 * they hold in any colour. The toned warning's dark "!" (status.ts
 * WARN_BANG) goes: it fills a hole knocked out of the triangle, so the
 * forced background shows through there, against the forced text colour
 * of the triangle, whatever the user's palette. (Matched by its key's
 * ending, `status-bang`, so the shadow styles never spell `data-k=`: a
 * still's server output has no keyed shapes.)
 *
 * Its own module (a string and a few lines), so an icon pays for it only
 * where its binding uses it: the web components put it in every element's
 * shadow styles; the React package adds it once per document or shadow root
 * an icon with a status or a pip renders in (`adoptForcedColors`).
 */
export const FORCED_COLORS_CSS =
  '@media (forced-colors: active) {' +
  ' [data-mc-ink] [stroke^="var("] { stroke: currentColor; }' +
  ' [data-mc-ink] [fill^="var("] { fill: currentColor; }' +
  ' [data-mc-ink] [data-k$="-bang"] { fill: none; }' +
  ' }';

const adopted = new WeakSet<Node>();

/** Add FORCED_COLORS_CSS once to the document or shadow root `el` renders in. */
export function adoptForcedColors(el: Element): void {
  const root = el.getRootNode();
  if (adopted.has(root)) {
    return;
  }
  const doc = el.ownerDocument;
  const into =
    root.nodeType === 9
      ? doc.head
      : root.nodeType === 11
        ? (root as ShadowRoot)
        : null;
  if (!into) {
    return;
  }
  const style = doc.createElement('style');
  style.setAttribute('data-motion-icons', 'forced-colors');
  style.textContent = FORCED_COLORS_CSS;
  into.appendChild(style);
  adopted.add(root);
}
