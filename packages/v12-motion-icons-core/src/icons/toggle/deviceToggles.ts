/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Folder32 from '@carbon/icons/es/folder/32.js';
import FolderOff32 from '@carbon/icons/es/folder--off/32.js';
import Screen32 from '@carbon/icons/es/screen/32.js';
import ScreenOff32 from '@carbon/icons/es/screen--off/32.js';
import Video32 from '@carbon/icons/es/video/32.js';
import VideoFilled32 from '@carbon/icons/es/video--filled/32.js';
import VideoOff32 from '@carbon/icons/es/video--off/32.js';
import VideoOffFilled32 from '@carbon/icons/es/video--off--filled/32.js';
import {
  carbonArt,
  fillThenClear,
  hoverIcon,
  toggleIcon,
  variantToggle,
  type Shapes,
  type ToggleFrame,
  type ToggleIconProps,
  withStatic,
} from '../../engine';
import { shapeFillPath, type Pt } from '../../geometry';
import { mapSegs, type Seg } from '../../cut';
import {
  cutBase,
  filletSegs,
  OFF_SHRINK,
  outlineD,
  slashPath,
  SLASH_REACH,
  strokeOutline,
  type Slash,
} from '../../off';
import {
  kickAmount,
  makeOffIcon,
  makeSlashToggle,
  slashChange,
  slashShapes,
  type SlashToggleSpec,
} from '../../utils/slashToggle';
import { EVENODD } from '../../paint';

const CFolder = /* @__PURE__ */ carbonArt(Folder32);
const CFolderOff = /* @__PURE__ */ carbonArt(FolderOff32);
const CScreen = /* @__PURE__ */ carbonArt(Screen32);
const CScreenOff = /* @__PURE__ */ carbonArt(ScreenOff32);
const CVideo = /* @__PURE__ */ carbonArt(Video32);
const CVideoFilled = /* @__PURE__ */ carbonArt(VideoFilled32);
const CVideoOff = /* @__PURE__ */ carbonArt(VideoOff32);
const CVideoOffFilled = /* @__PURE__ */ carbonArt(VideoOffFilled32);

/**
 * Devices: Folder (off), Screen (off) and Video (filled, off, off
 * filled), as hover icons and toggles on the frame engine.
 *
 * Every part is a 2px centreline outlined at constant weight (Carbon's outer
 * corners r 2 are centreline fillets of r 1 about a sharp inner corner), so
 * nothing thickens as it grows or shrinks; no masks, clip paths or transforms.
 *
 * Off toggles are the standard slash (utils/slashToggle): on → off the slash
 * draws in from its top-right end (160ms entrance) with Carbon's cuts opening
 * behind its head, and the base kicks 2px left (toward the gap) and back;
 * off → on the slash retracts (120ms exit) and the base recoils half as far.
 * The off hover is the set-wide Off rule: the base shrinks to 90% about its
 * visual centre at constant weight and the slash reaches 1px further each
 * end. Carbon's three Off drawings keep the on icon's base exactly (nothing
 * moves or resizes under the slash); only the cuts differ, as below.
 */

const SLASH: Slash = {
  a: [29.2929, 2.7071],
  b: [2.7071, 29.2929],
  gapSide: 1,
  gap: 2,
};
/** Carbon cuts a wall square (across itself) where its centreline reaches x + y = c: that many side units from the slash. */
const squareAt = (c: number) => Math.abs(32 - c) / Math.SQRT2;
const KICK: Pt = [-2, 0];
/** How far containers grow on hover (the set-wide rule). */
const GROW = 2;

const L = (a: Pt, b: Pt): Seg => ({ k: 'L', a, b });

/** Two offset loops of a closed centreline's 2px outline, the inside one second. */
function loops(path: readonly Seg[], round: 0 | 1 | -1 | 2 = 0): [Pt[], Pt[]] {
  const [a, b] = strokeOutline(path, 2, round).loops!;
  return Math.abs(area(a)) > Math.abs(area(b)) ? [a, b] : [b, a];
}
const area = (pts: readonly Pt[]) =>
  pts.reduce(
    (s, p, i) =>
      s +
      p[0] * pts[(i + 1) % pts.length][1] -
      pts[(i + 1) % pts.length][0] * p[1],
    0
  ) / 2;

