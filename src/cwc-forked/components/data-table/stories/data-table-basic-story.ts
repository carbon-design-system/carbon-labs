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
import '../index';
import storyDocs from './data-table-story.mdx';

const sizes = {
  [`xs (${TABLE_SIZE.XS})`]: TABLE_SIZE.XS,
  [`sm (${TABLE_SIZE.SM})`]: TABLE_SIZE.SM,
  [`md (${TABLE_SIZE.MD})`]: TABLE_SIZE.MD,
  [`lg (${TABLE_SIZE.LG} - default)`]: TABLE_SIZE.LG,
  [`xl (${TABLE_SIZE.XL})`]: TABLE_SIZE.XL,
};

export const Default = () => {
  return html`
    <c4ai-table>
      <c4ai-table-head>
        <c4ai-table-header-row>
          <c4ai-table-header-cell>Name</c4ai-table-header-cell>
          <c4ai-table-header-cell>Rule</c4ai-table-header-cell>
          <c4ai-table-header-cell>Status</c4ai-table-header-cell>
          <c4ai-table-header-cell>Other</c4ai-table-header-cell>
          <c4ai-table-header-cell>Example</c4ai-table-header-cell>
        </c4ai-table-header-row>
      </c4ai-table-head>
      <c4ai-table-body>
        <c4ai-table-row>
          <c4ai-table-cell>Load Balancer 1</c4ai-table-cell>
          <c4ai-table-cell>Round robin</c4ai-table-cell>
          <c4ai-table-cell>Starting</c4ai-table-cell>
          <c4ai-table-cell>Test</c4ai-table-cell>
          <c4ai-table-cell>22</c4ai-table-cell>
        </c4ai-table-row>
        <c4ai-table-row>
          <c4ai-table-cell>Load Balancer 2</c4ai-table-cell>
          <c4ai-table-cell>DNS delegation</c4ai-table-cell>
          <c4ai-table-cell>Active</c4ai-table-cell>
          <c4ai-table-cell>Test</c4ai-table-cell>
          <c4ai-table-cell>22</c4ai-table-cell>
        </c4ai-table-row>
        <c4ai-table-row>
          <c4ai-table-cell>Load Balancer 3</c4ai-table-cell>
          <c4ai-table-cell>Round robin</c4ai-table-cell>
          <c4ai-table-cell>Disabled</c4ai-table-cell>
          <c4ai-table-cell>Test</c4ai-table-cell>
          <c4ai-table-cell>22</c4ai-table-cell>
        </c4ai-table-row>
        <c4ai-table-row>
          <c4ai-table-cell>Load Balancer 4</c4ai-table-cell>
          <c4ai-table-cell>Round robin</c4ai-table-cell>
          <c4ai-table-cell>Disabled</c4ai-table-cell>
          <c4ai-table-cell>Test</c4ai-table-cell>
          <c4ai-table-cell>22</c4ai-table-cell>
        </c4ai-table-row>
        <c4ai-table-row>
          <c4ai-table-cell>Load Balancer 5</c4ai-table-cell>
          <c4ai-table-cell>Round robin</c4ai-table-cell>
          <c4ai-table-cell>Disabled</c4ai-table-cell>
          <c4ai-table-cell>Test</c4ai-table-cell>
          <c4ai-table-cell>22</c4ai-table-cell>
        </c4ai-table-row>
        <c4ai-table-row>
          <c4ai-table-cell>Load Balancer 6</c4ai-table-cell>
          <c4ai-table-cell>Round robin</c4ai-table-cell>
          <c4ai-table-cell>Disabled</c4ai-table-cell>
          <c4ai-table-cell>Test</c4ai-table-cell>
          <c4ai-table-cell>22</c4ai-table-cell>
        </c4ai-table-row>
        <c4ai-table-row>
          <c4ai-table-cell>Load Balancer 7</c4ai-table-cell>
          <c4ai-table-cell>Round robin</c4ai-table-cell>
          <c4ai-table-cell>Disabled</c4ai-table-cell>
          <c4ai-table-cell>Test</c4ai-table-cell>
          <c4ai-table-cell>22</c4ai-table-cell>
        </c4ai-table-row>
      </c4ai-table-body>
    </c4ai-table>
  `;
};

