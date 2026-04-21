/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Alternative mock account data for the R3F canvas WITHOUT columnIndex.
 * This demonstrates blocks that will be automatically positioned by the layout system.
 * When columnIndex is omitted, blocks are automatically distributed across
 * responsive columns by the primary-layer auto-placement logic.
 */
import type { PrimaryLayerBlock, VisualizationData } from '../types';
import { BLOCK_SIZES, FOUNDATION_RACK_STATES } from '../types';

/**
 * Primary layer blocks without columnIndex - will be auto-positioned
 */
export const mockPrimaryLayerNoColumnIndex: PrimaryLayerBlock[] = [
  {
    id: 'tenant-auto-1',
    label: 'Account',
    hoverLabel: 'Auto-positioned Account 1',
    color: 'blue',
    size: BLOCK_SIZES.sm,
  },
  {
    id: 'tenant-auto-2',
    label: 'Account',
    hoverLabel: 'Auto-positioned Account 2',
    color: 'blue',
    size: BLOCK_SIZES.lg,
  },
  {
    id: 'tenant-auto-3',
    label: 'Account',
    hoverLabel: 'Auto-positioned Account 3',
    color: 'blue',
    size: BLOCK_SIZES.lg,
  },
  {
    id: 'tenant-auto-4',
    label: 'Account',
    hoverLabel: 'Auto-positioned Account 4',
    color: 'blue',
    size: BLOCK_SIZES.sm,
  },
  {
    id: 'tenant-auto-5',
    label: 'Account',
    hoverLabel: 'Auto-positioned Account 5',
    color: 'blue',
    size: BLOCK_SIZES.sm,
  },
  {
    id: 'tenant-auto-6',
    label: 'Account',
    hoverLabel: 'Auto-positioned Account 6',
    color: 'blue',
    size: BLOCK_SIZES.lg,
  },
  {
    id: 'tenant-auto-7',
    label: 'Account',
    hoverLabel: 'Auto-positioned Account 7',
    color: 'blue',
    size: BLOCK_SIZES.sm,
  },
  {
    id: 'tenant-auto-8',
    label: 'Account',
    hoverLabel: 'Auto-positioned Account 8',
    color: 'blue',
    size: BLOCK_SIZES.sm,
  },
  {
    id: 'tenant-auto-9',
    label: 'Account',
    hoverLabel: 'Auto-positioned Account 9',
    color: 'blue',
    size: BLOCK_SIZES.sm,
  },
  {
    id: 'tenant-auto-10',
    label: 'Account',
    hoverLabel: 'Auto-positioned Account 10',
    color: 'blue',
    size: BLOCK_SIZES.sm,
  },
  {
    id: 'tenant-auto-11',
    label: 'Account',
    hoverLabel: 'Auto-positioned Account 11',
    color: 'blue',
    size: BLOCK_SIZES.md,
  },
  {
    id: 'tenant-auto-12',
    label: 'Account',
    hoverLabel: 'Auto-positioned Account 12',
    color: 'blue',
    size: BLOCK_SIZES.md,
  },
  {
    id: 'tenant-auto-13',
    label: 'Account',
    hoverLabel: 'Auto-positioned Account 13',
    color: 'blue',
    size: BLOCK_SIZES.sm,
  },
  {
    id: 'tenant-auto-14',
    label: 'Account',
    hoverLabel: 'Auto-positioned Account 14',
    color: 'blue',
    size: BLOCK_SIZES.sm,
  },
  {
    id: 'tenant-auto-15',
    label: 'Account',
    hoverLabel: 'Auto-positioned Account 15',
    color: 'blue',
    size: BLOCK_SIZES.sm,
  },
  {
    id: 'tenant-auto-16',
    label: 'Account',
    hoverLabel: 'Auto-positioned Account 16',
    color: 'blue',
    size: BLOCK_SIZES.sm,
  },
  {
    id: 'tenant-auto-17',
    label: 'Account',
    hoverLabel: 'Auto-positioned Account 17',
    color: 'blue',
    size: BLOCK_SIZES.sm,
  },
  {
    id: 'tenant-auto-18',
    label: 'Account',
    hoverLabel: 'Auto-positioned Account 18',
    color: 'blue',
    size: BLOCK_SIZES.sm,
  },
];