/** The area centroid of a simple polygon. */
function areaCentroid(pts: readonly Pt[]): Pt {
  let [a, cx, cy] = [0, 0, 0];
  pts.forEach(([x0, y0], i) => {
    const [x1, y1] = pts[(i + 1) % pts.length];
    const k = x0 * y1 - x1 * y0;
    [a, cx, cy] = [a + k, cx + (x0 + x1) * k, cy + (y0 + y1) * k];
  });
  return [cx / (3 * a), cy / (3 * a)];
}
const reachOf = (pts: readonly Pt[], [cx, cy]: Pt) =>
  Math.max(...pts.map(([x, y]) => Math.hypot(x - cx, y - cy))) + 0.5;

// ── Folder ───────────────────────────────────────────────────────────────────
//
// The folder is one closed centreline: the tab (top y 5) steps down a 45°
// diagonal to the top edge (y 9). Outer corners are r 1 fillets; the foot of
// the diagonal is sharp both sides, as Carbon draws it.
//
// Hover: the container rule, every edge 2px out at constant weight (the
// diagonal 2px out along its normal), so the tab grows with the body.

/** The diagonal's centreline is x − y = TAB. */
const TAB = 8 - Math.SQRT2;

/** The folder's centreline, grown g px out. */
function folderLoop(g: number): Seg[] {
  const out = g * (Math.SQRT2 - 1); // the diagonal's corners slide this far right as it moves out along its normal
  return filletSegs(
    [
      [3 - g, 5 - g],
      [TAB + 5 + out, 5 - g],
      [TAB + 9 + out, 9 - g],
      [29 + g, 9 - g],
      [29 + g, 27 + g],
      [3 - g, 27 + g],
    ],
    [1, 1, 0, 1, 1, 1],
    true
  );
}

export const FolderSpec = /* @__PURE__ */ hoverIcon('Folder', {
  geo: ({ h }) => ({
    frame: { d: cutBase([folderLoop(GROW * h)], SLASH, 0).rings, ...EVENODD },
  }),
  static: /* @__PURE__ */ carbonArt(Folder32),
});

// Folder off: Carbon's slash and 2px gap above it, with the left wall and
// the top edge cut square where their centrelines reach x + y = 27 (as No
// image). Below the slash the folder runs flush into it.
const FOLDER_OFF: SlashToggleSpec = {
  statics: [CFolder, CFolderOff],
  slash: SLASH,
  kick: KICK,
  centre: [16, 16],
  base: (hOn) => ({
    strokes: [{ path: folderLoop(GROW * hOn), square: squareAt(27) }],
  }),
};
export const FolderOffToggleSpec = /* @__PURE__ */ makeSlashToggle(
  'FolderOffToggle',
  FOLDER_OFF
);
export const FolderOffSpec = /* @__PURE__ */ withStatic(
  makeOffIcon('FolderOff', FOLDER_OFF),
  /* @__PURE__ */ carbonArt(FolderOff32)
);

// ── Screen ───────────────────────────────────────────────────────────────────
//
// The display is a framed rect (centreline 3–29 × 5–23); the stand is two
// 2px legs (x 13 and 19) down to a 2px base (y 29, x 8–24).
//
// Hover: the display grows 1px on every side (2px reads as too much) and
// the base holds; the legs keep joining the two, so they shorten 4 → 3px.
//
// Off: Carbon cuts screen--off differently on each side of the slash. Above
// it, the top edge runs flush into the slash and the left wall stops square
// at y 22 (the bottom-left corner is gone); below it, the bottom edge runs
// flush and the right wall stops square at y 9 (the top-right corner is
// gone). So the display is drawn as two open centrelines, split at the
// middle of each side wall: the top-and-right one is cut (square) below the
// slash, the bottom-and-left one above it. The stand is never cut.

/** One open centreline of the off art, with which side of the slash its square cut is on. */
type SideStroke = { path: Seg[]; side: 1 | -1; square: number };
interface SidedSpec {
  slash: Slash;
  kick: Pt;
  centre: Pt;
  base: (hOn: number) => { cut: SideStroke[]; free: Seg[][] };
}

