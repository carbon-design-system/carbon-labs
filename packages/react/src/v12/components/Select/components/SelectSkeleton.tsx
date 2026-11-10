/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useId } from 'react';
import { ChevronDown } from '@carbon-labs/react-motion-icons';
import { SkeletonOf } from '@carbon-labs/react-feedback';
import { FieldCore } from '@carbon-labs/react-text-input';
import { iconSizeFor } from '@carbon-labs/react-props';
import type { SelectProps } from './Select';
import './select.scss';

/* ============================================================================
 * SelectSkeleton: the select, loading.
 *
 *   known     the label, helper text, field frame and chevron, drawn as themselves
 *   data      the chosen option: a bar at the expected label's width (`skeletonValue`)
 *
 * API: Carbon's SelectSkeleton, plus the Select's layout props.
 * ========================================================================== */

export interface SelectSkeletonProps extends Pick<
  SelectProps,
  | 'labelText'
  | 'hideLabel'
  | 'helperText'
  | 'size'
  | 'corners'
  | 'variant'
  | 'className'
> {
  id?: string;
  /** The expected option label: the bar is its width. Default "Option label". */
  skeletonValue?: string;
}

export function SelectSkeleton({
  id,
  labelText,
  size = 'md',
  skeletonValue = 'Option label',
  className,
  ...rest
}: SelectSkeletonProps) {
  const auto = useId();
  return (
    <SkeletonOf>
      <FieldCore
        {...rest}
        id={id ?? auto}
        labelText={labelText ?? ''}
        size={size}
        loading
        skeletonValue={skeletonValue}
        variantClass={['cds-select', className].filter(Boolean).join(' ')}
        fieldClass="cds-select__field"
        trailClass="cds-select__trail"
        trailing={
          <span className="cds-select__chevron" aria-hidden="true">
            <ChevronDown size={iconSizeFor(size)} />
          </span>
        }
      />
    </SkeletonOf>
  );
}
