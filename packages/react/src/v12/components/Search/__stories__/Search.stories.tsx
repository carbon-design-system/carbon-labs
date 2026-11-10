/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import type { CSSProperties } from 'react';
import { Button } from '@carbon-labs/react-button';
import { ExpandableSearch, Search, SearchSkeleton } from '../index';
import type { SearchProps, SearchSize } from '../index';
import mdx from './Search.mdx';

const SIZES: SearchSize[] = ['xs', 'sm', 'md', 'lg'];

export default {
  title: 'V12/Search',
  component: Search,
  subcomponents: { ExpandableSearch, SearchSkeleton },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'expand',
        'content-with-the-opening',
        'soft-edge',
        'fill-and-hairline',
        'clear-button-in',
        'clear-button-out',
        'hover',
        'rollover',
        'outline-ladder',
      ],
      reduced: {
        expand: 'at-once',
        'content-with-the-opening': 'shorter-clock',
        'fill-and-hairline': 'shorter-clock',
        'clear-button-in': 'shorter-clock',
        'clear-button-out': 'shorter-clock',
        rollover: 'at-once',
        'outline-ladder': 'shorter-clock',
      },
      states: [
        'rest',
        'hover',
        'focus',
        'typed',
        'disabled',
        'readOnly',
        'collapsed',
        'expanded',
      ],
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
    corners: {
      control: 'inline-radio',
      options: ['rounded', 'full', 'square'],
    },
    frame: { control: 'inline-radio', options: ['inset', 'ghost'] },
    variant: { control: 'inline-radio', options: ['neutral', 'hero'] },
    labelText: { control: 'text' },
    renderIcon: { control: false },
    light: { control: false },
    role: { control: false },
  },
};

/** A column of fields, with room below for the clear button's tooltip. */
const form = {
  display: 'grid',
  gap: 24,
  maxInlineSize: 320,
  paddingBlockEnd: 48,
};

const row = {
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

/** One search. Hover the field to play the magnifier; type to bring in the clear button. */
export const Default = {
  args: {
    id: 'search-default',
    labelText: 'Search',
    placeholder: 'Search',
    closeButtonLabelText: 'Clear search input',
    frame: 'inset',
    variant: 'neutral',
    disabled: false,
    readOnly: false,
  },
  render: (args: SearchProps) => (
    <div style={form}>
      <Search {...args} />
    </div>
  ),
};

/** The four sizes: xs 24, sm 32, md 40 and lg 48px. The icons are 16px, and 20px at lg. */
export const Sizes = {
  render: () => (
    <div style={form}>
      {SIZES.map((size) => (
        <Search
          key={size}
          id={`search-size-${size}`}
          labelText={`Search, size ${size}`}
          placeholder={`Size ${size}`}
          size={size}
        />
      ))}
    </div>
  ),
};

/** A typed value, disabled, read-only, the ghost frame, the hero focus edge and full corners. Disabled and read-only have no clear button. */
export const States = {
  render: () => (
    <div style={form}>
      <Search
        id="search-value"
        labelText="Search with a value"
        defaultValue="quarterly report"
      />
      <Search
        id="search-disabled"
        labelText="Disabled search"
        defaultValue="quarterly report"
        disabled
      />
      <Search
        id="search-readonly"
        labelText="Read-only search"
        defaultValue="quarterly report"
        readOnly
      />
      <Search id="search-ghost" labelText="Ghost search" frame="ghost" />
      <Search id="search-hero" labelText="Hero search" variant="hero" />
      <Search id="search-full" labelText="Search, full" corners="full" />
    </div>
  ),
};

/** Fill and clear the value: the clear button grows in about its center, and leaves one step faster. Typing never moves it. Escape clears too. */
export const ClearButton = {
  render: function ClearButtonStory() {
    const [value, setValue] = useState('');
    return (
      <div style={{ display: 'grid', gap: 24 }}>
        <div style={row}>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setValue('release notes')}>
            Fill
          </Button>
          <Button size="sm" variant="outlined" onClick={() => setValue('')}>
            Clear
          </Button>
        </div>
        <div style={form}>
          <Search
            id="search-clear"
            labelText="Search documents"
            placeholder="Search documents"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
      </div>
    );
  },
};

/** The open width of an expandable search: set where it sits. */
const expandRow = {
  ...row,
  '--cds-search-expanded-inline-size': '320px',
  minBlockSize: 48,
  paddingBlockEnd: 48,
} as CSSProperties;

/** ExpandableSearch: press the magnifier and the field grows from its box, the content coming in with the opening. Empty it and leave, or press Escape in the empty field, and it closes back into the button. */
export const Expandable = {
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} style={expandRow}>
          <ExpandableSearch
            id={`search-expandable-${size}`}
            labelText={`Search, size ${size}`}
            placeholder="Search"
            size={size}
          />
          <span>Results</span>
        </div>
      ))}
    </div>
  ),
};

/** SearchSkeleton: the field is one block of its own box and corners. */
export const Skeleton = {
  render: () => (
    <div style={form}>
      <SearchSkeleton />
      <SearchSkeleton small />
      <SearchSkeleton size="lg" corners="full" />
    </div>
  ),
};
