/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Icons as data (refactor stage 2): every Motion Icon is a spec, a plain
 * object built by one of these constructors, and the bindings make their
 * output from it (the React package's `toReact`, the web components'
 * elements). The constructors replace the React package's factories one for
 * one (`makeHoverIcon` → `hoverIcon`, …) with the same arguments, so an icon
 * module reads as before, minus React.
 *
 * A spec carries everything about an icon: its geometry, timings, states and
 * changes, and its still drawings as data (`static`, `statics`: Carbon's art
 * or a rest drawing, static/index.ts). Nothing here renders or runs.
 */
import type {
  BaseGeo,
  CountPlacement,
  Placement,
  Status,
  Tone,
} from '../status';
import type { CarbonArt, GeoStill, Still } from '../static/index';
import type { ActionSpec } from './action';
import type { LoopSpec } from './loop';
import type { Playback } from './animate';
import type { Frame, Geo, ToggleFrameIn, TweenFn } from './frame';
import type { Shapes } from './shapes';
import type { TweenTiming } from './timing';

/** The React engine's name for a still drawing (its `CarbonIcon`): in the core, a still as data. */
export type CarbonIcon = Still;

/** A toggle's frame: hover `h`, toggle progress `p` (0 off → 1 on), and `e`, a second number for exits. */
export type ToggleFrame = { h: number; p: number; e: number };
export type ToggleGeo = (f: ToggleFrameIn, size?: number) => Shapes;
/** Tweens any of a state icon's numbers (the React engine's StateTweenFn). */
export type StateTweenFn = TweenFn;

interface Named<K extends string> {
  readonly kind: K;
  readonly name: string;
}

// ── Hover icons ──────────────────────────────────────────────────────────────

/** makeHoverIcon's spec. */
export interface HoverInput {
  geo: Geo<{ h: number; entering?: number }>;
  viewBox?: string;
  hover?: TweenTiming;
  /** The leave, when it isn't the hover's standard speed-up. */
  leave?: TweenTiming;
  /** Carbon's exact drawing for `animated={false}` (decision 5). Absent: the rest geometry. */
  static?: CarbonArt | GeoStill;
  /** What the icon acts out when the thing it stands for happens (engine/action.ts). */
  action?: ActionSpec;
}
export interface HoverIconSpec extends HoverInput, Named<'hover'> {}

/* @__NO_SIDE_EFFECTS__ */
export function hoverIcon(name: string, spec: HoverInput): HoverIconSpec {
  return { kind: 'hover', name, ...spec };
}

/**
 * A hover spec built elsewhere (a module's own producer), with Carbon's art
 * for `animated={false}` (decision 5): `withStatic(hover('Dot', 2), carbonArt(Dot32))`.
 */
/* @__NO_SIDE_EFFECTS__ */
export function withStatic<T extends HoverIconSpec>(
  spec: T,
  still: CarbonArt | GeoStill
): T {
  return { ...spec, static: still };
}

// ── Two-state toggles ────────────────────────────────────────────────────────

/** makeToggleIcon's spec. */
export interface ToggleInput<S extends string> {
  /** [off, on]: `toggled` means `on`. */
  states: readonly [S, S];
  /** The still drawings for [off, on], used when motion is off. */
  statics: readonly [Still, Still];
  geo: ToggleGeo;
  /** How a change animates (default: `p` tweens to 0 / 1); returns the tween it starts. */
  change?: (
    turningOn: boolean,
    f: ToggleFrame,
    tween: TweenFn,
    repaint: () => void
  ) => Playback;
  hover?: TweenTiming;
  holdAfter?: S;
  hovers?: Record<string, { hover?: TweenTiming; holdAfter?: S }>;
  /** The on state loops while it shows (loop.ts, `defineLoop`): the geometry reads `l` (periodic) and `w` (its weight). */
  loop?: LoopSpec;
}
export interface ToggleIconSpec<S extends string = string>
  extends ToggleInput<S>, Named<'toggle'> {}

