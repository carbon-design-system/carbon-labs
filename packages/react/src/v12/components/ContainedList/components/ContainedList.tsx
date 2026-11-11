/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  type ElementType,
  type HTMLAttributes,
  type LiHTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { attachRollover } from '@carbon-labs/v12-motion';
import { usePrefersReducedMotion, useStagger } from '@carbon-labs/v12-motion';
import { ExpandableSearch, Search } from '@carbon-labs/react-search';
import {
  useContainerCorners,
  type ContainerCorners,
} from '@carbon-labs/react-kit-defaults';
import { useFilterPresence } from './useFilterPresence';
import './contained-list.scss';
import { cx } from '@carbon-labs/react-util';
import { useReducedGetter } from '@carbon-labs/react-util';

/* ============================================================================
 * ContainedList and ContainedListItem — Carbon v11's, on the kit's look
 * and motion. The same props and markup (`ul role="list"` labelled by the
 * header; an item is an `li`, its content a `button` when it has `onClick`).
 *
 *   kind      `on-page` (default): the label in `heading-compact-01` over a
 *             hairline, as tall as an item; `disclosed`: a 32px
 *             `label-01` header on `$layer`, for a list inside a disclosure.
 *             The header stays at the top while the list scrolls
 *   size      sm 32 · md 40 · lg 48 (default) · xl 64px items, 16px in
 *   isInset   the hairlines between items stop 16px short of each side
 *   action    a control at the header's end (a button, a search). The
 *             kit's `Search` or `ExpandableSearch` there is the list's
 *             search: the list's own Search children are left out (v11's),
 *             and it takes the room beside the label, in the kit's field
 *   items     `renderIcon` before the text (a motion icon plays on the
 *             item's hover when it's clickable; on a static item it's
 *             still); `action` at the item's end; `disabled`
 *   hover     a clickable item takes the rollover: an even wash across the
 *             row (`--rollover-flat`, a row in a wide list), a flat press
 *             with no inset (flush with its hairlines), the release circle
 *             from the point of release. A static item doesn't answer the
 *             pointer
 *   filter    when the items change (a search narrowing them, one removed),
 *             out, then in: the leaving items fade where they are; then the
 *             list's height and the items that stay move as ONE layout
 *             transaction (`animateLayout`), its clock from the farthest
 *             travel; then the new items fade in, staggered (`useStagger`).
 *             Typing (changes under 200ms apart) lands at once.
 *             `useFilterPresence`
 *   keyboard  v11's: each clickable item is a button in the tab order; the
 *             kit's ring, 2px `$text-primary` inside the item's edge
 *   reduced   the rollover's hover and release at once; the filter as fades
 *             on the reduced clock, the height at once
 *   corners   `square` (v11, the default) or `rounded`, inside a card or a
 *             rounded region: 8px on the list, and the rows at its corners
 *             (the header, or the first item; the last item) on the same
 *             radius (they sit at inset 0), their hover and focus ring too.
 *             Given none, KitDefaults' (a rounded Region's)
 *
 * The kit adds `timeScale` (slow motion) and `corners` on the list.
 * ========================================================================== */

export type ContainedListKind = 'on-page' | 'disclosed';
export type ContainedListSize = 'sm' | 'md' | 'lg' | 'xl';

/** Item heights, px (v11's layout sizes). */
const ITEM_PX: Record<ContainedListSize, number> = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

const isSearch = (node: unknown): boolean =>
  isValidElement(node) &&
  (node.type === Search || node.type === ExpandableSearch);

export interface ContainedListProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  /** A control at the header's end (shown with a `label`). A Search is the list's search. */
  action?: ReactNode;
  /** `ContainedListItem`s. */
  children?: ReactNode;
  className?: string;
  /** Hairlines between items stop short of the sides. */
  isInset?: boolean;
  /** `on-page` (default) or `disclosed`. */
  kind?: ContainedListKind;
  /** The list's label: its header, and its accessible name. */
  label?: ReactNode;
  /** sm (32) · md (40) · lg (48, default) · xl (64). */
  size?: ContainedListSize;
  /** Slow motion for the filter and the rollover's release. Default 1. */
  timeScale?: number;
  // @carbon-explore corners-prop — Corner mode is one `corners` prop (full, rounded or square) that a provider can set for a subtree, where `rounded` is the component's own radius. TBD
  /** `square` (v11, default) or `rounded` (8px), inside a card or a rounded region. Default: KitDefaults' (a Region's), else `square`. */
  corners?: ContainerCorners;
}

