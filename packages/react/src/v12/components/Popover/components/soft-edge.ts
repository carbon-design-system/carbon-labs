/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { snapAnimations, softEdgeToken } from '@carbon-labs/v12-motion';

/* ============================================================================
 * The popover's soft edge: on EVERY side where the container clips its
 * content.
 * ============================================================================
 *
 * The snap's own soft edge (motion-core) fades only the clip's moving edges.
 * A popover's content also slides on y as it opens (carried by the opening),
 * so it passes under the edge that holds still, the one facing the trigger,
 * and would be cut there by a hard line. Here each side gets the disclosure's
 * formula, `min(16px, h, H − h)`, read per side:
 *
 *   16px    the soft-edge token (`--cds-motion-soft-edge`, so the snap lab's
 *           tuning reaches it)
 *   h       the clip's open extent on that axis (its height for top and
 *           bottom, its width for left and right)
 *   H − h   how far the content reaches past the clip on that side: the
 *           clip's inset there, plus or minus the content's own translate
 *
 * So an edge grows over the first 16px the content is clipped by and closes
 * over the last, and there is no mask at rest. The frame stays crisp: only
 * the content is masked.
 *
 * Played per animation frame while the surface's snap runs, from its live
 * geometry (the frame's insets and the content's translate, read as they
 * are drawn on that frame), so the mask is on the clip on every frame in and
 * out, and on a turn round. Reduced motion has no snap, so no mask.
 * ========================================================================== */

/** The edge for one side: `min(token, extent, overhang)`, never below 0. */
export function softEdgeFor(
  token: number,
  extent: number,
  overhang: number
): number {
  return Math.max(0, Math.min(token, extent, overhang));
}

/** Side by side (top, right, bottom, left): each side's soft edge, px, for a clip and the content's box, in the surface's px. */
export function softEdges(
  token: number,
  clip: { t: number; r: number; b: number; l: number },
  content: { t: number; r: number; b: number; l: number }
): [number, number, number, number] {
  const h = Math.max(0, clip.b - clip.t);
  const w = Math.max(0, clip.r - clip.l);
  return [
    softEdgeFor(token, h, clip.t - content.t),
    softEdgeFor(token, w, content.r - clip.r),
    softEdgeFor(token, h, content.b - clip.b),
    softEdgeFor(token, w, clip.l - content.l),
  ];
}

const px = (n: number) => `${Math.round(n * 100) / 100}px`;
const stops = (a: number, b: number) =>
  `transparent 0px, #000 ${px(a)}, #000 calc(100% - ${px(b)}), transparent 100%`;

/** The mask off: the content as it is at rest. */
function clear(content: HTMLElement) {
  const s = content.style;
  for (const p of [
    'mask-image',
    'mask-position',
    'mask-size',
    'mask-repeat',
    'mask-composite',
  ]) {
    s.removeProperty(p);
  }
}

/**
 * The clip's insets (top, right, bottom, left) from a computed `clip-path`
 * (`inset(t r b l round …)`, one to four lengths); null if it isn't one.
 */
export function insetsOf(
  clipPath: string
): [number, number, number, number] | null {
  const m = /^inset\(([^)]*?)(?:\s+round\b[^)]*)?\)$/.exec(clipPath.trim());
  if (!m) {
    return null;
  }
  const v = m[1]!
    .trim()
    .split(/\s+/)
    .map((x) => parseFloat(x));
  if (!v.length || v.length > 4 || v.some((x) => !Number.isFinite(x))) {
    return null;
  }
  const [t, r = t, b = t, l = r] = v as [number, number?, number?, number?];
  return [t, r, b, l];
}

