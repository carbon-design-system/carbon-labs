/**
 * @license
 *
 * Copyright IBM Corp. 2019, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import { boolean, select, text } from '@storybook/addon-knobs';
import { prefix } from '../../../globals/settings';
import { TABLE_SIZE } from '../table';
import Add from '@carbon/web-components/es/icons/add/16';
import Save from '@carbon/web-components/es/icons/save/16';
import TrashCan from '@carbon/web-components/es/icons/trash-can/16';
// @ts-ignore
import Download16 from '@carbon/web-components/es/icons/download/16';
// @ts-ignore
import Settings16 from '@carbon/web-components/es/icons/settings/16';
import '../index';
import storyDocs from './data-table-story.mdx';

const sizes = {
  [`xs (${TABLE_SIZE.XS})`]: TABLE_SIZE.XS,
  [`sm (${TABLE_SIZE.SM})`]: TABLE_SIZE.SM,
  [`md (${TABLE_SIZE.MD})`]: TABLE_SIZE.MD,
  [`lg (${TABLE_SIZE.LG} - default)`]: TABLE_SIZE.LG,
  [`xl (${TABLE_SIZE.XL})`]: TABLE_SIZE.XL,
};

let headerCount = 6;
let rowCount = 1;

const insertInRandomPosition = (array, element) => {
  const index = Math.floor(Math.random() * (array.length + 1));
  return [...array.slice(0, index), element, ...array.slice(index)];
};

const addRow = () => {
  const newRow = document.createElement('c4ai-table-row');

  const templateRow = {
    name: `New Row ${rowCount}`,
    protocol: 'HTTP',
    port: rowCount * 100,
    rule: rowCount % 2 === 0 ? 'Round robin' : 'DNS delegation',
    attached_groups: `Row ${rowCount}'s VM Groups`,
    status: 'Starting',
  };

  for (let key in templateRow) {
    if (Object.prototype.hasOwnProperty.call(templateRow, key)) {
      const cell = document.createElement('c4ai-table-cell');
      cell.textContent = templateRow[key];
      newRow.appendChild(cell);
    }
  }

  const rows = document.querySelectorAll('c4ai-table-row');
  const diff = headerCount - Object.keys(templateRow).length;

  [...Array(diff)].forEach(() => {
    const newCell = document.createElement('c4ai-table-cell');
    newCell.textContent = `Header ${headerCount - 1}`;
    newRow.appendChild(newCell);
  });

  newRow.setAttribute('selection-name', `${rows.length}`);

  const updatedRows = insertInRandomPosition([...rows], newRow);
  updatedRows.forEach((e) => {
    document.querySelector('c4ai-table-body')!.insertBefore(e, null);
  });

  rowCount++;
};

const addHeader = () => {
  const headerRow = document.querySelector('c4ai-table-header-row');
  const newHeader = document.createElement('c4ai-table-header-cell');
  newHeader.textContent = `Header ${headerCount}`;
  headerRow?.appendChild(newHeader);

  const rows = document.querySelectorAll('c4ai-table-row');
  rows.forEach((e) => {
    const newCell = document.createElement('c4ai-table-cell');
    newCell.textContent = `Header ${headerCount}`;
    e.appendChild(newCell);
  });
  headerCount++;
};

export const Default = () => {
  return html`
    <c4ai-table>
      <c4ai-table-header-title slot="title">DataTable</c4ai-table-header-title>
      <c4ai-table-header-description slot="description"
        >Use the toolbar menu to add rows and headers</c4ai-table-header-description
      >

      <c4ai-table-toolbar slot="toolbar">
        <c4ai-table-batch-actions ?active="true">
          <c4ai-button tooltip-position="bottom" tooltip-text="Add"
            >${Add({ slot: 'icon' })}</c4ai-button
          >
          <c4ai-button tooltip-position="bottom" tooltip-text="Save"
            >${Save({ slot: 'icon' })}</c4ai-button
          >
          <c4ai-button>${Save({ slot: 'icon' })}</c4ai-button>
          <c4ai-button href="javascript:void 0" download="table-data.json">
            Download ${Download16({ slot: 'icon' })}
          </c4ai-button>
        </c4ai-table-batch-actions>
        <c4ai-table-toolbar-content ?has-batch-actions="true">
          <c4ai-table-toolbar-search placeholder="Filter table"></c4ai-table-toolbar-search>
          <c4ai-overflow-menu toolbar-action>
            ${Settings16({
              slot: 'icon',
              class: `${prefix}--overflow-menu__icon`,
            })}
            <c4ai-overflow-menu-body flipped>
              <c4ai-overflow-menu-item @click=${addRow}>Add row</c4ai-overflow-menu-item>
              <c4ai-overflow-menu-item @click=${addHeader}>Add header</c4ai-overflow-menu-item>
            </c4ai-overflow-menu-body>
          </c4ai-overflow-menu>
        </c4ai-table-toolbar-content>
      </c4ai-table-toolbar>

      <c4ai-table-head>
        <c4ai-table-header-row selection-name="header">
          <c4ai-table-header-cell>Name</c4ai-table-header-cell>
          <c4ai-table-header-cell>Protocol</c4ai-table-header-cell>
          <c4ai-table-header-cell>Port</c4ai-table-header-cell>
          <c4ai-table-header-cell>Rule</c4ai-table-header-cell>
          <c4ai-table-header-cell>Attached groups</c4ai-table-header-cell>
          <c4ai-table-header-cell>Status</c4ai-table-header-cell>
        </c4ai-table-header-row>
      </c4ai-table-head>
      <c4ai-table-body>
        <c4ai-table-row selection-name="0">
          <c4ai-table-cell>Load Balancer 3</c4ai-table-cell>
          <c4ai-table-cell>HTTP</c4ai-table-cell>
          <c4ai-table-cell>3000</c4ai-table-cell>
          <c4ai-table-cell>Round robin</c4ai-table-cell>
          <c4ai-table-cell>Kevin's VM Groups</c4ai-table-cell>
          <c4ai-table-cell><c4ai-link disabled>Disabled</c4ai-link></c4ai-table-cell>
        </c4ai-table-row>
        <c4ai-table-row selection-name="1">
          <c4ai-table-cell>Load Balancer 1</c4ai-table-cell>
          <c4ai-table-cell>HTTP</c4ai-table-cell>
          <c4ai-table-cell>443</c4ai-table-cell>
          <c4ai-table-cell>Round robin</c4ai-table-cell>
          <c4ai-table-cell>Maureen's VM Groups</c4ai-table-cell>
          <c4ai-table-cell><c4ai-link>Starting</c4ai-link></c4ai-table-cell>
        </c4ai-table-row>
        <c4ai-table-row selection-name="2">
          <c4ai-table-cell>Load Balancer 2</c4ai-table-cell>
          <c4ai-table-cell>HTTP</c4ai-table-cell>
          <c4ai-table-cell>80</c4ai-table-cell>
          <c4ai-table-cell>DNS delegation</c4ai-table-cell>
          <c4ai-table-cell>Andrew's VM Groups</c4ai-table-cell>
          <c4ai-table-cell><c4ai-link>Active</c4ai-link></c4ai-table-cell>
        </c4ai-table-row>
        <c4ai-table-row selection-name="3">
          <c4ai-table-cell>Load Balancer 6</c4ai-table-cell>
          <c4ai-table-cell>HTTP</c4ai-table-cell>
          <c4ai-table-cell>3000</c4ai-table-cell>
          <c4ai-table-cell>Round robin</c4ai-table-cell>
          <c4ai-table-cell>Marc's VM Groups</c4ai-table-cell>
          <c4ai-table-cell><c4ai-link disabled>Disabled</c4ai-link></c4ai-table-cell>
        </c4ai-table-row>
        <c4ai-table-row selection-name="4">
          <c4ai-table-cell>Load Balancer 4</c4ai-table-cell>
          <c4ai-table-cell>HTTP</c4ai-table-cell>
          <c4ai-table-cell>443</c4ai-table-cell>
          <c4ai-table-cell>Round robin</c4ai-table-cell>
          <c4ai-table-cell>Mel's VM Groups</c4ai-table-cell>
          <c4ai-table-cell><c4ai-link>Starting</c4ai-link></c4ai-table-cell>
        </c4ai-table-row>
        <c4ai-table-row selection-name="5">
          <c4ai-table-cell>Load Balancer 5</c4ai-table-cell>
          <c4ai-table-cell>HTTP</c4ai-table-cell>
          <c4ai-table-cell>80</c4ai-table-cell>
          <c4ai-table-cell>DNS delegation</c4ai-table-cell>
          <c4ai-table-cell>Ronja's VM Groups</c4ai-table-cell>
          <c4ai-table-cell><c4ai-link>Active</c4ai-link></c4ai-table-cell>
        </c4ai-table-row>
      </c4ai-table-body>
    </c4ai-table>
  `;
};

export const Playground = {
  render: (args) => {
    const { isSortable, locale, radio, size, useStaticWidth, useZebraStyles } =
      args?.[`${prefix}-table`] ?? {};
    return html`
      <c4ai-table
        expandable
        ?is-sortable=${isSortable}
        locale="${locale}"
        ?radio=${radio}
        size="${size}"
        ?use-static-width="${useStaticWidth}"
        ?use-zebra-styles="${useZebraStyles}"
      >
        <c4ai-table-header-title slot="title">DataTable</c4ai-table-header-title>
        <c4ai-table-header-description slot="description"
          >Use the toolbar menu to add rows and headers</c4ai-table-header-description
        >

        <c4ai-table-toolbar slot="toolbar">
          <c4ai-table-batch-actions ?active="true">
            <c4ai-button>Delete ${TrashCan({ slot: 'icon' })}</c4ai-button>
            <c4ai-button>Save ${Save({ slot: 'icon' })}</c4ai-button>
            <c4ai-button href="javascript:void 0" download="table-data.json">
              Download ${Download16({ slot: 'icon' })}
            </c4ai-button>
          </c4ai-table-batch-actions>
          <c4ai-table-toolbar-content ?has-batch-actions="true">
            <c4ai-table-toolbar-search placeholder="Filter table"></c4ai-table-toolbar-search>
            <c4ai-overflow-menu toolbar-action>
              ${Settings16({
                slot: 'icon',
                class: `${prefix}--overflow-menu__icon`,
              })}
              <c4ai-overflow-menu-body flipped>
                <c4ai-overflow-menu-item @click=${addRow}>Add row</c4ai-overflow-menu-item>
                <c4ai-overflow-menu-item @click=${addHeader}>Add header</c4ai-overflow-menu-item>
              </c4ai-overflow-menu-body>
            </c4ai-overflow-menu>
          </c4ai-table-toolbar-content>
        </c4ai-table-toolbar>

        <c4ai-table-head>
          <c4ai-table-header-row selection-name="header">
            <c4ai-table-header-cell>Name</c4ai-table-header-cell>
            <c4ai-table-header-cell>Protocol</c4ai-table-header-cell>
            <c4ai-table-header-cell>Port</c4ai-table-header-cell>
            <c4ai-table-header-cell>Rule</c4ai-table-header-cell>
            <c4ai-table-header-cell>Attached groups</c4ai-table-header-cell>
            <c4ai-table-header-cell>Status</c4ai-table-header-cell>
          </c4ai-table-header-row>
        </c4ai-table-head>
        <c4ai-table-body>
          <c4ai-table-row selection-name="0">
            <c4ai-table-cell>Load Balancer 3</c4ai-table-cell>
            <c4ai-table-cell>HTTP</c4ai-table-cell>
            <c4ai-table-cell>3000</c4ai-table-cell>
            <c4ai-table-cell>Round robin</c4ai-table-cell>
            <c4ai-table-cell>Kevin's VM Groups</c4ai-table-cell>
            <c4ai-table-cell><c4ai-link disabled>Disabled</c4ai-link></c4ai-table-cell>
          </c4ai-table-row>
          <c4ai-table-expanded-row>
            <h6>Expandable row content</h6>
            <div>Description here</div>
          </c4ai-table-expanded-row>
          <c4ai-table-row selection-name="1">
            <c4ai-table-cell>Load Balancer 1</c4ai-table-cell>
            <c4ai-table-cell>HTTP</c4ai-table-cell>
            <c4ai-table-cell>443</c4ai-table-cell>
            <c4ai-table-cell>Round robin</c4ai-table-cell>
            <c4ai-table-cell>Maureen's VM Groups</c4ai-table-cell>
            <c4ai-table-cell><c4ai-link>Starting</c4ai-link></c4ai-table-cell>
          </c4ai-table-row>
          <c4ai-table-expanded-row>
            <h6>Expandable row content</h6>
            <div>Description here</div>
          </c4ai-table-expanded-row>
          <c4ai-table-row selection-name="2">
            <c4ai-table-cell>Load Balancer 2</c4ai-table-cell>
            <c4ai-table-cell>HTTP</c4ai-table-cell>
            <c4ai-table-cell>80</c4ai-table-cell>
            <c4ai-table-cell>DNS delegation</c4ai-table-cell>
            <c4ai-table-cell>Andrew's VM Groups</c4ai-table-cell>
            <c4ai-table-cell><c4ai-link>Active</c4ai-link></c4ai-table-cell>
          </c4ai-table-row>
          <c4ai-table-expanded-row>
            <h6>Expandable row content</h6>
            <div>Description here</div>
          </c4ai-table-expanded-row>
          <c4ai-table-row selection-name="3">
            <c4ai-table-cell>Load Balancer 6</c4ai-table-cell>
            <c4ai-table-cell>HTTP</c4ai-table-cell>
            <c4ai-table-cell>3000</c4ai-table-cell>
            <c4ai-table-cell>Round robin</c4ai-table-cell>
            <c4ai-table-cell>Marc's VM Groups</c4ai-table-cell>
            <c4ai-table-cell><c4ai-link disabled>Disabled</c4ai-link></c4ai-table-cell>
          </c4ai-table-row>
          <c4ai-table-expanded-row>
            <h6>Expandable row content</h6>
            <div>Description here</div>
          </c4ai-table-expanded-row>
          <c4ai-table-row selection-name="4">
            <c4ai-table-cell>Load Balancer 4</c4ai-table-cell>
            <c4ai-table-cell>HTTP</c4ai-table-cell>
            <c4ai-table-cell>443</c4ai-table-cell>
            <c4ai-table-cell>Round robin</c4ai-table-cell>
            <c4ai-table-cell>Mel's VM Groups</c4ai-table-cell>
            <c4ai-table-cell><c4ai-link>Starting</c4ai-link></c4ai-table-cell>
          </c4ai-table-row>
          <c4ai-table-expanded-row>
            <h6>Expandable row content</h6>
            <div>Description here</div>
          </c4ai-table-expanded-row>
          <c4ai-table-row selection-name="5">
            <c4ai-table-cell>Load Balancer 5</c4ai-table-cell>
            <c4ai-table-cell>HTTP</c4ai-table-cell>
            <c4ai-table-cell>80</c4ai-table-cell>
            <c4ai-table-cell>DNS delegation</c4ai-table-cell>
            <c4ai-table-cell>Ronja's VM Groups</c4ai-table-cell>
            <c4ai-table-cell><c4ai-link>Active</c4ai-link></c4ai-table-cell>
          </c4ai-table-row>
          <c4ai-table-expanded-row>
            <h6>Expandable row content</h6>
            <div>Description here</div>
          </c4ai-table-expanded-row>
        </c4ai-table-body>
      </c4ai-table>
    `;
  },

  parameters: {
    knobs: {
      [`${prefix}-table`]: () => ({
        isSortable: boolean('Is sortable', false),
        locale: text('Locale', 'en'),
        radio: boolean('Radio', false),
        size: select('Size', sizes, TABLE_SIZE.LG),
        useStaticWidth: boolean('Use static width', false),
        useZebraStyles: boolean('Use zebra styles', false),
      }),
    },
  },
};

export default {
  title: 'Forked Components/DataTable/Dynamic',
  parameters: {
    ...storyDocs.parameters,
  },
};
