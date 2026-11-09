/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import BottomPanelClose32 from '@carbon/icons/es/bottom-panel--close/32.js';
import BottomPanelCloseFilled32 from '@carbon/icons/es/bottom-panel--close--filled/32.js';
import BottomPanelOpen32 from '@carbon/icons/es/bottom-panel--open/32.js';
import BottomPanelOpenFilled32 from '@carbon/icons/es/bottom-panel--open--filled/32.js';
import OpenPanelBottom32 from '@carbon/icons/es/open-panel--bottom/32.js';
import OpenPanelFilledBottom32 from '@carbon/icons/es/open-panel--filled--bottom/32.js';
import OpenPanelFilledLeft32 from '@carbon/icons/es/open-panel--filled--left/32.js';
import OpenPanelFilledRight32 from '@carbon/icons/es/open-panel--filled--right/32.js';
import OpenPanelFilledTop32 from '@carbon/icons/es/open-panel--filled--top/32.js';
import OpenPanelLeft32 from '@carbon/icons/es/open-panel--left/32.js';
import OpenPanelRight32 from '@carbon/icons/es/open-panel--right/32.js';
import OpenPanelTop32 from '@carbon/icons/es/open-panel--top/32.js';
import RightPanelClose32 from '@carbon/icons/es/right-panel--close/32.js';
import RightPanelCloseFilled32 from '@carbon/icons/es/right-panel--close--filled/32.js';
import RightPanelOpen32 from '@carbon/icons/es/right-panel--open/32.js';
import RightPanelOpenFilled32 from '@carbon/icons/es/right-panel--open--filled/32.js';
import SidePanelClose32 from '@carbon/icons/es/side-panel--close/32.js';
import SidePanelCloseFilled32 from '@carbon/icons/es/side-panel--close--filled/32.js';
import SidePanelOpen32 from '@carbon/icons/es/side-panel--open/32.js';
import SidePanelOpenFilled32 from '@carbon/icons/es/side-panel--open--filled/32.js';
import {
  carbonArt,
  fillThenClear,
  hoverIcon,
  toggleIcon,
  variantToggle,
  TOGGLE_IN,
  type CarbonIcon,
  type Shapes,
  type ToggleFrame,
  type ToggleIconProps,
  withStatic,
} from '../../engine';
import { ENTRANCE, EXIT, FOLD_AT, foldProgress } from '../../ease';
import { discFillPath, framePath, rectPath, type Pt } from '../../geometry';
import { lerp } from '../../paint';

const CBottomPanelClose = /* @__PURE__ */ carbonArt(BottomPanelClose32);
const CBottomPanelCloseFilled = /* @__PURE__ */ carbonArt(
  BottomPanelCloseFilled32
);
const CBottomPanelOpen = /* @__PURE__ */ carbonArt(BottomPanelOpen32);
const CBottomPanelOpenFilled = /* @__PURE__ */ carbonArt(
  BottomPanelOpenFilled32
);
const COpenPanelBottom = /* @__PURE__ */ carbonArt(OpenPanelBottom32);
const COpenPanelFilledBottom = /* @__PURE__ */ carbonArt(
  OpenPanelFilledBottom32
);
const COpenPanelFilledLeft = /* @__PURE__ */ carbonArt(OpenPanelFilledLeft32);
const COpenPanelFilledRight = /* @__PURE__ */ carbonArt(OpenPanelFilledRight32);
const COpenPanelFilledTop = /* @__PURE__ */ carbonArt(OpenPanelFilledTop32);
const COpenPanelLeft = /* @__PURE__ */ carbonArt(OpenPanelLeft32);
const COpenPanelRight = /* @__PURE__ */ carbonArt(OpenPanelRight32);
const COpenPanelTop = /* @__PURE__ */ carbonArt(OpenPanelTop32);
const CRightPanelClose = /* @__PURE__ */ carbonArt(RightPanelClose32);
const CRightPanelCloseFilled = /* @__PURE__ */ carbonArt(
  RightPanelCloseFilled32
);
const CRightPanelOpen = /* @__PURE__ */ carbonArt(RightPanelOpen32);
const CRightPanelOpenFilled = /* @__PURE__ */ carbonArt(RightPanelOpenFilled32);
const CSidePanelClose = /* @__PURE__ */ carbonArt(SidePanelClose32);
const CSidePanelCloseFilled = /* @__PURE__ */ carbonArt(SidePanelCloseFilled32);
const CSidePanelOpen = /* @__PURE__ */ carbonArt(SidePanelOpen32);
const CSidePanelOpenFilled = /* @__PURE__ */ carbonArt(SidePanelOpenFilled32);

