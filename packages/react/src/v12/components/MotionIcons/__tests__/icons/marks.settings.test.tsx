/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { motionTokens } from '@carbon-labs/motion-icons-core/tokens';
import { suite, across, casesOf, pointsOf, type MarkCheck } from './markSuite';
import { runs } from './markRaster';
import * as SETTINGS from '../../icons/marks/settings';

/** The settings family (icons/marks/settings.ts): the cog turns a full tooth pitch (45°) on Settings' curve and grows 0.5px. The suite: markSuite.tsx. */

const CHECKS = new Map<unknown, MarkCheck>([
  [
    SETTINGS.COG,
    (spec, s, h) => {
      const place = spec.place as SETTINGS.CogPlace;
      const [cx, cy] = SETTINGS.cogCentre(place, h);
      const g = SETTINGS.cogGrow(place) * h;
      const a = (SETTINGS.COG_TURN * h * Math.PI) / 180;
      const [outline] = String(place.d).split(/(?=M)/);
      const tip = Math.max(...pointsOf(outline).map(([x]) => x)) - place.c[0];
      for (let k = 0; k < 8; k++) {
        // Each tooth, turned with the cog: from the window out to its tip one solid run, the ring's
        // wall and the tooth together (Carbon's length: both hold), starting 0.5h further out.
        const [ux, uy] = [
          Math.cos(a + (k * Math.PI) / 4),
          Math.sin(a + (k * Math.PI) / 4),
        ];
        const along = runs(
          s.mark,
          [
            cx + ux * (place.window + g - 0.5),
            cy + uy * (place.window + g - 0.5),
          ],
          [cx + ux * (tip + g + 1), cy + uy * (tip + g + 1)]
        );
        expect(along.length, `tooth ${k} h=${h}`).toBe(1);
        expect(
          Math.abs(along[0] - (tip - place.window)),
          `tooth ${k} length h=${h}: ${along[0]}`
        ).toBeLessThan(0.03);
        // 2px wide, half way out.
        const m = (place.ring + tip) / 2 + g;
        across(
          s.mark,
          [cx + ux * m - uy * 2, cy + uy * m + ux * 2],
          [cx + ux * m + uy * 2, cy + uy * m - ux * 2],
          2,
          `tooth ${k} width h=${h}`
        );
      }
      // The window: round, 0.5h larger.
      expect(
        runs(
          s.mark,
          [cx - place.window - g + 0.02, cy + 0.01],
          [cx + place.window + g - 0.02, cy + 0.01]
        ).length,
        `window h=${h}`
      ).toBe(0);
      expect(
        runs(
          s.mark,
          [cx + 0.01, cy - place.window - g + 0.02],
          [cx + 0.01, cy + place.window + g - 0.02]
        ).length,
        `window h=${h}`
      ).toBe(0);
    },
  ],
]);

describe('settings', () => {
  suite(
    casesOf(SETTINGS, {
      CalendarSettings: SETTINGS.CALENDAR_SETTINGS,
      PhoneSettings: SETTINGS.PHONE_SETTINGS,
      TaskSettings: SETTINGS.TASK_SETTINGS,
      UserSettings: SETTINGS.USER_SETTINGS,
    }),
    CHECKS
  );
  it("turns on Settings' own timing, enter and leave", () => {
    // moderate-02 on Settings' own mechanical curve.
    expect(SETTINGS.TaskSettings.hover).toEqual({
      duration: motionTokens.duration.moderate02 / 1000,
      ease: [0.8, 0, 0.2, 1],
    });
    expect(SETTINGS.TaskSettings.leave).toEqual({
      duration: motionTokens.duration.moderate02 / 1000,
      ease: [0.8, 0, 0.2, 1],
    });
  });
});