/** What holds still while the snap plays: the surface's size, the content's box at rest. Read once a snap. */
interface Still {
  W: number;
  H: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A `translate` value's x and y, px (`none`: 0, 0); null if it isn't one. */
export function shiftOf(translate: string): [number, number] | null {
  if (translate.trim() === 'none') {
    return [0, 0];
  }
  const v = translate
    .trim()
    .split(/\s+/)
    .map((x) => parseFloat(x));
  if (!v.length || v.length > 3 || v.some((x) => !Number.isFinite(x))) {
    return null;
  }
  return [v[0]!, v[1] ?? 0];
}

/**
 * Where an animation of `target`'s `prop` is now, from its own keyframes
 * and progress (the snap's tracks: its easing on the effect, linear between
 * keys): no computed style read, so nothing is flushed. Null when no such
 * animation is in effect.
 */
export function sampleTrack(
  anims: readonly Animation[],
  target: Element,
  prop: 'clipPath' | 'translate',
  parse: (v: string) => number[] | null
): number[] | null {
  // The latest first: it is the one drawn (composite order).
  for (const a of [...anims].reverse()) {
    const effect = a.effect;
    if (!(effect instanceof KeyframeEffect) || effect.target !== target) {
      continue;
    }
    const keys = effect
      .getKeyframes()
      .filter((k) => typeof k[prop] === 'string')
      .map((k) => ({
        at: Number(k.computedOffset),
        v: parse(String(k[prop])),
      }));
    if (keys.length < 2 || keys.some((k) => !k.v)) {
      continue;
    }
    const p = effect.getComputedTiming().progress;
    if (p == null) {
      return null;
    }
    let i = 0;
    while (i < keys.length - 2 && p > keys[i + 1]!.at) {
      i++;
    }
    const k0 = keys[i]!;
    const k1 = keys[i + 1]!;
    const f = k1.at > k0.at ? (p - k0.at) / (k1.at - k0.at) : 1;
    return k0.v!.map((x, j) => x + ((k1.v![j] ?? x) - x) * f);
  }
  return null;
}

/**
 * One frame: the clip's insets and the content's translate as drawn now,
 * and the mask that follows them. Read from the snap's own animations (its
 * `clip-path` on the surface, the content's `translate`), not computed
 * style: no style or layout read in the loop (reading the frame's
 * offsets would force a layout every frame). Computed style only if a track can't be read.
 */
function paint(
  el: HTMLElement,
  frame: HTMLElement,
  content: HTMLElement,
  token: number,
  still: Still,
  anims: Animation[]
) {
  const { W, H } = still;
  let ins = sampleTrack(anims, el, 'clipPath', insetsOf) as
    | [number, number, number, number]
    | null;
  if (!ins) {
    // No clip track in effect (it has ended while the fade runs on): the
    // clip-path as drawn, `none` being no clip at all.
    const cp = getComputedStyle(el).clipPath;
    ins = cp === 'none' ? [0, 0, 0, 0] : insetsOf(cp);
  }
  if (!ins) {
    const fs = getComputedStyle(frame);
    ins = [fs.top, fs.right, fs.bottom, fs.left].map(
      (v) => parseFloat(v) || 0
    ) as [number, number, number, number];
  }
  const [t, r, b, l] = ins;
  const [sx = 0, sy = 0] =
    sampleTrack(anims, content, 'translate', shiftOf) ??
    shiftOf(getComputedStyle(content).translate) ??
    [];
  // The content's box in the surface's px (where it is drawn, translate and all).
  const ox = still.x + sx;
  const oy = still.y + sy;
  const box = { t: oy, l: ox, r: ox + still.w, b: oy + still.h };
  const clip = { t, l, r: W - r, b: H - b };
  const [et, er, eb, el_] = softEdges(token, clip, box);
  if (Math.max(et, er, eb, el_) < 0.25) {
    return clear(content);
  }
  // Two layers in the content's own box, intersected: one across the clip's
  // height (top and bottom), one across its width (left and right), each
  // running far past the clip on its other axis.
  const far = Math.max(W, H);
  const s = content.style;
  s.setProperty(
    'mask-image',
    `linear-gradient(to bottom, ${stops(et, eb)}), linear-gradient(to right, ${stops(el_, er)})`
  );
  s.setProperty(
    'mask-position',
    `${px(-ox - far)} ${px(clip.t - oy)}, ${px(clip.l - ox)} ${px(-oy - far)}`
  );
  s.setProperty(
    'mask-size',
    `${px(W + 2 * far)} ${px(clip.b - clip.t)}, ${px(clip.r - clip.l)} ${px(H + 2 * far)}`
  );
  s.setProperty('mask-repeat', 'no-repeat');
  s.setProperty('mask-composite', 'intersect');
}

/**
 * Plays the soft edge while `el`'s snap runs (call it as the snap starts:
 * open, close, a turn round). Returns a stop. `el` is the surface: its
 * `data-snap-frame` child is the clip, `content` what it clips.
 */
export function playSoftEdge(
  el: HTMLElement,
  content: HTMLElement
): () => void {
  const frame = el.querySelector<HTMLElement>(':scope > [data-snap-frame]');
  if (!frame) {
    return () => {};
  }
  const token =
    parseFloat(
      getComputedStyle(el).getPropertyValue('--cds-motion-soft-edge')
    ) || softEdgeToken;
  // The snap moves the clip and the content's translate, never the surface's
  // size or the content's place in it: those are read once, as it starts.
  const still: Still = {
    W: el.offsetWidth,
    H: el.offsetHeight,
    x: content.offsetLeft,
    y: content.offsetTop,
    w: content.offsetWidth,
    h: content.offsetHeight,
  };
  // The snap's animations, taken as it starts (a turn round starts a new
  // snap, and plays this again): each frame asks them, not the surface's
  // subtree (`getAnimations` flushes style every frame).
  const snap = snapAnimations(el);
  const live = (a: Animation) =>
    a.playState === 'running' ||
    a.playState === 'paused' ||
    (a.playState === 'finished' &&
      /^(forwards|both)$/.test(String(a.effect?.getTiming().fill)));
  let raf = 0;
  const tick = () => {
    const anims = el.hidden ? [] : snap.filter(live);
    if (!anims.length) {
      clear(content);
      return;
    }
    paint(el, frame, content, token, still, anims);
    raf = requestAnimationFrame(tick);
  };
  // This frame too: the snap has just started, and the next paint shows it.
  tick();
  return () => {
    cancelAnimationFrame(raf);
    clear(content);
  };
}
