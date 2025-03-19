/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import mdx from './AnimatedHeader.mdx';
import AnimatedHeader from '../components/AnimatedHeader/AnimatedHeader';
import { Launch, Add, DocumentImport } from '@carbon/react/icons';
import { useArgs } from '@storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react';
import { ButtonKinds } from '@carbon/react';
import '../components/animated-header.scss';

import { workspaceData, headerTiles } from './data';
import {
  dataFabricAnimatedLight,
  dataFabricAnimatedDark,
  dataFabricStaticLight,
  dataFabricStaticDark,
  watsonXAnimatedLight,
  watsonXAnimatedDark,
  watsonXStaticLight,
  watsonXStaticDark,
  wxbiaAnimatedLight,
  wxbiaAnimatedDark,
} from '../assets';

const meta: Meta<typeof AnimatedHeader> = {
  title: 'Components/Animated Header',
  component: AnimatedHeader,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  //tags: ["autodocs"],
  globals: {
    // 👇 Set background value for all component stories
    backgrounds: { value: '#f4f4f4' },

    // 👇 Set theme value all component stories
    theme: 'g10',
  },
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
    docs: {
      page: mdx,
    },
  },
};

export default meta;
type Story = StoryObj<typeof AnimatedHeader>;

const sharedArgTypes = {
  welcomeText: {
    description: 'Header welcome text ex. `Welcome` `Welcome back`',
  },
  userName: {
    description: 'Header welcome username',
  },
  description: {
    description: 'Header description text',
  },
  buttonText: {
    description: 'Header button text',
  },
  productName: {
    description: 'Product name in the AI Chat Tile',
  },
  headerDropdown: {
    description:
      'Header dropdown menu when **button/buttonText is not in use**',
    type: 'boolean',
    control: {
      type: 'boolean',
      default: false,
    },
  },
  selectedWorkspace: {
    description: 'Options for workspace selection',
    type: 'array',
    control: {
      type: 'select',
      labels: {
        0: 'None',
        1: '1 option',
        2: '2 options',
        3: '3 options',
      },
    },
    options: [0, 1, 2, 3],
    mapping: {
      0: null,
      1: workspaceData.slice(0, 1),
      2: workspaceData.slice(0, 2),
      3: workspaceData,
    },
  },
  selectedTileGroup: {
    description: 'Set the number of header tiles',
    type: 'object',
    control: {
      type: 'select',
      labels: {
        0: 'None',
        1: headerTiles[0].name,
        2: headerTiles[1].name,
        3: headerTiles[2].name,
        4: headerTiles[3].name,
        5: headerTiles[4].name,
        6: headerTiles[5].name,
        7: headerTiles[6].name,
      },
    },
    options: [0, 1, 2, 3, 4, 5, 6, 7],
    mapping: {
      0: null,
      1: headerTiles[0],
      2: headerTiles[1],
      3: headerTiles[2],
      4: headerTiles[3],
      5: headerTiles[4],
      6: headerTiles[5],
      7: headerTiles[6],
    },
  },
  headerAnimation: {
    description:
      'Lottie animation (to update headerAnimation content storybook requires remount in toolbar) dim. 1312 x 738',
    type: 'json',
    control: {
      type: 'select',
      labels: {
        0: 'None',
        1: 'data fabric (light theme)',
        2: 'data fabric (dark theme)',
        3: 'watsonx (light theme)',
        4: 'watsonx (dark theme)',
        5: 'wxbia (light theme)',
        6: 'wxbia (dark theme)',
      },
    },
    options: [0, 1, 2, 3, 4, 5, 6],
    mapping: {
      0: null,
      1: dataFabricAnimatedLight,
      2: dataFabricAnimatedDark,
      3: watsonXAnimatedLight,
      4: watsonXAnimatedDark,
      5: wxbiaAnimatedLight,
      6: wxbiaAnimatedDark,
    },
  },
  buttonType: {
    description: 'Specify the kind of Button you want to create',
    control: {
      type: 'select',
      labels: {
        0: 'primary',
        1: 'secondary',
        2: 'danger',
        3: 'ghost',
        4: 'danger--primary',
        5: 'danger--ghost',
        6: 'danger--tertiary',
        7: 'tertiary',
      },
    },
    options: [0, 1, 2, 3, 4, 5, 6, 7],
    mapping: {
      0: ButtonKinds[0],
      1: ButtonKinds[1],
      2: ButtonKinds[2],
      3: ButtonKinds[3],
      4: ButtonKinds[4],
      5: ButtonKinds[5],
      6: ButtonKinds[6],
      7: ButtonKinds[7],
    },
  },
  buttonIcon: {
    description: 'Specify the kind of Button icon to use',
    control: {
      type: 'select',
      labels: {
        0: 'None',
        1: 'Launch',
        2: 'Add',
        3: 'Document Import',
      },
    },
    options: [0, 1, 2, 3],
    mapping: {
      0: null,
      1: Launch,
      2: Add,
      3: DocumentImport,
    },
  },
  headerStatic: {
    description:
      'Static header image when **headerAnimation is not in use** dim. 1312 x 738',
    type: 'image',
    control: {
      type: 'select',
      labels: {
        0: 'None',
        1: 'watsonx (light theme)',
        2: 'watsonx (dark theme)',
        3: 'data fabric (light theme)',
        4: 'data fabric (dark theme)',
      },
    },
    options: [0, 1, 2, 3, 4],
    mapping: {
      0: null,
      1: watsonXStaticLight,
      2: watsonXStaticDark,
      3: dataFabricStaticLight,
      4: dataFabricStaticDark,
    },
  },
};

