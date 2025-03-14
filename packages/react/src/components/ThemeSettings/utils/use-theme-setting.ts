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
 * @param {ThemeSettingType} themeSetting - 'light', 'system' or 'dark'
 * @param {ThemeSetType} themeSet - pair of Carbon themes light/dark e.g. 'white/g90'
 * @param {boolean} complement - if the complement of the theme is required
 * @param {boolean} systemDark - system settings dark
 * @returns - carbon theme 'white', 'g10', 'g90' or 'g100'
 */
const getTheme = (themeSetting, themeSet, complement, systemDark) => {
  const themes = themeSet.split('/');

  if (themeSetting === 'system') {
    return (systemDark && !complement) || (!systemDark && complement)
      ? themes[1]
      : themes[0];
  } else {
    if (themeSetting === 'light') {
      return complement ? themes[1] : themes[0];
    } else {
      return complement ? themes[0] : themes[1];
    }
  }
};

/**
 *
 * @param {ThemeSettingType} themeSetting - 'light', 'system' or 'dark'
 * @param {ThemeSetType} themeSet - pair of Carbon themes light/dark e.g. 'white/g90'
 * @param {boolean} complement - if the complement of the theme is required
 * @returns - reactive carbon theme 'white', 'g10', 'g90' or 'g100'
 */
export const useThemeSetting = (
  themeSetting: ThemeSettingType,
  themeSet: ThemeSetType,
  complement: boolean
): CarbonTheme => {
  const initialTheme = getTheme(
    themeSetting,
    themeSet,
    complement,
    mediaQueryList.matches
  );
  const [theme, setTheme] = useState(initialTheme);
  const [systemDark, setSystemDark] = useState(mediaQueryList.matches);

  /**
   *
   * @param {any} event - media query event
   */
  const handleMediaQueryEvent = (event) => {
    setSystemDark(event.matches);
  };

  useEffect(() => {
    mediaQueryList.addEventListener('change', handleMediaQueryEvent);

    return () =>
      mediaQueryList.removeEventListener('change', handleMediaQueryEvent);
  }, []);

  useEffect(() => {
    setTheme(
      getTheme(themeSetting, themeSet, complement, mediaQueryList.matches)
    );
  }, [systemDark, themeSetting, themeSet, complement]);

  return theme;
};
