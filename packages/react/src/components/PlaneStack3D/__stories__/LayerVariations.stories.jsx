/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import PlaneStack3D from '../index';
import { BLOCK_SIZES, FOUNDATION_RACK_STATES } from '../index';
import '../src/styles/canvas.scss';

const meta = {
  title: 'Components/PlaneStack3D/Layer Variations',
  component: PlaneStack3D,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
These stories demonstrate the three-layer architecture of PlaneStack3D and how different layer configurations create various visualization styles. Each layer serves a distinct purpose in the data hierarchy.

## Three-Layer Architecture

### Primary Layer (Top)
The main data layer displaying individual blocks in columns:
- **Purpose**: Show primary entities, services, or data points
- **Layout**: Organized in responsive columns (2/4/6/8)
- **Features**: Supports carousel pagination, auto-placement, and manual positioning
- **Customization**: Block sizes, colors, labels, and hover states

### Core Layer (Middle)
Central services or shared resources beneath the primary layer:
- **Purpose**: Represent foundational services that support primary entities
- **Layout**: Centered, typically 1-3 blocks
- **Visual**: Distinct styling to differentiate from primary layer
- **Use Cases**: Shared databases, core APIs, central infrastructure

### Foundation Layer (Bottom)
Infrastructure racks and drawers at the base:
- **Purpose**: Physical or logical infrastructure foundation
- **Components**: Racks with configurable slots and status indicators
- **States**: Open (with slots) or closed (slots: 0)
- **Status Colors**: Green (healthy), yellow (warning), red (error)

## Layer Combinations

### Full Stack
All three layers present - shows complete system architecture from infrastructure to applications

### Minimal Configurations
- **Primary Only**: Focus on top-level entities without infrastructure context
- **Primary + Core**: Show services and their dependencies
- **Primary + Foundation**: Connect applications directly to infrastructure

### Empty States
- **Empty Primary Layer**: Useful for loading states or "no data" scenarios
- **Skeleton Loader**: Shows loading scaffolds while data fetches
- **Minimal Visualization**: Bare minimum configuration for testing

## Core Layer Variations

- **Multiple Core Blocks**: Show several shared services
- **Small Core Block**: Minimal core presence
- **No Core Layer**: Omit when not needed for your use case

## Foundation Variations

- **Minimal Foundation**: Single rack with few slots
- **Extended Foundation**: Multiple racks showing complex infrastructure
- **Closed Racks**: Use \`slots: 0\` and \`variant: FOUNDATION_RACK_STATES.closed\` for inactive/closed racks
- **Status Indicators**: Color-code racks (green/yellow/red) to show health

## Best Practices

1. **Use all three layers** for complete system visualizations
2. **Omit layers** that don't add value to your specific use case
3. **Core layer** works best with 1-3 blocks to maintain visual balance
4. **Foundation racks** should reflect actual infrastructure organization
5. **Empty states** should use skeleton loaders or clear messaging
6. **Closed racks** must have \`slots: 0\` to render correctly

## Key Props

- \`primaryLayer\`: Array of primary blocks
- \`coreLayer\`: Array of core service blocks
- \`foundationConfig\`: Object with racks array
- \`skeletonLoader\`: Boolean to show loading state
        `,
      },
    },
  },
};

export default meta;

// Generic mock data
const genericPrimaryLayer = Array.from({ length: 18 }, (_, i) => ({
  id: `block-${i}`,
  label: 'Block',
  hoverLabel: `Block ${i + 1}`,
  columnIndex: i % 8,
  size: [BLOCK_SIZES.sm, BLOCK_SIZES.md, BLOCK_SIZES.lg][i % 3],
}));

const genericCoreLayer = [
  {
    id: 'core-1',
    label: 'Core Service',
    hoverLabel: 'Core Layer',
    size: BLOCK_SIZES.lg,
  },
];

const genericFoundationConfig = {
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
};

