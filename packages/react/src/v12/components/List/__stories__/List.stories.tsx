/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { ListItem, OrderedList, UnorderedList } from '../index';
import mdx from './List.mdx';

// A list is content: it has no motion, and reduced motion changes nothing.
export default {
  title: 'V12/List',
  component: UnorderedList,
  subcomponents: { OrderedList, ListItem },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: { motion: [], reduced: {}, states: ['rest'] },
  },
};

/** An unordered and an ordered list, each with a nested list. */
export const Default = {
  args: { isExpressive: false },
  render: ({ isExpressive }: { isExpressive?: boolean }) => (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <UnorderedList isExpressive={isExpressive}>
        <ListItem>Unordered item</ListItem>
        <ListItem>
          Unordered item
          <UnorderedList nested>
            <ListItem>Nested item</ListItem>
            <ListItem>Nested item</ListItem>
          </UnorderedList>
        </ListItem>
        <ListItem>Unordered item</ListItem>
      </UnorderedList>
      <OrderedList isExpressive={isExpressive}>
        <ListItem>Ordered item</ListItem>
        <ListItem>
          Ordered item
          <OrderedList nested>
            <ListItem>Nested item</ListItem>
            <ListItem>Nested item</ListItem>
          </OrderedList>
        </ListItem>
        <ListItem>Ordered item</ListItem>
      </OrderedList>
    </div>
  ),
};