/* @__NO_SIDE_EFFECTS__ */
export function toggleIcon<S extends string>(
  name: string,
  spec: ToggleInput<S>
): ToggleIconSpec<S> {
  return { kind: 'toggle', name, ...spec };
}

// ── State icons (more than two states) ───────────────────────────────────────

/** makeStateIcon's spec. */
export interface StateInput<S extends string> {
  states: readonly S[];
  statics: Record<S, Still>;
  rest: (state: S) => Frame;
  geo: (f: Frame, size?: number) => Shapes;
  change: (
    prev: S,
    next: S,
    f: Frame,
    tween: StateTweenFn,
    repaint: () => void
  ) => Playback | Playback[] | void;
  pressed?: (state: S) => boolean | 'mixed';
  hover?: TweenTiming;
  /**
   * The state a deprecated boolean `toggled` means (`false` is the first
   * state); bindings then also take `toggled` / `onToggle(next, isOn)`
   * (SkillLevelToggle's old API).
   */
  toggledState?: S;
  /**
   * A state the icon drops to from any other and comes back from
   * (VolumeLevelToggle's mute). Bindings then take a boolean `muted`: true
   * moves to this state from whatever state the icon shows, false moves back
   * to the state it left (or to `value`, when that names another state).
   * Clicks still step through `states`.
   */
  muteState?: S;
  /**
   * Old state names a binding still takes, each to the state it now means
   * (VolumeLevelToggle's `none` is `mute`). Deprecated: a binding maps them
   * on the way in and never reports them.
   */
  renamed?: Partial<Record<S, S>>;
  /**
   * An indicator (ProgressStep): it follows `value` only. Its own clicks
   * never step it, so bindings ignore them; the host changes `value`.
   */
  indicator?: boolean;
}
export interface StateIconSpec<S extends string = string>
  extends StateInput<S>, Named<'state'> {}

/** A state icon that also takes the deprecated boolean `toggled` (its `toggledState`). */
export type BooleanStateIconSpec<S extends string = string> =
  StateIconSpec<S> & { readonly toggledState: S };
/** A state icon with a mute state (its `muteState`): bindings also take the boolean `muted`. */
export type MutableStateIconSpec<S extends string = string> =
  StateIconSpec<S> & { readonly muteState: S };

/* @__NO_SIDE_EFFECTS__ */
export function stateIcon<S extends string>(
  name: string,
  spec: StateInput<S> & { toggledState: S }
): BooleanStateIconSpec<S>;
export function stateIcon<S extends string>(
  name: string,
  spec: StateInput<S> & { muteState: S }
): MutableStateIconSpec<S>;
export function stateIcon<S extends string>(
  name: string,
  spec: StateInput<S>
): StateIconSpec<S>;
/* @__NO_SIDE_EFFECTS__ */
export function stateIcon<S extends string>(
  name: string,
  spec: StateInput<S>
): StateIconSpec<S> {
  return { kind: 'state', name, ...spec };
}

// ── Drawings, aliases ────────────────────────────────────────────────────────

export type DrawingSpec =
  | HoverIconSpec
  | ToggleIconSpec<any>
  | StateIconSpec<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/** Props that pick a toggle's drawing. */
export interface VariantProps<V extends string = never> {
  filled?: boolean;
  variant?: V;
}

/** One toggle, several drawings picked by `filled` / `variant`; it carries the default drawing's fields. */
export type VariantIconSpec<
  P = VariantProps<string>,
  C extends DrawingSpec = DrawingSpec,
> = Omit<C, 'kind' | 'name'> & Named<'variant'> & { pick: (p: P) => C };

/* @__NO_SIDE_EFFECTS__ */
export function variantToggle<P, C extends DrawingSpec>(
  name: string,
  pick: (p: P) => C
): VariantIconSpec<P, C> {
  const { kind: _k, name: _n, ...rest } = pick({} as P);
  void _k;
  void _n;
  return { ...(rest as Omit<C, 'kind' | 'name'>), kind: 'variant', name, pick };
}

/**
 * A second name: `target` with `fixed` props over the caller's. A deprecated
 * toggle name (no element in the web components), or a status alias (Carbon's
 * static status names: a status icon with its status fixed, which has an
 * element, hovers on its mark, and draws `still`, Carbon's art, with motion off).
 */
