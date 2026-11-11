/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The series palette's structure: which hue and step each series takes, per
// theme, and which tier a mark needs. Structure only: a slot names a palette
// step (`blue-60`); its color comes from the theme's tokens.

/** The palette's hues. */
export type PaletteHue = 'blue' | 'teal' | 'purple' | 'magenta' | 'cyan';

/** The palette's steps. */
export type PaletteStep = 20 | 30 | 40 | 50 | 60 | 70 | 80;

/** The card's theme, as the palette reads it. */
export type PaletteTheme = 'light' | 'dark';

/** The contrast a mark needs: 3:1 for a large mark, 4.5:1 for a small one. */
export type PaletteTier = '3:1' | '4.5:1';

/** One series' color: a hue at a step. */
export interface PaletteSlot {
  hue: PaletteHue;
  step: PaletteStep;
  /** The step's name, as the theme's tokens name it. */
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

/** The ratio a small mark needs against the card. */
export const SMALL_MARK_MIN = 4.5;

/** The ratio a large mark needs against the card. */
export const LARGE_MARK_MIN = 3;

/** Neutral steps for measured series, darkest first, per theme. */
export const PALETTE_NEUTRALS: Readonly<
  Record<
    PaletteTheme,
    {
      small: readonly string[];
      large: string;
      backgroundOnly: readonly string[];
    }
  >
> = {
  light: {
    small: ['gray-100', 'gray-80', 'gray-60'],
    large: 'gray-50',
    backgroundOnly: ['gray-40', 'gray-30', 'gray-20', 'gray-10'],
  },
  dark: {
    small: ['gray-10', 'gray-30', 'gray-50'],
    large: 'gray-60',
    backgroundOnly: ['gray-70', 'gray-80', 'gray-90', 'gray-100'],
  },
};

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
