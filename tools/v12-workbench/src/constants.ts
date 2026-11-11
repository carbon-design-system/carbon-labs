/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { MotionLevel } from '@carbon-labs/v12-motion';

export const ADDON_ID = 'carbon-labs/v12-workbench';
export const PANEL_ID = `${ADDON_ID}/motion-panel`;
export const EXPLORATIONS_PANEL_ID = `${ADDON_ID}/explorations-panel`;

export const EVENTS = {
  /** Preview to manager: the current story's motion, described from the seam. */
  motion: `${ADDON_ID}/motion`,
  /** Manager to preview: send it again (the panel opened after the story rendered). */
  request: `${ADDON_ID}/motion-request`,
} as const;

/**
 * The toolbar's themes: v12 light and v12 dark (the React Storybook's
 * `v12-themes`), on `<html>` and, as a zone class each (`cds--v12-light`,
 * `cds--v12-dark`), on an area of their own: the matrix's columns. The v12
 * surfaces offer no v11 theme.
 */
export const THEMES = ['v12-light', 'v12-dark'] as const;
/** The themes the matrix draws, each as a zone of its own: both v12 themes. */
export const ZONE_THEMES = THEMES;
/**
 * A v11 theme, saved or in an address from before, read as the v12 theme of
 * its side: white and g10 as v12 light, g90 and g100 as v12 dark.
 */
export const V11_THEMES: Readonly<Record<string, Theme>> = {
  white: 'v12-light',
  g10: 'v12-light',
  g90: 'v12-dark',
  g100: 'v12-dark',
};
/** The kit's three densities (`KitDefaults` `density`). */
export const DENSITIES = ['compact', 'default', 'spacious'] as const;
/**
 * The kit's corners (`KitDefaults` `corners`). `default` leaves each
 * component's own corners; the others are the provider's values.
 */
export const CORNERS = ['default', 'full', 'rounded', 'square'] as const;
/**
 * The motion pick. `system` is no pick: the operating system's reduced-motion
 * setting decides. The others force a level, `full` included.
 */
export const REDUCED_MOTION = [
  'system',
  'full',
  'shorter-clock',
  'at-once',
] as const;
/** The clock's speed: 1x, a quarter, a tenth. Strings, as the URL carries them. */
export const CLOCKS = ['1', '0.25', '0.1'] as const;
export const DIRECTIONS = ['ltr', 'rtl'] as const;

export type Theme = (typeof THEMES)[number];
export type ZoneTheme = (typeof ZONE_THEMES)[number];
export type Density = (typeof DENSITIES)[number];
export type Corners = (typeof CORNERS)[number];
export type ReducedMotion = (typeof REDUCED_MOTION)[number];
export type Clock = (typeof CLOCKS)[number];
export type Direction = (typeof DIRECTIONS)[number];

export interface WorkbenchGlobals {
  theme: Theme;
  density: Density;
  corners: Corners;
  reducedMotion: ReducedMotion;
  clock: Clock;
  dir: Direction;
}

export const DEFAULT_GLOBALS: WorkbenchGlobals = {
  theme: 'v12-light',
  density: 'default',
  corners: 'default',
  reducedMotion: 'system',
  clock: '1',
  dir: 'ltr',
};

/**
 * The level the motion pick gives the motion provider. `system` leaves it to
 * the operating system's setting (`reduced` when it asks to reduce, else
 * `full`); `full` forces the motion on, whatever the system prefers; shorter
 * clock is `reduced` (fades at the reduced clock, no travel); at once is
 * `none` (every duration on the floor).
 */
export const MOTION_LEVEL: Record<ReducedMotion, MotionLevel | 'system'> = {
  system: 'system',
  full: 'full',
  'shorter-clock': 'reduced',
  'at-once': 'none',
};

/**
 * The level a motion pick gives: its own, or, under `system`, the one the
 * operating system's reduced-motion setting asks for.
 *
 * @param reducedMotion The motion pick.
 * @param systemReduces Whether the system asks to reduce motion.
 * @returns The level.
 */
export function levelOf(
  reducedMotion: ReducedMotion,
  systemReduces: boolean
): MotionLevel {
  const pick = MOTION_LEVEL[reducedMotion];
  if (pick !== 'system') return pick;
  return systemReduces ? 'reduced' : 'full';
}

/** What a story declares a motion item does under reduced motion. */
export type ReducedBehaviour = 'shorter-clock' | 'at-once' | 'full';

/** What a story declares in `parameters.v12`. */
export interface V12Parameters {
  /** The motion items the component uses, by the name the seam gives them. */
  motion?: string[];
  /** Each item's reduced-motion behaviour. */
  reduced?: Record<string, ReducedBehaviour>;
  /** The states the component has, for the matrix. */
  states?: string[];
  /** A whole app (the review app): it applies its own picks, and the decorators stand down. */
  app?: boolean;
}

/**
 * The toolbar's picks from a story's globals, each checked against its list
 * so a stale or hand-typed URL falls back to the default. A v11 theme falls
 * back to the v12 theme of its side (`V11_THEMES`).
 *
 * @param globals The story context's globals.
 * @returns The six picks.
 */
export function readGlobals(
  globals: Record<string, unknown>
): WorkbenchGlobals {
  const pick = <T extends string>(
    list: readonly T[],
    value: unknown,
    fallback: T
  ): T => (list.includes(String(value) as T) ? (String(value) as T) : fallback);
  return {
    theme: pick(
      THEMES,
      Object.hasOwn(V11_THEMES, String(globals.theme))
        ? V11_THEMES[String(globals.theme)]
        : globals.theme,
      DEFAULT_GLOBALS.theme
    ),
    density: pick(DENSITIES, globals.density, DEFAULT_GLOBALS.density),
    corners: pick(CORNERS, globals.corners, DEFAULT_GLOBALS.corners),
    reducedMotion: pick(
      REDUCED_MOTION,
      globals.reducedMotion,
      DEFAULT_GLOBALS.reducedMotion
    ),
    clock: pick(CLOCKS, globals.clock, DEFAULT_GLOBALS.clock),
    dir: pick(DIRECTIONS, globals.dir, DEFAULT_GLOBALS.dir),
  };
}

/**
 * What every duration is multiplied by at a clock speed: 1 at 1x, 4 at 0.25x.
 *
 * @param clock The clock pick.
 * @returns The time scale.
 */
export function timeScaleOf(clock: Clock): number {
  return 1 / Number(clock);
}
