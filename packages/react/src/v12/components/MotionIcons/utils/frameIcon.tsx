/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FrameController,
  fromHover,
  fromToggle,
  knownState,
  type StateSpec as CoreStateSpec,
  type ToggleSpec as CoreToggleSpec,
} from '@carbon-labs/motion-icons-core/engine/frame';
import { observeVisibility } from '@carbon-labs/motion-icons-core/engine/env';
import { paintKeyed } from '@carbon-labs/motion-icons-core/engine/shapes';
import {
  TOGGLE_IN,
  TOGGLE_OUT,
  type TweenOpts,
} from '@carbon-labs/motion-icons-core/engine/timing';
import type { Playback } from '@carbon-labs/motion-icons-core/engine/animate';
import { useHover } from '../hooks/useHover';
import { useMotionMode } from './motionMode';
import { useToggleAnimation } from '../hooks/useToggleAnimation';
import { useToggleState } from '../hooks/useToggleState';
import type {
  ActionProps,
  AnimatedIconProps,
  MotionIconHandle,
  ToggleIconProps,
} from '../types';
import type { ActionSpec } from '@carbon-labs/motion-icons-core/engine/action';
import type { LoopSpec } from '@carbon-labs/motion-icons-core/engine/loop';
import type { ActionKit } from '../actions';
import { useInk } from './ink';
import { IconSvg } from './IconSvg';
import { passThrough, stillLabel, type PassThrough } from './passThrough';
import { useIconHandle, withRef, type SvgRef } from './handle';

/**
 * Frame icons: an icon described as geometry of a few animated numbers.
 *
 * `geo(frame)` returns every painted shape as `{ key: attributes }`. The
 * shapes render once from the resting frame; while animating, the core's
 * frame engine (`FrameController` in `@carbon-labs/motion-icons-core`)
 * tweens the numbers and rewrites the attributes. Because each shape is
 * recomputed as geometry, strokes and bars keep their exact weight however
 * far a shape grows, and nothing needs a mask or a CSS scale.
 *
 * Channels: `h` is hover progress (0 rest → 1 hovered). Toggles add their
 * own numbers (e.g. `p` for the state change). Hover and toggle tween
 * different numbers on separate channels, so they compose without fighting.
 *
 * Since refactor stage 1 this module is the React binding only: the
 * factories' signatures and statics are unchanged, and each mounted icon
 * holds a FrameController that paints onto the elements React rendered.
 *
 * Every icon takes a `ref` (utils/handle): a MotionIconHandle with `play()`
 * and the rendered `svg`. Each branch reports its svg to the handle
 * (`svgRef`); `play()` reaches the svg's hover binding.
 */

export type Frame = Record<string, number>;
export type Shapes = Record<string, Record<string, string | number>>;
/**
 * Geometry for a frame. `size` is the rendered size, for icons whose 16px
 * drawing in Carbon differs from the 32px one (return that drawing, scaled
 * into the 32-unit grid, when size === 16).
 */
export type Geo<F extends Frame> = (f: F, size?: number) => Shapes;

export {
  HOVER,
  HOVER_OUT,
  leaveOf,
  TOGGLE_IN,
  TOGGLE_OUT,
  type TweenOpts,
} from '@carbon-labs/motion-icons-core/engine/timing';

/** Painted shapes; `data-k` lets the painter find each one again. */
function FrameShapes({ shapes }: { shapes: Shapes }) {
  return (
    <>
      {Object.entries(shapes).map(([k, attrs]) => {
        const { tag = 'path', ...rest } = attrs as Record<
          string,
          string | number
        > & { tag?: string };
        return React.createElement(String(tag), {
          key: k,
          'data-k': k,
          ...rest,
        });
      })}
    </>
  );
}

/**
 * One FrameController per mounted icon, painting onto the `[data-k]`
 * elements React rendered under the svg it returns (attributes only: React
 * owns the elements). Stopped on unmount.
 */
