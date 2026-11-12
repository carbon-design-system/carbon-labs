/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { AnimatedDigit } from './AnimatedDigit';
import type { TimeDisplayMode } from './TimeDisplay.types';

interface AnimatedNumberProps {
  value: string;
  animated: boolean;
  mode: TimeDisplayMode;
}

/**
 * Splits a string into individual characters and renders each as an
 * `AnimatedDigit`, allowing per-digit slide transitions.
 */
export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  animated,
  mode,
}) => (
  // dir="ltr" preserves the internal digit order of time values (e.g. "12:46:00")
  // when the component is used inside an RTL layout. The surrounding layout
  // continues to mirror normally; only the numeric sequence is isolated.
  <span dir="ltr">
    {value.split('').map((digit, index) => (
      <AnimatedDigit
        // Index key is intentional: position is stable within a field
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        value={digit}
        animated={animated}
        mode={mode}
      />
    ))}
  </span>
);

AnimatedNumber.displayName = 'AnimatedNumber';
