/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { NetworkGraph } from './src/network-graph';
import { networkGraphTemplate } from './src/network-graph.template';
import { settings } from '@carbon-labs/utilities';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Network graph component
 *
 * @element clabs-network-graph
 */
@customElement(`${clabsPrefix}-network-graph`)
class CLABSNetworkGraph extends NetworkGraph {
  /**
   * Renders the template while passing in class functionality
   */
  render(): TemplateResult<1> {
    return networkGraphTemplate();
  }
}

export default CLABSNetworkGraph;
