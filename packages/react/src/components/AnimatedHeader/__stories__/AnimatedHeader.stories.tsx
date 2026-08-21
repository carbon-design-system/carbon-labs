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
import { useArgs } from 'storybook/preview-api';
import type { Meta } from '@storybook/react-webpack5';
import '../components/animated-header.scss';
import type { HeaderActionConfig } from '../components/HeaderAction/header-action.types';

import {
  headerTiles,
  overflowGlassTileGroup,
  overflowAiPromptTileGroup,
  overflowManyTileGroup,
  overflowNamedPagesTileGroup,
  tasksControllerConfigButton,
  tasksControllerConfigDropdown,
  tasksControllerConfigLoading,
  workspaceSelectorConfig,
  workspaceSelectorConfigLoading,
  headerActionIcon,
  headerActionGhost,
  contentSwitcherConfigTwo,
  contentSwitcherConfigThree,
  contentSwitcherConfigLoading,
  carouselConfig,
  carouselConfigPageLabelTemplate,
  carouselConfigPageLabelArray,
} from './data';

import {
  dataFabricAnimatedLight,
  dataFabricAnimatedDark,
  db2AnimatedLight,
  db2AnimatedDark,
  watsonXAnimatedLight,
  watsonXAnimatedDark,
  watsonXAAnimatedLight,
  watsonXAAnimatedDark,
  wxbiaAnimatedLight,
  wxbiaAnimatedDark,
  dataFabricStaticLight,
  dataFabricStaticDark,
  db2StaticLight,
  db2StaticDark,
  watsonXStaticLight,
  watsonXStaticDark,
  watsonXAStaticLight,
  watsonXAStaticDark,
  wxbiaStaticLight,
  wxbiaStaticDark,
} from '../assets';

const meta: Meta<typeof AnimatedHeader> = {
  title: 'Components/Animated Header',
  component: AnimatedHeader,
  globals: {
    backgrounds: { value: '#f4f4f4' },
    theme: 'g10',
  },
  parameters: {
    layout: 'fullscreen',
    docs: { page: mdx },
  },
};
export default meta;

/* ------------------------------ ArgTypes ------------------------------ */

