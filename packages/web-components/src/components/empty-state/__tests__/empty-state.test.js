/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, fixture, expect } from '@open-wc/testing';
import '@carbon-labs/wc-empty-state/es/index.js';
import { stub } from 'sinon';
const mockFn = stub().returns({});
const CustomIllustration = mockFn();

const defaultProps = {
  title: 'Empty state heading.',
  subtitle: 'Example subtitle',
  size: 'lg',
  kind: 'notFound',
  illustration: CustomIllustration,
};

/**
 * Generates an HTML template for an empty state component.
 *
 * @param {object} [props=defaultProps] - The properties to pass to the template.
 * @returns {TemplateResult} The Lit template result.
 */
const template = (props = defaultProps) => html` <clabs-empty-state
  title=${props.title}
  subtitle=${props.subtitle}
  size=${props.size}
  .kind=${props.kind}
  .illustrationTheme=${props.illustrationTheme}>
  ${props.illustration &&
  html` <img src=${props.illustration} alt="customillustration" /> `}
  <cds-button kind="tertiary" size="sm" slot="action">Create new</cds-button>
  <cds-link href="https://www.carbondesignsystem.com" slot="link"
    >View documentation</cds-link
  >
</clabs-empty-state>`;
describe('clabs-empty-state', function () {
  it('should render clabs-empty-state', async () => {
    const emptyState = await fixture(template());
    expect(emptyState).dom.to.equalSnapshot();
    expect(emptyState).shadowDom.to.be.accessible();
  });
  it('should contain title element', async () => {
    const emptyState = await fixture(template());
    const headerElement = emptyState.shadowRoot.querySelector(
      '.clabs--empty-state__header'
    );
    expect(headerElement).to.exist;
  });
  it('should contain subtitle element', async () => {
    const emptyState = await fixture(template());
    const subtitleElement = emptyState.shadowRoot.querySelector(
      '.clabs--empty-state___subtitle'
    );
    expect(subtitleElement).to.exist;
  });
  it('should have a img slotted into illustration', async () => {
    const emptyState = await fixture(template({ ...defaultProps, kind: '' }));
    const actionSlot = emptyState.shadowRoot.querySelector(
      'slot[name="illustration"]'
    );
    expect(actionSlot).to.exist;
  });
  it('should have a cds-button slotted into action', async () => {
    const emptyState = await fixture(template());
    const actionSlot = emptyState.shadowRoot.querySelector(
      'slot[name="action"]'
    );
    expect(actionSlot).to.exist;
    const assignedNodes = actionSlot.assignedNodes({ flatten: true });
    const button = assignedNodes.find((node) => node.tagName === 'CDS-BUTTON');
    expect(button).to.exist;
    expect(button).to.have.attribute('kind', 'tertiary');
    expect(button).to.have.attribute('size', 'sm');
    expect(button).to.have.text('Create new');
  });
  it('should have a cds-link slotted into link slot', async () => {
    const emptyState = await fixture(template());
    const linkSlot = emptyState.shadowRoot.querySelector('slot[name="link"]');
    expect(linkSlot).to.exist;
    const assignedNodes = linkSlot.assignedNodes({ flatten: true });
    const link = assignedNodes.find((node) => node.tagName === 'CDS-LINK');
    expect(link).to.exist;
    expect(link).to.have.attribute(
      'href',
      'https://www.carbondesignsystem.com'
    );
    expect(link).to.have.text('View documentation');
  });
  it('should show the predefined illustration if kind prop is passed and no illustration slot is filled', async () => {
    const emptyState = await fixture(
      template({ ...defaultProps, illustration: '' })
    );
    const customIllustration = emptyState.shadowRoot.querySelector(
      '.clabs--empty-state__illustration'
    );
    expect(customIllustration).to.exist;
    expect(customIllustration.tagName.toLowerCase()).to.equal('svg');
  });
  it('should show the custom illustration even if kind prop and illustration props being passed', async () => {
    const emptyState = await fixture(template());
    const actionSlot = emptyState.shadowRoot.querySelector(
      'slot[name="illustration"]'
    );
    expect(actionSlot).to.exist;
  });
});
