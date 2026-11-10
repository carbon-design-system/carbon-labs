/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useId } from 'react';
import { SkeletonOf, SkeletonRun } from '@carbon-labs/react-feedback';
import { RadioButton, type RadioButtonProps } from './RadioButton';

/* ============================================================================
 * RadioButtonSkeleton: the radio button, loading.
 *
 *   known     the label, when given, drawn as itself
 *   data      whether it's chosen: the circle is a block of its own box
 *   no label  the circle and a typical label are one bar (the merge rule)
 *
 * API: Carbon's RadioButtonSkeleton, plus the RadioButton's layout props.
 * ========================================================================== */

export type RadioButtonSkeletonProps = Omit<
  Partial<RadioButtonProps>,
  'checked' | 'defaultChecked'
>;

/** The circle (16px) and its gap (8px): the room the merged bar runs out over. */
const CIRCLE_LEAD = '24px';

export function RadioButtonSkeleton({
  id,
  labelText,
  ...rest
}: RadioButtonSkeletonProps) {
  const auto = useId();
  const known =
    labelText !== undefined && labelText !== null && labelText !== '';
  return (
    <SkeletonOf
      blocks={known ? '.cds-radio__circle' : undefined}
      unseen={known ? undefined : '.cds-radio__circle'}>
      <RadioButton
        {...rest}
        id={id ?? auto}
        labelText={
          known ? (
            labelText
          ) : (
            <SkeletonRun lead={CIRCLE_LEAD}>Radio label</SkeletonRun>
          )
        }
      />
    </SkeletonOf>
  );
}