/**
 * Carbon's panel icons (no reference animation).
 *
 * Every icon is one frame (outer corners r=2), a 2px divider, an optional
 * filled panel, and an optional arrow. They differ only in the axis the
 * panel divides, which end the panel is at, and whether the arrow opens
 * (leaves the divider) or closes (points at it). So one geometry function,
 * written along the panel's axis `u` and across it `v`, draws them all.
 *
 * Hover, arrow icons (the side-panel--open motion, generalised):
 * the frame widens 1px at both ends of the axis, and the divider moves
 * 2.5px with the arrow. "Open" arrows ride on the divider toward the main
 * area; "close" arrows push the divider toward the panel edge while their
 * tails stay on the frame, so the shaft stretches.
 * Hover, plain open-panel icons: the divider moves 2px and the panel grows.
 *
 * Toggles:
 * - open ↔ close: the arrowhead flips the way the Chevron toggles do (it
 *   folds flat, then opens pointing the other way: exit ease into the flat
 *   frame at 6/15, entrance ease out of it, 160ms), while the shaft slides
 *   its ends across. Each end state is Carbon's open or close icon exactly.
 * - outline ↔ filled: the house fill (§7.7). A disc grows from the
 *   panel's centre to fill it, and a hole grows from the same centre to
 *   empty it (one timing token faster). Both are clipped to the panel in
 *   geometry, not with masks.
 *
 * Separate fills overlap by 1px where they meet (divider into frame, fill
 * into both, shaft into divider or frame), so no anti-aliasing seams show.
 */

type Axis = 'x' | 'y';

interface PanelSpec {
  axis: Axis;
  /** +1: panel at the low end of the axis (left/top); −1: at the high end. */
  dir: 1 | -1;
  /** Divider centre along the axis. */
  divider: number;
}

const FRAME = { x0: 2, y0: 4, x1: 30, y1: 28 };
const CENTRE_V = 16;
const ARROW_TRAVEL = 2.5;
const DIVIDER_TRAVEL = 2;
const WIDEN = 1;

const f = (n: number) => String(Math.round(n * 1e4) / 1e4);

/** Along-axis and across-axis frame bounds. */
function bounds(axis: Axis) {
  return axis === 'x'
    ? { lo: FRAME.x0, hi: FRAME.x1, c0: FRAME.y0, c1: FRAME.y1 }
    : { lo: FRAME.y0, hi: FRAME.y1, c0: FRAME.x0, c1: FRAME.x1 };
}

const xy = (axis: Axis, u: number, v: number): Pt =>
  axis === 'x' ? [u, v] : [v, u];

function rect(
  axis: Axis,
  u0: number,
  u1: number,
  v0: number,
  v1: number
): string {
  return rectPath(...xy(axis, u0, v0), ...xy(axis, u1, v1));
}

/**
 * Carbon's arrowhead as a 2px miter-joined chevron: centreline vertex √2
 * behind the outer tip `T`, arm ends 6.705 back and 5.295 out (their butt
 * ends land on Carbon's corners). `s` is the pointing direction along u.
 */
