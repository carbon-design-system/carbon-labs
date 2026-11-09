/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import DocumentSecurity32 from '@carbon/icons/es/document--security/32.js';
import GatewaySecurity32 from '@carbon/icons/es/gateway--security/32.js';
import {
  makeStatusMarkIcon,
  type MarkType,
  type StatusMarkSpec,
} from '../../utils/statusMark';
import { mapPath, pathPoints, type Pt } from '../../geometry';
import { f } from '../../paint';
import { carbonArt, withStatic } from '../../engine';
import { SHIELD_GROW } from '../assorted/objectsA';
import {
  arcPts,
  documentFoldAt,
  weightArc,
  weightGrow,
  type Centreline,
} from './bases';

/**
 * The security badges: Carbon's `<base>--security` icons whose shield is a
 * badge (document, gateway), on the status-mark system
 * (utils/statusMark.ts).
 *
 * One security motion, Security's own: the shield grows 24/22 about its
 * centre at constant weight (its 2px walls held, its sides and its curves
 * moving out together, its rounded corners keeping their radius). The base
 * plays its own hover where it has one, else holds; its open ends draw back
 * to keep their resting space to the shield.
 *
 *  - Document security: the page folds its corner 2px (the documents'
 *    hover, the page holding). The fold leaves 1px of right wall above the
 *    shield, too little to draw back, so the shield's top holds and it grows
 *    down and out (it moves 0.45px down); the floor's end draws left.
 *  - Gateway security: the gateway's diamond
 *    grows with the shield, 24/22 about their shared centre (16, 16) at
 *    constant weight, so the 2.1px between them grows too. Its legs and
 *    nodes hold: each leg's inner end rides out with the diamond's edge,
 *    along the leg's own line (the leg 0.93px shorter), so none detaches.
 *
 * Group security isn't built: there the shield is the container (the group
 * stands inside it, the shield cut round the person in front), not a badge.
 */

/** Where a shield sits: Carbon's small shield (document--security's, x 18–28, y 18–30), moved by `at`. */
export interface ShieldPlace {
  at: Pt;
  /** The centre it grows about, before `at` (default its own: (23, 23.95)). */
  c?: Pt;
  /** How far it moves at full hover, where the base needs the room. */
  drift?: Pt;
}

// Carbon's small shield (document--security): 2px walls about a centreline from its top corners (19, 19) and
// (27, 19) down its sides to y 24.4678, round arcs of radius 4.017 (outer 5.0216, inner 3.012) and straight
// in to its point (23, 28.893) (outer 30, inner 27.786).
const SHIELD_D =
  'M23 30L20.8613 28.9873A5.0216 5.0216 0 0 1 18 24.4678V18H28V24.4678A5.0216 5.0216 0 0 1 25.1387 28.9878Z' +
  'M20 20V24.4678A3.012 3.012 0 0 0 21.7168 27.1787L23 27.7861L24.2832 27.1787A3.012 3.012 0 0 0 26 24.4678V20Z';
const RHO = 4.017;
const Y0 = 24.4678;
const TIP: Pt = [23, 28.893];
const SHIELD_CL: Centreline = {
  lines: [
    [
      [19, Y0],
      [19, 19],
      [27, 19],
      [27, Y0],
    ],
    [.../* @__PURE__ */ arcPts([23.02, Y0], RHO, Math.PI, 2.016), TIP],
    [.../* @__PURE__ */ arcPts([22.98, Y0], RHO, 0, Math.PI - 2.016), TIP],
  ],
  corners: [[19, 19], [27, 19], TIP],
  snap: 1.6,
};
/** The shield's centre (its centreline's bounds'): it grows about it. */
const SHIELD_C: Pt = [23, (19 + TIP[1]) / 2];
/** How far its top rises at full hover: the drift that holds the top. */
export const SHIELD_TOP = (SHIELD_GROW - 1) * (SHIELD_C[1] - 19);

const shieldAt = (p: ShieldPlace, h: number) => {
  const s = 1 + (SHIELD_GROW - 1) * h;
  const grow = weightGrow(SHIELD_CL, p.c ?? SHIELD_C, s);
  const [dx, dy] = [
    p.at[0] + (p.drift?.[0] ?? 0) * h,
    p.at[1] + (p.drift?.[1] ?? 0) * h,
  ];
  const arc = weightArc(RHO, s);
  const d = mapPath(SHIELD_D, (q) => {
    const [x, y] = grow(q);
    return [x + dx, y + dy];
  }).replace(
    /A([\d.]+) ([\d.]+)/g,
    (_, rx, ry) => `A${f(arc(+rx))} ${f(arc(+ry))}`
  );
  return d;
};

/** The security mark: Carbon's shield, growing 24/22 about its centre at constant weight (Security's hover). */
export const SHIELD: MarkType<ShieldPlace> = {
  d: (p, h) => shieldAt(p, h),
  // Its outside: the outer outline, sampled (it is convex).
  ink: (p, h) => [pathPoints(shieldAt(p, h), 0.25)],
};

