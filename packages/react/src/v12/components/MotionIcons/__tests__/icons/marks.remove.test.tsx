/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { suite, across, casesOf, type MarkCheck } from './markSuite';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import { cover, delta, grid, runs } from './markRaster';
import * as REMOVE from '../../icons/marks/remove';

/** The remove family (icons/marks/remove.ts): each of the x's arm ends reaches 2px along its arm. The suite: markSuite.tsx. */

const CHECKS = new Map<unknown, MarkCheck>([
  [
    REMOVE.CROSS,
    (spec, s, h) => {
      const place = spec.place;
      const l = place.arm + (place.reach ?? REMOVE.CROSS_REACH) * h;
      const [cx, cy] = place.c as Pt;
      const S = Math.SQRT1_2;
      for (const [ux, uy] of [
        [S, -S],
        [-S, -S],
        [-S, S],
        [S, S],
      ]) {
        // Across the arm near its end and half way: 2px.
        for (const t of [l - 0.25, l / 2 + 0.5]) {
          const [mx, my] = [cx + ux * t, cy + uy * t];
          across(
            s.mark,
            [mx - uy * 3, my + ux * 3],
            [mx + uy * 3, my - ux * 3],
            2,
            `arm (${ux}, ${uy}) h=${h}`
          );
        }
      }
      // End to end along a diagonal (through the crossing, just off centre).
      across(
        s.mark,
        [cx - S * (l + 1) + 0.1, cy - S * (l + 1) - 0.1],
        [cx + S * (l + 1) + 0.1, cy + S * (l + 1) - 0.1],
        2 * l,
        `span h=${h}`
      );
    },
  ],
]);

describe('remove', () => {
  suite(
    casesOf(REMOVE, {
      TaskRemove: REMOVE.TASK_REMOVE,
      MusicRemove: REMOVE.MUSIC_REMOVE,
      SortRemove: REMOVE.SORT_REMOVE,
    }),
    CHECKS
  );
  it("Music remove: the beam's left end rises 2px (rigid, about its cut end), the left note (stem and head) riding up with it; each head grows 0.5px in radius at 2px; it meets Carbon's drawing as the hover starts", () => {
    const at = (h: number) => REMOVE.MusicRemove.parts(h).shapes.base;
    expect(REMOVE.HEAD_GROW).toBe(0.5);
    for (const h of [0.25, 0.5, 1]) {
      const g = REMOVE.HEAD_GROW * h;
      // The left note rises as far as the beam does over its stem's middle (x 9): 2px·(17 − 9)/9.
      const tan = (REMOVE.BEAM_RISE * h) / 9;
      const up = 8 * tan;
      // Each head's ring, below its centre (the left one's lifted): 2px; the centre 0.5px further left (its right side on its stem).
      for (const [cx, cy] of [
        [6 - g, 26 - up],
        [22 - g, 26],
      ]) {
        const r = runs(
          at(h),
          [cx + 0.01, cy + 1.5 + g],
          [cx + 0.01, cy + 5 + g]
        );
        expect(r.length, `head ${cx} h=${h}`).toBe(1);
        expect(Math.abs(r[0] - 2), `head ${cx} h=${h}: ${r[0]}`).toBeLessThan(
          0.03
        );
      }
      // The left stem, upright, runs unbroken from the beam's top edge into its lifted head, ending where that head's ring does.
      const R = 4 + g;
      const [stem, ...more] = runs(at(h), [9, 2], [9, 31]);
      expect(more.length, `stem h=${h}`).toBe(0);
      // Its top: the beam's rounded corner (radius 2 about (10, 8)), turned with the beam about (17, 7).
      const [c, s] = [
        1 / Math.sqrt(1 + tan * tan),
        tan / Math.sqrt(1 + tan * tan),
      ];
      const [kx, ky] = [17 - 7 * c - s, 7 - 7 * s + c];
      const top = ky - Math.sqrt(4 - (9 - kx) ** 2);
      const bottom = 26 - up + Math.sqrt(R * R - (3 + g) ** 2);
      expect(
        Math.abs(stem - (bottom - top)),
        `stem h=${h}: ${stem} vs ${bottom - top}`
      ).toBeLessThan(0.03);
      // The beam's top edge at its left (x 11) has risen by the turn: 2px·(17 − 11)/9.
      const lift = (REMOVE.BEAM_RISE * h * 6) / 9;
      const [beam] = runs(at(h), [11, 2], [11, 9]);
      expect(
        Math.abs(beam - 2 / Math.cos(Math.atan2(REMOVE.BEAM_RISE * h, 9))),
        `beam h=${h}: ${beam}`
      ).toBeLessThan(0.03);
      expect(
        runs(at(h), [11, 6 - lift + 0.1], [11, 6 - lift + 0.3]).length,
        `beam top h=${h}`
      ).toBe(1);
    }
    grid(32);
    expect(
      delta(
        cover({ a: at(0) }),
        cover({ b: { d: REMOVE.MUSIC_REMOVE.base.at!(1e-9) } })
      )
    ).toBeLessThan(0.003);
  });
});
