/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Processing — animated dot loading indicator with shape-formation transforms.
 *
 * All animation runs through the Web Animations API.  Every animation is
 * anchored to the document timeline via startTime so tab-switching cannot
 * drift the stagger.  triggerOut uses commitStyles() so the browser's own
 * compositor value is the single source of truth — no manual bezier math.
 *
 * Modes (prop-based):
 *   "loading"  — three-dot load-in then infinite loop
 *   "triangle" — load-in then arcs into an equilateral triangle
 *   "square"   — load-in then arcs into a square (four dots)
 *   "out"      — immediate shrink-to-zero from resting size
 *   "wiggle"   — load-in then loop, with one wiggle once the dots have landed
 *
 * Imperative handle:
 *   triggerOut()      — interrupt and shrink from wherever the dots are
 *   triggerTriangle() — arc three dots into a triangle immediately (50 ms stagger)
 *   triggerSquare()   — grow a fourth dot and arc all four into a square (50 ms stagger)
 *   triggerWiggle()   — bob each dot up 6 px and back (200 ms stagger, 400 ms per dot)
 *
 * Reduced motion: because every animation runs through the Web Animations API,
 * the CSS `prefers-reduced-motion` cascade cannot stop it.  The JS is therefore
 * authoritative — useReducedMotion() gates every sequence and each mode / handle
 * method snaps straight to its static end state instead of animating. The same
 * static path is used where the Web Animations API is unavailable (e.g. jsdom).
 */

import PropTypes from 'prop-types';
import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useState,
} from 'react';
import classNames from 'classnames';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** Tracks the prefers-reduced-motion media query (false where matchMedia is unavailable). */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia(REDUCED_MOTION_QUERY).matches
  );

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return;
    }
    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return reduced;
}

/** Whether this environment implements the Web Animations API (jsdom does not). */
const supportsWAAPI = () =>
  typeof Element !== 'undefined' &&
  typeof Element.prototype.animate === 'function';

/** Current document-timeline time in ms (0 where the timeline is unavailable). */
const timelineNow = () =>
  (document.timeline?.currentTime as number | null) ?? 0;

// ─── Geometry ─────────────────────────────────────────────────────────────────

const SVG_CX = 16;
const SVG_CY = 16;
const R_SHAPE = 7;
const R_TRI = 6; // triangle vertex radius — 1px inset from arc path
const R_SQR = 6 / Math.SQRT2; // square half-side — vertices inscribed at same radius 6

const toRad = (deg: number) => (deg * Math.PI) / 180;
const vAt = (deg: number, r = R_SHAPE) => ({
  cx: SVG_CX + r * Math.cos(toRad(deg)),
  cy: SVG_CY + r * Math.sin(toRad(deg)),
});

// Resting positions (8, 16, 24) — unchanged from Processing v1
const BASE = [
  { cx: 8, cy: 16 },
  { cx: 16, cy: 16 },
  { cx: 24, cy: 16 },
] as const;

// Triangle vertices — all dots depart from 180° clockwise, stopping at:
//   dot 0: 180° → 150°  (330° sweep)
//   dot 1: 180° →  30°  (210° sweep)
//   dot 2: 180° → 270°  ( 90° sweep)
// Vertices sit at R_TRI (1px inset from the arc path radius R_SHAPE).
const TRI = [vAt(150, R_TRI), vAt(30, R_TRI), vAt(-90, R_TRI)] as const;

// Square vertices — ordered by clockwise arc sweep from 180°, longest first:
//   dot 0 → lower-left  (−x, +y)  315° sweep
//   dot 1 → lower-right (+x, +y)  225° sweep
//   dot 2 → upper-right (+x, −y)  135° sweep
//   dot 3 → upper-left  (−x, −y)   45° sweep
const SQR = [
  { cx: SVG_CX - R_SQR, cy: SVG_CY + R_SQR }, // dot 0 → lower-left
  { cx: SVG_CX + R_SQR, cy: SVG_CY + R_SQR }, // dot 1 → lower-right
  { cx: SVG_CX + R_SQR, cy: SVG_CY - R_SQR }, // dot 2 → upper-right
  { cx: SVG_CX - R_SQR, cy: SVG_CY - R_SQR }, // dot 3 → upper-left
] as const;