function useController<S extends string>(
  make: (paint: (shapes: Shapes) => void) => FrameController<S>,
  size: number
) {
  const svg = useRef<SVGSVGElement | null>(null);
  // Created once (a lazy initial state); it paints later, from events and frames, never during render.
  // A steady cycle (Renew's loop) turns the svg on the compositor (the core's turn.ts).
  // eslint-disable-next-line react-hooks/refs -- the painter and the turn read the svg ref when they paint or turn (events, effects, frames), never during render
  const [ctl] = useState(() => {
    const c = make((shapes) => paintKeyed(svg.current, shapes));
    c.turnBox = () => svg.current;
    return c;
  });
  // eslint-disable-next-line react-hooks/immutability -- the engine reads the rendered size when it paints a frame
  ctl.size = size;
  useEffect(() => () => ctl.destroy(), [ctl]);
  return { ctl, svg };
}

// ── Hover icons ──────────────────────────────────────────────────────────────

export interface HoverSpec {
  /**
   * Geometry at hover progress `h` (0 = Carbon's resting icon). `entering`
   * is 1 while the hover is coming in and 0 while it's going out, for
   * motion that should only play one way (optional; most geo ignores it).
   */
  geo: Geo<{ h: number; entering?: number }>;
  viewBox?: string;
  hover?: TweenOpts;
  /** The leave's timing, when it isn't the hover's standard speed-up (Settings leaves on its own moderate-02 curve). Absent: derived as always. */
  leave?: TweenOpts;
  /**
   * Carbon's exact drawing, shown with `animated={false}`.
   * Absent: the rest geometry. Under reduced motion the icon
   * shows its rest geometry either way.
   */
  static?: CarbonIcon;
  /** What the icon acts out when the thing it stands for happens (the core's ActionSpec): `ref.trigger()`, `actionKey`, `actionOn`, `loop`. */
  action?: ActionSpec;
}

/** An icon without an action: the action props do nothing, the click is the author's. */
const passClick = (
  _h: MotionIconHandle,
  _p: ActionProps,
  onClick?: React.MouseEventHandler<SVGSVGElement>
) => onClick;

/** The icon, plus its geometry function (for tests and review sheets). */
export type FrameHoverIcon = React.FC<AnimatedIconProps & ActionProps> & {
  geo: HoverSpec['geo'];
  hover?: TweenOpts;
  leave?: TweenOpts;
  static?: CarbonIcon;
  action?: ActionSpec;
};

/**
 * The core spec an icon runs on (non-enumerable, so statics copied with
 * Object.entries, as status and variant icons do, don't carry it): for the
 * web components and the parity tests.
 */
function withCoreSpec<T extends object, S extends string>(
  target: T,
  spec: CoreStateSpec<S>
): T {
  Object.defineProperty(target, 'coreSpec', {
    value: spec,
    enumerable: false,
    configurable: true,
  });
  return target;
}

