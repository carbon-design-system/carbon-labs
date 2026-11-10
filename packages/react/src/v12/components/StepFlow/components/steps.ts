/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* The step flow's rules, without React: where a move lands, which steps
 * count as complete, and what is announced. StepFlow.tsx renders them. */

/** Where a move from `from` toward `to` lands, and the step that stopped it, if any. */
export interface StepMove {
  index: number;
  blockedAt: number | null;
}

/** A move toward `to`: back always arrives; forward stops on the first invalid step on the way (`blockedAt`). */
export function stepMove(
  from: number,
  to: number,
  valid: readonly boolean[]
): StepMove {
  const target = Math.max(0, Math.min(valid.length - 1, to));
  if (target <= from) {
    return { index: target, blockedAt: null };
  }
  for (let i = from; i < target; i++) {
    if (!valid[i]) {
      return { index: i, blockedAt: i };
    }
  }
  return { index: target, blockedAt: null };
}

/** Complete: the steps before the current one, and valid ones after it short of the furthest reached. */
export function completeSteps(
  index: number,
  reached: number,
  valid: readonly boolean[]
): boolean[] {
  return valid.map((ok, i) => i < index || (i > index && i < reached && ok));
}

/** The words announced on a step change: "Step 2 of 3: Access". */
export function stepAnnouncement(
  index: number,
  count: number,
  title: string
): string {
  return `Step ${index + 1} of ${count}: ${title}`;
}

/** The content swap's direction for a move: +1 forward (from the end side), −1 back. */
export const stepDirection = (from: number, to: number): 1 | -1 =>
  to < from ? -1 : 1;
