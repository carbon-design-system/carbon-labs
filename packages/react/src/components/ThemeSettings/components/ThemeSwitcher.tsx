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

import { ContentSwitcher, IconSwitch } from '@carbon/react';
import {
  Asleep,
  Awake,
  BrightnessContrast,
  CarbonIconType,
} from '@carbon/icons-react';
import { ThemeSettingType } from './theme-settings-types';

const blockClass = `theme-switcher`;

export interface ThemeSwitcherProps {
  className?: string;
  labelDark?: string;
  labelLight?: string;
  labelSystem?: string;
  legendText?: string;
  onChange?: (theme: ThemeSettingType) => void;
  value?: ThemeSettingType;
}

export const themeOptions: {
  text: string;
  name: ThemeSettingType;
  icon: CarbonIconType;
}[] = [
  { text: 'Light', name: 'light', icon: Awake },
  { text: 'System', name: 'system', icon: BrightnessContrast },
  { text: 'Dark', name: 'dark', icon: Asleep },
];

export const ThemeSwitcher = ({
  className,
  labelDark,
  labelLight,
  labelSystem,
  onChange,
  value,
}: ThemeSwitcherProps) => {
  const themeLabels: string[] = [
    labelLight ?? themeOptions[0].text,
    labelSystem ?? themeOptions[1].text,
    labelDark ?? themeOptions[2].text,
  ];
  themeLabels;

  return (
    <ContentSwitcher
      className={classNames(className, blockClass)}
      onChange={(switcherEvent) =>
        onChange?.(switcherEvent.name as ThemeSettingType)
      }
      size="lg"
      selectedIndex={themeOptions.findIndex((item) => item.name === value)}>
      {themeOptions.map(({ name, icon: Icon }, index) => (
        <IconSwitch name={name} text={themeLabels[index]} key={name}>
          <Icon />
        </IconSwitch>
      ))}
    </ContentSwitcher>
  );
};

export default ThemeSwitcher;
