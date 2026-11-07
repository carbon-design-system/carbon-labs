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
    description: 'Theme: the two v12 themes',
    toolbar: {
      title: 'Theme',
      icon: 'paintbrush',
      dynamicTitle: true,
      items: [
        { value: 'white', title: 'White' },
        { value: 'g100', title: 'Gray 100' },
      ],
    },
  },
  density: {
    description: 'Density: default or compact',
    toolbar: {
      title: 'Density',
      icon: 'ruler',
      dynamicTitle: true,
      items: [
        { value: 'default', title: 'Default density' },
        { value: 'compact', title: 'Compact density' },
      ],
    },
  },
  corners: {
    description: 'Corners: rounded or square',
    toolbar: {
      title: 'Corners',
      icon: 'box',
      dynamicTitle: true,
      items: [
        { value: 'rounded', title: 'Rounded corners' },
        { value: 'square', title: 'Square corners' },
      ],
    },
  },
  reducedMotion: {
    description: 'Reduced motion: off, the shorter clock, or at once',
    toolbar: {
      title: 'Reduced motion',
      icon: 'accessibility',
      dynamicTitle: true,
      items: [
        { value: 'off', title: 'Reduced motion off' },
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
