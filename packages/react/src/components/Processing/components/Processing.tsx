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
 * This component only renders the markup and forwards props / handle calls;
 * all choreography lives in processingEngine.ts, which has no React
 * dependency.
 *
 * `mode` is the state to be in. On mount the dots load in and go there; a
 * later change animates from wherever they are, exactly like the handle:
 *   "loading"  — three dots pulsing in a line (unwinds a shape back into it)
 *   "triangle" — the dots arc into a spinning equilateral triangle
 *   "square"   — a fourth dot grows in and all four arc into a square
 *   "out"      — shrink to nothing; any later mode loads in again
 * Triangle ↔ square passes through the loading line. The wiggle is a one-off
 * gesture, so it is handle-only (triggerWiggle).
 *
 * Reduced motion: the Web Animations API ignores the CSS `prefers-reduced-motion`
 * cascade, so the preference is read here and the engine paints static end
 * states instead of animating. The same happens where WAAPI is unavailable
 * (e.g. jsdom).
 */

import PropTypes from 'prop-types';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';
import { canAnimate, createProcessingEngine } from './processingEngine';
import type { ProcessingEngine, ProcessingMode } from './processingEngine';

export type { ProcessingMode };

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

export interface ProcessingProps {
  /** State to be in; changes animate from the current state. @defaultValue 'loading' */
  mode?: ProcessingMode;
  /** Whether the loading loop repeats; `false` runs one cycle, then shrinks out. Changing it restarts. @defaultValue true */
  loop?: boolean;
  /** Status text for assistive technology; changes are announced. @defaultValue 'Processing' */
  label?: string;
  /** Apply the AI color treatment. @defaultValue false */
  ai?: boolean;
  /** Additional CSS class applied to the root element. */
  className?: string;
  /**
   * Called when the state set by `mode` is reached. Not called for a mode that
   * was replaced before it landed, or for handle calls (those return promises).
   */
  onTransitionEnd?: (mode: ProcessingMode) => void;
}

/**
 * Every method resolves `true` once its state is reached, or `false` if it was
 * superseded (another request, `triggerOut()`, unmount). A request made during
 * a transition is queued and runs when that transition lands; only the latest
 * queued request is kept.
 */
export interface ProcessingHandle {
  /** Shrink all visible dots to zero from wherever they are. */
  triggerOut: () => Promise<boolean>;
  /** Form an equilateral triangle (from a square, via the loading line). */
  triggerTriangle: () => Promise<boolean>;
  /** Form a square (from a triangle, via the loading line). */
  triggerSquare: () => Promise<boolean>;
  /** Bob each dot up 6 px and back. Only from the loading line; resolves false otherwise. */
  triggerWiggle: () => Promise<boolean>;
  /** Unwind a triangle or square back into the looping three dots. */
  triggerLoading: () => Promise<boolean>;
}

const DOT_X = [8, 16, 24, 16];
const DOT_KEY = ['left', 'center', 'right', 'spare'];

export const Processing = forwardRef<ProcessingHandle, ProcessingProps>(
  function Processing(
    {
      mode = 'loading',
      loop = true,
      label = 'Processing',
      ai = false,
      className,
      onTransitionEnd,
      ...rest
    },
    ref
  ) {
    const prefix = usePrefix();
    const blockClass = `${prefix}--processing`;
    const reducedMotion = useReducedMotion();
    const group = useRef<SVGGElement>(null);
    const dots = useRef<SVGCircleElement[]>([]);
    const engine = useRef<ProcessingEngine | null>(null);
    const onEnd = useRef(onTransitionEnd);
    onEnd.current = onTransitionEnd;

    useEffect(() => {
      const e = createProcessingEngine(group.current!, dots.current);
      engine.current = e;
      return () => {
        e.destroy();
        engine.current = null;
      };
    }, []);

    // Mount (and loop / reduced-motion changes) restart; mode changes animate.
    useEffect(() => {
      void engine.current
        ?.setMode(mode, loop, reducedMotion || !canAnimate())
        .then((landed) => landed && onEnd.current?.(mode));
    }, [mode, loop, reducedMotion]);

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
        className={classNames(blockClass, className)}
        role="status"
        {...(ai ? { 'data-ai': '' } : {})}
        {...rest}>
        <svg
          className={`${blockClass}__dots`}
          viewBox="0 0 32 32"
          aria-hidden="true"
          focusable="false">
          <g ref={group} className={`${blockClass}__group`}>
            {DOT_X.map((cx, i) => (
              <circle
                key={DOT_KEY[i]}
                ref={(el) => {
                  if (el) {
                    dots.current[i] = el;
                  }
                }}
                className={`${blockClass}__dot`}
                cx={cx}
                cy={16}
                r="0"
                strokeWidth="0"
              />
            ))}
          </g>
        </svg>
        {/* Live-region text: screen readers announce it, and changes to it. */}
        <span className={`${blockClass}__label`}>{label}</span>
      </div>
    );
  }
);

Processing.displayName = 'Processing';
Processing.propTypes = {
  /**
   * Apply the AI color treatment
   */
  ai: PropTypes.bool,
  /**
   * Additional CSS class applied to the root element
   */
  className: PropTypes.string,
  /**
   * Status text for assistive technology; changes are announced
   */
  label: PropTypes.string,
  /**
   * Whether the loading loop repeats; `false` runs one cycle, then shrinks out
   */
  loop: PropTypes.bool,
  /**
   * State to be in; changes animate from the current state
   */
  mode: PropTypes.oneOf(['loading', 'triangle', 'square', 'out']),
  /**
   * Called when the state set by `mode` is reached
   */
  onTransitionEnd: PropTypes.func,
};

export default Processing;
