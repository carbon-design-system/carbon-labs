/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  forwardRef,
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { type SelectionMoveInfo } from '@carbon-labs/v12-motion';
import { usePrefersReducedMotion } from '@carbon-labs/v12-motion';
import { CaretLeft, CaretRight } from '@carbon-labs/react-motion-icons';
import {
  SELECTION_KIT_MOTION,
  SelectionFaces,
  SelectionMarker,
  resolveSelectionStyle,
  useItemRollover,
  useLatest,
  useSelectedWeight,
  useSelectionEngine,
  useSelectionGesture,
  type SelectionMotion,
} from '@carbon-labs/react-selection-kit';
import { useStableCallback } from '@carbon-labs/react-util';
import {
  IconButton,
  TooltipGroup,
  mergeRefs,
} from '@carbon-labs/react-tooltip';
import { reflowKey, useListReflow } from '@carbon-labs/react-list-reflow';
import { PageOverflow } from './PageOverflow';
import { reachPx, stepTarget } from './step';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import './pagination-nav.scss';

/* ============================================================================
 * PaginationNav — Carbon v11's PaginationNav: page numbers between a back
 * and a forward button, the hidden pages behind a "…" on either side.
 * ============================================================================
 *
 * v11's props: `page` (0-based), `totalItems` (the number of pages),
 * `itemsShown` (default 10, at least 4), `loop`, `disableOverflow`, `size`
 * (sm 32 · md 40 · lg 48, default lg), `tooltipAlignment`,
 * `tooltipPosition`, `translateWithId`, `onChange(index)`. v11's window
 * rule: the first and last page always show; moving onto a hidden page
 * shifts the window so it lands near the far end of it (forward) or the near
 * end (back). A polite live region says "Page n of N".
 *
 * The kit adds:
 *
 *   marker     the current page's mark is the selection kit's marker: an
 *              underline at the row's foot (the line tabs'), the inverse
 *              selector's color (`variant="hero"`: the brand blue). It
 *              glides from page to page on the selection's timing (40 / 80 /
 *              120 / 160ms by travel) with its leading edge ahead; the page
 *              label takes its selected weight (600) and color where the
 *              marker covers it. A press on a page reaches toward it, and
 *              so does a press on a chevron, toward the page it steps to
 *   window     when the window of numbers shifts, the row reflows as one
 *              strip (the list reflow, `carry`): the numbers that stay
 *              slide to their new places (`animateLayout`, duration by
 *              travel), a number leaving slides on with them and fades out
 *              (faster), a number arriving slides in and fades up. The
 *              marker moves on the strip's clock, so a step that shifts the
 *              window by one leaves it still while the numbers pass under it
 *   edges      the window's numbers sit in a strip between soft edges (the
 *              family's 16px, at most the room to the neighbour's icon
 *              box), so a number travelling out is gone before it reaches a
 *              "…"; one arriving where a "…" went waits until it has gone
 *   overflow   "…" opens the kit's floating listbox of the hidden pages
 *   hover      the kit's rollover on the numbers and the "…", full round
 *              (a circle; a pill on a long number): a glow, the label a step
 *              brighter; the press insets 1px, and stays round while the
 *              marker reaches toward it
 *   buttons    the kit's ghost IconButtons with motion-icons' carets, full
 *              round too, in a TooltipGroup (stillness)
 *   reduced    no travel: the marker fades across (the kit's), the numbers
 *              land at once, leaving and arriving ones fade
 * ========================================================================== */

const translationIds = {
  'carbon.pagination-nav.next': 'Next',
  'carbon.pagination-nav.previous': 'Previous',
  'carbon.pagination-nav.item': 'Page',
  'carbon.pagination-nav.active': 'Active',
  'carbon.pagination-nav.of': 'of',
} as const;
type TranslationId = keyof typeof translationIds;
const defaultTranslateWithId = (id: TranslationId) => translationIds[id];

interface Cuts {
  front: number;
  back: number;
}

/** v11's `calculateCuts`: how many pages hide before and after the window. */
function calculateCuts(
  page: number,
  total: number,
  shown: number,
  splitPoint: number | null = null
): Cuts {
  if (shown >= total) return { front: 0, back: 0 };
  const split = splitPoint || Math.ceil(shown / 2) - 1;
  let front = page + 1 - split;
  let back = total - page - (shown - split) + 1;
  if (front <= 1) {
    back -= front <= 0 ? Math.abs(front) + 1 : 0;
    front = 0;
  }
  if (back <= 1) {
    front -= back <= 0 ? Math.abs(back) + 1 : 0;
    back = 0;
  }
  return { front, back };
}

