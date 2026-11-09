/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Tag32 from '@carbon/icons/es/tag/32.js';
import TagEdit32 from '@carbon/icons/es/tag--edit/32.js';
import TagExport32 from '@carbon/icons/es/tag--export/32.js';
import TagImport32 from '@carbon/icons/es/tag--import/32.js';
import TagGroup32 from '@carbon/icons/es/tag--group/32.js';
import { hoverIcon, carbonArt, withStatic } from '../../engine';
import { mapSegs, type HalfPlane, type Seg } from '../../cut';
import { ringPath, type Pt } from '../../geometry';
import { cutAway, filletSegs } from '../../off';
import { EVENODD, f } from '../../paint';

/**
 * The Tag family on the frame engine: Tag, Tag edit, Tag export, Tag
 * import, Tag group. Every tag is its 2px centreline (Carbon rounds the
 * outer corners and keeps the inner ones sharp). Where Carbon cuts a tag
 * for a pencil or an arrow, the cut is geometry landing flush on the cut
 * lines, not a mask, and it moves with the part it makes room for.
 *
 * Hover (160ms entrance ease):
 *  - Tag: the tag turns 10° clockwise about its hole.
 *  - Tag edit: the tag turns 10°; the pencil drops 3px and
 *    the cut beside it follows.
 *  - Tag export / import: the tag turns 10°; the arrow reaches 2px further
 *    out (export) or in (import), its tail anchored, and the cut beside it
 *    follows so the gap holds. (2px is the set-wide reach for an arrow on
 *    a glyph.)
 *  - Tag group: the front tag turns 15° about its dot and
 *    the back tag slides 2px right, staying cut 2px clear of the front one.
 * Rest matches Carbon.
 */

type HP = HalfPlane;
/** n·p ≥ c for a unit normal along (nx, ny), with c given in raw (unnormalised) units. */
const hp = (nx: number, ny: number, c: number): HP => {
  const l = Math.hypot(nx, ny);
  return { n: [nx / l, ny / l], c: c / l };
};
const polyD = (pts: readonly Pt[]) =>
  `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z`;

/** A convex polygon (clockwise on screen) grown by d, miter corners. */
function grow(pts: readonly Pt[], d: number): Pt[] {
  const n = pts.length;
  const off = (i: number) => {
    const [a, b] = [pts[i], pts[(i + 1) % n]];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    // Clockwise on screen: the outward normal is the edge turned anticlockwise.
    const nn: Pt = [(b[1] - a[1]) / l, -(b[0] - a[0]) / l];
    return {
      a: [a[0] + nn[0] * d, a[1] + nn[1] * d] as Pt,
      u: [(b[0] - a[0]) / l, (b[1] - a[1]) / l] as Pt,
    };
  };
  return pts.map((_, i) => {
    const [e0, e1] = [off((i + n - 1) % n), off(i)];
    // Intersect edge e0's line with edge e1's line.
    const den = e0.u[0] * e1.u[1] - e0.u[1] * e1.u[0];
    const t =
      ((e1.a[0] - e0.a[0]) * e1.u[1] - (e1.a[1] - e0.a[1]) * e1.u[0]) / den;
    return [e0.a[0] + e0.u[0] * t, e0.a[1] + e0.u[1] * t] as Pt;
  });
}
/** The inside of a convex polygon (clockwise on screen) as half-planes. */
const insideOf = (pts: readonly Pt[]): HP[] =>
  pts.map((a, i) => {
    const b = pts[(i + 1) % pts.length];
    return hp(
      -(b[1] - a[1]),
      b[0] - a[0],
      -(b[1] - a[1]) * a[0] + (b[0] - a[0]) * a[1]
    );
  });
const turn = (segs: Seg[], deg: number, pivot: Pt) =>
  mapSegs([segs], { s: 1, origin: pivot, deg, pivot, tx: 0, ty: 0 })[0];
const cutD = (o: { fill: string; rings: string }) => ({
  body: { d: o.fill },
  ring: { d: o.rings, ...EVENODD },
});

// Tag, Tag edit, Tag export, Tag import: the tag's inside edge (Carbon's
// inner pentagon), its centreline 1px outside it, every corner filleted r1
// (Carbon's outer r2 about the inner corner).
const TAG_INNER: Pt[] = [
  [4, 4],
  [13.9416, 4],
  [28, 18.0579],
  [18.0578, 28],
  [4, 13.9414],
];
const TAG = /* @__PURE__ */ filletSegs(
  /* @__PURE__ */ grow(TAG_INNER, 1),
  1,
  true
);
const HOLE: Pt = [10, 10];
const hole = { hole: { d: /* @__PURE__ */ ringPath(HOLE, 3, 2) } };

export const TagSpec = /* @__PURE__ */ hoverIcon('Tag', {
  geo: ({ h }) => ({ ...hole, ...cutD(cutAway(turn(TAG, 10 * h, HOLE), [])) }),
  static: /* @__PURE__ */ carbonArt(Tag32),
});