// ─── Timing ───────────────────────────────────────────────────────────────────

const STAGGER = 200; // ms stagger between dots
const LOAD_DUR = 1000; // load-in duration per dot
const LOOP_DUR = 1000; // loop cycle duration per dot
const OUT_STAGGER = 50; // ms stagger between dots for the out animation
const OUT_DUR = 100; // out animation per dot
const FORM_DUR = 700; // duration of each dot's formation move (slide + arc)
const FORM_STAGGER = 50; // ms between each dot starting its formation move
const SLIDE_FRAC = 0.25; // fraction of FORM_DUR spent on the straight slide (dots 1+)
const ROT_DUR = 8000; // one full rotation period (ms)
const RAMP_LEAD = 200; // ms by which rotation ramp finishes before last dot lands

// ─── Dot appearance ───────────────────────────────────────────────────────────

const R0 = '0px';
const R_RS = '0.875px'; // resting radius
const R_MX = '2.5px'; // peak radius
const SW0 = '0';
const SW1 = '1.72'; // stroke-width at resting/peak size

// ─── Easings ─────────────────────────────────────────────────────────────────

const EI = 'cubic-bezier(0, 0, 0.3, 1)'; // expressive-entrance (growth, ramp)
const EO = 'cubic-bezier(0.4, 0.14, 1, 1)'; // expressive-exit     (unload)
const EF = 'cubic-bezier(0.4, 0.14, 0.3, 1)'; // expressive-standard (formation move)
const LIN = 'linear';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProcessingMode =
  | 'loading'
  | 'triangle'
  | 'square'
  | 'out'
  | 'wiggle';

export interface ProcessingProps {
  /** Animation state. Controls which sequence runs on mount. @defaultValue 'loading' */
  mode?: ProcessingMode;
  /** Whether the loading loop repeats indefinitely. Only applies in `loading` mode. @defaultValue true */
  loop?: boolean;
  /** Accessible label for the status region. @defaultValue 'Processing' */
  label?: string;
  /** Apply AI color treatment: blue-80 on light themes, blue-20 on dark themes. @defaultValue false */
  ai?: boolean;
  /** Additional CSS class applied to the root element. */
  className?: string;
}

