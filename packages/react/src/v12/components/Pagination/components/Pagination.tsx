/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type RefObject,
} from 'react';
import { CaretLeft, CaretRight } from '@carbon-labs/react-motion-icons';
import { Dropdown } from '@carbon-labs/react-dropdown';
import { Scroller } from '@carbon-labs/react-scroller';
import { PageSwap, splitNumber, splitRange } from './PageSwap';
import { IconButton, TooltipGroup } from '@carbon-labs/react-tooltip';
import { TABLE_SIZES, useDefaultSize } from '@carbon-labs/react-kit-defaults';
import './pagination.scss';

/* ============================================================================
 * Pagination — Carbon v11's Pagination (the data table's footer), on the
 * kit's field and icon buttons.
 * ============================================================================
 *
 * v11's props: `page` (1-based), `pageSize`, `pageSizes` (numbers or
 * `{ text, value }`), `totalItems`, `pagesUnknown`, `isLastPage`,
 * `backwardText` / `forwardText` and their tooltip positions,
 * `itemsPerPageText`, `itemText`, `itemRangeText`, `pageRangeText`,
 * `pageSelectLabelText`, `pageText`, `pageInputDisabled`,
 * `pageSizeInputDisabled`, `disabled`, `size` (sm 32 · md 40 · lg 48),
 * `onChange({ page, pageSize, ref? })`. Reaching the last page moves focus
 * to the back button, and the first page to the forward button (v11).
 *
 * The kit adds:
 *
 *   surface    the quiet surface: `--cds-surface` under a `--cds-surface-divider`
 *              hairline, the sections parted by the same hairline
 *   selects    the kit's inline Dropdown, one size down from the bar and
 *              inset in it, full round (in the bar each is a short number and its
 *              chevron, the label outside it); its list is the Menu's
 *              surface (the snap)
 *   buttons    the kit's ghost IconButtons with motion-icons' carets, full
 *              round (an icon-only control's hover is a circle), in a
 *              TooltipGroup: the first
 *              tooltip snaps in, the next slides over (stillness)
 *   numbers    only what changes with the page swaps, out then in: the
 *              range's "11–20" along x by the page's direction (the rest,
 *              "of 103 items", moves to its new place), the page number
 *              along y (next = up); PageSwap.tsx.
 *              No number counts. The page count ("of 11 pages") changes at once:
 *              it follows the page size, not the page
 *   reduced    the lists and the rollover at once (theirs)
 * ========================================================================== */

export interface PaginationPageSize {
  text: string;
  value: number;
}

export interface PaginationChange {
  page: number;
  pageSize: number;
  /** The button that keeps focus (v11): back on the last page, forward on the first. */
  ref?: RefObject<HTMLButtonElement | null>;
}

type Align = 'top' | 'bottom' | 'left' | 'right';

export interface PaginationProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'id'
> {
  /** Default "Previous page". */
  backwardText?: string;
  /** Default `top`. */
  backwardTextTooltipPosition?: Align;
  className?: string;
  disabled?: boolean;
  /** Default "Next page". */
  forwardText?: string;
  /** Default `top`. */
  forwardTextTooltipPosition?: Align;
  id?: string | number;
  /** With `pagesUnknown`: there is no next page. */
  isLastPage?: boolean;
  /** With no total: "11–20 items". */
  itemText?: (min: number, max: number) => string;
  /** "11–20 of 100 items". */
  itemRangeText?: (min: number, max: number, total: number) => string;
  /** Default "Items per page:". */
  itemsPerPageText?: string;
  onChange?: (data: PaginationChange) => void;
  /** @deprecated v11: accepted, unused. */
  pageNumberText?: string;
  /** "of 10 pages". */
  pageRangeText?: (current: number, total: number) => string;
  /** The page select's name. */
  pageSelectLabelText?: (total: number) => string;
  /** The current page, 1-based. Default 1. */
  page?: number;
  pageInputDisabled?: boolean;
  pageSize?: number;
  pageSizeInputDisabled?: boolean;
  pageSizes?: number[] | PaginationPageSize[];
  /** With `pagesUnknown`: "page 3". */
  pageText?: (page: number) => string;
  /** The total isn't known: no page select, and forward stays on until `isLastPage`. */
  pagesUnknown?: boolean;
  /** Default `md` (40px). */
  size?: 'sm' | 'md' | 'lg';
  totalItems?: number;
  /** Multiplies the lists' and the scroller's durations (slow motion). Default 1. */
  timeScale?: number;
}

