/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, render } from 'lit';

// Icons
import TrashCan16 from '@carbon/icons/es/trash-can/16';
import ColorPalette16 from '@carbon/icons/es/color-palette/16';
import OverflowMenuVertical16 from '@carbon/icons/es/overflow-menu--vertical/16';
import Apple16 from '@carbon/icons/es/apple/16';
import Corn16 from '@carbon/icons/es/corn/16';
import Fish16 from '@carbon/icons/es/fish/16';
import Wheat16 from '@carbon/icons/es/wheat/16';
import FruitBowl16 from '@carbon/icons/es/fruit-bowl/16';
import Strawberry16 from '@carbon/icons/es/strawberry/16';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';

// Carbon Web Components
import '@carbon/web-components/es/components/layer/index.js';
import '@carbon/web-components/es/components/icon-button/index.js';
import '@carbon/web-components/es/components/tile/index.js';
import '@carbon/web-components/es/components/link/index.js';
import { BUTTON_KIND } from '@carbon/web-components/es/components/button/defs.js';

// Pictograms
import Bangalore from '@carbon/pictograms/lib/bangalore';
import AmsterdamWindmill from '@carbon/pictograms/lib/amsterdam--windmill';
import Barcelona from '@carbon/pictograms/lib/barcelona';
import BerlinBrandenburgGate from '@carbon/pictograms/lib/berlin--brandenburg-gate';
import Budapest from '@carbon/pictograms/lib/budapest';
import CopenhagenSnekkja from '@carbon/pictograms/lib/copenhagen--snekkja';

// Carbon Labs Style Picker
import '@carbon-labs/wc-style-picker/es/index.js';

// Colors data (simplified from Carbon colors)
const colors = [
  {
    label: 'Blue',
    items: [
      { value: 'blue-10', label: 'Blue 10', color: '#edf5ff' },
      { value: 'blue-20', label: 'Blue 20', color: '#d0e2ff' },
      { value: 'blue-30', label: 'Blue 30', color: '#a6c8ff' },
      { value: 'blue-40', label: 'Blue 40', color: '#78a9ff' },
      { value: 'blue-50', label: 'Blue 50', color: '#4589ff' },
      { value: 'blue-60', label: 'Blue 60', color: '#0f62fe' },
      { value: 'blue-70', label: 'Blue 70', color: '#0043ce' },
      { value: 'blue-80', label: 'Blue 80', color: '#002d9c' },
    ],
  },
  {
    label: 'Yellow',
    items: [
      { value: 'yellow-10', label: 'Yellow 10', color: '#fcf4d6' },
      { value: 'yellow-20', label: 'Yellow 20', color: '#fddc69' },
      { value: 'yellow-30', label: 'Yellow 30', color: '#f1c21b' },
      { value: 'yellow-40', label: 'Yellow 40', color: '#d2a106' },
    ],
  },
  {
    label: 'Red',
    items: [
      { value: 'red-10', label: 'Red 10', color: '#fff1f1' },
      { value: 'red-20', label: 'Red 20', color: '#ffd7d9' },
      { value: 'red-30', label: 'Red 30', color: '#ffb3b8' },
      { value: 'red-40', label: 'Red 40', color: '#ff8389' },
      { value: 'red-50', label: 'Red 50', color: '#fa4d56' },
      { value: 'red-60', label: 'Red 60', color: '#da1e28' },
    ],
  },
];

// Icons data
const icons = [
  { value: 'apple', label: 'Apple', icon: Apple16 },
  { value: 'corn', label: 'Corn', icon: Corn16 },
  { value: 'fish', label: 'Fish', icon: Fish16 },
  { value: 'fruit-bowl', label: 'Fruit bowl', icon: FruitBowl16 },
  { value: 'strawberry', label: 'Strawberry', icon: Strawberry16 },
  { value: 'wheat', label: 'Wheat', icon: Wheat16 },
];

// Pictograms data
const pictograms = [
  {
    label: 'Europe',
    items: [
      { value: 'amsterdam', label: 'Amsterdam', pictogram: AmsterdamWindmill },
      { value: 'barcelona', label: 'Barcelona', pictogram: Barcelona },
      { value: 'berlin', label: 'Berlin', pictogram: BerlinBrandenburgGate },
      { value: 'budapest', label: 'Budapest', pictogram: Budapest },
      {
        value: 'copenhagen',
        label: 'Copenhagen',
        pictogram: CopenhagenSnekkja,
      },
    ],
  },
  {
    label: 'Asia',
    items: [{ value: 'bangalore', label: 'Bangalore', pictogram: Bangalore }],
  },
];

/**
 * Helper function to render Carbon pictograms
 * @param {object} pictogram - The pictogram object
 * @returns {TemplateResult} The rendered pictogram
 */
function renderCarbonPictogram(pictogram) {
  const { elem, attrs } = pictogram;
  return html`<svg ...${attrs}>${elem}</svg>`;
}

/**
 * Toggle button handler
 * @param {string} pickerId - The ID of the style picker
 */
