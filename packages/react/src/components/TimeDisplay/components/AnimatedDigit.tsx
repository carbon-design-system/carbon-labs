/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useRef, useState } from 'react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';

interface AnimatedDigitProps {
  value: string;
  animated: boolean;
  mode?: 'count-up' | 'count-down' | 'duration';
}

/**
 * Renders a single character with an optional odometer-style slide transition.
 * Direction follows mode: count-up slides up, count-down slides down.
 */
export const AnimatedDigit: React.FC<AnimatedDigitProps> = ({
  value,
  animated,
  mode = 'count-up',
}) => {
  const prefix = usePrefix();
  const blockClass = `${prefix}--animated-digit`;

  const [currentValue, setCurrentValue] = useState(value);
  const [previousValue, setPreviousValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'up' | 'down'>('up');

  useEffect(() => {
    if (value === currentValue) return;

    if (animated) {
      const numValue = parseInt(value, 10);
      const numCurrent = parseInt(currentValue, 10);

      if (!isNaN(numValue) && !isNaN(numCurrent)) {
        const animDirection: 'up' | 'down' =
          mode === 'count-down' ? 'down' : 'up';

        setDirection(animDirection);
        setPreviousValue(currentValue);
        setIsAnimating(true);

        const timer = setTimeout(() => {
          setCurrentValue(value);
          setIsAnimating(false);
        }, 300); // Match CSS animation duration

        return () => clearTimeout(timer);
      }
    }

    setCurrentValue(value);
  }, [value, animated, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!animated) {
    return <span className={blockClass}>{value}</span>;
  }

  return (
    <span className={`${blockClass}__container`}>
      <span
        className={[
          `${blockClass}__slider`,
          isAnimating && `${blockClass}__slider--animating`,
          isAnimating && direction === 'up' && `${blockClass}__slider--slide-up`,
          isAnimating &&
            direction === 'down' &&
            `${blockClass}__slider--slide-down`,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className={`${blockClass}__current`}>
          {isAnimating ? previousValue : currentValue}
        </span>
        {isAnimating && (
          <span className={`${blockClass}__next`}>{value}</span>
        )}
      </span>
    </span>
  );
};

AnimatedDigit.displayName = 'AnimatedDigit';
