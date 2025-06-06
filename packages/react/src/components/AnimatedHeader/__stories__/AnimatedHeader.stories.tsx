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
import { useArgs } from '@storybook/preview-api';
import type { Meta } from '@storybook/react';
import '../components/animated-header.scss';

import {
  headerTiles,
  tasksControllerConfigButton,
  tasksControllerConfigDropdown,
  tasksControllerConfigLoading,
  workspaceSelectorConfig,
  workspaceSelectorConfigLoading,
} from './data';
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

const sharedArgTypes = {
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
  disabledTaskLabel: {
    description: 'Provide on hover label for disabled tasks',
  },
  selectedTileGroup: {
    description:
      'The tile group that is active in the header ex. "AI Chat Tile w/ two glass tiles", "Four glass tiles", ect.',
    type: 'object',
    control: {
      type: 'select',
      labels: {
        0: 'None',
        1: headerTiles[0].label,
        2: headerTiles[1].label,
        3: headerTiles[2].label,
        4: headerTiles[3].label,
        5: headerTiles[4].label,
        6: headerTiles[5].label,
        7: headerTiles[6].label,
        8: headerTiles[7].label,
        9: headerTiles[8].label,
      },
    },
    options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    mapping: {
      0: null,
      1: headerTiles[0],
      2: headerTiles[1],
      3: headerTiles[2],
      4: headerTiles[3],
      5: headerTiles[4],
      6: headerTiles[5],
      7: headerTiles[6],
      8: headerTiles[7],
      9: headerTiles[8],
    },
  },
  tasksControllerConfig: {
    description:
      'Configuration for Carbon button or dropdown menu in header. Customized tasks are used to allow users that have multiple roles and permissions to experience better tailored content based on their need.',
    control: {
      type: 'select',
      labels: {
        0: 'None',
        1: 'Button',
        2: 'Dropdown',
        3: 'Loading',
      },
    },
    options: [0, 1, 2, 3],
    mapping: {
      0: null,
      1: tasksControllerConfigButton,
      2: tasksControllerConfigDropdown,
      3: tasksControllerConfigLoading,
    },
  },
  workspaceSelectorConfig: {
    description:
      'Configuration for Carbon button or dropdown menu in header. Customized tasks are used to allow users that have multiple roles and permissions to experience better tailored content based on their need.',
    control: {
      type: 'select',
      labels: {
        0: 'None',
        1: 'Sample',
        2: 'Loading',
      },
    },
    options: [0, 1, 2],
    mapping: {
      0: null,
      1: workspaceSelectorConfig,
      2: workspaceSelectorConfigLoading,
    },
  },
  userName: {
    description: 'Specify the current username of active user',
  },
  welcomeText: {
    description:
      'Specify the current welcome text on the header ex. `Welcome` `Welcome back`',
  },
  isLoading: {
    description: 'Specify whether the header should be in the loading state',
  },
  expandButtonLabel: {
    description: 'Specify custom expand button label',
    type: 'string',
  },
  collapseButtonLabel: {
    description: 'Specify custom collapse button label',
    type: 'string',
  },
};

const sharedArgs = {
  allTileGroups: headerTiles,
  tasksControllerConfig: 1,
  workspaceSelectorConfig: 1,
  description: 'Train, deploy, validate, and govern AI models responsibly.',
  headerStatic: 0,
  productName: '[Product name]',
  selectedTileGroup: 1,
  userName: 'Drew',
  welcomeText: 'Welcome',
  isLoading: false,
  disabledTaskLabel: 'This task is disabled',
  expandButtonLabel: 'Expand',
  collapseButtonLabel: 'Collapse',
};

export const ThemeG10 = (args) => {
  const [_, updateArgs] = useArgs();

  const handleWorkspaceSelect = (e) => {
    updateArgs({
      ...args,
      workspaceSelectorConfig: {
        ...args.workspaceSelectorConfig,
        selectedWorkspace: e.selectedItem,
      },
    });
  };

  const handleTileGroupSelect = (e) => {
    updateArgs({ ...args, selectedTileGroup: e.selectedItem.id });
  };

  const argsWithSelectors = {
    ...args,
    workspaceSelectorConfig: {
      ...args.workspaceSelectorConfig,
      setSelectedWorkspace: handleWorkspaceSelect,
    },
    setSelectedTileGroup: handleTileGroupSelect,
  };

  return <AnimatedHeader {...argsWithSelectors} />;
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
    updateArgs({
      ...args,
      workspaceSelectorConfig: {
        ...args.workspaceSelectorConfig,
        selectedWorkspace: e.selectedItem,
      },
    });
  };

  const handleTileGroupSelect = (e) => {
    updateArgs({ ...args, selectedTileGroup: e.selectedItem.id });
  };

  const argsWithSelectors = {
    ...args,
    workspaceSelectorConfig: {
      ...args.workspaceSelectorConfig,
      setSelectedWorkspace: handleWorkspaceSelect,
    },
    setSelectedTileGroup: handleTileGroupSelect,
  };

  return <AnimatedHeader {...argsWithSelectors} />;
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
