/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { copyCorrection } from '../components/listReflow';

describe('copyCorrection', () => {
  it('leaves a copy that landed where its item stood', () => {
    expect(
      copyCorrection({ left: 12, top: 48 }, { left: 12, top: 48 })
    ).toEqual([0, 0]);
    expect(
      copyCorrection({ left: 12, top: 48 }, { left: 12.3, top: 47.6 })
    ).toEqual([0, 0]);
  });

  it('moves back a copy drawn against an ancestor, off its place', () => {
    // The row 48px down the page, not positioned: the copy drew at the top.
    expect(copyCorrection({ left: 0, top: 48 }, { left: 0, top: 0 })).toEqual([
      0, 48,
    ]);
    expect(
      copyCorrection({ left: 100, top: 48 }, { left: 116, top: 56 })
    ).toEqual([-16, -8]);
  });
});
