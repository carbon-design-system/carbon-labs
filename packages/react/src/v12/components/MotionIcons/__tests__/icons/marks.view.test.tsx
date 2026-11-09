/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect } from 'vitest';
import { suite, casesOf, type MarkCheck } from './markSuite';
import { flatten, runs } from './markRaster';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import * as VIEW from '../../icons/marks/view';

/** The view family (icons/marks/view.ts): the eye opens 1px top and bottom with the window growing 1px (its 2px wall held), the pupil 0.5px. The suite: markSuite.tsx. */

const CHECKS = new Map<unknown, MarkCheck>([
  [
    VIEW.EYE,
    (spec, s, h) => {
      const [cx, cy] = spec.place.c as Pt;
      const [o, g] = [VIEW.EYE_OPEN * h, VIEW.EYE_GROW * h];
      // The wall over the window and under it: 2px, from the almond's top (bottom) to the window.
      for (const dir of [-1, 1]) {
        const r = runs(s.mark, [cx + 0.01, cy + dir * 9], [cx + 0.01, cy]);
        expect(r.length, `wall ${dir} h=${h}`).toBe(1);
        expect(Math.abs(r[0] - 2), `wall ${dir} h=${h}: ${r[0]}`).toBeLessThan(
          0.02
        );
        // The almond opened by o.
        const [edge] = runs(
          s.mark,
          [cx + 0.01, cy + dir * (6 + o + 1)],
          [cx + 0.01, cy + dir * (6 + o - 0.5)]
        );
        expect(Math.abs(edge - 0.5), `almond ${dir} h=${h}`).toBeLessThan(0.02);
      }
      // Nowhere is the almond's wall round the window thinner than 2px.
      const [almond] = flatten(String(s.mark.d));
      const thinnest =
        Math.min(...almond.pts.map(([x, y]) => Math.hypot(x - cx, y - cy))) -
        (4 + g);
      expect(thinnest, `thinnest wall h=${h}`).toBeGreaterThan(2 - 0.02);
      // The pupil: 2 + 0.5h in radius.
      const [pupil] = runs(s.pupil, [cx - 4, cy + 0.01], [cx + 4, cy + 0.01]);
      expect(
        Math.abs(pupil - 2 * (2 + VIEW.PUPIL_GROW * h)),
        `pupil h=${h}`
      ).toBeLessThan(0.02);
      expect(
        runs(s.mark, [cx - 3.9 - g, cy + 0.01], [cx + 3.9 + g, cy + 0.01])
          .length,
        `window h=${h}`
      ).toBe(0);
    },
  ],
]);

describe('view', () => {
  suite(
    casesOf(VIEW, {
      AssetView: VIEW.ASSET_VIEW,
      DataView: VIEW.DATA_VIEW,
      DocumentView: VIEW.DOCUMENT_VIEW,
      MobileView: VIEW.MOBILE_VIEW,
      SettingsView: VIEW.SETTINGS_VIEW,
      TaskView: VIEW.TASK_VIEW,
    }),
    CHECKS
  );
});
