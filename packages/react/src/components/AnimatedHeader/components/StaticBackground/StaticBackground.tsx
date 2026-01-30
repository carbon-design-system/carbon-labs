/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { usePrefix } from '@carbon-labs/utilities/usePrefix';
import React from 'react';

export interface StaticBackgroundProps {
  headerStatic?: React.JSX.Element | string;
}

const StaticBackground: React.FC<StaticBackgroundProps> = ({
  headerStatic,
}) => {
  const prefix = usePrefix();
  const blockClass = `${prefix}--animated-header__static`;

  if (!headerStatic) {
    return null;
  }

  return (
    <div className={`${blockClass}--container`}>
      <div
        className={`${blockClass}`}
        // eslint-disable-next-line react/forbid-dom-props
        style={{ backgroundImage: `url(${headerStatic})` }}
        aria-hidden="true"
      />
    </div>
  );
};

export default StaticBackground;
