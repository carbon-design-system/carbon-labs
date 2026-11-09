/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import DataRefinery32 from '@carbon/icons/es/data-refinery/32.js';
import DataRefineryReference32 from '@carbon/icons/es/data-refinery--reference/32.js';
import DataShare32 from '@carbon/icons/es/data-share/32.js';
import DataTable32 from '@carbon/icons/es/data-table/32.js';
import DataTableReference32 from '@carbon/icons/es/data-table--reference/32.js';
import Diagram32 from '@carbon/icons/es/diagram/32.js';
import DiagramReference32 from '@carbon/icons/es/diagram--reference/32.js';
import Flow32 from '@carbon/icons/es/flow/32.js';
import FlowBranch32 from '@carbon/icons/es/flow--branch/32.js';
import FlowMerge32 from '@carbon/icons/es/flow--merge/32.js';
import FlowConditional32 from '@carbon/icons/es/flow--conditional/32.js';
import FlowConnection32 from '@carbon/icons/es/flow--connection/32.js';
import FlowData32 from '@carbon/icons/es/flow--data/32.js';
import Growth32 from '@carbon/icons/es/growth/32.js';
import Hashtag32 from '@carbon/icons/es/hashtag/32.js';
import At32 from '@carbon/icons/es/at/32.js';
import RowCollapse32 from '@carbon/icons/es/row--collapse/32.js';
import RowExpand32 from '@carbon/icons/es/row--expand/32.js';
import { carbonArt, hoverIcon, toggleIcon, type Shapes } from '../../engine';
import {
  clipConvex,
  filletPath,
  framePath,
  polyPath,
  rectPath,
  ringPath,
  roundedRectPath,
  type Pt,
} from '../../geometry';
import { cubicBezier, ENTRANCE, EXIT, together } from '../../ease';
import { EVENODD, f, LINE, ROUND } from '../../paint';
import { REFERENCE_ARROW, referenceFrame } from './chartAxis';

const CRowCollapse = /* @__PURE__ */ carbonArt(RowCollapse32);
const CRowExpand = /* @__PURE__ */ carbonArt(RowExpand32);

const two = /* @__PURE__ */ together();
const three = /* @__PURE__ */ together();
const four = /* @__PURE__ */ together();
const twoWide = /* @__PURE__ */ together();
const P = ([x, y]: Pt) => `${f(x)} ${f(y)}`;

/**
 * A closed box with 2px walls (outer corners r2, inner sharp, as Carbon's),
 * given by its outer edge. Filled rather than stroked: Chrome strokes an r1
 * centreline corner at 2px visibly thin at small sizes.
 */
const box = (x0: number, y0: number, x1: number, y1: number) => ({
  d: framePath(x0, y0, x1, y1),
});
/** A node ring: Carbon's r4/r2 ring, centreline r3; `k` grows it. */
const node = (c: Pt, k: number) => ({ d: ringPath(c, 3 + k, 2) });
/** A connector end tucked into a ring's wall (between its rest and grown walls). */
const TUCK = 3.2;
/** A rounded diamond (outer corners r2 about the inner vertex), `half` its centreline half-diagonal. */
const diamondLine = ([cx, cy]: Pt, half: number) =>
  `${filletPath(
    [
      [cx - half / 2, cy - half / 2],
      [cx, cy - half],
      [cx + half, cy],
      [cx, cy + half],
      [cx - half, cy],
      [cx - half / 2, cy - half / 2],
    ],
    1
  )}Z`;

// ── Data refinery ────────────────────────────────────────────────────────────

// The source square and the refined circle each grow 1px and trade places
// a little: the circle, with the pipe's upper (left) riser, slides 2px
// right; the square, with the lower (right) riser, slides 2px left. The
// pipe's runs shorten to match, so every gap holds.
export const DataRefinerySpec = /* @__PURE__ */ hoverIcon('DataRefinery', {
  geo: ({ h }) => {
    const [l, r] = [6 + 2 * h, 26 - 2 * h]; // the risers' outer faces
    const pipe = `M${f(r - 2)} 26H${f(14 + 3 * h)}V24H${f(r - 2)}V17H${f(l + 2)}A2 2 0 0 1 ${f(l)} 15V8A2 2 0 0 1 ${f(l + 2)} 6H${f(18 - 3 * h)}V8H${f(l + 2)}V15H${f(r - 2)}A2 2 0 0 1 ${f(r)} 17V24A2 2 0 0 1 ${f(r - 2)} 26Z`;
    return {
      circle: { d: ringPath([7 + 2 * h, 25], 4 + h, 2) },
      pipe: { d: pipe },
      square: box(20 - 3 * h, 2 - h, 30 - h, 12 + h),
    };
  },
  static: /* @__PURE__ */ carbonArt(DataRefinery32),
});

