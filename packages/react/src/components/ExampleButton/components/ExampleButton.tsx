import React from 'react';
import { Button, ButtonProps } from '@carbon/react';
import './button.scss';

/** Primary UI component for user interaction */

interface ExampleButtonProps extends ButtonProps<any> {
  children?: React.ReactNode;
}
export const ExampleButton = ({ children = 'Button', ...rest }: ExampleButtonProps ) => {
  return <Button {...rest}>{children}</Button>;
};