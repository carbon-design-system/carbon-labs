// cspell:ignore resizer
/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Resizer } from '../components/Resizer';
import '../components/resizer.scss';
import { WebIDEStory } from './WebIDEStory';
import './ResizerWebIDE.scss';

export default {
  title: 'Components/Resizer/Examples',
  component: Resizer,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    orientation: {
      control: false,
    },
    children: {
      control: false,
    },
  },
};

/**
 * WebIDE example - A complete Web IDE-like interface with resizable panels
 *
 * @param {object} args - Story arguments
 * @returns {React.ReactElement} The Web IDE story
 */
export const WebIDE = (args) => {
  return <WebIDEStory {...args} />;
};
