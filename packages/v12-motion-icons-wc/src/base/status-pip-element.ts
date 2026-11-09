/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * `<clabs-motion-status-pip count="3">`: a count on its own, in a pill (React's
 * StatusPip). `max` 9 or 99 (default by size: 9 at 16/20px, 99 at 24/32px),
 * `tone` a support colour name ('error' | 'warning' | 'success' | 'info').
 */
import type { PropertyValues } from 'lit';
import { PipEngine, type Shapes } from '@carbon-labs/motion-icons-core/engine';
import type { Tone } from '@carbon-labs/motion-icons-core/status';
import { MotionIconElement, type Controller } from './motion-icon-element';
import { countMax } from './count';
import { prefix } from '../globals/register';

export class StatusPipElement extends MotionIconElement {
  static readonly is = `${prefix}-status-pip`;
  static properties = {
    ...MotionIconElement.properties,
    count: { type: Number, reflect: true },
    max: { type: Number },
    tone: { reflect: true },
  };

  // `declare`d, as the base's (useDefineForClassFields).
  declare count: number;
  declare max?: 9 | 99;
  declare tone?: Tone;

  constructor() {
    super();
    this.count = 0;
  }

  declare protected controller?: PipEngine & Controller;
  private ready = false;

  protected createController(painter: (shapes: Shapes) => void) {
    return new PipEngine(painter, this.drawSize, {
      count: this.count,
      max: countMax(this.max),
      tone: this.tone,
    }) as PipEngine & Controller;
  }

  protected updated(changed: PropertyValues) {
    super.updated(changed);
    if (!this.controller) {
      return;
    }
    if (!this.ready) {
      this.ready = true;
      return;
    }
    if (changed.has('count') || changed.has('max') || changed.has('tone')) {
      this.controller.set(
        { count: this.count, max: countMax(this.max), tone: this.tone },
        this.isAnimated
      );
    }
  }
}
