/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { ButtonKinds, Loading } from '@carbon/react';
import {
  Add,
  ArrowRight,
  ChartLineData,
  DataSet,
  Export,
  Sql,
  Term,
  Watsonx,
  Settings,
} from '@carbon/react/icons';
import { TileGroup } from '../../components/AnimatedHeader/types';
import type { HeaderActionConfig } from '../../components/HeaderAction/header-action.types';
import type { ContentSwitcherConfig } from '../../components/ContentSwitcherSelector/ContentSwitcherSelector';
import SampleCustomTaskContent from './SampleCustomTaskContent';

export const workspaceData = [
  { id: 'workspace-1', label: 'Workspace 1' },
  { id: 'workspace-2', label: 'Workspace 2' },
  { id: 'workspace-3', label: 'Workspace 3' },
];

export const headerTiles: TileGroup[] = [
  {
    id: 1,
    label: 'AI Prompt Tile w/ two glass tiles',
    tiles: [
      {
        tileId: 'tile-1',
        variant: 'aiPrompt',
        href: '#',
        title: 'Short description of the type of prompt',
        primaryIcon: Term,
        ariaLabel: 'Start a conversation with the AI assistant',
        promptPlaceholder: 'Start chatting...',
        aiLabelVariant: 'aiLabel',
      },
      {
        tileId: 'tile-2',
        variant: 'glass',
        href: '#',
        title: 'Load data',
        subtitle: 'with Data explorer',
        primaryIcon: DataSet,
        ariaLabel: 'Load data using Data explorer',
      },
      {
        tileId: 'tile-3',
        variant: 'glass',
        href: '#',
        title: 'Monitor data performance and system capacity',
        subtitle: 'with Monitoring hub',
        primaryIcon: ChartLineData,
        ariaLabel: 'Monitor data using Monitoring hub',
      },
    ],
  },
  {
    id: 2,
    label: 'AI Tile w/ two glass tiles',
    tiles: [
      {
        tileId: 'tile-1',
        variant: 'ai',
        href: '#',
        title: 'Start building data solutions',
        subtitle: 'with watsonx',
        primaryIcon: Watsonx,
        ariaLabel: 'Loading tile',
        aiLabelVariant: 'tag',
        aiLabelText: 'Preview',
        aiLabelTagType: 'gray',
      },
      {
        tileId: 'tile-2',
        variant: 'glass',
        href: '#',
        title: 'Monitor data performance and system capacity',
        subtitle: 'with Monitoring hub',
        primaryIcon: ChartLineData,
        ariaLabel: 'Monitor data using Monitoring hub',
      },
      {
        tileId: 'tile-3',
        variant: 'glass',
        href: '#',
        title: 'Create and run SQL queries',
        subtitle: 'with SQL editor',
        primaryIcon: Sql,
        ariaLabel: 'Create and run SQL queries using SQL editor',
      },
    ],
  },
  {
    id: 3,
    label: 'One glass tile',
    tiles: [
      {
        tileId: 'tile-1',
        href: '#',
        title: 'Load data',
        subtitle: 'with Data explorer',
        primaryIcon: DataSet,
        ariaLabel: 'Load data using Data explorer',
      },
    ],
  },
  {
    id: 4,
    label: 'Two glass tiles',
    tiles: [
      {
        tileId: 'tile-1',
        href: '#',
        title: 'Load data',
        subtitle: 'with Data explorer',
        primaryIcon: DataSet,
        ariaLabel: 'Load data using Data explorer',
      },
      {
        tileId: 'tile-2',
        href: '#',
        title: 'Monitor data performance and system capacity',
        subtitle: 'with Monitoring hub',
        primaryIcon: ChartLineData,
        ariaLabel: 'Monitor data using Monitoring hub',
        tagLabel: 'Beta',
        tagType: 'teal',
      },
    ],
  },
  {
    id: 5,
    label: 'Three glass tiles',
    tiles: [
      {
        tileId: 'tile-1',
        href: '#',
        title: 'Load data',
        subtitle: 'with Data explorer',
        primaryIcon: DataSet,
        ariaLabel: 'Load data using Data explorer',
      },
      {
        tileId: 'tile-2',
        href: '#',
        title: 'Monitor data performance and system capacity',
        subtitle: 'with Monitoring hub',
        primaryIcon: ChartLineData,
        ariaLabel: 'Monitor data using Monitoring hub',
        tagLabel: 'Beta',
        tagType: 'teal',
      },
      {
        tileId: 'tile-3',
        href: '#',
        title: 'Create and run SQL queries',
        subtitle: 'with SQL editor',
        primaryIcon: Sql,
        ariaLabel: 'Create and run SQL queries using SQL editor',
        tagLabel: 'Preview',
        tagType: 'cool-gray',
      },
    ],
  },
  {
    id: 6,
    label: 'Four glass tiles',
    tiles: [
      {
        tileId: 'tile-1',
        href: '#',
        title: 'Load data',
        subtitle: 'with Data explorer',
        primaryIcon: DataSet,
        ariaLabel: 'Load data using Data explorer',
      },
      {
        tileId: 'tile-2',
        href: '#',
        title: 'Monitor data performance and system capacity',
        subtitle: 'with Monitoring hub',
        primaryIcon: ChartLineData,
        ariaLabel: 'Monitor data using Monitoring hub',
        tagLabel: 'Beta',
        tagType: 'teal',
      },
      {
        tileId: 'tile-3',
        href: '#',
        title: 'Create and run SQL queries',
        subtitle: 'with SQL editor',
        primaryIcon: Sql,
        ariaLabel: 'Create and run SQL queries using SQL editor',
        tagLabel: 'Preview',
        tagType: 'cool-gray',
      },
      {
        tileId: 'tile-4',
        href: '#',
        title: 'Export data',
        primaryIcon: Export,
        secondaryIcon: ArrowRight,
        ariaLabel: 'Export data',
      },
    ],
  },
  {
    id: 7,
    label: 'Loading, non-interactive and disabled cards',
    tiles: [
      {
        tileId: 'tile-1',
        href: '#',
        title: 'Loading tile',
        subtitle: 'with Data explorer',
        primaryIcon: DataSet,
        isLoading: true,
        ariaLabel: 'Loading tile',
      },
      {
        tileId: 'tile-2',
        title: 'Non-interactive tile',
        subtitle: 'with Monitoring hub',
        primaryIcon: ChartLineData,
        ariaLabel: 'Non-interactive tile',
        tagLabel: 'New',
        tagType: 'gray',
      },
      {
        tileId: 'tile-3',
        href: '#',
        title: 'Disabled tile',
        subtitle: 'with SQL editor',
        primaryIcon: Sql,
        isDisabled: true,
        ariaLabel: 'Disabled tile',
        tagLabel: 'Disabled',
        tagType: 'outline',
      },
      {
        tileId: 'tile-4',
        href: '#',
        title: 'Export data',
        primaryIcon: Export,
        secondaryIcon: ArrowRight,
        ariaLabel: 'Export data',
        tagLabel: 'Action',
        tagType: 'blue',
      },
    ],
  },
  {
    id: 8,
    label: 'Custom content tasks',
    tiles: [
      {
        tileId: 'tile-1',
        customContent: (
          <Loading withOverlay={false} description="Sample loading state" />
        ),
        ariaLabel: 'Custom content tile with loading state',
      },
      {
        tileId: 'tile-2',
        customContent: <SampleCustomTaskContent />,
        ariaLabel: 'Custom content tile',
      },
    ],
  },
];

