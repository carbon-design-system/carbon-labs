/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useId } from 'react';
import { SkeletonOf } from '@carbon-labs/react-feedback';
import { Search, type SearchProps } from './Search';

/* ============================================================================
 * SearchSkeleton: the search, loading.
 *
 *   data      the field is one block of its own box and corners: a search
 *             waits on the data it searches
 *
 * API: Carbon's SearchSkeleton, plus the Search's layout props.
 * ========================================================================== */

export interface SearchSkeletonProps extends Partial<
  Pick<SearchProps, 'size' | 'corners' | 'className'>
> {
  id?: string;
  /** Carbon's `small`: size sm. */
  small?: boolean;
}

export function SearchSkeleton({
  id,
  small = false,
  size,
  ...rest
}: SearchSkeletonProps) {
  const auto = useId();
  return (
    <SkeletonOf blocks=".cds-search__field">
      <Search
        {...rest}
        id={id ?? auto}
        size={small ? 'sm' : size}
        labelText="Search"
      />
    </SkeletonOf>
  );
}
