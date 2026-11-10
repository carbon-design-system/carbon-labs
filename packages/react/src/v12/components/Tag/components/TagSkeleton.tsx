/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { SkeletonOf } from '@carbon-labs/react-feedback';
import { Tag, type TagProps } from './Tag';

/* ============================================================================
 * TagSkeleton: a tag, loading.
 *
 *   data      the whole tag is one block of its own box and corners, as wide
 *             as its expected text (`children`, default "Tag label")
 *
 * API: Carbon's TagSkeleton (`size`), plus the Tag's layout props.
 * ========================================================================== */

export type TagSkeletonProps = Partial<
  Pick<TagProps, 'size' | 'corners' | 'renderIcon' | 'className' | 'children'>
>;

export function TagSkeleton({
  children = 'Tag label',
  ...rest
}: TagSkeletonProps) {
  return (
    <SkeletonOf blocks=".cds-tag">
      <Tag {...rest} arrive={false}>
        {children}
      </Tag>
    </SkeletonOf>
  );
}
