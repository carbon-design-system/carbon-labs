/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import { createPortal } from 'react-dom';
import {
  attachScroller,
  type Scroller as ScrollerEngine,
  type ScrollerOptions,
  type ScrollerTrackInfo,
} from '@carbon-labs/v12-motion';
import { usePrefersReducedMotion } from '@carbon-labs/v12-motion';
import { useLatest } from '@carbon-labs/react-selection-kit';
import { isPageScrollLocked, subscribePageScrollLock } from './pageScrollLock';
import { attachScrollSoftEdge } from './softEdge';
import './scroller.scss';
import { cx } from '@carbon-labs/react-util';
import { assignRef } from '@carbon-labs/react-util';

/* ============================================================================
 * Scroller — one floating pill per axis
 * ============================================================================
 *
 * motion-core's `attachScroller` on a scroll viewport (`<Scroller>`) or the
 * document (`<WindowScroller />`, or `<Scroller target="window">`). The
 * native scrollbar is hidden and native scrolling is untouched; the pill is
 * a readout you can also drag or click.
 * ========================================================================== */

export type ScrollerAxisProp = 'y' | 'x' | 'both';

/**
 * Px or any CSS length per edge, keeping the pills clear of something over
 * them: `WindowScroller`'s fixed chrome (a header), or a control overlaid on
 * a container's edge (a code snippet's copy button). The rails, and so the
 * tracks and their hover strips, start and end that far in; the content
 * still scrolls under it. `top` / `bottom` are the block edges, `left` /
 * `right` the inline start and end (mirrored in RTL).
 */
export type ScrollerInsets = Partial<
  Record<'top' | 'right' | 'bottom' | 'left', number | string>
>;

const insetLength = (v: number | string | undefined) =>
  v == null ? undefined : typeof v === 'number' ? `${v}px` : v;

/**
 * The pill while it's shown but not hovered (scrolling, keyboard focus,
 * `visibility: 'always'`): `faint` (default) 4px at 75%; `thin` 2px;
 * `both` 2px at 60%; `full` 4px. Hover, press and drag are the
 * same in all four: `hoverThickness`, fully opaque.
 */
export type ScrollerRest = 'thin' | 'faint' | 'both' | 'full';

/** The default rest look: 4px at 75%. */
export const SCROLLER_REST_DEFAULT: ScrollerRest = 'faint';

/** Each rest look's thickness, px (its opacity is the stylesheet's `--scroller-rest-opacity`, 0.75 when faint, 0.6 when both). */
export const SCROLLER_REST_THICKNESS: Record<ScrollerRest, number> = {
  thin: 2,
  faint: 4,
  both: 2,
  full: 4,
};

/** The engine's dials, as props. */
export interface ScrollerMotionProps {
  /** `auto` (default): hidden at rest, arriving with activity. `always`: shown while the axis overflows. */
  visibility?: 'auto' | 'always';
  /** A press in the strip off the pill: `page` (default) or `jump`. */
  trackClick?: 'page' | 'jump';
  /** The pill shown but unhovered. Default `faint`. */
  rest?: ScrollerRest;
  /** The pill shown but unhovered, px; overrides `rest`'s (4, or 2 when `thin` / `both`). */
  thickness?: number;
  /** Near, pressed or dragged, px. Default 6. */
  hoverThickness?: number;
  /** Multiplies the hover and press color steps off the rest color. Default 2. */
  colorStep?: number;
  /** The wall squash past the ends of a drag. Default true. */
  squash?: boolean;
  /** Multiplies the engine's own durations (slow motion). Default 1. */
  timeScale?: number;
  /** No pill and no reaction. */
  disabled?: boolean;
  /**
   * The viewport is a tab stop while it overflows (default true). False for
   * a list whose focus stays on its trigger (a listbox: the keys scroll it).
   */
  focusable?: boolean;
  /** Overrides `prefers-reduced-motion` for this scroller. */
  reduced?: boolean;
  /** Called when a track click starts its scroll: the pill's travel and the duration it chose. */
  onTrackScroll?: (info: ScrollerTrackInfo) => void;
  /** The engine (metrics, measure), for a readout. */
  scrollerRef?: Ref<ScrollerEngine | null>;
}

