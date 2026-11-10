/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DURATION_FLOOR_MS } from '@carbon-labs/v12-motion';
import {
  SHIMMER_RIDE_AT,
  SHIMMER_RIDE_BAND,
  SHIMMER_TEXT,
  deferShimmerPass,
  easingCss,
  forcedColors,
  registerShimmer,
  shimmerLabelSpeed,
  shimmerPass,
  type ShimmerPass,
} from './ShimmerText';

/* ============================================================================
 * The shimmer's reveal: words (or a row) arrive through the shimmer's band,
 * as one pass of it, instead of fading or popping in: a smooth gradient
 * reveal with the band's colours and its easing.
 *
 *   edge     a mask on the element: shown behind the band's middle, hidden
 *            ahead of its front, so the band's leading half is the soft edge.
 *            The band is the label's own (`shimmerRevealPass`): as wide as
 *            its words are long (`SHIMMER_TEXT.band`, 75%, 96 to 240px),
 *            as its passes are
 *   band     every ShimmerText inside (active or not) carries its band along
 *            the edge, in step with it: its words come in in the band's
 *            colour and settle to their own behind it.
 *            Words that aren't a ShimmerText, and marks, arrive under the
 *            edge alone
 *   angle    the shimmer's (the skeleton wave's, 45°)
 *   clock    one crossing at the label's own speed: the first ShimmerText
 *            inside, its speed by its words' length and its `motion`
 *            (`shimmerLabelSpeed`), not by the row's; words with no
 *            ShimmerText take the speed for their own length. On the
 *            band's easing (standard-productive), without the rest. Slow
 *            motion multiplies it, never under `DURATION_FLOOR_MS`
 *   shimmer  the reveal is a pass: an active ShimmerText's own first pass
 *            sets off one rest (its `restMs`) after the reveal's band has
 *            gone (`deferShimmerPass`), so one band crosses the words at a
 *            time and the words keep the pass, rest, pass rhythm from their
 *            arrival, never waiting for the page phase's next pass
 *   delay    held hidden until it starts (a swap's out)
 *   reduced  none: the words are there at once
 *   forced   none under forced colors
 * ========================================================================== */

/**
 * The reveal's pass over a `width` × `height` box holding `words` px of words, before slow motion: the
 * band by the words' length, crossing at `speed` (the label's own, px per ms) or else the speed for the
 * words' length. Its clock is the crossing, `travelMs`, without the rest. Pure.
 */
export function shimmerRevealPass({
  width,
  height,
  words = width,
  speed,
}: {
  width: number;
  height: number;
  words?: number;
  speed?: number;
}): ShimmerPass {
  const pass = shimmerPass({ width, height, words });
  if (speed == null || !(speed > 0)) {
    return pass;
  }
  const travelMs = pass.span / speed;
  return {
    ...pass,
    speed,
    travelMs,
    periodMs: travelMs + (pass.periodMs - pass.travelMs),
  };
}

/**
 * What an element holds, px wide: its words, not its box. A row or a face can be wider than what it
 * holds, and the band crosses only what is there (a turn's row, 1152px wide around 175px of words, took
 * 8s by its box).
 */
function wordsOf(el: HTMLElement): number {
  const range = document.createRange();
  range.selectNodeContents(el);
  return range.getBoundingClientRect().width || el.offsetWidth;
}

const PROP = '--cds-shimmer-reveal';
let registered = false;
function register() {
  registerShimmer();
  if (registered) {
    return;
  }
  registered = true;
  try {
    CSS.registerProperty({
      name: PROP,
      syntax: '<length>',
      inherits: false,
      initialValue: '0px',
    });
  } catch {
    // Already registered (a second copy of the kit), or unsupported: then the mask snaps open at the end.
  }
}

const running = new WeakMap<HTMLElement, Animation>();

