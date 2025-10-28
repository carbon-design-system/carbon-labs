/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, fixture, expect, oneEvent } from '@open-wc/testing';
import { BUTTON_KIND } from '@carbon/web-components/es/components/button/defs.js';
import '@carbon/web-components/es/components/icon-button/index.js';
import { POPOVER_ALIGNMENT } from '@carbon/web-components/es/components/popover/defs.js';
import ColorPalette16 from '@carbon/icons/es/color-palette/16.js';
import * as carbonColors from '@carbon/colors';
import Apple16 from '@carbon/icons/es/apple/16.js';
import Corn16 from '@carbon/icons/es/corn/16.js';
import Fish16 from '@carbon/icons/es/fish/16.js';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';
// import AmsterdamWindmill from '@carbon/pictograms/es/amsterdam--windmill/index.js';
// import Barcelona from '@carbon/pictograms/es/barcelona/index.js';
// import BerlinBrandenburgGate from '@carbon/pictograms/es/berlin--brandenburg-gate/index.js';
// import Atlanta from '@carbon/pictograms/es/atlanta/index.js';
// import Austin from '@carbon/pictograms/es/austin/index.js';
// import BostonZakimBridge from '@carbon/pictograms/es/boston--zakim-bridge/index.js';
import '../es/index.js';
// import { renderCarbonPictogram } from '../es/utilities/renderCarbonPictogram.js';

// export const pictograms = [
//   [
//     'Europe',
//     [
//       ['Amsterdam', AmsterdamWindmill],
//       ['Barcelona', Barcelona],
//       ['Berlin', BerlinBrandenburgGate],
//     ],
//   ],
//   [
//     'North America',
//     [
//       ['Atlanta', Atlanta],
//       ['Austin', Austin],
//       ['Boston', BostonZakimBridge],
//     ],
//   ],
// ].map(([label, cities]) => ({
//   label,
//   items: cities.map(([name, pictogram]) => ({
//     value: name.toLowerCase().split(' ').join('-'),
//     label: name,
//     pictogram,
//   })),
// }));

export const icons = [
  ['Apple', Apple16],
  ['Corn', Corn16],
  ['Fish', Fish16],
].map(([label, icon]) => ({
  value: label?.toString().toLowerCase().split(' ').join('-'),
  label,
  renderIcon: icon,
}));

const colors = [
  ['Yellow', carbonColors.yellow],
  ['Orange', carbonColors.orange],
  ['Red', carbonColors.red],
  ['Magenta', carbonColors.magenta],
  ['Purple', carbonColors.purple],
  ['Blue', carbonColors.blue],
  ['Cyan', carbonColors.cyan],
  ['Teal', carbonColors.teal],
  ['Green', carbonColors.green],
  ['Cool gray', carbonColors.coolGray],
  ['Gray', carbonColors.gray],
  ['Warm gray', carbonColors.warmGray],
  [
    'Others',
    {
      white: carbonColors.white,
      black: carbonColors.black,
    },
  ],
].map(([label, swatch]) => ({
  label,
  items: Object.entries(swatch).map(([step, color]) => ({
    value: `${label.toLowerCase()}-${step}`,
    label: `${label} ${step}`,
    color,
  })),
}));

const defaultProps = {
  align: POPOVER_ALIGNMENT.BOTTOM,
  open: true,
};

/**
 *
 * @param {object} props - Default props for test component
 * @returns {TemplateResult} The Lit template result.
 */
const colorTemplate = (
  props = { ...defaultProps, heading: 'Choose color' }
) => html`
  <clabs-style-picker
    id="style-picker"
    align=${props.align}
    ?open=${props.open}
    heading=${props.heading}
    ?enable-search=${props.enableSearch}
    search-close-button-label=${props.searchCloseButtonLabel}
    empty-state-title=${props.emptyStateTitle}
    empty-state-subtitle=${props.emptyStateSubtitle}
    search-label=${props.searchLabel}>
    <cds-icon-button
      id="trigger"
      slot="trigger"
      kind=${BUTTON_KIND.GHOST}
      aria-expanded="${props.open}"
      aria-controls="style-picker">
      ${iconLoader(ColorPalette16, { slot: 'icon' })}
      <span slot="tooltip-content">Color palette</span>
    </cds-icon-button>
    <clabs-style-picker-section heading="Colors">
      ${colors.map(
        (group) =>
          html`<clabs-style-picker-group heading=${group.label}>
            ${group.items.map(
              (item) => html`
                <clabs-style-picker-option
                  value=${item.color}
                  label=${item.label}
                  ?selected=${item.label === 'Blue 60'}>
                  <clabs-style-picker-color
                    color=${item.color}
                    label=${item.label}></clabs-style-picker-color>
                </clabs-style-picker-option>
              `
            )}
          </clabs-style-picker-group> `
      )}
    </clabs-style-picker-section>
  </clabs-style-picker>
`;

