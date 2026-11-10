/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { KitCorners } from '@carbon-labs/react-kit-defaults';

/**
 * A menu's corners: its own `corners`, else the provider's (`KitDefaults
 * corners`), else `rounded`: 8px, with the field-inset rows. A pill menu
 * (`full`) only when one of them asks for it, whatever its trigger's shape.
 */
export function menuCorners(
  corners: KitCorners | undefined,
  kitCorners?: KitCorners
): KitCorners {
  return corners ?? kitCorners ?? 'rounded';
}
