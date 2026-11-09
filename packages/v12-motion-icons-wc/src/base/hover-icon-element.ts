/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Hover icons as elements: the core's spec (`hoverIcon(…)`) on a
 * FrameController, as the React package's `makeHoverIcon`.
 *
 * `animated="false"` draws Carbon's art (the spec's `static`, decision 5)
 * where the icon has one; under reduced motion (no `animated`), the rest
 * geometry, which doesn't move on hover.
 */
import {
  FrameController,
  type HoverIconSpec,
  type Shapes,
} from '@carbon-labs/motion-icons-core/engine';
import { MotionIconElement, type Controller } from './motion-icon-element';
import { engineSpec } from './stills';

export abstract class HoverIconElement extends MotionIconElement {
  /** The icon (subclasses set it). */
  static spec: HoverIconSpec;

  protected get iconSpec(): HoverIconSpec {
    return (this.constructor as typeof HoverIconElement).spec;
  }

  protected createController(painter: (shapes: Shapes) => void) {
    const c = new FrameController(
      engineSpec(this.iconSpec),
      painter,
      this.drawSize,
      'rest'
    ) as FrameController & Controller;
    c.turnBox = this.drawnSvg;
    return c;
  }

  protected still() {
    return this.iconSpec.static;
  }

  protected onMotionChange() {
    // Settle at rest when motion goes off mid-hover.
    const c = this.controller as (FrameController & Controller) | undefined;
    if (c && !this.isAnimated) {
      c.destroy();
      this.controller = this.createController(this.painter);
      this.controller.repaint();
    }
  }
}
