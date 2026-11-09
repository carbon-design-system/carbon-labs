/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import {
  suite,
  casesOf,
  near,
  pointsOf,
  across,
  type MarkCheck,
} from './markSuite';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import * as IMPORT from '../../icons/marks/import';

/** The import badge (icons/marks/import.ts): the arrow's head reaches 2px in, its tail anchored (Tag import's hover). The suite: markSuite.tsx. */

const CHECKS = new Map<unknown, MarkCheck>([
  [
    IMPORT.ARROW,
    (spec, s, h) => {
      const p = spec.place as IMPORT.ArrowPlace;
      near(
        pointsOf(String(s.mark.d)),
        p.pts.map(
          ([x, y]): Pt => [
            x === p.tail ? x : x + p.dir * IMPORT.ARROW_REACH * h,
            y,
          ]
        ),
        `arrow h=${h}`
      );
      // The shaft keeps its 2px.
      across(s.mark, [26, 17], [26, 25], 2, `shaft h=${h}`);
    },
  ],
]);

describe('import', () => {
  suite(casesOf(IMPORT, { WorkspaceImport: IMPORT.WORKSPACE_IMPORT }), CHECKS);
  it("Workspace import: the top row plays Workspace's hover (the square's right wall and the rectangle's left wall 3px right)", () => {
    const top = IMPORT.WorkspaceImport.parts(1).shapes;
    expect(String(top.square.d)).toContain('M14 6');
    expect(String(top.corner.d)).toContain('L20 6');
  });
});
