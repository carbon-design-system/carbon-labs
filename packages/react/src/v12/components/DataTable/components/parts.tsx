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
  type ComponentProps,
  type MouseEvent,
  type ReactElement,
} from 'react';
import {
  DataTable as CdsDataTable,
  Table as CdsTable,
  TableContainer as CdsTableContainer,
  type DataTableProps,
  type DataTableRenderProps,
} from '@carbon/react';
import { Checkbox } from '@carbon-labs/react-checkbox';
import { Scroller } from '@carbon-labs/react-scroller';
import { mixedCheckbox, mixedState } from '@carbon-labs/react-selection-kit';
import {
  TABLE_SIZES,
  useContainerCorners,
  useDefaultSize,
  type ContainerCorners,
} from '@carbon-labs/react-kit-defaults';
// Here, not in index.ts: the kit's .ts files are side-effect free, so a bundler
// reads index.ts's re-exports straight through and drops its own CSS import.
import './data-table.scss';

/* ============================================================================
 * The kit's own DataTable parts: v11's, with
 * the kit's scrolling and selection.
 *
 *   DataTable        v11's DataTable, its select-all counted over the rows
 *                    it shows: checked when every selectable row in view is
 *                    selected, mixed when some are, so checking each box
 *                    one by one checks select-all. v11 counts every row, so
 *                    with a search filtering the table, or a disabled row,
 *                    checking each box leaves select-all mixed
 *   Table            v11's Table in the kit's Scroller, so a table wider than
 *                    its container scrolls under the floating pill, not the
 *                    native bar ("scroller should always be used in place of
 *                    v11 scroll bar"). It fits first: fields in cells shrink
 *                    to them, and when the table wouldn't fit as written,
 *                    cells kept on one line wrap (`cds-data-table--tight`);
 *                    the Scroller takes over only when it still can't
 *   TableSelectRow   v11's props (`aria-label`, `checked`, `id`, `name`,
 *   TableSelectAll   `onSelect`, `disabled`, `indeterminate` on the header's),
 *                    on the kit's Checkbox. `radio` rows stay v11's.
 *   corners          DataTable's `corners`: `square` (v11, the default) or
 *                    `rounded`, 8px on the outer box (the TableContainer, or
 *                    the Table when there is none), its fills clipped to it
 *                    and the parts at its corners (the header row, the first
 *                    and last rows, their focus rings) concentric with it.
 *                    Given none, it takes KitDefaults' (a rounded Region's:
 *                    rounded). TableContainer and Table read it from the
 *                    DataTable round them
 * ========================================================================== */

/** The table's corners, from DataTable to its TableContainer and Table. */
const TableCornersContext = createContext<ContainerCorners | null>(null);
/** Inside the kit's TableContainer: it is the outer box, so the Table doesn't round itself too. */
const InContainerContext = createContext(false);

/** The table's corners: the DataTable's, else the providers' (a Region's), else square. */
function useTableCorners(): ContainerCorners {
  const fromTable = useContext(TableCornersContext);
  const fromKit = useContainerCorners(undefined);
  return fromTable ?? fromKit;
}

export type TableContainerProps = ComponentProps<typeof CdsTableContainer>;

