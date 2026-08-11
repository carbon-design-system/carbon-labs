/**
 * Copyright IBM Corp. 2025
 *
 * Processing — animated three-dot loading indicator.
 *
 * Visually identical to Carbon Labs Processing component:
 *   https://labs.carbondesignsystem.com/?path=/docs/react_components-processing--overview
 *
 * All animation runs through the Web Animations API.
 *
 * Timing mirrors the Carbon Labs SCSS exactly:
 *   load-in  1 000 ms, stagger 167 ms (dots 0 / 1 / 2 at 0 / 167 / 334 ms)
 *   loop     1 000 ms per cycle, same stagger
 *   unload   100 ms per dot, 50 ms stagger
 *
 * triggerOut uses commitStyles() to freeze the browser's own compositor value
 * into the element's inline style, then animates from that frozen value to 0.
 * No manual bezier re-implementation — the browser is the single source of truth.
 *
 * Extended modes:
 *   "triangle" — dots arc into a rotating equilateral triangle
 *   "square"   — dots arc into a rotating square (4th dot spawns)
 */

import {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react';
import styles from './Processing.module.css';

// ─── Geometry ─────────────────────────────────────────────────────────────────

const SVG_CX = 16;
const SVG_CY = 16;
const R_SHAPE = 7;

const toRad = (deg: number) => (deg * Math.PI) / 180;
const vAt = (deg: number, r = R_SHAPE) => ({
  cx: SVG_CX + r * Math.cos(toRad(deg)),
  cy: SVG_CY + r * Math.sin(toRad(deg)),
});

// Resting cx positions — matches Carbon Labs (8, 16, 24)
const BASE = [
  { cx: 8,  cy: 16 },
  { cx: 16, cy: 16 },
  { cx: 24, cy: 16 },
] as const;

const TRI = [vAt(-90), vAt(30), vAt(150)];
const SQ  = [vAt(0), vAt(90), vAt(180), vAt(270)];

// ─── Timing — mirrors Carbon Labs SCSS exactly ────────────────────────────────

const STAGGER     = 167;  // ms stagger between dots (Carbon Labs: 0 / 167 / 334)
const LOAD_DUR    = 1000; // load-in duration per dot
const LOOP_DUR    = 1000; // loop cycle duration per dot
const OUT_STAGGER = 50;   // ms stagger between dots for the out animation
const OUT_DUR     = 100;  // out animation per dot
const FORM_DUR    = 700;  // formation arc duration
const ROT_MS      = 6000; // formation rotation period

// Carbon Labs dot radii (numeric)
const R_RS_N = 0.875;
const R_MX_N = 2.5;

// String forms for WAAPI keyframes
const R0   = '0px';
const R_RS = `${R_RS_N}px`;
const R_MX = `${R_MX_N}px`;

// Carbon Labs stroke widths
const SW0 = '0';
const SW1 = '1.72';

// Easings — applied per-keyframe so each segment has its own curve,
// matching how Carbon Labs SCSS uses animation-timing-function per keyframe.
const EI  = 'cubic-bezier(0, 0, 0.3, 1)';   // ease-in  (growth segments)
const EO  = 'cubic-bezier(0.4, 0.14, 1, 1)'; // ease-out (unload)
const LIN = 'linear';                         // neutral hold segments

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProcessingMode = 'loading' | 'triangle' | 'square' | 'out';

export interface ProcessingProps {
  mode?: ProcessingMode;
  loop?: boolean;
  label?: string;
  className?: string;
}

export interface ProcessingHandle {
  triggerOut: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Animate cx/cy along a clockwise arc at R_SHAPE. */
function arcTo(
  el: SVGCircleElement,
  fx: number, fy: number,
  tx: number, ty: number,
  dur: number,
  easing: string,
  delay = 0,
): Animation {
  const STEPS = 32;
  let a0 = Math.atan2(fy - SVG_CY, fx - SVG_CX);
  let a1 = Math.atan2(ty - SVG_CY, tx - SVG_CX);
  if (a1 <= a0) a1 += 2 * Math.PI;

  const frames: Keyframe[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const a = a0 + (a1 - a0) * t;
    frames.push({
      offset: t,
      cx: `${SVG_CX + R_SHAPE * Math.cos(a)}px`,
      cy: `${SVG_CY + R_SHAPE * Math.sin(a)}px`,
    });
  }
  return el.animate(frames, { duration: dur, delay, easing, fill: 'forwards' });
}

// ─── Component ───────────────────────────────────────────────────────────────

export const Processing = forwardRef<ProcessingHandle, ProcessingProps>(
  function Processing({ mode = 'loading', loop = true, label = 'Processing', className }, ref) {

    const d0  = useRef<SVGCircleElement>(null);
    const d1  = useRef<SVGCircleElement>(null);
    const d2  = useRef<SVGCircleElement>(null);
    const d3  = useRef<SVGCircleElement>(null);
    const grp = useRef<SVGGElement>(null);

    const anims  = useRef<Animation[]>([]);
    const rotRef = useRef<Animation | null>(null);
    const alive  = useRef(true);

    // ── helpers ───────────────────────────────────────────────────────────────

    const stopAll = useCallback(() => {
      anims.current.forEach(a => { try { a.cancel(); } catch {} });
      anims.current = [];
      if (rotRef.current) { try { rotRef.current.cancel(); } catch {} rotRef.current = null; }
    }, []);

    const track = useCallback((a: Animation) => {
      anims.current.push(a);
      void a.finished.catch(() => {}).finally(() =>
        (anims.current = anims.current.filter(x => x !== a)),
      );
      return a;
    }, []);

    const dots3 = useCallback((): SVGCircleElement[] =>
      [d0.current!, d1.current!, d2.current!], []);

    // ── single-dot animators ──────────────────────────────────────────────────

    /**
     * Load-in for one dot: 0 → peak → resting.
     * startTime: absolute document-timeline time the animation should begin.
     */
    const animateLoadIn = useCallback((dot: SVGCircleElement, startTime: number) => {
      const anim = track(dot.animate(
        [
          { r: R0,   strokeWidth: SW0, offset: 0,     easing: EI  },
          { r: R_MX, strokeWidth: SW1, offset: 0.25,  easing: EI  },
          { r: R_RS, strokeWidth: SW1, offset: 0.833, easing: LIN },
          { r: R_RS, strokeWidth: SW1, offset: 1                   },
        ],
        { duration: LOAD_DUR, fill: 'forwards' },
      ));
      anim.startTime = startTime;
      return anim;
    }, [track]);

    /**
     * One loop pulse for one dot: resting → peak → resting.
     * startTime: absolute document-timeline time the animation should begin.
     */
    const animateLoopCycle = useCallback((dot: SVGCircleElement, startTime: number): Animation => {
      const anim = track(dot.animate(
        [
          { r: R_RS, offset: 0,     easing: EI  },
          { r: R_MX, offset: 0.25,  easing: EI  },
          { r: R_RS, offset: 0.917, easing: LIN },
          { r: R_RS, offset: 1                   },
        ],
        { duration: LOOP_DUR, fill: 'forwards' },
      ));
      anim.startTime = startTime;
      return anim;
    }, [track]);

    /**
     * Shrink one dot from its current committed inline-style r to 0.
     *
     * The caller must have already called commitStyles() + cancel() on all
     * running animations so that the element's inline style.r holds the true
     * visual value. We start this animation with an implicit "from" so the
     * browser reads that committed value directly — no manual r computation.
     *
     * startTime: absolute document-timeline time for this out animation.
     */
    const animateOut = useCallback((dot: SVGCircleElement, startTime: number) => {
      // Read the committed r from inline style (set by commitStyles() before cancel).
      // Fall back to the presentation attribute if the inline style is empty.
      const committedR = dot.style.r || dot.getAttribute('r') || '0px';
      const rNum = parseFloat(committedR);

      track(dot.animate(
        [
          { r: committedR, strokeWidth: rNum > 0.01 ? SW1 : SW0 },
          { r: R0,         strokeWidth: SW0 },
        ],
        { duration: OUT_DUR, fill: 'forwards', easing: EO },
      )).startTime = startTime;
    }, [track]);

    // ── phase sequences ───────────────────────────────────────────────────────

    /**
     * Load-in then loop (forever or one cycle then out).
     *
     * Every animation is pinned to an absolute document-timeline startTime so
     * tab-switching (which defers .finished callbacks) cannot drift the stagger.
     *
     * Chain per dot:
     *   load-in   startTime = t0 + STAGGER*i
     *   loop n    startTime = t0 + STAGGER*i + LOAD_DUR + LOOP_DUR*n
     */
    const runLoading = useCallback((loopForever: boolean) => {
      const ds = dots3();
      const t0 = document.timeline.currentTime as number;

      ds.forEach((d, i) => animateLoadIn(d, t0 + STAGGER * i));

      const loopDot = (d: SVGCircleElement, idx: number, cycleIndex: number) => {
        if (!alive.current) return;

        const absStart = t0 + STAGGER * idx + LOAD_DUR + LOOP_DUR * cycleIndex;
        const anim = animateLoopCycle(d, absStart);

        void anim.finished.then(() => {
          if (!alive.current) return;
          if (loopForever) {
            loopDot(d, idx, cycleIndex + 1);
          } else {
            // no-loop path: browser commitStyles handles r snapshot
            const outStart = (document.timeline.currentTime as number) + OUT_STAGGER * idx;
            try { anim.commitStyles(); } catch {}
            anim.cancel();
            animateOut(d, outStart);
          }
        }).catch(() => {});
      };

      ds.forEach((d, i) => loopDot(d, i, 0));
    }, [dots3, animateLoadIn, animateLoopCycle, animateOut]);

    /** Arc dots into a formation then spin. */
    const formShape = useCallback(async (verts: typeof TRI | typeof SQ) => {
      stopAll();
      const count = verts.length;
      const dot4  = d3.current!;

      dots3().forEach((d, i) => {
        d.setAttribute('cx', `${BASE[i].cx}`);
        d.setAttribute('cy', `${BASE[i].cy}`);
        d.setAttribute('r', `${R_RS_N}`);
        d.setAttribute('stroke-width', SW1);
      });

      if (count === 4) {
        dot4.setAttribute('cx', '16');
        dot4.setAttribute('cy', '16');
        dot4.setAttribute('r', `${R_RS_N}`);
        dot4.setAttribute('stroke-width', SW1);
        dot4.style.display = '';
      }

      const allDots = count === 4
        ? [d0.current!, d1.current!, d2.current!, dot4]
        : dots3();

      const arcs = allDots.map((d, i) => {
        const from = i < 3 ? BASE[i] : { cx: 16, cy: 16 };
        return arcTo(d, from.cx, from.cy, verts[i].cx, verts[i].cy, FORM_DUR, EI, STAGGER * i);
      });
      arcs.forEach(a => track(a));

      await Promise.all(arcs.map(a => a.finished)).catch(() => {});
      if (!alive.current) return;

      if (grp.current) {
        rotRef.current = grp.current.animate(
          [
            { transform: 'rotate(0deg)',   transformOrigin: '16px 16px' },
            { transform: 'rotate(360deg)', transformOrigin: '16px 16px' },
          ],
          { duration: ROT_MS, iterations: Infinity, easing: 'linear' },
        );
      }
    }, [dots3, stopAll, track]);

    // ── imperative handle ─────────────────────────────────────────────────────

    useImperativeHandle(ref, () => ({
      triggerOut: () => {
        const ds = dots3();
        const now = document.timeline.currentTime as number;

        // commitStyles() freezes the browser's current compositor value of every
        // animated property into the element's inline style.  We do this while
        // animations are still running (fill:'forwards' is live), then cancel
        // them.  The inline style now holds the true visual r at this exact frame.
        ds.forEach(d => {
          // Collect all active animations on this element and commit + cancel.
          const active = d.getAnimations();
          active.forEach(a => {
            try { a.commitStyles(); } catch {}
            try { a.cancel(); } catch {}
          });
        });

        // Cancel the shared animation list too (formation arcs, rotation, etc.)
        stopAll();
        if (grp.current) grp.current.style.transform = '';
        if (d3.current)  d3.current.style.display = 'none';

        // Animate each dot from its committed inline-style r → 0.
        ds.forEach((d, i) => {
          d.setAttribute('cx', `${BASE[i].cx}`);
          d.setAttribute('cy', `${BASE[i].cy}`);
          animateOut(d, now + OUT_STAGGER * i);
        });
      },
    }));

    // ── mode effect ───────────────────────────────────────────────────────────

    useEffect(() => {
      alive.current = true;

      // Reset all dots to invisible baseline.
      [d0, d1, d2, d3].forEach(r => {
        if (!r.current) return;
        // Clear any committed inline styles from a previous triggerOut.
        r.current.style.r = '';
        r.current.style.strokeWidth = '';
        r.current.setAttribute('r', '0');
        r.current.setAttribute('stroke-width', '0');
      });
      if (d3.current) d3.current.style.display = 'none';
      if (grp.current) grp.current.style.transform = '';

      if (mode === 'loading') {
        void runLoading(loop);
      } else if (mode === 'triangle') {
        void formShape(TRI);
      } else if (mode === 'square') {
        void formShape(SQ);
      } else if (mode === 'out') {
        // Start from resting size — set baseline then animate out immediately.
        const t0 = document.timeline.currentTime as number;
        dots3().forEach((d, i) => {
          d.setAttribute('r', R_RS);
          d.setAttribute('stroke-width', SW1);
          animateOut(d, t0 + OUT_STAGGER * i);
        });
      }

      return () => {
        alive.current = false;
        stopAll();
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, loop]);

    // ── render ────────────────────────────────────────────────────────────────

    return (
      <div
        className={`${styles.root}${className ? ` ${className}` : ''}`}
        role="status"
        aria-label={label}
      >
        <svg className={styles.svg} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
          <g ref={grp}>
            <circle ref={d0} className={`${styles.dot} ${styles.dotLeft}`}   cx={BASE[0].cx} cy={BASE[0].cy} r="0" strokeWidth="0" />
            <circle ref={d1} className={`${styles.dot} ${styles.dotCenter}`} cx={BASE[1].cx} cy={BASE[1].cy} r="0" strokeWidth="0" />
            <circle ref={d2} className={`${styles.dot} ${styles.dotRight}`}  cx={BASE[2].cx} cy={BASE[2].cy} r="0" strokeWidth="0" />
            <circle ref={d3} className={`${styles.dot} ${styles.dotExtra}`}  cx="16"         cy="16"         r="0" strokeWidth="0" style={{ display: 'none' }} />
          </g>
        </svg>
      </div>
    );
  },
);

export default Processing;
