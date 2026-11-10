/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* ============================================================================
 * DataTable — Carbon v11's DataTable, its parts and its props, on the
 * SideNav's quiet colors (data-table.scss), with parts of the kit's own:
 * DataTable with select-all counted over the rows in view and `corners`
 * (square or rounded; TableContainer and Table follow it), Table in the
 * kit's Scroller, TableSelectRow / TableSelectAll on the kit's Checkbox
 * (parts.tsx), TableHeader's sort icon the motion icon SortDirection
 * (header.tsx), and the expandable rows (expand.tsx). Its loading state,
 * DataTableSkeleton (and DataTableReveal for a table whose body loads), is
 * here too (DataTableSkeleton.tsx), on the skeleton's blocks.
 * ========================================================================== */

export {
  TableActionList,
  TableBatchAction,
  TableBatchActions,
  TableBody,
  TableCell,
  TableDecoratorRow,
  TableHead,
  TableRow,
  TableToolbar,
  TableToolbarAction,
  TableToolbarContent,
  TableToolbarMenu,
  TableToolbarSearch,
} from '@carbon/react';
export {
  DataTable,
  Table,
  TableContainer,
  TableSelectAll,
  TableSelectRow,
  type DataTableCornersProps,
  type TableContainerProps,
  type TableProps,
  type TableSelectAllProps,
  type TableSelectRowProps,
} from './components/parts';
export { TableHeader, type TableHeaderProps } from './components/header';
export {
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  type TableExpandHeaderProps,
  type TableExpandRowProps,
  type TableExpandedRowProps,
} from './components/expand';
export type {
  DataTableCell,
  DataTableHeader,
  DataTableProps,
  DataTableRenderProps,
  DataTableRow,
  DataTableSize,
  DataTableSortState,
} from '@carbon/react';
export {
  DataTableReveal,
  DataTableRevealFollow,
  DataTableSkeleton,
} from './components/DataTableSkeleton';
export type {
  DataTableColumn,
  DataTableRevealFollower,
  DataTableRevealProps,
  DataTableRevealRow,
  DataTableSkeletonHeader,
  DataTableSkeletonProps,
} from './components/DataTableSkeleton';
