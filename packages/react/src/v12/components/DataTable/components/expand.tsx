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
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type ThHTMLAttributes,
} from 'react';
import { attachRollover } from '@carbon-labs/v12-motion';
import { usePrefersReducedMotion } from '@carbon-labs/v12-motion';
import { ChevronDownUpToggle } from '@carbon-labs/react-motion-icons';
import {
  useDisclosureBody,
  useDisclosureMoves,
} from '@carbon-labs/react-disclosure';
import { cx } from '@carbon-labs/react-util';
import { useReducedGetter } from '@carbon-labs/react-util';
import { inertProps } from '@carbon-labs/react-util';

/* ============================================================================
 * Expandable rows on the kit's look, not v11's components. v11's TableExpandRow,
 * TableExpandHeader and TableExpandedRow, prop for prop.
 *
 *   chevron   the side nav's disclosure, a motion icon
 *             (`ChevronDownUpToggle`, down shut, up open) on the house
 *             rollover: a wash of the text color, 8% hover, 16% press
 *   lines     the parent and its expanded content read as one row: no
 *             hairline between them, one under the content
 *   push      the content pushes the rows below open: the kit's disclosure
 *             (`../disclosure`, the one implementation of the expanding
 *             standards, shared with the Accordion and the ExpandableTile),
 *             one layout transaction on the table, so the rows below move
 *             once and anything inside holds or follows; the soft edge and
 *             a content lead on entrance, the soft edge and no content move
 *             on exit:
 *               clock  the travel's step (`durationStepForDistance`: a
 *                      24-120px row, moderate-01, 160ms), entrance
 *                      productive; it closes one step faster (fast-02,
 *                      120ms), exit productive
 *               open   the height opens through the soft edge
 *                      (`min(16px, h, H − h)`), and the content moves with
 *                      the opening: 8px down into place from above over
 *                      fast-02, starting once the height is half open, so it
 *                      lands just after the height does. The standard for
 *                      all expanding content: by default it moves with the
 *                      opening
 *               close  the soft edge closes the height; the content doesn't
 *                      move. Shut, it stays clipped until the row hides (it
 *                      flickered: one frame of its content over the rows
 *                      below, between the clip letting go and the hide)
 *               all    rows that move in one commit (expand all) are one
 *                      motion: one transaction, one clock (the total
 *                      travel's step, what the rows below the last travel,
 *                      capped at moderate-02, 220ms, and 160ms shutting:
 *                      the disclosure's multi-body cap), the same start
 *                      frame
 *             The content row adds only its body's height (no row height,
 *             no extra line: data-table.scss), so shut is exactly where the
 *             rows below were. The content is clipped, never scaled. A
 *             toggle mid-move turns round from where it is, and the content
 *             resumes at once. Reduced motion: at once, no edge; the content
 *             fades in on the reduced clock
 *   state     TableExpandedRow follows its parent row (`data-expanded` on
 *             the TableExpandRow before it), as v11's follows its parent's
 *             class, so it can stay rendered and animate both ways. Or pass
 *             `isExpanded` (the kit's). Mounted or unmounted with the
 *             row, it just appears and goes
 * ========================================================================== */

/** The chevron button: a motion icon on the house rollover. */
function ExpandButton({
  expanded,
  onClick,
  label,
  title,
  controls,
  timeScale,
}: {
  expanded: boolean;
  timeScale?: number;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  label?: string;
  title?: string;
  controls?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const rolloverReduced = useReducedGetter();
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    return attachRollover(node, {
      selector: '.cds-table-expand__button',
      colors: 'tokens',
      timeScale,
      reduced: rolloverReduced,
    });
  }, [rolloverReduced, timeScale]);
  return (
    <button
      ref={ref}
      type="button"
      className="cds-table-expand__button"
      data-motion-icon-frame=""
      onClick={onClick}
      title={title}
      aria-label={label}
      aria-expanded={expanded}
      aria-controls={controls}>
      <ChevronDownUpToggle
        size={16}
        toggled={expanded}
        disableToggle
        aria-hidden="true"
      />
    </button>
  );
}

export interface TableExpandHeaderProps extends ThHTMLAttributes<HTMLTableCellElement> {
  'aria-controls'?: string;
  'aria-label'?: string;
  /** @deprecated v11: `aria-label`. */
  ariaLabel?: string;
  /** @deprecated v11: `enableToggle`. */
  enableExpando?: boolean;
  /** Show the expand-all button. */
  enableToggle?: boolean;
  expandIconDescription?: string;
  id?: string;
  isExpanded?: boolean;
  onExpand?: (event: MouseEvent<HTMLButtonElement>) => void;
  children?: ReactNode;
  /** Slow motion: multiplies the expand-all button's rollover. Default 1. */
  timeScale?: number;
}

export function TableExpandHeader({
  'aria-controls': ariaControls,
  'aria-label': ariaLabel,
  ariaLabel: deprecatedAriaLabel,
  className,
  enableExpando,
  enableToggle,
  expandIconDescription,
  id = 'expand',
  isExpanded = false,
  onExpand,
  children,
  timeScale,
  ...rest
}: TableExpandHeaderProps) {
  return (
    <th
      {...rest}
      scope="col"
      id={id}
      className={cx('cds-table-expand', className)}>
      {enableToggle || enableExpando ? (
        <ExpandButton
          expanded={isExpanded}
          onClick={onExpand}
          label={ariaLabel ?? deprecatedAriaLabel}
          title={expandIconDescription}
          controls={ariaControls}
          timeScale={timeScale}
        />
      ) : null}
      {children}
    </th>
  );
}

