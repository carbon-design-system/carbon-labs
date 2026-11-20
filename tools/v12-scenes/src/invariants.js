/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The house motion rules as invariants: pure functions over a run's frame
// samples. Each takes the run and its options and returns its violations,
// `{ invariant, frame, detail }`, frame being the sample's index.
//
// A run is what the sampler records (src/sampler.js):
//   samples     one per animation frame: `{ t, dt, scroll: { x, y },
//               el: { [name]: box | null } }`, a box being `{ left, top,
//               right, bottom, width, height, opacity, transform, clip,
//               mask }` in CSS pixels, opacity the product of its own and
//               its ancestors'
//   marks       the actions, `{ name, frame, t, end? }`: the frame each
//               started on and, once it settled, the frame it ended on
//   longFrames  `{ start, duration }` from the browser, when it reports them
//   paint       compositor frames, for the checks of what was on screen:
//               `{ t, scrollY, band?, box?, ref? }`, each a pixel region
//               `{ width, height, data }` (RGBA)
//   dir         `ltr` or `rtl`, for the logical edges `start` and `end`
//   dpr         the device pixel ratio

/** Physical edges, and the logical ones resolved by the run's direction. */
const PHYSICAL = new Set(['left', 'right', 'top', 'bottom']);

/**
 * The physical edge for an edge name.
 *
 * @param {string} edge `left`, `right`, `top`, `bottom`, `start` or `end`.
 * @param {'ltr' | 'rtl'} dir The direction.
 * @returns {string} A physical edge.
 */
export function physicalEdge(edge, dir = 'ltr') {
  if (PHYSICAL.has(edge)) {
    return edge;
  }
  if (edge === 'start') {
    return dir === 'rtl' ? 'right' : 'left';
  }
  if (edge === 'end') {
    return dir === 'rtl' ? 'left' : 'right';
  }
  throw new Error(`invariants: no edge ${edge}`);
}

const horizontal = (edge) => edge === 'left' || edge === 'right';
const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

/** A box that is on screen: present, not hidden, not transparent. */
export function shown(box, minOpacity = 0.01) {
  return !!box && box.opacity > minOpacity && box.width > 0 && box.height > 0;
}

/**
 * The frames an action's own motion takes: from each named mark to its end.
 *
 * @param {{ name: string, frame: number, end?: number }[]} marks The marks.
 * @param {string[]} names The actions.
 * @param {number} last The last frame.
 * @returns {[number, number][]} Frame ranges, inclusive.
 */
export function windowsOf(marks = [], names = [], last = Infinity) {
  return marks
    .filter((m) => names.includes(m.name))
    .map((m) => [m.frame, m.end ?? last]);
}

const inWindows = (i, windows) => windows.some(([a, b]) => i >= a && i <= b);

/**
 * The distance between two edges stays constant: `b`'s edge less `a`'s,
 * along the reading direction for inline edges (so `end` to `start` is the
 * gap between a box and the one after it, in both directions).
 *
 * `gap: 'first'` takes the gap on the first frame checked. `atLeast` lets
 * the gap grow (a box that must stay clear of another). `rest` checks only
 * the frames at rest: each action's end, and the last.
 *
 * @param {object} run The run.
 * @param {{ a: string, aEdge: string, b: string, bEdge: string,
 *   gap: number | 'first', tol?: number, minSize?: number, from?: string,
 *   atLeast?: boolean, rest?: boolean }} o The two boxes and edges, the
 *   gap, its tolerance (px), the size below which a box does not count yet
 *   (px), a mark from which to check, and the variants above.
 * @returns {object[]} Violations.
 */
