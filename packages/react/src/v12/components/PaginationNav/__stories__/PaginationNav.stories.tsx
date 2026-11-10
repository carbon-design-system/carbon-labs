/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Button } from '@carbon-labs/react-button';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { PaginationNav } from '../index';
import type { PaginationNavProps } from '../index';
import mdx from './PaginationNav.mdx';

const SIZES = ['sm', 'md', 'lg'] as const;

export default {
  title: 'V12/PaginationNav',
  component: PaginationNav,
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'selection-marker',
        'selection-gesture',
        'window-shift',
        'list-reflow-carry',
        'soft-edge',
        'snap-floating',
        'rollover',
        'stillness',
      ],
      reduced: {
        'selection-marker': 'shorter-clock',
        'window-shift': 'at-once',
        'list-reflow-carry': 'shorter-clock',
        'snap-floating': 'at-once',
        rollover: 'at-once',
        stillness: 'at-once',
      },
      states: ['rest', 'hover', 'pressed', 'selected', 'focus'],
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
    variant: { control: 'inline-radio', options: ['inverse', 'hero'] },
    tooltipAlignment: {
      control: 'inline-radio',
      options: ['start', 'center', 'end'],
    },
    tooltipPosition: {
      control: 'inline-radio',
      options: ['top', 'right', 'bottom', 'left'],
    },
    itemsShown: { control: { type: 'number', min: 4 } },
    motion: { control: false },
    translateWithId: { control: false },
  },
};

/** Room below the row for the buttons' tooltips. */
const frame = { paddingBlockEnd: 48 };

const column = { ...frame, display: 'grid', gap: 32, justifyItems: 'start' };

const row = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

/** Twenty pages, seven shown. Pick a page: the marker glides to it. Step past the window: the numbers slide along. */
export const Default = {
  args: {
    page: 0,
    totalItems: 20,
    itemsShown: 7,
    size: 'lg',
    variant: 'inverse',
    loop: false,
    disableOverflow: false,
    tooltipAlignment: 'center',
    tooltipPosition: 'bottom',
  },
  render: (args: PaginationNavProps) => (
    <div style={frame}>
      <PaginationNav {...args} />
    </div>
  ),
};

/** Controlled: the page comes from outside. The buttons jump, and `onChange` reports each pick. */
export const Controlled = {
  render: function ControlledStory() {
    const [page, setPage] = useState(0);
    const total = 30;
    return (
      <div
        style={{ ...frame, display: 'grid', gap: 16, justifyItems: 'start' }}>
        <div style={row}>
          <Button size="sm" variant="outlined" onClick={() => setPage(0)}>
            First page
          </Button>
          <Button size="sm" variant="outlined" onClick={() => setPage(14)}>
            Page 15
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setPage(total - 1)}>
            Last page
          </Button>
        </div>
        <PaginationNav
          page={page}
          totalItems={total}
          itemsShown={7}
          onChange={setPage}
        />
        <p style={{ margin: 0 }}>
          Page {page + 1} of {total}
        </p>
      </div>
    );
  },
};

/** Many pages: a "…" on each side of the window opens a list of the pages it hides. */
export const ManyPages = {
  render: () => (
    <div style={{ ...frame, paddingBlockEnd: 280 }}>
      <PaginationNav page={49} totalItems={100} itemsShown={9} />
    </div>
  ),
};

/** Few pages: when every page fits, there is no "…". */
export const FewPages = {
  render: () => (
    <div style={frame}>
      <PaginationNav page={1} totalItems={5} />
    </div>
  ),
};

/** sm 32, md 40 and lg 48px (the default). */
export const Sizes = {
  render: () => (
    <div style={column}>
      {SIZES.map((size) => (
        <PaginationNav
          key={size}
          size={size}
          page={4}
          totalItems={20}
          itemsShown={7}
        />
      ))}
    </div>
  ),
};

/** The marker's colors: `inverse`, the default, and `hero`, the brand blue. */
export const Variants = {
  render: () => (
    <div style={column}>
      {(['inverse', 'hero'] as const).map((variant) => (
        <PaginationNav
          key={variant}
          variant={variant}
          page={2}
          totalItems={12}
          itemsShown={7}
        />
      ))}
    </div>
  ),
};

/** `loop`: the buttons wrap round from the last page to the first and back. */
export const Loop = {
  render: () => (
    <div style={frame}>
      <PaginationNav loop page={0} totalItems={8} />
    </div>
  ),
};

/** `disableOverflow`: each "…" shows as a disabled control instead of a list. */
export const DisabledOverflow = {
  render: () => (
    <div style={frame}>
      <PaginationNav disableOverflow page={9} totalItems={20} itemsShown={7} />
    </div>
  ),
};
