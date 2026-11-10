/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useId } from 'react';
import { Add, Subtract } from '@carbon-labs/react-motion-icons';
import { SkeletonOf } from '@carbon-labs/react-feedback';
import { FieldCore } from '@carbon-labs/react-text-input';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import '@carbon-labs/react-tooltip/scss/tooltip.scss';
import { iconSizeFor } from '@carbon-labs/react-props';
import type { NumberInputProps } from './NumberInput';
import './number-input.scss';

/* ============================================================================
 * NumberInputSkeleton: the number input, loading.
 *
 *   known     the label, helper text, field frame and steppers, drawn as themselves
 *   data      the number: a bar at the expected value's width (`skeletonValue`)
 *
 * API: Carbon's NumberInputSkeleton, plus the NumberInput's layout props.
 * ========================================================================== */

export interface NumberInputSkeletonProps extends Pick<
  NumberInputProps,
  | 'label'
  | 'hideLabel'
  | 'helperText'
  | 'hideSteppers'
  | 'size'
  | 'corners'
  | 'variant'
  | 'className'
> {
  id?: string;
  /** The expected number, as it will show: the bar is its width. Default "1,024". */
  skeletonValue?: string;
}

export function NumberInputSkeleton({
  id,
  label,
  hideSteppers = false,
  size = 'md',
  skeletonValue = '1,024',
  className,
  ...rest
}: NumberInputSkeletonProps) {
  const auto = useId();
  const iconPx = iconSizeFor(size);
  const btnSize = size === 'lg' ? 'lg' : 'md';
  // The steppers drawn as themselves, without the buttons' rollover and tooltips: nothing reaches them.
  const steppers = hideSteppers ? null : (
    <span className="cds-number-input__steppers">
      {[Subtract, Add].map((Icon, i) => (
        <span key={i} className="cds-tooltip cds-icon-tooltip">
          <button
            type="button"
            tabIndex={-1}
            className={`cds-icon-btn cds-icon-btn--ghost cds-icon-btn--${btnSize} cds-icon-btn--full cds-text-input__toggle cds-number-input__stepper`}>
            <Icon size={iconPx} aria-hidden="true" />
          </button>
        </span>
      ))}
    </span>
  );
  return (
    <SkeletonOf>
      <FieldCore
        {...rest}
        id={id ?? auto}
        labelText={label ?? ''}
        size={size}
        loading
        skeletonValue={skeletonValue}
        variantClass={[
          'cds-number-input',
          hideSteppers && 'cds-number-input--nosteppers',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        trailing={steppers}
      />
    </SkeletonOf>
  );
}
