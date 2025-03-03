/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
// import { CLABSToolbar, CLABSToolbarGroup } from '../components/toolbar/toolbar';
// import CDSButton from '@carbon/web-components/es/components/button/button.js';
import '@carbon/web-components/es/components/dropdown/index.js';
import '@carbon/web-components/es/components/overflow-menu/index.js';

import Save from '@carbon/web-components/es/icons/save/16.js';
import Share from '@carbon/web-components/es/icons/share/16.js';
import Upload from '@carbon/web-components/es/icons/upload/16.js';
import Printer from '@carbon/web-components/es/icons/printer/16.js';
import Undo from '@carbon/web-components/es/icons/undo/16.js';
import Redo from '@carbon/web-components/es/icons/redo/16.js';
import ZoomIn from '@carbon/web-components/es/icons/zoom--in/16.js';
import ZoomOut from '@carbon/web-components/es/icons/zoom--out/16.js';
import Minimize from '@carbon/web-components/es/icons/minimize/16.js';
import AlignHorizontalCenter from '@carbon/web-components/es/icons/align--horizontal-center/16.js';
import RulerAlt from '@carbon/web-components/es/icons/ruler--alt/16.js';
import Pin from '@carbon/web-components/es/icons/pin/16.js';
import CopyFile from '@carbon/web-components/es/icons/copy--file/16.js';
import TextAlignCenter from '@carbon/web-components/es/icons/text--align--center/16.js';
import Table from '@carbon/web-components/es/icons/table/16.js';
import SettingsAdjust from '@carbon/web-components/es/icons/settings--adjust/16.js';
import OverflowMenuVertical from '@carbon/web-components/es/icons/overflow-menu--vertical/16.js';

/**
 * More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
 */
export default {
  title: 'Components/Toolbar',
  component: 'clabs-toolbar',
  subcomponents: { ToolbarGroup: 'clabs-toolbar-group' },
};

/**
 * More on writing stories with args: https://storybook.js.org/docs/web-components/writing-stories/args
 *
 * @type {{args: {vertical: boolean}, render: (function(*): TemplateResult<1>)}}
 */
export const Default = {
  args: {
    vertical: false,
  },

  /**
   * Renders the template for Storybook
   * @param {object} args Storybook arguments
   * @returns {TemplateResult<1>}
   */
  render: (args) =>
    html` <clabs-toolbar ?vertical=${args.vertical}>
      <clabs-toolbar-group ?vertical=${args.vertical}>
        <cds-button size="md" kind="ghost">
          ${Save({ slot: 'icon' })}
        </cds-button>
        <cds-button size="md" kind="ghost">
          ${Share({ slot: 'icon' })}
        </cds-button>
        <cds-button size="md" kind="ghost">
          ${Upload({ slot: 'icon' })}
        </cds-button>
        <cds-button size="md" kind="ghost">
          ${Printer({ slot: 'icon' })}
        </cds-button>
      </clabs-toolbar-group>
      <clabs-toolbar-group ?vertical=${args.vertical}>
        <cds-button size="md" kind="ghost">
          ${Undo({ slot: 'icon' })}
        </cds-button>
        <cds-button size="md" kind="ghost">
          ${Redo({ slot: 'icon' })}
        </cds-button>
        <cds-button size="md" kind="ghost">
          ${ZoomIn({ slot: 'icon' })}
        </cds-button>
        <cds-button size="md" kind="ghost">
          ${ZoomOut({ slot: 'icon' })}
        </cds-button>
        <cds-button size="md" kind="ghost">
          ${Minimize({ slot: 'icon' })}
        </cds-button>
        <cds-button size="md" kind="ghost">
          ${AlignHorizontalCenter({ slot: 'icon' })}
        </cds-button>
      </clabs-toolbar-group>
      <clabs-toolbar-group ?vertical=${args.vertical}>
        <cds-button size="md" kind="ghost">
          ${RulerAlt({ slot: 'icon' })}
        </cds-button>
        <cds-button size="md" kind="ghost">
          ${Pin({ slot: 'icon' })}
        </cds-button>
        <cds-button size="md" kind="ghost">
          ${CopyFile({ slot: 'icon' })}
        </cds-button>
      </clabs-toolbar-group>
      <clabs-toolbar-group ?vertical=${args.vertical}>
        <cds-dropdown value="14">
          <cds-dropdown-item value="14">14</cds-dropdown-item>
          <cds-dropdown-item value="15">15</cds-dropdown-item>
          <cds-dropdown-item value="16">16</cds-dropdown-item>
          <cds-dropdown-item value="17">17</cds-dropdown-item>
        </cds-dropdown>
      </clabs-toolbar-group>
      <clabs-toolbar-group ?vertical=${args.vertical}>
        <cds-button size="md" kind="ghost">
          ${TextAlignCenter({
            slot: 'icon',
            class: '.cds--btn--icon-only',
          })}
        </cds-button>
      </clabs-toolbar-group>
      <clabs-toolbar-group ?vertical=${args.vertical}>
        <cds-overflow-menu>
          ${OverflowMenuVertical({
            class: 'cds--overflow-menu__icon',
            slot: 'icon',
          })}
          <span slot="tooltip-content"> Options </span>
          <cds-overflow-menu-body flipped>
            <cds-overflow-menu-item>Color palette</cds-overflow-menu-item>
            <cds-overflow-menu-item>Text creation</cds-overflow-menu-item>
            <cds-overflow-menu-item>Bulleted list</cds-overflow-menu-item>
            <cds-overflow-menu-item divider danger
              >Delete app</cds-overflow-menu-item
            >
          </cds-overflow-menu-body>
        </cds-overflow-menu>
      </clabs-toolbar-group>
      <clabs-toolbar-group ?vertical=${args.vertical}>
        <cds-button size="md" kind="ghost">
          ${Table({ slot: 'icon' })}
        </cds-button>
        <cds-button size="md" kind="ghost">
          ${SettingsAdjust({ slot: 'icon' })}
        </cds-button>
      </clabs-toolbar-group>
    </clabs-toolbar>`,
};

// will find a better way to override the styles
window.customElements.whenDefined('cds-dropdown').then(() => {
  requestAnimationFrame(() => {
    const dropdown = document.querySelector('cds-dropdown');
    if (!dropdown) {
      return;
    }
    const shadowRoot = dropdown.shadowRoot;
    const listBox = shadowRoot?.querySelector('.cds--list-box');
    console.log('listBox', listBox);
    if (listBox) {
      listBox.style.borderBlockEnd = 'unset';
    }
  });
});
window.customElements.whenDefined('cds-button').then(() => {
  requestAnimationFrame(() => {
    const buttons = document.querySelectorAll('cds-button');
    console.log('buttons', buttons);

    buttons.forEach((button) => {
      const shadowRoot = button.shadowRoot;
      const buttonEl = shadowRoot?.querySelector('.cds--btn--icon-only');
      buttonEl.style.color = 'var(--cds-icon-primary, #161616)';
    });
  });
});
