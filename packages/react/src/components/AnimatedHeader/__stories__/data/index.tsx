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
} from '@carbon/react/icons';
import { TileGroup } from '../../components/AnimatedHeader/types';
import SampleCustomTaskContent from './SampleCustomTaskContent';

export const workspaceData = [
  {
    id: 'workspace-1',
    label: 'Workspace 1',
  },
  {
    id: 'workspace-2',
    label: 'Workspace 2',
  },
  {
    id: 'workspace-3',
    label: 'Workspace 3',
  },
];

export const headerTiles: TileGroup[] = [
  {
    id: 1,
    label: 'AI Prompt Tile w/ two glass tiles',
    tiles: [
      {
        tileId: 'tile-1',
        variant: 'aiPrompt',
        //id: 'ai-tile', // Back-compat
        href: '#',
        title: 'Short description of the type of prompt',
        primaryIcon: Term,
        ariaLabel: 'Start a conversation with the AI assistant',
        promptPlaceholder: 'Start chatting...',
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
      },
      {
        tileId: 'tile-3',
        href: '#',
        title: 'Create and run SQL queries',
        subtitle: 'with SQL editor',
        primaryIcon: Sql,
        ariaLabel: 'Create and run SQL queries using SQL editor',
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
      },
      {
        tileId: 'tile-3',
        href: '#',
        title: 'Create and run SQL queries',
        subtitle: 'with SQL editor',
        primaryIcon: Sql,
        ariaLabel: 'Create and run SQL queries using SQL editor',
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
      },
      {
        tileId: 'tile-3',
        href: '#',
        title: 'Disabled tile',
        subtitle: 'with SQL editor',
        primaryIcon: Sql,
        isDisabled: true,
        ariaLabel: 'Disabled tile',
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
] satisfies TileGroup[];

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
