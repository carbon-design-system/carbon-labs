/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import {
  AddAlt as CAddAlt,
  AddFilled as CAddFilled,
  Bookmark as CBookmark,
  BookmarkFilled as CBookmarkFilled,
  CloseFilled as CCloseFilled,
  CloseOutline as CCloseOutline,
  Filter as CFilter,
  FilterFilled as CFilterFilled,
  Flag as CFlag,
  FlagFilled as CFlagFilled,
  NotSent as CNotSent,
  NotSentFilled as CNotSentFilled,
  Pin as CPin,
  PinFilled as CPinFilled,
  RadioButton as CRadioButton,
  RadioButtonChecked as CRadioButtonChecked,
  SendAlt as CSendAlt,
  SendAltFilled as CSendAltFilled,
  SubtractAlt as CSubtractAlt,
  SubtractFilled as CSubtractFilled,
  Unlocked as CUnlocked,
  UnlockedFilled as CUnlockedFilled,
} from '@carbon/icons-react';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import type {
  CarbonIcon,
  FrameToggleIcon,
  Shapes,
} from '../../utils/frameIcon';
import { movePath, type Pt } from '@carbon-labs/motion-icons-core/geometry';
import {
  AddToggle,
  BookmarkToggle,
  CloseToggle,
  FilterFilled,
  FilterToggle,
  FlagToggle,
  PinToggle,
  RadioButtonChecked,
  RadioButtonToggle,
  SendAltOffToggle,
  SubtractFilled,
  SubtractToggle,
  UnlockedFilled,
  UnlockedToggle,
} from '../../icons/toggle/opsFillToggles';
import {
  Bookmark,
  BookmarkFilled,
  Flag,
  FlagFilled,
  Pin,
  PinFilled,
  SendAlt,
  SendAltFilled,
} from '../../icons/operations/opsMisc';
import { Filter } from '../../icons/operations/opsLast';
import { NotSent } from '../../icons/operations/NotSent';
import { NotSentFilled } from '../../icons/operations/NotSentFilled';
import {
  AddAlt,
  AddFilled,
  CloseFilled,
  CloseOutline,
  SubtractAlt,
} from '../../icons/operations/signs';
import {
  LockedUnlockedFilledToggle,
  LockedUnlockedOutlineToggle,
} from '../../icons/toggle/lockToggle';
import { CheckmarkOutlineToggle } from '../../icons/toggle/checkToggles';

/**
 * The outline ⇄ filled operations toggles (opsFillToggles.ts).
 *
 * Besides keys and NaNs, each toggle's ends are checked against the hover
 * icons they must equal and against Carbon's static icons, by coverage: both
 * drawings are sampled at 8×8 per parity pixel (fill rules, and strokes with
 * butt ends and round joins, honoured) and compared as the parity story does:
 * Δ is the share of ink pixels (4× the rendered size) whose coverage differs
 * by more than a quarter, gated at 0.5%. This sampler is gentler than the
 * browser's anti-aliasing, so it catches shape errors, not sub-0.1px ones. Where the toggle reads a shape straight from
 * the hover icon's geometry, its `d` is also checked to be identical.
 */

// ── A small rasteriser ───────────────────────────────────────────────────────

type Poly = { pts: Pt[]; closed: boolean };

