/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The series palette: which hue and step each series takes, per theme, and
// which tier a mark needs; the steps' values in OKLCH, served as sRGB for the
// plot; and the neutrals measured series take. Data only: nothing here
// draws.

import { CHART_TOKEN_VALUES, V12_NEUTRAL, type ChartTheme } from './color';
import { contrastRatio, oklchToHex, type Oklch } from './color-space';

/** The palette's hues. */
export type PaletteHue = 'blue' | 'teal' | 'purple' | 'magenta' | 'cyan';

/** The palette's steps. */
export type PaletteStep = 20 | 30 | 40 | 50 | 60 | 70 | 80;

/** The card's theme, as the palette reads it. */
export type PaletteTheme = ChartTheme;

/** The contrast a mark needs: 3:1 for a large mark, 4.5:1 for a small one. */
export type PaletteTier = '3:1' | '4.5:1';

/** One series' color: a hue at a step. */
export interface PaletteSlot {
  hue: PaletteHue;
  step: PaletteStep;
  /** The step's name. */
  token: `${PaletteHue}-${PaletteStep}`;
}

/** The order hues are dealt in. */
export const PALETTE_HUES: readonly PaletteHue[] = [
  'blue',
  'teal',
  'purple',
  'magenta',
  'cyan',
];

/** Each hue's step on each theme: a first pass, then a second for the sixth series on. */
export const PALETTE_STEPS: Readonly<
  Record<
    PaletteTheme,
    { first: readonly PaletteStep[]; second: readonly PaletteStep[] }
  >
> = {
  light: { first: [60, 50, 70, 60, 50], second: [80, 70, 50, 80, 70] },
  dark: { first: [50, 30, 40, 50, 60], second: [30, 50, 20, 30, 40] },
};

/** The lightest and darkest steps a slot can move to. */
export const PALETTE_STEP_RANGE = { min: 20, max: 80 } as const;

/**
 * Each hue's steps in OKLCH: Carbon's color steps, which the plot draws as
 * sRGB. The first blue is the interactive blue on each theme.
 */
export const PALETTE_HUE_VALUES: Readonly<
  Record<PaletteHue, Readonly<Record<PaletteStep, Oklch>>>
> = {
  blue: {
    20: { l: 0.9085, c: 0.0443, h: 259.95 },
    30: { l: 0.8276, c: 0.0861, h: 259.9 },
    40: { l: 0.7365, c: 0.136, h: 261.08 },
    50: { l: 0.647, c: 0.1888, h: 260.58 },
    60: { l: 0.5565, c: 0.243, h: 261.95 },
    70: { l: 0.454, c: 0.221, h: 262.63 },
    80: { l: 0.363, c: 0.1839, h: 263.06 },
  },
  teal: {
    20: { l: 0.9028, c: 0.0798, h: 195.83 },
    30: { l: 0.8126, c: 0.1262, h: 193.68 },
    40: { l: 0.7222, c: 0.1229, h: 192.75 },
    50: { l: 0.6291, c: 0.1079, h: 192.37 },
    60: { l: 0.5324, c: 0.0917, h: 190.84 },
    70: { l: 0.4331, c: 0.0739, h: 194.77 },
    80: { l: 0.3411, c: 0.058, h: 199.99 },
  },
  purple: {
    20: { l: 0.911, c: 0.052, h: 302.58 },
    30: { l: 0.8364, c: 0.097, h: 301.18 },
    40: { l: 0.7493, c: 0.1531, h: 300.59 },
    50: { l: 0.663, c: 0.2075, h: 298 },
    60: { l: 0.5737, c: 0.2579, h: 294.89 },
    70: { l: 0.4679, c: 0.2189, h: 295.08 },
    80: { l: 0.3666, c: 0.167, h: 294.84 },
  },
  magenta: {
    20: { l: 0.9158, c: 0.0511, h: 349.9 },
    30: { l: 0.8403, c: 0.1026, h: 351.66 },
    40: { l: 0.7559, c: 0.1672, h: 354.52 },
    50: { l: 0.6689, c: 0.1989, h: 357.26 },
    60: { l: 0.5699, c: 0.2084, h: 1.01 },
    70: { l: 0.4649, c: 0.1723, h: 1.34 },
    80: { l: 0.3655, c: 0.1397, h: 3.27 },
  },
  cyan: {
    20: { l: 0.9021, c: 0.0571, h: 233.14 },
    30: { l: 0.8224, c: 0.102, h: 237.19 },
    40: { l: 0.7287, c: 0.1549, h: 241.66 },
    50: { l: 0.6406, c: 0.1623, h: 246.51 },
    60: { l: 0.5427, c: 0.152, h: 249.59 },
    70: { l: 0.4416, c: 0.1345, h: 252.59 },
    80: { l: 0.3466, c: 0.1035, h: 251.94 },
  },
};

