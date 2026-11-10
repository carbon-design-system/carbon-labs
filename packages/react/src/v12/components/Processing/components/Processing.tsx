/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type CSSProperties,
} from 'react';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import { LOADER_KIT, useKitProps } from '@carbon-labs/react-kit-defaults';
import { useLoopVisibility } from '@carbon-labs/react-util';
import {
  PROCESSING_RINGS,
  canAnimate,
  createProcessingEngine,
  processingRing,
  type ProcessingEngine,
  type ProcessingMode,
} from './processingEngine';
import './processing.scss';

/* ============================================================================
 * Processing — the working mark: three dots that load in and pulse on the
 * loading clock until the host moves them to another state. The markup and
 * the props only; the
 * choreography is in processingEngine.ts, which has no React in it.
 *
 *   mode     the state to be in. On mount the dots load in and go there; a
 *            later change animates from wherever they are, as the handle does:
 *              loading   three dots pulsing in a line
 *              triangle  the dots swing round on arcs into a turning triangle
 *              square    a fourth dot grows in; all four swing into a square
 *              out       they shrink to nothing; any later mode loads in again
 *            Every change is one swing from wherever the dots are, clockwise
 *            on arcs, with the pulse carrying on; a change mid-swing swings
 *            on from there. The wiggle is a one-off, so it is the handle's
 *            only (`triggerWiggle`): up from the line, out from the centre
 *            in a shape
 *   color    `currentColor`: the mark takes the text color where it sits
 *   variant  `neutral` (default): that colour. `hero`: the dots in the
 *            kit's brand, `--cds-hero-loader` (styles/_brand.scss), as every
 *            hero loader. Not given: `KitDefaults variant`, else neutral
 *   size     32px, the standard, or 16px, the small fallback (a status row
 *            under 24px tall). The drawing is 32 units; 16px draws it
 *            at half, so a resting dot is about 1.7px across. At 16px the
 *            dots are solid: a ring that small reads as a smudge at the
 *            pulse's peak
 *   motion   the feedback family's: slow motion multiplies every clock (a
 *            change retimes the mark in place, the pulse, the spin and any
 *            move keeping their phase); reduced motion paints each state's
 *            still picture — the line's three dots, the triangle's or the
 *            square's vertices — and `out` hides them at once. The wiggle
 *            does nothing then
 *   rtl      the drawing mirrors: the stagger runs right to left and the
 *            spin turns counter-clockwise
 * ========================================================================== */

export type { ProcessingMode };

/** 32px is the standard; 16px is the small fallback. */
export type ProcessingSize = 16 | 32;

/** The mark's treatment, the loaders' pair: `neutral` (the host's colour) or `hero` (the kit's brand). */
export type ProcessingVariant = 'neutral' | 'hero';

export interface ProcessingProps {
  /** The state to be in; a change animates from the current state. Default `loading`. */
  mode?: ProcessingMode;
  /** Whether the loading loop repeats. `false` runs one cycle, then shrinks out. A change restarts it. Default true. */
  loop?: boolean;
  /** Status text for assistive technology; a change is announced. Default "Processing". */
  label?: string;
  /** The mark's size, px: 32 (default, the standard) or 16 (the small fallback). */
  size?: ProcessingSize;
  /** `neutral` (default): the dots in the host's colour. `hero`: in the kit's brand (IBM blue by default; `KitDefaults brand`). Not given: `KitDefaults variant`, else neutral. */
  variant?: ProcessingVariant;
  /** Additional class names, on the root. */
  className?: string;
  style?: CSSProperties;
  /**
   * Called when the state set by `mode` is reached. Not called for a mode
   * superseded before it lands, or for handle calls (those return
   * promises). (Not `onTransitionEnd`: that is the DOM's transitionend event's name.)
   */
  onModeEnd?: (mode: ProcessingMode) => void;
}

/**
 * Every method resolves `true` once its state is reached, or `false` if it
 * is superseded (another request, `triggerOut()`, unmount). A request made
 * during a move takes over at once, from wherever the dots are; the wiggle
 * alone waits for the move to land. `triggerOut()` interrupts at once.
 */
export interface ProcessingHandle {
  /** Shrink every visible dot to nothing, from wherever it is. */
  triggerOut: () => Promise<boolean>;
  /** Form a turning triangle, from the line or the square. */
  triggerTriangle: () => Promise<boolean>;
  /** Form a turning square, from the line or the triangle: a fourth dot grows in. */
  triggerSquare: () => Promise<boolean>;
  /**
   * Move each dot out and back, one after another: up from the line, out from the centre in a
   * triangle or a square (half as far). Asked for mid-move, it bobs once the move lands.
   */
  triggerWiggle: () => Promise<boolean>;
  /** Unwind a triangle or a square back into the pulsing line. */
  triggerLoading: () => Promise<boolean>;
}