function arcPts(
  p0: Pt,
  rxIn: number,
  ryIn: number,
  phiDeg: number,
  large: number,
  sweep: number,
  p1: Pt
): Pt[] {
  let [rx, ry] = [Math.abs(rxIn), Math.abs(ryIn)];
  if (!rx || !ry) return [p1];
  const phi = (phiDeg * Math.PI) / 180;
  const [cos, sin] = [Math.cos(phi), Math.sin(phi)];
  const [dx, dy] = [(p0[0] - p1[0]) / 2, (p0[1] - p1[1]) / 2];
  const [x1, y1] = [cos * dx + sin * dy, -sin * dx + cos * dy];
  const lambda = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry);
  if (lambda > 1) [rx, ry] = [rx * Math.sqrt(lambda), ry * Math.sqrt(lambda)];
  const num = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1;
  const den = rx * rx * y1 * y1 + ry * ry * x1 * x1;
  const co = Math.sqrt(Math.max(0, num / den)) * (large === sweep ? -1 : 1);
  const [cxp, cyp] = [(co * rx * y1) / ry, (-co * ry * x1) / rx];
  const [cx, cy] = [
    cos * cxp - sin * cyp + (p0[0] + p1[0]) / 2,
    sin * cxp + cos * cyp + (p0[1] + p1[1]) / 2,
  ];
  const ang = (ux: number, uy: number, vx: number, vy: number) =>
    Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
  const t1 = ang(1, 0, (x1 - cxp) / rx, (y1 - cyp) / ry);
  let dt = ang(
    (x1 - cxp) / rx,
    (y1 - cyp) / ry,
    (-x1 - cxp) / rx,
    (-y1 - cyp) / ry
  );
  if (!sweep && dt > 0) dt -= 2 * Math.PI;
  if (sweep && dt < 0) dt += 2 * Math.PI;
  const n = Math.max(2, Math.ceil(Math.abs(dt) / (Math.PI / 120)));
  return Array.from({ length: n }, (_, k) => {
    const t = t1 + (dt * (k + 1)) / n;
    return [
      cx + rx * Math.cos(t) * cos - ry * Math.sin(t) * sin,
      cy + rx * Math.cos(t) * sin + ry * Math.sin(t) * cos,
    ] as Pt;
  });
}

/** Any SVG path (absolute or relative M L H V C S Q T A Z) as polylines. */
function flatten(d: string): Poly[] {
  const tok =
    d.match(/[a-zA-Z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) ?? [];
  const out: Poly[] = [];
  let [i, cmd, prev] = [0, '', ''];
  let cur: Pt = [0, 0];
  let start: Pt = [0, 0];
  let ctrl: Pt = [0, 0];
  let poly: Pt[] = [];
  const num = () => Number(tok[i++]);
  const flush = (closed: boolean) => {
    if (poly.length > 1) out.push({ pts: poly, closed });
    poly = [];
  };
  const bez = (pts: Pt[]) => {
    for (let k = 1; k <= 24; k++) {
      const t = k / 24;
      let q = pts;
      while (q.length > 1)
        q = q
          .slice(1)
          .map(
            (b, j) =>
              [
                q[j][0] + (b[0] - q[j][0]) * t,
                q[j][1] + (b[1] - q[j][1]) * t,
              ] as Pt
          );
      poly.push(q[0]);
    }
  };
  while (i < tok.length) {
    if (/^[a-zA-Z]$/.test(tok[i])) cmd = tok[i++];
    const rel = cmd !== cmd.toUpperCase();
    const P = (): Pt => {
      const [x, y] = [num(), num()];
      return rel ? [cur[0] + x, cur[1] + y] : [x, y];
    };
    const C = cmd.toUpperCase();
    if (C === 'M') {
      flush(false);
      cur = P();
      start = cur;
      poly = [cur];
      cmd = rel ? 'l' : 'L';
    } else if (C === 'L') {
      cur = P();
      poly.push(cur);
    } else if (C === 'H') {
      const x = num();
      cur = [rel ? cur[0] + x : x, cur[1]];
      poly.push(cur);
    } else if (C === 'V') {
      const y = num();
      cur = [cur[0], rel ? cur[1] + y : y];
      poly.push(cur);
    } else if (C === 'C' || C === 'S') {
      const c1: Pt =
        C === 'C'
          ? P()
          : /[CS]/.test(prev)
            ? [2 * cur[0] - ctrl[0], 2 * cur[1] - ctrl[1]]
            : cur;
      const [c2, e] = [P(), P()];
      bez([cur, c1, c2, e]);
      [ctrl, cur] = [c2, e];
    } else if (C === 'Q' || C === 'T') {
      const c1: Pt =
        C === 'Q'
          ? P()
          : /[QT]/.test(prev)
            ? [2 * cur[0] - ctrl[0], 2 * cur[1] - ctrl[1]]
            : cur;
      const e = P();
      bez([cur, c1, e]);
      [ctrl, cur] = [c1, e];
    } else if (C === 'A') {
      const [rx, ry, rot, large, sweep] = [num(), num(), num(), num(), num()];
      const e = P();
      poly.push(...arcPts(cur, rx, ry, rot, large, sweep, e));
      cur = e;
    } else if (C === 'Z') {
      flush(true);
      cur = start;
      poly = [start];
    } else throw new Error(`flatten: "${cmd}"`);
    prev = C;
  }
  flush(false);
  return out;
}

const roundedRect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;

/**
 * The sampling grid for a rendered size: the parity story's pixels (4× the
 * size, so 8/size units) at 8×8 samples each, over −2…34 (pixel-aligned at
 * 0). `grid(size)` sets it before a comparison.
 */
const [LO, SUB] = [-2, 8];
let [STEP, N] = [1 / 32, 1152];
const grid = (size: number) => {
  [STEP, N] = [8 / size / SUB, (36 * size * SUB) / 8];
};
const at = (k: number) => LO + (k + 0.5) * STEP;

function fillInto(ink: Uint8Array, polys: Poly[], evenodd: boolean) {
  for (let j = 0; j < N; j++) {
    const y = at(j);
    const xs: [number, number][] = [];
    for (const { pts } of polys) {
      pts.forEach((a, k) => {
        const b = pts[(k + 1) % pts.length];
        if (a[1] <= y !== b[1] <= y)
          xs.push([
            a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]),
            b[1] > a[1] ? 1 : -1,
          ]);
      });
    }
    if (!xs.length) continue;
    xs.sort((p, q) => p[0] - q[0]);
    let [w, c, m] = [0, 0, 0];
    for (let k = 0; k < N; k++) {
      const x = at(k);
      while (m < xs.length && xs[m][0] < x)
        [w, c, m] = [w + xs[m][1], c + 1, m + 1];
      if (evenodd ? c % 2 : w) ink[j * N + k] = 1;
    }
  }
}

