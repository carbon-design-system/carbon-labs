/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Hand fixes for the status-capable icons (statusIcons.ts): where the
 * generic square cut leaves a part broken (a sliver, a fragment, a wall it
 * can't end square), the icon's placement adds a fix, applied to its shapes
 * before the cut while a mark shows (`k`: how far the cut is open).
 *
 * The fixes take a part away with the cut (it draws back along itself into
 * the cut as the cut opens, square at every frame), never move the base:
 * the base holds and the mark carries, as the add-family marks.
 */
import type { Pt } from '../geometry';
import {
  cutAway,
  wallEnd,
  type FixContext,
  type Mark,
  type Placement,
  type Region,
  type Shapes,
} from '../engine';
import { cloud, CLOUD_K } from './operations/cloudShape';

/**
 * A straight part's ink drawn back from its free end: the band `half` either
 * side of the axis from `end` (the free end's middle) towards `root`,
 * covering the first `k` of the way (plus 1 past the end). Square across
 * the part at every k.
 */
export function drawBack(
  end: Pt,
  root: Pt,
  half: number,
  k: number
): Region | null {
  if (k <= 1e-3) {
    return null;
  }
  const L = Math.hypot(root[0] - end[0], root[1] - end[1]);
  const [ux, uy] = [(root[0] - end[0]) / L, (root[1] - end[1]) / L];
  const [nx, ny] = [-uy * half, ux * half];
  const a: Pt = [end[0] - ux, end[1] - uy];
  const b: Pt = [
    end[0] + ux * L * Math.min(1, k),
    end[1] + uy * L * Math.min(1, k),
  ];
  return [
    [a[0] + nx, a[1] + ny],
    [b[0] + nx, b[1] + ny],
    [b[0] - nx, b[1] - ny],
    [a[0] - nx, a[1] - ny],
  ];
}

/**
 * How far a part that goes only with some marks has gone: 1 with one of
 * `marks` fully cut, 0 with another, eased between as one mark's zone
 * morphs into the next's, and scaled by the cut's opening.
 */
const gone = (c: FixContext, marks: readonly Mark[]) => {
  const on = (m: Mark) => (marks.includes(m) ? 1 : 0);
  return c.k * (on(c.from) + (on(c.mark) - on(c.from)) * c.km);
};
const ROUND: readonly Mark[] = ['error', 'pending'];

/**
 * A horizontal wall (from `from` to its right end `to`) ended square where
 * the zone first reaches it, with everything right of that end between `top`
 * and `bottom` (the wall's corner and the stub rising from it) going too.
 */
function rightOf(
  zone: Region,
  from: Pt,
  to: Pt,
  top: number,
  bottom: number
): Region | null {
  const band = wallEnd(zone, from, to, 1);
  if (!band) {
    return null;
  }
  const x = Math.min(...band.map((q) => q[0]));
  return [
    [x, top],
    [to[0] + 1, top],
    [to[0] + 1, bottom],
    [x, bottom],
  ];
}

/*
 * Arrow shafts the mark's zone grazes (Cloud upload, Document import): the
 * zone reaches the shaft, leaves it and, past the mark, reaches its tail end
 * again, so the generic cut couldn't end it square. The shaft ends square
 * once, at the first cross-section within the gap (wallEnd), and the rest
 * of it to its tail goes.
 *
 * The fixes read the hover `h` only for the frames where a status arrives
 * mid-hover (the base eases back to rest as the cut opens); with a status
 * showing the icon holds still.
 */

/** The shortest stub a square end may leave on a wall that branches off another: twice its 2px weight. Shorter, it reads as a notch, so it goes back to the wall it hangs on. */
export const MIN_STUB = 4;

/**
 * Shopping cart: the basket's bottom bar (y 16–18) hangs off the cart's
 * upright. A cut that reaches the bar a few units in from the upright (a
 * wide count inside does) leaves that much hanging: a notch. Shorter than
 * MIN_STUB, the stub goes back to the upright's inside edge (cut along that
 * edge, so the upright isn't touched).
 */
function shoppingCart(shapes: Shapes, c: FixContext): Shapes {
  // The upright's inside edge: (5, 2.8) to (8.82, 22), so x = 7.62 at y 16 and 8 at y 18.
  const edge = (y: number): Pt => [7.62 + ((y - 16) * 3.82) / 19.2, y];
  const band = wallEnd(c.zone, edge(17), [26, 17], 1);
  if (!band) {
    return shapes;
  }
  const x = Math.min(...band.map((q) => q[0]));
  if (x - edge(17)[0] >= MIN_STUB) {
    return shapes;
  }
  return cutAway(
    shapes,
    ['cart'],
    [[edge(15.5), [40, 15.5], [40, 18.05], edge(18.05)]]
  );
}

/*
 * Closing the gap: where a mark takes a glyph away
 * entirely, the base closes the opening the glyph passed through, as its
 * parent icon draws it: the cloud's base runs through (Carbon's cloud), the
 * page's wall runs down (Carbon's document--blank). The wall grows in from
 * both sides of the opening as the glyph draws back, at constant 2px with
 * square ends, and is then cut by the mark's 4px square rule as usual.
 */

/**
 * A document page (Document import's; Document export's is the same moved
 * dx) with its right wall's opening (y 14–26) closed `g` of the way: the
 * wall above runs down and the wall below runs up, meeting at y 20.
 */
function pageD(dx: number, g: number): string {
  const x = (v: number) => +(v + dx).toFixed(4);
  const fold = `M${x(16)},10V4.41L${x(21.59)},10Z`;
  if (g >= 1 - 1e-6) {
    // Closed: document--blank's outline and, wound against it, its inside.
    return (
      `M${x(24)},10a1,1,0,0,0-.29-.71l-7-7A1,1,0,0,0,${x(16)},2H${x(6)}A2,2,0,0,0,${x(4)},4V28a2,2,0,0,0,2,2H${x(22)}a2,2,0,0,0,2-2Z` +
      `M${x(22)},28H${x(6)}V4h8v6a2,2,0,0,0,2,2h6Z` +
      fold
    );
  }
  const [top, bottom] = [+(14 + 6 * g).toFixed(4), +(26 - 6 * g).toFixed(4)];
  return (
    `M${x(24)},${top}V10a1,1,0,0,0-.29-.71l-7-7A1,1,0,0,0,${x(16)},2H${x(6)}A2,2,0,0,0,${x(4)},4V28a2,2,0,0,0,2,2H${x(22)}a2,2,0,0,0,2-2V${bottom}H${x(22)}V28H${x(6)}V4h8v6a2,2,0,0,0,2,2h6V${top}Z` +
    fold
  );
}

/**
 * Document export: the arrow leaves through the mark's corner; every mark
 * would leave a loose piece of it, so it draws back into the cut from its
 * tip, and the page's wall closes behind it.
 */
function documentExport(shapes: Shapes, c: FixContext): Shapes {
  shapes = { ...shapes, page: { ...shapes.page, d: pageD(-2, c.k) } };
  return cutAway(
    shapes,
    ['arrow'],
    [drawBack([30 + 2 * c.h, 20], [13, 20], 5.6, c.k)]
  );
}

/**
 * Document import: the shaft (above). With the round marks (error,
 * pending) the cut takes the head's lower arm, leaving a lone stub, so the
 * arrow goes: it draws back from its head into the cut, and the page's
 * wall closes behind it. With success and warning the head stays whole on
 * a shortened shaft. The page's bottom corner and stub, and its right wall
 * above the opening, end square against the grown triangle.
 */
function documentImport(shapes: Shapes, c: FixContext): Shapes {
  const dx = -2 * c.h; // the head reaches 2px left on hover
  const g = gone(c, ROUND);
  shapes = cutAway(
    shapes,
    ['arrow'],
    [
      wallEnd(c.zone, [14.83 + dx, 20], [28, 20], 1),
      wallEnd(c.zone, [12.9 + dx, 20.5], [16.705 + dx, 24.295], 1),
      drawBack([10 + dx, 20], [29, 20], 5.6, g),
    ]
  );
  if (g > 1e-3) {
    return { ...shapes, page: { ...shapes.page, d: pageD(0, g) } };
  }
  return cutAway(
    shapes,
    ['page'],
    [
      rightOf(c.zone, [7, 29], [24, 29], 25.5, 30.6),
      wallEnd(c.zone, [23, 6], [23, 14], 1),
    ]
  );
}

/** The cloud's scale at hover h (Cloud upload grows, Cloud download shrinks: transfer.ts). */
const cloudAt = (h: number, up: boolean) => 1 + (up ? CLOUD_K : -CLOUD_K) * h;

/**
 * Cloud upload: the shaft (above). With the round marks the cut takes the
 * head's right arm, leaving a lone stub, so the arrow goes, drawing back
 * from its head into the cut, and the cloud's base closes behind it; with
 * success and warning the head stays.
 */
function cloudUpload(shapes: Shapes, c: FixContext): Shapes {
  const dy = -2 * c.h;
  const g = gone(c, ROUND);
  if (g > 1e-3) {
    shapes = {
      ...shapes,
      cloud: { ...shapes.cloud, d: cloud(cloudAt(c.h, true), g) },
    };
  }
  return cutAway(
    shapes,
    ['arrow'],
    [
      wallEnd(c.zone, [16, 16.83 + dy], [16, 29], 1),
      wallEnd(c.zone, [17.3, 15.7 + dy], [20.295, 18.705 + dy], 1),
      drawBack([16, 12 + dy], [16, 30], 5.6, g),
    ]
  );
}

/**
 * Cloud download: every mark takes its head and leaves a loose shaft and
 * stub, so the arrow goes, drawing back from its head (into the cut, the way
 * it points) to its tail as the cut opens, and the cloud's base closes
 * behind it.
 */
function cloudDownload(shapes: Shapes, c: FixContext): Shapes {
  const dy = 2 * c.h;
  shapes = {
    ...shapes,
    cloud: { ...shapes.cloud, d: cloud(cloudAt(c.h, false), c.k) },
  };
  return cutAway(
    shapes,
    ['arrow'],
    [drawBack([16, 31 + dy], [16, 13], 5.6, c.k)]
  );
}

/**
 * Renew: the lower arc's head sits in the mark's corner at rest (the cut
 * takes it); on hover the arcs turn 45° and the head would come back out
 * of the cut in pieces. With a mark the head stays gone: the bracket's
 * square (x, y 19–29 at rest) turns with the arc and is cut with it.
 */
function renew(shapes: Shapes, c: FixContext): Shapes {
  if (c.k <= 1e-3) {
    return shapes;
  }
  const a = (-45 * c.h * Math.PI) / 180;
  const turn = ([x, y]: Pt): Pt => [
    16 + (x - 16) * Math.cos(a) - (y - 16) * Math.sin(a),
    16 + (x - 16) * Math.sin(a) + (y - 16) * Math.cos(a),
  ];
  const box: Region = (
    [
      [19.2, 19.2],
      [29, 19.2],
      [29, 29],
      [19.2, 29],
    ] as Pt[]
  ).map(turn);
  return cutAway(shapes, ['b'], [box]);
}

/** A wedge about c from angle a0 sweeping `sweep` (≤ π, so it stays convex), out to radius R. */
function wedge(c: Pt, a0: number, sweep: number, R: number): Region | null {
  if (Math.abs(sweep) < 1e-3) {
    return null;
  }
  const n = Math.max(2, Math.ceil(Math.abs(sweep) / 0.2));
  return [
    c,
    ...Array.from(
      { length: n + 1 },
      (_, i) =>
        [
          c[0] + R * Math.cos(a0 + (sweep * i) / n),
          c[1] + R * Math.sin(a0 + (sweep * i) / n),
        ] as Pt
    ),
  ];
}

/**
 * Share: the lower node sits in the mark's corner and goes with the cut,
 * but a cut sweeping across a ring leaves crescents with hairline tips.
 * So the node unwinds instead: two wedges about its centre open from the
 * side the cut opens from round to the link, each ring end radial (square
 * to the wall) at every frame, ahead of the cut.
 */
function share(shapes: Shapes, c: FixContext): Shapes {
  const k = Math.min(1, c.k * 2.2);
  if (k <= 1e-3) {
    return shapes;
  }
  const centre: Pt = [23, 25];
  const a0 = Math.atan2(32 - 25, 32 - 23); // towards the corner the cut opens from
  return cutAway(
    shapes,
    ['bottom'],
    [wedge(centre, a0, Math.PI * k, 8), wedge(centre, a0, -Math.PI * k, 8)]
  );
}

/**
 * Send: the plane's tip sits at the edge of every mark's zone, and while
 * one mark's zone morphs into another's the tip came back out between them
 * for a frame. Both walls end square, each at the first cross-section the
 * zone reaches going out from its tail, and everything past that (the tip)
 * goes. The plane's hover moves it 2px right.
 */
function send(shapes: Shapes, c: FixContext): Shapes {
  const dx = 2 * c.h;
  return cutAway(
    shapes,
    ['plane'],
    [
      wallEnd(c.zone, [5 + dx, 5], [27 + dx, 16], 1),
      wallEnd(c.zone, [5 + dx, 27], [27 + dx, 16], 1),
    ]
  );
}

/**
 * Calendar: its binder rings stand up from the top bar into the pip's and
 * the count's corner; a growing round cut met them at a slant. Each ends
 * square going up from the bar, the rest of it to its top goes.
 */
function calendar(shapes: Shapes, c: FixContext): Shapes {
  const g = 2 * c.h; // the page grows 2px a side on hover; the rings move up with its top and step out 1px
  const ring = (x: number) => wallEnd(c.zone, [x, 8 - g], [x, 2 - g], 1);
  return cutAway(shapes, ['rings'], [ring(11 - c.h), ring(21 + c.h)]);
}

/**
 * Email, its pip top right: the pip's cut meets the
 * envelope's top-right corner first, where the top wall, the right wall and
 * the flap's arm all meet, and its opening edge cut that knot at a slant (a
 * wedge for a frame). The corner goes as one piece at the cut's first touch
 * (the walls then end square at its sides), and the flap's arm ends square
 * from its point.
 */
function email(shapes: Shapes, c: FixContext): Shapes {
  const g = 2 * c.h; // the envelope grows 2px a side on hover; its corner moves with it
  const [x1, y0] = [30 + g, 6 - g];
  const corner: Region = [
    [x1 - 2.05, y0 - 1],
    [x1 + 1, y0 - 1],
    [x1 + 1, y0 + 2.05],
    [x1 - 2.05, y0 + 2.05],
  ];
  const touches =
    c.zone.some(([x, y]) => x > x1 - 2 && y < y0 + 2) ||
    corner.some(([x, y]) => inside(c.zone, [x, y]));
  shapes = cutAway(
    shapes,
    ['flap'],
    [wallEnd(c.zone, [16, 16 - 4 * c.h], [29 + g, 7 - g], 1)]
  );
  return touches ? cutAway(shapes, ['envelope', 'flap'], [corner]) : shapes;
}
/** Is p inside the convex region z? */
function inside(z: Region, [x, y]: Pt): boolean {
  let sign = 0;
  for (let i = 0; i < z.length; i++) {
    const [a, b] = [z[i], z[(i + 1) % z.length]];
    const s = Math.sign(
      (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0])
    );
    if (s && sign && s !== sign) {
      return false;
    }
    if (s) {
      sign = s;
    }
  }
  return true;
}

