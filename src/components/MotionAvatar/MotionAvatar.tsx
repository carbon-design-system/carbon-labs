/**
 * Copyright IBM Corp. 2025
 *
 * MotionAvatar — DEX (Db2 Genius Hub) animated avatar.
 *
 * Imperative API (via forwardRef):
 *   const ref = useRef<DexHandle>(null);
 *   ref.current?.load();
 *
 * Transition model
 * ─────────────────
 * Every mode that interrupts another calls commitAll() which:
 *   1. pause()        each active animation at its current tick
 *   2. commitStyles() writes the frozen value into el.style (inline layer)
 *   3. cancel()       removes the animation — inline style holds the value
 *
 * This means every property (transform, rx, opacity) is frozen at its live
 * interpolated value before the next animation starts, so there is never a
 * snap back to the base state regardless of which mode was running before.
 */

import { forwardRef, useEffect, useId, useImperativeHandle, useRef } from 'react';
import cx from 'clsx';
import { useAnimation } from '../../hooks/useAnimation';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import styles from './MotionAvatar.module.css';

export type MotionAvatarState = 'idle' | 'thinking' | 'responding';
export type MotionAvatarSize = 'sm' | 'md' | 'lg';

export interface MotionAvatarProps {
  /** Current AI presence state */
  state?: MotionAvatarState;
  /** Visual size */
  size?: MotionAvatarSize;
  /** Accessible label */
  label?: string;
  /** Additional class name applied to the root element */
  className?: string;
}

/** Imperative handle exposed via ref. */
export interface DexHandle {
  /** Play the Load entrance animation. Safe to call multiple times. */
  load(): void;
  /** Start the Idle loop — three rings rotating with distinct easings. */
  idle(): void;
  /** Play the Thinking animation — rings spin and squish once over idle, staggered
   *  small → medium → outer. Composites additively on top of Idle. */
  thinking(): void;
  /** Play the Activated burst then settle into a fast idle. */
  activated(): void;
  /** Play the Out animation — rings shrink and fade, staggered small → medium → outer. */
  out(): void;
}

const STATE_LABEL: Record<MotionAvatarState, string> = {
  idle: 'Ready',
  thinking: 'Thinking',
  responding: 'Responding',
};

// ── Easing constants ──────────────────────────────────────────────────────────
const EO   = 'cubic-bezier(0.00, 0.00, 0.30, 1.00)'; // expressive-entrance
const EO_X = 'cubic-bezier(0.40, 0.14, 0.30, 1.00)'; // expressive-exit

// ── Outer ring geometry ───────────────────────────────────────────────────────
const R_OUTER        = 13;   // resting radius (number, for setAttribute)
const RX_OUTER_START = 3.25; // load start rx
const RY_OUTER_START = 1;    // load start ry

// ── Rotation helpers ──────────────────────────────────────────────────────────
// All rotations must be expressed as translate(16,16) rotate(N) translate(-16,-16)
// so they pivot around the shared SVG frame center (16,16) regardless of each
// ring's individual cx/cy. CSS transform-origin cannot reliably achieve this for
// SVG <g> elements — the translate pattern is the only cross-browser solution.
const FC = 16; // frame center in SVG user units (x and y are equal)
const r0 = (deg: number) =>
  `translate(${FC}px,${FC}px) rotate(${deg}deg) translate(${-FC}px,${-FC}px)`;

// ── Gradient stop colors ──────────────────────────────────────────────────────
const OUTER_STOP0  = '#4589FF';
const OUTER_STOP1  = '#8A3FFC';
const MEDIUM_STOP0 = '#4589FF';
const MEDIUM_STOP1 = '#08BDBA';
const SMALL_STOP0  = '#00CBC8';
const SMALL_STOP1  = '#3453FF';

const FLARE_OUTER_STOP0  = '#edf4ff'; // Blue 10
const FLARE_MEDIUM_STOP1 = '#d9fbfb'; // Teal 10
const FLARE_SMALL_STOP0  = '#d9fbfb'; // Teal 10

// ── Gradient rotation geometry ────────────────────────────────────────────────
const OUTER_GRAD_REST_DEG  = 0;
const MEDIUM_GRAD_REST_DEG = 0;
const SMALL_GRAD_REST_DEG  = 0;

const GRAD_RINGS = {
  outer:  { cx: 16, cy: 16, r: 13 },
  medium: { cx: 19, cy: 16, r: 11 },
  small:  { cx: 10, cy: 16, r:  8 },
} as const;

// ── Cubic-bezier sampler ──────────────────────────────────────────────────────
function sampleCubicBezier(
  p1x: number, p1y: number,
  p2x: number, p2y: number,
  t: number,
): number {
  let lo = 0, hi = 1, x = t;
  for (let i = 0; i < 8; i++) {
    const cx = 3 * p1x, bx = 3 * (p2x - p1x) - cx, ax = 1 - cx - bx;
    const cur = ((ax * x + bx) * x + cx) * x;
    if (Math.abs(cur - t) < 1e-6) break;
    const deriv = (3 * ax * x + 2 * bx) * x + cx;
    if (Math.abs(deriv) < 1e-6) break;
    x -= (cur - t) / deriv;
    x = Math.max(lo, Math.min(hi, x));
  }
  const cy2 = 3 * p1y, by2 = 3 * (p2y - p1y) - cy2, ay2 = 1 - cy2 - by2;
  return ((ay2 * x + by2) * x + cy2) * x;
}

