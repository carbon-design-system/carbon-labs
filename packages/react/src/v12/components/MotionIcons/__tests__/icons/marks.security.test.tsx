/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { suite, STEPS, casesOf, pointsOf, type MarkCheck } from './markSuite';
import { runs } from './markRaster';
import { SHIELD_GROW } from '@carbon-labs/motion-icons-core/icons/assorted/objectsA';
import * as SECURITY from '../../icons/marks/security';

/** The security badges (icons/marks/security.ts): the shield grows 24/22 about its centre at its 2px weight (Security's hover). The suite: markSuite.tsx. */

// The shield's centreline: sides at x 19 and 27, top at 19, point at 28.893 (before `at`).
const C = [23, (19 + 28.893) / 2];

const CHECKS = new Map<unknown, MarkCheck>([
  [
    SECURITY.SHIELD,
    (spec, s, h) => {
      const p = spec.place as SECURITY.ShieldPlace;
      const k = 1 + (SHIELD_GROW - 1) * h;
      const [dx, dy] = [
        p.at[0] + (p.drift?.[0] ?? 0) * h,
        p.at[1] + (p.drift?.[1] ?? 0) * h,
      ];
      const c = p.c ?? C;
      // Across its sides, between its top and its curves: two 2px walls, their centrelines 8·k apart.
      const y = c[1] + (21.5 - c[1]) * k + dy;
      const r = runs(s.mark, [dx + 10, y], [dx + 36, y]);
      expect(r.length, `walls h=${h}`).toBe(2);
      r.forEach((w) =>
        expect(Math.abs(w - 2), `wall h=${h}: ${r}`).toBeLessThan(0.02)
      );
      const all = runs(
        s.mark,
        [dx + c[0] - 4 * k - 1.5, y],
        [dx + c[0] + 4 * k + 1.5, y]
      );
      expect(all.length, `span h=${h}`).toBe(2);
      // Down its middle: its top wall and its point, 2px (the point mitred, √(1 + slope²) along the axis).
      const v = runs(s.mark, [dx + 23.01, 0], [dx + 23.01, 40]);
      expect(Math.abs(v[0] - 2), `top h=${h}: ${v}`).toBeLessThan(0.02);
    },
  ],
]);

describe('security', () => {
  suite(
    casesOf(SECURITY, {
      DocumentSecurity: SECURITY.DOCUMENT_SECURITY,
      GatewaySecurity: SECURITY.GATEWAY_SECURITY,
    }),
    CHECKS
  );
  it('Gateway security: the diamond grows with the shield, 24/22 about (16, 16) at 2px', () => {
    // The apex's wall keeps its weight (the corner moves whole).
    const apex = (h: number) =>
      runs(
        {
          d: SECURITY.GatewaySecurity.parts(h).base,
          fillRule: 'evenodd',
        } as never,
        [16.01, -2],
        [16.01, 8]
      )[0];
    expect(
      Math.abs(apex(1) - apex(0)),
      `apex wall ${apex(0)} → ${apex(1)}`
    ).toBeLessThan(0.02);
    const top = Math.min(
      ...pointsOf(SECURITY.GatewaySecurity.parts(1).base).map(([, y]) => y)
    );
    // Its rounded apex (its arc's ends at y 1.586 at rest) rides out with its corner, 14.414·(24/22 − 1) = 1.31px.
    expect(top).toBeCloseTo(1.5859 - 14.414 * (SHIELD_GROW - 1), 2);
  });
  it("Gateway security: the legs' outer ends and the nodes hold; the legs' inner ends ride out with the diamond", () => {
    const at = (h: number) => pointsOf(SECURITY.GatewaySecurity.parts(h).base);
    const [rest, grown] = [at(0), at(1)];
    // A node's point (on the upper right leg's end) and a leg's inner end, on the diamond's edge.
    const node = rest.findIndex(
      ([x, y]) => Math.abs(x - 27.5278) < 1e-3 && Math.abs(y - 5.9365) < 1e-3
    );
    const inner = rest.findIndex(
      ([x, y]) => Math.abs(x - 24.6272) < 1e-3 && Math.abs(y - 8.7993) < 1e-3
    );
    expect(grown[node][0]).toBeCloseTo(27.5278, 4);
    expect(grown[node][1]).toBeCloseTo(5.9365, 4);
    const out = 14.414 * Math.SQRT1_2 * (SHIELD_GROW - 1);
    expect(grown[inner][0]).toBeCloseTo(24.6272 + out * Math.SQRT1_2, 4);
    expect(grown[inner][1]).toBeCloseTo(8.7993 - out * Math.SQRT1_2, 4);
  });
  it("Document security: the shield's top holds (the fold leaves the right wall 1px above it), so that end never draws back", () => {
    for (const h of STEPS)
      expect(SECURITY.DocumentSecurity.parts(h).drawn[0], `h=${h}`).toBe(0);
  });
});
