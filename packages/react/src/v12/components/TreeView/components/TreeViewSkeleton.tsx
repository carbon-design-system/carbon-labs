/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { SkeletonOf, SkeletonRun } from '@carbon-labs/react-feedback';
import { TreeNode, TreeView, type TreeViewProps } from './TreeView';

/* ============================================================================
 * TreeViewSkeleton: a tree, loading.
 *
 *   known     the rows, their indents and the tree's label, drawn as themselves
 *   data      each node's label: a bar at its expected width (`labels`, cycled)
 *
 * API: the TreeView's layout props, plus `count` and `labels`.
 * ========================================================================== */

export interface TreeViewSkeletonProps extends Pick<
  TreeViewProps,
  'size' | 'hideLabel' | 'className'
> {
  /** The tree's name. Default "Loading". */
  label?: string;
  /** How many top-level nodes. Default 4. */
  count?: number;
  /** The expected labels, for the bars' widths (cycled). */
  labels?: readonly string[];
}

const LABELS = ['Node label', 'Another node', 'Node', 'A longer node label'];

export function TreeViewSkeleton({
  label = 'Loading',
  count = 4,
  labels = LABELS,
  ...rest
}: TreeViewSkeletonProps) {
  return (
    <SkeletonOf>
      <TreeView {...rest} label={label}>
        {Array.from({ length: count }, (_, i) => (
          <TreeNode
            key={i}
            id={String(i)}
            label={<SkeletonRun>{labels[i % labels.length]}</SkeletonRun>}
          />
        ))}
      </TreeView>
    </SkeletonOf>
  );
}
