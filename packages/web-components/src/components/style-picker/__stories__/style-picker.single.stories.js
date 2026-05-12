/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { css, html, render } from 'lit';

// Icons
import TrashCan16 from '@carbon/icons/es/trash-can/16';
import ColorPalette16 from '@carbon/icons/es/color-palette/16';
import OverflowMenuVertical16 from '@carbon/icons/es/overflow-menu--vertical/16';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';

// Carbon
import '@carbon/web-components/es/components/layer/index.js';
import '@carbon/web-components/es/components/icon-button/index.js';
import '@carbon/web-components/es/components/tile/index.js';
import '@carbon/web-components/es/components/link/index.js';
import { BUTTON_KIND } from '@carbon/web-components/es/components/button/defs.js';

// Pictograms
import Bangalore from '@carbon/pictograms/lib/bangalore';

// Carbon labs
import { settings } from '@carbon-labs/utilities';

// StylePicker
import '../index';
import { STYLE_PICKER_ALIGNMENT } from '../defs';
import { renderCarbonPictogram } from '../utilities/renderCarbonPictogram';
import { colors, icons, pictograms } from './_placeholders';
import { alignOptions } from './_story.defs';

const { stablePrefix: clabsPrefix, prefix: carbonPrefix } = settings;

/**
 * More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
 */
export default {
  title: 'Components/Style Picker/Single',
  component: 'clabs-style-picker',
};

const styles = css`
  .style-picker-story-container {
    margin-inline-start: 20rem;
  }

  .toolbar-layer {
    display: inline-block;
    background-color: var(--cds-layer);
    color: var(--cds-text-primary, #161616);
  }

  .inline-tile-holder {
    margin-top: 0.2rem;
  }

  .inline-tile {
    display: inline-block;
    border-inline-start: 0.25rem solid #0f62fe;
  }

  .inline-tile-header {
    display: flex;
    align-items: start;
    gap: 0.25rem;
  }

  .inline-pictogram-secondary-text {
    margin-top: 0.5rem;
  }
`;

/**
 * remove and add `open` attribute
 */
const toggleButton = () => {
  const stylePicker = document.querySelector(`${clabsPrefix}-style-picker`);
  const trigger = document.querySelector('#trigger');

  stylePicker?.toggleAttribute('open');
  trigger.setAttribute('aria-expanded', !!stylePicker?.hasAttribute('open'));
};

/**
 * Event fire when style-picker closed, and change the aria-expanded.
 */
const closed = () => {
  document.querySelector('#trigger').setAttribute('aria-expanded', 'false');
};

/**
 * Change color callback
 * @param {object} ev - custom event from color module
 *
 * @returns {void}
 */
const changeColor = (ev) => {
  const selectedColor = ev.detail.value;

  const tileEl = document.querySelector(`${carbonPrefix}-tile`);
  tileEl.style.borderColor = `${selectedColor}`;
};

/**
 * Change icon callback
 * @param {object} ev - custom event from icon module
 */
const changeIcon = (ev) => {
  const selectedIcon = ev.detail.value;

  const iconHolderEl = document.getElementById('inline-tile-icon');
  const iconTemplate = icons.find(
    (icon) => icon.value === selectedIcon
  ).renderIcon;
  const container = document.createElement('div');
  render(iconTemplate, container);
  iconHolderEl.innerHTML = '';
  iconHolderEl.appendChild(container.firstElementChild);
};

/**
 * Change pictogram callback
 * @param {object} ev - custom event from color module
 */
const changePictogram = (ev) => {
  const pictogramName = ev.detail.value;
  const flatPictograms = pictograms.flatMap((group) => group.items);
  const pictogram = flatPictograms?.find(
    (item) => item.value === pictogramName
  )?.pictogram;

  const pictogramHolderEl = document.getElementById('inline-tile-pictogram');
  const pictogramTemplate = renderCarbonPictogram({
    ...pictogram,
    attrs: { ...pictogram.attrs, 'aria-label': pictogramName },
  });
  const container = document.createElement('div');
  render(pictogramTemplate, container);
  pictogramHolderEl.innerHTML = '';
  pictogramHolderEl.appendChild(container.firstElementChild);
};

