/**
 * Copyright IBM Corp. 2025
 *
 * ProcessingDots — animated three-dot loading indicator with formation modes.
 *
 * Baseline behaviour faithfully reproduces Carbon Labs Processing:
 *   load-in (staggered) → loop → unload
 *
 * Extended modes:
 *   "triangle" — dots arc clockwise into a rotating equilateral triangle
 *   "square"   — dots arc clockwise into a rotating square (4th dot spawns)
 *   "out"      — plays the unload sequence immediately from whatever state
 *
 * All animation is Web Animations API so "out" is always interruptible.
 *
 * Geometry — 32×32 SVG viewBox, centre = (16,16), circumradius R = 7px:
 *
 *   Triangle (point-up, angles −90°, 30°, 150°):
 *     V0 top        (16,    9   )
 *     V1 bot-right  (22.06, 19.5)
 *     V2 bot-left   ( 9.94, 19.5)
 *
 *   Square (axis-aligned, angles 0°, 90°, 180°, 270°):
 *     V0 right  (23, 16)   V1 bottom (16, 23)
 *     V2 left   ( 9, 16)   V3 top    (16,  9)
 */

import {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react';
import styles from './ProcessingDots.module.css';

// ─── Constants ────────────────────────────────────────────────────────────────

const SVG_CX = 16;
const SVG_CY = 16;
const R_SHAPE = 7;

const toRad = (deg: number) => (deg * Math.PI) / 180;
const vAt = (deg: number, r = R_SHAPE) => ({
  cx: SVG_CX + r * Math.cos(toRad(deg)),
  cy: SVG_CY + r * Math.sin(toRad(deg)),
});

const BASE = [
  { cx: 8,  cy: 16 },
  { cx: 16, cy: 16 },
  { cx: 24, cy: 16 },
] as const;

const TRI = [vAt(-90), vAt(30), vAt(150)];
const SQ  = [vAt(0), vAt(90), vAt(180), vAt(270)];

const STAGGER  = 167;   // ms between dot animations
const LOAD_DUR = 1000;
const LOOP_DUR = 1000;
const OUT_DUR  = 1000;
const FORM_DUR = 700;
const ROT_MS   = 6000;

const R0    = 0;      // hidden radius
const R_MX  = 2.5;   // peak radius
const R_RS  = 0.875; // resting radius
const SW0   = 0;
const SW1   = 1.72;

const EI = 'cubic-bezier(0, 0, 0.3, 1)';
const EO = 'cubic-bezier(0.4, 0.14, 1, 1)';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProcessingDotsMode = 'loading' | 'triangle' | 'square' | 'out';

export interface ProcessingDotsProps {
  mode?: ProcessingDotsMode;
  loop?: boolean;
  label?: string;
  className?: string;
}

export interface ProcessingDotsHandle {
  triggerOut: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Animate a circle's cx/cy along a clockwise arc through the shape circumradius.
 * Returns the Animation object.
 */
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
  if (a1 <= a0) a1 += 2 * Math.PI; // always clockwise

  const frames: Keyframe[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const a = a0 + (a1 - a0) * t;
    frames.push({
      offset: t,
      cx: `${SVG_CX + R_SHAPE * Math.cos(a)}`,
      cy: `${SVG_CY + R_SHAPE * Math.sin(a)}`,
    });
  }

  return el.animate(frames, { duration: dur, delay, easing, fill: 'forwards' });
}

// ─── Component ───────────────────────────────────────────────────────────────

export const ProcessingDots = forwardRef<ProcessingDotsHandle, ProcessingDotsProps>(
  function ProcessingDots({ mode = 'loading', loop = true, label = 'Processing', className }, ref) {

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

    // ── per-dot animators ────────────────────────────────────────────────────

    const dotArr = useCallback(
      (count = 3): SVGCircleElement[] =>
        [d0.current!, d1.current!, d2.current!, d3.current!].slice(0, count) as SVGCircleElement[],
      [],
    );

    const pulse = useCallback(
      (el: SVGCircleElement, delay = 0) =>
        track(
          el.animate(
            [
              { r: `${R_RS}`, offset: 0 },
              { r: `${R_MX}`, offset: 0.25, easing: EI },
              { r: `${R_RS}`, offset: 0.917 },
              { r: `${R_RS}`, offset: 1 },
            ],
            { duration: LOOP_DUR, delay, easing: 'linear', fill: 'forwards' },
          ),
        ),
      [track],
    );

    // ── phases ───────────────────────────────────────────────────────────────

    const loadIn = useCallback((): Promise<void> => {
      const dots = dotArr();
      const ps: Promise<unknown>[] = [];
      dots.forEach((dot, i) => {
        const d = STAGGER * i;
        ps.push(
          track(
            dot.animate(
              [
                { r: `${R0}`,  offset: 0 },
                { r: `${R_MX}`, offset: 0.25, easing: EI },
                { r: `${R_RS}`, offset: 0.833 },
                { r: `${R_RS}`, offset: 1 },
              ],
              { duration: LOAD_DUR, delay: d, easing: EI, fill: 'forwards' },
            ),
          ).finished,
          track(
            dot.animate(
              [
                { strokeWidth: SW0, offset: 0 },
                { strokeWidth: SW1, offset: 0.0833 },
                { strokeWidth: SW1, offset: 1 },
              ],
              { duration: LOAD_DUR, delay: d, easing: EI, fill: 'forwards' },
            ),
          ).finished,
        );
      });
      return Promise.all(ps).then(() => {});
    }, [dotArr, track]);

    const runLoop = useCallback(() => {
      if (!alive.current) return;
      const dots = dotArr();
      Promise.all(dots.map((dot, i) => pulse(dot, STAGGER * i).finished)).then(() => {
        if (alive.current) timer.current = setTimeout(runLoop, 0);
      });
    }, [dotArr, pulse]);

    const playOut = useCallback(
      (count = 3): Promise<void> => {
        stopAll();
        const dots = dotArr(count);
        if (grp.current) grp.current.style.transform = '';

        // Reset positions for dots that may have moved
        dots.forEach((dot, i) => {
          if (i < 3) {
            dot.setAttribute('cx', `${BASE[i].cx}`);
            dot.setAttribute('cy', `${BASE[i].cy}`);
          } else {
            dot.setAttribute('cx', '16');
            dot.setAttribute('cy', '16');
          }
          dot.setAttribute('r', `${R_RS}`);
          dot.setAttribute('stroke-width', `${SW1}`);
        });

        const ps: Promise<unknown>[] = [];
        dots.forEach((dot, i) => {
          const d = STAGGER * i;
          ps.push(
            track(
              dot.animate(
                [
                  { r: `${R_RS}`, offset: 0 },
                  { r: `${R_RS}`, offset: 0.0833 },
                  { r: `${R_MX}`, offset: 0.333, easing: EO },
                  { r: `${R0}`,   offset: 0.583 },
                  { r: `${R0}`,   offset: 1 },
                ],
                { duration: OUT_DUR, delay: d, easing: 'linear', fill: 'forwards' },
              ),
            ).finished,
            track(
              dot.animate(
                [
                  { strokeWidth: SW1, offset: 0.5 },
                  { strokeWidth: SW0, offset: 0.583 },
                  { strokeWidth: SW0, offset: 1 },
                ],
                { duration: OUT_DUR, delay: d, easing: 'linear', fill: 'forwards' },
              ),
            ).finished,
          );
        });
        return Promise.all(ps).then(() => {});
      },
      [dotArr, stopAll, track],
    );

    const formShape = useCallback(
      async (verts: typeof TRI | typeof SQ) => {
        stopAll();
        const count = verts.length;
        const dot4 = d3.current!;

        // Prepare 4th dot for square
        if (count === 4) {
          dot4.setAttribute('cx', '16');
          dot4.setAttribute('cy', '16');
          dot4.setAttribute('r', `${R_RS}`);
          dot4.setAttribute('stroke-width', `${SW1}`);
          dot4.style.display = '';
        }

        const dots = dotArr(count);
        const movePs: Promise<unknown>[] = [];

        dots.forEach((dot, i) => {
          const from = i < 3 ? BASE[i] : { cx: 16, cy: 16 };
          const to   = verts[i];
          dot.setAttribute('r', `${R_RS}`);
          dot.setAttribute('stroke-width', `${SW1}`);
          const a = arcTo(dot, from.cx, from.cy, to.cx, to.cy, FORM_DUR, EI, STAGGER * i);
          track(a);
          movePs.push(a.finished);
        });

        await Promise.all(movePs).catch(() => {});
        if (!alive.current) return;

        // Slow rotation on the group
        if (grp.current) {
          rotRef.current = grp.current.animate(
            [
              { transform: 'rotate(0deg)',   transformOrigin: '16px 16px' },
              { transform: 'rotate(360deg)', transformOrigin: '16px 16px' },
            ],
            { duration: ROT_MS, iterations: Infinity, easing: 'linear' },
          );
        }

        // Pulse loop while rotating
        const pLoop = () => {
          if (!alive.current || !rotRef.current) return;
          dots.forEach((dot, i) => pulse(dot, STAGGER * i));
          timer.current = setTimeout(pLoop, LOOP_DUR + STAGGER * (count - 1) + 50);
        };
        timer.current = setTimeout(pLoop, FORM_DUR + STAGGER * (count - 1) + 50);
      },
      [dotArr, stopAll, track, pulse],
    );

    // ── imperative handle ─────────────────────────────────────────────────────

    useImperativeHandle(ref, () => ({
      triggerOut: () => {
        void playOut(d3.current?.style.display !== 'none' ? 4 : 3);
      },
    }));

    // ── mode effect ───────────────────────────────────────────────────────────

    useEffect(() => {
      alive.current = true;

      void (async () => {
        if (mode === 'loading') {
          await loadIn();
          if (!alive.current) return;
          if (loop) {
            // small gap then loop forever
            timer.current = setTimeout(runLoop, LOAD_DUR - STAGGER * 2);
          } else {
            // play one loop cycle then unload
            const dots = dotArr();
            timer.current = setTimeout(async () => {
              await Promise.all(dots.map((dot, i) => pulse(dot, STAGGER * i).finished));
              if (alive.current) await playOut();
            }, LOAD_DUR - STAGGER * 2);
          }
        } else if (mode === 'triangle') {
          await formShape(TRI);
        } else if (mode === 'square') {
          await formShape(SQ);
        } else if (mode === 'out') {
          await playOut(d3.current?.style.display !== 'none' ? 4 : 3);
        }
      })();

      return () => {
        alive.current = false;
        stopAll();
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, loop]);

    // ── render ────────────────────────────────────────────────────────────────

    return (
      <div className={`${styles.root}${className ? ` ${className}` : ''}`} role="status" aria-label={label}>
        <svg className={styles.svg} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
          <g ref={grp}>
            <circle ref={d0} className={styles.dot} cx={BASE[0].cx} cy={BASE[0].cy} r={R0} strokeWidth={SW0} />
            <circle ref={d1} className={styles.dot} cx={BASE[1].cx} cy={BASE[1].cy} r={R0} strokeWidth={SW0} />
            <circle ref={d2} className={styles.dot} cx={BASE[2].cx} cy={BASE[2].cy} r={R0} strokeWidth={SW0} />
            <circle ref={d3} className={styles.dot} cx={16} cy={16} r={R0} strokeWidth={SW0} style={{ display: 'none' }} />
          </g>
        </svg>
      </div>
    );
  },
);

export default ProcessingDots;
