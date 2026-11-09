/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Home32 from '@carbon/icons/es/home/32.js';
import {
  carbonArt,
  fillThenClear,
  hoverIcon,
  specStill,
  toggleIcon,
  type Shapes,
} from '../../engine';
import { insetPoly, shapeFillPath, type Pt } from '../../geometry';
import { homeDoorway, homeInside, homePath } from '../navigation/navZoom';

const CHome = /* @__PURE__ */ carbonArt(Home32);

/**
 * Home ⇄ HomeFilled. Carbon has `home` but no `home--filled`, so the filled
 * drawing is ours: the outline stays the silhouette, and the space between
 * the walls, the roof and the door frame fills solid. The frame is ink, so
 * it joins the fill and the door reads as a cut; and as it fills, the frame
 * steps 1px out all round (rigidly, still 2px), so the doorway grows from
 * the outline's opening (x 14–18, y 18–26) to x 13–19, y 17–26, sitting on
 * the base. Its corners stay square, like the outline's opening (the
 * frame's inside corners are sharp; only its outside corners are round).
 * Every edge lands on a whole pixel.
 *
 * Toggle: the house disc fill (§7.7). A disc grows from the centroid of the
 * fill's region, clipped to the house's inside (its centreline), in 160ms
 * on the entrance ease; to empty it, a hole grows from the same centre in
 * 120ms on the exit ease. The doorway grows with the fill (and shrinks back
 * with the hole). The door frame's inside (its centreline, down to the
 * base's) shares the fill's even-odd path, so the door stays empty as the
 * fill passes it. No masks or clip paths.
 *
 * Hover (either state): Home's hover on the same geometry, so the outline
 * end equals Home exactly: the house grows 4px wider and 4px taller on its
 * base, and the doorway grows with it (filled, from x 13–19, y 17–26 to
 * x 12–20, y 13–26).
 */

const EVENODD = { fillRule: 'evenodd' } as const;

/** Area and area centroid of a simple polygon. */
function areaCentroid(pts: readonly Pt[]): { a: number; c: Pt } {
  let [a, cx, cy] = [0, 0, 0];
  pts.forEach(([x0, y0], i) => {
    const [x1, y1] = pts[(i + 1) % pts.length];
    const k = x0 * y1 - x1 * y0;
    a += k;
    cx += (x0 + x1) * k;
    cy += (y0 + y1) * k;
  });
  return { a: Math.abs(a / 2), c: [cx / (3 * a), cy / (3 * a)] };
}

function homeShapes(h: number, p: number, e: number): Shapes {
  // How far the doorway has grown: with the fill, and back with the hole.
  const k = p * (1 - e);
  // The house's inside out to its centreline (1px into the 2px walls and roof).
  const inside = insetPoly(homeInside(h), -1);
  // The door's knockout: the stepped-out frame's centreline (1px into the
  // jambs and lintel) down to the base's centreline, so the doorway's edges are ink.
  const dw = homeDoorway(h);
  const base = inside[0][1];
  const knock: Pt[] = [
    [dw.x0 - 1 - k, dw.top - 1 - k],
    [dw.x1 + 1 + k, dw.top - 1 - k],
    [dw.x1 + 1 + k, base],
    [dw.x0 - 1 - k, base],
  ];
  // The centroid of what fills: the inside less the door.
  const [I, K] = [areaCentroid(inside), areaCentroid(knock)];
  const c: Pt = [
    (I.a * I.c[0] - K.a * K.c[0]) / (I.a - K.a),
    (I.a * I.c[1] - K.a * K.c[1]) / (I.a - K.a),
  ];
  const reach =
    Math.max(...inside.map(([x, y]) => Math.hypot(x - c[0], y - c[1]))) + 0.5;
  const [fill, hole] = [reach * p, reach * e];
  return {
    house: { d: homePath(h, k) },
    fill: {
      d:
        shapeFillPath(inside, c, fill, hole) +
        shapeFillPath(knock, c, fill, hole),
      ...EVENODD,
    },
  };
}

/** Home filled: the filled drawing, with Home's hover. */
export const HomeFilledSpec = /* @__PURE__ */ hoverIcon('HomeFilled', {
  geo: ({ h }) => homeShapes(h, 1, 0),
});

/** The filled drawing at rest, for when motion is off (Carbon has none). */
const HomeFilledStatic = specStill(HomeFilledSpec);

export const HomeToggleSpec = /* @__PURE__ */ toggleIcon<'off' | 'on'>(
  'HomeToggle',
  {
    states: ['off', 'on'],
    statics: [CHome, HomeFilledStatic],
    geo: ({ h, p, e }) => homeShapes(h, p, e),
    change: fillThenClear,
  }
);