/**
 * Activity: the pulse's tail and falling stroke run into the mark's corner.
 * The line ends square where the zone reaches it: the tail draws back from
 * its end to the first cross-section the zone reaches going right from the
 * stroke's foot; its last unit goes with the foot, which is then cut by one
 * band square to the falling stroke, up to the first cross-section the zone
 * reaches going down from the peak. Between marks the zone
 * can reach the whole tail in one frame, so the tail also draws back ahead
 * of it on the cut's own clock (the cut grows from nothing). Success's check
 * sits clear of the line, which holds. The peak rises 2px on hover
 * (data-a.ts).
 *
 * This shapes the cut at rest and between marks. Opening and closing, the
 * final cut shows through the engine's growing box (cutFrame), whose top
 * edge runs along the tail: it thins for a frame or two as the front
 * passes, as walls a side runs along do on every status icon.
 *
 * The placement keeps 3px round the mark, not 4 (as the filled disc:
 * Carbon's 2, plus 1). At 3 the round marks (error, pending) still graze
 * the rising stroke's right edge, under 0.25px²; at 4 they cut into it, and
 * between marks the pulse breaks in two.
 */
function activity(shapes: Shapes, c: FixContext): Shapes {
  const [foot, end, peak]: Pt[] = [
    [24.98, 16],
    [30, 16],
    [21, 4.08 - 2 * c.h],
  ];
  const mid = (r: Region) =>
    [(r[0][0] + r[3][0]) / 2, (r[0][1] + r[3][1]) / 2] as Pt;
  const fall = wallEnd(c.zone, peak, foot, 1);
  const tail = fall ? null : wallEnd(c.zone, foot, end, 1);
  // How far back the tail has drawn: to the zone's reach, or ahead of it on the cut's own clock (between marks the
  // zone can reach the tail's whole length in one frame).
  const reached = fall
    ? 1
    : tail
      ? (end[0] - mid(tail)[0]) / (end[0] - foot[0])
      : 0;
  const back = Math.min(
    1,
    Math.max(reached, 2.5 * gone(c, ['warning', 'error', 'pending']))
  );
  if (back <= 1e-3) {
    return shapes;
  }
  // The last unit of tail beside the foot would read as a step: it goes with the foot. Once the tail is gone the
  // foot is cut by one band square to the falling stroke, from where the zone reaches it (or the foot) to 2 past
  // the foot, so its round join goes too.
  if (back < 1 - 1 / (end[0] - foot[0])) {
    return cutAway(shapes, ['pulse'], [drawBack(end, foot, 1.05, back)]);
  }
  const rise = fall
    ? Math.hypot(mid(fall)[0] - foot[0], mid(fall)[1] - foot[1])
    : 0;
  const L = Math.hypot(peak[0] - foot[0], peak[1] - foot[1]);
  const [ux, uy] = [(peak[0] - foot[0]) / L, (peak[1] - foot[1]) / L]; // up the falling stroke
  const [nx, ny] = [-uy * 1.05, ux * 1.05];
  const [a0, a1]: Pt[] = [
    [foot[0] - 2 * ux, foot[1] - 2 * uy],
    [foot[0] + rise * ux, foot[1] + rise * uy],
  ];
  // The tail: everything right of the falling stroke's right edge (a cut along the tail would step into it).
  const edge = (y: number): Pt => [
    foot[0] + nx + ((y - foot[1] - ny) * ux) / uy,
    y,
  ];
  return cutAway(
    shapes,
    ['pulse'],
    [
      [edge(14.9), [end[0] + 1, 14.9], [end[0] + 1, 17.1], edge(17.1)],
      [
        [a0[0] + nx, a0[1] + ny],
        [a1[0] + nx, a1[1] + ny],
        [a1[0] - nx, a1[1] - ny],
        [a0[0] - nx, a0[1] - ny],
      ],
    ]
  );
}

