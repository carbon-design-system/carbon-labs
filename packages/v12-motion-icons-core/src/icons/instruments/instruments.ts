/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Box32 from '@carbon/icons/es/box/32.js';
import Bullhorn32 from '@carbon/icons/es/bullhorn/32.js';
import Cursor_132 from '@carbon/icons/es/cursor--1/32.js';
import Cursor_232 from '@carbon/icons/es/cursor--2/32.js';
import Portfolio32 from '@carbon/icons/es/portfolio/32.js';
import Tools32 from '@carbon/icons/es/tools/32.js';
import ToolKit32 from '@carbon/icons/es/tool-kit/32.js';
import ToolsAlt32 from '@carbon/icons/es/tools--alt/32.js';
import Meter32 from '@carbon/icons/es/meter/32.js';
import MeterAlt32 from '@carbon/icons/es/meter--alt/32.js';
import Radar32 from '@carbon/icons/es/radar/32.js';
import Ruler32 from '@carbon/icons/es/ruler/32.js';
import Scales32 from '@carbon/icons/es/scales/32.js';
import Stamp32 from '@carbon/icons/es/stamp/32.js';
import ToolBox32 from '@carbon/icons/es/tool-box/32.js';
import {
  filletPath,
  mapPath,
  polyPath,
  rectPath,
  ringPath,
  roundedRectPath,
  type Pt,
} from '../../geometry';
import { hoverIcon, carbonArt, withStatic } from '../../engine';
import { stagger } from '../../ease';
import { EVENODD, f, LINE } from '../../paint';

/**
 * Instruments (no reference animations). Parts move
 * rigidly (slides and turns), so every line keeps its weight. Where one part
 * moves against another, Carbon's single path is split into pieces that
 * overlap where they meet (each tucked under its neighbour) so no seam shows
 * at rest.
 */

const rad = (deg: number) => (deg * Math.PI) / 180;
const polar = ([cx, cy]: Pt, r: number, deg: number): Pt => [
  cx + r * Math.cos(rad(deg)),
  cy + r * Math.sin(rad(deg)),
];
const P = ([x, y]: Pt) => `${f(x)} ${f(y)}`;

// ── Box ──────────────────────────────────────────────────────────────────────

// Box: as Gift, the lid widens 2px (1px at each end, walls holding 2px)
// and tips 14.5° about a pivot over the body's right wall, so its left end
// lifts clear (14.5° is as far as the widened lid's corner stays inside the
// 36px hover box). The body keeps its own 2px top wall, hidden under the
// lid's bottom wall at rest; the label holds.
const BOX_LABEL =
  'M20,21H12a2,2,0,0,1-2-2V17a2,2,0,0,1,2-2h8a2,2,0,0,1,2,2v2A2,2,0,0,1,20,21Zm-8-4v2h8V17Z';
const BOX_BODY =
  'M4 10V28A2 2 0 0 0 6 30H26A2 2 0 0 0 28 28V10Z' +
  /* @__PURE__ */ rectPath(6, 12, 26, 28);
export const BoxSpec = /* @__PURE__ */ hoverIcon('Box', {
  geo: ({ h }) => ({
    body: { d: BOX_BODY, ...EVENODD },
    label: { d: BOX_LABEL },
    lid: {
      d: roundedRectPath(2 - h, 4, 30 + h, 12) + rectPath(4 - h, 6, 28 + h, 10),
      ...EVENODD,
      transform: `rotate(${f(14.5 * h)} 27 11)`,
    },
  }),
  static: /* @__PURE__ */ carbonArt(Box32),
});

// ── Whole-icon turns and nudges ──────────────────────────────────────────────

/** A Carbon drawing moved rigidly on hover. */
/* @__NO_SIDE_EFFECTS__ */
const rigid = (name: string, d: string, move: (h: number) => string) =>
  hoverIcon(name, { geo: ({ h }) => ({ art: { d, transform: move(h) } }) });

