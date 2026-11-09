/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Actions on an element: what the element of an icon with an action plays
 * it with (the core's player and `HandOff`), and its attributes:
 *  - `action-key`: plays whenever it changes (not the first value);
 *  - `action-on="click"`: the icon's own click plays it;
 *  - `loop`: loops while set; removed, the pass finishes, then the hand-off;
 *  - `action-then="success 1500"`: the status it hands off to (status icons).
 *
 * The generated elements of icons with an action extend
 * `ActionHoverIconElement` or `ActionStatusIconElement`, which drive their
 * action through an `ActionDriver`. Elements without one carry none of
 * this. Their `trigger()` resolves at once with a warning.
 */
import type { PropertyValues } from 'lit';
import { DEV } from '@carbon-labs/motion-icons-core/dev';
import {
  HandOff,
  type HandOffHost,
} from '@carbon-labs/motion-icons-core/engine/actionPlayer';
import type {
  ActionOptions,
  ActionTarget,
  ActionThen,
} from '@carbon-labs/motion-icons-core/engine/action';

/**
 * `action-then="success"` or `"success 1500"`: a status, and how long it shows (ms). No status (blank) is no hand-off,
 * and a time that isn't a finite number of ms, 0 or more, is ignored (the status stays): each with a warning in
 * development builds (production ignores them the same way, silently).
 */
export const actionThenConverter = {
  fromAttribute: (v: string | null): ActionThen | undefined => {
    const [status, ms] = (v ?? '').trim().split(/\s+/);
    if (!status) {
      if (DEV && v !== null) {
        console.warn(
          `[motion-icons] action-then="${v}": no status, so no hand-off.`
        );
      }
      return undefined;
    }
    if (ms === undefined) {
      return { status };
    }
    const n = Number(ms);
    if (Number.isFinite(n) && n >= 0) {
      return { status, for: n };
    }
    if (DEV) {
      console.warn(
        `[motion-icons] action-then="${v}": "${ms}" isn't a time in ms (0 or more); the status stays until the next trigger.`
      );
    }
    return { status };
  },
  toAttribute: (v: ActionThen | undefined) =>
    v ? `${v.status}${v.for !== undefined ? ` ${v.for}` : ''}` : null,
};

/** The action attributes (Lit properties). */
export const ACTION_PROPERTIES = {
  actionKey: { attribute: 'action-key' },
  actionOn: { attribute: 'action-on' },
  loop: { type: Boolean },
  actionThen: { attribute: 'action-then', converter: actionThenConverter },
};

/** An element with an action, as its driver sees it. */
export interface ActingElement extends HTMLElement {
  /** Plays the action whenever it changes (not the first value). */
  actionKey?: string;
  /** `"click"`: the icon's own click plays its action. */
  actionOn?: string;
  /** While set, the action loops (Renew while syncing); removed, the pass finishes, then the `action-then` hand-off. */
  loop: boolean;
  /** The status the action hands off to (status icons): `action-then="success 1500"`. */
  actionThen?: ActionThen;
  readonly updateComplete: Promise<unknown>;
  trigger(options?: ActionOptions): Promise<void>;
}

/** How an element plays its action: the core's HandOff host (the motion, and a status icon's hand-off), plus its controller. */
export interface ActionBinding extends HandOffHost {
  /** The controller, once painted (it plays the action while the icon animates). */
  controller(): Partial<ActionTarget> | undefined;
  /** Disconnected: forget any hand-off status. */
  teardown?(): void;
}

/** Plays an element's action: `trigger()`, `stop()`, its click, and `action-key` / `loop` as they change. */
export class ActionDriver {
  private endLoop?: () => void;
  private seen = false;
  /** The triggers in order, and their hand-off (the core's, as React's). */
  private readonly handOff: HandOff;

  constructor(
    private readonly el: ActingElement,
    private readonly b: ActionBinding
  ) {
    this.handOff = new HandOff(b);
    el.addEventListener('click', () => {
      if (el.actionOn === 'click') {
        void el.trigger({ then: el.actionThen });
      }
    });
  }

  trigger(options: ActionOptions = {}): Promise<void> {
    // Starts in this task when it can (the same frame as a React ref's trigger), else after the first paint.
    return this.handOff.trigger(
      options,
      this.b.controller() ? undefined : this.el.updateComplete
    );
  }

  stop(): void {
    this.b.controller()?.stop?.();
  }

  /**
   * Disconnected: nothing in flight stays current (the element's controller stops with it), the loop and the
   * hand-off's timer end. Connected again, `firstUpdated` starts the loop again if `loop` is still set.
   */
  disconnected(): void {
    this.handOff.cancel();
    this.endLoop?.();
    this.endLoop = undefined;
    this.b.teardown?.();
  }

  /**
   * Motion turned off or back on (reduced motion, `animated`): a loop still set
   * starts again on the controller as it is (the one in flight is cut, or
   * only waiting while nothing moved), without its hand-off (the new trigger
   * takes over).
   */
  motionChanged(): void {
    if (!this.el.loop || !this.b.controller()) {
      return;
    }
    this.endLoop = undefined;
    this.props(new Map([['loop', false]]) as PropertyValues);
  }

  /** After the first paint (and on connecting again): looping from the start (`loop` in the HTML). */
  firstUpdated(): void {
    if (this.el.loop) {
      this.props(new Map([['loop', false]]) as PropertyValues);
    }
  }

  /** Each update, before the element's own (a status set in the same update waits for the action it starts). */
  updated(changed: PropertyValues): void {
    if (this.b.controller() && this.seen) {
      this.props(changed);
    }
    this.seen = true;
  }

  private props(changed: PropertyValues): void {
    const el = this.el;
    if (changed.has('actionKey') && changed.get('actionKey') !== undefined) {
      void el.trigger({ then: el.actionThen });
    }
    if (changed.has('loop')) {
      if (el.loop && !this.endLoop) {
        const until = new Promise<void>((r) => (this.endLoop = r));
        void el.trigger({ loop: true, until, then: el.actionThen });
      } else if (!el.loop && this.endLoop) {
        this.endLoop();
        this.endLoop = undefined;
      }
    }
  }
}

/** The controller as an action target, while the icon animates. */
export const animatedTarget = (
  animated: boolean,
  c: Partial<ActionTarget> | undefined
): ActionTarget | undefined =>
  animated && c?.trigger ? (c as ActionTarget) : undefined;