function toggleButton(pickerId) {
  const stylePicker = document.querySelector(`#${pickerId}`);
  const trigger = document.querySelector(`#trigger-${pickerId}`);

  stylePicker?.toggleAttribute('open');
  trigger?.setAttribute('aria-expanded', !!stylePicker?.hasAttribute('open'));
}

/**
 * Event handler when style-picker is closed
 * @param {string} pickerId - The ID of the style picker
 */
function closed(pickerId) {
  document
    .querySelector(`#trigger-${pickerId}`)
    ?.setAttribute('aria-expanded', 'false');
}

/**
 * Change color callback
 * @param {CustomEvent} ev - Custom event from color module
 * @param {string} tileId - The ID of the tile element
 */
function changeColor(ev, tileId) {
  const selectedColor = ev.detail.value;
  const tileEl = document.querySelector(`#${tileId}`);
  if (tileEl) {
    tileEl.style.borderColor = selectedColor;
  }
}

/**
 * Change icon callback
 * @param {CustomEvent} ev - Custom event from icon module
 * @param {string} iconId - The ID of the icon holder element
 */
function changeIcon(ev, iconId) {
  const selectedIcon = ev.detail.value;
  const iconData = icons.find((icon) => icon.value === selectedIcon);

  if (iconData) {
    const iconHolderEl = document.getElementById(iconId);
    const iconTemplate = iconLoader(iconData.icon);
    const container = document.createElement('div');
    render(iconTemplate, container);
    iconHolderEl.innerHTML = '';
    iconHolderEl.appendChild(container.firstElementChild);
  }
}

/**
 * Change pictogram callback
 * @param {CustomEvent} ev - Custom event from pictogram module
 * @param {string} pictogramId - The ID of the pictogram holder element
 */
function changePictogram(ev, pictogramId) {
  const pictogramName = ev.detail.value;
  const flatPictograms = pictograms.flatMap((group) => group.items);
  const pictogramData = flatPictograms?.find(
    (item) => item.value === pictogramName
  );

  if (pictogramData) {
    const pictogramHolderEl = document.getElementById(pictogramId);
    const pictogramTemplate = renderCarbonPictogram({
      ...pictogramData.pictogram,
      attrs: {
        ...pictogramData.pictogram.attrs,
        'aria-label': pictogramData.label,
      },
    });
    const container = document.createElement('div');
    render(pictogramTemplate, container);
    pictogramHolderEl.innerHTML = '';
    pictogramHolderEl.appendChild(container.firstElementChild);
  }
}

