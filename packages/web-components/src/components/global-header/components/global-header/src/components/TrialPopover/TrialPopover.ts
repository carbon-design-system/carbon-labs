/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint jsdoc/require-jsdoc: 0 */

import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities';
import '@carbon/web-components/es-custom/components/popover/index.js';
import { TrialContent } from '../TrialContent/TrialContent';
import { unsafeCSS } from 'lit';
import { animate, fadeIn, fadeOut } from '@lit-labs/motion';

import styles from './_index.scss?inline';
import { TrialConfigs } from '../../types/Header.types';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Content to show when clicking the Trial entry in the header
 */
@customElement(`${clabsPrefix}-global-header-trial-popover`)
export class TrialPopover extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ type: Object }) trialConfig: TrialConfigs = {};
  static styles = css`
    ${unsafeCSS(styles)}
  `;

  constructor() {
    super();
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    if (changedProperties.has('open')) {
      if (this.open) {
        document.addEventListener('click', this.handleOutsideClick);
      } else {
        document.removeEventListener('click', this.handleOutsideClick);
      }
    }
  }

  handleOutsideClick(event: MouseEvent) {
    const path = event.composedPath();

    if (!path.includes(this)) {
      const toggleEvent = new CustomEvent('trial-toggle', {
        bubbles: true,
        composed: true,
      }); // event to trigger the parent component to update the toggle value
      this.dispatchEvent(toggleEvent);
    }
  }

  render() {
    return html`
      <cds-custom-popover ?open="${this.open}" align="bottom-right">
        <slot></slot>
        <cds-custom-popover-content>
          ${this.open
            ? html`<div
                class="automation-header__tooltip"
                ${animate({ in: fadeIn, out: fadeOut, stabilizeOut: true })}>
                ${TrialContent({ ...this.trialConfig })}
              </div>`
            : nothing}
        </cds-custom-popover-content>
      </cds-custom-popover>
    `;
  }
}