// Reusable story template
const Template = (args) => {
  const [focusedId, setFocusedId] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <PlaneStack3D
        primaryLayer={args.primaryLayer}
        coreLayer={args.coreLayer}
        foundationConfig={args.foundationConfig}
        textBracket={args.textBracket}
        focusedId={focusedId}
        onFocusedIdChange={setFocusedId}
        hoveredItem={hoveredItem}
        onHoveredItemChange={setHoveredItem}
        lockColumnCount={args.lockColumnCount}
        primaryColumnCount={args.primaryColumnCount}
        skeletonLoader={args.skeletonLoader}
        theme={args.theme}
        enablePrimaryLayerCarousel={args.enablePrimaryLayerCarousel}
      />
    </div>
  );
};

// ============================================================================
// Empty States
// ============================================================================

export const SkeletonLoader = Template.bind({});
SkeletonLoader.args = {
  primaryLayer: [],
  coreLayer: genericCoreLayer,
  foundationConfig: genericFoundationConfig,
  textBracket: {
    title: 'Loading State',
    sections: ['Skeleton loader active'],
  },
  skeletonLoader: true,
  theme: 'dark',
  enablePrimaryLayerCarousel: true,
};
SkeletonLoader.globals = { theme: 'g100' };

export const EmptyPrimaryLayer = Template.bind({});
EmptyPrimaryLayer.args = {
  primaryLayer: [],
  coreLayer: genericCoreLayer,
  foundationConfig: genericFoundationConfig,
  textBracket: {
    title: 'Empty Primary Layer',
    sections: ['No primary blocks'],
  },
  skeletonLoader: false,
  theme: 'dark',
  enablePrimaryLayerCarousel: true,
};
EmptyPrimaryLayer.globals = { theme: 'g100' };

export const MinimalVisualization = Template.bind({});
MinimalVisualization.args = {
  primaryLayer: [
    {
      id: 'single',
      label: 'Block',
      hoverLabel: 'Single Block',
      columnIndex: 3,
      size: BLOCK_SIZES.lg,
    },
  ],
  coreLayer: [
    {
      id: 'core-single',
      label: 'Core',
      hoverLabel: 'Single Core',
      size: BLOCK_SIZES.md,
    },
  ],
  foundationConfig: {
    id: 'foundation-single',
    label: 'Foundation',
    racks: [
      {
        id: 'rack-single',
        slots: 2,
        variant: FOUNDATION_RACK_STATES.open,
        status: 'green',
      },
    ],
  },
  textBracket: {
    title: 'Minimal',
    sections: ['One block per layer'],
  },
  skeletonLoader: false,
  theme: 'dark',
  enablePrimaryLayerCarousel: true,
};
MinimalVisualization.globals = { theme: 'g100' };

// ============================================================================
// Core Layer Variations
// ============================================================================

export const MultipleCoreBlocks = Template.bind({});
MultipleCoreBlocks.args = {
  primaryLayer: genericPrimaryLayer,
  coreLayer: [
    {
      id: 'core-1',
      label: 'Core Service 1',
      hoverLabel: 'Primary Core',
      size: BLOCK_SIZES.lg,
    },
    {
      id: 'core-2',
      label: 'Core Service 2',
      hoverLabel: 'Secondary Core',
      size: BLOCK_SIZES.md,
    },
    {
      id: 'core-3',
      label: 'Core Service 3',
      hoverLabel: 'Tertiary Core',
      size: BLOCK_SIZES.sm,
    },
  ],
  foundationConfig: genericFoundationConfig,
  textBracket: {
    title: 'Multiple Core Services',
    sections: ['3 core layer blocks', 'Different sizes'],
  },
  skeletonLoader: false,
  theme: 'dark',
  enablePrimaryLayerCarousel: true,
};
MultipleCoreBlocks.globals = { theme: 'g100' };

