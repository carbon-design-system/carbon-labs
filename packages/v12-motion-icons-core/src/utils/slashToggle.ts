/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * On ⇄ off slash toggles. The geometry and the change moved to
 * `@carbon-labs/motion-icons-core` (slash; refactor stage 1); this path
 * re-exports them, typed as before, and keeps the React factories.
 */
import {
  type Playback as AnimationPlaybackControls,
  hoverIcon,
  toggleIcon,
  type CarbonIcon,
  type ToggleFrame,
  type TweenFn,
} from '../engine';
import {
  slashChange as coreSlashChange,
  slashShapes,
  type SlashToggleSpec as CoreSlashToggleSpec,
} from '../slash';

export * from '../slash';

export interface SlashToggleSpec extends CoreSlashToggleSpec {
  /** Carbon's [on, off] drawings, for when motion is off. */
  statics: readonly [CarbonIcon, CarbonIcon];
}

/** The slash toggle's change: p draws or retracts the slash, e runs the kick (or the half recoil) once. */
export const slashChange = coreSlashChange as unknown as (
  toOff: boolean,
  fr: ToggleFrame,
  tween: TweenFn,
  repaint: () => void
) => AnimationPlaybackControls;

/* @__NO_SIDE_EFFECTS__ */
export function makeSlashToggle(name: string, spec: SlashToggleSpec) {
  return toggleIcon<'on' | 'off'>(name, {
    states: ['on', 'off'],
    statics: spec.statics,
    geo: (fr) => slashShapes(spec, fr),
    change: slashChange,
  });
}

/** The off state as a hover-only icon (the toggle's off end, which it equals). */
/* @__NO_SIDE_EFFECTS__ */
export function makeOffIcon(name: string, spec: SlashToggleSpec) {
  return hoverIcon(name, {
    geo: ({ h }) => slashShapes(spec, { h, p: 1, e: 0 }),
  });
}
