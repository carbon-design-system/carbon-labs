/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FilterSummary } from '../components/FilterSummary';
import {
  applyFilters,
  countFilters,
  facetCounts,
  filtersInUse,
  sameFilters,
  type FilterSection,
  type FilterValues,
} from '../components/filters';

const SECTIONS: FilterSection[] = [
  {
    id: 'status',
    title: 'Status',
    type: 'checkbox',
    options: [{ value: 'Running' }, { value: 'Stopped' }, { value: 'Failed' }],
  },
  {
    id: 'region',
    title: 'Region',
    type: 'radio',
    options: [
      { value: 'us', label: 'US South' },
      { value: 'eu', label: 'EU' },
    ],
  },
  { id: 'size', title: 'Size', type: 'number', unit: 'GB' },
  { id: 'updated', title: 'Updated', type: 'date' },
];

interface Item {
  status: string;
  region: string;
  size: number;
  updated: string;
}
const ITEMS: Item[] = [
  { status: 'Running', region: 'us', size: 10, updated: '2001-10-01' },
  { status: 'Running', region: 'eu', size: 40, updated: '2001-10-10' },
  { status: 'Stopped', region: 'us', size: 80, updated: '2001-10-20' },
  { status: 'Failed', region: 'us', size: 20, updated: '2001-10-28' },
];
const get = (item: Item, id: string) => item[id as keyof Item];

describe('filtersInUse', () => {
  it('gives one tag per checked option, in the options’ order, and one per other section', () => {
    const values: FilterValues = {
      status: ['Failed', 'Running'],
      region: 'us',
      size: { min: 10, max: 50 },
      updated: { start: '2001-10-01' },
    };
    expect(filtersInUse(SECTIONS, values).map((f) => f.label)).toEqual([
      'Status: Running',
      'Status: Failed',
      'Region: US South',
      'Size: 10–50 GB',
      'Updated: From Oct 1, 2001',
    ]);
    expect(countFilters(SECTIONS, values)).toBe(5);
  });

  it('clears one filter at a time, dropping a section left empty', () => {
    const values: FilterValues = { status: ['Running'], size: { max: 50 } };
    const [running, size] = filtersInUse(SECTIONS, values);
    expect(size!.label).toBe('Size: 50 GB or less');
    expect(running!.clear(values)).toEqual({ size: { max: 50 } });
    expect(size!.clear(values)).toEqual({ status: ['Running'] });
  });

  it('treats the same options in another order as the same filters', () => {
    expect(
      sameFilters(
        SECTIONS,
        { status: ['Failed', 'Running'] },
        { status: ['Running', 'Failed'] }
      )
    ).toBe(true);
    expect(sameFilters(SECTIONS, { status: ['Failed'] }, {})).toBe(false);
  });
});

describe('applyFilters and facetCounts', () => {
  it('passes the items every section allows', () => {
    expect(
      applyFilters(
        ITEMS,
        SECTIONS,
        { region: 'us', size: { min: 15 } },
        get
      ).map((i) => i.size)
    ).toEqual([80, 20]);
    expect(
      applyFilters(
        ITEMS,
        SECTIONS,
        { updated: { start: '2001-10-05', end: '2001-10-20' } },
        get
      )
    ).toHaveLength(2);
    expect(applyFilters(ITEMS, SECTIONS, {}, get)).toHaveLength(4);
  });

  it('counts each option against every other section, so a count is what checking it adds', () => {
    const counts = facetCounts(
      ITEMS,
      SECTIONS,
      { status: ['Running'], region: 'us' },
      get
    );
    // Status ignores its own value: in us, 1 running, 1 stopped, 1 failed.
    expect(counts.status).toEqual({ Running: 1, Stopped: 1, Failed: 1 });
    // Region ignores its own: of the running ones, 1 in us and 1 in eu.
    expect(counts.region).toEqual({ us: 1, eu: 1 });
    expect(counts.size).toBeUndefined();
  });
});

describe('dates and odd option names', () => {
  it('compares dates by day: a datetime on the end day passes', () => {
    const at = [
      {
        status: 'Running',
        region: 'us',
        size: 1,
        updated: '2001-10-20T18:30:00Z',
      },
    ];
    expect(
      applyFilters(
        at,
        SECTIONS,
        { updated: { start: '2001-10-20', end: '2001-10-20' } },
        get
      )
    ).toHaveLength(1);
    expect(
      applyFilters(at, SECTIONS, { updated: { end: '2001-10-19' } }, get)
    ).toHaveLength(0);
  });

  it('counts an option named like an object key as any other', () => {
    const sections: FilterSection[] = [
      {
        id: 'tag',
        title: 'Tag',
        type: 'checkbox',
        options: [{ value: 'constructor' }, { value: 'toString' }],
      },
    ];
    const counts = facetCounts(
      [{ tag: 'constructor' }, { tag: 'valueOf' }],
      sections,
      {},
      (i, id) => i[id as 'tag']
    );
    expect({ ...counts.tag }).toEqual({ constructor: 1, toString: 0 });
  });
});

describe('FilterSummary', () => {
  it('shows each filter in use as a dismissible tag in a labelled set, and Clear filters', () => {
    const markup = renderToStaticMarkup(
      <FilterSummary
        sections={SECTIONS}
        values={{ status: ['Stopped'], region: 'eu' }}
        onChange={() => {}}
      />
    );
    expect(markup).toContain('class="cds-filter-summary"');
    expect(markup).toContain('aria-label="Filters in use"');
    expect(markup).toContain('Status: Stopped');
    expect(markup).toContain('Region: EU');
    expect(markup.match(/cds-dismissible-tag/g)?.length).toBeGreaterThanOrEqual(
      2
    );
    expect(markup).toContain('Clear filters');
  });

  it('renders nothing with no filter in use', () => {
    expect(
      renderToStaticMarkup(
        <FilterSummary sections={SECTIONS} values={{}} onChange={() => {}} />
      )
    ).toBe('');
  });
});
