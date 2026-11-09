/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The status cut's growth, measured (statusGrow.test.ts here, and the React
 * and web-component packages' own, on their DOM): the ink a cut changes
 * against the base it cuts, frame by frame, and the checks on it.
 *  - in: from 0, its first frame at most CUT_START of the final cut and
 *    IN_SLACK more, monotonic, and after that no frame taking more than
 *    STEP_MAX of it;
 *  - out: the mirror: monotonic back to 0, its last frame before 0 at most
 *    CUT_START and OUT_SLACK more, no frame before that giving back more
 *    than STEP_MAX;
 *  - status → status: no frame changing more than STEP_MAX of the larger cut.
 * The floors (the cut opens over fast-01, five frames at 60fps at 80ms,
 * and closes over the same): an entrance's first
 * frame shows up to about 7% (the opening's ease starts it at 3%; the
 * sampling and the box's first bite add the rest), an exit's last frame up to
 * about 21% (the exit starts halfway through the mark's, so its frames fall
 * later in it; a count's pill and pip on the exit curve).
 * KNOWN_GROWTH lists the transitions that step further, each with the most it
 * may. The status checkmarks (offset mode) are most of them: their base
 * settles into Carbon's drawing as the cut opens (it shrinks to Carbon's
 * status art), so their change isn't the cut's alone: a dash or a ring's
 * stretch goes in a frame, and the change can dip (px², `back`) as the base
 * shrinks away from the cut.
 */
import type { Shapes } from '../src/engine';
import { CUT_START, inkOf } from '../src/status';

/** After the start, the most of the cut one frame may take. */
export const STEP_MAX = 0.44;
/** How much more than CUT_START an entrance's first frame may show, and an exit's last frame before 0. */
export const IN_SLACK = 0.15;
export const OUT_SLACK = 0.22;

type Ring = [number, number][];
type Part = {
  rings: Ring[];
  evenodd: boolean;
  box: [number, number, number, number];
};
function parts(s: Shapes): Part[] {
  const out: Part[] = [];
  for (const [k, a] of Object.entries(s)) {
    if (k.startsWith('status-') || a.opacity === 0 || a.opacity === '0') {
      continue;
    }
    const got = inkOf(a);
    if (typeof got === 'string') {
      continue;
    }
    const rings = got.rings.filter((r) => r.length > 2) as Ring[];
    if (!rings.length) {
      continue;
    }
    const all = rings.flat();
    const box: Part['box'] = [
      Math.min(...all.map((q) => q[0])),
      Math.min(...all.map((q) => q[1])),
      Math.max(...all.map((q) => q[0])),
      Math.max(...all.map((q) => q[1])),
    ];
    out.push({ rings, evenodd: got.evenodd, box });
  }
  return out;
}
function inside(x: number, y: number, part: Part): boolean {
  if (
    x < part.box[0] ||
    x > part.box[2] ||
    y < part.box[1] ||
    y > part.box[3]
  ) {
    return false;
  }
  let wind = 0;
  let cross = 0;
  for (const ring of part.rings) {
    for (let i = 0; i < ring.length; i++) {
      const [a, b] = [ring[i], ring[(i + 1) % ring.length]];
      if (a[1] <= y !== b[1] <= y) {
        const xi = a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]);
        if (xi > x) {
          cross++;
          wind += b[1] > a[1] ? 1 : -1;
        }
      }
    }
  }
  return part.evenodd ? cross % 2 === 1 : wind !== 0;
}
/**
 * The ink a cut changes: the area where the cut drawing and the base differ,
 * the status mark aside, by sampling the 36×36 box at 3 points a pixel each
 * way (px²). Taken away or (a fix's own wall end) added, it all has to grow.
 */
const STEP = 1 / 3;
export function changed(a: Shapes, b: Shapes): number {
  const [pa, pb] = [parts(a), parts(b)];
  let n = 0;
  for (let y = -2 + STEP / 2; y < 34; y += STEP) {
    for (let x = -2 + STEP / 2; x < 34; x += STEP) {
      if (pa.some((p) => inside(x, y, p)) !== pb.some((p) => inside(x, y, p))) {
        n++;
      }
    }
  }
  return n * STEP * STEP;
}

/** A rendered icon's drawing (its keyed elements) as shapes. */
export function domShapes(root: ParentNode): Shapes {
  const out: Shapes = {};
  for (const el of root.querySelectorAll('svg [data-k]')) {
    const attrs: Record<string, string | number> = {
      tag: el.tagName.toLowerCase(),
    };
    for (const { name, value } of [...el.attributes]) {
      if (name !== 'data-k') {
        attrs[name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] =
          value;
      }
    }
    if (attrs.opacity !== undefined) {
      attrs.opacity = Number(attrs.opacity);
    }
    out[el.getAttribute('data-k')!] = attrs as Shapes[string];
  }
  return out;
}

export type Growth = { first: number; step: number; back: number };
/**
 * How a cut grows in (from 0) or out (to 0, read backwards): its first frame
 * (out: its last before 0) and its largest step after that, as shares of the
 * full cut, and its largest step back (px²).
 */
export function measure(
  xs: number[],
  dir: 'in' | 'out' | 'swap'
): Growth & { full: number; start: number } {
  const s = dir === 'out' ? [...xs].reverse() : xs;
  const full = Math.max(...s);
  const k = s.findIndex((x) => x > 0.3);
  let [step, back] = [0, 0];
  for (let i = 1; i < s.length; i++) {
    const d = s[i] - s[i - 1];
    if (dir !== 'swap' && i <= k) {
      continue;
    } // the start
    step = Math.max(
      step,
      (dir === 'swap' ? Math.abs(d) : d) / Math.max(full, 1e-9)
    );
    back = Math.min(back, d);
  }
  return {
    full,
    start: s[0],
    first: dir === 'swap' || k < 0 ? 0 : s[k] / Math.max(full, 1e-9),
    step,
    back: dir === 'swap' ? 0 : back,
  };
}

