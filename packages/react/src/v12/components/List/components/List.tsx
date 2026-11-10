/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import type {
  HTMLAttributes,
  LiHTMLAttributes,
  OlHTMLAttributes,
  ReactNode,
} from 'react';
import './list.scss';
import { cx } from '@carbon-labs/react-util';

/* ============================================================================
 * UnorderedList, OrderedList, ListItem — Carbon v11's text lists, on the
 * kit's type scale. Static text: no hover, no motion (principle 5: elements
 * that are not interactive don't respond).
 *
 *   type       `body-01` (productive, default); `isExpressive` takes
 *              `body-02`, nested lists included
 *   unordered  an en dash before each item, 16px out; nested, a small square
 *   ordered    a counter and a period, 24px out; nested, lower-latin.
 *              `native` uses the browser's own decimal markers
 *   nested     inside a ListItem: 32px in, its items 4px further and 4px apart
 *   space      8px between top-level items; 4px from an item to its nested list
 *   color      three steps, so it doesn't read flat: an item
 *              in `$text-primary`, a nested list's items in
 *              `$text-secondary`; markers one step under their item's
 *              text, `$text-secondary` at the top level and `$text-helper`
 *              nested (v11: all `$text-primary`)
 *
 * v11's props: UnorderedList `nested`, `isExpressive`, `className`;
 * OrderedList `nested`, `native`, `isExpressive`, `className`; ListItem
 * `className`, `children`. Every other attribute reaches the element.
 * ========================================================================== */

export interface UnorderedListProps extends HTMLAttributes<HTMLUListElement> {
  children?: ReactNode;
  className?: string;
  /** A list inside a ListItem. */
  nested?: boolean;
  /** The expressive type size (`body-02`). */
  isExpressive?: boolean;
}

export function UnorderedList({
  className,
  nested = false,
  isExpressive = false,
  ...rest
}: UnorderedListProps) {
  return (
    <ul
      {...rest}
      className={cx(
        'cds-list',
        'cds-list--unordered',
        nested && 'cds-list--nested',
        isExpressive && 'cds-list--expressive',
        className
      )}
    />
  );
}

export interface OrderedListProps extends OlHTMLAttributes<HTMLOListElement> {
  children?: ReactNode;
  className?: string;
  /** A list inside a ListItem. */
  nested?: boolean;
  /** The browser's own markers (decimal; lower-latin nested). */
  native?: boolean;
  /** The expressive type size (`body-02`). */
  isExpressive?: boolean;
}

export function OrderedList({
  className,
  nested = false,
  native = false,
  isExpressive = false,
  ...rest
}: OrderedListProps) {
  return (
    <ol
      {...rest}
      className={cx(
        'cds-list',
        native ? 'cds-list--ordered-native' : 'cds-list--ordered',
        nested && 'cds-list--nested',
        isExpressive && 'cds-list--expressive',
        className
      )}
    />
  );
}

export interface ListItemProps extends LiHTMLAttributes<HTMLLIElement> {
  children?: ReactNode;
  className?: string;
}

export function ListItem({ className, children, ...rest }: ListItemProps) {
  return (
    <li {...rest} className={cx('cds-list__item', className)}>
      {children}
    </li>
  );
}
