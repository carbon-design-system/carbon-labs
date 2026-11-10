/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  forwardRef,
  useLayoutEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import {
  durationStepForDistance,
  evaluateCurve,
  motionTokens,
  snapFadeFor,
  type CubicBezier,
  cubicBezier,
} from '@carbon-labs/v12-motion';
import {
  DURATION_FLOOR_MS,
  LOADING_MOTION,
  reducedClock,
  staggerSteps,
  useStagger,
} from '@carbon-labs/v12-motion';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import { SwapSlot } from '@carbon-labs/react-feedback';
import { useLoopVisibility } from '@carbon-labs/react-util';
import { assignRef } from '@carbon-labs/react-util';
import { FullPageErrorArt } from './art';
import './full-page-error.scss';

/* ============================================================================
 * FullPageError: Products' FullPageError, prop for prop.
 *
 *   arrow     the label's arrow draws: its line from the top, down and right;
 *             before the line ends, its head grows from the tip, riding the end
 *   groups    the error (label and title) fades in as the head draws,
 *             then everything else (description, actions, art): two fades, staggered
 *   swap      a new error on a mounted page swaps out, then in (`SwapSlot`)
 *   loops     held still off screen (`useLoopVisibility`)
 *   reduced   no drawing: the page fades in at once on the reduced clock
 *
 * API: Products' FullPageError, plus a forwarded ref.
 * ========================================================================== */

export interface FullPageErrorProps extends HTMLAttributes<HTMLDivElement> {
  /** The actions (buttons, links) under the description. */
  children?: ReactNode;
  className?: string;
  /** The description under the title. */
  description: string;
  /** The illustration: `403`, `404` or `custom` (default). */
  kind?: 'custom' | '403' | '404';
  /** The label above the title, e.g. "Error 404". */
  label: string;
  /** The title. */
  title: string;
}

/** The arrow, in its 24-unit box: the line (down, then right) and the head about its tip. */
export const ARROW = {
  line: 'M5 3V17H20',
  head: 'M15 12L20 17L15 22',
  /** The line's length, and where it turns. */
  length: 29,
  corner: 14,
  /** One side of the head. */
  barb: Math.hypot(5, 5),
} as const;

/** How long before the head lands the error fades in: while the head still draws (it takes `fast-02` at least). */
const LEAD = 'fast-01';

/** The arrow's draw, ms, for its size (px per unit) and the time scale. */
export interface ArrowDraw {
  line: { duration: number; easing: CubicBezier };
  head: { delay: number; duration: number; easing: CubicBezier };
  /** The head's offset along x while it rides the line's end: times (ms from the start) and offsets (units). */
  ride: {
    delay: number;
    duration: number;
    frames: { offset: number; dx: number }[];
  };
  /** When the head finishes. */
  done: number;
  /** When the error (label and title) fades in: LEAD before the head lands, while it still draws. */
  fadeIn: number;
}

export function arrowDraw(unit: number, timeScale = 1): ArrowDraw {
  const ms = (px: number) =>
    motionTokens.duration[durationStepForDistance(px)] * timeScale;
  // Duration by travel: the line's length on screen, the head's side.
  const lineMs = ms(ARROW.length * unit);
  const headMs = ms(ARROW.barb * unit);
  const lineEase = motionTokens.easing['standard-productive'];
  // The head starts half its clock before the line ends, so the two overlap.
  const delay = lineMs - headMs / 2;
  const frames = Array.from({ length: 13 }, (_, i) => {
    const t = delay + ((lineMs - delay) * i) / 12;
    const drawn = ARROW.length * evaluateCurve(lineEase, t / lineMs);
    return { offset: i / 12, dx: Math.max(drawn, ARROW.corner) - ARROW.length };
  });
  return {
    line: { duration: lineMs, easing: lineEase },
    head: {
      delay,
      duration: headMs,
      easing: motionTokens.easing['entrance-productive'],
    },
    ride: { delay, duration: lineMs - delay, frames },
    done: delay + headMs,
    fadeIn: Math.max(
      0,
      delay + headMs - motionTokens.duration[LEAD] * timeScale
    ),
  };
}

/** The reduced entrance: one fade, by the fade standard on the reduced clock, ms. */
export function reducedFade(timeScale = 1): number {
  const clock = motionTokens.duration['fast-02'] * timeScale;
  const r = Math.max(DURATION_FLOOR_MS, clock * reducedClock(true));
  return Math.min(
    motionTokens.duration[snapFadeFor(r / timeScale)] * timeScale,
    r
  );
}

/** The fade's groups, in order: the error (its label and title) together, then everything else. */
const GROUPS = [
  ['label', 'title'],
  ['description', 'actions', 'art'],
] as const;

const bezier = (e: CubicBezier) => cubicBezier(e);