const head = (T: number, s: number) => ({
  arm: T - s * 6.705,
  vertex: T - s * Math.SQRT2,
});
const ARM_V = 5.295;

function chevron(axis: Axis, arm: number, vertex: number): string {
  const pts: Array<[number, number]> = [
    [arm, -ARM_V],
    [vertex, 0],
    [arm, ARM_V],
  ];
  return `M${pts
    .map(([u, v]) =>
      xy(axis, u, CENTRE_V + v)
        .map(f)
        .join(',')
    )
    .join('L')}`;
}

// The Chevron toggles' timing (from their reference animation):
// fold flat by FOLD_AT (6/15) with the exit curve, open out with the
// entrance curve (utils/ease).

type Arrow = 'open' | 'close';

interface PanelFrame {
  /** Hover progress. */
  h: number;
  /** Arrow state, 0 = open pose, 1 = close pose (arrow turned 180°). */
  turn: number;
  /** Panel fill: disc from the centre (`fillTo`, 0→1), less a hole from the centre (`fillFrom`). */
  fillFrom: number;
  fillTo: number;
}

/**
 * All shapes for one panel at a frame. `arrow` is which pose the icon
 * starts in (null for plain open-panel icons); `turn` rotates it.
 */
function panelShapes(
  spec: PanelSpec,
  arrow: Arrow | null,
  fr: PanelFrame
): Shapes {
  const { axis, dir, divider: D } = spec;
  const b = bounds(axis);
  const widen = arrow ? WIDEN * fr.h : 0;
  const lo = b.lo - widen;
  const hi = b.hi + widen;
  const [a0, a1] = [lo + 2, hi - 2]; // inner along-axis edges
  const [ci0, ci1] = [b.c0 + 2, b.c1 - 2]; // inner across-axis edges

  // Divider shift: open arrows and plain panels move toward the main area,
  // close arrows toward the panel edge. A turning arrow blends the two.
  const shift = arrow
    ? fr.h *
      ARROW_TRAVEL *
      dir *
      (1 - 2 * (arrow === 'open' ? fr.turn : 1 - fr.turn))
    : fr.h * DIVIDER_TRAVEL * dir;
  const d = D + shift;

  const [x0, y0] = xy(axis, lo, b.c0);
  const [x1, y1] = xy(axis, hi, b.c1);
  const shapes: Shapes = {
    frame: { d: framePath(x0, y0, x1, y1) },
    divider: { d: rect(axis, d - 1, d + 1, ci0 - 1, ci1 + 1) },
  };

  // Panel fill between the panel-side inner edge (1px into the frame) and
  // the divider centre (1px into the divider): a disc from the panel's
  // centre, clipped to the panel (fillTo), less a hole from the same centre
  // (fillFrom). Even-odd, so the hole reads as empty.
  const outer = dir === 1 ? a0 - 1 : a1 + 1;
  const corners: Pt[] = [
    [outer, ci0 - 1],
    [d, ci0 - 1],
    [d, ci1 + 1],
    [outer, ci1 + 1],
  ].map(([u, v]) => xy(axis, u, v));
  const centre = xy(axis, (outer + d) / 2, (ci0 + ci1) / 2);
  shapes.fill = {
    d: discFillPath(corners, centre, fr.fillTo, fr.fillFrom),
    fillRule: 'evenodd',
  };

  if (arrow) {
    const farInnerRest = dir === 1 ? b.hi - 2 : b.lo + 2;
    const farInner = dir === 1 ? a1 : a0;
    const hoverShift = fr.h * ARROW_TRAVEL * dir;
    // Open pose: points away from the panel; tail 1px into the divider and
    // riding with it. Close pose: points at the divider, pushing it back;
    // tail 1px into the far frame edge.
    const open = {
      near: D + hoverShift,
      ...head(farInnerRest - 2 * dir + hoverShift, dir),
    };
    const close = {
      far: farInner + dir,
      ...head(D + 3 * dir - hoverShift, -dir),
    };
    const openFar = open.vertex;
    const closeNear = close.vertex;

    // k: 0 = open pose, 1 = close pose. The head folds flat at the midpoint
    // between the two arm lines, then opens the other way.
    const k = arrow === 'open' ? fr.turn : 1 - fr.turn;
    const flat = (open.arm + close.arm) / 2;
    let arm: number;
    let vertex: number;
    if (k <= FOLD_AT) {
      const t = EXIT(k / FOLD_AT);
      [arm, vertex] = [lerp(open.arm, flat, t), lerp(open.vertex, flat, t)];
    } else {
      const t = ENTRANCE((k - FOLD_AT) / (1 - FOLD_AT));
      [arm, vertex] = [lerp(flat, close.arm, t), lerp(flat, close.vertex, t)];
    }
    // The shaft's two ends slide between poses in step with the head.
    const q = foldProgress(k);
    const near = lerp(open.near, closeNear, q);
    const far = lerp(openFar, close.far, q);
    shapes.shaft = { d: rect(axis, near, far, CENTRE_V - 1, CENTRE_V + 1) };
    shapes.head = {
      d: chevron(axis, arm, vertex),
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinejoin: 'miter',
    };
  }
  return shapes;
}