export const XLWithTwoLines = () => {
  return html`
    <c4ai-table size="xl">
      <c4ai-table-head>
        <c4ai-table-header-row>
          <c4ai-table-header-cell>Name</c4ai-table-header-cell>
          <c4ai-table-header-cell>Rule</c4ai-table-header-cell>
          <c4ai-table-header-cell>Status</c4ai-table-header-cell>
          <c4ai-table-header-cell>Other</c4ai-table-header-cell>
          <c4ai-table-header-cell>Example</c4ai-table-header-cell>
        </c4ai-table-header-row>
      </c4ai-table-head>
      <c4ai-table-body>
        <c4ai-table-row>
          <c4ai-table-cell>
            Load Balancer 1
            <c4ai-table-cell-content>Austin, Tx</c4ai-table-cell-content>
          </c4ai-table-cell>
          <c4ai-table-cell>Round robin</c4ai-table-cell>
          <c4ai-table-cell>Starting</c4ai-table-cell>
          <c4ai-table-cell>Test</c4ai-table-cell>
          <c4ai-table-cell>22</c4ai-table-cell>
        </c4ai-table-row>
        <c4ai-table-row>
          <c4ai-table-cell
            >Load Balancer 2
            <c4ai-table-cell-content>Austin, Tx</c4ai-table-cell-content>
          </c4ai-table-cell>
          <c4ai-table-cell>DNS delegation</c4ai-table-cell>
          <c4ai-table-cell>Active</c4ai-table-cell>
          <c4ai-table-cell>Test</c4ai-table-cell>
          <c4ai-table-cell>22</c4ai-table-cell>
        </c4ai-table-row>
        <c4ai-table-row>
          <c4ai-table-cell
            >Load Balancer 3
            <c4ai-table-cell-content>Austin, Tx</c4ai-table-cell-content>
          </c4ai-table-cell>
          <c4ai-table-cell>Round robin</c4ai-table-cell>
          <c4ai-table-cell>Disabled</c4ai-table-cell>
          <c4ai-table-cell>Test</c4ai-table-cell>
          <c4ai-table-cell>22</c4ai-table-cell>
        </c4ai-table-row>
        <c4ai-table-row>
          <c4ai-table-cell
            >Load Balancer 4
            <c4ai-table-cell-content>Austin, Tx</c4ai-table-cell-content>
          </c4ai-table-cell>
          <c4ai-table-cell>Round robin</c4ai-table-cell>
          <c4ai-table-cell>Disabled</c4ai-table-cell>
          <c4ai-table-cell>Test</c4ai-table-cell>
          <c4ai-table-cell>22</c4ai-table-cell>
        </c4ai-table-row>
        <c4ai-table-row>
          <c4ai-table-cell
            >Load Balancer 5
            <c4ai-table-cell-content>Austin, Tx</c4ai-table-cell-content>
          </c4ai-table-cell>
          <c4ai-table-cell>Round robin</c4ai-table-cell>
          <c4ai-table-cell>Disabled</c4ai-table-cell>
          <c4ai-table-cell>Test</c4ai-table-cell>
          <c4ai-table-cell>22</c4ai-table-cell>
        </c4ai-table-row>
        <c4ai-table-row>
          <c4ai-table-cell
            >Load Balancer 6
            <c4ai-table-cell-content>Austin, Tx</c4ai-table-cell-content>
          </c4ai-table-cell>
          <c4ai-table-cell>Round robin</c4ai-table-cell>
          <c4ai-table-cell>Disabled</c4ai-table-cell>
          <c4ai-table-cell>Test</c4ai-table-cell>
          <c4ai-table-cell>22</c4ai-table-cell>
        </c4ai-table-row>
        <c4ai-table-row>
          <c4ai-table-cell
            >Load Balancer 7
            <c4ai-table-cell-content>Austin, Tx</c4ai-table-cell-content>
          </c4ai-table-cell>
          <c4ai-table-cell>Round robin</c4ai-table-cell>
          <c4ai-table-cell>Disabled</c4ai-table-cell>
          <c4ai-table-cell>Test</c4ai-table-cell>
          <c4ai-table-cell>22</c4ai-table-cell>
        </c4ai-table-row>
      </c4ai-table-body>
    </c4ai-table>
  `;
};

