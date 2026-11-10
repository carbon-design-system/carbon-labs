/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  animateLayout,
  durationStepForDistance,
  motionTokens,
  REDUCED_MOTION,
  stepDown,
  type DurationToken,
  easingCss,
} from '@carbon-labs/v12-motion';
import { disclosureArrival } from './disclosure';
import './list-place.scss';

/* ============================================================================
 * A row's place in a list, opening as it arrives and shutting as it leaves
 * (the activity feed's new events, the jobs tray's jobs). Internal to the kit.
 *
 *   open    the place opens from nothing on its travel's step,
 *           entrance-productive, under the soft bottom edge: one layout move
 *           (`animateLayout`) on the list, so what's below follows. The
 *           content comes down 8px into it with the opening, over one
 *           token longer (the kit's disclosure, `disclosureArrival`), no fade
 *   shut    the place closes one step faster, exit-productive, the content
 *           holding still as the edge closes over it
 *   reduced the place at once; the content fades in on the reduced clock
 * ========================================================================== */

const bezier = (name: keyof typeof motionTokens.easing) => easingCss(name);

const clip = (el: HTMLElement, open: number) => {
  el.style.setProperty('--cds-place-open', `${open}px`);
  el.setAttribute('data-cds-place', '');
};
const unclip = (el: HTMLElement) => {
  el.removeAttribute('data-cds-place');
  el.style.removeProperty('--cds-place-open');
};

export interface PlaceOptions {
  timeScale?: number;
  reduced?: boolean;
  /** The layout transaction's reason. */
  reason?: string;
}

/** Opens `el`'s place in `root` and brings its first child (its content) down into it. Resolves once both land. */
export function openPlace(
  root: HTMLElement,
  el: HTMLElement,
  { timeScale = 1, reduced = false, reason = 'list-arrive' }: PlaceOptions = {}
): Promise<void> {
  const h = el.offsetHeight;
  const content = el.firstElementChild as HTMLElement | null;
  if (reduced) {
    const fade = content?.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration:
        motionTokens.duration['fast-02'] * REDUCED_MOTION.clock * timeScale,
      easing: bezier('entrance-productive'),
      fill: 'backwards',
    });
    return fade
      ? fade.finished.then(
          () => undefined,
          () => undefined
        )
      : Promise.resolve();
  }
  const token = durationStepForDistance(h) as DurationToken;
  const ms = motionTokens.duration[token] * timeScale;
  clip(el, h);
  const { animation } = animateLayout(
    root,
    el,
    [{ height: '0px' }, { height: `${h}px` }],
    {
      ms,
      easing: bezier('entrance-productive'),
      reason,
    }
  );
  const arrival = disclosureArrival(el, ms, { timeScale });
  const moving = content?.animate(
    [
      { transform: `translateY(-${arrival.distance}px)` },
      { transform: 'none' },
    ],
    {
      duration: arrival.duration,
      delay: arrival.delay,
      easing: arrival.easing,
      fill: 'backwards',
    }
  );
  return Promise.all([animation.finished, moving?.finished]).then(
    () => unclip(el),
    () => unclip(el)
  );
}

/** Shuts `el`'s place in `root` (its content holding still). Resolves once it has closed. */
export function shutPlace(
  root: HTMLElement,
  el: HTMLElement,
  { timeScale = 1, reduced = false, reason = 'list-leave' }: PlaceOptions = {}
): Promise<void> {
  if (reduced) {
    return Promise.resolve();
  }
  const h = el.offsetHeight;
  const token = stepDown(
    durationStepForDistance(h) as DurationToken
  ) as DurationToken;
  clip(el, h);
  const { animation } = animateLayout(
    root,
    el,
    [{ height: `${h}px` }, { height: '0px' }],
    {
      ms: motionTokens.duration[token] * timeScale,
      easing: bezier('exit-productive'),
      reason,
    }
  );
  // Held shut until its caller takes it out.
  return animation.finished.then(
    () => {
      el.style.height = '0px';
    },
    () => undefined
  );
}
