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
  buttonIcon: {
    description:
      '(optional), Provide the renderIcon used in the button ex. Launch, Add, ect.',
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
  buttonText: {
    description:
      '(optional), Provide content that needs highest attention from the user or content that triggers an action and allow users to directly start working and gain value (within one click)',
  },
  buttonType: {
    description: 'Specify the carbon button type',
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
  description: {
    description:
      'Provide short sentence in max. 3 lines related to product context',
  },
  headerAnimation: {
    description:
      'In-product imagery / lottie animation (.json) dim. 1312 x 738 **To update headerAnimation content storybook requires remount in toolbar**',
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
  headerDropdown: {
    description:
      'Header dropdown menu **Only active when button/buttonText is not in use**',
    type: 'boolean',
    control: {
      type: 'boolean',
      default: false,
    },
  },
  headerStatic: {
    description:
      'In-product imagery / static imagery dim. 1312 x 738 **Only active when headerAnimation is not in use**',
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
  productName: {
    description: 'Provide current product name',
  },
  selectedTileGroup: {
    description:
      'The tile group that is active in the header ex. "AI Chat Tile w/ two glass tiles", "Four glass tiles", ect.',
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
  selectedWorkspace: {
    description: 'Object containing workspace selection `Open in: "_"`',
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
  userName: {
    description: 'Specify the current username of active user',
  },
  welcomeText: {
    description:
      'Specify the current welcome text on the header ex. `Welcome` `Welcome back`',
  },
  workspaceLabel: {
    description: 'Specify the default workspace label above the tiles',
  },
};

const sharedArgs = {
  allTiles: headerTiles,
  allWorkspaces: workspaceData,
  buttonIcon: 0,
  buttonText: 'Customize my journey',
  buttonType: 7,
  description: 'Train, deploy, validate, and govern AI models responsibly.',
  headerDropdown: false,
  headerStatic: 0,
  productName: '[Product name]',
  selectedTileGroup: 1,
  selectedWorkspace: 3,
  userName: 'Drew',
  welcomeText: 'Welcome',
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