// Data refinery reference: Data refinery's hover where the reference arrow
// stands in for the circle. The square grows and slides 3px left, the risers
// close in 2px each and the upper run shortens with the square; the lower
// run's open end (x 16) holds, keeping its 4px to the arrow, which holds.
export const DataRefineryReferenceSpec = /* @__PURE__ */ hoverIcon(
  'DataRefineryReference',
  {
    geo: ({ h }) => {
      const [l, r] = [6 + 2 * h, 26 - 2 * h]; // the risers' outer faces
      return {
        pipe: {
          d: `M${f(r - 2)} 26H16V24H${f(r - 2)}V17H${f(l + 2)}A2 2 0 0 1 ${f(l)} 15V8A2 2 0 0 1 ${f(l + 2)} 6H${f(18 - 3 * h)}V8H${f(l + 2)}V15H${f(r - 2)}A2 2 0 0 1 ${f(r)} 17V24A2 2 0 0 1 ${f(r - 2)} 26Z`,
        },
        square: box(20 - 3 * h, 2 - h, 30 - h, 12 + h),
        badge: { d: REFERENCE_ARROW },
      };
    },
    static: /* @__PURE__ */ carbonArt(DataRefineryReference32),
  }
);

// ── Data share ───────────────────────────────────────────────────────────────

// Both bent arrows reach 2px further (a pair: the set-wide 2px reach): each head moves along its shaft, which lengthens behind it; the
// tails and the lines hold.
const SHARE_UP: Pt[] = [
  [5, 15.8281],
  [1.4141, 19.4141],
  [0, 18],
  [6, 12],
  [12, 18],
  [10.5859, 19.4141],
  [7, 15.8281],
];
const SHARE_DOWN: Pt[] = [
  [27, 15.1719],
  [30.5859, 11.5859],
  [32, 13],
  [26, 19],
  [20, 13],
  [21.4141, 11.5859],
  [25, 15.1719],
];
const headPath = (pts: Pt[], dy: number) =>
  `M${pts.map(([x, y]) => P([x, y + dy])).join('L')}Z`;
export const DataShareSpec = /* @__PURE__ */ hoverIcon('DataShare', {
  geo: ({ h }) => {
    const d = 2 * h;
    return {
      up: {
        d: `M5 ${f(15.8281 - d)}V25A2 2 0 0 0 7 27H19V25H7V${f(15.8281 - d)}Z`,
      },
      upHead: { d: headPath(SHARE_UP, -d) },
      down: {
        d: `M27 ${f(15.1719 + d)}V6A2 2 0 0 0 25 4H13V6H25V${f(15.1719 + d)}Z`,
      },
      downHead: { d: headPath(SHARE_DOWN, d) },
      node: {
        d: 'M24,22h4a2.002,2.002,0,0,1,2,2v4a2.002,2.002,0,0,1-2,2H24a2.002,2.002,0,0,1-2-2V24A2.002,2.002,0,0,1,24,22Zm4,6V24H23.9985L24,28Z',
      },
      lines: { d: rectPath(2, 6, 8, 8) + rectPath(2, 2, 10, 4) },
    };
  },
  static: /* @__PURE__ */ carbonArt(DataShare32),
});

// ── Data table ───────────────────────────────────────────────────────────────

// The table grows 1px out on every side (walls hold 2px; the header rule
// holds) while its cells refresh, every row together (no stagger): one cell scales
// quickly down to nothing about its centre and an empty one scales up in
// its place, so each row's pattern steps one place. The cells are solid,
// so scaling them changes no line weight.
const TABLE_X = [8, 14, 20];
const TABLE_Y = [14, 18, 22];
const TABLE_REST = [
  [1, 0, 1],
  [1, 1, 0],
  [0, 1, 1],
];
const TABLE_HOVER = [
  [1, 1, 0],
  [0, 1, 1],
  [1, 0, 1],
];
/** A row's linear progress: every row together (no stagger; they went 30ms apart). */
const rowAt = (h: number, i: number) => (void i, Math.min(1, Math.max(0, h)));
/** Linear t's progress through [a, b], eased. */
const slice = (t: number, a: number, b: number, ease: (x: number) => number) =>
  ease(Math.min(1, Math.max(0, (t - a) / (b - a))));
