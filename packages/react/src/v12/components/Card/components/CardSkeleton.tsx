/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  SkeletonLines,
  SkeletonOf,
  SkeletonRun,
} from '@carbon-labs/react-feedback';
import { Card, type CardProps } from './Card';

/* ============================================================================
 * CardSkeleton: a card, loading.
 *
 *   known     the card's surface, actions, buttons and icons, drawn as themselves
 *   data      the label and title: a bar each at their expected width; the
 *             description: one block over the lines it wraps to; media: a block
 *
 * API: the Card's props; its text props are the expected text.
 * ========================================================================== */

export interface CardSkeletonProps extends Omit<
  CardProps,
  'label' | 'title' | 'description' | 'onClick'
> {
  label?: string;
  title?: string;
  description?: string;
}

export function CardSkeleton({
  label,
  title = 'Card title',
  description,
  ...rest
}: CardSkeletonProps) {
  return (
    <SkeletonOf blocks=".cds-kit-card__media">
      <Card
        {...rest}
        label={label ? <SkeletonRun>{label}</SkeletonRun> : undefined}
        title={<SkeletonRun>{title}</SkeletonRun>}
        description={
          description ? <SkeletonLines>{description}</SkeletonLines> : undefined
        }
      />
    </SkeletonOf>
  );
}