/**
 * slashShapes for art whose cuts fall on both sides of the slash (each stroke
 * is cut by cutBase with its own gap side); `free` strokes are never cut.
 * The kick, the off shrink and the slash are slashShapes' own.
 */
function sidedSlashShapes(spec: SidedSpec, { h, p, e }: ToggleFrame): Shapes {
  const k = 1 - OFF_SHRINK * h * p;
  const amount = kickAmount(e);
  const m = {
    s: k,
    origin: spec.centre,
    deg: 0,
    pivot: spec.centre,
    tx: spec.kick[0] * amount,
    ty: spec.kick[1] * amount,
  };
  const art = spec.base(h * (1 - p));
  const reach = SLASH_REACH * h;
  let [fill, rings] = ['', ''];
  for (const st of art.cut) {
    const cut = cutBase(
      [{ path: mapSegs([st.path], m)[0], square: st.square }],
      { ...spec.slash, gapSide: st.side },
      p,
      reach
    );
    [fill, rings] = [fill + cut.fill, rings + cut.rings];
  }
  for (const path of art.free) {
    fill += outlineD(mapSegs([path], m)[0]);
  }
  return {
    fill: { d: fill },
    rings: { d: rings, ...EVENODD },
    slash: { d: slashPath(spec.slash, reach, p) },
  };
}

/** How far the display grows on hover. */
const SCREEN_GROW = 1;

const SCREEN_OFF: SidedSpec = {
  slash: SLASH,
  kick: KICK,
  centre: [16, 17],
  base: (hOn) => {
    const g = SCREEN_GROW * hOn;
    const [l, r, t, b] = [3 - g, 29 + g, 5 - g, 23 + g];
    return {
      cut: [
        {
          path: filletSegs(
            [
              [l, 14],
              [l, t],
              [r, t],
              [r, 14],
            ],
            1
          ),
          side: -1,
          square: squareAt(38),
        },
        {
          path: filletSegs(
            [
              [r, 14],
              [r, b],
              [l, b],
              [l, 14],
            ],
            1
          ),
          side: 1,
          square: squareAt(25),
        },
      ],
      free: [
        [L([13, b], [13, 29])],
        [L([19, b], [19, 29])],
        [L([8, 29], [24, 29])],
      ],
    };
  },
};
const screenShapes = (fr: ToggleFrame) => sidedSlashShapes(SCREEN_OFF, fr);

/** Screen ⇄ Screen off. `toggled` shows Screen off. */
export const ScreenOffToggleSpec = /* @__PURE__ */ toggleIcon<'on' | 'off'>(
  'ScreenOffToggle',
  {
    states: ['on', 'off'],
    statics: [CScreen, CScreenOff],
    geo: screenShapes,
    change: slashChange,
  }
);
export const ScreenSpec = /* @__PURE__ */ hoverIcon('Screen', {
  geo: ({ h }) => screenShapes({ h, p: 0, e: 0 }),
  static: /* @__PURE__ */ carbonArt(Screen32),
});
export const ScreenOffSpec = /* @__PURE__ */ hoverIcon('ScreenOff', {
  geo: ({ h }) => screenShapes({ h, p: 1, e: 0 }),
  static: /* @__PURE__ */ carbonArt(ScreenOff32),
});

// ── Video ────────────────────────────────────────────────────────────────────
//
// The camera is one closed centreline: the body (3–22 × 7–25, outer corners
// r 1 fillets) opens on its right side between y 14 and 18 into the lens
// wedge, whose arms run out to its mouth (x 29, y 9–23). Carbon rounds the
// mouth's outer corners and the inside corners where the arms leave the
// body, and keeps the rest sharp: round joins on both sides, which only ever
// round the outside of a turn.
//
// Hover (Video, Video filled, and the Off toggles' on ends): the lens wedge
// reaches out and opens. Its mouth moves 2px right; the top arm moves 1px up
// and the bottom arm 1px down (where they leave the body too, so the body's
// opening widens with them), so the mouth stands 2px taller (14 → 16px). The
// arms stretch the 2px to the mouth; the body holds. Off icons hover by the
// Off rule.

