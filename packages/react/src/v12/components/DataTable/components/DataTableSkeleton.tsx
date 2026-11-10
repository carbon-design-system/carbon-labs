/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type RefObject,
  type TableHTMLAttributes,
} from 'react';
import { BACKDROP, LOADING_MOTION, useStagger } from '@carbon-labs/v12-motion';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';

import {
  useSkeletonReveal,
  type RevealPhase,
} from '@carbon-labs/react-feedback';
import { useSkeletonBlocks } from '@carbon-labs/react-feedback';
import { SkeletonRun } from '@carbon-labs/react-feedback';
import { usePreviousCommit } from '@carbon-labs/react-feedback';
import { Scroller } from '@carbon-labs/react-scroller';
import {
  TABLE_SIZES,
  useContainerCorners,
  useDefaultSize,
  type ContainerCorners,
} from '@carbon-labs/react-kit-defaults';
import { TableSelectAll, TableSelectRow } from './parts';
import { TableHeader } from './header';
import { useFilterPresence } from '@carbon-labs/react-contained-list';
import type { NodeRef } from '@carbon-labs/react-util';
import '@carbon-labs/react-feedback/scss/skeleton/skeleton.scss';
// The table's quiet colours (header on the panel, rows on the hairline), so
// the skeleton matches the kit's DataTable it stands in for.
import './data-table.scss';

/* ============================================================================
 * DataTableSkeleton
 * ============================================================================
 *
 * Carbon v11's DataTableSkeleton — the same props and markup (the header's
 * title and description, the toolbar with its button, `rowCount` ×
 * `columnCount` cells, `headers` as real labels) — with every bar a
 * skeleton-wave block. The table's own layout is v11's data table classes
 * (row heights by `size`, `zebra`); only `cds--skeleton` is left off, so
 * nothing runs v11's shimmer. Rows hold still on hover, as v11's skeleton.
 * ========================================================================== */

export interface DataTableSkeletonHeader {
  header: ReactNode;
  key?: string;
}

export interface DataTableSkeletonProps extends TableHTMLAttributes<HTMLTableElement> {
  /** Optionally specify how many columns your data table should have. Default 5. */
  columnCount?: number;
  /** Optionally specify the displayed headers. */
  headers?: DataTableSkeletonHeader[];
  /** Optionally specify how many rows your data table should have. Default 5. */
  rowCount?: number;
  /** Optionally specify whether you want the data table header. Default true. */
  showHeader?: boolean;
  /** Optionally specify whether you want the data table toolbar. Default true. */
  showToolbar?: boolean;
  /** Optionally specify the size of the data table. Default `lg`. */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Optionally specify whether the data table should be zebra striped. */
  zebra?: boolean;
  /** Specify an optional className to add (on the table, as v11). */
  className?: string;
}