/* @__NO_SIDE_EFFECTS__ */
export function makeHoverIcon(
  name: string,
  spec: HoverSpec,
  kit?: ActionKit
): FrameHoverIcon {
  const core = fromHover({
    geo: spec.geo,
    hover: spec.hover,
    leave: spec.leave,
    static: spec.static,
    action: spec.action,
  });
  // The action kit comes from the mirror of an icon with an action; without it the props pass the click through.
  const useActions = kit ? kit.useProps : passClick;

  function Animated({
    size,
    className,
    style,
    ariaLabel,
    onClick,
    svgRef,
    attrs,
    press,
  }: InnerProps) {
    const { ctl, svg } = useController(
      (paint) => new FrameController(core, paint, size),
      size
    );
    // No frame click: a hover icon has no click of its own to forward (its onClick is on the svg).
    const { ref } = useHover({
      onEnter: () => ctl.hoverTo(1),
      onLeave: () => ctl.hoverTo(0),
      press,
      frameClick: false,
    });
    // An icon with an action: off screen, a loop holds where it is (one IntersectionObserver per document).
    useEffect(() => {
      const el = svg.current;
      if (!kit || !el) return;
      const unsee = observeVisibility(el, (v) => ctl.setVisible(v));
      return () => {
        unsee();
        ctl.setVisible(true);
      };
    }, [ctl, svg]);
    // One callback for the icon's life (a new one each render would be called with null, then the svg, every render).
    const setRef = useCallback(
      (el: SVGSVGElement | null) => {
        // The action's controller, for the ref handle (MotionIconHandle.trigger) to find by the svg.
        if (kit) {
          if (svg.current && svg.current !== el)
            kit.register(svg.current, null);
          if (el) kit.register(el, ctl);
        }
        // eslint-disable-next-line react-hooks/immutability -- the engine paints frames imperatively through refs (no re-render per frame)
        svg.current = el;
        // eslint-disable-next-line react-hooks/immutability -- the engine paints frames imperatively through refs (no re-render per frame)
        (ref as React.MutableRefObject<SVGSVGElement | null>).current = el;
        svgRef(el);
      },
      [ctl, svg, ref, svgRef]
    );
    return (
      <IconSvg
        ref={setRef}
        size={size}
        viewBox={spec.viewBox}
        className={className}
        style={style}
        ariaLabel={ariaLabel}
        onClick={onClick}
        attrs={attrs}>
        <g data-mc-ink>
          <FrameShapes shapes={ctl.shapes()} />
        </g>
      </IconSvg>
    );
  }

  const Icon = withRef<AnimatedIconProps & ActionProps, MotionIconHandle>(
    name,
    function Icon(props, ref) {
      const {
        size = 32,
        animated,
        className,
        style,
        'aria-label': ariaLabel,
        onClick: onClickProp,
        actionKey,
        actionOn,
        loop,
        actionThen,
        press,
      } = props;
      // Its own control: an action on its click (a status icon passes `ownControl` for its plain icon, whose action props it keeps).
      const own =
        actionOn === 'click' ||
        !!(props as { ownControl?: boolean }).ownControl;
      const attrs = passThrough(props);
      const svgRef = useIconHandle(ref, kit?.handle, name);
      const mode = useMotionMode(animated);
      const onClick = useActions(
        svgRef.handle,
        { actionKey, actionOn, loop, actionThen },
        onClickProp,
        mode === 'on'
      );
      const inkRef = useInk<SVGSVGElement>();
      // The still drawing's svg: the ink's and the handle's (whenever it mounts: the mode can change after the icon has).
      const stillRef = useCallback(
        (el: SVGSVGElement | null) => {
          inkRef(el);
          svgRef(el);
        },
        [inkRef, svgRef]
      );
      if (mode === 'off' && spec.static) {
        const Static = spec.static;
        return (
          <Static
            {...attrs}
            ref={svgRef}
            size={size}
            className={className}
            style={style}
            aria-label={stillLabel(ariaLabel, attrs)}
            onClick={onClick}
          />
        );
      }
      if (mode !== 'on') {
        return (
          <IconSvg
            ref={stillRef}
            size={size}
            viewBox={spec.viewBox}
            className={className}
            style={style}
            ariaLabel={ariaLabel}
            onClick={onClick}
            attrs={attrs}>
            <g data-mc-ink>
              <FrameShapes shapes={spec.geo({ h: 0 }, size)} />
            </g>
          </IconSvg>
        );
      }
      return (
        <Animated
          size={size}
          className={className}
          style={style}
          ariaLabel={ariaLabel}
          onClick={onClick}
          svgRef={svgRef}
          attrs={attrs}
          press={{ own, force: press }}
        />
      );
    }
  );
  return withCoreSpec(
    Object.assign(
      Icon,
      { geo: spec.geo },
      spec.hover ? { hover: spec.hover } : {},
      spec.leave ? { leave: spec.leave } : {},
      spec.static ? { static: spec.static } : {},
      spec.action ? { action: spec.action } : {}
    ),
    core
  );
}

interface InnerProps {
  size: number;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  onClick?: React.MouseEventHandler<SVGSVGElement>;
  /** The icon's handle (see utils/handle). */
  svgRef: SvgRef;
  /** The author's other props (passThrough). */
  attrs?: PassThrough;
  /** The press (useHover's `press`). */
  press?: { own?: boolean; force?: boolean };
}

// ── Toggle icons ─────────────────────────────────────────────────────────────

export type ToggleFrame = { h: number; p: number; e: number };
/**
 * A toggle's frame as its geometry may read it: `h`, `p`, `e`, plus which way
 * the hover is going (`entering`: 1 in, 0 out) and any extra hover numbers
 * the spec declares (`hovers`), by name. Outside the engine (tests, review
 * sheets) these may be missing, so geometry gives them defaults.
 */
export type ToggleFrameIn = ToggleFrame & {
  entering?: number;
  [hover: string]: number | undefined;
};
export type ToggleGeo = (f: ToggleFrameIn, size?: number) => Shapes;

// Carbon's icon components accept these plus SVG props.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CarbonIcon = React.ComponentType<any>;

