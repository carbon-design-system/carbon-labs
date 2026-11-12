/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type React from 'react';
import type {
  ActionOptions,
  ActionThen,
} from '@carbon-labs/motion-icons-core/engine/action';

export type { ActionOptions, ActionThen };

/**
 * What an icon's `ref` gets: a handle on the mounted icon, not its DOM node.
 *
 * ```tsx
 * const icon = useRef<MotionIconHandle>(null);
 * <Save ref={icon} />
 * // later: icon.current?.play();  icon.current?.svg (the <svg> element)
 * ```
 */
export interface MotionIconHandle {
  /**
   * Play the icon's hover once, in then out, as `usePlayHover`'s `play()`
   * does for a frame: for hover-only icons on touch, or emphasis. Resolves
   * when the play is over: the hover is back at rest, or a pointer or
   * keyboard focus that arrived mid-play holds it. Resolves at once, playing
   * nothing, under reduced motion or `animated={false}` (still drawings),
   * inside a disabled button frame, while a hover already shows (it doesn't
   * restart), on a status icon while its status shows, and on `StatusPip`.
   */
  play(): Promise<void>;
  /**
   * The icon's `<svg>` element (null before mount): the DOM node a ref used
   * to mean. With `asButton` it is the svg inside the button
   * (`svg.parentElement` is the button). It follows the drawing shown, so
   * read it when you need it rather than keeping it.
   */
  readonly svg: SVGSVGElement | null;
  /**
   * Play the icon's action: the one-shot motion it makes when the thing it
   * stands for happens (Copy copies, Send sends, Renew renews). It takes over
   * from the hover, plays once (or with `loop` until `stop()`, or `until` a
   * promise settles), returns to rest and resolves. `then` hands off to a
   * status on status icons (`{ status: 'success', for: 1500 }`); `failed` is
   * the status if `until` rejects. Triggering mid-play restarts it. Under
   * reduced motion or `animated={false}` nothing plays and the status
   * applies at once. On an icon without an action it resolves at once and
   * warns (once per icon); nothing plays and nothing is handed off. Only
   * icons with an action carry the code that plays one.
   */
  trigger(options?: ActionOptions): Promise<void>;
  /** Ends a looping action: the pass in flight finishes, then it rests (and hands off). */
  stop(): void;
}

/** An icon's `ref`. */
export type MotionIconRef = React.Ref<MotionIconHandle>;

/**
 * The svg's other attributes (`id`, `title`, `aria-labelledby`,
 * `aria-describedby`, `tabIndex`, handlers; `data-*` too, which JSX takes
 * unchecked), passed through as @carbon/icons-react passes them: onto the
 * `<svg>`, or the button with `asButton`. An accessible name (`aria-label`,
 * `aria-labelledby` or `title`) makes the svg `role="img"`; without one it
 * is `aria-hidden`.
 */
export type SvgPassThroughProps = Omit<
  React.SVGAttributes<SVGSVGElement>,
  | 'onChange'
  | 'onToggle'
  | 'onClick'
  | 'className'
  | 'style'
  | 'aria-label'
  | 'children'
>;

export interface AnimatedIconProps extends SvgPassThroughProps {
  /**
   * A handle on the mounted icon: `play()` its hover, or reach its `<svg>`
   * (see MotionIconHandle). React 19 passes it as a prop; on React 18 the
   * icons are forwardRef components, so `ref` works the same.
   */
  ref?: React.Ref<MotionIconHandle>;
  /** The icon's size in px: one of Carbon's icon sizes. Default 32. */
  size?: 16 | 20 | 24 | 32;
  /**
   * When false, renders the icon still (toggles draw Carbon's own art, the
   * same DOM as @carbon/icons-react, from @carbon/icons descriptors) and runs
   * no animation code. Inherits from MotionIconProvider if not set.
   *
   * When unset, the icon is static whenever prefers-reduced-motion: reduce
   * is active, with or without a provider.
   */
  animated?: boolean;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
  onClick?: React.MouseEventHandler<SVGSVGElement>;
  /**
   * Whether the icon shrinks a little while it is pressed. Unset: it presses
   * when it is the control: a toggle with `asButton`, an icon with
   * `actionOn="click"`, or an icon in a frame marked
   * `data-motion-icon-frame="press"`, and not inside another control (a
   * button, a link, a menu item, a tab: those press themselves). `true`
   * always presses, `false` never. Never under reduced motion, with
   * `animated={false}`, or on a disabled button.
   */
  press?: boolean;
}

