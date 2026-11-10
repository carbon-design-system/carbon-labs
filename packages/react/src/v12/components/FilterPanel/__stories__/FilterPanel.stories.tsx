/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Button } from '@carbon-labs/react-button';
import { Filter } from '@carbon-labs/react-motion-icons';
import { RollText } from '@carbon-labs/react-roll-text';
import { Tag } from '@carbon-labs/react-tag';
import { PageHeader } from '@carbon-labs/react-page-header';
import { EmptyState } from '@carbon-labs/react-empty-state';
import { DataTableReveal } from '@carbon-labs/react-data-table';
import type {
  DataTableColumn,
  DataTableRevealRow,
} from '@carbon-labs/react-data-table';
import {
  FilterPanel,
  FilterSummary,
  applyFilters,
  countFilters,
  facetCounts,
  isoDay,
} from '../index';
import type { FilterSection, FilterUpdateMethod, FilterValues } from '../index';
import mdx from './FilterPanel.mdx';

export default {
  title: 'V12/FilterPanel',
  component: FilterPanel,
  subcomponents: { FilterSummary },
  tags: ['alpha'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'disclosure',
        'the-panel-s-snap-and-push',
        'content-movement-in-place',
        'list-presence',
        'the-tags-snap-from-below',
        'removal',
        'room',
      ],
      reduced: {
        disclosure: 'at-once',
        'the-panel-s-snap-and-push': 'shorter-clock',
        'content-movement-in-place': 'at-once',
        'list-presence': 'at-once',
        'the-tags-snap-from-below': 'at-once',
        removal: 'at-once',
        room: 'at-once',
      },
      states: ['closed', 'open'],
    },
  },
};

/* ── a deployments page, the same every time ──────────────────────────── */

const STATUSES = ['Running', 'Deploying', 'Stopped', 'Failed'];
const REGIONS = ['us-south', 'us-east', 'eu-de', 'eu-gb', 'jp-tok', 'au-syd'];
const APPS = ['checkout', 'catalog', 'search', 'auth', 'billing', 'reports'];
const ENVS = ['prod', 'staging', 'dev'];

interface Deployment {
  name: string;
  app: string;
  env: string;
  status: string;
  region: string;
  /** Hours since the last update. */
  hours: number;
  /** The day of the last update. */
  day: string;
}

/** The dates count back from a fixed day. */
const FIXED_DAY = new Date(2026, 9, 29);

const DEPLOYMENTS: Deployment[] = Array.from({ length: 36 }, (_, i) => {
  const app = APPS[i % APPS.length];
  const env = ENVS[Math.floor(i / APPS.length) % ENVS.length];
  const minutes = ((i * 37) % 1440) + 2;
  return {
    name: `${app}-${env}-${Math.floor(i / (APPS.length * ENVS.length)) + 1}`,
    app,
    env,
    status:
      i % 11 === 3
        ? 'Failed'
        : i % 7 === 5
          ? 'Stopped'
          : i % 5 === 2
            ? 'Deploying'
            : 'Running',
    region: REGIONS[(i * 5) % REGIONS.length],
    hours: Math.round(minutes / 60),
    day: isoDay(new Date(FIXED_DAY.getTime() - minutes * 60_000 * 20)),
  };
});

const field = (d: Deployment, id: string): string | number =>
  id === 'date' ? d.day : (d[id as keyof Deployment] as string | number);

const values = (list: readonly string[]) => list.map((value) => ({ value }));

const SECTIONS: FilterSection[] = [
  {
    id: 'status',
    title: 'Status',
    type: 'checkbox',
    options: values(STATUSES),
  },
  {
    id: 'region',
    title: 'Region',
    type: 'checkbox',
    options: values(REGIONS),
  },
  { id: 'app', title: 'App', type: 'checkbox', options: values(APPS) },
  {
    id: 'env',
    title: 'Environment',
    type: 'radio',
    options: [
      { value: 'prod', label: 'Production' },
      { value: 'staging', label: 'Staging' },
      { value: 'dev', label: 'Development' },
    ],
  },
  {
    id: 'hours',
    title: 'Hours since update',
    type: 'number',
    min: 0,
    max: 24,
    unit: 'h',
  },
  { id: 'date', title: 'Updated', type: 'date' },
];

const counts = (v: FilterValues) =>
  facetCounts(DEPLOYMENTS, SECTIONS, v, field);
const matching = (v: FilterValues) =>
  applyFilters(DEPLOYMENTS, SECTIONS, v, field);
const deployments = (n: number) =>
  n === 1 ? '1 deployment' : `${n} deployments`;