const DOTS = [0, 1, 2, 3];
/** Each dot's rings: the pulse is their scale (processingEngine.ts). */
const RINGS = Array.from({ length: PROCESSING_RINGS }, (_, k) =>
  processingRing(k)
);

export const Processing = forwardRef<ProcessingHandle, ProcessingProps>(
  function Processing(
    {
      mode = 'loading',
      loop = true,
      label = 'Processing',
      size = 32,
      variant: variantProp,
      className,
      style,
      onModeEnd,
    },
    ref
  ) {
    // KitDefaults: the provider's variant when none is given; every loader is neutral by default.
    const { variant = 'neutral' } = useKitProps(
      { variant: variantProp },
      LOADER_KIT
    );
    const { reduced, timeScale } = useFeedbackMotion();
    const rootRef = useRef<HTMLDivElement>(null);
    const group = useRef<SVGGElement>(null);
    const dots = useRef<SVGGElement[]>([]);
    const engine = useRef<ProcessingEngine | null>(null);
    const scale = useRef(timeScale);
    const onEnd = useRef(onModeEnd);
    useLayoutEffect(() => {
      onEnd.current = onModeEnd;
      scale.current = timeScale;
    });

    // Off screen, closed or the page hidden: the pulses and the spin hold, and come back on the page's phase.
    const loopVis = useLoopVisibility(rootRef);
    // Before the first paint (layout effects): the engine draws the dots at nothing, so no frame shows
    // them whole before it starts (a passive effect would run after the first paint when nothing else
    // forces a sync re-render on mount).
    useLayoutEffect(() => {
      const e = createProcessingEngine(group.current!, dots.current, {
        timeScale: () => scale.current,
        onLoops: () => loopVis.refresh(),
      });
      engine.current = e;
      return () => {
        e.destroy();
        engine.current = null;
      };
    }, [loopVis]);

    // Slow motion retimes in place; a change of loop or reduced motion restarts;
    // a mode change moves. Each engine is set going once (StrictMode makes two).
    const was = useRef({ mode, loop, reduced, timeScale });
    const started = useRef<ProcessingEngine | null>(null);
    useLayoutEffect(() => {
      const e = engine.current;
      if (!e) return;
      const prev = was.current;
      was.current = { mode, loop, reduced, timeScale };
      if (prev.timeScale !== timeScale) e.retime();
      if (
        started.current === e &&
        prev.mode === mode &&
        prev.loop === loop &&
        prev.reduced === reduced
      )
        return;
      started.current = e;
      void e
        .setMode(mode, loop, reduced || !canAnimate())
        .then((landed) => landed && onEnd.current?.(mode));
    }, [mode, loop, reduced, timeScale]);

    useImperativeHandle(ref, () => {
      const call = (fn: (e: ProcessingEngine) => Promise<boolean>) => () =>
        engine.current ? fn(engine.current) : Promise.resolve(false);
      return {
        triggerOut: call((e) => e.out()),
        triggerTriangle: call((e) => e.toTriangle()),
        triggerSquare: call((e) => e.toSquare()),
        triggerWiggle: call((e) => e.wiggle()),
        triggerLoading: call((e) => e.toLoading()),
      };
    }, []);

    return (
      <div
        ref={rootRef}
        className={[
          'cds-processing',
          size === 16 && 'cds-processing--solid',
          variant === 'hero' && 'cds-processing--hero',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        role="status"
        style={
          { '--cds-processing-size': `${size}px`, ...style } as CSSProperties
        }>
        <svg
          className="cds-processing__svg"
          viewBox="0 0 32 32"
          aria-hidden="true"
          focusable="false">
          <g ref={group}>
            {DOTS.map((i) => (
              <g
                key={i}
                ref={(el) => {
                  if (el) dots.current[i] = el;
                }}
                className="cds-processing__dot">
                {RINGS.map(({ r, stroke }, k) => (
                  <circle
                    key={k}
                    className="cds-processing__ring"
                    r={r}
                    strokeWidth={stroke}
                    opacity={0}
                  />
                ))}
              </g>
            ))}
          </g>
        </svg>
        {/* The live region's text: read out, and read again when it changes. */}
        <span className="cds-processing__label">{label}</span>
      </div>
    );
  }
);
Processing.displayName = 'Processing';