const fmt = (xs: number[]) => xs.map((x) => x.toFixed(1)).join(' ');
/** What's wrong with a cut's growth (nothing: []), against the defaults or its KNOWN_GROWTH entry. */
/**
 * The limits a binding's DOM is held to (React, the web components): their
 * frames fall where their own clock puts them against the transition, and a
 * four-frame transition sampled a fraction of a frame later shows its first
 * frame later in the growth and can take a bigger step (the core's series
 * starts on the frame the change is set). The worst phase measured: a first
 * frame of 28% (Send; a hand-off's 39%), an exit's last of 36% (49% on the exit curve: the
 * pip at 16 in the web components, which holds its first frame and then goes in three), a step of 62%;
 * and a hand-off's tail, drawn by the binding a frame apart from its twin, can give back up to 0.7px² as
 * it lands.
 */
export const DOM_LIMITS: Limits = {
  stepMax: 0.65,
  inSlack: 0.45,
  outSlack: 0.5,
  back: -1,
};
type Limits = {
  stepMax: number;
  inSlack: number;
  outSlack: number;
  back?: number;
};
/**
 * A hand-off measured against a twin on the DOM: the frame a binding takes the
 * action's tail over on can draw it a fraction of a frame off the twin's clock
 * (a one-frame spike in the difference that isn't the cut). That one frame,
 * if there is one, left out.
 */
export function withoutTakeover(xs: number[]): number[] {
  const i = xs.findIndex(
    (x, k) =>
      k > 0 && k + 1 < xs.length && x > xs[k - 1] + 2 && x > xs[k + 1] + 2
  );
  return i < 0 ? xs : [...xs.slice(0, i), ...xs.slice(i + 1)];
}
export function growthProblems(
  xs: number[],
  dir: 'in' | 'out' | 'swap',
  what: string,
  limits: Limits = { stepMax: STEP_MAX, inSlack: IN_SLACK, outSlack: OUT_SLACK }
): string[] {
  const m = measure(xs, dir);
  if (m.full < 0.5) {
    return [];
  } // a status that cuts (next to) nothing at this size
  const known =
    KNOWN_GROWTH[what] ??
    KNOWN_GROWTH[what.replace(/ @\d+$/, '')] ??
    KNOWN_GROWTH[what.split(' ')[0]];
  const out: string[] = [];
  if (dir !== 'swap' && m.start >= 0.3) {
    out.push(`${what}: starts at ${m.start.toFixed(2)} [${fmt(xs)}]`);
  }
  // The start: CUT_START of the cut, and up to the slack more (or the most its KNOWN_GROWTH entry gives).
  if (
    dir !== 'swap' &&
    m.first >
      Math.max(
        CUT_START + (dir === 'in' ? limits.inSlack : limits.outSlack),
        known?.first ?? 0
      ) +
        0.3 / m.full
  ) {
    out.push(
      `${what}: starts at ${(m.first * 100).toFixed(0)}% of ${m.full.toFixed(1)} [${fmt(xs)}]`
    );
  }
  if (m.step > Math.max(limits.stepMax, known?.step ?? 0) + 0.3 / m.full) {
    out.push(
      `${what}: a frame takes ${(m.step * 100).toFixed(0)}% [${fmt(xs)}]`
    );
  }
  if (m.back <= Math.min(limits.back ?? -0.5, known?.back ?? 0)) {
    out.push(`${what}: steps back ${m.back.toFixed(1)} [${fmt(xs)}]`);
  }
  return out;
}

/**
 * Transitions (at every size, or a whole icon, by its name) that start or
 * step further (see above), with the most their start (of the full cut) and
 * their largest step may take. Survey: GROW_SURVEY=1 on statusGrow.test.ts
 * prints the entries.
 */
export const KNOWN_GROWTH: Record<string, Partial<Growth>> = {
  // The status checkmarks (offset mode): their base settles into Carbon's drawing as the cut opens (it shrinks to
  // Carbon's status art), so their change isn't the cut's alone: a ring's stretch goes in one of the four frames.
  CheckmarkFilled: { first: 0.25, step: 0.6, back: -9 },
  InProgress: { first: 0.2, step: 0.6, back: -5 },
  CheckmarkOutline: { back: -3 },
  Incomplete: { back: -5 },
  // A wall's stretch goes in one of the four frames (the box's front reaching a wall along it).
  'CloudUpload warning→error': { step: 0.52 },
  'DocumentExport none→success': { step: 0.53 },
  'DocumentExport none→warning': { step: 0.48 },
  'DocumentImport none→success': { step: 0.5 },
  'Send none→success': { step: 0.56 },
  'Send none→warning': { step: 0.5 },
  'Send success→none': { step: 0.53 },
  'Share none→success': { step: 0.49 },
  'Share none→warning': { step: 0.49 },
  // Share's hand-off: the same wall (a frame takes 47% of 53.7). With the gap opening from the lower node's end
  // nothing steps back. Its first frame shows 22% (23% handing off to a warning).
  'Share hand-off': { first: 0.23, step: 0.49 },
  'Share hand-off to warning': { first: 0.24, step: 0.49 },
  // Printer's hand-off: a frame takes 46% of 52.4.
  'Printer hand-off': { step: 0.47 },
};
