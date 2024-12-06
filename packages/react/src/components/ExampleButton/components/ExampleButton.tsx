import React, { PropsWithChildren } from 'react';
import { Button, ButtonProps } from '@carbon/react';
import './button.scss';

/** Primary UI component for user interaction */

type ExampleButtonProps = PropsWithChildren<ButtonProps<any>>;
export const ExampleButton = ({ children = 'Button', ...rest }: ExampleButtonProps ) => {
  return <Button {...rest}>{children}</Button>;
};