/**
 * Copyright IBM Corp. 2025
 *
 * useAnimation — thin wrapper around the Web Animations API.
 *
 * Returns helpers that:
 *   - animate an element to a target opacity with a given duration/easing
 *   - cancel all active animations on the element
 *   - clean up automatically on component unmount
 *
 * All duration and easing values should be read from CSS custom properties
 * via getComputedStyle so that --cmw-motion-* tokens and the
 * prefers-reduced-motion overrides take effect automatically.
 */

import { useCallback, useEffect, useRef } from 'react';

/** Read a CSS custom property from the document root as a number (ms).
 *  Handles both "750ms" and ".75s" / "0.75s" — CSS minifiers may convert
 *  ms values to the shorter seconds form (e.g. 750ms → .75s). */
export function readDurationToken(token: string, fallbackMs: number): number {
  if (typeof window === 'undefined') return fallbackMs;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
  if (!raw) return fallbackMs;
  const n = parseFloat(raw);
  if (isNaN(n)) return fallbackMs;
  // If the value ends with 's' but NOT 'ms', it's in seconds — convert to ms
  return raw.endsWith('ms') ? n : n * 1000;
}

/** Read a CSS custom property from the document root as a string. */
export function readEasingToken(token: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue(token)
      .trim() || fallback
  );
}

export interface AnimateOpacityOptions {
  element: HTMLElement;
  fromOpacity: number;
  toOpacity: number;
  duration: number;
  easing: string;
  delay?: number;
}

/** Animate a single element's opacity and return the Animation object. */
export function animateOpacity({
  element,
  fromOpacity,
  toOpacity,
  duration,
  easing,
  delay = 0,
}: AnimateOpacityOptions): Animation {
  return element.animate(
    [{ opacity: fromOpacity }, { opacity: toOpacity }],
    { duration, delay, easing, fill: 'forwards' },
  );
}

/**
 * useAnimation provides an imperative handle for scheduling Web Animations
 * on a set of elements, with automatic cleanup on unmount.
 */
export function useAnimation() {
  const activeAnimations = useRef<Animation[]>([]);

  /** Track an animation for cleanup. */
  const track = useCallback((anim: Animation) => {
    activeAnimations.current.push(anim);
    anim.finished.then(() => {
      activeAnimations.current = activeAnimations.current.filter(
        (a) => a !== anim,
      );
    }).catch(() => { /* cancelled — ignore */ });
  }, []);

  /** Cancel all tracked animations immediately. */
  const cancelAll = useCallback(() => {
    activeAnimations.current.forEach((a) => a.cancel());
    activeAnimations.current = [];
  }, []);

  // Clean up on unmount
  useEffect(() => () => cancelAll(), [cancelAll]);

  return { track, cancelAll };
}
