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
import styles from '../toolbar/src/toolbar.scss?inline';
import { toolbarGroupTemplate } from './src/toolbar-group.template';

const { stablePrefix: clabsPrefix } = settings;

/**
 * CLABS Component extending toolbar group
 */
@customElement(`${clabsPrefix}-toolbar-group`)
class CLABSToolbarGroup extends LitElement {
  static styles = [styles];
  @property({ type: Boolean, reflect: true }) vertical = false;

  /**
   *
   */
  render() {
    return toolbarGroupTemplate(this.vertical);
  }
}

export default CLABSToolbarGroup;