/** v11's `pageWouldBeHidden`. */
function wouldBeHidden(page: number, cuts: Cuts, total: number, shown: number) {
  const front =
    (page >= (shown <= 4 && page > 1 ? 0 : 1) && page <= cuts.front) ||
    page === 0;
  const back = page >= total - cuts.back - 1 && page <= total - 2;
  return front || back;
}

/** v11's cut update when the page changes. */
function cutsAfter(
  page: number,
  prev: number,
  cuts: Cuts,
  total: number,
  shown: number
): Cuts {
  if (!wouldBeHidden(page, cuts, total, shown)) return cuts;
  return page - prev > 0
    ? calculateCuts(page, total, shown, shown - 3)
    : calculateCuts(page, total, shown, shown > 4 ? 2 : 1);
}

/** v11's items shown: `itemsShown` when at least 4, else a size's default (at least 4). */
function shownFor(itemsShown: number, size: 'sm' | 'md' | 'lg') {
  if (itemsShown >= 4) return itemsShown;
  const bySize =
    size === 'md'
      ? 5
      : size === 'sm'
        ? Math.min(Math.max(itemsShown, 4), 7)
        : 4;
  return Math.max(bySize, 4);
}

export interface PaginationNavProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'onChange'
> {
  className?: string;
  /** The "…" shows as a disabled control instead of a list of the hidden pages. */
  disableOverflow?: boolean;
  /** How many items show, at least 4. Default 10. */
  itemsShown?: number;
  /** The buttons wrap round from the last page to the first and back. */
  loop?: boolean;
  /** Called with the new page's index. */
  onChange?: (index: number) => void;
  /** The current page's index (0-based). Default 0. */
  page?: number;
  /** Default `lg` (48px), as v11. */
  size?: 'sm' | 'md' | 'lg';
  /** Where the buttons' tooltips align. Default `center`. */
  tooltipAlignment?: 'start' | 'center' | 'end';
  /** Where the buttons' tooltips sit. Default `bottom`. */
  tooltipPosition?: 'top' | 'right' | 'bottom' | 'left';
  /** The number of pages. */
  totalItems?: number;
  translateWithId?: (id: TranslationId) => string;

  /* ── Beyond Carbon's API ─────────────────────────────────────────────── */

  /** The marker's color: `inverse` (default, neutral) or `hero` (the brand blue). */
  variant?: 'inverse' | 'hero';
  /** Motion dials; omitted keys take the selection kit's. */
  motion?: Partial<SelectionMotion>;
  /** Called as each glide of the marker starts, for a readout of each move. */
  onMove?: (info: SelectionMoveInfo) => void;
}

const PAGE = '.cds-pagination-nav__page';

interface PageItemProps {
  slotKey: string;
  index: number;
  active: boolean;
  /** In the window (a list with no role): a list item of the row still. */
  nested: boolean;
  /** The page's accessible prefix ("Active, Page" / "Page"). */
  label: string;
  /** Stable: records the page's button by page index. */
  setRef: (index: number, el: HTMLButtonElement | null) => void;
  /** Stable: a click with no pointer behind it picks the page. */
  onPick: (index: number) => void;
}

/** One page number, memoized as every selection list's rows are: a pick re-renders the nav, and only the pages whose number, place or state changed. */
const PageItem = memo(function PageItem({
  slotKey,
  index,
  active,
  nested,
  label,
  setRef,
  onPick,
}: PageItemProps) {
  return (
    <li
      className="cds-pagination-nav__item"
      // In the window (a list with no role), a list item of the row still.
      role={nested ? 'listitem' : undefined}
      {...reflowKey(slotKey)}>
      <button
        ref={(el) => setRef(index, el)}
        type="button"
        className="sel__item cds-pagination-nav__page"
        data-index={index}
        data-page={index + 1}
        data-selected={active ? '' : undefined}
        aria-current={active ? 'page' : undefined}
        // Pointer picks happen on pointerup (the gesture); a click with no
        // pointer behind it — Enter, Space, assistive tech — picks here.
        onClick={(e) => {
          if (e.detail === 0) onPick(index);
        }}>
        <span className="cds-pagination-nav__a11y">{label}</span>
        {/* The label layer: it slides when the window shifts; the button stays put. */}
        <span className="cds-pagination-nav__label" data-reflow-target="">
          <SelectionFaces>{index + 1}</SelectionFaces>
        </span>
      </button>
    </li>
  );
});