/**
 * Tweens one of the toggle's numbers. It returns the core engine's running
 * tween, typed as motion's controls; specs only ever
 * `stop()` it.
 */
export type TweenFn = (
  key: keyof ToggleFrame,
  to: number,
  opts: TweenOpts,
  onComplete?: () => void
) => Playback;

/**
 * Fill toggles (§7.7): fill in by growing `p`; empty by growing `e` from
 * the same origin (a hole, or a clearing edge), then reset. Interrupting
 * either direction reverses whatever is in flight.
 */
export function fillThenClear(
  turningOn: boolean,
  fr: ToggleFrame,
  tween: TweenFn,
  repaint: () => void
) {
  if (turningOn)
    return fr.e > 0 ? tween('e', 0, TOGGLE_IN) : tween('p', 1, TOGGLE_IN);
  if (fr.p < 1) return tween('p', 0, TOGGLE_OUT);
  return tween('e', 1, TOGGLE_OUT, () => {
    fr.p = 0;
    fr.e = 0;
    repaint();
  });
}

export interface ToggleSpec<S extends string> {
  /** [off, on]: the Carbon icon each state shows; `toggled` means `on`. */
  states: readonly [S, S];
  /** The Carbon icons for [off, on], used when motion is off. */
  statics: readonly [CarbonIcon, CarbonIcon];
  /**
   * Geometry for hover `h`, toggle progress `p` (0 = off, 1 = on) and `e`, a
   * second toggle number for exits that leave a different way than they came
   * (e.g. a fill that clears from one side); 0 when unused. While animating
   * it is also handed `entering` and any `hovers` (see ToggleFrameIn).
   */
  geo: ToggleGeo;
  /**
   * How a state change animates. Default: `p` tweens to 0/1. Return the
   * tween(s) to run; `tween` resets nothing on its own.
   */
  /** Returns the change's running tween (anything with `stop()`: the engine's, or motion's). */
  change?: (
    turningOn: boolean,
    f: ToggleFrame,
    tween: TweenFn,
    repaint: () => void
  ) => Playback;
  /** The hover's timing, when the icon's own hover isn't the standard one (its leave runs one token faster, as for hover icons). */
  hover?: TweenOpts;
  /** After a change into this state, `h` stays at rest until the pointer leaves and comes back. */
  holdAfter?: S;
  /**
   * Extra hover numbers, by name, for toggles whose two states hover
   * differently (e.g. one state's icon has its own hover timing, or one
   * part's hover is held back after a change). Each tweens 0 → 1 on enter
   * and back on leave beside `h`, on its own timing (`hover`; its leave one
   * token faster), and can hold at rest after a change into `holdAfter`.
   * Geometry reads them from the frame by name.
   */
  hovers?: Record<string, { hover?: TweenOpts; holdAfter?: S }>;
  /** The on state loops while it shows (the core's loop.ts, `defineLoop`). Not under reduced motion; off screen it holds. */
  loop?: LoopSpec;
}

const BUTTON_STYLE: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  display: 'inline-flex',
};

/** The icon, plus its geometry and its [off, on] state names (for tests and review sheets). */
export type FrameToggleIcon<S extends string> = React.FC<ToggleIconProps<S>> & {
  geo: ToggleGeo;
  states: readonly [S, S];
};

