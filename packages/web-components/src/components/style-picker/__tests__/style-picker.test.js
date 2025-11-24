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
import Wheat16 from '@carbon/icons/es/wheat/16';
import FruitBowl16 from '@carbon/icons/es/fruit-bowl/16';
import Strawberry16 from '@carbon/icons/es/strawberry/16';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';
import '../es/index.js';

export const icons = [
  ['Apple', Apple16],
  ['Corn', Corn16],
  ['Fish', Fish16],
  ['Fruit bowl', FruitBowl16],
  ['Strawberry', Strawberry16],
  ['Wheat', Wheat16],
].map(([label, icon]) => ({
  value: label?.toString().toLowerCase().split(' ').join('-'),
  label: label,
  renderIcon: iconLoader(icon),
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
const singleColorTemplate = (
  props = { ...defaultProps, heading: 'Choose color' }
) => html`
  <clabs-style-picker
    id="style-picker"
    align=${props.align}
    kind=${props.kind}
    ?open=${props.open}
    heading=${props.heading}
    ?loading=${props.isLoading}
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
const singleIconTemplate = (props = defaultProps) => html`
  <clabs-style-picker
    id="style-picker"
    align=${props.align}
    kind=${props.kind}
    ?open=${props.open}
    heading=${props.heading}
    ?enable-search=${props.enableSearch}
    search-close-button-label=${props.searchCloseButtonLabel}
    empty-state-title=${props.emptyStateTitle}
    empty-state-subtitle=${props.emptyStateSubtitle}
    search-label=${props.searchLabel}>
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

/**
 *
 * @param {object} props - Default props for test component
 * @returns {TemplateResult} The Lit template result.
 */
const flatIconColorTemplate = (props = defaultProps) => html`
  <clabs-style-picker
    id="style-picker"
    align=${props.align}
    ?open=${props.open}
    heading=${props.heading}
    kind=${props.kind}
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
      <span slot="tooltip-content">Color and icon palette</span>
    </cds-icon-button>
    <clabs-style-picker-section heading="Colors">
      ${colors[0].items.map(
        (item) => html`
          <clabs-style-picker-option
            value=${item.color}
            label=${item.label}
            ?selected=${item.label === 'Yellow 20'}>
            <clabs-style-picker-color
              color=${item.color}
              label=${item.label}></clabs-style-picker-color>
          </clabs-style-picker-option>
        `
      )}
    </clabs-style-picker-section>
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

/**
 *
 * @param {object} props - Default props for test component
 * @returns {TemplateResult} The Lit template result.
 */
const disclosedColorAndIconTemplate = (props = defaultProps) => html`
  <clabs-style-picker
    id="style-picker"
    align=${props.align}
    ?open=${props.open}
    heading=${props.heading}
    kind=${props.kind}
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
    <clabs-style-picker-sections>
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
    </clabs-style-picker-sections>
  </clabs-style-picker>
`;

describe('clabs-style-picker single variant color picker', function () {
  it('should render single variant with color options', async () => {
    const el = await fixture(
      singleColorTemplate({ ...defaultProps, heading: 'Choose color' })
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
      singleColorTemplate({ ...defaultProps, heading: 'Choose color' })
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
    await expect(gray10Option).to.have.attribute('selected');

    await expect(el).dom.to.equalSnapshot();
    await expect(el).shadowDom.to.be.accessible();
  });

  it('should enable search in single variant', async () => {
    const el = await fixture(
      singleColorTemplate({
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

    await expect(el).dom.to.equalSnapshot();
    await expect(el).shadowDom.to.be.accessible();
  });

  it('should search a color', async () => {
    const el = await fixture(
      singleColorTemplate({
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
      singleColorTemplate({
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
    await expect(emptyStateSubtitle.textContent).to.equal(
      'Try a different search'
    );
  });

  it('should render loading state', async () => {
    const el = await fixture(
      singleColorTemplate({
        ...defaultProps,
        isLoading: true,
        heading: 'Choose color',
      })
    );

    const progressBar = el.shadowRoot.querySelector(`cds-progress-bar`);

    expect(progressBar).to.exist;
  });
});

describe('clabs-style-picker single variant icon picker', function () {
  it('should render single variant with icon picker options', async () => {
    const el = await fixture(
      singleIconTemplate({ ...defaultProps, heading: 'Choose icon' })
    );

    await expect(el.open).to.equal(true);

    const spSection = el.querySelector('clabs-style-picker-section');
    await expect(spSection).to.exist;
    await expect(spSection.heading).to.equal('Icons');

    const iconElements = el.querySelectorAll(`clabs-style-picker-icon`);
    await expect(iconElements).to.have.length(6);

    const spOptions = el.querySelectorAll('clabs-style-picker-option');
    await expect(spOptions).to.have.length(6);

    let selectedOption;
    spOptions.forEach((option) => {
      if (option.hasAttribute('selected')) {
        selectedOption = option;
      }
    });
    expect(selectedOption.title).to.equal('Apple');

    await expect(el).dom.to.equalSnapshot();
    await expect(el).shadowDom.to.be.accessible();
  });

  it('should select a icon option', async () => {
    const el = await fixture(
      singleIconTemplate({ ...defaultProps, heading: 'Choose icon' })
    );

    const spOptions = el.querySelectorAll('clabs-style-picker-option');
    const newOption = spOptions[2];
    const eventPromise = oneEvent(el, 'clabs-style-picker-option-select');

    await newOption.click();

    const event = await eventPromise;

    await expect(event).to.exist;
    await expect(event.detail?.label).to.equal('Fish');
    await expect(event.detail?.value).to.equal('fish');
    await expect(event.detail?.selected).to.equal(true);
    await expect(newOption).to.have.attribute('selected');
    await expect(spOptions[0]).to.not.have.attribute('selected');

    await expect(el).dom.to.equalSnapshot();
    await expect(el).shadowDom.to.be.accessible();
  });
});

describe('clabs-style-picker flat variant color and icon picker', function () {
  it('should render flat variant with color and icon options ', async () => {
    const el = await fixture(
      flatIconColorTemplate({
        ...defaultProps,
        heading: 'Choose color and icon',
      })
    );

    await expect(el.open).to.equal(true);

    const spSections = el.querySelectorAll('clabs-style-picker-section');
    await expect(spSections).to.have.length(2);
    await expect(spSections[0]).to.have.attribute('heading', 'Colors');
    await expect(spSections[1]).to.have.attribute('heading', 'Icons');

    const selectedColor = spSections[0].querySelector('[selected]');
    await expect(selectedColor).to.have.attribute('label', 'Yellow 20');
    await expect(selectedColor).to.have.attribute('value', '#fddc69');

    const selectedIcon = spSections[1].querySelector('[selected]');
    await expect(selectedIcon).to.have.attribute('label', 'Apple');
    await expect(selectedIcon).to.have.attribute('value', 'apple');

    await expect(el).dom.to.equalSnapshot();
    await expect(el).shadowDom.to.be.accessible();
  });

  it('should select a different color and icon options', async () => {
    const el = await fixture(
      flatIconColorTemplate({
        ...defaultProps,
        heading: 'Choose color and icon',
      })
    );

    const spSections = el.querySelectorAll('clabs-style-picker-section');
    const allColors = spSections[0].querySelectorAll(
      'clabs-style-picker-option'
    );
    await expect(allColors).to.have.length(10);

    const newColor = allColors[3];
    const eventPromise = oneEvent(el, 'clabs-style-picker-option-select');

    await newColor.click();

    const event = await eventPromise;

    await expect(event).to.exist;
    await expect(event.detail?.label).to.equal('Yellow 40');
    await expect(event.detail?.value).to.equal('#d2a106');
    await expect(event.detail?.selected).to.equal(true);
    await expect(newColor).to.have.attribute('selected');
    await expect(allColors[0]).to.not.have.attribute('selected');

    const iconEventPromise = oneEvent(el, 'clabs-style-picker-option-select');
    const allIcons = spSections[1].querySelectorAll(
      'clabs-style-picker-option'
    );
    const newIcon = allIcons[3];

    await newIcon.click();

    const iconEvent = await iconEventPromise;

    await expect(iconEvent).to.exist;
    await expect(iconEvent.detail?.label).to.equal('Fruit bowl');
    await expect(iconEvent.detail?.value).to.equal('fruit-bowl');
    await expect(iconEvent.detail?.selected).to.equal(true);
    await expect(allIcons[0]).to.not.have.attribute('selected');

    await expect(el).dom.to.equalSnapshot();
    await expect(el).shadowDom.to.be.accessible();
  });

  it('should enable search in flat variant', async () => {
    const el = await fixture(
      flatIconColorTemplate({
        ...defaultProps,
        heading: 'Choose color and icon',
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

    await expect(el).dom.to.equalSnapshot();
    await expect(el).shadowDom.to.be.accessible();
  });

  it('should search color and icon', async () => {
    const el = await fixture(
      flatIconColorTemplate({
        ...defaultProps,
        heading: 'Choose color and icon',
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

    searchInput.value = 'f';
    searchBox.dispatchEvent(
      new CustomEvent('cds-search-input', {
        detail: { value: 'f' },
        bubbles: true,
        composed: true,
      })
    );
    await eventPromise;

    const spSections = el.querySelectorAll('clabs-style-picker-section');
    const allColors = spSections[0].querySelectorAll(
      'clabs-style-picker-option:not([hidden])'
    );
    const allIcons = spSections[1].querySelectorAll(
      'clabs-style-picker-option:not([hidden])'
    );

    await expect(allColors).to.have.length(0);
    await expect(allIcons).to.have.length(2);
    await expect(allIcons[0]).to.have.attribute('label', 'Fish');
    await expect(allIcons[1]).to.have.attribute('label', 'Fruit bowl');

    await expect(el).dom.to.equalSnapshot();
    await expect(el).shadowDom.to.be.accessible();
  });
});

describe('clabs-style-picker disclosed variant color and icon picker', function () {
  it('should render disclosed variant with color and icon options', async () => {
    const el = await fixture(
      disclosedColorAndIconTemplate({
        ...defaultProps,
        heading: 'Choose color and icon',
      })
    );

    const sectionsEl = el.querySelector('clabs-style-picker-sections');
    await expect(sectionsEl).to.exist;

    const spSections = sectionsEl.querySelectorAll(
      'clabs-style-picker-section'
    );

    await expect(spSections).to.have.length(2);
    await expect(spSections[0]).to.have.attribute('heading', 'Icons');
    await expect(spSections[1]).to.have.attribute('heading', 'Colors');

    const selectedIcon = spSections[0].querySelector('[selected]');
    await expect(selectedIcon).to.have.attribute('label', 'Apple');
    await expect(selectedIcon).to.have.attribute('value', 'apple');

    const selectedColor = spSections[1].querySelector('[selected]');
    await expect(selectedColor).to.have.attribute('label', 'Blue 60');
    await expect(selectedColor).to.have.attribute('value', '#0f62fe');

    await expect(el).dom.to.equalSnapshot();
    await expect(el).shadowDom.to.be.accessible();
  });

  it('should select a different color and icon options', async () => {
    const el = await fixture(
      disclosedColorAndIconTemplate({
        ...defaultProps,
        heading: 'Choose color and icon',
      })
    );

    const spSections = el.querySelectorAll('clabs-style-picker-section');
    const allColors = spSections[1].querySelectorAll(
      'clabs-style-picker-option'
    );
    await expect(allColors).to.have.length(122);

    const newColor = allColors[20];
    const eventPromise = oneEvent(el, 'clabs-style-picker-option-select');

    await newColor.click();

    const event = await eventPromise;

    await expect(event).to.exist;
    await expect(event.detail?.label).to.equal('Red 10');
    await expect(event.detail?.value).to.equal('#fff1f1');
    await expect(event.detail?.selected).to.equal(true);
    await expect(newColor).to.have.attribute('selected');

    const iconEventPromise = oneEvent(el, 'clabs-style-picker-option-select');
    const allIcons = spSections[0].querySelectorAll(
      'clabs-style-picker-option'
    );
    const newIcon = allIcons[3];

    await newIcon.click();

    const iconEvent = await iconEventPromise;

    await expect(iconEvent).to.exist;
    await expect(iconEvent.detail?.label).to.equal('Fruit bowl');
    await expect(iconEvent.detail?.value).to.equal('fruit-bowl');
    await expect(iconEvent.detail?.selected).to.equal(true);
    await expect(allIcons[0]).to.not.have.attribute('selected');

    await expect(el).dom.to.equalSnapshot();
    await expect(el).shadowDom.to.be.accessible();
  });

  it('should enable search in disclosed variant', async () => {
    const el = await fixture(
      disclosedColorAndIconTemplate({
        ...defaultProps,
        heading: 'Choose color and icon',
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

    await expect(el).dom.to.equalSnapshot();
    await expect(el).shadowDom.to.be.accessible();
  });

  it('should search color and icon', async () => {
    const el = await fixture(
      disclosedColorAndIconTemplate({
        ...defaultProps,
        heading: 'Choose color and icon',
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

    searchInput.value = 'r';
    searchBox.dispatchEvent(
      new CustomEvent('cds-search-input', {
        detail: { value: 'r' },
        bubbles: true,
        composed: true,
      })
    );
    await eventPromise;

    const spSections = el.querySelectorAll('clabs-style-picker-section');
    const allColors = spSections[1].querySelectorAll(
      'clabs-style-picker-option:not([hidden])'
    );
    const allIcons = spSections[0].querySelectorAll(
      'clabs-style-picker-option:not([hidden])'
    );

    await expect(allColors).to.have.length(72);
    await expect(allIcons).to.have.length(3);

    await expect(el).dom.to.equalSnapshot();
    await expect(el).shadowDom.to.be.accessible();
  });
});
