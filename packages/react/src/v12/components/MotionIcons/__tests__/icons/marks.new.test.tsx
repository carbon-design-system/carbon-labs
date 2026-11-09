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
  across,
  casesOf,
  pointsOf,
  type MarkCheck,
} from './markSuite';
import { cover, delta, grid, runs } from './markRaster';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import * as NEW from '../../icons/marks/new';
import {
  PLUS,
  plusCentre,
  plusReach,
} from '@carbon-labs/motion-icons-core/utils/statusMark';

/** The new family (icons/marks/new.ts): the dot grows 1px in radius; the plus reaches as Add's. The suite: markSuite.tsx. */

const CHECKS = new Map<unknown, MarkCheck>([
  [
    NEW.DOT,
    (spec, s, h) => {
      const [cx, cy] = spec.place.c as Pt;
      across(
        s.mark,
        [cx - 7, cy + 0.01],
        [cx + 7, cy + 0.01],
        2 * (spec.place.r + NEW.DOT_GROW * h),
        `dot h=${h}`
      );
    },
  ],
  [
    PLUS,
    (spec, s, h) => {
      const place = spec.place;
      const l = place.arm + (place.reach ?? plusReach(place.arm)) * h;
      const c = plusCentre(place, h);
      for (const t of [l - 0.25, l / 2 + 1]) {
        across(
          s.mark,
          [c[0] - 3, c[1] - t],
          [c[0] + 3, c[1] - t],
          2,
          `arm up h=${h}`
        );
        across(
          s.mark,
          [c[0] - t, c[1] - 3],
          [c[0] - t, c[1] + 3],
          2,
          `arm left h=${h}`
        );
      }
      across(
        s.mark,
        [c[0] - l - 1, c[1] + 0.5],
        [c[0] + l + 1, c[1] + 0.5],
        2 * l,
        `span h=${h}`
      );
    },
  ],
]);

describe('new', () => {
  suite(
    casesOf(NEW, {
      EmailNew: NEW.EMAIL_NEW,
      NotificationNew: NEW.NOTIFICATION_NEW,
      ResultNew: NEW.RESULT_NEW,
      GroupObjectsNew: NEW.GROUP_OBJECTS_NEW,
      CategoryNew: NEW.CATEGORY_NEW,
    }),
    CHECKS
  );
  it('Email new: the envelope holds through the hover; only its open ends draw back from the growing dot', () => {
    const rest = pointsOf(NEW.EmailNew.parts(0).base);
    const isRest = (p: Pt) =>
      rest.some((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 1e-3);
    // An end's points: the bottom wall's (x below 19, on y 24 or 26) and the right wall's (y above 18, on x 28 or 30).
    const isEnd = (p: Pt) =>
      ([24, 26].includes(+p[1].toFixed(3)) && p[0] < 19) ||
      ([28, 30].includes(+p[0].toFixed(3)) && p[1] < 18);
    for (const h of STEPS) {
      const now = pointsOf(NEW.EmailNew.parts(h).base);
      expect(now.length, `h=${h}`).toBe(rest.length);
      for (const p of now)
        expect(isRest(p) || isEnd(p), `h=${h} (${p})`).toBe(true);
    }
    expect(NEW.EmailNew.parts(1).drawn.every((d) => d > 0.5)).toBe(true);
  });
  it("Category new: the board grows 1px a side at a constant 2px, its plus keeping 2px clear; it meets Carbon's drawing as the hover starts", () => {
    const at = (h: number) => NEW.CategoryNew.parts(h).shapes.base;
    for (const h of STEPS) {
      const g = NEW.BOARD_GROW * h;
      across(at(h), [3, 11], [16, 11], 2, `left wall h=${h}`);
      across(at(h), [20, 11], [29, 11], 2, `right wall h=${h}`);
      across(at(h), [12, -2], [12, 8], 2, `top wall h=${h}`);
      across(at(h), [12, 15], [12, 23], 2, `bottom wall h=${h}`);
      // Each edge moved out by g: the top edge to 2 − g, the bottom to 20 + g (the stem 1px shorter).
      expect(
        Math.abs(runs(at(h), [12, 2 - g - 0.5], [12, 2 - g + 0.25])[0] - 0.25),
        `top edge h=${h}`
      ).toBeLessThan(0.02);
      expect(
        Math.abs(runs(at(h), [12, 20 + g - 0.25], [12, 22])[0] - 0.25),
        `bottom edge h=${h}`
      ).toBeLessThan(0.02);
    }
    grid(32);
    expect(
      delta(
        cover({ a: at(0) }),
        cover({ b: { d: NEW.CATEGORY_NEW.base.at!(1e-9) } })
      )
    ).toBe(0);
  });
  it("Group objects new: the frame grows 1px a side and each corner square 1px about its corner, every wall 2px; it meets Carbon's drawing as the hover starts", () => {
    const at = (h: number) => NEW.GroupObjectsNew.parts(h).shapes.base;
    for (const h of STEPS) {
      const g = NEW.FRAME_GROW * h;
      // The frame's walls, between the squares: 2px, 1px further out.
      across(at(h), [0, 16.5], [9, 16.5], 2, `left wall h=${h}`);
      across(at(h), [23, 16.5], [32, 16.5], 2, `right wall h=${h}`);
      across(at(h), [16.5, 0], [16.5, 9], 2, `top wall h=${h}`);
      expect(
        Math.abs(
          runs(at(h), [16.5, 4 - g - 0.5], [16.5, 4 - g + 0.25])[0] - 0.25
        ),
        `top edge h=${h}`
      ).toBeLessThan(0.02);
      // A corner square across its middle: its 2px outer wall, then its hole (2 + g), centred on the frame's corner.
      const [c, q] = [5 - g, 1 + g / 2];
      const [wall] = runs(at(h), [c - 5, c + 0.01], [c, c + 0.01]);
      expect(Math.abs(wall - 2), `square wall h=${h}: ${wall}`).toBeLessThan(
        0.02
      );
      expect(
        runs(at(h), [c - q + 0.02, c + 0.01], [c + q - 0.02, c + 0.01]).length,
        `hole h=${h}`
      ).toBe(0);
      expect(
        runs(at(h), [c - q - 0.1, c + 0.01], [c - q + 0.02, c + 0.01]).length,
        `hole edge h=${h}`
      ).toBe(1);
    }
    grid(32);
    expect(
      delta(
        cover({ a: at(0) }),
        cover({ b: { d: NEW.GROUP_OBJECTS_NEW.base.at!(1e-9) } })
      )
    ).toBe(0);
  });
});
