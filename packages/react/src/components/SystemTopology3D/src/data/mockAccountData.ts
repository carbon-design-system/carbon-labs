/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Mock account data for the R3F canvas.
 * Structured like `packages/canvas/src/data/mockAccountData.ts`.
 */
import type {
  CoreLayerConfig,
  FoundationConfig,
  PrimaryLayerBlock,
  TextBracketConfig,
  VisualizationData,
} from '../types';
import { BLOCK_SIZES, FOUNDATION_RACK_STATES } from '../types';

export const mockPrimaryLayer: PrimaryLayerBlock[] = [
  {
    id: 'tenant-1',
    label: 'Gateway',
    hoverLabel: 'API Gateway - us-east-1a',
    columnIndex: 0,
    size: BLOCK_SIZES.sm,
  },
  {
    id: 'tenant-2',
    label: 'Auth',
    hoverLabel: 'Authentication Service - OAuth2',
    columnIndex: 0,
    size: BLOCK_SIZES.lg,
  },
  {
    id: 'tenant-3',
    label: 'Users',
    hoverLabel: 'User Management - PostgreSQL',
    columnIndex: 0,
    size: BLOCK_SIZES.lg,
  },
  {
    id: 'tenant-4',
    label: 'Payments',
    hoverLabel: 'Payment Processing - Stripe Integration',
    columnIndex: 1,
    size: BLOCK_SIZES.sm,
  },
  {
    id: 'tenant-5',
    label: 'Notify',
    hoverLabel: 'Notification Hub - Email/SMS/Push',
    columnIndex: 1,
    size: BLOCK_SIZES.sm,
  },
  {
    id: 'tenant-6',
    label: 'Analytics',
    hoverLabel: 'Analytics Engine - Real-time Processing',
    columnIndex: 2,

    size: BLOCK_SIZES.lg,
  },
  {
    id: 'tenant-7',
    label: 'Search',
    hoverLabel: 'Search Service - Elasticsearch Cluster',
    columnIndex: 2,
    size: BLOCK_SIZES.sm,
  },
  {
    id: 'tenant-8',
    label: 'Cache',
    hoverLabel: 'Redis Cache - 16GB Memory',
    columnIndex: 3,
    size: BLOCK_SIZES.sm,
  },
  {
    id: 'tenant-9',
    label: 'Queue',
    hoverLabel: 'Message Queue - RabbitMQ',
    columnIndex: 3,
    size: BLOCK_SIZES.sm,
  },
  {
    id: 'tenant-10',
    label: 'Storage',
    hoverLabel: 'Object Storage - S3 Compatible',
    columnIndex: 4,
    size: BLOCK_SIZES.sm,
  },
  {
    id: 'tenant-11',
    label: 'Media',
    hoverLabel: 'Media Processing - Video Transcoding',
    columnIndex: 4,
    size: BLOCK_SIZES.md,
  },
  {
    id: 'tenant-12',
    label: 'Email',
    hoverLabel: 'Email Service - SMTP Gateway',
    columnIndex: 4,
    size: BLOCK_SIZES.md,
  },
  {
    id: 'tenant-13',
    label: 'Logs',
    hoverLabel: 'Centralized Logging - ELK Stack',
    columnIndex: 5,
    size: BLOCK_SIZES.sm,
  },
  {
    id: 'tenant-14',
    label: 'Monitor',
    hoverLabel: 'Monitoring - Prometheus + Grafana',
    columnIndex: 5,
    size: BLOCK_SIZES.sm,
  },
  {
    id: 'tenant-15',
    label: 'Backup',
    hoverLabel: 'Backup Service - Daily Snapshots',
    columnIndex: 6,
    size: BLOCK_SIZES.sm,
  },
  {
    id: 'tenant-16',
    label: 'CDN',
    hoverLabel: 'Content Delivery - Global Edge Network',
    columnIndex: 6,
    size: BLOCK_SIZES.sm,
  },
  {
    id: 'tenant-17',
    label: 'LB',
    hoverLabel: 'Load Balancer - NGINX',
    columnIndex: 7,
    size: BLOCK_SIZES.sm,
  },
  {
    id: 'tenant-18',
    label: 'Health',
    hoverLabel: 'Health Checks - Uptime Monitoring',
    columnIndex: 7,
    size: BLOCK_SIZES.sm,
  },
];

export const mockCoreLayer: CoreLayerConfig[] = [
  {
    id: 'core-1',
    label: 'Kubernetes Cluster',
    hoverLabel: 'Core Infrastructure Layer',
    size: BLOCK_SIZES.lg,
  },
  // {
  //   id: 'core-2',
  //   label: 'Sovereignty',
  //   hoverLabel: 'Sovereignty Layer',
  //   size: BLOCK_SIZES.sm,
  // },
];

export const mockFoundationConfig: FoundationConfig = {
  id: 'foundation-1',
  label: 'Physical Infrastructure',
  racks: [
    {
      id: 'rack-1',
      slots: 4,
      variant: FOUNDATION_RACK_STATES.open,
      status: 'green',
    },
    {
      id: 'rack-2',
      slots: 4,
      variant: FOUNDATION_RACK_STATES.open,
      status: 'green',
    },
    {
      id: 'rack-3',
      slots: 4,
      variant: FOUNDATION_RACK_STATES.open,
      status: 'green',
    },
    {
      id: 'rack-4',
      slots: 4,
      variant: FOUNDATION_RACK_STATES.open,
      status: 'green',
    },
  ],
};

export const mockTextBracket: TextBracketConfig = {
  title: 'System Topology',
  sections: ['18 microservices', '4 server racks'],
};

export const mockVisualizationData: VisualizationData = {
  primaryLayer: mockPrimaryLayer,
  coreLayer: mockCoreLayer,
  foundationConfig: mockFoundationConfig,
  textBracket: mockTextBracket,
};
