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

/** The toolbar's picks, in the order they are shown. */
export const THEMES = ['white', 'g100'] as const;
export const DENSITIES = ['default', 'compact'] as const;
export const CORNERS = ['rounded', 'square'] as const;
export const REDUCED_MOTION = ['off', 'shorter-clock', 'at-once'] as const;
/** The clock's speed: 1x, a quarter, a tenth. Strings, as the URL carries them. */
export const CLOCKS = ['1', '0.25', '0.1'] as const;
export const DIRECTIONS = ['ltr', 'rtl'] as const;

export type Theme = (typeof THEMES)[number];
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
  corners: 'rounded',
  reducedMotion: 'off',
  clock: '1',
  dir: 'ltr',
};

/**
 * The level the reduced-motion pick forces on carbon-motion's provider.
 * `off` is `full` (the motion shown, whatever the system prefers); shorter
 * clock is `reduced` (fades at the reduced clock, no travel); at once is
 * `none` (every duration on the floor).
 */
export const MOTION_LEVEL: Record<ReducedMotion, MotionLevel> = {
  off: 'full',
  'shorter-clock': 'reduced',
  'at-once': 'none',
};

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