export interface ScrollerProps
  extends
    ScrollerMotionProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children?: ReactNode;
  /** Which axes scroll. Default `y`. */
  axis?: ScrollerAxisProp;
  /**
   * Inset the tracks from the container's edges, clear of a control overlaid
   * there (an overlaid control insets the track: a code snippet's copy
   * button, `{ top: 40 }`). Also settable in CSS: `--scroller-track-top` /
   * `-right` / `-bottom` / `-left` on the root.
   */
  insets?: ScrollerInsets;
  /** `container` (default): this element scrolls. `window`: the document does; the children render in place. */
  target?: 'container' | 'window';
  /** Content leaves into a soft edge as it scrolls (default true). A side is masked, `min(16px, h / 2, past)`, only while content is past it and nothing is stuck there. A viewport's own `mask-image` wins. */
  softEdge?: boolean;
  /** The scrolling element. */
  viewportRef?: Ref<HTMLDivElement>;
  viewportClassName?: string;
  /**
   * More attributes for the viewport, the element that scrolls: a role and
   * its ARIA (a code snippet's read-only textbox), a `tabIndex` of its own
   * (the engine then leaves it), a style.
   */
  viewportProps?: Omit<
    HTMLAttributes<HTMLDivElement>,
    'className' | 'children'
  >;
  /** Names the viewport (a focusable region should have a name). */
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/** The engine on a viewport, attached once and re-configured from the props. */
function useScrollerEngine(
  getViewport: () => HTMLElement | Window | null,
  parts: {
    root: () => HTMLElement | null;
    y: () => HTMLElement | null;
    x: () => HTMLElement | null;
  },
  props: ScrollerMotionProps,
  enabled: boolean,
  /** Re-attach when this changes (the rails mounted). */
  attachKey: string
) {
  const systemReduced = usePrefersReducedMotion();
  const reduced = props.reduced ?? systemReduced;
  const latest = useLatest({ ...props, reduced });
  const engine = useRef<ScrollerEngine | null>(null);
  /** Attached in this commit: it has the dials already, so the first configure is skipped (one measure, not two). */
  const fresh = useRef(false);

  const opts = (): ScrollerOptions => {
    const p = latest.current;
    return {
      visibility: p.visibility,
      trackClick: p.trackClick,
      thickness:
        p.thickness ?? SCROLLER_REST_THICKNESS[p.rest ?? SCROLLER_REST_DEFAULT],
      hoverThickness: p.hoverThickness,
      colorStep: p.colorStep,
      squash: p.squash,
      timeScale: p.timeScale,
      disabled: p.disabled,
      focusable: p.focusable,
      reduced: () => latest.current.reduced,
      onTrackScroll: (info) => latest.current.onTrackScroll?.(info),
    };
  };

  useLayoutEffect(() => {
    if (!enabled) return;
    const vp = getViewport();
    if (!vp) return;
    const e = attachScroller(
      vp,
      { root: parts.root(), y: parts.y(), x: parts.x() },
      opts()
    );
    engine.current = e;
    fresh.current = true;
    const exposed = latest.current.scrollerRef;
    assignRef(exposed, e);
    return () => {
      e.destroy();
      engine.current = null;
      assignRef(exposed, null);
    };
    // Attached once per mount (and per axis set); the dials go through configure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, attachKey]);

  const {
    visibility,
    trackClick,
    rest,
    thickness,
    hoverThickness,
    colorStep,
    squash,
    timeScale,
    disabled,
    focusable,
  } = props;
  useLayoutEffect(() => {
    if (fresh.current) {
      fresh.current = false;
      return;
    }
    engine.current?.configure(opts());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    visibility,
    trackClick,
    rest,
    thickness,
    hoverThickness,
    colorStep,
    squash,
    timeScale,
    disabled,
    focusable,
    reduced,
  ]);
  // Whatever ran this commit, the next configure is a real change.
  useLayoutEffect(() => {
    fresh.current = false;
  });

  return engine;
}

function Rail({
  axis,
  railRef,
}: {
  axis: 'x' | 'y';
  railRef: Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={railRef}
      className={`cds-scroller__rail cds-scroller__rail--${axis}`}
      aria-hidden="true">
      <div className="cds-scroller__pill" data-scroller-pill="" />
    </div>
  );
}

/** A scroll viewport with the kit's floating pill on each axis that overflows. Size it like any box (`style={{ blockSize: 320 }}`, or a `max-block-size`); the viewport inside fills it and scrolls. */
export function Scroller(props: ScrollerProps) {
  const {
    children,
    axis = 'y',
    target = 'container',
    viewportRef,
    viewportClassName,
    viewportProps,
    className,
    style,
    insets,
    softEdge = true,
    visibility,
    trackClick,
    rest = SCROLLER_REST_DEFAULT,
    thickness,
    hoverThickness,
    colorStep,
    squash,
    timeScale,
    disabled,
    focusable,
    reduced,
    onTrackScroll,
    scrollerRef,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...others
  } = props;
  const motion = {
    visibility,
    trackClick,
    rest,
    thickness,
    hoverThickness,
    colorStep,
    squash,
    timeScale,
    disabled,
    focusable,
    reduced,
    onTrackScroll,
    scrollerRef,
  };

  const rootRef = useRef<HTMLDivElement>(null);
  const vpRef = useRef<HTMLDivElement | null>(null);
  const yRef = useRef<HTMLDivElement>(null);
  const xRef = useRef<HTMLDivElement>(null);
  const isWindow = target === 'window';

  useScrollerEngine(
    () => vpRef.current,
    {
      root: () => rootRef.current,
      y: () => yRef.current,
      x: () => xRef.current,
    },
    motion,
    !isWindow,
    axis
  );

  useLayoutEffect(() => {
    const vp = vpRef.current;
    if (isWindow || !softEdge || !vp) return;
    return attachScrollSoftEdge(vp, { x: axis !== 'y', y: axis !== 'x' });
  }, [isWindow, softEdge, axis]);

  if (isWindow) {
    return (
      <>
        {children}
        <WindowScroller axis={axis} {...motion} />
      </>
    );
  }

  const y = axis !== 'x';
  const x = axis !== 'y';
  const labelled = !!(ariaLabel || ariaLabelledBy);
  const box = insets
    ? ({
        ...style,
        '--scroller-track-top': insetLength(insets.top),
        '--scroller-track-right': insetLength(insets.right),
        '--scroller-track-bottom': insetLength(insets.bottom),
        '--scroller-track-left': insetLength(insets.left),
      } as CSSProperties)
    : style;
  return (
    <div
      ref={rootRef}
      className={cx('cds-scroller', `cds-scroller--${axis}`, className)}
      data-rest={rest}
      style={box}
      {...others}>
      <div
        {...viewportProps}
        ref={(el) => {
          vpRef.current = el;
          assignRef(viewportRef, el);
        }}
        className={cx('cds-scroller__viewport', viewportClassName)}
        role={viewportProps?.role ?? (labelled ? 'region' : undefined)}
        aria-label={ariaLabel ?? viewportProps?.['aria-label']}
        aria-labelledby={ariaLabelledBy ?? viewportProps?.['aria-labelledby']}>
        {children}
      </div>
      {y && <Rail axis="y" railRef={yRef} />}
      {x && <Rail axis="x" railRef={xRef} />}
    </div>
  );
}

export interface WindowScrollerProps extends ScrollerMotionProps {
  /** Which axes. Default `y`. */
  axis?: ScrollerAxisProp;
  /** Keep the pills clear of fixed chrome (a header): px or any CSS length per edge. */
  insets?: ScrollerInsets;
  className?: string;
  /** Inherited by the pills (e.g. slowed motion-token variables). */
  style?: CSSProperties;
}

/**
 * The pill on the document: fixed to the viewport's edges, the document's
 * native scrollbar hidden while it's mounted.
 */
export function WindowScroller({
  axis = 'y',
  insets,
  className,
  style,
  ...motion
}: WindowScrollerProps) {
  const rest = motion.rest ?? SCROLLER_REST_DEFAULT;
  const rootRef = useRef<HTMLDivElement>(null);
  const yRef = useRef<HTMLDivElement>(null);
  const xRef = useRef<HTMLDivElement>(null);
  // Stood down while a modal holds the page's scroll (pageScrollLock.ts).
  const locked = useSyncExternalStore(
    subscribePageScrollLock,
    isPageScrollLocked,
    () => false
  );
  useScrollerEngine(
    () => (typeof window === 'undefined' ? null : window),
    {
      root: () => rootRef.current,
      y: () => yRef.current,
      x: () => xRef.current,
    },
    { ...motion, disabled: motion.disabled || locked },
    true,
    axis
  );

  if (typeof document === 'undefined') return null;
  const len = insetLength;
  const box: CSSProperties = {
    ...style,
    insetBlockStart: len(insets?.top),
    insetInlineEnd: len(insets?.right),
    insetBlockEnd: len(insets?.bottom),
    insetInlineStart: len(insets?.left),
  };
  return createPortal(
    <div
      ref={rootRef}
      className={cx('cds-scroller-window', className)}
      data-rest={rest}
      style={box}>
      {axis !== 'x' && <Rail axis="y" railRef={yRef} />}
      {axis !== 'y' && <Rail axis="x" railRef={xRef} />}
    </div>,
    document.body
  );
}
