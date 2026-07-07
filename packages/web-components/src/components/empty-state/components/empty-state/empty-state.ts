/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { customElement } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities';
import emptyState from './src/empty-state.js';
import { emptyStateTemplate } from './src/empty-state.template.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * EmptyState.
 *
 * @element clabs-empty-state
 * */
@customElement(`${clabsPrefix}-empty-state`)
class CLABSEmptyState extends emptyState {
  /**
   * Lifecycle method called after the first render.
   * Ensures the illustration slot is checked for content.
   */
  firstUpdated() {
    const slot = this.shadowRoot?.querySelector(
      'slot[name="illustration"]'
    ) as HTMLSlotElement | null;
    slot?.addEventListener('slotchange', () => this.checkSlotContent());
    this.checkSlotContent(); // Initial check
  }

  /**
   * Checks whether the "illustration" slot has assigned elements.
   * Updates the `hasIllustration` property accordingly.
   */
  checkSlotContent() {
    const slot = this.shadowRoot?.querySelector(
      'slot[name="illustration"]'
    ) as HTMLSlotElement | null;
    const assignedNodes = slot?.assignedNodes({ flatten: true }) ?? [];
    this.hasIllustration = assignedNodes.length > 0;
  }

  /**
   * Renders the template while passing in class functionality
   *
   * @returns {TemplateResult<1>}
   */
  render() {
    return emptyStateTemplate(this);
  }
}

export default CLABSEmptyState;
