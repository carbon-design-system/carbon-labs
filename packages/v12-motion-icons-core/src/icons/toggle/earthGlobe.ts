/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The turning globe behind Earth (stateFillToggles.ts, "Earth's hover and action"), drawn from a world map
 * (Earth-globe-full_mo_02.svg), its corners rounded as appropriate, with spherical distortion round the globe.
 *
 * The map is flat, as drawn: x along the longitude, y along the latitude (equirectangular), in map px (the source's
 * units ÷ 10). It wraps round the sphere (r 14 about (16, 16), the rim's outer edge) at the globe's own scale: a map
 * px is 1/14 rad of longitude and of latitude, a px on the globe where the face is centred, so a turn is
 * 2π·14 ≈ 88 map px. The source spans 73 of them; the other 15 widen the Pacific, east of Australia and of Asia,
 * to about the width of its Indian Ocean (27 and 24 map px, against 25). Its equator is MAP_EQUATOR.
 *
 * The globe turns about an upright axis, as seen from the equator, so the strip the turn reads off it keeps rows:
 * every point is a longitude λ (from the view's centre at rest) and a row y = 16 − 14·sin(latitude), its row on
 * screen, which turning never changes. Turned by θ, a strip point is drawn at x = 16 + ρ·sin(λ + θ) (toDisc),
 * ρ = √(14² − (y − 16)²) the radius of its row: land narrows towards the limb and goes behind it, and towards the
 * poles the rows close up. The map's straight runs east–west stay straight rows on screen, whatever the turn.
 *
 * A face is where the map is centred at rest; another Earth view (earth--americas and the rest) is the same map at
 * another centre.
 */
import type { Pt } from '../../geometry';

/** The sphere: r 14 about (16, 16), the rim's outer edge, so the limb is under the rim. */
export const SPHERE = 14;
const C = 16;
const QUARTER = Math.PI / 2;

/** One turn of the map, in map px (a map px is 1/14 rad). */
export const MAP_TURN = 2 * Math.PI * SPHERE;
/**
 * The map's equator, in map px: his top coast (Eurasia's) is then 65°N, on row 3.3, so the north runs up under the
 * rim as the Arctic did; Europe and the Mediterranean sit well inside it, and the Cape and Cape Horn (59°S, 63°S) go
 * under it below. (It is also where his straight runs need the least nudging onto the pixel grid; see EARTH_MAP.)
 */
export const MAP_EQUATOR = 19.4;

/**
 * The map, in map px (the source SVG's units ÷ 10): each land shape a closed coast (the centreline of its 2px stroke).
 * A vertex [x, y] is a corner rounded to radius CORNER; [x, y, 0] stays sharp: where the source's lines join, and the square
 * corners of the Mediterranean and Iberia, which sit on the pixel grid. The source's 2px lines that run off a coast
 * (Labrador, Florida) and the one joining the Americas (the isthmus) are coast drawn out and back along themselves:
 * land 0 wide, its stroke a 2px line with square ends.
 *
 * Nudged onto the pixel grid (by at most 0.5 map px), so that at rest and at the hover's peak (and all through the
 * turn, since rows never change) the walls of its straight runs fall on whole pixels at 32px and 16px: east–west runs
 * on odd rows (Labrador to Hudson Bay, and Iberia, 9; the Mediterranean's north shore 7, its south shore 13; the
 * Caribbean coast and Australia's north 19), the Gulf of Mexico on row 14 (whole pixels at 32px; 16px would take 0.7);
 * north–south runs on odd columns at rest (South America's west coast 9, Florida 13, Africa's west coast 21; at the
 * hover's peak Florida is on 17).
 */
export const EARTH_MAP: readonly (readonly (readonly number[])[])[] = [
  // The Americas: North (from Florida's corner, north-east to Labrador and its spur, west across the Arctic, down the
  // Pacific coast to Mexico), the isthmus, South (down its Pacific coast to Cape Horn, up its Atlantic coast and west
  // along the Caribbean), back up the isthmus, east along the Gulf of Mexico to Florida and its spur.
  [
    [49.6732, 17.3931, 0],
    [52.3458, 12.0696, 0],
    [53.477, 9.8164, 0],
    [52.3458, 12.0696, 0],
    [48.2867, 12.0696],
    [45.2967, 5.78],
    [36.2167, 5.89],
    [33.2256, 10.4573],
    [36.2167, 18.3],
    [43.0633, 20.0856, 0],
    [44.8994, 22.4234, 0],
    [44.8994, 25.66],
    [47.9158, 28.7291],
    [46.8167, 34.7879],
    [49.1062, 34.7901],
    [52.2667, 25.05],
    [50.7667, 22.4234],
    [44.8994, 22.4234, 0],
    [43.0633, 20.0856, 0],
    [46.3567, 17.3931],
    [49.6732, 17.3931, 0],
    [49.6732, 20.1, 0],
  ],
  // Eurasia and Africa: from the Arctic's north-east corner, down Asia's Pacific coast, west along its south (south-east
  // Asia, India, Arabia), down Africa's east coast, round the Cape and up its west coast, east along the Mediterranean's
  // south shore, back west along its north shore (Italy, Iberia), up Europe's Atlantic coast and east along the Arctic.
  [
    [91.3539, 3.5223],
    [96.9664, 7.7],
    [94.6497, 12.7811],
    [91.2222, 14.71],
    [93.4389, 17.29],
    [92.1421, 19.01],
    [88.6897, 17.93],
    [86.6047, 14.71],
    [82.6438, 17.52],
    [80.5814, 22.7338],
    [77.2707, 17.1515],
    [73.6731, 16.4097],
    [72.4505, 18.7905],
    [73.3026, 24.0722],
    [70.3854, 27.0516],
    [69.3854, 33.9116],
    [63.3617, 33.9116],
    [61.8854, 25.2511],
    [57.8344, 23.2519],
    [57.8344, 18.0518],
    [61.385, 16.3766],
    [67.3854, 16.3766, 0],
    [67.3854, 9.6249, 0],
    [63.3852, 9.6249],
    [62.3852, 12.0696],
    [57.8344, 12.0696, 0],
    [57.8344, 3.5223, 0],
  ],
  // Australia.
  [
    [99.0294, 22.4234],
    [95.0664, 25.659],
    [95.9298, 29.064],
    [100.028, 27.9209],
    [102.9446, 29.9396],
    [104.1627, 29.9518],
    [105.853, 27.1184],
    [102.9466, 22.4234],
  ],
];

/** His mitred corners, rounded (the radius of the coast's centreline, map px): its stroke's outer edge rounds at 2. */
export const CORNER = 1;

/** Where the map is centred at rest: the map x at the view's centre. */
export interface GlobeFace {
  centre: number;
}

const rowRadius = (y: number) =>
  Math.sqrt(Math.max(0, SPHERE * SPHERE - (y - C) ** 2));

/** A strip point at longitude a from the view's centre → the disc: on past the limb, along its row, at 14px a radian. */
export function toDisc([a, y]: Pt): Pt {
  const r = rowRadius(y);
  return [
    C +
      (Math.abs(a) <= QUARTER
        ? r * Math.sin(a)
        : Math.sign(a) * (r + SPHERE * (Math.abs(a) - QUARTER))),
    y,
  ];
}

/** A closed polygon cut to lo ≤ x ≤ hi. */
export function cutX(pts: readonly Pt[], lo: number, hi: number): Pt[] {
  let out = [...pts];
  for (const [at, side] of [
    [lo, 1],
    [hi, -1],
  ] as const) {
    const was = out;
    out = [];
    was.forEach((q, k) => {
      const p = was[(k + was.length - 1) % was.length];
      const [qIn, pIn] = [(q[0] - at) * side >= 0, (p[0] - at) * side >= 0];
      if (qIn !== pIn) {
        out.push([at, p[1] + ((q[1] - p[1]) * (at - p[0])) / (q[0] - p[0])]);
      }
      if (qIn) {
        out.push(q);
      }
    });
  }
  return out;
}

/** A closed coast with its corners rounded, as arcs (a point every 15° at most). */
function rounded(shape: readonly (readonly number[])[]): Pt[] {
  const n = shape.length;
  return shape.flatMap(([x, y, round = CORNER], k): Pt[] => {
    if (!round) {
      return [[x, y]];
    }
    const [a, c] = [shape[(k + n - 1) % n], shape[(k + 1) % n]];
    const [la, lc] = [
      Math.hypot(a[0] - x, a[1] - y),
      Math.hypot(c[0] - x, c[1] - y),
    ];
    const u: Pt = [(a[0] - x) / la, (a[1] - y) / la];
    const v: Pt = [(c[0] - x) / lc, (c[1] - y) / lc];
    // The corner's angle, and how far back along each edge the arc starts (at most half the edge).
    const w = Math.acos(Math.max(-1, Math.min(1, u[0] * v[0] + u[1] * v[1])));
    const t = Math.min(round / Math.tan(w / 2), la / 2, lc / 2);
    const r = t * Math.tan(w / 2);
    const [p, q]: Pt[] = [
      [x + u[0] * t, y + u[1] * t],
      [x + v[0] * t, y + v[1] * t],
    ];
    // The arc's centre, along the bisector, and its sweep (the corner's turn).
    const bis = Math.hypot(u[0] + v[0], u[1] + v[1]);
    const o: Pt = [
      x + ((u[0] + v[0]) / bis) * (r / Math.sin(w / 2)),
      y + ((u[1] + v[1]) / bis) * (r / Math.sin(w / 2)),
    ];
    const [a0, a1] = [
      Math.atan2(p[1] - o[1], p[0] - o[0]),
      Math.atan2(q[1] - o[1], q[0] - o[0]),
    ];
    let sweep = a1 - a0;
    while (sweep > Math.PI) {
      sweep -= 2 * Math.PI;
    }
    while (sweep < -Math.PI) {
      sweep += 2 * Math.PI;
    }
    const m = Math.max(2, Math.ceil(Math.abs(sweep) / (Math.PI / 12)));
    return Array.from(
      { length: m + 1 },
      (_, j) =>
        [
          o[0] + r * Math.cos(a0 + (sweep * j) / m),
          o[1] + r * Math.sin(a0 + (sweep * j) / m),
        ] as Pt
    );
  });
}

/** A closed polygon with a point at least every `step` along its edges. */
function densify(pts: readonly Pt[], step: number): Pt[] {
  return pts.flatMap((a, k) => {
    const b = pts[(k + 1) % pts.length];
    const n = Math.max(
      1,
      Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step)
    );
    return Array.from(
      { length: n },
      (_, j) =>
        [a[0] + ((b[0] - a[0]) * j) / n, a[1] + ((b[1] - a[1]) * j) / n] as Pt
    );
  });
}

/** A map point → the strip of a face: [λ from its centre, row]. */
export const toStrip = ([x, y]: Pt, face: GlobeFace): Pt => [
  (x - face.centre) / SPHERE,
  C - SPHERE * Math.sin((MAP_EQUATOR - y) / SPHERE),
];

/** The map's coasts, rounded, with a point at least every 0.5 map px (so they curve as they turn). */
export const mapCoasts = (): Pt[][] =>
  EARTH_MAP.map((shape) => densify(rounded(shape), 0.5));

/** The strip map of a face: its coasts as closed lines in [λ, y]. */
export function globeStrip(face: GlobeFace): Pt[][] {
  return mapCoasts().map((q) => q.map((p) => toStrip(p, face)));
}
