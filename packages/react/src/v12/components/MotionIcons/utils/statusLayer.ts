/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ActionProps,
  AnimatedIconProps,
  MotionIconHandle,
} from '../types';
import type { ActionKit, StatusHandOff } from '../actions';
import type { ActionTail } from '@carbon-labs/motion-icons-core/engine/action';
import { useHover } from '../hooks/useHover';
import { useMotionContext } from '../hooks/useMotionContext';
import { useMotionMode } from './motionMode';
import {
  restFrame,
  type BaseGeo,
  type CountPlacement,
  type Mark,
  type Placement,
  type Status,
  type StatusFrame,
  type Tone,
} from '@carbon-labs/motion-icons-core/status';
import {
  geoAt,
  PipEngine,
  resolveStatus,
  StatusEngine,
  statusTiming,
} from '@carbon-labs/motion-icons-core/engine/statusEngine';
import { paintKeyed } from '@carbon-labs/motion-icons-core/engine/shapes';
import {
  isHovered,
  observeVisibility,
} from '@carbon-labs/motion-icons-core/engine/env';
import { adoptForcedColors } from '@carbon-labs/motion-icons-core/forcedColors';
import { REACT_KEYS, type Shapes, type TweenOpts } from './frameIcon';
import { IconSvg } from './IconSvg';
import { passThrough, stillLabel, type PassThrough } from './passThrough';
import { useInk } from './ink';
import { useIconHandle, withRef, type SvgRef } from './handle';

/**
 * The status layer: status as state on a frame icon.
 *
 * The layer's geometry, marks, frames and timing
 * plan live in `@carbon-labs/motion-icons-core` (status), and the engines
 * that run them (StatusEngine, PipEngine) in its engine. This module
 * re-exports the layer, so every import of it keeps working, and holds the
 * React binding: `makeStatusIcon` and `StatusPip`, each a thin component
 * over a core engine. See the core module for how the cut works.
 */
export * from '@carbon-labs/motion-icons-core/status';

// ── The components ───────────────────────────────────────────────────────────

/** The statuses a process icon takes (Save, Copy, …): what it's doing. */
export type ProcessStatus = 'success' | 'warning' | 'error' | 'pending';

/** Props for a status-capable icon: the icon's own, plus the status it shows. */
export interface StatusProps<S extends string>
  extends AnimatedIconProps, ActionProps {
  /**
   * A status on the icon: its mark in the corner, the icon cut round it.
   * Changing it animates; the first render shows it at rest; leave it
   * unset for the plain icon (exactly the icon without a status). While a
   * status shows, the icon holds still on hover.
   */
  status?: S;
  /**
   * Color the mark from the theme (Carbon's support tokens). `true`: each
   * mark its own status color: success green, warning yellow, error red,
   * the spinner interactive blue, and the notification pip and count red. A
   * tone (`'error' | 'warning' | 'success' | 'info'`): the same, but the
   * notification pip and count take that tone (a green or yellow pip); the
   * process marks keep their own colors. The icon itself stays
   * currentColor. Default off (the mark is currentColor too).
   *
   * Color alone shouldn't carry the meaning (WCAG 1.4.1): pair a colored dot
   * with an `aria-label` or visible text that says what it means.
   */
  tone?: boolean | Tone;
}

/** Props for a notification icon (User, Notification, Chat, …): a pip, or a count. */
export interface CountStatusProps extends StatusProps<'notification'> {
  /**
   * A count in a pill (Carbon's small numerals) in the pip's corner; changes
   * roll. Numbers show at size 32 only: smaller, a count above 0 shows the
   * plain pip (the same cut). 0 or unset shows the pip if `status` asks for
   * it, else nothing.
   */
  count?: number;
  /** At this count or more the pill shows "9+" or "99+", its own resting state. Default 99. */
  max?: 9 | 99;
  /**
   * Where the count's pill sits: 'overhang' (default) hanging off the
   * frame's corner, past the 32 frame on two sides, so it cuts little of the
   * icon even at 9+ and 99+; or 'inside', flush in the frame's corner. The
   * icon's box and layout don't change (it draws in the svg's visible
   * overflow), so the parent mustn't clip overflow. Changing it on a mounted
   * icon redraws it there.
   *
   * Some icons keep counts overhanging where inside would erase the figure:
   * inside takes one figure at most (12, 9+ and 99+ overhang whatever is
   * asked: inside they'd take Chat's text lines, Email's flap, the bell, the
   * calendar's box, the cart's upper left), and User, UserAvatar and
   * ShoppingCart ignore 'inside' altogether (inside, even one figure takes
   * half the head, or most of the basket).
   */
  countPlacement?: CountPlacement;
}