function strokeInto(ink: Uint8Array, polys: Poly[], width: number) {
  const r = width / 2;
  /** Mark samples in the box around a–b that `hit` says are inside. */
  const mark = (a: Pt, b: Pt, hit: (x: number, y: number) => boolean) => {
    const [k0, k1] = [
      Math.floor((Math.min(a[0], b[0]) - r - LO) / STEP),
      Math.ceil((Math.max(a[0], b[0]) + r - LO) / STEP),
    ];
    const [j0, j1] = [
      Math.floor((Math.min(a[1], b[1]) - r - LO) / STEP),
      Math.ceil((Math.max(a[1], b[1]) + r - LO) / STEP),
    ];
    for (let j = Math.max(0, j0); j < Math.min(N, j1); j++) {
      for (let k = Math.max(0, k0); k < Math.min(N, k1); k++)
        if (hit(at(k), at(j))) ink[j * N + k] = 1;
    }
  };
  for (const { pts, closed } of polys) {
    const n = closed ? pts.length : pts.length - 1;
    for (let s = 0; s < n; s++) {
      // Each segment with butt ends…
      const [a, b] = [pts[s], pts[(s + 1) % pts.length]];
      const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
      const l2 = dx * dx + dy * dy;
      if (!l2) continue;
      mark(a, b, (x, y) => {
        const t = ((x - a[0]) * dx + (y - a[1]) * dy) / l2;
        return (
          t >= 0 &&
          t <= 1 &&
          Math.abs((x - a[0]) * dy - (y - a[1]) * dx) / Math.sqrt(l2) <= r
        );
      });
      // …and a round join where it meets the next one.
      if (closed || s < n - 1)
        mark(b, b, (x, y) => Math.hypot(x - b[0], y - b[1]) <= r);
    }
  }
}

/** Frame-engine shapes, sampled. */
function cover(shapes: Shapes): Uint8Array {
  const ink = new Uint8Array(N * N);
  for (const a of Object.values(shapes)) {
    if (Number(a.opacity ?? 1) === 0) continue;
    const n = (k: string) => Number(a[k] ?? 0);
    const polys =
      a.tag === 'rect'
        ? flatten(roundedRect(n('x'), n('y'), n('width'), n('height'), n('rx')))
        : flatten(String(a.d ?? ''));
    if (a.fill === 'none') {
      if (a.stroke && !/^0[ ,]/.test(String(a.strokeDasharray ?? '')))
        strokeInto(ink, polys, Number(a.strokeWidth ?? 1));
    } else fillInto(ink, polys, a.fillRule === 'evenodd');
  }
  return ink;
}