/** v11's TableContainer, rounded when its DataTable is (`corners`). */
export function TableContainer({ className, ...props }: TableContainerProps) {
  const corners = useTableCorners();
  return (
    <InContainerContext.Provider value>
      <CdsTableContainer
        {...props}
        className={[
          corners === 'rounded' && 'cds-data-table--rounded',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      />
    </InContainerContext.Provider>
  );
}
TableContainer.displayName = 'TableContainer';

export type TableProps = ComponentProps<typeof CdsTable> & {
  /** Slow motion for its Scroller (as the expand parts' `timeScale`). Default 1. */
  timeScale?: number;
};

/** Text that takes no room in a cell: assistive labels and Carbon's sort description. */
const UNSEEN_TEXT =
  '.cds--visually-hidden, .cds--assistive-text, .cds--table-sort__description, .cds-checkbox__label--hidden';

/** Whether a batch of content changes can change the table's natural width. */
function resizes(records: MutationRecord[]): boolean {
  const added = new Set<Node>();
  const removed = new Set<Node>();
  for (const r of records) {
    const at = r.target instanceof Element ? r.target : r.target.parentElement;
    if (at?.closest(UNSEEN_TEXT)) continue;
    if (r.type === 'characterData') return true;
    r.addedNodes.forEach((n) => added.add(n));
    r.removedNodes.forEach((n) => removed.add(n));
  }
  // The same nodes out and back in: moved, not changed.
  if (added.size !== removed.size) return true;
  for (const n of added) if (!removed.has(n)) return true;
  return false;
}
export function Table({ className, timeScale, ...props }: TableProps) {
  const viewport = useRef<HTMLDivElement>(null);
  // The outer box when there's no TableContainer round it.
  const corners = useTableCorners();
  const inContainer = useContext(InContainerContext);
  const rounded = corners === 'rounded' && !inContainer;

  // Tight, only when it wouldn't fit as written: cells kept on one line
  // (`white-space: nowrap`) may then wrap at their spaces and hyphens, so the
  // table fits before the Scroller takes it, never forcing a scroll at normal sizes.
  useLayoutEffect(() => {
    const vp = viewport.current;
    const table = vp?.querySelector('table');
    if (!vp || !table || typeof ResizeObserver === 'undefined') return;
    // Its width as written is kept from when it is last laid out that way
    // (taking the class off in each resize callback to read the width, then
    // putting it back, costs a full untight layout and a tight one on every
    // frame of a window drag). Untight, the live width is the natural
    // one: read, then write. Tight, the kept width is compared with the room;
    // only content changing (rows, text, a font, the table's own class)
    // forgets it, and only then is it laid out as written again to measure.
    // Once a frame, after the observer (not inside its callback, so a class
    // change can't loop it).
    const TIGHT = 'cds-data-table--tight';
    let natural: number | null = null;
    const fit = () => {
      if (vp.classList.contains(TIGHT)) {
        if (natural !== null) {
          if (natural <= vp.clientWidth + 1) vp.classList.remove(TIGHT);
          return;
        }
        // Content changed while tight: as written once, to measure.
        vp.classList.remove(TIGHT);
      }
      const sw = vp.scrollWidth;
      const cw = vp.clientWidth;
      if (sw > cw + 1) {
        natural = sw;
        vp.classList.add(TIGHT);
      } else natural = null;
    };
    fit();
    let raf = 0;
    const schedule = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          fit();
        });
    };
    const changed = () => {
      natural = null;
      schedule();
    };
    // The table changing size in a room that didn't (not by its own class
    // toggle): something round it changed how it lays out (a density or
    // type class on an ancestor). Measured as written again once it
    // settles, not on every frame of a move.
    let roomW = vp.clientWidth;
    let tableH = table.offsetHeight;
    let toggledAt = vp.className;
    let settle = 0;
    const ro = new ResizeObserver(() => {
      const w = vp.clientWidth;
      const h = table.offsetHeight;
      const ownToggle = vp.className !== toggledAt;
      if (!ownToggle && w === roomW && h !== tableH && natural !== null) {
        clearTimeout(settle);
        settle = window.setTimeout(changed, 150);
      }
      roomW = w;
      tableH = h;
      toggledAt = vp.className;
      schedule();
    });
    ro.observe(vp);
    ro.observe(table);
    // Two observers: one target takes one set of options. Rows reordered (a sort)
    // and unseen label text change no column's width, so they keep it.
    const content =
      typeof MutationObserver !== 'undefined'
        ? new MutationObserver((records) => {
            if (resizes(records)) changed();
          })
        : null;
    content?.observe(table, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    const own =
      typeof MutationObserver !== 'undefined'
        ? new MutationObserver(changed)
        : null;
    own?.observe(table, { attributes: true, attributeFilter: ['class'] });
    document.fonts?.addEventListener?.('loadingdone', changed);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settle);
      ro.disconnect();
      content?.disconnect();
      own?.disconnect();
      document.fonts?.removeEventListener?.('loadingdone', changed);
    };
  }, []);

  return (
    <Scroller
      axis="x"
      className={[
        'cds-data-table__scroller',
        rounded && 'cds-data-table--rounded',
      ]
        .filter(Boolean)
        .join(' ')}
      viewportRef={viewport}
      timeScale={timeScale}>
      <CdsTable
        {...props}
        className={['cds-data-table__table', className]
          .filter(Boolean)
          .join(' ')}
      />
    </Scroller>
  );
}

export interface TableSelectRowProps {
  'aria-label'?: string;
  /** @deprecated v11: `aria-label`. */
  ariaLabel?: string;
  checked?: boolean;
  id: string;
  name?: string;
  onSelect: (event: MouseEvent<HTMLInputElement>) => void;
  onChange?: (checked: boolean, name: string, event: unknown) => void;
  disabled?: boolean;
  /** v11's radio rows: not on the kit yet (the cell stays empty). */
  radio?: boolean;
  className?: string;
  /** Slow motion for its Checkbox. Default 1. */
  timeScale?: number;
}