const [EO_P1X, EO_P1Y, EO_P2X, EO_P2Y] = [0.00, 0.00, 0.30, 1.00];

// ── Gradient angle → x1/y1/x2/y2 ────────────────────────────────────────────
function setGradientAngle(
  grad: SVGLinearGradientElement,
  cx: number, cy: number, r: number,
  angleDeg: number,
) {
  const rad = (angleDeg * Math.PI) / 180;
  grad.setAttribute('gradientUnits', 'userSpaceOnUse');
  grad.setAttribute('x1', String(cx + r * Math.cos(rad + Math.PI)));
  grad.setAttribute('y1', String(cy + r * Math.sin(rad + Math.PI)));
  grad.setAttribute('x2', String(cx + r * Math.cos(rad)));
  grad.setAttribute('y2', String(cy + r * Math.sin(rad)));
}

// ── rAF gradient rotation driver ─────────────────────────────────────────────
function rafRotateGradient(
  grad: SVGLinearGradientElement,
  cx: number, cy: number, r: number,
  restAngleDeg: number,
  duration: number,
  delay: number,
  onCancel?: () => void,
): () => void {
  const startAngle = restAngleDeg - 90;
  const endAngle   = restAngleDeg;
  let rafId = 0;
  let startTime: number | null = null;
  let cancelled = false;

  setGradientAngle(grad, cx, cy, r, startAngle);

  const tick = (now: number) => {
    if (cancelled) return;
    if (startTime === null) startTime = now;
    const elapsed = now - startTime - delay;
    if (elapsed < 0) { rafId = requestAnimationFrame(tick); return; }

    const rawT   = Math.min(elapsed / duration, 1);
    const easedT = sampleCubicBezier(EO_P1X, EO_P1Y, EO_P2X, EO_P2Y, rawT);
    const angle  = startAngle + (endAngle - startAngle) * easedT;
    setGradientAngle(grad, cx, cy, r, angle);

    if (rawT < 1) {
      rafId = requestAnimationFrame(tick);
    } else {
      onCancel?.();
    }
  };

  rafId = requestAnimationFrame(tick);

  return () => {
    cancelled = true;
    cancelAnimationFrame(rafId);
    onCancel?.();
  };
}

