/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable jsdoc/require-jsdoc, jsdoc/require-param, jsdoc/require-param-type, jsdoc/require-param-description */

export const SR_ONLY_STYLE = Object.freeze({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  border: 0,
});

export const DEFAULT_A11Y_COPY = Object.freeze({
  canvasRegionLabel: '3D tenant system topology',
  canvasInstructions:
    'Use Tab to move between Primary, Core, and Foundation groups. Press Enter on a group to browse its items. In Primary, use arrow keys to move between items. Press Escape to return to group navigation.',
  primaryLayerGroupLabel: 'Primary layer',
  coreLayerGroupLabel: 'Core layer',
  foundationLayerGroupLabel: 'Foundation layer',
  primaryCarouselGroupLabel: 'Primary layer carousel',
  primaryCarouselPreviousLabel: 'Previous primary-layer page',
  primaryCarouselNextLabel: 'Next primary-layer page',
  primaryCarouselPageLabel: 'Go to primary-layer page {position} of {total}',
});

/**
 *
 * @param {Record<string, string | ((params?: Record<string, string | number>) => string)> | undefined} i18n
 * @param {string} key
 * @param {string} fallback
 * @param {Record<string, string | number>} [params]
 * @returns {string}
 */
export function resolveI18nMessage(i18n, key, fallback, params) {
  const value = i18n?.[key];
  const template =
    typeof value === 'function'
      ? value(params)
      : typeof value === 'string'
      ? value
      : fallback;
  if (typeof template !== 'string' || !params) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (_, token) => {
    const replacement = params[token];
    return replacement == null ? `{${token}}` : String(replacement);
  });
}
