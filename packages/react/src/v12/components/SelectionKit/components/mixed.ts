/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* ============================================================================
 * The mixed rule — a parent's state from its children's
 * ============================================================================
 *
 * One rule for every checkbox that stands for others (a parent and its
 * children): a multiselect tree's parent node, the data
 * table's select-all, MultiSelect's select-all item, a checkbox group's parent.
 *
 *   state   all of its children on: checked; some (or one of them mixed):
 *           mixed, the Checkbox's `indeterminate`; none: unchecked. Disabled
 *           children aren't counted (they can't be changed from the parent).
 *           With no children to count, it is unchecked.
 *   click   Carbon's checkbox: a click on a mixed or unchecked parent selects
 *           all its children; on a checked one, clears them (`mixedToggleTo`).
 *           The data table's select-all and MultiSelect's select-all keep
 *           their own v11 click (any chosen clears them); they share the state.
 *
 * The visual is the Checkbox's (`indeterminate`: the dash), and assistive tech
 * hears "mixed" from the input's own state. Pure, so each component counts its
 * children its own way and a test can run it on numbers.
 * ========================================================================== */

/** A parent checkbox's state: `mixed` is the Checkbox's `indeterminate`. */
export type MixedState = 'checked' | 'mixed' | 'unchecked';

/**
 * A parent's state from its children: `on` of `total` counted children are
 * checked, and `partial` more are mixed themselves (a tree's nested parents).
 */
export function mixedState(on: number, total: number, partial = 0): MixedState {
  if (total <= 0) {
    return 'unchecked';
  }
  if (on >= total) {
    return 'checked';
  }
  return on > 0 || partial > 0 ? 'mixed' : 'unchecked';
}

/** The Checkbox's props for a state: `checked` and `indeterminate`. */
export function mixedCheckbox(state: MixedState): {
  checked: boolean;
  indeterminate: boolean;
} {
  return { checked: state === 'checked', indeterminate: state === 'mixed' };
}

/**
 * What a click on the parent sets its children to (Carbon's checkbox): a
 * mixed or unchecked parent selects them all (`true`), a checked one clears
 * them (`false`).
 */
export function mixedToggleTo(state: MixedState): boolean {
  return state !== 'checked';
}