/** The camera's centreline, the wedge reached out and opened by `hOn`. */
function videoPts(hOn: number): Pt[] {
  const [x, up] = [29 + 2 * hOn, hOn];
  return [
    [3, 7],
    [22, 7],
    [22, 14 - up],
    [x, 9 - up],
    [x, 23 + up],
    [22, 18 + up],
    [22, 25],
    [3, 25],
  ];
}
const VIDEO_RADII = [1, 1, 0, 0, 0, 0, 1, 1];
const videoLoop = (hOn: number) => filletSegs(videoPts(hOn), VIDEO_RADII, true);

/**
 * Video ⇄ Video filled: the house disc fill. A disc grows from the inside's
 * area centroid (the body and wedge as one hollow, so a little right of the
 * body's middle), clipped to the outline's inside edge, in one even-odd path
 * with the outline so the two meet with no seam; a hole from the same point
 * empties it. Filled, the outline and fill are Carbon's video--filled.
 */
function videoShapes(h: number, p: number, e: number): Shapes {
  const path = videoLoop(h);
  const [, inside] = loops(path, 2);
  const c = areaCentroid(inside);
  const r = reachOf(inside, c);
  const { rings } = cutBase([{ path, round: 2 }], SLASH, 0);
  return {
    camera: { d: rings + shapeFillPath(inside, c, r * p, r * e), ...EVENODD },
  };
}

export const VideoToggleSpec = /* @__PURE__ */ toggleIcon<'off' | 'on'>(
  'VideoToggle',
  {
    states: ['off', 'on'],
    statics: [CVideo, CVideoFilled],
    geo: ({ h, p, e }) => videoShapes(h, p, e),
    change: fillThenClear,
  }
);
export const VideoSpec = /* @__PURE__ */ hoverIcon('Video', {
  geo: ({ h }) => videoShapes(h, 0, 0),
  static: /* @__PURE__ */ carbonArt(Video32),
});
export const VideoFilledSpec = /* @__PURE__ */ hoverIcon('VideoFilled', {
  geo: ({ h }) => videoShapes(h, 1, 0),
  static: /* @__PURE__ */ carbonArt(VideoFilled32),
});

// Carbon draws video--off's slash 2.036px wide, with its ends at (28.56, 2)
// – (30, 3.44) and (2, 28.56) – (3.44, 30) (the set's: 2px, ending 0.026px
// further out), and its filled gap 3.03px. It's invisible, but Chrome snaps
// a 45° edge by its end points, so the set's slash missed parity by 1.5% at
// 16px. The video slash is drawn on Carbon's own corners (the same line,
// draw-in and reach), and the filled gap is Carbon's.
const VIDEO_SLASH: Slash = {
  a: [29.28, 2.72],
  b: [2.72, 29.28],
  gapSide: 1,
  gap: 2,
};
const VIDEO_SLASH_HALF = 0.72 * Math.SQRT2;
/** The slash band at Carbon's video width, drawn from a to `t` of the way to b, `reach` past each end (as slashPath). */
function videoSlashPath(sl: Slash, reach: number, t: number): string {
  if (t <= 1e-4) {
    return '';
  }
  const l = Math.hypot(sl.b[0] - sl.a[0], sl.b[1] - sl.a[1]);
  const u: Pt = [(sl.b[0] - sl.a[0]) / l, (sl.b[1] - sl.a[1]) / l];
  const n: Pt = [-u[1] * VIDEO_SLASH_HALF, u[0] * VIDEO_SLASH_HALF];
  const a: Pt = [sl.a[0] - u[0] * reach, sl.a[1] - u[1] * reach];
  const len = (l + 2 * reach) * t;
  const b: Pt = [a[0] + u[0] * len, a[1] + u[1] * len];
  const P = ([x, y]: Pt) => `${+x.toFixed(3)} ${+y.toFixed(3)}`;
  return `M${P([a[0] + n[0], a[1] + n[1]])}L${P([b[0] + n[0], b[1] + n[1]])}L${P([b[0] - n[0], b[1] - n[1]])}L${P([a[0] - n[0], a[1] - n[1]])}Z`;
}
/** Off shapes with the slash redrawn at Carbon's video width. */
const withVideoSlash = (
  sl: Slash,
  shapes: Shapes,
  { h, p }: ToggleFrame
): Shapes => ({
  ...shapes,
  slash: { d: videoSlashPath(sl, SLASH_REACH * h, p) },
});

