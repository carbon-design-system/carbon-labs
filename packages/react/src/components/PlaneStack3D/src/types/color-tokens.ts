/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable jsdoc/require-jsdoc, jsdoc/require-param, jsdoc/require-param-type, jsdoc/require-param-description */

import * as colors from '@carbon/colors';

export type ColorToken =
  | 'red'
  | 'magenta'
  | 'purple'
  | 'blue'
  | 'teal'
  | 'cyan'
  | 'green';

export type Theme = 'dark' | 'light';

export interface BlockColorTheme {
  color: string;
  leftColor: string;
  topColor: string;
  textColor: string;
}

export const COLOR_TOKENS: ColorToken[] = [
  'red',
  'magenta',
  'purple',
  'blue',
  'teal',
  'cyan',
  'green',
];

// Block colors - SAME for both dark and light mode
export const BLOCK_COLOR_THEMES: Record<ColorToken, BlockColorTheme> = {
  red: {
    color: colors.red[40],
    leftColor: colors.red[50],
    topColor: colors.red[60],
    textColor: colors.white,
  },
  magenta: {
    color: colors.magenta[40],
    leftColor: colors.magenta[50],
    topColor: colors.magenta[60],
    textColor: colors.white,
  },
  purple: {
    color: colors.purple[40],
    leftColor: colors.purple[50],
    topColor: colors.purple[60],
    textColor: colors.white,
  },
  blue: {
    color: colors.blue[40],
    leftColor: colors.blue[50],
    topColor: colors.blue[60],
    textColor: colors.white,
  },
  teal: {
    color: colors.teal[40],
    leftColor: colors.teal[50],
    topColor: colors.teal[60],
    textColor: colors.white,
  },
  cyan: {
    color: colors.cyan[40],
    leftColor: colors.cyan[50],
    topColor: colors.cyan[60],
    textColor: colors.white,
  },
  green: {
    color: colors.green[40],
    leftColor: colors.green[50],
    topColor: colors.green[60],
    textColor: colors.white,
  },
};

/**
 *
 * @param value
 */
export function isColorToken(value: string): value is ColorToken {
  return Object.hasOwn(BLOCK_COLOR_THEMES, value);
}

/**
 *
 * @param token
 * @param _theme
 */
export function getBlockColorTheme(
  token: ColorToken,
  _theme: Theme = 'dark'
): BlockColorTheme {
  // Same colors for both themes
  return BLOCK_COLOR_THEMES[token];
}
