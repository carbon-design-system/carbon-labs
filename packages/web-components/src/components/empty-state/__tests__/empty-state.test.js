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

const illustrationImage =
  "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20width='80'%20height='80'%20viewBox='0%200%2080%2080'%3e%3cdefs%3e%3cstyle%3e.a{fill:none;}.b{fill:url(%23a);}.c{fill:url(%23b);}.d{fill:url(%23c);}.e{opacity:0.5;fill:url(%23d);}.f{fill:url(%23e);}.g{opacity:0.6;}.h{fill:url(%23f);}.i{fill:url(%23g);}%3c/style%3e%3clinearGradient%20id='a'%20x1='2.6'%20y1='-12.81'%20x2='43.48'%20y2='58'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20offset='0'%20stop-color='%23f4f4f4'/%3e%3cstop%20offset='0.69'%20stop-color='%23e0e0e0'/%3e%3cstop%20offset='0.94'%20stop-color='%23c4c4c4'/%3e%3cstop%20offset='1'%20stop-color='%23a8a8a8'/%3e%3c/linearGradient%3e%3clinearGradient%20id='b'%20x1='48.57'%20y1='57.07'%20x2='67.31'%20y2='57.07'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20offset='0'%20stop-color='%23a8a8a8'/%3e%3cstop%20offset='1'%20stop-color='%23c6c6c6'/%3e%3c/linearGradient%3e%3clinearGradient%20id='c'%20x1='15.1'%20y1='10.36'%20x2='41.51'%20y2='56.09'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20offset='0'%20stop-color='%23bdbdbd'/%3e%3cstop%20offset='1'%20stop-color='%23a3a3a3'/%3e%3c/linearGradient%3e%3clinearGradient%20id='d'%20x1='34.92'%20y1='-46.56'%20x2='34.92'%20y2='97.82'%20gradientTransform='translate(18.46%20-13.77)%20rotate(30)'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20offset='0'%20stop-color='%236e6e6e'/%3e%3cstop%20offset='0.48'%20stop-color='%23787878'%20stop-opacity='0.69'/%3e%3cstop%20offset='0.72'%20stop-color='%23818181'%20stop-opacity='0.41'/%3e%3cstop%20offset='1'%20stop-color='%238c8c8c'%20stop-opacity='0.1'/%3e%3c/linearGradient%3e%3clinearGradient%20id='e'%20x1='26.4'%20y1='71.67'%20x2='55.54'%20y2='54.85'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20offset='0'%20stop-color='%23565656'%20stop-opacity='0.05'/%3e%3cstop%20offset='1'%20stop-color='%23171717'%20stop-opacity='0.1'/%3e%3c/linearGradient%3e%3clinearGradient%20id='f'%20x1='24.56'%20y1='9.61'%20x2='50.36'%20y2='54.3'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20offset='0'%20stop-color='%23fff'%20stop-opacity='0'/%3e%3cstop%20offset='0.12'%20stop-color='%23fff'%20stop-opacity='0.01'/%3e%3cstop%20offset='0.22'%20stop-color='%23fff'%20stop-opacity='0.05'/%3e%3cstop%20offset='0.31'%20stop-color='%23fff'%20stop-opacity='0.12'/%3e%3cstop%20offset='0.4'%20stop-color='%23fff'%20stop-opacity='0.21'/%3e%3cstop%20offset='0.48'%20stop-color='%23fff'%20stop-opacity='0.34'/%3e%3cstop%20offset='0.56'%20stop-color='%23fff'%20stop-opacity='0.49'/%3e%3cstop%20offset='0.64'%20stop-color='%23fff'%20stop-opacity='0.66'/%3e%3cstop%20offset='0.71'%20stop-color='%23fff'%20stop-opacity='0.86'/%3e%3cstop%20offset='0.73'%20stop-color='%23fff'%20stop-opacity='0.92'/%3e%3cstop%20offset='1'%20stop-color='%23fff'/%3e%3c/linearGradient%3e%3clinearGradient%20id='g'%20x1='15.86'%20y1='-20.5'%20x2='56.75'%20y2='50.32'%20xlink:href='%23a'/%3e%3c/defs%3e%3crect%20class='a'%20width='80'%20height='80'/%3e%3cpath%20class='b'%20d='M12.69,18c0,12,8.75,26.84,19.56,33.08,5.64,3.26,10.73,3.52,14.3,1.32h0l4.83-2.79-1.19-1.93c-3.25,1.73-7.72,1.38-12.67-1.48C27.62,40.46,19.6,26.88,19.6,15.85c0-5.09,1.71-8.75,4.53-10.65l-1.2-1.95L18.1,6h0C14.75,8,12.69,12.12,12.69,18'/%3e%3cpath%20class='c'%20d='M67.31,64.92s.11.86-1.89,2.24-2.73,1.18-2.73,1.18L48.57,49.22l4.62-3.42Z'/%3e%3cpath%20class='d'%20d='M37.68,46.05c-9.9-5.71-17.93-19.29-17.93-30.32,0-3.79.95-6.78,2.6-8.85-4.87.76-8.09,5-8.09,12,0,11,8,24.61,17.93,30.32,6.5,3.75,12.19,3.19,15.33-.76-2.82.44-6.21-.31-9.84-2.41'/%3e%3cellipse%20class='e'%20cx='34.92'%20cy='27.57'%20rx='14.55'%20ry='25.2'%20transform='translate(-9.11%2021.16)%20rotate(-30)'/%3e%3cpath%20class='f'%20d='M67.1,75,54.26,67.59c1.1-1.15,1.1-2.36-.77-3.44l-.05,0L26.17,48.4l-.09-.06c-2.59-1.49-5.82-1.05-8.42.45s-3.57,3.48-1,5L44.09,69.58a7.2,7.2,0,0,0,5.5.53l13,7.51h0C63.82,78.34,68.35,75.73,67.1,75Z'/%3e%3cg%20class='g'%3e%3cpath%20class='h'%20d='M42.88,50.79a16.42,16.42,0,0,1-8.06-2.47c-9.88-5.7-17.92-19.63-17.92-31,0-5.57,1.89-9.73,5.32-11.72S30.2,4,35,6.81C44.91,12.52,53,26.45,53,37.86c0,5.57-1.89,9.73-5.32,11.71A9.31,9.31,0,0,1,42.88,50.79ZM27,4.76a9,9,0,0,0-4.54,1.17c-3.3,1.9-5.12,5.93-5.12,11.35,0,11.28,8,25,17.72,30.68,4.69,2.71,9.09,3.16,12.39,1.25s5.12-5.94,5.12-11.35c0-11.28-7.95-25-17.72-30.69A16,16,0,0,0,27,4.76Z'/%3e%3c/g%3e%3cpath%20class='i'%20d='M57,37.5c0-12-8.75-26.85-19.56-33.08C31.82,1.16,26.73.89,23.16,3.09h0L18.33,5.87l1.19,1.94c3.25-1.74,7.72-1.38,12.67,1.47C42.09,15,50.11,28.57,50.11,39.6,50.11,44.46,48.56,48,46,50c-.12.1-1.17.73-1.31.82l2.12,1.42,4.83-2.79h0C55,47.44,57,43.34,57,37.5'/%3e%3c/svg%3e";

const defaultProps = {
  title: 'Empty state heading.',
  subtitle: 'Example subtitle',
  size: 'lg',
  kind: 'notFound',
  illustration: illustrationImage,
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
  .illustrationTheme=${props.illustrationTheme}
  .illustration=${props.illustration}>
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
  it('should show the custom illustration if illustration prop is passed', async () => {
    const emptyState = await fixture(template({ ...defaultProps, kind: '' }));
    const customIllustration = emptyState.shadowRoot.querySelector(
      '.clabs--empty-state__illustration'
    );
    expect(customIllustration).to.exist;
    expect(customIllustration.tagName.toLowerCase()).to.equal('img');
  });
  it('should show the predefined illustration if kind prop is passed without illustration prop being passed', async () => {
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
    const customIllustration = emptyState.shadowRoot.querySelector(
      '.clabs--empty-state__illustration'
    );
    expect(customIllustration).to.exist;
    expect(customIllustration.tagName.toLowerCase()).to.not.equal('svg');
    expect(customIllustration.tagName.toLowerCase()).to.equal('img');
  });
});