export const MotionAvatar = forwardRef<DexHandle, MotionAvatarProps>(
  function MotionAvatar(
    { state = 'idle', size = 'md', label, className },
    ref,
  ) {
    const displayLabel = label ?? STATE_LABEL[state];

    const rawId = useId();
    const id = rawId.replace(/:/g, '-');

    const outerGradId  = `dex-grad-outer-${id}`;
    const mediumGradId = `dex-grad-medium-${id}`;
    const smallGradId  = `dex-grad-small-${id}`;

    // Ring element refs
    const outerGRef  = useRef<SVGGElement>(null);
    const outerERef  = useRef<SVGEllipseElement>(null);
    const mediumGRef = useRef<SVGGElement>(null);
    const mediumCRef = useRef<SVGEllipseElement>(null);
    const smallGRef  = useRef<SVGGElement>(null);
    const smallCRef  = useRef<SVGEllipseElement>(null);

    // Gradient element refs (for rAF rotation)
    const outerGradRef  = useRef<SVGLinearGradientElement>(null);
    const mediumGradRef = useRef<SVGLinearGradientElement>(null);
    const smallGradRef  = useRef<SVGLinearGradientElement>(null);

    // Gradient stop refs (for flare animation)
    const outerStop0Ref  = useRef<SVGStopElement>(null);
    const mediumStop1Ref = useRef<SVGStopElement>(null);
    const smallStop0Ref  = useRef<SVGStopElement>(null);

    const { track } = useAnimation();
    const prefersReducedMotion = useReducedMotion();

    // Tracks the currently active mode so guards can prevent illegitimate
    // interruptions (e.g. the load→idle timer must not fire during Thinking).
    type Mode = 'load' | 'idle' | 'thinking' | 'activated' | 'out';
    const modeRef = useRef<Mode>('load');

    // Active rAF cancel functions
    const cancelRafs = useRef<Array<() => void>>([]);
    const stopAllRafs = () => {
      cancelRafs.current.forEach(fn => fn());
      cancelRafs.current = [];
    };
    const trackRaf = (cancel: () => void) => {
      cancelRafs.current.push(cancel);
    };

    // Cleanup rAFs on unmount
    useEffect(() => () => stopAllRafs(), []);

    // ── freezeAndCancel ────────────────────────────────────────────────────────
    // Freezes every active animation at its current interpolated position and
    // cancels it, leaving the element's inline style holding the live value.
    //
    // The algorithm mirrors Processing's triggerOut pattern:
    //   1. pause()         — freeze the animation at the current tick
    //   2. commitStyles()  — write the frozen value into el.style (inline layer)
    //   3. cancel()        — remove the animation; inline style now holds the value
    //
    // This works for every fill mode and composite mode because pause() makes
    // the current interpolated value available to commitStyles() regardless of
    // whether fill:'none' or fill:'forwards' is set.
    //
    // After freezeAndCancel we sync any SVG geometry written to el.style back
    // to the presentation attribute so subsequent attribute-reading code is
    // consistent (WAAPI geometry animations use the attribute as the base value
    // when no inline style is present, so we keep both in sync).
    const freezeAndCancel = (els: Element[]) => {
      for (const el of els) {
        for (const anim of el.getAnimations()) {
          try { anim.pause(); } catch {}
          try { anim.commitStyles(); } catch {}
          try { anim.cancel(); } catch {}
        }
      }
    };

    // Sync el.style.rx → presentation attribute after freezeAndCancel so that
    // code reading getAttribute('rx') sees the committed value.
    const syncRxAttr = (el: SVGEllipseElement) => {
      const v = el.style.getPropertyValue('rx');
      if (v && v !== 'auto') {
        el.setAttribute('rx', v);
        el.setAttribute('ry', v);
      }
    };

    // Stop-color cannot be committed via commitStyles (it's a presentation
    // attribute, not a CSS property on the stop element). Read from
    // getComputedStyle which reflects the WAAPI layer.
    const commitStopColors = () => {
      const outerS0  = outerStop0Ref.current;
      const mediumS1 = mediumStop1Ref.current;
      const smallS0  = smallStop0Ref.current;
      if (outerS0)  { const sc = getComputedStyle(outerS0).stopColor;  if (sc) outerS0.setAttribute('stop-color', sc); }
      if (mediumS1) { const sc = getComputedStyle(mediumS1).stopColor; if (sc) mediumS1.setAttribute('stop-color', sc); }
      if (smallS0)  { const sc = getComputedStyle(smallS0).stopColor;  if (sc) smallS0.setAttribute('stop-color', sc); }
    };

    // Full snapshot + cancel for all ring elements. Called before every state
    // transition that needs to interrupt running animations.
    const commitAll = () => {
      const outerG  = outerGRef.current;
      const outerE  = outerERef.current;
      const mediumG = mediumGRef.current;
      const mediumC = mediumCRef.current;
      const smallG  = smallGRef.current;
      const smallC  = smallCRef.current;
      if (!outerG || !outerE || !mediumG || !mediumC || !smallG || !smallC) return;

      commitStopColors();
      freezeAndCancel([outerG, outerE, mediumG, mediumC, smallG, smallC]);
      syncRxAttr(outerE);
      syncRxAttr(mediumC);
      syncRxAttr(smallC);
    };

    // ── runLoad ───────────────────────────────────────────────────────────────
    const runLoad = (
      outerG:    SVGGElement,
      outerE:    SVGEllipseElement,
      mediumG:   SVGGElement,
      mediumC:   SVGEllipseElement,
      smallG:    SVGGElement,
      smallC:    SVGEllipseElement,
      outerGrad: SVGLinearGradientElement,
      mediumGrad:SVGLinearGradientElement,
      smallGrad: SVGLinearGradientElement,
      outerS0:   SVGStopElement,
      mediumS1:  SVGStopElement,
      smallS0:   SVGStopElement,
    ) => {
      if (prefersReducedMotion) {
        outerG.style.opacity  = '1';
        outerE.setAttribute('rx', String(R_OUTER));
        outerE.setAttribute('ry', String(R_OUTER));
        setGradientAngle(outerGrad,  ...Object.values(GRAD_RINGS.outer)  as [number,number,number], OUTER_GRAD_REST_DEG);
        mediumG.style.opacity = '1';
        mediumC.setAttribute('rx', '9');
        mediumC.setAttribute('ry', '9');
        setGradientAngle(mediumGrad, ...Object.values(GRAD_RINGS.medium) as [number,number,number], MEDIUM_GRAD_REST_DEG);
        smallG.style.opacity  = '1';
        smallC.setAttribute('rx', '6');
        smallC.setAttribute('ry', '6');
        setGradientAngle(smallGrad,  ...Object.values(GRAD_RINGS.small)  as [number,number,number], SMALL_GRAD_REST_DEG);
        return;
      }

      // Set base attribute values for the start of the animation.
      // These are the "from" values — WAAPI reads them at t=0.
      outerE.setAttribute('rx', String(RX_OUTER_START));
      outerE.setAttribute('ry', String(RY_OUTER_START));
      mediumC.setAttribute('rx', '0');
      mediumC.setAttribute('ry', '0');
      smallC.setAttribute('rx', '0');
      smallC.setAttribute('ry', '0');
      // Stop colors start at flare (light) values
      outerS0.setAttribute('stop-color', FLARE_OUTER_STOP0);
      mediumS1.setAttribute('stop-color', FLARE_MEDIUM_STOP1);
      smallS0.setAttribute('stop-color', FLARE_SMALL_STOP0);

      modeRef.current = 'load';
      stopAllRafs();
      commitAll();

      // Opacity fades held by fill:'forwards'; commitAll() freezes them on the
      // next transition before cancelling.
      outerG.style.opacity  = '0';
      mediumG.style.opacity = '0';
      smallG.style.opacity  = '0';

      // ── Outer ring ──────────────────────────────────────────────────────────
      // Outer ring rests at 45° clockwise. No rotation animation during load —
      // the entrance is pure rx/ry squish — so we lock it at r0(45) for the
      // full load duration so WAAPI owns the transform from frame 0.
      track(outerG.animate(
        [{ transform: r0(45) }, { transform: r0(45) }],
        { duration: 1250, easing: 'linear', fill: 'forwards' },
      ));
      track(outerG.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 100, easing: 'linear', fill: 'forwards' },
      ));
      // Geometry: fill:'none' — final value is held by the setAttribute above
      // being overwritten by WAAPI during play, then commitAll writes it back.
      // Actually we DO need fill:'forwards' on geometry so the shape stays at
      // its final size after the animation ends naturally (before idle fires).
      // The fix isn't to remove fill:'forwards' — it's to commitAll() which
      // re-writes the attribute before cancel, so cancel has nothing to snap.
      track(outerE.animate(
        [{ rx: `${RX_OUTER_START}px` }, { rx: `${R_OUTER}px` }],
        { duration: 1250, easing: EO, fill: 'forwards' },
      ));
      track(outerE.animate(
        [{ ry: `${RY_OUTER_START}px` }, { ry: `${R_OUTER}px` }],
        { duration: 1250, easing: EO_X, fill: 'forwards' },
      ));
      trackRaf(rafRotateGradient(
        outerGrad,
        GRAD_RINGS.outer.cx, GRAD_RINGS.outer.cy, GRAD_RINGS.outer.r,
        OUTER_GRAD_REST_DEG, 1250, 0,
      ));
      // Flare: hold peak 150ms, then fade — finishes 150ms before ring completes
      track(outerS0.animate(
        [
          { stopColor: FLARE_OUTER_STOP0, offset: 0 },
          { stopColor: FLARE_OUTER_STOP0, offset: 150 / 1100 },
          { stopColor: OUTER_STOP0,       offset: 1 },
        ],
        { duration: 1100, easing: 'linear', fill: 'forwards' },
      ));

      // ── Medium ring (delay 150ms) ───────────────────────────────────────────
      track(mediumG.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 100, delay: 150, easing: 'linear', fill: 'forwards' },
      ));
      track(mediumG.animate(
        [{ transform: r0(-225) }, { transform: r0(0) }],
        { duration: 1100, delay: 150, easing: EO, fill: 'forwards' },
      ));
      track(mediumC.animate(
        [{ rx: '0px', ry: '0px' }, { rx: '9px', ry: '9px' }],
        { duration: 1100, delay: 150, easing: EO, fill: 'forwards' },
      ));
      trackRaf(rafRotateGradient(
        mediumGrad,
        GRAD_RINGS.medium.cx, GRAD_RINGS.medium.cy, GRAD_RINGS.medium.r,
        MEDIUM_GRAD_REST_DEG, 1100, 150,
      ));
      // Flare: hold peak 150ms, then fade — finishes 150ms before ring completes
      track(mediumS1.animate(
        [
          { stopColor: FLARE_MEDIUM_STOP1, offset: 0 },
          { stopColor: FLARE_MEDIUM_STOP1, offset: 150 / 950 },
          { stopColor: MEDIUM_STOP1,       offset: 1 },
        ],
        { duration: 950, delay: 150, easing: 'linear', fill: 'forwards' },
      ));

      // ── Small ring (delay 300ms) ────────────────────────────────────────────
      track(smallG.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 100, delay: 300, easing: 'linear', fill: 'forwards' },
      ));
      track(smallG.animate(
        [{ transform: r0(-180) }, { transform: r0(0) }],
        { duration: 950, delay: 300, easing: EO, fill: 'forwards' },
      ));
      track(smallC.animate(
        [{ rx: '0px', ry: '0px' }, { rx: '6px', ry: '6px' }],
        { duration: 950, delay: 300, easing: EO, fill: 'forwards' },
      ));
      trackRaf(rafRotateGradient(
        smallGrad,
        GRAD_RINGS.small.cx, GRAD_RINGS.small.cy, GRAD_RINGS.small.r,
        SMALL_GRAD_REST_DEG, 950, 300,
      ));
      // Flare: hold peak 150ms, then fade — finishes 150ms before ring completes
      track(smallS0.animate(
        [
          { stopColor: FLARE_SMALL_STOP0, offset: 0 },
          { stopColor: FLARE_SMALL_STOP0, offset: 150 / 800 },
          { stopColor: SMALL_STOP0,       offset: 1 },
        ],
        { duration: 800, delay: 300, easing: 'linear', fill: 'forwards' },
      ));
    };

    // ── Idle ──────────────────────────────────────────────────────────────────
    const IDLE_DUR         = 12000;
    const IDLE_EASE_OUTER  = 'cubic-bezier(0.30, 0.08, 0.70, 0.92)';
    const IDLE_EASE_MEDIUM = 'cubic-bezier(0.40, 0.08, 0.60, 0.92)';
    const IDLE_EASE_SMALL  = 'cubic-bezier(0.50, 0.08, 0.50, 0.92)';

    const scheduleIdleSpins = (
      outerG:  SVGGElement,
      mediumG: SVGGElement,
      smallG:  SVGGElement,
    ) => {
      // composite:'add' means the spin is layered additively on top of whatever
      // inline transform commitAll stamped onto the element. This way the idle
      // loop starts from the ring's actual current position without needing to
      // know or decompose the rotation angle — no snap regardless of prior state.
      const spin = (el: SVGGElement, easing: string) => {
        track(el.animate(
          [{ transform: r0(0) }, { transform: r0(360) }],
          { duration: IDLE_DUR, easing, fill: 'none', iterations: Infinity, composite: 'add' },
        ));
      };
      spin(outerG,  IDLE_EASE_OUTER);
      spin(mediumG, IDLE_EASE_MEDIUM);
      spin(smallG,  IDLE_EASE_SMALL);
    };

    const runIdle = (
      outerG:  SVGGElement,
      mediumG: SVGGElement,
      smallG:  SVGGElement,
    ) => {
      if (prefersReducedMotion) return;
      modeRef.current = 'idle';
      stopAllRafs();
      commitAll();
      scheduleIdleSpins(outerG, mediumG, smallG);
    };

    // ── Thinking ─────────────────────────────────────────────────────────────
    // Each ring plays three simultaneous animations with the same easing/timing:
    //   1. Spin:     full 360° clockwise rotation on the <g>, composited additively
    //                on top of the idle loop so the idle keeps running underneath.
    //   2. rx squish: restRx → 0 → restRx on the ellipse. Passing through rx=0
    //                (a flat line) is the visual equivalent of a y-axis flip.
    //                Using rx/ry geometry (not scaleX) means stroke width is never
    //                touched — it stays at 2 SVG user units and scales naturally
    //                with the container (32px→2px, 64px→4px etc).
    //   3. Gradient: 0° → 180° → 0° rAF arc on each ring's linearGradient, driven
    //                with the same cubic bezier. The ping-pong means the gradient
    //                is back at 0° when rx returns to restRx, so start and end
    //                visuals are identical. At the midpoint (rx=0, ring invisible)
    //                the gradient is at 90° — completely unnoticeable.
    //
    // Stagger: small (delay 0) → medium (delay 150ms) → outer (delay 300ms).
    const THINK_EASE = 'cubic-bezier(0.40, 0.00, 0.30, 1.00)';
    const [TH_P1X, TH_P1Y, TH_P2X, TH_P2Y] = [0.40, 0.00, 0.30, 1.00];

    const runThinking = (
      outerG:    SVGGElement,
      outerE:    SVGEllipseElement,
      outerGrad: SVGLinearGradientElement,
      mediumG:    SVGGElement,
      mediumC:    SVGEllipseElement,
      mediumGrad: SVGLinearGradientElement,
      smallG:    SVGGElement,
      smallC:    SVGEllipseElement,
      smallGrad: SVGLinearGradientElement,
    ) => {
      if (prefersReducedMotion) return;
      modeRef.current = 'thinking';
      // No commitAll — thinking overlaps with idle running underneath.

      // 1. Full clockwise spin composited on top of idle's running rotation.
      const thinkSpin = (gEl: SVGGElement, dur: number, delay: number) => {
        track(gEl.animate(
          [{ transform: r0(0) }, { transform: r0(360) }],
          { duration: dur, delay, easing: THINK_EASE, fill: 'none', composite: 'add' },
        ));
      };

      // 2. rx squish: restRx → 0 → restRx (ping-pong through flat).
      // Three keyframes with offset:0 / offset:0.5 / offset:1.
      // fill:'none' — WAAPI resets rx to its base attribute when done.
      const thinkSquish = (shapeEl: SVGEllipseElement, restRx: number, dur: number, delay: number) => {
        track(shapeEl.animate(
          [
            { rx: `${restRx}px`, offset: 0   },
            { rx: '0px',         offset: 0.5 },
            { rx: `${restRx}px`, offset: 1   },
          ],
          { duration: dur, delay, easing: THINK_EASE, fill: 'none' },
        ));
      };

      // 3. Gradient ping-pong: 0° → 180° → 0° with the same easing.
      // At the midpoint (rx=0, ring invisible) the gradient is at 90° — unseen.
      // At the end the gradient is back at 0°, matching the idle rest angle.
      const thinkGradPingPong = (
        grad: SVGLinearGradientElement,
        gCx: number, gCy: number, gR: number,
        dur: number,
        delay: number,
      ) => {
        let startTime: number | null = null;
        let rafId = 0;
        let cancelled = false;

        const tick = (now: number) => {
          if (cancelled) return;
          if (startTime === null) startTime = now;
          const elapsed = now - startTime - delay;
          if (elapsed < 0) { rafId = requestAnimationFrame(tick); return; }
          const rawT = Math.min(elapsed / dur, 1);
          // Drive a full 0→180→0 triangle wave so the gradient returns to 0° at t=1.
          // First half: ease 0→180°; second half: ease 180→0°.
          let angle: number;
          if (rawT <= 0.5) {
            const halfT  = rawT / 0.5;
            const easedT = sampleCubicBezier(TH_P1X, TH_P1Y, TH_P2X, TH_P2Y, halfT);
            angle = 180 * easedT;
          } else {
            const halfT  = (rawT - 0.5) / 0.5;
            const easedT = sampleCubicBezier(TH_P1X, TH_P1Y, TH_P2X, TH_P2Y, halfT);
            angle = 180 * (1 - easedT);
          }
          setGradientAngle(grad, gCx, gCy, gR, angle);
          if (rawT < 1) {
            rafId = requestAnimationFrame(tick);
          } else {
            // Ensure exact rest angle on completion.
            setGradientAngle(grad, gCx, gCy, gR, 0);
          }
        };
        rafId = requestAnimationFrame(tick);
        trackRaf(() => {
          cancelled = true;
          cancelAnimationFrame(rafId);
          // Restore rest angle if cancelled mid-flight.
          setGradientAngle(grad, gCx, gCy, gR, 0);
        });
      };

      // All rings finish at 2000ms (small: 0+2000, medium: 150+1850, outer: 300+1700).
      const THINK_TOTAL_MS = 2000;

      // Small ring first, then medium, then outer
      thinkSpin(smallG,    2000,   0);
      thinkSquish(smallC,  6, 2000,   0);
      thinkGradPingPong(smallGrad,  GRAD_RINGS.small.cx,  GRAD_RINGS.small.cy,  GRAD_RINGS.small.r,  2000,   0);
      thinkSpin(mediumG,   1850, 150);
      thinkSquish(mediumC, 9, 1850, 150);
      thinkGradPingPong(mediumGrad, GRAD_RINGS.medium.cx, GRAD_RINGS.medium.cy, GRAD_RINGS.medium.r, 1850, 150);
      thinkSpin(outerG,    1700, 300);
      thinkSquish(outerE,  R_OUTER, 1700, 300);
      thinkGradPingPong(outerGrad,  GRAD_RINGS.outer.cx,  GRAD_RINGS.outer.cy,  GRAD_RINGS.outer.r,  1700, 300);

      // When thinking finishes naturally, hand off to idle — but only if nothing
      // else has taken over in the meantime (e.g. user triggered Out or Load).
      setTimeout(() => {
        if (modeRef.current !== 'thinking') return;
        runIdle(outerG, mediumG, smallG);
      }, THINK_TOTAL_MS + 50);
    };

    // ── Activated burst ───────────────────────────────────────────────────────
    const ACT_DUR  = 600;
    const ACT_EASE = EO_X;

    // Ref to cancel the activated→idle settle timeout so Out can interrupt it.
    const actTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const runActivated = (
      outerG:   SVGGElement,
      mediumG:  SVGGElement,
      smallG:   SVGGElement,
      outerS0:  SVGStopElement,
      mediumS1: SVGStopElement,
      smallS0:  SVGStopElement,
    ) => {
      if (prefersReducedMotion) return;
      modeRef.current = 'activated';
      stopAllRafs();
      commitAll();

      const burstSpin = (el: SVGGElement, delay: number) => {
        track(el.animate(
          [{ transform: r0(0) }, { transform: r0(360) }],
          { duration: ACT_DUR, delay, easing: ACT_EASE, fill: 'none' },
        ));
      };

      const flareStop = (
        el: SVGStopElement,
        flareColor: string,
        restColor: string,
        delay: number,
      ) => {
        track(el.animate(
          [
            { stopColor: restColor },
            { stopColor: flareColor, offset: 0.35 },
            { stopColor: restColor },
          ],
          { duration: ACT_DUR, delay, easing: 'linear', fill: 'none' },
        ));
      };

      burstSpin(outerG,  0);
      burstSpin(mediumG, 60);
      burstSpin(smallG,  120);

      flareStop(outerS0,  FLARE_OUTER_STOP0,  OUTER_STOP0,  0);
      flareStop(mediumS1, FLARE_MEDIUM_STOP1, MEDIUM_STOP1, 60);
      flareStop(smallS0,  FLARE_SMALL_STOP0,  SMALL_STOP0,  120);

      // After burst, settle into fast idle (half speed)
      actTimerRef.current = setTimeout(() => {
        if (!outerG.isConnected) return;
        const spin = (el: SVGGElement, dur: number, easing: string) => {
          track(el.animate(
            [{ transform: r0(0) }, { transform: r0(360) }],
            { duration: dur, easing, fill: 'none', iterations: Infinity },
          ));
        };
        spin(outerG,  IDLE_DUR / 2, IDLE_EASE_OUTER);
        spin(mediumG, IDLE_DUR / 2, IDLE_EASE_MEDIUM);
        spin(smallG,  IDLE_DUR / 2, IDLE_EASE_SMALL);
      }, ACT_DUR + 180);
    };

    // ── Out ───────────────────────────────────────────────────────────────────
    // All three rings animate simultaneously over OUT_DUR:
    //   - rx/ry → 0, cx → FC: collapse toward the SVG centre (no transform,
    //     so stroke width is unaffected)
    //   - opacity → 0
    //   - +30° clockwise spin on each <g> via composite:'add' with EO easing,
    //     composited on top of the committed inline transform from commitAll so
    //     it works seamlessly from any prior state.
    const OUT_DUR  = 200;
    const OUT_EASE = 'cubic-bezier(0.40, 0.14, 1.00, 1.00)'; // matches Processing EO

    const runOut = (
      outerG:  SVGGElement,
      outerE:  SVGEllipseElement,
      mediumG: SVGGElement,
      mediumC: SVGEllipseElement,
      smallG:  SVGGElement,
      smallC:  SVGEllipseElement,
    ) => {
      if (prefersReducedMotion) {
        outerG.style.opacity  = '0';
        mediumG.style.opacity = '0';
        smallG.style.opacity  = '0';
        return;
      }

      modeRef.current = 'out';

      // Cancel pending timers so they don't fire on top of Out.
      if (actTimerRef.current !== null) {
        clearTimeout(actTimerRef.current);
        actTimerRef.current = null;
      }
      if (idleTimerRef.current !== null) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }

      stopAllRafs();

      // commitAll freezes every animation at its current tick (pause→commitStyles→cancel)
      // so the rings stay exactly where they are — no snap to base position.
      commitAll();

      // Read back committed base values for the from-keyframes.
      const fromRx = (el: SVGEllipseElement) => el.getAttribute('rx') ?? '0px';
      const fromOp = (el: SVGGElement)       => el.style.opacity || '1';
      const fromCx = (el: SVGEllipseElement) => el.getAttribute('cx') ?? `${FC}`;

      const outRing = (gEl: SVGGElement, shapeEl: SVGEllipseElement, spinDeg: number) => {
        const rx = fromRx(shapeEl);
        const op = fromOp(gEl);
        const cx = fromCx(shapeEl);

        // Opacity fade
        track(gEl.animate(
          [{ opacity: op }, { opacity: '0' }],
          { duration: OUT_DUR, easing: OUT_EASE, fill: 'forwards' },
        ));

        // Collapse toward centre
        track(shapeEl.animate(
          [
            { rx, ry: rx, cx: `${cx}px`, cy: '16px' },
            { rx: '0px', ry: '0px', cx: `${FC}px`, cy: '16px' },
          ],
          { duration: OUT_DUR, easing: OUT_EASE, fill: 'forwards' },
        ));

        // Clockwise spin composited on top of the committed rotation.
        track(gEl.animate(
          [{ transform: r0(0) }, { transform: r0(spinDeg) }],
          { duration: OUT_DUR, easing: EO, fill: 'forwards', composite: 'add' },
        ));
      };

      outRing(smallG,  smallC,  60);
      outRing(mediumG, mediumC, 45);
      outRing(outerG,  outerE,  30);
    };

    // ── Imperative handle ─────────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      load() {
        const outerG     = outerGRef.current;
        const outerE     = outerERef.current;
        const mediumG    = mediumGRef.current;
        const mediumC    = mediumCRef.current;
        const smallG     = smallGRef.current;
        const smallC     = smallCRef.current;
        const outerGrad  = outerGradRef.current;
        const mediumGrad = mediumGradRef.current;
        const smallGrad  = smallGradRef.current;
        const outerS0    = outerStop0Ref.current;
        const mediumS1   = mediumStop1Ref.current;
        const smallS0    = smallStop0Ref.current;
        if (!outerG || !outerE || !mediumG || !mediumC || !smallG || !smallC ||
            !outerGrad || !mediumGrad || !smallGrad ||
            !outerS0 || !mediumS1 || !smallS0) return;
        runLoad(outerG, outerE, mediumG, mediumC, smallG, smallC,
                outerGrad, mediumGrad, smallGrad, outerS0, mediumS1, smallS0);
      },
      idle() {
        const outerG  = outerGRef.current;
        const mediumG = mediumGRef.current;
        const smallG  = smallGRef.current;
        if (!outerG || !mediumG || !smallG) return;
        runIdle(outerG, mediumG, smallG);
      },
      thinking() {
        const outerG    = outerGRef.current;
        const outerE    = outerERef.current;
        const outerGrad = outerGradRef.current;
        const mediumG   = mediumGRef.current;
        const mediumC   = mediumCRef.current;
        const mediumGrad = mediumGradRef.current;
        const smallG    = smallGRef.current;
        const smallC    = smallCRef.current;
        const smallGrad = smallGradRef.current;
        if (!outerG || !outerE || !outerGrad ||
            !mediumG || !mediumC || !mediumGrad ||
            !smallG || !smallC || !smallGrad) return;
        runThinking(
          outerG, outerE, outerGrad,
          mediumG, mediumC, mediumGrad,
          smallG, smallC, smallGrad,
        );
      },
      activated() {
        const outerG   = outerGRef.current;
        const mediumG  = mediumGRef.current;
        const smallG   = smallGRef.current;
        const outerS0  = outerStop0Ref.current;
        const mediumS1 = mediumStop1Ref.current;
        const smallS0  = smallStop0Ref.current;
        if (!outerG || !mediumG || !smallG ||
            !outerS0 || !mediumS1 || !smallS0) return;
        runActivated(outerG, mediumG, smallG, outerS0, mediumS1, smallS0);
      },
      out() {
        const outerG  = outerGRef.current;
        const outerE  = outerERef.current;
        const mediumG = mediumGRef.current;
        const mediumC = mediumCRef.current;
        const smallG  = smallGRef.current;
        const smallC  = smallCRef.current;
        if (!outerG || !outerE || !mediumG || !mediumC || !smallG || !smallC) return;
        runOut(outerG, outerE, mediumG, mediumC, smallG, smallC);
      },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [prefersReducedMotion, track]);

    // ── Auto load→idle on mount ───────────────────────────────────────────────
    // commitAll() freezes all load animations at their current tick then cancels
    // them, so idle starts from the rings' exact position at that moment.
    // We wait 1300ms (50ms after the longest load animation at 1250ms) so the
    // rings are at full size before idle takes over.
    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const LOAD_TO_IDLE_MS = 1300;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
      const outerG     = outerGRef.current!;
      const outerE     = outerERef.current!;
      const mediumG    = mediumGRef.current!;
      const mediumC    = mediumCRef.current!;
      const smallG     = smallGRef.current!;
      const smallC     = smallCRef.current!;
      const outerGrad  = outerGradRef.current!;
      const mediumGrad = mediumGradRef.current!;
      const smallGrad  = smallGradRef.current!;
      const outerS0    = outerStop0Ref.current!;
      const mediumS1   = mediumStop1Ref.current!;
      const smallS0    = smallStop0Ref.current!;

      runLoad(outerG, outerE, mediumG, mediumC, smallG, smallC,
              outerGrad, mediumGrad, smallGrad, outerS0, mediumS1, smallS0);

      idleTimerRef.current = setTimeout(() => {
        // Only hand off to idle if load is still the active mode — Thinking,
        // Out, or another Load may have taken over since this timer was set.
        if (modeRef.current !== 'load') return;
        modeRef.current = 'idle';
        stopAllRafs();
        commitAll();
        scheduleIdleSpins(outerG, mediumG, smallG);
      }, LOAD_TO_IDLE_MS);

      return () => {
        if (idleTimerRef.current !== null) clearTimeout(idleTimerRef.current);
      };
    }, []);

    return (
      <div
        className={cx(styles.root, styles[size], className)}
        role="img"
        aria-label={displayLabel}
      >
        <svg
          className={styles.dexSvg}
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient
              ref={outerGradRef}
              id={outerGradId}
              x1="3"
              y1="16"
              x2="29"
              y2="16"
              gradientUnits="userSpaceOnUse"
            >
              <stop ref={outerStop0Ref} offset="0"   stopColor={OUTER_STOP0} />
              <stop                     offset="1"   stopColor={OUTER_STOP1} />
            </linearGradient>
            <linearGradient
              ref={mediumGradRef}
              id={mediumGradId}
              x1="8"
              y1="16"
              x2="30"
              y2="16"
              gradientUnits="userSpaceOnUse"
            >
              <stop                      offset="0.567308" stopColor={MEDIUM_STOP0} />
              <stop ref={mediumStop1Ref} offset="1"        stopColor={MEDIUM_STOP1} />
            </linearGradient>
            <linearGradient
              ref={smallGradRef}
              id={smallGradId}
              x1="2"
              y1="16"
              x2="18"
              y2="16"
              gradientUnits="userSpaceOnUse"
            >
              <stop ref={smallStop0Ref} offset="0"        stopColor={SMALL_STOP0} />
              <stop                     offset="0.745192" stopColor={SMALL_STOP1} />
            </linearGradient>
          </defs>

          {/* Outer ring — back */}
          <g
            ref={outerGRef}
            className={styles.outerRingG}
            style={{ opacity: 0 }}
          >
            <ellipse
              ref={outerERef}
              cx="16"
              cy="16"
              rx={RX_OUTER_START}
              ry={RY_OUTER_START}
              stroke={`url(#${outerGradId})`}
              strokeWidth="2"
            />
          </g>

          {/* Small ring — middle layer */}
          <g ref={smallGRef} style={{ opacity: 0 }}>
            <ellipse
              ref={smallCRef}
              cx="10"
              cy="16"
              rx={0}
              ry={0}
              stroke={`url(#${smallGradId})`}
              strokeWidth="2"
            />
          </g>

          {/* Medium ring — top layer */}
          <g ref={mediumGRef} style={{ opacity: 0 }}>
            <ellipse
              ref={mediumCRef}
              cx="19"
              cy="16"
              rx={0}
              ry={0}
              stroke={`url(#${mediumGradId})`}
              strokeWidth="2"
            />
          </g>
        </svg>

        <span className={styles.srOnly}>{displayLabel}</span>
      </div>
    );
  },
);

export default MotionAvatar;