export const PaginationNav = forwardRef<HTMLElement, PaginationNavProps>(
  function PaginationNav(
    {
      className,
      disableOverflow = false,
      itemsShown = 10,
      loop = false,
      onChange,
      page: pageProp = 0,
      size = 'lg',
      tooltipAlignment = 'center',
      tooltipPosition = 'bottom',
      totalItems = NaN,
      translateWithId: t = defaultTranslateWithId,
      variant = 'inverse',
      motion,
      onMove,
      ...rest
    },
    ref
  ) {
    const total = Number.isFinite(totalItems) ? Math.max(0, totalItems) : 0;
    const shown = shownFor(itemsShown, size);
    const m: SelectionMotion = {
      ...SELECTION_KIT_MOTION,
      drag: false,
      ...motion,
    };
    const style = resolveSelectionStyle(
      {
        variant,
        size,
        selectedWeight: 600,
        selectorGlow: false,
        interaction: 'lightness',
      },
      m
    );

    /* ── the page and the window (v11's rules, in one state) ───────────── */

    const [state, setState] = useState(() => ({
      page: pageProp,
      prop: pageProp,
      cuts: calculateCuts(pageProp, total, shown),
      shape: `${total}|${shown}`,
    }));
    let { page, cuts } = state;
    // A new total or count re-cuts round the page; a new `page` prop moves to it (v11).
    if (state.shape !== `${total}|${shown}` || state.prop !== pageProp) {
      const nextPage = state.prop !== pageProp ? pageProp : page;
      const nextCuts =
        state.shape !== `${total}|${shown}`
          ? calculateCuts(nextPage, total, shown)
          : cutsAfter(nextPage, page, cuts, total, shown);
      setState({
        page: nextPage,
        prop: pageProp,
        cuts: nextCuts,
        shape: `${total}|${shown}`,
      });
      page = nextPage;
      cuts = nextCuts;
    }

    const jumpTo = (index: number) => {
      if (index < 0 || index >= total) return;
      setState((s) => ({
        ...s,
        page: index,
        cuts: cutsAfter(index, s.page, s.cuts, total, shown),
      }));
      if (index !== page) onChange?.(index);
    };
    const next = () => {
      const i = stepTarget(page, 1, total, loop);
      if (i >= 0) jumpTo(i);
    };
    const previous = () => {
      const i = stepTarget(page, -1, total, loop);
      if (i >= 0) jumpTo(i);
    };

    /* ── the row ───────────────────────────────────────────────────────── */

    const startOffset = shown <= 4 && page > 1 ? 0 : 1;
    const showFirst = shown >= 5 || (shown <= 4 && page <= 1);
    const middle = Array.from({ length: total }, (_, i) => i).slice(
      startOffset + cuts.front,
      (1 + cuts.back) * -1
    );
    type Slot =
      | { kind: 'page'; index: number }
      | {
          kind: 'overflow';
          side: 'front' | 'back';
          from: number;
          count: number;
        };
    const slots: Slot[] = [];
    const overflow = (side: 'front' | 'back', from: number, count: number) => {
      if (count > 1) slots.push({ kind: 'overflow', side, from, count });
      else if (count === 1) slots.push({ kind: 'page', index: from });
    };
    if (total > 0 && showFirst) slots.push({ kind: 'page', index: 0 });
    overflow('front', startOffset, cuts.front);
    for (const i of middle) slots.push({ kind: 'page', index: i });
    overflow('back', total - cuts.back - 1, cuts.back);
    if (total > 1) slots.push({ kind: 'page', index: total - 1 });
    const keyOf = (s: Slot) =>
      s.kind === 'page' ? `p${s.index}` : `of-${s.side}`;
    const rowKey = slots.map(keyOf).join(',');

    /* ── the marker ────────────────────────────────────────────────────── */

    const navRef = useRef<HTMLElement | null>(null);
    const setNavRef = useMemo(() => mergeRefs<HTMLElement>(navRef, ref), [ref]);
    const listRef = useRef<HTMLUListElement>(null);
    const pageEls = useRef(new Map<number, HTMLButtonElement>());
    const reduced = usePrefersReducedMotion();
    const reducedRef = useLatest(reduced);
    const pageRef = useLatest(page);
    const mRef = useLatest(m);
    const current = () => pageEls.current.get(pageRef.current) ?? null;
    const layoutKey = `${rowKey}/${size}`;

    const selRef = useSelectionEngine({
      rootRef: listRef,
      itemSelector: '.sel__item',
      motion: m,
      reduced,
      onMove,
      getRest: current,
      layoutKey,
    });
    useSelectedWeight(listRef, {
      weight: style.selectedWeight,
      holdWidth: true,
      itemSelector: PAGE,
      key: layoutKey,
    });

    // The window shifts: the row reflows as one strip, and the marker moves on its clock.
    const placed = useRef(false);
    useListReflow(navRef, {
      key: rowKey,
      mode: 'carry',
      timeScale: m.timeScale,
      reduced,
      reason: 'pagination-nav',
      // The marker keeps its own glide on the strip's clock rather than riding
      // the number it marks (a step that shifts by one leaves it still).
      transaction: 'item',
      onReflow: (move) => {
        const sel = selRef.current;
        const el = current();
        if (!sel || !el) return;
        sel.measure();
        if (move.ms > 0) {
          sel.configure({ timing: [{ under: Infinity, token: move.token }] });
          sel.moveTo(el, { direction: undefined });
          sel.configure({ timing: mRef.current.timing });
        } else sel.moveTo(el);
        placed.current = true;
      },
    });

    // Any other change of page: the marker glides there (unless a press already sent it).
    useLayoutEffect(() => {
      if (placed.current) {
        placed.current = false;
        return;
      }
      const sel = selRef.current;
      const el = current();
      if (sel && el && sel.target() !== el) sel.moveTo(el);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, selRef]);

    useItemRollover(listRef, {
      selector: `${PAGE}:not([data-selected]):not(:disabled), .cds-pagination-nav__overflow:not(:disabled)`,
      itemSelector: '.sel__item',
      press: m.pressColor,
      preview: false,
      timeScale: m.timeScale,
      reduced: reducedRef,
    });

    // A press on a page reaches toward it; the release picks it.
    const pagesInRow = () =>
      Array.from(
        listRef.current?.querySelectorAll<HTMLButtonElement>(PAGE) ?? []
      );
    const { onPointerDown: gestureDown } = useSelectionGesture({
      rootRef: listRef,
      selRef,
      axis: 'x',
      items: pagesInRow,
      isDisabled: () => false,
      selected: () =>
        pagesInRow().findIndex(
          (el) => Number(el.dataset.index) === pageRef.current
        ),
      motion: () => mRef.current,
      commit: (i) => {
        const el = pagesInRow()[i];
        if (el) jumpTo(Number(el.dataset.index));
      },
    });

    // A press on a chevron reaches toward the page it steps to, as a press on
    // that page does; the click picks it and the marker goes on from the
    // reach. Released off the chevron (no click), it reaches back. A page
    // behind a "…" isn't in the row: the window's reflow moves the marker.
    // Only the chevron that reached takes it back (the press on one blurs
    // the other).
    const reaching = useRef<1 | -1 | 0>(0);
    const reachToward = (dir: 1 | -1) => (e: { button: number }) => {
      if (e.button !== 0) return;
      const sel = selRef.current;
      const index = stepTarget(pageRef.current, dir, total, loop);
      const el = index >= 0 ? pageEls.current.get(index) : undefined;
      if (!sel || !el || index === pageRef.current) return;
      const row = pagesInRow();
      const centres = row.map((it) => {
        const r = sel.rectOf(it);
        return (r.l + r.r) / 2;
      });
      sel.reach(el, reachPx(mRef.current.reach, centres, row.indexOf(el)));
      reaching.current = dir;
    };
    const reachBack = (dir: 1 | -1) => () => {
      if (reaching.current !== dir) return;
      reaching.current = 0;
      const sel = selRef.current;
      const el = current();
      if (sel && el) sel.moveTo(el);
    };
    const step = (go: () => void) => () => {
      reaching.current = 0;
      go();
    };
    const chevron = (dir: 1 | -1) => ({
      onPointerDown: reachToward(dir),
      onPointerLeave: reachBack(dir),
      onPointerCancel: reachBack(dir),
      onBlur: reachBack(dir),
      onClick: step(dir === 1 ? next : previous),
    });

    /* ── render ────────────────────────────────────────────────────────── */

    // The page buttons' handlers: stable, so the memoized buttons (PageItem)
    // re-render only when their own page, label or state changed.
    const setPageEl = useCallback(
      (index: number, el: HTMLButtonElement | null) => {
        if (el) pageEls.current.set(index, el);
        else pageEls.current.delete(index);
      },
      []
    );
    const pickByClick = useStableCallback(jumpTo);

    const itemLabel = t('carbon.pagination-nav.item');
    const tooltipAlign =
      tooltipAlignment === 'center'
        ? tooltipPosition
        : `${tooltipPosition}-${tooltipAlignment}`;
    const backDisabled = !loop && page === 0;
    const forwardDisabled = !loop && page === total - 1;

    // The row in three parts: what comes before the window (the first page,
    // the front "…"), the window's numbers, and what comes after it.
    const inWindow = (sl: Slot) =>
      sl.kind === 'page' && sl.index !== 0 && sl.index !== total - 1;
    const firstIn = slots.findIndex(inWindow);
    const lastIn = slots.length - 1 - [...slots].reverse().findIndex(inWindow);
    const before = firstIn < 0 ? slots : slots.slice(0, firstIn);
    const windowed = firstIn < 0 ? [] : slots.slice(firstIn, lastIn + 1);
    const after = firstIn < 0 ? [] : slots.slice(lastIn + 1);

    const renderSlot = (s: Slot, nested = false): ReactNode => {
      if (s.kind === 'overflow') {
        return (
          <li
            key={keyOf(s)}
            className="cds-pagination-nav__item"
            {...reflowKey(keyOf(s))}
            data-reflow-still="">
            <PageOverflow
              fromIndex={s.from}
              count={s.count}
              onSelect={jumpTo}
              disabled={disableOverflow}
              label={`Select ${itemLabel} number`}
              size={size}
              timeScale={m.timeScale}
            />
          </li>
        );
      }
      const active = s.index === page;
      return (
        <PageItem
          key={keyOf(s)}
          slotKey={keyOf(s)}
          index={s.index}
          active={active}
          nested={nested}
          label={
            active
              ? `${t('carbon.pagination-nav.active')}, ${itemLabel}`
              : itemLabel
          }
          setRef={setPageEl}
          onPick={pickByClick}
        />
      );
    };

    return (
      <nav
        {...rest}
        ref={setNavRef}
        className={[
          'cds-pagination-nav',
          `cds-pagination-nav--${size}`,
          className,
        ]
          .filter(Boolean)
          .join(' ')}>
        <TooltipGroup align={tooltipAlign as never}>
          <ul
            ref={listRef}
            className={[...style.classes, 'cds-pagination-nav__list']
              .filter(Boolean)
              .join(' ')}
            // A leaving "…"'s copy goes in the list, so it keeps the list's look.
            data-reflow-clip=""
            style={{
              ['--sel-on-weight' as string]: style.selectedWeight ?? undefined,
            }}
            onPointerDown={(e) => gestureDown(e, PAGE)}>
            <li className="cds-pagination-nav__marker" aria-hidden="true">
              <SelectionMarker />
            </li>
            <li className="cds-pagination-nav__item" {...reflowKey('back')}>
              <IconButton
                frame="ghost"
                size={size}
                corners="full"
                label={t('carbon.pagination-nav.previous')}
                disabled={backDisabled}
                className="cds-pagination-nav__direction"
                {...chevron(-1)}>
                <CaretLeft aria-hidden="true" />
              </IconButton>
            </li>
            {before.map((sl) => renderSlot(sl))}
            {windowed.length > 0 && (
              // The window: the numbers that travel when it shifts, between
              // soft edges, so a number fades out under the edge before it
              // reaches a "…" (and the first or last page). A list item of
              // the row with no role of its own; its numbers are the row's.
              <li
                key="window"
                className="cds-pagination-nav__window"
                role="none">
                <ul
                  className="cds-pagination-nav__strip"
                  role="none"
                  data-reflow-clip="">
                  {windowed.map((sl) => renderSlot(sl, true))}
                </ul>
              </li>
            )}
            {after.map((sl) => renderSlot(sl))}
            <li className="cds-pagination-nav__item" {...reflowKey('forward')}>
              <IconButton
                frame="ghost"
                size={size}
                corners="full"
                label={t('carbon.pagination-nav.next')}
                disabled={forwardDisabled}
                className="cds-pagination-nav__direction"
                {...chevron(1)}>
                <CaretRight aria-hidden="true" />
              </IconButton>
            </li>
          </ul>
        </TooltipGroup>
        <div
          aria-live="polite"
          aria-atomic="true"
          className="cds-pagination-nav__a11y">
          {`${itemLabel} ${page + 1} ${t('carbon.pagination-nav.of')} ${total}`}
        </div>
      </nav>
    );
  }
);
PaginationNav.displayName = 'PaginationNav';
