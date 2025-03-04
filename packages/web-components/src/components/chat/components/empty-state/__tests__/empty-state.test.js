/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, fixture, expect } from '@open-wc/testing';
import '@carbon-labs/ai-chat/es/components/empty-state/emptyState.js';
const defaultProps = {
    title: 'Empty state heading.',
    subtitle: 'Example subtitle',
    size: 'lg',
}

/**
 * Generates an HTML template for an empty state component.
 * 
 * @param {object} [props=defaultProps] - The properties to pass to the template.
 * @returns {TemplateResult} The Lit template result.
 */
const template = (props = defaultProps) => html `
<clabs-empty-state
      title=${props.title}
      subtitle=${props.subtitle} 
      size=${props.size}
      >
       <cds-button kind="tertiary" size="sm" slot="action">Create new</cds-button>
       <cds-link href="https://www.carbondesignsystem.com" slot="link"> View documentation </cds-link>
      </clabs-empty-state>`
describe('clabs-empty-state', function () {
  it('should render with clabs-empty-state minimum attributes', async () => {
    const emptyState = (await fixture(template()));
    expect(emptyState).dom.to.equalSnapshot();
    expect(emptyState).shadowDom.to.be.accessible();
  });
});