const sharedArgs = {
  welcomeText: 'Welcome',
  userName: 'Drew',
  description: 'Train, deploy, validate, and govern AI models responsibly.',
  buttonText: 'Customize my journey',
  productName: '[Product name]',
  buttonType: 7,
  buttonIcon: 0,
  headerStatic: 0,
  headerDropdown: false,
  selectedWorkspace: 3,
  allWorkspaces: workspaceData,
  selectedTileGroup: 1,
  allTiles: headerTiles,
};

export const ThemeG10 = (args) => {
  const [_, updateArgs] = useArgs();

  const handleWorkspaceSelect = (e) => {
    updateArgs({ ...args, selectedWorkspace: e.selectedItem });
  };

  const handleTileGroup = (e) => {
    updateArgs({ ...args, selectedTileGroup: e.selectedItem.id });
  };

  return (
    <AnimatedHeader
      {...args}
      setSelectedWorkspace={(e) => handleWorkspaceSelect(e)}
      setSelectedTileGroup={(e) => handleTileGroup(e)}></AnimatedHeader>
  );
};

ThemeG10.argTypes = {
  ...sharedArgTypes,
};

ThemeG10.args = {
  headerAnimation: 3,
  ...sharedArgs,
};

export const ThemeG100 = (args) => {
  const [_, updateArgs] = useArgs();

  const handleWorkspaceSelect = (e) => {
    updateArgs({ ...args, selectedWorkspace: e.selectedItem });
  };

  const handleTileGroup = (e) => {
    updateArgs({ ...args, selectedTileGroup: e.selectedItem.id });
  };

  return (
    <AnimatedHeader
      {...args}
      setSelectedWorkspace={(e) => handleWorkspaceSelect(e)}
      setSelectedTileGroup={(e) => handleTileGroup(e)}></AnimatedHeader>
  );
};

ThemeG100.argTypes = {
  ...sharedArgTypes,
};

ThemeG100.args = {
  headerAnimation: 4,
  ...sharedArgs,
};

ThemeG100.globals = {
  // 👇 Override background value for this story
  backgrounds: { value: '#161616' },

  // 👇 Override theme value for this story
  theme: 'g100',
};
