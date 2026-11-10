/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useId, type HTMLAttributes } from 'react';
import { TextInputSkeleton } from '@carbon-labs/react-text-input';
import './date-picker.scss';

/**
 * v11's DatePickerSkeleton: the field (two for `range`) loading, as the
 * text input's skeleton draws it (the loading standard): the frame for
 * real, a bar where the date will be.
 */
export interface DatePickerSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Two fields. */
  range?: boolean;
  hideLabel?: boolean;
}

export function DatePickerSkeleton({
  range = false,
  hideLabel = false,
  className,
  ...rest
}: DatePickerSkeletonProps) {
  const id = useId();
  const one = (i: number) => (
    <TextInputSkeleton
      key={i}
      id={`${id}-${i}`}
      hideLabel={hideLabel}
      skeletonValue="mm/dd/yyyy"
      className="cds-date-picker-input"
    />
  );
  return (
    <div
      {...rest}
      className={['cds-date-picker-wrapper', className]
        .filter(Boolean)
        .join(' ')}
      aria-busy="true">
      <div
        className={`cds-date-picker cds-date-picker--${range ? 'range' : 'single'}`}>
        {range ? [one(0), one(1)] : one(0)}
      </div>
    </div>
  );
}