/* @__NO_SIDE_EFFECTS__ */
export function makeToggleIcon<S extends string>(
  name: string,
  spec: ToggleSpec<S>
): FrameToggleIcon<S> {
  const [off, on] = spec.states;
  // The React spec's tween / frame types are the engine's, narrowed; the engine calls them with the same values.
  const core = fromToggle<S>({
    states: spec.states,
    geo: spec.geo as CoreToggleSpec<S>['geo'],
    change: spec.change as unknown as CoreToggleSpec<S>['change'],
    hover: spec.hover,
    hovers: spec.hovers,
    holdAfter: spec.holdAfter,
    loop: spec.loop,
  });
  // The named state wins; `toggled` is its boolean shorthand ([off, on]).
  const controlledOf = ({
    value,
    toggled,
  }: ToggleIconProps<S>): S | undefined =>
    value !== undefined
      ? value
      : toggled !== undefined
        ? toggled
          ? on
          : off
        : undefined;
  const changeOf =
    ({ onChange, onToggle }: ToggleIconProps<S>) =>
    (next: S) => {
      onChange?.(next);
      onToggle?.(next, next === on);
    };

  function Static(props: ToggleIconProps<S> & { svgRef: SvgRef }) {
    const {
      size = 32,
      className,
      style,
      'aria-label': ariaLabel,
      onClick,
      initial,
      asButton,
      disableToggle,
      disabled,
      svgRef,
    } = props;
    const attrs = passThrough(props);
    const { currentState, transition } = useToggleState<S>({
      states: spec.states,
      name,
      initial,
      value: controlledOf(props),
      onChange: changeOf(props),
    });
    const isOn = currentState === on;
    const Icon = spec.statics[isOn ? 1 : 0];
    if (asButton) {
      return (
        <button
          {...attrs}
          type="button"
          disabled={disabled || undefined}
          aria-pressed={isOn}
          aria-label={ariaLabel}
          onClick={() => {
            if (!disableToggle) transition();
          }}
          style={BUTTON_STYLE}>
          <Icon ref={svgRef} size={size} className={className} style={style} />
        </button>
      );
    }
    return (
      <Icon
        {...attrs}
        ref={svgRef}
        size={size}
        className={className}
        style={style}
        aria-label={stillLabel(ariaLabel, attrs)}
        onClick={(e: React.MouseEvent<SVGSVGElement>) => {
          if (!disableToggle) {
            transition();
            onClick?.(e);
          }
        }}
      />
    );
  }

  function Animated(
    props: ToggleIconProps<S> & { still?: boolean; svgRef: SvgRef }
  ) {
    const {
      size = 32,
      className,
      style,
      'aria-label': ariaLabel,
      onClick,
      initial,
      asButton,
      disableToggle,
      disabled,
      still = false,
      svgRef: handleRef,
      press,
      level,
    } = props;
    const attrs = passThrough(props);
    const controlled = controlledOf(props);
    const startOn =
      (knownState(name, spec.states, controlled) ??
        knownState(name, spec.states, initial)) === on;
    const { ctl, svg } = useController(
      (paint) => new FrameController<S>(core, paint, size, startOn ? on : off),
      size
    );

    const { currentState, transition, svgRef, frameClickRef } =
      useToggleAnimation<S>({
        states: spec.states,
        name,
        initial,
        value: controlled,
        onChange: changeOf(props),
        // Under reduced motion a change is made at once, and the icon doesn't hover.
        onStateChange: (_prev, next) => ctl.setState(next, !still),
        onEnter: () => ctl.hoverTo(1),
        onLeave: () => ctl.hoverTo(0),
        // A disabled button doesn't hover (or press).
        disabled: still || (!!asButton && !!disabled),
        // Its own button presses.
        press: { own: !!asButton, force: press },
      });

    // A looping state (core.loop) loops while the icon moves, and holds off screen (one IntersectionObserver per document).
    useEffect(() => {
      if (!core.loop) return;
      ctl.setMoving(!still);
      return () => ctl.setMoving(false);
    }, [ctl, still]);
    // A loop that follows a level reads it each frame.
    useEffect(() => {
      if (core.loop?.level) ctl.setLevel(level);
    }, [ctl, level]);
    // Observed again when `asButton` swaps the svg (`<svg>` ⇄ `<button><svg/></button>`); the loop runs on through it.
    useEffect(() => {
      const el = svg.current;
      if (!core.loop || !el) return;
      const unsee = observeVisibility(el, (v) => ctl.setVisible(v));
      return () => {
        unsee();
        ctl.setVisible(true);
      };
    }, [ctl, svg, asButton]);

    function handleToggle(e?: React.MouseEvent) {
      if (e) onClick?.(e as React.MouseEvent<SVGSVGElement>);
      if (disableToggle || (asButton && disabled)) return;
      transition();
    }
    // A button calls handleToggle itself; registering both would toggle twice.
    // Set after commit: the frame's click handler is read from the ref in an event, never during render.
    useEffect(() => {
      frameClickRef.current = asButton ? null : handleToggle;
    });

    // One callback for the icon's life (a new one each render would be called with null, then the svg, every render).
    const setRef = useCallback(
      (el: SVGSVGElement | null) => {
        // eslint-disable-next-line react-hooks/immutability -- the engine paints frames imperatively through refs (no re-render per frame)
        svg.current = el;
        // eslint-disable-next-line react-hooks/immutability -- the engine paints frames imperatively through refs (no re-render per frame)
        (svgRef as React.MutableRefObject<SVGSVGElement | null>).current = el;
        handleRef(el);
      },
      [svg, svgRef, handleRef]
    );
    const isOn = currentState === on;
    const content = (
      <g data-mc-ink>
        <FrameShapes shapes={ctl.shapes()} />
      </g>
    );

    if (asButton) {
      return (
        <button
          {...attrs}
          type="button"
          disabled={disabled || undefined}
          aria-pressed={isOn}
          aria-label={ariaLabel}
          onClick={handleToggle}
          style={BUTTON_STYLE}>
          <svg
            ref={setRef}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            width={size}
            height={size}
            className={className}
            style={{ overflow: 'visible', ...style }}
            role="presentation"
            fill="currentColor">
            {content}
          </svg>
        </button>
      );
    }
    return (
      <IconSvg
        ref={setRef}
        size={size}
        className={className}
        style={style}
        ariaLabel={ariaLabel}
        onClick={handleToggle}
        attrs={attrs}>
        {content}
      </IconSvg>
    );
  }

  const Toggle = withRef<ToggleIconProps<S>, MotionIconHandle>(
    name,
    function Toggle(props, ref) {
      const svgRef = useIconHandle(ref, undefined, name);
      // Animated; `animated={false}`: Carbon's art; reduced motion: the rest geometry, changing at once.
      const mode = useMotionMode(props.animated);
      return mode === 'off' ? (
        <Static {...props} svgRef={svgRef} />
      ) : (
        <Animated {...props} still={mode === 'reduced'} svgRef={svgRef} />
      );
    }
  );
  return withCoreSpec(
    Object.assign(Toggle, { geo: spec.geo, states: spec.states }),
    core
  );
}

