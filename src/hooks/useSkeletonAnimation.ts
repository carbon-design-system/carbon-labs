/**
 * Copyright IBM Corp. 2025
 *
 * useSkeletonAnimation — progressive fade-in + continuous opacity pulse loop
 * for the SkeletonLayout component.
 *
 * Ports the stagger + loop pattern from the vanilla prototype (script.js)
 * into a React hook, reading all timing values from --cmw-* tokens so that
 * theme changes and prefers-reduced-motion overrides apply automatically.
 */

import { useEffect, useRef } from 'react';
import { useReducedMotion } from './useReducedMotion';
import {
  readDurationToken,
  readEasingToken,
  animateOpacity,
} from './useAnimation';

/** Token names — must match motion.css */
const TOKEN = {
  fadeIn:  '--cmw-skeleton-fade-in-duration',
  stagger: '--cmw-skeleton-stagger-step',
  loop:    '--cmw-skeleton-loop-duration',
  easing:  '--cmw-skeleton-easing',
} as const;

/** Fallback values if tokens are unavailable — must match motion.css defaults */
const FALLBACK = {
  fadeIn:  750,
  stagger: 47,
  loop:    1000,
  easing:  'cubic-bezier(0.20, 0.00, 0.38, 0.90)',
} as const;

/** Theme-specific opacity values — read from token layer at runtime */
function getThemeOpacity(el: HTMLElement): { peak: number; trough: number } {
  const theme =
    document.documentElement.getAttribute('data-carbon-theme') ?? 'white';

  // For g10-ai, use the ai-specific tokens
  if (theme === 'g10-ai') {
    return {
      peak: parseFloat(
        getComputedStyle(el)
          .getPropertyValue('--cmw-skeleton-ai-opacity-peak')
          .trim() || '0.4',
      ),
      trough: parseFloat(
        getComputedStyle(el)
          .getPropertyValue('--cmw-skeleton-ai-opacity-trough')
          .trim() || '0.15',
      ),
    };
  }

  return {
    peak: parseFloat(
      getComputedStyle(el)
        .getPropertyValue('--cmw-skeleton-opacity-peak')
        .trim() || '0.8',
    ),
    trough: parseFloat(
      getComputedStyle(el)
        .getPropertyValue('--cmw-skeleton-opacity-trough')
        .trim() || '0.2',
    ),
  };
}

/**
 * Attach to a SkeletonLayout root element. Returns a cleanup function.
 *
 * @param rootRef - ref to the root <div> of the SkeletonLayout
 */
export function useSkeletonAnimation(
  rootRef: React.RefObject<HTMLElement | null>,
) {
  const reducedMotion = useReducedMotion();
  const loopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeAnimations = useRef<Animation[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const blocks = Array.from(
      root.querySelectorAll<HTMLElement>('[data-skeleton-block]'),
    ).sort((a, b) => Number(a.dataset.order) - Number(b.dataset.order));

    if (blocks.length === 0) return;

    // Cancel everything from a previous run
    activeAnimations.current.forEach((a) => a.cancel());
    activeAnimations.current = [];
    if (loopTimerRef.current) clearTimeout(loopTimerRef.current);

    // Read timing tokens
    const fadeInDuration = readDurationToken(TOKEN.fadeIn,  FALLBACK.fadeIn);
    const staggerStep    = readDurationToken(TOKEN.stagger, FALLBACK.stagger);
    const loopDuration   = readDurationToken(TOKEN.loop,    FALLBACK.loop);
    const easing         = readEasingToken(TOKEN.easing,    FALLBACK.easing);

    // If reduced motion, snap to full opacity with no loop — blocks must be
    // clearly legible for users who may also have low vision.
    if (reducedMotion) {
      blocks.forEach((b) => { b.style.opacity = '1'; });
      return;
    }

    // ── Initial fade in ─────────────────────────────────────────────────
    blocks.forEach((b) => { b.style.opacity = '0'; });

    const { peak, trough } = getThemeOpacity(blocks[0]);
    let mounted = true;

    const fadeInAnims = blocks.map((block, i) => {
      const anim = animateOpacity({
        element: block,
        fromOpacity: 0,
        toOpacity: peak,
        duration: fadeInDuration,
        easing,
        delay: i * staggerStep,
      });
      activeAnimations.current.push(anim);
      // Commit final opacity to inline style so it survives animation removal
      anim.finished.then(() => {
        if (mounted) block.style.opacity = String(peak);
      }).catch(() => { /* cancelled — leave as-is */ });
      return anim.finished;
    });

    // Use allSettled so a cancelled fade-in does not prevent the loop from
    // starting on the next mount cycle.
    Promise.allSettled(fadeInAnims).then(() => {
      if (!mounted) return;

      // ── Loop cycle ────────────────────────────────────────────────────
      const totalLoopMs =
        (blocks.length - 1) * staggerStep + loopDuration;
      const overlapMs = blocks.length * staggerStep;

      function scheduleLoop(delayMs: number) {
        loopTimerRef.current = setTimeout(() => {
          if (!mounted) return;

          const loopAnims = blocks.map((block, i) => {
            const anim = block.animate(
              [
                { opacity: peak,   offset: 0 },
                { opacity: trough, offset: 0.5 },
                { opacity: peak,   offset: 1 },
              ],
              {
                duration: loopDuration,
                delay: i * staggerStep,
                easing,
                fill: 'none',
              },
            );
            // Commit peak opacity so the block doesn't snap back to 0 between loops
            anim.finished.then(() => {
              if (mounted) block.style.opacity = String(peak);
            }).catch(() => { /* cancelled */ });
            return anim;
          });
          activeAnimations.current.push(...loopAnims);

          scheduleLoop(totalLoopMs - overlapMs + 500);
        }, delayMs);
      }

      // First loop fires slightly earlier (1.5 s sooner than subsequent ones)
      scheduleLoop(totalLoopMs - overlapMs - 1500);
    });

    return () => {
      mounted = false;
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
      activeAnimations.current.forEach((a) => a.cancel());
      activeAnimations.current = [];
    };
  // Re-run when the root mounts or reducedMotion preference changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);
}
