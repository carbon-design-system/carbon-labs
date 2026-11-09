/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { parseCssColor } from '../components/cssColor';

describe('parseCssColor', () => {
  it('reads hex, short and long, with alpha', () => {
    expect(parseCssColor('#161616')).toEqual([22, 22, 22, 1]);
    expect(parseCssColor(' #fff ')).toEqual([255, 255, 255, 1]);
    expect(parseCssColor('#00000080')).toEqual([0, 0, 0, 128 / 255]);
  });

  it('reads what parseColor reads', () => {
    expect(parseCssColor('rgb(1 2 3)')).toEqual([1, 2, 3, 1]);
    expect(parseCssColor('nonsense')).toBeNull();
  });
});