const argTypes = {
  open: {
    control: 'radio',
    description: 'true if the modal is open',
  },
  heading: {
    control: 'text',
    description: 'style picker heading.',
  },
  align: {
    control: 'select',
    options: [...alignOptions],
    description: `Specify how the popover should align with the trigger element`,
  },
  kind: {
    description:
      "There are three different variants `'single' | 'flat' | 'disclosed'` ",
    control: 'disabled',
  },
  enableSearch: {
    control: 'boolean',
    description: 'Enable search option',
  },
  searchCloseButtonLabel: {
    control: 'text',
  },
  emptyStateTitle: {
    control: 'text',
  },
  emptyStateSubtitle: {
    control: 'text',
  },
  searchInputPlaceholder: {
    control: 'text',
  },
  searchLabel: {
    control: 'text',
  },
};

export const Color = {
  args: {
    open: true,
    heading: 'Choose color',
    align: STYLE_PICKER_ALIGNMENT.LEFT_TOP,
    enableSearch: true,
    searchCloseButtonLabel: 'Clear search input',
    emptyStateTitle: 'No results found',
    emptyStateSubtitle: 'Try a different search',
    searchLabel: 'Search',
  },
  argTypes,
  /**
   * Renders the template for Storybook
   * @param {object} args Storybook arguments
   * @returns {TemplateResult<1>}
   */
  render: (args) =>
    html`
      <style>
        ${styles}
      </style>
      <div class="style-picker-story-container">
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            id="style-picker"
            align=${args.align}
            ?open=${args.open}
            heading=${args.heading}
            ?loading=${args.isLoading}
            ?enable-search=${args.enableSearch}
            search-close-button-label=${args.searchCloseButtonLabel}
            empty-state-title=${args.emptyStateTitle}
            empty-state-subtitle=${args.emptyStateSubtitle}
            search-label=${args.searchLabel}
            @clabs-style-picker-close=${closed}>
            <cds-icon-button
              id="trigger"
              slot="trigger"
              kind=${BUTTON_KIND.GHOST}
              @click=${toggleButton}
              aria-expanded="${args.open}"
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
                          ?selected=${item.label === 'Blue 60'}
                          @clabs-style-picker-option-select=${(ev) =>
                            changeColor(ev)}>
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
          <cds-icon-button kind=${BUTTON_KIND.GHOST}>
            ${iconLoader(TrashCan16, { slot: 'icon' })}
            <span slot="tooltip-content">Delete</span>
          </cds-icon-button>
          <cds-icon-button kind=${BUTTON_KIND.GHOST}>
            ${iconLoader(OverflowMenuVertical16, { slot: 'icon' })}
            <span slot="tooltip-content">More</span>
          </cds-icon-button>
        </cds-layer>
        <div class="inline-tile-holder">
          <cds-tile class="inline-tile">
            <h6>Primary text</h6>
            <br />
            <small>Secondary text or description</small>
            <br /><br />
            <cds-link href="#">Link</cds-link>
          </cds-tile>
        </div>
      </div>
    `,
};

export const Icon = {
  args: {
    heading: 'Choose icon',
    open: true,
    align: STYLE_PICKER_ALIGNMENT.LEFT_TOP,
  },
  argTypes,
  /**
   * Renders the template for Storybook
   * @param {object} args Storybook arguments
   * @returns {TemplateResult<1>}
   */
  render: (args) =>
    html`
      <style>
        ${styles}
      </style>
      <div class="style-picker-story-container">
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            id="style-picker"
            align=${args.align}
            ?open=${args.open}
            heading=${args.heading}
            ?loading=${args.isLoading}
            @clabs-style-picker-close=${closed}>
            <cds-icon-button
              id="trigger"
              slot="trigger"
              kind=${BUTTON_KIND.GHOST}
              @click=${toggleButton}
              aria-expanded="${args.open}"
              aria-controls="style-picker">
              ${iconLoader(ColorPalette16, { slot: 'icon' })}
              <span slot="tooltip-content">Icon list</span>
            </cds-icon-button>
            <clabs-style-picker-section heading="Icons">
              ${icons.map(
                (item) =>
                  html`
                    <clabs-style-picker-option
                      value=${item.value}
                      label=${item.label}
                      ?selected=${item.value === 'apple'}
                      @clabs-style-picker-option-select=${(ev) =>
                        changeIcon(ev)}>
                      <clabs-style-picker-icon>
                        ${item.renderIcon}
                      </clabs-style-picker-icon>
                    </clabs-style-picker-option>
                  `
              )}
            </clabs-style-picker-section>
          </clabs-style-picker>
          <cds-icon-button kind=${BUTTON_KIND.GHOST}>
            ${iconLoader(TrashCan16, { slot: 'icon' })}
            <span slot="tooltip-content">Delete</span>
          </cds-icon-button>
          <cds-icon-button kind=${BUTTON_KIND.GHOST}>
            ${iconLoader(OverflowMenuVertical16, { slot: 'icon' })}
            <span slot="tooltip-content">More</span>
          </cds-icon-button>
        </cds-layer>
        <div class="inline-tile-holder">
          <cds-tile class="inline-tile">
            <div class="inline-tile-header">
              <span id="inline-tile-icon">${icons[0].renderIcon}</span>
              <h6>Primary text</h6>
            </div>
            <br />
            <small>Secondary text or description</small>
            <br /><br />
            <cds-link href="#">Link</cds-link>
          </cds-tile>
        </div>
      </div>
    `,
};

