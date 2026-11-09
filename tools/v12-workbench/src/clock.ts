/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { applyDraft, type Draft } from '@carbon-labs/v12-motion';
import { BASE_DURATIONS, BASE_STAGGER, REGISTRY } from './baseline';

/**
 * The draft that runs every duration and stagger step `timeScale` times
 * longer. `instant` (0ms) stays 0.
 *
 * @param timeScale What every duration is multiplied by.
 * @returns The draft, keyed by registry name.
 */
export function clockDraft(timeScale: number): Draft {
  const draft: Draft = {};
  for (const [name, ms] of Object.entries(BASE_DURATIONS)) {
    if (ms > 0) draft[`duration-${name}`] = { value: ms * timeScale };
  }
  for (const [step, ms] of Object.entries(BASE_STAGGER)) {
    draft[`stagger-step-${step}`] = { value: `${ms * timeScale}ms` };
  }
  return draft;
}

/**
 * Whether an animation was started by CSS (a transition or a keyframe
 * animation) rather than by script.
 *
 * @param animation The animation.
 * @returns True for a CSS transition or animation.
 */
function isCssMotion(animation: Animation): boolean {
  return (
    (typeof CSSTransition !== 'undefined' &&
      animation instanceof CSSTransition) ||
    (typeof CSSAnimation !== 'undefined' && animation instanceof CSSAnimation)
  );
}

/**
 * Slows every motion on the page to `1 / timeScale`. Returns the undo.
 *
 * Script-driven motion: carbon-motion's draft layer, the way its bench retimes
 * a token live. The draft scales the live token objects in place, so a
 * primitive reading `motionTokens` when it runs follows, and the stagger
 * steps with it. CSS-driven motion: each transition and keyframe animation,
 * as it starts, has its playback rate set to `1 / timeScale` (a duration
 * compiled from Sass cannot be scaled any other way). The draft also writes
 * the scaled `--cds-motion-*` properties on `<html>`; those go back to 1x so
 * CSS reading them is slowed once, by playback rate, not twice.
 *
 * @param timeScale What every duration is multiplied by; 1 does nothing.
 * @returns A function that restores the baseline and stops slowing CSS.
 */
export function applyClock(timeScale: number): () => void {
  if (timeScale === 1 || typeof document === 'undefined') return () => {};

  const draft = clockDraft(timeScale);
  applyDraft(draft);
  const html = document.documentElement;
  for (const name of Object.keys(draft)) {
    const css = REGISTRY[name]?.css;
    if (css !== undefined) html.style.setProperty(`--cds-motion-${name}`, css);
  }

  const rate = 1 / timeScale;
  const slow = (event: Event) => {
    if (!(event.target instanceof Element)) return;
    for (const animation of event.target.getAnimations()) {
      if (isCssMotion(animation) && animation.playbackRate === 1) {
        animation.playbackRate = rate;
      }
    }
  };
  document.addEventListener('transitionrun', slow, true);
  document.addEventListener('animationstart', slow, true);

  return () => {
    document.removeEventListener('transitionrun', slow, true);
    document.removeEventListener('animationstart', slow, true);
    applyDraft({});
  };
}
