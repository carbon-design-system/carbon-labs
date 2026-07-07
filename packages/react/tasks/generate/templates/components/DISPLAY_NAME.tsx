/**
 * @license
 *
 * Copyright IBM Corp. FULL_YEAR
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { Button, ButtonProps } from '@carbon/react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';

/** Primary UI component for user interaction */

interface DISPLAY_NAMEProps extends ButtonProps<any> {
  children?: React.ReactNode;
}

export const DISPLAY_NAME = ({
  children = 'Button',
  ...rest
}: DISPLAY_NAMEProps) => {
  const prefix = usePrefix();

  return (
    <div className={`${prefix}--STYLE_NAME__container`}>
      <Button {...rest}>{children}</Button>
    </div>
  );
};