const DEFAULT_PAGE_SIZE = 10;
const toSizes = (
  s?: number[] | PaginationPageSize[]
): PaginationPageSize[] | undefined =>
  s && s.length
    ? (s as (number | PaginationPageSize)[]).map((v) =>
        typeof v === 'object' ? v : { text: String(v), value: v }
      )
    : undefined;
const sizeFor = (
  sizes: PaginationPageSize[] | undefined,
  size: number | undefined
) =>
  !sizes
    ? size && size > 0
      ? size
      : DEFAULT_PAGE_SIZE
    : size !== undefined && sizes.some((s) => s.value === size)
      ? size
      : sizes[0]!.value;

/** One size down from the bar: the controls sit inset in it. */
const INNER = { sm: 'xs', md: 'sm', lg: 'md' } as const;

export const Pagination = forwardRef<HTMLDivElement, PaginationProps>(
  function Pagination(
    {
      backwardText = 'Previous page',
      backwardTextTooltipPosition = 'top',
      className,
      disabled = false,
      forwardText = 'Next page',
      forwardTextTooltipPosition = 'top',
      id,
      isLastPage = false,
      itemText = (min, max) => `${min}–${max} items`,
      itemRangeText = (min, max, total) => `${min}–${max} of ${total} items`,
      itemsPerPageText = 'Items per page:',
      onChange,
      pageNumberText: _pageNumberText,
      pageRangeText = (_current, total) =>
        `of ${total} ${total === 1 ? 'page' : 'pages'}`,
      pageSelectLabelText = (total) =>
        `Page of ${total} ${total === 1 ? 'page' : 'pages'}`,
      page: pageProp = 1,
      pageInputDisabled,
      pageSize: pageSizeProp,
      pageSizeInputDisabled,
      pageSizes: pageSizesProp,
      pageText = (p) => `page ${p}`,
      pagesUnknown = false,
      size: sizeProp,
      totalItems,
      timeScale = 1,
      ...rest
    },
    ref
  ) {
    // KitDefaults: the provider's size when none is given.
    const size = useDefaultSize(sizeProp, TABLE_SIZES, 'md');
    const fallbackId = useId().replace(/:/g, '');
    const uid = id !== undefined ? String(id) : fallbackId;
    const sizes = useMemo(
      () => toSizes(pageSizesProp),
      // The sizes as values, so an inline array doesn't reset the page each render.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [JSON.stringify(pageSizesProp)]
    );
    const [page, setPage] = useState(pageProp);
    const [pageSize, setPageSize] = useState(() =>
      sizeFor(sizes, pageSizeProp)
    );
    const backRef = useRef<HTMLButtonElement | null>(null);
    const forwardRef_ = useRef<HTMLButtonElement | null>(null);
    const [focusTo, setFocusTo] = useState<'backward' | 'forward' | null>(null);

    // The props, as v11 follows them.
    useEffect(() => setPage(pageProp), [pageProp]);
    useEffect(
      () => setPageSize(sizeFor(sizes, pageSizeProp)),
      [sizes, pageSizeProp]
    );
    useEffect(() => {
      if (!focusTo) return;
      const el = (focusTo === 'backward' ? backRef : forwardRef_).current;
      if (el && !el.disabled) el.focus();
      setFocusTo(null);
    }, [focusTo]);

    const totalPages = totalItems
      ? Math.max(Math.ceil(totalItems / pageSize), 1)
      : 1;
    const backDisabled = disabled || page === 1;
    const forwardDisabled =
      disabled || (page === totalPages && !pagesUnknown) || isLastPage;
    const inner = INNER[size];

    const go = (next: number, focus?: 'backward' | 'forward') => {
      setPage(next);
      if (focus) setFocusTo(focus);
      onChange?.({
        page: next,
        pageSize,
        ...(focus
          ? { ref: focus === 'backward' ? backRef : forwardRef_ }
          : null),
      });
    };

    // The range text.
    const first = pageSize * (page - 1) + 1;
    const range =
      pagesUnknown || !totalItems
        ? totalItems === 0
          ? itemRangeText(0, 0, 0)
          : itemText(first, page * pageSize)
        : itemRangeText(
            Math.min(first, totalItems),
            Math.min(page * pageSize, totalItems),
            totalItems
          );

    // What swaps with the page: the range's "11–20" and the page number; the rest of each text stays.
    const rangeParts = useMemo(() => {
      const { before, part, after } = splitRange(range);
      return { before, text: part, after };
    }, [range]);
    const numberParts = useMemo(() => {
      const { before, part, after } = splitNumber(pageText(page), page);
      return { before, text: part, after };
    }, [pageText, page]);

    const pages = useMemo(
      () => Array.from({ length: totalPages }, (_, i) => i + 1),
      [totalPages]
    );

    return (
      <div
        {...rest}
        ref={ref}
        className={[
          'cds-pagination',
          `cds-pagination--${size}`,
          disabled && 'cds-pagination--disabled',
          className,
        ]
          .filter(Boolean)
          .join(' ')}>
        {/* Narrower than its controls, the bar scrolls along, in the kit's
          Scroller (its controls are the tab stops). */}
        <Scroller
          axis="x"
          className="cds-pagination__scroller"
          viewportClassName="cds-pagination__bar"
          focusable={false}
          timeScale={timeScale}>
          <div
            className={[
              'cds-pagination__left',
              !sizes && 'cds-pagination__left--no-sizer',
            ]
              .filter(Boolean)
              .join(' ')}>
            {sizes && (
              <Dropdown
                id={`cds-pagination-${uid}-size`}
                className="cds-pagination__select cds-pagination__select--size"
                type="inline"
                titleText={itemsPerPageText}
                label=""
                size={inner}
                corners="full"
                items={sizes}
                itemToString={(s) => (s ? s.text : '')}
                selectedItem={sizes.find((s) => s.value === pageSize) ?? null}
                disabled={pageSizeInputDisabled || disabled}
                timeScale={timeScale}
                onChange={({ selectedItem }) => {
                  if (!selectedItem) return;
                  setPage(1);
                  setPageSize(selectedItem.value);
                  onChange?.({ page: 1, pageSize: selectedItem.value });
                }}
              />
            )}
            <span className="cds-pagination__text cds-pagination__items-count">
              <PageSwap {...rangeParts} order={page} timeScale={timeScale} />
            </span>
          </div>

          <div className="cds-pagination__right">
            {pagesUnknown ? (
              <span className="cds-pagination__text cds-pagination__page-text">
                <PageSwap
                  {...numberParts}
                  order={page}
                  axis="y"
                  timeScale={timeScale}
                />
              </span>
            ) : (
              <>
                <Dropdown
                  id={`cds-pagination-${uid}-page`}
                  className="cds-pagination__select cds-pagination__select--page"
                  type="inline"
                  titleText={pageSelectLabelText(totalPages)}
                  hideLabel
                  label=""
                  size={inner}
                  corners="full"
                  items={pages}
                  selectedItem={page}
                  renderSelectedItem={(n) => (
                    <PageSwap
                      text={String(n)}
                      order={n}
                      axis="y"
                      timeScale={timeScale}
                    />
                  )}
                  disabled={pageInputDisabled || disabled}
                  timeScale={timeScale}
                  onChange={({ selectedItem }) => {
                    if (selectedItem == null || selectedItem === page) return;
                    go(selectedItem);
                  }}
                />
                <span className="cds-pagination__text cds-pagination__page-range">
                  {pageRangeText(page, totalPages)}
                </span>
              </>
            )}
            <div className="cds-pagination__buttons">
              <TooltipGroup>
                <IconButton
                  ref={backRef as RefObject<HTMLButtonElement>}
                  frame="ghost"
                  size={inner}
                  corners="full"
                  align={backwardTextTooltipPosition}
                  label={backwardText}
                  disabled={backDisabled}
                  className="cds-pagination__button cds-pagination__button--backward"
                  onClick={() =>
                    go(page - 1, page - 1 === 1 ? 'forward' : undefined)
                  }>
                  <CaretLeft aria-hidden="true" />
                </IconButton>
                <IconButton
                  ref={forwardRef_ as RefObject<HTMLButtonElement>}
                  frame="ghost"
                  size={inner}
                  corners="full"
                  align={forwardTextTooltipPosition}
                  label={forwardText}
                  disabled={forwardDisabled}
                  className="cds-pagination__button cds-pagination__button--forward"
                  onClick={() =>
                    go(
                      page + 1,
                      page + 1 === totalPages && !pagesUnknown
                        ? 'backward'
                        : undefined
                    )
                  }>
                  <CaretRight aria-hidden="true" />
                </IconButton>
              </TooltipGroup>
            </div>
          </div>
        </Scroller>
      </div>
    );
  }
);
Pagination.displayName = 'Pagination';
