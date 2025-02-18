/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useState } from 'react';
import {
  CarbonTheme,
  ThemeSettingType,
  ThemeSetType,
} from '../components/theme-settings-types';

const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

/**
 *
 * @param themeSetting - 'light', 'system' or 'dark'
 * @param themeSet - pair of Carbon themes light/dark e.g. 'white/g90'
 * @param compliment - if the compliment of the theme is required
 * @param systemDark - system settings dark
 * @returns - carbon theme 'white', 'g10', 'g90' or 'g100'
 */
const getTheme = (themeSetting, themeSet, compliment, systemDark) => {
  const themes = themeSet.split('/');

  if (themeSetting === 'system') {
    return (systemDark && !compliment) || (!systemDark && compliment)
      ? themes[1]
      : themes[0];
  } else {
    if (themeSetting === 'light') {
      return compliment ? themes[1] : themes[0];
    } else {
      return compliment ? themes[0] : themes[1];
    }
  }
};

/**
 *
 * @param themeSetting - 'light', 'system' or 'dark'
 * @param themeSet - pair of Carbon themes light/dark e.g. 'white/g90'
 * @param compliment - if the compliment of the theme is required
 * @returns - reactive carbon theme 'white', 'g10', 'g90' or 'g100'
 */
export const useThemeSetting = (
  themeSetting: ThemeSettingType,
  themeSet: ThemeSetType,
  compliment: boolean
): CarbonTheme => {
  const initialTheme = getTheme(
    themeSetting,
    themeSet,
    compliment,
    mediaQueryList.matches
  );
  const [theme, setTheme] = useState(initialTheme);
  const [systemDark, setSystemDark] = useState(mediaQueryList.matches);

  mediaQueryList.addEventListener('change', (event) => {
    setSystemDark(event.matches);
  });

  useEffect(() => {
    setTheme(
      getTheme(themeSetting, themeSet, compliment, mediaQueryList.matches)
    );
  }, [systemDark, themeSetting, themeSet, compliment]);

  return theme;
};
