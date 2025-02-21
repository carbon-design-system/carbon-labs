/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import classNames from 'classnames';

import { Checkbox } from '@carbon/react';

const blockClass = `theme-menu-compliment`;

interface ThemeMenuComplimentProps {
  checked: boolean;
  className?: string;
  id: string;
  labelText: string;
  onChange?: (checked: boolean) => void;
}

export const ThemeMenuCompliment = ({
  checked,
  className,
  id,
  labelText,
  onChange,
  ...rest
}: ThemeMenuComplimentProps) => {
  const handleCompliment = (ev: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(ev.target!.checked);
  };

  return (
    <Checkbox
      className={classNames(className, blockClass)}
      id={id}
      labelText={labelText}
      checked={checked}
      onChange={handleCompliment}
      {...rest}
    />
  );
};

export default ThemeMenuCompliment;
