/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The color lookup: the theme roles a chart draws with, and the skin field
// each resolves into. Structure only: the roles are the theme's token names,
// read from the card's theme at run time, never a value written here.

/** Each role a chart draws with, and the skin field it resolves into. */
export const CHART_COLOR_ROLES = {
  'text-primary': 'ink',
  'text-secondary': 'inkSoft',
  'text-helper': 'inkFaint',
  'text-inverse': 'textInverse',
  'border-strong-01': 'axis',
  'border-subtle-00': 'grid',
  'border-subtle-01': 'borderSubtle',
  interactive: 'accent',
  'support-success': 'success',
  'support-error': 'danger',
  'support-warning': 'warning',
  'layer-01': 'layer',
  'layer-03': 'layer3',
  'layer-hover-01': 'layerHover',
  'layer-hover-03': 'layer3Hover',
  'layer-selected-inverse': 'layerSelectedInverse',
  background: 'background',
  'background-inverse': 'backgroundInverse',
  'background-inverse-hover': 'backgroundInverseHover',
} as const;

/** A theme role a chart draws with. */
export type ChartColorRole = keyof typeof CHART_COLOR_ROLES;

/** A field of the resolved skin. */
export type ChartSkinField = (typeof CHART_COLOR_ROLES)[ChartColorRole];

/** Every role, resolved against the card's theme: one color per field. */
export type ChartSkin = Record<ChartSkinField, string>;

/** Every role, in the order the lookup lists them. */
export const CHART_COLOR_ROLE_NAMES = Object.keys(
  CHART_COLOR_ROLES
) as ChartColorRole[];

/**
 * The skin field a role resolves into.
 *
 * @param role The role.
 * @returns The field.
 */
export function skinFieldOf(role: ChartColorRole): ChartSkinField {
  return CHART_COLOR_ROLES[role];
}

/**
 * A role as a CSS color, for text and DOM marks: the theme's custom property.
 *
 * @param role The role.
 * @returns `var(--cds-<role>)`.
 */
export function chartColorVar(role: ChartColorRole): string {
  return `var(--cds-${role})`;
}

/**
 * A role's color in a resolved skin.
 *
 * @param skin The card's skin.
 * @param role The role.
 * @returns The color.
 */
export function roleColor(skin: ChartSkin, role: ChartColorRole): string {
  return skin[CHART_COLOR_ROLES[role]];
}