const sharedArgTypes = {
  allTileGroups: {
    table: { disable: true },
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
        3: 'db2 (light theme)',
        4: 'db2 (dark theme)',
        5: 'watsonx.data (light theme)',
        6: 'watsonx.data (dark theme)',
        7: 'watsonx (light theme)',
        8: 'watsonx (dark theme)',
        9: 'wxbia (light theme)',
        10: 'wxbia (dark theme)',
      },
    },
    options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    mapping: {
      0: null,
      1: dataFabricAnimatedLight,
      2: dataFabricAnimatedDark,
      3: db2AnimatedLight,
      4: db2AnimatedDark,
      5: watsonXAnimatedLight,
      6: watsonXAnimatedDark,
      7: watsonXAAnimatedLight,
      8: watsonXAAnimatedDark,
      9: wxbiaAnimatedLight,
      10: wxbiaAnimatedDark,
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
        1: 'data fabric (light theme)',
        2: 'data fabric (dark theme)',
        3: 'db2 (light theme)',
        4: 'db2 (dark theme)',
        5: 'watsonx.data (light theme)',
        6: 'watsonx.data (dark theme)',
        7: 'watsonx (light theme)',
        8: 'watsonx (dark theme)',
        9: 'wxbia (light theme)',
        10: 'wxbia (dark theme)',
      },
    },
    options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    mapping: {
      0: null,
      1: dataFabricStaticLight,
      2: dataFabricStaticDark,
      3: db2StaticLight,
      4: db2StaticDark,
      5: watsonXStaticLight,
      6: watsonXStaticDark,
      7: watsonXAStaticLight,
      8: watsonXAStaticDark,
      9: wxbiaStaticLight,
      10: wxbiaStaticDark,
    },
  },
  productName: { description: 'Provide current product name' },
  disabledTaskLabel: {
    description: 'Provide on hover label for disabled tasks',
  },
  selectedTileGroup: {
    description:
      'The tile group that is active in the header ex. "AI Chat Tile w/ two glass tiles", "Four glass tiles", etc.',
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
        9: overflowGlassTileGroup.label,
        10: overflowAiPromptTileGroup.label,
        11: overflowManyTileGroup.label,
        12: overflowNamedPagesTileGroup.label,
      },
    },
    options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
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
      9: overflowGlassTileGroup,
      10: overflowAiPromptTileGroup,
      11: overflowManyTileGroup,
      12: overflowNamedPagesTileGroup,
    },
  },
  tasksControllerConfig: {
    description: 'Configuration for Carbon button or dropdown menu in header.',
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
    description: 'Configuration for workspace selector (Carbon Dropdown).',
    control: {
      type: 'select',
      labels: { 0: 'None', 1: 'Sample', 2: 'Loading' },
    },
    options: [0, 1, 2],
    mapping: {
      0: null,
      1: workspaceSelectorConfig,
      2: workspaceSelectorConfigLoading,
    },
  },
  userName: { description: 'Specify the current username of active user' },
  welcomeText: {
    description: 'Specify the current welcome text on the header',
  },
  isLoading: {
    description: 'Specify whether the header should be in the loading state',
  },
  expandButtonLabel: { description: 'Specify custom expand button label' },
  collapseButtonLabel: { description: 'Specify custom collapse button label' },
  headerActionConfig: {
    description: 'Header action rendered to the left of “Collapse”.',
    control: {
      type: 'select',
      labels: { 0: 'None', 1: 'Icon Button', 2: 'Ghost Button' },
    },
    options: [0, 1, 2],
  },

  contentSwitcherConfig: {
    description:
      'Content Switcher configuration for switching between tasks groups in the header. If not provided, the TasksController will be used instead.',
    control: {
      type: 'select',
      labels: {
        0: 'None',
        1: 'Two items',
        2: 'Three items',
        3: 'Loading',
      },
    },
    options: [0, 1, 2, 3],
    mapping: {
      0: null,
      1: contentSwitcherConfigTwo,
      2: contentSwitcherConfigThree,
      3: contentSwitcherConfigLoading,
    },
  },
  contentSwitcherLowContrast: {
    description:
      'Force the Content Switcher to use lowContrast styling (Carbon prop). Applies when a contentSwitcherConfig is selected.',
    control: { type: 'boolean' },
    table: { category: 'Content Switcher' },
  },
  carouselConfig: {
    description:
      'Optional label/accessibility overrides for the carousel pagination controls. Select an example to see `getPageIndicatorLabel` in action — pair with a paginated `selectedTileGroup` option such as "Sixteen glass tiles — named pages". `getPageIndicatorLabel` is a callback `(pageNumber: number) => string` called with the 1-based page number; return the full label for that dot.',
    control: {
      type: 'select',
      labels: {
        0: 'None',
        1: 'Default (no page labels)',
        2: 'Translation function — Seite {n}',
        3: 'Named pages array — Business vocabulary, Data enrichment…',
      },
    },
    options: [0, 1, 2, 3],
    mapping: {
      0: null,
      1: carouselConfig,
      2: carouselConfigPageLabelTemplate,
      3: carouselConfigPageLabelArray,
    },
  },
};

/* ------------------------------ Shared Args ------------------------------ */

const sharedArgs = {
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
  ariaLabels: {
    welcome: 'Welcomes the user',
    description: 'Short description of the product',
    collapseButton: 'Collapse header details',
    expandButton: 'Expand header details',
    tilesContainer: 'Feature tiles list',
  },
  headerActionConfig: 1,
  contentSwitcherConfig: 0,
  contentSwitcherLowContrast: false,
};

/* ------------------------------ Stories ------------------------------ */

/**
 * Shared story render logic. Used by both ThemeG10 and ThemeG100.
 * Handles wiring for workspace, tile group, tasks controller, content switcher,
 * and header action controls.
 */