/**
 *
 * @param {object} props - Default props for test component
 * @returns {TemplateResult} The Lit template result.
 */
const iconTemplate = (props = defaultProps) => html`
  <clabs-style-picker
    align=${props.align}
    ?open=${props.open}
    heading=${props.heading}>
    <cds-icon-button slot="trigger" kind=${BUTTON_KIND.GHOST}>
      ${iconLoader(ColorPalette16, { slot: 'icon' })}
      <span slot="tooltip-content">Icon picker</span>
    </cds-icon-button>
    <clabs-style-picker-section heading="Icons">
      ${icons.map(
        (item) =>
          html`
            <clabs-style-picker-option
              value=${item.value}
              label=${item.label}
              ?selected=${item.value === 'apple'}>
              <clabs-style-picker-icon>
                ${item.renderIcon}
              </clabs-style-picker-icon>
            </clabs-style-picker-option>
          `
      )}
    </clabs-style-picker-section>
  </clabs-style-picker>
`;

// TODO: Moving to later
// /**
//  *
//  * @param {object} props - Default props for test component
//  * @returns {TemplateResult} The Lit template result.
//  */
// const pictogramTemplate = (props = defaultProps) => html`
//   <clabs-style-picker
//     align=${props.align}
//     ?open=${props.open}
//     heading=${props.heading}>
//     <cds-icon-button slot="trigger" kind=${BUTTON_KIND.GHOST}>
//       ${ColorPalette16({ slot: 'icon' })}
//       <span slot="tooltip-content">Pictogram picker</span>
//     </cds-icon-button>
//     <clabs-style-picker-section size="lg">
//       ${pictograms.map(
//         (group) =>
//           html`<clabs-style-picker-group heading=${group.label}>
//             ${group.items.map(
//               (item) => html`
//                 <clabs-style-picker-option
//                   value=${item.value}
//                   label=${item.label}
//                   ?selected=${item.label === 'Bangalore'}>
//                   ${renderCarbonPictogram({
//                     ...item.pictogram,
//                     attrs: {
//                       ...item.pictogram.attrs,
//                       width: '3rem',
//                       height: '3rem',
//                       'aria-label': item.label,
//                     },
//                   })}
//                 </clabs-style-picker-option>
//               `
//             )}
//           </clabs-style-picker-group> `
//       )}
//     </clabs-style-picker-section>
//   </clabs-style-picker>
// `;