export function gapHolds(run, o) {
  const { a, b, tol = 1, minSize = 0 } = o;
  const dir = run.dir ?? 'ltr';
  const ea = physicalEdge(o.aEdge, dir);
  const eb = physicalEdge(o.bEdge, dir);
  const flip = horizontal(ea) && dir === 'rtl' ? -1 : 1;
  const from = o.from
    ? (run.marks?.find((m) => m.name === o.from)?.frame ?? 0)
    : 0;
  const rest = o.rest ? restFrames(run) : null;
  let gap = o.gap;
  const out = [];
  run.samples.forEach((s, i) => {
    if (i < from || (rest && !rest.has(i))) {
      return;
    }
    const A = s.el[a];
    const B = s.el[b];
    if (!shown(A) || !shown(B)) {
      return;
    }
    const size = horizontal(ea) ? 'width' : 'height';
    if (A[size] < minSize || B[size] < minSize) {
      return;
    }
    const d = flip * (B[eb] - A[ea]);
    if (gap === 'first') {
      gap = d;
    }
    const off = o.atLeast ? gap - d : Math.abs(d - gap);
    if (off > tol) {
      out.push({
        invariant: 'gapHolds',
        frame: i,
        detail: `${a}.${o.aEdge} to ${b}.${o.bEdge} is ${round(d)}px, not ${o.atLeast ? 'at least ' : ''}${round(gap)}px`,
      });
    }
  });
  return out;
}

/**
 * The frames at rest: each action's end, and the last.
 *
 * @param {object} run The run.
 * @returns {Set<number>} Frame indexes.
 */
export function restFrames(run) {
  const rests = new Set([run.samples.length - 1]);
  for (const m of run.marks ?? []) {
    if (m.end != null && m.settled !== false) {
      rests.add(m.end);
    }
  }
  return rests;
}

/**
 * No frame-to-frame jump bigger than the motion's own travel allows, and no
 * jump that comes straight back. A step is allowed up to `maxStep` per
 * 60 Hz frame (scaled by the frame's length), plus the scroll's own step
 * that frame when the box rides the scroll. `maxStep: 'auto'` takes it
 * from the motion itself: `factor` times the larger of the steps either
 * side (at least `floor`), so an eased glide passes, from its first frame,
 * and a skip in it does not. A jump and back within a frame of an action's
 * mark is the turn that action asked for, and passes.
 *
 * @param {object} run The run.
 * @param {{ el: string, edge: string, maxStep: number | 'auto',
 *   factor?: number, floor?: number, withScroll?: boolean, back?: number }} o
 *   The box and edge, the allowed step (px), whether the scroll's step is
 *   allowed too, and the size of a jump that counts when it comes back (px).
 * @returns {object[]} Violations.
 */
export function continuous(run, o) {
  const { el, withScroll = false, back = 2, factor = 2.5, floor = 4 } = o;
  const edge = physicalEdge(o.edge, run.dir ?? 'ltr');
  const out = [];
  const s = run.samples;
  const value = (i) => (shown(s[i]?.el[el]) ? s[i].el[el][edge] : null);
  const stepAt = (i) => {
    const v0 = value(i - 1);
    const v1 = value(i);
    return v0 == null || v1 == null ? 0 : Math.abs(v1 - v0);
  };
  for (let i = 1; i < s.length; i++) {
    const v0 = value(i - 1);
    const v1 = value(i);
    if (v0 == null || v1 == null) {
      continue;
    }
    const step = v1 - v0;
    const frames = Math.max(1, (s[i].dt ?? 16.7) / 16.7);
    const scrolled = withScroll
      ? Math.hypot(
          s[i].scroll.x - s[i - 1].scroll.x,
          s[i].scroll.y - s[i - 1].scroll.y
        )
      : 0;
    const per =
      o.maxStep === 'auto'
        ? Math.max(floor, factor * Math.max(stepAt(i - 1), stepAt(i + 1)))
        : o.maxStep;
    const allowed = per * frames + scrolled + 0.5;
    if (Math.abs(step) > allowed) {
      out.push({
        invariant: 'continuous',
        frame: i,
        detail: `${el}.${o.edge} moved ${round(step)}px in one frame (allowed ${round(allowed)})`,
      });
    }
    // A turn the run asked for reverses on purpose: not a jump back.
    const turned = (run.marks ?? []).some((m) => Math.abs(m.frame - i) <= 1);
    const v2 = value(i + 1);
    if (
      !turned &&
      v2 != null &&
      Math.abs(step) > back &&
      Math.abs(v2 - v1) > back &&
      Math.sign(v2 - v1) === -Math.sign(step) &&
      Math.abs(v2 - v0) < Math.min(Math.abs(step), Math.abs(v2 - v1)) / 2
    ) {
      out.push({
        invariant: 'continuous',
        frame: i,
        detail: `${el}.${o.edge} jumped ${round(step)}px and back`,
      });
    }
  }
  return out;
}

