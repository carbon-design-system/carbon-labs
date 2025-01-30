/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { Button, ButtonProps } from '@carbon/react';
import { usePrefix } from '@carbon-labs/utilities/es/index.js';

/** Primary UI component for user interaction */

interface UiShellProps extends ButtonProps<any> {
  children?: React.ReactNode;
}

export const UiShell = ({
  children = 'Button',
  ...rest
}: UiShellProps) => {
  const prefix = usePrefix();

  return (
    <div className={`${prefix}--ui-shell__container`}>
      <Button {...rest}>{children}</Button>
    </div>
  );
};
