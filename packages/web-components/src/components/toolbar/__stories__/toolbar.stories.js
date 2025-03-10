/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import '../index.ts';
import '@carbon/web-components/es/components/dropdown/index.js';
import '@carbon/web-components/es/components/overflow-menu/index.js';

// icon imports
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
import ColorPalette from '@carbon/web-components/es/icons/color-palette/16.js';
import Draggable from '@carbon/web-components/es/icons/draggable/16.js';
import TextCreation from '@carbon/web-components/es/icons/text--creation/16.js';
import OpenPanelLeft from '@carbon/web-components/es/icons/open-panel--left/16.js';
import OpenPanelRight from '@carbon/web-components/es/icons/open-panel--right/16.js';
import Move from '@carbon/web-components/es/icons/move/16.js';
import Rotate from '@carbon/web-components/es/icons/rotate/16.js';
/**
 * More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
 */
export default {
  title: 'Components/Toolbar',
  component: 'clabs-toolbar',
  subcomponents: { ToolbarGroup: 'clabs-toolbar-group' },
};
const defaultArgs = {
  orientation: 'horizontal',
};

/* Default controls */
const defaultControls = {
  orientation: {
    control: { type: 'radio' },
    options: ['horizontal', 'vertical'],
    description: 'Toolbar orientation',
  }
};
export const horizontal = {
  args: defaultArgs,
  argTypes: defaultControls,

  /**
   * Renders the template for Storybook
   * @param {object} args Storybook arguments
   * @returns {TemplateResult<1>}
   */
  render: (args) =>
    html` <clabs-toolbar orientation=${args.orientation}>
      <clabs-toolbar-group orientation=${args.orientation}>
        <clabs-toolbar-button align=${args.orientation === 'vertical' ? 'right' : 'top'}>
          ${Save({ slot: 'icon' })}
          <span slot="tooltip-content">Save</span>
        </clabs-toolbar-button>
        <clabs-toolbar-button align=${args.orientation === 'vertical' ? 'right' : 'top'}>
          ${Share({ slot: 'icon' })}
          <span slot="tooltip-content">Share</span>
        </clabs-toolbar-button>
        <clabs-toolbar-button align=${args.orientation === 'vertical' ? 'right' : 'top'}>
          ${Upload({ slot: 'icon' })}
          <span slot="tooltip-content">Upload</span>
        </clabs-toolbar-button>
        <clabs-toolbar-button align=${args.orientation === 'vertical' ? 'right' : 'top'}>
          ${Printer({ slot: 'icon' })}
          <span slot="tooltip-content">Print</span>
        </clabs-toolbar-button>
      </clabs-toolbar-group>
      <clabs-toolbar-group orientation=${args.orientation}>
        <clabs-toolbar-button align=${args.orientation === 'vertical' ? 'right' : 'top'}>
          ${Undo({ slot: 'icon' })}
          <span slot="tooltip-content">Undo</span>
        </clabs-toolbar-button>
        <clabs-toolbar-button align=${args.orientation === 'vertical' ? 'right' : 'top'}>
          ${Redo({ slot: 'icon' })}
          <span slot="tooltip-content">Redo</span>
        </clabs-toolbar-button>
        <clabs-toolbar-button align=${args.orientation === 'vertical' ? 'right' : 'top'}>
          ${ZoomIn({ slot: 'icon' })}
          <span slot="tooltip-content">Zoom in</span>
        </clabs-toolbar-button>
        <clabs-toolbar-button align=${args.orientation === 'vertical' ? 'right' : 'top'}>
          ${ZoomOut({ slot: 'icon' })}
          <span slot="tooltip-content">Zoom out</span>
        </clabs-toolbar-button>
        <clabs-toolbar-button align=${args.orientation === 'vertical' ? 'right' : 'top'}>
          ${Minimize({ slot: 'icon' })}
          <span slot="tooltip-content">Minimize</span>
        </clabs-toolbar-button>
        <clabs-toolbar-button align=${args.orientation === 'vertical' ? 'right' : 'top'}>
          ${AlignHorizontalCenter({ slot: 'icon' })}
          <span slot="tooltip-content">Align center</span>
        </clabs-toolbar-button>
      </clabs-toolbar-group>
      <clabs-toolbar-group orientation=${args.orientation}>
        <clabs-toolbar-button align=${args.orientation === 'vertical' ? 'right' : 'top'}>
          ${RulerAlt({ slot: 'icon' })}
          <span slot="tooltip-content">Ruler</span>
        </clabs-toolbar-button>
        <clabs-toolbar-button align=${args.orientation === 'vertical' ? 'right' : 'top'}>
          ${Pin({ slot: 'icon' })}
          <span slot="tooltip-content">Pin</span>
        </clabs-toolbar-button>
        <clabs-toolbar-button align=${args.orientation === 'vertical' ? 'right' : 'top'}>
          ${CopyFile({ slot: 'icon' })}
          <span slot="tooltip-content">Copy file</span>
        </clabs-toolbar-button>
      </clabs-toolbar-group>
      <clabs-toolbar-group orientation=${args.orientation}>
        <cds-dropdown value="14">
          <cds-dropdown-item value="14">14</cds-dropdown-item>
          <cds-dropdown-item value="15">15</cds-dropdown-item>
          <cds-dropdown-item value="16">16</cds-dropdown-item>
          <cds-dropdown-item value="17">17</cds-dropdown-item>
        </cds-dropdown>
      </clabs-toolbar-group>
      <clabs-toolbar-group orientation=${args.orientation}>
        <clabs-toolbar-button caret align=${args.orientation === 'vertical' ? 'right' : 'top'}>
          ${TextAlignCenter({
            slot: 'icon',
            class: '.cds--btn--icon-only',
          })}
          <span slot="tooltip-content">Text align center</span>
        </clabs-toolbar-button>
      </clabs-toolbar-group>
      <clabs-toolbar-group orientation=${args.orientation}>
        <cds-overflow-menu enter-delay-ms="100" leave-delay-ms="100">
          ${OverflowMenuVertical({
            class: 'cds--overflow-menu__icon',
            slot: 'icon',
          })}
          <span slot="tooltip-content"> Options </span>
          <cds-overflow-menu-body ?flipped=${args.orientation === 'horizontal'}>
            <cds-overflow-menu-item>Color palette</cds-overflow-menu-item>
            <cds-overflow-menu-item>Text creation</cds-overflow-menu-item>
            <cds-overflow-menu-item>Bulleted list</cds-overflow-menu-item>
            <cds-overflow-menu-item divider danger
              >Delete app</cds-overflow-menu-item
            >
          </cds-overflow-menu-body>
        </cds-overflow-menu>
      </clabs-toolbar-group>
      <clabs-toolbar-group orientation=${args.orientation}>
        <clabs-toolbar-button align=${args.orientation === 'vertical' ? 'right' : 'top'}>
          ${Table({ slot: 'icon' })}
          <span slot="tooltip-content">Table</span>
        </clabs-toolbar-button>
        <clabs-toolbar-button align=${args.orientation === 'vertical' ? 'right' : 'top'}>
          ${SettingsAdjust({ slot: 'icon' })}
          <span slot="tooltip-content">Settings</span>
        </clabs-toolbar-button>
      </clabs-toolbar-group>
    </clabs-toolbar>`,
};


