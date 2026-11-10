/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  cloneElement,
  forwardRef,
  isValidElement,
  useId,
  type ComponentProps,
  type ReactElement,
} from 'react';
import {
  AILabel,
  TableHeader as CdsTableHeader,
  type DataTableSortState,
} from '@carbon/react';
import {
  SortDirection,
  type SortDirectionState,
} from '@carbon-labs/react-motion-icons';
// The icon's own rules (data-table.scss), here as parts.tsx imports it.
import './data-table.scss';

/* ============================================================================
 * TableHeader — v11's TableHeader, its props, markup and classes, with the
 * sort header's icon the motion icon SortDirection: one icon whose `value`
 * is the column's sort (none, ascending, descending), so a click on the
 * header plays its change (shrink to a line, regrow; a change under reduced
 * motion is made at once). v11 draws two icons (ArrowsVertical unsorted,
 * ArrowUp turned half a turn for descending); here the one icon draws each.
 *
 * As v11: the unsorted icon shows only while the button is hovered or
 * focused, a sorted column's always; `aria-sort` on the th; the button's
 * description says what a click will do; Enter and Space sort (a native
 * button). The button is the icon's frame (`data-motion-icon-frame`); the
 * icon is an indicator, so it has no name of its own and its clicks are the
 * button's. A header that doesn't sort is v11's own.
 * ========================================================================== */

type CdsTableHeaderProps = ComponentProps<typeof CdsTableHeader>;
export type TableHeaderProps = CdsTableHeaderProps;

const DESCRIPTION_ID = 'carbon.table.header.icon.description';

/** v11's description of the click (its default `translateWithId`). */
function defaultTranslateWithId(
  id: string,
  args?: {
    header?: unknown;
    sortDirection?: DataTableSortState;
    isSortHeader?: boolean;
    sortStates?: typeof SORT_STATES;
  }
): string {
  if (id !== DESCRIPTION_ID) return '';
  const header = args?.header as string;
  if (args?.isSortHeader) {
    if (args.sortDirection === 'NONE')
      return `Click to sort rows by ${header} header in ascending order`;
    if (args.sortDirection === 'ASC')
      return `Click to sort rows by ${header} header in descending order`;
    return `Click to unsort rows by ${header} header`;
  }
  return `Click to sort rows by ${header} header in ascending order`;
}

const SORT_STATES = { NONE: 'NONE', ASC: 'ASC', DESC: 'DESC' } as const;

const DIRECTION: Record<DataTableSortState, SortDirectionState> = {
  NONE: 'none',
  ASC: 'ascending',
  DESC: 'descending',
};

export const TableHeader = forwardRef<HTMLTableCellElement, TableHeaderProps>(
  function TableHeader(props, ref) {
    const {
      className,
      children,
      colSpan,
      decorator,
      isSortable = false,
      isSortHeader,
      onClick,
      scope = 'col',
      sortDirection,
      translateWithId,
      slug,
      id,
      ...rest
    } = props;
    const descriptionId = useId();
    if (!isSortable) return <CdsTableHeader ref={ref} {...props} />;

    const candidate = slug ?? decorator;
    const isAILabel = isValidElement(candidate) && candidate.type === AILabel;
    const shownDecorator = isAILabel
      ? cloneElement(candidate as ReactElement<{ size?: string }>, {
          size: 'mini',
        })
      : candidate;
    const direction: SortDirectionState =
      isSortHeader && sortDirection ? DIRECTION[sortDirection] : 'none';
    const t = (translateWithId ??
      defaultTranslateWithId) as typeof defaultTranslateWithId;
    // v11's args, `sortStates` included, so a translateWithId written for v11 reads the same.
    const description = t(DESCRIPTION_ID, {
      header: children,
      sortDirection,
      isSortHeader,
      sortStates: SORT_STATES,
    });
    const buttonClass = [
      className,
      'cds--table-sort',
      // v11: active whenever it is the sort header and not explicitly NONE (an undefined direction too).
      isSortHeader && sortDirection !== 'NONE' && 'cds--table-sort--active',
      direction === 'descending' && 'cds--table-sort--descending',
    ]
      .filter(Boolean)
      .join(' ');
    const thClass = [
      className,
      'cds--table-sort__header',
      slug && 'cds--table-sort__header--slug',
      isAILabel && 'cds--table-sort__header--ai-label',
      decorator && 'cds--table-sort__header--decorator',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <th
        id={id}
        aria-sort={direction}
        className={thClass}
        colSpan={colSpan}
        ref={ref}
        scope={scope}>
        <div className="cds--table-sort__description" id={descriptionId}>
          {description}
        </div>
        <button
          type="button"
          aria-describedby={descriptionId}
          className={buttonClass}
          onClick={onClick as ComponentProps<'button'>['onClick']}
          data-motion-icon-frame=""
          {...(rest as ComponentProps<'button'>)}>
          <span className="cds--table-sort__flex">
            <div className="cds--table-header-label">{children}</div>
            <SortDirection
              size={20}
              value={direction}
              className="cds-table-sort__icon"
              data-value={direction}
            />
          </span>
        </button>
        {(slug || decorator) && (
          <div className="cds--table-header-label--decorator-inner">
            {shownDecorator}
          </div>
        )}
      </th>
    );
  }
);
