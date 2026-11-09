/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** Hover icons with an action as elements (`<clabs-motion-icon-trash-can>`): HoverIconElement, plus the action (action-element.ts). */
import type { PropertyValues } from 'lit';
import type {
  ActionOptions,
  ActionThen,
} from '@carbon-labs/motion-icons-core/engine/action';
import {
  actionPlayerOf,
  type ActionHolder,
} from '@carbon-labs/motion-icons-core/engine/actionPlayer';
import {
  ACTION_PROPERTIES,
  ActionDriver,
  animatedTarget,
} from './action-element';
import { HoverIconElement } from './hover-icon-element';

export abstract class ActionHoverIconElement extends HoverIconElement {
  static properties = { ...HoverIconElement.properties, ...ACTION_PROPERTIES };

  /** Plays the action whenever it changes (not the first value). */
  declare actionKey?: string;
  /** `"click"`: the icon's own click plays its action. */
  declare actionOn?: string;
  /** While set, the action loops; removed, the pass finishes. */
  declare loop: boolean;
  /** Unused on a hover icon (no status to hand off to). */
  declare actionThen?: ActionThen;

  constructor() {
    super();
    this.loop = false;
  }

  /** An action played on its click (`action-on="click"`) presses by default. */
  protected get ownControl(): boolean {
    return this.actionOn === 'click';
  }

  /** Its action can loop: off screen, it holds. */
  protected get holdsOffScreen(): boolean {
    return true;
  }

  private actions = new ActionDriver(this, {
    // The controller is a FrameController: its action's player plays it.
    controller: () =>
      actionPlayerOf(this.controller as unknown as ActionHolder | undefined),
    target: () =>
      animatedTarget(
        this.isAnimated,
        actionPlayerOf(this.controller as unknown as ActionHolder | undefined)
      ),
  });

  /**
   * Play the icon's action: the one-shot motion it makes when the thing it
   * stands for happens. It takes over from the hover, plays once (or with
   * `loop` until `stop()`, or `until` a promise settles), returns to rest
   * and resolves. Triggering mid-play restarts it. Under reduced motion or
   * `animated="false"` nothing plays.
   */
  trigger(options?: ActionOptions): Promise<void> {
    return this.actions.trigger(options);
  }

  /** Ends a looping action: the pass in flight finishes, then it rests. */
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