/*
 * Each icon's hand fixes and placement flags, as its own export (not one
 * shared map): an icon module that imports one leaves the rest, and their
 * geometry, out of a bundle.
 */
/** Counts never inside: inside, one figure takes half the head (User 46% left, User avatar 52%), two take all of it. */
export const userPlacement: Partial<Placement> = { insideMax: '' };
export const userAvatarPlacement: Partial<Placement> = { insideMax: '' };
export const cloudUploadPlacement: Partial<Placement> = { fix: cloudUpload };
export const cloudDownloadPlacement: Partial<Placement> = {
  fix: cloudDownload,
};
export const documentImportPlacement: Partial<Placement> = {
  fix: documentImport,
};
export const documentExportPlacement: Partial<Placement> = {
  fix: documentExport,
};
export const renewPlacement: Partial<Placement> = { fix: renew };
export const sharePlacement: Partial<Placement> = { fix: share };
export const sendPlacement: Partial<Placement> = { fix: send };
export const activityPlacement: Partial<Placement> = { fix: activity, gap: 3 };
/**
 * Shopping cart: counts only overhang (no Inside: inside, even one
 * figure takes 70% of the basket), at the standard spot.
 */
export const shoppingCartPlacement: Partial<Placement> = {
  fix: shoppingCart,
  insideMax: '',
};
/** Calendar: the binder rings end square going up from the bar (above), at the standard spot. */
export const calendarPlacement: Partial<Placement> = { fix: calendar };
export const emailPlacement: Partial<Placement> = { fix: email };