const STATUS_TAG: Record<string, 'green' | 'blue' | 'gray' | 'red'> = {
  Running: 'green',
  Deploying: 'blue',
  Stopped: 'gray',
  Failed: 'red',
};
const ENV_NAME: Record<string, string> = {
  prod: 'Production',
  staging: 'Staging',
  dev: 'Development',
};
const ago = (h: number) =>
  h === 0 ? 'Just now' : h === 1 ? '1 hour ago' : `${h} hours ago`;

const COLUMNS: DataTableColumn[] = [
  { key: 'name', header: 'Name', width: '28%', minWidth: '10rem' },
  { key: 'status', header: 'Status', width: '16%', minWidth: '7rem' },
  { key: 'region', header: 'Region', width: '16%', minWidth: '6rem' },
  { key: 'env', header: 'Environment', width: '18%', minWidth: '7rem' },
  { key: 'hours', header: 'Updated', minWidth: '7rem' },
];

const toRow = (d: Deployment): DataTableRevealRow => ({
  id: d.name,
  name: d.name,
  status: d.status,
  region: d.region,
  env: ENV_NAME[d.env],
  hours: d.hours,
  cells: [
    d.name,
    <Tag key="status" type={STATUS_TAG[d.status]}>
      {d.status}
    </Tag>,
    d.region,
    ENV_NAME[d.env],
    ago(d.hours),
  ],
});

/** The story fills the screen: the page, and the panel beside or over it. */
const screen: CSSProperties = {
  position: 'relative',
  display: 'flex',
  overflow: 'hidden',
  blockSize: '100vh',
};

const page: CSSProperties = {
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  minInlineSize: 0,
  overflow: 'auto',
};

const body: CSSProperties = {
  display: 'grid',
  gap: 16,
  alignContent: 'start',
  padding: '0 32px 32px',
};

function Page({
  id,
  updateMethod = 'batch',
  over = false,
  initial = {},
}: {
  id: string;
  updateMethod?: FilterUpdateMethod;
  over?: boolean;
  initial?: FilterValues;
}) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>(initial);
  const launcher = useRef<HTMLElement>(null);
  const rows = matching(filters);
  const inUse = countFilters(SECTIONS, filters);
  return (
    <div style={screen}>
      <div style={page} id={`${id}-page`}>
        <PageHeader
          frame="ghost"
          title="Deployments"
          subtitle="Every app, in every region and environment."
        />
        <div style={body}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              ref={launcher}
              variant="outlined"
              size="sm"
              renderIcon={Filter}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}>
              <RollText
                text={inUse ? `Filters (${inUse})` : 'Filters'}
                order={inUse}
              />
            </Button>
            <span style={{ color: 'var(--cds-text-secondary)' }}>
              {deployments(rows.length)}
            </span>
          </div>
          <FilterSummary
            sections={SECTIONS}
            values={filters}
            onChange={setFilters}
            returnFocusRef={launcher}
          />
          {rows.length ? (
            <DataTableReveal
              aria-label="Deployments"
              loading={false}
              columns={COLUMNS}
              rows={rows.map(toRow)}
              rowCount={rows.length}
              isSortable
            />
          ) : (
            <EmptyState
              kind="not-found"
              context="table"
              title="No deployments match"
              subtitle="Change the filters, or clear them."
              action={{ text: 'Clear filters', onClick: () => setFilters({}) }}
            />
          )}
        </div>
      </div>
      <FilterPanel
        scope="container"
        frame="inset"
        size="sm"
        slideIn={!over}
        selectorPageContent={over ? undefined : `#${id}-page`}
        open={open}
        onRequestClose={() => setOpen(false)}
        launcherButtonRef={launcher}
        updateMethod={updateMethod}
        sections={SECTIONS}
        values={filters}
        onChange={setFilters}
        counts={counts}
        resultCount={(v) => matching(v).length}
        resultLabel={deployments}
      />
    </div>
  );
}

/** Open Filters: the panel opens beside the list and pushes it over. Pick some options, then Apply. Cancel or Escape drops them. The count on each option updates as you pick. */
export const Default = {
  render: () => <Page id="fp-default" />,
};

/** Every pick applies at once: the list, the counts and the tags above the list follow it. */
export const Instant = {
  render: () => <Page id="fp-instant" updateMethod="instant" />,
};

/** The panel opens over the list, for a page with no room beside it. */
export const Over = {
  render: () => <Page id="fp-over" over />,
};

/** Starts with filters applied, shown as tags above the list. Remove one and the rest close the gap. Clear filters removes them all. */
export const Applied = {
  render: () => (
    <Page
      id="fp-applied"
      initial={{ status: ['Running', 'Failed'], region: ['eu-de'] }}
    />
  ),
};