// ── State icons (more than two states) ───────────────────────────────────────

/**
 * Props for a state icon: `value` (controlled) or `initial`, and `onChange`;
 * clicks step through `states`. The same named-state API as the two-state
 * toggles, without their boolean shorthand.
 */
export type StateIconProps<S extends string> = Omit<
  ToggleIconProps<S>,
  'toggled' | 'onToggle'
>;

/** Tweens any of the state icon's own numbers. */
export type StateTweenFn = (
  key: string,
  to: number,
  opts: TweenOpts,
  onComplete?: () => void
) => Playback;

export interface StateSpec<S extends string> {
  /** Every state, in click order (a click moves to the next, wrapping round). */
  states: readonly S[];
  /** The Carbon icon for each state, used when motion is off. */
  statics: Record<S, CarbonIcon>;
  /** The icon's own numbers at rest in a state (not `h`). Each state's set has the same keys. */
  rest: (state: S) => Frame;
  /** Geometry for hover `h` (with `entering`) and the icon's own numbers. */
  geo: (f: Frame, size?: number) => Shapes;
  /**
   * How a change from `prev` to `next` animates, from wherever the numbers
   * are now (a change interrupts the one in flight: its tweens are stopped
   * first). Return every tween it starts.
   */
  change: (
    prev: S,
    next: S,
    f: Frame,
    tween: StateTweenFn,
    repaint: () => void
  ) => Playback | Playback[];
  /** aria-pressed for each state when rendered `asButton` (default: pressed unless it's the first state). */
  pressed?: (state: S) => boolean | 'mixed';
  /** The hover's timing, when it isn't the standard one. */
  hover?: TweenOpts;
  /** An indicator: it follows `value` only, and its own clicks never step it (ProgressStep). */
  indicator?: boolean;
}

/** The icon, plus its geometry, rest numbers and change (for tests and review sheets). */
export type FrameStateIcon<S extends string> = React.FC<StateIconProps<S>> &
  Pick<StateSpec<S>, 'geo' | 'rest' | 'change' | 'states'>;

/**
 * An icon with any number of states (makeToggleIcon covers two). The state
 * hooks are the toggles' own (they cycle any number of states); the icon's
 * numbers start at `rest(state)` and `change` animates each move. Hover
 * runs on `h` as for every frame icon.
 */