/** A Carbon icon at a size, sampled in the 32-unit grid (moved by `shift`, in units). */
function coverCarbon(
  Icon: CarbonIcon,
  size: number,
  [dx, dy]: Pt = [0, 0]
): { ink: Uint8Array } {
  const { container, unmount } = render(<Icon size={size} />);
  const svg = container.querySelector('svg')!;
  const vb = Number(svg.getAttribute('viewBox')!.split(' ')[2]);
  const ink = new Uint8Array(N * N);
  svg.querySelectorAll('path').forEach((el) => {
    if (
      el.getAttribute('fill') === 'none' ||
      el.getAttribute('opacity') === '0'
    )
      return;
    const polys = flatten(el.getAttribute('d')!).map(({ pts, closed }) => ({
      pts: pts.map(([x, y]) => [(x * 32) / vb + dx, (y * 32) / vb + dy] as Pt),
      closed,
    }));
    fillInto(ink, polys, el.getAttribute('fill-rule') === 'evenodd');
  });
  unmount();
  return { ink };
}

/**
 * The parity story's Δ: each pixel's coverage from its 8×8 samples; the
 * share of ink pixels whose coverage differs by more than a quarter. `clip`
 * keeps to the 32-unit box (the story renders with overflow hidden).
 */
function delta(a: Uint8Array, b: Uint8Array, clip = false): number {
  const [S, P] = [SUB, N / SUB];
  const inBox = (q: number) =>
    !clip || (at(q * S) >= 0 && at(q * S + S - 1) <= 32);
  let [diff, ink] = [0, 0];
  for (let pj = 0; pj < P; pj++) {
    for (let pk = 0; pk < P; pk++) {
      if (!inBox(pj) || !inBox(pk)) continue;
      let [ca, cb] = [0, 0];
      for (let j = pj * S; j < pj * S + S; j++) {
        for (let k = pk * S; k < pk * S + S; k++)
          [ca, cb] = [ca + a[j * N + k], cb + b[j * N + k]];
      }
      if (ca || cb) ink++;
      if (Math.abs(ca - cb) > (S * S) / 4) diff++;
    }
  }
  return ink ? diff / ink : 0;
}

// ── The toggles ──────────────────────────────────────────────────────────────

type Geo = (h: number, size: number) => Shapes;
interface Case {
  name: string;
  toggle: FrameToggleIcon<string>;
  states: readonly [string, string];
  carbon: readonly [CarbonIcon, CarbonIcon];
  outline: Geo;
  filled?: Geo;
  /** Keys whose `d` is read straight from the hover icon at that end. */
  same: { off: string[]; on?: string[] };
  /** An on / off slash toggle (p draws the slash, e runs the kick: −1…1), not a fill toggle. */
  slash?: boolean;
  /** Where the p = 0 end sits relative to Carbon's icon (Send alt: moved to not-sent's place). */
  shift?: Pt;
}

/** Send alt's on state sits where not-sent draws its plane: 2px down-left. */
const SHIFT: Pt = [-2, 2];
const shifted = (shapes: Shapes): Shapes =>
  Object.fromEntries(
    Object.entries(shapes).map(([k, a]) => [
      k,
      { ...a, d: movePath(String(a.d), ...SHIFT) },
    ])
  );

/** A toggle typed loosely, so each case can render it with its own state names. */
const loose = <S extends string>(t: FrameToggleIcon<S>) =>
  t as unknown as FrameToggleIcon<string>;

