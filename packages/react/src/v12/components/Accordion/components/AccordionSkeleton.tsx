/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { SkeletonOf, SkeletonRun } from '@carbon-labs/react-feedback';
import { Accordion, AccordionItem, type AccordionProps } from './Accordion';

/* ============================================================================
 * AccordionSkeleton: an accordion, loading.
 *
 *   known     the rows, their dividers and chevrons, drawn as themselves, shut
 *   data      each title: a bar at its expected width (`titles`, cycled)
 *
 * API: Carbon's AccordionSkeleton plus the Accordion's layout props.
 * ========================================================================== */

export interface AccordionSkeletonProps extends Pick<
  AccordionProps,
  'align' | 'frame' | 'size' | 'corners' | 'className'
> {
  /** How many rows. Default 4. */
  count?: number;
  /** The expected titles, for the bars' widths (cycled). */
  titles?: readonly string[];
}

const TITLES = [
  'Section title',
  'Another section',
  'Section',
  'A longer section title',
];

export function AccordionSkeleton({
  count = 4,
  titles = TITLES,
  ...rest
}: AccordionSkeletonProps) {
  return (
    <SkeletonOf>
      <Accordion {...rest}>
        {Array.from({ length: count }, (_, i) => (
          <AccordionItem
            key={i}
            title={<SkeletonRun>{titles[i % titles.length]}</SkeletonRun>}
          />
        ))}
      </Accordion>
    </SkeletonOf>
  );
}