/* @__NO_SIDE_EFFECTS__ */
export function makeStateIcon<S extends string>(
  name: string,
  spec: StateSpec<S>
): FrameStateIcon<S> {
  const pressedOf = spec.pressed ?? ((s: S) => s !== spec.states[0]);
  // An indicator's clicks never step it: as if it always had `disableToggle`.
  const clicksStep = (disableToggle?: boolean) =>
    !disableToggle && !spec.indicator;
  const core: CoreStateSpec<S> = {
    states: spec.states,
    rest: spec.rest,
    geo: spec.geo,
    change: spec.change as unknown as CoreStateSpec<S>['change'],
    hover: spec.hover,
    pressed: spec.pressed,
  };

  function Static(props: StateIconProps<S> & { svgRef: SvgRef }) {
    const {
      size = 32,
      className,
      style,
      'aria-label': ariaLabel,
      onClick,
      value,
      onChange,
      initial,
      asButton,
      disableToggle,
      disabled,
      svgRef,
    } = props;
    const attrs = passThrough(props);
    const { currentState, transition } = useToggleState<S>({
      states: spec.states,
      name,
      initial,
      value,
      onChange,
    });
    const Icon: CarbonIcon = spec.statics[currentState];
    if (asButton) {
      return (
        <button
          {...attrs}
          type="button"
          disabled={disabled || undefined}
          aria-pressed={pressedOf(currentState)}
          aria-label={ariaLabel}
          onClick={() => {
            if (clicksStep(disableToggle)) transition();
          }}
          style={BUTTON_STYLE}>
          <Icon ref={svgRef} size={size} className={className} style={style} />
        </button>
      );
    }
    return (
      <Icon
        {...attrs}
        ref={svgRef}
        size={size}
        className={className}
        style={style}
        aria-label={stillLabel(ariaLabel, attrs)}
        onClick={(e: React.MouseEvent<SVGSVGElement>) => {
          if (clicksStep(disableToggle)) {
            transition();
            onClick?.(e);
          }
        }}
      />
    );
  }

  function Animated(
    props: StateIconProps<S> & { still?: boolean; svgRef: SvgRef }
  ) {
    const {
      size = 32,
      className,
      style,
      'aria-label': ariaLabel,
      onClick,
      value,
      onChange,
      initial,
      asButton,
      disableToggle,
      disabled,
      still = false,
      svgRef: handleRef,
      press,
    } = props;
    const attrs = passThrough(props);
    const start =
      knownState(name, spec.states, value) ??
      knownState(name, spec.states, initial) ??
      spec.states[0];
    const { ctl, svg } = useController(
      (paint) => new FrameController<S>(core, paint, size, start),
      size
    );
    const { currentState, transition, svgRef, frameClickRef } =
      useToggleAnimation<S>({
        states: spec.states,
        name,
        initial,
        value,
        onChange,
        // Under reduced motion a change is made at once, and the icon doesn't hover.
        onStateChange: (_prev, next) => ctl.setState(next, !still),
        onEnter: () => ctl.hoverTo(1),
        onLeave: () => ctl.hoverTo(0),
        // A disabled button doesn't hover (or press).
        disabled: still || (!!asButton && !!disabled),
        // Its own button presses.
        press: { own: !!asButton, force: press },
      });

    function handleToggle(e?: React.MouseEvent) {
      if (e) onClick?.(e as React.MouseEvent<SVGSVGElement>);
      if (!clicksStep(disableToggle) || (asButton && disabled)) return;
      transition();
    }
    // A button calls handleToggle itself; registering both would toggle twice.
    useEffect(() => {
      frameClickRef.current = asButton ? null : handleToggle;
    });

    // One callback for the icon's life (a new one each render would be called with null, then the svg, every render).
    const setRef = useCallback(
      (el: SVGSVGElement | null) => {
        // eslint-disable-next-line react-hooks/immutability -- the engine paints frames imperatively through refs (no re-render per frame)
        svg.current = el;
        // eslint-disable-next-line react-hooks/immutability -- the engine paints frames imperatively through refs (no re-render per frame)
        (svgRef as React.MutableRefObject<SVGSVGElement | null>).current = el;
        handleRef(el);
      },
      [svg, svgRef, handleRef]
    );
    const content = (
      <g data-mc-ink>
        <FrameShapes shapes={ctl.shapes()} />
      </g>
    );
    if (asButton) {
      return (
        <button
          {...attrs}
          type="button"
          disabled={disabled || undefined}
          aria-pressed={pressedOf(currentState)}
          aria-label={ariaLabel}
          onClick={handleToggle}
          style={BUTTON_STYLE}>
          <svg
            ref={setRef}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            width={size}
            height={size}
            className={className}
            style={{ overflow: 'visible', ...style }}
            role="presentation"
            fill="currentColor">
            {content}
          </svg>
        </button>
      );
    }
    return (
      <IconSvg
        ref={setRef}
        size={size}
        className={className}
        style={style}
        ariaLabel={ariaLabel}
        onClick={handleToggle}
        attrs={attrs}>
        {content}
      </IconSvg>
    );
  }

  const StateIcon = withRef<StateIconProps<S>, MotionIconHandle>(
    name,
    function StateIcon(props, ref) {
      const svgRef = useIconHandle(ref, undefined, name);
      // Animated; `animated={false}`: Carbon's art; reduced motion: the rest geometry, changing at once.
      const mode = useMotionMode(props.animated);
      return mode === 'off' ? (
        <Static {...props} svgRef={svgRef} />
      ) : (
        <Animated {...props} still={mode === 'reduced'} svgRef={svgRef} />
      );
    }
  );
  return withCoreSpec(
    Object.assign(StateIcon, {
      geo: spec.geo,
      rest: spec.rest,
      change: spec.change,
      states: spec.states,
    }),
    core
  );
}

