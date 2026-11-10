/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { SkeletonOf, SkeletonRun } from '@carbon-labs/react-feedback';
import {
  ProgressIndicator,
  ProgressStep,
  type ProgressIndicatorProps,
} from './ProgressIndicator';

/* ============================================================================
 * ProgressIndicatorSkeleton: a progress indicator, loading.
 *
 *   known     the steps' rules, drawn as themselves
 *   data      each step's label: a bar; its state (the mark, the current
 *             step's marker) waits, unseen
 *
 * API: Carbon's ProgressIndicatorSkeleton , plus `count`, `labels`, `spaceEqually`.
 * ========================================================================== */

export interface ProgressIndicatorSkeletonProps extends Pick<
  ProgressIndicatorProps,
  'vertical' | 'spaceEqually' | 'className'
> {
  /** How many steps. Default 4. */
  count?: number;
  /** The expected labels, for the bars' widths (cycled). */
  labels?: readonly string[];
}

const LABELS = ['Step label', 'Another step', 'Step', 'A longer step'];

export function ProgressIndicatorSkeleton({
  count = 4,
  labels = LABELS,
  ...rest
}: ProgressIndicatorSkeletonProps) {
  return (
    <SkeletonOf unseen=".cds-progress-step__icon, .cds-progress__overlay">
      <ProgressIndicator {...rest}>
        {Array.from({ length: count }, (_, i) => (
          <ProgressStep
            key={i}
            label={<SkeletonRun>{labels[i % labels.length]}</SkeletonRun>}
          />
        ))}
      </ProgressIndicator>
    </SkeletonOf>
  );
}