export interface ShimmerRevealOptions {
  /** Slow motion: the clock times this. Default 1. */
  timeScale?: number;
  /** Reduced motion: no reveal, there at once. */
  reduced?: boolean;
  /** Held hidden this long first, ms (already slowed). */
  delay?: number;
  /** The clock, ms (already slowed). Default the label's pass's crossing (`shimmerRevealPass`) times `timeScale`. */
  duration?: number;
}

/** Along the sweep, px. */
const along = (r: DOMRect, a: number) =>
  r.left * Math.cos(a) + r.top * Math.sin(a);

/**
 * Reveals `el` through the shimmer's band. Returns the animation (null when
 * it shows at once); the mask is removed, and the bands come to rest, as it
 * finishes or is cancelled.
 */
export function playShimmerReveal(
  el: HTMLElement,
  {
    timeScale = 1,
    reduced = false,
    delay = 0,
    duration,
  }: ShimmerRevealOptions = {}
): Animation | null {
  if (reduced || forcedColors() || typeof el.animate !== 'function') {
    return null;
  }
  register();
  const shimmers = [
    el,
    ...el.querySelectorAll<HTMLElement>('.cds-shimmer-text--banded'),
  ].filter((s) => s.classList.contains('cds-shimmer-text--banded'));
  const speed = shimmers[0] ? shimmerLabelSpeed(shimmers[0]) : undefined;
  const { bandPx, span, travelMs } = shimmerRevealPass({
    width: Math.min(el.offsetWidth, wordsOf(el)),
    height: el.offsetHeight,
    speed,
  });
  const a = (SHIMMER_TEXT.angleDeg * Math.PI) / 180;
  const clock = Math.max(DURATION_FLOOR_MS, duration ?? travelMs * timeScale);
  const timing: KeyframeAnimationOptions = {
    duration: clock,
    delay,
    easing: easingCss(SHIMMER_TEXT.easing),
    fill: 'both',
  };

  // Shown behind the band's middle, hidden ahead of its front, on the band's eased stops.
  const q = bandPx / 8;
  const at = (k: number) => `calc(var(${PROP}) - ${k * q}px)`;
  const mask = `linear-gradient(${90 + SHIMMER_TEXT.angleDeg}deg, #000 ${at(4)}, rgb(0 0 0 / 84.4%) ${at(3)}, rgb(0 0 0 / 50%) ${at(2)}, rgb(0 0 0 / 15.6%) ${at(1)}, transparent var(${PROP}))`;
  el.style.setProperty('mask-image', mask);
  el.style.setProperty('-webkit-mask-image', mask);
  const anim = el.animate([{ [PROP]: '0px' }, { [PROP]: `${span}px` }], timing);

  // Each ShimmerText inside carries its band along the edge: the same front, in its own place along the sweep.
  const from = along(el.getBoundingClientRect(), a);
  const rides: Animation[] = [];
  for (const s of shimmers) {
    const d = along(s.getBoundingClientRect(), a) - from;
    // The reveal's band, as wide as the edge's (a label's own may be a share of its width).
    const w = `${bandPx}px`;
    rides.push(
      s.animate(
        [
          { [SHIMMER_RIDE_AT]: `${-d}px`, [SHIMMER_RIDE_BAND]: w },
          { [SHIMMER_RIDE_AT]: `${span - d}px`, [SHIMMER_RIDE_BAND]: w },
        ],
        timing
      )
    );
    // Its own passes (an active one's) set off one rest after the reveal's band has gone: the reveal is a pass.
    deferShimmerPass(s, delay + clock);
  }

  running.get(el)?.cancel();
  running.set(el, anim);
  // Held at its end (`fill: both`) until the mask goes, so no frame shows it shut; then let go.
  // Only this reveal's own end clears the mask (a later one may have taken its place).
  const clear = () => {
    rides.forEach((r) => r.cancel());
    if (running.get(el) !== anim) {
      return;
    }
    running.delete(el);
    el.style.removeProperty('mask-image');
    el.style.removeProperty('-webkit-mask-image');
    anim.cancel();
  };
  anim.finished.then(clear, clear);
  return anim;
}
