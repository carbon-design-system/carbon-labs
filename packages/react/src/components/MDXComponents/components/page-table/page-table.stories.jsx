/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { PageTable } from './page-table';

const stories = {
  title: 'MDX Components/Markdown/PageTable',
  component: PageTable,
  argTypes: {
    children: {
      control: false
    }
  }
}

export default stories

const Template = (args) => (
  <PageTable {...args}>
    <thead>
      <tr>
        <th>Header 1</th>
        <th>Header 2</th>
        <th>Header 3</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Cell 1-1</td>
        <td>Cell 1-2</td>
        <td>Cell 1-3</td>
      </tr>
      <tr>
        <td>Cell 2-1</td>
        <td>Cell 2-2</td>
        <td>Cell 2-3</td>
      </tr>
    </tbody>
  </PageTable>
)

export const Default = Template.bind({})
Default.args = {}
