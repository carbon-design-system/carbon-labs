/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The motion tokens the icons use, read from `@carbon-labs/motion-core`
 * (Carbon's durations and productive easing curves). Kept in the shape the
 * icons were written against (`motionTokens.duration.moderate01`,
 * `toEasing(motionTokens.easing.entrance)`) so their code reads unchanged;
 * the values come from the core, so there is one source of truth.
 */
import { motionTokens as core } from '@carbon-labs/motion-core/tokens';

type Bezier = { x1: number; y1: number; x2: number; y2: number };
const bezier = ([x1, y1, x2, y2]: readonly number[]): Bezier => ({
  x1,
  y1,
  x2,
  y2,
});

export const motionTokens = {
  duration: {
    /** 40ms: the smallest moves. */
    fast00: core.duration['fast-00'],
    fast01: core.duration['fast-01'],
    fast02: core.duration['fast-02'],
    moderate01: core.duration['moderate-01'],
    moderate02: core.duration['moderate-02'],
    slow01: core.duration['slow-01'],
    slow02: core.duration['slow-02'],
    slow03: core.duration['slow-03'],
  },
  easing: {
    standard: bezier(core.easing['standard-productive']),
    entrance: bezier(core.easing['entrance-productive']),
    exit: bezier(core.easing['exit-productive']),
    expressive: bezier(core.easing['standard-expressive']),
    entranceExpressive: bezier(core.easing['entrance-expressive']),
    exitExpressive: bezier(core.easing['exit-expressive']),
  },
} as const;

export type EasingDefinition = Bezier;

/** A Carbon easing as a Motion.dev / CSS cubic-bezier array. */
export function toEasing(
  e: EasingDefinition
): [number, number, number, number] {
  return [e.x1, e.y1, e.x2, e.y2];
}
