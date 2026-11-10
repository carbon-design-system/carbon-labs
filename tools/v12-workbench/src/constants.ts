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
 * The toolbar's picks, in the order they are shown: Carbon's white and g100,
 * then the v12 light and dark previews (the React Storybook's `v12-themes`),
 * which apply on `<html>` only.
 */
export const THEMES = ['white', 'g100', 'v12-light', 'v12-dark'] as const;
/** The themes Carbon's `Theme` draws as a zone of their own: the matrix's. */
export const ZONE_THEMES = ['white', 'g100'] as const;
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
  theme: 'white',
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
 * so a stale or hand-typed URL falls back to the default.
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
    theme: pick(THEMES, globals.theme, DEFAULT_GLOBALS.theme),
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
