/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Status-capable icons as elements: the plain hover icon until a status
 * arrives, then the status layer (the core's StatusController).
 *
 * Attributes, mapped from the React props:
 *  - `status`: process icons 'success' | 'warning' | 'error' | 'pending',
 *    notification icons 'notification'. Unset is the plain icon.
 *  - `count` (notification icons): a count in a pill; above 0 it replaces
 *    the pip. `max`: 99 (default) or 9. `count-placement`: 'overhang'
 *    (default) or 'inside'.
 *  - `tone`: the mark in its support colour (`--cds-support-*`).
 * Present in the HTML, a status shows at rest; set later, it animates.
 *
 * A status alias (Carbon's static status names: `<clabs-motion-icon-checkmark-filled-warning>`)
 * is its base with the status fixed by its spec (`fixed`); its `status`
 * attribute is ignored, as in React. It hovers on its mark (the base holds,
 * the mark grows, the cut keeping its gap), and with `animated="false"` it
 * draws Carbon's art (the spec's `still`).
 */
import { css, html, type PropertyValues, type TemplateResult } from 'lit';
import {
  paint,
  StatusController,
  type Shapes,
  type StatusIconDataSpec,
  type StatusIconSpec,
  type StatusInput,
} from '@carbon-labs/motion-icons-core/engine';
import type { Still } from '@carbon-labs/motion-icons-core/static/index';
import type { CountPlacement } from '@carbon-labs/motion-icons-core/status';
import {
  iconStyles,
  MotionIconElement,
  type Controller,
} from './motion-icon-element';
import { countMax } from './count';

export abstract class StatusIconElement extends MotionIconElement {
  /** The spinner's layer: an svg stacked over the icon's in one grid cell (the compositor turns it). */
  static styles = [
    iconStyles,
    css`
      .stack {
        display: grid;
        inline-size: 100%;
        block-size: 100%;
      }
      .stack > svg {
        grid-area: 1 / 1;
      }
      svg[data-turn] {
        pointer-events: none;
      }
    `,
  ];
  static properties = {
    ...MotionIconElement.properties,
    status: { reflect: true },
    tone: { type: Boolean, reflect: true },
    count: { type: Number, reflect: true },
    max: { type: Number },
    countPlacement: { attribute: 'count-placement', reflect: true },
  };

  /** The icon's status spec (subclasses set it): the core's `statusIcon(…)`, a bare status spec, or a status alias (`aliasOf(…)`, its status in `fixed`). */
  static spec:
    | StatusIconSpec
    | StatusIconDataSpec
    | (StatusIconSpec & {
        kind: 'alias';
        fixed: Partial<StatusInput>;
        still?: Still;
      });

  // `declare`d, as the base's (useDefineForClassFields).
  declare status?: string;
  declare tone: boolean;
  declare count?: number;
  declare max?: 9 | 99;
  declare countPlacement?: CountPlacement;

  constructor() {
    super();
    this.tone = false;
  }

  /** A pending spinner (and an action's loop): off screen, it holds. */
  protected get holdsOffScreen(): boolean {
    return true;
  }

  declare protected controller?: StatusController & Controller;

  protected get spec(): StatusIconSpec {
    return (this.constructor as typeof StatusIconElement).spec;
  }

  /** With no status, `animated="false"` draws the plain icon's still (Carbon's art), as React renders the plain icon. */
  protected still(): Still | undefined {
    const base = (this.spec as Partial<StatusIconDataSpec>).base;
    const { status } = this.input();
    const marked =
      (status != null &&
        (this.spec.statuses as readonly string[]).includes(status)) ||
      (!!this.spec.count && (this.count ?? 0) > 0);
    const aliasStill = (this.spec as { still?: Still }).still;
    if (marked && aliasStill) {
      return aliasStill;
    }
    return !marked && base && 'static' in base
      ? (base.static as Still | undefined)
      : undefined;
  }

  /** The action's hand-off status (`trigger({ then })`, icons with an action): shown when the author set no `status`. */
  protected handOff?: string;

  protected input(): StatusInput {
    // A status alias's status is fixed; otherwise the author's, else the action's hand-off.
    const fixed = (this.spec as { fixed?: Partial<StatusInput> }).fixed;
    return {
      status: this.status ?? this.handOff,
      count: this.count,
      max: countMax(this.max),
      countPlacement: this.countPlacement,
      tone: this.tone,
      ...fixed,
      ...(fixed && { markHover: true }),
    };
  }

  protected createController(painter: (shapes: Shapes) => void) {
    const spinLayer = this.spins
      ? {
          svg: () => this.spinSvg,
          paint: (shapes: Shapes) => this.paintSpin(shapes),
        }
      : undefined;
    return new StatusController(
      this.spec,
      painter,
      this.drawSize,
      this.input(),
      this.isAnimated,
      { svg: this.drawnSvg, ...(spinLayer && { spinLayer }) }
    ) as StatusController & Controller;
  }

  // ── The spinner's layer ────────────────────────────────────────────────────
  // While the pending spinner shows, its arc is drawn in a second svg stacked over the icon's (the same size and
  // viewBox, in one grid cell), and the browser turns that svg (the core's turn.ts): it keeps turning while the page's
  // main thread is busy. Only icons that take pending have it.

  /** Whether the icon takes pending (it has the spinner's layer). */
  private get spins(): boolean {
    return (this.spec.statuses as readonly string[]).includes('pending');
  }

  private get spinSvg(): Element | null {
    return this.renderRoot?.querySelector?.('svg[data-turn]') ?? null;
  }

  private paintSpin(shapes: Shapes) {
    // While a still shows, nothing paints (as the icon's own painter).
    if (this.shownStill) {
      return;
    }
    paint(this.spinSvg?.firstElementChild ?? null, shapes);
  }

  protected frames(): TemplateResult {
    const svg = super.frames();
    if (!this.spins) {
      return svg;
    }
    return html`<span class="stack"
      >${svg}<svg
        data-turn
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width=${this.drawSize}
        height=${this.drawSize}
        aria-hidden="true"
        focusable="false">
        <g data-mc-ink></g></svg
    ></span>`;
  }

  protected updated(changed: PropertyValues) {
    super.updated(changed);
    if (!this.controller) {
      return;
    }
    // The first update is the initial state (the controller is built from it, at rest).
    if (!this.ready) {
      this.ready = true;
      return;
    }
    if (
      (['status', 'tone', 'count', 'max', 'countPlacement'] as const).some(
        (k) => changed.has(k)
      )
    ) {
      this.controller.set(this.input(), this.isAnimated);
    }
  }

  private ready = false;

  protected onMotionChange() {
    this.controller?.set(this.input(), this.isAnimated);
  }
}
