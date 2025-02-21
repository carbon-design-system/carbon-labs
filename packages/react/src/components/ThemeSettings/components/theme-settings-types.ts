/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
export type CarbonTheme = 'white' | 'g10' | 'g90' | 'g100';

export type ThemeSetType = 'white/g90' | 'g10/g90' | 'white/g100' | 'g10/g100';

export interface ThemeSetOption {
  text: string;
  value: ThemeSetType;
}

export type ThemeSettingType = 'light' | 'system' | 'dark';
