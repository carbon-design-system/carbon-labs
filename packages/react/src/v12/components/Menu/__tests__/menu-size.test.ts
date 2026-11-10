/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { menuSizeFor } from '../components/menu-size';

describe('menuSizeFor', () => {
  it('opens a menu the size of its trigger, but an xs trigger opens an sm menu', () => {
    expect(menuSizeFor('xs')).toBe('sm');
    expect(menuSizeFor('sm')).toBe('sm');
    expect(menuSizeFor('md')).toBe('md');
    expect(menuSizeFor('lg')).toBe('lg');
  });

  it("keeps the trigger's own menuSize, xs included", () => {
    expect(menuSizeFor('xs', 'xs')).toBe('xs');
    expect(menuSizeFor('lg', 'sm')).toBe('sm');
  });
});
