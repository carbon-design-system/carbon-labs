/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { SkeletonOf, SkeletonRun } from '@carbon-labs/react-feedback';
import { Breadcrumb, BreadcrumbItem, type BreadcrumbProps } from './Breadcrumb';

/* ============================================================================
 * BreadcrumbSkeleton: a breadcrumb, loading.
 *
 *   known     the slashes, drawn as themselves
 *   data      each crumb: a bar at its expected width (`items`, cycled)
 *
 * API: Carbon's BreadcrumbSkeleton, plus the layout props, `count` and `items`.
 * ========================================================================== */

export interface BreadcrumbSkeletonProps extends Pick<
  BreadcrumbProps,
  'size' | 'noTrailingSlash' | 'className'
> {
  /** How many crumbs. Default 3. */
  count?: number;
  /** The expected crumbs, for the bars' widths (cycled). */
  items?: readonly string[];
}

const ITEMS = ['Breadcrumb', 'Another crumb', 'Crumb'];

export function BreadcrumbSkeleton({
  count = 3,
  items = ITEMS,
  ...rest
}: BreadcrumbSkeletonProps) {
  return (
    <SkeletonOf>
      <Breadcrumb {...rest}>
        {Array.from({ length: count }, (_, i) => (
          <BreadcrumbItem key={i} href="#">
            <SkeletonRun>{items[i % items.length]}</SkeletonRun>
          </BreadcrumbItem>
        ))}
      </Breadcrumb>
    </SkeletonOf>
  );
}