// Video off: Carbon's slash and 2px gap above it, the left wall and top edge
// cut square at x + y = 27 (as Folder off); below the slash the body's right
// wall and bottom edge run flush into it, and the wedge is whole.
const VIDEO_OFF: SlashToggleSpec = {
  statics: [CVideo, CVideoOff],
  slash: VIDEO_SLASH,
  kick: KICK,
  centre: [16, 16],
  base: (hOn) => ({
    strokes: [{ path: videoLoop(hOn), square: squareAt(27), round: 2 }],
  }),
};
// Filled: one solid, the silhouette (the outline's outside edge), cut flush
// by Carbon's 3.03px filled gap. One path, so nothing seams. slashShapes shrinks
// solids about the centre by k (the off hover), which would shrink its
// corners too; so the silhouette is taken about the already-shrunk
// centreline (corners hold at r 2 and r 1) and handed over pre-grown by 1/k,
// as Send alt's filled Off does.
const VIDEO_C: Pt = [16, 16];
function videoFilledOff(k: number): SlashToggleSpec {
  const about =
    (s: number) =>
    ([x, y]: Pt): Pt => [
      VIDEO_C[0] + (x - VIDEO_C[0]) * s,
      VIDEO_C[1] + (y - VIDEO_C[1]) * s,
    ];
  return {
    statics: [CVideoFilled, CVideoOffFilled],
    slash: { ...VIDEO_SLASH, gap: 3.03 },
    kick: KICK,
    centre: VIDEO_C,
    base: (hOn) => {
      const shrunk = mapSegs([videoLoop(hOn)], {
        s: k,
        origin: VIDEO_C,
        deg: 0,
        pivot: VIDEO_C,
        tx: 0,
        ty: 0,
      })[0];
      return { strokes: [], solids: [loops(shrunk, 2)[0].map(about(1 / k))] };
    },
  };
}
const videoFilledOffShapes = (fr: ToggleFrame) => {
  const spec = videoFilledOff(1 - OFF_SHRINK * fr.h * fr.p);
  return withVideoSlash(spec.slash, slashShapes(spec, fr), fr);
};
const videoOffShapes = (fr: ToggleFrame) =>
  withVideoSlash(VIDEO_OFF.slash, slashShapes(VIDEO_OFF, fr), fr);
export const VideoOffOutlineToggleSpec = /* @__PURE__ */ toggleIcon<
  'on' | 'off'
>('VideoOffToggle', {
  states: ['on', 'off'],
  statics: VIDEO_OFF.statics,
  geo: videoOffShapes,
  change: slashChange,
});
export const VideoOffFilledToggleSpec = /* @__PURE__ */ toggleIcon<
  'on' | 'off'
>('VideoOffToggle(filled)', {
  states: ['on', 'off'],
  statics: [CVideoFilled, CVideoOffFilled],
  geo: videoFilledOffShapes,
  change: slashChange,
});
/** Video ⇄ Video off; `filled` draws Carbon's filled video icons. */
export const VideoOffToggleSpec = /* @__PURE__ */ variantToggle(
  'VideoOffToggle',
  (p: ToggleIconProps<'on' | 'off'>) =>
    p.filled ? VideoOffFilledToggleSpec : VideoOffOutlineToggleSpec
);
export const VideoOffSpec = /* @__PURE__ */ hoverIcon('VideoOff', {
  geo: ({ h }) => videoOffShapes({ h, p: 1, e: 0 }),
  static: /* @__PURE__ */ carbonArt(VideoOff32),
});
export const VideoOffFilledSpec = /* @__PURE__ */ hoverIcon('VideoOffFilled', {
  geo: ({ h }) => videoFilledOffShapes({ h, p: 1, e: 0 }),
  static: /* @__PURE__ */ carbonArt(VideoOffFilled32),
});