export const DataTableSpec = /* @__PURE__ */ hoverIcon('DataTable', {
  hover: three.hover,
  geo: ({ h }) => {
    const k = three.at(h, 0);
    const s: Shapes = {
      frame: {
        d:
          roundedRectPath(3 - k, 3 - k, 29 + k, 29 + k) +
          rectPath(5 - k, 5 - k, 27 + k, 9) +
          rectPath(5 - k, 11, 27 + k, 27 + k),
        ...EVENODD,
      },
    };
    TABLE_Y.forEach((y, i) => {
      const t = rowAt(h, i);
      TABLE_X.forEach((x, j) => {
        const [was, will] = [TABLE_REST[i][j], TABLE_HOVER[i][j]];
        // The old cell scales out first, the new one in straight after, so the swap reads as a refresh.
        const g =
          was === will
            ? was
            : was
              ? 1 - slice(t, 0, 0.45, EXIT)
              : slice(t, 0.45, 1, ENTRANCE);
        s[`c${i}${j}`] = {
          d:
            g > 0.001
              ? rectPath(x + 2 - 2 * g, y + 1 - g, x + 2 + 2 * g, y + 1 + g)
              : '',
        };
      });
    });
    return s;
  },
  static: /* @__PURE__ */ carbonArt(DataTable32),
});

// Data table reference: Data table's hover on Carbon's --reference drawing.
// The table grows 1px out on every side, the walls cut for the badge keeping
// their open ends (so their 4px to it holds), while the cells refresh as
// Data table's do (one scales out, then one scales in): the top row's pattern
// steps one place, as Data table's; the two short rows, kept clear of the
// badge, trade places. The reference arrow holds.
const TABLE_REF: Array<[x: number, y: number, was: number, will: number]> = [
  [8, 14, 1, 1],
  [14, 14, 0, 1],
  [20, 14, 1, 0],
  [16, 18, 1, 0],
  [20, 18, 0, 1],
  [16, 22, 0, 1],
  [20, 22, 1, 0],
];
export const DataTableReferenceSpec = /* @__PURE__ */ hoverIcon(
  'DataTableReference',
  {
    hover: three.hover,
    geo: ({ h }) => {
      const k = three.at(h, 0);
      const t = Math.min(1, Math.max(0, h));
      const s: Shapes = {
        frame: {
          d:
            referenceFrame(3 - k, 3 - k, 29 + k, 29 + k, 11) +
            rectPath(5 - k, 5 - k, 27 + k, 9),
          ...EVENODD,
        },
      };
      TABLE_REF.forEach(([x, y, was, will], i) => {
        const g =
          was === will
            ? was
            : was
              ? 1 - slice(t, 0, 0.45, EXIT)
              : slice(t, 0.45, 1, ENTRANCE);
        s[`c${i}`] = {
          d:
            g > 0.001
              ? rectPath(x + 2 - 2 * g, y + 1 - g, x + 2 + 2 * g, y + 1 + g)
              : '',
        };
      });
      s.badge = { d: REFERENCE_ARROW };
      return s;
    },
    static: /* @__PURE__ */ carbonArt(DataTableReference32),
  }
);

// ── Diagram ──────────────────────────────────────────────────────────────────

// The pie's gap opens 45° (its 3 o'clock edge swings down to 4:30) and the
// detached slice widens 45° to match, while the slice moves 2px back
// towards its place and 1px right. Both also grow as if their radius
// grew 1px (as ChartRing's and ChartPie's circles): each outer arc moves
// 1px out about its own centre. Both are built as sectors with 2px walls,
// Carbon's r1 outer corners and r2 centre corner, so line weight holds as
// they open and grow.
const DOCK = (() => {
  const [dx, dy] = [13 - 18, 19 - 13];
  const l = Math.hypot(dx, dy);
  return [dx / l, dy / l] as Pt;
})();
const dir = (deg: number): Pt => [
  Math.cos((deg * Math.PI) / 180),
  Math.sin((deg * Math.PI) / 180),
];
const add = (...ps: Pt[]): Pt =>
  ps.reduce(([x, y], [a, b]) => [x + a, y + b], [0, 0]);