export const Playground = {
  render: (args) => {
    const { locale, size, useStaticWidth, useZebraStyles } = args?.[`${prefix}-table`] ?? {};
    return html`
      <c4ai-table
        locale="${locale}"
        size="${size}"
        ?use-static-width="${useStaticWidth}"
        ?use-zebra-styles="${useZebraStyles}"
      >
        <c4ai-table-head>
          <c4ai-table-header-row>
            <c4ai-table-header-cell>Name</c4ai-table-header-cell>
            <c4ai-table-header-cell>Rule</c4ai-table-header-cell>
            <c4ai-table-header-cell>Status</c4ai-table-header-cell>
            <c4ai-table-header-cell>Other</c4ai-table-header-cell>
            <c4ai-table-header-cell>Example</c4ai-table-header-cell>
          </c4ai-table-header-row>
        </c4ai-table-head>
        <c4ai-table-body>
          <c4ai-table-row>
            <c4ai-table-cell>Load Balancer 1</c4ai-table-cell>
            <c4ai-table-cell>Round robin</c4ai-table-cell>
            <c4ai-table-cell>Starting</c4ai-table-cell>
            <c4ai-table-cell>Test</c4ai-table-cell>
            <c4ai-table-cell>22</c4ai-table-cell>
          </c4ai-table-row>
          <c4ai-table-row>
            <c4ai-table-cell>Load Balancer 2</c4ai-table-cell>
            <c4ai-table-cell>DNS delegation</c4ai-table-cell>
            <c4ai-table-cell>Active</c4ai-table-cell>
            <c4ai-table-cell>Test</c4ai-table-cell>
            <c4ai-table-cell>22</c4ai-table-cell>
          </c4ai-table-row>
          <c4ai-table-row>
            <c4ai-table-cell>Load Balancer 3</c4ai-table-cell>
            <c4ai-table-cell>Round robin</c4ai-table-cell>
            <c4ai-table-cell>Disabled</c4ai-table-cell>
            <c4ai-table-cell>Test</c4ai-table-cell>
            <c4ai-table-cell>22</c4ai-table-cell>
          </c4ai-table-row>
          <c4ai-table-row>
            <c4ai-table-cell>Load Balancer 4</c4ai-table-cell>
            <c4ai-table-cell>Round robin</c4ai-table-cell>
            <c4ai-table-cell>Disabled</c4ai-table-cell>
            <c4ai-table-cell>Test</c4ai-table-cell>
            <c4ai-table-cell>22</c4ai-table-cell>
          </c4ai-table-row>
          <c4ai-table-row>
            <c4ai-table-cell>Load Balancer 5</c4ai-table-cell>
            <c4ai-table-cell>Round robin</c4ai-table-cell>
            <c4ai-table-cell>Disabled</c4ai-table-cell>
            <c4ai-table-cell>Test</c4ai-table-cell>
            <c4ai-table-cell>22</c4ai-table-cell>
          </c4ai-table-row>
          <c4ai-table-row>
            <c4ai-table-cell>Load Balancer 6</c4ai-table-cell>
            <c4ai-table-cell>Round robin</c4ai-table-cell>
            <c4ai-table-cell>Disabled</c4ai-table-cell>
            <c4ai-table-cell>Test</c4ai-table-cell>
            <c4ai-table-cell>22</c4ai-table-cell>
          </c4ai-table-row>
          <c4ai-table-row>
            <c4ai-table-cell>Load Balancer 7</c4ai-table-cell>
            <c4ai-table-cell>Round robin</c4ai-table-cell>
            <c4ai-table-cell>Disabled</c4ai-table-cell>
            <c4ai-table-cell>Test</c4ai-table-cell>
            <c4ai-table-cell>22</c4ai-table-cell>
          </c4ai-table-row>
        </c4ai-table-body>
      </c4ai-table>
    `;
  },

  parameters: {
    knobs: {
      [`${prefix}-table`]: () => ({
        locale: text('Locale', 'en'),
        size: select('Size', sizes, TABLE_SIZE.LG),
        useStaticWidth: boolean('Use static width', false),
        useZebraStyles: boolean('Use zebra styles', false),
      }),
    },
  },
};

export default {
  title: 'Forked Components/DataTable/Basic',
  parameters: {
    ...storyDocs.parameters,
  },
};
