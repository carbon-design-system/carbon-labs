/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** WC vs React, frame by frame: every element, shard 4 of 8 (see harness.ts). */
import { it } from 'vitest';
import { runShard } from './harness';

it(
  'every element in shard 4 paints what its React component paints',
  () => runShard(4, 8),
  1_800_000
);