const mul = ([x, y]: Pt, k: number): Pt => [x * k, y * k];
/** Where the lines p + t·u and q + s·v cross. */
const meet = (p: Pt, u: Pt, q: Pt, v: Pt): Pt => {
  const t =
    ((q[0] - p[0]) * v[1] - (q[1] - p[1]) * v[0]) / (u[0] * v[1] - u[1] * v[0]);
  return add(p, mul(u, t));
};
/** A sector outline from angle a0 clockwise to a1 about c: outer radius 11 + g, 2px walls. */
function sector(c: Pt, a0: number, a1: number, g = 0): string {
  const [u0, u1] = [dir(a0), dir(a1)];
  const [n0, n1] = [dir(a0 - 90), dir(a1 + 90)]; // out of the sector
  const [ro, ri] = [11 + g, 9 + g];
  const R = Math.sqrt(ri * ri - 1); // the inner arc meets a wall's inner face here
  const large = a1 - a0 > 180 ? 1 : 0;
  let outer = `M${P(add(c, mul(u0, ro)))}A${f(ro)} ${f(ro)} 0 ${large} 1 ${P(add(c, mul(u1, ro)))}A1 1 0 0 1 ${P(add(c, mul(u1, ro - 1), n1))}`;
  let hole = `M${P(add(c, mul(u1, R), mul(n1, -1)))}A${f(ri)} ${f(ri)} 0 ${large} 0 ${P(add(c, mul(u0, R), mul(n0, -1)))}`;
  if (large) {
    const p = meet(add(c, n0), u0, add(c, n1), u1); // sharp outside corner
    outer += `L${P(p)}`;
    hole += `L${P(add(p, mul(n0, -2)))}A2 2 0 0 1 ${P(add(p, mul(n1, -2)))}Z`;
  } else {
    const q = meet(add(c, mul(n0, -1)), u0, add(c, mul(n1, -1)), u1); // sharp inside corner
    outer += `L${P(add(q, mul(n1, 2)))}A2 2 0 0 1 ${P(add(q, mul(n0, 2)))}`;
    hole += `L${P(q)}Z`;
  }
  outer += `L${P(add(c, mul(u0, ro - 1), n0))}A1 1 0 0 1 ${P(add(c, mul(u0, ro)))}Z`;
  return outer + hole;
}
export const DiagramSpec = /* @__PURE__ */ hoverIcon('Diagram', {
  geo: ({ h }) => {
    const open = 45 * ENTRANCE(h);
    const c = add([18 + h, 13], mul(DOCK, 2 * h));
    return {
      pie: { d: sector([13, 19], open, 270, h), ...EVENODD },
      slice: { d: sector(c, -90, open, h), ...EVENODD },
    };
  },
  static: /* @__PURE__ */ carbonArt(Diagram32),
});

/**
 * `sector` less its outer wall from angle b0 clockwise to b1 (a0 < b0 < b1 <
 * a1, the sector more than half a turn): one outline, the cut wall's ends
 * square on their radii, as Carbon cuts the pie for the reference arrow.
 */
