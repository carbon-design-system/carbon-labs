/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities';

// @ts-ignore
import styles from './checklist.scss?inline';

const { stablePrefix: clabsPrefix } = settings;
const blockClass = `${clabsPrefix}--checklist__chart`;

/**
 * Clamps a value between a minimum and maximum.
 * Returns undefined if any argument is NaN.
 * @param {number} value value to clamp
 * @param {number} min minimum bound
 * @param {number} max maximum bound
 * @returns {number | undefined} clamped value
 */
const clamp = (value: number, min: number, max: number): number | undefined => {
  if (isNaN(value) || isNaN(min) || isNaN(max)) {
    return undefined;
  }
  return Math.min(Math.max(value, min), max);
};

/**
 * Donut-chart sub-component used within `clabs-checklist`.
 *
 * @element clabs-checklist-chart
 */
@customElement(`${clabsPrefix}-checklist-chart`)
class CLABSChecklistChart extends LitElement {
  /**
   * A number between 0 and 1 indicating progress.
   */
  @property({ type: Number })
  value = 0;

  /** @override */
  connectedCallback() {
    super.connectedCallback();
    this.classList.add(`${blockClass}`);
    this._updateChart(this.value);
  }

  /**
   * @param {Map<string, unknown>} changedProperties changed props
   * @override
   */
  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('value')) {
      this._updateChart(this.value);
    }
  }

  /**
   * Sets the CSS custom property driving the donut gradient.
   * @param {number} value progress value
   */
  private _updateChart(value: number) {
    const clamped = clamp(value * 360, 0, 360);
    this.style.setProperty(
      `--${clabsPrefix}-num-degrees`,
      `${clamped ?? 0}deg`
    );
  }

  /** @override */
  render() {
    return nothing;
  }

  static styles = styles;
}

export default CLABSChecklistChart;
