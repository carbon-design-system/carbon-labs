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

export type Theme = 'dark' | 'light';

export interface FoundationTokens {
  foundationRackFront: string;
  foundationRackSide: string;
  foundationRackTop: string;
  foundationRackBottom: string;
  foundationRackBack: string;
  foundationRackBorder: string;
  foundationRackPanel: string;
  foundationWorkerNodeFront: string;
  foundationWorkerNodeSide: string;
  foundationWorkerNodeTop: string;
  foundationWorkerNodeBottom: string;
  foundationWorkerNodeBack: string;
  foundationWorkerNodeButtons: string;
  foundationWorkerNodeStatus: string;
  foundationWorkerNodeStatusGreen: string;
  foundationWorkerNodeStatusYellow: string;
  foundationWorkerNodeStatusRed: string;
}

const statusGreen = colors.green[50];
const statusYellow = colors.yellow[30];
const statusRed = colors.red[60];

// Foundation tokens - SAME for both dark and light mode
const FOUNDATION_TOKENS: FoundationTokens = {
  foundationRackFront: colors.gray[70],
  foundationRackSide: colors.gray[80],
  foundationRackTop: colors.gray[90],
  foundationRackBottom: colors.gray[90],
  foundationRackBack: colors.gray[80],
  foundationRackBorder: colors.gray[90],
  foundationRackPanel: colors.gray[60],
  foundationWorkerNodeFront: colors.gray[70],
  foundationWorkerNodeSide: colors.gray[80],
  foundationWorkerNodeTop: colors.gray[90],
  foundationWorkerNodeBottom: colors.gray[90],
  foundationWorkerNodeBack: colors.gray[80],
  foundationWorkerNodeButtons: colors.gray[60],
  foundationWorkerNodeStatus: statusGreen,
  foundationWorkerNodeStatusGreen: statusGreen,
  foundationWorkerNodeStatusYellow: statusYellow,
  foundationWorkerNodeStatusRed: statusRed,
};

/**
 *
 * @param _theme
 */
export function getFoundationTokens(_theme: Theme = 'dark'): FoundationTokens {
  // Same for both themes
  return FOUNDATION_TOKENS;
}

// UI/Scene colors - SAME for both themes (3D canvas items)
export interface SceneColors {
  textPrimary: string;
  textSecondary: string;
  focusRing: string;
  overlayDark: string;
  coreLayerSide: string;
  coreLayerTop: string;
  textBracketLine: string;
  textBracketTitle: string;
  textBracketSection: string;
  textBracketBackground: string;
  foundationInteriorBackground: string;
  foundationDivider: string;
}

// Scene colors - SAME for both dark and light mode
const SCENE_COLORS: SceneColors = {
  textPrimary: colors.gray[10], // #f4f4f4
  textSecondary: colors.gray[60], // #6f6f6f
  focusRing: colors.white,
  overlayDark: colors.black,
  coreLayerSide: '#313131',
  coreLayerTop: '#222222',
  textBracketLine: '#5F5F5F',
  textBracketTitle: colors.gray[10],
  textBracketSection: colors.gray[60],
  textBracketBackground: colors.gray[100], // #161616 - dark block for text readability
  foundationInteriorBackground: '#262626',
  foundationDivider: colors.gray[100],
};

/**
 *
 * @param _theme
 */
export function getSceneColors(_theme: Theme = 'dark'): SceneColors {
  // Same for both themes
  return SCENE_COLORS;
}

// Carousel colors - DIFFERENT for light vs dark mode (uses Carbon tokens)
export interface CarouselColors {
  dotDisabled: string;
  dotHover: string;
  dotActive: string;
  dotFocus: string;
  arrow: string;
  arrowHover: string;
}

/**
 *
 * @param theme
 */
export function getCarouselColors(theme: Theme): CarouselColors {
  if (theme === 'light') {
    return {
      dotDisabled: colors.gray[50],
      dotHover: colors.gray[70],
      dotActive: colors.gray[100],
      dotFocus: colors.gray[100],
      arrow: colors.gray[80],
      arrowHover: colors.gray[100],
    };
  }
  return {
    dotDisabled: colors.gray[50],
    dotHover: colors.gray[30],
    dotActive: colors.gray[10],
    dotFocus: colors.white,
    arrow: colors.gray[20],
    arrowHover: colors.white,
  };
}

// Made with Bob