export const tasksControllerConfigButton = {
  type: 'button',
  button: {
    href: '#',
    icon: Add,
    text: 'Action button',
    type: ButtonKinds[7],
  },
};

export const tasksControllerConfigDropdown = {
  type: 'dropdown',
  dropdown: {
    label: 'Customize your journey',
    allTileGroups: headerTiles,
    selectedTileGroup: headerTiles[0],
    setSelectedTileGroup: () => {},
    ariaLabel: 'Select a task group',
  },
};

export const tasksControllerConfigLoading = {
  type: 'none',
  isLoading: true,
};

export const contentSwitcherConfigTwo: ContentSwitcherConfig = {
  ariaLabel: 'Content switcher actions',
  visibleCount: 2,
  selectedIndex: 0,
  items: [
    { id: 'opt-0', text: headerTiles[0].label },
    { id: 'opt-1', text: headerTiles[1].label },
  ],
};

export const contentSwitcherConfigThree: ContentSwitcherConfig = {
  ariaLabel: 'Content switcher actions',
  visibleCount: 3,
  selectedIndex: 0,
  items: [
    { id: 'opt-0', text: headerTiles[0].label },
    { id: 'opt-1', text: headerTiles[1].label },
    { id: 'opt-2', text: headerTiles[2].label },
  ],
};

export const contentSwitcherConfigLoading: ContentSwitcherConfig = {
  ariaLabel: 'Header actions',
  isLoading: true,
  visibleCount: 2,
  selectedIndex: 0,
  items: [],
};

export const workspaceSelectorConfig = {
  allWorkspaces: workspaceData,
  setSelectedWorkspace: () => {},
  propsOverrides: {
    label: 'Select workspace',
    renderSelectedItem: (item) => `Open in: ${item.label}`,
  },
  ariaLabel: 'Select a workspace',
};

export const workspaceSelectorConfigLoading = {
  allWorkspaces: workspaceData,
  setSelectedWorkspace: () => {},
  isLoading: true,
};

export const headerActionIcon: HeaderActionConfig = {
  type: 'icon-button',
  icon: Settings,
  iconLabel: 'Open controls',
  onClick: () => alert('Open any modal/panel'),
};

export const headerActionGhost: HeaderActionConfig = {
  type: 'ghost-button',
  icon: ArrowRight,
  label: 'View all',
  onClick: () => alert('Open “All tiles” modal/tearsheet'),
};
