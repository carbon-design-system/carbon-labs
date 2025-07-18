/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Loading } from '@carbon/react';
import SampleCustomTaskContent from './SampleCustomTaskContent';
import {
  ArrowRight,
  ChartLineData,
  DataSet,
  Export,
  Sql,
  Term,
} from '@carbon/react/icons';

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
      },
      {
        id: 'tile-1',
        href: '#',
        title: 'Load data',
        subtitle: 'with Data explorer',
        mainIcon: DataSet,
      },
      {
        id: 'tile-2',
        href: '#',
        title: 'Monitor data performance and system capacity',
        subtitle: 'with Monitoring hub',
        mainIcon: ChartLineData,
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
      },
      {
        id: 'tile-2',
        href: '#',
        title: 'Monitor data performance and system capacity',
        subtitle: 'with Monitoring hub',
        mainIcon: ChartLineData,
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
      },
      {
        id: 'tile-2',
        href: '#',
        title: 'Monitor data performance and system capacity',
        subtitle: 'with Monitoring hub',
        mainIcon: ChartLineData,
      },
      {
        id: 'tile-3',
        href: '#',
        title: 'Create and run SQL queries',
        subtitle: 'with SQL editor',
        mainIcon: Sql,
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
      },
      {
        id: 'tile-2',
        href: '#',
        title: 'Monitor data performance and system capacity',
        subtitle: 'with Monitoring hub',
        mainIcon: ChartLineData,
      },
      {
        id: 'tile-3',
        href: '#',
        title: 'Create and run SQL queries',
        subtitle: 'with SQL editor',
        mainIcon: Sql,
      },
      {
        id: 'tile-4',
        href: '#',
        title: 'Export data',
        mainIcon: Export,
        secondaryIcon: ArrowRight,
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
      },
      {
        id: 'tile-2',
        title: 'Non-interactive tile',
        subtitle: 'with Monitoring hub',
        mainIcon: ChartLineData,
      },
      {
        id: 'tile-3',
        href: '#',
        title: 'Disabled tile',
        subtitle: 'with SQL editor',
        mainIcon: Sql,
        isDisabled: true,
      },
      {
        id: 'tile-4',
        href: '#',
        title: 'Export data',
        mainIcon: Export,
        secondaryIcon: ArrowRight,
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
      },
      {
        id: 'tile-2',
        customContent: <SampleCustomTaskContent />,
      },
    ],
  },
];