/** How an icon takes its statuses. */
export interface StatusSpec<S extends Status = Status> {
  /** The statuses it takes, in the order a picker should list them. */
  statuses: readonly S[];
  /** Where the mark sits, and any hand fix. */
  placement: Placement;
  /** Whether it takes a count (the notification icons). */
  count?: boolean;
  /** The base's geometry for the status layer: the icon's own frame geometry, or, for an icon without one (Settings), its drawing as geometry. */
  geo: BaseGeo;
  /** The base's hover timing, when it isn't the standard one (and its leave, when that isn't the standard speed-up). */
  hover?: TweenOpts;
  leave?: TweenOpts;
  /** Why it takes no such status, for one it refuses on purpose (CheckmarkOutline's success: it already says it); shown in the warning. */
  refused?: Partial<Record<Status, string>>;
}

/**
 * A status alias's own behaviour (Carbon's static status names): its status
 * fixed (a `status` prop is ignored), hover on the mark while the base holds,
 * and Carbon's art with `animated={false}`.
 */
export interface StatusAliasOptions {
  status: string;
  /** Carbon's art for `animated={false}`. */
  still?: React.ComponentType<
    AnimatedIconProps & {
      className?: string;
      style?: React.CSSProperties;
      onClick?: React.MouseEventHandler<SVGSVGElement>;
      ref?: React.Ref<SVGSVGElement>;
    }
  >;
}

const shapesEls = (shapes: Shapes) =>
  Object.entries(shapes).map(([k, attrs]) => {
    const { tag = 'path', ...rest } = attrs as Record<
      string,
      string | number
    > & { tag?: string };
    return React.createElement(String(tag), { key: k, 'data-k': k, ...rest });
  });

type FrameGeo = (f: StatusFrame, size?: number) => Shapes;

interface EngineProps {
  size: number;
  /** The author's other props (passThrough). */
  attrs?: PassThrough;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  onClick?: React.MouseEventHandler<SVGSVGElement>;
  mark: Mark;
  text: string;
  count: number;
  geo: FrameGeo;
  placement: Placement;
  /** 'rest': mounted showing `mark`; 'enter': mounted from the plain icon, so `mark` animates in. */
  start: 'rest' | 'enter';
  /** Called once the mark is gone, nothing moves and the pointer is off: the plain icon takes over. */
  onRest: () => void;
  /** The icon's handle (see utils/handle). */
  svgRef: SvgRef;
  /** Hover plays on the mark (the status aliases). */
  markHover?: boolean;
  /** An action's tail (its hand-off): the icon finishes the action under the entering mark. */
  tail?: ActionTail;
  /** A trigger waits for the plain icon (StatusEngine.release). */
  release?: boolean;
  /** The press (useHover's `press`). */
  press?: { own?: boolean; force?: boolean };
}

/** The icon with a status, or a status' type: the plain export's statics, plus the status layer's. */
export type StatusCapable<P> = React.FC<P> & { status: StatusLayer };
/** A status-capable icon's layer, on its `status` static: its spec, with the base's geometry as `base`, the status geometry as `geo`, and the plain icon. */
export type StatusLayer = Omit<StatusSpec, 'geo'> & {
  base: BaseGeo;
  geo: FrameGeo;
  geoAt: (placement: Placement, tone?: boolean | Tone) => FrameGeo;
  plain: React.ComponentType<AnimatedIconProps>;
};