const SIDE: PanelSpec = { axis: 'x', dir: 1, divider: 11 };
const RIGHT: PanelSpec = { axis: 'x', dir: -1, divider: 21 };
const BOTTOM: PanelSpec = { axis: 'y', dir: -1, divider: 19 };
const OPEN_LEFT: PanelSpec = { axis: 'x', dir: 1, divider: 11 };
const OPEN_RIGHT: PanelSpec = { axis: 'x', dir: -1, divider: 21 };
const OPEN_TOP: PanelSpec = { axis: 'y', dir: 1, divider: 13 };
const OPEN_BOTTOM: PanelSpec = { axis: 'y', dir: -1, divider: 19 };

/* @__NO_SIDE_EFFECTS__ */
const hoverPanel = (
  name: string,
  spec: PanelSpec,
  arrow: Arrow | null,
  filled: boolean
) =>
  hoverIcon(name, {
    geo: ({ h }) =>
      panelShapes(spec, arrow, {
        h,
        turn: 0,
        fillFrom: 0,
        fillTo: filled ? 1 : 0,
      }),
  });

// ── Hover icons ──────────────────────────────────────────────────────────────

export const SidePanelOpenSpec = /* @__PURE__ */ withStatic(
  hoverPanel('SidePanelOpen', SIDE, 'open', false),
  /* @__PURE__ */ carbonArt(SidePanelOpen32)
);
export const SidePanelOpenFilledSpec = /* @__PURE__ */ withStatic(
  hoverPanel('SidePanelOpenFilled', SIDE, 'open', true),
  /* @__PURE__ */ carbonArt(SidePanelOpenFilled32)
);
export const SidePanelCloseSpec = /* @__PURE__ */ withStatic(
  hoverPanel('SidePanelClose', SIDE, 'close', false),
  /* @__PURE__ */ carbonArt(SidePanelClose32)
);
export const SidePanelCloseFilledSpec = /* @__PURE__ */ withStatic(
  hoverPanel('SidePanelCloseFilled', SIDE, 'close', true),
  /* @__PURE__ */ carbonArt(SidePanelCloseFilled32)
);
export const RightPanelOpenSpec = /* @__PURE__ */ withStatic(
  hoverPanel('RightPanelOpen', RIGHT, 'open', false),
  /* @__PURE__ */ carbonArt(RightPanelOpen32)
);
export const RightPanelOpenFilledSpec = /* @__PURE__ */ withStatic(
  hoverPanel('RightPanelOpenFilled', RIGHT, 'open', true),
  /* @__PURE__ */ carbonArt(RightPanelOpenFilled32)
);
export const RightPanelCloseSpec = /* @__PURE__ */ withStatic(
  hoverPanel('RightPanelClose', RIGHT, 'close', false),
  /* @__PURE__ */ carbonArt(RightPanelClose32)
);
export const RightPanelCloseFilledSpec = /* @__PURE__ */ withStatic(
  hoverPanel('RightPanelCloseFilled', RIGHT, 'close', true),
  /* @__PURE__ */ carbonArt(RightPanelCloseFilled32)
);
export const BottomPanelOpenSpec = /* @__PURE__ */ withStatic(
  hoverPanel('BottomPanelOpen', BOTTOM, 'open', false),
  /* @__PURE__ */ carbonArt(BottomPanelOpen32)
);
export const BottomPanelOpenFilledSpec = /* @__PURE__ */ withStatic(
  hoverPanel('BottomPanelOpenFilled', BOTTOM, 'open', true),
  /* @__PURE__ */ carbonArt(BottomPanelOpenFilled32)
);
export const BottomPanelCloseSpec = /* @__PURE__ */ withStatic(
  hoverPanel('BottomPanelClose', BOTTOM, 'close', false),
  /* @__PURE__ */ carbonArt(BottomPanelClose32)
);
export const BottomPanelCloseFilledSpec = /* @__PURE__ */ withStatic(
  hoverPanel('BottomPanelCloseFilled', BOTTOM, 'close', true),
  /* @__PURE__ */ carbonArt(BottomPanelCloseFilled32)
);
export const OpenPanelLeftSpec = /* @__PURE__ */ withStatic(
  hoverPanel('OpenPanelLeft', OPEN_LEFT, null, false),
  /* @__PURE__ */ carbonArt(OpenPanelLeft32)
);
export const OpenPanelRightSpec = /* @__PURE__ */ withStatic(
  hoverPanel('OpenPanelRight', OPEN_RIGHT, null, false),
  /* @__PURE__ */ carbonArt(OpenPanelRight32)
);
export const OpenPanelTopSpec = /* @__PURE__ */ withStatic(
  hoverPanel('OpenPanelTop', OPEN_TOP, null, false),
  /* @__PURE__ */ carbonArt(OpenPanelTop32)
);
export const OpenPanelBottomSpec = /* @__PURE__ */ withStatic(
  hoverPanel('OpenPanelBottom', OPEN_BOTTOM, null, false),
  /* @__PURE__ */ carbonArt(OpenPanelBottom32)
);
export const OpenPanelFilledLeftSpec = /* @__PURE__ */ withStatic(
  hoverPanel('OpenPanelFilledLeft', OPEN_LEFT, null, true),
  /* @__PURE__ */ carbonArt(OpenPanelFilledLeft32)
);
export const OpenPanelFilledRightSpec = /* @__PURE__ */ withStatic(
  hoverPanel('OpenPanelFilledRight', OPEN_RIGHT, null, true),
  /* @__PURE__ */ carbonArt(OpenPanelFilledRight32)
);
export const OpenPanelFilledTopSpec = /* @__PURE__ */ withStatic(
  hoverPanel('OpenPanelFilledTop', OPEN_TOP, null, true),
  /* @__PURE__ */ carbonArt(OpenPanelFilledTop32)
);
export const OpenPanelFilledBottomSpec = /* @__PURE__ */ withStatic(
  hoverPanel('OpenPanelFilledBottom', OPEN_BOTTOM, null, true),
  /* @__PURE__ */ carbonArt(OpenPanelFilledBottom32)
);