export type AliasIconSpec<T extends IconSpec = IconSpec> = Omit<
  T,
  'kind' | 'name'
> &
  Named<'alias'> & {
    target: T;
    fixed: Record<string, unknown>;
    still?: CarbonArt | GeoStill;
  };

/* @__NO_SIDE_EFFECTS__ */
export function aliasOf<T extends IconSpec>(
  name: string,
  target: T,
  fixed: Record<string, unknown>,
  still?: CarbonArt | GeoStill
): AliasIconSpec<T> {
  const drawn =
    (target as { pick?: (p: Record<string, unknown>) => IconSpec }).pick?.(
      fixed
    ) ?? target;
  const { kind: _k, name: _n, ...rest } = drawn;
  void _k;
  void _n;
  return {
    ...(rest as unknown as Omit<T, 'kind' | 'name'>),
    kind: 'alias',
    name,
    target,
    fixed,
    ...(still && { still }),
  };
}

// ── Status ───────────────────────────────────────────────────────────────────

/** The statuses a process icon takes. */
export type ProcessStatus = 'success' | 'warning' | 'error' | 'pending';

/** How an icon takes its statuses (the React package's StatusSpec). */
export interface StatusSpec<S extends Status = Status> {
  statuses: readonly S[];
  placement: Placement;
  count?: boolean;
  geo: BaseGeo;
  hover?: TweenTiming;
  leave?: TweenTiming;
  /** Why it takes no such status, for one it refuses on purpose (CheckmarkOutline's success: it already says it). */
  refused?: Partial<Record<Status, string>>;
}
/** A status-capable icon: its status layer, plus the plain icon it is with no status. */
export interface StatusIconDataSpec<S extends Status = Status>
  extends StatusSpec<S>, Named<'status'> {
  readonly base: IconSpec;
}

/** makeStatusIcon(name, Base, spec), with the plain icon as a spec. */
/* @__NO_SIDE_EFFECTS__ */
export function statusIcon<S extends Status>(
  name: string,
  base: IconSpec,
  spec: StatusSpec<S>
): StatusIconDataSpec<S> {
  return { kind: 'status', name, base, ...spec };
}

export type IconSpec =
  | DrawingSpec
  | VariantIconSpec<any, any>
  | AliasIconSpec<any>
  | StatusIconDataSpec<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

// ── Framework-neutral props (a binding adds its own: className, style, handlers) ──

export interface AnimatedIconProps {
  size?: 16 | 20 | 24 | 32;
  animated?: boolean;
  'aria-label'?: string;
}
export interface ToggleIconProps<
  S extends string = string,
> extends AnimatedIconProps {
  value?: S;
  onChange?: (next: S) => void;
  toggled?: boolean;
  onToggle?: (next: S, toggled: boolean) => void;
  initial?: S;
  asButton?: boolean;
  disableToggle?: boolean;
  /** With `asButton`: the button is disabled (no tab stop, no toggling, no hover). */
  disabled?: boolean;
  filled?: boolean;
  /** The input level, 0 to 1, or a function read each frame (a listening state follows it). */
  level?: number | (() => number);
}
export type StateIconProps<S extends string> = Omit<
  ToggleIconProps<S>,
  'toggled' | 'onToggle'
>;
/** A state icon's props with a mute state (MutableStateIconSpec). */
export type MutedStateIconProps<S extends string> = StateIconProps<S> & {
  /**
   * Mute from whatever state the icon shows (true), and come back to the
   * state it left (false; `value` wins when it names another state). Unset:
   * no effect. Controlled, as `value` is: update it from `onChange`.
   */
  muted?: boolean;
};
/** Status props (the React package's StatusProps, framework-neutral). */
export interface StatusProps<S extends string> extends AnimatedIconProps {
  status?: S;
  tone?: boolean | Tone;
}
export interface CountStatusProps extends StatusProps<'notification'> {
  count?: number;
  max?: 9 | 99;
  countPlacement?: CountPlacement;
}
