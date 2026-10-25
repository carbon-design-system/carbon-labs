/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';
import cx from 'classnames';
/** Primary UI component for user interaction */

interface RegistrationStepIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  currentIndex: number;
  stepLabels: string[];
  progress?: number;
}

export const RegistrationStepIndicator = ({
  currentIndex,
  progress = 1,
  stepLabels,
  ...rest
}: RegistrationStepIndicatorProps) => {
  const prefix = usePrefix();

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const progressPercentage = formatter.format(progress);
  return (
    <div {...rest} className={`${prefix}--registration-flow__step-indicator`}>
      {stepLabels.map((el, idx) => (
        <span
          key={idx}
          dir="auto"
          className={cx({
            [`${prefix}--registration-flow__step-indicator-step`]: true,
            [`${prefix}--registration-flow__step-indicator-step-current`]:
              idx === currentIndex,
            [`${prefix}--registration-flow__step-indicator-step-complete`]:
              idx < currentIndex,
          })}>
          <span
            style={{ inlineSize: `${progressPercentage}` }}
            className={`${prefix}--registration-flow__step-indicator-step-current-progress`}
          />
          {el}
        </span>
      ))}
    </div>
  );
};