export const Pictogram = {
  args: {
    heading: 'Choose pictogram',
    open: true,
    align: STYLE_PICKER_ALIGNMENT.LEFT_TOP,
    enableSearch: true,
    searchCloseButtonLabel: 'Clear search input',
    emptyStateTitle: 'No results found',
    emptyStateSubtitle: 'Try a different search',
    searchLabel: 'Search',
  },
  argTypes,
  /**
   * Renders the template for Storybook
   * @param {object} args Storybook arguments
   * @returns {TemplateResult<1>}
   */
  render: (args) =>
    html`
      <style>
        ${styles}
      </style>
      <div class="style-picker-story-container">
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            id="style-picker"
            align=${args.align}
            ?open=${args.open}
            heading=${args.heading}
            ?enable-search=${args.enableSearch}
            ?loading=${args.isLoading}
            search-close-button-label=${args.searchCloseButtonLabel}
            empty-state-title=${args.emptyStateTitle}
            empty-state-subtitle=${args.emptyStateSubtitle}
            search-label=${args.searchLabel}
            @clabs-style-picker-close=${closed}>
            <cds-icon-button
              id="trigger"
              slot="trigger"
              kind=${BUTTON_KIND.GHOST}
              @click=${toggleButton}
              aria-expanded="${args.open}"
              aria-controls="style-picker">
              ${iconLoader(ColorPalette16, { slot: 'icon' })}
              <span slot="tooltip-content">Pictogram list</span>
            </cds-icon-button>
            <clabs-style-picker-section size="lg" heading="Pictograms">
              ${pictograms.map(
                (group) =>
                  html`<clabs-style-picker-group heading=${group.label}>
                    ${group.items.map(
                      (item) => html`
                        <clabs-style-picker-option
                          value=${item.value}
                          label=${item.label}
                          ?selected=${item.label === 'Bangalore'}
                          @clabs-style-picker-option-select=${(ev) =>
                            changePictogram(ev)}>
                          ${renderCarbonPictogram({
                            ...item.pictogram,
                            attrs: {
                              ...item.pictogram.attrs,
                              width: '3rem',
                              height: '3rem',
                              'aria-label': item.label,
                            },
                          })}
                        </clabs-style-picker-option>
                      `
                    )}
                  </clabs-style-picker-group> `
              )}
            </clabs-style-picker-section>
          </clabs-style-picker>
          <cds-icon-button kind=${BUTTON_KIND.GHOST}>
            ${iconLoader(TrashCan16, { slot: 'icon' })}
            <span slot="tooltip-content">Delete</span>
          </cds-icon-button>
          <cds-icon-button kind=${BUTTON_KIND.GHOST}>
            ${iconLoader(OverflowMenuVertical16, { slot: 'icon' })}
            <span slot="tooltip-content">More</span>
          </cds-icon-button>
        </cds-layer>
        <div class="inline-tile-holder">
          <cds-tile class="inline-tile">
            <div id="inline-tile-pictogram">
              ${renderCarbonPictogram({
                ...Bangalore,
                attrs: { ...Bangalore.attrs, 'aria-label': Bangalore.name },
              })}
            </div>
            <br />
            <h6>Primary text</h6>
            <div class="inline-pictogram-secondary-text">
              Secondary text or description
            </div>
            <br />
            <cds-link href="#">Link</cds-link>
          </cds-tile>
        </div>
      </div>
    `,
};
