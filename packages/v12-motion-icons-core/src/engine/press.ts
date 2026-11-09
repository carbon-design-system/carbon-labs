/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The press: an icon that is the control shrinks a little while it is held
 * down. Both bindings bind it (`bindPress`), so React and
 * the web components press alike.
 *
 * Which icons press. Only an icon that is the control:
 *  - a toggle that is its own button (`as-button`, React's `asButton`);
 *  - an icon whose action plays on its click (`action-on="click"`, React's
 *    `actionOn="click"`);
 *  - an icon whose frame says so: `data-motion-icon-frame="press"` (the
 *    frame is the control, and has no press of its own).
 * Not an icon inside something that already presses: a frame without
 * `"press"` (the kit's rollover buttons inset themselves on press), or
 * a control (`CONTROL_SELECTOR`: a button, a link, a menu item, a tab,
 * Carbon's `cds-button` / `cds-icon-button`). Not status, hover-only or
 * decorative icons. The author's `press` (React: a boolean prop; web
 * components: `press`, or `press="none"`) decides either way.
 *
 * What it does. One channel, 0 (rest) to 1 (pressed), on the engine's clock:
 * in at once (the full press on the next frame), out on fast-02 (PRESS_IN /
 * PRESS_OUT in timing.ts). It is one `scale()` about the icon's centre on
 * the drawing's `g[data-mc-ink]` (the group wrapping the whole drawing),
 * never on the root svg, which Renew's loop turns on the compositor
 * (turn.ts). The web components' pending spinner layer (a second svg the
 * compositor turns about the mark) stays unscaled, so its arc doesn't wobble.
 * Being its own attribute on its own element, it composes with hover,
 * toggles, actions, statuses and the turn: none of them writes it. It plays during an
 * action (it is the tap's feedback; only hover waits for an action). Under
 * reduced motion, with `animated="false"` and on a disabled control it
 * doesn't press. The whole drawing scales, so its 2px walls thin a little
 * while pressed (accepted).
 *
 * Input: a pointer (mouse, pen or touch) pressing with its main button, until
 * it is released, cancelled or leaves; Space or Enter on the focused control,
 * until that key comes up (a held key's repeats press nothing more) or focus
 * leaves.
 */
import { type Playback } from './animate';
import { animate } from './skip';
import { frameOf, insideControl, isDisabledFrame, ownButtonOf } from './env';
import { PRESS_IN, PRESS_OUT } from './timing';

/**
 * The scale fully pressed at `size` px: 1px in on every side, at every size
 * (0.875 at 16, 0.9 at 20, 0.9167 at 24, 0.9375 at 32).
 */
export function pressScale(size: number): number {
  return (size - 2) / size;
}

const round = (n: number) => Math.round(n * 1e4) / 1e4;

/** The group's transform at press `v` (0–1) toward `scale`: one scale about the 32 grid's centre. None at rest. */
export function pressTransform(v: number, scale: number): string | null {
  if (v <= 0) {
    return null;
  }
  const s = 1 - v * (1 - scale);
  const t = round(16 * (1 - s));
  return `translate(${t} ${t}) scale(${round(s)})`;
}

/**
 * The press channel: 0 (rest) to 1 (pressed), tweened on the engine's clock
 * and handed to `write`. A release before the pressed frame has drawn waits
 * for it, so a quick tap still shows one pressed frame.
 */
export class Press {
  /** Where the channel is: 0 at rest, 1 pressed. */
  value = 0;
  private held = false;
  /** A frame has drawn since the press. */
  private shown = true;
  private run?: Playback;
  /** The tween that may write (a stopped one's last value is ignored). */
  private token?: object;

  constructor(private readonly write: (value: number) => void) {}

  set(pressed: boolean): void {
    if (pressed === this.held) {
      return;
    }
    this.held = pressed;
    if (pressed) {
      this.shown = false;
      this.to(1);
    } else if (this.shown) {
      this.to(0);
    }
  }

  private to(target: 0 | 1): void {
    const token = (this.token = {});
    this.run?.stop();
    const { duration, ease } = target ? PRESS_IN : PRESS_OUT;
    this.run = animate(this.value, target, {
      duration,
      ease,
      onUpdate: (v) => {
        if (this.token !== token) {
          return;
        }
        this.value = v;
        this.write(v);
        if (target === 0 || this.shown) {
          return;
        }
        // The pressed frame: a release that came before it plays from the next frame on.
        this.shown = true;
        if (!this.held) {
          this.to(0);
        }
      },
    });
  }

  /** Stop, at rest. */
  destroy(): void {
    this.token = undefined;
    this.run?.stop();
    this.run = undefined;
    this.held = false;
    this.shown = true;
    if (this.value === 0) {
      return;
    }
    this.value = 0;
    this.write(0);
  }
}

/**
 * Whether an icon presses when the author hasn't said (`press` unset): its
 * frame decides when it has one (`data-motion-icon-frame="press"`);
 * otherwise it presses when it is its own control (`own`) and isn't inside
 * another (`CONTROL_SELECTOR`).
 */
export function pressesByDefault(el: Element, own: boolean): boolean {
  const frame = frameOf(el);
  if (frame !== el) {
    return frame.getAttribute('data-motion-icon-frame') === 'press';
  }
  return own && !insideControl(ownButtonOf(el) ?? el);
}

/**
 * Whether to bind the press: the author's `press` when set; otherwise when
 * the icon presses by default now, or sits in a frame, whose
 * `data-motion-icon-frame` may turn "press" after the icon has bound
 * (`bindPress` asks `pressesByDefault` again on each press). So an icon in
 * a frame that never presses (a rollover button, the kit's menu rows) binds
 * the press's two start listeners, which do nothing; only an icon outside
 * any frame that can't press (a plain button, a menu item that isn't a
 * frame) binds nothing.
 */
export function mayPress(
  el: Element,
  force: boolean | undefined,
  own: boolean
): boolean {
  return force ?? (pressesByDefault(el, own) || frameOf(el) !== el);
}

export interface PressOptions {
  /** The author's `press`: true presses, false never, undefined follows `pressesByDefault`. Read on each press. */
  force(): boolean | undefined;
  /** Whether the icon is its own control: an `as-button` toggle, or an action played on its click. */
  own(): boolean;
  /** Whether the icon moves now: no press under reduced motion or with `animated="false"`. */
  animated(): boolean;
  /** The groups to scale: the drawing's `g[data-mc-ink]` (never the root svg, nor the web components' spinner layer). */
  groups(): Iterable<Element>;
  /** The size it draws at (px). */
  size(): number;
}

/**
 * Press `el` (an icon's svg, or a web component's host) while its control
 * is held: its frame, its own button (React's `asButton`), or itself.
 * Returns the unbind (at rest).
 */
export function bindPress(el: Element, o: PressOptions): () => void {
  const frame = frameOf(el);
  const ownButton = ownButtonOf(el);
  const target = frame !== el ? frame : (ownButton ?? el);
  // Keys pressed on the control: the frame, the icon (an `as-button` host), or its own button.
  const keyed = (t: EventTarget | null) =>
    t === target || t === el || t === ownButton;
  let scale = 1;
  const press = new Press((v) => {
    const t = pressTransform(v, scale);
    for (const g of o.groups()) {
      if (t) {
        g.setAttribute('transform', t);
      } else {
        g.removeAttribute('transform');
      }
    }
  });
  let pointer = false;
  let key: string | null = null;
  const presses = () =>
    o.animated() &&
    !isDisabledFrame(target) &&
    (o.force() ?? pressesByDefault(el, o.own()));
  // The size is read as a press starts.
  const begin = () => {
    if (!pointer && key === null) {
      scale = pressScale(o.size());
    }
  };
  // At rest only what starts a press is heard (pointerdown, keydown); what ends one is heard while it is held.
  const pointerDown = (e: Event) => {
    if ((e as PointerEvent).button !== 0 || pointer || !presses()) {
      return;
    }
    begin();
    pointer = true;
    hold();
    press.set(true);
  };
  const pointerUp = () => {
    pointer = false;
    press.set(key !== null);
    hold();
  };
  const keyDown = (e: Event) => {
    const k = (e as KeyboardEvent).key;
    if (
      (k !== ' ' && k !== 'Enter') ||
      (e as KeyboardEvent).repeat ||
      key !== null ||
      !keyed(e.target) ||
      !presses()
    ) {
      return;
    }
    begin();
    key = k;
    hold();
    press.set(true);
  };
  const keyUp = (e: Event) => {
    if ((e as KeyboardEvent).key !== key) {
      return;
    }
    key = null;
    press.set(pointer);
    hold();
  };
  const blur = () => {
    key = null;
    press.set(pointer);
    hold();
  };
  const starts: [string, (e: Event) => void][] = [
    ['pointerdown', pointerDown],
    ['keydown', keyDown],
  ];
  const ends: [string, (e: Event) => void][] = [
    ['pointerup', pointerUp],
    ['pointercancel', pointerUp],
    ['pointerleave', pointerUp],
    ['keyup', keyUp],
  ];
  // No focus listener on an svg (Chrome makes an svg with one focusable: see bindHover); a bare svg takes no keys.
  if (target.namespaceURI !== 'http://www.w3.org/2000/svg') {
    ends.push(['focusout', blur]);
  }
  /** Whether the ends are heard: while a pointer or a key holds the press. */
  let holding = false;
  const hold = () => {
    const on = pointer || key !== null;
    if (on === holding) {
      return;
    }
    holding = on;
    for (const [type, fn] of ends) {
      if (on) {
        target.addEventListener(type, fn);
      } else {
        target.removeEventListener(type, fn);
      }
    }
  };
  for (const [type, fn] of starts) {
    target.addEventListener(type, fn);
  }
  return () => {
    for (const [type, fn] of starts) {
      target.removeEventListener(type, fn);
    }
    pointer = false;
    key = null;
    hold();
    press.destroy();
  };
}