/**
 * The share of a region's pixels that differ from its commonest color.
 *
 * @param {{ width: number, height: number, data: Uint8Array | number[] }} region RGBA.
 * @param {number} tol The largest channel difference that still matches.
 * @returns {number} 0 to 1.
 */
export function outlierShare(region, tol = 24) {
  const { data } = region;
  const n = data.length / 4;
  if (!n) {
    return 0;
  }
  const counts = new Map();
  for (let p = 0; p < data.length; p += 4) {
    // Bucketed, so a gradient's neighbors count as one color.
    const key =
      ((data[p] >> 3) << 10) | ((data[p + 1] >> 3) << 5) | (data[p + 2] >> 3);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let mode = 0;
  let best = -1;
  for (const [k, c] of counts) {
    if (c > best) {
      best = c;
      mode = k;
    }
  }
  const mr = ((mode >> 10) & 31) * 8 + 4;
  const mg = ((mode >> 5) & 31) * 8 + 4;
  const mb = (mode & 31) * 8 + 4;
  let off = 0;
  for (let p = 0; p < data.length; p += 4) {
    if (
      Math.abs(data[p] - mr) > tol ||
      Math.abs(data[p + 1] - mg) > tol ||
      Math.abs(data[p + 2] - mb) > tol
    ) {
      off++;
    }
  }
  return off / n;
}

/**
 * How many of a region's rows match a reference's: the box's height as
 * painted, when the reference is the box at rest.
 *
 * @param {{ width: number, height: number, data: ArrayLike<number> }} region RGBA.
 * @param {{ width: number, height: number, data: ArrayLike<number> }} ref The same size.
 * @param {number} tol The mean channel difference a matching row stays under.
 * @returns {number} Rows.
 */
export function matchingRows(region, ref, tol = 12) {
  const w = Math.min(region.width, ref.width);
  const h = Math.min(region.height, ref.height);
  let rows = 0;
  for (let y = 0; y < h; y++) {
    let sum = 0;
    for (let x = 0; x < w; x++) {
      const p = (y * region.width + x) * 4;
      const q = (y * ref.width + x) * 4;
      sum +=
        Math.abs(region.data[p] - ref.data[q]) +
        Math.abs(region.data[p + 1] - ref.data[q + 1]) +
        Math.abs(region.data[p + 2] - ref.data[q + 2]);
    }
    if (sum / (w * 3) <= tol) {
      rows++;
    }
  }
  return rows;
}

/**
 * Nothing shows above a docked element: in each compositor frame, the band
 * between the docked element and its container's top (`paint[i].band`)
 * holds one color, with at most `maxShare` of its pixels off it.
 *
 * @param {object} run The run, with `paint`.
 * @param {{ docked: string, maxShare?: number, tol?: number }} o The docked
 *   element's name (for the report), and the share of pixels allowed off.
 * @returns {object[]} Violations, by compositor frame.
 */
export function nothingAbove(run, o) {
  const { maxShare = 0.02, tol = 24 } = o;
  const out = [];
  (run.paint ?? []).forEach((f, i) => {
    if (!f.band || !f.band.height || !f.band.width) {
      return;
    }
    const share = outlierShare(f.band, tol);
    if (share > maxShare) {
      out.push({
        invariant: 'nothingAbove',
        frame: i,
        paint: true,
        detail: `${round(share * 100, 1)}% of the band above ${o.docked} is content (scroll ${f.scrollY})`,
      });
    }
  });
  return out;
}

/**
 * An element that should be whole never drops below a share of its rest
 * size, except during its own enter or exit (`except`: the actions that
 * are). Its rest size is its size on the last frame, or `rest`. With
 * `painted`, the size is what the compositor showed: the rows of
 * `paint[i].box` that match `paint[i].ref`.
 *
 * @param {object} run The run.
 * @param {{ el: string, minShare?: number, axis?: 'width' | 'height',
 *   except?: string[], rest?: number, painted?: boolean, tol?: number }} o
 * @returns {object[]} Violations.
 */
export function notCollapsed(run, o) {
  const { el, minShare = 0.9, axis = 'height', except = [] } = o;
  const out = [];
  if (o.painted) {
    (run.paint ?? []).forEach((f, i) => {
      if (!f.box || !f.ref) {
        return;
      }
      const rows = matchingRows(f.box, f.ref, o.tol ?? 12);
      if (rows < minShare * f.ref.height) {
        out.push({
          invariant: 'notCollapsed',
          frame: i,
          paint: true,
          detail: `${el} showed ${rows} of its ${f.ref.height} rows (scroll ${f.scrollY})`,
        });
      }
    });
    return out;
  }
  const s = run.samples;
  const windows = windowsOf(run.marks, except, s.length - 1);
  const lastBox = [...s].reverse().find((x) => shown(x.el[el]))?.el[el];
  const rest = o.rest ?? lastBox?.[axis];
  if (!rest) {
    return out;
  }
  s.forEach((x, i) => {
    const box = x.el[el];
    if (!box || inWindows(i, windows)) {
      return;
    }
    if (!shown(box) || box[axis] < minShare * rest) {
      out.push({
        invariant: 'notCollapsed',
        frame: i,
        detail: `${el} ${axis} ${round(shown(box) ? box[axis] : 0)}px of its ${round(rest)}px rest${shown(box) ? '' : ' (not shown)'}`,
      });
    }
  });
  return out;
}

/**
 * The frame a value last changed on, after a frame.
 *
 * @param {object[]} samples The samples.
 * @param {(s: object) => number | null} value The value.
 * @param {number} from The first frame.
 * @param {number} eps The change that counts.
 * @returns {number | null} The frame, or null when it never changed.
 */
export function settleFrame(samples, value, from = 0, eps = 0.5) {
  let last = null;
  for (let i = from + 1; i < samples.length; i++) {
    const a = value(samples[i - 1]);
    const b = value(samples[i]);
    if (a == null && b == null) {
      continue;
    }
    if (a == null || b == null || Math.abs(b - a) > eps) {
      last = i;
    }
  }
  return last;
}

/**
 * Two motions settle within a frame of each other: the last change of
 * `a`'s edge and of `b`'s, after the mark `from`.
 *
 * @param {object} run The run.
 * @param {{ a: string, aEdge: string, b: string, bEdge: string,
 *   tol?: number, from?: string }} o The boxes and edges, and the frames
 *   allowed between their settling.
 * @returns {object[]} Violations.
 */
export function arriveTogether(run, o) {
  const { a, b, tol = 1 } = o;
  const dir = run.dir ?? 'ltr';
  const from = o.from
    ? (run.marks?.find((m) => m.name === o.from)?.frame ?? 0)
    : 0;
  const edgeOf = (name, edge) => (s) => {
    const box = s.el[name];
    return shown(box) ? box[physicalEdge(edge, dir)] : null;
  };
  const fa = settleFrame(run.samples, edgeOf(a, o.aEdge), from);
  const fb = settleFrame(run.samples, edgeOf(b, o.bEdge), from);
  if (fa == null || fb == null || Math.abs(fa - fb) <= tol) {
    return [];
  }
  const t = (f) => round(run.samples[f].t - run.samples[from].t, 0);
  return [
    {
      invariant: 'arriveTogether',
      frame: Math.max(fa, fb),
      detail: `${a} settled at ${t(fa)}ms, ${b} at ${t(fb)}ms (${Math.abs(fa - fb)} frames apart)`,
    },
  ];
}

/**
 * A box stays within its container (on the given sides).
 *
 * @param {object} run The run.
 * @param {{ el: string, container: string, tol?: number,
 *   sides?: string[], until?: string }} o The box, its container, the
 *   tolerance (px), the sides to check (default all four; logical names
 *   allowed), and a mark to stop at.
 * @returns {object[]} Violations.
 */
export function staysInside(run, o) {
  const { el, container, tol = 0.5 } = o;
  const dir = run.dir ?? 'ltr';
  const sides = (o.sides ?? ['left', 'right', 'top', 'bottom']).map((e) =>
    physicalEdge(e, dir)
  );
  const until = o.until
    ? (run.marks?.find((m) => m.name === o.until)?.frame ?? Infinity)
    : Infinity;
  const out = [];
  run.samples.forEach((s, i) => {
    if (i >= until) {
      return;
    }
    const box = s.el[el];
    const c = s.el[container];
    if (!shown(box) || !c) {
      return;
    }
    const over = [];
    for (const side of sides) {
      const d =
        side === 'left' || side === 'top'
          ? c[side] - box[side]
          : box[side] - c[side];
      if (d > tol) {
        over.push(`${side} by ${round(d)}px`);
      }
    }
    if (over.length) {
      out.push({
        invariant: 'staysInside',
        frame: i,
        detail: `${el} outside ${container}: ${over.join(', ')}`,
      });
    }
  });
  return out;
}

/**
 * At rest, every edge sits on a whole device pixel. Rest is the last frame,
 * and the frame each action ended on.
 *
 * @param {object} run The run.
 * @param {{ el: string, tol?: number, edges?: string[] }} o The box, the
 *   tolerance in device pixels (a tenth by default: less does not show),
 *   and the edges to check (default all; logical names allowed).
 * @returns {object[]} Violations.
 */
export function wholePixels(run, o) {
  const { el, tol = 0.1 } = o;
  const dir = run.dir ?? 'ltr';
  const edges = (o.edges ?? ['left', 'top', 'right', 'bottom']).map((e) =>
    physicalEdge(e, dir)
  );
  const dpr = run.dpr ?? 1;
  const s = run.samples;
  const rests = restFrames(run);
  const out = [];
  for (const i of [...rests].sort((x, y) => x - y)) {
    const box = s[i]?.el[el];
    if (!shown(box)) {
      continue;
    }
    const off = edges.filter((e) => {
      const d = box[e] * dpr;
      return Math.abs(d - Math.round(d)) > tol;
    });
    if (off.length) {
      out.push({
        invariant: 'wholePixels',
        frame: i,
        detail: `${el} at rest off the ${dpr}x grid: ${off
          .map((e) => `${e} ${round(box[e], 3)}`)
          .join(', ')}`,
      });
    }
  }
  return out;
}

/**
 * No long frames: none the browser reports over `maxMs`, and, where it
 * reports none, no gap between frames over it.
 *
 * @param {object} run The run.
 * @param {{ maxMs?: number }} o The longest frame allowed.
 * @returns {object[]} Violations.
 */
export function noLongFrames(run, o = {}) {
  const { maxMs = 50 } = o;
  const s = run.samples;
  const out = [];
  if (run.longFrames) {
    for (const f of run.longFrames) {
      if (f.duration > maxMs) {
        const i = s.findIndex((x) => x.at >= f.start);
        out.push({
          invariant: 'noLongFrames',
          frame: i < 0 ? s.length - 1 : i,
          detail: `a ${round(f.duration, 0)}ms frame${f.blocking != null ? ` (${round(f.blocking, 0)}ms blocking)` : ''}`,
        });
      }
    }
    return out;
  }
  s.forEach((x, i) => {
    if (i && x.dt > maxMs) {
      out.push({
        invariant: 'noLongFrames',
        frame: i,
        detail: `${round(x.dt, 0)}ms between frames`,
      });
    }
  });
  return out;
}

const GEOMETRY = ['left', 'top', 'width', 'height'];
/** The reduced clock: the share of the full clock a reduced change may take. */
export const REDUCED_CLOCK = 0.5;
/** The reduced clock when the full run's is not known, ms. */
const DEFAULT_REDUCED_MS = 250;

/**
 * Under reduced motion each action's change lands at once, or fades with no
 * change of place or size, and ends within the reduced clock. For each
 * mark, up to the next: a change of place or size may take one step (two
 * frames, for a render and its layout), and every change of the box ends
 * within the reduced clock (plus two frames) of the mark. The reduced
 * clock is `clockMs`, or half the same action's clock in the full-motion
 * run (`run.fullClocks`), or 250ms when that is not known.
 *
 * @param {object} run The run.
 * @param {{ el: string, clockMs?: number, eps?: number,
 *   actions?: string[] }} o The box, the reduced clock, the change that
 *   counts (px), and the actions to check (default all).
 * @returns {object[]} Violations.
 */
export function reducedPath(run, o) {
  const { el, eps = 0.5 } = o;
  const s = run.samples;
  const out = [];
  const all = run.marks ?? [];
  all.forEach((m, k) => {
    if (o.actions && !o.actions.includes(m.name)) {
      return;
    }
    const next = all[k + 1]?.frame ?? s.length;
    const full = run.fullClocks?.[m.name];
    // A full clock under two frames is a change the full run did not show
    // on this box: the default holds.
    const clockMs =
      o.clockMs ??
      (full != null && full > 34 ? full * REDUCED_CLOCK : DEFAULT_REDUCED_MS);
    let moved = 0;
    let lastChange = null;
    for (let i = m.frame + 1; i < next; i++) {
      const a = s[i - 1].el[el];
      const b = s[i].el[el];
      if (!a && !b) {
        continue;
      }
      const geo = !a || !b || GEOMETRY.some((g) => Math.abs(b[g] - a[g]) > eps);
      const fade = a && b && Math.abs(b.opacity - a.opacity) > 0.005;
      if (geo && a && b && shown(a) && shown(b)) {
        moved++;
      }
      if (geo || fade) {
        lastChange = i;
      }
    }
    if (moved > 2) {
      out.push({
        invariant: 'reducedPath',
        frame: m.frame,
        detail: `${el} moved or resized over ${moved} frames after ${m.name}, not at once`,
      });
    }
    if (lastChange != null) {
      const took = s[lastChange].t - s[m.frame].t;
      const frame = Math.max(...s.slice(1).map((x) => x.dt ?? 16.7), 16.7);
      if (took > clockMs + 2 * Math.min(frame, 34)) {
        out.push({
          invariant: 'reducedPath',
          frame: lastChange,
          detail: `${el} still changing ${round(took, 0)}ms after ${m.name} (reduced clock ${round(clockMs, 0)}ms)`,
        });
      }
    }
  });
  return out;
}

/**
 * A box holds still through some actions: no change of place, size or
 * opacity from each one's mark to the next (a theme switch, a scroll it
 * does not ride).
 *
 * @param {object} run The run.
 * @param {{ el: string, during: string[], eps?: number }} o The box, the
 *   actions, and the change that counts (px).
 * @returns {object[]} Violations.
 */
export function still(run, o) {
  const { el, eps = 0.5 } = o;
  const s = run.samples;
  const all = run.marks ?? [];
  const out = [];
  all.forEach((m, k) => {
    if (!o.during.includes(m.name)) {
      return;
    }
    const next = all[k + 1]?.frame ?? s.length;
    for (let i = m.frame + 1; i < next; i++) {
      const a = s[i - 1].el[el];
      const b = s[i].el[el];
      if (!a && !b) {
        continue;
      }
      const moved =
        !a || !b || GEOMETRY.some((g) => Math.abs(b[g] - a[g]) > eps);
      const faded = a && b && Math.abs(b.opacity - a.opacity) > 0.005;
      const clipped = a && b && (a.clip ?? '') !== (b.clip ?? '');
      if (moved || faded || clipped) {
        out.push({
          invariant: 'still',
          frame: i,
          detail: `${el} ${moved ? 'moved' : faded ? `faded to ${b.opacity}` : 'changed its clip'} during ${m.name}`,
        });
        break;
      }
    }
  });
  return out;
}

/** Every invariant, by name, for the scenarios. */
export const INVARIANTS = {
  gapHolds,
  continuous,
  nothingAbove,
  notCollapsed,
  arriveTogether,
  staysInside,
  wholePixels,
  noLongFrames,
  reducedPath,
  still,
};

/**
 * Runs a scenario's checks over a run. Any check's options can bound it to
 * part of the run with `from` and `until` (action names). A check whose
 * options carry `known` (the behavior, in words) marks its violations
 * known.
 *
 * @param {object} run The run.
 * @param {[string, object][]} checks Invariant names and their options.
 * @returns {object[]} Every violation.
 */
export function check(run, checks) {
  const out = [];
  for (const [name, opts] of checks) {
    const fn = INVARIANTS[name];
    if (!fn) {
      throw new Error(`invariants: no invariant ${name}`);
    }
    // `from` and `until` (marks) bound any check to part of the run.
    const markAt = (name, fallback) =>
      name
        ? (run.marks?.find((m) => m.name === name)?.frame ?? fallback)
        : fallback;
    const lo = markAt(opts?.from, 0);
    const hi = markAt(opts?.until, Infinity);
    const found = fn(run, opts ?? {}).filter(
      (v) => v.paint || v.frame < 0 || (v.frame >= lo && v.frame < hi)
    );
    // A check for a behavior the lane does not have yet: its violations
    // are marked, so the run reports them as known.
    if (opts?.known) {
      for (const v of found) {
        v.known = opts.known;
      }
    }
    out.push(...found);
  }
  return out;
}
