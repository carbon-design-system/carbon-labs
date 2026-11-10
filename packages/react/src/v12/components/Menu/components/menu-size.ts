/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** A control size the menus come in. */
export type MenuSize = 'xs' | 'sm' | 'md' | 'lg';

/** A trigger's menu size: `menuSize`, else its own, but xs opens sm (an xs row is
    under the 24px target). Components README, "Menus from buttons". */
export function menuSizeFor(size: MenuSize, menuSize?: MenuSize): MenuSize {
  return menuSize ?? (size === 'xs' ? 'sm' : size);
}
