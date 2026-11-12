/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The color roles a chart draws its frame in (text, icons, lines, surfaces,
// focus, status), each on a v12 theme token. The roles are read from the
// card's theme at run time; the values here are the v12 themes' own, in
// OKLCH, for a render with no page to read from and for the contrast tests.
// The data colors are the palette's (palette.ts).

import { cssColorToHex, oklchToHex, type Oklch } from './color-space';

/** Each role a chart draws with, and the skin field it resolves into. */
export const CHART_COLOR_ROLES = {
  'text-primary': 'ink',
  'text-secondary': 'inkSoft',
  'text-helper-01': 'inkFaint',
  'text-inverse': 'textInverse',
  'icon-primary': 'icon',
  'icon-secondary': 'iconSoft',
  'border-strong-01': 'axis',
  'border-subtle-01': 'borderSubtle',
  'border-subtle-02': 'grid',
  focus: 'focus',
  interactive: 'accent',
  'support-success': 'success',
  'support-error': 'danger',
  'support-warning': 'warning',
  surface: 'layer',
  'layer-03': 'layer3',
  'state-hover': 'layerHover',
  'layer-selected-inverse': 'layerSelectedInverse',
  background: 'background',
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

/** The theme, as the skin and the palette read it. */
export type ChartTheme = 'light' | 'dark';

/** The themes, light first. */
export const CHART_THEMES: readonly ChartTheme[] = ['light', 'dark'];

/** A token a role reads. */
export type ChartColorToken =
  | 'text-primary'
  | 'text-secondary'
  | 'text-helper-01'
  | 'icon-primary'
  | 'icon-secondary'
  | 'border-strong-01'
  | 'border-subtle-01'
  | 'border-subtle-02'
  | 'state-hover'
  | 'layer-01'
  | 'layer-03'
  | 'surface'
  | 'background'
  | 'interactive'
  | 'support-success'
  | 'support-error'
  | 'support-warning';

/**
 * Where a role's color comes from:
 *
 * - `v12`: a token the v12 themes define.
 * - `lane`: a token the lane's shared styles set on the v12 themes: the
 *   quiet surface the Card fills with, and the page's base.
 * - `derived`: a role the v12 themes don't define, read from the v12 token
 *   that plays its part.
 * - `carbon`: a status or interactive hue the v12 themes don't define yet;
 *   they carry Carbon's from the theme each is built on (white, g100).
 */
export type ChartColorSource = 'v12' | 'lane' | 'derived' | 'carbon';

/** The token a role reads, and where it comes from. */
export interface ChartColorRead {
  token: ChartColorToken;
  source: ChartColorSource;
  /** The token read when the first is not set. */
  fallback?: ChartColorToken;
}

/** The token each role reads. */
export const CHART_COLOR_READS: Readonly<
  Record<ChartColorRole, ChartColorRead>
> = {
  'text-primary': { token: 'text-primary', source: 'v12' },
  'text-secondary': { token: 'text-secondary', source: 'v12' },
  'text-helper-01': { token: 'text-helper-01', source: 'v12' },
  // Ink on an inverse fill: the page's base, as Carbon's inverse text is
  // its page's background.
  'text-inverse': { token: 'background', source: 'derived' },
  'icon-primary': { token: 'icon-primary', source: 'v12' },
  'icon-secondary': { token: 'icon-secondary', source: 'v12' },
  'border-strong-01': { token: 'border-strong-01', source: 'v12' },
  'border-subtle-01': { token: 'border-subtle-01', source: 'v12' },
  'border-subtle-02': { token: 'border-subtle-02', source: 'v12' },
  // The lane's focus ring is the text color.
  focus: { token: 'text-primary', source: 'derived' },
  interactive: { token: 'interactive', source: 'carbon' },
  'support-success': { token: 'support-success', source: 'carbon' },
  'support-error': { token: 'support-error', source: 'carbon' },
  'support-warning': { token: 'support-warning', source: 'carbon' },
  surface: { token: 'surface', source: 'lane', fallback: 'layer-01' },
  'layer-03': { token: 'layer-03', source: 'v12' },
  'state-hover': { token: 'state-hover', source: 'v12' },
  // An inverse fill is the text color, as Carbon's selected inverse layer
  // is.
  'layer-selected-inverse': { token: 'text-primary', source: 'derived' },
  background: { token: 'background', source: 'lane' },
};

/** The v12 neutral's chroma and hue: every gray in the v12 themes. */
export const V12_NEUTRAL = { c: 0.004, h: 262 } as const;

/**
 * A v12 neutral at a lightness.
 *
 * @param l OKLCH lightness, 0 to 1.
 * @returns The color.
 */
export const v12Neutral = (l: number): Oklch => ({ l, ...V12_NEUTRAL });

/**
 * The value each token takes in each v12 theme, in OKLCH. The neutrals are
 * the themes' lightness steps; `surface` is the lane Card's fill and
 * `background` the page's base; the hues are Carbon's.
 */
export const CHART_TOKEN_VALUES: Readonly<
  Record<ChartTheme, Readonly<Record<ChartColorToken, Oklch>>>
> = {
  light: {
    'text-primary': v12Neutral(0.24),
    'text-secondary': v12Neutral(0.48),
    'text-helper-01': v12Neutral(0.5473),
    'icon-primary': v12Neutral(0.24),
    'icon-secondary': v12Neutral(0.48),
    'border-strong-01': v12Neutral(0.647),
    'border-subtle-01': v12Neutral(0.88),
    'border-subtle-02': v12Neutral(0.91),
    'state-hover': v12Neutral(0.94),
    'layer-01': v12Neutral(0.97),
    'layer-03': v12Neutral(0.94),
    surface: v12Neutral(0.97),
    background: v12Neutral(0.9851),
    interactive: { l: 0.5565, c: 0.243, h: 261.95 },
    'support-success': { l: 0.6234, c: 0.1661, h: 148.09 },
    'support-error': { l: 0.5692, c: 0.2174, h: 25.93 },
    'support-warning': { l: 0.8321, c: 0.1655, h: 90.44 },
  },
  dark: {
    'text-primary': v12Neutral(0.94),
    'text-secondary': v12Neutral(0.72),
    'text-helper-01': v12Neutral(0.5953),
    'icon-primary': v12Neutral(0.94),
    'icon-secondary': v12Neutral(0.72),
    'border-strong-01': v12Neutral(0.4987),
    'border-subtle-01': v12Neutral(0.32),
    'border-subtle-02': v12Neutral(0.36),
    'state-hover': v12Neutral(0.24),
    'layer-01': v12Neutral(0.2),
    'layer-03': v12Neutral(0.16),
    surface: v12Neutral(0.23),
    background: v12Neutral(0.1496),
    interactive: { l: 0.647, c: 0.1888, h: 260.58 },
    'support-success': { l: 0.712, c: 0.1677, h: 149.29 },
    'support-error': { l: 0.6662, c: 0.2088, h: 22.13 },
    'support-warning': { l: 0.8321, c: 0.1655, h: 90.44 },
  },
};

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
 * A role as a CSS color, for text and DOM marks: the custom property of the
 * token it reads.
 *
 * @param role The role.
 * @returns `var(--cds-<token>)`, with its fallback where it has one.
 */
export function chartColorVar(role: ChartColorRole): string {
  const { token, fallback } = CHART_COLOR_READS[role];
  return fallback
    ? `var(--cds-${token}, var(--cds-${fallback}))`
    : `var(--cds-${token})`;
}

/**
 * A role's value in a v12 theme, in OKLCH.
 *
 * @param role The role.
 * @param theme The theme.
 * @returns The value.
 */
export function chartRoleOklch(role: ChartColorRole, theme: ChartTheme): Oklch {
  return CHART_TOKEN_VALUES[theme][CHART_COLOR_READS[role].token];
}

/**
 * The card's skin: every role as sRGB, for the plot. Each role reads its
 * token through `read` (a computed style's custom property, which a v12
 * theme serves as `oklch()`), and takes the theme's value here when the
 * page sets none.
 *
 * @param theme The card's theme.
 * @param read Reads a custom property, `--cds-<token>`, on the card.
 * @returns The skin.
 */
export function resolveChartSkin(
  theme: ChartTheme,
  read?: (property: string) => string
): ChartSkin {
  const value = (token?: ChartColorToken): string | null =>
    token && read ? cssColorToHex(read(`--cds-${token}`) ?? '') : null;
  const skin = {} as ChartSkin;
  for (const role of CHART_COLOR_ROLE_NAMES) {
    const { token, fallback } = CHART_COLOR_READS[role];
    skin[CHART_COLOR_ROLES[role]] =
      value(token) ??
      value(fallback) ??
      oklchToHex(CHART_TOKEN_VALUES[theme][token]);
  }
  return skin;
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
