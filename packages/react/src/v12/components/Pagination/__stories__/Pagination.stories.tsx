/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { Button } from '@carbon-labs/react-button';
import { Pagination } from '../index';
import type { PaginationProps } from '../index';
import mdx from './Pagination.mdx';

const SIZES = ['sm', 'md', 'lg'] as const;
const ALIGNS = ['top', 'bottom', 'left', 'right'];

export default {
  title: 'V12/Pagination',
  component: Pagination,
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'content-swap',
        'glide',
        'snap-floating',
        'rollover',
        'stillness',
      ],
      reduced: {
        'content-swap': 'at-once',
        glide: 'at-once',
        'snap-floating': 'at-once',
        rollover: 'at-once',
        stillness: 'at-once',
      },
      states: ['rest', 'hover', 'pressed', 'focus', 'disabled'],
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
    backwardTextTooltipPosition: { control: 'inline-radio', options: ALIGNS },
    forwardTextTooltipPosition: { control: 'inline-radio', options: ALIGNS },
    backwardText: { control: 'text' },
    forwardText: { control: 'text' },
    itemsPerPageText: { control: 'text' },
    itemText: { control: false },
    itemRangeText: { control: false },
    pageRangeText: { control: false },
    pageSelectLabelText: { control: false },
    pageText: { control: false },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
  },
};

const PAGE_SIZES = [10, 20, 30, 40, 50];

/** Room above the bar for the buttons' tooltips. */
const frame = { paddingBlockStart: 48 };

const column = { ...frame, display: 'grid', gap: 32 };

const row = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

/** A footer for 103 items, ten to a page. Step through the pages: the range and the page number swap, out then in. */
export const Default = {
  args: {
    page: 1,
    pageSize: 10,
    pageSizes: PAGE_SIZES,
    totalItems: 103,
    disabled: false,
    pageInputDisabled: false,
    pageSizeInputDisabled: false,
    pagesUnknown: false,
    isLastPage: false,
    backwardText: 'Previous page',
    forwardText: 'Next page',
    itemsPerPageText: 'Items per page:',
    backwardTextTooltipPosition: 'top',
    forwardTextTooltipPosition: 'top',
    timeScale: 1,
  },
  render: (args: PaginationProps) => (
    <div style={frame}>
      <Pagination {...args} />
    </div>
  ),
};

/** Controlled: the page comes from outside. The buttons jump to a page, and `onChange` reports each change. */
export const Controlled = {
  render: function ControlledStory() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const total = 245;
    const last = Math.ceil(total / pageSize);
    return (
      <div style={{ ...frame, display: 'grid', gap: 16 }}>
        <div style={row}>
          <Button size="sm" variant="outlined" onClick={() => setPage(1)}>
            First page
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setPage(Math.ceil(last / 2))}>
            Middle page
          </Button>
          <Button size="sm" variant="outlined" onClick={() => setPage(last)}>
            Last page
          </Button>
        </div>
        <Pagination
          page={page}
          pageSize={pageSize}
          pageSizes={PAGE_SIZES}
          totalItems={total}
          onChange={({ page: p, pageSize: s }) => {
            setPage(p);
            setPageSize(s);
          }}
        />
        <p style={{ margin: 0 }}>
          Page {page} of {last}, {pageSize} per page
        </p>
      </div>
    );
  },
};

/** Many pages: 10,000 items. The page select lists every page. */
export const ManyPages = {
  render: () => (
    <div style={frame}>
      <Pagination
        page={480}
        pageSize={20}
        pageSizes={[20, 50, 100]}
        totalItems={10000}
      />
    </div>
  ),
};

/** sm 32, md 40 (the default) and lg 48px. The controls inside are one size down. */
export const Sizes = {
  render: () => (
    <div style={column}>
      {SIZES.map((size) => (
        <Pagination
          key={size}
          size={size}
          pageSizes={PAGE_SIZES}
          totalItems={103}
        />
      ))}
    </div>
  ),
};

/** `disabled` turns off every control. `pageInputDisabled` and `pageSizeInputDisabled` turn off one select each. */
export const Disabled = {
  render: () => (
    <div style={column}>
      <Pagination disabled page={3} pageSizes={PAGE_SIZES} totalItems={103} />
      <Pagination
        page={3}
        pageSizes={PAGE_SIZES}
        totalItems={103}
        pageInputDisabled
      />
      <Pagination
        page={3}
        pageSizes={PAGE_SIZES}
        totalItems={103}
        pageSizeInputDisabled
      />
    </div>
  ),
};

/** `pagesUnknown`: no total, so no page select. "page 3" swaps along y, and forward stays on until `isLastPage`. */
export const PagesUnknown = {
  render: function PagesUnknownStory() {
    const [page, setPage] = useState(1);
    return (
      <div style={frame}>
        <Pagination
          pagesUnknown
          isLastPage={page === 8}
          page={page}
          pageSizes={PAGE_SIZES}
          onChange={({ page: p }) => setPage(p)}
        />
      </div>
    );
  },
};