const CASES: Case[] = [
  {
    name: 'BookmarkToggle',
    toggle: loose(BookmarkToggle),
    states: ['off', 'on'],
    carbon: [CBookmark, CBookmarkFilled],
    outline: (h) => Bookmark.geo({ h }),
    filled: (h) => BookmarkFilled.geo({ h }),
    same: { off: ['body'] },
  },
  {
    name: 'FlagToggle',
    toggle: loose(FlagToggle),
    states: ['off', 'on'],
    carbon: [CFlag, CFlagFilled],
    outline: (h) => Flag.geo({ h }),
    filled: (h) => FlagFilled.geo({ h }),
    same: { off: ['flag'] },
  },
  {
    name: 'PinToggle',
    toggle: loose(PinToggle),
    states: ['off', 'on'],
    carbon: [CPin, CPinFilled],
    outline: (h) => Pin.geo({ h }),
    filled: (h) => PinFilled.geo({ h }),
    same: { off: ['pin'] },
  },
  {
    name: 'FilterToggle',
    toggle: loose(FilterToggle),
    states: ['off', 'on'],
    carbon: [CFilter, CFilterFilled],
    outline: (h) => Filter.geo({ h }),
    same: { off: ['funnel'] },
  },
  {
    name: 'SendAltOffToggle',
    toggle: loose(SendAltOffToggle),
    states: ['on', 'off'],
    carbon: [CSendAlt, CNotSent],
    outline: (h) => shifted(SendAlt.geo({ h })),
    filled: (h) => NotSent.geo({ h }),
    same: { off: [] },
    slash: true,
    shift: SHIFT,
  },
  {
    name: 'SendAltOffToggle filled',
    toggle: loose(SendAltOffToggle.pick({ filled: true })),
    states: ['on', 'off'],
    carbon: [CSendAltFilled, CNotSentFilled],
    outline: (h) => shifted(SendAltFilled.geo({ h })),
    filled: (h) => NotSentFilled.geo({ h }),
    same: { off: [] },
    slash: true,
    shift: SHIFT,
  },
  {
    name: 'AddToggle',
    toggle: loose(AddToggle),
    states: ['outline', 'filled'],
    carbon: [CAddAlt, CAddFilled],
    outline: (h) => AddAlt.geo({ h }),
    filled: (h) => AddFilled.geo({ h }),
    same: { off: ['ring', 'sign'] },
  },
  {
    name: 'SubtractToggle',
    toggle: loose(SubtractToggle),
    states: ['outline', 'filled'],
    carbon: [CSubtractAlt, CSubtractFilled],
    outline: (h) => SubtractAlt.geo({ h }),
    same: { off: ['ring', 'sign'] },
  },
  {
    name: 'CloseToggle',
    toggle: loose(CloseToggle),
    states: ['outline', 'filled'],
    carbon: [CCloseOutline, CCloseFilled],
    outline: (h) => CloseOutline.geo({ h }),
    filled: (h) => CloseFilled.geo({ h }),
    same: { off: ['ring', 'sign'] },
  },
  {
    name: 'UnlockedToggle',
    toggle: loose(UnlockedToggle),
    states: ['off', 'on'],
    carbon: [CUnlocked, CUnlockedFilled],
    outline: (h) => LockedUnlockedOutlineToggle.geo({ h, p: 1, e: 0 }),
    filled: (h) => LockedUnlockedFilledToggle.geo({ h, p: 1, e: 0 }),
    same: { off: ['shackle', 'body'], on: ['shackle', 'body'] },
  },
  {
    name: 'RadioButtonToggle',
    toggle: loose(RadioButtonToggle),
    states: ['unchecked', 'checked'],
    carbon: [CRadioButton, CRadioButtonChecked],
    outline: (h) => CheckmarkOutlineToggle.geo({ h, p: 0, e: 0 }),
    same: { off: ['ring'] },
  },
];

const SIZES = [16, 20, 24, 32];
const STEPS = [0, 0.1, 0.25, 0.4, 0.5, 0.75, 0.9, 1];
const HS = [0, 0.5, 1];
const GATE = 0.005;
const frames = STEPS.flatMap((h) =>
  STEPS.flatMap((p) => [
    { h, p, e: 0 },
    { h, p: 1, e: p },
  ])
);
// Slash toggles also kick (e 0…1) and recoil (e −1…0) at any p.
const slashFrames = [
  ...frames,
  ...STEPS.flatMap((h) =>
    STEPS.flatMap((p) =>
      STEPS.flatMap((e) => [
        { h, p, e },
        { h, p, e: -e },
      ])
    )
  ),
];

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});