const useStoryWiring = (args, updateArgs) => {
  // Workspace select
  const handleWorkspaceSelect = (e) => {
    updateArgs({
      ...args,
      workspaceSelectorConfig: {
        ...args.workspaceSelectorConfig,
        selectedWorkspace: e.selectedItem,
      },
    });
  };

  // Tile group select — used by tasksController dropdown and contentSwitcher
  const handleTileGroupSelect = (eOrGroup) => {
    const next = (eOrGroup as any)?.selectedItem ?? eOrGroup;
    updateArgs({ ...args, selectedTileGroup: next });
  };

  // Inject dropdown-only TasksController wiring
  const tasksControllerConfigInjected = React.useMemo(() => {
    const tc = args.tasksControllerConfig;
    if (!tc) return tc;
    if (tc.type === 'dropdown') {
      return {
        ...tc,
        dropdown: {
          ...tc.dropdown,
          allTileGroups: headerTiles,
          selectedTileGroup: args.selectedTileGroup,
          setSelectedTileGroup: handleTileGroupSelect,
        },
      };
    }
    return tc;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [args, updateArgs]);

  // HeaderActionConfig mapping
  const headerActionConfigResolved: HeaderActionConfig | null =
    React.useMemo(() => {
      const t = args.headerActionConfig;
      if (t === 1) return headerActionIcon;
      if (t === 2) return headerActionGhost;
      return null;
    }, [args.headerActionConfig]);

  // ContentSwitcher wiring — uses headerTiles (not carousel pages)
  const contentSwitcherConfigInjected = React.useMemo(() => {
    const base = args.contentSwitcherConfig;
    if (!base) return undefined;

    const count: 2 | 3 = base.visibleCount === 3 ? 3 : 2;

    const items = Array.from({ length: count }, (_, i) => ({
      id: base.items?.[i]?.id ?? `opt-${i}`,
      text: headerTiles[i].label,
      onSelect: () =>
        updateArgs({ ...args, selectedTileGroup: headerTiles[i] }),
    }));

    const activeIdx = Math.max(
      0,
      Math.min(
        items.findIndex((it, i) => headerTiles[i] === args.selectedTileGroup),
        items.length - 1
      )
    );

    return {
      ...base,
      lowContrast:
        typeof args.contentSwitcherLowContrast === 'boolean'
          ? args.contentSwitcherLowContrast
          : base.lowContrast,
      items,
      selectedIndex:
        typeof base.selectedIndex === 'number'
          ? Math.min(Math.max(base.selectedIndex, 0), items.length - 1)
          : activeIdx,
      ariaLabel: base.ariaLabel ?? 'Header actions',
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    args,
    updateArgs,
    args.contentSwitcherConfig,
    args.selectedTileGroup,
    args.contentSwitcherLowContrast,
  ]);

  return {
    headerActionConfigResolved,
    tasksControllerConfigInjected,
    contentSwitcherConfigInjected,
    handleWorkspaceSelect,
    handleTileGroupSelect,
  };
};

export const ThemeG10 = (args) => {
  const [_, updateArgs] = useArgs();
  const {
    headerActionConfigResolved,
    tasksControllerConfigInjected,
    contentSwitcherConfigInjected,
    handleWorkspaceSelect,
    handleTileGroupSelect,
  } = useStoryWiring(args, updateArgs);

  return (
    <AnimatedHeader
      {...args}
      workspaceSelectorConfig={{
        ...args.workspaceSelectorConfig,
        setSelectedWorkspace: handleWorkspaceSelect,
      }}
      setSelectedTileGroup={handleTileGroupSelect}
      tasksControllerConfig={tasksControllerConfigInjected}
      contentSwitcherConfig={contentSwitcherConfigInjected}
      headerActionConfig={headerActionConfigResolved ?? undefined}
    />
  );
};

ThemeG10.argTypes = { ...sharedArgTypes };
ThemeG10.args = { headerAnimation: 3, ...sharedArgs };

export const ThemeG100 = (args) => {
  const [_, updateArgs] = useArgs();
  const {
    headerActionConfigResolved,
    tasksControllerConfigInjected,
    contentSwitcherConfigInjected,
    handleWorkspaceSelect,
    handleTileGroupSelect,
  } = useStoryWiring(args, updateArgs);

  return (
    <AnimatedHeader
      {...args}
      workspaceSelectorConfig={{
        ...args.workspaceSelectorConfig,
        setSelectedWorkspace: handleWorkspaceSelect,
      }}
      setSelectedTileGroup={handleTileGroupSelect}
      tasksControllerConfig={tasksControllerConfigInjected}
      contentSwitcherConfig={contentSwitcherConfigInjected}
      headerActionConfig={headerActionConfigResolved ?? undefined}
    />
  );
};

ThemeG100.argTypes = { ...sharedArgTypes };
ThemeG100.args = { headerAnimation: 4, ...sharedArgs };
ThemeG100.globals = {
  backgrounds: { value: '#161616' },
  theme: 'g100',
};