export interface ProcessingHandle {
  /** Shrink all visible dots to zero from their current positions. */
  triggerOut: () => void;
  /** Arc the three dots into an equilateral triangle immediately. 50 ms left-to-right stagger. */
  triggerTriangle: () => void;
  /** Grow a fourth dot and arc all four into a square. 50 ms left-to-right stagger. */
  triggerSquare: () => void;
  /** Bob each dot up 6 px and back. 200 ms left-to-right stagger, 400 ms per dot. */
  triggerWiggle: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a keyframe sequence for one dot's formation move:
 *   slide — straight line from fromPos to the arc entry point (0 → slideFrac)
 *   arc   — clockwise sweep from 180° toward target, spiralling inward from
 *           R_SHAPE to R_TRI over the arc segment (slideFrac → 1)
 *
 * When slideFrac === 0 the sequence is a pure arc (no slide needed).
 */
function buildFormationFrames(
  fromPos: { cx: number; cy: number },
  target: { cx: number; cy: number },
  slideFrac: number
): Keyframe[] {
  const FROM_DEG = 180;
  const entryRad = toRad(FROM_DEG);
  const entryCx = SVG_CX + R_SHAPE * Math.cos(entryRad);
  const entryCy = SVG_CY + R_SHAPE * Math.sin(entryRad);

  const a0 = toRad(FROM_DEG);
  let a1 = Math.atan2(target.cy - SVG_CY, target.cx - SVG_CX);
  if (a1 <= a0) {
    a1 += 2 * Math.PI;
  } // ensure clockwise

  const ARC_STEPS = 60;
  const frames: Keyframe[] = [];

  if (slideFrac > 0) {
    frames.push({ offset: 0, cx: `${fromPos.cx}px`, cy: `${fromPos.cy}px` });
    frames.push({ offset: slideFrac, cx: `${entryCx}px`, cy: `${entryCy}px` });
  }

  for (let i = 0; i <= ARC_STEPS; i++) {
    const t = i / ARC_STEPS;
    const offset = slideFrac + (1 - slideFrac) * t;
    const a = a0 + (a1 - a0) * t;
    const r = R_SHAPE + (R_TRI - R_SHAPE) * t; // spiral inward
    const cx =
      i === 0 && slideFrac === 0 ? fromPos.cx : SVG_CX + r * Math.cos(a);
    const cy =
      i === 0 && slideFrac === 0 ? fromPos.cy : SVG_CY + r * Math.sin(a);
    frames.push({ offset, cx: `${cx}px`, cy: `${cy}px` });
  }

  return frames;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Processing = forwardRef<ProcessingHandle, ProcessingProps>(
  function Processing(
    {
      mode = 'loading',
      loop = true,
      label = 'Processing',
      ai = false,
      className,
      ...rest
    },
    ref
  ) {
    const prefix = usePrefix();
    const blockClass = `${prefix}--processing`;

    const prefersReducedMotion = useReducedMotion();
    // Paint static end states when motion is reduced or WAAPI is missing.
    const staticOnly = prefersReducedMotion || !supportsWAAPI();

    const d0 = useRef<SVGCircleElement>(null);
    const d1 = useRef<SVGCircleElement>(null);
    const d2 = useRef<SVGCircleElement>(null);
    const d3 = useRef<SVGCircleElement>(null);
    const grp = useRef<SVGGElement>(null);

    const anims = useRef<Animation[]>([]);
    const rotRef = useRef<Animation | null>(null);
    const alive = useRef(true);
    const runId = useRef(0); // bumped per mode run so stale async sequences retire
    const loopGen = useRef(0); // bump to retire pulse chains without cancelling mid-cycle
    const sqGen = useRef(0); // retires the fourth dot's pulse chain on re-trigger
    const outTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
      undefined
    );
    const loadT0 = useRef(0); // document-timeline origin set by runLoading
    const formed = useRef(false); // true once triggerTriangle/triggerSquare has fired

    // ── helpers ───────────────────────────────────────────────────────────────

    const stopAll = useCallback(() => {
      anims.current.forEach((a) => {
        try {
          a.cancel();
        } catch {
          // already finished or cancelled
        }
      });
      anims.current = [];
      if (rotRef.current) {
        try {
          rotRef.current.cancel();
        } catch {
          // already finished or cancelled
        }
        rotRef.current = null;
      }
    }, []);

    const track = useCallback((a: Animation) => {
      anims.current.push(a);
      void a.finished
        .catch(() => {})
        .finally(() => (anims.current = anims.current.filter((x) => x !== a)));
      return a;
    }, []);

    /**
     * Snapshot the current run. The returned check turns false once the
     * component unmounts or a new mode run starts — `alive` alone is not
     * enough, because the next run's effect flips it straight back to true.
     */
    const liveCheck = useCallback(() => {
      const id = runId.current;
      return () => alive.current && runId.current === id;
    }, []);

    /** Resolve once the document timeline reaches `time` (ms). */
    const waitUntil = useCallback(
      (time: number) =>
        new Promise<void>((resolve) => {
          const wait = () => {
            const remaining = time - timelineNow();
            if (remaining <= 0) {
              resolve();
              return;
            }
            setTimeout(wait, remaining);
          };
          wait();
        }),
      []
    );

    const dots3 = useCallback(
      (): SVGCircleElement[] => [d0.current!, d1.current!, d2.current!],
      []
    );

    const dots4 = useCallback(
      (): SVGCircleElement[] => [
        d0.current!,
        d1.current!,
        d2.current!,
        d3.current!,
      ],
      []
    );

    // ── reduced-motion static states ──────────────────────────────────────────

    /**
     * Cancel everything and paint one static end state. Used whenever the user
     * has asked for reduced motion: the indicator must stay visible and legible
     * and must still communicate the mode's end state — it just must not move.
     *
     *   loading  — three dots at BASE, resting radius
     *   triangle — three dots at the TRI vertices, resting radius
     *   square   — four dots at the SQR vertices, resting radius
     *   out      — every dot at zero radius
     */
    const snapStatic = useCallback(
      (shape: 'loading' | 'triangle' | 'square' | 'out') => {
        const ds = dots4();
        if (ds.some((d) => !d)) {
          return;
        }

        stopAll();
        ds.forEach((d) =>
          d.getAnimations?.().forEach((a) => {
            try {
              a.cancel();
            } catch {
              // already finished or cancelled
            }
          })
        );
        if (grp.current) {
          grp.current.getAnimations?.().forEach((a) => {
            try {
              a.cancel();
            } catch {
              // already finished or cancelled
            }
          });
          grp.current.style.transform = '';
        }

        // Visible dot count and target positions per shape.
        const positions =
          shape === 'triangle'
            ? TRI
            : shape === 'square'
              ? SQR
              : shape === 'loading'
                ? BASE
                : null; // 'out' — nothing visible

        ds.forEach((d, i) => {
          const pos = positions?.[i] ?? BASE[Math.min(i, 2)];
          const visible = positions != null && i < positions.length;
          d.style.cssText = '';
          d.setAttribute('cx', `${pos.cx}`);
          d.setAttribute('cy', `${pos.cy}`);
          d.setAttribute('r', visible ? R_RS : '0');
          d.setAttribute('stroke-width', visible ? SW1 : '0');
        });
      },
      [dots4, stopAll]
    );

    // ── single-dot animators ──────────────────────────────────────────────────

    const animateLoadIn = useCallback(
      (dot: SVGCircleElement, startTime: number) => {
        const anim = track(
          dot.animate(
            [
              { r: R0, strokeWidth: SW0, offset: 0, easing: EI },
              { r: R_MX, strokeWidth: SW1, offset: 0.25, easing: EI },
              { r: R_RS, strokeWidth: SW1, offset: 0.833, easing: LIN },
              { r: R_RS, strokeWidth: SW1, offset: 1 },
            ],
            { duration: LOAD_DUR, fill: 'forwards' }
          )
        );
        anim.startTime = startTime;
        return anim;
      },
      [track]
    );

    const animateLoopCycle = useCallback(
      (dot: SVGCircleElement, startTime: number): Animation => {
        const anim = track(
          dot.animate(
            [
              { r: R_RS, offset: 0, easing: EI },
              { r: R_MX, offset: 0.25, easing: EI },
              { r: R_RS, offset: 0.917, easing: LIN },
              { r: R_RS, offset: 1 },
            ],
            { duration: LOOP_DUR, fill: 'forwards' }
          )
        );
        anim.startTime = startTime;
        return anim;
      },
      [track]
    );

    const animateOut = useCallback(
      (dot: SVGCircleElement, startTime: number) => {
        const committedR = dot.style.r || dot.getAttribute('r') || '0px';
        const rNum = parseFloat(committedR);
        track(
          dot.animate(
            [
              { r: committedR, strokeWidth: rNum > 0.01 ? SW1 : SW0 },
              { r: R0, strokeWidth: SW0 },
            ],
            { duration: OUT_DUR, fill: 'forwards', easing: EO }
          )
        ).startTime = startTime;
      },
      [track]
    );

    // ── rotation helpers ──────────────────────────────────────────────────────

    /**
     * Start the rotation ramp on the group: ease-in from 0° over rampDur ms.
     * Returns RAMP_DEG so the caller can hand off to the infinite loop later.
     */
    const startRotationRamp = useCallback(
      (nDots: number, phaseStart: number): number => {
        const formWindow = FORM_DUR + FORM_STAGGER * (nDots - 1);
        const rampDur = formWindow - RAMP_LEAD;
        const rampDeg = (rampDur / ROT_DUR) * 360;
        if (grp.current) {
          const ramp = grp.current.animate(
            [
              { transform: 'rotate(0deg)', transformOrigin: '16px 16px' },
              {
                transform: `rotate(${rampDeg}deg)`,
                transformOrigin: '16px 16px',
              },
            ],
            { duration: rampDur, fill: 'forwards', easing: EI }
          );
          ramp.startTime = phaseStart;
          track(ramp);
        }
        return rampDeg;
      },
      [track]
    );

    /** Cancel the ramp and start the infinite linear rotation from rampDeg. */
    const startInfiniteRotation = useCallback((rampDeg: number) => {
      if (!grp.current) {
        return;
      }
      grp.current.getAnimations().forEach((a) => {
        try {
          a.cancel();
        } catch {
          // already finished or cancelled
        }
      });
      rotRef.current = grp.current.animate(
        [
          { transform: `rotate(${rampDeg}deg)`, transformOrigin: '16px 16px' },
          {
            transform: `rotate(${rampDeg + 360}deg)`,
            transformOrigin: '16px 16px',
          },
        ],
        { duration: ROT_DUR, iterations: Infinity, easing: 'linear' }
      );
    }, []);

    // ── phase sequences ───────────────────────────────────────────────────────

    /**
     * Load-in then loop (forever or one cycle then out).
     * Chain per dot:
     *   load-in  startTime = t0 + STAGGER*i
     *   loop n   startTime = t0 + STAGGER*i + LOAD_DUR + LOOP_DUR*n
     */
    const runLoading = useCallback(
      (loopForever: boolean) => {
        const live = liveCheck();
        const ds = dots3();
        const t0 = timelineNow();
        loadT0.current = t0;

        ds.forEach((d, i) => animateLoadIn(d, t0 + STAGGER * i));

        const loopDot = (
          d: SVGCircleElement,
          idx: number,
          cycleIndex: number
        ) => {
          if (!live()) {
            return;
          }
          const absStart =
            t0 + STAGGER * idx + LOAD_DUR + LOOP_DUR * cycleIndex;
          const anim = animateLoopCycle(d, absStart);
          void anim.finished
            .then(() => {
              if (!live()) {
                return;
              }
              if (loopForever) {
                loopDot(d, idx, cycleIndex + 1);
              } else {
                const outStart = timelineNow() + OUT_STAGGER * idx;
                try {
                  anim.commitStyles();
                } catch {
                  // already finished or cancelled
                }
                anim.cancel();
                animateOut(d, outStart);
              }
            })
            .catch(() => {});
        };

        ds.forEach((d, i) => loopDot(d, i, 0));
        return t0;
      },
      [liveCheck, dots3, animateLoadIn, animateLoopCycle, animateOut]
    );

    /**
     * Triangle formation (prop mode="triangle"):
     *   Phase 1 — load-in with left→centre→right stagger.
     *   Phase 2 — pulse loop starts immediately after load-in per dot.
     *   Phase 3 — cx/cy formation moves + rotation ramp (after last load-in).
     *   Phase 4 — formation done: hand off to infinite rotation; switch to
     *             clockwise pulse stagger (top→BR→BL).
     */
    const runTriangle = useCallback(async () => {
      const live = liveCheck();
      const ds = dots3();
      const t0 = timelineNow();
      loadT0.current = t0;

      ds.forEach((d, i) => animateLoadIn(d, t0 + STAGGER * i));

      const gen2 = ++loopGen.current;
      const startLoopCycle = (
        d: SVGCircleElement,
        idx: number,
        cycleIndex: number
      ) => {
        if (!live() || loopGen.current !== gen2) {
          return;
        }
        const absStart = t0 + STAGGER * idx + LOAD_DUR + LOOP_DUR * cycleIndex;
        const anim = animateLoopCycle(d, absStart);
        void anim.finished
          .then(() => startLoopCycle(d, idx, cycleIndex + 1))
          .catch(() => {});
      };
      ds.forEach((d, i) => startLoopCycle(d, i, 0));

      await waitUntil(t0 + STAGGER * 2 + LOAD_DUR);
      if (!live()) {
        return;
      }

      const phaseStart = timelineNow();
      const rampDeg = startRotationRamp(3, phaseStart);

      const formAnims = ds.map((d, i) => {
        const frames = buildFormationFrames(
          BASE[i],
          TRI[i],
          i === 0 ? 0 : SLIDE_FRAC
        );
        const anim = d.animate(frames, {
          duration: FORM_DUR,
          fill: 'forwards',
          easing: EF,
        });
        anim.startTime = phaseStart + FORM_STAGGER * i;
        track(anim);
        return anim;
      });

      await Promise.all(formAnims.map((a) => a.finished)).catch(() => {});
      if (!live()) {
        return;
      }

      startInfiniteRotation(rampDeg);

      // Switch to clockwise pulse stagger: top (dot2) → BR (dot1) → BL (dot0)
      const cwGen = ++loopGen.current;
      const now = timelineNow();
      const CW_SLOT = [2, 1, 0];
      const syncBase = Math.min(
        ...ds.map((_, i) => {
          const origin = t0 + STAGGER * i + LOAD_DUR;
          const cyclesDone = Math.ceil((now - origin) / LOOP_DUR);
          return origin + cyclesDone * LOOP_DUR;
        })
      );
      ds.forEach((d, i) => {
        const startCW = (cycleIndex: number) => {
          if (!live() || loopGen.current !== cwGen) {
            return;
          }
          const absStart =
            syncBase + STAGGER * CW_SLOT[i] + LOOP_DUR * cycleIndex;
          const anim = animateLoopCycle(d, absStart);
          void anim.finished
            .then(() => startCW(cycleIndex + 1))
            .catch(() => {});
        };
        startCW(0);
      });
    }, [
      liveCheck,
      waitUntil,
      dots3,
      animateLoadIn,
      animateLoopCycle,
      startRotationRamp,
      startInfiniteRotation,
      track,
    ]);

    /**
     * Grow a fourth dot and arc all four into a square. Shared by
     * triggerSquare() and mode="square".
     */
    const formSquare = useCallback(() => {
      const live = liveCheck();
      const ds3 = dots3();
      const dot3 = d3.current!;
      const phaseStart = timelineNow();

      // Reset dot 3 to hidden, then grow it in as it sweeps to its vertex.
      dot3.style.cssText = '';
      dot3.setAttribute('r', '0');
      dot3.setAttribute('stroke-width', '0');
      dot3.setAttribute('cx', `${BASE[2].cx}`);
      dot3.setAttribute('cy', `${BASE[2].cy}`);

      animateLoadIn(dot3, phaseStart);

      // Pulse for dot 3 — anchored to the loadT0 grid at slot 3 so all four
      // dots stay evenly spaced at STAGGER intervals. It has its own
      // generation so re-triggering retires it without stopping dots 0–2.
      const gen = ++sqGen.current;
      const slot3Origin = loadT0.current + STAGGER * 3 + LOAD_DUR;
      const firstCycle = Math.max(
        0,
        Math.ceil((phaseStart + LOAD_DUR - slot3Origin) / LOOP_DUR)
      );
      const startLoop3 = (cycleIndex: number) => {
        if (!live() || sqGen.current !== gen) {
          return;
        }
        const anim = animateLoopCycle(
          dot3,
          slot3Origin + LOOP_DUR * cycleIndex
        );
        void anim.finished
          .then(() => startLoop3(cycleIndex + 1))
          .catch(() => {});
      };
      startLoop3(firstCycle);

      // Position track for all four dots — pulse is untouched.
      const rampDeg = startRotationRamp(4, phaseStart);
      const allDots = [...ds3, dot3];
      const formAnims = allDots.map((d, i) => {
        const fromCx = parseFloat(
          d.getAttribute('cx') ?? `${BASE[Math.min(i, 2)].cx}`
        );
        const fromCy = parseFloat(
          d.getAttribute('cy') ?? `${BASE[Math.min(i, 2)].cy}`
        );
        const frames = buildFormationFrames(
          { cx: fromCx, cy: fromCy },
          SQR[i],
          SLIDE_FRAC
        );
        const anim = d.animate(frames, {
          duration: FORM_DUR,
          fill: 'forwards',
          easing: EF,
        });
        anim.startTime = phaseStart + FORM_STAGGER * i;
        track(anim);
        return anim;
      });

      void Promise.all(formAnims.map((a) => a.finished))
        .then(() => {
          if (!live()) {
            return;
          }
          startInfiniteRotation(rampDeg);
        })
        .catch(() => {});
    }, [
      liveCheck,
      dots3,
      animateLoadIn,
      animateLoopCycle,
      startRotationRamp,
      startInfiniteRotation,
      track,
    ]);

    /** Bob each dot up 6 px and back. Shared by triggerWiggle() and mode="wiggle". */
    const wiggle = useCallback(() => {
      const ds = dots3();
      const phaseStart = timelineNow();

      ds.forEach((d, i) => {
        const fromCy = parseFloat(d.getAttribute('cy') ?? `${BASE[i].cy}`);
        const anim = d.animate(
          [
            { offset: 0, cy: `${fromCy}px`, easing: EF },
            { offset: 0.5, cy: `${fromCy - 6}px`, easing: EF },
            { offset: 1, cy: `${fromCy}px` },
          ],
          { duration: 400, fill: 'forwards' }
        );
        anim.startTime = phaseStart + FORM_STAGGER * 4 * i;
        track(anim);
      });
    }, [dots3, track]);

    /**
     * Load in, then run `then` once the last dot has landed — used by the
     * mount-time modes that start from the loading state.
     */
    const runLoadingThen = useCallback(
      async (then: () => void) => {
        const live = liveCheck();
        const t0 = runLoading(true);
        await waitUntil(t0 + STAGGER * 2 + LOAD_DUR);
        if (live()) {
          then();
        }
      },
      [liveCheck, runLoading, waitUntil]
    );

    // ── imperative handle ─────────────────────────────────────────────────────

    useImperativeHandle(ref, () => ({
      triggerOut: () => {
        if (staticOnly) {
          snapStatic('out');
          return;
        }
        const ds = dots4();
        const now = timelineNow();

        // Lock each dot's current cx/cy into its presentation attribute before
        // cancelling. Formation animations are fill:'forwards' — without this,
        // cancel() would revert cx/cy to the BASE presentation attribute.
        ds.forEach((d) => {
          for (const a of d.getAnimations()) {
            const effect = a.effect as KeyframeEffect | null;
            const frames = effect?.getKeyframes() ?? [];
            if (!frames.some((f) => f.cx !== undefined || f.cy !== undefined)) {
              continue;
            }
            const last = frames[frames.length - 1];
            if (last?.cx != null) {
              d.setAttribute('cx', String(last.cx));
            }
            if (last?.cy != null) {
              d.setAttribute('cy', String(last.cy));
            }
          }
        });

        // Commit r/strokeWidth then cancel all dot animations.
        // stopAll() is NOT called — it would also cancel rotRef immediately.
        ds.forEach((d) => {
          d.getAnimations().forEach((a) => {
            try {
              a.commitStyles();
            } catch {
              // already finished or cancelled
            }
            try {
              a.cancel();
            } catch {
              // already finished or cancelled
            }
          });
        });
        anims.current.forEach((a) => {
          try {
            a.cancel();
          } catch {
            // already finished or cancelled
          }
        });
        anims.current = [];

        ds.forEach((d, i) => animateOut(d, now + OUT_STAGGER * i));

        // Cancel group rotation only after the last dot has disappeared — and
        // only the rotation that was running now, not one started since.
        const rot = rotRef.current;
        clearTimeout(outTimer.current);
        outTimer.current = setTimeout(
          () => {
            if (rot && rotRef.current === rot) {
              try {
                rot.cancel();
              } catch {
                // already finished or cancelled
              }
              rotRef.current = null;
            }
          },
          OUT_STAGGER * (ds.length - 1) + OUT_DUR
        );
      },

      triggerTriangle: () => {
        if (!alive.current) {
          return;
        }
        formed.current = true;
        if (staticOnly) {
          snapStatic('triangle');
          return;
        }
        const live = liveCheck();
        const ds = dots3();
        const phaseStart = timelineNow();
        const rampDeg = startRotationRamp(3, phaseStart);

        // Position track only — pulse is left completely untouched.
        const formAnims = ds.map((d, i) => {
          const fromCx = parseFloat(d.getAttribute('cx') ?? `${BASE[i].cx}`);
          const fromCy = parseFloat(d.getAttribute('cy') ?? `${BASE[i].cy}`);
          const frames = buildFormationFrames(
            { cx: fromCx, cy: fromCy },
            TRI[i],
            i === 0 ? 0 : SLIDE_FRAC
          );
          const anim = d.animate(frames, {
            duration: FORM_DUR,
            fill: 'forwards',
            easing: EF,
          });
          anim.startTime = phaseStart + FORM_STAGGER * i;
          track(anim);
          return anim;
        });

        void Promise.all(formAnims.map((a) => a.finished))
          .then(() => {
            if (!live()) {
              return;
            }
            startInfiniteRotation(rampDeg);
          })
          .catch(() => {});
      },

      triggerSquare: () => {
        if (!alive.current) {
          return;
        }
        formed.current = true;
        if (staticOnly) {
          snapStatic('square');
          return;
        }
        formSquare();
      },

      triggerWiggle: () => {
        // A wiggle is pure motion with no end state — nothing to snap to.
        if (!alive.current || formed.current || staticOnly) {
          return;
        }
        wiggle();
      },
    }));

    // ── mode effect ───────────────────────────────────────────────────────────

    useEffect(() => {
      alive.current = true;
      runId.current += 1;
      formed.current = false;

      // Reset all dots to invisible baseline, clearing any committed inline styles.
      dots4().forEach((d, i) => {
        d.style.cssText = '';
        d.setAttribute('r', '0');
        d.setAttribute('stroke-width', '0');
        d.setAttribute('cx', `${(BASE[i] ?? BASE[2]).cx}`);
        d.setAttribute('cy', `${(BASE[i] ?? BASE[2]).cy}`);
      });
      if (grp.current) {
        grp.current.style.transform = '';
      }

      const cleanup = () => {
        alive.current = false;
        clearTimeout(outTimer.current);
        stopAll();
      };

      if (staticOnly) {
        // Static end state only — no load-in, no pulse, no rotation. A wiggle
        // has no end state of its own, so it rests as the loading dots.
        snapStatic(mode === 'wiggle' ? 'loading' : mode);
        return cleanup;
      }

      if (mode === 'loading') {
        void runLoading(loop);
      } else if (mode === 'triangle') {
        void runTriangle();
      } else if (mode === 'square') {
        formed.current = true;
        void runLoadingThen(formSquare);
      } else if (mode === 'wiggle') {
        void runLoadingThen(wiggle);
      } else if (mode === 'out') {
        const t0 = timelineNow();
        dots3().forEach((d, i) => {
          d.setAttribute('r', R_RS);
          d.setAttribute('stroke-width', SW1);
          animateOut(d, t0 + OUT_STAGGER * i);
        });
      }

      return cleanup;
      // Re-runs when the mode changes or the reduced-motion preference flips, so
      // the component settles into the correct static / animated state either way.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, loop, staticOnly]);

    // ── render ────────────────────────────────────────────────────────────────

    return (
      <div
        className={classNames(blockClass, className)}
        role="status"
        aria-label={label}
        {...(ai ? { 'data-ai': '' } : {})}
        {...rest}>
        <svg
          className={`${blockClass}__dots`}
          viewBox="0 0 32 32"
          aria-hidden="true"
          focusable="false">
          <g ref={grp} className={`${blockClass}__group`}>
            <circle
              ref={d0}
              className={`${blockClass}__dot ${blockClass}__dot--left`}
              cx={BASE[0].cx}
              cy={BASE[0].cy}
              r="0"
              strokeWidth="0"
            />
            <circle
              ref={d1}
              className={`${blockClass}__dot ${blockClass}__dot--center`}
              cx={BASE[1].cx}
              cy={BASE[1].cy}
              r="0"
              strokeWidth="0"
            />
            <circle
              ref={d2}
              className={`${blockClass}__dot ${blockClass}__dot--right`}
              cx={BASE[2].cx}
              cy={BASE[2].cy}
              r="0"
              strokeWidth="0"
            />
            <circle
              ref={d3}
              className={`${blockClass}__dot`}
              cx={BASE[2].cx}
              cy={BASE[2].cy}
              r="0"
              strokeWidth="0"
            />
          </g>
        </svg>
      </div>
    );
  }
);

Processing.displayName = 'Processing';
Processing.propTypes = {
  /**
   * Apply AI color treatment: blue-80 on light themes, blue-20 on dark themes
   */
  ai: PropTypes.bool,
  /**
   * Additional CSS class applied to the root element
   */
  className: PropTypes.string,
  /**
   * Accessible label for the status region
   */
  label: PropTypes.string,
  /**
   * Specify whether the animation should loop (applies in loading mode)
   */
  loop: PropTypes.bool,
  /**
   * Animation state. Controls which sequence runs on mount.
   */
  mode: PropTypes.oneOf(['loading', 'triangle', 'square', 'out', 'wiggle']),
};

export default Processing;
