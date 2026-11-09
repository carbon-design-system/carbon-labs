/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Specs → React components. Every icon is a spec in
 * `@carbon-labs/motion-icons-core` (plain data); the icon modules in this
 * package are generated mirrors, `export const X = reactHover(XSpec)`.
 *
 * Each builder hands its spec to the React factory for its kind
 * (`hoverIcon` → `makeHoverIcon`, …), turning its still drawings (data) into
 * components on the way, statics included. There is one builder per kind, so an icon's module
 * pulls in only its own kind's factory (`toReact` is the generic one, for
 * tools and tests). All memoize per spec: a spec reached twice (a status
 * icon's plain icon, an alias's target, a variant's drawing) is one
 * component.
 *
 * Every component takes a `ref` whose handle is a MotionIconHandle
 * (`play()`, `svg`; see utils/handle). The stills made here forward theirs
 * to their svg, so a toggle drawn still still has one.
 */
import React from 'react';
import type {
  AliasIconSpec,
  BooleanStateIconSpec,
  DrawingSpec,
  HoverIconSpec,
  IconSpec,
  MutableStateIconSpec,
  MutedStateIconProps,
  StateIconSpec,
  StatusIconDataSpec,
  ToggleIconSpec,
  VariantIconSpec,
} from '@carbon-labs/motion-icons-core/engine';
import type {
  CarbonArt,
  GeoStill,
  Still,
} from '@carbon-labs/motion-icons-core/static/index';
import { carbonIcon } from './static/carbonIcon';
import { knownState } from '@carbon-labs/motion-icons-core/engine/frame';
import {
  deprecatedToggle,
  makeHoverIcon,
  makeStateIcon,
  makeToggleIcon,
  makeVariantToggle,
  type CarbonIcon,
  type FrameHoverIcon,
  type FrameStateIcon,
  type FrameToggleIcon,
  type HoverSpec,
  type StateIconProps,
  type StateSpec,
  type ToggleSpec,
} from './utils/frameIcon';
import {
  makeStatusIcon,
  type CountStatusProps,
  type ProcessStatus,
  type StatusCapable,
  type StatusProps,
  type StatusSpec,
} from './utils/statusLayer';
import { IconSvg } from './utils/IconSvg';
import { passThrough } from './utils/passThrough';
import { withRef } from './utils/handle';
import type { AnimatedIconProps, MotionIconHandle } from './types';
import type { ActionKit } from './actions';

/* eslint-disable @typescript-eslint/no-explicit-any */

/** A component's statics, without React's own. */
type StaticsOf<C> = Omit<C, keyof React.FC>;
type PropsOf<C> = C extends React.FC<infer P> ? P : never;
/** A spec's own extra data (a status-mark icon's `parts`), carried onto its component. */
type Extra<S, K extends PropertyKey> = Omit<S, K | 'kind' | 'name'>;

/** An icon's framework-neutral props (the core's), plus what React adds: className, style, onClick, and a ref to its handle. */
export type ReactProps<P> = P & {
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<SVGSVGElement>;
  ref?: React.Ref<MotionIconHandle>;
};

/** A state icon's props plus the deprecated boolean shorthand (`toggled`: its `toggledState`, else the first state). */
export type BooleanStateIconProps<S extends string> = StateIconProps<S> & {
  /** @deprecated Use `value`. */
  toggled?: boolean;
  /** @deprecated Use `onChange`. The boolean is whether `next` is the toggled state. */
  onToggle?: (next: S, toggled: boolean) => void;
};

export type { MutedStateIconProps };

/** The component a spec becomes, typed as its factory's (statics included). */
export type ReactIcon<S> = S extends HoverIconSpec
  ? FrameHoverIcon & Extra<S, keyof HoverIconSpec>
  : S extends ToggleIconSpec<infer St>
    ? FrameToggleIcon<St>
    : S extends BooleanStateIconSpec<infer St>
      ? React.FC<BooleanStateIconProps<St>> & StaticsOf<FrameStateIcon<St>>
      : S extends MutableStateIconSpec<infer St>
        ? MutedStateIcon<St>
        : S extends StateIconSpec<infer St>
          ? FrameStateIcon<St>
          : S extends VariantIconSpec<infer P, infer C>
            ? React.FC<P & PropsOf<DrawingIcon<C>>> &
                StaticsOf<DrawingIcon<C>> & {
                  pick: (props: P) => DrawingIcon<C>;
                }
            : S extends AliasIconSpec<infer T>
              ? AliasIcon<T>
              : S extends StatusIconDataSpec<infer St>
                ? StatusCapable<
                    [St] extends ['notification']
                      ? CountStatusProps
                      : StatusProps<St>
                  >
                : React.FC<AnimatedIconProps>;
/** A drawing's component (one level: what a variant picks). */
type DrawingIcon<C> = C extends HoverIconSpec
  ? FrameHoverIcon
  : C extends ToggleIconSpec<infer St>
    ? FrameToggleIcon<St>
    : C extends MutableStateIconSpec<infer St>
      ? MutedStateIcon<St>
      : C extends StateIconSpec<infer St>
        ? FrameStateIcon<St>
        : React.FC<AnimatedIconProps>;
/** A state icon with a mute state: it also takes `muted`. */
type MutedStateIcon<S extends string> = React.FC<MutedStateIconProps<S>> &
  StaticsOf<FrameStateIcon<S>>;
/** An alias's component: its target's (a status alias: its base's, the status fixed). */
type AliasIcon<T> =
  T extends VariantIconSpec<infer P, infer C>
    ? React.FC<P & PropsOf<DrawingIcon<C>>> &
        StaticsOf<DrawingIcon<C>> & { pick: (props: P) => DrawingIcon<C> }
    : T extends StatusIconDataSpec<infer St>
      ? StatusCapable<Omit<StatusProps<St>, 'status'>>
      : DrawingIcon<T>;

export interface ToReactOptions {
  /** Alias: the component it renders with its fixed props (default: its target's component). */
  target?: React.ComponentType<any>;
  /** Status: the plain icon it renders with no status (default: its base's component). */
  base?: React.ComponentType<any>;
  /** Status: the action kit, when the plain icon has an action (the mirror passes `actions`, from ./actions). */
  actions?: ActionKit;
}

const made = new WeakMap<object, unknown>();
const stills = new WeakMap<object, CarbonIcon>();

/** One component per spec. */
function memo<T>(spec: object, make: () => T): T {
  let c = made.get(spec) as T | undefined;
  if (c === undefined) {
    made.set(spec, (c = make()));
  }
  return c;
}

/** Carbon's art (data) as a component, mirrored if asked. */
function carbonStill(s: CarbonArt): CarbonIcon {
  const Art = carbonIcon(...s.drawings);
  return s.mirror
    ? (withRef<{ style?: React.CSSProperties }, SVGSVGElement>(
        undefined,
        function Mirrored(props, ref) {
          return React.createElement(Art, {
            ...props,
            ref,
            style: { ...props.style, transform: 'scaleX(-1)' },
          });
        }
      ) as CarbonIcon)
    : Art;
}

/** A rest drawing from geometry, as a component. */
function geoStill(s: GeoStill): CarbonIcon {
  const geo = s.geo;
  type Props = Omit<AnimatedIconProps, 'ref'> & {
    className?: string;
    style?: React.CSSProperties;
    onClick?: React.MouseEventHandler<SVGSVGElement>;
  };
  return withRef<Props, SVGSVGElement>(s.name, function GeoStill(props, ref) {
    const {
      size = 32,
      className,
      style,
      'aria-label': ariaLabel,
      onClick,
    } = props;
    const shapes = geo({ h: 0 }, size);
    const children = React.createElement(
      'g',
      { 'data-mc-ink': true },
      Object.entries(shapes).map(([k, attrs]) => {
        const { tag = 'path', ...rest } = attrs as Record<
          string,
          string | number
        > & { tag?: string };
        return React.createElement(String(tag), {
          key: k,
          'data-k': k,
          ...rest,
        });
      })
    );
    return React.createElement(
      IconSvg,
      {
        ref,
        size,
        className,
        style,
        ariaLabel,
        onClick,
        attrs: passThrough(props),
      },
      children
    );
  }) as CarbonIcon;
}

/** A hover icon's still: Carbon's art or a geometry drawing (never another icon's, so a hover icon carries no toggle code). */
function hoverStill(s: CarbonArt | GeoStill): CarbonIcon {
  let c = stills.get(s);
  if (!c) {
    stills.set(s, (c = s.kind === 'carbon' ? carbonStill(s) : geoStill(s)));
  }
  return c;
}

/** A toggle's still: any still, another icon's rest drawing included. */
function stillOf(s: Still): CarbonIcon {
  if (s.kind !== 'spec') {
    return hoverStill(s);
  }
  let c = stills.get(s);
  if (!c) {
    const Icon = reactDrawing(
      s.spec as DrawingSpec
    ) as React.ComponentType<AnimatedIconProps>;
    // Its ref is the drawn icon's (a handle).
    c = withRef<AnimatedIconProps, MotionIconHandle>(
      undefined,
      function Still(props, ref) {
        return React.createElement(Icon, { ...props, ref, animated: false });
      }
    ) as CarbonIcon;
    stills.set(s, c);
  }
  return c;
}
const stillsOf = <K extends string>(r: Record<K, Still>) =>
  Object.fromEntries(
    Object.entries(r).map(([k, v]) => [k, stillOf(v as Still)])
  ) as Record<K, CarbonIcon>;

/** A spec's fields beyond `known`: extra data its module adds (a status-mark icon's `parts`). */
function extras(spec: object, known: readonly string[]) {
  return Object.fromEntries(
    Object.entries(spec).filter(
      ([k]) => k !== 'kind' && k !== 'name' && !known.includes(k)
    )
  );
}
const HOVER_KEYS = [
  'geo',
  'viewBox',
  'hover',
  'leave',
  'static',
  'action',
] as const;

/**
 * A hover icon (makeHoverIcon). An icon with an action gets the action kit
 * from its mirror (`reactHover(CopySpec, actions)`), so icons without one
 * don't carry it.
 */
/* @__NO_SIDE_EFFECTS__ */
export function reactHover<S extends HoverIconSpec>(
  spec: S,
  kit?: ActionKit
): ReactIcon<S> {
  return memo(spec, () => {
    const { geo, viewBox, hover, leave, static: still, action } = spec;
    const own = {
      geo,
      ...(viewBox !== undefined && { viewBox }),
      ...(hover && { hover }),
      ...(leave && { leave }),
      ...(still && { static: hoverStill(still) }),
      ...(action && { action }),
    } as HoverSpec;
    const extra = extras(spec, HOVER_KEYS);
    const Icon = makeHoverIcon(spec.name, own, kit);
    return Object.keys(extra).length ? Object.assign(Icon, extra) : Icon;
  }) as ReactIcon<S>;
}

/** A two-state toggle (makeToggleIcon). */
/* @__NO_SIDE_EFFECTS__ */
export function reactToggle<S extends ToggleIconSpec<any>>(
  spec: S
): ReactIcon<S> {
  return memo(spec, () => {
    const { kind: _k, name, statics, ...rest } = spec;
    void _k;
    return makeToggleIcon(name, {
      ...rest,
      statics: [stillOf(statics[0]), stillOf(statics[1])],
    } as unknown as ToggleSpec<string>);
  }) as ReactIcon<S>;
}

/** A state icon (makeStateIcon), with the boolean shorthand when it has a `toggledState`. */
/* @__NO_SIDE_EFFECTS__ */
export function reactState<S extends StateIconSpec<any>>(
  spec: S
): ReactIcon<S> {
  return memo(spec, () => {
    const {
      kind: _k,
      name,
      statics,
      toggledState,
      muteState,
      renamed,
      ...rest
    } = spec;
    void _k;
    const Icon = makeStateIcon(name, {
      ...rest,
      statics: stillsOf(statics),
    } as unknown as StateSpec<string>);
    if (muteState !== undefined) {
      return withMuted(name, Icon, spec.states, muteState, renamed ?? {});
    }
    return toggledState === undefined
      ? Icon
      : withToggled(name, Icon, spec.states[0], toggledState);
  }) as ReactIcon<S>;
}

/** One toggle, several drawings (makeVariantToggle). */
/* @__NO_SIDE_EFFECTS__ */
export function reactVariant<S extends VariantIconSpec<any, any>>(
  spec: S
): ReactIcon<S> {
  return memo(spec, () =>
    makeVariantToggle(
      spec.name,
      (p: any) =>
        reactDrawing(spec.pick(p)) as React.ComponentType<any> & object
    )
  ) as ReactIcon<S>;
}

/**
 * A deprecated name (deprecatedToggle): `target` (its target's component) with fixed props. The mirror
 * passes the component, so an alias carries only its target's code.
 */
/* @__NO_SIDE_EFFECTS__ */
export function reactAlias<S extends AliasIconSpec<any>>(
  spec: S,
  options: Required<Pick<ToReactOptions, 'target'>>
): ReactIcon<S> {
  return memo(spec, () =>
    deprecatedToggle(
      spec.name,
      options.target as React.ComponentType<never> & object,
      spec.fixed
    )
  ) as ReactIcon<S>;
}

/**
 * A status alias (Carbon's static status names): the status icon over the same plain icon, its status fixed,
 * hovering on its mark, and drawing Carbon's art with motion off. Its own builder, so reactAlias (the deprecated
 * toggle names, reachable from every toggle's stills) carries no status code.
 */
/* @__NO_SIDE_EFFECTS__ */
export function reactStatusAlias<
  S extends AliasIconSpec<StatusIconDataSpec<any>>,
>(spec: S, options: Required<Pick<ToReactOptions, 'target'>>): ReactIcon<S> {
  return memo(spec, () => {
    const target = options.target as unknown as StatusCapable<
      StatusProps<string>
    >;
    const {
      kind: _k,
      name,
      base: _b,
      target: _t,
      fixed,
      still,
      ...rest
    } = spec as unknown as AliasIconSpec<StatusIconDataSpec<any>> & {
      base: unknown;
    };
    void [_k, _b, _t];
    return makeStatusIcon<StatusProps<ProcessStatus>>(
      name,
      target.status.plain,
      rest as unknown as StatusSpec,
      {
        status: String(fixed.status),
        ...(still && { still: hoverStill(still) as never }),
      }
    );
  }) as ReactIcon<S>;
}

/** A status-capable icon (makeStatusIcon) over `base`, its plain icon's component (the mirror passes it). */
/* @__NO_SIDE_EFFECTS__ */
export function reactStatus<S extends StatusIconDataSpec<any>>(
  spec: S,
  options: Required<Pick<ToReactOptions, 'base'>> &
    Pick<ToReactOptions, 'actions'>
): ReactIcon<S> {
  return memo(spec, () => {
    const { kind: _k, name, base: _b, ...rest } = spec;
    void _k;
    void _b;
    return makeStatusIcon<StatusProps<ProcessStatus>>(
      name,
      options.base as React.ComponentType<AnimatedIconProps>,
      rest as StatusSpec,
      undefined,
      options.actions
    );
  }) as ReactIcon<S>;
}

/** Any icon but a status icon. */
function reactDrawing(spec: IconSpec): unknown {
  switch (spec.kind) {
    case 'hover':
      return reactHover(spec);
    case 'toggle':
      return reactToggle(spec);
    case 'state':
      return reactState(spec);
    case 'variant':
      return reactVariant(spec);
    case 'alias':
      return reactAlias(spec, {
        target: reactDrawing(spec.target) as React.ComponentType<any>,
      });
    default:
      throw new Error(`${spec.name}: a status icon isn't a plain drawing`);
  }
}

/** The React component for any spec (one per spec). */
/* @__NO_SIDE_EFFECTS__ */
export function toReact<S extends IconSpec>(
  spec: S,
  options: ToReactOptions = {}
): ReactIcon<S> {
  if (spec.kind === 'status') {
    return reactStatus(spec, {
      base:
        options.base ?? (reactDrawing(spec.base) as React.ComponentType<any>),
    }) as ReactIcon<S>;
  }
  if (spec.kind === 'alias' && options.target) {
    return reactAlias(spec, { target: options.target }) as ReactIcon<S>;
  }
  return reactDrawing(spec) as ReactIcon<S>;
}

/** A state icon that also takes the boolean `toggled` / `onToggle` (`false` is `off`, `true` `on`). */
function withToggled<S extends string>(
  name: string,
  Inner: FrameStateIcon<S>,
  off: S,
  on: S
) {
  const Toggle = withRef<BooleanStateIconProps<S>, MotionIconHandle>(
    name,
    function Toggle({ toggled, onToggle, ...props }, ref) {
      return React.createElement(Inner, {
        ...props,
        ref,
        value:
          props.value ??
          (toggled === undefined ? undefined : toggled ? on : off),
        onChange: onToggle
          ? (next: S) => {
              props.onChange?.(next);
              onToggle(next, next === on);
            }
          : props.onChange,
      });
    }
  );
  return Object.assign(Toggle, {
    geo: Inner.geo,
    rest: Inner.rest,
    change: Inner.change,
    states: Inner.states,
  });
}

/**
 * A state icon with a mute state (VolumeLevelToggle's mute; see the spec's
 * `muteState`). `muted` drops to it from whatever state the icon shows and,
 * back to false, returns to the state it left: the last other state it
 * showed, or `value` when that names one. Unset, the icon is as before.
 * `muted` is controlled, as `value` is: a click still asks `onChange` for the
 * next state in click order, and the app updates `muted` from it. Renamed
 * states (`none`, mute's old name) are mapped on the way in.
 *
 * The wrapper holds the state (the inner icon is always controlled), so it
 * knows the level to come back to with or without `value`.
 */
function withMuted<S extends string>(
  name: string,
  Inner: FrameStateIcon<S>,
  states: readonly S[],
  mute: S,
  renamed: Partial<Record<S, S>>
) {
  const norm = (s: S | undefined): S | undefined =>
    s === undefined ? s : (renamed[s] ?? s);
  // With no level yet (it started muted): the first other state in click order, as a click from mute goes.
  const firstOther = states.find((s) => s !== mute) ?? mute;
  const Muted = withRef<MutedStateIconProps<S>, MotionIconHandle>(
    name,
    function Muted(
      { muted, value: rawValue, initial: rawInitial, onChange, ...props },
      ref
    ) {
      // A state the icon doesn't have is ignored (warned): a controlled value keeps the last one it named.
      const named =
        rawValue === undefined
          ? undefined
          : knownState(name, states, norm(rawValue));
      const [kept, setKept] = React.useState<S | undefined>(named);
      if (named !== undefined && named !== kept) {
        setKept(named);
      }
      const value = rawValue === undefined ? undefined : (named ?? kept);
      const initial = knownState(name, states, norm(rawInitial));
      // Uncontrolled: the state clicks move (as the inner icon would hold it).
      const [own, setOwn] = React.useState<S>(initial ?? states[0]);
      const shown = value ?? own;
      // The state to come back to: the last other state shown.
      const [level, setLevel] = React.useState<S>(
        shown !== mute ? shown : firstOther
      );
      if (shown !== mute && shown !== level) {
        setLevel(shown);
      }
      const target =
        muted === undefined
          ? shown
          : muted
            ? mute
            : shown !== mute
              ? shown
              : level;
      return React.createElement(Inner, {
        ...props,
        ref,
        value: target,
        onChange: (next: S) => {
          if (value === undefined) {
            setOwn(next);
          }
          onChange?.(next);
        },
      });
    }
  );
  return Object.assign(Muted, {
    geo: Inner.geo,
    rest: Inner.rest,
    change: Inner.change,
    states: Inner.states,
  });
}
