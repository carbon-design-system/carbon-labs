/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';

/**
 * Template for the toolbar group.
 *
 * @param {boolean} _vertical - Indicates if the toolbar is vertical.
 * @returns {TemplateResult} The template result.
 */
export const toolbarGroupTemplate = (_vertical: boolean) => html`
  <style>
    :host {
      display: flex;
      border-block-end: 1px solid var(--cds-border-subtle-01, #c6c6c6);
      border-inline-end: 1px solid var(--cds-border-subtle-01, #c6c6c6);
      flex-direction: row;
    }

    :host([vertical]) {
      flex-direction: column;
      border-inline-end: none;
      max-inline-size: 2.5rem;
      flex-wrap: wrap;
    }

    :host(:last-child) {
      border-inline-end: none;
    }

    :host([vertical]:last-child) {
      border-block-end: none;
    }
  </style>
  <slot></slot>
`;

