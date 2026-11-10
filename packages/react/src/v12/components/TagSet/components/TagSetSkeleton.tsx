/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { SkeletonOf } from '@carbon-labs/react-feedback';
import { TagSet, type TagSetProps } from './TagSet';

/* ============================================================================
 * TagSetSkeleton: a tag set, loading.
 *
 *   data      each tag is one block of its own box and corners; the row
 *             wraps and overflows as the loaded set's (`labels`, cycled)
 *
 * API: the TagSet's layout props, plus `count` and `labels`.
 * ========================================================================== */

export interface TagSetSkeletonProps extends Pick<
  TagSetProps,
  'size' | 'maxVisible' | 'multiline' | 'className'
> {
  /** How many tags. Default 4. */
  count?: number;
  /** The expected labels, for the tags' widths (cycled). */
  labels?: readonly string[];
}

const LABELS = ['Tag label', 'Another tag', 'Tag', 'A longer tag'];

export function TagSetSkeleton({
  count = 4,
  labels = LABELS,
  ...rest
}: TagSetSkeletonProps) {
  const tags = Array.from({ length: count }, (_, i) => ({
    id: String(i),
    label: labels[i % labels.length]!,
    arrive: false,
  }));
  return (
    <SkeletonOf blocks=".cds-tag-set__row .cds-tag">
      <TagSet {...rest} tags={tags} />
    </SkeletonOf>
  );
}