// Tag edit: Carbon's cut either side of the pencil runs across the tag's top
// right edge at x + y = 26.755 and 41.241; the pencil and the cut drop 3px.
const PENCIL =
  'M29.707,7.293l-3-3a.9994.9994,0,0,0-1.414,0L16,13.5859V18h4.4141L29.707,8.707A.9994.9994,0,0,0,29.707,7.293ZM19.5859,16H18V14.4141l5-5L24.5859,11ZM26,9.5859,24.4141,8,26,6.4141,27.5859,8Z';
export const TagEditSpec = /* @__PURE__ */ hoverIcon('TagEdit', {
  geo: ({ h }) => {
    const dy = 3 * h;
    const slot = [
      hp(1, 1, 26.755 + dy),
      hp(-1, -1, -(41.2413 + dy)),
      hp(1, -1, -3.9 - dy),
      hp(-1, 1, -(24.7 - dy)),
    ];
    return {
      ...hole,
      ...cutD(cutAway(turn(TAG, 10 * h, HOLE), [slot])),
      pencil: { d: PENCIL, transform: `translate(0 ${f(dy)})` },
    };
  },
  static: /* @__PURE__ */ carbonArt(TagEdit32),
});

// Tag export / import: Carbon cuts the tag's right end off along two lines
// square to its edges, meeting left of the arrow; the cut moves with the arrow.
// Each arrow in Carbon's point order, and which of its points form the head
// (the tail's two points stay put, so the shaft lengthens).
const EXPORT_ARROW: Pt[] = [
  [31, 18],
  [25, 12],
  [23.586, 13.414],
  [27.172, 17],
  [17, 17],
  [17, 19],
  [27.172, 19],
  [23.586, 22.586],
  [25, 24],
];
const IMPORT_ARROW: Pt[] = [
  [16, 18],
  [22, 12],
  [23.414, 13.414],
  [19.828, 17],
  [30, 17],
  [30, 19],
  [19.828, 19],
  [23.414, 22.586],
  [22, 24],
];
function tagArrow(
  name: string,
  arrow: Pt[],
  dir: 1 | -1,
  cut: [number, number]
) {
  const tail = arrow[4][0];
  return hoverIcon(name, {
    geo: ({ h }) => {
      const dx = 2 * h * dir;
      const end = [hp(1, 1, cut[0] + dx), hp(1, -1, cut[1] + dx)];
      const pts = arrow.map(([x, y]) => [x === tail ? x : x + dx, y] as Pt);
      return {
        ...hole,
        ...cutD(cutAway(turn(TAG, 10 * h, HOLE), [end])),
        arrow: { d: polyD(pts) },
      };
    },
  });
}
export const TagExportSpec = /* @__PURE__ */ withStatic(
  tagArrow('TagExport', EXPORT_ARROW, 1, [31.9417, -3.9407]),
  /* @__PURE__ */ carbonArt(TagExport32)
);
export const TagImportSpec = /* @__PURE__ */ withStatic(
  tagArrow('TagImport', IMPORT_ARROW, -1, [29.9417, -5.9414]),
  /* @__PURE__ */ carbonArt(TagImport32)
);

// Tag group: the front tag (with the dot) and the back tag, which is the
// same tag 2px right and 6px up. The front tag's bottom and right tips are
// sharp on its centreline (Carbon's outer r1), its other corners r1.
const FRONT_INNER: Pt[] = [
  [6, 10],
  [13.59, 10],
  [23.59, 20],
  [16, 27.59],
  [6, 17.59],
];
const FRONT_LINE = /* @__PURE__ */ grow(FRONT_INNER, 1);
const FRONT_R = [1, 1, 0, 0, 1];
const DOT: Pt = [10, 14];
const dotD = `M${DOT[0] - 2} ${DOT[1]}A2 2 0 1 1 ${DOT[0] + 2} ${DOT[1]}A2 2 0 1 1 ${DOT[0] - 2} ${DOT[1]}Z`;
export const TagGroupSpec = /* @__PURE__ */ hoverIcon('TagGroup', {
  geo: ({ h }) => {
    const deg = 15 * h;
    const front = turn(filletSegs(FRONT_LINE, FRONT_R, true), deg, DOT);
    const back = filletSegs(
      FRONT_LINE.map(([x, y]) => [x + 2 + 2 * h, y - 6] as Pt),
      FRONT_R,
      true
    );
    // The back tag stops 2px clear of the front tag's outside edge.
    const shadow = grow(FRONT_LINE, 3).map(([x, y]) => {
      const [c, s] = [
        Math.cos((deg * Math.PI) / 180),
        Math.sin((deg * Math.PI) / 180),
      ];
      return [
        DOT[0] + (x - DOT[0]) * c - (y - DOT[1]) * s,
        DOT[1] + (x - DOT[0]) * s + (y - DOT[1]) * c,
      ] as Pt;
    });
    const b = cutAway(back, [insideOf(shadow)], -1);
    const fr = cutAway(front, [], -1);
    return {
      dot: { d: dotD },
      front: { d: fr.fill },
      frontRing: { d: fr.rings, ...EVENODD },
      back: { d: b.fill },
    };
  },
  static: /* @__PURE__ */ carbonArt(TagGroup32),
});
