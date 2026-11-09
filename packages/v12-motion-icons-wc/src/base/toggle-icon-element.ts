/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Toggles and n-state icons as elements: one class for both (the core's
 * FrameController runs a two-state toggle as a state icon).
 *
 * State API, mapped from the React props:
 *  - `value` (attribute and property, reflected): the state by name. In HTML
 *    it is the initial state (React's `initial`); set later, it animates (a
 *    React controlled `value` change).
 *  - `toggled` (boolean, two-state only): shorthand, `true` is the second
 *    state. Kept in sync with `value` both ways.
 *  - `muted` (boolean, icons with a mute state: VolumeLevelToggle): set, it
 *    moves to the mute state from whatever state the icon shows; cleared,
 *    back to the state it left. Kept in sync with `value` both ways (a click
 *    into mute sets it, out of mute clears it). Renamed states (`none`, mute's
 *    old name) are taken in `value` and mapped (with a console note in
 *    development builds).
 *  - A click asks for the next state: the element fires a cancelable
 *    `clabs-motion-icon-beingchanged` (detail `{ value, previous, toggled }`); if no
 *    listener cancels it, `value` moves and `clabs-motion-icon-changed` follows.
 *    Cancelling and setting `value` yourself is React's controlled mode
 *    (Carbon's being-X / X-ed event pattern).
 *  - `disable-toggle`: the icon's own clicks don't ask (something else owns
 *    the state); hover is unaffected.
 *  - `as-button`: the host is the button (focusable, Enter / Space,
 *    `aria-pressed`), React's `asButton`. It needs an accessible name
 *    (`aria-label`, `aria-labelledby` or `title`): without one it warns, once
 *    (development builds).
 *  - `disabled`: the icon's clicks and keys don't toggle it, an `as-button`
 *    drops its tab stop and reports `aria-disabled="true"`, and it doesn't
 *    hover (a disabled frame).
 *  - `filled` (three-way: unset is the icon's default, `"false"` the outline),
 *    `variant`: pick the drawing; changing either redraws at the
 *    current state, at rest (React remounts).
 *  - `animated="false"`: the state's still drawing (Carbon's art), as React.
 *
 * The icon is the core's spec on the class (`static spec`): a toggle, a
 * state icon, or a variant toggle that picks one by `filled` / `variant`.
 */
import type { PropertyValues } from 'lit';
import {
  FrameController,
  insideControl,
  knownState,
  type DrawingSpec,
  type Shapes,
  type StateIconSpec,
  type StateSpec,
  type ToggleIconSpec,
  type VariantIconSpec,
} from '@carbon-labs/motion-icons-core/engine';
import { DEV, warnOnce } from '@carbon-labs/motion-icons-core/dev';
import type { Still } from '@carbon-labs/motion-icons-core/static/index';
import {
  MotionIconElement,
  NAMING,
  animatedConverter,
  type Controller,
} from './motion-icon-element';
import { engineSpec } from './stills';
import { prefix } from '../globals/register';

/** What a toggle element draws: a toggle, a state icon, or a variant toggle over them. */
export type ToggleElementSpec =
  | ToggleIconSpec<any>
  | StateIconSpec<any>
  | VariantIconSpec<any, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/** Elements already warned about an `as-button` inside a button or link (development builds). */
const insideWarned = new WeakSet<Element>();

export interface ChangeDetail<S extends string = string> {
  value: S;
  previous: S;
  toggled?: boolean;
}

export abstract class ToggleIconElement<
  S extends string = string,
> extends MotionIconElement {
  static properties = {
    ...MotionIconElement.properties,
    value: { reflect: true },
    toggled: { type: Boolean, reflect: true },
    muted: { type: Boolean, reflect: true },
    filled: { converter: animatedConverter, reflect: true },
    variant: { reflect: true },
    disableToggle: { type: Boolean, attribute: 'disable-toggle' },
    asButton: { type: Boolean, attribute: 'as-button', reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  static readonly eventBeforeChange = `${prefix}-icon-beingchanged`;
  static readonly eventChange = `${prefix}-icon-changed`;

  declare value?: S;
  declare toggled: boolean;
  /** Mute from any state, and back to the state it left (icons with a mute state). */
  declare muted: boolean;
  /** The state to come back to from mute: the last other state shown. */
  private level?: S;
  /**
   * Draw Carbon's filled icons. Three-way, as the React prop: unset is the
   * icon's default (outline, but filled for the checkbox toggles), `filled`
   * draws filled, `filled="false"` draws the outline.
   */
  declare filled?: boolean;
  declare variant?: string;
  declare disableToggle: boolean;
  declare asButton: boolean;
  declare disabled: boolean;

  declare protected controller?: FrameController<S> & Controller;

  /** The icon (subclasses set it). */
  static spec: ToggleElementSpec;

  /** The drawing for the current `filled` / `variant` (a variant toggle picks; others are their own). */
  protected drawing(): DrawingSpec {
    const s = (this.constructor as typeof ToggleIconElement).spec;
    return s.kind === 'variant'
      ? s.pick({ filled: this.filled, variant: this.variant })
      : s;
  }

  /** The drawing as the engine runs it. */
  protected spec(): StateSpec<S> {
    return engineSpec(this.drawing()) as unknown as StateSpec<S>;
  }

  /** The mute state, for an icon that has one (VolumeLevelToggle: mute). */
  private get muteState(): S | undefined {
    const d = this.drawing();
    return d.kind === 'state'
      ? ((d as StateIconSpec<S>).muteState as S | undefined)
      : undefined;
  }

  /** A renamed state's current name (VolumeLevelToggle's `none` is `mute`). */
  private renamedTo(v: S | undefined): S | undefined {
    const d = this.drawing();
    const renamed =
      d.kind === 'state'
        ? ((d as StateIconSpec<S>).renamed as Partial<Record<S, S>> | undefined)
        : undefined;
    return v !== undefined ? renamed?.[v] : undefined;
  }

  /** An indicator: it follows `value` only (ProgressStep). */
  private get indicator(): boolean {
    const d = this.drawing();
    return d.kind === 'state' && !!(d as StateIconSpec<S>).indicator;
  }

  /** The state a deprecated boolean `toggled` means on a state icon (SkillLevelToggle: basic). */
  private get toggledState(): S | undefined {
    const d = this.drawing();
    return d.kind === 'state'
      ? ((d as StateIconSpec<S>).toggledState as S | undefined)
      : undefined;
  }

  protected still(): Still | undefined {
    const d = this.drawing();
    const state = this.current();
    if (d.kind === 'toggle') {
      return (d as ToggleIconSpec<S>).statics[state === d.states[1] ? 1 : 0];
    }
    if (d.kind === 'state') {
      return (d as StateIconSpec<S>).statics[state];
    }
    return undefined;
  }

  /** `as-button` where it can be one: not inside another control (the core's CONTROL_SELECTOR: a button, link, menu item or tab, across shadow roots); that one is the button. */
  protected get actsAsButton(): boolean {
    if (!this.asButton) {
      return false;
    }
    if (insideControl(this)) {
      if (DEV && !insideWarned.has(this)) {
        insideWarned.add(this);
        console.warn(
          `[motion-icons] <${this.localName} as-button> is inside a button or link: that is the control, so the icon drops its own role and tab stop.`
        );
      }
      return false;
    }
    return true;
  }

  /** Its own button (`as-button`) presses by default. */
  protected get ownControl(): boolean {
    return this.asButton;
  }

  /** A state that loops: off screen, it holds. */
  protected get holdsOffScreen(): boolean {
    return !!this.spec().loop;
  }

  /** Every state, in click order. */
  get states(): readonly S[] {
    return this.spec().states;
  }

  constructor() {
    super();
    this.toggled = false;
    this.muted = false;
    this.disableToggle = false;
    this.asButton = false;
    this.disabled = false;
    this.addEventListener('click', () => this.requestNext());
    this.addEventListener('keydown', (e: KeyboardEvent) => {
      if (!this.actsAsButton || (e.key !== 'Enter' && e.key !== ' ')) {
        return;
      }
      e.preventDefault();
      // A held key auto-repeats: one press, one change.
      if (!e.repeat) {
        this.requestNext();
      }
    });
  }

  protected createController(painter: (shapes: Shapes) => void) {
    this.drawn = this.drawing();
    const c = new FrameController<S>(
      this.spec(),
      painter,
      this.drawSize,
      this.current()
    ) as FrameController<S> & Controller;
    // A looping state loops while the icon moves.
    c.setMoving(this.isAnimated);
    return c;
  }
  /** The drawing the controller runs. */
  private drawn?: DrawingSpec;

  /** The state the attributes ask for. */
  protected current(): S {
    const states = this.spec().states;
    const value = this.renamedTo(this.value) ?? this.value;
    if (value !== undefined && states.includes(value)) {
      return value;
    }
    if (states.length === 2) {
      return this.toggled ? states[1] : states[0];
    }
    return this.toggled && this.toggledState ? this.toggledState : states[0];
  }

  protected willUpdate(changed: PropertyValues) {
    const states = this.spec().states;
    const renamed = this.renamedTo(this.value);
    if (renamed !== undefined) {
      if (DEV) {
        console.warn(
          `[motion-icons] <${this.localName} value="${this.value}">: "${this.value}" is deprecated; use "${renamed}".`
        );
      }
      this.value = renamed;
    }
    if (
      this.value != null &&
      knownState(`<${this.localName}>`, states, this.value) === undefined
    ) {
      // A state the icon doesn't have: ignored (warned), the icon keeps its drawing.
      const prev = changed.get('value') as S | undefined;
      this.value =
        this.controller?.state ??
        (prev != null && states.includes(prev) ? prev : undefined);
    }
    const mute = this.muteState;
    if (mute !== undefined) {
      // `muted` set: to mute from the state shown, remembering it; cleared (later): back to it. In HTML, `muted` wins over `value`.
      const shown = this.current();
      if (
        changed.has('muted') &&
        (this.muted || this.hasPainted) &&
        this.muted !== (shown === mute)
      ) {
        if (this.muted) {
          this.level = shown;
        }
        this.value = this.muted
          ? mute
          : (this.level ?? states.find((s) => s !== mute) ?? mute);
      }
      const now = this.current();
      if (now !== mute) {
        this.level = now;
      }
      this.muted = now === mute;
    }
    if (states.length !== 2) {
      // A state icon's boolean shorthand: `toggled` is its toggledState, unset its first state.
      const on = this.toggledState;
      if (
        on &&
        changed.has('toggled') &&
        !changed.has('value') &&
        (this.hasPainted || this.value === undefined)
      ) {
        this.value = this.toggled ? on : states[0];
      }
      return;
    }
    // Keep the shorthand and the name in step (the one just set wins; `value` when both are).
    if (
      changed.has('toggled') &&
      !changed.has('value') &&
      (this.hasPainted || this.value === undefined)
    ) {
      this.value = this.toggled ? states[1] : states[0];
    } else if (this.value !== undefined) {
      this.toggled = this.value === states[1];
    }
  }

  protected updated(changed: PropertyValues) {
    super.updated(changed);
    const c = this.controller;
    if (!c) {
      return;
    }
    if (this.drawing() !== this.drawn) {
      // `filled` / `variant` picked another drawing: it draws at the current state, at rest (React remounts).
      c.destroy();
      this.controller = this.createController(this.painter);
      this.controller.repaint();
    } else if (
      changed.has('value') &&
      this.value !== undefined &&
      this.value !== c.state
    ) {
      c.setState(this.value, this.isAnimated);
    }
    if (
      (['asButton', 'value', 'muted', 'disabled', ...NAMING] as const).some(
        (k) => changed.has(k)
      )
    ) {
      this.updateSemantics();
    }
  }

  protected onMotionChange() {
    const c = this.controller;
    if (!c) {
      return;
    }
    // Moving again: a looping state starts its loop again.
    if (this.isAnimated) {
      return c.setMoving(true);
    }
    c.destroy();
    this.controller = this.createController(this.painter);
    this.controller.repaint();
  }

  protected onFrameClick() {
    if (!this.actsAsButton) {
      this.requestNext();
    }
  }

  /** A click: ask for the next state (cancelable), then move. */
  requestNext() {
    const c = this.controller;
    // An indicator (ProgressStep) follows `value` only: its clicks never ask.
    if (!c || this.disableToggle || this.disabled || this.indicator) {
      return;
    }
    const previous = c.state;
    const value = c.nextState();
    const states = this.spec().states;
    const on = states.length === 2 ? states[1] : this.toggledState;
    const detail: ChangeDetail<S> = {
      value,
      previous,
      ...(on !== undefined ? { toggled: value === on } : {}),
    };
    const ctor = this.constructor as typeof ToggleIconElement;
    const go = this.dispatchEvent(
      new CustomEvent(ctor.eventBeforeChange, {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail,
      })
    );
    if (!go) {
      return;
    }
    this.value = value;
    this.updateComplete.then(() =>
      this.dispatchEvent(
        new CustomEvent(ctor.eventChange, {
          bubbles: true,
          composed: true,
          detail,
        })
      )
    );
  }

  protected updateSemantics() {
    if (!this.actsAsButton) {
      if (this.getAttribute('tabindex') === '0' && this.dataset.mcTab) {
        this.removeAttribute('tabindex');
        delete this.dataset.mcTab;
      }
      super.updateSemantics();
      return;
    }
    const pressed = this.controller?.pressed() ?? false;
    // Host attributes, not only ElementInternals: getByRole and attribute-reading audits find the button.
    this.setAria(
      {
        role: 'button',
        ariaHidden: null,
        ariaPressed: String(pressed),
        ariaDisabled: this.disabled ? 'true' : null,
      },
      true
    );
    if (this.disabled) {
      // Disabled: out of the tab order (only our own tab stop; an author's tabindex is theirs).
      if (this.dataset.mcTab) {
        this.removeAttribute('tabindex');
        delete this.dataset.mcTab;
      }
    } else if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '0');
      this.dataset.mcTab = '1';
    }
    if (DEV && !this.named) {
      warnOnce(
        `unnamed|${this.localName}`,
        `[motion-icons] <${this.localName} as-button> has no accessible name: give it aria-label, aria-labelledby or title.`
      );
    }
  }
}
