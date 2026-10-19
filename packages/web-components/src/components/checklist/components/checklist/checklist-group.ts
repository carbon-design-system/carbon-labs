/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities';

// @ts-ignore
import styles from './checklist.scss?inline';

const { stablePrefix: clabsPrefix } = settings;

/**
 * A labelled section containing `clabs-checklist-item` elements.
 *
 * @element clabs-checklist-group
 * @slot default - One or more `clabs-checklist-item` elements.
 */
@customElement(`${clabsPrefix}-checklist-group`)
class CLABSChecklistGroup extends LitElement {
  /**
   * Section title text.
   */
  @property()
  title: string | undefined;

  /** @override */
  firstUpdated() {
    this.classList.add(`${clabsPrefix}--checklist__list-group`);
  }

  /** @override */
  render() {
    const { title } = this;

    return html`
      ${title
        ? html`<h3 title=${title} class="${clabsPrefix}--checklist__list-title">
            ${title}
          </h3>`
        : ''}
      <ol class="${clabsPrefix}--checklist__list">
        <slot></slot>
      </ol>
    `;
  }

  static styles = styles;
}

export default CLABSChecklistGroup;
