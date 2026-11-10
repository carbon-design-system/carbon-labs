/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { snapFades, snapSliverTimes } from '@carbon-labs/v12-motion';
import { sidePanelProfile } from '../components/SidePanel';

describe('the side panel’s fades: the sliver guard docked, the presence fade floating', () => {
  it('flush and inset: opaque but for the guard, both exits', () => {
    for (const exit of ['collapse', 'reversed'] as const) {
      const p = sidePanelProfile('flush', exit);
      expect(p.sliver).toBe(true);
      expect(p.fadeIn).toBeUndefined();
      expect(p.exitFade).toBeUndefined();
      // No timed fade: its opacity follows its width under 4px (no box here to measure).
      expect(snapFades(p)).toEqual({ in: null, out: null, sliver: null });
      // On a 320 × 600 panel from its edge: a ramp up to 1 entering, from 1 down leaving.
      const t = snapSliverTimes(p, { w: 320, h: 600 }, { x: 320, y: 300 });
      expect(t.in!.keys[0]!.opacity).toBe(0);
      expect(t.in!.keys.at(-1)!.opacity).toBe(1);
      expect(t.out!.keys[0]!.opacity).toBe(1);
    }
  });

  it('floating: no guard, the presence fade', () => {
    const p = sidePanelProfile('floating');
    expect(p.sliver).toBeUndefined();
  });
});
