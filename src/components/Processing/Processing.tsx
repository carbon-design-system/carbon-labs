/**
 * Copyright IBM Corp. 2025
 *
 * Processing — animated three-dot loading indicator.
 *
 * Visually identical to Carbon Labs Processing component:
 *   https://labs.carbondesignsystem.com/?path=/docs/react_components-processing--overview
 *
 * Pure CSS animation — no Web Animations API.
 * Dots are stroked circles, not filled, matching the reference exactly.
 *
 * Extended modes:
 *   "triangle" — dots arc clockwise into a rotating equilateral triangle
 *   "square"   — dots arc clockwise into a rotating square (4th dot spawns)
 *   "out"      — plays the unload sequence immediately
 */

import {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react';
import styles from './Processing.module.css';

// ─── Constants ────────────────────────────────────────────────────────────────

const SVG_CX = 16;
const SVG_CY = 16;
const R_SHAPE = 7;

const toRad = (deg: number) => (deg * Math.PI) / 180;
const vAt = (deg: number, r = R_SHAPE) => ({
  cx: SVG_CX + r * Math.cos(toRad(deg)),
  cy: SVG_CY + r * Math.sin(toRad(deg)),
});

// Carbon Labs cx positions
const BASE = [
  { cx: 8,  cy: 16 },
  { cx: 16, cy: 16 },
  { cx: 24, cy: 16 },
] as const;

const TRI = [vAt(-90), vAt(30), vAt(150)];
const SQ  = [vAt(0), vAt(90), vAt(180), vAt(270)];

// WAAPI constants
const STAGGER  = 167;
const FORM_DUR = 700;
const ROT_MS   = 6000;
const OUT_DUR  = 600;
const R_RS_N   = 0.875; // numeric resting radius for setAttribute
const EI = 'cubic-bezier(0, 0, 0.3, 1)';

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

    const rootRef  = useRef<HTMLDivElement>(null);
    const d0 = useRef<SVGCircleElement>(null);
    const d1 = useRef<SVGCircleElement>(null);
    const d2 = useRef<SVGCircleElement>(null);
    const d3 = useRef<SVGCircleElement>(null);
    const grp = useRef<SVGGElement>(null);

    const anims  = useRef<Animation[]>([]);
    const rotRef = useRef<Animation | null>(null);
    const timer  = useRef<ReturnType<typeof setTimeout> | null>(null);
    const alive  = useRef(true);

    // ── cleanup ──────────────────────────────────────────────────────────────

    const stopAll = useCallback(() => {
      anims.current.forEach(a => { try { a.cancel(); } catch {} });
      anims.current = [];
      if (rotRef.current) { try { rotRef.current.cancel(); } catch {} rotRef.current = null; }
      if (timer.current)  { clearTimeout(timer.current); timer.current = null; }
    }, []);

    const track = useCallback((a: Animation) => {
      anims.current.push(a);
      void a.finished.catch(() => {}).finally(() =>
        (anims.current = anims.current.filter(x => x !== a)),
      );
      return a;
    }, []);

    const dotArr = useCallback(
      (count = 3): SVGCircleElement[] =>
        [d0.current!, d1.current!, d2.current!, d3.current!].slice(0, count) as SVGCircleElement[],
      [],
    );

    // ── formation modes (WAAPI) ───────────────────────────────────────────────

    const formShape = useCallback(
      async (verts: typeof TRI | typeof SQ) => {
        stopAll();
        const count = verts.length;
        const dot4 = d3.current!;

        // Remove CSS animation classes — formation uses WAAPI
        if (rootRef.current) {
          rootRef.current.removeAttribute('data-anim');
        }

        // Reset dots to base positions
        const allDots = dotArr(3);
        allDots.forEach((dot, i) => {
          dot.setAttribute('cx', `${BASE[i].cx}`);
          dot.setAttribute('cy', `${BASE[i].cy}`);
          dot.setAttribute('r', `${R_RS_N}`);
          dot.setAttribute('stroke-width', '1.72');
        });

        if (count === 4) {
          dot4.setAttribute('cx', '16');
          dot4.setAttribute('cy', '16');
          dot4.setAttribute('r', `${R_RS_N}`);
          dot4.setAttribute('stroke-width', '1.72');
          dot4.style.display = '';
        }

        const dots = dotArr(count);
        const movePs: Promise<unknown>[] = [];

        dots.forEach((dot, i) => {
          const from = i < 3 ? BASE[i] : { cx: 16, cy: 16 };
          const to   = verts[i];
          const a = arcTo(dot, from.cx, from.cy, to.cx, to.cy, FORM_DUR, EI, STAGGER * i);
          track(a);
          movePs.push(a.finished);
        });

        await Promise.all(movePs).catch(() => {});
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
      },
      [dotArr, stopAll, track],
    );

    // ── imperative handle ─────────────────────────────────────────────────────

    useImperativeHandle(ref, () => ({
      triggerOut: () => {
        const dots = [d0.current, d1.current, d2.current].filter(Boolean) as SVGCircleElement[];

        // Snapshot the current computed r and stroke-width from the live CSS animation
        // so the WAAPI unload starts exactly where the CSS left off.
        const snapshots = dots.map(dot => {
          const computed = getComputedStyle(dot);
          const r  = parseFloat(computed.getPropertyValue('r'))  || R_RS_N;
          const sw = parseFloat(computed.getPropertyValue('stroke-width')) || 1.72;
          return { r, sw };
        });

        // Cancel CSS animation by clearing data-anim, then cancel any WAAPI anims
        if (rootRef.current) rootRef.current.removeAttribute('data-anim');
        stopAll();

        // Reset positions in case formation mode moved dots
        dots.forEach((dot, i) => {
          dot.setAttribute('cx', `${BASE[i].cx}`);
          dot.setAttribute('cy', `${BASE[i].cy}`);
        });
        if (d3.current) d3.current.style.display = 'none';
        if (grp.current) grp.current.style.transform = '';

        // Play WAAPI unload: shrink directly from current size to 0, left to right.
        // No peak — just a smooth ease-in collapse matching the loop timing.
        dots.forEach((dot, i) => {
          const { r, sw } = snapshots[i];
          track(dot.animate(
            [
              { r: `${r}px`, strokeWidth: `${sw}`, offset: 0 },
              { r: '0px',    strokeWidth: '0',     offset: 1 },
            ],
            { duration: OUT_DUR, delay: STAGGER * i, easing: EI, fill: 'forwards' },
          ));
        });
      },
    }));

    // ── mode effect ───────────────────────────────────────────────────────────

    useEffect(() => {
      alive.current = true;

      if (mode === 'loading') {
        // Pure CSS — just set data-anim attribute, CSS does the rest
        if (rootRef.current) {
          rootRef.current.setAttribute('data-anim', loop ? 'loop' : 'no-loop');
        }
        // Reset dots to starting state for CSS animation
        [d0, d1, d2].forEach((ref, i) => {
          if (ref.current) {
            ref.current.setAttribute('cx', `${BASE[i].cx}`);
            ref.current.setAttribute('cy', `${BASE[i].cy}`);
            ref.current.setAttribute('r', '0');
            ref.current.setAttribute('stroke-width', '0');
          }
        });
        if (d3.current) d3.current.style.display = 'none';
      } else if (mode === 'triangle') {
        void formShape(TRI);
      } else if (mode === 'square') {
        void formShape(SQ);
      } else if (mode === 'out') {
        if (rootRef.current) {
          rootRef.current.setAttribute('data-anim', 'out');
        }
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
        ref={rootRef}
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