// ── Toggles ──────────────────────────────────────────────────────────────────

type OpenClose = 'open' | 'close';
type Fill = 'outline' | 'filled';

/**
 * open ↔ close. States name the Carbon icon shown: `toggled` shows the
 * close icon (the panel is open, so the action on offer is closing it).
 */
/* @__NO_SIDE_EFFECTS__ */
const arrowToggle = (
  name: string,
  spec: PanelSpec,
  filled: boolean,
  statics: readonly [CarbonIcon, CarbonIcon]
) =>
  toggleIcon<OpenClose>(name, {
    states: ['open', 'close'],
    statics,
    geo: ({ h, p }: ToggleFrame) =>
      panelShapes(spec, 'open', {
        h,
        turn: p,
        fillFrom: 0,
        fillTo: filled ? 1 : 0,
      }),
    // Linear: the geometry applies the Chevron toggles' two-part easing itself.
    change: (turningOn, _fr, tween) =>
      tween('p', turningOn ? 1 : 0, {
        duration: TOGGLE_IN.duration,
        ease: [0, 0, 1, 1],
      }),
  });

/** outline ↔ filled: the house disc fill in, and a hole from the same centre out. */
/* @__NO_SIDE_EFFECTS__ */
const fillToggle = (
  name: string,
  spec: PanelSpec,
  statics: readonly [CarbonIcon, CarbonIcon]
) =>
  toggleIcon<Fill>(name, {
    states: ['outline', 'filled'],
    statics,
    geo: ({ h, p, e }: ToggleFrame) =>
      panelShapes(spec, null, { h, turn: 0, fillFrom: e, fillTo: p }),
    change: fillThenClear,
  });

