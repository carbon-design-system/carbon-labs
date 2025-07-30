/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  Add,
  ArrowRight,
  ChartLineData,
  DataSet,
  Export,
  Sql,
  Term,
} from '@carbon/react/icons';
import { ButtonKinds, Loading } from '@carbon/react';
import SampleCustomTaskContent from './SampleCustomTaskContent';
import React from 'react';

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

export const headerTiles = [
  {
    id: 1,
    label: 'AI Chat Tile w/ two glass tiles',
    tiles: [
      {
        id: 'ai-tile',
        href: '#',
        title: 'Short description of the type of prompt',
        mainIcon: Term,
        ariaLabel: 'Start a conversation with the AI assistant',
      },
      {
        id: 'tile-1',
        href: '#',
        title: 'Load data',
        subtitle: 'with Data explorer',
        mainIcon: DataSet,
        ariaLabel: 'Load data using Data explorer',
      },
      {
        id: 'tile-2',
        href: '#',
        title: 'Monitor data performance and system capacity',
        subtitle: 'with Monitoring hub',
        mainIcon: ChartLineData,
        ariaLabel: 'Monitor data using Monitoring hub',
      },
    ],
  },
  {
    id: 2,
    label: 'One glass tile',
    tiles: [
      {
        id: 'tile-1',
        href: '#',
        title: 'Load data',
        subtitle: 'with Data explorer',
        mainIcon: DataSet,
        ariaLabel: 'Load data using Data explorer',
      },
    ],
  },
  {
    id: 3,
    label: 'Two glass tiles',
    tiles: [
      {
        id: 'tile-1',
        href: '#',
        title: 'Load data',
        subtitle: 'with Data explorer',
        mainIcon: DataSet,
        ariaLabel: 'Load data using Data explorer',
      },
      {
        id: 'tile-2',
        href: '#',
        title: 'Monitor data performance and system capacity',
        subtitle: 'with Monitoring hub',
        mainIcon: ChartLineData,
        ariaLabel: 'Monitor data using Monitoring hub',
      },
    ],
  },
  {
    id: 4,
    label: 'Three glass tiles',
    tiles: [
      {
        id: 'tile-1',
        href: '#',
        title: 'Load data',
        subtitle: 'with Data explorer',
        mainIcon: DataSet,
        ariaLabel: 'Load data using Data explorer',
      },
      {
        id: 'tile-2',
        href: '#',
        title: 'Monitor data performance and system capacity',
        subtitle: 'with Monitoring hub',
        mainIcon: ChartLineData,
        ariaLabel: 'Monitor data using Monitoring hub',
      },
      {
        id: 'tile-3',
        href: '#',
        title: 'Create and run SQL queries',
        subtitle: 'with SQL editor',
        mainIcon: Sql,
        ariaLabel: 'Create and run SQL queries using SQL editor',
      },
    ],
  },
  {
    id: 5,
    label: 'Four glass tiles',
    tiles: [
      {
        id: 'tile-1',
        href: '#',
        title: 'Load data',
        subtitle: 'with Data explorer',
        mainIcon: DataSet,
        ariaLabel: 'Load data using Data explorer',
      },
      {
        id: 'tile-2',
        href: '#',
        title: 'Monitor data performance and system capacity',
        subtitle: 'with Monitoring hub',
        mainIcon: ChartLineData,
        ariaLabel: 'Monitor data using Monitoring hub',
      },
      {
        id: 'tile-3',
        href: '#',
        title: 'Create and run SQL queries',
        subtitle: 'with SQL editor',
        mainIcon: Sql,
        ariaLabel: 'Create and run SQL queries using SQL editor',
      },
      {
        id: 'tile-4',
        href: '#',
        title: 'Export data',
        mainIcon: Export,
        secondaryIcon: ArrowRight,
        ariaLabel: 'Export data',
      },
    ],
  },
  {
    id: 6,
    label: 'Loading, non-interactive and disabled cards',
    tiles: [
      {
        id: 'tile-1',
        href: '#',
        title: 'Loading tile',
        subtitle: 'with Data explorer',
        mainIcon: DataSet,
        isLoading: true,
        ariaLabel: 'Loading tile',
      },
      {
        id: 'tile-2',
        title: 'Non-interactive tile',
        subtitle: 'with Monitoring hub',
        mainIcon: ChartLineData,
        ariaLabel: 'Non-interactive tile',
      },
      {
        id: 'tile-3',
        href: '#',
        title: 'Disabled tile',
        subtitle: 'with SQL editor',
        mainIcon: Sql,
        isDisabled: true,
        ariaLabel: 'Disabled tile',
      },
      {
        id: 'tile-4',
        href: '#',
        title: 'Export data',
        mainIcon: Export,
        secondaryIcon: ArrowRight,
        ariaLabel: 'Export data',
      },
    ],
  },
  {
    id: 7,
    label: 'Custom content tasks',
    tiles: [
      {
        id: 'tile-1',
        customContent: (
          <Loading withOverlay={false} description="Sample loading state" />
        ),
        ariaLabel: 'Custom content tile with loading state',
      },
      {
        id: 'tile-2',
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
