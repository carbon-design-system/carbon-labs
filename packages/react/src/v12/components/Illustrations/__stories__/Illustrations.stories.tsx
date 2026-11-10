/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { HiddenLines, box, isoAt, type Layer } from '../index';
import mdx from './Illustrations.mdx';

export default {
  title: 'V12/Illustrations',
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [],
      reduced: {},
      states: ['rest'],
    },
  },
};

const iso = isoAt(60, 70);

/** Two stacked boxes; the upper one hides the lines behind it. */
const draw = (): Layer[] => [
  box(iso, [-30, 30], [-30, 30], [0, 20]),
  box(iso, [-15, 15], [-15, 15], [20, 45]),
];

export const Default = {
  render: () => (
    <svg
      viewBox="0 0 120 120"
      width={240}
      height={240}
      fill="none"
      stroke="currentColor"
      strokeWidth={1}>
      <HiddenLines draw={draw} kind="stack" />
    </svg>
  ),
};