function cutSector(
  c: Pt,
  a0: number,
  a1: number,
  b0: number,
  b1: number,
  g = 0
): string {
  const [u0, u1, v0, v1] = [dir(a0), dir(a1), dir(b0), dir(b1)];
  const [n0, n1] = [dir(a0 - 90), dir(a1 + 90)]; // out of the sector
  const [ro, ri] = [11 + g, 9 + g];
  const R = Math.sqrt(ri * ri - 1); // the inner arc meets a wall's inner face here
  const p = meet(add(c, n0), u0, add(c, n1), u1); // the sharp outside corner
  return (
    `M${P(add(c, mul(v0, ro)))}L${P(add(c, mul(v0, ri)))}A${f(ri)} ${f(ri)} 0 0 0 ${P(add(c, mul(u0, R), mul(n0, -1)))}` +
    `L${P(add(p, mul(n0, -2)))}A2 2 0 0 1 ${P(add(p, mul(n1, -2)))}L${P(add(c, mul(u1, R), mul(n1, -1)))}A${f(ri)} ${f(ri)} 0 0 0 ${P(add(c, mul(v1, ri)))}` +
    `L${P(add(c, mul(v1, ro)))}A${f(ro)} ${f(ro)} 0 0 1 ${P(add(c, mul(u1, ro)))}A1 1 0 0 1 ${P(add(c, mul(u1, ro - 1), n1))}` +
    `L${P(p)}L${P(add(c, mul(u0, ro - 1), n0))}A1 1 0 0 1 ${P(add(c, mul(u0, ro)))}A${f(ro)} ${f(ro)} 0 0 1 ${P(add(c, mul(v0, ro)))}Z`
  );
}
// Diagram reference: Diagram's hover on Carbon's --reference drawing (the
// pie about (15, 17), the slice about (19, 13)). The pie's outer wall is cut
// from 6 to 9 o'clock for the badge; the cut ends stay on their radii as the
// pie grows, so their space to the badge holds. The reference arrow holds.
const DOCK_REF = (() => {
  const [dx, dy] = [15 - 19, 17 - 13];
  const l = Math.hypot(dx, dy);
  return [dx / l, dy / l] as Pt;
})();
export const DiagramReferenceSpec = /* @__PURE__ */ hoverIcon(
  'DiagramReference',
  {
    geo: ({ h }) => {
      const open = 45 * ENTRANCE(h);
      const c = add([19 + h, 13], mul(DOCK_REF, 2 * h));
      return {
        pie: { d: cutSector([15, 17], open, 270, 90, 180, h) },
        slice: { d: sector(c, -90, open, h), ...EVENODD },
        badge: { d: REFERENCE_ARROW },
      };
    },
    static: /* @__PURE__ */ carbonArt(DiagramReference32),
  }
);

// ── Flow family ──────────────────────────────────────────────────────────────

// Flow: the top node grows 1px, then the two lower nodes together, 30ms
// later; the connectors hold.
export const FlowSpec = /* @__PURE__ */ hoverIcon('Flow', {
  hover: two.hover,
  geo: ({ h }) => ({
    links: {
      d: `${filletPath(
        [
          [6, 26 - TUCK],
          [6, 16],
          [26, 16],
          [26, 26 - TUCK],
        ],
        1
      )}M16 ${6 + TUCK}V16`,
      ...LINE,
    },
    n0: node([16, 6], two.at(h, 0)),
    n1: node([6, 26], two.at(h, 1)),
    n2: node([26, 26], two.at(h, 1)),
  }),
  static: /* @__PURE__ */ carbonArt(Flow32),
});

// Branch flow: the source node grows 1px, then the two branch nodes
// together, 30ms later; the paths hold.
export const FlowBranchSpec = /* @__PURE__ */ hoverIcon('FlowBranch', {
  hover: two.hover,
  geo: ({ h }) => ({
    links: {
      d: `M${6 + TUCK} 8H${26 - TUCK}M10 8A4 4 0 0 1 14 12V20A4 4 0 0 0 18 24H${26 - TUCK}`,
      ...LINE,
    },
    n0: node([6, 8], two.at(h, 0)),
    n1: node([26, 8], two.at(h, 1)),
    n2: node([26, 24], two.at(h, 1)),
  }),
  static: /* @__PURE__ */ carbonArt(FlowBranch32),
});

// Merge flow: the two source nodes grow 1px together, then the merged node,
// 45ms later; the paths hold.
export const FlowMergeSpec = /* @__PURE__ */ hoverIcon('FlowMerge', {
  hover: twoWide.hover,
  geo: ({ h }) => ({
    links: {
      d: `M${6 + TUCK} 8H${26 - TUCK}M22 8A4 4 0 0 0 18 12V20A4 4 0 0 1 14 24H${6 + TUCK}`,
      ...LINE,
    },
    n0: node([6, 8], twoWide.at(h, 0)),
    n1: node([6, 24], twoWide.at(h, 0)),
    n2: node([26, 8], twoWide.at(h, 1)),
  }),
  static: /* @__PURE__ */ carbonArt(FlowMerge32),
});

