/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import {
  suite,
  STEPS,
  casesOf,
  near,
  pointsOf,
  NOT_IN_REACT,
  fromDescriptor,
  type Descriptor,
  type MarkCheck,
} from './markSuite';
import { cover, delta, grid } from './markRaster';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import AssetEdit32 from '@carbon/icons/es/asset--edit/32.js';
import * as EDIT from '../../icons/marks/edit';
import * as GEAR from '@carbon-labs/motion-icons-core/icons/marks/gear';

/** The edit family (icons/marks/edit.ts): the pencil pushes 2px along its axis (down-left); the bases play their hovers; Settings edit's gear turns under a window that moves with the pencil. The suite: markSuite.tsx. */

NOT_IN_REACT.AssetEdit = fromDescriptor(AssetEdit32 as unknown as Descriptor);

const CHECKS = new Map<unknown, MarkCheck>([
  [
    EDIT.PENCIL,
    (spec, s, h) => {
      // Rigid: Carbon's pencil pushed 2h along its axis, down and to the left.
      const k = EDIT.PENCIL_REACH * h;
      near(
        pointsOf(String(s.mark.d)),
        pointsOf(spec.place.d).map(
          ([x, y]) =>
            [x + EDIT.PENCIL_AXIS[0] * k, y + EDIT.PENCIL_AXIS[1] * k] as Pt
        ),
        `pencil h=${h}`
      );
    },
  ],
]);

describe('edit', () => {
  suite(
    casesOf(EDIT, {
      AssetEdit: EDIT.ASSET_EDIT,
      SettingsEdit: EDIT.SETTINGS_EDIT,
      TaskEdit: EDIT.TASK_EDIT,
    }),
    CHECKS
  );
});

describe('Settings edit', () => {
  const at = (h: number) => EDIT.settingsEditBase(h);
  it('keeps the hub a 2px ring, cut square across it only if the pencil comes within its resting space', () => {
    expect(at(0).hub).toBe(0);
    let opened = 0;
    for (const h of STEPS) {
      const { hub, d } = at(h);
      opened = Math.max(opened, hub);
      // The hub is drawn last: every point of it is on the ring (r 4 or 6 about (16, 16)), so the cut's ends are radial.
      const hubD = GEAR.hubD(
        Math.PI / 4 + hub,
        Math.PI / 4 + 2 * Math.PI - hub
      );
      expect(d.endsWith(hubD), `h=${h}`).toBe(true);
      for (const [x, y] of pointsOf(hubD)) {
        const r = Math.hypot(x - 16, y - 16);
        expect(
          Math.min(Math.abs(r - 4), Math.abs(r - 6)),
          `hub point (${x}, ${y}) h=${h}`
        ).toBeLessThan(2e-3);
      }
    }
    // Moving along its axis, the pencil's long side keeps its distance to the hub: the cut stays (nearly) shut.
    expect(opened).toBeLessThan(0.2);
  });
  it("turns the gear under a window that meets Carbon's cut as the hover starts", () => {
    grid(32);
    const start = {
      d: EDIT.SETTINGS_EDIT.base.at!(1e-9),
      fillRule: 'evenodd' as const,
    };
    expect(
      delta(
        cover({ a: { d: EDIT.SETTINGS_EDIT.base.d, fillRule: 'evenodd' } }),
        cover({ b: start })
      )
    ).toBeLessThan(0.002);
  });
});

describe('Task edit', () => {
  it("holds Carbon's 3px between the pencil's top and the board's wall above it, through the push (the wall's end follows)", () => {
    const parts = EDIT.TaskEdit.parts;
    const rest = parts(0).gaps[0];
    expect(rest).toBeCloseTo(3, 2);
    for (const h of STEPS)
      expect(Math.abs(parts(h).gaps[0] - rest), `h=${h}`).toBeLessThan(0.01);
  });
});