// Initialize examples after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Single variant - Color example
  const singleColorContainer = document.getElementById('single-color-example');
  if (singleColorContainer) {
    const template = html`
      <div class="example-section">
        <h3>Single - Color Picker</h3>
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            id="style-picker-single-color"
            align="left-top"
            heading="Choose color"
            enable-search
            search-close-button-label="Clear search input"
            empty-state-title="No results found"
            empty-state-subtitle="Try a different search"
            search-label="Search"
            @clabs-style-picker-close=${() =>
              closed('style-picker-single-color')}>
            <cds-icon-button
              id="trigger-style-picker-single-color"
              slot="trigger"
              kind=${BUTTON_KIND.GHOST}
              @click=${() => toggleButton('style-picker-single-color')}
              aria-expanded="true"
              aria-controls="style-picker-single-color">
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
                            changeColor(ev, 'tile-single-color')}>
                          <clabs-style-picker-color
                            color=${item.color}
                            label=${item.label}></clabs-style-picker-color>
                        </clabs-style-picker-option>
                      `
                    )}
                  </clabs-style-picker-group>`
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
          <cds-tile
            id="tile-single-color"
            class="inline-tile"
            style="border-inline-start: 0.25rem solid #0f62fe">
            <h6>Primary text</h6>
            <br />
            <small>Secondary text or description</small>
            <br /><br />
            <cds-link href="#">Link</cds-link>
          </cds-tile>
        </div>
      </div>
    `;
    render(template, singleColorContainer);
  }

  // Single variant - Icon example
  const singleIconContainer = document.getElementById('single-icon-example');
  if (singleIconContainer) {
    const template = html`
      <div class="example-section">
        <h3>Single - Icon Picker</h3>
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            id="style-picker-single-icon"
            align="left-top"
            heading="Choose icon"
            @clabs-style-picker-close=${() =>
              closed('style-picker-single-icon')}>
            <cds-icon-button
              id="trigger-style-picker-single-icon"
              slot="trigger"
              kind=${BUTTON_KIND.GHOST}
              @click=${() => toggleButton('style-picker-single-icon')}
              aria-expanded="true"
              aria-controls="style-picker-single-icon">
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
                        changeIcon(ev, 'inline-tile-icon-single')}>
                      <clabs-style-picker-icon>
                        ${iconLoader(item.icon)}
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
              <span id="inline-tile-icon-single">${iconLoader(Apple16)}</span>
              <h6>Primary text</h6>
            </div>
            <br />
            <small>Secondary text or description</small>
            <br /><br />
            <cds-link href="#">Link</cds-link>
          </cds-tile>
        </div>
      </div>
    `;
    render(template, singleIconContainer);
  }

  // Flat variant - Color and Icon example
  const flatColorIconContainer = document.getElementById(
    'flat-color-icon-example'
  );
  if (flatColorIconContainer) {
    const template = html`
      <div class="example-section">
        <h3>Flat - Color and Icon Picker</h3>
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            id="style-picker-flat"
            align="left-top"
            heading="Choose color and icon"
            kind="flat"
            enable-search
            search-close-button-label="Clear search input"
            empty-state-title="No results found"
            empty-state-subtitle="Try a different search"
            search-label="Search"
            @clabs-style-picker-close=${() => closed('style-picker-flat')}>
            <cds-icon-button
              id="trigger-style-picker-flat"
              slot="trigger"
              kind=${BUTTON_KIND.GHOST}
              @click=${() => toggleButton('style-picker-flat')}
              aria-expanded="true"
              aria-controls="style-picker-flat">
              ${iconLoader(ColorPalette16, { slot: 'icon' })}
              <span slot="tooltip-content">Color palette</span>
            </cds-icon-button>
            <clabs-style-picker-section heading="Colors">
              ${colors[1].items.map(
                (item) => html`
                  <clabs-style-picker-option
                    value=${item.color}
                    label=${item.label}
                    ?selected=${item.label === 'Yellow 20'}
                    @clabs-style-picker-option-select=${(ev) =>
                      changeColor(ev, 'tile-flat')}>
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
                      ?selected=${item.value === 'apple'}
                      @clabs-style-picker-option-select=${(ev) =>
                        changeIcon(ev, 'inline-tile-icon-flat')}>
                      <clabs-style-picker-icon>
                        ${iconLoader(item.icon)}
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
          <cds-tile
            id="tile-flat"
            class="inline-tile"
            style="border-inline-start: 0.25rem solid #fddc69">
            <div class="inline-tile-header">
              <span id="inline-tile-icon-flat">${iconLoader(Apple16)}</span>
              <h6>Primary text</h6>
            </div>
            <br />
            <small>Secondary text or description</small>
            <br /><br />
            <cds-link href="#">Link</cds-link>
          </cds-tile>
        </div>
      </div>
    `;
    render(template, flatColorIconContainer);
  }

  // Disclosed variant - Color and Icon example
  const disclosedContainer = document.getElementById('disclosed-example');
  if (disclosedContainer) {
    const template = html`
      <div class="example-section">
        <h3>Disclosed - Icon, Color, and Pictogram Picker</h3>
        <cds-layer class="toolbar-layer">
          <clabs-style-picker
            open
            id="style-picker-disclosed"
            align="left-top"
            heading="Customize"
            kind="disclosed"
            enable-search
            search-close-button-label="Clear search input"
            empty-state-title="No results found"
            empty-state-subtitle="Try a different search"
            search-label="Search"
            @clabs-style-picker-close=${() => closed('style-picker-disclosed')}>
            <cds-icon-button
              id="trigger-style-picker-disclosed"
              slot="trigger"
              kind=${BUTTON_KIND.GHOST}
              @click=${() => toggleButton('style-picker-disclosed')}
              aria-expanded="true"
              aria-controls="style-picker-disclosed">
              ${iconLoader(ColorPalette16, { slot: 'icon' })}
              <span slot="tooltip-content">Customize</span>
            </cds-icon-button>
            <clabs-style-picker-sections>
              <clabs-style-picker-section heading="Icons">
                ${icons.map(
                  (item) =>
                    html`
                      <clabs-style-picker-option
                        value=${item.value}
                        label=${item.label}
                        ?selected=${item.value === 'apple'}
                        @clabs-style-picker-option-select=${(ev) =>
                          changeIcon(ev, 'inline-tile-icon-disclosed')}>
                        <clabs-style-picker-icon>
                          ${iconLoader(item.icon)}
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
                            ?selected=${item.label === 'Blue 60'}
                            @clabs-style-picker-option-select=${(ev) =>
                              changeColor(ev, 'tile-disclosed')}>
                            <clabs-style-picker-color
                              color=${item.color}
                              label=${item.label}></clabs-style-picker-color>
                          </clabs-style-picker-option>
                        `
                      )}
                    </clabs-style-picker-group>`
                )}
              </clabs-style-picker-section>
              <clabs-style-picker-section heading="Pictograms" size="lg">
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
                              changePictogram(
                                ev,
                                'inline-tile-pictogram-disclosed'
                              )}>
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
                    </clabs-style-picker-group>`
                )}
              </clabs-style-picker-section>
            </clabs-style-picker-sections>
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
          <cds-tile
            id="tile-disclosed"
            class="inline-tile"
            style="border-inline-start: 0.25rem solid #0f62fe">
            
            <br />
            <div class="inline-tile-header">
              <span id="inline-tile-icon-disclosed"
                >${iconLoader(Apple16)}</span
              >
              <h6>Primary text</h6>
            </div>
            <div class="inline-pictogram-secondary-text">
              Secondary text or description
            </div>
            <br />
            <cds-link href="#">Link</cds-link>
          </cds-tile>
        </div>
      </div>
    `;
    render(template, disclosedContainer);
  }
});