/** The error itself: one face of the swap. */
function ErrorFace({
  children,
  description,
  kind,
  label,
  title,
}: Pick<FullPageErrorProps, 'children' | 'description' | 'label' | 'title'> & {
  kind: NonNullable<FullPageErrorProps['kind']>;
}) {
  return (
    <div className="cds-full-page-error__grid">
      <div className="cds-full-page-error__column">
        <h1 className="cds-full-page-error__title">
          <span className="cds-full-page-error__label">
            <svg
              className="cds-full-page-error__arrow"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false">
              <path
                className="cds-full-page-error__arrow-line"
                d={ARROW.line}
                pathLength={ARROW.length}
              />
              <path
                className="cds-full-page-error__arrow-head"
                d={ARROW.head}
              />
            </svg>
            <span data-part="label">{label}</span>
          </span>
          <span data-part="title">{title}</span>
        </h1>
        <p className="cds-full-page-error__description" data-part="description">
          {description}
        </p>
        <div className="cds-full-page-error__body" data-part="actions">
          {children}
        </div>
      </div>
      <div className="cds-full-page-error__art" data-part="art">
        <div className="cds-full-page-error__svg-container">
          <FullPageErrorArt kind={kind} />
        </div>
      </div>
    </div>
  );
}

export const FullPageError = forwardRef(function FullPageError(
  {
    children,
    className,
    description,
    kind = 'custom',
    label,
    title,
    ...rest
  }: FullPageErrorProps,
  ref: Ref<HTMLDivElement>
) {
  const { timeScale, reduced } = useFeedbackMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const played = useRef(false);
  // The illustration's loops (none yet) hold still while nobody can see them.
  useLoopVisibility(rootRef);

  const setRoot = (el: HTMLDivElement | null) => {
    rootRef.current = el;
    assignRef(ref, el);
  };

  // The error, then everything else: the kit's stagger.
  const stagger = useStagger({
    count: GROUPS.length,
    each: staggerSteps['05'],
  });

  // The entrance, once, before the first paint.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || played.current) return;
    played.current = true;
    if (reduced) {
      root.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: reducedFade(timeScale),
        easing: 'linear',
        fill: 'backwards',
      });
      return;
    }
    const svg = root.querySelector<SVGSVGElement>(
      '.cds-full-page-error__arrow'
    );
    const line = svg?.querySelector<SVGPathElement>(
      '.cds-full-page-error__arrow-line'
    );
    const head = svg?.querySelector<SVGPathElement>(
      '.cds-full-page-error__arrow-head'
    );
    if (!svg || !line || !head) return;
    const draw = arrowDraw(
      (svg.getBoundingClientRect().width || 24) / 24,
      timeScale
    );
    const L = ARROW.length;
    const H = ARROW.barb;
    line.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], {
      duration: draw.line.duration,
      easing: bezier(draw.line.easing),
      fill: 'backwards',
    });
    // The head grows out of its tip both ways: one dash about the tip, from nothing to both barbs.
    head.animate(
      [
        { strokeDasharray: `0 ${H} 0 ${2 * H}` },
        { strokeDasharray: `0 0 ${2 * H} ${2 * H}` },
      ],
      {
        delay: draw.head.delay,
        duration: draw.head.duration,
        easing: bezier(draw.head.easing),
        fill: 'backwards',
      }
    );
    head.animate(
      draw.ride.frames.map((f) => ({
        offset: f.offset,
        transform: `translateX(${f.dx}px)`,
      })),
      {
        delay: draw.ride.delay,
        duration: draw.ride.duration,
        easing: 'linear',
        fill: 'backwards',
      }
    );
    // The error (its label and title) as the head draws, LEAD before it lands; then everything else. Each a fade.
    GROUPS.forEach((group, i) =>
      group.forEach((p) =>
        root
          .querySelector<HTMLElement>(`[data-part="${p}"]`)
          ?.animate([{ opacity: 0 }, { opacity: 1 }], {
            delay: draw.fadeIn + stagger.delay(i) * timeScale,
            duration: LOADING_MOTION.contentMs * timeScale,
            easing: LOADING_MOTION.easing,
            fill: 'backwards',
          })
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on mount
  }, []);

  return (
    <div
      {...rest}
      ref={setRoot}
      role="main"
      className={['cds-full-page-error', className].filter(Boolean).join(' ')}>
      <div className="cds-full-page-error__container">
        <SwapSlot
          swapKey={[kind, label, title, description].join('\u0000')}
          fit="fill"
          className="cds-full-page-error__swap">
          <ErrorFace
            kind={kind}
            label={label}
            title={title}
            description={description}>
            {children}
          </ErrorFace>
        </SwapSlot>
      </div>
    </div>
  );
});
FullPageError.displayName = 'FullPageError';