/** open ↔ close, outline and filled (`filled` picks the filled drawings). */
/* @__NO_SIDE_EFFECTS__ */
const panelToggle = (
  name: string,
  spec: PanelSpec,
  outline: readonly [CarbonIcon, CarbonIcon],
  filled: readonly [CarbonIcon, CarbonIcon]
) => {
  const Outline = arrowToggle(name, spec, false, outline);
  const Filled = arrowToggle(`${name}(filled)`, spec, true, filled);
  return variantToggle(name, (p: ToggleIconProps<OpenClose>) =>
    p.filled ? Filled : Outline
  );
};

/** Side panel open ⇄ close; `filled` draws Carbon's filled panels. */
export const SidePanelOpenToggleSpec = /* @__PURE__ */ panelToggle(
  'SidePanelOpenToggle',
  SIDE,
  [CSidePanelOpen, CSidePanelClose],
  [CSidePanelOpenFilled, CSidePanelCloseFilled]
);
/** Right panel open ⇄ close; `filled` draws Carbon's filled panels. */
export const RightPanelOpenToggleSpec = /* @__PURE__ */ panelToggle(
  'RightPanelOpenToggle',
  RIGHT,
  [CRightPanelOpen, CRightPanelClose],
  [CRightPanelOpenFilled, CRightPanelCloseFilled]
);
/** Bottom panel open ⇄ close; `filled` draws Carbon's filled panels. */
export const BottomPanelOpenToggleSpec = /* @__PURE__ */ panelToggle(
  'BottomPanelOpenToggle',
  BOTTOM,
  [CBottomPanelOpen, CBottomPanelClose],
  [CBottomPanelOpenFilled, CBottomPanelCloseFilled]
);
export const OpenPanelLeftToggleSpec = /* @__PURE__ */ fillToggle(
  'OpenPanelLeftToggle',
  OPEN_LEFT,
  [COpenPanelLeft, COpenPanelFilledLeft]
);
export const OpenPanelRightToggleSpec = /* @__PURE__ */ fillToggle(
  'OpenPanelRightToggle',
  OPEN_RIGHT,
  [COpenPanelRight, COpenPanelFilledRight]
);
export const OpenPanelTopToggleSpec = /* @__PURE__ */ fillToggle(
  'OpenPanelTopToggle',
  OPEN_TOP,
  [COpenPanelTop, COpenPanelFilledTop]
);
export const OpenPanelBottomToggleSpec = /* @__PURE__ */ fillToggle(
  'OpenPanelBottomToggle',
  OPEN_BOTTOM,
  [COpenPanelBottom, COpenPanelFilledBottom]
);
