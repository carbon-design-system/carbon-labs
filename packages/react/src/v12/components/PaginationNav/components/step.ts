/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { pitchAt, reachForLength } from '@carbon-labs/v12-motion';

/**
 * The page a chevron steps to from `page`: one on (`dir` 1) or one back
 * (-1), round the ends with `loop`; -1 when there is none.
 */
export function stepTarget(
  page: number,
  dir: 1 | -1,
  total: number,
  loop: boolean
): number {
  if (total <= 0) {
    return -1;
  }
  const i = page + dir;
  if (i >= 0 && i < total) {
    return i;
  }
  return loop ? (i < 0 ? total - 1 : 0) : -1;
}

/**
 * How far the marker reaches toward the page at `at` among the row's page
 * centers: the motion's `reach`, or by the pitch at that page when `auto`,
 * as a press on the page itself reaches.
 */
export function reachPx(
  reach: number | 'auto',
  centers: number[],
  at: number
): number {
  return reach === 'auto' ? reachForLength(pitchAt(centers, at)) : reach;
}