export const vertical = {
  args: { orientation: 'vertical' },
  argTypes: defaultControls,

  /**
   * Renders the template for Storybook
   * @param {object} args Storybook arguments
   * @returns {TemplateResult<1>}
   */
  render: (args) =>
    html` <clabs-toolbar orientation=${args.orientation}>
      <clabs-toolbar-group orientation=${args.orientation}>
        <clabs-toolbar-button align=${args.orientation === 'vertical' ? 'right' : 'top'}>
          ${Draggable({ slot: 'icon' })}
          <span slot="tooltip-content">Drag</span>
        </clabs-toolbar-button>
      </clabs-toolbar-group>
      <clabs-toolbar-group orientation=${args.orientation}>
        <clabs-toolbar-button align=${args.orientation === 'vertical' ? 'right' : 'top'}>
          ${RulerAlt({ slot: 'icon' })}
          <span slot="tooltip-content">Ruler</span>
        </clabs-toolbar-button>
        <clabs-toolbar-button align=${args.orientation === 'vertical' ? 'right' : 'top'}>
          ${Pin({ slot: 'icon' })}
          <span slot="tooltip-content">Pin</span>
        </clabs-toolbar-button>
        <clabs-toolbar-button caret align=${args.orientation === 'vertical' ? 'right' : 'top'}>
          ${ColorPalette({ slot: 'icon' })}
          <span slot="tooltip-content">Color palette</span>
        </clabs-toolbar-button>
        <clabs-toolbar-button align=${args.orientation === 'vertical' ? 'right' : 'top'}>
          ${TextCreation({ slot: 'icon' })}
          <span slot="tooltip-content">Text creation</span>
        </clabs-toolbar-button>
      </clabs-toolbar-group>
      <clabs-toolbar-group orientation=${args.orientation}>
        <clabs-toolbar-button align=${args.orientation === 'vertical' ? 'right' : 'top'}>
          ${OpenPanelLeft({ slot: 'icon' })}
          <span slot="tooltip-content">Open panel left</span>
        </clabs-toolbar-button>
        <clabs-toolbar-button align=${args.orientation === 'vertical' ? 'right' : 'top'}>
          ${OpenPanelRight({ slot: 'icon' })}
          <span slot="tooltip-content">Open panel right</span>
        </clabs-toolbar-button>
      </clabs-toolbar-group>
      <clabs-toolbar-group orientation=${args.orientation}>
        <clabs-toolbar-button align=${args.orientation === 'vertical' ? 'right' : 'top'}>
          ${Move({ slot: 'icon' })}
          <span slot="tooltip-content">Move</span>
        </clabs-toolbar-button>
        <clabs-toolbar-button align=${args.orientation === 'vertical' ? 'right' : 'top'}>
          ${Rotate({ slot: 'icon' })}
          <span slot="tooltip-content">Rotate</span>
        </clabs-toolbar-button>
      </clabs-toolbar-group>
      <clabs-toolbar-group orientation=${args.orientation}>
        <clabs-toolbar-button align=${args.orientation === 'vertical' ? 'right' : 'top'}>
          ${ZoomIn({ slot: 'icon' })}
          <span slot="tooltip-content">Zoom in</span>
        </clabs-toolbar-button>
        <clabs-toolbar-button align=${args.orientation === 'vertical' ? 'right' : 'top'}>
          ${ZoomOut({ slot: 'icon' })}
          <span slot="tooltip-content">Zoom out</span>
        </clabs-toolbar-button>
      </clabs-toolbar-group>
    </clabs-toolbar>`,
};

// need to find a better way to override the styles
window.customElements.whenDefined('cds-dropdown').then(() => {
  requestAnimationFrame(() => {
    const dropdown = document.querySelector('cds-dropdown');
    if (!dropdown) {
      return;
    }
      const shadowRoot = dropdown.shadowRoot;
      const listBox = shadowRoot?.querySelector('.cds--list-box');
      if (listBox) {
        listBox.style.borderBlockEnd = 'unset';
      }
  });
});