/**
 * Minimal set of blocks without columnIndex for testing
 */
export const mockPrimaryLayerMinimal: PrimaryLayerBlock[] = [
  {
    id: 'tenant-min-1',
    label: 'Account',
    hoverLabel: 'Minimal Account 1',
    color: 'blue',
    size: BLOCK_SIZES.lg,
  },
  {
    id: 'tenant-min-2',
    label: 'Account',
    hoverLabel: 'Minimal Account 2',
    color: 'blue',
    size: BLOCK_SIZES.md,
  },
  {
    id: 'tenant-min-3',
    label: 'Account',
    hoverLabel: 'Minimal Account 3',
    color: 'blue',
    size: BLOCK_SIZES.sm,
  },
];

/**
 * Mixed sizes without columnIndex for testing layout algorithms
 */
export const mockPrimaryLayerMixedSizes: PrimaryLayerBlock[] = [
  {
    id: 'tenant-mixed-1',
    label: 'Large',
    hoverLabel: 'Large Account',
    color: 'blue',
    size: BLOCK_SIZES.lg,
  },
  {
    id: 'tenant-mixed-2',
    label: 'Small',
    hoverLabel: 'Small Account',
    color: 'blue',
    size: BLOCK_SIZES.sm,
  },
  {
    id: 'tenant-mixed-3',
    label: 'Medium',
    hoverLabel: 'Medium Account',
    color: 'blue',
    size: BLOCK_SIZES.md,
  },
  {
    id: 'tenant-mixed-4',
    label: 'Large',
    hoverLabel: 'Large Account',
    color: 'blue',
    size: BLOCK_SIZES.lg,
  },
  {
    id: 'tenant-mixed-5',
    label: 'Small',
    hoverLabel: 'Small Account',
    color: 'blue',
    size: BLOCK_SIZES.sm,
  },
  {
    id: 'tenant-mixed-6',
    label: 'Small',
    hoverLabel: 'Small Account',
    color: 'blue',
    size: BLOCK_SIZES.sm,
  },
  {
    id: 'tenant-mixed-7',
    label: 'Medium',
    hoverLabel: 'Medium Account',
    color: 'blue',
    size: BLOCK_SIZES.md,
  },
  {
    id: 'tenant-mixed-8',
    label: 'Large',
    hoverLabel: 'Large Account',
    color: 'blue',
    size: BLOCK_SIZES.lg,
  },
];

/**
 * Single block without columnIndex
 */
export const mockPrimaryLayerSingle: PrimaryLayerBlock[] = [
  {
    id: 'tenant-single',
    label: 'Account',
    hoverLabel: 'Single Account',
    color: 'blue',
    size: BLOCK_SIZES.lg,
  },
];

/**
 * Complete visualization data using blocks without columnIndex
 */
export const mockVisualizationDataNoColumnIndex: VisualizationData = {
  primaryLayer: mockPrimaryLayerNoColumnIndex,
  coreLayer: [
    {
      id: 'core-1',
      label: 'Sovereign Core',
      hoverLabel: 'Core Layer',
      size: BLOCK_SIZES.lg,
    },
  ],
  foundationConfig: {
    id: 'foundation-1',
    label: 'Foundation',
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
  },
  textBracket: {
    title: 'IBM Sovereign Core',
    sections: ['15 total control plane nodes', '15 total worker nodes'],
  },
};

/**
 * Minimal visualization data for quick testing
 */
export const mockVisualizationDataMinimal: VisualizationData = {
  primaryLayer: mockPrimaryLayerMinimal,
  coreLayer: [
    {
      id: 'core-1',
      label: 'Sovereign Core',
      hoverLabel: 'Core Layer',
      size: BLOCK_SIZES.lg,
    },
  ],
  foundationConfig: {
    id: 'foundation-1',
    label: 'Foundation',
    racks: [
      {
        id: 'rack-1',
        slots: 4,
        variant: FOUNDATION_RACK_STATES.open,
        status: 'green',
      },
    ],
  },
  textBracket: {
    title: 'IBM Sovereign Core',
    sections: ['3 accounts'],
  },
};

// Made with Bob