export const SmallCoreBlock = Template.bind({});
SmallCoreBlock.args = {
  primaryLayer: genericPrimaryLayer,
  coreLayer: [
    {
      id: 'core-small',
      label: 'Small Core',
      hoverLabel: 'Compact Core Service',
      size: BLOCK_SIZES.sm,
    },
  ],
  foundationConfig: genericFoundationConfig,
  textBracket: {
    title: 'Small Core',
    sections: ['Compact core layer'],
  },
  skeletonLoader: false,
  theme: 'dark',
  enablePrimaryLayerCarousel: true,
};
SmallCoreBlock.globals = { theme: 'g100' };

export const NoCoreLayer = Template.bind({});
NoCoreLayer.args = {
  primaryLayer: genericPrimaryLayer,
  coreLayer: [],
  foundationConfig: genericFoundationConfig,
  textBracket: {
    title: 'No Core Layer',
    sections: ['Primary and foundation only'],
  },
  skeletonLoader: false,
  theme: 'dark',
  enablePrimaryLayerCarousel: true,
};
NoCoreLayer.globals = { theme: 'g100' };

// ============================================================================
// Foundation Layer Variations
// ============================================================================

export const MinimalFoundation = Template.bind({});
MinimalFoundation.args = {
  primaryLayer: genericPrimaryLayer,
  coreLayer: genericCoreLayer,
  foundationConfig: {
    id: 'foundation-minimal',
    label: 'Foundation',
    racks: [
      {
        id: 'rack-1',
        slots: 2,
        variant: FOUNDATION_RACK_STATES.open,
        status: 'green',
      },
    ],
  },
  textBracket: {
    title: 'Minimal Foundation',
    sections: ['Single rack', '2 slots'],
  },
  skeletonLoader: false,
  theme: 'dark',
  enablePrimaryLayerCarousel: true,
};
MinimalFoundation.globals = { theme: 'g100' };

export const ExtendedFoundation = Template.bind({});
ExtendedFoundation.args = {
  primaryLayer: genericPrimaryLayer,
  coreLayer: genericCoreLayer,
  foundationConfig: {
    id: 'foundation-extended',
    label: 'Foundation',
    racks: Array.from({ length: 8 }, (_, i) => ({
      id: `rack-${i + 1}`,
      slots: 4,
      variant: FOUNDATION_RACK_STATES.open,
      status: i % 3 === 0 ? 'yellow' : i % 3 === 1 ? 'red' : 'green',
    })),
  },
  textBracket: {
    title: 'Extended Foundation',
    sections: ['8 racks', 'Mixed status indicators'],
  },
  skeletonLoader: false,
  theme: 'dark',
  enablePrimaryLayerCarousel: true,
};
ExtendedFoundation.globals = { theme: 'g100' };

export const ClosedRacks = Template.bind({});
ClosedRacks.args = {
  primaryLayer: genericPrimaryLayer,
  coreLayer: genericCoreLayer,
  foundationConfig: {
    id: 'foundation-closed',
    label: 'Foundation',
    racks: [
      {
        id: 'rack-1',
        slots: 0,
        variant: FOUNDATION_RACK_STATES.closed,
        status: 'green',
      },
      {
        id: 'rack-2',
        slots: 0,
        variant: FOUNDATION_RACK_STATES.closed,
        status: 'green',
      },
      {
        id: 'rack-3',
        slots: 4,
        variant: FOUNDATION_RACK_STATES.open,
        status: 'yellow',
      },
      {
        id: 'rack-4',
        slots: 4,
        variant: FOUNDATION_RACK_STATES.open,
        status: 'red',
      },
    ],
  },
  textBracket: {
    title: 'Mixed Rack States',
    sections: ['Closed and open racks', 'Various statuses'],
  },
  skeletonLoader: false,
  theme: 'dark',
  enablePrimaryLayerCarousel: true,
};
ClosedRacks.globals = { theme: 'g100' };
