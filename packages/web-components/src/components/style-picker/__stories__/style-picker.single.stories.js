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
import TrashCan16 from '@carbon/web-components/es/icons/trash-can/16';
import ColorPalette16 from '@carbon/web-components/es/icons/color-palette/16';
import OverflowMenuVertical16 from '@carbon/web-components/es/icons/overflow-menu--vertical/16';

// Carbon
import '@carbon/web-components/es/components/layer/index.js';
import '@carbon/web-components/es/components/icon-button/index.js';
import '@carbon/web-components/es/components/tile/index.js';
import '@carbon/web-components/es/components/link/index.js';
import { POPOVER_ALIGNMENT } from '@carbon/web-components/es/components/popover/defs.js';
import { BUTTON_KIND } from '@carbon/web-components/es/components/button/defs.js';

// Pictograms
import Bangalore from '@carbon/pictograms/lib/bangalore';

// Carbon labs
import { settings } from '@carbon-labs/utilities/es/settings/index.js';

// StylePicker
import '../components/style-picker/style-picker';
import '../components/style-picker-color-module/style-picker-color-module';
import '../components/style-picker-icon-module/style-picker-icon-module';
import '../components/style-picker-pictogram-module/style-picker-pictogram-module';
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
  document
    .querySelector(`${clabsPrefix}-style-picker`)
    ?.toggleAttribute('open');
};

/**
 * Change color callback
 * @param {object} ev - custom event from color module
 */
const changeColor = (ev) => {
  const color = ev.detail.item;
  const tileEl = document.querySelector(`${carbonPrefix}-tile`);
  tileEl.style.borderColor = `${color.color}`;

  const colorModuleEl = ev.target;
  colorModuleEl.setAttribute('selected-item', color.value);
};

/**
 * Change icon callback
 * @param {object} ev - custom event from icon module
 */
const changeIcon = (ev) => {
  const item = ev.detail.item;
  const headerIconEl = document.getElementById('inline-tile-icon');
  const iconTemplate = item.renderIcon();
  const container = document.createElement('div');
  render(iconTemplate, container);
  headerIconEl.innerHTML = '';
  headerIconEl.appendChild(container.firstElementChild);

  const iconModuleEl = ev.target;
  iconModuleEl.setAttribute('selected-item', item.value);
};

/**
 * Change pictogram callback
 * @param {object} ev - custom event from color module
 */
const changePictogram = (ev) => {
  const pictogram = ev.detail.item;

  const colorModuleEl = ev.target;
  colorModuleEl.setAttribute('selected-item', pictogram.value);

  const pictogramHolderEl = document.getElementById('inline-tile-pictogram');
  const pictogramTemplate = renderCarbonPictogram(pictogram.pictogram);
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
  title: {
    control: 'text',
    description: 'style picker heading.',
  },
  align: {
    control: 'select',
    options: [...alignOptions],
    description: `Specify how the popover should align with the trigger element`,
  },
};

export const Color = {
  args: {
    title: 'Choose color',
    open: true,
    align: POPOVER_ALIGNMENT.LEFT_TOP,
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
            .align=${args.align}
            ?open=${args.open}
            .title=${args.title}>
            <cds-icon-button
              slot="trigger"
              .kind=${BUTTON_KIND.GHOST}
              @click="${toggleButton}">
              ${ColorPalette16({ slot: 'icon' })}
              <span slot="tooltip-content">Color palette</span>
            </cds-icon-button>
            <clabs-style-picker-modules slot="modules">
              <clabs-style-picker-color-module
                .title=${'Color'}
                .size=${'sm'}
                .items=${colors}
                .selectedItem=${'blue-60'}
                @clabs-style-picker-module-option-change=${(ev) =>
                  changeColor(ev)}></clabs-style-picker-color-module>
            </clabs-style-picker-modules>
          </clabs-style-picker>
          <cds-icon-button .kind=${BUTTON_KIND.GHOST}>
            ${TrashCan16({ slot: 'icon' })}
            <span slot="tooltip-content">Edit</span>
          </cds-icon-button>
          <cds-icon-button .kind=${BUTTON_KIND.GHOST}>
            ${OverflowMenuVertical16({ slot: 'icon' })}
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
    title: 'Choose icon',
    open: true,
    align: POPOVER_ALIGNMENT.LEFT_TOP,
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
            .align=${args.align}
            ?open=${args.open}
            .title=${args.title}>
            <cds-icon-button
              slot="trigger"
              .kind=${BUTTON_KIND.GHOST}
              @click="${toggleButton}">
              ${ColorPalette16({ slot: 'icon' })}
              <span slot="tooltip-content">Icon list</span>
            </cds-icon-button>
            <clabs-style-picker-modules slot="modules">
              <clabs-style-picker-icon-module
                .title=${'Icon'}
                .size=${'sm'}
                .items=${icons}
                .selectedItem=${'apple'}
                @clabs-style-picker-module-option-change=${(ev) =>
                  changeIcon(ev)}></clabs-style-picker-icon-module>
            </clabs-style-picker-modules>
          </clabs-style-picker>
          <cds-icon-button .kind=${BUTTON_KIND.GHOST}>
            ${TrashCan16({ slot: 'icon' })}
            <span slot="tooltip-content">Edit</span>
          </cds-icon-button>
          <cds-icon-button .kind=${BUTTON_KIND.GHOST}>
            ${OverflowMenuVertical16({ slot: 'icon' })}
            <span slot="tooltip-content">More</span>
          </cds-icon-button>
        </cds-layer>
        <div class="inline-tile-holder">
          <cds-tile class="inline-tile">
            <div class="inline-tile-header">
              <span id="inline-tile-icon">${icons[0].renderIcon()}</span>
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
    title: 'Choose pictogram',
    open: true,
    align: POPOVER_ALIGNMENT.LEFT_TOP,
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
            .align=${args.align}
            ?open=${args.open}
            .title=${args.title}>
            <cds-icon-button
              slot="trigger"
              .kind=${BUTTON_KIND.GHOST}
              @click="${toggleButton}">
              ${ColorPalette16({ slot: 'icon' })}
              <span slot="tooltip-content">Pictogram list</span>
            </cds-icon-button>
            <clabs-style-picker-modules slot="modules">
              <clabs-style-picker-pictogram-module
                .title=${'Pictogram'}
                .size=${'lg'}
                .items=${pictograms}
                .selectedItem=${'bangalore'}
                @clabs-style-picker-module-option-change=${(ev) =>
                  changePictogram(ev)}></clabs-style-picker-pictogram-module>
            </clabs-style-picker-modules>
          </clabs-style-picker>
          <cds-icon-button .kind=${BUTTON_KIND.GHOST}>
            ${TrashCan16({ slot: 'icon' })}
            <span slot="tooltip-content">Edit</span>
          </cds-icon-button>
          <cds-icon-button .kind=${BUTTON_KIND.GHOST}>
            ${OverflowMenuVertical16({ slot: 'icon' })}
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
