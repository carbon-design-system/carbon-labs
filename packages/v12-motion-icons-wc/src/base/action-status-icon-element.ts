/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Status icons with an action as elements (`<clabs-motion-icon-copy>`): StatusIconElement,
 * plus the plain icon's action and its hand-off to a status (action-element.ts).
 */
import type { PropertyValues } from 'lit';
import type {
  ActionOptions,
  ActionTail,
  ActionThen,
} from '@carbon-labs/motion-icons-core/engine/action';
import {
  ACTION_PROPERTIES,
  ActionDriver,
  animatedTarget,
} from './action-element';
import { StatusIconElement } from './status-icon-element';

export abstract class ActionStatusIconElement extends StatusIconElement {
  static properties = { ...StatusIconElement.properties, ...ACTION_PROPERTIES };

  /** Plays the action whenever it changes (not the first value). */
  declare actionKey?: string;
  /** `"click"`: the icon's own click plays its action. */
  declare actionOn?: string;
  /** While set, the action loops (Renew while syncing); removed, the pass finishes, then the `action-then` hand-off. */
  declare loop: boolean;
  /** The status the action hands off to: `action-then="success 1500"`. */
  declare actionThen?: ActionThen;

  constructor() {
    super();
    this.loop = false;
  }

  /** An action played on its click (`action-on="click"`) presses by default. */
  protected get ownControl(): boolean {
    return this.actionOn === 'click';
  }

  /** Shows the hand-off status (`undefined` clears it). It begins as the action settles: its tail finishes under the entering mark. */
  private showHandOff(s: string | undefined, tail?: ActionTail) {
    this.handOff = s;
    this.controller?.set(this.input(), this.isAnimated, tail);
    this.requestUpdate();
  }

  private actions = new ActionDriver(this, {
    controller: () => this.controller,
    target: () => animatedTarget(this.isAnimated, this.controller),
    setStatus: (s, tail) => this.showHandOff(s, tail),
    handedOff: () => this.handOff !== undefined && this.status === undefined,
    release: () => {
      this.showHandOff(undefined);
      return this.controller?.whenPlain();
    },
    teardown: () => {
      this.handOff = undefined;
    },
  });

  /**
   * Play the icon's action: the one-shot motion it makes when the thing it
   * stands for happens (Copy copies, Send sends, Renew renews). It takes
   * over from the hover, plays once (or with `loop` until `stop()`, or
   * `until` a promise settles), returns to rest and resolves. `then` hands
   * off to a status (`{ status: 'success', for: 1500 }`), `failed` if `until`
   * rejects. Triggering mid-play restarts it. Under reduced motion or
   * `animated="false"` nothing plays, and the status applies at once.
   */
  trigger(options?: ActionOptions): Promise<void> {
    return this.actions.trigger(options);
  }

  /** Ends a looping action: the pass in flight finishes, then it rests (and hands off). */
  stop(): void {
    this.actions.stop();
  }

  protected firstUpdated() {
    super.firstUpdated();
    this.actions.firstUpdated();
  }

  connectedCallback() {
    super.connectedCallback();
    // Connected again: the controller is new, so a loop still set starts again.
    if (this.hasUpdated) {
      this.actions.firstUpdated();
    }
  }

  disconnectedCallback() {
    this.actions.disconnected();
    super.disconnectedCallback();
  }

  protected onMotionChange() {
    super.onMotionChange();
    this.actions.motionChanged();
  }

  protected updated(changed: PropertyValues) {
    this.actions.updated(changed);
    super.updated(changed);
  }
}
