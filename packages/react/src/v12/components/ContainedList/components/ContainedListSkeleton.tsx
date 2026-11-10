/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { SkeletonOf, SkeletonRun } from '@carbon-labs/react-feedback';
import {
  ContainedList,
  ContainedListItem,
  type ContainedListProps,
} from './ContainedList';

/* ============================================================================
 * ContainedListSkeleton: a contained list, loading.
 *
 *   known     the header (`label`), the rows and their hairlines, drawn as themselves
 *   data      each row's text: a bar at its expected width (`items`, cycled)
 *
 * API: the ContainedList's layout props, plus `count` and `items`.
 * ========================================================================== */

export interface ContainedListSkeletonProps extends Pick<
  ContainedListProps,
  'label' | 'kind' | 'size' | 'isInset' | 'className'
> {
  /** How many rows. Default 4. */
  count?: number;
  /** The expected row texts, for the bars' widths (cycled). */
  items?: readonly string[];
}

const ITEMS = ['List item', 'Another list item', 'Item', 'A longer list item'];

export function ContainedListSkeleton({
  count = 4,
  items = ITEMS,
  ...rest
}: ContainedListSkeletonProps) {
  return (
    <SkeletonOf>
      <ContainedList {...rest}>
        {Array.from({ length: count }, (_, i) => (
          <ContainedListItem key={i}>
            <SkeletonRun>{items[i % items.length]}</SkeletonRun>
          </ContainedListItem>
        ))}
      </ContainedList>
    </SkeletonOf>
  );
}
