/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Fragment, useState, type ReactNode } from 'react';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { Button } from '@carbon-labs/react-button';
import { Checkbox } from '@carbon-labs/react-checkbox';
import { Play, Stop, TrashCan } from '@carbon-labs/react-motion-icons';
import {
  DataTable,
  DataTableReveal,
  DataTableSkeleton,
  Table,
  TableBatchAction,
  TableBatchActions,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  TableHead,
  TableHeader,
  TableRow,
  TableSelectAll,
  TableSelectRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
} from '../index';
import type {
  DataTableColumn,
  DataTableCornersProps,
  DataTableRenderProps,
  DataTableRevealRow,
  DataTableSize,
} from '../index';
import mdx from './DataTable.mdx';

const SIZES: DataTableSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

export default {
  title: 'V12/DataTable',
  component: DataTable,
  subcomponents: {
    Table,
    TableContainer,
    TableHeader,
    TableSelectAll,
    TableSelectRow,
    TableExpandHeader,
    TableExpandRow,
    TableExpandedRow,
    DataTableSkeleton,
    DataTableReveal,
  },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'expanding-row',
        'expand-all',
        'fills',
        'reveal',
        'reflow',
        'sort-icon',
      ],
      reduced: {
        'expanding-row': 'at-once',
        'expand-all': 'at-once',
        fills: 'at-once',
        reflow: 'shorter-clock',
        'sort-icon': 'at-once',
      },
      states: ['rest', 'hover', 'selected', 'expanded', 'focus'],
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
    corners: { control: 'inline-radio', options: ['square', 'rounded'] },
    rows: { control: false },
    headers: { control: false },
    children: { control: false },
    render: { control: false },
  },
};

interface Resource {
  id: string;
  name: string;
  region: string;
  status: string;
  instances: number;
}

const HEADERS = [
  { key: 'name', header: 'Name' },
  { key: 'region', header: 'Region' },
  { key: 'status', header: 'Status' },
  { key: 'instances', header: 'Instances' },
];

const REGIONS = ['North', 'South', 'East', 'West'];
const STATUSES = ['Active', 'Stopped', 'Pending'];

/** Made-up resources: a name, a region, a status and a count. */
const makeResources = (count: number): Resource[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `resource-${i + 1}`,
    name: `Resource ${String(i + 1).padStart(2, '0')}`,
    region: REGIONS[(i * 3) % REGIONS.length] ?? '',
    status: STATUSES[(i * 2) % STATUSES.length] ?? '',
    instances: ((i * 7) % 12) + 1,
  }));

const ROWS = makeResources(6);
const MANY = makeResources(23);

type RenderProps = DataTableRenderProps<Resource, ReactNode[]>;
type TableArgs = DataTableCornersProps & {
  size?: DataTableSize;
  useZebraStyles?: boolean;
  isSortable?: boolean;
};

const column = { display: 'grid', gap: 32 };

const row = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

