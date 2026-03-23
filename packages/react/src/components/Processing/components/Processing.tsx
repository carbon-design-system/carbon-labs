/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import PropTypes from 'prop-types';
import React from 'react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';

/** Primary UI component for user interaction */

export interface ProcessingProps {
  loop?: boolean;
}

const Processing: React.FC<ProcessingProps> = ({
  loop = true,
  ...rest
}: ProcessingProps) => {
  const prefix = usePrefix();
  const blockClass = `${prefix}--processing`;

  const getAnimationEffect = () => {
    if (loop == true) {
      return 'linear';
    } else {
      return 'linear--no-loop';
    }
  };

  return (
    <div className={`${blockClass} ${blockClass}__${getAnimationEffect()}`}>
      <svg className={`${blockClass}__dots`} viewBox="0 0 32 32">
        <circle
          className={`${blockClass}__dot ${blockClass}__dot--left`}
          cx="8"
          cy="16"
        />
        <circle
          className={`${blockClass}__dot ${blockClass}__dot--center`}
          cx="16"
          cy="16"
          r="2"
        />
        <circle
          className={`${blockClass}__dot ${blockClass}__dot--right`}
          cx="24"
          cy="16"
          r="2"
        />
      </svg>
    </div>
  );
};

(Processing as React.FC).displayName = 'Processing';
(Processing as React.FC).propTypes = {
  /**
   * Specify whether the animation should loop
   */
  loop: PropTypes.bool,
};

export default Processing;
