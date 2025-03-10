/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
// @ts-ignore
import styles from './src/toolbar-group.scss?inline';
import { toolbarGroupTemplate } from './src/toolbar-group.template';

const { stablePrefix: clabsPrefix } = settings;

/**
 * CLABS toolbar group component
 */
@customElement(`${clabsPrefix}-toolbar-group`)
class CLABSToolbarGroup extends LitElement {
  static styles = [styles];

  @property({ type: String, reflect: true }) orientation = 'horizontal';

  /**
   * Render
   */
  render() {
    return toolbarGroupTemplate();
  }
}

export default CLABSToolbarGroup;