// Bullhorn: tilts up 10° about the handle's grip while its mouth widens
// 2px (1px at each end) and the horn's sides flare to meet it. The horn and
// handle are their 2px centrelines (fitted exactly to Carbon), so the
// flaring sides keep their weight.
export const BullhornSpec = /* @__PURE__ */ hoverIcon('Bullhorn', {
  geo: ({ h }) => {
    const turn = `rotate(${f(-10 * h)} 14 25)`;
    return {
      mouth: { d: rectPath(26, 6 - h, 28, 26 + h), transform: turn },
      horn: {
        d: filletPath(
          [
            [27, 8.97 - h],
            [4.95, 13.05],
            [4.95, 19.03],
            [27, 22.95 + h],
          ],
          1
        ),
        ...LINE,
        transform: turn,
      },
      handle: {
        d: filletPath(
          [
            [9, 20.6],
            [9, 25],
            [19, 25],
            [19, 22.4],
          ],
          1
        ),
        ...LINE,
        transform: turn,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Bullhorn32),
});
// Cursors: nudge 3px towards their tip (up and left).
const nudge = (h: number) =>
  `translate(${f(-3 * h * Math.SQRT1_2)} ${f(-3 * h * Math.SQRT1_2)})`;
export const Cursor_1Spec = /* @__PURE__ */ withStatic(
  rigid(
    'Cursor_1',
    'M23,28a1,1,0,0,1-.71-.29l-6.13-6.14-3.33,5a1,1,0,0,1-1,.44,1,1,0,0,1-.81-.7l-6-20A1,1,0,0,1,6.29,5l20,6a1,1,0,0,1,.7.81,1,1,0,0,1-.44,1l-5,3.33,6.14,6.13a1,1,0,0,1,0,1.42l-4,4A1,1,0,0,1,23,28Zm0-2.41L25.59,23l-7.16-7.15,5.25-3.5L7.49,7.49l4.86,16.19,3.5-5.25Z',
    nudge
  ),
  /* @__PURE__ */ carbonArt(Cursor_132)
);
export const Cursor_2Spec = /* @__PURE__ */ withStatic(
  rigid(
    'Cursor_2',
    'M27.34,12.06l-22-8A1,1,0,0,0,4.06,5.34l8,22A1,1,0,0,0,13,28h0a1,1,0,0,0,.93-.63l3.84-9.6,9.6-3.84a1,1,0,0,0,0-1.87Zm-10.71,4h0l-.4.16-.16.4h0L13,24.2,6.67,6.67,24.2,13Z',
    nudge
  ),
  /* @__PURE__ */ carbonArt(Cursor_232)
);
// Portfolio: lifts 2px and tilts 6°, as if picked up by its handle, while
// the handle widens 2px (1px each side; walls hold 2px). The handle's legs
// end inside the case's top wall.
const PORTFOLIO_CASE =
  'M28,10H4a2,2,0,0,0-2,2V26a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V12A2,2,0,0,0,28,10ZM4,26V12H28V26Z';
export const PortfolioSpec = /* @__PURE__ */ hoverIcon('Portfolio', {
  geo: ({ h }) => {
    const turn = `translate(0 ${f(-2 * h)}) rotate(${f(-6 * h)} 16 5)`;
    const [x0, x1] = [10 - h, 22 + h];
    return {
      case: { d: PORTFOLIO_CASE, ...EVENODD, transform: turn },
      handle: {
        d:
          `M${f(x0)} 11V6A2 2 0 0 1 ${f(x0 + 2)} 4H${f(x1 - 2)}A2 2 0 0 1 ${f(x1)} 6V11Z` +
          rectPath(x0 + 2, 6, x1 - 2, 11),
        ...EVENODD,
        transform: turn,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Portfolio32),
});
// Tools: the wrench turns 20° anticlockwise about its head (tightening)
// and drops 3.5px, so the turned wrench sits centred top to bottom.
export const ToolsSpec = /* @__PURE__ */ withStatic(
  rigid(
    'Tools',
    'M12.1,2A9.8,9.8,0,0,0,6.7,3.6L13.1,10a2.1,2.1,0,0,1,.2,3,2.1,2.1,0,0,1-3-.2L3.7,6.4A9.84,9.84,0,0,0,2,12.1,10.14,10.14,0,0,0,12.1,22.2a10.9,10.9,0,0,0,2.6-.3l6.7,6.7a5,5,0,0,0,7.1-7.1l-6.7-6.7a10.9,10.9,0,0,0,.3-2.6A10,10,0,0,0,12.1,2Zm8,10.1a7.61,7.61,0,0,1-.3,2.1l-.3,1.1.8.8L27,22.8a2.88,2.88,0,0,1,.9,2.1A2.72,2.72,0,0,1,27,27a2.9,2.9,0,0,1-4.2,0l-6.7-6.7-.8-.8-1.1.3a7.61,7.61,0,0,1-2.1.3,8.27,8.27,0,0,1-5.7-2.3A7.63,7.63,0,0,1,4,12.1a8.33,8.33,0,0,1,.3-2.2l4.4,4.4a4.14,4.14,0,0,0,5.9.2,4.14,4.14,0,0,0-.2-5.9L10,4.2a6.45,6.45,0,0,1,2-.3,8.27,8.27,0,0,1,5.7,2.3A8.49,8.49,0,0,1,20.1,12.1Z',
    (h) => `translate(0 ${f(3.5 * h)}) rotate(${f(-20 * h)} 12.1 12.1)`
  ),
  /* @__PURE__ */ carbonArt(Tools32)
);

// Tool kit: the screwdriver and wrench each turn 10° about their crossing,
// scissoring apart.
const KIT_SCREWDRIVER =
  'M8.9141,24.5l4.257-4.2568-1.414-1.4141L7.5,23.0859l-.793-.7929a.9994.9994,0,0,0-1.414,0l-4,4a.9994.9994,0,0,0,0,1.414l3,3a.9995.9995,0,0,0,1.414,0l4-4a.9994.9994,0,0,0,0-1.414ZM5,28.5859,3.4141,27,6,24.4141,7.5859,26Z' +
  'M29.1226,2.85a3.0716,3.0716,0,0,0-4.2422,0L17.4,10.33l1.4141,1.414,7.48-7.48a1.0244,1.0244,0,0,1,1.4141,0,1.002,1.002,0,0,1,0,1.4145l-7.48,7.48,1.414,1.4141,7.48-7.4795A3.0031,3.0031,0,0,0,29.1226,2.85Z';
const KIT_WRENCH =
  'M24,30a6.0067,6.0067,0,0,1-6-6,5.84,5.84,0,0,1,.2109-1.5469l-8.664-8.6638A5.8483,5.8483,0,0,1,8,14,5.9757,5.9757,0,0,1,2.4228,5.8164l.5577-1.4219L6.293,7.707a1.0233,1.0233,0,0,0,1.4135,0,.999.999,0,0,0,0-1.4141L4.3936,2.979l1.4233-.5571A5.9772,5.9772,0,0,1,14,8a5.84,5.84,0,0,1-.2109,1.5469l8.664,8.6635A5.8548,5.8548,0,0,1,24,18a5.9755,5.9755,0,0,1,5.5771,8.1836L29.02,27.6055,25.707,24.293a1.0233,1.0233,0,0,0-1.4135,0,.999.999,0,0,0-.0005,1.4141L27.6055,29.02l-1.4219.5579A5.96,5.96,0,0,1,24,30ZM10.0625,11.4763,20.5234,21.9375l-.2392.6094A3.9754,3.9754,0,0,0,23.75,27.9922l-.8711-.8711a2.9992,2.9992,0,0,1,0-4.2424,3.0721,3.0721,0,0,1,4.2427.0005l.8706.8708a3.9759,3.9759,0,0,0-5.4458-3.4658l-.6094.2385-10.46-10.46.2392-.6094A3.9755,3.9755,0,0,0,8.2505,4.0078l.8706.8711a2.9992,2.9992,0,0,1,0,4.2424,3.0721,3.0721,0,0,1-4.2427-.0005L4.0078,8.25a3.975,3.975,0,0,0,5.4453,3.4656Z';
export const ToolKitSpec = /* @__PURE__ */ hoverIcon('ToolKit', {
  geo: ({ h }) => ({
    wrench: { d: KIT_WRENCH, transform: `rotate(${f(-10 * h)} 16 16)` },
    screwdriver: {
      d: KIT_SCREWDRIVER,
      transform: `rotate(${f(10 * h)} 16 16)`,
    },
  }),
  static: /* @__PURE__ */ carbonArt(ToolKit32),
});

// Tools alt: Tool kit's move. The ruler (top left to bottom right) turns
// TOOLS_ALT_TURN anticlockwise and the pencil as far clockwise, both about
// their crossing (16, 16), scissoring apart; each is rigid (points turned,
// never scaled), so every wall stays 2px. Carbon's one path is split into
// the ruler (whole, its walls through the crossing) and the pencil's two
// ends, which pass under it: each end is cut on the turned ruler's edge, its
// walls 1px under the ruler's outer wall (tucked, so no seam shows at rest)
// and its hollow on the line Carbon ends it on.
//
// Ruler's notch motion rides on the turning ruler. Its three
// ticks slide TOOLS_ALT_TICK_SLIDE (4px, Ruler's) along it toward its lower
// right end, and a fourth slides in from under the upper left end's wall
// (a tick is cut to the ruler's hollow). Each tick reaches 1px into the
// wall it hangs from, so no seam shows at rest.
export const TOOLS_ALT_TURN = 10;
export const TOOLS_ALT_TICK_SLIDE = 4;
const TOOLS_ALT_RULER =
  'M16 8.9L9.7 2.6C8.9 1.8 7.7 1.8 6.9 2.6L2.6 6.8C1.8 7.6 1.8 8.8 2.6 9.6L8.9 16L16 23.1' +
  'L22.3 29.4C23.1 30.2 24.3 30.2 25.1 29.4L29.3 25.2C30.1 24.4 30.1 23.2 29.3 22.4L23.1 16Z' +
  'M23.8 28L4 8.2L8.2 4L28 23.7Z';
/** Carbon's ticks (wall side, then centre side; the wall-side points 1px into the wall), and the one that slides in, a tick spacing before the first. */
const TOOLS_ALT_TICKS: Pt[][] = [
  [
    [11.7, 7.5],
    [9.6, 9.6],
    [11, 11],
    [13.1, 8.9],
  ],
  [
    [17.3, 13.1],
    [15.2, 15.2],
    [16.6, 16.6],
    [18.7, 14.5],
  ],
  [
    [22.9, 18.7],
    [21, 20.9],
    [22.4, 22.3],
    [24.5, 20.2],
  ],
].map((t) =>
  t.map(
    ([x, y], i): Pt =>
      i === 0 || i === 3 ? [x + Math.SQRT1_2, y - Math.SQRT1_2] : [x, y]
  )
);
const TOOLS_ALT_TICK_GAP = 5.6; // along x and y
/** The ticks slid `d` px along the ruler, each cut to the hollow (x + y ≥ 12.2, its upper left end). */
function toolsAltTicks(d: number): string {
  const along = d * Math.SQRT1_2;
  const ticks = [
    TOOLS_ALT_TICKS[0].map(
      ([x, y]): Pt => [x - TOOLS_ALT_TICK_GAP, y - TOOLS_ALT_TICK_GAP]
    ),
    ...TOOLS_ALT_TICKS,
  ];
  return ticks
    .map((t) => {
      const moved = t.map(([x, y]): Pt => [x + along, y + along]);
      const cut: Pt[] = [];
      moved.forEach((p, i) => {
        const q = moved[(i + 1) % moved.length];
        const [dp, dq] = [p[0] + p[1] - 12.2, q[0] + q[1] - 12.2];
        if (dp >= 0) {
          cut.push(p);
        }
        if (dp >= 0 !== dq >= 0) {
          cut.push([
            p[0] + ((q[0] - p[0]) * dp) / (dp - dq),
            p[1] + ((q[1] - p[1]) * dp) / (dp - dq),
          ]);
        }
      });
      return cut.length > 2 ? polyPath(cut, true) : '';
    })
    .join('');
}
type Edge = readonly [Pt, Pt];
const T = Math.SQRT1_2; // 1px along the ruler's edge normal
/** The ruler's edges the pencil's ends meet, in the ruler's own frame: `wall` 1px inside its outer edge, `hollow` Carbon's. */
const TOOLS_ALT_EDGES: Record<'top' | 'bottom', { wall: Edge; hollow: Edge }> =
  {
    top: {
      wall: [
        [16 - T, 8.9 + T],
        [23.1 - T, 16 + T],
      ],
      hollow: [
        [17.5, 10.3],
        [21.7, 14.5],
      ],
    },
    bottom: {
      wall: [
        [8.9 + T, 16 - T],
        [16 + T, 23.1 - T],
      ],
      hollow: [
        [10.3, 17.5],
        [14.5, 21.7],
      ],
    },
  };
/** Turns a point `deg` (clockwise on screen) about the crossing. */
const turnAbout = (deg: number) => {
  const [c, s] = [Math.cos(rad(deg)), Math.sin(rad(deg))];
  return ([x, y]: Pt): Pt => [
    16 + (x - 16) * c - (y - 16) * s,
    16 + (x - 16) * s + (y - 16) * c,
  ];
};
/** Where the line through a and b crosses the edge. */
function meet(a: Pt, b: Pt, [c, d]: Edge): Pt {
  const [rx, ry, sx, sy] = [b[0] - a[0], b[1] - a[1], d[0] - c[0], d[1] - c[1]];
  const t = ((c[0] - a[0]) * sy - (c[1] - a[1]) * sx) / (rx * sy - ry * sx);
  return [a[0] + rx * t, a[1] + ry * t];
}
/** The pencil's two ends in its own frame, each cut on the ruler's edges as `seen` from there. */
function pencilEnds(seen: (e: Edge) => Edge): string {
  const [top, bottom] = [TOOLS_ALT_EDGES.top, TOOLS_ALT_EDGES.bottom];
  const [tw, th, bw, bh] = [
    seen(top.wall),
    seen(top.hollow),
    seen(bottom.wall),
    seen(bottom.hollow),
  ];
  return (
    `M${P(meet([29.4, 9.7], [23.1, 16], tw))}L29.4 9.7C30.2 8.9 30.2 7.7 29.4 6.9L25.2 2.7C24.4 1.9 23.2 1.9 22.4 2.7L${P(meet([22.4, 2.7], [16, 8.9], tw))}Z` +
    `M23.8 4L28 8.2L${P(meet([28, 8.2], [21.7, 14.5], th))}L${P(meet([23.8, 4], [17.5, 10.3], th))}Z` +
    `M${P(meet([2, 22.9], [8.9, 16], bw))}L2 22.9L2 30L9.1 30L${P(meet([9.1, 30], [16, 23.1], bw))}Z` +
    `M8.2 28L4 28L4 23.8L${P(meet([4, 23.8], [10.3, 17.5], bh))}L${P(meet([8.2, 28], [14.5, 21.7], bh))}Z`
  );
}
export const ToolsAltSpec = /* @__PURE__ */ hoverIcon('ToolsAlt', {
  geo: ({ h }) => {
    const a = TOOLS_ALT_TURN * h;
    // The ruler's edges seen from the pencil: turned by the ruler's −a, then back by the pencil's a.
    const rel = turnAbout(-2 * a);
    return {
      ruler: { d: mapPath(TOOLS_ALT_RULER, turnAbout(-a)) },
      ticks: {
        d: mapPath(toolsAltTicks(TOOLS_ALT_TICK_SLIDE * h), turnAbout(-a)),
      },
      pencil: {
        d: mapPath(
          pencilEnds(([p, q]) => [rel(p), rel(q)]),
          turnAbout(a)
        ),
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(ToolsAlt32),
});

// ── Meters ───────────────────────────────────────────────────────────────────

/**
 * A dial's scale: an arc band (radii ri–ro) from the left (180°) round to the
 * right (360°), with a gap 3px either side of the needle at `needle`°, cut
 * parallel to it (as Carbon cuts it). The gap moves with the needle.
 */
function scale(c: Pt, ri: number, ro: number, needle: number): string {
  const cut = (r: number, side: 1 | -1) =>
    needle + (side * (Math.asin(3 / r) * 180)) / Math.PI;
  const piece = (a0: [number, number], a1: [number, number]) => {
    // a0/a1: [outer angle, inner angle] at each end; clockwise from a0 to a1.
    if (a1[0] <= a0[0] || a1[1] <= a0[1]) {
      return '';
    }
    const large = (a: number, b: number) => (b - a > 180 ? 1 : 0);
    return (
      `M${P(polar(c, ro, a0[0]))}A${ro} ${ro} 0 ${large(a0[0], a1[0])} 1 ${P(polar(c, ro, a1[0]))}` +
      `L${P(polar(c, ri, a1[1]))}A${ri} ${ri} 0 ${large(a0[1], a1[1])} 0 ${P(polar(c, ri, a0[1]))}Z`
    );
  };
  return (
    piece([180, 180], [cut(ro, -1), cut(ri, -1)]) +
    piece([cut(ro, 1), cut(ri, 1)], [360, 360])
  );
}
/** A 2px needle from the hub (radius r0) out to r1 at `deg`°. */
const needle = (c: Pt, r0: number, r1: number, deg: number) =>
  `M${P(polar(c, r0, deg))}L${P(polar(c, r1, deg))}`;

// Meter: the needle sweeps 45° clockwise about the hub until it points
// right, and the scale's gap follows it (taking the scale's last segment
// with it).
export const MeterSpec = /* @__PURE__ */ hoverIcon('Meter', {
  geo: ({ h }) => {
    const a = 315 + 45 * h; // up and to the right → pointing right; measured round from the left (180°)
    return {
      ring: { d: ringPath([16, 16], 13, 2) },
      scale: { d: scale([16, 16], 8, 10, a) },
      hub: { d: ringPath([16, 16], 2, 2) },
      needle: { d: needle([16, 16], 2.5, 9.485, a), ...LINE },
    };
  },
  static: /* @__PURE__ */ carbonArt(Meter32),
});
// Meter alt: the same, on the wider dial.
export const MeterAltSpec = /* @__PURE__ */ hoverIcon('MeterAlt', {
  geo: ({ h }) => {
    const a = 315 + 45 * h; // up and to the right → pointing right; measured round from the left (180°)
    return {
      scale: { d: scale([16, 20], 12, 14, a) },
      hub: { d: ringPath([16, 20], 3, 2) },
      needle: { d: needle([16, 20], 3.5, 15.97, a), ...LINE },
    };
  },
  static: /* @__PURE__ */ carbonArt(MeterAlt32),
});

// ── Radar ────────────────────────────────────────────────────────────────────

// Radar: the sweep line turns 45° clockwise until it points right, and the
// rings grow 1px in radius. The rings' leading end stays with the line (so
// they never cross it) while the wedge's trailing edge follows 30ms behind,
// widening the wedge briefly. The hover runs linear; each part applies the
// entrance ease to its own 160ms slice.
function ringArc(c: Pt, r: number, from: number, to: number): string {
  const [ro, ri] = [r + 1, r - 1];
  const large = to - from > 180 ? 1 : 0;
  return `M${P(polar(c, ro, from))}A${ro} ${ro} 0 ${large} 1 ${P(polar(c, ro, to))}L${P(polar(c, ri, to))}A${ri} ${ri} 0 ${large} 0 ${P(polar(c, ri, from))}Z`;
}
// (Not a stagger of parts, so it stays: the lag is the wedge's own width, one shape's two edges.)
const radarTiming = /* @__PURE__ */ stagger(2); // the wedge's trailing edge lags 30ms
export const RadarSpec = /* @__PURE__ */ hoverIcon('Radar', {
  hover: radarTiming.hover,
  geo: ({ h }) => {
    const [lead, lag] = [radarTiming.at(h, 0), radarTiming.at(h, 1)];
    const a = -45 + 45 * lead; // the line (and the rings' leading end)
    const w = -45 + 45 * lag; // the wedge's trailing edge, 45° behind
    const c: Pt = [16, 16];
    return {
      rings: {
        d: ringArc(c, 7 + lead, a, w + 315) + ringArc(c, 13 + lead, a, w + 315),
      },
      // Round at the centre (a 1px disc), square at the tip.
      line: { d: `M${P(c)}L${P(polar(c, 18.8, a))}`, ...LINE },
      hub: { d: `M15 16A1 1 0 0 0 17 16A1 1 0 0 0 15 16Z` },
    };
  },
  static: /* @__PURE__ */ carbonArt(Radar32),
});

// ── Ruler ────────────────────────────────────────────────────────────────────

// Ruler: the ruler grows 2px wider (1px at each end) and its ticks slide
// 4px along it, a new tick sliding in from the left edge as they go. A tick
// is cut to the ruler's inside, so the new one appears from under the wall.
export const RulerSpec = /* @__PURE__ */ hoverIcon('Ruler', {
  geo: ({ h }) => {
    const [inL, inR] = [4 - h, 28 + h];
    const tick = (x: number) => {
      const [a, b] = [Math.max(x, inL), Math.min(x + 2, inR)];
      return b > a ? rectPath(a, 11, b, 16) : '';
    };
    return {
      body: {
        d:
          roundedRectPath(2 - h, 10, 30 + h, 22, 1) +
          rectPath(inL, 12, inR, 20),
        ...EVENODD,
      },
      ticks: { d: [1, 8, 15, 22].map((x) => tick(x + 4 * h)).join('') },
    };
  },
  static: /* @__PURE__ */ carbonArt(Ruler32),
});

// ── Scales ───────────────────────────────────────────────────────────────────

// Scales: the beam tips 15° about its pivot (right side down); each pan
// stays level and hangs from its end of the beam.
const PAN_LEFT =
  'M7 7A1 1 0 0 0 6.1055 7.5527L2.1055 15.5527A1 1 0 0 0 2 16A5 5 0 0 0 12 16A1 1 0 0 0 11.8945 15.5527L8.6182 9H9V7Z' +
  'M7,19a2.9958,2.9958,0,0,1-2.8152-2h5.63A2.9956,2.9956,0,0,1,7,19ZM9.3821,15H4.6179L7,10.2363Z';
const PAN_RIGHT =
  'M25 7A1 1 0 0 1 25.8945 7.5527L29.8945 15.5527A1 1 0 0 1 30 16A5 5 0 0 1 20 16A1 1 0 0 1 20.1055 15.5527L23.3818 9H23V7Z' +
  'M25,19a2.9958,2.9958,0,0,0,2.8152-2h-5.63A2.9956,2.9956,0,0,0,25,19ZM22.6179,15h4.7642L25,10.2363Z';
export const ScalesSpec = /* @__PURE__ */ hoverIcon('Scales', {
  geo: ({ h }) => {
    const deg = 15 * h;
    const pivot: Pt = [16, 8];
    const end = (x: number): Pt =>
      polar(pivot, Math.abs(x - 16), x < 16 ? 180 + deg : deg);
    const [l, r] = [end(7), end(25)];
    const turn = `rotate(${f(deg)} 16 8)`;
    return {
      stand: {
        d:
          rectPath(6, 28, 26, 30) +
          rectPath(15, 10, 17, 28) +
          rectPath(15, 2, 17, 6),
      },
      pivot: { d: ringPath(pivot, 2, 2) },
      beam: {
        d: rectPath(7, 7, 14, 9) + rectPath(18, 7, 25, 9),
        transform: turn,
      },
      left: {
        d: PAN_LEFT,
        ...EVENODD,
        transform: `translate(${f(l[0] - 7)} ${f(l[1] - 8)})`,
      },
      right: {
        d: PAN_RIGHT,
        ...EVENODD,
        transform: `translate(${f(r[0] - 25)} ${f(r[1] - 8)})`,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Scales32),
});

// ── Stamp ────────────────────────────────────────────────────────────────────

// Stamp: the handle and base press 4px down together, until the base hides
// the rubber beneath it. The rubber is cut off at the base's bottom edge as
// it comes down, so it disappears under the base.
const STAMP_HANDLE =
  'M20 18.5V14.8982a7.4938,7.4938,0,0,1,1.1587-3.8542,5.9751,5.9751,0,0,0-1.3735-7.7006,5.9968,5.9968,0,0,0-9.6829,3.54,5.91,5.91,0,0,0,.7478,4.175A7.2573,7.2573,0,0,1,12,14.7942V18.5Z' +
  'M12.07,7.244a3.9994,3.9994,0,1,1,7.3728,2.7731A9.76,9.76,0,0,0,18.0664,14H13.94a9.5433,9.5433,0,0,0-1.376-3.9736A3.9366,3.9366,0,0,1,12.07,7.244Z' +
  'M18,16v2.5H14V16Z';
const STAMP_BASE =
  /* @__PURE__ */ roundedRectPath(4, 18, 28, 26) +
  /* @__PURE__ */ rectPath(6, 20, 26, 24);
/** The rubber (6–26 wide, down to y 30, bottom corners r2) from `top` down. */
function rubber(top: number): string {
  if (top >= 30) {
    return '';
  }
  const r = Math.min(2, 30 - top);
  const outer = `M6 ${f(top)}H26V${f(30 - r)}A${f(r)} ${f(r)} 0 0 1 ${f(26 - r)} 30H${f(6 + r)}A${f(r)} ${f(r)} 0 0 1 6 ${f(30 - r)}Z`;
  return outer + (top < 28 ? rectPath(8, top, 24, 28) : '');
}
export const StampSpec = /* @__PURE__ */ hoverIcon('Stamp', {
  geo: ({ h }) => {
    const y = 4 * h;
    return {
      handle: {
        d: STAMP_HANDLE,
        ...EVENODD,
        transform: `translate(0 ${f(y)})`,
      },
      base: { d: STAMP_BASE, ...EVENODD, transform: `translate(0 ${f(y)})` },
      rubber: { d: rubber(25.5 + y), ...EVENODD },
    };
  },
  static: /* @__PURE__ */ carbonArt(Stamp32),
});

// ── Tool box ─────────────────────────────────────────────────────────────────

// Tool box: the lid lifts 5px off the case, its handle receding 2px into
// it. Lid and case each keep a full 2px wall where they meet, and the
// case's sides stretch up to hold the lid.
const TB_LID =
  'M2 17V12A3 3 0 0 1 5 9H27A3 3 0 0 1 30 12V17ZM4 15V12A1 1 0 0 1 5 11H27A1 1 0 0 1 28 12V15Z';
const TB_BODY =
  'M2 15V26A2 2 0 0 0 4 28H28A2 2 0 0 0 30 26V15ZM28 26H4V17h8v5h8V17h8ZM14 17h4v3H14Z';
/** The handle, its legs ending at y `leg` (trimmed so they never poke into the lid's inside). */
const tbHandle = (leg: number) =>
  `M24 ${f(leg)}V6a2,2,0,0,0-2-2H10A2,2,0,0,0,8,6V${f(leg)}H10V6H22V${f(leg)}Z`;
export const ToolBoxSpec = /* @__PURE__ */ hoverIcon('ToolBox', {
  geo: ({ h }) => {
    const up = -5 * h;
    return {
      body: { d: TB_BODY, ...EVENODD },
      // The case's sides, stretching from its rim up to the lifted lid.
      sides: { d: rectPath(2, 15, 4, 17 + up) + rectPath(28, 15, 30, 17 + up) },
      lid: { d: TB_LID, ...EVENODD, transform: `translate(0 ${f(up)})` },
      handle: {
        d: tbHandle(Math.min(9.5, 11 - 3 * h)),
        transform: `translate(0 ${f(up + 2 * h)})`,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(ToolBox32),
});