/** Declarative actions (hover and status icons; see MotionIconHandle.trigger). */
export interface ActionProps {
  /** Plays the action whenever it changes (not on mount): a count of copies, a message id, a timestamp. */
  actionKey?: string | number | boolean | null;
  /** `"click"`: the icon's own click plays its action. */
  actionOn?: 'click';
  /** While true the action loops (Renew while syncing); turning false lets the pass finish, then the hand-off. */
  loop?: boolean;
  /** The status the action hands off to (status icons): `{ status: 'success', for: 1500 }`. */
  actionThen?: ActionThen;
}

export interface ToggleIconProps<
  S extends string = string,
> extends AnimatedIconProps {
  /**
   * Controlled state, by name (`'on'`/`'off'`, `'play'`/`'pause'`, …). When
   * provided, the component does not manage its own state: it renders and
   * animates whatever this prop says. Any change animates, whether it came
   * from the icon's own click (via `onChange`) or from elsewhere in the app.
   * A click the parent doesn't act on doesn't animate. Takes precedence over
   * `toggled`.
   *
   * Icon inside someone else's button (e.g. Carbon's `HeaderGlobalAction`):
   * pass `value` (or `toggled`) from app state and `disableToggle`, let the
   * button's own `onClick` change that state, and mark the button
   * `data-motion-icon-frame` so hovering anywhere on it drives the icon.
   */
  value?: S;
  /** Fired when the icon's own click requests a change, with the next state's name. */
  onChange?: (next: S) => void;
  /**
   * Boolean shorthand for `value` on two-state toggles: `true` is the second
   * state (`on`, `pause`, `close`, …), `false` the first. Ignored when
   * `value` is provided.
   */
  toggled?: boolean;
  /**
   * Boolean shorthand for `onChange`: fired with the next state's name and
   * the boolean to pass back as `toggled`. Use the boolean:
   * `toggled={on} onToggle={(_, next) => setOn(next)}` works for every icon.
   * State names vary (`on`/`off`, `up`/`down`, `asleep`/`awake`, …), and on
   * the *Off* icons `toggled` means the "off" state is shown, so comparing
   * the name to `'on'` inverts them. Omit it if something else owns the state.
   */
  onToggle?: (next: S, toggled: boolean) => void;
  /**
   * Uncontrolled initial state. Ignored when `value` or `toggled` is provided.
   * Defaults to the first entry in the component's own `states` array.
   */
  initial?: S;
  /**
   * When `true`, the SVG is wrapped in an unstyled `<button type="button">`
   * with `aria-pressed` set to the boolean equivalent of the current state.
   * The SVG receives `role="presentation"` and the `aria-label` is moved to
   * the button element. Use this for standalone toggle controls.
   *
   * When `false` (default), `onClick` and `aria-label` go directly on the
   * `<svg>`.
   */
  asButton?: boolean;
  /**
   * When `true`, the icon's own clicks don't request a state change. It still
   * animates whenever the controlled `value` / `toggled` prop changes, and
   * hover is unaffected. Use this when something else owns the state — a
   * parent button, or a preview that shouldn't respond to clicks.
   */
  disableToggle?: boolean;
  /**
   * With `asButton`: the button is disabled (out of the tab order, its clicks
   * and keys don't toggle, no hover), as a disabled `<button>`. The web
   * component's `disabled` on an `as-button` does the same.
   */
  disabled?: boolean;
  /**
   * Draws the toggle with Carbon's filled icons (e.g. `<VideoOffToggle filled />`:
   * video--filled ⇄ video--off--filled), on toggles whose family has a filled
   * drawing. Outline ⇄ filled toggles, whose states already are the outline
   * and the filled icon, ignore it. Default `false` (except the checkbox
   * toggles, whose default follows Carbon's Checkbox: filled).
   */
  filled?: boolean;
  /** The input level, 0 to 1, or a function read each frame: what a listening state follows (MicrophoneListeningToggle). Other icons ignore it. */
  level?: number | (() => number);
}
