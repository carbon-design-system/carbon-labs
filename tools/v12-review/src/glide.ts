/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The window's glide to a section, as the lane's jump glides: its clock the
// step for the distance it travels (`durationStepForDistance`), on the
// standard productive curve; past two views it moves to one view short
// first. It lands the section at its scroll margin (under the collapsed page
// header), marks the window as gliding so the page header moves on the
// glide's clock (`markJumpGlide`), and a reader's own wheel, touch, key or
// press stops it where it is. Reduced motion: it lands at once.

import {
  durationStepForDistance,
  motionTokens,
  snapEaseAt,
} from '@carbon-labs/v12-motion';
import { clearJumpGlide, markJumpGlide } from '@carbon-labs/react-jump-to';

/** Past this many views, the glide starts one view short of its section. */
const FAR_VIEWS = 2;
const INPUTS = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;

/** The glide under way: stops it. */
let running: (() => void) | null = null;

/**
 * Glides the window to `el`, at its scroll margin; at once under reduced motion.
 * @param {HTMLElement} el The section.
 * @param {boolean} reduced Whether motion is reduced.
 */
export function glideTo(el: HTMLElement, reduced: boolean) {
  running?.();
  const box = (document.scrollingElement ??
    document.documentElement) as HTMLElement;
  const margin = parseFloat(getComputedStyle(el).scrollMarginBlockStart) || 0;
  const max = box.scrollHeight - box.clientHeight;
  const to = Math.max(
    0,
    Math.min(max, el.getBoundingClientRect().top + box.scrollTop - margin)
  );
  if (reduced) {
    box.scrollTop = to;
    return;
  }
  const view = box.clientHeight;
  if (Math.abs(to - box.scrollTop) > FAR_VIEWS * view) {
    box.scrollTop = to - Math.sign(to - box.scrollTop) * view;
  }
  const from = box.scrollTop;
  const travel = to - from;
  if (Math.abs(travel) < 1) {
    return;
  }
  const ms = motionTokens.duration[durationStepForDistance(Math.abs(travel))];
  const t0 = performance.now();
  let frame = 0;
  /** Ends the glide where it is. */
  const stop = () => {
    cancelAnimationFrame(frame);
    clearJumpGlide(box);
    for (const type of INPUTS) {
      window.removeEventListener(type, stop);
    }
    running = null;
  };
  /**
   * One frame of the glide.
   * @param {number} now The frame's time, ms.
   */
  const step = (now: number) => {
    const p = Math.min(1, (now - t0) / ms);
    box.scrollTop = from + travel * snapEaseAt('standard-productive', p);
    if (p < 1) {
      frame = requestAnimationFrame(step);
    } else {
      stop();
    }
  };
  markJumpGlide(box, t0 + ms);
  for (const type of INPUTS) {
    window.addEventListener(type, stop, { passive: true });
  }
  frame = requestAnimationFrame(step);
  running = stop;
}
