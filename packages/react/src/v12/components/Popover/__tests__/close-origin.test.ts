/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { closeOptions } from '../components/useFloatingPresence';

const trigger = () => ({ x: 120, y: 40 });

describe('a floating surface closes back toward where it came from', () => {
  it('opened by a snap: its own origin, nothing passed', () => {
    const surface = { origin: () => ({ x: 10, y: 0 }) };
    expect(closeOptions(surface, trigger)).toBeUndefined();
  });

  it('shown open from the start (no origin): back into its trigger', () => {
    const surface = { origin: () => null };
    expect(closeOptions(surface, trigger)).toEqual({
      source: { x: 120, y: 40 },
    });
  });

  it('no origin and no trigger: the snap falls back to its center', () => {
    const surface = { origin: () => null };
    expect(closeOptions(surface)).toBeUndefined();
    expect(closeOptions(surface, () => null)).toBeUndefined();
  });
});