// Conditional flow: the node grows 1px, then the decision diamond grows
// 2px out along each edge, 30ms later; the link holds.
const COND_C: Pt = [22.3408, 16];
const COND_HALF = 5.6572 + Math.SQRT2;
export const FlowConditionalSpec = /* @__PURE__ */ hoverIcon(
  'FlowConditional',
  {
    hover: two.hover,
    geo: ({ h }) => {
      const half = COND_HALF + 2 * Math.SQRT2 * two.at(h, 1);
      // The link ends just inside the diamond's left corner, wherever it is.
      return {
        link: { d: `M${6 + TUCK} 16H${f(COND_C[0] - half + 1.23)}`, ...LINE },
        node: node([6, 16], two.at(h, 0)),
        diamond: { d: diamondLine(COND_C, half), ...LINE },
      };
    },
    static: /* @__PURE__ */ carbonArt(FlowConditional32),
  }
);

// Flow connection: the diamond grows 1px out along each edge, then both
// squares grow 1px together, 30ms later; the links hold.
export const FlowConnectionSpec = /* @__PURE__ */ hoverIcon('FlowConnection', {
  hover: two.hover,
  geo: ({ h }) => {
    const [a, b] = [two.at(h, 1), two.at(h, 0)];
    const half = 5 + Math.SQRT2 * b;
    return {
      // Each link runs from inside a square's wall to the diamond's corner.
      links: {
        d: `M9 ${f(11 + a)}V${f(23 - half)}M${f(9 + half)} 23H${f(21 - a)}`,
        ...LINE,
      },
      from: box(4 - a, 2 - a, 14 + a, 12 + a),
      diamond: {
        d: `M9 ${f(23 - half)}L${f(9 + half)} 23L9 ${f(23 + half)}L${f(9 - half)} 23Z`,
        ...ROUND,
      },
      to: box(20 - a, 18 - a, 30 + a, 28 + a),
    };
  },
  static: /* @__PURE__ */ carbonArt(FlowConnection32),
});