export interface TableExpandRowProps extends HTMLAttributes<HTMLTableRowElement> {
  'aria-controls'?: string;
  'aria-label'?: string;
  /** @deprecated v11: `aria-label`. */
  ariaLabel?: string;
  isExpanded?: boolean;
  onExpand?: (event: MouseEvent<HTMLButtonElement>) => void;
  expandIconDescription?: string;
  isSelected?: boolean;
  /** The expand header's id. Default `expand`. */
  expandHeader?: string;
  /** From `getRowProps`; not drawn on the row. */
  disabled?: boolean;
  children?: ReactNode;
  /** Slow motion: multiplies the expand button's rollover. Default 1. */
  timeScale?: number;
}

export const TableExpandRow = forwardRef<
  HTMLTableRowElement,
  TableExpandRowProps
>(function TableExpandRow(
  {
    'aria-controls': ariaControls,
    'aria-label': ariaLabel,
    ariaLabel: deprecatedAriaLabel,
    className,
    children,
    isExpanded = false,
    onExpand,
    expandIconDescription,
    isSelected,
    expandHeader = 'expand',
    disabled: _disabled,
    timeScale,
    ...rest
  },
  ref
) {
  return (
    <tr
      {...rest}
      ref={ref}
      className={cx(
        'cds-table-expand-row',
        isExpanded && 'cds-table-expand-row--expanded',
        isSelected && 'cds--data-table--selected',
        className
      )}
      data-expanded={isExpanded ? '' : undefined}>
      <td className="cds-table-expand" headers={expandHeader}>
        <ExpandButton
          expanded={isExpanded}
          onClick={onExpand}
          label={ariaLabel ?? deprecatedAriaLabel}
          title={expandIconDescription}
          controls={ariaControls}
          timeScale={timeScale}
        />
      </td>
      {children}
    </tr>
  );
});

export interface TableExpandedRowProps extends HTMLAttributes<HTMLTableRowElement> {
  colSpan: number;
  children?: ReactNode;
  /** Open or shut. Default: follow the TableExpandRow before it. */
  isExpanded?: boolean;
  /** Slow motion: multiplies the opening and shutting. Default: the page's duration tokens (1). */
  timeScale?: number;
}

/** Whether the row before `el` (a TableExpandRow) is expanded. */
const parentOpen = (el: HTMLElement | null) =>
  !!el?.previousElementSibling?.hasAttribute('data-expanded');

/**
 * Bodies shown in this commit as they open (their rows were hidden): each
 * takes its shut style for one style pass, all in one (a microtask queued
 * before the disclosure's moves), then opens from it. Per row, a later
 * row's pass would land after an earlier one's had shown it open.
 */
const priming = new Set<HTMLElement>();

function primeShut(el: HTMLElement) {
  el.removeAttribute('data-open');
  priming.add(el);
  if (priming.size > 1) return;
  queueMicrotask(() => {
    const els = [...priming];
    priming.clear();
    void getComputedStyle(els[0]!).gridTemplateRows;
    for (const e of els) e.setAttribute('data-open', '');
  });
}

/** A content row's moves: under its table, so every row moving in one commit (expand all) is one motion. */
const tableOf = (body: HTMLElement) => body.closest('table');

export function TableExpandedRow({
  className,
  children,
  colSpan,
  isExpanded,
  timeScale,
  ...rest
}: TableExpandedRowProps) {
  const row = useRef<HTMLTableRowElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  // Following the parent row: its `data-expanded`, watched.
  const [followed, setFollowed] = useState<boolean | null>(null);
  const open = isExpanded ?? followed ?? false;

  // Shut and landed, the row is hidden (display: none: a 0px row in a
  // collapsed table still took half its neighbours' lines). A hidden body
  // has no style to move from, so opening, the commit that shows the row
  // gives it its shut style first (`primeShut`, before the disclosure starts
  // its move): the open moves from there, in that commit.
  const wasHidden = useRef(!open);
  useLayoutEffect(() => {
    if (open && wasHidden.current && bodyRef.current)
      primeShut(bodyRef.current);
  }, [open]);

  // Expand all: every row in one motion, `expand-all` / `collapse-all`.
  const moves = useDisclosureMoves(tableOf, {
    reason: (n) => (open ? 'expand' : 'collapse') + (n > 1 ? '-all' : ''),
    timeScale,
  });
  const body = useDisclosureBody(bodyRef, open, moves, reduced);
  // In the table while open or closing.
  const present = open || body.present;
  useLayoutEffect(() => {
    wasHidden.current = !present;
  });

  useLayoutEffect(() => {
    if (isExpanded !== undefined) return;
    const el = row.current;
    const parent = el?.previousElementSibling;
    // The parent's state as first read, open: just there, no push.
    if (parentOpen(el) && !present && el) {
      el.dataset.still = '';
      requestAnimationFrame(() =>
        requestAnimationFrame(() => delete el.dataset.still)
      );
    }
    setFollowed(parentOpen(el));
    if (!parent) return;
    const mo = new MutationObserver(() => setFollowed(parentOpen(row.current)));
    mo.observe(parent, {
      attributes: true,
      attributeFilter: ['data-expanded'],
    });
    return () => mo.disconnect();
    // `present` is read once, at the first follow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded]);

  return (
    <tr
      {...rest}
      ref={row}
      className={cx('cds-table-expanded', className)}
      hidden={!present || undefined}
      aria-hidden={!open || undefined}
      // Closing, it is hidden from assistive tech and out of reach of the keys too (audit DT-5).
      {...inertProps(!open)}>
      <td colSpan={colSpan}>
        <div
          ref={bodyRef}
          className="cds-disclosure__body cds-table-expanded__body"
          {...body.bodyProps}>
          <div className="cds-disclosure__clip">
            <div className="cds-disclosure__content cds-table-expanded__content">
              {children}
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}