/** The head and the rows, plain: one header cell per column, one cell per value. */
function PlainTable({
  rows,
  headers,
  getHeaderProps,
  getRowProps,
  getTableProps,
  title,
}: RenderProps & { title?: string }) {
  return (
    <TableContainer
      title={title ?? 'Resources'}
      description="Each resource, its region and its status">
      <Table {...getTableProps()} aria-label={title ?? 'Resources'}>
        <TableHead>
          <TableRow>
            {headers.map((header) => {
              const { key, ...props } = getHeaderProps({ header });
              return (
                <TableHeader key={key} {...props}>
                  {header.header}
                </TableHeader>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => {
            const { key, ...props } = getRowProps({ row: r });
            return (
              <TableRow key={key} {...props}>
                {r.cells.map((cell) => (
                  <TableCell key={cell.id}>{cell.value}</TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/** A table of resources: a title, a header row and the rows. Try the size, zebra stripes, sorting and corners. */
export const Default = {
  args: {
    useZebraStyles: false,
    isSortable: false,
  },
  render: (args: TableArgs) => (
    <DataTable {...args} rows={ROWS} headers={HEADERS}>
      {(rp: RenderProps) => <PlainTable {...rp} />}
    </DataTable>
  ),
};

/** `isSortable`: each header sorts its column, none to ascending to descending. The sort icon plays its change. */
export const Sortable = {
  render: () => (
    <DataTable rows={ROWS} headers={HEADERS} isSortable>
      {(rp: RenderProps) => <PlainTable {...rp} title="Sortable" />}
    </DataTable>
  ),
};

/** Select rows: the batch actions bar takes the toolbar's place. Select-all counts the rows in view. */
export const Selectable = {
  render: function SelectableStory() {
    const [last, setLast] = useState('none');
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        <DataTable rows={ROWS} headers={HEADERS}>
          {({
            rows,
            headers,
            getHeaderProps,
            getRowProps,
            getSelectionProps,
            getToolbarProps,
            getBatchActionProps,
            getTableProps,
            getTableContainerProps,
            onInputChange,
            selectedRows,
          }: RenderProps) => {
            const batch = getBatchActionProps();
            const note = (verb: string) => () =>
              setLast(`${verb}, ${selectedRows.length} selected`);
            return (
              <TableContainer
                title="Resources"
                description="Select resources to act on them together"
                {...getTableContainerProps()}>
                <TableToolbar
                  {...getToolbarProps()}
                  aria-label="Resource actions">
                  <TableBatchActions {...batch}>
                    <TableBatchAction renderIcon={Play} onClick={note('Start')}>
                      Start
                    </TableBatchAction>
                    <TableBatchAction renderIcon={Stop} onClick={note('Stop')}>
                      Stop
                    </TableBatchAction>
                    <TableBatchAction
                      renderIcon={TrashCan}
                      onClick={note('Delete')}>
                      Delete
                    </TableBatchAction>
                  </TableBatchActions>
                  <TableToolbarContent
                    aria-hidden={batch.shouldShowBatchActions || undefined}>
                    <TableToolbarSearch
                      persistent
                      tabIndex={batch.shouldShowBatchActions ? -1 : 0}
                      placeholder="Filter resources"
                      onChange={(e) => onInputChange(e)}
                    />
                  </TableToolbarContent>
                </TableToolbar>
                <Table {...getTableProps()} aria-label="Resources">
                  <TableHead>
                    <TableRow>
                      <TableSelectAll {...getSelectionProps()} />
                      {headers.map((header) => {
                        const { key, ...props } = getHeaderProps({ header });
                        return (
                          <TableHeader key={key} {...props}>
                            {header.header}
                          </TableHeader>
                        );
                      })}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((r) => {
                      const { key, ...props } = getRowProps({ row: r });
                      return (
                        <TableRow key={key} {...props}>
                          <TableSelectRow {...getSelectionProps({ row: r })} />
                          {r.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            );
          }}
        </DataTable>
        <p style={{ margin: 0 }}>Last action: {last}</p>
      </div>
    );
  },
};

/** Expandable rows: a row's details push the rows below open. The header's chevron opens or shuts them all as one motion. */
export const ExpandableRows = {
  render: () => (
    <DataTable rows={ROWS} headers={HEADERS}>
      {({
        rows,
        headers,
        getHeaderProps,
        getRowProps,
        getExpandHeaderProps,
        getExpandedRowProps,
        getTableProps,
      }: RenderProps) => (
        <TableContainer title="Resources" description="Open a row for details">
          <Table {...getTableProps()} aria-label="Resources">
            <TableHead>
              <TableRow>
                <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
                {headers.map((header) => {
                  const { key, ...props } = getHeaderProps({ header });
                  return (
                    <TableHeader key={key} {...props}>
                      {header.header}
                    </TableHeader>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => {
                const { key, ...props } = getRowProps({ row: r });
                return (
                  <Fragment key={key}>
                    <TableExpandRow {...props}>
                      {r.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableExpandRow>
                    <TableExpandedRow
                      colSpan={headers.length + 1}
                      {...getExpandedRowProps({ row: r })}>
                      <p style={{ margin: 0 }}>
                        {String(r.cells[0]?.value)} runs in the{' '}
                        {String(r.cells[1]?.value)} region. Its instances share
                        one network and one storage pool.
                      </p>
                    </TableExpandedRow>
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DataTable>
  ),
};

/** A toolbar with a search: typing filters the rows. The search has no fill at rest. */
export const WithSearch = {
  render: () => (
    <DataTable rows={MANY.slice(0, 10)} headers={HEADERS} isSortable>
      {({
        rows,
        headers,
        getHeaderProps,
        getRowProps,
        getToolbarProps,
        getTableProps,
        onInputChange,
      }: RenderProps) => (
        <TableContainer title="Resources">
          <TableToolbar {...getToolbarProps()} aria-label="Resource tools">
            <TableToolbarContent>
              <TableToolbarSearch
                persistent
                placeholder="Filter by name, region or status"
                onChange={(e) => onInputChange(e)}
              />
            </TableToolbarContent>
          </TableToolbar>
          <Table {...getTableProps()} aria-label="Resources">
            <TableHead>
              <TableRow>
                {headers.map((header) => {
                  const { key, ...props } = getHeaderProps({ header });
                  return (
                    <TableHeader key={key} {...props}>
                      {header.header}
                    </TableHeader>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => {
                const { key, ...props } = getRowProps({ row: r });
                return (
                  <TableRow key={key} {...props}>
                    {r.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DataTable>
  ),
};

/** Row heights: xs, sm, md, lg (the default) and xl. */
export const Sizes = {
  render: () => (
    <div style={column}>
      {SIZES.map((size) => (
        <DataTable
          key={size}
          rows={ROWS.slice(0, 3)}
          headers={HEADERS}
          size={size}>
          {(rp: RenderProps) => <PlainTable {...rp} title={`Size ${size}`} />}
        </DataTable>
      ))}
    </div>
  ),
};

/** `corners="rounded"`: 8px on the outer box, for a table inside a card or a rounded region. */
export const Rounded = {
  render: () => (
    <DataTable rows={ROWS} headers={HEADERS} corners="rounded" useZebraStyles>
      {(rp: RenderProps) => <PlainTable {...rp} title="Rounded, zebra" />}
    </DataTable>
  ),
};

/** DataTableSkeleton: Carbon's skeleton, every bar a block on the skeleton wave. Headers given are real labels. */
export const Skeleton = {
  render: () => (
    <div style={column}>
      <DataTableSkeleton
        headers={HEADERS.map(({ key, header }) => ({ key, header }))}
        columnCount={HEADERS.length}
        rowCount={4}
      />
      <DataTableSkeleton showHeader={false} showToolbar={false} rowCount={3} />
    </div>
  ),
};

const COLUMNS: DataTableColumn[] = [
  { key: 'name', header: 'Name', width: '35%', skeletonValue: 'Resource 00' },
  { key: 'region', header: 'Region', skeletonValue: 'North' },
  { key: 'status', header: 'Status', skeletonValue: 'Stopped' },
  { key: 'instances', header: 'Instances', width: '8rem', skeletonValue: '12' },
];

const asRows = (list: Resource[]): DataTableRevealRow[] =>
  list.map((r) => ({ ...r }));

/** DataTableReveal: the header and columns are there at once; the rows fade in as the skeleton dissolves. Load again, or filter by region: rows leave, the rest move, new ones fade in. */
export const Reveal = {
  render: function RevealStory() {
    const [loading, setLoading] = useState(true);
    const [region, setRegion] = useState<string | null>(null);
    const shown = MANY.slice(0, 12).filter(
      (r) => region === null || r.region === region
    );
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        <div style={row}>
          <Checkbox
            id="data-table-story-loading"
            labelText="Loading"
            checked={loading}
            onChange={(_e, { checked }) => setLoading(checked)}
          />
          <Button size="sm" variant="outlined" onClick={() => setRegion(null)}>
            All regions
          </Button>
          {REGIONS.map((r) => (
            <Button
              size="sm"
              variant="outlined"
              key={r}
              onClick={() => setRegion(r)}>
              {r}
            </Button>
          ))}
        </div>
        <DataTableReveal
          aria-label="Resources"
          loading={loading}
          columns={COLUMNS}
          rows={loading ? null : asRows(shown)}
          rowCount={6}
          isSelectable
          isSortable
        />
      </div>
    );
  },
};

const PAGE_SIZE = 5;

/** A table with a page control below it. `pageKey` tells DataTableReveal a new page is another set of rows: they are simply there. */
export const Paged = {
  render: function PagedStory() {
    const [page, setPage] = useState(1);
    const pages = Math.ceil(MANY.length / PAGE_SIZE);
    const first = (page - 1) * PAGE_SIZE;
    const shown = MANY.slice(first, first + PAGE_SIZE);
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        <DataTableReveal
          aria-label="Resources"
          loading={false}
          columns={COLUMNS}
          rows={asRows(shown)}
          pageKey={page}
          isSortable
        />
        <div style={row}>
          <Button
            size="sm"
            variant="outlined"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}>
            Previous page
          </Button>
          <Button
            size="sm"
            variant="outlined"
            disabled={page === pages}
            onClick={() => setPage((p) => p + 1)}>
            Next page
          </Button>
          <span>
            {first + 1}–{first + shown.length} of {MANY.length} resources, page{' '}
            {page} of {pages}
          </span>
        </div>
      </div>
    );
  },
};