type Spec = StatusMarkSpec<ShieldPlace>;
const UP: Pt = [0, -1];
const LEFT: Pt = [-1, 0];

export const DOCUMENT_SECURITY: Spec = {
  base: {
    d:
      'M16 28H6V4H14V10A2.0058 2.0058 0 0 0 16 12H22V15H24V10A0.9092 0.9092 0 0 0 23.7 9.3L16.7 2.3A0.9087 0.9087 0 0 0 16 2H6A2.0058 2.0058 0 0 0 4 4V28A2.0058 2.0058 0 0 0 6 30H16Z' +
      'M16 4.4L21.6 10H16Z',
    ends: [
      {
        at: [
          [22, 15],
          [24, 15],
        ],
        back: UP,
      },
      {
        at: [
          [16, 28],
          [16, 30],
        ],
        back: LEFT,
      },
    ],
    // The documents' hover: the corner folds 2px, the page holding (this page sits 2px left of Document's).
    calm: documentFoldAt(-2),
  },
  baseMotion: 'calm',
  mark: SHIELD,
  // The fold leaves the right wall 1px above the shield: its top holds.
  place: { at: [0, 0], drift: [0, SHIELD_TOP] },
};
export const DocumentSecuritySpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('DocumentSecurity', DOCUMENT_SECURITY),
  /* @__PURE__ */ carbonArt(DocumentSecurity32)
);

// The gateway's diamond: 2px walls about a centreline square turned 45° (corners (16, 1.586), (30.414, 16), …;
// its inside corners (16, 3), … are sharp, its outside ones rounded), with a leg and a node off each edge.
const DIAMOND: Pt[] = [
  [16, 1.586],
  [30.414, 16],
  [16, 30.414],
  [1.586, 16],
];
const DIAMOND_CL: Centreline = {
  lines: [[...DIAMOND, DIAMOND[0]]],
  corners: DIAMOND,
  snap: 1.6,
};
/** The diamond's centreline edges' distance from its centre (14.414/√2): each edge moves (s − 1) of it out. */
const APOTHEM = 14.414 * Math.SQRT1_2;
/**
 * Security's growth on the gateway: the diamond 24/22 about its centre at
 * constant weight (its corners, inside and out, move with their corner).
 * The legs and nodes hold, but for each leg's inner end, on the diamond's
 * outside edge: it moves out with that edge, straight out along the edge's
 * normal (the leg's own line), so the leg stays straight and attached.
 */
function gatewayCalm(q: Pt, h: number): Pt {
  const s = 1 + (SHIELD_GROW - 1) * h;
  for (const v of DIAMOND) {
    if (Math.hypot(q[0] - v[0], q[1] - v[1]) < DIAMOND_CL.snap) {
      return weightGrow(DIAMOND_CL, [16, 16], s)(q);
    }
  }
  // Which side of the centre, and how far out across its edge (|dx| + |dy| = 14.414 on the centreline).
  const [dx, dy] = [q[0] - 16, q[1] - 16];
  const across = (Math.abs(dx) + Math.abs(dy)) * Math.SQRT1_2 - APOTHEM;
  if (Math.abs(across) > 1.2) {
    return q;
  } // a node or a leg's outer end: holds
  const n: Pt = [Math.sign(dx) * Math.SQRT1_2, Math.sign(dy) * Math.SQRT1_2];
  const d = (s - 1) * APOTHEM;
  return [q[0] + n[0] * d, q[1] + n[1] * d];
}
export const GATEWAY_SECURITY: Spec = {
  base: {
    d:
      'M30.4141 17.4141A1.9995 1.9995 0 0 0 30.4141 14.5859L24.6272 8.7993L27.5278 5.9365A2.0018 2.0018 0 1 0 26.0862 4.5493L23.2129 7.3848L17.4141 1.5859A1.9995 1.9995 0 0 0 14.5859 1.5859L8.7993 7.3726L5.9368 4.4717A2.002 2.002 0 1 0 4.55 5.9136L7.385 8.7871L1.5859 14.5859A1.9995 1.9995 0 0 0 1.5859 17.4141L7.3848 23.2129L4.55 26.0864A1.9977 1.9977 0 1 0 5.937 27.5283L8.7995 24.6274L14.5861 30.4141A1.9995 1.9995 0 0 0 17.4143 30.4141L23.2131 24.6152L26.0864 27.4507A1.998 1.998 0 1 0 27.528 26.0635L24.6274 23.2007Z' +
      'M16 29L3 16L16 3L29 16Z',
    calm: gatewayCalm,
  },
  baseMotion: 'calm',
  mark: SHIELD,
  // The shield grows about the gateway's centre (16, 16), with the diamond.
  place: { at: [-7, -7], c: [23, 23] },
};
export const GatewaySecuritySpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('GatewaySecurity', GATEWAY_SECURITY),
  /* @__PURE__ */ carbonArt(GatewaySecurity32)
);