describe.each(CASES)(
  '$name',
  ({ toggle, states, carbon, outline, filled, same, slash, shift }) => {
    it('keeps the same shape keys at every frame and size, and never paints NaN or Infinity', () => {
      for (const size of SIZES) {
        const rest = Object.keys(toggle.geo({ h: 0, p: 0, e: 0 }, size)).sort();
        for (const fr of slash ? slashFrames : frames) {
          const shapes = toggle.geo(fr, size);
          expect(
            Object.keys(shapes).sort(),
            `${JSON.stringify(fr)} @${size}`
          ).toEqual(rest);
          for (const [k, attrs] of Object.entries(shapes)) {
            for (const [a, v] of Object.entries(attrs))
              expect(
                /NaN|Infinity|undefined/.test(String(v)),
                `${k}.${a} at ${JSON.stringify(fr)} @${size}`
              ).toBe(false);
          }
        }
      }
    });

    it('p = 0 end (outline / on) equals its hover icon at every h and size', () => {
      for (const size of SIZES) {
        grid(size);
        for (const h of HS) {
          const [t, o] = [
            toggle.geo({ h, p: 0, e: 0 }, size),
            outline(h, size),
          ];
          for (const k of same.off)
            expect(t[k].d, `${k} h=${h} @${size}`).toBe(o[k].d);
          expect(delta(cover(t), cover(o)), `h=${h} @${size}`).toBeLessThan(
            GATE
          );
        }
      }
    });

    it.runIf(!!filled)(
      'p = 1 end (filled / off) equals its hover icon at every h and size',
      () => {
        for (const size of SIZES) {
          grid(size);
          for (const h of HS) {
            const [t, o] = [
              toggle.geo({ h, p: 1, e: 0 }, size),
              filled!(h, size),
            ];
            for (const k of same.on ?? [])
              expect(t[k].d, `${k} h=${h} @${size}`).toBe(o[k].d);
            expect(delta(cover(t), cover(o)), `h=${h} @${size}`).toBeLessThan(
              GATE
            );
          }
        }
      }
    );

    it("rests on Carbon's static icons (both ends, each size, as the parity story measures)", () => {
      for (const size of SIZES) {
        grid(size);
        for (const [p, Icon] of [
          [0, carbon[0]],
          [1, carbon[1]],
        ] as const) {
          const { ink } = coverCarbon(Icon, size, p ? [0, 0] : shift);
          const d = delta(
            cover(toggle.geo({ h: 0, p, e: 0 }, size)),
            ink,
            true
          );
          // Under the gate, or no worse than the approved hover icon this end shares its art with.
          const ref = p ? filled : outline;
          const inherited = ref ? delta(cover(ref(0, size)), ink, true) : 0;
          expect(d, `p=${p} @${size} (hover icon: ${inherited})`).toBeLessThan(
            Math.max(GATE, inherited + 1e-9)
          );
        }
      }
    });

    it.runIf(!!shift)(
      'hovers inside the 32-unit frame from the shifted on state (and when off)',
      () => {
        for (const p of [0, 1]) {
          const pts = Object.values(toggle.geo({ h: 1, p, e: 0 })).flatMap(
            (a) => flatten(String(a.d ?? '')).flatMap((q) => q.pts)
          );
          const [xs, ys] = [pts.map(([x]) => x), pts.map(([, y]) => y)];
          expect(Math.min(...xs, ...ys), `p=${p}`).toBeGreaterThanOrEqual(0);
          expect(Math.max(...xs, ...ys), `p=${p}`).toBeLessThanOrEqual(32);
        }
      }
    );

    it.runIf(!slash)(
      'empties back to the outline: a full hole leaves the off end',
      () => {
        for (const size of SIZES) {
          grid(size);
          for (const h of HS)
            expect(
              delta(
                cover(toggle.geo({ h, p: 1, e: 1 }, size)),
                cover(toggle.geo({ h, p: 0, e: 0 }, size))
              )
            ).toBeLessThan(GATE);
        }
      }
    );

    it.each(states)(
      'renders with initial="%s", animated and static, and toggles on click',
      (initial) => {
        const [onToggle, Icon] = [vi.fn(), toggle];
        const { container } = render(
          <MotionIconProvider animated>
            <Icon initial={initial} onToggle={onToggle} aria-label="t" />
          </MotionIconProvider>
        );
        const svg = container.querySelector('svg')!;
        expect(svg.querySelector('mask, clipPath')).toBeNull();
        expect(svg.querySelectorAll('[data-k]').length).toBe(
          Object.keys(
            toggle.geo({ h: 0, p: initial === states[1] ? 1 : 0, e: 0 }, 32)
          ).length
        );
        fireEvent.click(svg);
        expect(onToggle).toHaveBeenCalledWith(
          initial === states[0] ? states[1] : states[0],
          initial === states[0]
        );
        const still = render(
          <Icon initial={initial} animated={false} aria-label="t" />
        );
        expect(still.container.querySelector('svg')).not.toBeNull();
      }
    );
  }
);

