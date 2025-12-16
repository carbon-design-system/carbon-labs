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

// import './theme-settings.scss';
import { FormGroup } from '@carbon/react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';

const blockClass = `theme-settings`;

interface ThemeSettingsProps {
  children: React.ReactNode;
  className?: string;
  legendText?: string;
}

export const ThemeSettings = ({
  children,
  className,
  legendText = 'Theme settings',
  ...rest
}: ThemeSettingsProps) => {
  const prefix = usePrefix();

  return (
    <div
      className={classNames(className, `${prefix}--${blockClass}`)}
      {...rest}>
      <FormGroup
        legendText={legendText}
        className={`${prefix}--${blockClass}__form-group`}>
        {children}
      </FormGroup>
    </div>
  );
};

export default ThemeSettings;