/** The ratio a small mark needs against the card. */
export const SMALL_MARK_MIN = 4.5;

/** The ratio a large mark needs against the card. */
export const LARGE_MARK_MIN = 3;

/** A step on the neutral ladder. */
export type PaletteNeutralStep =
  | 10
  | 20
  | 30
  | 40
  | 50
  | 60
  | 70
  | 80
  | 90
  | 100;

/** A neutral's name. */
export type PaletteNeutral = `neutral-${PaletteNeutralStep}`;

/**
 * The neutral ladder: the v12 neutral (the themes' own chroma and hue) at the
 * OKLCH lightness of each of Carbon's gray steps, so a measured series reads
 * as one family with the page and the text.
 */
export const PALETTE_NEUTRAL_LIGHTNESS: Readonly<
  Record<PaletteNeutralStep, number>
> = {
  10: 0.9672,
  20: 0.9067,
  30: 0.8266,
  40: 0.7316,
  50: 0.6434,
  60: 0.5417,
  70: 0.4386,
  80: 0.3446,
  90: 0.2686,
  100: 0.2002,
};

/** The neutrals a theme gives measured series. */
export interface PaletteNeutrals {
  /** Neutrals that hold 4.5:1, for small marks; darkest first on light. */
  small: readonly PaletteNeutral[];
  /** The lightest neutral that holds 3:1: large marks, and quiet measured marks. */
  large: PaletteNeutral;
  /** Neutrals under 3:1: tracks and wells, never a data mark. */
  backgroundOnly: readonly PaletteNeutral[];
  /**
   * A measured series' ramp, from the ink out. Its lightest step is the
   * first that holds 3:1 on the page and the card.
   */
  measured: readonly PaletteNeutral[];
}

/** The neutrals for measured series, per theme. */
export const PALETTE_NEUTRALS: Readonly<Record<PaletteTheme, PaletteNeutrals>> =
  {
    light: {
      small: ['neutral-100', 'neutral-80', 'neutral-60'],
      large: 'neutral-50',
      backgroundOnly: ['neutral-40', 'neutral-30', 'neutral-20', 'neutral-10'],
      measured: ['neutral-100', 'neutral-60', 'neutral-50'],
    },
    dark: {
      small: ['neutral-10', 'neutral-30', 'neutral-50'],
      large: 'neutral-60',
      backgroundOnly: ['neutral-70', 'neutral-80', 'neutral-90', 'neutral-100'],
      measured: ['neutral-10', 'neutral-40', 'neutral-60'],
    },
  };

/** A palette color by name: a hue's step, or a neutral. */
export type PaletteColorName = PaletteSlot['token'] | PaletteNeutral;

/**
 * A palette color's value, in OKLCH.
 *
 * @param name A hue's step (`blue-60`) or a neutral (`neutral-50`).
 * @returns The value.
 */
export function paletteOklch(name: PaletteColorName): Oklch {
  const [hue, step] = name.split('-');
  if (hue === 'neutral') {
    return {
      l: PALETTE_NEUTRAL_LIGHTNESS[Number(step) as PaletteNeutralStep],
      ...V12_NEUTRAL,
    };
  }
  return PALETTE_HUE_VALUES[hue as PaletteHue][Number(step) as PaletteStep];
}

/**
 * A palette color as the plot draws it.
 *
 * @param name A hue's step or a neutral.
 * @returns sRGB, `#rrggbb`.
 */
export function paletteColor(name: PaletteColorName): string {
  return oklchToHex(paletteOklch(name));
}

/**
 * What a theme's marks sit on: the page's base and the card's surface.
 *
 * @param theme The theme.
 * @returns The two surfaces, in OKLCH.
 */
export function paletteSurfaces(theme: PaletteTheme): {
  page: Oklch;
  card: Oklch;
} {
  const values = CHART_TOKEN_VALUES[theme];
  return { page: values.background, card: values.surface };
}

/**
 * A color's contrast against a theme's page and card.
 *
 * @param color The color: `#rrggbb` or OKLCH.
 * @param theme The theme.
 * @returns Both ratios, and the lower.
 */
export function paletteRatios(
  color: string | Oklch,
  theme: PaletteTheme
): { page: number; card: number; min: number } {
  const { page, card } = paletteSurfaces(theme);
  const ratios = {
    page: contrastRatio(color, page),
    card: contrastRatio(color, card),
  };
  return { ...ratios, min: Math.min(ratios.page, ratios.card) };
}

/**
 * The tier a mark of this size needs: over 3px is a large mark.
 *
 * @param markPx The mark's size, px.
 * @returns The tier.
 */
export function paletteTierFor(markPx: number): PaletteTier {
  return markPx > 3 ? '3:1' : '4.5:1';
}