// ── Drawing variants and deprecated names ────────────────────────────────────

/** Props that pick a toggle's drawing: Carbon's filled icons, and a family's other drawings by name. */
export interface VariantProps<V extends string = never> {
  /** Draw with Carbon's filled icons. */
  filled?: boolean;
  /** One of the family's other drawings (see each toggle). */
  variant?: V;
}

/** A component's statics (geo, a state icon's rest / change / states), without React's own. */
type StaticsOf<C> = Omit<C, keyof React.FC>;
/** React's own fields: a component's, or a forwardRef's (`$$typeof`, `render`) on React 18. Never copied as statics. */
export const REACT_KEYS: ReadonlySet<string> = new Set([
  'displayName',
  'propTypes',
  'defaultProps',
  '$$typeof',
  'render',
]);
function staticsOf(c: object) {
  return Object.fromEntries(
    Object.entries(c).filter(([k]) => !REACT_KEYS.has(k) && k !== 'pick')
  );
}

/**
 * One toggle with several drawings (outline / filled, or a family's named
 * variants): each drawing is its own frame toggle, untouched, and this picks
 * which one renders from `filled` / `variant`. Its statics are the default
 * drawing's; `pick(props)` returns the toggle a given `filled` / `variant`
 * renders (for tests and review sheets). Changing `filled` or `variant` on a
 * mounted icon swaps the drawing (it remounts at the current state).
 */
/* @__NO_SIDE_EFFECTS__ */
export function makeVariantToggle<
  P extends VariantProps<string>,
  C extends React.ComponentType<P> & object,
>(
  name: string,
  pick: (props: P) => C
): React.FC<P> & StaticsOf<C> & { pick: (props: P) => C } {
  // The ref goes to the drawing it picks (that icon's handle).
  const Toggle = withRef<P, MotionIconHandle>(
    name,
    function Toggle(props, ref) {
      return React.createElement(pick(props) as React.ComponentType<P>, {
        ...props,
        ref,
      });
    }
  );
  return Object.assign(Toggle, staticsOf(pick({} as P)) as StaticsOf<C>, {
    pick,
  });
}

/**
 * A deprecated name for a toggle with its drawing now a prop: renders
 * `Target` with `fixed` (e.g. `{ filled: true }`) over the caller's props.
 * Its statics are that drawing's.
 */
/* @__NO_SIDE_EFFECTS__ */
export function deprecatedToggle<T extends React.ComponentType<never> & object>(
  name: string,
  Target: T,
  fixed: Record<string, unknown>
): T {
  const pick = (Target as { pick?: (p: Record<string, unknown>) => object })
    .pick;
  // The ref goes to the target (its handle).
  const Alias = withRef<Record<string, unknown>, MotionIconHandle>(
    name,
    function Alias(props, ref) {
      return React.createElement(
        Target as unknown as React.ComponentType<Record<string, unknown>>,
        { ...props, ...fixed, ref }
      );
    }
  );
  return Object.assign(
    Alias,
    staticsOf(pick ? pick(fixed) : Target),
    pick
      ? { pick: (p: Record<string, unknown>) => pick({ ...p, ...fixed }) }
      : {}
  ) as unknown as T;
}
