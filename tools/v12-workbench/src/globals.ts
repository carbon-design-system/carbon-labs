/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DEFAULT_GLOBALS } from './constants';

/**
 * The toolbar: six picks, as Storybook globals. Storybook's own toolbar
 * draws them; `withWorkbench` applies them.
 */
export const globalTypes = {
  theme: {
    description: 'Theme: white, g100, or the v12 light and dark previews',
    toolbar: {
      title: 'Theme',
      icon: 'paintbrush',
      dynamicTitle: true,
      items: [
        { value: 'white', title: 'White' },
        { value: 'g100', title: 'Gray 100' },
        { value: 'v12-light', title: 'v12 light (preview)' },
        { value: 'v12-dark', title: 'v12 dark (preview)' },
      ],
    },
  },
  density: {
    description:
      'Density: compact, default or spacious, through the kit defaults',
    toolbar: {
      title: 'Density',
      icon: 'ruler',
      dynamicTitle: true,
      items: [
        { value: 'compact', title: 'Compact density' },
        { value: 'default', title: 'Default density' },
        { value: 'spacious', title: 'Spacious density' },
      ],
    },
  },
  corners: {
    description:
      "Corners: each component's own, or the kit defaults' full, rounded or square",
    toolbar: {
      title: 'Corners',
      icon: 'cube',
      dynamicTitle: true,
      items: [
        { value: 'default', title: 'Own corners' },
        { value: 'full', title: 'Full corners' },
        { value: 'rounded', title: 'Rounded corners' },
        { value: 'square', title: 'Square corners' },
      ],
    },
  },
  reducedMotion: {
    description:
      'Motion: follow the system setting, or force full, the shorter clock, or at once',
    toolbar: {
      title: 'Reduced motion',
      icon: 'accessibility',
      dynamicTitle: true,
      items: [
        { value: 'system', title: 'Follow the system' },
        { value: 'full', title: 'Full motion' },
        { value: 'shorter-clock', title: 'Shorter clock' },
        { value: 'at-once', title: 'At once' },
      ],
    },
  },
  clock: {
    description: 'Clock: the speed every motion runs at',
    toolbar: {
      title: 'Clock',
      icon: 'timer',
      dynamicTitle: true,
      items: [
        { value: '1', title: 'Clock 1x' },
        { value: '0.25', title: 'Clock 0.25x' },
        { value: '0.1', title: 'Clock 0.1x' },
      ],
    },
  },
  dir: {
    description: 'Text direction',
    toolbar: {
      title: 'Direction',
      icon: 'transfer',
      dynamicTitle: true,
      items: [
        { value: 'ltr', title: 'Left to right' },
        { value: 'rtl', title: 'Right to left' },
      ],
    },
  },
};

export const initialGlobals = { ...DEFAULT_GLOBALS };