export function TableSelectRow({
  'aria-label': ariaLabel,
  ariaLabel: deprecatedAriaLabel,
  checked,
  id,
  name,
  onSelect,
  onChange,
  disabled,
  className,
  timeScale,
}: TableSelectRowProps) {
  const fallbackName = useId();
  return (
    <td
      className={[
        'cds--table-column-checkbox',
        'cds-data-table__select',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-live="off">
      <Checkbox
        id={id}
        name={name ?? fallbackName}
        labelText={ariaLabel ?? deprecatedAriaLabel ?? ''}
        hideLabel
        checked={!!checked}
        disabled={disabled}
        timeScale={timeScale}
        onClick={onSelect}
        onChange={(e, { checked: c }) => onChange?.(c, name ?? fallbackName, e)}
      />
    </td>
  );
}

export interface TableSelectAllProps {
  'aria-label'?: string;
  /** @deprecated v11: `aria-label`. */
  ariaLabel?: string;
  checked?: boolean;
  id: string;
  indeterminate?: boolean;
  name?: string;
  onSelect: (event: MouseEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  /** Slow motion for its Checkbox. Default 1. */
  timeScale?: number;
}

export function TableSelectAll({
  'aria-label': ariaLabel,
  ariaLabel: deprecatedAriaLabel = 'Select all rows in the table',
  checked,
  id,
  indeterminate,
  name,
  onSelect,
  disabled,
  className,
  timeScale,
}: TableSelectAllProps) {
  return (
    <th
      scope="col"
      className={[
        'cds--table-column-checkbox',
        'cds-data-table__select',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-live="off">
      <Checkbox
        id={id}
        name={name}
        labelText={ariaLabel ?? deprecatedAriaLabel}
        hideLabel
        checked={!!checked}
        indeterminate={indeterminate}
        disabled={disabled}
        timeScale={timeScale}
        onClick={onSelect}
        onChange={() => {}}
      />
    </th>
  );
}

/** v11's select-all props, counted over the rows in view that can be selected. */
function selectAllInView<R, C extends unknown[]>(
  rp: DataTableRenderProps<R, C>
) {
  return (
    options?: Parameters<DataTableRenderProps<R, C>['getSelectionProps']>[0]
  ) => {
    const props = rp.getSelectionProps(options);
    if (options?.row) return props;
    const selectable = rp.rows.filter((r) => !r.disabled);
    const selected = selectable.filter((r) => r.isSelected).length;
    // The selection kit's mixed rule (selection-kit/mixed.ts); the click stays v11's.
    return {
      ...props,
      ...mixedCheckbox(mixedState(selected, selectable.length)),
    };
  };
}

/** The kit's DataTable props, beside v11's. */
export interface DataTableCornersProps {
  // @carbon-explore corners-prop — Corner mode is one `corners` prop (full, rounded or square) that a provider can set for a subtree, where `rounded` is the component's own radius. TBD
  /** `square` (v11, default) or `rounded`: 8px on the outer box, inside a card or a rounded region. Default: KitDefaults' (a Region's), else `square`. */
  corners?: ContainerCorners;
}

function KitDataTable<R, C extends unknown[]>({
  corners: cornersProp,
  ...props
}: DataTableProps<R, C> & DataTableCornersProps) {
  const draw = props.children ?? props.render;
  // KitDefaults: the provider's size when none is given (else v11's lg).
  const size = useDefaultSize(props.size, TABLE_SIZES);
  const corners = useContainerCorners(cornersProp);
  return (
    <TableCornersContext.Provider value={corners}>
      <CdsDataTable {...props} {...(size ? { size } : null)} render={undefined}>
        {(rp: DataTableRenderProps<R, C>) =>
          draw ? draw({ ...rp, getSelectionProps: selectAllInView(rp) }) : <></>
        }
      </CdsDataTable>
    </TableCornersContext.Provider>
  );
}

/** v11's DataTable (its statics too), its select-all counted over the rows in view, with `corners`. */
export const DataTable = Object.assign(
  KitDataTable,
  CdsDataTable
) as unknown as (<R, C extends unknown[]>(
  props: DataTableProps<R, C> & DataTableCornersProps
) => ReactElement | null) &
  typeof CdsDataTable;