export function ContainedList({
  action,
  children,
  className,
  isInset = false,
  kind = 'on-page',
  label,
  size,
  timeScale = 1,
  corners: cornersProp,
  ...rest
}: ContainedListProps) {
  const corners = useContainerCorners(cornersProp);
  const labelId = `cds-contained-list-${useId().replace(/:/g, '')}-header`;
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const reduced = usePrefersReducedMotion();
  const rolloverReduced = useReducedGetter();

  // v11: with a search as the action, a Search among the children is left
  // out; without one, it sits above the items (sticky under the header).
  const actionSearch = isSearch(action);
  // The header frames its search: a ghost field unless the search names its own frame.
  const headerAction =
    actionSearch &&
    (action as ReactElement<{ frame?: string }>).props.frame === undefined
      ? cloneElement(action as ReactElement<{ frame?: string }>, {
          frame: 'ghost',
        })
      : action;
  const all = Children.toArray(children);
  const searches = actionSearch ? [] : all.filter(isSearch);
  const items = all.filter(
    (c): c is ReactElement => isValidElement(c) && !isSearch(c)
  );
  const keyed = items.map((c) =>
    cloneElement(c as ReactElement<Record<string, unknown>>, {
      'data-cds-key': String(c.key),
    })
  );

  const stagger = useStagger({
    count: Math.max(1, keyed.length),
    size: ITEM_PX[size ?? 'lg'],
  });
  const shown = useFilterPresence(rootRef, listRef, keyed, {
    timeScale,
    reduced,
    staggerDelay: stagger.delay,
  });

  // The items' hover and press: the rollover, delegated from the list.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return attachRollover(root, {
      selector: '.cds-contained-list-item__content--clickable',
      timeScale,
      reduced: rolloverReduced,
    });
  }, [timeScale, rolloverReduced]);

  return (
    <div
      {...rest}
      ref={rootRef}
      className={cx(
        'cds-contained-list',
        `cds-contained-list--${kind}`,
        `cds-contained-list--${size ?? 'lg'}`,
        isInset && 'cds-contained-list--inset-rulers',
        actionSearch && 'cds-contained-list--action-search',
        corners === 'rounded' && 'cds-contained-list--rounded',
        className
      )}>
      {label && (
        <div className="cds-contained-list__header">
          <div id={labelId} className="cds-contained-list__label">
            {label}
          </div>
          {action != null && (
            <div className="cds-contained-list__action">{headerAction}</div>
          )}
        </div>
      )}
      {searches.length > 0 && (
        <div className="cds-contained-list__search">{searches}</div>
      )}
      {children ? (
        <ul
          ref={listRef}
          role="list"
          aria-labelledby={label ? labelId : undefined}>
          {shown}
        </ul>
      ) : null}
    </div>
  );
}
ContainedList.displayName = 'ContainedList';

/* ── items ─────────────────────────────────────────────────────────────── */

export interface ContainedListItemProps extends Omit<
  LiHTMLAttributes<HTMLLIElement>,
  'onClick'
> {
  /** A control at the item's end (an icon button, an overflow menu). */
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** A clickable item that can't be used. */
  disabled?: boolean;
  /** Makes the item a button. */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** An icon before the text: a motion icon, which plays on a clickable item's hover. */
  renderIcon?: ElementType;
}

export function ContainedListItem({
  action,
  children,
  className,
  disabled = false,
  onClick,
  renderIcon: Icon,
  ...rest
}: ContainedListItemProps) {
  const clickable = onClick !== undefined;
  const content = (
    <>
      {Icon && (
        <span className="cds-contained-list-item__icon" aria-hidden="true">
          <Icon size={16} />
        </span>
      )}
      <span className="cds-contained-list-item__text">{children}</span>
    </>
  );
  return (
    <li
      {...rest}
      className={cx(
        'cds-contained-list-item',
        clickable && 'cds-contained-list-item--clickable',
        Icon && 'cds-contained-list-item--with-icon',
        action != null && 'cds-contained-list-item--with-action',
        className
      )}>
      {clickable ? (
        <button
          type="button"
          className="cds-contained-list-item__content cds-contained-list-item__content--clickable"
          disabled={disabled}
          onClick={onClick}
          {...(Icon ? { 'data-motion-icon-frame': '' } : null)}>
          {content}
        </button>
      ) : (
        <div className="cds-contained-list-item__content">{content}</div>
      )}
      {action != null && (
        <div className="cds-contained-list-item__action">{action}</div>
      )}
    </li>
  );
}
ContainedListItem.displayName = 'ContainedListItem';

// v11: `ContainedList.ContainedListItem`.
Object.assign(ContainedList, { ContainedListItem });
