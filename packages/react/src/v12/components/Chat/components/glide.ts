/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import {
  attachRollover,
  durationStepForDistance,
  motionTokens,
} from '@carbon-labs/v12-motion';
import { useReducedGetter } from '@carbon-labs/react-util';

/* ============================================================================
 * The status parts' small motions.
 *
 *   glide     words before an element change width: it glides to its new
 *             place by travel, standard-productive, read before the frame
 *             paints; a leaving one holds where it shows
 *   width     a step's trailing words glide to their new width by travel
 *   rollover  hover, press and release for the parts' text toggles
 *   reduced   at once
 * ========================================================================== */

const STANDARD = `cubic-bezier(${motionTokens.easing['standard-productive'].join(', ')})`;

/** Glides `ref` sideways to its new place whenever `before` changes size; `hold` keeps it where it shows. */
export function useGlide(
  ref: RefObject<HTMLElement | null>,
  before: RefObject<HTMLElement | null>,
  {
    timeScale,
    reduced,
    hold = false,
  }: { timeScale: number; reduced: boolean; hold?: boolean }
) {
  const opts = useRef({ timeScale, reduced, hold });
  useLayoutEffect(() => {
    opts.current = { timeScale, reduced, hold };
  });
  useLayoutEffect(() => {
    const el = ref.current;
    const prev = before.current;
    if (!el || !prev || typeof ResizeObserver === 'undefined') {
      return;
    }
    let at = el.offsetLeft;
    let anim: Animation | null = null;
    const ro = new ResizeObserver(() => {
      const now = el.offsetLeft;
      if (Math.abs(now - at) < 0.5) {
        return;
      }
      // Where it shows now (its place plus any glide under way), as an offset from the new place.
      const shown =
        parseFloat(getComputedStyle(el).translate.split(' ')[0] ?? '0') || 0;
      const from = at + shown - now;
      at = now;
      anim?.cancel();
      anim = null;
      const { timeScale: scale, reduced: still, hold: stay } = opts.current;
      if (Math.abs(from) < 0.5 || typeof el.animate !== 'function') {
        return;
      }
      if (stay) {
        // Held where it shows, for as long as it stays (it is on its way out).
        anim = el.animate(
          [{ translate: `${from}px 0` }, { translate: `${from}px 0` }],
          { duration: 1, fill: 'forwards' }
        );
        return;
      }
      if (still) {
        return;
      }
      anim = el.animate([{ translate: `${from}px 0` }, { translate: '0 0' }], {
        duration: motionTokens.duration[durationStepForDistance(from)] * scale,
        easing: STANDARD,
      });
    });
    ro.observe(prev);
    return () => {
      ro.disconnect();
      anim?.cancel();
    };
  }, [ref, before]);
}

/** Glides `ref`'s width to what its first child needs, by travel, so the words before it give way smoothly. */
export function useWidthGlide(
  ref: RefObject<HTMLElement | null>,
  { timeScale, reduced }: { timeScale: number; reduced: boolean }
) {
  const opts = useRef({ timeScale, reduced });
  useLayoutEffect(() => {
    opts.current = { timeScale, reduced };
  });
  useLayoutEffect(() => {
    const el = ref.current;
    const content = el?.firstElementChild as HTMLElement | null | undefined;
    if (!el || !content || typeof ResizeObserver === 'undefined') {
      return;
    }
    let at = content.offsetWidth;
    let anim: Animation | null = null;
    const ro = new ResizeObserver(() => {
      const now = content.offsetWidth;
      if (Math.abs(now - at) < 0.5) {
        return;
      }
      // From the width it shows (mid-glide, the glide's), to the new one.
      const shown = anim ? el.getBoundingClientRect().width : at;
      at = now;
      anim?.cancel();
      anim = null;
      const { timeScale: scale, reduced: still } = opts.current;
      if (
        still ||
        Math.abs(now - shown) < 0.5 ||
        typeof el.animate !== 'function'
      ) {
        return;
      }
      anim = el.animate(
        [{ inlineSize: `${shown}px` }, { inlineSize: `${now}px` }],
        {
          duration:
            motionTokens.duration[durationStepForDistance(now - shown)] * scale,
          easing: STANDARD,
        }
      );
      const done = anim;
      done.finished.then(
        () => {
          if (anim === done) {
            anim = null;
          }
        },
        () => {}
      );
    });
    ro.observe(content);
    return () => {
      ro.disconnect();
      anim?.cancel();
    };
  }, [ref]);
}

/** Hover, press and release for the text toggles under `root` matching `selector`, on the parts' clock. */
export function usePartRollover(
  root: RefObject<HTMLElement | null>,
  selector: string,
  { timeScale, reduced }: { timeScale: number; reduced: boolean }
) {
  // The part's own reduced (its prop, else the feedback family's), else the provider's, else the OS's.
  const rolloverReduced = useReducedGetter(reduced);
  useEffect(() => {
    const el = root.current;
    if (!el) {
      return;
    }
    return attachRollover(el, {
      selector,
      timeScale,
      reduced: rolloverReduced,
    });
  }, [root, selector, timeScale, rolloverReduced]);
}
