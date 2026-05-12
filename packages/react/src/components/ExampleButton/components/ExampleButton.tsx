/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { Button, ButtonProps } from '@carbon/react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';

/** Primary UI component for user interaction */

interface ExampleButtonProps extends ButtonProps<any> {
  children?: React.ReactNode;
}

export const ExampleButton = ({
  children = 'Button',
  ...rest
}: ExampleButtonProps) => {
  const prefix = usePrefix();

  return (
    <div className={`${prefix}--example-button__container`}>
      <Button {...rest}>{children}</Button>
    </div>
  );
};