// Flow data: the three nodes and the square grow 1px along the Z, 30ms
// apart; the links hold.
const FD_DIAG = TUCK * Math.SQRT1_2;
export const FlowDataSpec = /* @__PURE__ */ hoverIcon('FlowData', {
  hover: four.hover,
  geo: ({ h }) => {
    const k = four.at(h, 3);
    return {
      links: {
        d: `M${8 + TUCK} 8H${24 - TUCK}M${f(24 - FD_DIAG)} ${f(8 + FD_DIAG)}L${f(8 + FD_DIAG)} ${f(24 - FD_DIAG)}M${8 + TUCK} 24H21`,
        ...LINE,
      },
      n0: node([8, 8], four.at(h, 0)),
      n1: node([24, 8], four.at(h, 1)),
      n2: node([8, 24], four.at(h, 2)),
      square: {
        d:
          rectPath(20 - k, 20 - k, 28 + k, 28 + k) +
          rectPath(22 - k, 22 - k, 26 + k, 26 + k),
        ...EVENODD,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(FlowData32),
});

// ── Growth ───────────────────────────────────────────────────────────────────

// ChartLine's pattern: the middle points slide 2px along the first
// segment's angle and the end, with its arrowhead, extends 4px along the
// last segment's angle (here the same angle); the start holds.
export const GrowthSpec = /* @__PURE__ */ hoverIcon('Growth', {
  geo: ({ h }) => {
    const at =
      (d: number) =>
      ([x, y]: Pt) =>
        P([x + d * h * Math.SQRT1_2, y - d * h * Math.SQRT1_2]);
    const [mid, end] = [at(2), at(4)];
    return {
      line: {
        d: `M2.7071 25.2929L${mid([13, 15])}L${mid([18, 20])}L${end([29, 9])}`,
        ...ROUND,
      },
      head: { d: `M${end([20, 9])}L${end([29, 9])}L${end([29, 18])}`, ...LINE },
    };
  },
  static: /* @__PURE__ */ carbonArt(Growth32),
});

// ── Hashtag ──────────────────────────────────────────────────────────────────

// All four strokes extend 2px at each end.
export const HashtagSpec = /* @__PURE__ */ hoverIcon('Hashtag', {
  geo: ({ h }) => {
    const [a, b] = [f(4 - 2 * h), f(28 + 2 * h)];
    return {
      strokes: {
        d: `M${a} 11H${b}M${a} 21H${b}M11 ${a}V${b}M21 ${a}V${b}`,
        ...LINE,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Hashtag32),
});

// ── At ───────────────────────────────────────────────────────────────────────

// At:
// the ring's open tail (its bottom stroke, x 16–23) extends AT_REACH (4px)
// along its line, its start held; and the "a" grows AT_GROW (15%) about its
// bowl's centre (15.5, 16.5) at its 2px weight: as Bold's bowls, every edge
// of the bowl, its hollow and the stem moves out by the same 0.675 (15% of
// the bowl's centreline radius, 4.5), the arcs keep their centres with
// radii grown as much, and the straight sides hold their length. The hook
// from the stem's foot into the ring bends to stay joined: its stem end
// rides out with the "a", its ring end holds. The ring holds.
export const AT_REACH = 4;
/** How much the "a" grows at full hover (0.15 = 15% of its bowl's centreline radius, 4.5), at constant weight. */
export const AT_GROW = 0.15;
/** Carbon's at with the tail's end moved `tail` px right and the "a"'s every edge moved `g` px out. */
export function atPath(tail: number, g: number): string {
  const n = (v: number) => +v.toFixed(4);
  const A = (r: number, x: number, y: number) =>
    `A${n(r)} ${n(r)} 0 0 0 ${n(x)} ${n(y)}`;
  return (
    `M16 3A12.92 12.92 0 0 0 3 16V17A13 13 0 0 0 16 30H${n(23 + tail)}V28H16A11 11 0 0 1 5 17V16A10.94 10.94 0 0 1 16 5A10.64 10.64 0 0 1 27 16` +
    // The hook's inside, from the ring down to the stem's foot.
    `C27 19.59 ${n(25.6 + g)} ${n(21 + g)} ${n(23.34 + g)} ${n(21 + g)}C${n(21.76 + g)} ${n(21 + g)} ${n(21 + g)} ${n(19.71 + g)} ${n(21 + g)} ${n(18 + g)}` +
    // Up the stem and over its top, then the bowl's outside round to the hook's.
    `V${n(10 - g)}H${n(19 + g)}V${n(11.94 - g)}${A(3.84 + g, 15.5, 10 - g)}${A(5.48 + g, 10 - g, 15.44)}V17.56${A(5.48 + g, 15.5, 23 + g)}${A(4.28 + g, 19.5 + g, 20.54 + g)}` +
    `${A(4.35, 23.41 + g, 23 + g)}C${n(26.48 + g)} ${n(23 + g)} 29 21 29 16A12.72 12.72 0 0 0 16 3Z` +
    // The bowl's hollow.
    `M${n(19 + g)} 17.56A${n(3.5 + g)} ${n(3.5 + g)} 0 0 1 ${n(12 - g)} 17.56V15.44A${n(3.5 + g)} ${n(3.5 + g)} 0 0 1 ${n(19 + g)} 15.44Z`
  );
}
export const AtSpec = /* @__PURE__ */ hoverIcon('At', {
  geo: ({ h }) => ({ at: { d: atPath(AT_REACH * h, AT_GROW * 4.5 * h) } }),
  static: /* @__PURE__ */ carbonArt(At32),
});

// ── Row expand / collapse ────────────────────────────────────────────────────

// Hover: the arrow reaches 3px further the way it points (the head moves,
// the shaft lengthens behind it) while the bar and the row narrow 1px at
// each end (walls hold 2px).
//
// Toggle (the reference animation, 200ms; t is the timeline, 0 = collapse,
// 1 = expand, each part on its own ease as in the reference): the row
// slides 16px up across the two bars, which hold still. The collapse bar
// narrows to half its width while the up arrow slides down into it, and
// the row's top wall then takes the bar in; once the row's bottom wall has
// passed, the expand bar is there, growing back from a quarter width, and the
// down arrow slides down out of it to its place. Going to collapse plays
// the timeline backwards. Cleaned up from the reference: the up arrow keeps
// its width (the reference squashes it with its parent bar), every cut is
// on a solid edge (a bar's or a wall's), nothing pops on or off (the bars
// are trimmed at the walls instead), and sub-pixel slivers are dropped.
// Clips are computed (half-planes), not masks.
const ROW_MS = 200;
const ROW_SLIDE = /* @__PURE__ */ cubicBezier(0.4, 0.14, 0.3, 1); // the row and the up arrow
const ROW_DROP = /* @__PURE__ */ cubicBezier(0.4, 0.084, 0.3, 1); // the down arrow
const ROW_NARROW = /* @__PURE__ */ cubicBezier(0.484, 0.102, 0.748, 0.67); // collapse bar, frames 0–6 of 20
const ROW_WIDEN = /* @__PURE__ */ cubicBezier(0.196, 0.365, 0.474, 1); // expand bar, frames 9–20 of 20
const span = (t: number, a: number, b: number) =>
  Math.min(1, Math.max(0, (t - a) / (b - a)));
/** The collapse arrow (Carbon's, tip up at y=4, shaft foot at 14); `reach` lifts its head. */
const upArrow = (reach: number, dy: number): Pt[] =>
  (
    [
      [17, 7.828],
      [19.586, 10.414],
      [21, 9],
      [16, 4],
      [11, 9],
      [12.414, 10.414],
      [15, 7.828],
      [15, 14],
      [17, 14],
    ] as Pt[]
  ).map(([x, y], i) => [x, y + dy - (i < 7 ? reach : 0)] as Pt);
const mirror = (pts: Pt[]): Pt[] => pts.map(([x, y]) => [x, 32 - y] as Pt);
/** pts clipped to the band lo ≤ y ≤ hi, as a path ('' when less than `min` tall is left). */
const band = (pts: Pt[], lo: number, hi: number, min = 0.3) => {
  if (hi <= lo) {
    return '';
  }
  const out = clipConvex(pts, [
    [-8, lo],
    [40, lo],
    [40, hi],
    [-8, hi],
  ]);
  if (out.length < 3) {
    return '';
  }
  const ys = out.map(([, y]) => y);
  return Math.max(...ys) - Math.min(...ys) < min ? '' : polyPath(out, true);
};
/** t: the toggle's timeline, 0 = row collapse, 1 = row expand. */
function rowShapes(t: number, h: number): Shapes {
  const [x0, x1] = [4 + h, 28 - h];
  const r = 3 * h;
  const bar = (y: number, k: number): Pt[] => {
    const w = 12 * k - h;
    return [
      [16 - w, y],
      [16 + w, y],
      [16 + w, y + 2],
      [16 - w, y + 2],
    ];
  };
  const slide = ROW_SLIDE(t);
  const [top, bottom] = [20 - 16 * slide, 28 - 16 * slide]; // the row's outer edge
  const down = mirror(upArrow(r, 0)).map(
    ([x, y]) => [x, y - 35 + 35 * ROW_DROP(t)] as Pt
  );
  return {
    row: {
      d:
        roundedRectPath(x0, top, x1, bottom) +
        rectPath(x0 + 2, top + 2, x1 - 2, bottom - 2),
      ...EVENODD,
    },
    // A bar under 1px tall against a wall reads as a hairline: drop it.
    oldBar: {
      d: band(bar(14, 1 - 0.75 * ROW_NARROW(span(t, 0, 6 / 20))), -8, top, 1),
    },
    // Cut at the collapse bar's foot, so the arrow sinks into the bar.
    upArrow: { d: band(upArrow(r, 38 * slide), -8, Math.min(16, top)) },
    newBar: {
      d: band(
        bar(16, 0.25 + 0.75 * ROW_WIDEN(span(t, 9 / 20, 1))),
        bottom,
        40,
        1
      ),
    },
    // Out of the expand bar's head, or the row's wall while it covers it.
    downArrow: { d: band(down, Math.max(16, bottom), 40) },
  };
}
export const RowExpandSpec = /* @__PURE__ */ hoverIcon('RowExpand', {
  geo: ({ h }) => rowShapes(1, h),
  static: /* @__PURE__ */ carbonArt(RowExpand32),
});
export const RowCollapseSpec = /* @__PURE__ */ hoverIcon('RowCollapse', {
  geo: ({ h }) => rowShapes(0, h),
  static: /* @__PURE__ */ carbonArt(RowCollapse32),
});
export const RowExpandToggleSpec = /* @__PURE__ */ toggleIcon<
  'expand' | 'collapse'
>('RowExpandToggle', {
  states: ['expand', 'collapse'],
  statics: [CRowExpand, CRowCollapse],
  geo: ({ h, p }) => rowShapes(1 - p, h),
  // Linear: each part applies its own ease from the reference.
  change: (turningOn, _fr, tween) =>
    tween('p', turningOn ? 1 : 0, {
      duration: ROW_MS / 1000,
      ease: [0, 0, 1, 1],
    }),
});
