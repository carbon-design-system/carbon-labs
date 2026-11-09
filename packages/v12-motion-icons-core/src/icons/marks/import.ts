/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import WorkspaceImport32 from '@carbon/icons/es/workspace--import/32.js';
import {
  loopD,
  makeStatusMarkIcon,
  type MarkType,
  type StatusMarkSpec,
} from '../../utils/statusMark';
import type { Pt } from '../../geometry';
import { carbonArt, withStatic } from '../../engine';
import { WORKSPACE_SWAP } from '../assorted/files';

/**
 * The badge with an arrow in: Carbon's `workspace--import`, on the status-mark system
 * (utils/statusMark.ts). (Tag import and Tag export shipped before this
 * system, with this motion.)
 *
 * One motion for the arrow, as Tag import has it: the arrow reaches 2px further in (the
 * set's reach for an arrow on a glyph), its tail anchored, so the shaft
 * lengthens and the head keeps its shape.
 *
 * The workspace plays Workspace's hover where it can: the top row's square
 * widens 3px into the rectangle beside it (their gap moving 3px right). Its
 * lower tile is cut open for the arrow, so it can't grow into the tile it
 * would (the arrow is there): it holds, and the ends of its two arms draw
 * back left as the arrow's head comes in, keeping their resting space.
 */

/** Where an arrow sits: Carbon's arrow (its corners), which way its head reaches (+1 right, −1 left), and its tail's x. */
export interface ArrowPlace {
  pts: readonly Pt[];
  dir: 1 | -1;
  tail: number;
}
/** How far the arrow's head reaches at full hover. */
export const ARROW_REACH = 2;
const arrowAt = (p: ArrowPlace, h: number): Pt[] =>
  p.pts.map(
    ([x, y]) =>
      [Math.abs(x - p.tail) < 1e-6 ? x : x + p.dir * ARROW_REACH * h, y] as Pt
  );

/** The arrow mark (in or out): its head reaches 2px, its tail anchored. */
export const ARROW: MarkType<ArrowPlace> = {
  d: (p, h) => loopD(arrowAt(p, h)),
  ink: (p, h) => [arrowAt(p, h)],
};

/** Workspace's hover on its top row: the square's right wall and the rectangle's left wall move 3px right. */
const workspaceCalm = ([x, y]: Pt, h: number): Pt =>
  y < 14 && x > 10.5 && x < 17.5 ? [x + WORKSPACE_SWAP * h, y] : [x, y];

const LEFT: Pt = [-1, 0];
export const WORKSPACE_IMPORT: StatusMarkSpec<ArrowPlace> = {
  base: {
    d: 'M12 25H6V17H12V15H6A2 2 0 0 0 4 17V25A2 2 0 0 0 6 27H12Z',
    ends: [
      {
        at: [
          [12, 25],
          [12, 27],
        ],
        back: LEFT,
      },
      {
        at: [
          [12, 17],
          [12, 15],
        ],
        back: LEFT,
      },
    ],
    parts: {
      square:
        'M11 6V11H6V6H11M11 4H6A2 2 0 0 0 4 6V11A2 2 0 0 0 6 13H11A2 2 0 0 0 13 11V6A2 2 0 0 0 11 4Z',
      corner:
        'M27 6V11H17V6H27M27 4H17A2 2 0 0 0 15 6V11A2 2 0 0 0 17 13H27A2 2 0 0 0 29 11V6A2 2 0 0 0 27 4Z',
    },
    calm: workspaceCalm,
  },
  baseMotion: 'calm',
  mark: ARROW,
  place: {
    pts: [
      [30, 20],
      [16.828, 20],
      [19.414, 17.414],
      [18, 16],
      [13, 21],
      [18, 26],
      [19.414, 24.586],
      [16.828, 22],
      [30, 22],
    ],
    dir: -1,
    tail: 30,
  },
};
export const WorkspaceImportSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('WorkspaceImport', WORKSPACE_IMPORT),
  /* @__PURE__ */ carbonArt(WorkspaceImport32)
);