describe('circled signs: the filled end is the filled hover path exactly', () => {
  it.each([
    ['AddToggle', AddToggle, AddFilled],
    ['CloseToggle', CloseToggle, CloseFilled],
  ] as const)('%s', (_n, toggle, hover) => {
    for (const h of HS) {
      const t = toggle.geo({ h, p: 1, e: 0 });
      expect(t.fill.d).toBe(hover.geo({ h }).disc.d);
      expect(t.ring.opacity).toBe(0);
      expect(t.sign.d).toBe('');
    }
  });

  it("SubtractToggle draws subtract--filled's own disc (four cubics, handles 7.6/14 of r) at every h", () => {
    for (const h of HS) {
      const r = 14 + 2 * h;
      const c = (r * 7.6) / 14;
      const x = (v: number) => +v.toFixed(3);
      const disc = `M16 ${x(16 - r)}C${x(16 - c)} ${x(16 - r)} ${x(16 - r)} ${x(16 - c)} ${x(16 - r)} 16`;
      const t = SubtractToggle.geo({ h, p: 1, e: 0 });
      expect(String(t.fill.d).startsWith(disc)).toBe(true);
      expect(
        String(t.fill.d).endsWith(String(SubtractAlt.geo({ h }).sign.d))
      ).toBe(true);
    }
    grid(24);
    expect(
      delta(
        cover(SubtractFilled.geo({ h: 0 }, 24)),
        coverCarbon(CSubtractFilled, 24).ink,
        true
      )
    ).toBe(0);
  });
});

describe('new filled hover icons are the toggles at p = 1', () => {
  it.each([
    ['FilterFilled', FilterFilled, FilterToggle],
    ['SubtractFilled', SubtractFilled, SubtractToggle],
    ['UnlockedFilled', UnlockedFilled, UnlockedToggle],
    ['RadioButtonChecked', RadioButtonChecked, RadioButtonToggle],
  ] as const)('%s', (_n, hover, toggle) => {
    for (const size of SIZES) {
      for (const h of STEPS)
        expect(hover.geo({ h }, size)).toEqual(
          toggle.geo({ h, p: 1, e: 0 }, size)
        );
    }
    const Hover = hover;
    const { container } = render(
      <MotionIconProvider animated>
        <Hover aria-label="h" />
      </MotionIconProvider>
    );
    expect(container.querySelector('svg [data-k]')).not.toBeNull();
  });

  it('Filter filled: the wave is a knockout inside the fill', () => {
    // Mid-hover the wave crosses the funnel: filled, those samples are empty.
    grid(32);
    const [rest, mid] = [
      cover(FilterToggle.geo({ h: 0, p: 1, e: 0 })),
      cover(FilterToggle.geo({ h: 0.6, p: 1, e: 0 })),
    ];
    let holes = 0;
    for (let k = 0; k < rest.length; k++) holes += rest[k] && !mid[k] ? 1 : 0;
    expect(holes).toBeGreaterThan(100);
  });
});

describe('Send alt off toggles: back on under the pointer, the plane stays at rest', () => {
  it.each([
    ['SendAltOffToggle', SendAltOffToggle],
    ['SendAltOffToggle filled', SendAltOffToggle.pick({ filled: true })],
  ] as const)(
    '%s: with `send` held at 0, the hovered on state is the resting one',
    (_n, T) => {
      for (const p of [0, 0.3, 0.6]) {
        const held = T.geo({ h: 1, p, e: 0, send: 0 });
        const rest = T.geo({ h: 0, p, e: 0 });
        // Only the strike (it reaches further on h) and the Off shrink (h × p) may differ, never the plane's forward move.
        if (p === 0) expect(held).toEqual(rest);
        expect(held).not.toEqual(T.geo({ h: 1, p, e: 0 }));
      }
      expect(T.geo({ h: 1, p: 0, e: 0 })).toEqual(
        T.geo({ h: 1, p: 0, e: 0, send: 1 })
      );
    }
  );
});
