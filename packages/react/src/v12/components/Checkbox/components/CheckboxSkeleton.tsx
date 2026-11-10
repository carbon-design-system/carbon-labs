/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useId } from 'react';
import { SkeletonOf, SkeletonRun } from '@carbon-labs/react-feedback';
import { Checkbox, type CheckboxProps } from './Checkbox';

/* ============================================================================
 * CheckboxSkeleton: the checkbox, loading.
 *
 *   known     the label, when given, drawn as itself
 *   data      whether it's checked: the box is a block of its own box
 *   no label  the box and a typical label are one bar (the merge rule)
 *
 * API: Carbon's CheckboxSkeleton, plus the Checkbox's layout props.
 * ========================================================================== */

export type CheckboxSkeletonProps = Omit<
  Partial<CheckboxProps>,
  'checked' | 'defaultChecked' | 'indeterminate'
>;

/** The box (16px) and its gap (8px): the room the merged bar runs out over. */
const BOX_LEAD = '24px';

export function CheckboxSkeleton({
  id,
  labelText,
  ...rest
}: CheckboxSkeletonProps) {
  const auto = useId();
  const known =
    labelText !== undefined && labelText !== null && labelText !== '';
  return (
    <SkeletonOf
      blocks={known ? '.cds-checkbox__box' : undefined}
      unseen={known ? undefined : '.cds-checkbox__box'}>
      <Checkbox
        {...rest}
        id={id ?? auto}
        labelText={
          known ? (
            labelText
          ) : (
            <SkeletonRun lead={BOX_LEAD}>Checkbox label</SkeletonRun>
          )
        }
      />
    </SkeletonOf>
  );
}