export function DataTableSkeleton({
  headers,
  rowCount = 5,
  columnCount = 5,
  zebra = false,
  className,
  showHeader = true,
  showToolbar = true,
  size: sizeProp,
  ...rest
}: DataTableSkeletonProps) {
  // KitDefaults: the provider's size when none is given.
  const size = useDefaultSize(sizeProp, TABLE_SIZES, 'lg');
  const ref = useRef<HTMLDivElement>(null);
  useSkeletonBlocks(ref);
  const columns = Array.from({ length: columnCount }, (_, i) => i);
  const tableClass = [
    className,
    'cds--data-table',
    `cds--data-table--${size}`,
    zebra && 'cds--data-table--zebra',
    'fb-skeleton-table__table',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div ref={ref} className="cds--data-table-container fb-skeleton-table">
      {showHeader ? (
        <div className="cds--data-table-header">
          <div
            className="fb-skeleton fb-skeleton-table__title"
            data-skeleton=""
            aria-hidden="true"
          />
          <div
            className="fb-skeleton fb-skeleton-table__description"
            data-skeleton=""
            aria-hidden="true"
          />
        </div>
      ) : null}
      {showToolbar ? (
        <section aria-label="data table toolbar" className="cds--table-toolbar">
          <div className="cds--toolbar-content">
            <span
              className="fb-skeleton fb-skeleton-table__button"
              data-skeleton=""
              aria-hidden="true"
            />
          </div>
        </section>
      ) : null}
      {/* In the kit's Scroller, as the DataTable's Table: a wide skeleton scrolls
          in place instead of widening the page. */}
      <Scroller axis="x" className="cds-data-table__scroller">
        <table className={tableClass} {...rest}>
          <thead>
            <tr>
              {columns.map((i) => (
                <th key={i}>
                  {headers ? (
                    <div className="cds--table-header-label">
                      {headers[i]?.header}
                    </div>
                  ) : (
                    <span
                      className="fb-skeleton fb-skeleton-table__cell"
                      data-skeleton=""
                      aria-hidden="true"
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }, (_, r) => (
              <tr key={r}>
                {columns.map((j) => (
                  <td key={j}>
                    <span
                      className="fb-skeleton fb-skeleton-table__cell"
                      data-skeleton=""
                      aria-hidden="true"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Scroller>
    </div>
  );
}

/* ── The table pattern: a real table whose body loads ─────────────────── */

export interface DataTableColumn {
  key: string;
  /** Known at once: the header is the real `thead`, always there. */
  header: ReactNode;
  /**
   * The column's width: a percentage is its share of the table (the
   * selection column included), a length its own width; without one it
   * shares what the others leave. Fixed by one `colgroup`, so content can't
   * move it.
   */
  width?: string;
  /**
   * The narrowest the column goes (a CSS length), at every width: when its
   * share would be narrower, it holds its minimum and the columns that
   * still have room give way, in proportion to their shares. The minimums
   * add up to the table's: narrower than that, it scrolls in the kit's
   * Scroller. Default `width` when that's a length, else 6rem.
   */
  minWidth?: string;
  /** v11's header `isSortable`: this column sorts (or not), over the table's `isSortable`. */
  isSortable?: boolean;
  /**
   * A typical value, for the loading cells' bars: printed
   * unseen in the cell's own type with the bar over it, so each bar is as
   * wide as the column's values will be (never wider than the cell).
   * Without one, the bar takes 60% of the cell (v11 draws a fixed 64px).
   */
  skeletonValue?: string;
}

/**
 * A row with an id, as v11's DataTable rows: its key, its selection, and its
 * values by column key (what it sorts by, and shows when it has no `cells`).
 */
export interface DataTableRevealRow {
  /** v11's row `id`. A row that stays through a change keeps its element, moves to its new place and keeps its selection. */
  id: string;
  /** The row's cells, column by column. Default each column's value, as text. */
  cells?: ReactNode[];
  /** v11's: selected when it first shows (the table's own selection; `selectedIds` controls it instead). */
  isSelected?: boolean;
  /** v11's: the row can't be selected. */
  disabled?: boolean;
  /** v11's: the row's value for each column, by the column's `key`. */
  [key: string]: unknown;
}

/** v11's sort states and `sortRow`, as the DataTable's. */
export type DataTableRevealSortState = 'NONE' | 'ASC' | 'DESC';
export interface DataTableRevealSortRowParams {
  key: string;
  sortDirection: DataTableRevealSortState;
  sortStates: Record<DataTableRevealSortState, DataTableRevealSortState>;
  locale: string;
  compare: (a: unknown, b: unknown, locale?: string) => number;
}

export interface DataTableRevealProps {
  /** The rows are on their way. */
  loading: boolean;
  columns: DataTableColumn[];
  /**
   * The rows, once they are here: each row's cells, or rows with an `id`
   * (v11's DataTable rows). With ids, a change of rows (a filter, a search)
   * reflows: the rows leaving go, the rows staying move, the rows arriving
   * come in.
   */
  rows: ReactNode[][] | DataTableRevealRow[] | null;
  /** Skeleton rows while loading — the rows expected. Default `rows.length`, else 5. */
  rowCount?: number;
  /** v11's sizes: the row height. Default `sm`. */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  zebra?: boolean;
  /**
   * A checkbox on every row and select-all in the header (v11's
   * TableSelectRow and TableSelectAll, on the kit's Checkbox), there from the
   * first frame: the header's is real (off until the rows land), and each
   * skeleton row has a block where its box will be.
   */
  isSelectable?: boolean;
  /** The selected rows' ids (controlled). Default: the table's own, from the rows' `isSelected`. */
  selectedIds?: readonly string[];
  /** The selection changed: every selected id, rows filtered out of view included. */
  onSelectionChange?: (selectedIds: string[]) => void;
  /**
   * v11's DataTable `isSortable`: the headers sort the rows by their values,
   * none → ascending → descending → none (v11's sort header). Rows with ids
   * move to their new order on the reflow.
   */
  isSortable?: boolean;
  /** v11's `sortRow(cellA, cellB, { key, sortDirection, sortStates, locale, compare })`. Default v11's: `compare`, reversed for descending. */
  sortRow?: (
    cellA: unknown,
    cellB: unknown,
    params: DataTableRevealSortRowParams
  ) => number;
  /** v11's `locale` for the sort. Default `en`. */
  locale?: string;
  /** `square` or `rounded` (8px, the DataTable's). Default: KitDefaults' (a rounded Region's), else `square`. */
  corners?: ContainerCorners;
  /**
   * Which page of rows this is (a paginated table's page number). When it changes along with the
   * rows, they land at once: a page is another set, not a filter's change, and its rows don't
   * animate. A filter or a sort within a page still reflows.
   */
  pageKey?: string | number;
  /** Rows fade this far apart, ms. Default `LOADING_MOTION.rowStaggerMs` (30). */
  stagger?: number;
  /** The stagger stops growing here, ms. Default `LOADING_MOTION.staggerCapMs` (moderate-02, 220). */
  staggerCap?: number;
  className?: string;
  'aria-label'?: string;
}

/**
 * The overlay's cells paint nothing (the real table beneath draws the rows'
 * fills and lines once, as structure), so a bar's backdrop is read
 * from this: the row's own fill (`--cds-row`, a zebra stripe included), never
 * painted (`display: none`), as the backdrop hint (`BACKDROP`) the wave's
 * backdrop lookup (`backdropOf`) reads. Each bar is then solved against the
 * row it lies on.
 */
function CellBackdrop() {
  return <span className="fb-table-reveal__backdrop" {...BACKDROP} />;
}

/** v11's row heights by size, px: the arrivals' stagger steps by the pitch. */
const ROW_PX = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 } as const;

const toRows = (
  rows: DataTableRevealProps['rows']
): DataTableRevealRow[] | null =>
  rows?.map((r, i) => (Array.isArray(r) ? { id: String(i), cells: r } : r)) ??
  null;

/** A row's cell for column `j`: its own, else its value as text. */
const cellOf = (
  r: DataTableRevealRow,
  c: DataTableColumn,
  j: number
): ReactNode =>
  r.cells ? r.cells[j] : r[c.key] == null ? null : String(r[c.key]);

const SORT_STATES: Record<DataTableRevealSortState, DataTableRevealSortState> =
  {
    NONE: 'NONE',
    ASC: 'ASC',
    DESC: 'DESC',
  };

const compareStrings = (a: string, b: string, locale: string) =>
  a.localeCompare(b, locale, {
    numeric: !isNaN(parseFloat(a)) && !isNaN(parseFloat(b)),
  });

/** v11's `compare`: numbers by value, strings (or an element's text) by the locale. */
function compare(a: unknown, b: unknown, locale = 'en'): number {
  const x = a ?? '';
  const y = b ?? '';
  if (typeof x === 'number' && typeof y === 'number') return x - y;
  if (typeof x === 'string' && typeof y === 'string')
    return compareStrings(x, y, locale);
  const kid = (v: unknown) =>
    (v as { props?: { children?: unknown } })?.props?.children;
  const xc = kid(x);
  const yc = kid(y);
  if (typeof xc === 'string' && typeof yc === 'string')
    return compareStrings(xc, yc, locale);
  return compareStrings(String(x), String(y), locale);
}

/** v11's `defaultSortRow`. */
const defaultSortRow = (
  a: unknown,
  b: unknown,
  p: DataTableRevealSortRowParams
) =>
  p.sortDirection === p.sortStates.ASC
    ? p.compare(a, b, p.locale)
    : p.compare(b, a, p.locale);

/** The column's minimum, for the table's (a Scroller below it). */
const minOf = (c: DataTableColumn) =>
  c.minWidth ?? (c.width && !c.width.trim().endsWith('%') ? c.width : '6rem');

/** A column for `fitColumns`, in px: its share of the table (`pct`, 0–1) or its own width (`px`), or neither; and its minimum. */
export interface FitColumn {
  pct?: number;
  px?: number;
  min: number;
}

/**
 * The columns' widths, px, in a table `table` px wide whose selection
 * column takes `fixed`: a length is the column's own (never under its
 * minimum); a share is of the whole table; the columns with neither share
 * what's left. The shares (and what's left) then fill the room exactly, and
 * a column that would go under its minimum holds it while the rest give
 * way, in proportion to their shares, until every one fits. Narrower than
 * the minimums, every column is at its minimum (the table scrolls).
 */
export function fitColumns(
  table: number,
  fixed: number,
  columns: readonly FitColumn[]
): number[] {
  const out = columns.map((c) =>
    c.px != null ? Math.max(c.px, c.min) : Number.NaN
  );
  let room =
    table - fixed - out.reduce((s, w) => s + (Number.isNaN(w) ? 0 : w), 0);
  let free = columns.map((_, i) => i).filter((i) => Number.isNaN(out[i]));
  while (free.length) {
    const shares = free.map((i) =>
      columns[i]!.pct != null ? columns[i]!.pct! * table : null
    );
    const given = shares.reduce<number>((s, v) => s + (v ?? 0), 0);
    const rest = shares.filter((v) => v == null).length;
    const each = rest ? Math.max(0, room - given) / rest : 0;
    const want = shares.map((v) => v ?? each);
    const sum = want.reduce((s, v) => s + v, 0);
    const sized = want.map((v) =>
      sum > 0 ? (v * room) / sum : room / free.length
    );
    const under = free.filter((i, k) => sized[k]! < columns[i]!.min - 0.01);
    if (!under.length) {
      free.forEach((i, k) => (out[i] = sized[k]!));
      break;
    }
    for (const i of under) {
      out[i] = columns[i]!.min;
      room -= columns[i]!.min;
    }
    free = free.filter((i) => !under.includes(i));
  }
  return out;
}

const PERCENT = /^\s*(-?[\d.]+)%\s*$/;

/**
 * Every column holds its minimum at every width (`fitColumns`): the columns'
 * lengths are resolved where the table is, and on every change of the
 * frame's width each `col` (the table's and its skeleton's) is given its px
 * width. Written to the `col`s directly, not rendered, so a resize (a panel
 * pushing) doesn't re-render the rows.
 */
function useColumnFit(
  frameRef: RefObject<HTMLDivElement | null>,
  columns: DataTableColumn[]
) {
  const key = columns.map((c) => `${c.width ?? ''}/${minOf(c)}`).join(' ');
  const fit = useRef<() => void>(() => {});
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    // A CSS length in px where the table is (rem, calc and the like).
    const probe = document.createElement('div');
    probe.style.cssText = 'position:absolute;visibility:hidden;block-size:0;';
    frame.append(probe);
    const px = (length: string) => {
      probe.style.inlineSize = length;
      return parseFloat(getComputedStyle(probe).width) || 0;
    };
    const select = px('var(--fb-table-reveal-select, 0px)');
    const spec: FitColumn[] = columns.map((c) => {
      const pct = c.width?.match(PERCENT);
      return {
        pct: pct ? Number(pct[1]) / 100 : undefined,
        px: c.width && !pct ? px(c.width) : undefined,
        min: px(minOf(c)),
      };
    });
    probe.remove();
    fit.current = () => {
      const widths = fitColumns(
        parseFloat(getComputedStyle(frame).width) || 0,
        frame.querySelector('col.fb-table-reveal__select') ? select : 0,
        spec
      );
      for (const group of frame.querySelectorAll('colgroup'))
        group
          .querySelectorAll<HTMLElement>('col[data-col]')
          .forEach((col, i) => {
            const w = `${widths[i]}px`;
            if (col.style.width !== w) col.style.width = w;
          });
    };
    fit.current();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => fit.current());
    ro.observe(frame);
    return () => ro.disconnect();
    // The columns' widths and minimums, by value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameRef, key]);
  // A skeleton mounted again (a reload) gets the widths too.
  useLayoutEffect(() => fit.current());
}

/**
 * What follows a DataTableReveal's rows in a layout (a recipe's footer), told
 * how they're coming: the reveal's phase as it changes (null once the table
 * has gone), and, as the rows start to arrive (`handoff`), `lastRow`, which
 * settles as the last row starts to fade in, on the reveal's own clock (its
 * stagger, slow motion and reduced motion in it).
 */
export type DataTableRevealFollower = (
  phase: RevealPhase | null,
  lastRow?: Promise<void>
) => void;

export const DataTableRevealFollow =
  createContext<DataTableRevealFollower | null>(null);

/** Settles as `a` (a row's fade, waiting on its delay) starts to move, on the animation's own timeline. */
function startOf(a: Animation | undefined): Promise<void> {
  if (!a) return Promise.resolve();
  return a.ready.then(
    () =>
      new Promise<void>((resolve) => {
        const delay = Number(a.effect?.getTiming().delay ?? 0);
        const at = Number(a.startTime ?? 0) + delay / (a.playbackRate || 1);
        const now = Number(document.timeline.currentTime ?? performance.now());
        // A task, not a frame: a hidden tab gets there too.
        window.setTimeout(resolve, Math.max(0, at - now));
      }),
    () => undefined
  );
}

/**
 * A table whose body loads, on the loading pattern: what's known — the
 * header row, the column widths and the selection column — is the real
 * table from the first frame and never moves (`table-layout: fixed`, one
 * `colgroup` for the table and its skeleton). While loading, the body holds
 * its rows' space and a skeleton body lies over it, cell for cell; at the
 * reveal the rows, checkboxes included, fade in place, 30ms apart, as the
 * skeleton dissolves over them. Nothing but the cells' contents changes.
 *
 * Loaded, rows with ids reflow when they change (`useFilterPresence`, the
 * list reflow): the rows leaving fade where they are (fast-01); then one
 * layout transaction moves the rows staying to their new places and the
 * body to its new height, on the farthest travel's clock; then the rows
 * arriving fade in, staggered. The selection is by id, so it stays through
 * it. Reduced motion: the fades alone, on the reduced clock. A change of
 * `pageKey` (another page of rows) is not a reflow: the rows are simply there.
 */
export function DataTableReveal({
  loading,
  columns,
  rows: rowsProp,
  rowCount,
  size: sizeProp,
  zebra = false,
  isSelectable = false,
  selectedIds,
  onSelectionChange,
  isSortable = false,
  sortRow = defaultSortRow,
  locale = 'en',
  corners: cornersProp,
  pageKey,
  stagger = LOADING_MOTION.rowStaggerMs,
  staggerCap,
  className,
  'aria-label': ariaLabel,
}: DataTableRevealProps) {
  // KitDefaults: the provider's size when none is given.
  const size = useDefaultSize(sizeProp, TABLE_SIZES, 'sm');
  const { timeScale, reduced } = useFeedbackMotion();
  const { phase, overlayRef, contentRef } = useSkeletonReveal(loading, {
    arrive: 'fade',
    stagger,
    staggerCap,
  });
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  // The skeleton's wave when no SkeletonWave above owns it (under one, nothing).
  useSkeletonBlocks(rootRef);
  useColumnFit(frameRef, columns);

  // What follows the rows (a recipe's footer) hears how they're coming: on
  // the handoff (its fades just started, in the hook above), when the last
  // row starts.
  const follow = useContext(DataTableRevealFollow);
  useLayoutEffect(() => {
    if (!follow) return;
    if (phase !== 'handoff') return follow(phase);
    const rows =
      contentRef.current?.querySelectorAll<HTMLElement>('tr[data-reveal]');
    const last = rows?.[rows.length - 1];
    follow(
      phase,
      startOf(last?.getAnimations().find((a) => a.playState !== 'finished'))
    );
  }, [follow, phase, contentRef]);
  useLayoutEffect(() => () => follow?.(null), [follow]);
  const uid = useId();
  const corners = useContainerCorners(cornersProp);
  const given = toRows(rowsProp);
  const keyed = !!rowsProp?.some((r) => !Array.isArray(r));
  const count = rowCount ?? given?.length ?? 5;

  // ── the sort: v11's, by the rows' values; a new order is a reflow ─────
  const [sort, setSort] = useState<{
    key: string | null;
    direction: DataTableRevealSortState;
  }>({
    key: null,
    direction: 'NONE',
  });
  const sortable = (c: DataTableColumn) => c.isSortable ?? isSortable;
  // Nothing to sort until the rows have landed: the sort buttons are
  // disabled (Carbon's disabled control: native `disabled`, so not
  // focusable, in the disabled colours) until the reveal ends.
  const sortReady = phase === 'loaded';
  // TableHeader (as v11's) hands its other props to the sort button; its type
  // doesn't name `disabled`.
  const sortButton = { disabled: !sortReady } as Partial<
    ComponentProps<typeof TableHeader>
  >;
  const sortCol = columns.findIndex((c) => c.key === sort.key);
  const rows =
    given && sort.direction !== 'NONE' && sortCol >= 0
      ? given.slice().sort((a, b) => {
          const c = columns[sortCol]!;
          const value = (r: DataTableRevealRow) =>
            r[c.key] !== undefined ? r[c.key] : cellOf(r, c, sortCol);
          return sortRow(value(a), value(b), {
            key: c.key,
            sortDirection: sort.direction,
            sortStates: SORT_STATES,
            locale,
            compare,
          });
        })
      : given;
  const onSort = (key: string) =>
    setSort((s) => ({
      key,
      // v11's getNextSortDirection.
      direction:
        s.key !== key
          ? 'ASC'
          : s.direction === 'NONE'
            ? 'ASC'
            : s.direction === 'ASC'
              ? 'DESC'
              : 'NONE',
    }));
  const shown = phase !== 'loading' ? rows : null;

  // ── the selection: by id, the table's own or controlled ─────────────
  const [own, setOwn] = useState<ReadonlySet<string>>(
    () => new Set(rows?.filter((r) => r.isSelected).map((r) => r.id))
  );
  // A row new to the table takes its own `isSelected` (v11); one it has seen keeps its state.
  const [known, setKnown] = useState<ReadonlySet<string>>(
    () => new Set(rows?.map((r) => r.id))
  );
  const fresh = rows?.filter((r) => !known.has(r.id)) ?? [];
  if (fresh.length) {
    setKnown(new Set([...known, ...fresh.map((r) => r.id)]));
    const picked = fresh.filter((r) => r.isSelected);
    if (picked.length && !selectedIds)
      setOwn(new Set([...own, ...picked.map((r) => r.id)]));
  }
  const selected: ReadonlySet<string> = selectedIds
    ? new Set(selectedIds)
    : own;
  const select = (next: Set<string>) => {
    if (!selectedIds) setOwn(next);
    onSelectionChange?.([...next]);
  };
  // Select-all counts the rows in view that can be selected (the kit's DataTable's rule).
  const selectable = (shown ?? []).filter((r) => !r.disabled);
  const inView = selectable.filter((r) => selected.has(r.id)).length;
  const allChecked = selectable.length > 0 && inView === selectable.length;
  const toggleAll = () => {
    const next = new Set(selected);
    // v11: with any selected, select-all clears them; with none, it selects them all.
    for (const r of selectable) {
      if (inView > 0) next.delete(r.id);
      else next.add(r.id);
    }
    select(next);
  };
  const toggleRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    select(next);
  };

  const tableClass = [
    'cds--data-table',
    `cds--data-table--${size}`,
    zebra && 'cds--data-table--zebra',
    'fb-table-reveal__table',
  ]
    .filter(Boolean)
    .join(' ');
  const selectCell = 'cds--table-column-checkbox cds-data-table__select';
  const cols = (
    <colgroup>
      {isSelectable && <col className="fb-table-reveal__select" />}
      {/* Each col's px width is useColumnFit's; `width` until it measures. */}
      {columns.map((c) => (
        <col
          key={c.key}
          data-col=""
          style={c.width ? { width: c.width } : undefined}
        />
      ))}
    </colgroup>
  );
  const head = (hidden: boolean) => (
    <thead aria-hidden={hidden || undefined}>
      <tr>
        {isSelectable &&
          (hidden ? (
            <th className={selectCell} />
          ) : (
            <TableSelectAll
              id={`${uid}-all`}
              name={`${uid}-all`}
              aria-label="Select all rows"
              checked={allChecked}
              indeterminate={inView > 0 && !allChecked}
              // Nothing to select until the rows land.
              disabled={!shown || selectable.length === 0}
              onSelect={toggleAll}
              timeScale={timeScale}
            />
          ))}
        {columns.map((c) =>
          sortable(c) ? (
            // The kit's sort header (v11's button and aria-sort, its icon
            // SortDirection); the skeleton's hidden copy too, so the two
            // header rows match.
            <TableHeader
              key={c.key}
              scope={hidden ? undefined : 'col'}
              isSortable
              isSortHeader={sort.key === c.key}
              sortDirection={sort.key === c.key ? sort.direction : 'NONE'}
              {...sortButton}
              onClick={hidden || !sortReady ? undefined : () => onSort(c.key)}>
              {c.header}
            </TableHeader>
          ) : (
            <th key={c.key} scope={hidden ? undefined : 'col'}>
              <div className="cds--table-header-label">{c.header}</div>
            </th>
          )
        )}
      </tr>
    </thead>
  );

  // ── the rows, and their reflow ───────────────────────────────────────
  const elements: ReactElement[] = (shown ?? []).map((r) => {
    const on = selected.has(r.id);
    return (
      <tr
        key={r.id}
        data-cds-key={r.id}
        data-reveal=""
        className={
          isSelectable && on ? 'cds--data-table--selected' : undefined
        }>
        {isSelectable && (
          <TableSelectRow
            id={`${uid}-${r.id}`}
            name={`${uid}-${r.id}`}
            aria-label="Select row"
            checked={on}
            disabled={r.disabled}
            onSelect={() => toggleRow(r.id)}
            timeScale={timeScale}
          />
        )}
        {columns.map((c, j) => (
          <td key={c.key}>{cellOf(r, c, j)}</td>
        ))}
      </tr>
    );
  });
  const arrivals = useStagger({
    count: Math.max(1, elements.length),
    size: ROW_PX[size],
    window: LOADING_MOTION.staggerCapMs,
  });
  // Only rows with ids reflow, and only once the reveal has landed: before
  // that, or by index, a change lands at once.
  const reflow = keyed && phase === 'loaded';
  // Another page of rows lands at once: the reflow is for a filter's or a sort's change.
  const pageChanged = pageKey !== usePreviousCommit(pageKey);
  const present = useFilterPresence(rootRef, rootRef, elements, {
    timeScale,
    reduced,
    staggerDelay: arrivals.delay,
    listRef: contentRef,
    enabled: reflow && !pageChanged,
  });
  const body = reflow ? present : elements;

  return (
    <div
      ref={rootRef}
      className={['fb-table-reveal', className].filter(Boolean).join(' ')}
      data-phase={phase}
      data-selectable={isSelectable || undefined}
      aria-busy={phase === 'loading' || phase === 'unload' || undefined}>
      {/* In the kit's Scroller, as the DataTable's Table: narrower than its
          columns' minimums, it scrolls in place instead of truncating. The
          frame holds the table and its skeleton together. */}
      <Scroller
        axis="x"
        className={[
          'cds-data-table__scroller',
          corners === 'rounded' && 'cds-data-table--rounded',
        ]
          .filter(Boolean)
          .join(' ')}
        timeScale={timeScale}>
        <div
          ref={frameRef}
          className="fb-table-reveal__frame"
          style={
            {
              '--fb-table-reveal-min': `calc(${columns.map(minOf).join(' + ')})`,
            } as CSSProperties
          }>
          <table className={tableClass} aria-label={ariaLabel}>
            {cols}
            {head(false)}
            <tbody ref={contentRef as NodeRef<HTMLTableSectionElement>}>
              {shown
                ? body
                : Array.from({ length: count }, (_, i) => (
                    // The rows' space, held while they load.
                    <tr key={i} aria-hidden="true">
                      {isSelectable && <td className={selectCell} />}
                      {columns.map((c) => (
                        <td key={c.key} />
                      ))}
                    </tr>
                  ))}
            </tbody>
          </table>
          {phase !== 'loaded' && (
            <table
              ref={overlayRef as NodeRef<HTMLTableElement>}
              className={`${tableClass} fb-table-reveal__skeleton`}
              aria-hidden="true">
              {cols}
              {head(true)}
              <tbody>
                {Array.from({ length: count }, (_, i) => (
                  <tr key={i}>
                    {isSelectable && (
                      <td className={selectCell}>
                        <CellBackdrop />
                        <span
                          className="fb-skeleton fb-table-reveal__check"
                          data-skeleton=""
                          aria-hidden="true"
                        />
                      </td>
                    )}
                    {columns.map((c) => (
                      <td key={c.key}>
                        <CellBackdrop />
                        <SkeletonRun
                          className={[
                            'fb-table-reveal__value',
                            c.skeletonValue == null &&
                              'fb-table-reveal__value--share',
                          ]
                            .filter(Boolean)
                            .join(' ')}>
                          {c.skeletonValue ?? ' '}
                        </SkeletonRun>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Scroller>
    </div>
  );
}