/**
 * The palette's theme for a card theme.
 *
 * @param theme The card's theme.
 * @returns `dark` for a dark theme, `light` otherwise.
 */
export function paletteThemeOf(theme: string): PaletteTheme {
  return /dark|g90|g100/.test(theme) ? 'dark' : 'light';
}

/**
 * A slot.
 *
 * @param hue The hue.
 * @param step The step, held to the range.
 * @returns The slot.
 */
export function paletteSlot(hue: PaletteHue, step: number): PaletteSlot {
  const s = Math.min(
    PALETTE_STEP_RANGE.max,
    Math.max(PALETTE_STEP_RANGE.min, Math.round(step / 10) * 10)
  ) as PaletteStep;
  return { hue, step: s, token: `${hue}-${s}` };
}

/**
 * The slots for `count` series: the first pass, then the second, then round
 * again. A chart that shows status leaves magenta out, so no series reads as
 * an error.
 *
 * @param theme The card's theme.
 * @param count How many series.
 * @param options Whether the chart shows status.
 * @returns One slot per series.
 */
export function paletteSlots(
  theme: PaletteTheme,
  count: number,
  { showsStatus = false }: { showsStatus?: boolean } = {}
): PaletteSlot[] {
  const { first, second } = PALETTE_STEPS[theme];
  const pass = (steps: readonly PaletteStep[]) =>
    PALETTE_HUES.map((hue, i) => paletteSlot(hue, steps[i])).filter(
      (s) => !(showsStatus && s.hue === 'magenta')
    );
  const all = [...pass(first), ...pass(second)];
  const n = Math.max(0, Math.floor(count));
  return Array.from({ length: n }, (_, i) => all[i % all.length]);
}

/**
 * The next step away from the card: darker on a light card, lighter on a dark
 * one. A small mark that fails its tier moves along its hue by these steps.
 *
 * @param slot The slot.
 * @param theme The card's theme.
 * @returns The next slot, or null past the range.
 */
export function paletteStepAway(
  slot: PaletteSlot,
  theme: PaletteTheme
): PaletteSlot | null {
  const next = slot.step + (theme === 'light' ? 10 : -10);
  return next < PALETTE_STEP_RANGE.min || next > PALETTE_STEP_RANGE.max
    ? null
    : paletteSlot(slot.hue, next);
}

/**
 * A slot for a small mark: the slot itself when it holds 4.5:1 on the page
 * and the card, or the first step away from the card that does.
 *
 * @param slot The series' slot.
 * @param theme The card's theme.
 * @returns The small mark's slot.
 */
export function paletteSmallSlot(
  slot: PaletteSlot,
  theme: PaletteTheme
): PaletteSlot {
  let s: PaletteSlot | null = slot;
  while (s) {
    if (paletteRatios(paletteOklch(s.token), theme).min >= SMALL_MARK_MIN) {
      return s;
    }
    s = paletteStepAway(s, theme);
  }
  return slot;
}

/** What the series colors are for. */
export interface PaletteSeriesOptions {
  /** The chart shows status, so magenta stays out. */
  showsStatus?: boolean;
  /** The mark's size, px: 3 or under takes the small-mark slot. */
  markPx?: number;
}

/**
 * The series colors as the plot draws them.
 *
 * @param theme The card's theme.
 * @param count How many series.
 * @param options Whether the chart shows status, and the mark's size.
 * @returns One sRGB color per series.
 */
export function paletteSeries(
  theme: PaletteTheme,
  count: number,
  { showsStatus, markPx = 8 }: PaletteSeriesOptions = {}
): string[] {
  const small = paletteTierFor(markPx) === '4.5:1';
  return paletteSlots(theme, count, { showsStatus }).map((slot) =>
    paletteColor((small ? paletteSmallSlot(slot, theme) : slot).token)
  );
}

/**
 * Both colors of each series, index for index: its large marks (a bar, an
 * area) and its small ones (texture dots, a line of 3px or less).
 *
 * @param theme The card's theme.
 * @param count How many series.
 * @param options Whether the chart shows status.
 * @returns The two lists.
 */
export function paletteSeriesByMark(
  theme: PaletteTheme,
  count: number,
  { showsStatus }: Pick<PaletteSeriesOptions, 'showsStatus'> = {}
): { large: string[]; small: string[] } {
  return {
    large: paletteSeries(theme, count, { showsStatus }),
    small: paletteSeries(theme, count, { showsStatus, markPx: 2 }),
  };
}

/**
 * A measured series' ramp as the plot draws it, from the ink out.
 *
 * @param theme The card's theme.
 * @returns sRGB colors.
 */
export function measuredRamp(theme: PaletteTheme): string[] {
  return PALETTE_NEUTRALS[theme].measured.map(paletteColor);
}
