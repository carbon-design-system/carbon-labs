/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import ContentNavigatorSyncWarning32 from '@carbon/icons/es/content-navigator-sync--warning/32.js';
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
import { runs } from './markRaster';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import { glyphScale } from '@carbon-labs/motion-icons-core/icons/status/alerts';
import * as WARNING from '../../icons/marks/warning';

/**
 * The warning badges (icons/marks/warning.ts): the triangle grows 14% about its centroid at constant weight
 * (each of Carbon's points moves with its corner), the "!" grows with it (GLYPH_GROW). The suite: markSuite.tsx.
 */

NOT_IN_REACT.ContentNavigatorSyncWarning = fromDescriptor(
  ContentNavigatorSyncWarning32 as unknown as Descriptor
);

const centroid = (t: readonly Pt[]): Pt => [
  (t[0][0] + t[1][0] + t[2][0]) / 3,
  (t[0][1] + t[1][1] + t[2][1]) / 3,
];

const CHECKS = new Map<unknown, MarkCheck>([
  [
    WARNING.WARN,
    (spec, s, h) => {
      const p = spec.place as WARNING.WarnPlace;
      const C = centroid(p.tri);
      const [dx, dy] = p.drift ? [p.drift[0] * h, p.drift[1] * h] : [0, 0];
      const k = glyphScale(h);
      const expected = pointsOf(p.d).map(([x, y]): Pt => {
        if (p.bang) {
          const [x0, x1, y0, y1] = p.bang.bar;
          const [cx, cy, r] = p.bang.dot;
          const gc = (y0 + cy + r) / 2;
          if (x > x0 - 1e-3 && x < x1 + 1e-3 && y > y0 - 1e-3 && y < y1 + 1e-3)
            return [x + dx, gc + (y - gc) * k + dy];
          if (Math.abs(x - cx) < r + 1e-3 && Math.abs(y - cy) < r + 1e-3)
            return [x + dx, y + (gc + (cy - gc) * k - cy) + dy];
        }
        // Every other point moves with its corner, as the corner moves when the triangle scales about its centroid.
        const v = p.tri.reduce((a, b) =>
          Math.hypot(x - b[0], y - b[1]) < Math.hypot(x - a[0], y - a[1])
            ? b
            : a
        );
        return [
          x + WARNING.WARN_GROW * h * (v[0] - C[0]) + dx,
          y + WARNING.WARN_GROW * h * (v[1] - C[1]) + dy,
        ];
      });
      near(pointsOf(String(s.mark.d)), expected, `warning h=${h}`);
      if (!p.bang) {
        // An outline triangle's floor stays 2px.
        const x = p.tri[0][0] + dx;
        const r = runs(s.mark, [x + 0.01, p.tri[0][1] - 3], [x + 0.01, 34]);
        expect(
          Math.abs(r[r.length - 1] - 2),
          `floor h=${h}: ${r}`
        ).toBeLessThan(0.02);
      } else {
        // A filled triangle's "!" keeps its bar's width.
        const [, , y0, y1] = p.bang.bar;
        const ym = (y0 + y1) / 2 + dy;
        const r = runs(s.mark, [0, ym], [34, ym]);
        expect(r.length, `across the bar h=${h}`).toBe(2);
      }
    },
  ],
]);

describe('warning', () => {
  suite(
    casesOf(WARNING, {
      BatteryWarning: WARNING.BATTERY_WARNING,
      EventWarning: WARNING.EVENT_WARNING,
      MissingDataWarning: WARNING.MISSING_DATA_WARNING,
      FloodWarning: WARNING.FLOOD_WARNING,
      ContentNavigatorSyncWarning: WARNING.CONTENT_NAVIGATOR_SYNC_WARNING,
    }),
    CHECKS
  );
  it("Missing data warning: the triangle's point holds (the fold takes the right wall's 2px above it), so that end never draws back", () => {
    for (const h of STEPS)
      expect(WARNING.MissingDataWarning.parts(h).drawn[0], `h=${h}`).toBe(0);
  });
  it('Event warning: the base holds, its "!" too; only its open ends draw back', () => {
    const shapes = WARNING.EventWarning.parts(1).shapes;
    expect(shapes.bang.d).toBe(WARNING.EventWarning.parts(0).shapes.bang.d);
    const r = runs(
      { d: WARNING.EventWarning.parts(1).base } as never,
      [8, 22],
      [8, 34]
    );
    expect(Math.abs(r[r.length - 1] - 2), `${r}`).toBeLessThan(0.02);
  });
});
