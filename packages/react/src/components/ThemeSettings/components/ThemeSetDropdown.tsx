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

import { Dropdown } from '@carbon/react';
import { OnChangeData } from '@carbon/react/lib/components/Dropdown';
import { themeSets } from './theme-settings-consts';
import { ThemeSetOption, ThemeSetType } from './theme-settings-types';

const blockClass = `theme-set-dropdown`;

interface ThemeSetDropdownProps {
  className?: string;
  id: string;
  label: string;
  titleText: string;
  onChange?: (themeSet: ThemeSetType) => void;
  value: ThemeSetType;
}

export const ThemeSetDropdown = ({
  className,
  id,
  label,
  onChange,
  titleText,
  value,
  ...rest
}: ThemeSetDropdownProps) => {
  const handleThemeSetChange = (event: OnChangeData<ThemeSetOption>) => {
    onChange?.(event.selectedItem!.value as ThemeSetType);
  };

  return (
    <Dropdown
      className={classNames(className, blockClass)}
      id={id}
      items={themeSets}
      itemToString={(item) => item?.text ?? ''}
      onChange={handleThemeSetChange}
      selectedItem={themeSets.find((item) => item.value === value)}
      label={label}
      titleText={titleText}
      {...rest}
    />
  );
};

export default ThemeSetDropdown;
