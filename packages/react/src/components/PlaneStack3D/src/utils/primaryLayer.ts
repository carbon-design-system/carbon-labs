/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable jsdoc/require-jsdoc, jsdoc/require-param, jsdoc/require-param-type, jsdoc/require-param-description */

import type { PrimaryLayerBlock } from '../types/visualization-config';

/**
 *
 * @param primaryLayer
 */
export function hasMissingColumnIndex(
  primaryLayer: PrimaryLayerBlock[] | undefined
) {
  return (
    Array.isArray(primaryLayer) &&
    primaryLayer.some(
      (block) => block.columnIndex === undefined || block.columnIndex === null
    )
  );
}