describe('clabs-style-picker single variant', function () {
  it('should render single variant with color picker options', async () => {
    const el = await fixture(
      colorTemplate({ ...defaultProps, heading: 'Choose color' })
    );

    await expect(el.open).to.equal(true);

    const spHeading = el.shadowRoot.querySelector(
      `.clabs--style-picker__heading`
    );
    await expect(spHeading.textContent).to.equal('Choose color');

    const spSection = el.querySelector('clabs-style-picker-section');
    await expect(spSection).to.exist;
    await expect(spSection.heading).to.equal('Colors');

    const spGroups = spSection.querySelectorAll('clabs-style-picker-group');
    await expect(spGroups).to.exist;
    await expect(spGroups).to.have.length(13);

    const spOptions = spSection.querySelectorAll('clabs-style-picker-option');
    await expect(spOptions).to.have.length(122);

    let selectedOption;
    spOptions.forEach((option) => {
      if (option.hasAttribute('selected')) {
        selectedOption = option;
      }
    });
    expect(selectedOption.title).to.equal('Blue 60');

    await expect(el).dom.to.equalSnapshot();
    await expect(el).shadowDom.to.be.accessible();
  });

  it('should select a color option', async () => {
    const el = await fixture(
      colorTemplate({ ...defaultProps, heading: 'Choose color' })
    );

    const spOptions = el.querySelectorAll('clabs-style-picker-option');
    const gray10Option = spOptions[100];
    const eventPromise = oneEvent(el, 'clabs-style-picker-option-select');

    await gray10Option.click();

    const event = await eventPromise;

    await expect(event).to.exist;
    await expect(event.detail?.label).to.equal('Gray 10');
    await expect(event.detail?.value).to.equal('#f4f4f4');
    await expect(event.detail?.selected).to.equal(true);

    await expect(el).dom.to.equalSnapshot();
    await expect(el).shadowDom.to.be.accessible();
  });

  it('should enable search', async () => {
    const el = await fixture(
      colorTemplate({
        ...defaultProps,
        heading: 'Choose color',
        enableSearch: true,
        searchCloseButtonLabel: 'Clear search input',
        emptyStateTitle: 'No results found',
        emptyStateSubtitle: 'Try a different search',
        searchLabel: 'Search',
      })
    );

    const searchBox = el.shadowRoot.querySelector(`cds-search`);

    await expect(searchBox).to.exist;
    await expect(searchBox).to.have.attribute('label-text', 'Search');
    await expect(searchBox).to.have.attribute(
      'close-button-label-text',
      'Clear search input'
    );
  });

  it('should search a color', async () => {
    const el = await fixture(
      colorTemplate({
        ...defaultProps,
        heading: 'Choose color',
        enableSearch: true,
        searchCloseButtonLabel: 'Clear search input',
        emptyStateTitle: 'No results found',
        emptyStateSubtitle: 'Try a different search',
        searchLabel: 'Search',
      })
    );

    const searchBox = el.shadowRoot.querySelector(`cds-search`);
    await expect(searchBox).to.exist;

    const searchInput = searchBox.shadowRoot.querySelector('input');
    const eventPromise = oneEvent(searchBox, 'cds-search-input');

    searchInput.value = 'y';
    searchBox.dispatchEvent(
      new CustomEvent('cds-search-input', {
        detail: { value: 'y' },
        bubbles: true,
        composed: true,
      })
    );
    await eventPromise;
    await el.updateComplete;

    const spGroups = el.querySelectorAll('clabs-style-picker-group');
    const expectedHeadings = [
      'Yellow',
      'Cyan',
      'Cool gray',
      'Gray',
      'Warm gray',
    ];
    const actualHeadings = Array.from(spGroups)
      .filter((group) => !group.hasAttribute('hidden'))
      .map((group) => group.heading);

    await expect(actualHeadings).to.include.members(expectedHeadings);
  });

  it('should search a non-existing color', async () => {
    const el = await fixture(
      colorTemplate({
        ...defaultProps,
        heading: 'Choose color',
        enableSearch: true,
        searchCloseButtonLabel: 'Clear search input',
        emptyStateTitle: 'No results found',
        emptyStateSubtitle: 'Try a different search',
        searchLabel: 'Search',
      })
    );

    const searchBox = el.shadowRoot.querySelector(`cds-search`);
    await expect(searchBox).to.exist;

    const searchInput = searchBox.shadowRoot.querySelector('input');
    const eventPromise = oneEvent(searchBox, 'cds-search-input');

    searchInput.value = 'qw';
    searchBox.dispatchEvent(
      new CustomEvent('cds-search-input', {
        detail: { value: 'qw' },
        bubbles: true,
        composed: true,
      })
    );
    await eventPromise;
    await el.updateComplete;

    const spGroups = el.querySelectorAll('clabs-style-picker-group');
    const filteredGroups = Array.from(spGroups).filter(
      (group) => !group.hasAttribute('hidden')
    );

    await expect(filteredGroups).to.have.length(0);

    const emptyState = el.shadowRoot.querySelector('clabs-empty-state');
    await expect(emptyState).to.exist;
    
    const emptyStateHeading = emptyState.shadowRoot.querySelector(`h3`);
    await expect(emptyStateHeading.textContent).to.equal('No results found');

    const emptyStateSubtitle = emptyState.shadowRoot.querySelector(`p`);
    await expect(emptyStateSubtitle.textContent).to.equal('Try a different search');
  });
});