/**
 * A status-capable icon from a plain one. With no status it *is* the plain
 * icon (it renders it, so its drawing and hover are the plain icon's,
 * byte for byte). Given a status, it renders the status layer: the base's
 * geometry (`spec.geo`) at rest, cut square round the mark; the mark
 * enters, changes and leaves on the motion tokens.
 *
 * Hover: while a status shows, the icon holds still,
 * the base and the mark alike, so the cut never moves. A status arriving
 * mid-hover eases the base back to rest (120ms, exit ease) as the cut opens.
 * Once the status has cleared and its exit has played, the base's hover
 * comes back (if the pointer is still on it, it hovers in); when the pointer
 * leaves and the hover is back at rest, the plain icon takes over again.
 *
 * Under reduced motion (or `animated={false}`) the status draws at rest,
 * pending as three still dots.
 */
/* @__NO_SIDE_EFFECTS__ */
export function makeStatusIcon<P extends StatusProps<string>>(
  name: string,
  Base: React.ComponentType<AnimatedIconProps>,
  spec: StatusSpec,
  alias?: StatusAliasOptions,
  kit?: ActionKit
): StatusCapable<P> {
  /** The status geometry for a placement (the spec's, or a count placed elsewhere), plain or toned: the core's, cached per spec. */
  const geoOf = (
    placement: Placement,
    tone: boolean | Tone = false
  ): FrameGeo => geoAt(spec, placement, tone);
  const { enter, leave } = statusTiming(spec);

  /** While a status shows: the core's StatusEngine, painting onto what this renders. */
  function Engine({
    size,
    className,
    style,
    ariaLabel,
    onClick,
    mark,
    text,
    count,
    geo,
    placement,
    start,
    onRest,
    svgRef,
    markHover,
    tail,
    release,
    attrs,
    press,
  }: EngineProps) {
    const svg = useRef<SVGSVGElement | null>(null);
    // Created once (a lazy initial state); it paints later, from effects, events and frames.
    const [e] = useState(
      () =>
        new StatusEngine({
          geo,
          placement,
          mark,
          text,
          count,
          size,
          start,
          enter,
          leave,
          onRest,
          markHover,
          ...(start === 'enter' && tail && { tail }),
          painter: (shapes) => paintKeyed(svg.current, shapes),
        })
    );

    useEffect(() => {
      e.onRest = onRest;
      e.setGeo(geo);
    });

    useEffect(() => {
      // Taking over from the plain icon under a resting mouse or pen: it is hovered, so start there (it eases out
      // below). Not after a tap: mobile browsers keep :hover on the tapped element (isHovered knows).
      const el = svg.current;
      // Forced colors: toned marks take the user's palette (one style per document or shadow root).
      if (el) {
        adoptForcedColors(el);
      }
      e.mount(!!el && isHovered(el));
      // Off screen, the pending spinner holds where it is (one IntersectionObserver per document).
      const unsee = el
        ? observeVisibility(el, (v) => e.setVisible(v))
        : undefined;
      return () => {
        unsee?.();
        e.destroy();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps -- mount / unmount
    }, []);

    useEffect(() => {
      // A trigger waits for the plain icon: hand back at rest once the status has cleared (an action blocks the hover).
      if (release) {
        e.release();
      }
    }, [e, release]);

    useEffect(() => {
      e.update(mark, text, count);
      // eslint-disable-next-line react-hooks/exhaustive-deps -- runs on mark and count changes only
    }, [mark, text]);

    const { ref } = useHover({
      // Hover only moves the plain icon: while a mark shows (or is leaving) it's noted, not played (a status alias: it plays on the mark).
      onEnter: () => e.enter(),
      onLeave: () => e.leave(),
      press,
      // No frame click: nothing here forwards one.
      frameClick: false,
    });
    const setRef = (el: SVGSVGElement | null) => {
      svg.current = el;
      (ref as React.MutableRefObject<SVGSVGElement | null>).current = el;
      svgRef(el);
    };
    return React.createElement(
      IconSvg,
      { ref: setRef, size, className, style, ariaLabel, onClick, attrs },
      React.createElement('g', { 'data-mc-ink': true }, shapesEls(e.shapes()))
    );
  }

  function Still({
    size,
    className,
    style,
    ariaLabel,
    onClick,
    mark,
    text,
    geo,
    placement,
    svgRef,
    attrs,
  }: Omit<EngineProps, 'start' | 'onRest' | 'count'>) {
    const inkRef = useInk<SVGSVGElement>();
    const el = useRef<SVGSVGElement | null>(null);
    const ref = useCallback(
      (svg: SVGSVGElement | null) => {
        el.current = svg;
        inkRef(svg);
        svgRef(svg);
      },
      [inkRef, svgRef]
    );
    useEffect(() => {
      if (el.current) {
        adoptForcedColors(el.current);
      }
    }, []);
    const shapes = geo(restFrame(placement, mark, true, text), size);
    return React.createElement(
      IconSvg,
      { ref, size, className, style, ariaLabel, onClick, attrs },
      React.createElement('g', { 'data-mc-ink': true }, shapesEls(shapes))
    );
  }

  // With an action (the kit, from the mirror): its handle plays the plain icon's action and hands off to a status;
  // without one, the plain handle and props. Fixed per icon, so the hooks run in the same order every render.
  const useHandOff = kit ? kit.useStatusHandOff : usePlainHandOff;
  const useWait = kit ? kit.useStatusWait : noWait;

  // The ref's handle: the plain icon's while it shows (its handle), else the status drawing's svg.
  const Icon = withRef<P, MotionIconHandle>(name, function Icon(props, ref) {
    const h = useHandOff(ref, props as P & ActionProps, name);
    const { svgRef, handOff } = h;
    const { status: statusProp, tone = false, ...rest } = h.props;
    // A status alias's status is fixed; otherwise the author's status wins, and the action's hand-off shows when there is none.
    const status = alias
      ? (alias.status as P['status'])
      : (statusProp ?? (handOff as P['status']));
    const { count, max, countPlacement, ...plain } = rest as typeof rest & {
      count?: number;
      max?: 9 | 99;
      countPlacement?: CountPlacement;
    };
    const size = plain.size ?? 32;
    // The mark, the count's text and where it sits (the core's, as the web components resolve it).
    const { mark, text, n, placement } = resolveStatus(
      spec,
      { status, count, max, countPlacement },
      size,
      name
    );
    const { animated: contextAnimated } = useMotionContext();
    const on = plain.animated ?? contextAnimated;
    const mode = useMotionMode(plain.animated);
    const [engine, setEngine] = useState<'rest' | 'enter' | null>(
      mark !== 'none' ? 'rest' : null
    );
    // A new size is a new drawing (pip ⇄ number isn't animated): it remounts there at rest.
    const [shownSize, setShownSize] = useState(size);
    if (size !== shownSize) {
      setShownSize(size);
      setEngine(mark !== 'none' ? 'rest' : null);
    }
    // A status arriving mid-action waits for it (a loop finishes its pass): the plain icon keeps the drawing until then.
    const plainActing = useWait(
      h,
      !!on && mark !== 'none' && engine === null,
      !!on,
      engine,
      statusProp === undefined && handOff !== undefined
    );
    if (on && mark !== 'none' && engine === null && !plainActing) {
      setEngine('enter');
    }
    const geo = geoOf(placement, tone);
    const attrs = passThrough(plain);
    // Its own control (an action on its click) presses: the plain icon is told, as the kit keeps the action props.
    const ownControl = (props as ActionProps).actionOn === 'click';
    const own = {
      size,
      className: plain.className,
      style: plain.style,
      ariaLabel: plain['aria-label'],
      onClick: plain.onClick,
      mark,
      text,
      geo,
      placement,
      svgRef,
      attrs,
    };
    // A status alias with motion off draws Carbon's own art (decision 5), as the plain icons do.
    if (alias?.still && mode === 'off' && mark !== 'none') {
      return React.createElement(alias.still, {
        ...attrs,
        ref: svgRef,
        size,
        className: plain.className,
        style: plain.style,
        'aria-label': stillLabel(plain['aria-label'], attrs),
        onClick: plain.onClick,
      } as never);
    }
    if (!on) {
      return mark === 'none'
        ? React.createElement(Base, { ...plain, ref: svgRef })
        : React.createElement(Still, own);
    }
    if (engine === null) {
      return React.createElement(Base, {
        ...plain,
        ref: svgRef,
        ...(ownControl && { ownControl }),
      });
    }
    // A different count placement is a different drawing: it remounts there, at rest.
    return React.createElement(Engine, {
      ...own,
      key: `${placement.countAt ?? 'inside'}|${size}`,
      count: n,
      start: engine,
      onRest: () => setEngine(null),
      markHover: !!alias,
      ...(h.tail && { tail: h.tail }),
      ...(h.release && { release: true }),
      press: { own: ownControl, force: plain.press },
    });
  });
  const statics = Object.fromEntries(
    Object.entries(Base).filter(([k]) => !REACT_KEYS.has(k))
  );
  return Object.assign(Icon, statics, {
    status: {
      ...spec,
      base: spec.geo,
      geo: geoOf(spec.placement),
      geoAt: geoOf,
      plain: Base,
    },
  }) as unknown as StatusCapable<P>;
}

/** A status icon without an action: its handle (trigger() goes to the plain icon, which has none) and its props as they are. */
function usePlainHandOff<Q>(
  ref: React.Ref<MotionIconHandle> | undefined,
  props: Q,
  name: string
): StatusHandOff<Q> {
  return {
    svgRef: useIconHandle(ref, undefined, name),
    props,
    handOff: undefined,
  };
}
const noWait = () => false;

// ── StatusPip: a count in a pill ─────────────────────────────────────────────

export interface StatusPipProps extends AnimatedIconProps {
  /** The count; 0 hides the pip. */
  count: number;
  /** At this count or more the pip shows "9+" or "99+", its own resting state (changes above it don't animate). Default: 9 at 16 and 20px, 99 at 24 and 32px. */
  max?: 9 | 99;
  /**
   * The pill's color: currentColor (default), or a status color from the
   * theme (Carbon's support tokens, `var(--cds-support-*)`, with the white
   * theme's values as fallbacks). The figures are knocked out, so whatever
   * is behind shows through them. Color alone shouldn't carry the meaning
   * (WCAG 1.4.1): give it an `aria-label` or visible text.
   */
  tone?: Tone;
}

/** StatusPip's render (a declaration, so the hooks lint reads it as a component). */
function Pip(
  props: StatusPipProps,
  ref: React.Ref<MotionIconHandle> | undefined
) {
  const {
    count,
    size = 32,
    max,
    tone,
    animated,
    className,
    style,
    'aria-label': ariaLabel,
    onClick,
  } = props;
  const attrs = passThrough(props);
  const svgRef = useIconHandle(ref, undefined, 'StatusPip');
  const { animated: contextAnimated } = useMotionContext();
  const on = animated ?? contextAnimated;
  const svg = useRef<SVGSVGElement | null>(null);
  // Created once (a lazy initial state); it paints later, from effects and frames.
  const [p] = useState(
    () =>
      new PipEngine((shapes) => paintKeyed(svg.current, shapes), size, {
        count,
        max,
        tone,
      })
  );
  // The render's cap, colour and size (as the component's closures read them); the count moves in the effect.
  p.configure({ max, tone }, size);
  useEffect(() => {
    p.set({ count, max, tone }, on);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- count changes only
  }, [count]);
  useEffect(() => () => p.destroy(), [p]);
  useEffect(() => {
    if (svg.current) {
      adoptForcedColors(svg.current);
    }
  }, []);
  return React.createElement(
    IconSvg,
    {
      ref: (el: SVGSVGElement | null) => {
        svg.current = el;
        svgRef(el);
      },
      size,
      className,
      style,
      ariaLabel,
      onClick,
      attrs,
    },
    React.createElement('g', { 'data-mc-ink': true }, shapesEls(p.shapes()))
  );
}

/**
 * A count pip: a pill with Carbon's small numerals knocked out; changes roll (fast-02, entrance), both ways.
 * Its ref's handle gives its `svg`; it has no hover, so `play()` does nothing.
 */
export const StatusPip = /* @__PURE__ */ withRef('StatusPip', Pip);
