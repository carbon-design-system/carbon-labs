/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import SearchLocate32 from '@carbon/icons/es/search--locate/32.js';
import { hoverIcon, carbonArt } from '../../engine';
import { together } from '../../ease';
import { rectPath } from '../../geometry';
import { f } from '../../paint';

/**
 * From a 32×32 reference animation. The list scrolls up
 * one line while the lens lifts and turns:
 *
 * - Lines (2px bars, 5px pitch: 3px gaps) move up 5px together. The top
 *   line (2..18 × 2..4) leaves through the top edge (cut flat at y=0); the
 *   short line (2..10 × 12..14) widens to x=12 as it rises into the second
 *   row; a new bottom line (y 17..19) comes in under it, growing from the
 *   left edge to 8px wide.
 * - Lens (Carbon's path): translate(+2, −4) and rotate 15° about (19, 19).
 *
 * The lines move as one rigid block, so the gaps between them stay a fixed
 * 3px the whole way (the reference animation staggers each line's rise and pops the
 * bottom line in mid-way, so its gap opens and closes). No stagger:
 * everything moves together, 160ms entrance ease.
 */
const parts = /* @__PURE__ */ together();
const RISE = 5;

// Carbon's lens, verbatim.
const LENS_PATH =
  'M30,28.5859l-4.6885-4.6884a8.028,8.028,0,1,0-1.414,1.414L28.5859,30ZM19,25a6,6,0,1,1,6-6A6.0066,6.0066,0,0,1,19,25Z';

/** A bar cut flat at the top edge of the frame (y = 0), as the viewport did. */
const bar = (x0: number, y0: number, x1: number, y1: number) =>
  rectPath(x0, Math.max(0, y0), x1, Math.max(0, y1));

export const SearchLocateSpec = /* @__PURE__ */ hoverIcon('SearchLocate', {
  hover: parts.hover,
  geo: ({ h }) => {
    const k = parts.at(h, 0); // lines rise, short line widens, lens moves
    const w = parts.at(h, 1); // the new bottom line grows in
    const dy = -RISE * k;
    return {
      l4: { d: bar(2, 2 + dy, 18, 4 + dy) },
      l3: { d: bar(2, 7 + dy, 18, 9 + dy) },
      l2: { d: bar(2, 12 + dy, 10 + 2 * k, 14 + dy) },
      l1: { d: bar(2, 17 + dy, 2 + 8 * w, 19 + dy) },
      lens: {
        d: LENS_PATH,
        transform: `translate(${f(2 * k)} ${f(-4 * k)}) rotate(${f(15 * k)} 19 19)`,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(SearchLocate32),
});
