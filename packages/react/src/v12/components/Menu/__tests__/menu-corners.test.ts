/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { menuCorners } from '../components/menu-corners';

describe('menuCorners', () => {
  it('is rounded (8px) when nothing asks otherwise', () => {
    expect(menuCorners(undefined)).toBe('rounded');
    expect(menuCorners(undefined, undefined)).toBe('rounded');
  });

  it("takes the provider's corners, the pill included", () => {
    expect(menuCorners(undefined, 'full')).toBe('full');
    expect(menuCorners(undefined, 'square')).toBe('square');
  });

  it("keeps the menu's own corners over the provider's", () => {
    expect(menuCorners('full', 'rounded')).toBe('full');
    expect(menuCorners('rounded', 'full')).toBe('rounded');
  });
});
